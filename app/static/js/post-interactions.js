/**
 * Post Interactions - Handles likes and other post interactions
 */
document.addEventListener('DOMContentLoaded', function() {
    // Handle like button clicks
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            const isLiked = this.classList.contains('liked');
            const likeCount = this.querySelector('.like-count');
            const heartIcon = this.querySelector('i');
            
            // Call the API to toggle like status
            fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    liked: !isLiked
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update UI based on new like status
                    if (data.liked_by_user) {
                        button.classList.add('liked');
                        heartIcon.classList.remove('far');
                        heartIcon.classList.add('fas');
                        
                        // Show notification
                        showNotification('success', 'Post liked!');
                    } else {
                        button.classList.remove('liked');
                        heartIcon.classList.remove('fas');
                        heartIcon.classList.add('far');
                        
                        // Show notification
                        showNotification('info', 'Post unliked');
                    }
                    
                    // Update like count
                    likeCount.textContent = data.likes_count;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('error', 'Failed to update like status');
            });
        });
    });
    
    // Handle comment form submission
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const postId = this.getAttribute('data-post-id');
            const commentInput = document.getElementById('commentBody');
            const commentBody = commentInput.value.trim();
            
            if (!commentBody) {
                showNotification('error', 'Comment cannot be empty');
                return;
            }
            
            fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    body: commentBody
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Clear the input
                    commentInput.value = '';
                    
                    // Add the new comment to the UI
                    addCommentToUI(data.comment);
                    
                    // Update comment count
                    const commentCountElements = document.querySelectorAll('.comment-count');
                    commentCountElements.forEach(element => {
                        const count = parseInt(element.textContent) || 0;
                        element.textContent = count + 1;
                    });
                    
                    // Show notification
                    showNotification('success', 'Comment added!');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('error', 'Failed to add comment');
            });
        });
    }
});

/**
 * Add a new comment to the UI
 */
function addCommentToUI(comment) {
    const commentsContainer = document.querySelector('.comments-container');
    
    // If no comments container exists, create one
    if (!commentsContainer) {
        const cardBody = document.querySelector('.card-body');
        if (cardBody) {
            // Remove the "no comments" message if it exists
            const noCommentsMessage = cardBody.querySelector('p.text-center');
            if (noCommentsMessage) {
                noCommentsMessage.remove();
            }
            
            // Create comments container
            const newCommentsContainer = document.createElement('div');
            newCommentsContainer.className = 'comments-container';
            cardBody.appendChild(newCommentsContainer);
            
            // Add the comment to the new container
            addCommentElement(newCommentsContainer, comment);
        }
    } else {
        // Add the comment to the existing container
        addCommentElement(commentsContainer, comment);
    }
}

/**
 * Create and add a comment element to a container
 */
function addCommentElement(container, comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';
    
    // If there are other comments, add border styling
    const existingComments = container.querySelectorAll('.comment-item');
    if (existingComments.length > 0) {
        existingComments[existingComments.length - 1].classList.add('border-bottom', 'pb-3', 'mb-3');
    }
    
    // Format the timestamp
    const timestamp = new Date(comment.timestamp);
    const formattedDate = timestamp.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
    const formattedTime = timestamp.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    commentElement.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex">
                <img src="${comment.author.profile_image}" alt="${comment.author.username}" class="avatar-small me-2">
                <div>
                    <div class="d-flex align-items-center">
                        <a href="/user/${comment.author.username}" class="fw-bold text-decoration-none me-2">${comment.author.username}</a>
                        <span class="text-muted small">${formattedDate} at ${formattedTime}</span>
                    </div>
                    <p class="mb-0">${comment.body}</p>
                </div>
            </div>
        </div>
    `;
    
    // Add to the beginning of the container
    if (container.firstChild) {
        container.insertBefore(commentElement, container.firstChild);
    } else {
        container.appendChild(commentElement);
    }
}

/**
 * Helper function to show notification
 */
function showNotification(type, message) {
    // Check if the notifications.js is loaded
    if (typeof window.showToast === 'function') {
        window.showToast(type, message);
    } else {
        console.log(`${type}: ${message}`);
    }
}
