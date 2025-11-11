/**
 * Tutorial System Module
 * Progressive onboarding for new players
 * @module systems/tutorial
 */

import { game, updateGameState } from '../core/gameState.js';
import { showNotification } from './ui.js';
import { playSound } from './audio.js';

/**
 * Tutorial steps configuration
 */
const tutorialSteps = [
    {
        id: 0,
        title: "Bienvenue, Commandant!",
        message: "Les fragments stellaires tombent vers la Terre. Votre mission : les capturer pour sauver la planète!",
        highlight: null,
        action: "tap_anywhere",
        astraMessage: "👋 Bienvenue dans le Réseau Orbital ASTRA! Je suis votre IA compagnon. Appuyez n'importe où pour commencer."
    },
    {
        id: 1,
        title: "Capturez les fragments!",
        message: "Touchez les étoiles qui tombent pour collecter du Lumen, la ressource d'énergie cosmique.",
        highlight: "gameCanvas",
        action: "capture_3_fragments",
        goal: 3,
        astraMessage: "✨ Excellent! Capturez 3 fragments pour continuer. Chaque fragment vous donne du Lumen."
    },
    {
        id: 2,
        title: "Automatisez la collecte",
        message: "Les bâtiments produisent automatiquement du Lumen. Achetez votre première Mine!",
        highlight: "buildings",
        targetTab: 1, // Buildings tab
        targetItem: "building-lumenMine",
        action: "buy_first_mine",
        astraMessage: "🏗️ Les Mines de Lumen collectent automatiquement pour vous. Ouvrez l'onglet BÂTIMENTS et achetez-en une!"
    },
    {
        id: 3,
        title: "Améliorez votre puissance",
        message: "Les améliorations de Défense augmentent votre pouvoir de capture manuel.",
        highlight: "defense",
        targetTab: 0, // Defense tab
        targetItem: "defense-clickPower",
        action: "buy_first_upgrade",
        astraMessage: "🧤 Les Gants Gravitationnels augmentent votre puissance de clic. Achetez-les dans l'onglet DÉFENSE!"
    },
    {
        id: 4,
        title: "Recherchez des technologies",
        message: "Les Technologies débloquent de nouvelles possibilités et bonus puissants.",
        highlight: "technologies",
        targetTab: 2, // Tech tab
        action: "view_tech_tab",
        astraMessage: "🔬 Les Technologies sont la clé du progrès. Explorez l'onglet TECHNOLOGIES pour voir ce qui vous attend!"
    },
    {
        id: 5,
        title: "Vous êtes prêt!",
        message: "Tous les systèmes sont maintenant débloqués. Construisez votre empire cosmique et sauvez la Terre!",
        highlight: null,
        action: "complete_tutorial",
        astraMessage: "🎉 Félicitations, Commandant! Vous maîtrisez les bases. Le réseau ASTRA est maintenant pleinement opérationnel. Bonne chance!"
    }
];

/**
 * Current tutorial state
 */
let currentStep = 0;
let tutorialActive = false;
let stepProgress = 0;
let overlay = null;
let tutorialBox = null;

/**
 * Initialize tutorial system
 */
export function initTutorial() {
    // Check if tutorial should run
    if (game.tutorialCompleted || !game.firstTime) {
        return false;
    }

    tutorialActive = true;
    currentStep = game.tutorialStep || 0;
    stepProgress = 0;

    // Create overlay elements
    createTutorialUI();

    // Hide all left icon bar buttons initially
    hideAllSystems();

    // Start tutorial
    showStep(currentStep);

    return true;
}

/**
 * Create tutorial UI elements (overlay + dialog box)
 */
function createTutorialUI() {
    // Create dark overlay with spotlight
    overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9998;
        pointer-events: none;
        transition: opacity 0.3s ease;
    `;
    document.body.appendChild(overlay);

    // Create tutorial dialog box
    tutorialBox = document.createElement('div');
    tutorialBox.id = 'tutorialBox';
    tutorialBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, rgba(0, 50, 100, 0.95), rgba(0, 30, 60, 0.95));
        border: 2px solid #00d4ff;
        border-radius: 15px;
        padding: 20px;
        max-width: 90%;
        width: 400px;
        z-index: 9999;
        box-shadow: 0 10px 50px rgba(0, 212, 255, 0.3);
        text-align: center;
    `;
    document.body.appendChild(tutorialBox);
}

/**
 * Show a specific tutorial step
 */
