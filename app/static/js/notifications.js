/**
 * SynthWave Social - Notifications JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Convert Flask flash messages to notifications
    const flashMessages = document.querySelectorAll('.alert');
    
    flashMessages.forEach(function(alert) {
        const message = alert.innerText.replace('×', '').trim();
        let type = 'info';
        
        if (alert.classList.contains('alert-success')) {
            type = 'success';
        } else if (alert.classList.contains('alert-warning')) {
            type = 'warning';
        } else if (alert.classList.contains('alert-danger')) {
            type = 'danger';
        }
        
        // Show notification
        if (window.showNotification) {
            window.showNotification('SynthWave Social', message, type);
        }
        
        // Remove the original alert
        alert.remove();
    });
    
    // Add event listeners for post actions
    setupPostActionListeners();
});

/**
 * Setup event listeners for post actions (like, comment, etc.)
 */
function setupPostActionListeners() {
    // Like button click
    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const postId = this.dataset.postId;
            const isLiked = this.classList.contains('liked');
            
            // Toggle liked state
            this.classList.toggle('liked');
            
            // Update like count
            const likeCount = this.querySelector('.like-count');
            let count = parseInt(likeCount.innerText);
            
            if (isLiked) {
                count--;
                likeCount.innerText = count;
                window.showNotification('Post Unliked', 'You have removed your like from this post', 'info');
            } else {
                count++;
                likeCount.innerText = count;
                window.showNotification('Post Liked', 'You have liked this post', 'success');
            }
            
            // Send like/unlike request to server
            fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    liked: !isLiked
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Like status updated:', data);
            })
            .catch(error => {
                console.error('Error updating like status:', error);
                // Revert UI changes on error
                this.classList.toggle('liked');
                if (isLiked) {
                    likeCount.innerText = count + 1;
                } else {
                    likeCount.innerText = count - 1;
                }
                window.showNotification('Error', 'Failed to update like status', 'danger');
            });
        });
    });
    
    // Comment form submission
    const commentForms = document.querySelectorAll('.comment-form');
    commentForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const postId = this.dataset.postId;
            const commentInput = this.querySelector('.comment-input');
            const comment = commentInput.value.trim();
            
            if (comment) {
                // Send comment to server
                fetch(`/api/posts/${postId}/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({
                        body: comment
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Comment added:', data);
                    
                    // Clear input
                    commentInput.value = '';
                    
                    // Show notification
                    window.showNotification('Comment Added', 'Your comment has been posted', 'success');
                    
                    // Refresh comments (optional)
                    if (typeof refreshComments === 'function') {
                        refreshComments(postId);
                    }
                })
                .catch(error => {
                    console.error('Error adding comment:', error);
                    window.showNotification('Error', 'Failed to post your comment', 'danger');
                });
            }
        });
    });
    
    // Post deletion
    const deletePostForms = document.querySelectorAll('.delete-post-form');
    deletePostForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                const formAction = this.getAttribute('action');
                
                fetch(formAction, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Find and remove the post from the DOM
                        const postCard = this.closest('.post-card');
                        if (postCard) {
                            postCard.remove();
                        }
                        
                        window.showNotification('Post Deleted', 'Your post has been deleted', 'success');
                    } else {
                        throw new Error('Failed to delete post');
                    }
                })
                .catch(error => {
                    console.error('Error deleting post:', error);
                    window.showNotification('Error', 'Failed to delete your post', 'danger');
                });
            }
        });
    });
}
