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
import { TIMING, CANVAS, FRAGMENT_SPAWN, FRAGMENTS, POWERUPS, COMPANIONS, SPECIAL_EVENTS, METEORS } from './core/constants.js';

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

// Companion imports
import {
    processCompanionCollection,
    getCompanionPosition,
    getCompanionCooldown,
    unlockCompanion,
    activateCompanion as activateCompanionLogic,
    renderCompanionsUI
} from './systems/companions.js';

/**
 * Canvas and rendering variables
 */
let canvas, ctx;
let fragments = [];
let powerups = [];  // Power-ups falling on screen
let meteors = [];  // Meteors during special events
let bosses = [];  // Boss entities during events
let particles = [];
let stars = [];
let animationFrameId = null;

/**
 * Sprite images for pixel art stars
 */
let starSprites = {
    normal: null,
    golden: null,
    rare: null,
    legendary: null,
    loaded: false
};

/**
 * Building visuals
 */
let buildingVisuals = [];
let defenseBeams = [];
let productionParticles = [];

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
    console.log('Tier selected:', tier);
    // Update UI
    document.querySelectorAll('.tier-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.onclick && btn.onclick.toString().includes(tier)) {
            btn.classList.add('active');
        }
    });
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
export async function startGame() {
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

    // Initialize systems (await canvas init for sprite loading)
    await initCanvas();
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

    // Mark game as fully initialized (CRITICAL for click detection)
    gameInitialized = true;
    console.log('🎮 Game fully initialized! Click detection enabled.');
}

/**
 * Load star sprite images
 */
function loadStarSprites() {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const totalSprites = 4;

        const spriteMap = {
            normal: './src/assets/fragments/star-pixel.svg',
            golden: './src/assets/fragments/star-golden.svg',
            rare: './src/assets/fragments/star-rare.svg',
            legendary: './src/assets/fragments/star-legendary.svg'
        };

        console.log('🎨 Loading star sprites...');

        function onSpriteLoad(key, success) {
            loadedCount++;
            console.log(`${success ? '✅' : '❌'} Sprite ${key}: ${success ? 'loaded' : 'failed'} (${loadedCount}/${totalSprites})`);
            if (loadedCount === totalSprites) {
                starSprites.loaded = true;
                console.log('✅ All star sprites loaded successfully!');
                resolve();
            }
        }

        for (const [key, path] of Object.entries(spriteMap)) {
            const img = new Image();
            img.onload = () => {
                console.log(`✓ Sprite loaded: ${key} (${img.width}x${img.height})`);
                onSpriteLoad(key, true);
            };
            img.onerror = (e) => {
                console.error(`✗ Failed to load sprite ${key} from ${path}:`, e);
                onSpriteLoad(key, false);
            };
            img.src = path;
            starSprites[key] = img;
            console.log(`📥 Loading sprite: ${key} from ${path}`);
        }
    });
}

/**
 * Initialize canvas and rendering
 */
async function initCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('❌ Canvas element not found!');
        return;
    }

    ctx = canvas.getContext('2d');
    console.log('✅ Canvas initialized:', canvas.width, 'x', canvas.height);

    // Load star sprites
    await loadStarSprites();
    console.log('✅ Star sprites loaded');

    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize multi-layer starfield with parallax
    initStarfield();
    console.log('✅ Starfield initialized with', stars.length, 'stars');

    // Mark canvas as initialized (CRITICAL for game loops to start)
    canvasInitialized = true;
    console.log('✅ canvasInitialized flag set to TRUE');

    // Start render loop
    renderLoop();
    console.log('✅ Render loop started');
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
 * Note: We set canvas internal resolution to match display size 1:1
 * This ensures click coordinates align perfectly with visual positions
 */
