import os
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from app.config import DATABASE_URL

if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing!")

def normalize_database_url(url: str) -> tuple[str, dict]:
    engine_kwargs = {"pool_pre_ping": True}
    parsed = urlparse(url)

    # Supabase direct connections use IPv6. On Vercel/serverless environments,
    # switch to the transaction pooler port so the function can connect over IPv4.
    if os.getenv("VERCEL") and parsed.hostname and parsed.hostname.endswith(".supabase.co"):
        if parsed.port == 5432:
            netloc = parsed.netloc.rsplit(":", 1)[0] + ":6543"
            query = dict(parse_qsl(parsed.query, keep_blank_values=True))
            query.setdefault("sslmode", "require")
            url = urlunparse(parsed._replace(netloc=netloc, query=urlencode(query)))
        engine_kwargs["poolclass"] = NullPool

    return url, engine_kwargs


DATABASE_URL, engine_kwargs = normalize_database_url(DATABASE_URL)

# create database engine
engine = create_engine(DATABASE_URL, **engine_kwargs)

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
