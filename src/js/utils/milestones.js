/**
 * Milestones System Module
 * Celebrates important player achievements with visual effects
 * @module utils/milestones
 */

import { game } from '../core/gameState.js';
import { showNotification } from '../systems/ui.js';
import { playSound } from '../systems/audio.js';
import { createConfettiBurst, flashEffect } from './screenEffects.js';
import { heavyHaptic, successHaptic } from './haptics.js';

/**
 * Milestone definitions
 * Each milestone triggers a celebration when reached
 */
const milestones = {
    lumen: [
        { value: 100, title: 'Premier Centenaire!', message: '100 Lumen collectés! Vous maîtrisez les bases.', color: '#00d4ff', reward: { energy: 10 } },
        { value: 1000, title: 'Millier Stellaire!', message: '1K Lumen! Votre réseau s\'étend.', color: '#4ade80', reward: { energy: 50 } },
        { value: 10000, title: 'Réseau Galactique!', message: '10K Lumen! Vous devenez une force cosmique.', color: '#ffd700', reward: { energy: 200, antimatter: 1 } },
        { value: 100000, title: 'Empire Stellaire!', message: '100K Lumen! Les étoiles s\'inclinent devant vous.', color: '#ff00ff', reward: { energy: 1000, antimatter: 5 } },
        { value: 1000000, title: 'Seigneur du Cosmos!', message: '1M Lumen! Vous avez atteint la légende.', color: '#ff6600', reward: { energy: 5000, antimatter: 20 } },
        { value: 10000000, title: 'Transcendance!', message: '10M Lumen! Vous manipulez l\'énergie des étoiles.', color: '#ff0066', reward: { energy: 25000, antimatter: 100 } }
    ],
    buildings: [
        { value: 1, title: 'Première Construction!', message: 'Votre premier bâtiment est opérationnel!', color: '#4ade80' },
        { value: 5, title: 'Colonie Naissante', message: '5 bâtiments! Votre base prend forme.', color: '#00d4ff' },
        { value: 10, title: 'Avant-Poste Établi', message: '10 bâtiments! Infrastructure solide.', color: '#ffd700' },
        { value: 25, title: 'Métropole Spatiale', message: '25 bâtiments! Une vraie cité des étoiles.', color: '#ff00ff' },
        { value: 50, title: 'Empire Architectural', message: '50 bâtiments! Vous construisez un empire.', color: '#ff6600' },
        { value: 100, title: 'Civilisation Type II', message: '100 bâtiments! Vous contrôlez trois planètes.', color: '#ff0066' }
    ],
    technologies: [
        { value: 1, title: 'Premier Breakthrough!', message: 'Première technologie débloquée!', color: '#00d4ff' },
        { value: 5, title: 'Chercheur Prometteur', message: '5 technologies! La connaissance s\'étend.', color: '#4ade80' },
        { value: 10, title: 'Scientifique Éminent', message: '10 technologies! Maître de la science.', color: '#ffd700' },
        { value: 15, title: 'Domaine Quantique', message: '15 technologies! Vous entrez dans l\'impossible.', color: '#ff00ff' },
        { value: 20, title: 'Omniscience', message: 'Toutes les technologies débloquées!', color: '#ff6600' }
    ],
    clicks: [
        { value: 100, title: 'Clicker Dévoué', message: '100 clics! Vos doigts sont infatigables.', color: '#00d4ff' },
        { value: 500, title: 'Main de Fer', message: '500 clics! Impressionnante dévotion.', color: '#4ade80' },
        { value: 1000, title: 'Légende du Clic', message: '1000 clics! C\'est de l\'obsession... ou de l\'art?', color: '#ffd700' },
        { value: 5000, title: 'Maître Ascète', message: '5000 clics! Vous avez transcendé le clic.', color: '#ff00ff' }
    ],
    prestige: [
        { value: 1, title: 'Première Renaissance!', message: 'Premier prestige accompli! Vous renaissez plus fort.', color: '#ffd700', reward: { antimatter: 10 } },
        { value: 5, title: 'Voyageur Temporel', message: '5 prestiges! Le temps n\'est plus un obstacle.', color: '#ff00ff', reward: { antimatter: 50 } },
        { value: 10, title: 'Maître du Cycle', message: '10 prestiges! Vous maîtrisez la boucle.', color: '#ff6600', reward: { antimatter: 150 } },
        { value: 25, title: 'Gardien de l\'Éternité', message: '25 prestiges! Vous êtes devenu légende.', color: '#ff0066', reward: { antimatter: 500 } },
        { value: 50, title: 'Transcendance Absolue', message: '50 prestiges! Au-delà de toute mesure.', color: '#ff00ff', reward: { antimatter: 2000 } }
    ]
};

