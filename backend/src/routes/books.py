from flask import jsonify, request
from backend.src.crud import create_book, get_books, get_book, update_book, delete_book
from backend.src.database import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def books_routes(app):
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'error': str(e)}), 500

    @app.route('/books', methods=['GET'])
    def get_books_route():
        db = next(get_db())
        category = request.args.get('category')
        author = request.args.get('author')
        user_id = request.args.get('user_id')
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 100))
        books = get_books(db, skip=skip, limit=limit, category=category, author=author, user_id=user_id)
        return jsonify([book.__dict__ for book in books])


    @app.route('/books/<int:book_id>', methods=['GET'])
    def get_book_route(book_id):
        db = next(get_db())
        try:
            book = get_book(db, book_id)
            return jsonify(book.__dict__)
        except ValueError as e:
            return jsonify({'error': str(e)}), 404


    @app.route('/books', methods=['POST'])
    def create_book_route():
        db = next(get_db())
        data = request.get_json()
        try:
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

    @app.route('/books/<int:book_id>', methods=['PUT'])
    def update_book_route(book_id):
        db = next(get_db())
        data = request.get_json()
        try:
            update_book(db, book_id, data)
            return jsonify({'message': 'Book updated'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    @app.route('/books/<int:book_id>', methods=['DELETE'])
    def delete_book_route(book_id):
        db = next(get_db())
        try:
            delete_book(db, book_id)
            return jsonify({'message': 'Book deleted'}), 200
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
