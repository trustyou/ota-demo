from typing import Optional, List, Dict, Tuple
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
    global_popularity: Optional[float]
    popularity: Optional[float]
    score: Optional[float]
    category_id: Optional[str]
    category_name: Optional[str]


class BadgeResponse(BaseModel):
    text: str
    subtext: str
    badge_type: str
    badge_data: BadgeDataModel
    highlight_list: List[BadgeHighlightModel]
    icon: str


class CategoryResponseBase(BaseModel):
    count: int
    sentiment: str
    text: str
    score: float
    relevance: float
    short_text: str
    category_id: str
    category_name: str


class CategoryResponse(CategoryResponseBase):
    sub_categories: List[CategoryResponseBase]


class RelevantTopicCategoryModel(BaseModel):
    reviews_count: int
    name: str
    reviews_with_pos_mentions_count: int
    text: str
    last_seen_on: str
    score: float


class RelevantTopic(RelevantTopicCategoryModel):
    sub_categories: List[RelevantTopicCategoryModel]


class OverallSatisfaction(BaseModel):
    trend: Optional[float]
    reviews_count: int
    score: float


class RelevantNowResponse(BaseModel):
    relevant_topics: Optional[Dict[str, RelevantTopic]]
    overall_satisfaction: Optional[OverallSatisfaction]


class MatchResponse(BaseModel):
    score: float
    language: str
    trip_type: str
    categories: Dict[str, float]
    hotel_types: Dict[str, float]


class HotelResponse(BaseModel):
    ty_id: str
    name: str
    score: Optional[float]
    reviews_count: Optional[int]
    score_description: Optional[str]
    relevant_now: Optional[RelevantNowResponse]
    categories: Optional[List[CategoryResponse]]
    badges: Optional[List[BadgeResponse]]
    reviews_distribution: Optional[List[ReviewsDistributionResponse]]
    traveler_types_distribution: Optional[List[TravelerTypesDistributionResponse]]
    match: MatchResponse
    distance_from_center: Optional[str]
    coordinates: Optional[Tuple[float, float]]


class SearchResponse(BaseModel):
    hotels: List[HotelResponse]
