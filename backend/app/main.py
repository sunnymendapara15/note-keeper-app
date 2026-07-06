from datetime import datetime
from typing import List

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from .database import init_db, get_session
from .models import Note, NoteCreate, NoteUpdate


app = FastAPI(title="Note Keeper API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


def _get_note_or_404(note_id: int, session: Session) -> Note:
    note = session.get(Note, note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found.",
        )
    return note


@app.get("/notes", response_model=List[Note])
def read_notes(session: Session = Depends(get_session)) -> List[Note]:
    statement = select(Note).order_by(Note.updated_at.desc())
    notes = session.exec(statement).all()
    return notes


@app.post("/notes", response_model=Note, status_code=status.HTTP_201_CREATED)
def create_note(*, note: NoteCreate, session: Session = Depends(get_session)) -> Note:
    payload = Note(
        title=note.title.strip() or "Untitled",
        content=note.content.strip(),
    )
    session.add(payload)
    session.commit()
    session.refresh(payload)
    return payload


@app.put("/notes/{note_id}", response_model=Note)
def update_note(
    note_id: int,
    note_update: NoteUpdate,
    session: Session = Depends(get_session),
) -> Note:
    db_note = _get_note_or_404(note_id, session)
    if note_update.title is not None:
        db_note.title = note_update.title.strip() or "Untitled"
    if note_update.content is not None:
        db_note.content = note_update.content.strip()
    db_note.updated_at = datetime.utcnow()
    session.add(db_note)
    session.commit()
    session.refresh(db_note)
    return db_note


@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, session: Session = Depends(get_session)) -> None:
    db_note = _get_note_or_404(note_id, session)
    session.delete(db_note)
    session.commit()
