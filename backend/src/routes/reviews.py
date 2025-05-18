from flask import request, jsonify
from backend.src.database.database import get_db
from backend.src.database.crud import (
    create_review,
    get_reviews,
    get_review
)
from backend.src.auth import auth_required
from backend.src.database.schemas import validate_reviews

def reviews_routes(app):
    pass