from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime


class TransactionInDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    deposit_id: Optional[str] = None
    type: Literal["deposit", "withdrawal", "interest_accrual"]
    amount: float
    balance_after: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    description: str

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )


class TransactionResponse(BaseModel):
    id: str
    user_id: str
    deposit_id: Optional[str] = None
    type: str
    amount: float
    balance_after: float
    timestamp: datetime
    description: str

    model_config = ConfigDict(populate_by_name=True)

