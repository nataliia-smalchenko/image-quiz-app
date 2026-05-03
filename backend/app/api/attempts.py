from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import (
    User,
    Test,
    Question,
    AnswerZone,
    Attempt,
    StudentAnswer,
)
from app.schemas.attempt import (
    AttemptStartSchema,
    AnswerSubmitSchema,
    AnswerResultResponse,
    RevealResponse,
    AttemptResultsResponse,
    StudentAnswerDetail,
    AttemptSummary,
    TestStatsResponse,
)
from app.schemas.test import AnswerZoneSchema
import uuid
from datetime import datetime, timezone

router = APIRouter(tags=["attempts"])


# --- Публічні ендпоінти (без авторизації) ---


@router.post("/tests/public/{slug}/start")
async def start_attempt(
    slug: str,
    data: AttemptStartSchema,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Test)
        .options(selectinload(Test.questions))
        .where(Test.slug == slug, Test.is_active)
    )
    test = result.scalar_one_or_none()
    if not test:
        raise HTTPException(status_code=404, detail="Тест не знайдено або неактивний")

    attempt = Attempt(
        id=str(uuid.uuid4()),
        test_id=test.id,
        student_name=data.student_name.strip(),
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)

    questions = sorted(test.questions, key=lambda q: q.order)

    return {
        "attempt_id": attempt.id,
        "test_title": test.title,
        "questions": [
            {
                "id": q.id,
                "text": q.text,
                "image_url": q.image_url,
                "order": q.order,
            }
            for q in questions
        ],
    }


@router.post("/attempts/{attempt_id}/answer", response_model=AnswerResultResponse)
async def submit_answer(
    attempt_id: str,
    data: AnswerSubmitSchema,
    db: AsyncSession = Depends(get_db),
):
    # Перевірити що спроба існує і не завершена
    attempt = await db.get(Attempt, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Спробу не знайдено")
    if attempt.finished_at:
        raise HTTPException(status_code=400, detail="Спроба вже завершена")

    # Перевірити що питання належить до цього тесту
    result = await db.execute(
        select(Question)
        .options(selectinload(Question.answer_zones))
        .where(Question.id == data.question_id, Question.test_id == attempt.test_id)
    )
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Питання не знайдено")

    # Перевірити чи клік потрапляє у будь-яку зону
    is_correct = any(
        zone.x <= data.click_x <= zone.x + zone.width
        and zone.y <= data.click_y <= zone.y + zone.height
        for zone in question.answer_zones
    )

    # Знайти існуючу відповідь або створити нову
    result = await db.execute(
        select(StudentAnswer).where(
            StudentAnswer.attempt_id == attempt_id,
            StudentAnswer.question_id == data.question_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.click_x = data.click_x
        existing.click_y = data.click_y
        existing.is_correct = is_correct
        existing.tries_count += 1
        tries_count = existing.tries_count
    else:
        answer = StudentAnswer(
            id=str(uuid.uuid4()),
            attempt_id=attempt_id,
            question_id=data.question_id,
            click_x=data.click_x,
            click_y=data.click_y,
            is_correct=is_correct,
            tries_count=1,
        )
        db.add(answer)
        tries_count = 1

    await db.commit()

    return AnswerResultResponse(is_correct=is_correct, tries_count=tries_count)


@router.post("/attempts/{attempt_id}/answer/{question_id}/reveal", response_model=RevealResponse)
async def reveal_answer(
    attempt_id: str,
    question_id: str,
    db: AsyncSession = Depends(get_db),
):
    attempt = await db.get(Attempt, attempt_id)
    if not attempt:
        raise HTTPException(status_code=404, detail="Спробу не знайдено")

    result = await db.execute(
        select(Question)
        .options(selectinload(Question.answer_zones))
        .where(Question.id == question_id, Question.test_id == attempt.test_id)
    )
    question = result.scalar_one_or_none()
    if not question:
        raise HTTPException(status_code=404, detail="Питання не знайдено")

    return RevealResponse(
        correct_zones=[
            AnswerZoneSchema(x=z.x, y=z.y, width=z.width, height=z.height)
            for z in question.answer_zones
        ]
    )


@router.post("/attempts/{attempt_id}/finish", response_model=AttemptResultsResponse)
async def finish_attempt(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.answers).selectinload(StudentAnswer.question))
        .where(Attempt.id == attempt_id)
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Спробу не знайдено")

    if not attempt.finished_at:
        attempt.finished_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(attempt)

    # Отримати тест для назви та кількості питань
    test = await db.get(Test, attempt.test_id)
    total_result = await db.execute(
        select(func.count(Question.id)).where(Question.test_id == attempt.test_id)
    )
    total_questions = total_result.scalar()

    correct_count = sum(1 for a in attempt.answers if a.is_correct)

    return AttemptResultsResponse(
        test_title=test.title,
        student_name=attempt.student_name,
        total_questions=total_questions,
        correct_count=correct_count,
        started_at=attempt.started_at,
        finished_at=attempt.finished_at,
        answers=[
            StudentAnswerDetail(
                question_id=a.question_id,
                question_text=a.question.text,
                is_correct=a.is_correct,
                tries_count=a.tries_count,
            )
            for a in attempt.answers
        ],
    )


@router.get("/attempts/{attempt_id}/results", response_model=AttemptResultsResponse)
async def get_attempt_results(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.answers).selectinload(StudentAnswer.question))
        .where(Attempt.id == attempt_id)
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Спробу не знайдено")

    test = await db.get(Test, attempt.test_id)
    total_result = await db.execute(
        select(func.count(Question.id)).where(Question.test_id == attempt.test_id)
    )
    total_questions = total_result.scalar()
    correct_count = sum(1 for a in attempt.answers if a.is_correct)

    return AttemptResultsResponse(
        test_title=test.title,
        student_name=attempt.student_name,
        total_questions=total_questions,
        correct_count=correct_count,
        started_at=attempt.started_at,
        finished_at=attempt.finished_at,
        answers=[
            StudentAnswerDetail(
                question_id=a.question_id,
                question_text=a.question.text,
                is_correct=a.is_correct,
                tries_count=a.tries_count,
            )
            for a in attempt.answers
        ],
    )


# --- Авторизований ендпоінт (для вчителя) ---


@router.get("/tests/{test_id}/stats", response_model=TestStatsResponse)
async def get_test_stats(
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

    total_result = await db.execute(
        select(func.count(Question.id)).where(Question.test_id == test_id)
    )
    total_questions = total_result.scalar()

    attempts_result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.answers))
        .where(Attempt.test_id == test_id)
        .order_by(Attempt.started_at.desc())
    )
    attempts = attempts_result.scalars().all()

    return TestStatsResponse(
        test_title=test.title,
        total_attempts=len(attempts),
        attempts=[
            AttemptSummary(
                id=a.id,
                student_name=a.student_name,
                started_at=a.started_at,
                finished_at=a.finished_at,
                correct_count=sum(1 for ans in a.answers if ans.is_correct),
                total_questions=total_questions,
            )
            for a in attempts
        ],
    )
