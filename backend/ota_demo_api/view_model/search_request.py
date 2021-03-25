from typing import Optional, List

from pydantic import BaseModel, ValidationError, root_validator, confloat, conint


class SearchRequest(BaseModel):
    categories: Optional[List[str]]
    trip_type: Optional[str]
    hotel_types: Optional[List[str]]
    min_score: Optional[confloat(ge=0, le=100)]
    sort_column: Optional[str] = "match_score"
    city: Optional[str]
    country: Optional[str]
    lat: Optional[float]
    long: Optional[float]
    radius: Optional[confloat(ge=0, le=10000)]
    language: Optional[str]
    page: Optional[conint(ge=0)] = 1
    page_size: Optional[conint(gt=0, le=100)] = 10

    @root_validator
    def check_require_city_or_map_box(cls, values):
        if not cls.is_valid_city_country_request(values) and not cls.is_valid_map_box_request(values):
            raise ValueError('(city, country) or (lat, long, radius) should be included')

        if cls.is_valid_city_country_request(values) and cls.is_valid_map_box_request(values):
            raise ValueError('Only (city, country) or (lat, long, radius) should be included')

        if values.get("min_score") and (values.get("min_score") < 0 or values.get("min_score") > 100):
            raise ValueError('Then min_score filter is outside the supported range')

        if values.get("sort_column") not in ["match_score", "score"]:
            raise ValueError('Only (match_score, score) are supported values for sort_column')

        return values

    @classmethod
    def is_valid_map_box_request(cls, values):
        return values.get("lat") \
            and values.get("long") \
            and values.get("radius")

    @classmethod
    def is_valid_city_country_request(cls, values):
        return values.get("city") and values.get("country")
