"""Tests for all Pydantic document models."""

import pytest
from datetime import datetime, timezone
from pydantic import ValidationError

from app.models import (
    BlogPostDocument,
    CategoryDocument,
    ChatSessionDocument,
    DocumentDocument,
    MongoDocument,
    UserDocument,
    VectorDocument,
)


# ---------------------------------------------------------------------------
# MongoDocument (base)
# ---------------------------------------------------------------------------

class TestMongoDocument:
    def test_default_mongo_id_is_none(self):
        doc = MongoDocument()
        assert doc.mongo_id is None

    def test_accepts_alias_id(self):
        doc = MongoDocument.model_validate({"_id": "abc123"})
        assert doc.mongo_id == "abc123"

    def test_strips_whitespace(self):
        """model_config has str_strip_whitespace=True."""
        doc = MongoDocument.model_validate({"_id": "  spaces  "})
        assert doc.mongo_id == "spaces"

    def test_forbids_extra_fields(self):
        with pytest.raises(ValidationError):
            MongoDocument.model_validate({"_id": "ok", "unexpected": True})


# ---------------------------------------------------------------------------
# UserDocument
# ---------------------------------------------------------------------------

class TestUserDocument:
    @pytest.fixture
    def valid_user(self):
        return UserDocument(
            email="test@example.com",
            name="Test User",
            role="user",
            created_at=datetime.now(timezone.utc),
        )

    def test_create_valid_user(self, valid_user):
        assert valid_user.email == "test@example.com"
        assert valid_user.role == "user"
        assert valid_user.password is None
        assert valid_user.auth_providers == []
        assert valid_user.google_id is None

    def test_user_with_password(self):
        user = UserDocument(
            email="admin@test.com",
            name="Admin",
            role="admin",
            password="hashed_pw",
            auth_providers=["password"],
            created_at=datetime.now(timezone.utc),
        )
        assert user.password == "hashed_pw"
        assert "password" in user.auth_providers

    def test_user_with_google(self):
        user = UserDocument(
            email="g@test.com",
            name="Google User",
            role="user",
            google_id="google-sub-id",
            auth_providers=["google"],
            created_at=datetime.now(timezone.utc),
        )
        assert user.google_id == "google-sub-id"

    def test_user_serialization_by_alias(self, valid_user):
        data = valid_user.model_dump(by_alias=True, exclude_none=True)
        assert "_id" not in data  # mongo_id is None → excluded
        assert "email" in data

    def test_user_missing_required_fields(self):
        with pytest.raises(ValidationError):
            UserDocument(email="test@test.com")  # missing name, role, created_at


# ---------------------------------------------------------------------------
# BlogPostDocument
# ---------------------------------------------------------------------------

class TestBlogPostDocument:
    @pytest.fixture
    def valid_post(self):
        return BlogPostDocument(
            id="post001",
            title="Test Blog Post",
            category="SEO Foundation",
            readTime="5 phút đọc",
            excerpt="A short excerpt.",
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-01T00:00:00Z",
        )

    def test_create_valid_post(self, valid_post):
        assert valid_post.id == "post001"
        assert valid_post.title == "Test Blog Post"
        assert valid_post.isFeatured is False
        assert valid_post.content == ""
        assert valid_post.imageUrl == ""

    def test_post_defaults(self, valid_post):
        assert valid_post.author == ""
        assert valid_post.tags == ""

    def test_post_with_all_fields(self):
        post = BlogPostDocument(
            id="post002",
            title="Full Post",
            category="Ads",
            readTime="10 phút đọc",
            excerpt="Excerpt here",
            content="<h2>Heading</h2><p>Body</p>",
            imageUrl="https://example.com/img.jpg",
            author="Author Name",
            tags="tag1, tag2",
            isFeatured=True,
            createdAt="2026-01-01T00:00:00Z",
            updatedAt="2026-01-02T00:00:00Z",
        )
        assert post.isFeatured is True
        assert post.tags == "tag1, tag2"

    def test_post_missing_required_fields(self):
        with pytest.raises(ValidationError):
            BlogPostDocument(id="p1", title="T")  # missing category, readTime, excerpt, timestamps


