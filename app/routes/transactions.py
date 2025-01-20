from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.schemas import TransactionCreate, TransactionResponse
from app.models import User, Transaction
from app.database import get_db
from app.dependencies import get_current_user
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

transactions_router = APIRouter()

@transactions_router.get("/check_user/{user_id}")
def check_user(user_id: int, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.id == user_id).first() is not None
    logger.info(f"Проверка существования пользователя с ID {user_id}: {exists}")
    return {"exists": exists}

@transactions_router.get("/check_balance")
def check_balance(current_user: User = Depends(get_current_user)):
    logger.info(f"Проверка баланса для пользователя {current_user.id}: {current_user.balance}")
    return {"balance": current_user.balance}

@transactions_router.post("/create_transaction", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sender = current_user
    receiver = db.query(User).filter(User.id == transaction.receiver_id).first()
    
    if not receiver:
        logger.error(f"Receiver ID {transaction.receiver_id} does not exist in the database.")
        raise HTTPException(status_code=404, detail=f"Receiver ID {transaction.receiver_id} not found")
    
    if sender.balance < transaction.amount:
        logger.error(f"Insufficient balance for sender {sender.id}. Current balance: {sender.balance}, Amount: {transaction.amount}")
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    try:
        new_transaction = Transaction(
            sender_id=sender.id,
            receiver_id=receiver.id,
            amount=transaction.amount,
            status="completed"
        )
        
        sender.balance -= transaction.amount
        receiver.balance += transaction.amount
        
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        
        logger.info(f"Transaction created: {new_transaction.id}. Sender balance: {sender.balance}, Receiver balance: {receiver.balance}")
        return new_transaction
    except Exception as e:
        db.rollback()
        logger.error(f"Transaction creation failed: {e}")
        raise HTTPException(status_code=500, detail="Transaction creation failed")