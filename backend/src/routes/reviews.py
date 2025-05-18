from flask import request, jsonify
from src.database.database import get_db
from src.database.crud import (
    create_review,
    get_reviews,
    get_review
)
from src.auth import auth_required
from src.database.schemas import validate_reviews

def reviews_routes(app):
    pass