# FastAPI app entry point
import os
os.environ["USE_TF"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth_router, user_router, ticket_router, notification_router, kb_router, chat_router

app = FastAPI(
    title="SLIIT RAG Support Assistant",
    version="0.1.0",
    description="RAG-based support assistant with user management",
)

# CORS — allow the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(ticket_router.router)
app.include_router(notification_router.router)
app.include_router(kb_router.router)
app.include_router(chat_router.router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
