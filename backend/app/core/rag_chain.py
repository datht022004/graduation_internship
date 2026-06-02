from typing import AsyncGenerator
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import BaseMessage

from app.config import settings
from app.core.vector_store import get_vector_store

SOURCES_MARKER = "__SOURCES__:"

SYSTEM_PROMPT = """Bạn là trợ lý tư vấn AI của SEOViP Digital Marketing Agency.
Nhiệm vụ của bạn là tư vấn như một nhân viên thật đang trò chuyện với khách hàng.

Nguyên tắc trả lời:
- Trả lời bằng tiếng Việt tự nhiên, thân thiện, xưng "mình" và gọi khách là "bạn".
- Đi thẳng vào ý chính trong 2-5 câu. Chỉ dùng bullet khi cần so sánh nhiều lựa chọn.
- Không mở đầu bằng các câu máy móc như "Dựa trên tài liệu cung cấp" hoặc "Theo ngữ cảnh".
- Không chép nguyên văn tài liệu. Hãy chọn đúng phần liên quan, diễn đạt lại ngắn gọn và dễ hiểu.
- Nếu câu hỏi về giá, hãy nêu khoảng giá/gói phù hợp nhất tìm được, giải thích ngắn yếu tố làm thay đổi giá, rồi hỏi thêm nhu cầu cụ thể để tư vấn sát hơn.
- Nếu thông tin chưa đủ rõ, hãy nói phần mình biết từ tài liệu và hỏi thêm 1 câu để làm rõ.
- Nếu không tìm thấy thông tin trong tài liệu, hãy nói nhẹ nhàng rằng mình chưa có dữ liệu chính xác trong hệ thống và đề nghị khách để lại yêu cầu để tư vấn viên kiểm tra.
- Không bịa số liệu, cam kết, nguồn hoặc chính sách ngoài tài liệu.

Tài liệu tham khảo:
{context}
"""


# Ensure LLM provider has configured API key before calling.
def _require_api_key(provider: str, api_key: str):
    if not api_key:
        raise ValueError(f"{provider} API key is required for RAG chat.")


# Initialize LLM based on configured provider.
def _get_llm():
    provider = settings.LLM_PROVIDER.lower()

    if provider == "openai":
        _require_api_key("OpenAI", settings.OPENAI_API_KEY)
        return ChatOpenAI(
            model=settings.LLM_MODEL,
            api_key=settings.OPENAI_API_KEY,
            temperature=0.45,
            streaming=True,
        )

    if provider == "google":
        _require_api_key("Google", settings.GOOGLE_API_KEY)
        return ChatGoogleGenerativeAI(
            model=settings.LLM_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.45,
            streaming=True,
        )

    raise ValueError(f"Unsupported LLM_PROVIDER: {settings.LLM_PROVIDER}")


# Stream RAG response based on relevant documents and chat history.
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
