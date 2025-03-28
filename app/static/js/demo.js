/**
 * SynthWave Social - Demo Script
 * This script simulates the functionality of the platform for demonstration purposes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Simulate post likes
    setupLikeButtons();
    
    // Simulate dark mode toggle
    setupDarkModeToggle();
    
    // Simulate notifications
    setupNotifications();
    
    // Simulate music player
    setupMusicPlayer();
    
    // Simulate post creation
    setupPostCreation();
});

function setupLikeButtons() {
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', function() {
            const isLiked = this.classList.contains('liked');
            const likeCount = this.querySelector('.like-count');
            const heartIcon = this.querySelector('i');
            
            // Toggle liked state
            this.classList.toggle('liked');
            
            // Update heart icon
            if (isLiked) {
                heartIcon.classList.remove('fas');
                heartIcon.classList.add('far');
                likeCount.textContent = parseInt(likeCount.textContent) - 1;
                showNotification('info', 'Post unliked');
            } else {
                heartIcon.classList.remove('far');
                heartIcon.classList.add('fas');
                likeCount.textContent = parseInt(likeCount.textContent) + 1;
                showNotification('success', 'Post liked!');
            }
        });
    });
}

function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('light-mode');
            const isDarkMode = !document.body.classList.contains('light-mode');
            
            // Update icon
            const icon = this.querySelector('i');
            if (isDarkMode) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                showNotification('info', 'Dark mode enabled');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                showNotification('info', 'Light mode enabled');
            }
        });
    }
}

function setupNotifications() {
    // Create notifications container if it doesn't exist
    if (!document.querySelector('.notifications-container')) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }
    
    // Show a welcome notification
    setTimeout(() => {
        showNotification('success', 'Welcome to SynthWave Social!');
    }, 1000);
}

function setupMusicPlayer() {
    const playButtons = document.querySelectorAll('.play-button');
    if (playButtons.length > 0) {
        playButtons.forEach(button => {
            button.addEventListener('click', function() {
                const trackName = this.getAttribute('data-track-name');
                const isPlaying = this.classList.contains('playing');
                
                // Reset all buttons
                document.querySelectorAll('.play-button').forEach(btn => {
                    btn.classList.remove('playing');
                    btn.innerHTML = '<i class="fas fa-play"></i>';
                });
                
                if (!isPlaying) {
                    // Set this button to playing
                    this.classList.add('playing');
                    this.innerHTML = '<i class="fas fa-pause"></i>';
                    showNotification('info', `Now playing: ${trackName}`);
                }
            });
        });
    }
}

function setupPostCreation() {
    const createPostForm = document.querySelector('.create-post-form');
    if (createPostForm) {
        createPostForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success notification
            showNotification('success', 'Your post has been created!');
            
            // Reset form
            this.reset();
            
            // Close modal if exists
            const modal = document.getElementById('createPostModal');
            if (modal) {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            }
        });
    }
}

function showNotification(type, message) {
    const container = document.querySelector('.notifications-container');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification-toast`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button type="button" class="btn-close" aria-label="Close"></button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add close button functionality
    notification.querySelector('.btn-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}
