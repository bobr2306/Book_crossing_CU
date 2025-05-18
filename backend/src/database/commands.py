import click
from src.database.database import get_db
from src.database.models import User, Book
from src.database.crud import create_user, create_book
from src.auth_utils import hash_password
from src.database.database import Base, engine

def create_admin_user():
    """Создает администратора при запуске приложения"""
    db = next(get_db())
    admin = db.query(User).filter_by(username="admin").first()
    if not admin:
        admin_data = {
            "username": "admin",
            "password": hash_password("admin123"),
            "role": "admin"
        }

        create_user(db, admin_data)
        db.commit()
        print("Администратор успешно создан")

def register_commands(app):
    @app.cli.command("create-tables")
    def create_tables():
        """Создает таблицы в БД"""
        Base.metadata.create_all(bind=engine)
        click.echo("Таблицы успешно созданы")

    @app.cli.command("seed-db")
    def seed_db():
        """Добавляет тестовые данные в БД"""
        db = next(get_db())

        # Создаем тестовых пользователей
        users = [
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
