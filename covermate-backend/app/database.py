from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import DATABASE_URL

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing!")

# create database engine
engine = create_engine(DATABASE_URL)

# create session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# base class for models
Base = declarative_base()

# database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
