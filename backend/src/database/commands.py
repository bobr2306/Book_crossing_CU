import click
from src.database.database import get_db, init_db
from src.database.models import User, Book, Transaction
from src.database.crud import create_user, create_book, create_transaction, create_collection
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
                # Создаем пользователей
                users = [
                    {"username": "admin", "password": hash_password("admin123"), "role": "admin"},
                    {"username": "user1", "password": hash_password("user123"), "role": "user"},
                    {"username": "user2", "password": hash_password("user123"), "role": "user"},
                    {"username": "user3", "password": hash_password("user123"), "role": "user"}
                ]
                user_objs = []
                for user_data in users:
                    user_objs.append(create_user(db, user_data))

                # Создаем книги для каждого пользователя
                books = [
                    # user1
                    {"title": "Война и мир", "author": "Лев Толстой", "user_id": user_objs[1].id, "category": "Классика", "year": 1869},
                    {"title": "1984", "author": "Джордж Оруэлл", "user_id": user_objs[1].id, "category": "Антиутопия", "year": 1949},
                    {"title": "Анна Каренина", "author": "Лев Толстой", "user_id": user_objs[1].id, "category": "Классика", "year": 1877},
                    {"title": "Три мушкетёра", "author": "Александр Дюма", "user_id": user_objs[1].id, "category": "Приключения", "year": 1844},
                    # user2
                    {"title": "Мастер и Маргарита", "author": "Михаил Булгаков", "user_id": user_objs[2].id, "category": "Фантастика", "year": 1940},
                    {"title": "Преступление и наказание", "author": "Федор Достоевский", "user_id": user_objs[2].id, "category": "Классика", "year": 1866},
                    {"title": "Идиот", "author": "Федор Достоевский", "user_id": user_objs[2].id, "category": "Классика", "year": 1869},
                    {"title": "Братья Карамазовы", "author": "Федор Достоевский", "user_id": user_objs[2].id, "category": "Классика", "year": 1880},
                    # user3
                    {"title": "Гарри Поттер", "author": "Джоан Роулинг", "user_id": user_objs[3].id, "category": "Фэнтези", "year": 1997},
                    {"title": "Три товарища", "author": "Эрих Мария Ремарк", "user_id": user_objs[3].id, "category": "Роман", "year": 1936},
                    {"title": "Над пропастью во ржи", "author": "Джером Сэлинджер", "user_id": user_objs[3].id, "category": "Классика", "year": 1951},
                    {"title": "Унесённые ветром", "author": "Маргарет Митчелл", "user_id": user_objs[3].id, "category": "Роман", "year": 1936},
                    # admin
                    {"title": "Админская книга", "author": "Admin", "user_id": user_objs[0].id, "category": "Служебная", "year": 2024},
                    {"title": "Секретная книга", "author": "Admin", "user_id": user_objs[0].id, "category": "Служебная", "year": 2025}
                ]
                book_objs = []
                for book_data in books:
                    book_objs.append(create_book(db, book_data))

                # Создаем коллекции только для админа
                collections = [
                    {"title": "Служебные admin", "user_id": user_objs[0].id, "book_ids": [book_objs[12].id, book_objs[13].id]}
                ]
                for col in collections:
                    create_collection(db, col)

                # Создаем тестовые обмены между пользователями
                exchanges = [
                    # user1 -> user2
                    {"from_user_id": user_objs[1].id, "to_user_id": user_objs[2].id, "book_id": book_objs[2].id, "place": "Библиотека", "status": "pending"},
                    {"from_user_id": user_objs[1].id, "to_user_id": user_objs[2].id, "book_id": book_objs[3].id, "place": "Кафе", "status": "completed"},
                    # user2 -> user1
                    {"from_user_id": user_objs[2].id, "to_user_id": user_objs[1].id, "book_id": book_objs[0].id, "place": "Парк", "status": "in_progress"},
                    # user3 -> user1
                    {"from_user_id": user_objs[3].id, "to_user_id": user_objs[1].id, "book_id": book_objs[0].id, "place": "Университет", "status": "canceled"},
                    # admin -> user3
                    {"from_user_id": user_objs[0].id, "to_user_id": user_objs[3].id, "book_id": book_objs[4].id, "place": "Офис", "status": "pending"}
                ]
                for exchange_data in exchanges:
                    create_transaction(db, exchange_data)

                click.echo("Тестовые данные успешно добавлены в БД")
        except Exception as e:
            click.echo(f"Ошибка при добавлении тестовых данных: {e}", err=True)
            raise