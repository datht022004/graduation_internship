import pytest
from unittest.mock import MagicMock, patch
from langchain_core.documents import Document as LangChainDocument
from app.manager.document.usecase import DocumentUseCase


@pytest.fixture
def usecase():
    return DocumentUseCase()


@pytest.mark.asyncio
@patch("app.manager.document.usecase.add_documents_to_store")
@patch("app.manager.document.usecase.document_repository")
@patch("app.manager.document.usecase.open")
async def test_upload_and_index_document_metadata_filtering(mock_open, mock_repo, mock_add_to_store, usecase):
    # 1. Setup mock raw documents returned by the loader
    mock_raw_docs = [
        LangChainDocument(
            page_content="This is section 1 of the PDF document.",
            metadata={
                "producer": "Adobe PDF Library",
                "creator": "InDesign",
                "creationdate": "2026-06-02T00:00:00",
                "title": "Nova Marketing Guide",
                "author": "SEOViP Editor",
                "page": 0,
            }
        ),
        LangChainDocument(
            page_content="This is section 2 of the PDF document.",
            metadata={
                "producer": "Adobe PDF Library",
                "creator": "InDesign",
                "creationdate": "2026-06-02T00:00:00",
                "title": "Nova Marketing Guide",
                "author": "SEOViP Editor",
                "page": 1,
            }
        )
    ]

    # 2. Mock loader and _get_loader
    mock_loader = MagicMock()
    mock_loader.load.return_value = mock_raw_docs
    
    # 3. Patch _get_loader, _detect_file_type, and file path writing
    with patch.object(usecase, "_get_loader", return_value=mock_loader) as mock_get_loader, \
         patch.object(usecase, "_detect_file_type", return_value="pdf") as mock_detect_file_type:
         
        # Execute the function
        file_content = b"fake pdf file content"
        filename = "test_document.pdf"
        
        doc_info = await usecase.upload_and_index_document(file_content, filename)
        
        # Verify document repository insert was called
        mock_repo.add_document.assert_called_once()
        
        # Verify add_documents_to_store was called
        mock_add_to_store.assert_called_once()
        
        # Retrieve the chunks sent to add_documents_to_store
        indexed_chunks = mock_add_to_store.call_args[0][0]
        
        assert len(indexed_chunks) > 0
        
        # Assert that the metadata in each chunk only contains the whitelisted fields
        for chunk in indexed_chunks:
            meta = chunk.metadata
            
            # Whitelisted fields
            assert "doc_id" in meta
            assert meta["filename"] == filename
            assert meta["file_type"] == "pdf"
            assert "page" in meta
            
            # Discarded fields must NOT be present
            assert "producer" not in meta
            assert "creator" not in meta
            assert "creationdate" not in meta
            assert "title" not in meta
            assert "author" not in meta
