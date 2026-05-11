from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from pymongo.operations import SearchIndexModel

from app.config import settings
from app.core.database import get_vector_db

VECTOR_COLLECTION = "document_vectors"

_vector_store = None


def ensure_vector_search_index(collection):
    existing_indexes = list(collection.list_search_indexes())
    for index in existing_indexes:
        if index.get("name") == settings.VECTOR_INDEX_NAME:
            return

    index_model = SearchIndexModel(
        name=settings.VECTOR_INDEX_NAME,
        type="vectorSearch",
        definition={
            "fields": [
                {
                    "type": "vector",
                    "path": "embedding",
                    "numDimensions": settings.EMBEDDING_DIMENSIONS,
                    "similarity": "cosine",
                },
                {"type": "filter", "path": "doc_id"},
                {"type": "filter", "path": "filename"},
                {"type": "filter", "path": "file_type"},
            ]
        },
    )
    collection.create_search_index(model=index_model)


def get_embeddings():
    provider = settings.LLM_PROVIDER.lower()

    if provider == "openai":
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required for OpenAI embeddings.")

        kwargs = {
            "model": settings.EMBEDDING_MODEL,
            "api_key": settings.OPENAI_API_KEY,
        }
        if settings.EMBEDDING_MODEL.startswith("text-embedding-3"):
            kwargs["dimensions"] = settings.EMBEDDING_DIMENSIONS

        return OpenAIEmbeddings(**kwargs)

    if provider == "google":
        if not settings.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is required for Google embeddings.")

        return GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
        )

    raise ValueError(f"Unsupported LLM_PROVIDER: {settings.LLM_PROVIDER}")


def init_vector_store():
    global _vector_store
    collection = get_vector_db()[VECTOR_COLLECTION]
    ensure_vector_search_index(collection)
    _vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=get_embeddings(),
        index_name=settings.VECTOR_INDEX_NAME,
    )
    return _vector_store


def get_vector_store() -> MongoDBAtlasVectorSearch:
    global _vector_store
    if _vector_store is None:
        return init_vector_store()
    return _vector_store


def add_documents_to_store(chunks):
    store = get_vector_store()
    store.add_documents(chunks)


def delete_documents_from_store(doc_id: str):
    collection = get_vector_db()[VECTOR_COLLECTION]
    collection.delete_many(
        {
            "$or": [
                {"doc_id": doc_id},
                {"metadata.doc_id": doc_id},
            ],
        }
    )
