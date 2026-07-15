/**
 * Firulais Pet Care - Interactive Effects
 * 
 * Includes:
 * 1. Sequential Video Silhouette Mask Playlist (plays video -> shows static dog -> plays next video)
 * 2. Mouse Movement Paw Trail (desktop only)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================================================
       1. Sequential Video Silhouette Mask Playlist
       ========================================================================== */
    const dogWrapper = document.getElementById('dogWrapper');
    const dogVideo = document.getElementById('dogVideo');
    
    // Playlist containing the 5 promotional videos
    const videoPlaylist = [
        'assets/video1.mp4',
        'assets/video2.mp4',
        'assets/video3.mp4',
        'assets/video4.mp4',
        'assets/video5.mp4'
    ];
    let currentVideoIndex = 0;
    
    if (dogWrapper && dogVideo) {
        // Triggered when a video successfully starts rendering frames (buffering complete)
        dogVideo.addEventListener('playing', () => {
            dogWrapper.classList.add('video-active');
        });
        
        // Triggered when the current video finishes playing
        dogVideo.addEventListener('ended', () => {
            // Smoothly cross-fade back to the static dog image
            dogWrapper.classList.remove('video-active');
            
            // Wait 3 seconds showing the static dog, then play the next video
            setTimeout(playNextVideo, 3000);
        });
        
        // Start the first video 2.2 seconds after page load (allowing the slide-up animation to settle)
        setTimeout(() => {
            playVideo(0);
        }, 2200);
    }
    
    /**
     * Loads and starts playing a video by playlist index
     * @param {number} index - Index of the video in the videoPlaylist array
     */
    function playVideo(index) {
        currentVideoIndex = index;
        dogVideo.src = videoPlaylist[currentVideoIndex];
        dogVideo.load();
        
        // Autoplay call wrapped in a promise catch to meet browser autoplay sandboxing
        dogVideo.play().catch(err => {
            console.warn("Autoplay was prevented by the browser. Waiting for user interaction.", err);
            
            // Fallback: Start the sequence on the first click anywhere on the page
            const startOnInteraction = () => {
                dogVideo.play().catch(e => console.log("Play failed:", e));
                document.removeEventListener('click', startOnInteraction);
            };
            document.addEventListener('click', startOnInteraction);
        });
    }
    
    /**
     * Advances to and plays the next video in sequence
     */
    function playNextVideo() {
        const nextIndex = (currentVideoIndex + 1) % videoPlaylist.length;
        playVideo(nextIndex);
    }


    /* ==========================================================================
       2. Mouse Movement Paw Trail (Desktop Only)
       ========================================================================== */
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

    if (!isTouchDevice) {
        let lastX = 0;
        let lastY = 0;
        let isLeftPaw = true;
        let firstMove = true;
        
        const stepSpacing = 45; // Minimum travel distance in pixels before stamping another paw
        const pawSize = 24;     // Size of the footprint image

        window.addEventListener('mousemove', (e) => {
            if (firstMove) {
                lastX = e.clientX;
                lastY = e.clientY;
                firstMove = false;
                return;
            }

            const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);

            if (distance > stepSpacing) {
                // Determine direction of mouse movement (radians to degrees)
                const angleRad = Math.atan2(e.clientY - lastY, e.clientX - lastX);
                let angleDeg = angleRad * (180 / Math.PI) + 90; // Add 90 to align vertical image
                
                isLeftPaw = !isLeftPaw;
                
                // Add perpendicular offsets for left vs right tracks
                const perpAngle = angleRad + (isLeftPaw ? -1 : 1) * Math.PI / 2;
                const offsetDist = 8; 
                const offsetX = Math.cos(perpAngle) * offsetDist;
                const offsetY = Math.sin(perpAngle) * offsetDist;
                
                // Create paw print element
                const paw = document.createElement('img');
                paw.src = 'assets/huella.png';
                paw.className = 'paw-trail-print';
                
                // Absolute positioning to handle window scrolling
                const posX = e.pageX + offsetX - (pawSize / 2);
                const posY = e.pageY + offsetY - (pawSize / 2);
                
                paw.style.left = `${posX}px`;
                paw.style.top = `${posY}px`;
                
                // Tweak angle slightly for a natural walking look
                const finalRotate = angleDeg + (isLeftPaw ? -8 : 8);
                paw.style.rotate = `${finalRotate}deg`;
                
                document.body.appendChild(paw);
                
                // Keep track of current coordinates
                lastX = e.clientX;
                lastY = e.clientY;
                
                // Remove the element after the CSS fade animation ends
                setTimeout(() => {
                    paw.remove();
                }, 1200);
            }
        });
    }
});
