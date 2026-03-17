"""
Text splitting / chunking logic.
Uses RecursiveCharacterTextSplitter to split documents into chunks.
"""
import os
os.environ["USE_TF"] = "0"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from app.config import CHUNK_SIZE, CHUNK_OVERLAP


def get_text_splitter() -> RecursiveCharacterTextSplitter:
    """Create a configured text splitter."""
    return RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )


def chunk_documents(documents: list[Document]) -> list[Document]:
    """Split a list of documents into smaller chunks, preserving metadata."""
    splitter = get_text_splitter()
    chunks = splitter.split_documents(documents)
    print(f"[chunker] Split {len(documents)} documents into {len(chunks)} chunks (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
    return chunks

#