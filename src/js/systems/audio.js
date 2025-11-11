/**
 * Audio System
 * Handles all game sounds and background music
 * Uses procedural Web Audio API for zero-dependency audio
 * @module systems/audio
 */

let soundEnabled = true;
let musicEnabled = true;
let musicVolume = 0.3;
let sfxVolume = 0.5;
let audioContext = null;

// Sound variation counters for variety
let captureVariation = 0;
let buildVariation = 0;

/**
 * Initialize audio system
 */
export function initAudio() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    } catch (error) {
        console.warn('Audio init failed:', error);
    }
}

/**
 * Resume audio context (required for autoplay policy)
 */
export function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * Play sound effect
 * @param {string} type - Sound type (capture, build, success, error, notification, achievement)
 */
export function playSound(type) {
    if (!soundEnabled || !audioContext) return;

    try {
        resumeAudio();

        switch (type) {
            case 'capture':
                playFragmentCaptureSound();
                break;
            case 'build':
                playBuildSound();
                break;
            case 'success':
                playSuccessSound();
                break;
            case 'achievement':
                playAchievementSound();
                break;
            case 'error':
                playErrorSound();
                break;
            case 'notification':
                playNotificationSound();
                break;
            default:
                playGenericSound();
        }
    } catch (error) {
        console.warn('Sound play error:', error);
    }
}

/**
 * Fragment capture sound with variations
 */
function playFragmentCaptureSound() {
    const now = audioContext.currentTime;

    // Cycle through 5 variations for variety
    const variations = [800, 900, 850, 950, 875];
    const baseFreq = variations[captureVariation % variations.length];
    captureVariation++;

    // Main tone
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);

    gain.gain.setValueAtTime(sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.15);

    // Add shimmer
    const shimmer = audioContext.createOscillator();
    const shimmerGain = audioContext.createGain();

    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(baseFreq * 2, now);

    shimmerGain.gain.setValueAtTime(sfxVolume * 0.15, now + 0.02);
    shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(audioContext.destination);

    shimmer.start(now + 0.02);
    shimmer.stop(now + 0.1);
}

/**
 * Building purchase sound with variations
 */
function playBuildSound() {
    const now = audioContext.currentTime;

    // Cycle through 3 variations
    const variations = [
        [300, 400, 500],  // Rising triad
        [300, 450, 600],  // Different intervals
        [350, 450, 550]   // Another variation
    ];

    const chord = variations[buildVariation % variations.length];
    buildVariation++;

    chord.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now + (i * 0.05));
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.2, now + (i * 0.05) + 0.05);
        gain.gain.linearRampToValueAtTime(0, now + (i * 0.05) + 0.3);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now + (i * 0.05));
        osc.stop(now + (i * 0.05) + 0.3);
    });
}

/**
 * Success/level up sound
 */
function playSuccessSound() {
    const now = audioContext.currentTime;

    // Ascending arpeggio C-E-G-C
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now + (i * 0.08));
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.25, now + (i * 0.08) + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 0.4);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now + (i * 0.08));
        osc.stop(now + (i * 0.08) + 0.4);
    });
}

/**
 * Achievement unlocked sound (epic)
 */
function playAchievementSound() {
    const now = audioContext.currentTime;

    // Epic fanfare: C-E-G-C with longer sustain
    const notes = [261.63, 329.63, 392.00, 523.25];

    notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now + (i * 0.12));
        gain.gain.linearRampToValueAtTime(sfxVolume * 0.2, now + (i * 0.12) + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + (i * 0.12) + 0.8);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now + (i * 0.12));
        osc.stop(now + (i * 0.12) + 0.8);
    });

    // Add final sustain chord
    setTimeout(() => {
        const finalChord = [523.25, 659.25, 783.99];
        finalChord.forEach(freq => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(sfxVolume * 0.15, now + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.start(now);
            osc.stop(now + 1.5);
        });
    }, 0);
}

/**
 * Error sound
 */
function playErrorSound() {
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

    gain.gain.setValueAtTime(sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.2);
}

/**
 * Notification sound
 */
function playNotificationSound() {
    const now = audioContext.currentTime;

    // Two quick blips
    [700, 900].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(sfxVolume * 0.2, now + (i * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.1) + 0.08);

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.start(now + (i * 0.1));
        osc.stop(now + (i * 0.1) + 0.08);
    });
}

/**
 * Generic click sound
 */
function playGenericSound() {
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(sfxVolume * 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + 0.1);
}

/**
 * Placeholder for background music (use ambientMusic.js instead)
 */
export function playBackgroundMusic() {
    // Use the dedicated ambientMusic.js system instead
    console.log('Use ambientMusic.js for background music');
}

export function stopBackgroundMusic() {
    // Use the dedicated ambientMusic.js system instead
}

export function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}

export function toggleMusic() {
    musicEnabled = !musicEnabled;
    if (musicEnabled) {
        playBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }
    return musicEnabled;
}

export function setSFXVolume(volume) {
    sfxVolume = Math.max(0, Math.min(1, volume));
}

export function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
    if (currentMusic) {
        currentMusic.volume = musicVolume;
    }
}
