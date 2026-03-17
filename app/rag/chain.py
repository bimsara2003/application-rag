"""
LangChain RAG chain – retrieval QA with SLIIT-specific prompt.
Uses Google Gemini as the primary LLM.
"""
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from app.config import GOOGLE_API_KEY
from app.rag.vectorstore import get_retriever

_chain = None

SYSTEM_PROMPT = """\
You are the SLIIT Support Assistant, an AI chatbot for Sri Lanka Institute of Information Technology (SLIIT).
Your role is to help students with their questions about SLIIT by using the provided context.

Rules:
- Only answer questions related to SLIIT using the context provided.
- If the context does not contain the answer, say "I don't have specific information about that. Please contact SLIIT support at support@sliit.lk or visit the Help Desk."
- Be friendly, professional, and concise.
- When referencing information, mention the source document if available.
- Do not make up information. Only use facts from the provided context.
- Format your response in a clear, readable way.

Context:
{context}
"""


def _format_docs(docs) -> str:
    """Format retrieved documents into a single context string."""
    formatted = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("title") or doc.metadata.get("file_name") or doc.metadata.get("source", "Unknown")
        formatted.append(f"[Source {i}: {source}]\n{doc.page_content}")
    return "\n\n---\n\n".join(formatted)


def get_rag_chain():
    """Build and return the RAG chain (singleton)."""
    global _chain
    if _chain is not None:
        return _chain

    from langchain_google_genai import ChatGoogleGenerativeAI

    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.3,
        max_output_tokens=1024,
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{question}"),
    ])

    retriever = get_retriever(k=4)

    _chain = (
        {
            "context": retriever | _format_docs,
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    print("[chain] RAG chain initialized with Google Gemini.")
    return _chain


def ask(question: str) -> dict:
    """Ask a question and get an answer with source documents."""
    retriever = get_retriever(k=4)
    source_docs = retriever.invoke(question)

    chain = get_rag_chain()
    answer = chain.invoke(question)

    # Extract source info for the response
    sources = []
    for doc in source_docs:
        sources.append({
            "title": doc.metadata.get("title", ""),
            "file_name": doc.metadata.get("file_name", ""),
            "source": doc.metadata.get("source", ""),
            "content_preview": doc.page_content[:200],
        })

    return {
        "answer": answer,
        "sources": sources,
        "source_count": len(sources),
    }
