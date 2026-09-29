import os
import sys

# Ensure UTF-8 output on Windows consoles
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from app import create_app
from app.models import db, User
from app.seed_data import seed_database

env = os.environ.get('FLASK_ENV', 'development')
app = create_app(env)

with app.app_context():
    db.create_all()
    if User.query.count() == 0:
        print("Database is empty. Populating with seed dataset...")
        seed_database()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"SkillForge Backend API starting on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
