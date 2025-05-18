import click
from src.database.database import get_db, db
from src.database.models import User, Book
from src.database.crud import create_user, create_book

def register_commands(app):
    @app.cli.command("create-tables")
    def create_tables():
        """Создает таблицы в БД"""
        with app.app_context():
            db.create_all()
            click.echo("Таблицы успешно созданы")

    @app.cli.command("seed-db")
    def seed_db():
        """Добавляет тестовые данные в БД"""
        db = get_db()

        # Создаем тестовых пользователей
        users = [
            {"username": "admin", "password": "admin123", "role": "admin"},
            {"username": "user1", "password": "user123"},
            {"username": "user2", "password": "user123"}
        ]

        for user_data in users:
            create_user(db, user_data)

        # Создаем тестовые книги
        books = [
            {"title": "Война и мир", "author": "Лев Толстой", "user_id": 1},
            {"title": "1984", "author": "Джордж Оруэлл", "user_id": 2},
            {"title": "Мастер и Маргарита", "author": "Михаил Булгаков", "user_id": 2}
        ]

        for book_data in books:
            create_book(db, book_data)

        db.commit()
        click.echo("Тестовые данные успешно добавлены в БД")
