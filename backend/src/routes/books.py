from flask import jsonify, request
from src.database.crud import create_book, get_books, get_book, update_book, delete_book
from src.database.database import get_db
from src.database import schemas
from src.auth import auth_required

def books_routes(app):
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'error': str(e)}), 500

    @app.route('/books', methods=['GET'])
    @auth_required
    def get_books_route():
        db = next(get_db())
        category = request.args.get('category')
        author = request.args.get('author')
        user_id = request.args.get('user_id')
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        try:
            books = get_books(db, skip=skip, limit=limit, category=category, author=author, user_id=user_id)
            books_data = [{
                'title': book.title,
                'author': book.author,
                'category': book.category,
                'user_id': book.user_id,
                'year': book.year
            } for book in books]
            return jsonify(books_data)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/books/<int:book_id>', methods=['GET'])
    @auth_required
    def get_book_route(book_id):
        db = next(get_db())
        try:
            book = get_book(db, book_id)
            book_data = {
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'category': book.category,
                'user_id': book.user_id,
                'year': book.year
            }
            return jsonify(book_data)
        except ValueError as e:
            return jsonify({'error': str(e)}), 404


    @app.route('/books', methods=['POST'])
    @auth_required
    def create_book_route():
        db = next(get_db())
        try:
            data = schemas.validate_book(request.get_json())
            book = create_book(db, data)
            return jsonify({
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'year': book.year,
                'category': book.category
            }), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/books/<int:book_id>', methods=['PUT'])
    @auth_required
    def update_book_route(book_id):
        db = next(get_db())
        data = request.get_json()
        try:
            update_book(db, book_id, data)
            return jsonify({'message': 'Book updated'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/books/<int:book_id>', methods=['DELETE'])
    @auth_required
    def delete_book_route(book_id):
        db = next(get_db())
        try:
            delete_book(db, book_id)
            return jsonify({'message': 'Book deleted'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
