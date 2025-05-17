def validate_book(data):
    required_fields = ["title", "author", "user_id", "category"]
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Field '{field}' is required")
    return data

def validate_user(data):
    required_fields = ["username", "password"]
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Field '{field}' is required")
    return data

def validate_collections(data):
    required_fields = ["title"]
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Field '{field}' is required")
    return data

def validate_reviews(data):
    required_fields = ["rating", "text", "user_id", "book_id"]
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Field '{field}' is required")
    return data

def validate_transactions(data):
    required_fields = ["date", "from_user_id", "to_user_id", "book_id"]
    for field in required_fields:
        if field not in data or not data[field]:
            raise ValueError(f"Field '{field}' is required")
    return data