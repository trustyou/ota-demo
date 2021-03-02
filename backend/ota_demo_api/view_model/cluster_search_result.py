import uuid
from typing import Optional, List

from pydantic import BaseModel


class ClusterSearchResult(BaseModel):
    ty_id: uuid.UUID
    trip_type: Optional[str]
    language: Optional[str]
    city: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    review_count: Optional[int]
    search_score: float

    class Config:
        orm_mode = True
