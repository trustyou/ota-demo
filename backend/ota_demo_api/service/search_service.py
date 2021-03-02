from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.search_response import SearchResponse

from ota_demo_api.service.search_service_data_feed import SearchServiceDataFeed
from ota_demo_api.repository.search_repository import SearchRepository


class SearchService(object):
    def __init__(self, repository: SearchRepository) -> None:
        super().__init__()
        self.repository = repository

    async def search(self, search_data: SearchRequest) -> SearchResponse:
        """
        Filter result from search_data
        TODO Will read DB

        :param search_data: SearchRequest object
        :return: Filtered data
        """
        hotels_response = SearchServiceDataFeed.search(search_data)

        return hotels_response


class SearchServiceMock(SearchService):
    def __init__(self) -> None:
        pass

    async def search(self, search_data: SearchRequest) -> SearchResponse:
        """
        Filter result from search_data
        TODO Will read DB

        :param search_data: SearchRequest object
        :return: Filtered data
        """
        hotels_response = SearchServiceDataFeed.search(search_data)

        return hotels_response
