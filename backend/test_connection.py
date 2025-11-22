#!/usr/bin/env python3
"""
Test script to verify MongoDB connection and backend functionality
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_connection():
    print("=" * 60)
    print("Testing MongoDB Atlas Connection")
    print("=" * 60)
    
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "funds_management")
    
    print(f"\nMongoDB URI: {mongodb_uri[:50]}...")
    print(f"Database Name: {database_name}")
    
    try:
        # Create client with SSL
        client = AsyncIOMotorClient(
            mongodb_uri,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000
        )
        
        # Test connection
        print("\n✓ Connecting to MongoDB...")
        await client.admin.command('ping')
        print("✓ Successfully connected to MongoDB!")
        
        # Get database
        db = client[database_name]
        
        # Test database operations
        print(f"\n✓ Accessing database '{database_name}'...")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"✓ Collections: {collections if collections else '(none yet)'}")
        
        # Count users
        user_count = await db.users.count_documents({})
        print(f"✓ Users in database: {user_count}")
        
        if user_count > 0:
            # Find admin
            admin = await db.users.find_one({"role": "admin"})
            if admin:
                print(f"✓ Admin account found: {admin['username']}")
        
        # Close connection
        client.close()
        print("\n" + "=" * 60)
        print("✅ All tests passed! MongoDB is ready.")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n" + "=" * 60)
        print("❌ Connection test failed!")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = asyncio.run(test_connection())
    exit(0 if success else 1)
