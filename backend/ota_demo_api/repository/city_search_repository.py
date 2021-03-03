from typing import Optional, List

from ota_demo_api.view_model.city_search_request import CitySearchRequest
from ota_demo_api.view_model.city_search_response import CityResponse


class CitySearchRepository:
    def __init__(self, database):
        self.database = database

    async def fetch(self, city_search_data: CitySearchRequest) -> Optional[List[CityResponse]]:
        if not city_search_data.q:
            raise ValueError("You have to provide at least one char to search for")

        query = """
            SELECT city, country, count FROM public.city_search_sample
            WHERE lower(city) LIKE :prefix
            ORDER BY count DESC
            LIMIT :limit;
        """

        query_params = {
            "prefix": city_search_data.q.lower() + "%",
            "limit": city_search_data.limit
        }

        records = await self.database.fetch_all(query, values=query_params)

        results = [CityResponse(**record) for record in records]

        return results
