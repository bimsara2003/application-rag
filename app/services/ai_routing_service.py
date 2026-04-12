"""
AI-Powered Smart Ticket Routing — uses Google Gemini to classify
department, priority, and auto-assign tickets to staff members.
"""
import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from app.config import GOOGLE_API_KEY
from app.database.database import get_supabase

# ── Gemini LLM (reused singleton) ────────────────────────────────
_llm = None


def _get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.1,
            max_output_tokens=512,
        )
    return _llm


# ── Classification Prompt ────────────────────────────────────────

ROUTING_PROMPT = """\
You are an AI ticket routing system for SLIIT (Sri Lanka Institute of Information Technology) student support desk.

Analyze the support ticket below and classify it.

**Ticket Subject:** {subject}
**Ticket Message:** {message}

You MUST respond with ONLY a valid JSON object (no markdown, no explanation, no extra text):

{{
  "department": "<one of: academic, financial, technical, administrative, library, other>",
  "priority": "<one of: low, medium, high, urgent>",
  "priority_reason": "<one short sentence explaining the priority level>"
}}

**Classification Guidelines:**

DEPARTMENT:
- academic: exams, results, grades, GPA, course registration, semester, modules, lecturers, academic calendar, attendance
- financial: fees, payments, scholarships, refunds, invoices, financial aid, installments
- technical: LMS, portal login, Wi-Fi, email access, lab access, software issues, password reset, system errors
- administrative: ID cards, letters, certificates, enrollment verification, name/address changes, transfers
- library: books, borrowing, fines, digital resources, library access, research databases
- other: anything that doesn't clearly fit the above

PRIORITY:
- urgent: deadline within 24 hours, exam today/tomorrow, account locked preventing exam access, financial deadline
- high: time-sensitive within a week, affecting academic progress, repeated unresolved issue
- medium: general inquiry, standard request, no immediate deadline
- low: feedback, suggestions, general information requests
"""


def _parse_ai_response(text: str) -> dict | None:
    """Extract JSON from the AI response, handling potential markdown wrapping."""
    # Try direct JSON parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Try extracting JSON from markdown code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # Try finding any JSON object in the text
    match = re.search(r"\{[^{}]*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            pass

    return None


# ── Staff Assignment ─────────────────────────────────────────────

def _find_staff_for_department(department: str) -> dict | None:
    """Find an active staff member whose staff_profile.department matches."""
    sb = get_supabase()

    # Get staff profiles matching the department
    profiles = (
        sb.table("staff_profiles")
        .select("user_id, department, position")
        .eq("department", department)
        .execute()
    )

    if not profiles.data:
        # Fallback: try to find any staff/admin user
        profiles = (
            sb.table("staff_profiles")
            .select("user_id, department, position")
            .execute()
        )

    if not profiles.data:
        return None

    # Check which of these staff members are active
    for profile in profiles.data:
        user = (
            sb.table("users")
            .select("id, full_name, is_active, role")
            .eq("id", profile["user_id"])
            .eq("is_active", True)
            .in_("role", ["staff", "admin", "super_admin"])
            .execute()
        )
        if user.data:
            return {
                "user_id": user.data[0]["id"],
                "full_name": user.data[0]["full_name"],
                "department": profile["department"],
                "position": profile.get("position"),
            }

    return None


# ── Main Routing Function ────────────────────────────────────────

VALID_DEPARTMENTS = {"academic", "financial", "technical", "administrative", "library", "other"}
VALID_PRIORITIES = {"low", "medium", "high", "urgent"}


def classify_and_route(subject: str, message: str) -> dict:
    """
    Classify a ticket using Gemini and find the best staff member.

    Returns:
        {
            "ai_department": str,
            "ai_priority": str,
            "ai_priority_reason": str,
            "assigned_to": str | None,
            "assigned_to_name": str | None,
            "ai_routed": True
        }
    """
    llm = _get_llm()

    prompt = ChatPromptTemplate.from_messages([
        ("human", ROUTING_PROMPT),
    ])

    chain = prompt | llm

    result = chain.invoke({"subject": subject, "message": message})
    parsed = _parse_ai_response(result.content)

    if not parsed:
        raise ValueError(f"Failed to parse AI response: {result.content[:200]}")

    # Validate and sanitize
    ai_department = parsed.get("department", "other").lower()
    if ai_department not in VALID_DEPARTMENTS:
        ai_department = "other"

    ai_priority = parsed.get("priority", "medium").lower()
    if ai_priority not in VALID_PRIORITIES:
        ai_priority = "medium"

    ai_priority_reason = parsed.get("priority_reason", "AI classification applied.")

    # Find a matching staff member
    staff = _find_staff_for_department(ai_department)

    return {
        "ai_department": ai_department,
        "ai_priority": ai_priority,
        "ai_priority_reason": ai_priority_reason,
        "assigned_to": staff["user_id"] if staff else None,
        "assigned_to_name": staff["full_name"] if staff else None,
        "ai_routed": True,
    }
