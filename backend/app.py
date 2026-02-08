from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DB_PATH = Path(__file__).resolve().parent / "canon.db"


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.executescript(
        """
        CREATE TABLE IF NOT EXISTS bible_translations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            abbreviation TEXT NOT NULL,
            data_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            source TEXT NOT NULL,
            content TEXT NOT NULL,
            context TEXT,
            pinned INTEGER NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS homiletics (
            id TEXT PRIMARY KEY,
            central_idea TEXT NOT NULL,
            divisions_json TEXT NOT NULL,
            applications_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS curadoria_sources (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            url TEXT NOT NULL,
            tradition TEXT NOT NULL,
            material_type TEXT NOT NULL,
            frequency TEXT NOT NULL,
            weight INTEGER NOT NULL,
            active INTEGER NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS curadoria_items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT,
            institution TEXT,
            tags_json TEXT NOT NULL,
            material_level TEXT NOT NULL,
            abstract TEXT,
            published_at TEXT NOT NULL,
            source_id TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(source_id) REFERENCES curadoria_sources(id)
        );

        CREATE TABLE IF NOT EXISTS bible_verses (
            translation TEXT NOT NULL,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            text TEXT NOT NULL,
            PRIMARY KEY (translation, book, chapter, verse)
        );

        CREATE TABLE IF NOT EXISTS study_sessions (
            id TEXT PRIMARY KEY,
            translation TEXT NOT NULL,
            book TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse_range TEXT,
            stage TEXT NOT NULL,
            verses_json TEXT NOT NULL,
            notes_json TEXT NOT NULL,
            highlights_json TEXT NOT NULL,
            unresolved_questions_json TEXT NOT NULL,
            last_accessed TEXT NOT NULL
        );
        """
    )
    seed_acf(cursor)
    conn.commit()
    conn.close()


def seed_acf(cursor: sqlite3.Cursor) -> None:
    cursor.execute("SELECT COUNT(*) as total FROM bible_verses WHERE translation = 'ACF'")
    row = cursor.fetchone()
    if row and row["total"]:
        return
    verses = [
        ("ACF", "Romans", 3, 21, "Mas agora se manifestou, sem a lei, a justiça de Deus, tendo o testemunho da lei e dos profetas;"),
        ("ACF", "Romans", 3, 22, "Isto é, a justiça de Deus pela fé em Jesus Cristo para todos e sobre todos os que creem; porque não há diferença."),
        ("ACF", "Romans", 3, 23, "Porque todos pecaram e destituídos estão da glória de Deus;"),
        ("ACF", "Romans", 3, 24, "Sendo justificados gratuitamente pela sua graça, pela redenção que há em Cristo Jesus;"),
        ("ACF", "Romans", 3, 25, "Ao qual Deus propôs para propiciação pela fé no seu sangue, para demonstrar a sua justiça pela remissão dos pecados dantes cometidos, sob a paciência de Deus;"),
        ("ACF", "Romans", 3, 26, "Para demonstração da sua justiça neste tempo presente, para que ele seja justo e justificador daquele que tem fé em Jesus."),
        ("ACF", "Genesis", 1, 1, "No princípio criou Deus os céus e a terra."),
        ("ACF", "Genesis", 1, 2, "E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas."),
        ("ACF", "Genesis", 1, 3, "E disse Deus: Haja luz; e houve luz."),
    ]
    cursor.executemany(
        """
        INSERT OR REPLACE INTO bible_verses (translation, book, chapter, verse, text)
        VALUES (?, ?, ?, ?, ?)
        """,
        verses,
    )


def now_iso() -> str:
    return datetime.utcnow().isoformat()


class TranslationPayload(BaseModel):
    id: str
    name: str
    abbreviation: str
    data: Dict[str, Any]


class TranslationSummary(BaseModel):
    id: str
    name: str
    abbreviation: str
    created_at: str


class NotePayload(BaseModel):
    id: str
    source: str
    content: str
    context: Optional[str] = None
    pinned: bool = False
    created_at: Optional[str] = None


class HomileticsPayload(BaseModel):
    id: str = Field(default="default")
    central_idea: str
    divisions: List[Dict[str, Any]]
    applications: List[Dict[str, Any]]


class CuradoriaSourcePayload(BaseModel):
    id: str
    name: str
    url: str
    tradition: str
    material_type: str
    frequency: str
    weight: int
    active: bool = True


class CuradoriaItemPayload(BaseModel):
    id: str
    title: str
    author: Optional[str] = None
    institution: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    material_level: str
    abstract: Optional[str] = None
    published_at: str
    source_id: Optional[str] = None


class VersePayload(BaseModel):
    number: int
    text: str


class HighlightPayload(BaseModel):
    id: str
    verse: int
    text: str
    color: str


