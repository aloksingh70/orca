import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Support PostgreSQL or SQLite (default fallback for zero-config run)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./orca.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy import text

Base = declarative_base()

def init_db():
    """Ensure tables exist and add new columns if upgrading existing SQLite DB."""
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        for col, col_type in [
            ("officer_type", "VARCHAR(100)"),
            ("govt_id_number", "VARCHAR(100)"),
            ("department", "VARCHAR(200)"),
            ("is_verified", "BOOLEAN DEFAULT 1"),
            ("auth_provider", "VARCHAR(50) DEFAULT 'credentials'")
        ]:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                conn.commit()
            except Exception:
                pass

def get_db():
    """Dependency providing database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