# ---------------------------------------------------------------------------
# CategoryDocument
# ---------------------------------------------------------------------------

class TestCategoryDocument:
    def test_create_with_defaults(self):
        cat = CategoryDocument(id="cat1", name="SEO", slug="seo")
        assert cat.name == "SEO"
        assert cat.slug == "seo"
        assert cat.description == ""
        assert cat.created_at is not None
        assert cat.updated_at is not None
        assert cat.created_at.tzinfo is not None  # must be timezone-aware

    def test_create_with_explicit_times(self):
        now = datetime.now(timezone.utc)
        cat = CategoryDocument(
            id="cat2",
            name="Ads",
            slug="ads",
            description="Quảng cáo",
            created_at=now,
            updated_at=now,
        )
        assert cat.description == "Quảng cáo"
        assert cat.created_at == now

    def test_serialization(self):
        cat = CategoryDocument(id="cat3", name="Web Design", slug="web-design")
        data = cat.model_dump(by_alias=True, exclude_none=True)
        assert "name" in data
        assert "slug" in data
        assert "id" in data

    def test_missing_required_fields(self):
        with pytest.raises(ValidationError):
            CategoryDocument(id="c1", name="Test")  # missing slug


# ---------------------------------------------------------------------------
# ChatSessionDocument
# ---------------------------------------------------------------------------

class TestChatSessionDocument:
    def test_create_session(self):
        now = datetime.now(timezone.utc)
        session = ChatSessionDocument(
            session_id="sess-001",
            user_email="user@test.com",
            title="Test Session",
            history=[],
            created_at=now,
            updated_at=now,
        )
        assert session.session_id == "sess-001"
        assert session.user_email == "user@test.com"
        assert session.history == []

    def test_session_defaults(self):
        now = datetime.now(timezone.utc)
        session = ChatSessionDocument(
            session_id="sess-002",
            created_at=now,
            updated_at=now,
        )
        assert session.user_email is None
        assert session.title == ""
        assert session.history == []

    def test_session_with_history(self):
        now = datetime.now(timezone.utc)
        history = [
            {"type": "human", "data": {"content": "Hello"}},
            {"type": "ai", "data": {"content": "Hi there!"}},
        ]
        session = ChatSessionDocument(
            session_id="sess-003",
            history=history,
            created_at=now,
            updated_at=now,
        )
        assert len(session.history) == 2


# ---------------------------------------------------------------------------
# DocumentDocument
# ---------------------------------------------------------------------------

class TestDocumentDocument:
    def test_create_document(self):
        doc = DocumentDocument(
            id="doc001",
            filename="report.pdf",
            file_type="pdf",
            file_size=1024000,
            chunk_count=15,
            uploaded_at="2026-01-01T00:00:00Z",
        )
        assert doc.filename == "report.pdf"
        assert doc.file_size == 1024000
        assert doc.chunk_count == 15

    def test_missing_required_fields(self):
        with pytest.raises(ValidationError):
            DocumentDocument(id="d1", filename="test.pdf")  # missing file_type, file_size, etc.


# ---------------------------------------------------------------------------
# VectorDocument
# ---------------------------------------------------------------------------

class TestVectorDocument:
    def test_create_vector_doc(self):
        vec = VectorDocument(
            embedding=[0.1, 0.2, 0.3],
            doc_id="doc001",
            filename="report.pdf",
            file_type="pdf",
            text="Sample text content",
        )
        assert vec.embedding == [0.1, 0.2, 0.3]
        assert vec.doc_id == "doc001"

    def test_vector_doc_defaults(self):
        vec = VectorDocument()
        assert vec.embedding is None
        assert vec.doc_id is None

    def test_vector_doc_allows_extra(self):
        """VectorDocument has extra='allow' for flexible schema."""
        vec = VectorDocument(custom_field="extra_value")
        assert vec.custom_field == "extra_value"
