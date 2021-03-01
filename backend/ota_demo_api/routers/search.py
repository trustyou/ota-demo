
from fastapi import APIRouter
from fastapi.encoders import jsonable_encoder
from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.search_response import SearchResponse
from ota_demo_api.service.search_service import SearchService


router = APIRouter(
    prefix="/search",
    tags=["search"],
)


@router.post("/", response_model=SearchResponse)
async def search_api(item: SearchRequest):
    search_data = jsonable_encoder(item)
    search_service = SearchService()

    return await search_service.search(search_data)
