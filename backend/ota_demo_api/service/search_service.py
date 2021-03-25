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
        Filter result from search_data.

        :param search_data: SearchRequest object
        :return: Filtered data
        """

        cluster_search_results = await self.repository.fetch(search_data)
        if cluster_search_results:
            results_total_count = await self.repository.count(search_data)
        else:
            results_total_count = 0

        hotels_response = await SearchServiceDataFeed.search(cluster_search_results, results_total_count)

        return hotels_response