function resizeCanvas() {
    if (!canvas) return;

    // Set canvas internal resolution to match window size exactly
    // This ensures 1:1 pixel mapping for accurate hit detection
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    console.log('📐 Canvas resized to:', canvas.width, 'x', canvas.height);

    // Reinitialize starfield after resize to match new canvas dimensions
    if (stars.length > 0) {
        initStarfield();
        console.log('🌟 Starfield reinitialized after resize');
    }
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
 * Calculate building positions based on their level and type
 */
function calculateBuildingPositions() {
    const planet = game.planets[game.currentPlanet];
    const positions = [];

    // Check if bottom UI is minimized
    const bottomUI = document.getElementById('bottomUI');
    const isMinimized = bottomUI && bottomUI.classList.contains('minimized');

    // Bottom area for production buildings - adjust based on UI state
    // If minimized, buildings can be lower (90%), if expanded use 75% to avoid overlap
    const buildingAreaY = canvas.height * (isMinimized ? 0.90 : 0.68);
    const buildingSpacing = 60;
    let buildingIndex = 0;

    // Add each building that has been built
    for (const [key, level] of Object.entries(planet.buildings)) {
        if (level > 0) {
            const data = buildingData[key];
            positions.push({
                key,
                icon: data.icon,
                level,
                x: 50 + (buildingIndex * buildingSpacing),
                y: buildingAreaY,
                production: data.production(level)
            });
            buildingIndex++;
        }
    }

    return positions;
}

/**
 * Create production particles from buildings
 */
function createProductionParticle(building) {
    // Production intensity based on building level
    const intensity = Math.min(building.level / 10, 1.0);

    productionParticles.push({
        x: building.x + (Math.random() - 0.5) * 30,
        y: building.y - 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -1 - Math.random() * 1.5, // Upward
        life: 60 + Math.random() * 40,
        maxLife: 60 + Math.random() * 40,
        size: 2 + Math.random() * 2 * intensity,
        color: '#ffd700',
        alpha: 0.8
    });
}

/**
 * Render building visuals
 */
function renderBuildings() {
    if (!canvas || !ctx) return;

    const positions = calculateBuildingPositions();

    // Spawn production particles periodically
    positions.forEach((building, idx) => {
        // Spawn rate based on building level (higher = more particles)
        const spawnChance = Math.min(building.level * 0.02, 0.5);
        if (Math.random() < spawnChance) {
            createProductionParticle(building);
        }
    });

    // Update and render production particles
    productionParticles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life <= 0) {
            productionParticles.splice(index, 1);
            return;
        }

        const alpha = (particle.life / particle.maxLife) * particle.alpha;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Draw building icons with level indicators
    positions.forEach(building => {
        ctx.save();

        // Building platform (simple rectangle)
        const platformWidth = 50;
        const platformHeight = 8;
        const gradient = ctx.createLinearGradient(
            building.x - platformWidth / 2,
            building.y - platformHeight,
            building.x - platformWidth / 2,
            building.y
        );
        gradient.addColorStop(0, '#444');
        gradient.addColorStop(1, '#222');
        ctx.fillStyle = gradient;
        ctx.fillRect(
            building.x - platformWidth / 2,
            building.y - platformHeight,
            platformWidth,
            platformHeight
        );

        // Icon
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
        ctx.fillText(building.icon, building.x, building.y - platformHeight);

        // Level indicator
        ctx.shadowBlur = 0;
        ctx.font = 'bold 10px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`Lv ${building.level}`, building.x, building.y + 12);

        ctx.restore();
    });
}

/**
 * Fire defense beam from sides to destroy fragments
 */
function fireDefenseBeam() {
    if (fragments.length === 0) return;

    const autoLevel = game.defense.autoCapture || 0;
    if (autoLevel === 0) return;

    // Find a random fragment to target
    const targetFragment = fragments[Math.floor(Math.random() * fragments.length)];

    // Alternate between left and right cannons
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? 30 : canvas.width - 30;
    const startY = canvas.height / 2;

    defenseBeams.push({
        startX,
        startY,
        endX: targetFragment.x,
        endY: targetFragment.y,
        target: targetFragment,
        life: 10,
        color: fromLeft ? '#00ffff' : '#ff00ff',
        damage: autoLevel * 10
    });
}

/**
 * Render defense beams
 */
