from flask import Flask
from backend.src.init_routes import init_routes
from backend.src.database.commands import register_commands

app = Flask(__name__)
init_routes(app)
register_commands(app)

if __name__ == '__main__':
    app.run(debug=True)