from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    create_engine,
    select,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "canon.db"
DB_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    book: Mapped[str] = mapped_column(String)
    chapter: Mapped[int] = mapped_column(Integer)
    verse_start: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    verse_end: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    testament: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, index=True)
    last_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    notes: Mapped[List["Note"]] = relationship(back_populates="study_session", cascade="all, delete-orphan")
    highlights: Mapped[List["Highlight"]] = relationship(back_populates="study_session", cascade="all, delete-orphan")
    sermons: Mapped[List["Sermon"]] = relationship(back_populates="study_session", cascade="all, delete-orphan")


class Note(Base):
    __tablename__ = "notes"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    study_session_id: Mapped[str] = mapped_column(ForeignKey("study_sessions.id"), index=True)
    source: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text)
    context: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pinned: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    study_session: Mapped[StudySession] = relationship(back_populates="notes")


class Highlight(Base):
    __tablename__ = "highlights"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    study_session_id: Mapped[str] = mapped_column(ForeignKey("study_sessions.id"), index=True)
    book: Mapped[str] = mapped_column(String)
    chapter: Mapped[int] = mapped_column(Integer)
    verse: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    start_index: Mapped[int] = mapped_column(Integer)
    end_index: Mapped[int] = mapped_column(Integer)
    color: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    study_session: Mapped[StudySession] = relationship(back_populates="highlights")


class Lexicon(Base):
    __tablename__ = "lexicons"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str] = mapped_column(String)
    language: Mapped[str] = mapped_column(String, index=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    entries: Mapped[List["LexiconEntry"]] = relationship(back_populates="lexicon", cascade="all, delete-orphan")


class LexiconEntry(Base):
    __tablename__ = "lexicon_entries"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    lexicon_id: Mapped[str] = mapped_column(ForeignKey("lexicons.id"), index=True)
    word: Mapped[str] = mapped_column(String, index=True)
    transliteration: Mapped[str] = mapped_column(String)
    meaning: Mapped[str] = mapped_column(Text)
    semantic_field: Mapped[str] = mapped_column(String)
    morphology: Mapped[str] = mapped_column(String)
    etymology: Mapped[str] = mapped_column(Text)
    occurrences: Mapped[List[str]] = mapped_column(JSON)

    lexicon: Mapped[Lexicon] = relationship(back_populates="entries")


class Manuscript(Base):
    __tablename__ = "manuscripts"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    siglum: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    testament: Mapped[str] = mapped_column(String, index=True)
    language: Mapped[str] = mapped_column(String)

    verses: Mapped[List["ManuscriptVerse"]] = relationship(back_populates="manuscript", cascade="all, delete-orphan")


class ManuscriptVerse(Base):
    __tablename__ = "manuscript_verses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    manuscript_id: Mapped[str] = mapped_column(ForeignKey("manuscripts.id"), index=True)
    book: Mapped[str] = mapped_column(String)
    chapter: Mapped[int] = mapped_column(Integer)
    verse: Mapped[int] = mapped_column(Integer)
    content: Mapped[str] = mapped_column(Text)

    manuscript: Mapped[Manuscript] = relationship(back_populates="verses")


class TextualVariant(Base):
    __tablename__ = "textual_variants"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    book: Mapped[str] = mapped_column(String, index=True)
    chapter: Mapped[int] = mapped_column(Integer)
    verse: Mapped[int] = mapped_column(Integer)
    variant_type: Mapped[str] = mapped_column(String)
    reading_a: Mapped[str] = mapped_column(Text)
    reading_b: Mapped[str] = mapped_column(Text)
    significant: Mapped[bool] = mapped_column(Boolean, default=False)
    agreement_ratio: Mapped[float] = mapped_column(Float, default=0.0)


class Sermon(Base):
    __tablename__ = "sermons"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, index=True)
    study_session_id: Mapped[str] = mapped_column(ForeignKey("study_sessions.id"), index=True)
    title: Mapped[str] = mapped_column(String)
    central_idea: Mapped[str] = mapped_column(Text)
    outline: Mapped[List[Dict[str, Any]]] = mapped_column(JSON)
    applications: Mapped[List[Dict[str, Any]]] = mapped_column(JSON)
    export_payload: Mapped[Dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    study_session: Mapped[StudySession] = relationship(back_populates="sermons")


class CuratedContent(Base):
    __tablename__ = "curated_content"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    section: Mapped[str] = mapped_column(String, index=True)
    subsection: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    author: Mapped[str] = mapped_column(String)
    abstract: Mapped[str] = mapped_column(Text)
    content: Mapped[str] = mapped_column(Text)
    tags: Mapped[List[str]] = mapped_column(JSON)
    tradition: Mapped[str] = mapped_column(String)
    published_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)


