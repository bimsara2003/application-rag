"""
Chat API endpoints – RAG chatbot for students.
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.auth_service import get_current_user
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


# ── Request / Response Models ────────────────────────────────────

class AskRequest(BaseModel):
    question: str
    session_id: Optional[str] = None


class AskResponse(BaseModel):
    answer: str
    sources: list
    source_count: int
    session_id: str
    message_id: Optional[str] = None


class CreateSessionRequest(BaseModel):
    title: Optional[str] = None


# ── Endpoints ────────────────────────────────────────────────────

@router.post("/ask", response_model=AskResponse)
async def ask_question(
    data: AskRequest,
    current_user: dict = Depends(get_current_user),
):
    """Ask a question to the RAG chatbot."""
    # Create or reuse session
    session_id = data.session_id
    if not session_id:
        session = chat_service.create_session(current_user["id"])
        if not session:
            raise HTTPException(status_code=500, detail="Failed to create chat session")
        session_id = session["id"]

    # Save user message
    chat_service.save_message(session_id, "user", data.question)

    # Auto-set session title from first question
    session = chat_service.get_session(session_id)
    if session and not session.get("title"):
        title = data.question[:80] + ("..." if len(data.question) > 80 else "")
        chat_service.update_session_title(session_id, title)

    # Run RAG chain
    try:
        from app.rag.chain import ask
        result = ask(data.question)
    except Exception as e:
        error_msg = f"Sorry, I encountered an error processing your question. Please try again. ({str(e)[:100]})"
        chat_service.save_message(session_id, "assistant", error_msg)
        return AskResponse(
            answer=error_msg,
            sources=[],
            source_count=0,
            session_id=session_id,
        )

    # Save assistant message
    msg = chat_service.save_message(
        session_id=session_id,
        role="assistant",
        content=result["answer"],
        source_documents=result["sources"],
        confidence_score=None,
    )

    return AskResponse(
        answer=result["answer"],
        sources=result["sources"],
        source_count=result["source_count"],
        session_id=session_id,
        message_id=msg["id"] if msg else None,
    )


@router.post("/sessions")
async def create_session(
    data: CreateSessionRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new chat session."""
    session = chat_service.create_session(current_user["id"], data.title)
    if not session:
        raise HTTPException(status_code=500, detail="Failed to create session")
    return session


@router.get("/sessions")
async def list_sessions(current_user: dict = Depends(get_current_user)):
    """List all chat sessions for the current user."""
    return chat_service.list_sessions(current_user["id"])


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get all messages for a chat session."""
    session = chat_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your session")
    return chat_service.get_messages(session_id)


@router.post("/ingest")
async def ingest_kb(current_user: dict = Depends(get_current_user)):
    """Re-ingest all documents into the vector store (admin/staff only)."""
    if current_user.get("role") not in ("admin", "super_admin", "staff"):
        raise HTTPException(status_code=403, detail="Staff access required")

    from app.rag.loader import load_all_documents
    from app.rag.vectorstore import ingest_documents

    docs = load_all_documents()
    count = ingest_documents(docs)
    return {"message": f"Ingested {count} chunks from {len(docs)} documents"}
