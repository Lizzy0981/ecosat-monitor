/**
 * EcoSat Monitor - Audio Integration for Gamification
 * Integrates generated sounds into the gamification system
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

// Add this to your gamification.js file

class AudioManager {
    constructor() {
        this.audioAssets = {};
        this.isEnabled = localStorage.getItem('ecosat-audio-enabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('ecosat-audio-volume')) || 0.3;
        this.audioContext = null;
        this.isInitialized = false;
        
        // Audio file paths (can be URLs or generated blobs)
        this.audioFiles = {
            achievement: 'assets/sounds/achievement-unlock.mp3',
            levelUp: 'assets/sounds/level-up.mp3',
            notification: 'assets/sounds/notification.mp3',
            success: 'assets/sounds/success.mp3',
            error: 'assets/sounds/error.mp3'
        };
        
        this.fallbackToGenerated = true; // Use Web Audio API if files not found
    }

    /**
     * Initialize audio manager
     */
    async init() {
        if (!this.isEnabled) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadAudioAssets();
            this.isInitialized = true;
            console.log('AudioManager initialized');
        } catch (error) {
            console.warn('AudioManager initialization failed:', error);
        }
    }

    /**
     * Load audio assets
     */
    async loadAudioAssets() {
        for (const [key, path] of Object.entries(this.audioFiles)) {
            try {
                // Try to load from file first
                const audio = new Audio(path);
                audio.preload = 'auto';
                audio.volume = this.volume;
                
                // Test if file loads
                await new Promise((resolve, reject) => {
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('error', reject, { once: true });
                    audio.load();
                });
                
                this.audioAssets[key] = audio;
                console.log(`Loaded audio: ${key}`);
            } catch (error) {
                console.warn(`Failed to load ${key}, generating fallback`);
                
                if (this.fallbackToGenerated) {
                    // Generate audio using Web Audio API
                    this.audioAssets[key] = await this.generateAudioBuffer(key);
                }
            }
        }
    }

    /**
     * Generate audio buffer for fallback
     */
    async generateAudioBuffer(soundType) {
        if (!this.audioContext) return null;
        
        let buffer;
        const generator = new AudioBufferGenerator(this.audioContext);
        
        switch (soundType) {
            case 'achievement':
                buffer = generator.createAchievementSound();
                break;
            case 'levelUp':
                buffer = generator.createLevelUpSound();
                break;
            case 'notification':
                buffer = generator.createNotificationSound();
                break;
            case 'success':
                buffer = generator.createSuccessSound();
                break;
            case 'error':
                buffer = generator.createErrorSound();
                break;
            default:
                return null;
        }
        
        return buffer;
    }

    /**
     * Play sound by type
     */
    async play(soundType, options = {}) {
        if (!this.isEnabled || !this.isInitialized) return;
        
        const asset = this.audioAssets[soundType];
        if (!asset) return;
        
        try {
            if (asset instanceof AudioBuffer) {
                // Web Audio API generated sound
                this.playBuffer(asset, options);
            } else {
                // HTML Audio element
                const audio = asset.cloneNode();
                audio.volume = this.volume * (options.volume || 1);
                await audio.play();
            }
        } catch (error) {
            console.warn(`Failed to play ${soundType}:`, error);
        }
    }

    /**
     * Play audio buffer
     */
    playBuffer(buffer, options = {}) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.value = this.volume * (options.volume || 1);
        source.start();
    }

    /**
     * Set volume (0-1)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        localStorage.setItem('ecosat-audio-volume', this.volume.toString());
        
        // Update HTML audio elements
        Object.values(this.audioAssets).forEach(asset => {
            if (asset instanceof HTMLAudioElement) {
                asset.volume = this.volume;
            }
        });
    }

    /**
     * Enable/disable audio
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        localStorage.setItem('ecosat-audio-enabled', enabled.toString());
        
        if (enabled && !this.isInitialized) {
            this.init();
        }
    }

    /**
     * Get current settings
     */
    getSettings() {
        return {
            enabled: this.isEnabled,
            volume: this.volume,
            initialized: this.isInitialized
        };
    }
}

/**
 * Simple audio buffer generator for fallback sounds
 */
