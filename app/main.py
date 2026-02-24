# FastAPI app entry point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth_router, user_router, ticket_router

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


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
