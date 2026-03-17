"""
Document loader – loads documents from two sources:
1. KB Articles from the database (Supabase)
2. PDF files from AWS S3 bucket
"""
from langchain_core.documents import Document
from app.database.database import get_supabase
from app.services import s3_service
import os
import tempfile
import boto3
from dotenv import load_dotenv

load_dotenv()


def load_kb_articles() -> list[Document]:
    """Load all published KB articles from the database."""
    result = (
        get_supabase().table("kb_articles")
        .select("id, title, content, tags, category_id, source_type, file_name")
        .eq("is_published", True)
        .execute()
    )

    docs = []
    for row in result.data or []:
        if not row.get("content"):
            continue
        docs.append(
            Document(
                page_content=row["content"],
                metadata={
                    "source": "kb_article",
                    "article_id": row["id"],
                    "title": row.get("title", ""),
                    "category_id": row.get("category_id", ""),
                    "tags": row.get("tags", []),
                    "source_type": row.get("source_type", "manual"),
                },
            )
        )
    return docs


def load_s3_pdfs() -> list[Document]:
    """Load PDF files from the S3 bucket and extract text."""
    bucket = os.getenv("AWS_S3_BUCKET_NAME")
    region = os.getenv("AWS_S3_REGION", "ap-south-1")

    if not bucket:
        print("[loader] No S3 bucket configured, skipping S3 documents.")
        return []

    try:
        from langchain_community.document_loaders import PyPDFLoader

        s3_client = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=region,
        )

        # List all PDF objects in the kb-articles/ prefix
        response = s3_client.list_objects_v2(Bucket=bucket, Prefix="kb-articles/")
        if "Contents" not in response:
            print("[loader] No files found in S3 bucket.")
            return []

        docs = []
        for obj in response["Contents"]:
            key = obj["Key"]
            if not key.lower().endswith(".pdf"):
                continue

            # Download to temp file, extract text with PyPDFLoader
            with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                s3_client.download_fileobj(bucket, key, tmp)
                tmp_path = tmp.name

            try:
                loader = PyPDFLoader(tmp_path)
                pages = loader.load()
                for page in pages:
                    page.metadata["source"] = "s3_pdf"
                    page.metadata["s3_key"] = key
                    page.metadata["file_name"] = key.split("/")[-1]
                docs.extend(pages)
            finally:
                os.unlink(tmp_path)

        print(f"[loader] Loaded {len(docs)} pages from {len(response['Contents'])} S3 files.")
        return docs

    except ImportError:
        print("[loader] PyPDFLoader not available. Install pypdf: pip install pypdf")
        return []
    except Exception as e:
        print(f"[loader] Error loading S3 PDFs: {e}")
        return []


def load_local_files() -> list[Document]:
    """Load text and PDF files from the local data/ directory."""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

    if not os.path.exists(data_dir):
        print(f"[loader] Data directory not found: {data_dir}")
        return []

    docs = []
    for filename in os.listdir(data_dir):
        filepath = os.path.join(data_dir, filename)
        if not os.path.isfile(filepath):
            continue

        if filename.endswith(".txt"):
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read().strip()
            if content:
                docs.append(
                    Document(
                        page_content=content,
                        metadata={
                            "source": "local_file",
                            "file_name": filename,
                            "title": filename.replace(".txt", "").replace("_", " ").title(),
                        },
                    )
                )

        elif filename.endswith(".pdf"):
            try:
                from langchain_community.document_loaders import PyPDFLoader
                loader = PyPDFLoader(filepath)
                pages = loader.load()
                for page in pages:
                    page.metadata["source"] = "local_file"
                    page.metadata["file_name"] = filename
                docs.extend(pages)
            except Exception as e:
                print(f"[loader] Error loading local PDF {filename}: {e}")

    print(f"[loader] Loaded {len(docs)} documents from local data/ folder.")
    return docs


def load_all_documents() -> list[Document]:
    """Load documents from all sources."""
    kb_docs = load_kb_articles()
    s3_docs = load_s3_pdfs()
    local_docs = load_local_files()

    all_docs = kb_docs + s3_docs + local_docs
    print(f"[loader] Total documents loaded: {len(all_docs)} (KB: {len(kb_docs)}, S3: {len(s3_docs)}, Local: {len(local_docs)})")
    return all_docs

