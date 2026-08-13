from typing import List, Optional
from datetime import datetime
import uuid

from pydantic import BaseModel

from models.sql.slide import SlideModel


class PresentationWithSlides(BaseModel):
    id: uuid.UUID
    content: str
    n_slides: int
    language: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tone: Optional[str] = None
    verbosity: Optional[str] = None
    theme: Optional[dict] = None
    # See models/sql/presentation.py — set only by 3labs-api at save time for
    # lesson-linked decks. Dashboard tabs key off lesson_id being non-null.
    lesson_id: Optional[str] = None
    course_id: Optional[str] = None
    lesson_title: Optional[str] = None
    course_title: Optional[str] = None
    slides: List[SlideModel]
