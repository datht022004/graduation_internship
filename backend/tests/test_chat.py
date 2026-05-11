import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.manager.chat.usecase import ChatUseCase, _get_quick_answer
from app.core.rag_chain import SOURCES_MARKER
from langchain_core.messages import AIMessage, HumanMessage

@pytest.fixture
def usecase():
    return ChatUseCase()

def test_get_quick_answer():
    # Test typical quick greetings
    assert "Xin chào" in _get_quick_answer("hi")
    assert "Xin chào" in _get_quick_answer("hello")
    assert "Xin chào" in _get_quick_answer("XIN CHÀO!!!")
    assert "Xin chào" in _get_quick_answer("alo")
    
    # Test non-greeting
    assert _get_quick_answer("Dịch vụ SEO là gì?") is None

@patch("app.manager.chat.usecase.chat_repository")
def test_get_or_create_session(mock_repo, usecase):
    # Test without session_id
    session_id = usecase.get_or_create_session(None, "user@example.com")
    assert session_id is not None
    mock_repo.init_session.assert_called_with(session_id, "user@example.com")

    # Test with existing session_id
    existing_id = "test-123"
    result_id = usecase.get_or_create_session(existing_id, "user@example.com")
    assert result_id == existing_id
    mock_repo.init_session.assert_called_with(existing_id, "user@example.com")

@pytest.mark.asyncio
@patch("app.manager.chat.usecase.stream_rag_response")
@patch("app.manager.chat.usecase.chat_repository")
async def test_stream_chat_quick_answer(mock_repo, mock_stream, usecase):
    session_id = "test-session"
    user_email = "test@user.com"
    question = "hello"
    
    # Mock context history
    mock_repo.get_session_history.return_value = []
    
    # Get generator
    gen = usecase.stream_chat(question, session_id, user_email)
    
    # Should yield quick answer
    chunks = [chunk async for chunk in gen]
    assert len(chunks) == 1
    assert "Xin chào" in chunks[0]
    
    # Should not call stream_rag_response
    mock_stream.assert_not_called()
    
    # Should save history
    mock_repo.save_session_history.assert_called_once()
    saved_history = mock_repo.save_session_history.call_args[0][1]
    assert len(saved_history) == 2
    assert isinstance(saved_history[0], HumanMessage)
    assert isinstance(saved_history[1], AIMessage)

@pytest.mark.asyncio
@patch("app.manager.chat.usecase.stream_rag_response")
@patch("app.manager.chat.usecase.chat_repository")
async def test_stream_chat_rag_response(mock_repo, mock_stream, usecase):
    session_id = "test-session"
    user_email = "test@user.com"
    question = "SEO là gì?"
    
    mock_repo.get_session_history.return_value = []
    
    # Mock RAG response chunks
    async def mock_generator():
        yield "SEO "
        yield "là "
        yield "tối ưu "
        yield f"{SOURCES_MARKER}[{{'filename': 'seo.pdf'}}]"
        
    mock_stream.return_value = mock_generator()
    
    gen = usecase.stream_chat(question, session_id, user_email)
    chunks = [chunk async for chunk in gen]
    
    assert len(chunks) == 4
    assert chunks[0] == "SEO "
    assert chunks[1] == "là "
    assert chunks[2] == "tối ưu "
    assert chunks[3].startswith(SOURCES_MARKER)
    
    # Verify history is saved correctly with concatenated answer
    mock_repo.save_session_history.assert_called_once()
    saved_history = mock_repo.save_session_history.call_args[0][1]
    assert len(saved_history) == 2
    assert saved_history[0].content == question
    assert saved_history[1].content == "SEO là tối ưu " # SOURCES_MARKER is not saved in text history
