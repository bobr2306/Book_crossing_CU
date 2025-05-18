import pytest
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
        "password": "secret123"
    }

    mock_user = MagicMock(spec=User)
    mock_user.id = 1
    mock_user.username = user_data["username"]

    mocker.patch(
        "backend.src.routes.users.create_user",
        return_value=mock_user
    )
    mocker.patch(
        "backend.src.auth_utils.hash_password",
        return_value="hashed_password"
    )

    response = client.post(
        '/register',
        json=user_data,
    )
    assert response.status_code == 201
    assert response.json["username"] == "Billy Herrington"


def test_login_success(client, mocker):
    login_data = {
        "username": "test_user",
        "password": "correct_password"
    }

    mock_user = MagicMock(spec=User)
    mock_user.id = 1
    mock_user.username = "test_user"
    mock_user.password = "hashed_password"
    mock_user.role = "user"

    mocker.patch(
        "backend.src.routes.users.get_user_by_name",
        return_value=mock_user
    )

    mocker.patch(
        "backend.src.routes.users.verify_password",
        return_value=True
    )

    mocker.patch(
        "backend.src.routes.users.create_access_token",
        return_value="test_jwt_token"
    )

    response = client.post(
        '/login',
        json=login_data
    )
    assert response.status_code == 200
    assert response.json == {
        "access_token": "test_jwt_token",
        "token_type": "bearer",
        "user_id": 1,
        "role": "user"
    }
