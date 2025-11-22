from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Literal
from datetime import datetime


class DepositCreate(BaseModel):
    amount: float
    proof_url: str  # URL or path to uploaded proof document


class DepositInDB(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    user_id: str
    amount: float
    proof_url: str
    status: Literal["pending", "approved", "rejected", "withdrawn"] = "pending"
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    maturity_date: Optional[datetime] = None
    interest_rate: float = 0.04  # 4% monthly
    current_balance: float = 0.0  # Principal + accrued interest
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True
    )


class DepositResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    proof_url: str
    status: str
    submitted_at: datetime
    approved_at: Optional[datetime] = None
    maturity_date: Optional[datetime] = None
    current_balance: float
    days_remaining: Optional[int] = None
    is_mature: bool = False
    accrued_interest: float = 0.0

    model_config = ConfigDict(populate_by_name=True)


class DepositApproval(BaseModel):
    deposit_id: str
    action: Literal["approve", "reject"]