function renderDefenseBeams() {
    if (!ctx) return;

    // Auto-fire based on auto-capture level
    const autoLevel = game.defense.autoCapture || 0;
    if (autoLevel > 0 && Math.random() < autoLevel * 0.05) {
        fireDefenseBeam();
    }

    // Render and update beams
    defenseBeams.forEach((beam, index) => {
        beam.life--;

        if (beam.life <= 0) {
            defenseBeams.splice(index, 1);
            return;
        }

        // Check if target still exists
        const targetExists = fragments.includes(beam.target);
        if (targetExists) {
            beam.endX = beam.target.x;
            beam.endY = beam.target.y;
        }

        ctx.save();
        const alpha = beam.life / 10;
        ctx.globalAlpha = alpha;

        // Beam glow
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = beam.color;
        ctx.beginPath();
        ctx.moveTo(beam.startX, beam.startY);
        ctx.lineTo(beam.endX, beam.endY);
        ctx.stroke();

        // Inner beam
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.moveTo(beam.startX, beam.startY);
        ctx.lineTo(beam.endX, beam.endY);
        ctx.stroke();

        ctx.restore();

        // Impact effect at the end
        if (beam.life === 9 && targetExists) {
            createParticleBurst(particles, beam.endX, beam.endY, beam.color, 8, 0.8);
        }
    });

    // Draw cannon indicators on the sides
    const autoLevel = game.defense.autoCapture || 0;
    if (autoLevel > 0) {
        const cannonY = canvas.height / 2;

        // Left cannon
        ctx.save();
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(30, cannonY, 8 + autoLevel, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 30, cannonY);
        ctx.restore();

        // Right cannon
        ctx.save();
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        ctx.beginPath();
        ctx.arc(canvas.width - 30, cannonY, 8 + autoLevel, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', canvas.width - 30, cannonY);
        ctx.restore();
    }
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

        // Draw buildings and their production effects
        renderBuildings();

        // Draw defense beams (before fragments)
        renderDefenseBeams();

        // Draw power-ups (before fragments so fragments appear on top)
        renderPowerups();

        // Auto-collect fragments if Magnet power-up is active
        const magnetActive = isPowerupActive('magnet');
        if (magnetActive) {
            fragments.forEach((fragment, index) => {
                // Check if fragment is in lower half of screen
                if (fragment.y > canvas.height * 0.4) {
                    // Auto-collect this fragment
                    const result = captureFragment(fragment);

                    if (result) {
                        // Minimal visual effects for auto-collect
                        const fragmentColor = fragment.baseColor || '#00d4ff';
                        createParticleBurst(particles, fragment.x, fragment.y, fragmentColor, 3, 0.8); // Reduced from 10 to 3
                        createFloatingText(`+${formatNumber(result.lumen)}`, fragment.x, fragment.y, fragmentColor);

                        // Remove fragment
                        fragments.splice(index, 1);

                        // Update UI
                        updateResources();
                        updateComboDisplay();
                    }
                }
            });
        }

        // Companion auto-collection
        const companionResult = processCompanionCollection(fragments);
        if (companionResult.collected > 0) {
            const companionPos = getCompanionPosition(canvas);

            for (let i = 0; i < companionResult.collected && fragments.length > 0; i++) {
                // Find closest fragment to companion
                let closestIndex = 0;
                let closestDist = Infinity;

                fragments.forEach((fragment, index) => {
                    const dx = fragment.x - companionPos.x;
                    const dy = fragment.y - companionPos.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestIndex = index;
                    }
                });

                const fragment = fragments[closestIndex];
                if (!fragment) continue;

                // Collect fragment
                const result = captureFragment(fragment);
                if (result) {
                    // Minimal visual effects - beam from companion to fragment
                    const fragmentColor = fragment.baseColor || '#00d4ff';
                    createParticleBurst(particles, fragment.x, fragment.y, fragmentColor, 3, 0.8); // Reduced from 8 to 3
                    createFloatingText(`+${formatNumber(result.lumen)}`, fragment.x, fragment.y, fragmentColor);

                    // Remove fragment
                    fragments.splice(closestIndex, 1);
                }
            }

            if (companionResult.collected > 0) {
                updateResources();
                updateComboDisplay();
            }
        }

        // Draw fragments
        fragments.forEach((fragment, index) => {
            // Apply Slow Time power-up effect
            const speedMultiplier = isPowerupActive('slow_time') ? 0.5 : 1.0;
            fragment.y += fragment.speed * speedMultiplier;
            fragment.rotation += fragment.rotSpeed;

            // Remove if out of bounds and handle missed fragment
            if (fragment.y > canvas.height) {
                fragments.splice(index, 1);

                // Check if Shield power-up is active
                const shieldActive = isPowerupActive('shield');

                if (!shieldActive) {
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
                }

                return;
            }

            // Use pixel art sprites if loaded, otherwise fallback to simple rendering
            if (starSprites.loaded && starSprites[fragment.type]) {
                // Calculate rarity-based size multipliers
                const rarityMultipliers = {
                    'normal': 1.0,
                    'golden': 1.3,
                    'rare': 1.5,
                    'legendary': 1.8
                };
                const sizeMultiplier = rarityMultipliers[fragment.type] || 1.0;
                const spriteSize = 32 * sizeMultiplier;

                ctx.save();
                ctx.translate(fragment.x, fragment.y);
                ctx.rotate(fragment.rotation);

                // Draw sprite centered
                const sprite = starSprites[fragment.type];
                if (sprite && sprite.complete) {
                    ctx.drawImage(sprite, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
                } else if (sprite && !sprite.complete) {
                    // Sprite still loading, show fallback temporarily
                    ctx.fillStyle = fragment.baseColor || '#FFD700';
                    ctx.beginPath();
                    ctx.arc(0, 0, spriteSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            } else {
                // Fallback: simple rendering for performance
                let fragmentColor = fragment.baseColor || '#00d4ff';
                if (comboLevel === 1 && fragment.type === 'normal') {
                    fragmentColor = '#ffaa00';
                } else if (comboLevel === 2 && fragment.type === 'normal') {
                    fragmentColor = '#ff6600';
                } else if (comboLevel === 3 && fragment.type === 'normal') {
                    fragmentColor = '#ff3300';
                }

                const rarityMultipliers = {
                    'normal': 1.0,
                    'golden': 1.3,
                    'rare': 1.5,
                    'legendary': 1.8
                };
                const sizeMultiplier = rarityMultipliers[fragment.type] || 1.0;
                const effectiveSize = fragment.size * sizeMultiplier;

                ctx.save();
                ctx.translate(fragment.x, fragment.y);
                ctx.rotate(fragment.rotation);

                // Simple glow
                const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize + 15);
                glowGradient.addColorStop(0, fragmentColor);
                glowGradient.addColorStop(0.5, fragmentColor.replace(')', ', 0.3)').replace('rgb', 'rgba'));
                glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(0, 0, effectiveSize + 15, 0, Math.PI * 2);
                ctx.fill();

                // Simple star shape
                ctx.fillStyle = fragmentColor;
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                    const radius = i % 2 === 0 ? effectiveSize : effectiveSize * 0.5;
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

        // Draw particles with enhanced rendering
        renderParticles(ctx, particles);

        // Draw active companion
        const companionPos = getCompanionPosition(canvas);
        if (companionPos) {
            ctx.save();
            ctx.translate(companionPos.x, companionPos.y);
            ctx.scale(companionPos.scale, companionPos.scale);

            // Draw companion glow
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
            glowGradient.addColorStop(0, 'rgba(0, 255, 200, 0.4)');
            glowGradient.addColorStop(1, 'rgba(0, 255, 200, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.fill();

            // Draw companion icon (emoji)
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(companionPos.icon, 0, 0);

            // Draw collection cooldown indicator
            const cooldown = getCompanionCooldown();
            if (cooldown && !cooldown.ready) {
                // Cooldown arc
                ctx.strokeStyle = 'rgba(0, 255, 200, 0.6)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(0, 0, 30, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * cooldown.progress), false);
                ctx.stroke();
            }

            ctx.restore();

            // Draw companion name label
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(companionPos.x - 60, companionPos.y + 35, 120, 20);
            ctx.fillStyle = '#00ffcc';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(companionPos.name, companionPos.x, companionPos.y + 47);
        }
    } catch (error) {
        console.error('Render loop error:', error);
    }

    animationFrameId = requestAnimationFrame(renderLoop);
}

/**
 * Get fragment type based on weighted random
 * @returns {Object} Fragment type data
 */
function getRandomFragmentType() {
    const random = Math.random();
    let cumulativeWeight = 0;

    // Import FRAGMENTS from constants
    const types = [
        { data: FRAGMENTS.NORMAL, threshold: FRAGMENTS.NORMAL.weight },
        { data: FRAGMENTS.GOLDEN, threshold: FRAGMENTS.NORMAL.weight + FRAGMENTS.GOLDEN.weight },
        { data: FRAGMENTS.RARE, threshold: FRAGMENTS.NORMAL.weight + FRAGMENTS.GOLDEN.weight + FRAGMENTS.RARE.weight },
        { data: FRAGMENTS.LEGENDARY, threshold: 1.0 }
    ];

    for (const type of types) {
        if (random <= type.threshold) {
            return type.data;
        }
    }

    return FRAGMENTS.NORMAL; // Fallback
}

/**
 * Spawn a new fragment with rarity system
 */
let fragmentSpawnCount = 0;
function spawnFragment() {
    const playableTop = CANVAS.PLAYABLE_MARGIN_TOP;
    const playableBottom = canvas.height - CANVAS.PLAYABLE_MARGIN_BOTTOM;
    const playableLeft = CANVAS.PLAYABLE_MARGIN_LEFT;
    const playableRight = canvas.width - CANVAS.PLAYABLE_MARGIN_RIGHT;
    const playableWidth = playableRight - playableLeft;

    // Get random fragment type based on rarity weights
    const fragmentType = getRandomFragmentType();
    const fragmentValue = Math.floor(Math.random() * (fragmentType.valueMax - fragmentType.valueMin + 1)) + fragmentType.valueMin;

    const fragment = {
        x: playableLeft + Math.random() * playableWidth,
        y: playableTop,
        size: CANVAS.FRAGMENT_SIZE,
        speed: 2.5 + Math.random() * 1.5,  // Increased from 1.0-1.8 to 2.5-4.0 (faster!)
        value: fragmentValue,
        type: fragmentType.type,
        baseColor: fragmentType.color,
        color: fragmentType.color,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,  // Slightly faster rotation
        id: Date.now() + Math.random()
    };

    fragments.push(fragment);
    fragmentSpawnCount++;

    // Log first 3 spawns for debugging
    if (fragmentSpawnCount <= 3) {
        console.log(`⭐ Fragment #${fragmentSpawnCount} spawned:`, {
            type: fragmentType.type.toUpperCase(),
            position: `(${Math.round(fragment.x)}, ${Math.round(fragment.y)})`,
            speed: fragment.speed.toFixed(2),
            spritesLoaded: starSprites.loaded,
            hasSprite: starSprites[fragment.type] ? 'YES' : 'NO'
        });
    }
}

/**
 * Get random power-up type based on spawn chances
 * @returns {Object} Power-up type data
 */
function getRandomPowerupType() {
    const types = Object.values(POWERUPS);
    const random = Math.random();
    let cumulativeChance = 0;

    for (const type of types) {
        cumulativeChance += type.spawnChance;
        if (random <= cumulativeChance) {
            return type;
        }
    }

    return types[0]; // Fallback to first power-up
}

/**
 * Spawn a new power-up
 */
function spawnPowerup() {
    // Don't spawn too many power-ups at once
    if (powerups.length >= 2) return;

    const playableTop = CANVAS.PLAYABLE_MARGIN_TOP;
    const playableLeft = CANVAS.PLAYABLE_MARGIN_LEFT;
    const playableRight = canvas.width - CANVAS.PLAYABLE_MARGIN_RIGHT;
    const playableWidth = playableRight - playableLeft;

    const powerupType = getRandomPowerupType();

    const powerup = {
        x: playableLeft + Math.random() * playableWidth,
        y: playableTop,
        size: 30,
        speed: 0.8,  // Slower than fragments
        type: powerupType.type,
        icon: powerupType.icon,
        color: powerupType.color,
        rotation: 0,
        rotSpeed: 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
        id: Date.now() + Math.random()
    };

    powerups.push(powerup);
    console.log(`⚡ ${powerupType.type.toUpperCase()} power-up spawned!`);
}

/**
 * Render power-ups on canvas
 */
function renderPowerups() {
    powerups.forEach((powerup, index) => {
        powerup.y += powerup.speed;
        powerup.rotation += powerup.rotSpeed;
        powerup.pulsePhase += 0.05;

        // Remove if out of bounds
        if (powerup.y > canvas.height) {
            powerups.splice(index, 1);
            return;
        }

        // Pulsing effect
        const pulse = Math.sin(powerup.pulsePhase) * 0.2 + 1;
        const effectiveSize = powerup.size * pulse;

        ctx.save();
        ctx.translate(powerup.x, powerup.y);
        ctx.rotate(powerup.rotation);

        // Outer glow
        const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize + 40);
        glowGradient.addColorStop(0, powerup.color);
        glowGradient.addColorStop(0.5, powerup.color.replace(')', ', 0.4)').replace('rgb', 'rgba'));
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 0, effectiveSize + 40, 0, Math.PI * 2);
        ctx.fill();

        // Main circle background
        const bgGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, effectiveSize);
        bgGradient.addColorStop(0, powerup.color);
        bgGradient.addColorStop(1, powerup.color.replace(')', ', 0.6)').replace('rgb', 'rgba'));
        ctx.fillStyle = bgGradient;
        ctx.beginPath();
        ctx.arc(0, 0, effectiveSize, 0, Math.PI * 2);
        ctx.fill();

        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, effectiveSize, 0, Math.PI * 2);
        ctx.stroke();

        // Draw icon
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.icon, 0, 0);

        ctx.restore();
    });
}

