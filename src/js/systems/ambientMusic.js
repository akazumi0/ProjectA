/**
 * Ambient Music System
 * Procedural space ambient music using Web Audio API
 * @module systems/ambientMusic
 */

let audioContext = null;
let musicEnabled = false;
let masterGain = null;

// Musical nodes
let pad1Oscillator = null;
let pad2Oscillator = null;
let pad3Oscillator = null;
let bassOscillator = null;

let pad1Gain = null;
let pad2Gain = null;
let pad3Gain = null;
let bassGain = null;

let filterNode = null;
let reverbNode = null;

/**
 * Initialize ambient music system
 */
export function initAmbientMusic() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Create master gain
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.3, audioContext.currentTime); // 30% volume
    masterGain.connect(audioContext.destination);

    // Create reverb (convolver)
    reverbNode = audioContext.createConvolver();
    reverbNode.buffer = createReverbImpulse(audioContext, 3, 0.5);
    reverbNode.connect(masterGain);

    // Create filter for atmospheric effect
    filterNode = audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(800, audioContext.currentTime);
    filterNode.Q.setValueAtTime(1, audioContext.currentTime);
    filterNode.connect(reverbNode);
}

/**
 * Create reverb impulse response
 * @param {AudioContext} context - Audio context
 * @param {number} duration - Duration in seconds
 * @param {number} decay - Decay factor
 * @returns {AudioBuffer} Impulse response buffer
 */
function createReverbImpulse(context, duration, decay) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = length - i;
        left[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
    }

    return impulse;
}

/**
 * Start ambient music
 */
export function startAmbientMusic() {
    if (!audioContext || musicEnabled) return;

    // Resume audio context if suspended (browser autoplay policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    musicEnabled = true;

    // Create pad 1 (low drone) - C2 (65.41 Hz)
    pad1Oscillator = audioContext.createOscillator();
    pad1Oscillator.type = 'sine';
    pad1Oscillator.frequency.setValueAtTime(65.41, audioContext.currentTime);

    pad1Gain = audioContext.createGain();
    pad1Gain.gain.setValueAtTime(0, audioContext.currentTime);
    pad1Gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 3);

    pad1Oscillator.connect(pad1Gain);
    pad1Gain.connect(filterNode);
    pad1Oscillator.start();

    // Create pad 2 (mid harmony) - G2 (98 Hz)
    setTimeout(() => {
        if (!musicEnabled) return;

        pad2Oscillator = audioContext.createOscillator();
        pad2Oscillator.type = 'triangle';
        pad2Oscillator.frequency.setValueAtTime(98, audioContext.currentTime);

        pad2Gain = audioContext.createGain();
        pad2Gain.gain.setValueAtTime(0, audioContext.currentTime);
        pad2Gain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 4);

        pad2Oscillator.connect(pad2Gain);
        pad2Gain.connect(filterNode);
        pad2Oscillator.start();
    }, 2000);

    // Create pad 3 (high shimmer) - E3 (164.81 Hz)
    setTimeout(() => {
        if (!musicEnabled) return;

        pad3Oscillator = audioContext.createOscillator();
        pad3Oscillator.type = 'sine';
        pad3Oscillator.frequency.setValueAtTime(164.81, audioContext.currentTime);

        pad3Gain = audioContext.createGain();
        pad3Gain.gain.setValueAtTime(0, audioContext.currentTime);
        pad3Gain.gain.linearRampToValueAtTime(0.03, audioContext.currentTime + 5);

        pad3Oscillator.connect(pad3Gain);
        pad3Gain.connect(filterNode);
        pad3Oscillator.start();
    }, 5000);

    // Create bass pulse (rhythmic element) - C1 (32.7 Hz)
    setTimeout(() => {
        if (!musicEnabled) return;

        bassOscillator = audioContext.createOscillator();
        bassOscillator.type = 'sine';
        bassOscillator.frequency.setValueAtTime(32.7, audioContext.currentTime);

        bassGain = audioContext.createGain();
        bassGain.gain.setValueAtTime(0, audioContext.currentTime);

        bassOscillator.connect(bassGain);
        bassGain.connect(filterNode);
        bassOscillator.start();

        // Start bass pulse rhythm
        startBassPulse();
    }, 8000);

    // Start filter automation for movement
    startFilterAutomation();
}

/**
 * Create rhythmic bass pulse
 */
