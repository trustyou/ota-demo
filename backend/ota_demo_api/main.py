from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from ota_demo_api.persistence.database import get_db

import ota_demo_api.consts as consts
from ota_demo_api.routers import search

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health-check")
async def health_check(db: Session = Depends(get_db)):
    return {consts.WEB_SERVER: consts.UP}


app.include_router(
    search.router,
    prefix="/api/v1",
    tags=["search"],
)
