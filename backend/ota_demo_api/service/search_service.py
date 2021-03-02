from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.search_response import SearchResponse

from ota_demo_api.service.search_service_data_feed import SearchServiceDataFeed


class SearchService(object):
    async def search(self, search_data: SearchRequest) -> SearchResponse:
        """
        Filter result from search_data
        TODO Will read DB

        :param search_data: SearchRequest object
        :return: Filtered data
        """
        hotels_response = SearchServiceDataFeed.search(search_data)

        return hotels_response
