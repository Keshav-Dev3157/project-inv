from fastapi import APIRouter, HTTPException, status, Depends
from database import get_database
from utils.auth import get_current_active_user
from models.deposit import DepositCreate, DepositResponse
from models.transaction import TransactionResponse
from bson import ObjectId
from datetime import datetime
from utils.interest import (
    calculate_accrued_interest,
    calculate_current_balance,
    is_deposit_mature,
    days_until_maturity,
    calculate_maturity_date
)
from pydantic import BaseModel

router = APIRouter(prefix="/user", tags=["User"])


class BalanceResponse(BaseModel):
    principal: float
    accrued_interest: float
    total_balance: float
    has_active_deposit: bool


class WithdrawRequest(BaseModel):
    withdraw_type: str  # "interest" or "full"


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_active_user)):
    """
    Get current user profile.
    """
    return {
        "id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"],
        "is_active": current_user["is_active"]
    }


@router.post("/deposit", response_model=DepositResponse)
async def submit_deposit(deposit_data: DepositCreate, current_user: dict = Depends(get_current_active_user)):
    """
    Submit a deposit request with proof.
    User can only have one deposit at a time (pending or approved).
    """
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Check if user already has a pending or approved deposit
    existing_deposit = await db.deposits.find_one({
        "user_id": user_id,
        "status": {"$in": ["pending", "approved"]}
    })
    
    if existing_deposit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active deposit. Only one deposit is allowed at a time."
        )
    
    # Create deposit document
    deposit_doc = {
        "user_id": user_id,
        "amount": deposit_data.amount,
        "proof_url": deposit_data.proof_url,
        "status": "pending",
        "submitted_at": datetime.utcnow(),
        "approved_at": None,
        "approved_by": None,
        "maturity_date": None,
        "interest_rate": 0.04,
        "current_balance": 0.0
    }
    
    result = await db.deposits.insert_one(deposit_doc)
    deposit_doc["_id"] = result.inserted_id
    
    return DepositResponse(
        id=str(deposit_doc["_id"]),
        user_id=deposit_doc["user_id"],
        amount=deposit_doc["amount"],
        proof_url=deposit_doc["proof_url"],
        status=deposit_doc["status"],
        submitted_at=deposit_doc["submitted_at"],
        approved_at=None,
        maturity_date=None,
        current_balance=0.0,
        days_remaining=None,
        is_mature=False,
        accrued_interest=0.0
    )


@router.get("/deposit/current", response_model=DepositResponse | None)
async def get_current_deposit(current_user: dict = Depends(get_current_active_user)):
    """
    Get current active deposit (pending or approved).
    """
    db = get_database()
    user_id = str(current_user["_id"])
    
    deposit = await db.deposits.find_one({
        "user_id": user_id,
        "status": {"$in": ["pending", "approved"]}
    })
    
    if not deposit:
        return None
    
    accrued_interest = 0.0
    is_mature = False
    days_remaining = None
    current_balance = deposit["amount"]
    
    if deposit["status"] == "approved" and deposit.get("approved_at"):
        accrued_interest = calculate_accrued_interest(
            deposit["amount"],
            deposit["interest_rate"],
            deposit["approved_at"]
        )
        current_balance = deposit["amount"] + accrued_interest
        is_mature = is_deposit_mature(deposit["approved_at"])
        days_remaining = days_until_maturity(deposit["approved_at"])
    
    return DepositResponse(
        id=str(deposit["_id"]),
        user_id=deposit["user_id"],
        amount=deposit["amount"],
        proof_url=deposit["proof_url"],
        status=deposit["status"],
        submitted_at=deposit["submitted_at"],
        approved_at=deposit.get("approved_at"),
        maturity_date=deposit.get("maturity_date"),
        current_balance=current_balance,
        days_remaining=days_remaining,
        is_mature=is_mature,
        accrued_interest=accrued_interest
    )


