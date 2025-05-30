from flask import request, jsonify
from src.database.crud import (
    create_transaction,
    get_transactions,
    get_transaction,
    update_transaction,
    delete_transaction,
)
from src.database.database import get_db
from src.auth import auth_required, role_required
from src.database.schemas import validate_transactions


def transactions_routes(app):
    @app.errorhandler(Exception)
    def handle_exception(e):
        return jsonify({'error': str(e)}), 500

    @app.route('/transactions', methods=['GET'])
    @auth_required
    def get_transactions_route():
        try:
            db = get_db()
            limit = int(request.args.get('limit', 100))
            skip = int(request.args.get('skip', 0))
            status = request.args.get('status')
            user_id = request.args.get('user_id')
            book_id = request.args.get('book_id')
            exclude_completed = request.args.get('exclude_completed', 'false').lower() == 'true'

            try:
                user_id = int(user_id) if user_id is not None and user_id != '' else None
            except Exception:
                user_id = None
            try:
                book_id = int(book_id) if book_id is not None and book_id != '' else None
            except Exception:
                book_id = None

            transactions = get_transactions(
                db,
                limit=limit,
                skip=skip,
                status=status,
                user_id=user_id,
                book_id=book_id,
                exclude_status="completed" if exclude_completed else None
            )

            transactions_data = []
            for t in transactions:
                book_title = t.book.title if t.book else None
                from_user_id = t.from_user_id
                to_user_id = t.to_user_id
                from_user_name = t.from_user.username if hasattr(t, 'from_user') and t.from_user else None
                to_user_name = t.to_user.username if hasattr(t, 'to_user') and t.to_user else None
                transactions_data.append({
                    "id": t.id,
                    "date": t.date.isoformat() if t.date else None,
                    "from_user_id": from_user_id,
                    "to_user_id": to_user_id,
                    "from_user_name": from_user_name,
                    "to_user_name": to_user_name,
                    "book_id": t.book_id,
                    "place": t.place,
                    "status": t.status,
                    "book_title": book_title
                })

            return jsonify(transactions_data)
        except Exception as e:
            return handle_exception(e)

    @app.route('/transactions/<int:transaction_id>', methods=['GET'])
    @auth_required
    def get_transaction_route(transaction_id):
        try:
            db = get_db()
            transaction = get_transaction(db, transaction_id)
            if not transaction:
                return jsonify({"error": "Transaction not found"}), 404

            transaction_data = {
                "id": transaction.id,
                "date": transaction.date.isoformat(),
                "from_user": {
                    "id": transaction.from_user.id,
                    "username": transaction.from_user.username
                },
                "to_user": {
                    "id": transaction.to_user.id,
                    "username": transaction.to_user.username
                },
                "book": {
                    "id": transaction.book.id,
                    "title": transaction.book.title,
                    "author": transaction.book.author
                },
                "place": transaction.place,
                "status": transaction.status
            }

            return jsonify(transaction_data)
        except Exception as e:
            return handle_exception(e)

    @app.route('/transactions', methods=['POST'])
    @auth_required
    def create_transaction_route():
        data = request.get_json()
        try:
            db = get_db()
            required_fields = ["from_user_id", "to_user_id", "book_id", "place"]
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields"}), 400
            validate_transactions(data)
            transaction_data = {
                "from_user_id": data["from_user_id"],
                "to_user_id": data["to_user_id"],
                "book_id": data["book_id"],
                "place": data["place"],
                "status": data.get("status", "pending")
            }

            transaction = create_transaction(db, transaction_data)

            return jsonify({
                "id": transaction.id,
                "status": "created",
                "transaction": {
                    "id": transaction.id,
                    "status": transaction.status
                }
            }), 201
        except Exception as e:
            return handle_exception(e)

    @app.route('/transactions/<int:transaction_id>', methods=['PUT'])
    @auth_required
    def update_transaction_route(transaction_id):
        data = request.get_json()

        try:
            db = get_db()
            allowed_fields = {"status", "place"}
            update_data = {k: v for k, v in data.items() if k in allowed_fields}

            if not update_data:
                return jsonify({"error": "No valid fields to update"}), 400

            transaction = update_transaction(db, transaction_id, update_data)
            if not transaction:
                return jsonify({"error": "Transaction not found"}), 404

            return jsonify({
                "id": transaction.id,
                "status": "updated",
                "transaction": {
                    "id": transaction.id,
                    "status": transaction.status
                }
            })
        except Exception as e:
            return handle_exception(e)

    @app.route('/transactions/<int:transaction_id>', methods=['DELETE'])
    @auth_required
    @role_required('admin')
    def delete_transaction_route(transaction_id):
        try:
            db = get_db()
            success = delete_transaction(db, transaction_id)
            if not success:
                return jsonify({"error": "Transaction not found"}), 404

            return jsonify({"status": "deleted", "id": transaction_id})
        except Exception as e:
            return handle_exception(e)

    @app.route('/transactions/<int:transaction_id>/status', methods=['PUT'])
    @auth_required
    def change_transaction_status_route(transaction_id):
        data = request.get_json()
        try:
            db = get_db()
            if "status" not in data:
                return jsonify({"error": "Status is required"}), 400

            transaction = update_transaction(db, transaction_id, {"status": data["status"]})
            if not transaction:
                return jsonify({"error": "Transaction not found"}), 404

            return jsonify({
                "id": transaction.id,
                "status": "status_updated",
                "new_status": transaction.status
            })
        except Exception as e:
            return handle_exception(e)

    @app.route('/admin/transactions', methods=['GET'])
    @auth_required
    @role_required('admin')
    def admin_get_transactions():
        db = get_db()
        transactions = get_transactions(db)
        result = []
        for t in transactions:
            result.append({
                "id": t.id,
                "from_user": {
                    "id": t.from_user.id if t.from_user else None,
                    "username": t.from_user.username if t.from_user else None
                },
                "to_user": {
                    "id": t.to_user.id if t.to_user else None,
                    "username": t.to_user.username if t.to_user else None
                },
                "book": {
                    "id": t.book.id if t.book else None,
                    "title": t.book.title if t.book else None
                },
                "place": t.place,
                "status": t.status,
                "date": t.date.isoformat() if t.date else None
            })
        return jsonify(result)

    @app.route('/admin/transactions/<int:transaction_id>', methods=['DELETE'])
    @auth_required
    @role_required('admin')
    def admin_delete_transaction(transaction_id):
        db = get_db()
        success = delete_transaction(db, transaction_id)
        if not success:
            return jsonify({"error": "Transaction not found"}), 404
        return jsonify({"status": "deleted", "id": transaction_id})
