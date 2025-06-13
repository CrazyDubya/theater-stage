/**
 * SoundDesignerAgent.js - AI-Powered Audio Design and Effects
 * 
 * The Sound Designer Agent uses Ollama LLM to create immersive audio landscapes
 * for theatrical productions. Manages sound effects, ambient audio, voice processing,
 * and coordinates with music and lighting systems for cohesive sensory experiences.
 * 
 * Features:
 * - AI-driven sound design and effect generation
 * - Real-time audio processing and adaptation
 * - Ambient soundscape creation
 * - Voice enhancement and processing
 * - Integration with music and lighting systems
 * - Dynamic audio responses to performance events
 */

class SoundDesignerAgent extends BaseAgent {
    constructor(config = {}) {
        super('sound-designer', {
            name: 'Sound Designer',
            role: 'sound-designer',
            priority: 75, // High priority for immersive experience
            maxActionsPerSecond: 8, // High rate for audio responsiveness
            personality: config.personality || 'atmospheric',
            ...config
        });
        
        // Sound Designer specific properties
        this.ollamaInterface = null;
        this.audioStyle = config.audioStyle || 'naturalistic';
        this.creativityLevel = config.creativity || 0.8;
        
        // Audio capabilities
        this.audioCapabilities = {
            soundEffects: {
                environmental: true,
                mechanical: true,
                organic: true,
                emotional: true,
                abstract: true
            },
            processing: {
                reverb: true,
                delay: true,
                filtering: true,
                distortion: true,
                spatialization: true
            },
            synthesis: {
                ambient: true,
                rhythmic: true,
                melodic: true,
                textural: true,
                generative: true
            },
            playback: {
                multiChannel: 8,
                sampleRate: 48000,
                bitDepth: 24,
                realTime: true
            }
        };
        
        // Current audio state
        this.currentAudioState = {
            ambientLayer: {
                active: false,
                type: null,
                intensity: 0,
                frequency: { low: 20, high: 20000 }
            },
            effectsLayer: {
                active: [],
                queue: [],
                volume: 0.7
            },
            voiceProcessing: {
                enhancement: true,
                effects: [],
                clarity: 0.8
            },
            spatialAudio: {
                enabled: true,
                listenerPosition: { x: 0, y: 0, z: 0 },
                sources: new Map()
            }
        };
        
        // Sound design project
        this.soundProject = {
            production: null,
            soundMap: new Map(), // scene -> sound design
            effectLibrary: new Map(),
            ambientScapes: new Map(),
            cueSheet: new Map(),
            designConcept: null,
            status: 'idle'
        };
        
        // Audio effect categories and parameters
        this.effectCategories = {
            environmental: {
                rain: { type: 'loop', intensity: [0.1, 0.8], spatial: true },
                wind: { type: 'loop', intensity: [0.2, 1.0], spatial: true },
                thunder: { type: 'oneshot', intensity: [0.6, 1.0], spatial: false },
                birds: { type: 'loop', intensity: [0.1, 0.5], spatial: true },
                water: { type: 'loop', intensity: [0.2, 0.9], spatial: true }
            },
            mechanical: {
                door_creak: { type: 'oneshot', intensity: [0.3, 0.7], spatial: true },
                footsteps: { type: 'sequence', intensity: [0.2, 0.6], spatial: true },
                machinery: { type: 'loop', intensity: [0.4, 0.8], spatial: true },
                clock_tick: { type: 'loop', intensity: [0.1, 0.4], spatial: false },
                phone_ring: { type: 'loop', intensity: [0.5, 0.8], spatial: true }
            },
            emotional: {
                heartbeat: { type: 'loop', intensity: [0.3, 0.8], spatial: false },
                breathing: { type: 'loop', intensity: [0.2, 0.6], spatial: false },
                whispers: { type: 'texture', intensity: [0.1, 0.4], spatial: true },
                tension: { type: 'texture', intensity: [0.3, 0.9], spatial: false },
                release: { type: 'oneshot', intensity: [0.2, 0.6], spatial: false }
            }
        };
        
        // Ambient soundscape templates
        this.ambientTemplates = {
            forest: {
                layers: ['birds', 'wind', 'rustling'],
                frequency: { emphasis: 'mid', roll_off: 'gentle' },
                dynamics: { variation: 0.3, cycles: 'natural' }
            },
            urban: {
                layers: ['traffic', 'voices', 'machinery'],
                frequency: { emphasis: 'full', roll_off: 'sharp' },
                dynamics: { variation: 0.5, cycles: 'irregular' }
            },
            interior: {
                layers: ['air', 'subtle_reverb', 'occasional_sounds'],
                frequency: { emphasis: 'mid_high', roll_off: 'soft' },
                dynamics: { variation: 0.2, cycles: 'minimal' }
            },
            underwater: {
                layers: ['bubbles', 'pressure', 'muffled_sounds'],
                frequency: { emphasis: 'low_mid', roll_off: 'heavy' },
                dynamics: { variation: 0.4, cycles: 'flowing' }
            }
        };
        
        // Performance tracking
        this.performanceTracking = {
            currentSoundscape: null,
            activeEffects: [],
            audioEvents: [],
            responseLatency: [],
            adaptationHistory: []
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.musicDirector = null;
        this.lightingDesigner = null;
        this.currentProduction = null;
        
        console.log('🔊 Sound Designer Agent: Ready to create immersive audio experiences');
    }

    /**
     * Initialize Sound Designer with system integration
     */
    async onInitialize() {
        try {
            console.log('🔊 Sound Designer: Initializing audio design systems...');
            
            // Connect to Ollama interface for AI sound design
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI sound design requires LLM assistance.');
            }
            
            this.ollamaInterface = window.ollamaTheaterInterface;
            
            if (!this.ollamaInterface.isInitialized) {
                const initSuccess = await window.ollamaTheaterInterface.initialize();
                if (!initSuccess) {
                    throw new Error('Failed to initialize Ollama interface');
                }
                this.ollamaInterface = window.ollamaTheaterInterface;
            }
            
            if (!this.ollamaInterface.isConnected) {
                throw new Error('Cannot connect to Ollama. Please ensure Ollama is running: `ollama serve`');
            }
            
            // Configure AI for sound design
            this.ollamaInterface.updatePerformanceContext({
                role: 'sound_designer',
                design_style: this.audioStyle,
                creativity_mode: 'audio_design',
                specialization: 'theatrical_sound'
            });
            
            // Connect to production agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🔊 Sound Designer: Connected to Creative Director');
            }
            
            if (window.musicDirectorAgent) {
                this.musicDirector = window.musicDirectorAgent;
                console.log('🔊 Sound Designer: Connected to Music Director');
            }
            
            if (window.lightingDesignerAgent) {
                this.lightingDesigner = window.lightingDesignerAgent;
                console.log('🔊 Sound Designer: Connected to Lighting Designer');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize audio systems
            await this.initializeAudioSystems();
            
            // Test design capabilities
            await this.testSoundDesignCapabilities();
            
            console.log('🔊 Sound Designer: Ready to craft immersive soundscapes!')
            
        } catch (error) {
            console.error('🔊 Sound Designer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI SOUND DESIGN:
1. Install Ollama: https://ollama.ai
2. Start Ollama: ollama serve
3. Install a model: ollama pull llama3.1
4. Refresh this page

Current error: ${error.message}
                `);
            }
            
            throw error;
        }
    }

    /**
     * Subscribe to production events for sound coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('script:scene-complete', (data) => this.onSceneComplete(data));
            window.theaterEventBus.subscribe('performance:emotion-change', (data) => this.onEmotionChange(data));
            window.theaterEventBus.subscribe('stage:environment-change', (data) => this.onEnvironmentChange(data));
            window.theaterEventBus.subscribe('music:tempo-change', (data) => this.onTempoChange(data));
            window.theaterEventBus.subscribe('audio:effect-trigger', (data) => this.onEffectTrigger(data));
            window.theaterEventBus.subscribe('voice:enhancement-needed', (data) => this.onVoiceEnhancement(data));
            
            console.log('🔊 Sound Designer: Subscribed to audio coordination events');
        }
    }

    /**
     * Initialize audio systems
     */
    async initializeAudioSystems() {
        console.log('🔊 Sound Designer: Initializing audio control systems...');
        
        // Initialize Web Audio Context simulation
        this.audioContext = {
            sampleRate: this.audioCapabilities.playback.sampleRate,
            currentTime: 0,
            destination: {
                numberOfInputs: this.audioCapabilities.playback.multiChannel,
                numberOfOutputs: this.audioCapabilities.playback.multiChannel
            },
            createGain: () => ({ 
                gain: { value: 1.0 },
                connect: () => {},
                disconnect: () => {}
            }),
            createBiquadFilter: () => ({
                type: 'lowpass',
                frequency: { value: 1000 },
                Q: { value: 1 },
                connect: () => {},
                disconnect: () => {}
            }),
            createConvolver: () => ({
                buffer: null,
                connect: () => {},
                disconnect: () => {}
            })
        };
        
        // Initialize spatial audio system
        this.spatialAudio = {
            listenerPosition: { x: 0, y: 0, z: 0 },
            sources: new Map(),
            updateSource: (id, position, audio) => {
                this.spatialAudio.sources.set(id, {
                    position: position,
                    audio: audio,
                    lastUpdate: Date.now()
                });
            }
        };
        
        console.log('✅ Sound Designer: Audio control systems initialized');
    }

    /**
     * Test sound design capabilities
     */
    async testSoundDesignCapabilities() {
        try {
            const testPrompt = `
            As a theatrical sound designer, create a sound design concept for a scene.
            
            Scene context:
            - A mysterious nighttime scene in an old mansion
            - Characters are exploring and discovering secrets
            - Emotional tone: suspenseful and eerie
            
            Provide:
            1. Ambient soundscape design
            2. Specific sound effects and timing
            3. Audio processing techniques
            4. Spatial audio considerations
            5. Integration with dialogue and music
            6. Dynamic response to character actions
            
            Format as professional sound design notes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 600
            });
            
            console.log('🔊 Sound Designer: Design capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🔊 Sound Designer: Design capability test failed:', error);
            throw new Error(`Sound design test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🔊 Sound Designer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize sound project
        await this.initializeSoundProject(data.production);
        
        // Develop overall sound concept
        await this.developSoundConcept(data.production);
    }

    /**
     * Initialize sound project
     */
    async initializeSoundProject(production) {
        console.log('🔊 Sound Designer: Initializing sound project...');
        
        this.soundProject = {
            production: production,
            soundMap: new Map(),
            effectLibrary: new Map(),
            ambientScapes: new Map(),
            cueSheet: new Map(),
            designConcept: null,
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Initialize effect library with basic effects
        await this.initializeEffectLibrary();
        
        console.log('✅ Sound Designer: Sound project initialized');
    }

    /**
     * Develop overall sound concept
     */
    async developSoundConcept(production) {
        try {
            console.log('🔊 Sound Designer: Developing sound design concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive sound design concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall audio aesthetic and atmosphere
                2. Sound palette and texture choices
                3. Environmental and ambient sound approach
                4. Sound effects philosophy and style
                5. Voice and dialogue enhancement strategy
                6. Integration with music and lighting
                7. Spatial audio and immersion techniques
                8. Dynamic response to dramatic changes
                
                Provide a detailed sound design concept that will guide the entire audio experience.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1000,
                    timeout: 30000
                });
                
                if (response && response.content) {
                    this.soundProject.designConcept = response.content;
                    this.soundProject.status = 'concept_complete';
                    
                    console.log('✅ Sound Designer: Sound concept developed');
                    
                    // Extract sound categories from concept
                    await this.extractSoundCategories(response.content);
                    
                    // Share concept with Creative Director
                    window.theaterEventBus?.publish('sound:concept-complete', {
                        production: production,
                        concept: response.content,
                        soundDesigner: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Sound Designer: Concept development failed:', error.message);
            this.soundProject.status = 'concept_error';
        }
    }

    /**
     * Handle artistic vision from Creative Director
     */
    async onArtisticVisionReceived(data) {
        console.log('🔊 Sound Designer: Received artistic vision from Creative Director');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.adaptSoundToVision(data.vision);
        }
    }

    /**
     * Adapt sound concept to artistic vision
     */
    async adaptSoundToVision(artisticVision) {
        try {
            console.log('🔊 Sound Designer: Adapting sound to artistic vision...');
            
            const adaptationPrompt = `
            Adapt the sound design to align with this artistic vision:
            
            Artistic Vision:
            ${artisticVision}
            
            Current Sound Concept:
            ${this.soundProject.designConcept || 'To be developed'}
            
            Provide specific sound adaptations:
            1. How should the audio palette be adjusted?
            2. What sound textures support this vision?
            3. How can audio enhance the thematic elements?
            4. What ambient environments align with the vision?
            5. How should sound respond to emotional changes?
            
            Suggest concrete audio changes to implement the artistic vision.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                temperature: 0.8,
                max_tokens: 700
            });
            
