/**
 * Main Entry Point
 * Falling Stars - Foundations of Light
 * Modular architecture for iOS/Capacitor deployment
 * @module main
 */

// Core imports
import {
    game,
    initializePlanetBuildings,
    initializeTechnologies,
    initializeDefense,
    loadGameState,
    resetGameState
} from './core/gameState.js';
import { TIMING, CANVAS, FRAGMENT_SPAWN } from './core/constants.js';

// Data imports
import { buildingData, defenseData } from './data/buildings.js';
import { techData } from './data/technologies.js';
import { achievementData } from './data/achievements.js';
import { questData } from './data/quests.js';
import { boostData, eventData } from './data/events.js';
import { astraDialogues } from './data/dialogues.js';

// System imports
import { initAudio, playSound, resumeAudio, playBackgroundMusic, toggleMusic, toggleSound } from './systems/audio.js';
import { initAmbientMusic, startAmbientMusic, stopAmbientMusic, triggerComboMusicEffect, playMilestoneCelebration } from './systems/ambientMusic.js';
import { loadGame, saveGame, processOfflineEarnings, setupAutoSave } from './systems/storage.js';
import { initializeSettingsUI } from './systems/settings.js';
import { initTutorial, onTutorialAction, checkSystemUnlocks, isTutorialActive } from './systems/tutorial.js';
import {
    buyDefense,
    buyBuilding,
    buyTechnology,
    captureFragment,
    switchPlanet as switchPlanetLogic,
    unlockPlanet,
    performPrestige,
    updateGame,
    claimDailyReward,
    openFreeLootbox as openFreeLootboxLogic,
    generateDailyQuests,
    claimQuestReward,
    checkQuestReset,
    checkAchievements,
    activateBoost,
    activateEvent
} from './systems/gameLogic.js';
import {
    showNotification,
    updateAllUI,
    updateResources,
    updateComboDisplay,
    switchTab,
    toggleModal,
    createFloatingText,
    showAstraDialogue,
    updateDailyRewardsDisplay,
    updateLootboxTimer,
    triggerSuccessAnimation
} from './systems/ui.js';

// Utility imports
import { formatNumber, formatCost, formatCostColored, formatLevel } from './utils/formatters.js';
import { getCost, canAfford, checkRequires, calculateClickPower } from './utils/calculations.js';
import { screenShake, flashEffect, createParticleBurst, createSparkles, renderParticles } from './utils/screenEffects.js';

/**
 * Canvas and rendering variables
 */
let canvas, ctx;
let fragments = [];
let particles = [];
let stars = [];
let animationFrameId = null;

/**
 * Game loop intervals
 */
let gameLoopInterval = null;
let uiUpdateInterval = null;
let autoSaveInterval = null;

/**
 * Initialization flags
 */
let gameInitialized = false;
let canvasInitialized = false;

/**
 * Selected tier (set from welcome screen)
 */
let selectedTier = 'FREE';

/**
 * Select a player tier
 * @param {string} tier - FREE, SUPPORTER, or FAST_PASS
 */
window.selectTier = function(tier) {
    selectedTier = tier;
    // Update UI
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.tier-btn').classList.add('active');
};

/**
 * Show full manifesto
 */
window.showManifesto = function() {
    document.getElementById('welcomeMain').style.display = 'none';
    document.getElementById('welcomeManifesto').style.display = 'block';
    game.manifestoSeen = true;
};

/**
 * Hide full manifesto
 */
window.hideManifesto = function() {
    document.getElementById('welcomeMain').style.display = 'block';
    document.getElementById('welcomeManifesto').style.display = 'none';
};

/**
 * Initialize the game
 * Called after user enters username
 */
export function startGame() {
    const usernameInput = document.getElementById('usernameInput');
    const welcomeScreen = document.getElementById('welcome');

    if (usernameInput && usernameInput.value.trim()) {
        game.username = usernameInput.value.trim();
    }

    // Save selected tier
    game.playerTier = selectedTier;
    game.firstTime = false;

    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    // Show game UI
    document.getElementById('header').style.display = 'block';
    document.getElementById('leftIconBar').style.display = 'block';
    document.getElementById('bottomUI').style.display = 'block';

    // Initialize systems
    initCanvas();
    initEventListeners();
    startGameLoops();

    // Auto-save setup
    autoSaveInterval = setupAutoSave(TIMING.SAVE_INTERVAL);

    // Initial UI update (do this before showing dialogue to prevent lag)
    updateAllUI();
    renderAllTabs();

    // Initialize quests if none active
    if (!game.quests.active || game.quests.active.length === 0) {
        generateDailyQuests();
    }

    // Initialize tutorial for new players
    const tutorialStarted = initTutorial();

    // Show random welcome dialogue only if tutorial is not active
    if (!tutorialStarted) {
        setTimeout(() => {
            const randomDialogue = astraDialogues[Math.floor(Math.random() * Math.min(5, astraDialogues.length))];
            showAstraDialogue(randomDialogue.text);
        }, 100);
    }

    // Start ambient music after a short delay (gives time for user interaction for autoplay policy)
    setTimeout(() => {
        if (game.settings.musicEnabled !== false) {
            startAmbientMusic();
        }
    }, 2000);
}

/**
 * Initialize canvas and rendering
 */
function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize multi-layer starfield with parallax
    initStarfield();

    // Mark canvas as initialized (CRITICAL for game loops to start)
    canvasInitialized = true;

    // Start render loop
    renderLoop();
}

/**
 * Initialize immersive starfield with multiple layers and nebulae
 */