class StudySessionPayload(BaseModel):
    id: str
    translation: Literal["ACF", "ARA"] = "ACF"
    book: str
    chapter: int
    verseRange: Optional[str] = None
    stage: Literal["observation", "grammar", "semantics", "theology", "canonical-correlation", "homiletics"]
    verses: List[VersePayload] = Field(default_factory=list)
    notes: List[NotePayload] = Field(default_factory=list)
    highlights: List[HighlightPayload] = Field(default_factory=list)
    unresolvedQuestions: List[str] = Field(default_factory=list)
    lastAccessed: str


app = FastAPI(title="Canon Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/api/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.get("/api/translations", response_model=List[TranslationSummary])
def list_translations() -> List[TranslationSummary]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, abbreviation, created_at FROM bible_translations")
    rows = cursor.fetchall()
    conn.close()
    return [TranslationSummary(**dict(row)) for row in rows]


@app.post("/api/translations", response_model=TranslationSummary)
def create_translation(payload: TranslationPayload) -> TranslationSummary:
    conn = get_connection()
    cursor = conn.cursor()
    created_at = now_iso()
    cursor.execute(
        """
        INSERT OR REPLACE INTO bible_translations (id, name, abbreviation, data_json, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (payload.id, payload.name, payload.abbreviation, json.dumps(payload.data), created_at),
    )
    conn.commit()
    conn.close()
    return TranslationSummary(id=payload.id, name=payload.name, abbreviation=payload.abbreviation, created_at=created_at)


@app.get("/api/translations/{translation_id}")
def get_translation(translation_id: str) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT data_json FROM bible_translations WHERE id = ?", (translation_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Translation not found")
    return json.loads(row["data_json"])


@app.delete("/api/translations/{translation_id}")
def delete_translation(translation_id: str) -> Dict[str, str]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM bible_translations WHERE id = ?", (translation_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}


@app.get("/api/bible/{translation_id}/{book}/{chapter}")
def get_chapter(translation_id: str, book: str, chapter: int) -> Dict[str, Any]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT verse, text FROM bible_verses
        WHERE translation = ? AND book = ? AND chapter = ?
        ORDER BY verse ASC
        """,
        (translation_id, book, chapter),
    )
    rows = cursor.fetchall()
    conn.close()
    if rows:
        return {
            "book": book,
            "chapter": chapter,
            "verses": [{"number": row["verse"], "text": row["text"]} for row in rows],
        }

    translation = get_translation(translation_id)
    books = translation.get("books", {})
    book_data = None
    if isinstance(books, dict):
        book_data = books.get(book)
    elif isinstance(books, list):
        for entry in books:
            if isinstance(entry, dict) and entry.get("name") == book:
                book_data = entry.get("chapters")
                break
    if book_data is None:
        raise HTTPException(status_code=404, detail="Book not found")
    chapter_data = None
    if isinstance(book_data, dict):
        chapter_data = book_data.get(str(chapter)) or book_data.get(chapter)
    elif isinstance(book_data, list):
        for entry in book_data:
            if isinstance(entry, dict) and entry.get("number") == chapter:
                chapter_data = entry.get("verses")
                break
        if chapter_data is None and len(book_data) >= chapter:
            entry = book_data[chapter - 1]
            if isinstance(entry, dict) and "verses" in entry:
                chapter_data = entry.get("verses")
            else:
                chapter_data = entry
    if chapter_data is None:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return {"book": book, "chapter": chapter, "verses": chapter_data}


def _session_from_row(row: sqlite3.Row) -> StudySessionPayload:
    return StudySessionPayload(
        id=row["id"],
        translation=row["translation"],
        book=row["book"],
        chapter=row["chapter"],
        verseRange=row["verse_range"],
        stage=row["stage"],
        verses=json.loads(row["verses_json"]),
        notes=json.loads(row["notes_json"]),
        highlights=json.loads(row["highlights_json"]),
        unresolvedQuestions=json.loads(row["unresolved_questions_json"]),
        lastAccessed=row["last_accessed"],
    )


@app.get("/api/study-sessions/last", response_model=StudySessionPayload)
def get_last_session() -> StudySessionPayload:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM study_sessions ORDER BY last_accessed DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="No study session found")
    return _session_from_row(row)


@app.get("/api/study-sessions/{session_id}", response_model=StudySessionPayload)
def get_session(session_id: str) -> StudySessionPayload:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM study_sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Study session not found")
    return _session_from_row(row)


@app.put("/api/study-sessions/{session_id}", response_model=StudySessionPayload)
def save_session(session_id: str, payload: StudySessionPayload) -> StudySessionPayload:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO study_sessions
        (id, translation, book, chapter, verse_range, stage, verses_json, notes_json, highlights_json, unresolved_questions_json, last_accessed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session_id,
            payload.translation,
            payload.book,
            payload.chapter,
            payload.verseRange,
            payload.stage,
            json.dumps(payload.verses),
            json.dumps(payload.notes),
            json.dumps(payload.highlights),
            json.dumps(payload.unresolvedQuestions),
            payload.lastAccessed,
        ),
    )
    conn.commit()
    conn.close()
    return payload


