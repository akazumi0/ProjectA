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
import { questData } from './data/quests.js';
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
    openFreeLootbox as openFreeLootboxLogic,
    generateDailyQuests,
    claimQuestReward,
    checkQuestReset,
    checkAchievements
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

    // Initial UI update (do this before showing dialogue to prevent lag)
    updateAllUI();
    renderAllTabs();

    // Initialize quests if none active
    if (!game.quests.active || game.quests.active.length === 0) {
        generateDailyQuests();
    }

    // Show random welcome dialogue after UI is ready (delayed to prevent lag)
    setTimeout(() => {
        const randomDialogue = astraDialogues[Math.floor(Math.random() * Math.min(5, astraDialogues.length))];
        showAstraDialogue(randomDialogue.text);
    }, 100);
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

    // Get current combo level for visual effects
    const comboCount = game.combo.count;
    const comboLevel = comboCount >= 30 ? 3 : comboCount >= 15 ? 2 : comboCount >= 8 ? 1 : 0;

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

    // Draw particles
    particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life <= 0) {
            particles.splice(index, 1);
            return;
        }

        // Change particle color during combo
        let particleColor = comboLevel >= 2 ? '255, 100, 0' : '0, 212, 255';
        ctx.fillStyle = `rgba(${particleColor}, ${particle.life / 30})`;
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
    // Main game loop (10 ticks per second)
    gameLoopInterval = setInterval(() => {
        updateGame(TIMING.TICK_RATE / 1000);
    }, TIMING.TICK_RATE);

    // UI update loop (every 500ms)
    uiUpdateInterval = setInterval(() => {
        updateResources();
        updateComboDisplay();
        updateLootboxTimer();
        updateComboVisuals();
        checkQuestReset();

        // Check for new achievements
        const newAchievements = checkAchievements();
        newAchievements.forEach(({ key, data }) => {
            showNotification(`🏆 ${data.name} débloqué !`);
        });
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
 * Create item card element
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

    // Make card clickable if not locked and not maxed
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
    toggleModal(id + 'Modal', true);
    if (id === 'quests') {
        renderQuests();
    } else if (id === 'achievements') {
        renderAchievements();
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
