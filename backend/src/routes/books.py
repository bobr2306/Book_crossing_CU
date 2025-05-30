from flask import jsonify, request
from src.database.crud import create_book, get_books, get_book, update_book, delete_book
from src.database.database import get_db
from src.database import schemas
from src.auth import auth_required
from src.auth import role_required

def books_routes(app):
    @app.route('/books', methods=['GET'])
    @auth_required
    def get_books_route():
        try:
            db = get_db()
            category = request.args.get('category')
            author = request.args.get('author')
            user_id = request.args.get('user_id')
            exclude_user_id = request.args.get('exclude_user_id')
            skip = int(request.args.get('skip', 0))
            limit = int(request.args.get('limit', 12))

            books_list = get_books(db, category=category, author=author, user_id=user_id)
            if exclude_user_id:
                books_list = [b for b in books_list if str(b.user_id) != str(exclude_user_id)]
            total_count = len(books_list)
            books = books_list[skip:skip + limit]

            books_data = [{
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'category': book.category,
                'user_id': book.user_id,
                'username': book.user.username if hasattr(book, 'user') and book.user else None,
                'year': book.year if book.year is not None else ''
            } for book in books]

            return jsonify({
                'books': books_data,
                'total': total_count
            })

        except ValueError as e:
            return jsonify({'error': 'Invalid parameters', 'details': str(e)}), 400
        except Exception as e:
            import traceback
            traceback.print_exc()  # Печатает трассировку в консоль

            return jsonify({'error': str(e)}), 500


    @app.route('/books/<int:book_id>', methods=['GET'])
    @auth_required
    def get_book_route(book_id):
        try:
            db = get_db()
            book = get_book(db, book_id)
            book_data = {
                'id': book.id,
                'title': book.title,
                'author': book.author,
                'category': book.category,
                'user_id': book.user_id,
                'username': book.user.username if hasattr(book, 'user') and book.user else None,
                'year': book.year if book.year is not None else ''
            }
            return jsonify(book_data)
        except ValueError as e:
            return jsonify({'error': str(e)}), 404


    @app.route('/books', methods=['POST'])
    @auth_required
    def create_book_route():
        try:
            db = get_db()
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
        data = request.get_json()
        try:
            db = get_db()
            update_book(db, book_id, data)
            return jsonify({'message': 'Book updated'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/books/<int:book_id>', methods=['DELETE'])
    @auth_required
    def delete_book_route(book_id):
        try:
            db = get_db()
            delete_book(db, book_id)
            return jsonify({'message': 'Book deleted'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/admin/books', methods=['GET'])
    @auth_required
    @role_required('admin')
    def admin_get_books():
        db = get_db()
        books = get_books(db)
        return jsonify([
            {"id": b.id, "title": b.title, "author": b.author, "category": b.category, "user_id": b.user_id, "year": b.year} for b in books
        ])

    @app.route('/admin/books/<int:book_id>', methods=['DELETE'])
    @auth_required
    @role_required('admin')
    def admin_delete_book(book_id):
        db = get_db()
        book = delete_book(db, book_id)
        if not book:
            return jsonify({"error": "Book not found"}), 404
        return jsonify({"status": "deleted", "id": book_id})
