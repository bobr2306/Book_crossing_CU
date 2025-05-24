from flask import request, jsonify
from src.database.crud import create_user, get_user_by_name
from src.database.database import get_db
from src.auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from src.database import schemas
from datetime import timedelta
from src.database.models import User


def users_routes(app):
    @app.route("/register", methods=["POST"])
    def register():
        db = get_db()
        data = request.get_json() or {}
        username = data.get("username")
        role = "user"
        hashed_password = hash_password(data["password"])

        user_data = {
            "username": username,
            "role": role,
            "password": hashed_password
        }
        data = schemas.validate_user(user_data)
        create_user(db, data)

        return jsonify({"message": "Пользователь зарегистрирован", "username": username}), 201

    @app.route("/login", methods=["POST"])
    def login():
        data = request.get_json()
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'error': 'Username and password required'}), 400
        db = get_db()
        user = get_user_by_name(db, data["username"])
        print("Пароль из базы:", user.password)
        if not user or not verify_password(data['password'], user.password):
            return jsonify({'error': 'Invalid credentials'}), 401

        access_token = create_access_token(
            data={"sub": str(user.id)},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return jsonify({
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "role": user.role
        })
