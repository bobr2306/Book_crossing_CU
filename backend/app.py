from flask import Flask
from src.database.database import db
from src.init_routes import init_routes

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://myuser:mypassword@postgres:5432/mydatabase'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

init_routes(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)