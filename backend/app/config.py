from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    LLM_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536
    LLM_MODEL: str = "gpt-4.1-mini"
    RAG_TOP_K: int = 4
    VECTOR_INDEX_NAME: str = "vector_index"

    APP_MONGODB_URI: str = "mongodb://mongodb:27017/?directConnection=true"
    VECTOR_MONGODB_URI: str = "mongodb://mongodb-vector:27017/?directConnection=true"
    MONGODB_DB_NAME: str = "rag_chatbot"

    UPLOAD_DIR: str = "./data/documents"

    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    ADMIN_EMAIL: str = "admin@gmail.com"
    ADMIN_PASSWORD: str = "123123"
    USER_EMAIL: str = "user@gmail.com"
    USER_PASSWORD: str = "123123"

    SECRET_KEY: str = "change-this-to-a-random-secret-key-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    GOOGLE_OAUTH_CLIENT_ID: str = ""

    MAX_FILE_SIZE_MB: int = 100

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024

    @property
    def upload_path(self) -> Path:
        path = Path(self.UPLOAD_DIR)
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
