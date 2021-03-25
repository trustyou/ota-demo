from sqlalchemy import Column, String, Float, Integer, SmallInteger
from sqlalchemy.dialects.postgresql import UUID

from ota_demo_api.persistence.database import Base


class ClusterSearchModel(Base):
    __tablename__ = "cluster_search"

    ty_id = Column(UUID, primary_key=True)
    trip_type = Column(String, primary_key=True)
    language = Column(String, primary_key=True)
    city = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    data_point = Column(String, primary_key=True)
    score = Column(Float)
    review_count = Column(Integer)


class CitySearchModel(Base):
    __tablename__ = "city_search"

    city = Column(String, primary_key=True)
    country = Column(String, primary_key=True)
    count = Column(SmallInteger)
