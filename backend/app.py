from flask import Flask
from flask_cors import CORS
from src.database.database import init_db, get_db
from src.routes.users import users_routes
from src.routes.books import books_routes
from src.routes.collections import collections_routes
from src.routes.transactions import transactions_routes
from src.database.commands import register_commands
from src.database.crud import create_user, create_book, create_transaction
from src.auth_utils import hash_password
from src.database.models import User
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:5173"])

init_db()

# ❗️ Добавим данные при первом запуске
try:
    with get_db() as db:
        if not db.query(User).filter_by(username="admin").first():
            users = [
                {"username": "admin", "password": hash_password("admin123"), "role": "admin"},
                {"username": "user1", "password": hash_password("user123"), "role": "user"},
                {"username": "user2", "password": hash_password("user123"), "role": "user"}
            ]
            for user_data in users:
                create_user(db, user_data)
            books = [
                {"title": "Война и мир", "author": "Лев Толстой", "user_id": 1, "category": "Классика"},
                {"title": "1984", "author": "Джордж Оруэлл", "user_id": 2, "category": "Антиутопия"},
                {"title": "Мастер и Маргарита", "author": "Михаил Булгаков", "user_id": 2, "category": "Фантастика"}
            ]
            for book_data in books:
                create_book(db, book_data)

            # Добавляем тестовые обмены
            transactions = [
                {
                    "from_user_id": 1,  # admin
                    "to_user_id": 2,    # user1
                    "book_id": 1,       # Война и мир
                    "place": "Библиотека №1",
                    "status": "pending"
                },
                {
                    "from_user_id": 2,  # user1
                    "to_user_id": 1,    # admin
                    "book_id": 2,       # 1984
                    "place": "Библиотека №2",
                    "status": "accepted"
                },
                {
                    "from_user_id": 1,  # admin
                    "to_user_id": 3,    # user2
                    "book_id": 3,       # Мастер и Маргарита
                    "place": "Библиотека №3",
                    "status": "in_progress"
                },
                {
                    "from_user_id": 3,  # user2
                    "to_user_id": 1,    # admin
                    "book_id": 1,       # Война и мир
                    "place": "Библиотека №1",
                    "status": "completed"
                },
                {
                    "from_user_id": 1,  # admin
                    "to_user_id": 2,    # user1
                    "book_id": 2,       # 1984
                    "place": "Библиотека №2",
                    "status": "rejected"
                }
            ]
            for transaction_data in transactions:
                create_transaction(db, transaction_data)

            print("🟢 Тестовые данные добавлены")
        else:
            print("ℹ️ Пользователь 'admin' уже существует, сидирование пропущено")
except Exception as e:
    print(f"❌ Ошибка при сидировании данных: {e}")

# маршруты и команды
users_routes(app)
books_routes(app)
collections_routes(app)
transactions_routes(app)
register_commands(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
