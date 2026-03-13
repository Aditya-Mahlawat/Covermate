"""
Claims Routes – File, view, and upload documents for insurance claims.

Endpoints:
    POST   /claims/                    → File a new claim
    GET    /claims/                    → List my claims
    GET    /claims/{id}                → Get a single claim & its documents
    POST   /claims/{id}/documents      → Upload supporting documents
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List
import uuid
import os
import shutil

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user

router = APIRouter(prefix="/claims", tags=["Claims"])


def _generate_claim_number(user_id: int, policy_id: int) -> str:
    """Generate a unique claim number like CL-3-7-A1B2."""
    suffix = uuid.uuid4().hex[:4].upper()
    return f"CL-{user_id}-{policy_id}-{suffix}"


def simulate_email_notification(email: str, subject: str, body: str):
    """
    Simulates sending an email via Celery/Background task.
    In a real app, this would use a library like aiokafka, Celery, or SendGrid.
    """
    print(f"\\n{'='*50}")
    print(f"📧 EMAIL NOTIFICATION SENT TO: {email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print(f"{'='*50}\\n")


# ─────────────────── FILE A NEW CLAIM ───────────────────
@router.post("/", response_model=schemas.ClaimResponse, status_code=201)
def file_claim(
    body: schemas.ClaimCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    File a new insurance claim.
    Must provide the ID of an active enrolled policy (user_policy_id).
    """
    # 1. Verify the UserPolicy exists and belongs to the current user
    user_policy = (
        db.query(models.UserPolicy)
        .filter(
            models.UserPolicy.id == body.user_policy_id,
            models.UserPolicy.user_id == current_user.id
        )
        .first()
    )
    if not user_policy:
        raise HTTPException(status_code=404, detail="Enrolled policy not found")

    if user_policy.status != "active":
        raise HTTPException(status_code=400, detail="Cannot file a claim on an inactive policy")

    # 2. Create the claim
    claim = models.Claim(
        user_policy_id=user_policy.id,
        claim_number=_generate_claim_number(current_user.id, user_policy.policy_id),
        claim_type=body.claim_type,
        incident_date=body.incident_date,
        amount_claimed=body.amount_claimed,
        status="submitted"
    )
    
    db.add(claim)
    db.commit()
    db.refresh(claim)

    # 3. Trigger email notification (simulated Celery)
    background_tasks.add_task(
        simulate_email_notification,
        current_user.email,
        f"Claim {claim.claim_number} Submitted",
        f"Dear {current_user.name},\\nYour claim for ₹{claim.amount_claimed} has been successfully submitted."
    )

    # Reload with relationships
    return get_claim(claim.id, current_user, db)


# ─────────────────── LIST MY CLAIMS ───────────────────
@router.get("/", response_model=List[schemas.ClaimResponse])
def list_my_claims(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all claims filed by the authenticated user."""
    return (
        db.query(models.Claim)
        .join(models.UserPolicy)
        .filter(models.UserPolicy.user_id == current_user.id)
        .options(
            joinedload(models.Claim.documents),
            joinedload(models.Claim.user_policy).joinedload(models.UserPolicy.policy).joinedload(models.Policy.provider)
        )
        .order_by(models.Claim.created_at.desc())
        .all()
    )


# ─────────────────── GET SINGLE CLAIM ───────────────────
@router.get("/{claim_id}", response_model=schemas.ClaimResponse)
def get_claim(
    claim_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get details of a specific claim (must belong to the user)."""
    claim = (
        db.query(models.Claim)
        .join(models.UserPolicy)
        .filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == current_user.id
        )
        .options(
            joinedload(models.Claim.documents),
            joinedload(models.Claim.user_policy).joinedload(models.UserPolicy.policy).joinedload(models.Policy.provider)
        )
        .first()
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim


# ─────────────────── UPLOAD CLAIM DOCUMENT ───────────────────
@router.post("/{claim_id}/documents", response_model=schemas.ClaimDocumentResponse, status_code=201)
def upload_claim_document(
    claim_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a document (image, pdf, etc.) for a specific claim.
    Simulates sending to an S3 bucket by saving to a local 'uploads' directory.
    """
    # 1. Verify claim ownership
    claim = (
        db.query(models.Claim)
        .join(models.UserPolicy)
        .filter(
            models.Claim.id == claim_id,
            models.UserPolicy.user_id == current_user.id
        )
        .first()
    )
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # 2. Local uploads directory (simulating S3)
    upload_dir = f"uploads/claims/{claim_id}"
    os.makedirs(upload_dir, exist_ok=True)

    # 3. Create unique filename to prevent overwrites
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    unique_filename = f"{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    # 4. Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        file.file.close()

    # 5. The URL path that the frontend will use to access the simulated S3 object
    file_url = f"/api/uploads/claims/{claim_id}/{unique_filename}"

    # 6. Save to DB
    doc = models.ClaimDocument(
        claim_id=claim.id,
        file_url=file_url,
        doc_type=file.content_type
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return doc
