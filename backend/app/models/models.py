from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.db.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    name = Column(String)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    tests = relationship("Test", back_populates="owner")


class Test(Base):
    __tablename__ = "tests"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    owner = relationship("User", back_populates="tests")
    questions = relationship("Question", back_populates="test")


class Question(Base):
    __tablename__ = "questions"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = Column(String, ForeignKey("tests.id"))
    text = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    order = Column(Integer, default=0)
    test = relationship("Test", back_populates="questions")
    answer_zones = relationship("AnswerZone", back_populates="question")


class AnswerZone(Base):
    __tablename__ = "answer_zones"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String, ForeignKey("questions.id"))
    x = Column(Float, nullable=False)  # у відсотках (0-100)
    y = Column(Float, nullable=False)
    width = Column(Float, nullable=False)
    height = Column(Float, nullable=False)
    question = relationship("Question", back_populates="answer_zones")


class Attempt(Base):
    __tablename__ = "attempts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    test_id = Column(String, ForeignKey("tests.id"))
    student_name = Column(String, nullable=False)
    started_at = Column(DateTime, server_default=func.now())
    finished_at = Column(DateTime, nullable=True)
    answers = relationship("StudentAnswer", back_populates="attempt")


class StudentAnswer(Base):
    __tablename__ = "student_answers"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    attempt_id = Column(String, ForeignKey("attempts.id"))
    question_id = Column(String, ForeignKey("questions.id"))
    click_x = Column(Float)
    click_y = Column(Float)
    is_correct = Column(Boolean)
    tries_count = Column(Integer, default=1)
    attempt = relationship("Attempt", back_populates="answers")
