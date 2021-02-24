from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from ota_demo_api.persistence.database import get_db

import ota_demo_api.consts as consts

app = FastAPI()


@app.get("/health-check")
async def health_check(db: Session = Depends(get_db)):
    return {consts.WEB_SERVER: consts.UP}
