from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from backend.src.database import models


# Books
def create_book(db: Session, book: dict):
    required_fields = {"title", "author", "user_id", "category"}
    if not all(field in book for field in required_fields):
        raise ValueError(f"Missing required fields: {required_fields - set(book.keys())}")

    try:
        db_book = models.Book(**book)
        db.add(db_book)
        db.commit()
        db.refresh(db_book)
        return db_book
    except IntegrityError as e:
        db.rollback()
        raise ValueError(f"Database integrity error: {e}")


def get_books(db: Session, skip: int = 0, limit: int = 100, category: str = None, author: str = None, user_id: int = None):
    query = db.query(models.Book)
    if category:
        query = query.filter(models.Book.category == category)
    if author:
        query = query.filter(models.Book.author == author)
    if user_id:
        query = query.filter(models.Book.user_id == user_id)
    return query.offset(skip).limit(limit).all()

def get_book(db: Session, book_id: int):
    return db.query(models.Book).filter(models.Book.id == book_id).first()


def update_book(db: Session, book_id: int, book: dict):
    db_book = get_book(db, book_id)
    if not db_book:
        return None
    for key, value in book.items():
        setattr(db_book, key, value)
    db.commit()
    db.refresh(db_book)
    return db_book

def delete_book(db: Session, book_id: int):
    db_book = get_book(db, book_id)
    if db_book:
        db.delete(db_book)
        db.commit()
    return db_book

# Users
def create_user(db: Session, user: dict):
    required_fields = {"username", "password"}
    if not all(field in user for field in required_fields):
        raise ValueError(f"Missing required fields: {required_fields - set(user.keys())}")

    try:
        db_user = models.User(**user)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        db.rollback()
        raise ValueError(f"Database integrity error: {e}")


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.username == name).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user(db: Session, user_id: int, user: dict):
    db_user = get_user(db, user_id)
    if not db_user:
        return None

    for key, value in user.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        return False

    db.delete(db_user)
    db.commit()
    return True

# Reviews
def create_review(db: Session, review: dict):
    required_fields = {"rating", "text", "user_id", "book_id"}
    if not all(field in review for field in required_fields):
        raise ValueError(f"Missing required fields: {required_fields - set(review.keys())}")

    try:
        db_review = models.Review(**review)
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        return db_review
    except IntegrityError as e:
        db.rollback()
        raise ValueError(f"Database integrity error: {e}")


def get_reviews(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Review).offset(skip).limit(limit).all()


def get_review(db: Session, review_id: int):
    return db.query(models.Review).filter(models.Review.id == review_id).first()


def update_review(db: Session, review_id: int, review: dict):
    db_review = get_review(db, review_id)
    if not db_review:
        return None

    for key, value in review.items():
        if hasattr(db_review, key):
            setattr(db_review, key, value)
    db.commit()
    db.refresh(db_review)
    return db_review


def delete_review(db: Session, review_id: int):
    db_review = get_review(db, review_id)
    if not db_review:
        return False

    db.delete(db_review)
    db.commit()
    return True

# Collections
def create_collection(db: Session, collection: dict):
    required_fields = {"title", "user_id"}
    if not all(field in collection for field in required_fields):
        raise ValueError(f"Missing required fields: {required_fields - set(collection.keys())}")

    try:
        db_collection = models.Collection(**collection)
        db.add(db_collection)
        db.commit()
        db.refresh(db_collection)
        return db_collection
    except IntegrityError as e:
        db.rollback()
        raise ValueError(f"Database integrity error: {e}")


def get_collections(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Collection).offset(skip).limit(limit).all()


def get_collection(db: Session, collection_id: int):
    return db.query(models.Collection).filter(models.Collection.id == collection_id).first()


def update_collection(db: Session, collection_id: int, collection: dict):
    db_collection = get_collection(db, collection_id)
    if not db_collection:
        return None

    for key, value in collection.items():
        if hasattr(db_collection, key):
            setattr(db_collection, key, value)
    db.commit()
    db.refresh(db_collection)
    return db_collection


def delete_collection(db: Session, collection_id: int):
    db_collection = get_collection(db, collection_id)
    if not db_collection:
        return False

    db.delete(db_collection)
    db.commit()
    return True

# Transactions
def create_transaction(db: Session, transaction: dict):
    required_fields = {"from_user_id", "to_user_id", "place"}
    if not all(field in transaction for field in required_fields):
        raise ValueError(f"Missing required fields: {required_fields - set(transaction.keys())}")

    try:
        db_transaction = models.Transaction(**transaction)
        db.add(db_transaction)
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except IntegrityError as e:
        db.rollback()
        raise ValueError(f"Database integrity error: {e}")


def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).offset(skip).limit(limit).all()
