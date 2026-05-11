from typing import AsyncGenerator
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import BaseMessage

from app.config import settings
from app.core.vector_store import get_vector_store

SOURCES_MARKER = "__SOURCES__:"

SYSTEM_PROMPT = """Bạn là trợ lý tư vấn AI của Nova Digital Marketing Agency.
Hãy trả lời dựa trên tài liệu được cung cấp.
Nếu không tìm thấy thông tin trong tài liệu, hãy nói rõ là chưa tìm thấy dữ liệu phù hợp trong kho tri thức.
Không bịa nguồn và không tự suy diễn ngoài tài liệu nếu câu hỏi cần thông tin cụ thể.

Tài liệu tham khảo:
{context}
"""


def _require_api_key(provider: str, api_key: str):
    if not api_key:
        raise ValueError(f"{provider} API key is required for RAG chat.")


def _get_llm():
    provider = settings.LLM_PROVIDER.lower()

    if provider == "openai":
        _require_api_key("OpenAI", settings.OPENAI_API_KEY)
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            api_key=settings.OPENAI_API_KEY,
            streaming=True,
        )

    if provider == "google":
        _require_api_key("Google", settings.GOOGLE_API_KEY)
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            streaming=True,
        )

    raise ValueError(f"Unsupported LLM_PROVIDER: {settings.LLM_PROVIDER}")


async def stream_rag_response(
    question: str,
    chat_history: list[BaseMessage],
) -> AsyncGenerator[str, None]:
    store = get_vector_store()
    docs = store.similarity_search(question, k=settings.RAG_TOP_K)

    context_parts = []
    sources = []
    for doc in docs:
        context_parts.append(doc.page_content)
        meta = doc.metadata
        source = {"filename": meta.get("filename", ""), "page": meta.get("page")}
        if source not in sources:
            sources.append(source)

    context = "\n\n---\n\n".join(context_parts) if context_parts else "Không tìm thấy tài liệu liên quan."

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder("chat_history"),
        ("human", "{question}"),
    ])

    llm = _get_llm()
    chain = prompt | llm

    async for chunk in chain.astream({
        "context": context,
        "chat_history": chat_history,
        "question": question,
    }):
        if hasattr(chunk, "content") and chunk.content:
            yield chunk.content

    if sources:
        yield f"{SOURCES_MARKER}{json.dumps(sources)}"