function startBassPulse() {
    if (!musicEnabled || !bassGain) return;

    const now = audioContext.currentTime;

    // Pulse every 4 seconds
    bassGain.gain.cancelScheduledValues(now);
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    bassGain.gain.linearRampToValueAtTime(0, now + 1.5);

    setTimeout(() => startBassPulse(), 4000);
}

/**
 * Animate filter for movement
 */
function startFilterAutomation() {
    if (!musicEnabled || !filterNode) return;

    const now = audioContext.currentTime;
    const duration = 20; // 20 second cycle

    // Slowly sweep filter frequency
    filterNode.frequency.cancelScheduledValues(now);
    filterNode.frequency.setValueAtTime(600, now);
    filterNode.frequency.linearRampToValueAtTime(1200, now + duration / 2);
    filterNode.frequency.linearRampToValueAtTime(600, now + duration);

    setTimeout(() => startFilterAutomation(), duration * 1000);
}

/**
 * Stop ambient music
 */
export function stopAmbientMusic() {
    if (!musicEnabled) return;

    musicEnabled = false;

    const now = audioContext.currentTime;

    // Fade out all oscillators
    if (pad1Gain) {
        pad1Gain.gain.cancelScheduledValues(now);
        pad1Gain.gain.setValueAtTime(pad1Gain.gain.value, now);
        pad1Gain.gain.linearRampToValueAtTime(0, now + 2);
    }

    if (pad2Gain) {
        pad2Gain.gain.cancelScheduledValues(now);
        pad2Gain.gain.setValueAtTime(pad2Gain.gain.value, now);
        pad2Gain.gain.linearRampToValueAtTime(0, now + 2);
    }

    if (pad3Gain) {
        pad3Gain.gain.cancelScheduledValues(now);
        pad3Gain.gain.setValueAtTime(pad3Gain.gain.value, now);
        pad3Gain.gain.linearRampToValueAtTime(0, now + 2);
    }

    if (bassGain) {
        bassGain.gain.cancelScheduledValues(now);
        bassGain.gain.setValueAtTime(bassGain.gain.value, now);
        bassGain.gain.linearRampToValueAtTime(0, now + 2);
    }

    // Stop oscillators after fade
    setTimeout(() => {
        if (pad1Oscillator) {
            pad1Oscillator.stop();
            pad1Oscillator = null;
        }
        if (pad2Oscillator) {
            pad2Oscillator.stop();
            pad2Oscillator = null;
        }
        if (pad3Oscillator) {
            pad3Oscillator.stop();
            pad3Oscillator = null;
        }
        if (bassOscillator) {
            bassOscillator.stop();
            bassOscillator = null;
        }
    }, 2100);
}

/**
 * Toggle ambient music on/off
 */
export function toggleAmbientMusic() {
    if (musicEnabled) {
        stopAmbientMusic();
    } else {
        startAmbientMusic();
    }

    return musicEnabled;
}

/**
 * Set music volume
 * @param {number} volume - Volume from 0 to 1
 */
export function setMusicVolume(volume) {
    if (!masterGain) return;

    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.5);
}

/**
 * Check if music is playing
 * @returns {boolean} True if music is playing
 */
export function isMusicPlaying() {
    return musicEnabled;
}

/**
 * Create special music variation for high combo
 */
export function triggerComboMusicEffect(comboLevel) {
    if (!musicEnabled || !filterNode) return;

    const now = audioContext.currentTime;

    // Temporarily increase filter frequency for excitement
    const baseFreq = filterNode.frequency.value;
    const targetFreq = baseFreq + (comboLevel * 200); // Add 200Hz per combo level

    filterNode.frequency.cancelScheduledValues(now);
    filterNode.frequency.setValueAtTime(baseFreq, now);
    filterNode.frequency.linearRampToValueAtTime(targetFreq, now + 0.2);
    filterNode.frequency.linearRampToValueAtTime(baseFreq, now + 1);
}

/**
 * Create milestone celebration music
 */
export function playMilestoneCelebration() {
    if (!audioContext) return;

    const now = audioContext.currentTime;

    // Create a rising arpeggio
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

    notes.forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start(now);
            osc.stop(now + 0.5);
        }, i * 150);
    });

    // Final chord
    setTimeout(() => {
        const chord = [523.25, 659.25, 783.99]; // C5, E5, G5

        chord.forEach(freq => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
            gain.gain.linearRampToValueAtTime(0, now + 2);

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start(now);
            osc.stop(now + 2);
        });
    }, 600);
}
