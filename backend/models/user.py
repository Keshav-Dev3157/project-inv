from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: Literal["admin", "user"] = "user"


class UserCreate(UserBase):
    password: str


class UserInDB(UserBase):
    id: Optional[str] = Field(alias="_id", default=None)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    role: str
    created_at: datetime
    is_active: bool

    model_config = ConfigDict(populate_by_name=True)
