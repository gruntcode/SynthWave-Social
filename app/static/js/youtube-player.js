/**
 * SynthWave Social - YouTube Player Integration
 */

document.addEventListener('DOMContentLoaded', function() {
    // YouTube API variables
    let player;
    let youtubePlayerReady = false;
    let minimized = false;
    
    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // YouTube API callback
    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('youtubePlayer', {
            height: '180',
            width: '100%',
            playerVars: {
                'playsinline': 1,
                'controls': 1,
                'autoplay': 0,
                'enablejsapi': 1,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange,
                'onError': onPlayerError
            }
        });
    };
    
    function onPlayerReady(event) {
        youtubePlayerReady = true;
        console.log('YouTube player ready');
        
        // Load recent playlists
        loadRecentYoutubePlaylists();
    }
    
    function onPlayerStateChange(event) {
        // Update player title based on current video
        if (event.data === YT.PlayerState.PLAYING) {
            updatePlayerTitle();
        }
    }
    
    function onPlayerError(event) {
        console.error('YouTube player error:', event.data);
    }
    
    function updatePlayerTitle() {
        if (player && youtubePlayerReady) {
            const title = player.getVideoData().title;
            document.getElementById('youtubePlayerTitle').textContent = title || 'YouTube Player';
        }
    }
    
    // Handle YouTube playlist loading
    const addYoutubeBtn = document.getElementById('addYoutubeBtn');
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const youtubePlayerContainer = document.getElementById('youtubePlayerContainer');
    const closeYoutubeBtn = document.getElementById('closeYoutubeBtn');
    const minimizeYoutubeBtn = document.getElementById('minimizeYoutubeBtn');
    
    if (addYoutubeBtn) {
        addYoutubeBtn.addEventListener('click', function() {
            const youtubeUrl = youtubeUrlInput.value.trim();
            if (!youtubeUrl) return;
            
            // Extract playlist or video ID from URL
            let playlistId = '';
            let videoId = '';
            let isPlaylist = false;
            let title = 'YouTube Content';
            let thumbnailUrl = '';
            
            if (youtubeUrl.includes('list=')) {
                // It's a playlist
                playlistId = youtubeUrl.split('list=')[1];
                if (playlistId.includes('&')) {
                    playlistId = playlistId.split('&')[0];
                }
                isPlaylist = true;
                title = 'YouTube Playlist';
            } else if (youtubeUrl.includes('youtube.com/watch')) {
                // Regular YouTube video URL
                const urlParams = new URLSearchParams(youtubeUrl.split('?')[1]);
                videoId = urlParams.get('v');
                title = 'YouTube Video';
            } else if (youtubeUrl.includes('youtu.be/')) {
                // Shortened YouTube URL
                videoId = youtubeUrl.split('youtu.be/')[1];
                if (videoId.includes('?')) {
                    videoId = videoId.split('?')[0];
                }
                title = 'YouTube Video';
            }
            
            if (!playlistId && !videoId) {
                alert('Invalid YouTube URL. Please enter a valid YouTube playlist or video URL.');
                return;
            }
            
            // Show YouTube player container
            youtubePlayerContainer.style.display = 'block';
            minimized = false;
            
            // Load the content
            if (youtubePlayerReady) {
                if (isPlaylist) {
                    player.cuePlaylist({
                        list: playlistId,
                        listType: 'playlist',
                        index: 0
                    });
                    
                    // Force play after a short delay
                    setTimeout(() => {
                        player.playVideo();
                    }, 500);
                    
                    // Save to recently played
                    saveYoutubePlaylist(playlistId, title, thumbnailUrl, true);
                } else {
                    player.cueVideoById(videoId);
                    
                    // Force play after a short delay
                    setTimeout(() => {
                        player.playVideo();
                    }, 500);
                    
                    // Save to recently played
                    saveYoutubePlaylist(videoId, title, thumbnailUrl, false);
                }
                
                // Close the modal
                const youtubeModal = document.getElementById('youtubeModal');
                const modal = bootstrap.Modal.getInstance(youtubeModal);
                if (modal) {
                    modal.hide();
                }
                
                // Clear the input
                youtubeUrlInput.value = '';
            } else {
                alert('YouTube player is not ready yet. Please try again in a moment.');
            }
        });
    }
    
    // Close YouTube player
    if (closeYoutubeBtn) {
        closeYoutubeBtn.addEventListener('click', function() {
            youtubePlayerContainer.style.display = 'none';
            if (player && youtubePlayerReady) {
                player.pauseVideo();
            }
        });
    }
    
    // Minimize YouTube player
    if (minimizeYoutubeBtn) {
        minimizeYoutubeBtn.addEventListener('click', function() {
            if (minimized) {
                // Expand
                player.setSize(300, 180);
                minimizeYoutubeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                minimized = false;
            } else {
                // Minimize
                player.setSize(300, 0);
                minimizeYoutubeBtn.innerHTML = '<i class="fas fa-expand"></i>';
                minimized = true;
            }
        });
    }
    
    // Save YouTube playlist to recently played
    function saveYoutubePlaylist(playlistId, title, thumbnailUrl, isPlaylist) {
        fetch('/api/youtube/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                playlistId: playlistId,
                title: title,
                thumbnailUrl: thumbnailUrl,
                isPlaylist: isPlaylist
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Saved to recently played:', data);
            // Refresh the recently played list
            loadRecentYoutubePlaylists();
        })
        .catch(error => {
            console.error('Error saving playlist:', error);
        });
    }
    
    // Load recently played YouTube playlists
    function loadRecentYoutubePlaylists() {
        const recentList = document.getElementById('recent-youtube-list');
        if (!recentList) return;
        
        fetch('/api/youtube/recent')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    recentList.innerHTML = `
                        <li class="list-group-item text-center">
                            No recently played content
                        </li>
                    `;
                    return;
                }
                
                let html = '';
                data.forEach(item => {
                    html += `
                        <li class="list-group-item youtube-item" style="cursor: pointer;" data-id="${item.playlistId}" data-is-playlist="${item.isPlaylist}">
                            <div class="d-flex align-items-center">
                                <button class="btn btn-sm youtube-play-btn me-2" 
                                        data-id="${item.playlistId}" 
                                        data-is-playlist="${item.isPlaylist}">
                                    <i class="fab fa-youtube text-danger"></i>
                                </button>
                                <div class="text-truncate">
                                    <div class="fw-bold text-truncate">${item.title}</div>
                                    <small class="text-muted">${item.isPlaylist ? 'Playlist' : 'Video'}</small>
                                </div>
                            </div>
                        </li>
                    `;
                });
                
                recentList.innerHTML = html;
                
                // Add event listeners to play buttons
                const playButtons = recentList.querySelectorAll('.youtube-play-btn');
                playButtons.forEach(button => {
                    button.addEventListener('click', playYoutubeItem);
                });
                
                // Make entire list item clickable
                const youtubeItems = recentList.querySelectorAll('.youtube-item');
                youtubeItems.forEach(item => {
                    item.addEventListener('click', function(e) {
                        // Only trigger if the click wasn't on the button itself
                        if (!e.target.closest('.youtube-play-btn')) {
                            const id = this.dataset.id;
                            const isPlaylist = this.dataset.isPlaylist === 'true';
                            playYoutubeContent(id, isPlaylist, this.querySelector('.fw-bold').textContent);
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Error loading recent playlists:', error);
                recentList.innerHTML = `
                    <li class="list-group-item text-center text-danger">
                        Error loading recent content
                    </li>
                `;
            });
    }
    
    function playYoutubeItem() {
        const id = this.dataset.id;
        const isPlaylist = this.dataset.isPlaylist === 'true';
        playYoutubeContent(id, isPlaylist, this.closest('.d-flex').querySelector('.fw-bold').textContent);
    }
    
    function playYoutubeContent(id, isPlaylist, title) {
        // Show YouTube player container
        youtubePlayerContainer.style.display = 'block';
        minimized = false;
        
        // Reset player size if it was minimized
        if (player && youtubePlayerReady) {
            player.setSize(300, 180);
            if (minimizeYoutubeBtn) {
                minimizeYoutubeBtn.innerHTML = '<i class="fas fa-minus"></i>';
            }
        }
        
        // Load the content
        if (youtubePlayerReady) {
            console.log('Playing:', id, 'isPlaylist:', isPlaylist);
            
            if (isPlaylist) {
                player.cuePlaylist({
                    list: id,
                    listType: 'playlist',
                    index: 0
                });
                
                // Force play after a short delay
                setTimeout(() => {
                    player.playVideo();
                }, 500);
            } else {
                player.cueVideoById(id);
                
                // Force play after a short delay
                setTimeout(() => {
                    player.playVideo();
                }, 500);
            }
            
            // Update the recently played timestamp
            saveYoutubePlaylist(id, title, '', isPlaylist);
        } else {
            alert('YouTube player is not ready yet. Please try again in a moment.');
        }
    }
    
    // Initial load of recently played
    if (document.getElementById('recent-youtube-list')) {
        loadRecentYoutubePlaylists();
    }
});
