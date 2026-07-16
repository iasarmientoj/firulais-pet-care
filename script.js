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
        '.about-images, .about-content, .services-header, .service-card, .services-cta, .stat-item, .gallery-header, .gallery-row'
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
            threshold: 0 // Trigger as soon as any part of the element enters the viewport
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


    /* ==========================================================================
       6. Gallery Lightbox
       ========================================================================== */
    const galleryItems   = Array.from(document.querySelectorAll('.gallery-item'));
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxClose   = document.getElementById('lightboxClose');
    const lightboxPrev    = document.getElementById('lightboxPrev');
    const lightboxNext    = document.getElementById('lightboxNext');
    const lightboxDots    = document.getElementById('lightboxDots');
    const lightboxIcon    = document.getElementById('lightboxIcon');
    const lightboxLabel   = document.getElementById('lightboxLabel');

    if (galleryItems.length && lightboxOverlay) {
        let currentIndex = 0;

        // Gallery image sources — map index to file path
        const galleryData = [
            { src: 'assets/gallery-1.jpg',  alt: 'Firulais Pet Care — Photo 1'  },
            { src: 'assets/gallery-2.jpg',  alt: 'Firulais Pet Care — Photo 2'  },
            { src: 'assets/gallery-3.jpg',  alt: 'Firulais Pet Care — Photo 3'  },
            { src: 'assets/gallery-4.jpg',  alt: 'Firulais Pet Care — Photo 4'  },
            { src: 'assets/gallery-5.jpg',  alt: 'Firulais Pet Care — Photo 5'  },
            { src: 'assets/gallery-6.jpg',  alt: 'Firulais Pet Care — Photo 6'  },
            { src: 'assets/gallery-7.jpg',  alt: 'Firulais Pet Care — Photo 7'  },
            { src: 'assets/gallery-8.jpg',  alt: 'Firulais Pet Care — Photo 8'  },
            { src: 'assets/gallery-9.jpg',  alt: 'Firulais Pet Care — Photo 9'  },
            { src: 'assets/gallery-10.jpg', alt: 'Firulais Pet Care — Photo 10' },
        ];

        const lightboxContent  = document.getElementById('lightboxContent');
        const lightboxPlaceholder = document.getElementById('lightboxPlaceholder');

        // Create a persistent <img> for the lightbox (reuse, just change src)
        const lightboxImg = document.createElement('img');
        lightboxImg.className = 'lightbox-real-img';
        lightboxImg.alt = '';
        lightboxContent.appendChild(lightboxImg);

        // Build indicator dots
        galleryData.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'lightbox-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
            dot.addEventListener('click', () => showItem(i));
            lightboxDots.appendChild(dot);
        });

        /** Show a specific item in the lightbox */
        function showItem(index) {
            currentIndex = (index + galleryData.length) % galleryData.length;
            const data = galleryData[currentIndex];

            // Hide the emoji placeholder, show the real image
            if (lightboxPlaceholder) lightboxPlaceholder.style.display = 'none';
            lightboxImg.src = data.src;
            lightboxImg.alt = data.alt;

            // Smooth image swap with a brief fade
            lightboxImg.style.opacity = '0';
            requestAnimationFrame(() => {
                lightboxImg.style.transition = 'opacity 0.25s ease';
                lightboxImg.style.opacity = '1';
            });

            // Update dots
            lightboxDots.querySelectorAll('.lightbox-dot').forEach((d, i) => {
                d.classList.toggle('active', i === currentIndex);
            });
        }

        /** Open lightbox */
        function openLightbox(index) {
            showItem(index);
            lightboxOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        /** Close lightbox */
        function closeLightbox() {
            lightboxOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Open on gallery item click
        galleryItems.forEach((item, i) => {
            item.addEventListener('click', () => openLightbox(i));
        });

        // Show More / Show Less functionality for mobile gallery
        const btnGalleryMore = document.getElementById('btnGalleryMore');
        const galleryGridWrapper = document.getElementById('galleryGridWrapper');
        if (btnGalleryMore && galleryGridWrapper) {
            btnGalleryMore.addEventListener('click', () => {
                const isExpanded = galleryGridWrapper.classList.toggle('expanded');
                btnGalleryMore.textContent = isExpanded ? 'Show Less' : 'Show More';
            });
        }

        // Close button
        lightboxClose.addEventListener('click', closeLightbox);

        // Prev / Next
        lightboxPrev.addEventListener('click', () => showItem(currentIndex - 1));
        lightboxNext.addEventListener('click', () => showItem(currentIndex + 1));

        // Click outside content to close
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightboxOverlay.classList.contains('active')) return;
            if (e.key === 'Escape')       closeLightbox();
            if (e.key === 'ArrowLeft')    showItem(currentIndex - 1);
            if (e.key === 'ArrowRight')   showItem(currentIndex + 1);
        });
    }



    /* ==========================================================================
       7. FAQ Accordion
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const btn    = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        // Wrap answer content in a div so grid-template-rows animation works
        if (answer && !answer.querySelector(':scope > div')) {
            const wrapper = document.createElement('div');
            while (answer.firstChild) wrapper.appendChild(answer.firstChild);
            answer.appendChild(wrapper);
        }

        // Remove the HTML `hidden` attribute — visibility controlled by CSS class instead
        if (answer) answer.removeAttribute('hidden');

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('open');

            // Close all other open items (accordion behaviour)
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove('open');
                    other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle the clicked item
            if (isOpen) {
                item.classList.remove('open');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });





    /* ==========================================================================
       9. Extend reveal observer to include new sections
       ========================================================================== */
    const newSectionEls = document.querySelectorAll(
        '.how-header, .how-step, .contact-form-wrap, .contact-info-wrap, ' +
        '.faq-header, .faq-item, .cta-content, .cta-image-area'
    );

    if (newSectionEls.length > 0) {
        const newRevealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger each element slightly based on its position index
                    const delay = entry.target.dataset.revealDelay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, delay);
                    newRevealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0 });

        newSectionEls.forEach((el, i) => {
            // Set initial hidden state and a small stagger delay
            el.style.opacity = '0';
            el.style.transform = 'translateY(22px)';
            el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
            el.dataset.revealDelay = (i % 4) * 80; // stagger within each row
            newRevealObserver.observe(el);
        });

        // Add a CSS rule for .visible on these elements dynamically
        const style = document.createElement('style');
        style.textContent = `
            .how-header.visible, .how-step.visible,
            .contact-form-wrap.visible, .contact-info-wrap.visible,
            .faq-header.visible, .faq-item.visible,
            .cta-content.visible, .cta-image-area.visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    /* ==========================================================================
       10. Scroll Spy - Active Navigation Link Highlight
       ========================================================================== */
    const navLinks = document.querySelectorAll('.nav-link');
    const sectionsToSpy = ['hero', 'about', 'services', 'gallery', 'contact', 'faq'];

    function scrollSpyHighlight() {
        let activeId = 'hero';
        let minDistance = Infinity;

        sectionsToSpy.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                const rect = section.getBoundingClientRect();
                // Proximity check: distance to viewport offset
                const distance = Math.abs(rect.top - 180);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    activeId = id;
                }
            }
        });

        // Fallback for top of the page scroll position
        if (window.scrollY < 60) {
            activeId = 'hero';
        }

        // Apply active class to the link matching activeId
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', scrollSpyHighlight, { passive: true });
    scrollSpyHighlight(); // Run once on initialization

});
