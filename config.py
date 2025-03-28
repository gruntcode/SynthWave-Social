import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard-to-guess-string'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(basedir, 'app/static/uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size
    
    # Ensure upload directories exist
    @staticmethod
    def init_app(app):
        os.makedirs(os.path.join(basedir, 'app/static/uploads/images'), exist_ok=True)
        os.makedirs(os.path.join(basedir, 'app/static/uploads/videos'), exist_ok=True)
        os.makedirs(os.path.join(basedir, 'app/static/uploads/files'), exist_ok=True)
        os.makedirs(os.path.join(basedir, 'app/static/uploads/music'), exist_ok=True)
