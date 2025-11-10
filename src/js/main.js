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
import { TIMING, CANVAS } from './core/constants.js';

// Data imports
import { buildingData, defenseData } from './data/buildings.js';
import { techData } from './data/technologies.js';
import { achievementData } from './data/achievements.js';
import { astraDialogues } from './data/dialogues.js';

// System imports
import { initAudio, playSound, resumeAudio, playBackgroundMusic, toggleMusic, toggleSound } from './systems/audio.js';
import { loadGame, saveGame, processOfflineEarnings, setupAutoSave } from './systems/storage.js';
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
    openFreeLootbox as openFreeLootboxLogic
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
import { formatNumber, formatCost, formatLevel } from './utils/formatters.js';
import { getCost, checkRequires, calculateClickPower, canAfford } from './utils/calculations.js';

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
 * Initialize the game
 * Called after user enters username
 */
export function startGame() {
    const usernameInput = document.getElementById('usernameInput');
    const welcomeScreen = document.getElementById('welcome');

    if (usernameInput && usernameInput.value.trim()) {
        game.username = usernameInput.value.trim();
    }

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

    // Show random welcome dialogue (pick from first 5 dialogues)
    const randomDialogue = astraDialogues[Math.floor(Math.random() * Math.min(5, astraDialogues.length))];
    showAstraDialogue(randomDialogue.text);

    // Initial UI update
    updateAllUI();
    renderAllTabs();
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

    // Initialize stars background
    for (let i = 0; i < CANVAS.STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            opacity: Math.random()
        });
    }

    // Start render loop
    renderLoop();
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
 * Main render loop for canvas
 */
function renderLoop() {
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fillRect(star.x, star.y, star.size, star.size);

        // Twinkle effect
        star.opacity += (Math.random() - 0.5) * 0.05;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));
    });

    // Draw fragments
    fragments.forEach((fragment, index) => {
        fragment.y += fragment.speed;
        fragment.rotation += fragment.rotSpeed;

        // Remove if out of bounds
        if (fragment.y > canvas.height) {
            fragments.splice(index, 1);
            return;
        }

        // Draw star fragment
        ctx.save();
        ctx.translate(fragment.x, fragment.y);
        ctx.rotate(fragment.rotation);
        ctx.shadowBlur = 20;
        ctx.shadowColor = fragment.color;
        ctx.fillStyle = fragment.color;

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

    // Draw particles
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life <= 0) {
            particles.splice(index, 1);
            return;
        }

        ctx.fillStyle = `rgba(0, 212, 255, ${particle.life / 30})`;
        ctx.fillRect(particle.x, particle.y, 2, 2);
    });

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
        speed: 1.5 + Math.random() * 1,
        value: Math.floor(Math.random() * 10) + 1,
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
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicked on a fragment (hitbox 1.5x larger for easier clicking)
    for (let i = fragments.length - 1; i >= 0; i--) {
        const fragment = fragments[i];
        const dx = x - fragment.x;
        const dy = y - fragment.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < fragment.size * 1.5) {
            // Capture fragment
            const result = captureFragment(fragment);

            if (!result) continue;

            // Create particle effect
            for (let p = 0; p < 10; p++) {
                particles.push({
                    x: fragment.x,
                    y: fragment.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    life: 30
                });
            }

            // Show floating text
            if (result.lumen) {
                createFloatingText(`+${formatNumber(result.lumen)}`, fragment.x, fragment.y);
            }

            // Remove fragment
            fragments.splice(i, 1);

            // Update UI
            updateResources();
            updateComboDisplay();

            // Play sound
            playSound('capture');

            break;
        }
    }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
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
 * Start game loops (logic, UI updates, fragment spawning)
 */
function startGameLoops() {
    // Main game loop (10 ticks per second)
    gameLoopInterval = setInterval(() => {
        updateGame(TIMING.TICK_RATE / 1000);
    }, TIMING.TICK_RATE);

    // UI update loop (every 500ms)
    uiUpdateInterval = setInterval(() => {
        updateResources();
        updateComboDisplay();
        updateLootboxTimer();
    }, 500);

    // Fragment spawn loop - fixed rate for smoother gameplay
    // Spawns approximately 3 stars every 2 seconds (1 every ~666ms)
    setInterval(() => {
        spawnFragment();
    }, 666);
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
 * Create item card element
 */
function createItemCard(key, data, level, cost, canBuy, type, locked = false) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.id = `${type}-${key}`;
    if (canBuy) card.classList.add('buildable');
    if (locked) card.classList.add('locked');

    const icon = data.icon || '🔧';
    const levelText = formatLevel(level, data.max);
    const effectText = data.display ? data.display(level + 1) : '';

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
        <div class="item-footer">
            <div class="item-cost">${formatCost(cost)}</div>
            <button class="build-btn" ${!canBuy ? 'disabled' : ''} onclick="buy${type.charAt(0).toUpperCase() + type.slice(1)}('${key}')">
                ${level >= data.max ? 'MAX' : 'ACHETER'}
            </button>
        </div>
    `;

    return card;
}

/**
 * Core functions exposed globally for inline onclick handlers
 */
window.startGame = startGame;
window.switchTab = switchTab;
window.openModal = (id) => toggleModal(id + 'Modal', true);
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
    }
};

window.doPrestige = () => {
    if (confirm('Confirmer le Prestige ? Cela réinitialisera votre progression (sauf technologies).')) {
        const result = performPrestige();
        if (result.success) {
            showNotification(`🌠 Prestige Niveau ${result.newLevel} ! +${result.bonus}% production`);
            updateAllUI();
            renderAllTabs();
        }
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
    }
};

window.buyBuilding = (key) => {
    if (buyBuilding(key)) {
        showNotification(`✓ ${buildingData[key].name} construit !`);
        renderBuildingsTab();
        updateResources();
        // Trigger animation after render
        setTimeout(() => triggerSuccessAnimation(`building-${key}`), 10);
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
    document.getElementById('modalUsername').textContent = game.username;
    document.getElementById('modalScore').textContent = formatNumber(game.stats.timePlayed / 1000);
    document.getElementById('modalLumen').textContent = formatNumber(game.totalResources.lumen);

    const planetsUnlocked = Object.values(game.planets).filter(p => p.unlocked).length;
    document.getElementById('modalPlanets').textContent = `${planetsUnlocked}/3`;
    document.getElementById('modalTechs').textContent = Object.values(game.technologies).filter(t => t > 0).length;
}

/**
 * App initialization
 */
window.addEventListener('DOMContentLoaded', () => {
    // Initialize audio
    initAudio();

    // Resume audio on first interaction (iOS requirement)
    document.addEventListener('click', resumeAudio, { once: true });

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
