/**
 * Screen Effects Utility Module
 * Visual effects like screen shake, flash, particles
 * @module utils/screenEffects
 */

/**
 * Apply screen shake effect to an element
 * @param {HTMLElement} element - Element to shake
 * @param {number} intensity - Shake intensity in pixels (default: 5)
 * @param {number} duration - Duration in milliseconds (default: 200)
 */
export function screenShake(element, intensity = 5, duration = 200) {
    if (!element) return;

    const originalTransform = element.style.transform || '';
    const startTime = Date.now();

    function shake() {
        const elapsed = Date.now() - startTime;

        if (elapsed < duration) {
            // Random shake within intensity bounds
            const x = (Math.random() - 0.5) * intensity * 2;
            const y = (Math.random() - 0.5) * intensity * 2;

            // Decrease intensity over time (easing out)
            const progress = elapsed / duration;
            const currentIntensity = intensity * (1 - progress);

            element.style.transform = `translate(${x * (1 - progress)}px, ${y * (1 - progress)}px) ${originalTransform}`;
            requestAnimationFrame(shake);
        } else {
            // Reset to original
            element.style.transform = originalTransform;
        }
    }

    shake();
}

/**
 * Flash effect on element
 * @param {HTMLElement} element - Element to flash
 * @param {string} color - Flash color (default: white)
 * @param {number} duration - Duration in milliseconds (default: 150)
 */
export function flashEffect(element, color = 'rgba(255, 255, 255, 0.5)', duration = 150) {
    if (!element) return;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: ${color};
        pointer-events: none;
        z-index: 9997;
        animation: fadeOut ${duration}ms ease-out forwards;
    `;

    // Add fade out animation if not exists
    if (!document.getElementById('flashAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'flashAnimationStyle';
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.remove();
    }, duration);
}

/**
 * Create enhanced particle burst
 * @param {Array} particlesArray - Array to push particles to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Particle color
 * @param {number} count - Number of particles (default: 20)
 * @param {number} speed - Particle speed multiplier (default: 1)
 */
export function createParticleBurst(particlesArray, x, y, color = '#00d4ff', count = 20, speed = 1) {
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const velocity = (2 + Math.random() * 3) * speed;

        particlesArray.push({
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 30 + Math.random() * 20,
            maxLife: 30 + Math.random() * 20,
            size: 2 + Math.random() * 3,
            color,
            gravity: 0.1
        });
    }
}

/**
 * Create sparkle effect
 * @param {Array} particlesArray - Array to push particles to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Sparkle color
 * @param {number} count - Number of sparkles (default: 10)
 */
export function createSparkles(particlesArray, x, y, color = '#ffd700', count = 10) {
    for (let i = 0; i < count; i++) {
        particlesArray.push({
            x: x + (Math.random() - 0.5) * 50,
            y: y + (Math.random() - 0.5) * 50,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2 - 1, // Slight upward bias
            life: 40 + Math.random() * 20,
            maxLife: 40 + Math.random() * 20,
            size: 3 + Math.random() * 2,
            color,
            type: 'sparkle',
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
        });
    }
}

/**
 * Create confetti burst
 * @param {Array} particlesArray - Array to push particles to
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} count - Number of confetti pieces (default: 30)
 */
export function createConfettiBurst(particlesArray, x, y, count = 30) {
    const colors = ['#00d4ff', '#4ade80', '#ffd700', '#ff6600', '#ff00ff'];

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 3 + Math.random() * 5;

        particlesArray.push({
            x,
            y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 2, // Upward initial velocity
            life: 60 + Math.random() * 40,
            maxLife: 60 + Math.random() * 40,
            size: 4 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'confetti',
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.3,
            gravity: 0.15
        });
    }
}

/**
 * Render improved particles on canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Array} particlesArray - Array of particles to render
 */
export function renderParticles(ctx, particlesArray) {
    particlesArray.forEach((particle, index) => {
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        // Apply gravity if present
        if (particle.gravity) {
            particle.vy += particle.gravity;
        }

        // Apply rotation if present
        if (particle.rotSpeed) {
            particle.rotation += particle.rotSpeed;
        }

        // Remove dead particles
        if (particle.life <= 0) {
            particlesArray.splice(index, 1);
            return;
        }

        // Calculate alpha based on remaining life
        const alpha = particle.life / particle.maxLife;

        ctx.save();

        if (particle.type === 'sparkle') {
            // Draw sparkle as a star
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.shadowBlur = 15;
            ctx.shadowColor = particle.color;
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha;

            // Draw 4-pointed star
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const x = Math.cos(angle) * particle.size;
                const y = Math.sin(angle) * particle.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.fill();
        } else if (particle.type === 'confetti') {
            // Draw confetti as rotating rectangles
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        } else {
            // Draw normal particle as a circle with glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = particle.color;
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    });
}

/**
 * Create text popup effect
 * @param {string} text - Text to display
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} color - Text color (default: #00d4ff)
 * @param {number} fontSize - Font size (default: 20)
 * @param {number} duration - Duration in milliseconds (default: 1000)
 */
export function createTextPopup(text, x, y, color = '#00d4ff', fontSize = 20, duration = 1000) {
    const element = document.createElement('div');
    element.className = 'text-popup';
    element.textContent = text;
    element.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        color: ${color};
        font-size: ${fontSize}px;
        font-weight: bold;
        font-family: 'Orbitron', 'Courier New', monospace;
        text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
        pointer-events: none;
        z-index: 9996;
        animation: popupFloat ${duration}ms ease-out forwards;
        transform: translate(-50%, -50%);
    `;

    // Add animation style if not exists
    if (!document.getElementById('popupAnimationStyle')) {
        const style = document.createElement('style');
        style.id = 'popupAnimationStyle';
        style.textContent = `
            @keyframes popupFloat {
                0% {
                    transform: translate(-50%, -50%) scale(0.5);
                    opacity: 0;
                }
                20% {
                    transform: translate(-50%, -60px) scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: translate(-50%, -100px) scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(element);

    setTimeout(() => {
        element.remove();
    }, duration);
}

/**
 * Pulse animation on element
 * @param {HTMLElement} element - Element to pulse
 * @param {number} scale - Max scale (default: 1.2)
 * @param {number} duration - Duration in milliseconds (default: 300)
 */
export function pulseElement(element, scale = 1.2, duration = 300) {
    if (!element) return;

    const originalTransform = element.style.transform || '';

    element.style.transition = `transform ${duration / 2}ms ease-out`;
    element.style.transform = `${originalTransform} scale(${scale})`;

    setTimeout(() => {
        element.style.transform = originalTransform;
        setTimeout(() => {
            element.style.transition = '';
        }, duration / 2);
    }, duration / 2);
}