function initStarfield() {
    stars.length = 0; // Clear existing stars

    // Star colors for variety
    const starColors = [
        '#ffffff', // White (most common)
        '#ffffff',
        '#ffffff',
        '#ffe9c4', // Warm white
        '#cce0ff', // Cool blue-white
        '#ffccaa', // Orange tint
        '#ccddff', // Blue tint
    ];

    // Layer 1: Distant stars (slowest, smallest, faintest)
    for (let i = 0; i < 150; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 0.8 + 0.2, // 0.2-1.0
            opacity: Math.random() * 0.4 + 0.2, // 0.2-0.6
            layer: 1,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            twinkleSpeed: Math.random() * 0.02 + 0.01
        });
    }

    // Layer 2: Mid-distance stars (medium)
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.2 + 0.8, // 0.8-2.0
            opacity: Math.random() * 0.5 + 0.4, // 0.4-0.9
            layer: 2,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            twinkleSpeed: Math.random() * 0.03 + 0.02
        });
    }

    // Layer 3: Close stars (brightest, largest)
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5 + 1.5, // 1.5-3.0
            opacity: Math.random() * 0.4 + 0.6, // 0.6-1.0
            layer: 3,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            twinkleSpeed: Math.random() * 0.05 + 0.03,
            glow: true // Close stars have glow
        });
    }
}

/**
 * Resize canvas to window size
 */
function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Earth rendering variables
 */
let earthRotation = 0;
let cloudOffset = 0;

/**
 * Render cosmic nebulae in background
 */
