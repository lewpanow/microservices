import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))
from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import jwt
from dotenv import load_dotenv
import os
from app.database import get_db, engine  
from app.models import User
from app.routes.auth import auth_router
from app.routes.transactions import transactions_router
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from app.dependencies import get_current_user
from sqlalchemy import event
import logging  
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/register")
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/login")
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/dashboard")
async def dashboard_page(request: Request, current_user: User = Depends(get_current_user)):
    return templates.TemplateResponse("dashboard.html", {"request": request, "balance": current_user.balance})

@app.get("/protected_data")
async def protected_data(current_user: User = Depends(get_current_user)):
    return {"balance": current_user.balance}

@app.get("/transactions")
async def transactions_page(request: Request, current_user: User = Depends(get_current_user)):
    transactions = current_user.transactions_received + current_user.transactions_sent
    return templates.TemplateResponse("transactions.html", {"request": request, "transactions": transactions})

@app.get("/transactions/create_transaction")
async def create_transaction_page(request: Request, current_user: User = Depends(get_current_user)):
    return templates.TemplateResponse("create_transaction.html", {"request": request, "balance": current_user.balance})

app.include_router(auth_router, prefix="/auth")
app.include_router(transactions_router, prefix="/transactions")

@event.listens_for(engine, "before_cursor_execute")
def log_sql_calls(conn, cursor, statement, parameters, context, executemany):
    logger.debug(f"Executing query: {statement} with params: {parameters}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)