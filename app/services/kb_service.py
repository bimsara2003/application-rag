"""
Knowledge Base CRUD operations against Supabase.
"""
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException, status

from app.database.database import get_supabase


# ═══════════════════════════════════════════════════════════════════
# Categories
# ═══════════════════════════════════════════════════════════════════

def list_categories() -> list[dict]:
    sb = get_supabase()
    result = sb.table("kb_categories").select("*").order("sort_order").execute()
    return result.data


def get_category_by_id(category_id: str) -> dict | None:
    sb = get_supabase()
    result = sb.table("kb_categories").select("*").eq("id", category_id).execute()
    return result.data[0] if result.data else None


def create_category(name: str, description: str | None, icon: str | None, sort_order: int) -> dict:
    sb = get_supabase()

    existing = sb.table("kb_categories").select("id").eq("name", name).execute()
    if existing.data:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category name already exists")

    row = {
        "id": str(uuid4()),
        "name": name,
        "description": description,
        "icon": icon,
        "sort_order": sort_order,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    sb.table("kb_categories").insert(row).execute()
    return row


def update_category(category_id: str, updates: dict) -> dict:
    sb = get_supabase()
    updates = {k: v for k, v in updates.items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    sb.table("kb_categories").update(updates).eq("id", category_id).execute()
    return get_category_by_id(category_id)


def delete_category(category_id: str) -> bool:
    sb = get_supabase()
    cat = get_category_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    # Check for articles in this category
    articles = sb.table("kb_articles").select("id").eq("category_id", category_id).execute()
    if articles.data:
        raise HTTPException(status_code=400, detail=f"Cannot delete category with {len(articles.data)} articles. Move or delete them first.")

    sb.table("kb_categories").delete().eq("id", category_id).execute()
    return True


# ═══════════════════════════════════════════════════════════════════
# Articles
# ═══════════════════════════════════════════════════════════════════

def _enrich_article(article: dict) -> dict:
    """Add category_name and author_name to an article dict."""
    sb = get_supabase()
    if article.get("category_id"):
        cat = sb.table("kb_categories").select("name").eq("id", article["category_id"]).execute()
        if cat.data:
            article["category_name"] = cat.data[0]["name"]
    if article.get("author_id"):
        user = sb.table("users").select("full_name").eq("id", article["author_id"]).execute()
        if user.data:
            article["author_name"] = user.data[0]["full_name"]
    return article


def list_articles(category_id: str | None = None, published_only: bool = False) -> list[dict]:
    sb = get_supabase()
    query = sb.table("kb_articles").select("*").order("created_at", desc=True)

    if category_id:
        query = query.eq("category_id", category_id)
    if published_only:
        query = query.eq("is_published", True)

    result = query.execute()
    return [_enrich_article(a) for a in result.data]


def get_article_by_id(article_id: str) -> dict | None:
    sb = get_supabase()
    result = sb.table("kb_articles").select("*").eq("id", article_id).execute()
    if not result.data:
        return None
    return _enrich_article(result.data[0])


def create_article(
    category_id: str, title: str, content: str, author_id: str,
    tags: list[str] | None = None, is_published: bool = False,
    file_url: str | None = None, file_name: str | None = None,
    source_type: str = "manual",
) -> dict:
    sb = get_supabase()

    # Verify category exists
    cat = get_category_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    now = datetime.now(timezone.utc).isoformat()
    row = {
        "id": str(uuid4()),
        "category_id": category_id,
        "title": title,
        "content": content,
        "author_id": author_id,
        "tags": tags or [],
        "is_published": is_published,
        "view_count": 0,
        "helpful_count": 0,
        "file_url": file_url,
        "file_name": file_name,
        "source_type": source_type,
        "created_at": now,
        "updated_at": now,
    }
    sb.table("kb_articles").insert(row).execute()
    return _enrich_article(row)


def update_article(article_id: str, updates: dict) -> dict:
    sb = get_supabase()

    existing = get_article_by_id(article_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")

    updates = {k: v for k, v in updates.items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    sb.table("kb_articles").update(updates).eq("id", article_id).execute()
    return get_article_by_id(article_id)


def delete_article(article_id: str) -> bool:
    sb = get_supabase()
    existing = get_article_by_id(article_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Article not found")

    sb.table("kb_articles").delete().eq("id", article_id).execute()
    return True


def increment_view_count(article_id: str) -> None:
    sb = get_supabase()
    article = sb.table("kb_articles").select("view_count").eq("id", article_id).execute()
    if article.data:
        new_count = article.data[0]["view_count"] + 1
        sb.table("kb_articles").update({"view_count": new_count}).eq("id", article_id).execute()


def increment_helpful_count(article_id: str) -> None:
    sb = get_supabase()
    article = sb.table("kb_articles").select("helpful_count").eq("id", article_id).execute()
    if article.data:
        new_count = article.data[0]["helpful_count"] + 1
        sb.table("kb_articles").update({"helpful_count": new_count}).eq("id", article_id).execute()