function renderNebulae() {
    // Nebula 1: Purple-pink nebula (top-left)
    const nebula1 = ctx.createRadialGradient(
        canvas.width * 0.15,
        canvas.height * 0.2,
        0,
        canvas.width * 0.15,
        canvas.height * 0.2,
        canvas.width * 0.4
    );
    nebula1.addColorStop(0, 'rgba(138, 43, 226, 0.08)');  // Violet
    nebula1.addColorStop(0.3, 'rgba(147, 51, 234, 0.05)');
    nebula1.addColorStop(0.6, 'rgba(219, 39, 119, 0.03)');
    nebula1.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = nebula1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nebula 2: Blue-cyan nebula (top-right)
    const nebula2 = ctx.createRadialGradient(
        canvas.width * 0.8,
        canvas.height * 0.25,
        0,
        canvas.width * 0.8,
        canvas.height * 0.25,
        canvas.width * 0.35
    );
    nebula2.addColorStop(0, 'rgba(0, 212, 255, 0.06)');  // Cyan
    nebula2.addColorStop(0.3, 'rgba(59, 130, 246, 0.04)');
    nebula2.addColorStop(0.6, 'rgba(99, 102, 241, 0.02)');
    nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = nebula2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nebula 3: Orange-red nebula (mid-left)
    const nebula3 = ctx.createRadialGradient(
        canvas.width * 0.1,
        canvas.height * 0.6,
        0,
        canvas.width * 0.1,
        canvas.height * 0.6,
        canvas.width * 0.3
    );
    nebula3.addColorStop(0, 'rgba(251, 146, 60, 0.05)');  // Orange
    nebula3.addColorStop(0.3, 'rgba(249, 115, 22, 0.03)');
    nebula3.addColorStop(0.6, 'rgba(234, 88, 12, 0.02)');
    nebula3.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = nebula3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Nebula 4: Magenta-purple nebula (center-right)
    const nebula4 = ctx.createRadialGradient(
        canvas.width * 0.75,
        canvas.height * 0.55,
        0,
        canvas.width * 0.75,
        canvas.height * 0.55,
        canvas.width * 0.28
    );
    nebula4.addColorStop(0, 'rgba(236, 72, 153, 0.07)');  // Pink
    nebula4.addColorStop(0.3, 'rgba(219, 39, 119, 0.04)');
    nebula4.addColorStop(0.6, 'rgba(190, 24, 93, 0.02)');
    nebula4.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = nebula4;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * Render Earth with procedural texture, clouds, and atmospheric glow
 */
function renderEarth() {
    const earthRadius = 120;
    const earthX = canvas.width / 2;
    const earthY = canvas.height - earthRadius + 20; // Partially visible at bottom

    // Increment rotation for spinning effect (very slow)
    earthRotation += 0.0003;
    cloudOffset += 0.0005;

    ctx.save();
    ctx.translate(earthX, earthY);

    // === Atmospheric Glow (outer) ===
    const glowGradient = ctx.createRadialGradient(0, 0, earthRadius, 0, 0, earthRadius + 40);
    glowGradient.addColorStop(0, 'rgba(100, 200, 255, 0)');
    glowGradient.addColorStop(0.7, 'rgba(100, 200, 255, 0.1)');
    glowGradient.addColorStop(0.85, 'rgba(100, 200, 255, 0.3)');
    glowGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius + 40, 0, Math.PI * 2);
    ctx.fill();

    // === Clip to circle for Earth surface ===
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius, 0, Math.PI * 2);
    ctx.clip();

    // === Base ocean (blue gradient) ===
    const oceanGradient = ctx.createRadialGradient(-30, -30, 0, 0, 0, earthRadius);
    oceanGradient.addColorStop(0, '#4a90e2');  // Bright ocean
    oceanGradient.addColorStop(0.5, '#2171b5'); // Medium blue
    oceanGradient.addColorStop(1, '#084594');   // Deep ocean

    ctx.fillStyle = oceanGradient;
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius, 0, Math.PI * 2);
    ctx.fill();

    // === Procedural continents (green patches) ===
    const continents = [
        { x: -50, y: -20, size: 40, angle: 0.3 },
        { x: 30, y: -40, size: 35, angle: -0.2 },
        { x: -20, y: 30, size: 45, angle: 0.5 },
        { x: 60, y: 20, size: 30, angle: -0.4 },
        { x: -70, y: -50, size: 25, angle: 0.8 }
    ];

    continents.forEach(continent => {
        // Apply earth rotation to continent position
        const rotatedX = continent.x * Math.cos(earthRotation) - continent.y * Math.sin(earthRotation);
        const rotatedY = continent.x * Math.sin(earthRotation) + continent.y * Math.cos(earthRotation);

        // Only draw if on visible hemisphere
        if (rotatedX > -earthRadius * 0.8) {
            ctx.save();
            ctx.translate(rotatedX, rotatedY);
            ctx.rotate(continent.angle);

            // Land gradient (green-brown)
            const landGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, continent.size);
            landGradient.addColorStop(0, '#7cb342');    // Bright green
            landGradient.addColorStop(0.6, '#558b2f');  // Forest green
            landGradient.addColorStop(1, '#33691e');    // Dark green

            ctx.fillStyle = landGradient;

            // Organic blob shape
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const variance = 0.7 + Math.sin(i * 2.3) * 0.3;
                const radius = continent.size * variance;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    });

    // === Ice caps (white) ===
    // North pole
    const iceCap = ctx.createRadialGradient(0, -earthRadius + 20, 0, 0, -earthRadius + 20, 35);
    iceCap.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    iceCap.addColorStop(1, 'rgba(200, 230, 255, 0.3)');
    ctx.fillStyle = iceCap;
    ctx.beginPath();
    ctx.arc(0, -earthRadius + 20, 35, 0, Math.PI * 2);
    ctx.fill();

    // South pole
    const iceCapSouth = ctx.createRadialGradient(0, earthRadius - 20, 0, 0, earthRadius - 20, 30);
    iceCapSouth.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    iceCapSouth.addColorStop(1, 'rgba(200, 230, 255, 0.2)');
    ctx.fillStyle = iceCapSouth;
    ctx.beginPath();
    ctx.arc(0, earthRadius - 20, 30, 0, Math.PI * 2);
    ctx.fill();

    // === Animated clouds (white swirls) ===
    const clouds = [
        { x: -40 + cloudOffset * 100, y: -30, size: 25 },
        { x: 20 + cloudOffset * 120, y: -50, size: 20 },
        { x: -60 + cloudOffset * 80, y: 10, size: 30 },
        { x: 40 + cloudOffset * 150, y: 35, size: 18 },
        { x: -10 + cloudOffset * 110, y: -60, size: 22 }
    ];

    clouds.forEach(cloud => {
        // Wrap clouds around Earth (modulo)
        let wrappedX = cloud.x % (earthRadius * 2.5);
        if (wrappedX > earthRadius) wrappedX -= earthRadius * 2.5;
        if (wrappedX < -earthRadius) wrappedX += earthRadius * 2.5;

        // Only draw if within Earth bounds
        if (Math.sqrt(wrappedX * wrappedX + cloud.y * cloud.y) < earthRadius - 5) {
            const cloudGradient = ctx.createRadialGradient(wrappedX, cloud.y, 0, wrappedX, cloud.y, cloud.size);
            cloudGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
            cloudGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            cloudGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = cloudGradient;
            ctx.beginPath();
            ctx.arc(wrappedX, cloud.y, cloud.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // === Shadow for 3D effect (terminator line) ===
    ctx.globalCompositeOperation = 'multiply';
    const shadowGradient = ctx.createRadialGradient(30, -20, 0, 0, 0, earthRadius);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();

    // === Atmospheric rim light (inner glow) ===
    ctx.save();
    ctx.translate(earthX, earthY);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, earthRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

/**
 * Main render loop for canvas
 */
function renderLoop() {
    if (!ctx || !canvas || !canvasInitialized) return;

    try {
        // Get current combo level for visual effects
        const comboCount = game.combo.count;
        const comboLevel = comboCount >= 30 ? 3 : comboCount >= 15 ? 2 : comboCount >= 8 ? 1 : 0;

        // Clear canvas with deep space color
        ctx.fillStyle = '#020814';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // === Draw nebulae (background cosmic clouds) ===
        renderNebulae();

        // === Draw multi-layer starfield with parallax ===
        stars.forEach(star => {
            // Enhanced twinkle effect
            const twinklePhase = Date.now() * star.twinkleSpeed * 0.001;
            const twinkleFactor = 0.3 + Math.sin(twinklePhase) * 0.3;
            const currentOpacity = star.opacity * (0.7 + twinkleFactor);

            // Draw star with color
            if (star.glow) {
                // Bright stars with glow
                ctx.shadowBlur = 4;
                ctx.shadowColor = star.color;
                ctx.fillStyle = star.color;
                ctx.globalAlpha = currentOpacity;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            } else {
                // Regular stars
                ctx.fillStyle = star.color;
                ctx.globalAlpha = currentOpacity;
                ctx.fillRect(star.x - star.size / 2, star.y - star.size / 2, star.size, star.size);
                ctx.globalAlpha = 1;
            }
        });

        // Draw Earth (enhanced procedural rendering)
        renderEarth();

        // Draw fragments
        fragments.forEach((fragment, index) => {
            fragment.y += fragment.speed;
            fragment.rotation += fragment.rotSpeed;

            // Remove if out of bounds and handle missed fragment
            if (fragment.y > canvas.height) {
                fragments.splice(index, 1);

                // Increment missed fragments counter
                game.combo.missedFragments++;

                // Reset combo if 3 fragments missed
                if (game.combo.missedFragments >= 3) {
                    // Show notification if there was an active combo
                    if (game.combo.count > 0) {
                        showNotification('❌ Combo perdu !');
                    }

                    // Reset combo
                    game.combo.count = 0;
                    game.combo.multiplier = 1;
                    game.combo.missedFragments = 0;
                }

                return;
            }

            // Calculate fire color based on combo level
            let fragmentColor = fragment.baseColor || '#00d4ff';
            if (comboLevel === 1) {
                fragmentColor = '#ffaa00'; // Orange
            } else if (comboLevel === 2) {
                fragmentColor = '#ff6600'; // Orange-red
            } else if (comboLevel === 3) {
                fragmentColor = '#ff3300'; // Red fire
            }

            // Draw star fragment
            ctx.save();
            ctx.translate(fragment.x, fragment.y);
            ctx.rotate(fragment.rotation);
            ctx.shadowBlur = comboLevel > 0 ? 30 : 20;
            ctx.shadowColor = fragmentColor;
            ctx.fillStyle = fragmentColor;

            // Draw 5-pointed star
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * fragment.size;
                const y = Math.sin(angle) * fragment.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });

        // Draw particles with enhanced rendering
        renderParticles(ctx, particles);
    } catch (error) {
        console.error('Render loop error:', error);
    }

    animationFrameId = requestAnimationFrame(renderLoop);
}

/**
 * Spawn a new fragment
 */
function spawnFragment() {
    const playableTop = CANVAS.PLAYABLE_MARGIN_TOP;
    const playableBottom = canvas.height - CANVAS.PLAYABLE_MARGIN_BOTTOM;
    const playableLeft = CANVAS.PLAYABLE_MARGIN_LEFT;
    const playableRight = canvas.width - CANVAS.PLAYABLE_MARGIN_RIGHT;
    const playableWidth = playableRight - playableLeft;

    const fragment = {
        x: playableLeft + Math.random() * playableWidth,
        y: playableTop,
        size: CANVAS.FRAGMENT_SIZE,
        speed: 1.0 + Math.random() * 0.8,  // Reduced from 1.5-2.5 to 1.0-1.8 (20-30% slower)
        value: Math.floor(Math.random() * 15) + 5,  // Increased value from 1-10 to 5-19
        color: '#00d4ff',
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
        id: Date.now() + Math.random()
    };

    fragments.push(fragment);
}

/**
 * Handle canvas click/tap
 */
function handleCanvasClick(event) {
    // Safety check: ensure canvas and context are initialized
    if (!canvas || !ctx || !gameInitialized) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicked on a fragment (hitbox 2x larger for easier clicking)
    for (let i = fragments.length - 1; i >= 0; i--) {
        const fragment = fragments[i];
        const dx = x - fragment.x;
        const dy = y - fragment.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < fragment.size * 2) {
            // Capture fragment
            const result = captureFragment(fragment);

            if (!result) continue;

            // Calculate fragment color based on combo level
            const comboCount = game.combo.count;
            const comboLevel = comboCount >= 30 ? 3 : comboCount >= 15 ? 2 : comboCount >= 8 ? 1 : 0;
            let fragmentColor = fragment.baseColor || '#00d4ff';
            if (comboLevel === 1) {
                fragmentColor = '#ffaa00'; // Orange
            } else if (comboLevel === 2) {
                fragmentColor = '#ff6600'; // Orange-red
            } else if (comboLevel === 3) {
                fragmentColor = '#ff3300'; // Red fire
            }

            // Enhanced particle effects based on combo level
            const particleCount = 15 + (comboLevel * 10); // More particles at higher combos
            const particleSpeed = 1 + (comboLevel * 0.3);
            createParticleBurst(particles, fragment.x, fragment.y, fragmentColor, particleCount, particleSpeed);

            // Add sparkles for high combos
            if (comboLevel >= 2) {
                createSparkles(particles, fragment.x, fragment.y, '#ffd700', 5 + comboLevel * 3);
            }

            // Screen shake based on combo level
            const shakeIntensity = 2 + (comboLevel * 2); // 2-8px shake
            const shakeDuration = 100 + (comboLevel * 50); // 100-250ms
            screenShake(canvas, shakeIntensity, shakeDuration);

            // Flash effect for very high combos
            if (comboLevel >= 3) {
                flashEffect(canvas, 'rgba(255, 100, 0, 0.3)', 100);
            }

            // Show floating text with fragment color
            if (result.lumen) {
                createFloatingText(`+${formatNumber(result.lumen)}`, fragment.x, fragment.y, fragmentColor);
            }

            // Remove fragment
            fragments.splice(i, 1);

            // Update UI
            updateResources();
            updateComboDisplay();

            // Play sound
            playSound('capture');

            // Notify tutorial system
            onTutorialAction('fragment_captured');

            break;
        }
    }
}

/**
 * Initialize event listeners
 */
let eventListenersInitialized = false;

function initEventListeners() {
    // Prevent duplicate event listeners
    if (eventListenersInitialized) return;
    eventListenersInitialized = true;

    // Canvas click
    if (canvas) {
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleCanvasClick(touch);
        });
    }
}

/**
 * Update combo visual effects
 */
function updateComboVisuals() {
    const comboOverlay = document.getElementById('comboOverlay');
    const comboCount = game.combo.count;
    const comboLevel = comboCount >= 30 ? 3 : comboCount >= 15 ? 2 : comboCount >= 8 ? 1 : 0;

    if (!comboOverlay) return;

    // Remove all level classes
    comboOverlay.classList.remove('level-1', 'level-2', 'level-3');

    // Add canvas combo-active class
    if (comboLevel > 0) {
        canvas.classList.add('combo-active');
        comboOverlay.classList.add(`level-${comboLevel}`);
    } else {
        canvas.classList.remove('combo-active');
    }

    // Keep combo display stable - no animation to avoid movement
}

/**
 * Dynamic spawn rate based on combo
 */
let baseSpawnInterval = 666;
let currentSpawnInterval = null;

function updateSpawnRate() {
    const comboCount = game.combo.count;
    const comboLevel = comboCount >= 30 ? 3 : comboCount >= 15 ? 2 : comboCount >= 8 ? 1 : 0;

    // Accelerate spawn rate with combo
    let newInterval = baseSpawnInterval;
    if (comboLevel === 1) {
        newInterval = baseSpawnInterval * 0.8; // 20% faster
    } else if (comboLevel === 2) {
        newInterval = baseSpawnInterval * 0.6; // 40% faster
    } else if (comboLevel === 3) {
        newInterval = baseSpawnInterval * 0.4; // 60% faster
    }

    // Update spawn interval if changed
    if (currentSpawnInterval !== newInterval) {
        currentSpawnInterval = newInterval;
        if (window.spawnIntervalId) {
            clearInterval(window.spawnIntervalId);
        }
        window.spawnIntervalId = setInterval(() => {
            spawnFragment();
        }, newInterval);
    }
}

/**
 * Start game loops (logic, UI updates, fragment spawning)
 */
function startGameLoops() {
    // Prevent multiple game loops
    if (gameLoopInterval) return;

    // Ensure canvas is initialized before starting loops
    if (!canvasInitialized || !canvas) {
        console.warn('Cannot start game loops: canvas not initialized');
        return;
    }

    // Main game loop (10 ticks per second)
    gameLoopInterval = setInterval(() => {
        try {
            updateGame(TIMING.TICK_RATE / 1000);
        } catch (error) {
            console.error('Game loop error:', error);
        }
    }, TIMING.TICK_RATE);

    // UI update loop (every 500ms)
    uiUpdateInterval = setInterval(() => {
        try {
            updateResources();
            updateComboDisplay();
            updateLootboxTimer();
            updateComboVisuals();
            checkQuestReset();

            // Check for progressive system unlocks
            checkSystemUnlocks();

            // Check for new achievements
            const newAchievements = checkAchievements();
            newAchievements.forEach(({ key, data }) => {
                showNotification(`🏆 ${data.name} débloqué !`);
            });
        } catch (error) {
            console.error('UI update error:', error);
        }
    }, 500);

    // Spawn rate update loop (every 100ms for responsiveness)
    setInterval(() => {
        updateSpawnRate();
    }, 100);

    // Initial fragment spawn - rate will be managed dynamically
    currentSpawnInterval = baseSpawnInterval;
    window.spawnIntervalId = setInterval(() => {
        spawnFragment();
    }, baseSpawnInterval);
}

/**
 * Render all tabs content
 */
function renderAllTabs() {
    renderDefenseTab();
    renderBuildingsTab();
    renderTechnologiesTab();
}

/**
 * Render defense tab
 */
function renderDefenseTab() {
    const container = document.getElementById('defense');
    if (!container) return;

    container.innerHTML = '<div class="items-grid"></div>';
    const grid = container.querySelector('.items-grid');

    for (let key in defenseData) {
        const data = defenseData[key];
        const level = game.defense[key] || 0;
        const cost = getCost(data, level);
        const canBuy = canAfford(cost) && level < data.max;

        const card = createItemCard(key, data, level, cost, canBuy, 'defense');
        grid.appendChild(card);
    }
}

/**
 * Render buildings tab
 */
function renderBuildingsTab() {
    const container = document.getElementById('buildings');
    if (!container) return;

    container.innerHTML = '<div class="items-grid"></div>';
    const grid = container.querySelector('.items-grid');

    const planet = game.planets[game.currentPlanet];

    for (let key in buildingData) {
        const data = buildingData[key];
        const level = planet.buildings[key] || 0;
        const cost = getCost(data, level, 'building');
        const requires = checkRequires(data);
        const canBuy = canAfford(cost) && level < data.max && requires;

        const card = createItemCard(key, data, level, cost, canBuy, 'building', !requires);
        grid.appendChild(card);
    }
}

/**
 * Render technologies tab
 */
function renderTechnologiesTab() {
    const container = document.getElementById('technologies');
    if (!container) return;

    container.innerHTML = '<div class="items-grid"></div>';
    const grid = container.querySelector('.items-grid');

    for (let key in techData) {
        const data = techData[key];
        const level = game.technologies[key] || 0;
        const cost = getCost(data, level, 'tech');
        const requires = checkRequires(data);
        const canBuy = canAfford(cost) && level < data.max && requires;

        const card = createItemCard(key, data, level, cost, canBuy, 'tech', !requires);
        grid.appendChild(card);
    }
}

/**
 * Create item card element with hold-to-upgrade functionality
 */
function createItemCard(key, data, level, cost, canBuy, type, locked = false) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.id = `${type}-${key}`;
    if (canBuy) card.classList.add('buildable');
    if (locked) card.classList.add('locked');
    if (level >= data.max) card.classList.add('maxed');

    const icon = data.icon || '🔧';
    const levelText = formatLevel(level, data.max);
    const effectText = data.display ? data.display(level + 1) : '';
    const costHTML = level >= data.max ? '<span style="color: #ffd700">MAX</span>' : formatCostColored(cost, game.resources);

    card.innerHTML = `
        <div class="item-header">
            <div class="item-icon">${icon}</div>
            <div class="item-info">
                <div class="item-title">${data.name}</div>
                <div class="item-level">${levelText}</div>
            </div>
        </div>
        <div class="item-desc">${data.desc}</div>
        ${effectText ? `<div class="item-stats">${effectText}</div>` : ''}
        <div class="item-cost">${costHTML}</div>
    `;

    // Make card clickable with hold-to-upgrade if not locked and not maxed
    if (!locked && level < data.max) {
        card.style.cursor = 'pointer';

        let holdInterval = null;
        let holdTimeout = null;

        const buyFunction = () => {
            const buyFunctionName = `buy${type.charAt(0).toUpperCase() + type.slice(1)}`;
            if (window[buyFunctionName]) {
                window[buyFunctionName](key);
            }
        };

        const startHold = () => {
            // Execute immediately on press
            buyFunction();

            // Start hold-to-upgrade after 300ms
            holdTimeout = setTimeout(() => {
                holdInterval = setInterval(buyFunction, 100);
            }, 300);
        };

        const endHold = () => {
            if (holdTimeout) {
                clearTimeout(holdTimeout);
                holdTimeout = null;
            }
            if (holdInterval) {
                clearInterval(holdInterval);
                holdInterval = null;
            }
        };

        // Mouse events
        card.addEventListener('mousedown', startHold);
        card.addEventListener('mouseup', endHold);
        card.addEventListener('mouseleave', endHold);

        // Touch events
        card.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startHold();
        });
        card.addEventListener('touchend', endHold);
        card.addEventListener('touchcancel', endHold);
    }

    return card;
}

