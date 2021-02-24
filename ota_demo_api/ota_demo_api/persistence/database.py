import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from ota_demo_api.consts import DATABASE_URL

SQLALCHEMY_DATABASE_URL = os.environ[DATABASE_URL]

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


async def get_db():  # pragma: no cover
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()
