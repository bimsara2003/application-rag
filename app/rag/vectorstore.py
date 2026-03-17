"""
Vector store – ChromaDB for storing and querying document embeddings.
"""
from langchain_chroma import Chroma
from langchain_core.documents import Document
from app.config import VECTOR_DB_PATH
from app.rag.embeddings import get_embeddings
from app.rag.chunker import chunk_documents

COLLECTION_NAME = "sliit_kb"

_vectorstore = None


def get_vectorstore() -> Chroma:
    """Get or create the ChromaDB vector store (singleton)."""
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = Chroma(
            collection_name=COLLECTION_NAME,
            embedding_function=get_embeddings(),
            persist_directory=VECTOR_DB_PATH,
        )
        print(f"[vectorstore] ChromaDB initialized at {VECTOR_DB_PATH}")
    return _vectorstore


def ingest_documents(documents: list[Document]) -> int:
    """Chunk and add documents to the vector store. Returns chunk count."""
    if not documents:
        print("[vectorstore] No documents to ingest.")
        return 0

    chunks = chunk_documents(documents)

    vs = get_vectorstore()

    # Clear existing data and re-ingest for a clean state
    try:
        existing = vs._collection.count()
        if existing > 0:
            print(f"[vectorstore] Clearing {existing} existing entries.")
            vs._collection.delete(where={})
    except Exception:
        pass

    vs.add_documents(chunks)
    final_count = vs._collection.count()
    print(f"[vectorstore] Ingested {len(chunks)} chunks. Total in store: {final_count}")
    return len(chunks)


def similarity_search(query: str, k: int = 4) -> list[Document]:
    """Search the vector store for the most relevant chunks."""
    vs = get_vectorstore()
    results = vs.similarity_search(query, k=k)
    return results


def get_retriever(k: int = 4):
    """Get a LangChain retriever from the vector store."""
    vs = get_vectorstore()
    return vs.as_retriever(search_kwargs={"k": k})
