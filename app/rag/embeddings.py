"""
Embedding model setup.
Uses HuggingFace sentence-transformers (runs locally, no API key needed).
"""
import os
os.environ["USE_TF"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from langchain_huggingface import HuggingFaceEmbeddings
from app.config import EMBEDDING_MODEL

_embeddings = None


def get_embeddings() -> HuggingFaceEmbeddings:
    """Get or create the embedding model (singleton)."""
    global _embeddings
    if _embeddings is None:
        print(f"[embeddings] Loading model: {EMBEDDING_MODEL}")
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )
        print(f"[embeddings] Model loaded successfully.")
    return _embeddings