/**
 * Core functions exposed globally for inline onclick handlers
 */
window.startGame = startGame;
window.switchTab = switchTab;
window.openModal = (id) => {
    // Initialize settings UI when opening settings modal
    if (id === 'settings') {
        initializeSettingsUI();
    }

    toggleModal(id + 'Modal', true);

    // Render content for specific modals
    if (id === 'quests') {
        renderQuests();
    } else if (id === 'achievements') {
        renderAchievements();
    } else if (id === 'events') {
        renderEvents();
    }
};
window.closeModal = (id) => toggleModal(id + 'Modal', false);

window.switchPlanet = (key) => {
    if (switchPlanetLogic(key)) {
        updateAllUI();
        renderAllTabs();
    }
};

window.openProfile = () => {
    updateProfileModal();
    toggleModal('profileModal', true);
};

window.closeProfile = () => toggleModal('profileModal', false);

window.claimDaily = () => {
    const result = claimDailyReward();
    if (result) {
        showNotification(`✓ Jour ${result.day} réclamé !`);
        updateDailyRewardsDisplay();
        updateResources();
    }
};

window.openFreeLootbox = () => {
    const rewards = openFreeLootboxLogic();
    if (rewards) {
        showNotification(`📦 Coffre ouvert ! +${formatNumber(rewards.lumen)} Lumen`);
        updateResources();
        updateLootboxTimer();
        // Hide the floating button immediately after opening
        const floatButton = document.getElementById('freeLootboxFloat');
        if (floatButton) {
            floatButton.style.display = 'none';
        }
    } else {
        // If cooldown active, hide the button (shouldn't be visible but just in case)
        const floatButton = document.getElementById('freeLootboxFloat');
        if (floatButton) {
            floatButton.style.display = 'none';
        }
    }
};

