from requests_futures.sessions import FuturesSession

from typing import Any, List

from ota_demo_api.view_model.search_response import (
    TravelerTypesDistributionResponse,
    BadgeDataModel,
    BadgeResponse,
    BadgeHighlightModel,
    CategoryResponse,
    RelevantNowResponse,
    OverallSatisfaction,
    RelevantTopic
)
from ota_demo_api.view_model.search_response import ReviewsDistributionResponse
from ota_demo_api.view_model.cluster_search_result import ClusterSearchResult
from ota_demo_api.view_model.search_response import SearchResponse, HotelResponse, MatchResponse
from ota_demo_api.consts import TRUSTYOU_HOTEL_API_KEY


class SearchServiceDataFeed(object):
    @classmethod
    def search(cls, clusters: List[ClusterSearchResult], use_mock: bool = False) -> SearchResponse:
        """
        Mock data for API

        :param clusters: Results of the search
        :param use_mock: Mock data or not
        :return: Filtered data
        """
        if not clusters and not use_mock:
            hotels = []
            return SearchResponse(
                hotels=hotels
            )

        request_session = FuturesSession()

        ty_api = "https://api.trustyou.com/hotels/"

        if not use_mock:
            ty_clusters = {str(c.ty_id): c for c in clusters}
        else:
            ty_clusters = {
                "ae6db065-86a4-4d27-9d59-fcfe9e14c9c7": None,
                "ca5b81c8-4cce-483b-9b98-cb0140463339": None
            }

        hotels = []
        for ty_id in ty_clusters.keys():
            future_meta_review = request_session.get(f"{ty_api}/{ty_id}/meta_review.json")
            future_reviews = request_session.get(f"{ty_api}/{ty_id}/reviews.json")
            future_seal = request_session.get(f"{ty_api}/{ty_id}/seal.json")
            future_relevant_now = request_session.get(
                f"{ty_api}/{ty_id}/relevant_now.json?key={TRUSTYOU_HOTEL_API_KEY}"
            )

            meta_review = future_meta_review.result().json().get("response")
            reviews = future_reviews.result().json().get("response")
            relevant_now_data = future_relevant_now.result().json().get("response")
            seal = future_seal.result().json().get("response")

            badges = cls.get_badges(meta_review)
            categories = cls.get_categories(meta_review)

            reviews_distribution = cls.get_reviews_distribution(reviews)
            traveler_types_distribution = cls.get_traveler_types_distribution(reviews)
            hotels.append(
                HotelResponse(
                    ty_id=ty_id,
                    name=seal.get("name"),
                    rating=reviews["score"],
                    reviews_count=reviews["reviews_count"],
                    relevant_now=cls.get_relevant_now(relevant_now_data),
                    categories=categories,
                    badges=badges,
                    reviews_distribution=reviews_distribution,
                    traveler_types_distribution=traveler_types_distribution,
                    match=MatchResponse(
                        score=(ty_clusters[ty_id].match_score if ty_clusters[ty_id] else 0),
                        language=(ty_clusters[ty_id].language if ty_clusters[ty_id] else "all"),
                        trip_type=(ty_clusters[ty_id].trip_type if ty_clusters[ty_id] else "all")
                    )
                )
            )

        return SearchResponse(
            hotels=hotels
        )

    @classmethod
    def get_badges(cls, meta_review: Any):
        """
        Mock badges list, data comes from meta review

        :param meta_review: result of meta_review.json
        :return: [BadgeResponse]
        """
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
        """
        Mock reviews_distribution, data comes from reviews

        :param reviews: result of reviews.json
        :return: List[ReviewsDistributionResponse]
        """
        return [ReviewsDistributionResponse(**distribution) for distribution in reviews["reviews_distribution"]]

    @classmethod
    def get_traveler_types_distribution(cls, reviews: Any) -> List[TravelerTypesDistributionResponse]:
        """
        Mock traveler_types_distribution, data comes from reviews
        :param reviews: result of reviews.json
        :return: List[TravelerTypesDistributionResponse]
        """
        return [TravelerTypesDistributionResponse(**distribution) for distribution in reviews["trip_type_distribution"]]

    @classmethod
    def get_categories(cls, meta_review: Any) -> List[CategoryResponse]:
        """
        Mock categories, data comes from meta review

        :param meta_review: result of meta_review.json
        :return: List[CategoryResponse]
        """
        return [
            CategoryResponse(
                **category,
                sub_categories=category["sub_category_list"]
            ) for category in meta_review["category_list"]
        ]

    @classmethod
    def get_relevant_now(cls, relevant_now: Any) -> RelevantNowResponse:
        """
        Mock relevant_now, data comes from relevant_now.json

        :param relevant_now: result of relevant_now.json
        :return: RelevantNowResponse
        """

        relevant_now_item = relevant_now["relevant_now"]

        relevant_topics = None
        overall_satisfaction = None

        if "relevant_topics" in relevant_now_item:
            relevant_topics = {
                topic: RelevantTopic(**relevant)
                for topic, relevant in relevant_now_item["relevant_topics"].items()
            }


        if "overall_satisfaction" in relevant_now_item:
            overall_satisfaction = OverallSatisfaction(**relevant_now_item["overall_satisfaction"])

        return RelevantNowResponse(
            relevant_topics=relevant_topics,
            overall_satisfaction=overall_satisfaction
        )