function showStep(stepIndex) {
    if (stepIndex >= tutorialSteps.length) {
        completeTutorial();
        return;
    }

    const step = tutorialSteps[stepIndex];
    currentStep = stepIndex;
    stepProgress = 0;

    // Update game state
    updateGameState('tutorialStep', stepIndex);

    // Update tutorial box content
    tutorialBox.innerHTML = `
        <div style="font-size: 18px; font-weight: bold; color: #00d4ff; margin-bottom: 10px;">
            ${step.title}
        </div>
        <div style="font-size: 14px; color: #fff; margin-bottom: 15px; line-height: 1.5;">
            ${step.message}
        </div>
        ${step.goal ? `
            <div style="font-size: 12px; color: #4ade80; margin-bottom: 10px;">
                Progression: <span id="tutorialProgress">${stepProgress}/${step.goal}</span>
            </div>
        ` : ''}
        <div style="font-size: 11px; color: #aaa; margin-top: 15px;">
            Étape ${stepIndex + 1}/${tutorialSteps.length}
        </div>
    `;

    // Show ASTRA message
    if (step.astraMessage) {
        setTimeout(() => {
            const astraDiv = document.getElementById('astraDialogue');
            const astraText = document.getElementById('astraText');
            if (astraDiv && astraText) {
                astraText.textContent = step.astraMessage;
                astraDiv.classList.add('show');
                playSound('notification');
            }
        }, 500);
    }

    // Highlight specific element
    if (step.highlight) {
        highlightElement(step.highlight);
    } else {
        clearHighlight();
    }

    // Switch to target tab if specified
    if (step.targetTab !== undefined) {
        setTimeout(() => {
            const tab = document.querySelectorAll('.tab')[step.targetTab];
            if (tab) {
                tab.click();
            }
        }, 100);
    }

    // Handle specific actions
    switch (step.action) {
        case 'tap_anywhere':
            enableTapAnywhere();
            break;
        case 'capture_3_fragments':
            enableFragmentCapture();
            break;
        case 'buy_first_mine':
            enableSpecificPurchase('building-lumenMine');
            break;
        case 'buy_first_upgrade':
            enableSpecificPurchase('defense-clickPower');
            break;
        case 'view_tech_tab':
            enableTabSwitch(2);
            break;
        case 'complete_tutorial':
            setTimeout(() => nextStep(), 3000);
            break;
    }
}

/**
 * Highlight a specific element
 */
function highlightElement(elementId) {
    clearHighlight();

    const element = document.getElementById(elementId);
    if (!element) return;

    // Create spotlight effect
    const rect = element.getBoundingClientRect();

    // Update overlay to have a cutout for the highlighted element
    overlay.style.background = `
        radial-gradient(
            ellipse ${rect.width + 40}px ${rect.height + 40}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.85) 60%
        )
    `;

    // Add glow to element
    element.style.position = 'relative';
    element.style.zIndex = '9999';
    element.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.8)';
    element.style.border = '2px solid #00d4ff';
    element.style.borderRadius = '10px';
    element.classList.add('tutorial-highlight');
}

/**
 * Clear highlight
 */
function clearHighlight() {
    overlay.style.background = 'rgba(0, 0, 0, 0.85)';

    const highlighted = document.querySelectorAll('.tutorial-highlight');
    highlighted.forEach(el => {
        el.style.zIndex = '';
        el.style.boxShadow = '';
        el.style.border = '';
        el.classList.remove('tutorial-highlight');
    });
}

/**
 * Enable tap anywhere to continue
 */
function enableTapAnywhere() {
    const handleClick = () => {
        document.removeEventListener('click', handleClick);
        nextStep();
    };
    document.addEventListener('click', handleClick);
}

/**
 * Enable fragment capture tracking
 */
function enableFragmentCapture() {
    // This will be triggered from captureFragment() in gameLogic.js
    // We just enable the canvas for interaction
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.style.pointerEvents = 'auto';
        canvas.style.position = 'relative';
        canvas.style.zIndex = '9999';
    }
}

/**
 * Enable specific purchase
 */
function enableSpecificPurchase(itemId) {
    const element = document.getElementById(itemId);
    if (!element) {
        console.warn(`Tutorial: item ${itemId} not found`);
        return;
    }

    // Make it clickable
    element.style.pointerEvents = 'auto';
    element.style.position = 'relative';
    element.style.zIndex = '9999';

    // Highlight it
    highlightElement(itemId);

    // Make the tab clickable too
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.style.pointerEvents = 'auto';
        tab.style.position = 'relative';
        tab.style.zIndex = '9999';
    });
}

/**
 * Enable tab switch
 */
function enableTabSwitch(tabIndex) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, i) => {
        tab.style.pointerEvents = 'auto';
        tab.style.position = 'relative';
        tab.style.zIndex = '9999';
    });

    // Auto-advance after viewing
    setTimeout(() => nextStep(), 2000);
}

/**
 * Progress tracking for tutorial actions
 */
