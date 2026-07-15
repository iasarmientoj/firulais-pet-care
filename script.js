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
    
    // Playlist containing the 3 promotional videos
    const videoPlaylist = [
        'assets/video1.mp4',
        'assets/video2.mp4',
        'assets/video3.mp4'
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

    /* ==========================================================================
       3. Sticky Header — becomes solid on scroll
       ========================================================================== */
    const mainHeader = document.getElementById('mainHeader');

    if (mainHeader) {
        const onScroll = () => {
            if (window.scrollY > 60) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); // Run once on load in case page is already scrolled
    }


    /* ==========================================================================
       4. Scroll-Reveal for About & Services sections
       ========================================================================== */
    const revealItems = document.querySelectorAll(
        '.about-images, .about-content, .services-header, .service-card, .services-cta, .stat-item'
    );

    if (revealItems.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target); // Animate only once
                }
            });
        }, {
            threshold: 0.12 // Trigger when 12% of the element is in view
        });

        revealItems.forEach(el => revealObserver.observe(el));
    }

    /* ==========================================================================
       5. Animated Number Counter for Stats Strip
       ========================================================================== */
    /**
     * Animates a number from 0 to target over ~1.4s using easeOutQuart
     * @param {HTMLElement} el - The .stat-count span element
     * @param {number} target  - Final numeric value
     * @param {boolean} isDecimal - If true, displays value as X.X (e.g. 4.9)
     */
    function animateCount(el, target, isDecimal) {
        const duration = 1400;
        const startTime = performance.now();

        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const current = eased * target;

            if (isDecimal) {
                // Show as e.g. "4.9" (divide internal 49 by 10)
                el.textContent = (current / 10).toFixed(1);
            } else {
                el.textContent = Math.round(current);
            }

            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    // Observe stat items to trigger counter on first visibility
    const statItems = document.querySelectorAll('.stat-item');

    if (statItems.length > 0) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item     = entry.target;
                    const target   = parseInt(item.dataset.target, 10);
                    const isDecimal = item.dataset.decimal === 'true';
                    const countEl  = item.querySelector('.stat-count');

                    if (countEl && !item.dataset.counted) {
                        item.dataset.counted = 'true'; // Prevent re-triggering
                        animateCount(countEl, target, isDecimal);
                    }

                    statObserver.unobserve(item);
                }
            });
        }, { threshold: 0.3 });

        statItems.forEach(el => statObserver.observe(el));
    }
});
