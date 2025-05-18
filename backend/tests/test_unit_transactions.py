from flask import Flask
import json
import os
import pytest
from datetime import datetime, timezone
from src.database.models import User, Book,  Transaction
from unittest.mock import MagicMock
from src.init_routes import init_routes


os.environ["TESTING"] = "1"

@pytest.fixture
def mock_auth(mocker):
    """Фикстура для мокирования авторизации"""
    mock_user = MagicMock(spec=User)
    mock_user.id = 1
    mock_user.role = "user"

    return {"headers": {"Authorization": "Bearer test_jwt_token"}}


@pytest.fixture
def mock_admin(mocker):
    """Фикстура для мокирования прав админа"""
    mock_user = MagicMock(spec=User)
    mock_user.id = 1
    mock_user.role = "admin"

    return {"headers": {"Authorization": "Bearer admin_token"}}


@pytest.fixture
def app(mock_auth):
    app = Flask(__name__)
    init_routes(app)
    app.config.update({"TESTING": True})
    os.environ["TESTING"] = "1"
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


@pytest.fixture(autouse=True)
def mock_get_db_session(mocker, db_session):
    mocker.patch("backend.src.database.database.get_db", return_value=db_session)

@pytest.fixture
def mock_book():
    book = MagicMock(spec=Book)
    book.id = 1
    book.title = "Test Book"
    book.author = "Test Author"
    return book


@pytest.fixture
def mock_transaction():
    transaction = MagicMock(spec=Transaction)
    transaction.id = 1
    transaction.from_user_id = 1
    transaction.to_user_id = 2
    transaction.book_id = 1
    transaction.place = "Library"
    transaction.status = "pending"
    transaction.date = datetime(2023, 1, 1, tzinfo=timezone.utc)  # Используем реальный datetime

    # Добавляем mock-книгу
    mock_book = MagicMock()
    mock_book.id = 1
    mock_book.title = "Test Book"
    mock_book.author = "Test Author"
    transaction.book = mock_book

    return transaction
def test_create_transaction_success(client, mocker, mock_auth, mock_transaction):
    transaction_data = {
        "from_user_id": 1,
        "to_user_id": 2,
        "book_id": 1,
        "place": "Library"
    }

    mocker.patch(
        "backend.src.routes.transactions.create_transaction",
        return_value=mock_transaction
    )

    response = client.post(
        "/transactions",
        json=transaction_data,
        headers=mock_auth["headers"]
    )

    assert response.status_code == 201
    assert response.json["id"] == 1
    assert response.json["status"] == "created"

def test_get_transactions(client, mocker, mock_auth, mock_transaction):
    mocker.patch(
        "backend.src.routes.transactions.get_transactions",
        return_value=[mock_transaction]
    )

    mock_book = MagicMock()
    mock_book.title = "Test Book"
    mock_transaction.book = mock_book

    response = client.get(
        "/transactions",
        headers=mock_auth["headers"]
    )

    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["book_title"] == "Test Book"


def test_get_transaction_detail(client, mocker, mock_auth):
    """Тест получения деталей транзакции"""
    # Создаем мок-объекты с правильными атрибутами
    mock_transaction = MagicMock()
    mock_transaction.id = 1
    mock_transaction.date = datetime(2023, 1, 1, 0, 0, 0, tzinfo=timezone.utc)
    mock_transaction.from_user_id = 1
    mock_transaction.to_user_id = 2
    mock_transaction.book_id = 1
    mock_transaction.place = "Library"
    mock_transaction.status = "pending"

    mock_from_user = MagicMock()
    mock_from_user.id = 1
    mock_from_user.username = "user1"

    mock_to_user = MagicMock()
    mock_to_user.id = 2
    mock_to_user.username = "user2"

    mock_book = MagicMock()
    mock_book.id = 1
    mock_book.title = "Test Book"
    mock_book.author = "Test Author"

    mock_transaction.from_user = mock_from_user
    mock_transaction.to_user = mock_to_user
    mock_transaction.book = mock_book

    mocker.patch(
        "backend.src.routes.transactions.get_transaction",
        return_value=mock_transaction
    )

    # Делаем запрос
    response = client.get(
        "/transactions/1",
        headers=mock_auth["headers"]
    )
    assert response.status_code == 200
    data = response.json
    assert data["id"] == 1
    assert data["from_user"]["username"] == "user1"
    assert data["book"]["title"] == "Test Book"

def test_update_transaction(client, mocker, mock_auth, mock_transaction):
    update_data = {"place": "New Place", "status": "completed"}

    updated_transaction = MagicMock(spec=Transaction)
    updated_transaction.id = 1
    updated_transaction.place = "New Place"
    updated_transaction.status = "completed"

    mocker.patch(
        "backend.src.routes.transactions.update_transaction",
        return_value=updated_transaction
    )

    response = client.put(
        "/transactions/1",
        json=update_data,
        headers=mock_auth["headers"]
    )

    assert response.status_code == 200
    assert response.json["transaction"]["status"] == "completed"

def test_delete_transaction(client, mocker, mock_auth, mock_admin):
    mocker.patch(
        "backend.src.routes.transactions.delete_transaction",
        return_value=True
    )

    response = client.delete(
        "/transactions/1",
        headers=mock_admin["headers"]
    )
    assert response.status_code == 200
    assert response.json["status"] == "deleted"

def test_change_transaction_status(client, mocker, mock_auth, mock_transaction):
    status_data = {"status": "completed"}
    mock_transaction.status = "completed"

    mocker.patch(
        "backend.src.routes.transactions.update_transaction",
        return_value=mock_transaction
    )

    response = client.put(
        "/transactions/1/status",
        json=status_data,
        headers=mock_auth["headers"]
    )

    assert response.status_code == 200
    assert response.json["new_status"] == "completed"
