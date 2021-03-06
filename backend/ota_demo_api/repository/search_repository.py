from typing import Optional, List, Dict, Any

from ota_demo_api.view_model.search_request import SearchRequest
from ota_demo_api.view_model.cluster_search_result import ClusterSearchResult


def scale_score(field: Optional[float], scale: int) -> Optional[float]:
    """
    Scale the field from 100 to 5 scale.
    :param field: The score on 100 scale
    :param scale: The scale
    :return: The field on the requested scale
    """
    try:
        result = round(field / 20.0, 1) if scale != 100 else round(field)
    except TypeError:
        return None
    else:
        return result


def normalize_score(field: Optional[float], scale: int) -> Optional[float]:
    """
    Normalize to 100 scale the field expressed in scale.
    :param field: The score field
    :param scale: The current scale of the score
    :return: The normalizaed score
    """
    return round(field * 100 / scale)


def transform_record(record_dict: Dict[str, Any], scale: int) -> Dict[str, Any]:
    """
    Transform the DB record to the expected format.
    :param record_dict: The db record
    :param scale: The scale to use for scores
    :return: Dict with result in expected format
    """
    record_dict["match_score"] = scale_score(
        record_dict["match_score"],
        scale
    )
    data_point_scores = list(zip(record_dict["data_points"], record_dict["scores"]))
    record_dict["hotel_types"] = {
        ("all" if dps[0] == "oall" else dps[0]): scale_score(dps[1], scale)
        for dps in data_point_scores if dps[0] == "oall" or dps[0].startswith("16")
    }
    record_dict["categories"] = {
        ("all" if dps[0] == "oall" else dps[0]): scale_score(dps[1], scale)
        for dps in data_point_scores if dps[0] == "oall" or not dps[0].startswith("16")
    }

    return record_dict


class SearchRepository:
    def __init__(self, database):
        self.database = database

    async def fetch(self, search_data: SearchRequest) -> Optional[List[ClusterSearchResult]]:
        is_city_country = all([search_data.city, search_data.country])
        is_coordinates = all([search_data.lat, search_data.long, search_data.radius])

        if not is_city_country and not is_coordinates:
            raise ValueError("Required (city, country) or (lat, long, radius) filter!")

        if is_city_country and is_coordinates:
            raise ValueError("Both (city, country) or (lat, long, radius) where provided!")

        query_params = {}
        query = f"""
            WITH search_results AS (
                SELECT 
                    ty_id, 
                    language,
                    trip_type, 
                    SUM(score) / COUNT(score) AS search_score,
                    array_agg(datapoint) as data_points,
                    array_agg(score) as scores,
                    ROW_NUMBER() OVER (PARTITION BY ty_id ORDER BY (language != 'all', trip_type != 'all') DESC) AS rn
                FROM cluster_search
        """

        if is_city_country:
            query +=  """
                WHERE lower(city) = lower(:city) AND lower(country) = lower(:country)
            """
            query_params["city"] = search_data.city
            query_params["country"] = search_data.country

        if is_coordinates:
            query += """
                WHERE earth_box(ll_to_earth (:lat, :long), :radius) @> ll_to_earth (latitude, longitude)
                AND earth_distance(ll_to_earth (:lat, :long), ll_to_earth (latitude, longitude)) < :radius
            """
            query_params["lat"] = search_data.lat
            query_params["long"] = search_data.long
            query_params["radius"] = search_data.radius

        if search_data.trip_type:
            query += """
                AND trip_type IN (:trip_type, 'all')
            """
            query_params["trip_type"] = search_data.trip_type
        else:
            query += """
                AND trip_type = 'all'
            """

        if search_data.language:
            query += """
                AND language IN (:language, 'all')
            """
            query_params["language"] = search_data.language
        else:
            query += """
                AND language = 'all'
            """

        data_points = []
        if search_data.categories or search_data.hotel_types:
            data_points += search_data.categories or []
            data_points += search_data.hotel_types or []
        else:
            data_points += ['oall']

        query += """
                AND datapoint = ANY(:data_points)
        """
        query_params["data_points"] = data_points

        query += """
                GROUP BY ty_id, trip_type, language
                HAVING array_length(array_agg(datapoint), 1) = :expected_data_points
            )
            SELECT 
                  sr.ty_id,
                  sr.data_points,
                  sr.scores, 
                  sr.language,
                  sr.trip_type,
                  sr.rn,
                  sr.search_score - sr.search_score * (
                    (CASE WHEN sr.language != :language THEN 1 ELSE 0 END) + 
                    (CASE WHEN sr.trip_type != :trip_type THEN 1 ELSE 0 END)
                  ) * 10 / 100 as match_score,
                  cs.score as score
            FROM search_results sr
            JOIN public.cluster_search cs ON (sr.ty_id = cs.ty_id)
            WHERE cs.datapoint = 'oall' and cs.trip_type = 'all' and cs.language = 'all' and sr.rn = 1
        """

        if search_data.min_score is not None:
            query += """
            AND cs.score >= :min_score
            """
            query_params["min_score"] = normalize_score(search_data.min_score, search_data.scale)

        query += f"""
            ORDER BY {search_data.sort_column} DESC, ty_id
            LIMIT :limit offset :offset;
        """
        query_params["expected_data_points"] = len(data_points)
        query_params["limit"] = search_data.page_size
        query_params["offset"] = search_data.page_size * search_data.page

        records = await self.database.fetch_all(query, values=query_params)

        if len(records) == 0:
            return None

        record_dicts = [transform_record(dict(r), search_data.scale) for r in records]
        results = [ClusterSearchResult(**record_dict) for record_dict in record_dicts]

        return results
