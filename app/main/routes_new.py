from flask import render_template, flash, redirect, url_for, request, current_app, jsonify
from flask_login import current_user, login_required
from app import db
from app.main import bp
from app.models import User, Post, Comment, Music
from app.main.forms import EditProfileForm, EmptyForm
from app.posts.forms import PostForm
import os
from werkzeug.utils import secure_filename
import uuid

@bp.route('/test_fixed')
def test_fixed():
    music_list = Music.query.order_by(Music.timestamp.desc()).limit(10).all()
    return render_template('test_fixed.html', title='Test Fixed', music_list=music_list)
