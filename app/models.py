from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db, login
import os

# Association table for post likes (many-to-many relationship)
post_likes = db.Table('post_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True),
    db.Column('timestamp', db.DateTime, default=datetime.utcnow)
)

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(500))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    media_type = db.Column(db.String(20), nullable=True)
    media_path = db.Column(db.String(120), nullable=True)
    comments = db.relationship('Comment', backref='post', lazy='dynamic')
    # Users who liked this post
    liked_by = db.relationship(
        'User', secondary=post_likes,
        backref=db.backref('liked_posts', lazy='dynamic'),
        lazy='dynamic')

    def __repr__(self):
        return f'<Post {self.id}>'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    email = db.Column(db.String(120), index=True, unique=True)
    password_hash = db.Column(db.String(128))
    about_me = db.Column(db.String(140))
    profile_image = db.Column(db.String(120), default='default_profile.png')
    dark_mode = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def like_post(self, post):
        if not self.has_liked_post(post):
            self.liked_posts.append(post)
            
    def unlike_post(self, post):
        if self.has_liked_post(post):
            self.liked_posts.remove(post)
            
    def has_liked_post(self, post):
        return self.liked_posts.filter(post_likes.c.post_id == post.id).count() > 0

@login.user_loader
def load_user(id):
    return User.query.get(int(id))

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    body = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'))
    
    def __repr__(self):
        return f'<Comment {self.id}>'

class Music(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    artist = db.Column(db.String(100))
    file_path = db.Column(db.String(120))
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Music {self.title}>'

class YouTubePlaylist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    playlist_id = db.Column(db.String(100), nullable=False)
    thumbnail_url = db.Column(db.String(200), nullable=True)
    is_playlist = db.Column(db.Boolean, default=True)  # True for playlist, False for single video
    timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    user = db.relationship('User', backref='youtube_playlists')
