class UserUseCase:
    def get_home(self):
        return {
            "serviceCards": [],
            "painPoints": [],
            "strengths": [],
        }

    def get_seo_service(self):
        return {
            "metrics": [],
            "packages": [],
            "roadmap": [],
        }

    def get_web_design(self):
        return {
            "phases": [],
            "highlights": [],
        }

    def get_ads(self):
        return {
            "metrics": [],
            "channels": [],
        }

    def get_blog(self):
        from app.manager.blog.usecase import blog_usecase

        return blog_usecase.get_public_posts()


user_usecase = UserUseCase()
