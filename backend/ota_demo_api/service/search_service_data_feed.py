import asyncio
from typing import Any, List, Dict, Tuple, Sequence, Optional

from requests_futures.sessions import FuturesSession
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from async_lru import alru_cache

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
    async def search(cls, search_data: SearchRequest, clusters: List[ClusterSearchResult]) -> SearchResponse:
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

        category_names = cls.get_category_names(request_session)

        hotels = []
        for ty_id in ty_clusters.keys():
            cluster_search_result = ty_clusters[ty_id]
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
            location_response = future_location.result().json().get("response", {})
            coordinates = location_response.get("coordinates", {}).get("coordinates")
            city = location_response.get("address", {}).get("city")
            country = location_response.get("address", {}).get("country")
            distance_from_center = await cls.get_distance_from_center(city, country, coordinates)

            badges = cls.get_badges(future_badges.result().json().get("response"))
            filtered_meta_review = cls.get_filtered_meta_review(meta_review, cluster_search_result.trip_type,
                                                                cluster_search_result.language)
            categories = cls.get_categories(filtered_meta_review)
            hotel_types = cls.get_hotel_types(meta_review)

            reviews_distribution = cls.get_reviews_distribution(reviews)
            traveler_types_distribution = cls.get_traveler_types_distribution(reviews)
            match_info = cls.get_match_info(category_names, categories, hotel_types, cluster_search_result)

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
                    distance_from_center=distance_from_center,
                    coordinates=coordinates
                )
            )

        return SearchResponse(
            hotels=hotels
        )

    @classmethod
    def get_filtered_meta_review(cls, meta_review: Any, trip_type: str, language: str) -> Dict[str, Any]:
        """
        Apply the filters and get the resulting meta review.
        :param meta_review: The MR document
        :param trip_type: The type of the trip filter
        :param language: The language filter
        :return: The filtered MR document
        """
        filtered_meta_review = meta_review

        if language != "all":
            filtered_meta_review = next(filter(lambda x: x["filter"]["language"] == language,
                                               filtered_meta_review["language_meta_review_list"]))
            if trip_type != "all":
                filtered_meta_review = next(filter(lambda x: x["filter"]["trip_type"] == trip_type,
                                                   filtered_meta_review["trip_type_meta_review_list"]))
        else:
            if trip_type != "all":
                filtered_meta_review = next(filter(lambda x: x["filter"]["trip_type"] == trip_type,
                                                   filtered_meta_review["trip_type_meta_review_list"]))

        return filtered_meta_review

    @classmethod
    async def get_distance_from_center(cls, city: Optional[str], country: Optional[str],
                                       coordinates: Optional[Sequence[float]]) -> str:
        """
        Get the coordinates to the city center.
        :param city: The search city
        :param country: The search country
        :param coordinates: Tuple with latitude and longitude of the hotel
        :return: The text describing the distance from the city center
        """
        if not city or not country or not coordinates:
            return None

        hotel_coords = coordinates[::-1]
        city_center_coords = await cls.get_city_coords(city, country)

        if city_center_coords:
            distance_from_center_km = round(geodesic(city_center_coords, hotel_coords).kilometers, 1)
            return f"{distance_from_center_km} km from center"

    @classmethod
    @alru_cache(maxsize=128)
    async def get_city_coords(cls, city: str, country: str) -> Optional[Tuple[float, float]]:
        """
        The the coordinates of the city
        :param city: The city
        :param country: The country
        :return: Tuple with lat and lon floats
        """
        loop = asyncio.get_event_loop()
        with Nominatim(user_agent="ty-ota-demo") as geolocator:
            try:
                location = await loop.run_in_executor(None, lambda: geolocator.geocode(f"{city},{country}", limit=1))
            except:
                return None
            return location.latitude, location.longitude

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
    def get_category_names(cls, session: FuturesSession) -> Dict[str, str]:
        """
        Get the names for all MR categories.
        :param session: The async session to use to fetch the data
        :return: Dict with MR categories
        """
        categories_future = session.get('https://api.trustyou.com/hotels/categories')
        categories = categories_future.result().json()["response"]["cluster_category_list"]
        return {c["category_id"]: c["name"] for c in categories}

    @classmethod
    def get_match_info(cls, category_names: Dict[str, str], categories: List[CategoryResponse],
                       hotel_types: List[HotelTypeResponse], search_result: ClusterSearchResult) -> MatchResponse:
        """
        Return the match info.
        :param category_names: Dict with MR categories and their names
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
            c_id: MatchCategoryResponse(**(dict(all_categories.get(
                c_id,
                { "category_id": c_id, "category_name": category_names[c_id]}
            )) | dict(c_val)))
            for c_id, c_val in search_result.categories.items()
        }
        match_hotel_types = {
            c_id: MatchHotelTypeResponse(**(dict(all_hotel_types.get(
                c_id,
                { "category_id": c_id, "category_name": category_names[c_id]}
            )) | dict(c_val)))
            for c_id, c_val in search_result.hotel_types.items()
        }

        return MatchResponse(
            match_score=search_result.match_score,
            language=search_result.language,
            trip_type=search_result.trip_type,
            categories=match_categories,
            hotel_types=match_hotel_types,
            overall_score=search_result.overall_score
        )