@app.post("/api/didaskalos/query")
def didaskalos_query(payload: Dict[str, Any]) -> Dict[str, str]:
    query = str(payload.get("query", ""))
    context = payload.get("context", {})
    stage = str(context.get("stage", "observation"))
    warning = ""
    if stage in {"observation", "grammar", "semantics"} and any(
        token in query.lower() for token in ["serm", "aplica", "prega"]
    ):
        warning = "Warning: do not advance to application or homiletics before completing interpretation stages."

    answer = (
        f"Method guidance for {context.get('book', 'text')} {context.get('chapter', '')}: "
        f"focus on {stage} and let the biblical text govern your next step."
    )
    return {"answer": answer, "warning": warning}


@app.get("/api/notes", response_model=List[NotePayload])
def list_notes(source: Optional[str] = Query(default=None)) -> List[NotePayload]:
    conn = get_connection()
    cursor = conn.cursor()
    if source:
        cursor.execute("SELECT * FROM notes WHERE source = ? ORDER BY created_at DESC", (source,))
    else:
        cursor.execute("SELECT * FROM notes ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        NotePayload(
            id=row["id"],
            source=row["source"],
            content=row["content"],
            context=row["context"],
            pinned=bool(row["pinned"]),
            created_at=row["created_at"],
        )
        for row in rows
    ]


@app.post("/api/notes", response_model=NotePayload)
def create_note(payload: NotePayload) -> NotePayload:
    conn = get_connection()
    cursor = conn.cursor()
    created_at = payload.created_at or now_iso()
    cursor.execute(
        """
        INSERT OR REPLACE INTO notes (id, source, content, context, pinned, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (payload.id, payload.source, payload.content, payload.context, int(payload.pinned), created_at),
    )
    conn.commit()
    conn.close()
    return NotePayload(**payload.dict(), created_at=created_at)


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str) -> Dict[str, str]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
    conn.commit()
    conn.close()
    return {"status": "deleted"}


@app.get("/api/homiletics", response_model=HomileticsPayload)
def get_homiletics() -> HomileticsPayload:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM homiletics WHERE id = 'default'")
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Homiletics not found")
    return HomileticsPayload(
        id=row["id"],
        central_idea=row["central_idea"],
        divisions=json.loads(row["divisions_json"]),
        applications=json.loads(row["applications_json"]),
    )


@app.put("/api/homiletics", response_model=HomileticsPayload)
def save_homiletics(payload: HomileticsPayload) -> HomileticsPayload:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO homiletics (id, central_idea, divisions_json, applications_json, updated_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            payload.id,
            payload.central_idea,
            json.dumps(payload.divisions),
            json.dumps(payload.applications),
            now_iso(),
        ),
    )
    conn.commit()
    conn.close()
    return payload


@app.get("/api/curadoria/sources", response_model=List[CuradoriaSourcePayload])
def list_sources() -> List[CuradoriaSourcePayload]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM curadoria_sources")
    rows = cursor.fetchall()
    conn.close()
    return [
        CuradoriaSourcePayload(
            id=row["id"],
            name=row["name"],
            url=row["url"],
            tradition=row["tradition"],
            material_type=row["material_type"],
            frequency=row["frequency"],
            weight=row["weight"],
            active=bool(row["active"]),
        )
        for row in rows
    ]


@app.post("/api/curadoria/sources", response_model=CuradoriaSourcePayload)
def create_source(payload: CuradoriaSourcePayload) -> CuradoriaSourcePayload:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO curadoria_sources (id, name, url, tradition, material_type, frequency, weight, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.id,
            payload.name,
            payload.url,
            payload.tradition,
            payload.material_type,
            payload.frequency,
            payload.weight,
            int(payload.active),
            now_iso(),
        ),
    )
    conn.commit()
    conn.close()
    return payload


@app.get("/api/curadoria/items", response_model=List[CuradoriaItemPayload])
def list_items(source_id: Optional[str] = Query(default=None)) -> List[CuradoriaItemPayload]:
    conn = get_connection()
    cursor = conn.cursor()
    if source_id:
        cursor.execute("SELECT * FROM curadoria_items WHERE source_id = ? ORDER BY published_at DESC", (source_id,))
    else:
        cursor.execute("SELECT * FROM curadoria_items ORDER BY published_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [
        CuradoriaItemPayload(
            id=row["id"],
            title=row["title"],
            author=row["author"],
            institution=row["institution"],
            tags=json.loads(row["tags_json"]),
            material_level=row["material_level"],
            abstract=row["abstract"],
            published_at=row["published_at"],
            source_id=row["source_id"],
        )
        for row in rows
    ]


@app.post("/api/curadoria/items", response_model=CuradoriaItemPayload)
def create_item(payload: CuradoriaItemPayload) -> CuradoriaItemPayload:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT OR REPLACE INTO curadoria_items (id, title, author, institution, tags_json, material_level, abstract, published_at, source_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            payload.id,
            payload.title,
            payload.author,
            payload.institution,
            json.dumps(payload.tags),
            payload.material_level,
            payload.abstract,
            payload.published_at,
            payload.source_id,
            now_iso(),
        ),
    )
    conn.commit()
    conn.close()
    return payload
