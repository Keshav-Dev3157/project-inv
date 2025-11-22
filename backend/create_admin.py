#!/usr/bin/env python3
"""
Recreate admin account with Argon2 password hashing
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv
from argon2 import PasswordHasher
from datetime import datetime

# Load environment variables
load_dotenv()

ph = PasswordHasher()

async def recreate_admin():
    mongodb_uri = os.getenv("MONGODB_URI")
    database_name = os.getenv("DATABASE_NAME", "funds_management")
    admin_username = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
    admin_password = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    admin_email = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@fundsmanagement.com")
    
    print("=" * 60)
    print("Recreating Admin Account with Argon2")
    print("=" * 60)
    
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(mongodb_uri, tlsCAFile=certifi.where())
        db = client[database_name]
        
        # Delete old admin if exists
        result = await db.users.delete_many({"username": admin_username})
        if result.deleted_count > 0:
            print(f"\n✓ Deleted {result.deleted_count} old admin account(s)")
        
        # Hash password with Argon2
        password_hash = ph.hash(admin_password)
        print(f"✓ Password hashed with Argon2")
        
        # Create new admin
        admin_doc = {
            "username": admin_username,
            "email": admin_email,
            "password_hash": password_hash,
            "role": "admin",
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        result = await db.users.insert_one(admin_doc)
        print(f"\n✅ Admin account created successfully!")
        print(f"   Username: {admin_username}")
        print(f"   Password: {admin_password}")
        print(f"   ID: {result.inserted_id}")
        print(f"   Hash type: Argon2")
        
        client.close()
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(recreate_admin())