class BibleTranslation(Base):
    __tablename__ = "bible_translations"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    abbreviation: Mapped[str] = mapped_column(String, index=True)
    data_json: Mapped[Dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))


class BibleVerse(Base):
    __tablename__ = "bible_verses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    translation: Mapped[str] = mapped_column(String, index=True)
    book: Mapped[str] = mapped_column(String, index=True)
    chapter: Mapped[int] = mapped_column(Integer, index=True)
    verse: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)


# -----------------------------
# Schemas
# -----------------------------


class StudySessionCreate(BaseModel):
    user_id: str = "default-user"
    book: str
    chapter: int
    verse_start: Optional[int] = None
    verse_end: Optional[int] = None
    testament: Literal["ot", "nt"]


class StudySessionUpdate(BaseModel):
    book: Optional[str] = None
    chapter: Optional[int] = None
    verse_start: Optional[int] = None
    verse_end: Optional[int] = None
    testament: Optional[Literal["ot", "nt"]] = None
    status: Optional[Literal["active", "completed", "archived"]] = None


class StudySessionOut(BaseModel):
    id: str
    user_id: str
    book: str
    chapter: int
    verse_start: Optional[int]
    verse_end: Optional[int]
    testament: str
    status: str
    last_accessed_at: datetime
    created_at: datetime
    updated_at: datetime


class NotePayload(BaseModel):
    id: str
    user_id: str = "default-user"
    study_session_id: str
    source: str
    content: str
    context: Optional[str] = None
    pinned: bool = False
    created_at: Optional[datetime] = None


class HighlightCreate(BaseModel):
    user_id: str = "default-user"
    study_session_id: str
    book: str
    chapter: int
    verse: int
    text: str
    start_index: int
    end_index: int
    color: str


class HighlightOut(BaseModel):
    id: str
    user_id: str
    study_session_id: str
    book: str
    chapter: int
    verse: int
    text: str
    start_index: int
    end_index: int
    color: str
    created_at: datetime


class LexiconOut(BaseModel):
    id: str
    user_id: str
    name: str
    language: str
    uploaded_at: datetime


class LexiconEntryOut(BaseModel):
    id: str
    lexicon_id: str
    word: str
    transliteration: str
    meaning: str
    semantic_field: str
    morphology: str
    etymology: str
    occurrences: List[str]


class ManuscriptOut(BaseModel):
    id: str
    siglum: str
    name: str
    testament: str
    language: str


class CompareResult(BaseModel):
    reference: str
    verses: List[Dict[str, Any]]
    variants: List[Dict[str, Any]]


class TextualAnalyticsOut(BaseModel):
    total_variants: int
    significant_variants: int
    agreement_percentage: float
    variant_types_breakdown: Dict[str, int]


class SermonCreate(BaseModel):
    user_id: str = "default-user"
    study_session_id: str
    title: str
    central_idea: str
    outline: List[Dict[str, Any]]
    applications: List[Dict[str, Any]]
    export_payload: Dict[str, Any] = Field(default_factory=dict)


class SermonUpdate(BaseModel):
    title: Optional[str] = None
    central_idea: Optional[str] = None
    outline: Optional[List[Dict[str, Any]]] = None
    applications: Optional[List[Dict[str, Any]]] = None
    export_payload: Optional[Dict[str, Any]] = None