/**
 * Check if prestige is available
 */
function checkPrestigeAvailable() {
    const requirement = 1000000 * Math.pow(10, game.prestige.level);
    return game.prestige.totalLumenEarned >= requirement;
}

/**
 * Update prestige UI elements
 */
window.updatePrestigeUI = function() {
    const available = checkPrestigeAvailable();
    const modal = document.getElementById('prestigeModal');
    const floatButton = document.getElementById('prestigeFloat');

    if (available) {
        if (!game.prestige.popupDismissed) {
            // Show popup for the first time
            updatePrestigeModal();
            modal.classList.add('active');
            floatButton.style.display = 'none';
        } else {
            // Show floating button if dismissed
            modal.classList.remove('active');
            floatButton.style.display = 'block';
        }
    } else {
        // Not available, hide both
        modal.classList.remove('active');
        floatButton.style.display = 'none';
        game.prestige.popupDismissed = false; // Reset for next time
    }
};

/**
 * Update prestige modal content
 */
function updatePrestigeModal() {
    const currentLevel = game.prestige.level;
    const newLevel = currentLevel + 1;
    const newBonus = newLevel * 10;

    document.getElementById('prestigeLevel').textContent = currentLevel;
    document.getElementById('prestigeNewLevel').textContent = newLevel;
    document.getElementById('prestigeBonus').textContent = newBonus;
}

