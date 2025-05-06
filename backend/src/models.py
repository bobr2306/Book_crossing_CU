from sqlalchemy import Integer, String, Column, ForeignKey, Enum, DateTime, func
from backend.src.database import Base
from sqlalchemy.orm import relationship

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    year = Column(Integer)
    # relations
    user = relationship("User", backref="books")
    reviews = relationship("Review", backref="book")
    collection_items = relationship("CollectionItem", backref="book")
    transaction_items = relationship("TransactionItem", backref="book")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    password = Column(String, nullable=False)
    role = Column(Enum("admin", "moderator", "user", name="user_roles"), default="user")
    # relations
    books = relationship("Book", backref="user")
    reviews = relationship("Review", backref="user")
    collections = relationship("Collection", backref="user")
    sent_transactions = relationship("Transaction", foreign_keys="Transaction.from_user_id", backref="from_user")
    received_transactions = relationship("Transaction", foreign_keys="Transaction.to_user_id", backref="to_user")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)
    text = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    date = Column(DateTime, default=func.now(), nullable=False)

    # relations
    user = relationship("User", backref="reviews")
    book = relationship("Book", backref="reviews")

class CollectionItem(Base):
    __tablename__ = "collection_items"
    collection_id = Column(Integer, ForeignKey("collections.id"), primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), primary_key=True)
    # relations
    collection = relationship("Collection", backref="items")
    book = relationship("Book")

class Collection(Base):
    __tablename__ = "collections"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # relations
    user = relationship("User", backref="collections")
    items = relationship("CollectionItem", backref="collection")

class TransactionItem(Base):
    __tablename__ = "transaction_items"
    transaction_id = Column(Integer, ForeignKey("transactions.id"), primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), primary_key=True)
    transaction = relationship("Transaction", backref="items")
    # relations
    book = relationship("Book")

class Transaction(Base):
    __tablename__ = "transactions"
    transaction_id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=func.now(), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    place = Column(String, nullable=False)
    # relations
    from_user = relationship("User", foreign_keys=[from_user_id], backref="sent_transactions")
    to_user = relationship("User", foreign_keys=[to_user_id], backref="received_transactions")
    items = relationship("TransactionItem", backref="transaction")
