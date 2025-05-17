from functools import wraps
from flask import request, jsonify
import jwt
from backend.src.database.models import User
from backend.src.database.database import get_db
from backend.src.auth_utils import verify_password
from backend.src.auth_utils import decode_token


def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        # Проверяем заголовок Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Bearer token required'}), 401

        token = auth_header.split(' ')[1]

        try:
            payload = decode_token(token)
            user_id = payload.get('sub')
            if not user_id:
                raise ValueError("Invalid token payload")

            db = next(get_db())
            user = db.query(User).get(int(user_id))
            db.close()

            if not user:
                return jsonify({'error': 'User not found'}), 404

            request.user = user
            return f(*args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except (jwt.JWTError, ValueError) as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401

    return wrapper

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'user') or request.user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)

    return decorated

def role_required(required_role):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user') or request.user.role != required_role:
                return jsonify({'error': f'{required_role} access required'}), 403
            return f(*args, **kwargs)

        return decorated

    return decorator

def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not request.headers.get('Authorization'):
            return jsonify({'error': 'Auth required'}), 401
        return f(*args, **kwargs)
    return wrapper




