from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.models import User
from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.auth import RegisterSchema, LoginSchema, GoogleAuthSchema
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
async def register(data: RegisterSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email вже використовується")

    user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        name=data.name,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.commit()
    return {"message": "Реєстрація успішна"}


@router.post("/login")
async def login(data: LoginSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Невірний email або пароль")

    token = create_access_token({"sub": user.id, "email": user.email})
    return {"id": user.id, "email": user.email, "name": user.name, "token": token}


@router.post("/google")
async def google_auth(data: GoogleAuthSchema, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            id=str(uuid.uuid4()),
            email=data.email,
            name=data.name,
            google_id=data.google_id,
        )
        db.add(user)
        await db.commit()
    return {"id": user.id, "email": user.email, "name": user.name}
