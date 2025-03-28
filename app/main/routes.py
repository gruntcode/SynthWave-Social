from flask import render_template, flash, redirect, url_for, request, current_app, jsonify
from flask_login import current_user, login_required
from app import db
from app.main import bp
from app.models import User, Post, Comment, Music, YouTubePlaylist
from app.main.forms import EditProfileForm, EmptyForm
import os
from werkzeug.utils import secure_filename
import uuid
import requests

@bp.route('/')
@bp.route('/index')
def index():
    if current_user.is_authenticated:
        page = request.args.get('page', 1, type=int)
        posts = Post.query.order_by(Post.timestamp.desc()).paginate(
            page=page, per_page=10, error_out=False)
        next_url = url_for('main.index', page=posts.next_num) if posts.has_next else None
        prev_url = url_for('main.index', page=posts.prev_num) if posts.has_prev else None
        music_list = Music.query.order_by(Music.timestamp.desc()).limit(10).all()
        return render_template('index.html', title='Home', posts=posts.items,
                              next_url=next_url, prev_url=prev_url, music_list=music_list)
    return render_template('landing.html', title='Welcome')

@bp.route('/user/<username>')
@login_required
def user(username):
    user = User.query.filter_by(username=username).first_or_404()
    page = request.args.get('page', 1, type=int)
    posts = user.posts.order_by(Post.timestamp.desc()).paginate(
        page=page, per_page=10, error_out=False)
    next_url = url_for('main.user', username=user.username, page=posts.next_num) \
        if posts.has_next else None
    prev_url = url_for('main.user', username=user.username, page=posts.prev_num) \
        if posts.has_prev else None
    form = EmptyForm()
    music_list = Music.query.order_by(Music.timestamp.desc()).limit(10).all()
    return render_template('user.html', user=user, posts=posts.items,
                          next_url=next_url, prev_url=prev_url, form=form, music_list=music_list)

@bp.route('/edit_profile', methods=['GET', 'POST'])
@login_required
def edit_profile():
    form = EditProfileForm(current_user.username)
    if form.validate_on_submit():
        current_user.username = form.username.data
        current_user.about_me = form.about_me.data
        
        # Handle profile image upload
        if form.profile_image.data:
            filename = secure_filename(form.profile_image.data.filename)
            if filename:
                # Generate unique filename
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'profiles', unique_filename)
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(save_path), exist_ok=True)
                
                # Save the file
                form.profile_image.data.save(save_path)
                
                # Update user profile image
                current_user.profile_image = 'uploads/profiles/' + unique_filename
        
        db.session.commit()
        flash('Your profile has been updated.')
        return redirect(url_for('main.user', username=current_user.username))
    elif request.method == 'GET':
        form.username.data = current_user.username
        form.about_me.data = current_user.about_me
    
    music_list = Music.query.order_by(Music.timestamp.desc()).limit(10).all()
    return render_template('edit_profile.html', title='Edit Profile', form=form, music_list=music_list)

@bp.route('/test')
def test():
    return 'Test route working!'

@bp.route('/test_fixed')
def test_fixed():
    music_list = Music.query.order_by(Music.timestamp.desc()).limit(10).all()
    return render_template('test_fixed.html', title='Test Fixed', music_list=music_list)

@bp.route('/music_player')
@login_required
def music_player():
    music = Music.query.order_by(Music.timestamp.desc()).all()
    return render_template('music_player.html', title='Music Player', music=music)
