from app.core.database import get_db
from app.manager.blog.usecase import blog_usecase
from app.manager.category.usecase import category_usecase


def seed_demo_data():
    db = get_db()
    # Drop unneeded collections to keep DB clean
    collections_to_drop = [
        "service_cards",
        "pain_points",
        "strengths",
        "seo_metrics",
        "seo_packages",
        "seo_roadmap",
        "design_phases",
        "design_highlights",
        "ads_metrics",
        "ads_channels",
        "training_modules",
        "syllabus"
    ]
    for coll in collections_to_drop:
        db[coll].drop()

    blog_usecase.seed_default_posts()
    category_usecase.seed_default_categories()
