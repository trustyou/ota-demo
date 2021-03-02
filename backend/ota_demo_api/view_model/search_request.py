from typing import Optional, List
from pydantic import BaseModel, ValidationError, root_validator


class SearchRequest(BaseModel):
    categories: Optional[List[str]]
    trip_type: Optional[str]
    hotel_types: Optional[List[str]]
    min_rating: Optional[int]
    city: Optional[str]
    lat: Optional[float]
    long: Optional[float]
    radius: Optional[float]
    language: Optional[str]
    page: Optional[int] = 1
    page_size: Optional[int] = 50

    @root_validator
    def check_require_city_or_map_box(cls, values):
        if not values.get("city") and not cls.is_valid_map_box_request(values):
            raise ValueError('city or (lat, long, radius) should be included')

        if values.get("city") and cls.is_valid_map_box_request(values):
            raise ValueError('Only city or (lat, long, radius) should be included')

        return values

    @classmethod
    def is_valid_map_box_request(cls, values):
        return values.get("lat") \
            and values.get("long") \
            and values.get("radius")
