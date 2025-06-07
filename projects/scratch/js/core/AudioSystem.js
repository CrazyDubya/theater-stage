/**
 * AudioSystem.js - 3D Positional Audio System for Theater Stage
 * 
 * Manages all audio functionality in the 3D Theater Stage:
 * - 3D positional sound with Web Audio API
 * - Dynamic sound generation (footsteps, collisions, movement)
 * - Category-based volume control (background, effects, voices, ambient)
 * - Spatial audio listener tracking camera position/orientation
 * - Performance optimization for audio processing
 * - Integration with physics engine for collision/movement sounds
 * - Master volume and per-category volume controls
 */

class StageAudioSystem {
    constructor() {
        this.isInitialized = false;
        this.audioContext = null;
        this.listener = null;
        this.sounds = new Map();
        this.audioBuffers = new Map();
        this.masterVolume = 1.0;
        
        // Audio categories with individual volume controls
        this.categories = {
            background: { volume: 0.5, sounds: new Set() },
            effects: { volume: 0.8, sounds: new Set() },
            voices: { volume: 1.0, sounds: new Set() },
            ambient: { volume: 0.3, sounds: new Set() }
        };
        
        // Performance settings
        this.performanceConfig = {
            maxConcurrentSounds: 32,
            soundCleanupDelay: 3000, // ms
            minVelocityForSound: 0.05,
            spatialQuality: 'HRTF' // or 'equalpower'
        };
        
        // Default sound library
        this.defaultSounds = {};
        
        console.log('AudioSystem: Initialized (not active until user interaction)');
    }

    /**
     * Initialize the audio system (requires user interaction)
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('AudioSystem already initialized');
            return true;
        }

        console.log('AudioSystem: Initializing 3D audio system...');

        try {
            // Create audio context (requires user interaction)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.listener = this.audioContext.listener;
            
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Create default sound library
            this.createDefaultSounds();
            
            this.isInitialized = true;
            console.log('AudioSystem: 3D audio system ready');
            return true;
            
        } catch (error) {
            console.error('AudioSystem: Failed to initialize:', error);
            return false;
        }
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (typeof THREE === 'undefined') {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('AudioSystem dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create library of default procedural sounds
     */
    createDefaultSounds() {
        this.defaultSounds = {
            footstep: this.createFootstepSound(),
            thud: this.createThudSound(),
            whoosh: this.createWhooshSound(),
            ambient: this.createAmbientSound(),
            click: this.createClickSound(),
            slide: this.createSlideSound()
        };
        
        console.log('AudioSystem: Default sound library created');
    }

