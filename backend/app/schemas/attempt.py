from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.schemas.test import AnswerZoneSchema


class AttemptStartSchema(BaseModel):
    student_name: str


class AnswerSubmitSchema(BaseModel):
    question_id: str
    click_x: float
    click_y: float


class AnswerResultResponse(BaseModel):
    is_correct: bool
    tries_count: int


class RevealResponse(BaseModel):
    correct_zones: List[AnswerZoneSchema]


class StudentAnswerDetail(BaseModel):
    question_id: str
    question_text: str
    is_correct: bool
    tries_count: int


class AttemptResultsResponse(BaseModel):
    test_title: str
    student_name: str
    total_questions: int
    correct_count: int
    started_at: datetime
    finished_at: Optional[datetime]
    answers: List[StudentAnswerDetail]


class AttemptSummary(BaseModel):
    id: str
    student_name: str
    started_at: datetime
    finished_at: Optional[datetime]
    correct_count: int
    total_questions: int


class TestStatsResponse(BaseModel):
    test_title: str
    total_attempts: int
    attempts: List[AttemptSummary]
