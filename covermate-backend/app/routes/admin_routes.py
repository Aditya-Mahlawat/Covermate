"""
Admin Routes — Claim status management and admin operations.

Endpoints:
    GET  /admin/claims                    → List all claims (admin only)
    PUT  /admin/claims/{claim_id}/status  → Update claim status + send email
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user

# Resilient email dispatch: uses Celery .delay() if Redis is up, sync fallback otherwise
from app.email_service import dispatch_email

router = APIRouter(prefix="/admin", tags=["Admin"])


# ─── Helper: check admin role ───
def require_admin(current_user: models.User = Depends(get_current_user)):
    """Dependency that ensures the current user has admin role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


# ─────────────────── LIST ALL CLAIMS (admin) ───────────────────
@router.get("/claims", response_model=List[schemas.ClaimResponse])
def list_all_claims(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin: list every claim in the system with documents."""
    return (
        db.query(models.Claim)
        .options(
            joinedload(models.Claim.documents),
            joinedload(models.Claim.user_policy)
                .joinedload(models.UserPolicy.policy)
                .joinedload(models.Policy.provider),
            joinedload(models.Claim.user_policy)
                .joinedload(models.UserPolicy.user),
        )
        .order_by(models.Claim.created_at.desc())
        .all()
    )


# ─────────────────── UPDATE CLAIM STATUS ───────────────────
@router.put("/claims/{claim_id}/status")
def update_claim_status(
    claim_id: int,
    body: schemas.ClaimStatusUpdate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Admin updates claim status (under_review, approved, rejected, paid).

    Flow per mentor guidance:
      Step 1: Admin updates claim status  (this endpoint)
      Step 2: FastAPI saves status to DB
      Step 3: FastAPI sends task to Celery  (.delay())
      Step 4: Redis stores task
      Step 5: Celery worker executes task
      Step 6: Email is sent to user
    """
    # 1. Find the claim
    claim = (
        db.query(models.Claim)
        .options(
            joinedload(models.Claim.user_policy)
                .joinedload(models.UserPolicy.user),
            joinedload(models.Claim.user_policy)
                .joinedload(models.UserPolicy.policy),
        )
        .filter(models.Claim.id == claim_id)
        .first()
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    old_status = claim.status

    # Validate status transition
    valid_transitions = {
        "draft": ["submitted"],
        "submitted": ["under_review"],
        "under_review": ["approved", "rejected"],
        "approved": ["paid"],
        "rejected": [],
        "paid": [],
    }

    if body.status not in valid_transitions.get(old_status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{old_status}' to '{body.status}'"
        )

    # 2. Save status
    claim.status = body.status
    db.commit()
    db.refresh(claim)

    # 3. Log admin action
    log = models.AdminLog(
        admin_id=admin.id,
        action=f"Changed claim {claim.claim_number} status from {old_status} to {body.status}",
        target_type="claim",
        target_id=claim.id,
    )
    db.add(log)
    db.commit()

    # 4. Send email notification via Celery (.delay() pushes to Redis)
    user = claim.user_policy.user
    policy_title = claim.user_policy.policy.title if claim.user_policy.policy else "your policy"

    email_body = f"""Hello {user.name},

Your claim {claim.claim_number} status has been updated.

Current Status: {body.status.upper()}

Claim Details:
- Claim Number: {claim.claim_number}
- Policy: {policy_title}
- Amount: ₹{claim.amount_claimed}

Thank you for using CoverMate.
"""

    # ✅ Dispatch via Celery (.delay()) → Redis → Worker → Email
    dispatch_email(
        user.email,
        f"Claim Status Update — {claim.claim_number}",
        email_body,
    )

    return {
        "message": f"Status updated to '{body.status}'",
        "claim_id": claim.id,
        "claim_number": claim.claim_number,
        "old_status": old_status,
        "new_status": body.status,
    }
