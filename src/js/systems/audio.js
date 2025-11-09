/**
 * Audio System
 * Handles all game sounds and background music
 * Uses real audio files (WAV/MP3) with Web Audio API fallback
 * @module systems/audio
 */

/**
 * Audio file paths
 */
const AUDIO_PATHS = {
    // Sound effects (WAV files)
    click: './src/assets/mixkit-sci-fi-click-900.wav',
    capture: './src/assets/mixkit-sci-fi-interface-robot-click-901.wav',
    build: './src/assets/mixkit-sci-fi-confirmation-914.wav',
    notification: './src/assets/mixkit-sci-fi-positive-notification-266.wav',
    success: './src/assets/mixkit-sci-fi-positive-notification-266.wav',
    error: './src/assets/mixkit-sci-fi-error-alert-898.wav',
    reject: './src/assets/mixkit-sci-fi-reject-notification-896.wav',

    // Background music (MP3)
    music: './src/assets/space-ambient-351305.mp3'
};

let soundEnabled = true;
let musicEnabled = true;
let musicVolume = 0.3;
let sfxVolume = 0.5;
let audioContext = null;
const audioCache = new Map();
let currentMusic = null;

export function initAudio() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
        preloadSound('click');
        preloadSound('capture');
        preloadSound('build');
        preloadSound('notification');
        preloadSound('success');
        preloadSound('error');
        preloadSound('reject');
        preloadMusic();
    } catch (error) {
        console.warn('Audio init failed:', error);
    }
}

function preloadSound(key) {
    if (!AUDIO_PATHS[key]) return;
    try {
        const audio = new Audio();
        audio.src = AUDIO_PATHS[key];
        audio.preload = 'auto';
        audio.volume = sfxVolume;
        audioCache.set(key, audio);
    } catch (error) {
        console.warn(`Preload failed: ${key}`);
    }
}

function preloadMusic() {
    try {
        const audio = new Audio();
        audio.src = AUDIO_PATHS.music;
        audio.preload = 'auto';
        audio.loop = true;
        audio.volume = musicVolume;
        audioCache.set('music', audio);
    } catch (error) {
        console.warn('Music preload failed');
    }
}

export function resumeAudio() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
        if (musicEnabled && !currentMusic) {
            playBackgroundMusic();
        }
    }
}

export function playSound(type) {
    if (!soundEnabled) return;
    try {
        resumeAudio();
        const audio = audioCache.get(type);
        if (audio) {
            const sound = audio.cloneNode();
            sound.volume = sfxVolume;
            sound.play().catch(() => {});
        }
    } catch (error) {}
}

export function playBackgroundMusic() {
    if (!musicEnabled) return;
    try {
        resumeAudio();
        currentMusic = audioCache.get('music');
        if (currentMusic) {
            currentMusic.volume = musicVolume;
            currentMusic.play().catch(() => {});
        }
    } catch (error) {}
}

export function stopBackgroundMusic() {
    if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }
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
