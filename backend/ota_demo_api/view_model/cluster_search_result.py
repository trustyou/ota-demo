import uuid
from typing import Optional, Dict

from pydantic import BaseModel


class ClusterSearchResult(BaseModel):
    ty_id: uuid.UUID
    trip_type: Optional[str]
    language: Optional[str]
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    review_count: Optional[int]
    match_score: float
    categories: Dict[str, str]
    hotel_types: Dict[str, str]

    class Config:
        orm_mode = True
