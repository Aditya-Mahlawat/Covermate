"""
Policy Routes – Browse and filter insurance policies.

Endpoints:
    GET /policies/         → List all policies (optionally filter by type)
    GET /policies/{id}     → Get a single policy by ID
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get("/", response_model=List[schemas.PolicyResponse])
def list_policies(
    policy_type: Optional[str] = Query(None, description="Filter by type: health, life, auto, home, travel"),
    db: Session = Depends(get_db),
):
    """
    Browse all available insurance policies.
    Optionally filter by policy_type (e.g. ?policy_type=health).
    """
    query = db.query(models.Policy).options(joinedload(models.Policy.provider))

    if policy_type:
        query = query.filter(models.Policy.policy_type == policy_type.lower())

    return query.order_by(models.Policy.premium.asc()).all()


@router.get("/{policy_id}", response_model=schemas.PolicyResponse)
def get_policy(
    policy_id: int,
    db: Session = Depends(get_db),
):
    """Get a single policy by its ID."""
    from fastapi import HTTPException, status

    policy = (
        db.query(models.Policy)
        .options(joinedload(models.Policy.provider))
        .filter(models.Policy.id == policy_id)
        .first()
    )

    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    return policy
