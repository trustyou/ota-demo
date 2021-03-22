from requests_futures.sessions import FuturesSession

from typing import Any, List, Optional
import random

from ota_demo_api.view_model.search_response import (
    TravelerTypesDistributionResponse,
    BadgeDataModel,
    BadgeResponse,
    BadgeHighlightModel,
    CategoryResponse,
    HotelTypeResponse,
    MatchCategoryResponse,
    MatchHotelTypeResponse,
    RelevantNowResponse,
    OverallSatisfaction,
    RelevantTopic
)
from ota_demo_api.view_model.search_response import ReviewsDistributionResponse
from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.cluster_search_result import ClusterSearchResult
from ota_demo_api.view_model.search_response import SearchResponse, HotelResponse, MatchResponse
from ota_demo_api.consts import TRUSTYOU_HOTEL_API_KEY
from ota_demo_api.service.badges import get_badge_icon


class SearchServiceDataFeed(object):
    @classmethod
    def search(cls, search_data: SearchRequest, clusters: List[ClusterSearchResult]) -> SearchResponse:
        """
        The data for API

        :param search_data: SearchRequest object
        :param clusters: Results of the search
        :return: Filtered data
        """
        if not clusters:
            hotels = []
            return SearchResponse(
                hotels=hotels
            )

        request_session = FuturesSession()

        ty_api = "https://api.trustyou.com/hotels/"

        ty_clusters = {str(c.ty_id): c for c in clusters}

        hotels = []
        for ty_id in ty_clusters.keys():
            future_meta_review = request_session.get(f"{ty_api}/{ty_id}/meta_review.json?scale={search_data.scale}")
            future_reviews = request_session.get(f"{ty_api}/{ty_id}/reviews.json?scale={search_data.scale}")
            future_seal = request_session.get(f"{ty_api}/{ty_id}/seal.json?scale={search_data.scale}")
            future_relevant_now = request_session.get(
                f"{ty_api}/{ty_id}/relevant_now.json?key={TRUSTYOU_HOTEL_API_KEY}&scale={search_data.scale}"
            )
            future_badges = request_session.get(f"{ty_api}/{ty_id}/badges.json?scale={search_data.scale}")
            future_location = request_session.get(f"{ty_api}/{ty_id}/location.json")

            meta_review = future_meta_review.result().json().get("response")
            reviews = future_reviews.result().json().get("response")
            relevant_now_data = future_relevant_now.result().json().get("response")
            seal = future_seal.result().json().get("response")
            coordinates = future_location.result().json().get("response", {}).get("coordinates", {}).get("coordinates")

            badges = cls.get_badges(future_badges.result().json().get("response"))
            categories = cls.get_categories(meta_review)
            hotel_types = cls.get_hotel_types(meta_review)

            reviews_distribution = cls.get_reviews_distribution(reviews)
            traveler_types_distribution = cls.get_traveler_types_distribution(reviews)
            match_info = cls.get_match_info(categories, hotel_types, ty_clusters[ty_id])

            hotels.append(
                HotelResponse(
                    ty_id=ty_id,
                    name=seal.get("name"),
                    score=float(seal.get("score")),
                    reviews_count=seal.get("reviews_count"),
                    score_description=seal.get("score_description"),
                    relevant_now=cls.get_relevant_now(relevant_now_data),
                    categories=categories,
                    badges=badges,
                    reviews_distribution=reviews_distribution,
                    traveler_types_distribution=traveler_types_distribution,
                    match=match_info,
                    distance_from_center=f"{round(random.uniform(1, 5), 1)} km from center",
                    coordinates=coordinates
                )
            )

        return SearchResponse(
            hotels=hotels
        )

    @classmethod
    def get_badges(cls, badges_data: Any):
        """
        The badges list, data comes from meta review

        :param meta_review: result of meta_review.json
        :return: [BadgeResponse]
        """
        badge_list = badges_data["badge_list"]
        badges = []

        for badge in badge_list:
            badge_data = BadgeDataModel(**badge["badge_data"])
            highlight_list = [BadgeHighlightModel(**highlight) for highlight in badge.get("highlight_list", [])]

            badge_response = BadgeResponse(
                text=badge.get("text", ""),
                subtext=badge.get("subtext", ""),
                badge_type=badge["badge_type"],
                badge_data=badge_data,
                highlight_list=highlight_list,
                icon=get_badge_icon(badge)
            )
            badges.append(badge_response)

        return badges

    @classmethod
    def get_reviews_distribution(cls, reviews: Any) -> List[ReviewsDistributionResponse]:
        """
        The reviews_distribution, data comes from reviews

        :param reviews: result of reviews.json
        :return: List[ReviewsDistributionResponse]
        """
        return [ReviewsDistributionResponse(**distribution) for distribution in reviews["reviews_distribution"]]

    @classmethod
    def get_traveler_types_distribution(cls, reviews: Any) -> List[TravelerTypesDistributionResponse]:
        """
        The traveler_types_distribution, data comes from reviews
        :param reviews: result of reviews.json
        :return: List[TravelerTypesDistributionResponse]
        """
        return [TravelerTypesDistributionResponse(**distribution) for distribution in reviews["trip_type_distribution"]]

    @classmethod
    def get_categories(cls, meta_review: Any) -> List[CategoryResponse]:
        """
        The categories, data comes from meta review

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
    def get_hotel_types(cls, meta_review: Any) -> List[HotelTypeResponse]:
        """
        The hotel_types, data comes from meta review

        :param meta_review: result of meta_review.json
        :return: List[CategoryResponse]
        """
        return [
            HotelTypeResponse(
                **category,
                sub_categories=category["sub_category_list"]
            ) for category in meta_review["hotel_type_list"]
        ]

    @classmethod
    def get_relevant_now(cls, relevant_now: Any) -> RelevantNowResponse:
        """
        The relevant_now, data comes from relevant_now.json

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

    @classmethod
    def get_match_info(cls, categories: List[CategoryResponse], hotel_types: List[HotelTypeResponse],
                       search_result: ClusterSearchResult) -> MatchResponse:
        """
        Return the match info.
        :param categories: List of categories for the cluster
        :param hotel_types: List of hotel_types for the cluster
        :param search_result: The cluster result from the search
        :return: The MatchResponse object with match info
        """
        all_categories = {
            i.category_id: i for l in map(lambda c: [c] + (c.sub_categories or []), categories) for i in l
        }
        all_hotel_types = {
            i.category_id: i for l in map(lambda c: [c] + (c.sub_categories or []), hotel_types) for i in l
        }
        match_categories = {
            c_id: MatchCategoryResponse(**(dict(all_categories[c_id]) | dict(c_val)))
            for c_id, c_val in search_result.categories.items() if c_id in all_categories
        }
        match_hotel_types = {
            c_id: MatchHotelTypeResponse(**(dict(all_hotel_types.get(c_id, {})) | dict(c_val)))
            for c_id, c_val in search_result.hotel_types.items() if c_id in all_hotel_types
        }

        return MatchResponse(
            score=search_result.match_score,
            language=search_result.language,
            trip_type=search_result.trip_type,
            categories=match_categories,
            hotel_types=match_hotel_types,
            overall_score=search_result.overall_score
        )
