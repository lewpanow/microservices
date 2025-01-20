from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    confirm_password: str

    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    balance: float

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    receiver_id: int
    amount: float

class TransactionResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    amount: float
    timestamp: datetime
    status: str

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str = None