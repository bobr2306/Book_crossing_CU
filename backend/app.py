from flask import Flask
from flask_cors import CORS
from src.routes.users import users_routes
from src.routes.books import books_routes
from src.routes.collections import collections_routes
from src.routes.transactions import transactions_routes
from src.database.commands import register_commands, create_admin_user
from src.database.database import engine
from src.database.models import Base

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

def init_app():
    with app.app_context():
        print("Создание таблиц...")
        Base.metadata.create_all(bind=engine)
        print("Создание администратора...")
        try:
            create_admin_user()
        except Exception as e:
            print(f"Ошибка при создании администратора: {e}")

init_app()

users_routes(app)
books_routes(app)
collections_routes(app)
transactions_routes(app)

register_commands(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
