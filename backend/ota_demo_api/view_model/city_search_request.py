from typing import Optional, List
from pydantic import BaseModel


class CitySearchRequest(BaseModel):
    q: Optional[str] = None
    limit: Optional[int] = 10
