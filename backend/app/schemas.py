from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email:    EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type:   str

class DataPayload(BaseModel):
    payload: str  # JSON строка