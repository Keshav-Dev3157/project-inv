from motor.motor_asyncio import AsyncIOMotorClient
from config import settings
import certifi

client = None
database = None


async def connect_to_mongo():
    global client, database
    client = AsyncIOMotorClient(
        settings.mongodb_uri,
        tlsCAFile=certifi.where()
    )
    database = client[settings.database_name]
    print(f"Connected to MongoDB at {settings.mongodb_uri[:50]}...")


async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")


def get_database():
    return database

