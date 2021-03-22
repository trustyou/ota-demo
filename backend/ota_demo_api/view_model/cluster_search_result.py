import uuid
from typing import Optional, Dict

from pydantic import BaseModel


class DataPoint(BaseModel):
    id: str
    score: float
    count: int


class ClusterSearchResult(BaseModel):
    ty_id: uuid.UUID
    trip_type: str
    language: str
    match_score: float
    categories: Optional[Dict[str, DataPoint]]
    hotel_types: Optional[Dict[str, DataPoint]]
    overall_score: Optional[float]

    class Config:
        orm_mode = True
