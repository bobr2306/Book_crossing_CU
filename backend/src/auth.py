from functools import wraps
from flask import Flask, request, jsonify
import base64, uuid


def library_auth(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        auth = request.headers.get("Authorization")
        pass
    return wrapped