/**
 * Activate a power-up effect
 * @param {string} type - Power-up type
 */
function activatePowerup(type) {
    const powerupData = Object.values(POWERUPS).find(p => p.type === type);
    if (!powerupData) return;

    // Check if power-up is already active
    const existing = game.activePowerups.find(p => p.type === type);
    if (existing) {
        // Extend duration
        existing.startTime = Date.now();
        showNotification(`⚡ ${powerupData.effect} prolongé !`);
    } else {
        // Add new power-up
        game.activePowerups.push({
            type: type,
            startTime: Date.now(),
            duration: powerupData.duration
        });
        showNotification(`⚡ ${powerupData.effect} activé !`);
    }

    // Play sound
    playSound('success');

    // Update UI
    updatePowerupDisplay();
}

/**
 * Update power-up display in UI
 */
function updatePowerupDisplay() {
    const now = Date.now();

    // Remove expired power-ups
    game.activePowerups = game.activePowerups.filter(powerup => {
        return (now - powerup.startTime) < powerup.duration;
    });

    // Update or create power-up display
    let powerupContainer = document.getElementById('activePowerupsDisplay');
    if (!powerupContainer) {
        powerupContainer = document.createElement('div');
        powerupContainer.id = 'activePowerupsDisplay';
        powerupContainer.style.position = 'fixed';
        powerupContainer.style.top = '200px';
        powerupContainer.style.right = '20px';
        powerupContainer.style.display = 'flex';
        powerupContainer.style.flexDirection = 'column';
        powerupContainer.style.gap = '10px';
        powerupContainer.style.zIndex = '1000';
        document.body.appendChild(powerupContainer);
    }

    powerupContainer.innerHTML = '';

    game.activePowerups.forEach(powerup => {
        const powerupData = Object.values(POWERUPS).find(p => p.type === powerup.type);
        if (!powerupData) return;

        const timeLeft = powerup.duration - (now - powerup.startTime);
        const seconds = Math.ceil(timeLeft / 1000);

        const powerupElement = document.createElement('div');
        powerupElement.style.cssText = `
            background: linear-gradient(135deg, ${powerupData.color}44, ${powerupData.color}22);
            border: 2px solid ${powerupData.color};
            border-radius: 10px;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Segoe UI', sans-serif;
            color: white;
            font-size: 14px;
            box-shadow: 0 0 20px ${powerupData.color}66;
            animation: powerupPulse 1s infinite;
        `;

        powerupElement.innerHTML = `
            <span style="font-size: 24px;">${powerupData.icon}</span>
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 12px; text-transform: uppercase;">${powerupData.type.replace('_', ' ')}</div>
                <div style="font-size: 11px; opacity: 0.8;">${seconds}s</div>
            </div>
        `;

        powerupContainer.appendChild(powerupElement);
    });
}