/**
 * Open prestige popup from floating button
 */
window.openPrestigePopup = () => {
    updatePrestigeModal();
    document.getElementById('prestigeModal').classList.add('active');
    document.getElementById('prestigeFloat').style.display = 'none';
};

/**
 * Dismiss prestige popup
 */
window.dismissPrestigePopup = () => {
    game.prestige.popupDismissed = true;
    document.getElementById('prestigeModal').classList.remove('active');
    document.getElementById('prestigeFloat').style.display = 'block';
};

/**
 * Perform prestige
 */
window.doPrestige = () => {
    const result = performPrestige();
    if (result.success) {
        showNotification(`🌠 Prestige Niveau ${result.newLevel} ! +${result.bonus}% production`);
        document.getElementById('prestigeModal').classList.remove('active');
        document.getElementById('prestigeFloat').style.display = 'none';
        game.prestige.popupDismissed = false;
        updateAllUI();
        renderAllTabs();
    } else {
        showNotification(result.message);
    }
};

/**
 * Render quests in the quests modal
 */
function renderQuests() {
    const questsBody = document.getElementById('questsBody');
    if (!questsBody) return;

    if (!game.quests.active || game.quests.active.length === 0) {
        questsBody.innerHTML = '<p style="text-align: center; color: #ccc;">Aucune quête active</p>';
        return;
    }

    const container = document.createElement('div');
    container.className = 'quest-container';

    game.quests.active.forEach((quest, index) => {
        const data = questData.daily[quest.key];
        if (!data) return;

        const card = document.createElement('div');
        card.className = 'quest-card';
        if (quest.completed) card.classList.add('completed');
        if (quest.claimed) card.classList.add('claimed');

        const progressPercent = Math.min(100, (quest.progress / data.requirement) * 100);

        card.innerHTML = `
            <div class="quest-icon">${data.icon}</div>
            <div class="quest-name">${data.name}</div>
            <div class="quest-desc">${data.desc}</div>
            <div class="quest-progress">${quest.progress}/${data.requirement}</div>
            <div class="quest-reward">🎁 ${formatCost(data.reward)}</div>
            <button class="quest-btn" onclick="claimQuest(${index})"
                    ${!quest.completed || quest.claimed ? 'disabled' : ''}>
                ${quest.claimed ? 'RÉCLAMÉ' : quest.completed ? 'RÉCLAMER' : 'EN COURS'}
            </button>
        `;

        container.appendChild(card);
    });

    questsBody.innerHTML = '';
    questsBody.appendChild(container);
}

