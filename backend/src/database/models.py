from sqlalchemy import Integer, String, Column, ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import relationship
from backend.src.database.database import Base


class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    year = Column(Integer)

    # relationships
    user = relationship("User", back_populates="books")
    reviews = relationship("Review", back_populates="book")
    collection_items = relationship("CollectionItem", back_populates="book")
    transactions = relationship("Transaction", back_populates="book")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum("admin", "moderator", "user", name="user_roles"), default="user")

    # relationships
    books = relationship("Book", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    collections = relationship("Collection", back_populates="user")
    sent_transactions = relationship(
        "Transaction",
        foreign_keys="Transaction.from_user_id",
        back_populates="from_user"
    )
    received_transactions = relationship(
        "Transaction",
        foreign_keys="Transaction.to_user_id",
        back_populates="to_user"
    )


class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)
    text = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    date = Column(DateTime, default=func.now(), nullable=False)

    # relationships
    user = relationship("User", back_populates="reviews")
    book = relationship("Book", back_populates="reviews")


class CollectionItem(Base):
    __tablename__ = "collection_items"
    collection_id = Column(Integer, ForeignKey("collections.id"), primary_key=True)
    book_id = Column(Integer, ForeignKey("books.id"), primary_key=True)

    # relationships
    collection = relationship("Collection", back_populates="items")
    book = relationship("Book", back_populates="collection_items")


class Collection(Base):
    __tablename__ = "collections"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # relationships
    user = relationship("User", back_populates="collections")
    items = relationship("CollectionItem", back_populates="collection")


class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=func.now(), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    place = Column(String, nullable=False)
    status = Column(
        Enum("completed", "pending", "canceled", "in_progress", name="transaction_status"),
        default="pending",
        nullable=False
    )

    # Relationships
    from_user = relationship("User", foreign_keys=[from_user_id], back_populates="sent_transactions")
    to_user = relationship("User", foreign_keys=[to_user_id], back_populates="received_transactions")
    book = relationship("Book", back_populates="transactions")