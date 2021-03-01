from ota_demo_api.view_model.search_response import TravelerTypesDistributionResponse
from ota_demo_api.view_model.search_response import ReviewsDistributionResponse
from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.search_response import SearchResponse, HotelResponse


class SearchService(object):
    async def search(self, search_data: SearchRequest) -> SearchResponse:
        """
        Filter result from search_data
        TODO Will read DB

        :param search_data: SearchRequest object
        :return: Filtered data
        """
        reviews_distribution = [
            ReviewsDistributionResponse(
                count=50,
                stars=5,
            ),
            ReviewsDistributionResponse(
                count=30,
                stars=3,
            ),
            ReviewsDistributionResponse(
                count=20,
                stars=2,
            ),
        ]
        traveler_types_distribution = [
            TravelerTypesDistributionResponse(
                count=50,
                trip_type="couple",
            ),
            TravelerTypesDistributionResponse(
                count=30,
                trip_type="business",
            ),
        ]

        hotels = [
            HotelResponse(
                ty_id="ae6db065-86a4-4d27-9d59-fcfe9e14c9c7",
                name="Hotel name",
                rating=None,
                reviews=None,
                relevant_now=None,
                badges=None,
                reviews_distribution=reviews_distribution,
                traveler_types_distribution=traveler_types_distribution
            )
        ]

        return SearchResponse(
            hotels=hotels
        )