    /**
     * Create footstep sound generator
     */
    createFootstepSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.1);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.15);
            
            return gain;
        };
    }

    /**
     * Create thud/collision sound generator
     */
    createThudSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.3);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(150, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.3);
            
            return gain;
        };
    }

    /**
     * Create whoosh/movement sound generator
     */
    createWhooshSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
            filter.Q.setValueAtTime(5, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.5);
            
            return gain;
        };
    }

    /**
     * Create ambient sound generator
     */
    createAmbientSound() {
        return () => {
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            // Create multiple oscillators for rich ambient sound
            for (let i = 0; i < 3; i++) {
                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(100 + i * 50 + Math.random() * 20, this.audioContext.currentTime);
                
                const oscGain = this.audioContext.createGain();
                oscGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                
                osc.connect(oscGain);
                oscGain.connect(filter);
                
                osc.start(this.audioContext.currentTime);
                osc.stop(this.audioContext.currentTime + 2);
            }
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
            filter.connect(gain);
            
            gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.5);
            gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 1.5);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
            
            return gain;
        };
    }

    /**
     * Create click sound generator
     */
    createClickSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.05);
            
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
            
            osc.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.05);
            
            return gain;
        };
    }

    /**
     * Create slide sound generator
     */
    createSlideSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, this.audioContext.currentTime);
            osc.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.4);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
            
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.4);
            
            return gain;
        };
    }

    /**
     * Create 3D positional sound at specific location
     */
    createPositionalSound(soundName, position, category = 'effects') {
        if (!this.isInitialized || !this.defaultSounds[soundName]) {
            console.warn(`AudioSystem: Cannot play ${soundName} - system not initialized or sound not found`);
            return null;
        }
        
        // Check concurrent sound limit
        if (this.categories[category].sounds.size >= this.performanceConfig.maxConcurrentSounds) {
            console.warn(`AudioSystem: Too many concurrent ${category} sounds`);
            return null;
        }
        
        const panner = this.audioContext.createPanner();
        panner.panningModel = this.performanceConfig.spatialQuality;
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 50;
        panner.rolloffFactor = 2;
        
        // Set 3D position
        panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
        panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
        panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
        
        // Create sound source
        const soundSource = this.defaultSounds[soundName]();
        
        // Create category volume control
        const categoryGain = this.audioContext.createGain();
        categoryGain.gain.setValueAtTime(this.categories[category].volume * this.masterVolume, this.audioContext.currentTime);
        
        // Connect: source -> panner -> category volume -> destination
        soundSource.connect(panner);
        panner.connect(categoryGain);
        categoryGain.connect(this.audioContext.destination);
        
        // Track the sound
        const soundId = Date.now() + Math.random();
        this.categories[category].sounds.add(soundId);
        
        // Clean up after sound ends
        setTimeout(() => {
            this.categories[category].sounds.delete(soundId);
        }, this.performanceConfig.soundCleanupDelay);
        
        return { soundId, panner, categoryGain };
    }

    /**
     * Update 3D audio listener position and orientation based on camera
     */
    updateListenerPosition(camera) {
        if (!this.isInitialized || !this.listener) return;
        
        // Update listener position to match camera
        this.listener.positionX.setValueAtTime(camera.position.x, this.audioContext.currentTime);
        this.listener.positionY.setValueAtTime(camera.position.y, this.audioContext.currentTime);
        this.listener.positionZ.setValueAtTime(camera.position.z, this.audioContext.currentTime);
        
        // Update listener orientation
        const forward = new THREE.Vector3(0, 0, -1);
        const up = new THREE.Vector3(0, 1, 0);
        
        forward.applyQuaternion(camera.quaternion);
        up.applyQuaternion(camera.quaternion);
        
        this.listener.forwardX.setValueAtTime(forward.x, this.audioContext.currentTime);
        this.listener.forwardY.setValueAtTime(forward.y, this.audioContext.currentTime);
        this.listener.forwardZ.setValueAtTime(forward.z, this.audioContext.currentTime);
        this.listener.upX.setValueAtTime(up.x, this.audioContext.currentTime);
        this.listener.upY.setValueAtTime(up.y, this.audioContext.currentTime);
        this.listener.upZ.setValueAtTime(up.z, this.audioContext.currentTime);
    }

    /**
     * Set volume for specific audio category
     */
    setCategoryVolume(category, volume) {
        if (!this.categories[category]) {
            console.warn(`AudioSystem: Unknown category: ${category}`);
            return;
        }
        
        this.categories[category].volume = Math.max(0, Math.min(1, volume));
        console.log(`AudioSystem: ${category} volume set to ${this.categories[category].volume.toFixed(2)}`);
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        console.log(`AudioSystem: Master volume set to ${this.masterVolume.toFixed(2)}`);
    }

    /**
     * Play collision sound based on objects and velocity
     */
    playCollisionSound(object1, object2, velocity) {
        if (!this.isInitialized) return;
        
        const position = object1.position;
        let soundName = 'thud';
        
        // Choose sound based on object types and velocity
        if (velocity < 0.1) {
            return; // Too quiet
        } else if (velocity < 0.5) {
            soundName = 'footstep';
        } else {
            soundName = 'thud';
        }
        
        this.createPositionalSound(soundName, position, 'effects');
    }

    /**
     * Play movement sound for moving objects
     */
    playMovementSound(object, velocity) {
        if (!this.isInitialized || velocity < this.performanceConfig.minVelocityForSound) return;
        
        const position = object.position;
        
        // Choose sound based on velocity
        if (velocity < 0.2) {
            this.createPositionalSound('slide', position, 'effects');
        } else {
            this.createPositionalSound('whoosh', position, 'effects');
        }
    }

    /**
     * Play UI interaction sound
     */
    playUISound(soundName = 'click') {
        if (!this.isInitialized) return;
        
        // UI sounds are not positional
        const soundSource = this.defaultSounds[soundName]?.();
        if (!soundSource) return;
        
        const categoryGain = this.audioContext.createGain();
        categoryGain.gain.setValueAtTime(this.categories.effects.volume * this.masterVolume, this.audioContext.currentTime);
        
        soundSource.connect(categoryGain);
        categoryGain.connect(this.audioContext.destination);
    }

    /**
     * Play ambient sound at location
     */
    playAmbientSound(position, duration = 2000) {
        if (!this.isInitialized) return;
        
        const sound = this.createPositionalSound('ambient', position, 'ambient');
        
        // Auto-stop after duration
        setTimeout(() => {
            // Sound will clean up automatically
        }, duration);
        
        return sound;
    }

    /**
     * Stop all sounds in a category
     */
    stopCategorySounds(category) {
        if (!this.categories[category]) return;
        
        this.categories[category].sounds.clear();
        console.log(`AudioSystem: Stopped all ${category} sounds`);
    }

    /**
     * Stop all audio
     */
    stopAllSounds() {
        Object.keys(this.categories).forEach(category => {
            this.stopCategorySounds(category);
        });
        console.log('AudioSystem: Stopped all sounds');
    }

    /**
     * Get audio performance statistics
     */
    getPerformanceStats() {
        const activeSounds = Object.keys(this.categories).reduce((total, category) => {
            return total + this.categories[category].sounds.size;
        }, 0);
        
        return {
            isInitialized: this.isInitialized,
            activeSounds: activeSounds,
            maxConcurrentSounds: this.performanceConfig.maxConcurrentSounds,
            masterVolume: this.masterVolume,
            categoryVolumes: Object.fromEntries(
                Object.entries(this.categories).map(([cat, data]) => [cat, data.volume])
            ),
            contextState: this.audioContext?.state || 'not-created'
        };
    }

    /**
     * Update audio configuration
     */
    updateConfig(newConfig) {
        this.performanceConfig = { ...this.performanceConfig, ...newConfig };
        console.log('AudioSystem: Configuration updated', this.performanceConfig);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            audioContext: this.audioContext?.state || 'not-created',
            sounds: Object.keys(this.defaultSounds).length,
            categories: Object.keys(this.categories).length,
            masterVolume: this.masterVolume
        };
    }

    /**
     * Clean up audio resources
     */
    dispose() {
        this.stopAllSounds();
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.listener = null;
        this.sounds.clear();
        this.audioBuffers.clear();
        this.isInitialized = false;
        
        console.log('AudioSystem: Disposed');
    }
}

// Create global instance
const stageAudioSystem = new StageAudioSystem();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.stageAudioSystem = stageAudioSystem;
    window.audioManager = stageAudioSystem; // Legacy compatibility
    console.log('AudioSystem loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stageAudioSystem, StageAudioSystem };
}