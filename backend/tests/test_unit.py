import pytest
import json
from flask import Flask
from backend.src import models
from backend.src.init_routes import init_routes


@pytest.fixture
def app():
    app = Flask(__name__)
    init_routes(app)
    app.config.update({
        "TESTING": True,
    })
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
    mocker.patch("backend.src.routes.books.get_db", return_value=db_session)

def test_create_book_success(client, mocker):
    book_data = {
        "title": "Test Book",
        "author": "Bebebe",
        "year": 1984,
        "category": "Test Category"
    }

    mock_book = models.Book(
        id=1,
        title=book_data["title"],
        author=book_data["author"],
        year=book_data["year"],
        category=book_data["category"],
        user_id=1
    )

    mocker.patch("backend.src.routes.books.create_book", return_value=mock_book)

    response = client.post("/books", data=json.dumps(book_data), content_type="application/json")

    assert response.status_code == 201
    assert response.json == {
        "id": 1,
        "title": "Test Book",
        "author": "Bebebe",
        "year": 1984,
        "category": "Test Category"
    }
