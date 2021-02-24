# Example of schema
#
# from pydantic import BaseModel, Field
#
#
# class UserBase(BaseModel):
#     email: str
#
#
# class UserCreate(UserBase):
#     pass
#
#
# class User(UserBase):
#     id: int
#     is_active: bool
#
#     class Config:
#         orm_mode = True
