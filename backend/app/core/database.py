from pymongo import MongoClient

from app.config import settings

_app_client = None
_app_db = None
_vector_client = None
_vector_db = None


def get_app_client() -> MongoClient:
    global _app_client
    if _app_client is None:
        _app_client = MongoClient(
            settings.APP_MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _app_client


def get_db():
    global _app_db
    if _app_db is None:
        _app_db = get_app_client()[settings.MONGODB_DB_NAME]
    return _app_db


def get_vector_client() -> MongoClient:
    global _vector_client
    if _vector_client is None:
        _vector_client = MongoClient(
            settings.VECTOR_MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
    return _vector_client


def get_vector_db():
    global _vector_db
    if _vector_db is None:
        _vector_db = get_vector_client()[settings.MONGODB_DB_NAME]
    return _vector_db