/**
 * Claim a quest reward
 */
window.claimQuest = (questIndex) => {
    const reward = claimQuestReward(questIndex);
    if (reward) {
        showNotification(`✓ Quête terminée ! ${formatCost(reward)}`);
        renderQuests();
        updateResources();
    }
};

/**
 * Render achievements in the achievements modal
 */
function renderAchievements() {
    const achievementsBody = document.getElementById('achievementsBody');
    if (!achievementsBody) return;

    achievementsBody.innerHTML = '';

    // Group achievements by category
    const categories = {
        clicks: '👆 Clics',
        collection: '💰 Collection',
        buildings: '🏗️ Construction',
        tech: '🔬 Technologies',
        planets: '🌍 Planètes',
        prestige: '🌠 Prestige'
    };

    for (const [categoryKey, categoryName] of Object.entries(categories)) {
        const categoryAchievements = Object.entries(achievementData)
            .filter(([_, data]) => data.category === categoryKey);

        if (categoryAchievements.length === 0) continue;

        const categoryDiv = document.createElement('div');
        categoryDiv.style.marginBottom = '20px';

        const categoryHeader = document.createElement('div');
        categoryHeader.style.fontSize = '14px';
        categoryHeader.style.fontWeight = 'bold';
        categoryHeader.style.color = 'var(--color-primary)';
        categoryHeader.style.marginBottom = '10px';
        categoryHeader.style.borderBottom = '1px solid var(--color-border)';
        categoryHeader.style.paddingBottom = '5px';
        categoryHeader.textContent = categoryName;
        categoryDiv.appendChild(categoryHeader);

        categoryAchievements.forEach(([key, data]) => {
            const unlocked = game.achievements[key] || false;

            const achievementDiv = document.createElement('div');
            achievementDiv.style.display = 'flex';
            achievementDiv.style.alignItems = 'center';
            achievementDiv.style.padding = '8px';
            achievementDiv.style.marginBottom = '5px';
            achievementDiv.style.background = unlocked
                ? 'linear-gradient(90deg, rgba(76, 175, 80, 0.2), rgba(0, 50, 100, 0.1))'
                : 'rgba(0, 30, 60, 0.3)';
            achievementDiv.style.borderRadius = '5px';
            achievementDiv.style.border = `1px solid ${unlocked ? 'rgba(76, 175, 80, 0.5)' : 'rgba(128, 128, 128, 0.3)'}`;
            achievementDiv.style.opacity = unlocked ? '1' : '0.6';

            achievementDiv.innerHTML = `
                <div style="font-size: 32px; margin-right: 12px;">${data.icon}</div>
                <div style="flex: 1;">
                    <div style="font-size: 13px; font-weight: bold; color: ${unlocked ? '#4ade80' : '#fff'};">
                        ${unlocked ? '✓ ' : '🔒 '}${data.name}
                    </div>
                    <div style="font-size: 11px; color: #ccc; margin-top: 2px;">${data.desc}</div>
                    <div style="font-size: 11px; color: #4ade80; margin-top: 2px;">
                        🎁 ${formatCost(data.reward)}
                    </div>
                </div>
            `;

            categoryDiv.appendChild(achievementDiv);
        });

        achievementsBody.appendChild(categoryDiv);
    }
}

/**
 * Render events and boosts in the events modal
 */
