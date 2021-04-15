import asyncio
from typing import Any, List, Dict, Sequence, Optional

import httpx
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from async_lru import alru_cache

from ota_demo_api.view_model.search_response import (
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
from ota_demo_api.view_model.cluster_search_result import ClusterSearchResult
from ota_demo_api.view_model.search_response import SearchResponse, HotelResponse, MatchResponse
from ota_demo_api.service.badges import get_badge_icon
from ota_demo_api.util.score import get_score_description
from ota_demo_api.view_model.search_request import SearchRequest


class SearchServiceDataFeed(object):
    @classmethod
    async def search(cls, search_data: SearchRequest,
                     clusters: List[ClusterSearchResult], total_count: int) -> SearchResponse:
        """
        The data for API

        :param search_data: The search request
        :param clusters: Results of the search
        :param total_count: The total number of results
        :return: Filtered data
        """
        if not clusters:
            hotels = []
            return SearchResponse(
                hotels=hotels,
                total_count=total_count
            )

        category_names = await cls.get_category_names()
        ty_clusters = {str(c.ty_id): c for c in clusters}

        hotels = []
        for ty_id in ty_clusters.keys():
            cluster_search_result = ty_clusters[ty_id]

            meta_review = cluster_search_result.meta_review
            name = cluster_search_result.name
            score = float(meta_review["summary"]["score"])
            reviews_count = meta_review["reviews_count"]
            coordinates = [cluster_search_result.latitude, cluster_search_result.longitude]
            city_center_coords = await cls.get_city_coords(
                cluster_search_result.city, cluster_search_result.country
            )

            distance_from_center = cls.get_distance_from_center(
                city_center_coords, coordinates
            )

            filtered_meta_review = cls.get_filtered_meta_review(meta_review, cluster_search_result.trip_type,
                                                                cluster_search_result.language)
            categories = cls.get_categories(filtered_meta_review)
            hotel_types = cls.get_hotel_types(meta_review)
            preferred_dps = cls.get_preferred_dps(search_data)
            badges = cls.get_badges(meta_review, preferred_dps)

            match_info = cls.get_match_info(category_names, categories, hotel_types, cluster_search_result)

            hotels.append(
                HotelResponse(
                    ty_id=ty_id,
                    name=name,
                    score=score,
                    reviews_count=reviews_count,
                    score_description=get_score_description(score),
                    relevant_now=cls.get_relevant_now(meta_review),
                    categories=categories,
                    badges=badges,
                    match=match_info,
                    distance_from_center=distance_from_center,
                    coordinates=coordinates
                )
            )

        return SearchResponse(
            hotels=hotels,
            total_count=total_count
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

        try:
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
        except StopIteration:
            return filtered_meta_review

        return filtered_meta_review

    @classmethod
    def get_distance_from_center(cls, city_center_coords: Optional[Sequence[float]],
                                       coordinates: Optional[Sequence[float]]) -> str:
        """
        Get the coordinates to the city center.
        :param city_center_coords: The coords of the city center
        :param coordinates: Sequence with latitude and longitude of the hotel
        :return: The text describing the distance from the city center
        """
        if not city_center_coords or not coordinates:
            return None

        distance_from_center_km = round(geodesic(city_center_coords, coordinates).kilometers, 1)

        if distance_from_center_km < 0.1:
            return "At the center of the city"

        return f"{distance_from_center_km} km from center"

    @classmethod
    @alru_cache
    async def get_city_coords(cls, city: Optional[str], country: Optional[str]) -> Optional[Sequence[float]]:
        """
        The the coordinates of the city
        :param city: The city
        :param country: The country
        :return: Sequence with lat and lon floats
        """
        if not city or not country:
            return None

        loop = asyncio.get_event_loop()
        with Nominatim(user_agent="ty-ota-demo") as geolocator:
            try:
                location = await loop.run_in_executor(None, lambda: geolocator.geocode(f"{city},{country}", limit=1))
            except:
                return None
            return location.latitude, location.longitude

    @classmethod
    def get_badges(cls, meta_review: Any, preferred_dps: List[str]) -> List[BadgeResponse]:
        """
        The badges list, data comes from meta review

        :param meta_review: Result of meta_review.json
        :param preferred_dps: List of data point ids that are preferred
        :return: List with the badges
        """
        badge_list = meta_review["badge_list"]
        low_prio_types = ["ranking"]
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

        badges = sorted(badges, key=lambda x: (x.badge_data.category_id in preferred_dps,
                                               x.badge_type not in low_prio_types), reverse=True)

        return badges

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
    def get_relevant_now(cls, meta_review: Any) -> RelevantNowResponse:
        """
        The relevant_now, data comes from relevant_now.json

        :param meta_review: result of meta_review.json
        :return: RelevantNowResponse
        """

        relevant_now_item = meta_review.get("relevant_now", {}) or {}

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
    @alru_cache
    async def get_category_names(cls) -> Dict[str, str]:
        """
        Get the names for all MR categories.
        :param session: The async session to use to fetch the data
        :return: Dict with MR categories
        """
        async with httpx.AsyncClient() as client:
            categories_resonse = await client.get('https://api.trustyou.com/hotels/categories')
            categories = categories_resonse.json()["response"]["cluster_category_list"]
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
            personalized_data_points=search_result.personalized_data_points
        )

    @classmethod
    def get_preferred_dps(cls, search_data: SearchRequest) -> List[str]:
        """
        Get the preferred data points if any.
        :param search_data: The search request
        :return: The preferred data points
        """
        preferred_dps = []
        if search_data.categories:
            preferred_dps += search_data.categories
        if search_data.hotel_types:
            preferred_dps += search_data.hotel_types

        return preferred_dps