/**
 * Check if a milestone has been reached
 * @param {string} type - Type of milestone (lumen, buildings, etc.)
 * @param {number} currentValue - Current value to check
 */
export function checkMilestone(type, currentValue) {
    if (!milestones[type]) return;

    const typeString = `${type}`;

    // Get milestones for this type
    const milestonesForType = milestones[type];

    // Check each milestone
    for (const milestone of milestonesForType) {
        const milestoneId = `${typeString}_${milestone.value}`;

        // Skip if already reached
        if (game.milestonesReached.includes(milestoneId)) continue;

        // Check if milestone is reached
        if (currentValue >= milestone.value) {
            triggerMilestoneCelebration(milestone, type);
            game.milestonesReached.push(milestoneId);
        }
    }
}

/**
 * Trigger a milestone celebration
 * @param {Object} milestone - Milestone data
 * @param {string} type - Milestone type
 */
function triggerMilestoneCelebration(milestone, type) {
    console.log(`🎉 MILESTONE REACHED: ${milestone.title} (${type})`);

    // Play celebration sound
    playSound('achievement');
    heavyHaptic();

    // Create fullscreen celebration modal
    createCelebrationModal(milestone);

    // Give reward if any
    if (milestone.reward) {
        setTimeout(() => {
            for (const [resource, amount] of Object.entries(milestone.reward)) {
                if (game.resources[resource] !== undefined) {
                    game.resources[resource] += amount;
                    game.totalResources[resource] += amount;
                }
            }

            // Show reward notification
            const rewardText = Object.entries(milestone.reward)
                .map(([res, amt]) => `+${amt} ${res.charAt(0).toUpperCase() + res.slice(1)}`)
                .join(', ');
            showNotification(`🎁 Récompense: ${rewardText}`, 5000);
        }, 2000);
    }

    // Show ASTRA congratulations
    setTimeout(() => {
        showAstraCongratulations(milestone);
    }, 3000);
}

/**
 * Create fullscreen celebration modal
 * @param {Object} milestone - Milestone data
 */
