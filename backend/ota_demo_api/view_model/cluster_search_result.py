import uuid
from typing import Dict, Optional

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
    categories: Dict[str, DataPoint]
    hotel_types: Dict[str, DataPoint]
    overall_match: bool

    class Config:
        orm_mode = True
