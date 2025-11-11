/**
 * Audio System Module
 * Web Audio API sound generation for iOS compatibility
 * @module systems/audio
 */

import { AUDIO } from '../core/constants.js';

let audioContext = null;
let soundEnabled = true;

/**
 * Initialize audio context
 * Must be called after user interaction on iOS
 */
export function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

/**
 * Play a sound effect
 * @param {string} type - Sound type ('catch', 'build', 'success', 'error')
 */
export function playSound(type) {
    if (!soundEnabled || !audioContext) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    const now = audioContext.currentTime;

    switch (type) {
        case 'catch':
            osc.frequency.value = AUDIO.CATCH_FREQUENCY;
            gain.gain.setValueAtTime(AUDIO.VOLUME, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + AUDIO.CATCH_DURATION);
            osc.start(now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            osc.stop(now + AUDIO.CATCH_DURATION);
            break;

        case 'build':
            osc.frequency.value = AUDIO.BUILD_FREQUENCY;
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + AUDIO.BUILD_DURATION);
            osc.start(now);
            osc.frequency.exponentialRampToValueAtTime(800, now + AUDIO.BUILD_DURATION);
            osc.stop(now + AUDIO.BUILD_DURATION);
            break;

        case 'success':
            osc.frequency.value = 523;
            gain.gain.setValueAtTime(0.2, now);
            osc.start(now);
            osc.frequency.exponentialRampToValueAtTime(784, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.stop(now + 0.3);
            break;

        case 'error':
            osc.frequency.value = 200;
            gain.gain.setValueAtTime(0.15, now);
            osc.start(now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.stop(now + 0.2);
            break;
    }
}

/**
 * Toggle sound on/off
 * @param {boolean} enabled - Enable or disable sound
 */
export function setSoundEnabled(enabled) {
    soundEnabled = enabled;
}

/**
 * Get current sound enabled state
 * @returns {boolean} True if sound is enabled
 */
export function isSoundEnabled() {
    return soundEnabled;
}

/**
 * Resume audio context (required for iOS)
 * Call this on user interaction
 */
export function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}
