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
    categories: Optional[List[str]] = Query(
        None, description="List of MR category ids.", example=["111", "11"]
    ),
    trip_type: Optional[str] = Query(None, description="Type of the trip.", example="business"),
    hotel_types: Optional[List[str]] = Query(None, description="List of MR hotel type ids.", example=["16b", "16t"]),
    min_score: Optional[float] = Query(
        None, description="Filter out results with review score lower than this value.",
        example=80
    ),
    sort_column: Optional[str] = Query(
        "match_score", description="The sort column. Possible options: match_score and score", example="match_score"
    ),
    city: Optional[str] = Query(
        None,
        description="Filter properties located in this city. Specify also the country. "
                    "If using city and country the coordinate fields are not needed.",
        example="Paris"),
    country: Optional[str] = Query(
        None,
        description="Filter properties located in this country. Specify also the city. "
                    "If using city and country the coordinate fields are not needed.",
        example="France"
    ),
    lat: Optional[float] = Query(
        None,
        description="Latitude filter. If specified please also specify long and radius fields. "
                    "If using coordinates the city and country fields are not needed.",
        example=48.864716
    ),
    long: Optional[float] = Query(
        None,
        description="Longitude filter. If specified please also specify lat and radius fields. "
                    "If using coordinates the city and country fields are not needed.",
        example=2.349014
    ),
    radius: Optional[float] = Query(
        None,
        description="Search radius in meters. Calculated from the point specified by lat and long. "
                    "If specified please also specify lat and long fields. "
                    "If using coordinates the city and country fields are not needed.",
        example=1000
    ),
    language: Optional[str] = Query(
        None,
        description="Language filter. If specified the results will get higher match score "
                    "if based on reviews written in the specified language.",
        example="fr"
    ),
    page: Optional[int] = Query(0, description="The current page index.", example=0),
    scale: Optional[int] = Query(100, description="The scale. Supported values are 5 and 100.", example=100),
    page_size: Optional[int] = Query(
        10, description="The number max number of results in any given results page", example=10
    )
) -> SearchResponse:
    """
    The API searches hotels based on various filters from the request.

    Location filters:
    - city and country
    OR
    - lat, long and radius

    Please specify either city and country or lat, long, radius, specifying both triggers a validation error.

    Optional filters: categories, trip_type, hotel_types, language.

    The optional filters work by instructing the API to fit as best as possible the results to the supplied filters.
    However since data might not be available for all combinations, the response can contain also unfiltered results.

    Entries not matching the supplied optional filters suffer a penalty in their match_score depending on how many
    optional filters were missed and how many of such filters are there in total.
    """
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
