import httpx
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

import ota_demo_api.consts as consts
from ota_demo_api.persistence.database import database
from ota_demo_api.routers import search, city_search

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/health-check")
async def health_check():
    return {
        consts.WEB_SERVER: consts.UP
    }


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


app.include_router(
    search.router,
    prefix="/api/v1",
)


app.include_router(
    city_search.router,
    prefix="/api/v1",
)


@app.get("/hotels/categories")
async def categories():
    async with httpx.AsyncClient() as client:
        response = await client.get('https://api.trustyou.com/hotels/categories')
        return response.json()
