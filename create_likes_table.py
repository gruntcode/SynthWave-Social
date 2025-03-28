"""
Script to create the post_likes table directly using SQLAlchemy
"""
import os
import sys
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Create a minimal Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the post_likes table
post_likes = db.Table('post_likes',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('post_id', db.Integer, db.ForeignKey('post.id'), primary_key=True),
    db.Column('timestamp', db.DateTime, default=db.func.current_timestamp())
)

if __name__ == '__main__':
    with app.app_context():
        print("Creating post_likes table...")
        # Create the table
        db.create_all()
        print("Table created successfully!")
