import uuid
from typing import Dict, Optional, Any

from pydantic import BaseModel


class DataPoint(BaseModel):
    id: str
    score: float
    review_count: int


class ClusterSearchResult(BaseModel):
    ty_id: uuid.UUID
    trip_type: str
    language: str
    match_score: float
    categories: Dict[str, DataPoint]
    hotel_types: Dict[str, DataPoint]
    personalized_data_points: bool
    city: str
    country: str
    latitude: float
    longitude: float
    meta_review: Dict[str, Any]
    name: str

    class Config:
        orm_mode = True
