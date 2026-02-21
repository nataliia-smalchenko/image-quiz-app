from pydantic import BaseModel, EmailStr


class RegisterSchema(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthSchema(BaseModel):
    email: EmailStr
    name: str
    google_id: str