function createCelebrationModal(milestone) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'milestone-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;

    // Create celebration box
    const celebrationBox = document.createElement('div');
    celebrationBox.className = 'milestone-celebration';
    celebrationBox.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 50, 100, 0.95), rgba(0, 30, 60, 0.95));
        border: 3px solid ${milestone.color};
        border-radius: 20px;
        padding: 40px;
        max-width: 90%;
        width: 500px;
        text-align: center;
        box-shadow: 0 20px 60px ${milestone.color}66, 0 0 100px ${milestone.color}33;
        animation: celebrationPulse 0.6s ease-out;
        position: relative;
        overflow: hidden;
    `;

    // Add content
    celebrationBox.innerHTML = `
        <div style="font-size: 60px; margin-bottom: 20px; animation: celebrationBounce 0.8s ease-out;">
            🎉
        </div>
        <div style="font-size: 28px; font-weight: bold; color: ${milestone.color}; margin-bottom: 15px; text-shadow: 0 0 20px ${milestone.color};">
            ${milestone.title}
        </div>
        <div style="font-size: 18px; color: #fff; margin-bottom: 25px; line-height: 1.6;">
            ${milestone.message}
        </div>
        ${milestone.reward ? `
            <div style="font-size: 14px; color: #4ade80; background: rgba(74, 222, 128, 0.1); border: 1px solid #4ade80; border-radius: 10px; padding: 15px; margin-bottom: 20px;">
                🎁 Récompense: ${Object.entries(milestone.reward).map(([res, amt]) => `${amt} ${res.charAt(0).toUpperCase() + res.slice(1)}`).join(', ')}
            </div>
        ` : ''}
        <button id="closeCelebration" style="
            background: linear-gradient(135deg, ${milestone.color}, ${adjustColor(milestone.color, -30)});
            border: none;
            border-radius: 10px;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: bold;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 15px ${milestone.color}66;
            transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            Continuer l'Aventure! 🚀
        </button>
    `;

    // Add animations
    addCelebrationStyles();

    overlay.appendChild(celebrationBox);
    document.body.appendChild(overlay);

    // Create fireworks particles
    createFireworksEffect(overlay, milestone.color);

    // Flash effect
    setTimeout(() => {
        flashEffect(document.body, `${milestone.color}33`, 200);
    }, 100);

    // Close button handler
    const closeBtn = document.getElementById('closeCelebration');
    closeBtn.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    });

    // Auto-close after 8 seconds
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }, 8000);
}

/**
 * Create fireworks effect on canvas
 * @param {HTMLElement} container - Container element
 * @param {string} color - Fireworks color
 */
function createFireworksEffect(container, color) {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 1;
    `;
    container.insertBefore(canvas, container.firstChild);

    const ctx = canvas.getContext('2d');
    const fireworkParticles = [];

    // Launch fireworks
    const launchFirework = () => {
        const x = Math.random() * canvas.width;
        const y = canvas.height;
        const targetY = Math.random() * canvas.height * 0.5;

        // Create burst at target
        setTimeout(() => {
            for (let i = 0; i < 50; i++) {
                const angle = (Math.PI * 2 * i) / 50;
                const velocity = 2 + Math.random() * 3;
                fireworkParticles.push({
                    x,
                    y: targetY,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    life: 60 + Math.random() * 40,
                    maxLife: 60 + Math.random() * 40,
                    color: color,
                    size: 2 + Math.random() * 2
                });
            }
        }, 500);
    };

    // Launch multiple fireworks
    for (let i = 0; i < 5; i++) {
        setTimeout(() => launchFirework(), i * 600);
    }

    // Animate particles
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = fireworkParticles.length - 1; i >= 0; i--) {
            const p = fireworkParticles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life--;

            if (p.life <= 0) {
                fireworkParticles.splice(i, 1);
                continue;
            }

            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        if (fireworkParticles.length > 0) {
            requestAnimationFrame(animate);
        }
    };

    animate();
}

/**
 * Show ASTRA congratulations message
 * @param {Object} milestone - Milestone data
 */
function showAstraCongratulations(milestone) {
    const astraDiv = document.getElementById('astraDialogue');
    const astraText = document.getElementById('astraText');

    if (!astraDiv || !astraText) return;

    const messages = [
        `Incroyable, Commandant! ${milestone.title} Je suis impressionnée.`,
        `Félicitations! ${milestone.title} Vous dépassez toutes mes projections.`,
        `Extraordinaire! ${milestone.title} Continuez comme ça!`,
        `Wow! ${milestone.title} Les statistiques ne mentent pas: vous êtes exceptionnel.`,
        `Succès débloqué: ${milestone.title} Mon respect pour vous grandit.`
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    astraText.textContent = randomMessage;
    astraDiv.classList.add('show');
    successHaptic();
}

/**
 * Add celebration animation styles
 */
function addCelebrationStyles() {
    if (document.getElementById('milestoneStyles')) return;

    const style = document.createElement('style');
    style.id = 'milestoneStyles';
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }

        @keyframes celebrationPulse {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes celebrationBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            25% { transform: translateY(-20px) scale(1.2); }
            50% { transform: translateY(-10px) scale(1.1); }
            75% { transform: translateY(-15px) scale(1.15); }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Adjust color brightness
 * @param {string} color - Hex color
 * @param {number} amount - Amount to adjust (-255 to 255)
 * @returns {string} Adjusted hex color
 */
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Check all milestone types for current game state
 */
export function checkAllMilestones() {
    // Check lumen milestones
    checkMilestone('lumen', game.totalResources.lumen);

    // Check buildings milestones
    const totalBuildings = Object.values(game.planets[game.currentPlanet].buildings).reduce((a, b) => a + b, 0);
    checkMilestone('buildings', totalBuildings);

    // Check technologies milestones
    const totalTechs = Object.values(game.technologies).reduce((a, b) => a + b, 0);
    checkMilestone('technologies', totalTechs);

    // Check clicks milestones
    checkMilestone('clicks', game.stats.totalClicks);

    // Check prestige milestones
    checkMilestone('prestige', game.prestige.level);
}
