from flask import jsonify, request, current_app, url_for
from flask_login import current_user, login_required
from app import db
from app.api import bp
from app.models import Post, Comment, User, Music, YouTubePlaylist
import os
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime

@bp.route('/posts', methods=['GET'])
@login_required
def get_posts():
    page = request.args.get('page', 1, type=int)
    posts = Post.query.order_by(Post.timestamp.desc()).paginate(
        page=page, per_page=10, error_out=False)
    
    data = {
        'items': [
            {
                'id': post.id,
                'body': post.body,
                'timestamp': post.timestamp.isoformat() + 'Z',
                'author': {
                    'id': post.author.id,
                    'username': post.author.username,
                    'profile_image': url_for('static', filename=post.author.profile_image)
                },
                'media_type': post.media_type,
                'media_path': url_for('static', filename=post.media_path) if post.media_path else None,
                'comment_count': post.comments.count()
            } for post in posts.items
        ],
        'has_next': posts.has_next,
        'has_prev': posts.has_prev,
        'next_page': posts.next_num,
        'prev_page': posts.prev_num,
        'total': posts.total
    }
    
    return jsonify(data)

@bp.route('/posts/<int:id>/comments', methods=['GET'])
@login_required
def get_comments(id):
    post = Post.query.get_or_404(id)
    comments = post.comments.order_by(Comment.timestamp.desc()).all()
    
    return jsonify({
        'comments': [
            {
                'id': comment.id,
                'body': comment.body,
                'timestamp': comment.timestamp.isoformat() + 'Z',
                'author': {
                    'id': comment.author.id,
                    'username': comment.author.username,
                    'profile_image': url_for('static', filename=comment.author.profile_image)
                }
            } for comment in comments
        ],
        'count': len(comments)
    })

@bp.route('/posts/<int:id>/comments', methods=['POST'])
@login_required
def add_comment(id):
    post = Post.query.get_or_404(id)
    data = request.get_json()
    
    if not data or 'body' not in data:
        return jsonify({'success': False, 'error': 'Comment body is required'}), 400
    
    comment = Comment(
        body=data['body'],
        author=current_user,
        post=post
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'comment': {
            'id': comment.id,
            'body': comment.body,
            'timestamp': comment.timestamp.isoformat() + 'Z',
            'author': {
                'id': comment.author.id,
                'username': comment.author.username,
                'profile_image': url_for('static', filename=comment.author.profile_image)
            }
        }
    })

@bp.route('/music', methods=['GET'])
@login_required
def get_music():
    music = Music.query.order_by(Music.timestamp.desc()).all()
    
    data = {
        'items': [
            {
                'id': track.id,
                'title': track.title,
                'artist': track.artist,
                'file_path': url_for('static', filename=track.file_path),
                'timestamp': track.timestamp.isoformat() + 'Z'
            } for track in music
        ],
        'count': len(music)
    }
    
    return jsonify(data)

@bp.route('/upload/music', methods=['POST'])
@login_required
def upload_music():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.rsplit('.', 1)[1].lower() in ['mp3', 'wav', 'ogg']:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'music', unique_filename)
        file.save(save_path)
        
        title = request.form.get('title', filename)
        artist = request.form.get('artist', 'Unknown Artist')
        
        music = Music(
            title=title,
            artist=artist,
            file_path='uploads/music/' + unique_filename,
            uploaded_by=current_user.id
        )
        
        db.session.add(music)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'music': {
                'id': music.id,
                'title': music.title,
                'artist': music.artist,
                'file_path': url_for('static', filename=music.file_path)
            }
        })
    
    return jsonify({'error': 'File type not allowed'}), 400

@bp.route('/posts/<int:id>/like', methods=['POST'])
@login_required
def like_post(id):
    post = Post.query.get_or_404(id)
    data = request.get_json()
    liked = data.get('liked', True)
    
    # Check if the user has already liked this post
    if liked:
        # Add like if not already liked
        if current_user not in post.liked_by.all():
            post.liked_by.append(current_user)
            db.session.commit()
    else:
        # Remove like if already liked
        if current_user in post.liked_by.all():
            post.liked_by.remove(current_user)
            db.session.commit()
    
    return jsonify({
        'success': True,
        'post_id': post.id,
        'likes_count': post.liked_by.count(),
        'liked_by_user': current_user in post.liked_by.all()
    })

@bp.route('/update_preference', methods=['POST'])
@login_required
def update_preference():
    data = request.get_json()
    user_id = data.get('user_id')
    dark_mode = data.get('dark_mode', False)
    
    # Ensure the user can only update their own preferences
    if int(user_id) != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    user.dark_mode = dark_mode
    db.session.commit()
    
    return jsonify({
        'success': True,
        'user_id': user.id,
        'dark_mode': user.dark_mode
    })

@bp.route('/youtube/save', methods=['POST'])
@login_required
def save_youtube():
    data = request.json
    if not data or 'playlistId' not in data or 'title' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    
    playlist_id = data.get('playlistId')
    title = data.get('title')
    thumbnail_url = data.get('thumbnailUrl')
    is_playlist = data.get('isPlaylist', True)
    
    # Check if this playlist already exists for this user
    existing = YouTubePlaylist.query.filter_by(
        user_id=current_user.id, 
        playlist_id=playlist_id
    ).first()
    
    if existing:
        # Update timestamp to mark as recently played
        existing.timestamp = datetime.utcnow()
        db.session.commit()
        return jsonify({'success': True, 'id': existing.id})
    
    # Create new playlist record
    playlist = YouTubePlaylist(
        title=title,
        playlist_id=playlist_id,
        thumbnail_url=thumbnail_url,
        is_playlist=is_playlist,
        user_id=current_user.id
    )
    
    db.session.add(playlist)
    db.session.commit()
    
    return jsonify({'success': True, 'id': playlist.id})

@bp.route('/youtube/recent', methods=['GET'])
@login_required
def get_recent_youtube():
    recent = YouTubePlaylist.query.filter_by(
        user_id=current_user.id
    ).order_by(YouTubePlaylist.timestamp.desc()).limit(5).all()
    
    result = []
    for item in recent:
        result.append({
            'id': item.id,
            'title': item.title,
            'playlistId': item.playlist_id,
            'thumbnailUrl': item.thumbnail_url,
            'isPlaylist': item.is_playlist,
            'timestamp': item.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify(result)