            if (response && response.content) {
                this.soundProject.visionAdaptation = response.content;
                
                console.log('✅ Sound Designer: Sound adapted to artistic vision');
                
                // Update sound elements based on adaptation
                await this.updateSoundElements(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Sound Designer: Vision adaptation failed:', error.message);
        }
    }

    /**
     * Handle scene completion for sound design
     */
    async onSceneComplete(data) {
        console.log(`🔊 Sound Designer: Scene ${data.act}.${data.sceneNumber} completed, designing sound...`);
        
        if (data.production.id === this.currentProduction?.id) {
            await this.designSceneSound(data.scene);
        }
    }

    /**
     * Design sound for a specific scene
     */
    async designSceneSound(scene) {
        try {
            console.log(`🔊 Sound Designer: Designing sound for scene ${scene.act}.${scene.scene}...`);
            
            const designPrompt = `
            Design sound for this theatrical scene:
            
            Scene: Act ${scene.act}, Scene ${scene.scene}
            Content: ${scene.content.substring(0, 600)}...
            
            Sound Design Requirements:
            1. Analyze the scene's environment and location
            2. Identify needed ambient soundscape
            3. Specify sound effects and their timing
            4. Design audio transitions and dynamics
            5. Consider voice enhancement needs
            6. Plan spatial audio positioning
            7. Ensure clarity while maintaining atmosphere
            
            Provide detailed sound cues and audio design notes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(designPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800,
                timeout: 45000
            });
            
            if (response && response.content) {
                const sceneSound = {
                    scene: `${scene.act}.${scene.scene}`,
                    design: response.content,
                    cues: await this.extractSoundCues(response.content),
                    ambientscape: await this.extractAmbientscape(response.content),
                    designedAt: new Date(),
                    status: 'designed'
                };
                
                this.soundProject.soundMap.set(sceneSound.scene, sceneSound);
                
                // Add cues to cue sheet
                for (const cue of sceneSound.cues) {
                    this.soundProject.cueSheet.set(cue.number, cue);
                }
                
                console.log(`✅ Sound Designer: Sound designed for scene ${scene.act}.${scene.scene}`);
                
                // Notify other departments
                window.theaterEventBus?.publish('sound:scene-designed', {
                    scene: scene,
                    sound: sceneSound,
                    cueCount: sceneSound.cues.length,
                    soundDesigner: this.config.name
                });
                
                return sceneSound;
            }
            
        } catch (error) {
            console.error(`🔊 Sound Designer: Scene sound design failed for ${scene.act}.${scene.scene}:`, error);
            return null;
        }
    }

    /**
     * Handle real-time emotion changes
     */
    async onEmotionChange(data) {
        console.log('🔊 Sound Designer: Emotion change detected -', data.emotion);
        
        await this.adaptSoundToEmotion(data.emotion, data.intensity || 0.5);
    }

    /**
     * Adapt sound to match emotional state
     */
    async adaptSoundToEmotion(emotion, intensity) {
        try {
            console.log(`🔊 Sound Designer: Adapting sound to ${emotion} (intensity: ${intensity})...`);
            
            // Adjust ambient layers based on emotion
            await this.adjustAmbientForEmotion(emotion, intensity);
            
            // Generate AI-driven sound enhancement
            const enhancementPrompt = `
            Enhance the soundscape for emotional state: ${emotion}
            Current intensity: ${intensity}
            
            Current audio state:
            - Ambient layer: ${this.currentAudioState.ambientLayer.type || 'none'}
            - Active effects: ${this.currentAudioState.effectsLayer.active.length}
            - Voice processing: ${this.currentAudioState.voiceProcessing.enhancement ? 'enabled' : 'disabled'}
            
            Suggest audio enhancements:
            1. Ambient adjustments (frequency, texture, dynamics)
            2. Additional sound effects or textures
            3. Voice processing modifications
            4. Spatial audio adjustments
            5. Dynamic response techniques
            
            Keep suggestions practical for real-time execution.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(enhancementPrompt, {
                temperature: 0.7,
                max_tokens: 400,
                timeout: 10000
            });
            
            if (response && response.content) {
                this.performanceTracking.adaptationHistory.push({
                    emotion: emotion,
                    intensity: intensity,
                    enhancement: response.content,
                    timestamp: new Date()
                });
                
                console.log('✅ Sound Designer: Emotional sound enhancement applied');
                
                // Apply suggested enhancements
                await this.applySoundEnhancements(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Sound Designer: Emotional adaptation failed:', error.message);
        }
    }

    /**
     * Handle environment changes
     */
    async onEnvironmentChange(data) {
        console.log('🔊 Sound Designer: Environment change detected -', data.environment);
        
        await this.transitionToEnvironment(data.environment, data.transitionTime || 3000);
    }

    /**
     * Transition to new environment soundscape
     */
    async transitionToEnvironment(environment, transitionTime) {
        console.log(`🔊 Sound Designer: Transitioning to ${environment} environment...`);
        
        const ambientTemplate = this.ambientTemplates[environment];
        
        if (ambientTemplate) {
            // Create new ambient soundscape
            const newSoundscape = await this.createAmbientSoundscape(environment, ambientTemplate);
            
            // Smooth transition from current to new
            await this.crossfadeAmbientLayers(newSoundscape, transitionTime);
            
            this.currentAudioState.ambientLayer = {
                active: true,
                type: environment,
                intensity: 0.6,
                frequency: ambientTemplate.frequency
            };
            
            this.performanceTracking.currentSoundscape = newSoundscape;
        }
    }

    /**
     * Handle tempo changes from music
     */
    async onTempoChange(data) {
        console.log('🔊 Sound Designer: Tempo change detected -', data.tempo);
        
        // Adjust rhythmic elements to sync with music
        await this.syncAudioToTempo(data.tempo);
    }

    /**
     * Handle effect triggers
     */
    async onEffectTrigger(data) {
        console.log('🔊 Sound Designer: Effect trigger -', data.effectType);
        
        await this.triggerSoundEffect(data.effectType, data.parameters, data.position);
    }

    /**
     * Trigger specific sound effect
     */
    async triggerSoundEffect(effectType, parameters, position) {
        const startTime = Date.now();
        
        const effect = {
            type: effectType,
            parameters: parameters || {},
            position: position,
            startTime: startTime,
            duration: parameters?.duration || 2000,
            volume: parameters?.volume || 0.7,
            spatial: parameters?.spatial !== false
        };
        
        this.currentAudioState.effectsLayer.active.push(effect);
        
        // Apply spatial positioning if enabled
        if (effect.spatial && position) {
            this.spatialAudio.updateSource(`effect_${startTime}`, position, effect);
        }
        
        // Log response latency
        this.performanceTracking.responseLatency.push(Date.now() - startTime);
        this.performanceTracking.audioEvents.push(effect);
        
        console.log(`🔊 Sound Designer: Triggered ${effectType} effect`);
        
        // Schedule effect cleanup
        setTimeout(() => {
            this.cleanupEffect(effect);
        }, effect.duration);
    }

    /**
     * Handle voice enhancement requests
     */
    async onVoiceEnhancement(data) {
        console.log('🔊 Sound Designer: Voice enhancement requested for', data.character);
        
        await this.enhanceVoice(data.character, data.requirements);
    }

    /**
     * Enhance voice processing
     */
    async enhanceVoice(character, requirements) {
        const enhancement = {
            character: character,
            processing: {
                eq: requirements.clarity ? 'voice_clarity' : 'natural',
                compression: requirements.projection ? 'moderate' : 'light',
                reverb: requirements.space ? 'hall' : 'room',
                delay: requirements.echo ? 'short' : 'none'
            },
            applied: new Date()
        };
        
        this.currentAudioState.voiceProcessing.effects.push(enhancement);
        
        console.log(`🔊 Sound Designer: Voice enhanced for ${character}`);
    }

    /**
     * Initialize effect library
     */
    async initializeEffectLibrary() {
        // Populate effect library with basic effects
        for (const [category, effects] of Object.entries(this.effectCategories)) {
            for (const [effectName, params] of Object.entries(effects)) {
                this.soundProject.effectLibrary.set(`${category}_${effectName}`, {
                    name: effectName,
                    category: category,
                    parameters: params,
                    available: true
                });
            }
        }
        
        console.log('🔊 Sound Designer: Effect library initialized with', this.soundProject.effectLibrary.size, 'effects');
    }

    /**
     * Extract sound cues from design text
     */
    async extractSoundCues(designText) {
        const cues = [];
        let cueNumber = 1;
        
        // Simple extraction - in practice would use more sophisticated parsing
        const lines = designText.split('\n');
        
        for (const line of lines) {
            if (line.toLowerCase().includes('cue') || line.toLowerCase().includes('effect')) {
                cues.push({
                    number: cueNumber++,
                    description: line,
                    type: this.parseEffectType(line),
                    timing: this.parseEffectTiming(line),
                    parameters: this.parseEffectParameters(line)
                });
            }
        }
        
        return cues;
    }

    /**
     * Extract ambientscape from design text
     */
    async extractAmbientscape(designText) {
        // Use AI to extract ambient elements
        try {
            const ambientPrompt = `
            Extract the ambient soundscape elements from this sound design:
            
            ${designText}
            
            Identify:
            1. Primary ambient layers
            2. Secondary texture elements
            3. Dynamic variations
            4. Frequency characteristics
            5. Spatial positioning
            
            Format as structured ambient data.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(ambientPrompt, {
                temperature: 0.5,
                max_tokens: 300
            });
            
            if (response && response.content) {
                return this.parseAmbientscape(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Sound Designer: Ambientscape extraction failed:', error.message);
        }
        
        return null;
    }

    /**
     * Create ambient soundscape
     */
    async createAmbientSoundscape(environment, template) {
        const soundscape = {
            environment: environment,
            layers: template.layers.map(layer => ({
                type: layer,
                volume: 0.4 + Math.random() * 0.3,
                frequency: template.frequency,
                active: true
            })),
            dynamics: template.dynamics,
            createdAt: new Date()
        };
        
        return soundscape;
    }

    /**
     * Crossfade between ambient layers
     */
    async crossfadeAmbientLayers(newSoundscape, duration) {
        // Simulate crossfade
        const steps = Math.floor(duration / 100);
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            
            // Fade out current, fade in new
            if (this.performanceTracking.currentSoundscape) {
                this.performanceTracking.currentSoundscape.volume = 1 - progress;
            }
            
            newSoundscape.volume = progress;
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    /**
     * Cleanup finished effect
     */
    cleanupEffect(effect) {
        const index = this.currentAudioState.effectsLayer.active.indexOf(effect);
        if (index > -1) {
            this.currentAudioState.effectsLayer.active.splice(index, 1);
        }
        
        // Remove from spatial audio if applicable
        if (effect.spatial) {
            this.spatialAudio.sources.delete(`effect_${effect.startTime}`);
        }
    }

    /**
     * Parse effect type from description
     */
    parseEffectType(description) {
        const lowDesc = description.toLowerCase();
        
        // Simple keyword matching
        if (lowDesc.includes('rain') || lowDesc.includes('water')) return 'environmental';
        if (lowDesc.includes('door') || lowDesc.includes('footstep')) return 'mechanical';
        if (lowDesc.includes('tension') || lowDesc.includes('heartbeat')) return 'emotional';
        
        return 'general';
    }

    /**
     * Get sound design status
     */
    getSoundStatus() {
        return {
            currentProject: {
                active: !!this.soundProject.production,
                title: this.soundProject.production?.title,
                status: this.soundProject.status,
                cueCount: this.soundProject.cueSheet.size,
                effectsAvailable: this.soundProject.effectLibrary.size
            },
            currentState: this.currentAudioState,
            capabilities: this.audioCapabilities,
            performance: {
                currentSoundscape: this.performanceTracking.currentSoundscape?.environment,
                activeEffects: this.currentAudioState.effectsLayer.active.length,
                averageLatency: this.calculateAverageLatency(),
                adaptationCount: this.performanceTracking.adaptationHistory.length
            },
            spatial: {
                activeSources: this.spatialAudio.sources.size,
                listenerPosition: this.spatialAudio.listenerPosition
            }
        };
    }

    /**
     * Calculate average response latency
     */
    calculateAverageLatency() {
        if (this.performanceTracking.responseLatency.length === 0) return 0;
        
        const sum = this.performanceTracking.responseLatency.reduce((a, b) => a + b, 0);
        return sum / this.performanceTracking.responseLatency.length;
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🔊 Sound Designer: Concluding sound design session...');
        
        // Stop all active effects
        this.currentAudioState.effectsLayer.active = [];
        this.currentAudioState.ambientLayer.active = false;
        
        // Clear spatial audio sources
        this.spatialAudio.sources.clear();
        
        // Save final state
        if (this.soundProject.status !== 'idle') {
            this.soundProject.status = 'completed';
            this.soundProject.completedAt = new Date();
        }
        
        // Generate sound summary
        if (this.currentProduction) {
            const soundSummary = this.generateSoundSummary();
            console.log('🔊 Sound Designer: Sound summary generated');
        }
        
        console.log('🔊 Sound Designer: Sound design concluded');
    }

    /**
     * Generate sound summary
     */
    generateSoundSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            design: {
                conceptDeveloped: !!this.soundProject.designConcept,
                cuesCreated: this.soundProject.cueSheet.size,
                effectsUsed: this.soundProject.effectLibrary.size,
                ambientScapesCreated: this.soundProject.ambientScapes.size
            },
            performance: {
                emotionalAdaptations: this.performanceTracking.adaptationHistory.length,
                effectsTriggered: this.performanceTracking.audioEvents.length,
                averageLatency: this.calculateAverageLatency(),
                spatialSources: this.spatialAudio.sources.size
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundDesignerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.SoundDesignerAgent = SoundDesignerAgent;
    console.log('🔊 Sound Designer Agent loaded - Ready for immersive audio design');
}