import os
import uuid
from datetime import datetime
from flask import render_template, flash, redirect, url_for, request, current_app, abort
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
from app import db
from app.posts import bp
from app.models import Post, Comment, User

def save_media(file, media_type):
    """Save uploaded media file and return the path"""
    if not file:
        return None
    
    filename = secure_filename(file.filename)
    # Add unique identifier to filename to prevent collisions
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    # Determine the appropriate subfolder based on media type
    if media_type == 'image':
        subfolder = 'images'
    elif media_type == 'video':
        subfolder = 'videos'
    elif media_type == 'audio':
        subfolder = 'music'
    else:
        subfolder = 'files'
    
    save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder, unique_filename)
    file.save(save_path)
    
    # Return the relative path for storage in the database
    return 'uploads/' + subfolder + '/' + unique_filename

def determine_media_type(filename):
    """Determine the type of media based on file extension"""
    if not filename:
        return None
    
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in ['jpg', 'jpeg', 'png', 'gif']:
        return 'image'
    elif ext in ['mp4', 'mov', 'avi', 'webm']:
        return 'video'
    elif ext in ['mp3', 'wav', 'ogg']:
        return 'audio'
    else:
        return 'file'

@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_post():
    if request.method == 'POST':
        body = request.form.get('body')
        if not body:
            flash('Post content is required!', 'danger')
            return redirect(url_for('posts.create_post'))
        
        media_path = None
        media_type = None
        
        if 'media' in request.files and request.files['media'].filename:
            media_file = request.files['media']
            media_type = determine_media_type(media_file.filename)
            media_path = save_media(media_file, media_type)
        
        post = Post(body=body, author=current_user,
                   media_type=media_type, media_path=media_path)
        db.session.add(post)
        db.session.commit()
        flash('Your post is now live!', 'success')
        return redirect(url_for('main.index'))
    
    return render_template('posts/create.html', title='Create Post')

@bp.route('/<int:id>', methods=['GET', 'POST'])
@login_required
def view_post(id):
    post = Post.query.get_or_404(id)
    
    if request.method == 'POST':
        body = request.form.get('body')
        if body:
            comment = Comment(body=body, author=current_user, post=post)
            db.session.add(comment)
            db.session.commit()
            flash('Your comment has been added!', 'success')
            return redirect(url_for('posts.view_post', id=post.id))
    
    comments = post.comments.order_by(Comment.timestamp.desc()).all()
    return render_template('posts/view.html', title='View Post', post=post, comments=comments)

@bp.route('/<int:id>/delete', methods=['POST'])
@login_required
def delete_post(id):
    post = Post.query.get_or_404(id)
    if post.author.id != current_user.id:
        abort(403)
    
    # Delete associated media file if exists
    if post.media_path:
        try:
            file_path = os.path.join(current_app.root_path, 'static', post.media_path)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            current_app.logger.error(f"Error deleting file: {e}")
    
    db.session.delete(post)
    db.session.commit()
    flash('Your post has been deleted.')
    return redirect(url_for('main.index'))

@bp.route('/comment/<int:id>/delete', methods=['POST'])
@login_required
def delete_comment(id):
    comment = Comment.query.get_or_404(id)
    if comment.author.id != current_user.id:
        abort(403)
    
    post_id = comment.post_id
    db.session.delete(comment)
    db.session.commit()
    flash('Your comment has been deleted.')
    return redirect(url_for('posts.view_post', id=post_id))
