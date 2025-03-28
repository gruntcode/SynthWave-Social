/**
 * SynthWave Social - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Post deletion confirmation
    const deletePostForms = document.querySelectorAll('.delete-post-form');
    deletePostForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    });
    
    // Comment deletion confirmation
    const deleteCommentForms = document.querySelectorAll('.delete-comment-form');
    deleteCommentForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    });
    
    // Synthwave effect for hero section (if present)
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        createSynthwaveGrid(heroSection);
    }
    
    // Initialize mini player
    initMiniPlayer();
});

/**
 * Create synthwave grid effect for hero section
 */
function createSynthwaveGrid(container) {
    const grid = document.createElement('div');
    grid.classList.add('synthwave-grid');
    
    // Create grid lines
    for (let i = 0; i < 20; i++) {
        const horizontalLine = document.createElement('div');
        horizontalLine.classList.add('grid-line', 'horizontal');
        horizontalLine.style.top = `${5 * i}%`;
        grid.appendChild(horizontalLine);
        
        const verticalLine = document.createElement('div');
        verticalLine.classList.add('grid-line', 'vertical');
        verticalLine.style.left = `${5 * i}%`;
        grid.appendChild(verticalLine);
    }
    
    container.appendChild(grid);
    
    // Add some CSS for the grid
    const style = document.createElement('style');
    style.textContent = `
        .synthwave-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            perspective: 500px;
            transform-style: preserve-3d;
            overflow: hidden;
        }
        
        .grid-line {
            position: absolute;
            background: linear-gradient(90deg, rgba(255, 0, 204, 0.5) 0%, rgba(51, 51, 255, 0.5) 100%);
            opacity: 0.2;
        }
        
        .grid-line.horizontal {
            height: 1px;
            width: 100%;
            transform: rotateX(60deg);
        }
        
        .grid-line.vertical {
            width: 1px;
            height: 100%;
            transform: rotateY(60deg);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Initialize mini music player
 */
function initMiniPlayer() {
    const miniPlayer = document.getElementById('miniPlayer');
    if (!miniPlayer) return;
    
    const miniPlayerTitle = document.getElementById('miniPlayerTitle');
    const miniPlayerArtist = document.getElementById('miniPlayerArtist');
    const miniPlayerArt = document.getElementById('miniPlayerArt');
    const miniPlayerPlay = document.getElementById('miniPlayerPlay');
    const miniPlayerPrev = document.getElementById('miniPlayerPrev');
    const miniPlayerNext = document.getElementById('miniPlayerNext');
    
    // Audio element
    const audio = new Audio();
    let isPlaying = false;
    
    // Function to update mini player
    window.updateMiniPlayer = function(src, title, artist) {
        audio.src = src;
        miniPlayerTitle.textContent = title;
        miniPlayerArtist.textContent = artist;
        
        // Show mini player
        miniPlayer.classList.add('active');
        
        // Update play button
        const playIcon = miniPlayerPlay.querySelector('i');
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
        
        // Play the track
        audio.play();
        isPlaying = true;
    };
    
    // Play/Pause button
    miniPlayerPlay.addEventListener('click', function() {
        if (!audio.src) return;
        
        const playIcon = this.querySelector('i');
        
        if (isPlaying) {
            audio.pause();
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        } else {
            audio.play();
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        }
        
        isPlaying = !isPlaying;
    });
    
    // Previous button
    miniPlayerPrev.addEventListener('click', function() {
        if (window.musicPlayerControls && window.musicPlayerControls.playPrevTrack) {
            window.musicPlayerControls.playPrevTrack();
        }
    });
    
    // Next button
    miniPlayerNext.addEventListener('click', function() {
        if (window.musicPlayerControls && window.musicPlayerControls.playNextTrack) {
            window.musicPlayerControls.playNextTrack();
        }
    });
    
    // Add CSS to show mini player
    const style = document.createElement('style');
    style.textContent = `
        .mini-player.active {
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}
