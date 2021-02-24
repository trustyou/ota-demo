# Exmaple of model:
#
# from sqlalchemy import Boolean, Column, Integer, String
# from sqlalchemy.orm import relationship
#
# from ota_demo_api.persistence.database import Base
#
#
# class User(Base):
#     __tablename__ = "users"
#
#     id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True)
#     is_active = Column(Boolean, default=True)
