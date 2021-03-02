from ota_demo_api.view_model.city_search_request import CitySearchRequest
from ota_demo_api.view_model.city_search_response import CitySearchResponse

from ota_demo_api.repository.city_search_repository import CitySearchRepository


class CitySearchService(object):
    def __init__(self, repository: CitySearchRepository) -> None:
        super().__init__()
        self.repository = repository

    async def search(self, search_data: CitySearchRequest) -> CitySearchResponse:
        """
        Performs the expected search on the DB, returns it in the proper format.

        :param search_data: CitySearchRequest object
        :return: Search Response Data
        """
        db_response = await self.repository.fetch(search_data)
        return CitySearchResponse(cities=db_response)