class AudioBufferGenerator {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.sampleRate = audioContext.sampleRate;
    }

    createAchievementSound() {
        const duration = 2.0;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const time = i / this.sampleRate;
            const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 10));
            
            // Magical ascending notes
            let signal = 0;
            signal += Math.sin(2 * Math.PI * 523.25 * time) * envelope; // C5
            signal += 0.6 * Math.sin(2 * Math.PI * 659.25 * time) * envelope; // E5
            signal += 0.4 * Math.sin(2 * Math.PI * 783.99 * time) * envelope; // G5
            
            // Sparkle effect
            if (time > 0.5) {
                const sparkle = Math.sin(2 * Math.PI * 1046.50 * time) * Math.exp(-(time - 0.5) * 8);
                signal += 0.3 * sparkle;
            }
            
            data[i] = signal * 0.2;
        }
        
        return buffer;
    }

    createLevelUpSound() {
        const duration = 2.5;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const time = i / this.sampleRate;
            
            // Fanfare progression
            let signal = 0;
            const frequencies = [261.63, 329.63, 392.00, 523.25];
            
            frequencies.forEach((freq, index) => {
                const noteStart = index * 0.4;
                const noteEnd = noteStart + 0.6;
                
                if (time >= noteStart && time <= noteEnd) {
                    const noteTime = time - noteStart;
                    const envelope = Math.exp(-noteTime * 3) * Math.sin(Math.PI * noteTime / 0.6);
                    signal += Math.sin(2 * Math.PI * freq * time) * envelope;
                }
            });
            
            data[i] = signal * 0.15;
        }
        
        return buffer;
    }

    createNotificationSound() {
        const duration = 1.0;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const time = i / this.sampleRate;
            const envelope = Math.exp(-time * 4) * (1 - Math.exp(-time * 20));
            
            // Gentle two-tone
            let signal = 0;
            signal += Math.sin(2 * Math.PI * 880 * time) * envelope; // A5
            signal += 0.7 * Math.sin(2 * Math.PI * 1174.66 * time) * envelope; // D6
            
            data[i] = signal * 0.2;
        }
        
        return buffer;
    }

    createSuccessSound() {
        const duration = 0.8;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const time = i / this.sampleRate;
            const envelope = Math.exp(-time * 5) * (1 - Math.exp(-time * 30));
            
            // Pleasant chord
            let signal = 0;
            signal += Math.sin(2 * Math.PI * 523.25 * time) * envelope; // C5
            signal += 0.6 * Math.sin(2 * Math.PI * 659.25 * time) * envelope; // E5
            signal += 0.4 * Math.sin(2 * Math.PI * 783.99 * time) * envelope; // G5
            
            data[i] = signal * 0.15;
        }
        
        return buffer;
    }

    createErrorSound() {
        const duration = 1.0;
        const buffer = this.audioContext.createBuffer(1, this.sampleRate * duration, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const time = i / this.sampleRate;
            const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 20));
            
            // Descending tone
            const freq = 440 - (220 * time / duration);
            let signal = Math.sin(2 * Math.PI * freq * time) * envelope;
            
            data[i] = signal * 0.2;
        }
        
        return buffer;
    }
}

// Integration with existing gamification system
// Add this to your GamificationSystem class:

/* 
// Add to GamificationSystem constructor:
this.audioManager = new AudioManager();

// Add to GamificationSystem init method:
await this.audioManager.init();

// Modify showAchievementNotification method:
showAchievementNotification(achievement) {
    // ... existing code ...
    
    // Play achievement sound
    this.audioManager.play('achievement');
    
    // ... rest of existing code ...
}

// Modify showLevelUpNotification method:
showLevelUpNotification(oldLevel, newLevel) {
    // ... existing code ...
    
    // Play level up sound
    this.audioManager.play('levelUp');
    
    // ... rest of existing code ...
}

// Modify showPointsNotification method:
showPointsNotification(points, action) {
    if (points <= 0) return;
    
    // Play success sound for points
    this.audioManager.play('success', { volume: 0.7 });
    
    // ... existing code ...
}

// Add error sound to error handling:
handleError(type, error) {
    // ... existing code ...
    
    // Play error sound
    this.audioManager.play('error', { volume: 0.5 });
    
    // ... rest of existing code ...
}

// Add notification sound to notifications:
showNotification(message, type = 'info') {
    // Play notification sound
    this.audioManager.play('notification', { volume: 0.6 });
    
    // ... existing code ...
}
*/

// Settings integration
// Add this to your settings modal HTML:
/*
<div class="setting-item">
    <label data-i18n="settings.audio_enabled">Sonidos habilitados</label>
    <input type="checkbox" id="audio-enabled-toggle" checked>
</div>

<div class="setting-item">
    <label data-i18n="settings.audio_volume">Volumen de sonidos</label>
    <input type="range" id="audio-volume-slider" min="0" max="1" step="0.1" value="0.3">
    <span id="volume-display">30%</span>
</div>
*/

// Settings JavaScript:
/*
// Add to your settings event listeners:
const audioEnabledToggle = document.getElementById('audio-enabled-toggle');
const audioVolumeSlider = document.getElementById('audio-volume-slider');
const volumeDisplay = document.getElementById('volume-display');

if (audioEnabledToggle) {
    audioEnabledToggle.addEventListener('change', (e) => {
        window.gamificationSystem.audioManager.setEnabled(e.target.checked);
    });
}

if (audioVolumeSlider) {
    audioVolumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        window.gamificationSystem.audioManager.setVolume(volume);
        volumeDisplay.textContent = Math.round(volume * 100) + '%';
    });
}

// Load current settings
const audioSettings = window.gamificationSystem.audioManager.getSettings();
if (audioEnabledToggle) audioEnabledToggle.checked = audioSettings.enabled;
if (audioVolumeSlider) {
    audioVolumeSlider.value = audioSettings.volume;
    volumeDisplay.textContent = Math.round(audioSettings.volume * 100) + '%';
}
*/

// CSS for audio settings:
/*
.audio-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
}

#audio-volume-slider {
    flex: 1;
    max-width: 100px;
}

#volume-display {
    min-width: 35px;
    text-align: right;
    font-size: 0.875rem;
    color: var(--text-secondary);
}
*/

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, AudioBufferGenerator };
}