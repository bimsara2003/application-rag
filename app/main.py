# FastAPI app entry point
from fastapi import FastAPI

app = FastAPI(title="SLIIT RAG Support Assistant")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
