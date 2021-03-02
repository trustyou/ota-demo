from typing import Optional, List
from pydantic import BaseModel


class ReviewsDistributionResponse(BaseModel):
    count: int
    stars: int


class TravelerTypesDistributionResponse(BaseModel):
    count: int
    trip_type: str


class BadgeHighlightModel(BaseModel):
    text: str
    confidence: float
    category_id_list: List[str]


class BadgeDataModel(BaseModel):
    global_popularity: float
    popularity: float
    score: Optional[float]
    category_id: Optional[str]
    category_name: Optional[str]


class BadgeResponse(BaseModel):
    text: str
    subtext: str
    badge_type: str
    badge_data: BadgeDataModel
    highlight_list: List[BadgeHighlightModel]


class HotelResponse(BaseModel):
    ty_id: str
    rating: Optional[float]
    reviews_count: Optional[int]
    relevant_now: Optional[str]
    badges: Optional[List[BadgeResponse]]
    reviews_distribution: Optional[List[ReviewsDistributionResponse]]
    traveler_types_distribution: Optional[List[TravelerTypesDistributionResponse]]


class SearchResponse(BaseModel):
    hotels: List[HotelResponse]
