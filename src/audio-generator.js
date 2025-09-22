/**
 * EcoSat Monitor - Audio Generator
 * Generates audio files using Web Audio API for gamification
 * Author: Elizabeth Díaz Familia
 * Version: 1.0.0
 */

class AudioGenerator {
    constructor() {
        this.audioContext = null;
        this.sampleRate = 44100;
        this.bitDepth = 16;
    }

    /**
     * Initialize audio context
     */
    init() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('AudioGenerator initialized');
    }

    /**
     * Generate achievement unlock sound
     * Characteristics: Uplifting, magical, celebratory
     */
    generateAchievementSound() {
        const duration = 2.5; // seconds
        const bufferSize = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.sampleRate;
            
            // Main melody: ascending notes
            const note1 = Math.sin(2 * Math.PI * 523.25 * time); // C5
            const note2 = Math.sin(2 * Math.PI * 659.25 * time); // E5
            const note3 = Math.sin(2 * Math.PI * 783.99 * time); // G5
            const note4 = Math.sin(2 * Math.PI * 1046.50 * time); // C6
            
            // Envelope for each note
            const env1 = time < 0.3 ? Math.exp(-time * 5) : 0;
            const env2 = time > 0.2 && time < 0.7 ? Math.exp(-(time - 0.2) * 5) : 0;
            const env3 = time > 0.5 && time < 1.2 ? Math.exp(-(time - 0.5) * 5) : 0;
            const env4 = time > 0.8 && time < 2.5 ? Math.exp(-(time - 0.8) * 3) : 0;
            
            // Bell-like harmonics
            const harmonic1 = 0.5 * Math.sin(2 * Math.PI * 1046.50 * 2 * time);
            const harmonic2 = 0.3 * Math.sin(2 * Math.PI * 1046.50 * 3 * time);
            
            // Sparkle effect (high frequency modulation)
            const sparkle = time > 1.0 ? 0.2 * Math.sin(2 * Math.PI * 2093 * time) * Math.exp(-(time - 1.0) * 10) : 0;
            
            // Mix all components
            data[i] = (note1 * env1 + note2 * env2 + note3 * env3 + note4 * env4 + 
                      harmonic1 * env4 * 0.3 + harmonic2 * env4 * 0.2 + sparkle) * 0.3;
        }

        return buffer;
    }

    /**
     * Generate level up sound
     * Characteristics: Triumphant, ascending, energetic
     */
    generateLevelUpSound() {
        const duration = 3.0;
        const bufferSize = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.sampleRate;
            
            // Fanfare progression: C-E-G-C
            const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            let signal = 0;
            
            frequencies.forEach((freq, index) => {
                const startTime = index * 0.4;
                const endTime = startTime + 0.8;
                
                if (time >= startTime && time <= endTime) {
                    const noteTime = time - startTime;
                    const envelope = Math.exp(-noteTime * 2) * Math.sin(Math.PI * noteTime / 0.8);
                    
                    // Main tone
                    signal += Math.sin(2 * Math.PI * freq * time) * envelope;
                    
                    // Add harmonics for richness
                    signal += 0.3 * Math.sin(2 * Math.PI * freq * 2 * time) * envelope;
                    signal += 0.1 * Math.sin(2 * Math.PI * freq * 3 * time) * envelope;
                }
            });
            
            // Final flourish
            if (time > 2.0) {
                const flourishTime = time - 2.0;
                const sweep = 523.25 + (1046.50 - 523.25) * (flourishTime / 1.0);
                const envelope = Math.exp(-flourishTime * 3);
                signal += 0.5 * Math.sin(2 * Math.PI * sweep * time) * envelope;
            }
            
            data[i] = signal * 0.25;
        }

        return buffer;
    }

    /**
     * Generate notification sound
     * Characteristics: Gentle, attention-getting, non-intrusive
     */
    generateNotificationSound() {
        const duration = 1.5;
        const bufferSize = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.sampleRate;
            
            // Soft two-tone chime
            const freq1 = 880; // A5
            const freq2 = 1174.66; // D6
            
            let signal = 0;
            
            // First tone
            if (time < 0.5) {
                const envelope = Math.exp(-time * 4) * (1 - Math.exp(-time * 10));
                signal += Math.sin(2 * Math.PI * freq1 * time) * envelope;
            }
            
            // Second tone
            if (time > 0.3 && time < 1.5) {
                const noteTime = time - 0.3;
                const envelope = Math.exp(-noteTime * 3) * (1 - Math.exp(-noteTime * 10));
                signal += Math.sin(2 * Math.PI * freq2 * time) * envelope;
            }
            
            // Soft harmonics
            signal += 0.2 * Math.sin(2 * Math.PI * freq1 * 2 * time) * Math.exp(-time * 6);
            signal += 0.1 * Math.sin(2 * Math.PI * freq2 * 2 * time) * Math.exp(-(time - 0.3) * 6);
            
            data[i] = signal * 0.3;
        }

        return buffer;
    }

    /**
     * Generate success sound
     * Characteristics: Pleasant, confirmatory, brief
     */
    generateSuccessSound() {
        const duration = 1.0;
        const bufferSize = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.sampleRate;
            
            // Pleasant major chord progression
            const freq1 = 523.25; // C5
            const freq2 = 659.25; // E5
            const freq3 = 783.99; // G5
            
            const envelope = Math.exp(-time * 3) * (1 - Math.exp(-time * 20));
            
            let signal = 0;
            signal += Math.sin(2 * Math.PI * freq1 * time) * envelope;
            signal += 0.6 * Math.sin(2 * Math.PI * freq2 * time) * envelope;
            signal += 0.4 * Math.sin(2 * Math.PI * freq3 * time) * envelope;
            
            // Add gentle modulation
            const modulation = 1 + 0.1 * Math.sin(2 * Math.PI * 5 * time);
            
            data[i] = signal * modulation * 0.2;
        }

        return buffer;
    }

    /**
     * Generate error sound
     * Characteristics: Attention-getting but not harsh, brief
     */
    generateErrorSound() {
        const duration = 1.2;
        const bufferSize = this.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const time = i / this.sampleRate;
            
            // Descending tone to indicate error
            const startFreq = 440; // A4
            const endFreq = 220;   // A3
            const freq = startFreq - (startFreq - endFreq) * (time / duration);
            
            const envelope = Math.exp(-time * 2) * (1 - Math.exp(-time * 30));
            
            let signal = 0;
            signal += Math.sin(2 * Math.PI * freq * time) * envelope;
            
            // Add slight roughness for error indication
            signal += 0.1 * Math.sin(2 * Math.PI * freq * 1.5 * time) * envelope;
            
            // Gentle warble effect
            const warble = 1 + 0.05 * Math.sin(2 * Math.PI * 8 * time);
            
            data[i] = signal * warble * 0.25;
        }

        return buffer;
    }

    /**
     * Play generated audio buffer
     */
    playBuffer(buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
    }

    /**
     * Convert buffer to WAV blob for download
     */
    bufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        const data = buffer.getChannelData(0);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, this.sampleRate, true);
        view.setUint32(28, this.sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);

        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    /**
     * Generate all audio files and trigger downloads
     */
    generateAllSounds() {
        if (!this.audioContext) {
            this.init();
        }

        const sounds = {
            'achievement-unlock': this.generateAchievementSound(),
            'level-up': this.generateLevelUpSound(),
            'notification': this.generateNotificationSound(),
            'success': this.generateSuccessSound(),
            'error': this.generateErrorSound()
        };

        Object.entries(sounds).forEach(([name, buffer]) => {
            const blob = this.bufferToWav(buffer);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name}.wav`;
            a.click();
            URL.revokeObjectURL(url);
        });
    }

    /**
     * Preview a specific sound
     */
    previewSound(soundType) {
        if (!this.audioContext) {
            this.init();
        }

        let buffer;
        switch (soundType) {
            case 'achievement':
                buffer = this.generateAchievementSound();
                break;
            case 'levelup':
                buffer = this.generateLevelUpSound();
                break;
            case 'notification':
                buffer = this.generateNotificationSound();
                break;
            case 'success':
                buffer = this.generateSuccessSound();
                break;
            case 'error':
                buffer = this.generateErrorSound();
                break;
            default:
                console.error('Unknown sound type:', soundType);
                return;
        }

        this.playBuffer(buffer);
    }
}

// Usage example and testing interface
class AudioTester {
    constructor() {
        this.generator = new AudioGenerator();
        this.setupUI();
    }

    setupUI() {
        // Create a simple test interface
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;

        container.innerHTML = `
            <h3>EcoSat Audio Generator</h3>
            <button onclick="audioTester.generator.previewSound('achievement')">🏆 Achievement</button><br><br>
            <button onclick="audioTester.generator.previewSound('levelup')">⬆️ Level Up</button><br><br>
            <button onclick="audioTester.generator.previewSound('notification')">🔔 Notification</button><br><br>
            <button onclick="audioTester.generator.previewSound('success')">✅ Success</button><br><br>
            <button onclick="audioTester.generator.previewSound('error')">❌ Error</button><br><br>
            <button onclick="audioTester.generator.generateAllSounds()" style="background: #3b82f6; color: white; padding: 10px;">📁 Download All</button>
        `;

        document.body.appendChild(container);
        
        // Make it draggable
        let isDragging = false;
        let startX, startY, initialX, initialY;

        container.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                const rect = container.getBoundingClientRect();
                initialX = rect.left;
                initialY = rect.top;
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                container.style.left = (initialX + deltaX) + 'px';
                container.style.top = (initialY + deltaY) + 'px';
                container.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}

// Auto-initialize when page loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        window.audioTester = new AudioTester();
        window.AudioGenerator = AudioGenerator;
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioGenerator;
}