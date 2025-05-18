from src.routes.books import books_routes
from src.routes.reviews import reviews_routes
from src.routes.users import users_routes
from src.routes.transactions import transactions_routes
from src.routes.collections import collections_routes

def init_routes(app):
    books_routes(app)
    users_routes(app)
    reviews_routes(app)
    transactions_routes(app)
    collections_routes(app)