@router.get("/balance", response_model=BalanceResponse)
async def get_balance(current_user: dict = Depends(get_current_active_user)):
    """
    Get current balance with accrued interest.
    """
    db = get_database()
    user_id = str(current_user["_id"])
    
    deposit = await db.deposits.find_one({
        "user_id": user_id,
        "status": "approved"
    })
    
    if not deposit:
        return BalanceResponse(
            principal=0.0,
            accrued_interest=0.0,
            total_balance=0.0,
            has_active_deposit=False
        )
    
    accrued_interest = calculate_accrued_interest(
        deposit["amount"],
        deposit["interest_rate"],
        deposit["approved_at"]
    )
    
    return BalanceResponse(
        principal=deposit["amount"],
        accrued_interest=accrued_interest,
        total_balance=deposit["amount"] + accrued_interest,
        has_active_deposit=True
    )


@router.post("/withdraw")
async def withdraw_funds(withdraw_req: WithdrawRequest, current_user: dict = Depends(get_current_active_user)):
    """
    Request withdrawal (only available after 90 days).
    User can withdraw interest only or full amount (principal + interest).
    """
    db = get_database()
    user_id = str(current_user["_id"])
    
    # Find approved deposit
    deposit = await db.deposits.find_one({
        "user_id": user_id,
        "status": "approved"
    })
    
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active deposit found"
        )
    
    # Check if deposit has matured
    if not is_deposit_mature(deposit["approved_at"]):
        days_left = days_until_maturity(deposit["approved_at"])
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Withdrawal not available yet. {days_left} days remaining until maturity."
        )
    
    # Calculate accrued interest
    accrued_interest = calculate_accrued_interest(
        deposit["amount"],
        deposit["interest_rate"],
        deposit["approved_at"]
    )
    
    withdrawal_amount = 0.0
    description = ""
    
    if withdraw_req.withdraw_type == "interest":
        # Withdraw interest only
        withdrawal_amount = accrued_interest
        description = f"Interest withdrawal: ${accrued_interest:.2f}"
        
        # Keep deposit active but reset the approval date for new interest accrual
        await db.deposits.update_one(
            {"_id": deposit["_id"]},
            {
                "$set": {
                    "approved_at": datetime.utcnow(),
                    "maturity_date": calculate_maturity_date(datetime.utcnow())
                }
            }
        )
        
    elif withdraw_req.withdraw_type == "full":
        # Withdraw principal + interest (close deposit)
        withdrawal_amount = deposit["amount"] + accrued_interest
        description = f"Full withdrawal: Principal ${deposit['amount']:.2f} + Interest ${accrued_interest:.2f}"
        
        # Mark deposit as completed/withdrawn
        await db.deposits.update_one(
            {"_id": deposit["_id"]},
            {"$set": {"status": "withdrawn"}}
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid withdrawal type. Use 'interest' or 'full'."
        )
    
    # Create transaction record
    transaction = {
        "user_id": user_id,
        "deposit_id": str(deposit["_id"]),
        "type": "withdrawal",
        "amount": withdrawal_amount,
        "balance_after": 0.0 if withdraw_req.withdraw_type == "full" else deposit["amount"],
        "timestamp": datetime.utcnow(),
        "description": description
    }
    await db.transactions.insert_one(transaction)
    
    return {
        "message": "Withdrawal successful",
        "amount": withdrawal_amount,
        "type": withdraw_req.withdraw_type,
        "description": description
    }


@router.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(current_user: dict = Depends(get_current_active_user)):
    """
    Get transaction history for the current user.
    """
    db = get_database()
    user_id = str(current_user["_id"])
    
    transactions = []
    async for txn in db.transactions.find({"user_id": user_id}).sort("timestamp", -1):
        transactions.append(TransactionResponse(
            id=str(txn["_id"]),
            user_id=txn["user_id"],
            deposit_id=txn.get("deposit_id"),
            type=txn["type"],
            amount=txn["amount"],
            balance_after=txn["balance_after"],
            timestamp=txn["timestamp"],
            description=txn["description"]
        ))
    
    return transactions
