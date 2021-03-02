from typing import Optional, List

from fastapi import APIRouter, Query

from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.search_response import SearchResponse
from ota_demo_api.service.search_service import SearchService

router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.get("/", response_model=SearchResponse)
async def search_api(
    categories: Optional[List[str]] = Query(None),
    trip_type: Optional[str] = None,
    hotel_types: Optional[List[str]] = Query(None),
    min_rating: Optional[int] = None,
    city: Optional[str] = None,
    lat: Optional[float] = None,
    long: Optional[float] = None,
    language: Optional[str] = None,
    page: Optional[int] = 0,
    page_size: Optional[int] = 50
) -> SearchResponse:
    search_data = SearchRequest(
        categories=categories,
        trip_type=trip_type,
        hotel_types=hotel_types,
        min_rating=min_rating,
        city=city,
        lat=lat,
        long=long,
        language=language,
        page=page,
        page_size=page_size
    )
    search_service = SearchService()

    return await search_service.search(search_data)
