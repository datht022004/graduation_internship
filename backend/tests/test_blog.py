"""Tests for blog module: interface, usecase."""

import pytest
from unittest.mock import patch, MagicMock
from pydantic import ValidationError

from app.manager.blog.interface import BlogPost, BlogPostCreate, BlogPostUpdate
from app.manager.blog.usecase import BlogUseCase


# ---------------------------------------------------------------------------
# Interface / Schema Tests
# ---------------------------------------------------------------------------

class TestBlogInterfaces:
    def test_blog_post_create_valid(self):
        post = BlogPostCreate(
            title="Test Title",
            category="SEO",
            readTime="5 min",
            excerpt="Short desc",
        )
        assert post.title == "Test Title"
        assert post.isFeatured is False

    def test_blog_post_create_empty_title_rejected(self):
        with pytest.raises(ValidationError):
            BlogPostCreate(title="", category="SEO", readTime="5 min", excerpt="Short")

    def test_blog_post_create_strips_whitespace(self):
        post = BlogPostCreate(
            title="  Padded Title  ",
            category="  SEO  ",
            readTime="5 min",
            excerpt="Short",
        )
        assert post.title == "Padded Title"
        assert post.category == "SEO"

    def test_blog_post_update_partial(self):
        update = BlogPostUpdate(title="New Title")
        dump = update.model_dump(exclude_none=True, exclude_unset=True)
        assert dump == {"title": "New Title"}

    def test_blog_post_update_all_none(self):
        update = BlogPostUpdate()
        dump = update.model_dump(exclude_none=True, exclude_unset=True)
        assert dump == {}

    def test_blog_post_response(self):
        post = BlogPost(
            id="p1",
            title="Title",
            category="SEO",
            readTime="5m",
            excerpt="Exc",
            createdAt="2026-01-01",
            updatedAt="2026-01-01",
        )
        assert post.id == "p1"


# ---------------------------------------------------------------------------
# UseCase Tests (mocked repository)
# ---------------------------------------------------------------------------

class TestBlogUseCase:
    @pytest.fixture
    def usecase(self):
        return BlogUseCase()

    @patch("app.manager.blog.usecase.blog_repository")
    def test_get_all_posts(self, mock_repo, usecase):
        mock_repo.get_all_posts.return_value = [
            {
                "id": "p1",
                "title": "Post 1",
                "category": "SEO",
                "readTime": "5m",
                "excerpt": "Exc",
                "createdAt": "2026-01-01",
                "updatedAt": "2026-01-01",
            },
        ]
        result = usecase.get_all_posts()
        assert len(result) == 1
        assert result[0].id == "p1"

    @patch("app.manager.blog.usecase.blog_repository")
    def test_create_post(self, mock_repo, usecase):
        payload = BlogPostCreate(
            title="New Post",
            category="Ads",
            readTime="3m",
            excerpt="New excerpt",
        )
        mock_repo.create_post.return_value = {
            "id": "abc12345",
            "title": "New Post",
            "category": "Ads",
            "readTime": "3m",
            "excerpt": "New excerpt",
            "content": "",
            "imageUrl": "",
            "author": "",
            "tags": "",
            "isFeatured": False,
            "createdAt": "2026-01-01T00:00:00Z",
            "updatedAt": "2026-01-01T00:00:00Z",
        }
        result = usecase.create_post(payload)
        assert result.title == "New Post"
        assert result.category == "Ads"
        mock_repo.create_post.assert_called_once()

    @patch("app.manager.blog.usecase.blog_repository")
    def test_update_post_found(self, mock_repo, usecase):
        existing = {
            "id": "p1",
            "title": "Old",
            "category": "SEO",
            "readTime": "5m",
            "excerpt": "Exc",
            "createdAt": "2026-01-01",
            "updatedAt": "2026-01-01",
        }
        mock_repo.get_post_by_id.return_value = existing
        mock_repo.update_post.return_value = {**existing, "title": "Updated"}

        payload = BlogPostUpdate(title="Updated")
        result = usecase.update_post("p1", payload)
        assert result is not None
        assert result.title == "Updated"

    @patch("app.manager.blog.usecase.blog_repository")
    def test_update_post_not_found(self, mock_repo, usecase):
        mock_repo.get_post_by_id.return_value = None
        payload = BlogPostUpdate(title="Updated")
        result = usecase.update_post("nonexistent", payload)
        assert result is None

    @patch("app.manager.blog.usecase.blog_repository")
    def test_delete_post_success(self, mock_repo, usecase):
        mock_repo.delete_post.return_value = True
        assert usecase.delete_post("p1") is True

    @patch("app.manager.blog.usecase.blog_repository")
    def test_delete_post_not_found(self, mock_repo, usecase):
        mock_repo.delete_post.return_value = False
        assert usecase.delete_post("xxx") is False

    @patch("app.manager.blog.usecase.blog_repository")
    def test_toggle_featured(self, mock_repo, usecase):
        existing = {
            "id": "p1",
            "title": "Post",
            "category": "SEO",
            "readTime": "5m",
            "excerpt": "Exc",
            "isFeatured": False,
            "createdAt": "2026-01-01",
            "updatedAt": "2026-01-01",
        }
        mock_repo.get_post_by_id.return_value = existing
        mock_repo.update_post.return_value = {**existing, "isFeatured": True}

        result = usecase.toggle_featured("p1")
        assert result is not None
        assert result.isFeatured is True

    @patch("app.manager.blog.usecase.blog_repository")
    def test_toggle_featured_not_found(self, mock_repo, usecase):
        mock_repo.get_post_by_id.return_value = None
        result = usecase.toggle_featured("xxx")
        assert result is None

    def test_clean_post_data(self, usecase):
        data = {"title": "  Spaces  ", "count": 5, "flag": True}
        cleaned = usecase._clean_post_data(data)
        assert cleaned["title"] == "Spaces"
        assert cleaned["count"] == 5
        assert cleaned["flag"] is True

    def test_now_returns_iso_string(self, usecase):
        result = usecase._now()
        assert isinstance(result, str)
        assert "T" in result  # ISO format
