from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.orm import declarative_base
from flask_sqlalchemy import SQLAlchemy

DATABASE_URL = "postgresql://myuser:mypassword@localhost:5432/mydatabase"
engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

db = SQLAlchemy()

def get_db():
    return db.session

def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()
