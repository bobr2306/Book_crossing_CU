from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
from src.database import models
from src.database.models import Collection, CollectionItem


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
def create_collection(db: Session, collection_data: dict):
    """Создание новой коллекции с книгами"""
    collection = Collection(
        title=collection_data["title"],
        user_id=collection_data["user_id"]
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)

    if "book_ids" in collection_data:
        for book_id in collection_data["book_ids"]:
            item = CollectionItem(
                collection_id=collection.id,
                book_id=book_id
            )
            db.add(item)
        db.commit()

    return collection


def get_collections(db: Session, skip: int = 0, limit: int = 100, user_id: int = None):
    """Получение списка коллекций"""
    query = db.query(Collection)

    if user_id:
        query = query.filter(Collection.user_id == user_id)

    return query.offset(skip).limit(limit).all()


def get_collection_with_items(db: Session, collection_id: int):
    """Получение коллекции с книгами"""
    return db.query(Collection) \
        .options(joinedload(Collection.items)
                 .joinedload(CollectionItem.book)) \
        .filter(Collection.id == collection_id) \
        .first()


def update_collection(db: Session, collection_id: int, update_data: dict):
    """Обновление коллекции"""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        return None

    if "title" in update_data:
        collection.title = update_data["title"]

    if "book_ids" in update_data:
        # Удаляем старые связи
        db.query(CollectionItem) \
            .filter(CollectionItem.collection_id == collection_id) \
            .delete()

        # Добавляем новые
        for book_id in update_data["book_ids"]:
            item = CollectionItem(
                collection_id=collection.id,
                book_id=book_id
            )
            db.add(item)

    db.commit()
    db.refresh(collection)
    return collection


def delete_collection(db: Session, collection_id: int):
    """Удаление коллекции"""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        return False

    db.delete(collection)
    db.commit()
    return True


def add_books_to_collection(db: Session, collection_id: int, book_ids: list[int]):
    """Добавление книг в коллекцию"""
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    if not collection:
        return None

    for book_id in book_ids:
        # Проверяем, нет ли уже такой связи
        exists = db.query(CollectionItem) \
            .filter(and_(
            CollectionItem.collection_id == collection_id,
            CollectionItem.book_id == book_id
        )) \
            .first()
        if not exists:
            item = CollectionItem(
                collection_id=collection_id,
                book_id=book_id
            )
            db.add(item)

    db.commit()
    db.refresh(collection)
    return collection


def remove_book_from_collection(db: Session, collection_id: int, book_id: int):
    """Удаление книги из коллекции"""
    item = db.query(CollectionItem) \
        .filter(and_(
        CollectionItem.collection_id == collection_id,
        CollectionItem.book_id == book_id
    )) \
        .first()
    if not item:
        return False

    db.delete(item)
    db.commit()
    return True

# Transactions

# Вариант для нескольких книг в транзакции, тяжко
# def get_transactions(db: Session, skip: int = 0, limit: int = 100, status: str = None,
#                      exclude_status: str = "completed"):
#     query = db.query(models.Transaction)
#
#     if exclude_status:
#         query = query.filter(models.Transaction.status != exclude_status)
#     if status:
#         query = query.filter(models.Transaction.status == status)
#
#     return query.offset(skip).limit(limit).all()
#
#
# def create_transaction(db: Session, transaction_data: dict, book_ids: list[int]):
#     # Создаем саму транзакцию
#     db_transaction = models.Transaction(**transaction_data)
#     db.add(db_transaction)
#     db.commit()
#     db.refresh(db_transaction)
#
#     # Добавляем книги в транзакцию
#     for book_id in book_ids:
#         transaction_item = models.TransactionItem(
#             transaction_id=db_transaction.id,
#             book_id=book_id
#         )
#         db.add(transaction_item)
#
#     db.commit()
#     return db_transaction
#
#
# def get_transaction_with_items(db: Session, transaction_id: int):
#     return db.query(models.Transaction) \
#         .options(joinedload(models.Transaction.items)
#                  .joinedload(models.TransactionItem.book)) \
#         .filter(models.Transaction.id == transaction_id) \
#         .first()

def get_transactions(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        status: str = None,
        user_id: int = None,
        book_id: int = None,
        exclude_status: str = None
):
    query = db.query(models.Transaction)

    if status:
        query = query.filter(models.Transaction.status == status)
    if exclude_status:
        query = query.filter(models.Transaction.status != exclude_status)
    if user_id:
        query = query.filter(
            (models.Transaction.from_user_id == user_id) |
            (models.Transaction.to_user_id == user_id)
        )
    if book_id:
        query = query.filter(models.Transaction.book_id == book_id)

    return query.order_by(models.Transaction.date.desc()) \
        .offset(skip).limit(limit) \
        .all()


def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction) \
        .options(
        joinedload(models.Transaction.from_user),
        joinedload(models.Transaction.to_user),
        joinedload(models.Transaction.book)
    ) \
        .filter(models.Transaction.id == transaction_id) \
        .first()


def create_transaction(db: Session, transaction_data: dict):
    db_transaction = models.Transaction(**transaction_data)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(db: Session, transaction_id: int, update_data: dict):
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None

    for key, value in update_data.items():
        setattr(db_transaction, key, value)

    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int):
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return False

    db.delete(db_transaction)
    db.commit()
    return True