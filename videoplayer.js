document.addEventListener('DOMContentLoaded', () => {
    const videoPlayerBtn = document.getElementById('video-player-btn');
    if (!videoPlayerBtn) {
        console.error('Video player button not found');
        return;
    }

    const videoPlayerPopup = document.createElement('div');
    videoPlayerPopup.id = 'video-player-popup';
    document.body.appendChild(videoPlayerPopup);

    const playlistId = 'PLQ2eZ195XtL126eyaiVXinY5Z3mpsyAu3';

    function createVideoPlayerPopup() {
        videoPlayerPopup.innerHTML = `
            <div class="video-player-content">
                <button id="close-video-player">&times;</button>
                <div id="video-container"></div>
                <div id="playlist-title">YouTube Playlist</div>
            </div>
        `;
        
        document.getElementById('close-video-player').addEventListener('click', closeVideoPlayerPopup);
        
        videoPlayerPopup.style.display = 'none';
    }

    function openVideoPlayerPopup() {
        videoPlayerPopup.style.display = 'block';
        loadPlaylist();
    }

    function closeVideoPlayerPopup() {
        videoPlayerPopup.style.display = 'none';
        document.getElementById('video-container').innerHTML = '';
    }
function loadPlaylist(retryCount = 0) {
    const container = document.getElementById('video-container');
    container.innerHTML = '<div id="loading">Loading playlist...</div>';
    
    const iframe = document.createElement('iframe');
    iframe.width = '560';
    iframe.height = '315';
    iframe.src = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; encrypted-media';
    iframe.allowFullscreen = true;
    
    iframe.onload = () => {
        container.innerHTML = '';
        container.appendChild(iframe);
    };
    
    iframe.onerror = () => {
        if (retryCount < 3) {
            setTimeout(() => loadPlaylist(retryCount + 1), 2000);
        } else {
            container.innerHTML = 'Error loading playlist. Please try again later.';
        }
    };
    
    // Set a timeout in case the iframe fails to load or trigger any event
    setTimeout(() => {
        if (container.innerHTML.includes('Loading playlist')) {
            if (retryCount < 3) {
                loadPlaylist(retryCount + 1);
            } else {
                container.innerHTML = 'Error loading playlist. Please check your internet connection and try again.';
            }
        }
    }, 10000); // 10 seconds timeout
}

    // Call this function to set up the popup
    createVideoPlayerPopup();

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        #video-player-popup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            z-index: 1000;
        }
        #close-video-player {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
        }
        #playlist-title {
            text-align: center;
            margin-top: 10px;
            font-weight: bold;
        }
    `;
    document.head.appendChild(style);
});