class SermonOut(BaseModel):
    id: str
    user_id: str
    study_session_id: str
    title: str
    central_idea: str
    outline: List[Dict[str, Any]]
    applications: List[Dict[str, Any]]
    export_payload: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class CuratedContentOut(BaseModel):
    id: str
    section: str
    subsection: str
    title: str
    author: str
    abstract: str
    content: str
    tags: List[str]
    tradition: str
    published_date: datetime


class DidaskalosQueryPayload(BaseModel):
    study_session_id: str
    query: str
    current_book: str
    current_chapter: int
    current_verse: Optional[int] = None
    selected_word: Optional[str] = None
    user_notes: List[str] = Field(default_factory=list)
    highlights: List[str] = Field(default_factory=list)
    lexicon_data: List[Dict[str, Any]] = Field(default_factory=list)
    commentary_excerpts: List[str] = Field(default_factory=list)


class DidaskalosResponse(BaseModel):
    answer: str
    citations: List[str]
    scripture_references: List[str]


class TranslationPayload(BaseModel):
    id: str
    name: str
    abbreviation: str
    data: Dict[str, Any]


class TranslationSummary(BaseModel):
    id: str
    name: str
    abbreviation: str
    created_at: datetime


class VerseOut(BaseModel):
    number: int
    text: str


class ChapterOut(BaseModel):
    book: str
    chapter: int
    verses: List[VerseOut]


# -----------------------------
# App
# -----------------------------

