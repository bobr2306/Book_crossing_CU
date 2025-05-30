from flask import Flask
from flask_cors import CORS
from src.database.database import init_db, get_db
from src.routes.users import users_routes
from src.routes.books import books_routes
from src.routes.collections import collections_routes
from src.routes.transactions import transactions_routes
from src.database.commands import register_commands, seed_admin_collections
from src.database.crud import create_user, create_book, create_transaction
from src.auth_utils import hash_password
from src.database.models import User
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:5173"])

init_db()

users_routes(app)
books_routes(app)
collections_routes(app)
transactions_routes(app)
register_commands(app)

try:
    from src.database.commands import register_commands
    register_commands(app)
    app.test_cli_runner().invoke(args=["seed-db"])
except Exception as e:
    print(f"[seed-db] Ошибка при сидировании: {e}")

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
