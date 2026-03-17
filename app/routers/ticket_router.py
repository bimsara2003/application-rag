"""
Support ticket endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas import (
    CreateTicketRequest,
    TicketResponse,
    UpdateTicketStatusRequest,
)
from app.schemas.ticket import CommentResponse, CreateCommentRequest
from app.services.auth_service import get_current_user
from app.services.ticket_service import (
    create_ticket,
    get_user_tickets,
    get_all_tickets,
    get_ticket_by_id,
    update_ticket_status,
    add_comment_with_notification,
)

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def submit_ticket(
    data: CreateTicketRequest,
    current_user: dict = Depends(get_current_user),
):
    """Create a new support ticket."""
    return create_ticket(current_user["id"], data)


@router.get("/", response_model=list[TicketResponse])
async def list_tickets(current_user: dict = Depends(get_current_user)):
    """List tickets — own tickets for students, all tickets for admins and staff."""
    if current_user.get("role") in ("admin", "staff", "super_admin"):
        return get_all_tickets()
    return get_user_tickets(current_user["id"])


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single ticket by ID (includes comment thread)."""
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Students can only view their own tickets
    if current_user.get("role") not in ("admin", "staff", "super_admin") and ticket["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return ticket


@router.put("/{ticket_id}/status", response_model=TicketResponse)
async def update_status(
    ticket_id: str,
    data: UpdateTicketStatusRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update a ticket's status (admin/staff only)."""
    if current_user.get("role") not in ("admin", "staff", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin or Staff access required")

    return update_ticket_status(ticket_id, data)


@router.post("/{ticket_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
async def post_comment(
    ticket_id: str,
    data: CreateCommentRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Post a comment on a ticket.
    - Students can only post on their own tickets (is_internal is forced False).
    - Staff/Admin can post public or internal notes.
    """
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    is_staff = current_user.get("role") in ("admin", "staff", "super_admin")

    # Students can only comment on their own tickets
    if not is_staff and ticket["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Students cannot create internal notes
    is_internal = data.is_internal if is_staff else False

    return add_comment_with_notification(ticket_id, current_user["id"], data.content, is_internal)
