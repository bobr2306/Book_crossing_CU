import click
from src.database.database import get_db, init_db
from src.database.models import User, Book, Transaction, Collection
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
            db = get_db()
            users = [
                {"username": "admin", "password": hash_password("admin123"), "role": "admin"},
                {"username": "user1", "password": hash_password("user123"), "role": "user"},
                {"username": "user2", "password": hash_password("user123"), "role": "user"},
                {"username": "user3", "password": hash_password("user123"), "role": "user"}
            ]
            user_objs = []
            for user_data in users:
                user_objs.append(create_user(db, user_data))

            books = [
                {"title": "Война и мир", "author": "Лев Толстой", "user_id": user_objs[1].id, "category": "Классика", "year": 1869},
                {"title": "1984", "author": "Джордж Оруэлл", "user_id": user_objs[1].id, "category": "Антиутопия", "year": 1949},
                {"title": "Анна Каренина", "author": "Лев Толстой", "user_id": user_objs[1].id, "category": "Классика", "year": 1877},
                {"title": "Три мушкетёра", "author": "Александр Дюма", "user_id": user_objs[1].id, "category": "Приключения", "year": 1844},
                {"title": "Мастер и Маргарита", "author": "Михаил Булгаков", "user_id": user_objs[2].id, "category": "Фантастика", "year": 1940},
                {"title": "Преступление и наказание", "author": "Федор Достоевский", "user_id": user_objs[2].id, "category": "Классика", "year": 1866},
                {"title": "Идиот", "author": "Федор Достоевский", "user_id": user_objs[2].id, "category": "Классика", "year": 1869},
                {"title": "Братья Карамазовы", "author": "Федор Достоевский", "user_id": user_objs[2].id, "category": "Классика", "year": 1880},
                {"title": "Гарри Поттер", "author": "Джоан Роулинг", "user_id": user_objs[3].id, "category": "Фэнтези", "year": 1997},
                {"title": "Три товарища", "author": "Эрих Мария Ремарк", "user_id": user_objs[3].id, "category": "Роман", "year": 1936},
                {"title": "Над пропастью во ржи", "author": "Джером Сэлинджер", "user_id": user_objs[3].id, "category": "Классика", "year": 1951},
                {"title": "Унесённые ветром", "author": "Маргарет Митчелл", "user_id": user_objs[3].id, "category": "Роман", "year": 1936},
                {"title": "Старик и море", "author": "Эрнест Хемингуэй", "user_id": user_objs[0].id, "category": "Классика", "year": 1952},
                {"title": "Шерлок Холмс", "author": "Артур Конан Дойл", "user_id": user_objs[0].id, "category": "Детектив", "year": 1892}
            ]
            book_objs = []
            for book_data in books:
                book_objs.append(create_book(db, book_data))

            collections = [
                {"title": "Служебные admin", "user_id": user_objs[0].id, "book_ids": [book_objs[12].id, book_objs[13].id]},
                {"title": "Русская классика", "user_id": user_objs[0].id, "book_ids": [book_objs[0].id, book_objs[2].id, book_objs[5].id, book_objs[6].id, book_objs[7].id]}
            ]
            for col in collections:
                create_collection(db, col)

            exchanges = [
                {"from_user_id": user_objs[1].id, "to_user_id": user_objs[2].id, "book_id": book_objs[2].id, "place": "Библиотека", "status": "pending"},
                {"from_user_id": user_objs[1].id, "to_user_id": user_objs[2].id, "book_id": book_objs[3].id, "place": "Кафе", "status": "completed"},
                {"from_user_id": user_objs[2].id, "to_user_id": user_objs[1].id, "book_id": book_objs[0].id, "place": "Парк", "status": "in_progress"},
                {"from_user_id": user_objs[3].id, "to_user_id": user_objs[1].id, "book_id": book_objs[0].id, "place": "Университет", "status": "canceled"},
                {"from_user_id": user_objs[0].id, "to_user_id": user_objs[3].id, "book_id": book_objs[4].id, "place": "Офис", "status": "pending"}
            ]
            for exchange_data in exchanges:
                create_transaction(db, exchange_data)

            db.close()
            click.echo("Тестовые данные успешно добавлены в БД")
        except Exception as e:
            click.echo(f"Ошибка при добавлении тестовых данных: {e}", err=True)
            raise

    @app.cli.command("seed-admin-collections")
    def seed_admin_collections_cli():
        db = get_db()
        seed_admin_collections(db)

def seed_admin_collections(db):
    from src.database.models import Collection, User
    admin = db.query(User).filter(User.role == 'admin').first()
    if not admin:
        print('Нет пользователя-админа!')
        return
    titles = ['Лучшие детективы', 'Классика XX века', 'Современная фантастика']
    for title in titles:
        exists = db.query(Collection).filter(Collection.title == title, Collection.user_id == admin.id).first()
        if not exists:
            c = Collection(title=title, user_id=admin.id)
            db.add(c)
    db.commit()
    print('Тестовые коллекции от админа созданы.')
    