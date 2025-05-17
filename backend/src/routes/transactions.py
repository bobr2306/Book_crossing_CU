# from flask import request, jsonify
# from backend.src.database.crud import create_transaction, get_transactions
# from backend.src.database.models import Transaction
# from backend.src.database.database import get_db
# from backend.src.database import schemas
# from backend.src.auth import auth_required, role_required


def transactions_routes(app):
    pass
    # @app.errorhandler(Exception)
    # def handle_exception(e):
    #     return jsonify({'error': str(e)}), 500
    #
    # @app.route('/transactions', methods=['GET'])
    # @auth_required
    # @role_required('admin')
    # def get_transactions():
    #     pass
    #
    #
    # @app.route('/transactions', methods=['POST'])
    # @auth_required
    # def create_transaction():
    #     pass