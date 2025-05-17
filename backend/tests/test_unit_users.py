import pytest
import json
import base64
from flask import Flask
from backend.src.database.models import User
from backend.src.init_routes import init_routes
from unittest.mock import MagicMock


@pytest.fixture
def app():
    app = Flask(__name__)
    init_routes(app)
    app.config["TESTING"] = True
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def db_session(mocker):
    session = mocker.MagicMock()
    session.add = mocker.MagicMock()
    session.commit = mocker.MagicMock()
    session.refresh = mocker.MagicMock()
    return session

@pytest.fixture
def mock_get_db_session(mocker, db_session):
    mocker.patch("backend.src.database.database.get_db", return_value=db_session)


def test_auth(client, mocker):
    user_data = {
        "username": "Billy Herrington",
        "password": "secret123",
        "email": "billy@example.com"
    }

    mock_user = MagicMock(spec=User)
    mock_user.id = 1
    mock_user.username = user_data["username"]
    mock_user.email = user_data["email"]

    mocker.patch(
        "backend.src.database.crud.create_user",
        return_value=mock_user
    )
    mocker.patch(
        "backend.src.auth_utils.hash_password",
        return_value="hashed_password"
    )

    # Отправляем запрос
    response = client.post(
        '/register',
        json=user_data,
    )
    print(response.json)
    assert response.status_code == 201
    assert response.json["id"] == 1
    assert response.json["username"] == "Billy Herrington"