from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class NoteBase(SQLModel):
    title: str = Field(default="Untitled")
    content: str = Field(default="")


class Note(NoteBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
