from sqlalchemy import Column, Integer, String, Date, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    dob = Column(Date, nullable=True)
    risk_profile = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
