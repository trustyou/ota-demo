import json
from typing import Optional, List, Dict, Any, Tuple

from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.cluster_search_result import ClusterSearchResult, DataPoint


class SearchRepository:
    def __init__(self, database):
        self.database = database

    async def fetch(self, search_data: SearchRequest) -> List[ClusterSearchResult]:
        query = self._build_query(search_data)
        query_params = self._build_query_params(search_data)

        records = await self.database.fetch_all(query, values=query_params)

        if len(records) == 0:
            return []

        record_dicts = [self._transform_record(dict(r)) for r in records]
        results = [ClusterSearchResult(**record_dict) for record_dict in record_dicts]

        return results

    async def count(self, search_data: SearchRequest) -> int:
        """
        Count the number of search results.
        :param search_data: The search request data
        :return: The total number of results
        """
        query = self._build_query(search_data, is_count_query=True)
        query_params = self._build_query_params(search_data, is_count_query=True)
        count = await self.database.fetch_val(query, values=query_params)
        return count

    @staticmethod
    def _format_data_points(data_point_tuples:Tuple[str, float, int]) -> Dict[str, DataPoint]:
        """
        Format category information.
        :param data_point_tuples: Tuples in form of category id, score and reviews count
        :return: Dict with formatted values
        """
        return {
            dps[0]: DataPoint(
                **dict(zip(["id", "score", "review_count"], [dps[0], dps[1], dps[2]]))
            ) for dps in data_point_tuples if dps[0] != "oall"
        }

    def _transform_record(self, record_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform the DB record to the expected format.
        :param record_dict: The db record
        :return: Dict with result in expected format
        """
        record_dict["meta_review"] = json.loads(record_dict["meta_review"])
        record_dict["match_score"] = round(record_dict["match_score"])

        if record_dict["data_points"] == ["oall"]:
            record_dict["personalized_data_points"] = False
            record_dict["hotel_types"] = {}
            record_dict["categories"] = {}
            return record_dict

        data_points = list(zip(record_dict["data_points"], record_dict["scores"], record_dict["review_counts"]))
        hotel_types_dps = [dps for dps in data_points if dps[0].startswith("16")]
        categories_dps = [dps for dps in data_points if not dps[0].startswith("16")]
        record_dict["hotel_types"] = self._format_data_points(hotel_types_dps)
        record_dict["categories"] = self._format_data_points(categories_dps)
        record_dict["personalized_data_points"] = True

        return record_dict

    @staticmethod
    def _validate_location(search_data: SearchRequest) -> Tuple[bool]:
        """
        Validate location parameters and return their availability.
        :param search_data: The search request
        :return: Tuple with flags which location parameters is available
        """
        is_city_country = all([search_data.city, search_data.country])
        is_coordinates = all([search_data.lat, search_data.long, search_data.radius])

        if not is_city_country and not is_coordinates:
            raise ValueError("Required (city, country) or (lat, long, radius) filter!")

        if is_city_country and is_coordinates:
            raise ValueError("Both (city, country) or (lat, long, radius) where provided!")

        return is_city_country, is_coordinates

    def _build_query(self, search_data: SearchRequest, is_count_query: bool = False) -> str:
        """
        Build the SQL query for the fetch operation.
        :param search_data: The search request
        :param is_count_query: The query is a count query or not
        :return: The query string
        """
        is_city_country, is_coordinates = self._validate_location(search_data)

        search_results_column_list = "ty_id" if is_count_query else """
            ty_id,
            language,
            trip_type, 
            latitude,
            longitude,
            city,
            country,
            SUM(score) / COUNT(score) AS search_score,
            ARRAY_AGG(datapoint) AS data_points,
            ARRAY_AGG(score) AS scores,
            ARRAY_AGG(review_count) AS review_counts
        """

        query = f"""
            WITH search_results AS (
                SELECT 
                    {search_results_column_list},
                    ROW_NUMBER() OVER (
                        PARTITION BY ty_id ORDER BY (language != 'all', trip_type != 'all') DESC
                    ) AS rn
                FROM cluster_search
        """

        if is_city_country:
            query +=  """
                WHERE LOWER(city) = LOWER(:city) AND LOWER(country) = LOWER(:country)
            """

        if is_coordinates:
            query += """
                WHERE EARTH_BOX(LL_TO_EARTH (:lat, :long), :radius) @> LL_TO_EARTH (latitude, longitude)
                AND EARTH_DISTANCE(LL_TO_EARTH (:lat, :long), LL_TO_EARTH (latitude, longitude)) < :radius
            """

        if search_data.trip_type:
            query += """
                AND trip_type IN (:trip_type, 'all')
            """
        else:
            query += """
                AND trip_type = :trip_type
            """

        if search_data.language:
            query += """
                AND language IN (:language, 'all')
            """
        else:
            query += """
                AND language = :language
            """

        query += """
                AND datapoint = ANY(:data_points)
                GROUP BY ty_id, trip_type, language, latitude, longitude, city, country
            )
        """

        cluster_search_column_list = "COUNT(*)" if is_count_query else """
            sr.ty_id,
            sr.data_points,
            sr.scores, 
            sr.review_counts,
            sr.language,
            sr.trip_type,
            sr.latitude,
            sr.longitude,
            sr.city,
            sr.country,
            sr.rn,
            sr.search_score * (
                (
                    (CASE WHEN sr.language = :language THEN 1 ELSE 0 END) + 
                    (CASE WHEN sr.trip_type = :trip_type THEN 1 ELSE 0 END) + 
                    ARRAY_LENGTH(sr.data_points, 1)
                ) / (ARRAY_LENGTH(:data_points, 1)::decimal + 2)
            ) as match_score,
            cs.score as score,
            mr.meta_review,
            c.name
        """

        query += f"""
            SELECT {cluster_search_column_list}
            FROM search_results sr
            JOIN cluster_search cs ON (sr.ty_id = cs.ty_id)
            JOIN meta_review mr on (sr.ty_id = mr.cluster_id)
            JOIN cluster c on (sr.ty_id = c.cluster_id)
            WHERE cs.datapoint = 'oall' and cs.trip_type = 'all' and cs.language = 'all' and sr.rn = 1
        """

        if search_data.min_score is not None:
            query += """
            AND cs.score >= :min_score
            """

        if not is_count_query:
            query += f"""
                ORDER BY {search_data.sort_column} DESC, ty_id
                LIMIT :limit offset :offset;
            """

        return query

    def _build_query_params(self, search_data: SearchRequest, is_count_query: bool = False) -> Dict[str, Any]:
        """
        Build the query params for the fetch operation.
        :param search_data: The search request
        :param is_count_query: The query is a count query or not
        :return: The query string
        """
        is_city_country, is_coordinates = self._validate_location(search_data)

        query_params = {}

        if is_city_country:
            query_params["city"] = search_data.city
            query_params["country"] = search_data.country

        if is_coordinates:
            query_params["lat"] = search_data.lat
            query_params["long"] = search_data.long
            query_params["radius"] = search_data.radius

        if search_data.trip_type:
            query_params["trip_type"] = search_data.trip_type
        else:
            query_params["trip_type"] = "all"

        if search_data.language:
            query_params["language"] = search_data.language
        else:
            query_params["language"] = "all"

        data_points = ['oall']
        if search_data.categories or search_data.hotel_types:
            data_points += search_data.categories or []
            data_points += search_data.hotel_types or []

        query_params["data_points"] = data_points

        if search_data.min_score is not None:
            query_params["min_score"] = search_data.min_score

        if not is_count_query:
            query_params["limit"] = search_data.page_size
            query_params["offset"] = search_data.page_size * search_data.page

        return query_params
