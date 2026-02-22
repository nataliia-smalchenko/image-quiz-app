from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Test, Question, AnswerZone
from app.schemas.test import TestCreateSchema, TestUpdateSchema
import uuid
import secrets

router = APIRouter(prefix="/tests", tags=["tests"])


def generate_slug() -> str:
    return secrets.token_urlsafe(8)


@router.post("/")
async def create_test(
    data: TestCreateSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    test = Test(
        id=str(uuid.uuid4()),
        title=data.title,
        description=data.description,
        slug=generate_slug(),
        owner_id=current_user.id,
    )
    db.add(test)

    for q_data in data.questions:
        question = Question(
            id=str(uuid.uuid4()),
            test_id=test.id,
            text=q_data.text,
            image_url=q_data.image_url,
            image_public_id=q_data.image_public_id,
            order=q_data.order,
        )
        db.add(question)

        for zone_data in q_data.answer_zones:
            zone = AnswerZone(
                id=str(uuid.uuid4()),
                question_id=question.id,
                x=zone_data.x,
                y=zone_data.y,
                width=zone_data.width,
                height=zone_data.height,
            )
            db.add(zone)

    await db.commit()
    return {"id": test.id, "slug": test.slug}


@router.get("/")
async def get_tests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Test)
        .where(Test.owner_id == current_user.id)
        .order_by(Test.created_at.desc())
    )
    tests = result.scalars().all()
    return tests


@router.get("/{test_id}")
async def get_test(
    test_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Test)
        .options(selectinload(Test.questions).selectinload(Question.answer_zones))
        .where(Test.id == test_id, Test.owner_id == current_user.id)
    )
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не знайдено")
    return test


@router.delete("/{test_id}")
async def delete_test(
    test_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Test).where(Test.id == test_id, Test.owner_id == current_user.id)
    )
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не знайдено")
    await db.delete(test)
    await db.commit()
    return {"message": "Тест видалено"}
