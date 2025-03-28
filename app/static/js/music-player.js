/**
 * SynthWave Social - Music Player JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize mini player functionality for sidebar music list
    initSidebarMusicPlayer();
});

/**
 * Initialize music player functionality for sidebar
 */
function initSidebarMusicPlayer() {
    // Get all play buttons in the sidebar music list
    const playButtons = document.querySelectorAll('.play-button');
    if (playButtons.length === 0) return;
    
    // Audio element for mini player
    const miniAudio = new Audio();
    let isPlaying = false;
    
    // Mini player elements
    const miniPlayerPlayPause = document.getElementById('miniPlayerPlayPause');
    const miniPlayerPlayPauseIcon = miniPlayerPlayPause ? miniPlayerPlayPause.querySelector('i') : null;
    
    // Add click event to each play button
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const trackUrl = this.dataset.trackUrl;
            const trackName = this.dataset.trackName;
            
            // Update mini player audio source
            miniAudio.src = trackUrl;
            
            // Update mini player display
            const miniPlayerInfo = document.querySelector('.mini-player-info');
            if (miniPlayerInfo) {
                miniPlayerInfo.textContent = trackName;
            }
            
            // Play the track
            miniAudio.play()
                .then(() => {
                    isPlaying = true;
                    if (miniPlayerPlayPauseIcon) {
                        miniPlayerPlayPauseIcon.className = 'fas fa-pause';
                    }
                    
                    // Update all play buttons to show play icon
                    playButtons.forEach(btn => {
                        btn.querySelector('i').className = 'fas fa-play';
                    });
                    
                    // Update this button to show pause icon
                    this.querySelector('i').className = 'fas fa-pause';
                })
                .catch(error => {
                    console.error('Error playing audio:', error);
                });
        });
    });
    
    // Mini player controls
    if (miniPlayerPlayPause) {
        miniPlayerPlayPause.addEventListener('click', function() {
            if (isPlaying) {
                miniAudio.pause();
                isPlaying = false;
                miniPlayerPlayPauseIcon.className = 'fas fa-play';
            } else {
                miniAudio.play()
                    .then(() => {
                        isPlaying = true;
                        miniPlayerPlayPauseIcon.className = 'fas fa-pause';
                    })
                    .catch(error => {
                        console.error('Error playing audio:', error);
                    });
            }
        });
    }
    
    // Handle audio ended event
    miniAudio.addEventListener('ended', function() {
        isPlaying = false;
        if (miniPlayerPlayPauseIcon) {
            miniPlayerPlayPauseIcon.className = 'fas fa-play';
        }
        
        // Reset all play buttons
        playButtons.forEach(btn => {
            btn.querySelector('i').className = 'fas fa-play';
        });
    });
}
