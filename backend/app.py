from flask import Flask
from flask_cors import CORS
from src.database.database import db, init_db
from src.routes.users import users_routes
from src.routes.books import books_routes
from src.routes.collections import collections_routes
from src.routes.transactions import transactions_routes
from src.database.commands import register_commands

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://myuser:mypassword@postgres:5432/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db.init_app(app)

with app.app_context():
    db.create_all()

users_routes(app)
books_routes(app)
collections_routes(app)
transactions_routes(app)

register_commands(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)