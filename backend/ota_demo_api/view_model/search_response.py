from typing import Optional, List, Dict
from pydantic import BaseModel


class ReviewsDistributionResponse(BaseModel):
    count: int
    stars: int


class TravelerTypesDistributionResponse(BaseModel):
    count: int
    trip_type: str


class HotelResponse(BaseModel):
    ty_id: str
    rating: Optional[str]
    reviews: Optional[str]
    relevant_now: Optional[str]
    badges: Optional[str]
    reviews_distribution: Optional[List[ReviewsDistributionResponse]]
    traveler_types_distribution: Optional[List[TravelerTypesDistributionResponse]]


class SearchResponse(BaseModel):
    hotels: List[HotelResponse]
