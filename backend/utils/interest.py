from datetime import datetime, timedelta


def calculate_accrued_interest(principal: float, interest_rate: float, start_date: datetime) -> float:
    """
    Calculate accrued interest using simple interest formula.
    Interest = Principal × Rate × Time (in months)
    
    Args:
        principal: The principal amount
        interest_rate: Monthly interest rate (e.g., 0.04 for 4%)
        start_date: The date when interest started accruing
    
    Returns:
        The accrued interest amount
    """
    now = datetime.utcnow()
    days_elapsed = (now - start_date).days
    months_elapsed = days_elapsed / 30.0  # Approximate months
    
    # Simple interest: Principal × Rate × Time
    interest = principal * interest_rate * months_elapsed
    return round(interest, 2)


def calculate_current_balance(principal: float, interest_rate: float, start_date: datetime) -> float:
    """
    Calculate current balance (principal + accrued interest).
    
    Args:
        principal: The principal amount
        interest_rate: Monthly interest rate (e.g., 0.04 for 4%)
        start_date: The date when interest started accruing
    
    Returns:
        The current balance (principal + interest)
    """
    interest = calculate_accrued_interest(principal, interest_rate, start_date)
    return round(principal + interest, 2)


def is_deposit_mature(approval_date: datetime, maturity_days: int = 90) -> bool:
    """
    Check if a deposit has matured (reached the withdrawal date).
    
    Args:
        approval_date: The date when the deposit was approved
        maturity_days: Number of days until maturity (default: 90)
    
    Returns:
        True if the deposit has matured, False otherwise
    """
    if approval_date is None:
        return False
    
    maturity_date = approval_date + timedelta(days=maturity_days)
    return datetime.utcnow() >= maturity_date


def days_until_maturity(approval_date: datetime, maturity_days: int = 90) -> int:
    """
    Calculate the number of days remaining until maturity.
    
    Args:
        approval_date: The date when the deposit was approved
        maturity_days: Number of days until maturity (default: 90)
    
    Returns:
        Number of days remaining (0 if already mature, None if not approved)
    """
    if approval_date is None:
        return None
    
    maturity_date = approval_date + timedelta(days=maturity_days)
    days_remaining = (maturity_date - datetime.utcnow()).days
    return max(0, days_remaining)


def calculate_maturity_date(approval_date: datetime, maturity_days: int = 90) -> datetime:
    """
    Calculate the maturity date for a deposit.
    
    Args:
        approval_date: The date when the deposit was approved
        maturity_days: Number of days until maturity (default: 90)
    
    Returns:
        The maturity date
    """
    return approval_date + timedelta(days=maturity_days)
