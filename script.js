/**
 * Firulais Pet Care - Interactive Mouse Paw Trail
 * Optimized for desktop users. Disables itself on touch screens to prevent issues.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Detect touch-based mobile/tablet devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

    if (!isTouchDevice) {
        let lastX = 0;
        let lastY = 0;
        let isLeftPaw = true;
        let firstMove = true;
        
        // Define paw trail spacing (in pixels) to simulate distinct dog steps
        const stepSpacing = 45; 
        const pawSize = 24; // Width/height of the trail paw print

        window.addEventListener('mousemove', (e) => {
            // Set initial position on first movement
            if (firstMove) {
                lastX = e.clientX;
                lastY = e.clientY;
                firstMove = false;
                return;
            }

            // Calculate distance since the last step
            const distance = Math.hypot(e.clientX - lastX, e.clientY - lastY);

            if (distance > stepSpacing) {
                // Calculate direction angle of movement (in radians)
                const angleRad = Math.atan2(e.clientY - lastY, e.clientX - lastX);
                // Convert to degrees and add 90 (to align the default upright orientation of the image)
                let angleDeg = angleRad * (180 / Math.PI) + 90;
                
                // Alternate between left and right paws
                isLeftPaw = !isLeftPaw;
                
                // Add perpendicular offset for realistic left/right foot tracks
                const perpAngle = angleRad + (isLeftPaw ? -1 : 1) * Math.PI / 2;
                const offsetDist = 8; // Pixels away from the center path
                const offsetX = Math.cos(perpAngle) * offsetDist;
                const offsetY = Math.sin(perpAngle) * offsetDist;
                
                // Create paw print element
                const paw = document.createElement('img');
                paw.src = 'assets/huella.png';
                paw.className = 'paw-trail-print';
                
                // Calculate absolute page coordinates (supports page scrolling)
                const posX = e.pageX + offsetX - (pawSize / 2);
                const posY = e.pageY + offsetY - (pawSize / 2);
                
                paw.style.left = `${posX}px`;
                paw.style.top = `${posY}px`;
                
                // Add minor tilt for a organic feel
                const finalRotate = angleDeg + (isLeftPaw ? -8 : 8);
                paw.style.rotate = `${finalRotate}deg`;
                
                document.body.appendChild(paw);
                
                // Update tracker coordinates
                lastX = e.clientX;
                lastY = e.clientY;
                
                // Remove the paw print from DOM after fade-out animation completes (1.2 seconds)
                setTimeout(() => {
                    paw.remove();
                }, 1200);
            }
        });
    }
});
