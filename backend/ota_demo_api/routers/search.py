from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException

from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.search_response import SearchResponse
from ota_demo_api.service.search_service import SearchService
from ota_demo_api.repository.search_repository import SearchRepository
from ota_demo_api.persistence.database import database
from pydantic import ValidationError


router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.get("/", response_model=SearchResponse)
async def search_api(
    categories: Optional[List[str]] = Query(None),
    trip_type: Optional[str] = None,
    hotel_types: Optional[List[str]] = Query(None),
    min_score: Optional[float] = None,
    sort_column: Optional[str] = "match_score",
    city: Optional[str] = None,
    country: Optional[str] = None,
    lat: Optional[float] = None,
    long: Optional[float] = None,
    radius: Optional[float] = None,
    language: Optional[str] = None,
    page: Optional[int] = 0,
    scale: Optional[int] = 100,
    page_size: Optional[int] = 10,
) -> SearchResponse:
    try:
        search_data = SearchRequest(
            categories=categories,
            trip_type=trip_type,
            hotel_types=hotel_types,
            min_score=min_score,
            sort_column=sort_column,
            city=city,
            country=country,
            lat=lat,
            long=long,
            radius=radius,
            language=language,
            scale=scale,
            page=page,
            page_size=page_size
        )
    except ValidationError as ex:
        raise HTTPException(422, detail=ex.errors())

    search_service = SearchService(SearchRepository(database))

    return await search_service.search(search_data)