function renderEvents() {
    const eventsBody = document.getElementById('eventsBody');
    if (!eventsBody) return;

    eventsBody.innerHTML = '';

    // Active boosts section
    const activeSection = document.createElement('div');
    activeSection.innerHTML = `<div style="font-size: 14px; font-weight: bold; color: var(--color-primary); margin-bottom: 10px; border-bottom: 1px solid var(--color-border); padding-bottom: 5px;">⚡ BOOSTS ACTIFS</div>`;

    if (game.activeBoosts.length === 0) {
        activeSection.innerHTML += '<p style="color: #888; text-align: center; margin: 10px 0;">Aucun boost actif</p>';
    } else {
        game.activeBoosts.forEach(boost => {
            const data = boostData[boost.key];
            const timeLeft = boost.endTime === -1 ? 'Permanent' : formatTime(boost.endTime - Date.now());
            activeSection.innerHTML += `
                <div style="padding: 8px; margin: 5px 0; background: rgba(76, 175, 80, 0.2); border: 1px solid rgba(76, 175, 80, 0.5); border-radius: 5px;">
                    <div style="font-weight: bold;">${data.icon} ${data.name}</div>
                    <div style="font-size: 11px; color: #4ade80;">⏱️ ${timeLeft}</div>
                </div>
            `;
        });
    }
    eventsBody.appendChild(activeSection);

    // Boosts shop section
    const boostsSection = document.createElement('div');
    boostsSection.style.marginTop = '20px';
    boostsSection.innerHTML = `<div style="font-size: 14px; font-weight: bold; color: var(--color-primary); margin-bottom: 10px; border-bottom: 1px solid var(--color-border); padding-bottom: 5px;">🛒 ACHETER BOOSTS</div>`;

    Object.entries(boostData).forEach(([key, data]) => {
        boostsSection.innerHTML += `
            <div style="display: flex; align-items: center; padding: 8px; margin: 5px 0; background: rgba(0, 50, 100, 0.3); border: 1px solid var(--color-border); border-radius: 5px;">
                <div style="font-size: 32px; margin-right: 12px;">${data.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${data.name}</div>
                    <div style="font-size: 11px; color: #ccc;">${data.desc}</div>
                    <div style="font-size: 11px; color: #4ade80; margin-top: 2px;">💰 ${formatCost(data.cost)}</div>
                </div>
                <button onclick="buyBoost('${key}')" class="quest-btn" style="width: auto; padding: 6px 15px;">ACTIVER</button>
            </div>
        `;
    });
    eventsBody.appendChild(boostsSection);

    // Events section
    const eventsSection = document.createElement('div');
    eventsSection.style.marginTop = '20px';
    eventsSection.innerHTML = `<div style="font-size: 14px; font-weight: bold; color: var(--color-primary); margin-bottom: 10px; border-bottom: 1px solid var(--color-border); padding-bottom: 5px;">🌟 ÉVÉNEMENTS</div>`;

    Object.entries(eventData).forEach(([key, data]) => {
        eventsSection.innerHTML += `
            <div style="display: flex; align-items: center; padding: 8px; margin: 5px 0; background: rgba(0, 50, 100, 0.3); border: 1px solid var(--color-border); border-radius: 5px;">
                <div style="font-size: 32px; margin-right: 12px;">${data.icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold;">${data.name}</div>
                    <div style="font-size: 11px; color: #ccc;">${data.desc}</div>
                    <div style="font-size: 11px; color: #4ade80; margin-top: 2px;">💰 ${formatCost(data.cost)}</div>
                </div>
                <button onclick="buyEvent('${key}')" class="quest-btn" style="width: auto; padding: 6px 15px;">ACTIVER</button>
            </div>
        `;
    });
    eventsBody.appendChild(eventsSection);
}

/**
 * Buy and activate a boost
 */
window.buyBoost = (boostKey) => {
    if (activateBoost(boostKey)) {
        const data = boostData[boostKey];
        showNotification(`⚡ ${data.name} activé !`);
        renderEvents();
        updateResources();
    } else {
        showNotification('Ressources insuffisantes !');
    }
};

/**
 * Buy and activate an event
 */
window.buyEvent = (eventKey) => {
    if (activateEvent(eventKey)) {
        const data = eventData[eventKey];
        showNotification(`🌟 ${data.name} activé !`);
        renderEvents();
        updateResources();
    } else {
        showNotification('Ressources insuffisantes !');
    }
};

/**
 * Buy functions exposed globally
 */
window.buyDefense = (key) => {
    if (buyDefense(key)) {
        showNotification(`✓ ${defenseData[key].name} amélioré !`);
        renderDefenseTab();
        updateResources();
        // Trigger animation after render
        setTimeout(() => triggerSuccessAnimation(`defense-${key}`), 10);
        // Notify tutorial system
        onTutorialAction('defense_bought', { key });
    }
};

window.buyBuilding = (key) => {
    if (buyBuilding(key)) {
        showNotification(`✓ ${buildingData[key].name} construit !`);
        renderBuildingsTab();
        updateResources();
        // Trigger animation after render
        setTimeout(() => triggerSuccessAnimation(`building-${key}`), 10);
        // Notify tutorial system
        onTutorialAction('building_bought', { key });
    }
};

window.buyTech = (key) => {
    if (buyTechnology(key)) {
        showNotification(`✓ ${techData[key].name} recherché !`);
        renderTechnologiesTab();
        updateResources();
        // Trigger animation after render
        setTimeout(() => triggerSuccessAnimation(`tech-${key}`), 10);
    }
};

/**
 * Update profile modal
 */
function updateProfileModal() {
    document.getElementById('modalLumen').textContent = formatNumber(game.totalResources.lumen);

    const planetsUnlocked = Object.values(game.planets).filter(p => p.unlocked).length;
    document.getElementById('modalPlanets').textContent = `${planetsUnlocked}/3`;
    document.getElementById('modalTechs').textContent = Object.values(game.technologies).filter(t => t > 0).length;

    // Update statistics
    document.getElementById('modalTimePlayed').textContent = formatTime(game.stats.timePlayed);
    document.getElementById('modalTotalClicks').textContent = formatNumber(game.stats.totalClicks);
    document.getElementById('modalFragmentsCaught').textContent = formatNumber(game.stats.fragmentsCaught);
    document.getElementById('modalBuildingsBuilt').textContent = formatNumber(game.stats.buildingsBuilt);
}

/**
 * App initialization
 */
window.addEventListener('DOMContentLoaded', () => {
    // Initialize audio systems
    initAudio();
    initAmbientMusic();

    // Initialize game state
    initializePlanetBuildings();
    initializeTechnologies();
    initializeDefense();

    // Try to load saved game
    const savedGame = loadGame();
    if (savedGame) {
        loadGameState(savedGame.game);

        // Process offline earnings
        const offline = processOfflineEarnings(savedGame);
        if (offline) {
            const minutes = Math.floor(offline.time / 60000);
            showNotification(`Revenu hors ligne : ${minutes} min`);
        }

        // Skip welcome screen if returning player
        startGame();
    } else {
        // Show welcome screen for new players
        document.getElementById('welcome').style.display = 'flex';
    }
});

// Save before page unload
window.addEventListener('beforeunload', () => {
    saveGame();
});
