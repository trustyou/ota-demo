from typing import Optional, List, Dict
from pydantic import BaseModel

class CityResponse(BaseModel):
    city: str
    country: str
    count: int

class CitySearchResponse(BaseModel):
    cities: List[CityResponse]