app = FastAPI(title="Canon Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_bible(db: Session) -> None:
    existing = db.scalar(select(BibleVerse).limit(1))
    if existing:
        return

    verses = [
        BibleVerse(id=str(uuid.uuid4()), translation="ACF", book="Romans", chapter=3, verse=21, text="Mas agora se manifestou, sem a lei, a justiça de Deus, tendo o testemunho da lei e dos profetas;"),
        BibleVerse(id=str(uuid.uuid4()), translation="ACF", book="Romans", chapter=3, verse=22, text="Isto é, a justiça de Deus pela fé em Jesus Cristo para todos e sobre todos os que creem; porque não há diferença."),
        BibleVerse(id=str(uuid.uuid4()), translation="ACF", book="Romans", chapter=3, verse=23, text="Porque todos pecaram e destituídos estão da glória de Deus;"),
        BibleVerse(id=str(uuid.uuid4()), translation="ACF", book="Romans", chapter=3, verse=24, text="Sendo justificados gratuitamente pela sua graça, pela redenção que há em Cristo Jesus;"),
        BibleVerse(id=str(uuid.uuid4()), translation="ACF", book="Romans", chapter=3, verse=25, text="Ao qual Deus propôs para propiciação pela fé no seu sangue, para demonstrar a sua justiça pela remissão dos pecados dantes cometidos, sob a paciência de Deus;"),
        BibleVerse(id=str(uuid.uuid4()), translation="ACF", book="Romans", chapter=3, verse=26, text="Para demonstração da sua justiça neste tempo presente, para que ele seja justo e justificador daquele que tem fé em Jesus."),
    ]
    db.add_all(verses)


def seed_manuscripts(db: Session) -> None:
    if db.scalar(select(Manuscript).limit(1)):
        return

    m1 = Manuscript(id=str(uuid.uuid4()), siglum="NA28", name="Nestle-Aland 28", testament="nt", language="gr")
    m2 = Manuscript(id=str(uuid.uuid4()), siglum="SBLGNT", name="SBL Greek New Testament", testament="nt", language="gr")
    db.add_all([m1, m2])
    db.flush()

    db.add_all(
        [
            ManuscriptVerse(id=str(uuid.uuid4()), manuscript_id=m1.id, book="Romans", chapter=3, verse=22, content="δικαιοσύνη δὲ θεοῦ διὰ πίστεως Ἰησοῦ Χριστοῦ"),
            ManuscriptVerse(id=str(uuid.uuid4()), manuscript_id=m2.id, book="Romans", chapter=3, verse=22, content="δικαιοσύνη δὲ θεοῦ διὰ πίστεως Ἰησοῦ Χριστοῦ"),
            TextualVariant(
                id=str(uuid.uuid4()),
                book="Romans",
                chapter=3,
                verse=22,
                variant_type="orthographic",
                reading_a="πίστεως",
                reading_b="πιστεως",
                significant=False,
                agreement_ratio=0.95,
            ),
        ]
    )


def seed_curation(db: Session) -> None:
    if db.scalar(select(CuratedContent).limit(1)):
        return

    db.add(
        CuratedContent(
            id=str(uuid.uuid4()),
            section="biblical-theology",
            subsection="pauline-studies",
            title="Romans 3 and the Righteousness of God",
            author="Research Faculty",
            abstract="A curated academic summary on Romans 3.",
            content="Extended scholarly content with references and notes.",
            tags=["Romans", "Paul", "Justification"],
            tradition="Reformed",
            published_date=now_utc(),
        )
    )


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_bible(db)
        seed_manuscripts(db)
        seed_curation(db)
        db.commit()


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


# Study sessions
@app.post("/api/study-sessions/start", response_model=StudySessionOut)
def start_study_session(payload: StudySessionCreate, db: Session = Depends(get_db)) -> StudySessionOut:
    session = StudySession(
        id=str(uuid.uuid4()),
        user_id=payload.user_id,
        book=payload.book,
        chapter=payload.chapter,
        verse_start=payload.verse_start,
        verse_end=payload.verse_end,
        testament=payload.testament,
        status="active",
        last_accessed_at=now_utc(),
        created_at=now_utc(),
        updated_at=now_utc(),
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return StudySessionOut.model_validate(session, from_attributes=True)


@app.get("/api/study-sessions/{session_id}", response_model=StudySessionOut)
def get_study_session(session_id: str, db: Session = Depends(get_db)) -> StudySessionOut:
    session = db.get(StudySession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")
    return StudySessionOut.model_validate(session, from_attributes=True)


@app.put("/api/study-sessions/{session_id}", response_model=StudySessionOut)
def update_study_session(session_id: str, payload: StudySessionUpdate, db: Session = Depends(get_db)) -> StudySessionOut:
    session = db.get(StudySession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(session, field, value)
    session.last_accessed_at = now_utc()
    session.updated_at = now_utc()

    db.commit()
    db.refresh(session)
    return StudySessionOut.model_validate(session, from_attributes=True)


@app.get("/api/study-sessions/last", response_model=StudySessionOut)
def last_study_session(user_id: str = Query(default="default-user"), db: Session = Depends(get_db)) -> StudySessionOut:
    session = db.scalar(
        select(StudySession)
        .where(StudySession.user_id == user_id)
        .order_by(StudySession.last_accessed_at.desc())
        .limit(1)
    )
    if not session:
        raise HTTPException(status_code=404, detail="No study session found")
    return StudySessionOut.model_validate(session, from_attributes=True)


@app.get("/api/study-sessions/in-progress", response_model=List[StudySessionOut])
def in_progress_sessions(user_id: str = Query(default="default-user"), db: Session = Depends(get_db)) -> List[StudySessionOut]:
    rows = db.scalars(
        select(StudySession)
        .where(StudySession.user_id == user_id, StudySession.status == "active")
        .order_by(StudySession.last_accessed_at.desc())
    ).all()
    return [StudySessionOut.model_validate(row, from_attributes=True) for row in rows]


# Notes (session-bound)
@app.post("/api/notes", response_model=NotePayload)
def create_note(payload: NotePayload, db: Session = Depends(get_db)) -> NotePayload:
    if not db.get(StudySession, payload.study_session_id):
        raise HTTPException(status_code=404, detail="Study session not found")
    note = Note(
        id=payload.id,
        user_id=payload.user_id,
        study_session_id=payload.study_session_id,
        source=payload.source,
        content=payload.content,
        context=payload.context,
        pinned=payload.pinned,
        created_at=payload.created_at or now_utc(),
    )
    db.merge(note)
    db.commit()
    return payload


@app.get("/api/notes", response_model=List[NotePayload])
def list_notes(
    study_session_id: str = Query(...),
    source: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> List[NotePayload]:
    stmt = select(Note).where(Note.study_session_id == study_session_id)
    if source:
        stmt = stmt.where(Note.source == source)
    rows = db.scalars(stmt.order_by(Note.created_at.desc())).all()
    return [
        NotePayload(
            id=row.id,
            user_id=row.user_id,
            study_session_id=row.study_session_id,
            source=row.source,
            content=row.content,
            context=row.context,
            pinned=row.pinned,
            created_at=row.created_at,
        )
        for row in rows
    ]


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)) -> Dict[str, str]:
    note = db.get(Note, note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"status": "deleted"}


# Highlights
@app.post("/api/highlights", response_model=HighlightOut)
def create_highlight(payload: HighlightCreate, db: Session = Depends(get_db)) -> HighlightOut:
    if not db.get(StudySession, payload.study_session_id):
        raise HTTPException(status_code=404, detail="Study session not found")
    row = Highlight(
        id=str(uuid.uuid4()),
        user_id=payload.user_id,
        study_session_id=payload.study_session_id,
        book=payload.book,
        chapter=payload.chapter,
        verse=payload.verse,
        text=payload.text,
        start_index=payload.start_index,
        end_index=payload.end_index,
        color=payload.color,
        created_at=now_utc(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return HighlightOut.model_validate(row, from_attributes=True)


@app.get("/api/highlights", response_model=List[HighlightOut])
def list_highlights(
    user_id: str = Query(default="default-user"),
    book: Optional[str] = Query(default=None),
    chapter: Optional[int] = Query(default=None),
    study_session_id: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
) -> List[HighlightOut]:
    stmt = select(Highlight).where(Highlight.user_id == user_id)
    if book:
        stmt = stmt.where(Highlight.book == book)
    if chapter is not None:
        stmt = stmt.where(Highlight.chapter == chapter)
    if study_session_id:
        stmt = stmt.where(Highlight.study_session_id == study_session_id)
    rows = db.scalars(stmt.order_by(Highlight.created_at.desc())).all()
    return [HighlightOut.model_validate(row, from_attributes=True) for row in rows]


@app.delete("/api/highlights/{highlight_id}")
def delete_highlight(highlight_id: str, db: Session = Depends(get_db)) -> Dict[str, str]:
    row = db.get(Highlight, highlight_id)
    if not row:
        raise HTTPException(status_code=404, detail="Highlight not found")
    db.delete(row)
    db.commit()
    return {"status": "deleted"}


# Lexicons
@app.post("/api/lexicons/upload", response_model=LexiconOut)
async def upload_lexicon(
    user_id: str = Form(default="default-user"),
    name: str = Form(...),
    language: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> LexiconOut:
    raw = await file.read()
    try:
        payload = json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Lexicon file must be valid JSON") from exc

    entries = payload.get("entries", payload)
    if not isinstance(entries, list):
        raise HTTPException(status_code=400, detail="Lexicon JSON must contain a list of entries")

    lexicon = Lexicon(id=str(uuid.uuid4()), user_id=user_id, name=name, language=language, uploaded_at=now_utc())
    db.add(lexicon)
    db.flush()

    for entry in entries:
        db.add(
            LexiconEntry(
                id=str(uuid.uuid4()),
                lexicon_id=lexicon.id,
                word=str(entry.get("word", "")).strip(),
                transliteration=str(entry.get("transliteration", "")).strip(),
                meaning=str(entry.get("meaning", "")).strip(),
                semantic_field=str(entry.get("semantic_field", "")).strip(),
                morphology=str(entry.get("morphology", "")).strip(),
                etymology=str(entry.get("etymology", "")).strip(),
                occurrences=entry.get("occurrences", []),
            )
        )

    db.commit()
    db.refresh(lexicon)
    return LexiconOut.model_validate(lexicon, from_attributes=True)


@app.get("/api/lexicons", response_model=List[LexiconOut])
def list_lexicons(user_id: str = Query(default="default-user"), db: Session = Depends(get_db)) -> List[LexiconOut]:
    rows = db.scalars(select(Lexicon).where(Lexicon.user_id == user_id).order_by(Lexicon.uploaded_at.desc())).all()
    return [LexiconOut.model_validate(row, from_attributes=True) for row in rows]


@app.get("/api/lexicon/lookup", response_model=List[LexiconEntryOut])
def lookup_lexicon(word: str = Query(...), language: str = Query(...), db: Session = Depends(get_db)) -> List[LexiconEntryOut]:
    rows = db.scalars(
        select(LexiconEntry)
        .join(Lexicon, LexiconEntry.lexicon_id == Lexicon.id)
        .where(Lexicon.language == language, LexiconEntry.word == word)
    ).all()
    return [LexiconEntryOut.model_validate(row, from_attributes=True) for row in rows]


# Textual criticism
@app.get("/api/manuscripts", response_model=List[ManuscriptOut])
def list_manuscripts(testament: Optional[str] = Query(default=None), db: Session = Depends(get_db)) -> List[ManuscriptOut]:
    stmt = select(Manuscript)
    if testament:
        stmt = stmt.where(Manuscript.testament == testament)
    rows = db.scalars(stmt.order_by(Manuscript.siglum.asc())).all()
    return [ManuscriptOut.model_validate(row, from_attributes=True) for row in rows]


@app.get("/api/textual-criticism/compare", response_model=CompareResult)
def compare_textual(
    book: str = Query(...),
    chapter: int = Query(...),
    verse: int = Query(...),
    db: Session = Depends(get_db),
) -> CompareResult:
    verses = db.scalars(
        select(ManuscriptVerse)
        .where(ManuscriptVerse.book == book, ManuscriptVerse.chapter == chapter, ManuscriptVerse.verse == verse)
    ).all()

    comparison_rows: List[Dict[str, Any]] = []
    for row in verses:
        manuscript = db.get(Manuscript, row.manuscript_id)
        comparison_rows.append(
            {
                "manuscript": manuscript.siglum if manuscript else row.manuscript_id,
                "content": row.content,
            }
        )

    variants = db.scalars(
        select(TextualVariant).where(TextualVariant.book == book, TextualVariant.chapter == chapter, TextualVariant.verse == verse)
    ).all()

    variant_rows = [
        {
            "id": var.id,
            "type": var.variant_type,
            "reading_a": var.reading_a,
            "reading_b": var.reading_b,
            "significant": var.significant,
            "agreement_ratio": var.agreement_ratio,
        }
        for var in variants
    ]

    return CompareResult(reference=f"{book} {chapter}:{verse}", verses=comparison_rows, variants=variant_rows)


@app.get("/api/textual-criticism/analytics", response_model=TextualAnalyticsOut)
def textual_analytics(testament: Optional[str] = Query(default=None), db: Session = Depends(get_db)) -> TextualAnalyticsOut:
    stmt = select(TextualVariant)
    if testament:
        book_filter = ["Matthew", "Mark", "Luke", "John", "Acts", "Romans"] if testament == "nt" else ["Genesis", "Exodus", "Psalms"]
        stmt = stmt.where(TextualVariant.book.in_(book_filter))

    rows = db.scalars(stmt).all()
    total = len(rows)
    significant = len([r for r in rows if r.significant])
    avg_agreement = round((sum(r.agreement_ratio for r in rows) / total) * 100, 2) if total else 0.0

    breakdown: Dict[str, int] = {}
    for row in rows:
        breakdown[row.variant_type] = breakdown.get(row.variant_type, 0) + 1

    return TextualAnalyticsOut(
        total_variants=total,
        significant_variants=significant,
        agreement_percentage=avg_agreement,
        variant_types_breakdown=breakdown,
    )


# Sermons
@app.post("/api/sermons", response_model=SermonOut)
def create_sermon(payload: SermonCreate, db: Session = Depends(get_db)) -> SermonOut:
    if not db.get(StudySession, payload.study_session_id):
        raise HTTPException(status_code=404, detail="Study session not found")

    sermon = Sermon(
        id=str(uuid.uuid4()),
        user_id=payload.user_id,
        study_session_id=payload.study_session_id,
        title=payload.title,
        central_idea=payload.central_idea,
        outline=payload.outline,
        applications=payload.applications,
        export_payload=payload.export_payload,
        created_at=now_utc(),
        updated_at=now_utc(),
    )
    db.add(sermon)
    db.commit()
    db.refresh(sermon)
    return SermonOut.model_validate(sermon, from_attributes=True)


@app.put("/api/sermons/{sermon_id}", response_model=SermonOut)
def update_sermon(sermon_id: str, payload: SermonUpdate, db: Session = Depends(get_db)) -> SermonOut:
    sermon = db.get(Sermon, sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(sermon, field, value)
    sermon.updated_at = now_utc()

    db.commit()
    db.refresh(sermon)
    return SermonOut.model_validate(sermon, from_attributes=True)


@app.get("/api/sermons/{sermon_id}", response_model=SermonOut)
def get_sermon(sermon_id: str, db: Session = Depends(get_db)) -> SermonOut:
    sermon = db.get(Sermon, sermon_id)
    if not sermon:
        raise HTTPException(status_code=404, detail="Sermon not found")
    return SermonOut.model_validate(sermon, from_attributes=True)


@app.get("/api/sermons/recent", response_model=List[SermonOut])
def recent_sermons(user_id: str = Query(default="default-user"), db: Session = Depends(get_db)) -> List[SermonOut]:
    rows = db.scalars(select(Sermon).where(Sermon.user_id == user_id).order_by(Sermon.updated_at.desc()).limit(20)).all()
    return [SermonOut.model_validate(row, from_attributes=True) for row in rows]


# Curation
@app.get("/api/curation/today", response_model=List[CuratedContentOut])
def curation_today(db: Session = Depends(get_db)) -> List[CuratedContentOut]:
    rows = db.scalars(select(CuratedContent).order_by(CuratedContent.published_date.desc()).limit(20)).all()
    return [CuratedContentOut.model_validate(row, from_attributes=True) for row in rows]


@app.get("/api/curation/section/{section}", response_model=List[CuratedContentOut])
def curation_by_section(section: str, db: Session = Depends(get_db)) -> List[CuratedContentOut]:
    rows = db.scalars(
        select(CuratedContent).where(CuratedContent.section == section).order_by(CuratedContent.published_date.desc())
    ).all()
    return [CuratedContentOut.model_validate(row, from_attributes=True) for row in rows]


@app.get("/api/curation/item/{item_id}", response_model=CuratedContentOut)
def curation_item(item_id: str, db: Session = Depends(get_db)) -> CuratedContentOut:
    row = db.get(CuratedContent, item_id)
    if not row:
        raise HTTPException(status_code=404, detail="Curated item not found")
    return CuratedContentOut.model_validate(row, from_attributes=True)


# Didaskalos (RAG-ready interface)
@app.post("/api/didaskalos/query", response_model=DidaskalosResponse)
def didaskalos_query(payload: DidaskalosQueryPayload, db: Session = Depends(get_db)) -> DidaskalosResponse:
    session = db.get(StudySession, payload.study_session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")

    # pull persisted context for robust method guidance
    persisted_notes = db.scalars(select(Note).where(Note.study_session_id == payload.study_session_id)).all()
    persisted_highlights = db.scalars(select(Highlight).where(Highlight.study_session_id == payload.study_session_id)).all()

    lexicon_hits: List[LexiconEntry] = []
    if payload.selected_word:
        lexicon_hits = db.scalars(select(LexiconEntry).where(LexiconEntry.word == payload.selected_word)).all()

    references = [f"{payload.current_book} {payload.current_chapter}:{payload.current_verse}" if payload.current_verse else f"{payload.current_book} {payload.current_chapter}"]
    citations = [
        f"StudySession:{session.id}",
        f"Notes:{len(persisted_notes) + len(payload.user_notes)}",
        f"Highlights:{len(persisted_highlights) + len(payload.highlights)}",
        f"LexiconHits:{len(lexicon_hits) + len(payload.lexicon_data)}",
    ]

    answer = (
        "Didaskalos response prepared with full study context. "
        "Proceed by grounding interpretation in the biblical text before moving to theology and application. "
        f"Current focus: {payload.current_book} {payload.current_chapter}."
    )

    return DidaskalosResponse(answer=answer, citations=citations, scripture_references=references)


# Bible
@app.post("/api/translations", response_model=TranslationSummary)
def create_translation(payload: TranslationPayload, db: Session = Depends(get_db)) -> TranslationSummary:
    row = BibleTranslation(
        id=payload.id,
        name=payload.name,
        abbreviation=payload.abbreviation,
        data_json=payload.data,
        created_at=now_utc(),
    )
    db.merge(row)
    db.commit()
    db.refresh(row)
    return TranslationSummary.model_validate(row, from_attributes=True)


@app.get("/api/translations", response_model=List[TranslationSummary])
def list_translations(db: Session = Depends(get_db)) -> List[TranslationSummary]:
    rows = db.scalars(select(BibleTranslation).order_by(BibleTranslation.created_at.desc())).all()
    return [TranslationSummary.model_validate(row, from_attributes=True) for row in rows]


@app.get("/api/translations/{translation_id}")
def get_translation(translation_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    row = db.get(BibleTranslation, translation_id)
    if not row:
        raise HTTPException(status_code=404, detail="Translation not found")
    return row.data_json


@app.delete("/api/translations/{translation_id}")
def delete_translation(translation_id: str, db: Session = Depends(get_db)) -> Dict[str, str]:
    row = db.get(BibleTranslation, translation_id)
    if not row:
        raise HTTPException(status_code=404, detail="Translation not found")
    db.delete(row)
    db.commit()
    return {"status": "deleted"}


@app.get("/api/bible/{translation}/{book}/{chapter}", response_model=ChapterOut)
def get_chapter(translation: str, book: str, chapter: int, db: Session = Depends(get_db)) -> ChapterOut:
    verses = db.scalars(
        select(BibleVerse)
        .where(BibleVerse.translation == translation, BibleVerse.book == book, BibleVerse.chapter == chapter)
        .order_by(BibleVerse.verse.asc())
    ).all()
    if verses:
        return ChapterOut(book=book, chapter=chapter, verses=[VerseOut(number=v.verse, text=v.text) for v in verses])

    upload = db.scalar(select(BibleTranslation).where(BibleTranslation.abbreviation == translation).limit(1))
    if not upload:
        raise HTTPException(status_code=404, detail="Chapter not found")

    books = upload.data_json.get("books", {})
    if isinstance(books, list):
        candidate = next((b for b in books if isinstance(b, dict) and b.get("name") == book), None)
        chapters = candidate.get("chapters", []) if candidate else []
        chapter_item = next((c for c in chapters if isinstance(c, dict) and c.get("number") == chapter), None)
        verses_data = chapter_item.get("verses", []) if chapter_item else []
        return ChapterOut(
            book=book,
            chapter=chapter,
            verses=[VerseOut(number=v.get("number", i + 1), text=v.get("text", "")) for i, v in enumerate(verses_data)],
        )

    raise HTTPException(status_code=404, detail="Chapter not found")
