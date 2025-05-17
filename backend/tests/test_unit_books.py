import pytest
import json
import os
from flask import Flask
from backend.src.database.models import Book, User
from backend.src.init_routes import init_routes
from unittest.mock import MagicMock

os.environ["TESTING"] = "1"


@pytest.fixture
def mock_auth(mocker):
    """Фикстура для мокирования авторизации"""
    mock_user = MagicMock(spec=User) # Убедимся, что это MagicMock с атрибутами User
    mock_user.id = 1
    mock_user.role = "user"

    return {"headers": {"Authorization": "Bearer test_jwt_token"}}


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


def test_create_book_success(client, mocker, mock_auth):
    book_data = {
        "title": "Test Book",
        "author": "Bebebe",
        "year": 1984,
        "category": "Test Category",
        "user_id": 1
    }

    mock_book = Book(
        id=1,
        title=book_data["title"],
        author=book_data["author"],
        year=book_data["year"],
        category=book_data["category"],
        user_id=book_data["user_id"]
    )

    mocker.patch("backend.src.routes.books.create_book", return_value=mock_book)



    response = client.post("/books", json=book_data, headers={"Authorization": "Bearer test_jwt_token"})
    assert response.status_code == 201
    assert response.json == {
        "id": 1,
        "title": "Test Book",
        "author": "Bebebe",
        "year": 1984,
        "category": "Test Category"
    }


def test_create_book_fail(client, mocker, mock_auth):
    invalid_book_data = {
        "title": "Test Book",
        "category": "Test Category",
        "year": 1984
    }
    response = client.post("/books", json=invalid_book_data,  headers={"Authorization": "Bearer test_jwt_token"})
    assert response.status_code == 400


def test_get_books(client, mocker, mock_auth):
    mock_book1 = MagicMock(spec=Book)
    mock_book1.id = 1
    mock_book1.title = "Book 1"
    mock_book1.author = "Author 1"
    mock_book1.category = "Category 1"
    mock_book1.user_id = 1
    mock_book1.year = 2000

    mock_book2 = MagicMock(spec=Book)
    mock_book2.id = 2
    mock_book2.title = "Book 2"
    mock_book2.author = "Author 2"
    mock_book2.category = "Category 2"
    mock_book2.user_id = 1
    mock_book2.year = 2001

    mocker.patch("backend.src.routes.books.get_books", return_value=[mock_book1, mock_book2])
    response = client.get("/books", headers=mock_auth["headers"])

    assert response.status_code == 200
    assert len(response.json) == 2
    assert response.json[0]["title"] == "Book 1"
    assert response.json[1]["author"] == "Author 2"


def test_get_books_with_filters(client, mocker, mock_auth):
    mock_books = [
        Book(id=1, title="Filtered Book", author="Author", category="Category", user_id=1)
    ]
    mocker.patch("backend.src.routes.books.get_books", return_value=mock_books)
    response = client.get("/books?category=Category&author=Author&skip=0&limit=1", headers=mock_auth["headers"])
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]["title"] == "Filtered Book"


def test_get_book_success(client, mocker, mock_auth):
    mock_book = MagicMock(spec=Book)
    mock_book.id = 1
    mock_book.title = "Test Book"
    mock_book.author = "Test Author"
    mock_book.category = "Test Category"
    mock_book.user_id = 1
    mock_book.year = 2000

    mocker.patch("backend.src.routes.books.get_book", return_value=mock_book)
    response = client.get("/books/1", headers=mock_auth["headers"])
    assert response.status_code == 200
    assert response.json["title"] == "Test Book"
    assert response.json["id"] == 1


def test_get_book_not_found(client, mocker, mock_auth):
    mocker.patch("backend.src.routes.books.get_book", side_effect=ValueError("Book not found"))
    response = client.get("/books/999", headers=mock_auth["headers"])
    assert response.status_code == 404
    assert "Book not found" in response.json["error"]


def test_create_book_missing_user_id(client, mock_auth):
    invalid_book_data = {
        "title": "Test Book",
        "category": "Test Category",
        "year": 1984,
        "author": "Author 1",
    }
    response = client.post("/books", json=invalid_book_data, headers=mock_auth["headers"])
    assert response.status_code == 400
    assert "user_id" in response.json["error"]


def test_update_book_success(client, mocker, mock_auth):
    update_data = {"title": "Updated Title"}
    mocker.patch("backend.src.routes.books.update_book", return_value=None)
    response = client.put("/books/1", json=update_data, headers=mock_auth["headers"])
    assert response.status_code == 200
    assert response.json["message"] == "Book updated"


def test_update_book_not_found(client, mocker, mock_auth):
    mocker.patch("backend.src.routes.books.update_book", side_effect=ValueError("Book not found"))
    response = client.put("/books/999", json={"title": "New Title"}, headers=mock_auth["headers"])
    assert response.status_code == 400
    assert "Book not found" in response.json["error"]


def test_delete_book_success(client, mocker, mock_auth):
    mocker.patch("backend.src.routes.books.delete_book", return_value=None)
    response = client.delete("/books/1", headers=mock_auth["headers"])
    assert response.status_code == 200
    assert response.json["message"] == "Book deleted"


def test_delete_book_not_found(client, mocker, mock_auth):
    mocker.patch("backend.src.routes.books.delete_book", side_effect=ValueError("Book not found"))
    response = client.delete("/books/999", headers=mock_auth["headers"])
    assert response.status_code == 400
    assert "Book not found" in response.json["error"]


def test_internal_server_error(client, mocker, mock_auth):
    mocker.patch("backend.src.routes.books.get_books", side_effect=Exception("Unexpected error"))
    response = client.get("/books", headers=mock_auth["headers"])
    assert response.status_code == 500
    assert "Unexpected error" in response.json["error"]

