from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.manager.router import api_router
from app.config import settings
from app.core.vector_store import init_vector_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.upload_path

    try:
        init_vector_store()
    except Exception as e:
        print(f"Warning: Vector store init failed: {e}")
        print("RAG chat will not work until the configured API key is set and MongoDB is running.")

    try:
        from app.manager.auth.usecase import auth_usecase
        auth_usecase.init_default_users()
        from app.helpers.seed import seed_demo_data
        seed_demo_data()
    except Exception as e:
        print(f"Error initializing database: {e}")
        print("Please ensure the 'mongodb' service is running via docker-compose.")

    print("Backend RAG Chatbot has started successfully.")
    print(f"   Provider: {settings.LLM_PROVIDER}")
    print(f"   LLM: {settings.LLM_MODEL}")
    print(f"   Embedding: {settings.EMBEDDING_MODEL}")
    print(f"   App MongoDB: {settings.APP_MONGODB_URI}")
    print(f"   Vector MongoDB: {settings.VECTOR_MONGODB_URI}")
    print(f"   Upload dir: {settings.UPLOAD_DIR}")
    yield
    print("Backend is shutting down...")


from app.helpers.rate_limit import limiter

app = FastAPI(
    title="Nova Business RAG Chatbot API",
    description="Backend API for service consulting chatbot using RAG with MongoDB Vector Search",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "running",
        "service": "Nova Business RAG Chatbot",
        "database": "MongoDB Vector Search",
        "version": "1.0.0",
    }
