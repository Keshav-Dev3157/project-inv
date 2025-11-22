from fastapi import APIRouter, HTTPException, status, Depends
from database import get_database
from utils.auth import get_current_admin_user, get_password_hash
from models.user import UserCreate, UserResponse
from models.deposit import DepositResponse
from bson import ObjectId
from datetime import datetime
from utils.interest import calculate_accrued_interest, is_deposit_mature, days_until_maturity

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate, current_admin: dict = Depends(get_current_admin_user)):
    """
    Create a new user account (admin only).
    """
    db = get_database()
    
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    existing_email = await db.users.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create user document
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "role": user_data.role,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    return UserResponse(
        id=str(user_doc["_id"]),
        username=user_doc["username"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc["created_at"],
        is_active=user_doc["is_active"]
    )


@router.get("/users", response_model=list[UserResponse])
async def list_users(current_admin: dict = Depends(get_current_admin_user)):
    """
    Get list of all users (admin only).
    """
    db = get_database()
    users = []
    
    async for user in db.users.find({"role": "user"}):
        users.append(UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            role=user["role"],
            created_at=user["created_at"],
            is_active=user["is_active"]
        ))
    
    return users


@router.get("/deposits/pending", response_model=list[DepositResponse])
async def get_pending_deposits(current_admin: dict = Depends(get_current_admin_user)):
    """
    Get all pending deposit requests (admin only).
    """
    db = get_database()
    deposits = []
    
    async for deposit in db.deposits.find({"status": "pending"}):
        # Get user info
        user = await db.users.find_one({"_id": ObjectId(deposit["user_id"])})
        
        deposits.append(DepositResponse(
            id=str(deposit["_id"]),
            user_id=deposit["user_id"],
            amount=deposit["amount"],
            proof_url=deposit["proof_url"],
            status=deposit["status"],
            submitted_at=deposit["submitted_at"],
            approved_at=deposit.get("approved_at"),
            maturity_date=deposit.get("maturity_date"),
            current_balance=deposit["amount"],
            days_remaining=None,
            is_mature=False,
            accrued_interest=0.0
        ))
    
    return deposits


@router.post("/deposits/{deposit_id}/approve")
async def approve_deposit(deposit_id: str, current_admin: dict = Depends(get_current_admin_user)):
    """
    Approve a deposit request (admin only).
    """
    db = get_database()
    
    # Find deposit
    deposit = await db.deposits.find_one({"_id": ObjectId(deposit_id)})
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )
    
    if deposit["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit is not in pending status"
        )
    
    # Update deposit
    approved_at = datetime.utcnow()
    from utils.interest import calculate_maturity_date
    maturity_date = calculate_maturity_date(approved_at)
    
    await db.deposits.update_one(
        {"_id": ObjectId(deposit_id)},
        {
            "$set": {
                "status": "approved",
                "approved_at": approved_at,
                "approved_by": str(current_admin["_id"]),
                "maturity_date": maturity_date,
                "current_balance": deposit["amount"]
            }
        }
    )
    
    # Create transaction record
    transaction = {
        "user_id": deposit["user_id"],
        "deposit_id": deposit_id,
        "type": "deposit",
        "amount": deposit["amount"],
        "balance_after": deposit["amount"],
        "timestamp": approved_at,
        "description": f"Deposit approved - Principal: ${deposit['amount']}"
    }
    await db.transactions.insert_one(transaction)
    
    return {"message": "Deposit approved successfully", "maturity_date": maturity_date}


@router.post("/deposits/{deposit_id}/reject")
async def reject_deposit(deposit_id: str, current_admin: dict = Depends(get_current_admin_user)):
    """
    Reject a deposit request (admin only).
    """
    db = get_database()
    
    # Find deposit
    deposit = await db.deposits.find_one({"_id": ObjectId(deposit_id)})
    if not deposit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deposit not found"
        )
    
    if deposit["status"] != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deposit is not in pending status"
        )
    
    # Update deposit
    await db.deposits.update_one(
        {"_id": ObjectId(deposit_id)},
        {
            "$set": {
                "status": "rejected",
                "approved_by": str(current_admin["_id"])
            }
        }
    )
    
    return {"message": "Deposit rejected successfully"}


@router.get("/deposits", response_model=list[DepositResponse])
async def get_all_deposits(current_admin: dict = Depends(get_current_admin_user)):
    """
    Get all deposits with filters (admin only).
    """
    db = get_database()
    deposits = []
    
    async for deposit in db.deposits.find().sort("submitted_at", -1):
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
        
        deposits.append(DepositResponse(
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
        ))
    
    return deposits
