from pydantic import BaseModel
from typing import List, Optional


class AnswerZoneSchema(BaseModel):
    x: float  # відсотки 0-100
    y: float
    width: float
    height: float


class QuestionCreateSchema(BaseModel):
    text: str
    image_url: str
    image_public_id: str
    order: int
    answer_zones: List[AnswerZoneSchema]


class TestCreateSchema(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionCreateSchema]


class TestUpdateSchema(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
