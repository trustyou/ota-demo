from typing import Optional, List

from fastapi import APIRouter, Query, HTTPException

from ota_demo_api.view_model.city_search_request import CitySearchRequest
from ota_demo_api.view_model.city_search_response import CitySearchResponse
from ota_demo_api.service.city_search_service import CitySearchService
from ota_demo_api.repository.city_search_repository import CitySearchRepository
from ota_demo_api.persistence.database import database
from pydantic import ValidationError


router = APIRouter(
    prefix="/city_search",
    tags=["city_search"],
)


@router.get("/", response_model=CitySearchResponse)
async def city_search_api(
    q: Optional[str] = None,
    limit: Optional[int] = 10,
) -> CitySearchResponse:
    try:
        search_data = CitySearchRequest(
            q=q,
            limit=limit
        )
    except ValidationError as ex:
        raise HTTPException(422, detail=ex.errors())

    search_service = CitySearchService(CitySearchRepository(database))

    return await search_service.search(search_data)
