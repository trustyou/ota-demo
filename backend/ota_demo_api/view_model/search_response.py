from typing import Optional, List, Dict
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


class CategoryResponseBase(BaseModel):
    count: int
    sentiment: str
    text: str
    score: int
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
    trend: float
    reviews_count: int
    score: float


class RelevantNowResponse(BaseModel):
    relevant_topics: Dict[str, RelevantTopic]
    overall_satisfaction: OverallSatisfaction


class HotelResponse(BaseModel):
    ty_id: str
    name: str
    rating: Optional[str]
    reviews_count: Optional[int]
    relevant_now: Optional[RelevantNowResponse]
    categories: Optional[List[CategoryResponse]]
    badges: Optional[List[BadgeResponse]]
    reviews_distribution: Optional[List[ReviewsDistributionResponse]]
    traveler_types_distribution: Optional[List[TravelerTypesDistributionResponse]]


class SearchResponse(BaseModel):
    hotels: List[HotelResponse]
