import requests
from typing import Any, List

from ota_demo_api.view_model.search_response import (
    TravelerTypesDistributionResponse,
    BadgeDataModel,
    BadgeResponse,
    BadgeHighlightModel
)
from ota_demo_api.view_model.search_response import ReviewsDistributionResponse
from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.search_response import SearchResponse, HotelResponse


class SearchServiceDataFeed(object):
    @classmethod
    def search(cls, search_data: SearchRequest) -> SearchResponse:
        """
        Mock data for API

        :param search_data: SearchRequest object
        :return: Filtered data
        """
        ty_api = "https://api.trustyou.com/hotels/"

        ty_ids = [
            "ae6db065-86a4-4d27-9d59-fcfe9e14c9c7",
            "ca5b81c8-4cce-483b-9b98-cb0140463339",
        ]

        hotels = []
        for ty_id in ty_ids:
            meta_review = requests.get(f"{ty_api}/{ty_id}/meta_review.json").json().get("response")
            reviews = requests.get(f"{ty_api}/{ty_id}/reviews.json").json().get("response")

            badges = cls.get_badges(meta_review)

            reviews_distribution = cls.get_reviews_distribution(reviews)
            traveler_types_distribution = cls.get_traveler_types_distribution(reviews)

            hotels.append(
                HotelResponse(
                    ty_id=ty_id,
                    name="Hotel name",
                    rating=None,
                    reviews_count=reviews["reviews_count"],
                    relevant_now=None,
                    badges=badges,
                    reviews_distribution=reviews_distribution,
                    traveler_types_distribution=traveler_types_distribution
                )
            )

        return SearchResponse(
            hotels=hotels
        )

    @classmethod
    def get_badges(cls, meta_review: Any):
        badge_list = meta_review["badge_list"]
        badges = []

        for badge in badge_list:
            badge_data = BadgeDataModel(**badge["badge_data"])
            highlight_list = [BadgeHighlightModel(**highlight) for highlight in badge["highlight_list"]]

            badge_response = BadgeResponse(
                text=badge["text"],
                subtext=badge["subtext"],
                badge_type=badge["badge_type"],
                badge_data=badge_data,
                highlight_list=highlight_list
            )
            badges.append(badge_response)

        return badges

    @classmethod
    def get_reviews_distribution(cls, reviews: Any) -> List[ReviewsDistributionResponse]:
        return [ReviewsDistributionResponse(**distribution) for distribution in reviews["reviews_distribution"]]

    @classmethod
    def get_traveler_types_distribution(cls, reviews: Any) -> List[TravelerTypesDistributionResponse]:
        return [TravelerTypesDistributionResponse(**distribution) for distribution in reviews["trip_type_distribution"]]
