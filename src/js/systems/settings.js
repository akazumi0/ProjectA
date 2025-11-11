/**
 * Settings System Module
 * Manages game settings and preferences
 * @module systems/settings
 */

import { game } from '../core/gameState.js';
import { saveGame } from './storage.js';
import { toggleSound, toggleMusic } from './audio.js';

/**
 * Initialize settings UI from game state
 */
export function initializeSettingsUI() {
    // Sound toggle
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.checked = game.settings.soundEnabled;
    }

    // Music toggle
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.checked = game.settings.musicEnabled;
    }

    // Volume sliders
    const volumeSFX = document.getElementById('volumeSFX');
    if (volumeSFX) {
        volumeSFX.value = game.settings.volumeSFX * 100;
        updateVolumeSFXDisplay(game.settings.volumeSFX * 100);
    }

    const volumeMusic = document.getElementById('volumeMusic');
    if (volumeMusic) {
        volumeMusic.value = game.settings.volumeMusic * 100;
        updateVolumeMusicDisplay(game.settings.volumeMusic * 100);
    }

    // Haptics toggle
    const hapticsToggle = document.getElementById('hapticsToggle');
    if (hapticsToggle) {
        hapticsToggle.checked = game.settings.hapticsEnabled;
    }

    // Language select
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = game.settings.language;
    }

    // UI Auto-hide
    const uiAutoHideToggle = document.getElementById('uiAutoHideToggle');
    if (uiAutoHideToggle) {
        uiAutoHideToggle.checked = game.settings.uiAutoHide;
    }
}

/**
 * Toggle sound setting
 */
window.toggleSoundSetting = function() {
    const soundToggle = document.getElementById('soundToggle');
    game.settings.soundEnabled = soundToggle.checked;
    toggleSound();
    saveGame();
};

/**
 * Toggle music setting
 */
window.toggleMusicSetting = function() {
    const musicToggle = document.getElementById('musicToggle');
    game.settings.musicEnabled = musicToggle.checked;
    toggleMusic();
    saveGame();
};

/**
 * Update SFX volume
 * @param {number} value - Volume value (0-100)
 */
window.updateVolumeSFX = function(value) {
    game.settings.volumeSFX = value / 100;
    updateVolumeSFXDisplay(value);
    saveGame();
};

/**
 * Update SFX volume display
 * @param {number} value - Volume value (0-100)
 */
function updateVolumeSFXDisplay(value) {
    const volumeValue = document.getElementById('volumeSFXValue');
    if (volumeValue) {
        volumeValue.textContent = Math.round(value) + '%';
    }

    // Update slider gradient
    const slider = document.getElementById('volumeSFX');
    if (slider) {
        const percentage = value;
        slider.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, #444 ${percentage}%, #444 100%)`;
    }
}

/**
 * Update music volume
 * @param {number} value - Volume value (0-100)
 */
window.updateVolumeMusic = function(value) {
    game.settings.volumeMusic = value / 100;
    updateVolumeMusicDisplay(value);
    saveGame();
};

/**
 * Update music volume display
 * @param {number} value - Volume value (0-100)
 */
function updateVolumeMusicDisplay(value) {
    const volumeValue = document.getElementById('volumeMusicValue');
    if (volumeValue) {
        volumeValue.textContent = Math.round(value) + '%';
    }

    // Update slider gradient
    const slider = document.getElementById('volumeMusic');
    if (slider) {
        const percentage = value;
        slider.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${percentage}%, #444 ${percentage}%, #444 100%)`;
    }
}

/**
 * Toggle haptics setting
 */
window.toggleHapticsSetting = function() {
    const hapticsToggle = document.getElementById('hapticsToggle');
    game.settings.hapticsEnabled = hapticsToggle.checked;
    saveGame();
};

/**
 * Change language
 * @param {string} lang - Language code (fr, en, etc.)
 */
window.changeLanguage = function(lang) {
    game.settings.language = lang;
    saveGame();
    // TODO: Implement actual language switching when i18n is added
    alert('La traduction sera disponible dans une future mise à jour.');
};

/**
 * Toggle UI auto-hide
 */
window.toggleUIAutoHide = function() {
    const uiAutoHideToggle = document.getElementById('uiAutoHideToggle');
    game.settings.uiAutoHide = uiAutoHideToggle.checked;
    saveGame();
};

/**
 * Export save data
 */
window.exportSave = function() {
    try {
        const saveData = localStorage.getItem('fallingStars_save');
        if (!saveData) {
            alert('Aucune sauvegarde trouvée !');
            return;
        }

        // Create downloadable file
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `falling-stars-save-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Sauvegarde exportée avec succès !');
    } catch (error) {
        console.error('Export error:', error);
        alert('Erreur lors de l\'exportation.');
    }
};

/**
 * Import save data
 */
window.importSave = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const saveData = event.target.result;
                // Validate JSON
                JSON.parse(saveData);

                // Confirm before overwriting
                if (confirm('Voulez-vous vraiment importer cette sauvegarde ? Vos données actuelles seront écrasées.')) {
                    localStorage.setItem('fallingStars_save', saveData);
                    alert('Sauvegarde importée ! Rechargement de la page...');
                    location.reload();
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Fichier de sauvegarde invalide.');
            }
        };

        reader.readAsText(file);
    };

    input.click();
};

/**
 * Confirm and reset save
 */
window.confirmResetSave = function() {
    const confirmation = prompt('Êtes-vous SÛR de vouloir réinitialiser le jeu ? Tapez "RESET" pour confirmer :');

    if (confirmation === 'RESET') {
        localStorage.removeItem('fallingStars_save');
        alert('Jeu réinitialisé. Rechargement de la page...');
        location.reload();
    } else {
        alert('Réinitialisation annulée.');
    }
};
