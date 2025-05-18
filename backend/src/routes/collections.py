from flask import request, jsonify
from src.auth import auth_required
from src.database.crud import (
    create_collection,
    get_collections,
    delete_collection,
    add_books_to_collection,
    remove_book_from_collection,
    get_collection_with_items,
    update_collection,
)
from src.database.database import get_db


def collections_routes(app):
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'error': str(e)}), 500

    @app.route('/collections', methods=['GET'])
    @auth_required
    def get_collections_route():
        db = next(get_db())
        try:
            limit = int(request.args.get('limit', 100))
            skip = int(request.args.get('skip', 0))
            user_id = request.args.get('user_id', type=int)
            collections = get_collections(db, limit=limit, skip=skip, user_id=user_id)

            collections_data = []
            for collection in collections:
                collections_data.append({
                    "id": collection.id,
                    "title": collection.title,
                    "user_id": collection.user_id,
                    "book_count": len(collection.items)
                })

            return jsonify(collections_data)
        except Exception as e:
            return handle_exception(e)

    @app.route('/collections', methods=['POST'])
    @auth_required
    def create_collection_route():
        db = next(get_db())
        try:
            data = request.get_json()
            required_fields = ["title", "user_id"]
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields"}), 400

            collection_data = {
                "title": data["title"],
                "user_id": data["user_id"]
            }

            if "book_ids" in data:
                collection_data["book_ids"] = data["book_ids"]

            collection = create_collection(db, collection_data)

            return jsonify({
                "id": collection.id,
                "title": collection.title,
                "status": "created"
            }), 201
        except Exception as e:
            return handle_exception(e)

    @app.route('/collections/<int:collection_id>', methods=['GET'])
    @auth_required
    def get_collection_route(collection_id):
        db = next(get_db())
        try:
            collection = get_collection_with_items(db, collection_id)
            if not collection:
                return jsonify({"error": "Collection not found"}), 404

            collection_data = {
                "id": collection.id,
                "title": collection.title,
                "user_id": collection.user_id,
                "books": [
                    {
                        "id": item.book.id,
                        "title": item.book.title,
                        "author": item.book.author
                    }
                    for item in collection.items
                ]
            }

            return jsonify(collection_data)
        except Exception as e:
            return handle_exception(e)

    @app.route('/collections/<int:collection_id>', methods=['PUT'])
    @auth_required
    def update_collection_route(collection_id):
        db = next(get_db())
        try:
            data = request.get_json()
            update_data = {}

            if "title" in data:
                update_data["title"] = data["title"]
            if "book_ids" in data:
                update_data["book_ids"] = data["book_ids"]

            if not update_data:
                return jsonify({"error": "No fields to update"}), 400

            collection = update_collection(db, collection_id, update_data)

            if not collection:
                return jsonify({"error": "Collection not found"}), 404

            return jsonify({
                "id": collection.id,
                "title": collection.title,
                "status": "updated"
            })
        except Exception as e:
            return handle_exception(e)

    @app.route('/collections/<int:collection_id>', methods=['DELETE'])
    @auth_required
    def delete_collection_route(collection_id):
        db = next(get_db())
        try:
            success = delete_collection(db, collection_id)
            if not success:
                return jsonify({"error": "Collection not found"}), 404

            return jsonify({"status": "deleted", "id": collection_id})
        except Exception as e:
            return handle_exception(e)

    @app.route('/collections/<int:collection_id>/books', methods=['POST'])
    @auth_required
    def add_books_to_collection_route(collection_id):
        db = next(get_db())
        try:
            data = request.get_json()
            if "book_ids" not in data:
                return jsonify({"error": "book_ids is required"}), 400

            collection = add_books_to_collection(db, collection_id, data["book_ids"])

            if not collection:
                return jsonify({"error": "Collection not found"}), 404

            return jsonify({
                "id": collection.id,
                "title": collection.title,
                "added_books": len(data["book_ids"])
            })
        except Exception as e:
            return handle_exception(e)

    @app.route('/collections/<int:collection_id>/books/<int:book_id>', methods=['DELETE'])
    @auth_required
    def remove_book_from_collection_route(collection_id, book_id):
        db = next(get_db())
        try:
            success = remove_book_from_collection(db, collection_id, book_id)

            if not success:
                return jsonify({"error": "Collection or book not found"}), 404

            return jsonify({
                "status": "removed",
                "collection_id": collection_id,
                "book_id": book_id
            })
        except Exception as e:
            return handle_exception(e)