/**
 * Check if a power-up is active
 * @param {string} type - Power-up type
 * @returns {boolean} Whether the power-up is active
 */
function isPowerupActive(type) {
    const now = Date.now();
    return game.activePowerups.some(powerup => {
        return powerup.type === type && (now - powerup.startTime) < powerup.duration;
    });
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

    console.log('🖱️ Click at:', Math.round(x), Math.round(y), '| Fragments:', fragments.length, '| Power-ups:', powerups.length);

    // Check if clicked on a power-up first (priority over fragments)
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        const dx = x - powerup.x;
        const dy = y - powerup.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hitboxRadius = powerup.size * 2; // Generous hitbox

        if (distance < hitboxRadius) {
            console.log('✅ POWER-UP COLLECTED!', powerup.type);

            // Activate power-up
            activatePowerup(powerup.type);

            // Create particle burst
            createParticleBurst(particles, powerup.x, powerup.y, powerup.color, 30, 2);

            // Screen shake
            screenShake(canvas, 5, 200);

            // Remove power-up
            powerups.splice(i, 1);

            return; // Don't check for fragments if power-up was clicked
        }
    }

    // Check if clicked on a fragment (hitbox 3x larger for easier clicking on mobile)
    let hitDetected = false;
    for (let i = fragments.length - 1; i >= 0; i--) {
        const fragment = fragments[i];
        const dx = x - fragment.x;
        const dy = y - fragment.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const hitboxRadius = fragment.size * 3; // Increased from 2x to 3x for easier tapping

        if (distance < hitboxRadius) {
            hitDetected = true;
            console.log('✅ HIT! Fragment at:', Math.round(fragment.x), Math.round(fragment.y), '| Distance:', Math.round(distance), '| Hitbox:', hitboxRadius);
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

            // Reduced particle effects - much lighter
            const particleCount = 5 + (comboLevel * 2); // 5-11 particles max (was 15-45!)
            const particleSpeed = 1 + (comboLevel * 0.2);
            createParticleBurst(particles, fragment.x, fragment.y, fragmentColor, particleCount, particleSpeed);

            // Add minimal sparkles only for very high combos
            if (comboLevel >= 3) {
                createSparkles(particles, fragment.x, fragment.y, '#ffd700', 3);
            }

            // Reduced screen shake
            const shakeIntensity = 1 + comboLevel; // 1-4px shake (was 2-8px)
            const shakeDuration = 50 + (comboLevel * 25); // 50-125ms (was 100-250ms)
            screenShake(canvas, shakeIntensity, shakeDuration);

            // No flash effect - removed to reduce visual overload

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

    if (!hitDetected && fragments.length > 0) {
        console.log('❌ MISS! No fragment hit. Closest fragments:');
        fragments.slice(0, 3).forEach((f, idx) => {
            const dx = x - f.x;
            const dy = y - f.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            console.log(`   [${idx}] at (${Math.round(f.x)}, ${Math.round(f.y)}) - distance: ${Math.round(dist)}px`);
        });
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
    console.log('🎮 startGameLoops() called');
    console.log('   - gameLoopInterval:', gameLoopInterval);
    console.log('   - canvasInitialized:', canvasInitialized);
    console.log('   - canvas:', canvas);

    // Prevent multiple game loops
    if (gameLoopInterval) {
        console.warn('⚠️ Game loops already running, skipping');
        return;
    }

    // Ensure canvas is initialized before starting loops
    if (!canvasInitialized || !canvas) {
        console.error('❌ Cannot start game loops: canvas not initialized');
        console.error('   - canvasInitialized:', canvasInitialized);
        console.error('   - canvas:', canvas);
        return;
    }

    console.log('✅ Starting game loops...');

    // Main game loop (10 ticks per second)
    gameLoopInterval = setInterval(() => {
        try {
            updateGame(TIMING.TICK_RATE / 1000);
        } catch (error) {
            console.error('Game loop error:', error);
        }
    }, TIMING.TICK_RATE);
    console.log('✅ Main game loop started (tick rate:', TIMING.TICK_RATE, 'ms)');

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
    console.log('✅ UI update loop started (500ms)');

    // Spawn rate update loop (every 100ms for responsiveness)
    setInterval(() => {
        updateSpawnRate();
    }, 100);
    console.log('✅ Spawn rate update loop started (100ms)');

    // Initial fragment spawn - rate will be managed dynamically
    currentSpawnInterval = baseSpawnInterval;
    window.spawnIntervalId = setInterval(() => {
        spawnFragment();

        // Spawn extra fragments if Fragment Rain is active
        if (isPowerupActive('fragment_rain')) {
            spawnFragment();
            spawnFragment();
        }
    }, baseSpawnInterval);
    console.log('✅ Fragment spawn interval started (interval:', baseSpawnInterval, 'ms)');

    // Power-up spawn interval (every 20-30 seconds)
    setInterval(() => {
        const spawnChance = 0.4; // 40% chance every check
        if (Math.random() < spawnChance) {
            spawnPowerup();
        }
    }, 25000); // Check every 25 seconds
    console.log('✅ Power-up spawn interval started');

    // Power-up display update loop (every 100ms for smooth countdown)
    setInterval(() => {
        updatePowerupDisplay();
    }, 100);
    console.log('✅ Power-up display update loop started');

    console.log('🎉 All game loops started successfully!');
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
 * Toggle bottom UI minimized/expanded state
 */
window.toggleBottomUI = function() {
    const bottomUI = document.getElementById('bottomUI');
    const toggleIcon = document.getElementById('toggleIcon');

    if (bottomUI.classList.contains('minimized')) {
        // Expand
        bottomUI.classList.remove('minimized');
        bottomUI.classList.add('expanded');
        toggleIcon.textContent = '▼';
    } else {
        // Minimize
        bottomUI.classList.remove('expanded');
        bottomUI.classList.add('minimized');
        toggleIcon.textContent = '▲';
    }
};

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
    } else if (id === 'companions') {
        renderCompanionsModal();
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
 * Buy and unlock a companion
 */
window.buyCompanion = (companionId) => {
    if (unlockCompanion(companionId)) {
        const companion = COMPANIONS[companionId.toUpperCase()];
        showNotification(`✓ ${companion.name} débloqué !`);
        renderCompanionsModal();
        updateResources();
        playSound('achievement');
    } else {
        showNotification('❌ Ressources insuffisantes !');
    }
};

/**
 * Activate a companion
 */
window.activateCompanion = (companionId) => {
    if (activateCompanionLogic(companionId)) {
        const companion = COMPANIONS[companionId.toUpperCase()];
        showNotification(`✓ ${companion.name} activé !`);
        renderCompanionsModal();
        playSound('success');
    }
};

/**
 * Render companions modal content
 */
function renderCompanionsModal() {
    const companionsBody = document.getElementById('companionsBody');
    if (!companionsBody) return;

    companionsBody.innerHTML = renderCompanionsUI();
}

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
