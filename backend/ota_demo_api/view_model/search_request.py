from typing import Optional, List
from pydantic import BaseModel


class SearchRequest(BaseModel):
    categories: Optional[List[str]]
    traveler_type: Optional[str]
    hotel_types: Optional[List[str]]
    min_rating: Optional[int]
    city: Optional[str]
    lat: Optional[float]
    long: Optional[float]
    language: Optional[str]
    page: Optional[int] = 1
    page_size: Optional[int] = 50
