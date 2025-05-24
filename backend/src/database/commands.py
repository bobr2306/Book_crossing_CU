import click
from src.database.database import get_db, init_db
from src.database.models import User, Book
from src.database.crud import create_user, create_book
from src.auth_utils import hash_password

def register_commands(app):
    @app.cli.command("create-tables")
    def create_tables():
        try:
            init_db()
            click.echo("Таблицы успешно созданы")
        except Exception as e:
            click.echo(f"Ошибка при создании таблиц: {e}", err=True)
            raise

    @app.cli.command("seed-db")
    def seed_db():
        try:
            with get_db() as db:
                users = [
                    {"username": "admin", "password": hash_password("admin123"), "role": "admin"},
                    {"username": "user1", "password": hash_password("user123"), "role": "user"},
                    {"username": "user2", "password": hash_password("user123"), "role": "user"}
                ]
                for user_data in users:
                    create_user(db, user_data)
                books = [
                    {"title": "Война и мир", "author": "Лев Толстой", "user_id": 1, "category": "Классика", "year": 1869},
                    {"title": "1984", "author": "Джордж Оруэлл", "user_id": 2, "category": "Антиутопия", "year": 1949},
                    {"title": "Мастер и Маргарита", "author": "Михаил Булгаков", "user_id": 2, "category": "Фантастика", "year": 1940}
                ]
                for book_data in books:
                    create_book(db, book_data)
                click.echo("Тестовые данные успешно добавлены в БД")
        except Exception as e:
            click.echo(f"Ошибка при добавлении тестовых данных: {e}", err=True)
            raise