export function onTutorialAction(action, data = {}) {
    if (!tutorialActive) return;

    const step = tutorialSteps[currentStep];
    if (!step) return;

    switch (action) {
        case 'fragment_captured':
            if (step.action === 'capture_3_fragments') {
                stepProgress++;
                updateProgressDisplay();

                if (stepProgress >= step.goal) {
                    setTimeout(() => nextStep(), 1000);
                }
            }
            break;

        case 'building_bought':
            if (step.action === 'buy_first_mine' && data.key === 'lumenMine') {
                nextStep();
            }
            break;

        case 'defense_bought':
            if (step.action === 'buy_first_upgrade' && data.key === 'clickPower') {
                nextStep();
            }
            break;

        case 'tab_switched':
            if (step.action === 'view_tech_tab' && data.tabIndex === 2) {
                // Auto-complete after viewing tech tab
            }
            break;
    }
}

/**
 * Update progress display
 */
function updateProgressDisplay() {
    const progressEl = document.getElementById('tutorialProgress');
    if (progressEl) {
        const step = tutorialSteps[currentStep];
        progressEl.textContent = `${stepProgress}/${step.goal}`;
    }
}

/**
 * Move to next step
 */
function nextStep() {
    playSound('success');
    currentStep++;

    if (currentStep >= tutorialSteps.length) {
        completeTutorial();
    } else {
        showStep(currentStep);
    }
}

/**
 * Complete tutorial
 */
function completeTutorial() {
    tutorialActive = false;
    updateGameState('tutorialCompleted', true);
    updateGameState('tutorialStep', tutorialSteps.length);

    // Remove tutorial UI
    if (overlay) overlay.remove();
    if (tutorialBox) tutorialBox.remove();

    // Show all systems
    showAllSystems();

    // Clear any highlighting
    clearHighlight();

    // Reset z-indexes
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
        if (el.style.zIndex === '9999') {
            el.style.zIndex = '';
        }
        if (el.style.pointerEvents === 'auto') {
            el.style.pointerEvents = '';
        }
    });

    // Show completion notification
    showNotification('🎉 Tutoriel terminé! Tous les systèmes débloqués.', 5000);

    // Play celebration sound
    playSound('achievement');

    // Show ASTRA final message
    setTimeout(() => {
        const astraDiv = document.getElementById('astraDialogue');
        const astraText = document.getElementById('astraText');
        if (astraDiv && astraText) {
            astraText.textContent = "🚀 Parfait! Vous êtes maintenant un Commandant ASTRA confirmé. Le destin de la Terre est entre vos mains!";
            astraDiv.classList.add('show');
        }
    }, 1000);
}

/**
 * Skip tutorial (for debug/testing)
 */
export function skipTutorial() {
    completeTutorial();
}

/**
 * Hide all systems initially (progressive disclosure)
 */
function hideAllSystems() {
    // Hide all left icon bar buttons
    const iconButtons = document.querySelectorAll('#leftIconBar .icon-button');
    iconButtons.forEach(btn => {
        btn.style.display = 'none';
    });

    // Only show daily rewards
    const dailyIcon = document.getElementById('dailyIcon');
    if (dailyIcon) dailyIcon.style.display = 'flex';
}

/**
 * Show all systems (after tutorial complete)
 */
function showAllSystems() {
    const iconButtons = document.querySelectorAll('#leftIconBar .icon-button');
    iconButtons.forEach(btn => {
        btn.style.display = 'flex';
    });
}

/**
 * Progressive disclosure - unlock systems based on milestones
 */
export function checkSystemUnlocks() {
    if (game.tutorialCompleted) {
        // All systems already unlocked
        return;
    }

    // Unlock systems progressively
    const unlocks = {
        questsIcon: game.stats.timePlayed > 600000, // 10 minutes
        achievementsIcon: Object.keys(game.achievements).length > 0,
        lootboxIcon: game.stats.fragmentsCaught > 50,
        artifactsIcon: Object.values(game.technologies).some(t => t > 0),
        eventsIcon: game.totalResources.lumen > 100,
        prestigeIcon: game.totalResources.lumen > 10000,
        shopIcon: game.tutorialCompleted
    };

    for (const [iconId, shouldUnlock] of Object.entries(unlocks)) {
        const icon = document.getElementById(iconId);
        if (icon && shouldUnlock) {
            icon.style.display = 'flex';

            // Show notification on first unlock
            if (icon.dataset.unlocked !== 'true') {
                icon.dataset.unlocked = 'true';
                const iconEmoji = icon.textContent.trim();
                showNotification(`🔓 Nouveau système débloqué: ${iconEmoji}`);
            }
        }
    }
}

/**
 * Check if tutorial is active
 */
export function isTutorialActive() {
    return tutorialActive;
}

/**
 * Get current tutorial step
 */
export function getCurrentStep() {
    return currentStep;
}
