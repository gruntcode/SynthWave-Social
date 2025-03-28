from app import create_app, db
from app.models import Post, Comment, Music, YouTubePlaylist

app = create_app()

with app.app_context():
    # Delete all YouTube playlists
    print("Deleting YouTube playlists...")
    YouTubePlaylist.query.delete()
    
    # Delete all music entries
    print("Deleting music entries...")
    Music.query.delete()
    
    # Delete all comments
    print("Deleting comments...")
    Comment.query.delete()
    
    # Delete all posts
    print("Deleting posts...")
    Post.query.delete()
    
    # Commit the changes
    db.session.commit()
    
    print("Cleanup complete!")
