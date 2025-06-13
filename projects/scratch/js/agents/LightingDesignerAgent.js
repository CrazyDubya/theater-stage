/**
 * LightingDesignerAgent.js - AI-Powered Lighting Design and Control
 * 
 * The Lighting Designer Agent uses Ollama LLM to create dynamic, emotionally-driven
 * lighting designs for theatrical productions. Manages real-time lighting control,
 * coordinates with other departments, and adapts lighting based on performance dynamics.
 * 
 * Features:
 * - AI-driven lighting design generation
 * - Real-time lighting adaptation based on emotions
 * - Color theory and mood mapping
 * - Cue sheet generation and management
 * - Integration with stage systems and other agents
 * - Dynamic lighting effects for dramatic impact
 */

class LightingDesignerAgent extends BaseAgent {
    constructor(config = {}) {
        super('lighting-designer', {
            name: 'Lighting Designer',
            role: 'lighting-designer',
            priority: 75, // High priority for visual impact
            maxActionsPerSecond: 10, // High rate for smooth transitions
            personality: config.personality || 'artistic',
            ...config
        });
        
        // Lighting Designer specific properties
        this.ollamaInterface = null;
        this.designStyle = config.designStyle || 'adaptive';
        this.creativityLevel = config.creativity || 0.85;
        
        // Lighting capabilities
        this.lightingCapabilities = {
            fixtures: {
                spotlights: { count: 8, power: 1000, colors: 'full' },
                floodlights: { count: 12, power: 500, colors: 'full' },
                ledStrips: { count: 20, power: 100, colors: 'rgb' },
                movingHeads: { count: 4, power: 750, colors: 'full' },
                specialEffects: { strobes: 2, lasers: 1, fog: true }
            },
            control: {
                channels: 512, // DMX channels
                cues: new Map(),
                transitions: true,
                effects: true,
                automation: true
            },
            design: {
                colorTheory: true,
                moodLighting: true,
                dramaticEffects: true,
                naturalLighting: true,
                abstract: true
            }
        };
        
        // Current lighting state
        this.currentLightingState = {
            preset: 'neutral',
            intensity: 0.7,
            colorTemp: 4000, // Kelvin
            primaryColor: { r: 255, g: 255, b: 255 },
            secondaryColor: { r: 200, g: 200, b: 255 },
            focusArea: 'center_stage',
            effects: []
        };
        
        // Lighting design project
        this.lightingProject = {
            production: null,
            plot: new Map(), // position -> fixture mapping
            cueSheet: new Map(), // cue number -> lighting state
            colorPalette: [],
            designConcept: null,
            status: 'idle'
        };
        
        // Color and mood mappings
        this.moodColorMapping = {
            joy: { 
                primary: { r: 255, g: 220, b: 100 }, 
                secondary: { r: 255, g: 150, b: 50 },
                intensity: 0.8,
                warmth: 'warm'
            },
            sadness: {
                primary: { r: 100, g: 120, b: 200 },
                secondary: { r: 50, g: 70, b: 150 },
                intensity: 0.4,
                warmth: 'cool'
            },
            tension: {
                primary: { r: 200, g: 50, b: 50 },
                secondary: { r: 100, g: 0, b: 0 },
                intensity: 0.9,
                warmth: 'neutral'
            },
            mystery: {
                primary: { r: 100, g: 50, b: 150 },
                secondary: { r: 50, g: 0, b: 100 },
                intensity: 0.3,
                warmth: 'cool'
            },
            romance: {
                primary: { r: 255, g: 180, b: 200 },
                secondary: { r: 200, g: 100, b: 150 },
                intensity: 0.6,
                warmth: 'warm'
            }
        };
        
        // Lighting presets
        this.lightingPresets = {
            dramatic: { contrast: 'high', shadows: 'deep', focus: 'tight' },
            naturalistic: { contrast: 'medium', shadows: 'soft', focus: 'wide' },
            theatrical: { contrast: 'high', shadows: 'medium', focus: 'selective' },
            concert: { contrast: 'very_high', shadows: 'minimal', focus: 'dynamic' },
            minimal: { contrast: 'low', shadows: 'minimal', focus: 'even' }
        };
        
        // Real-time performance tracking
        this.performanceTracking = {
            currentCue: null,
            transitionInProgress: false,
            activeEffects: [],
            audienceResponseTracking: true
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.technicalDirector = null;
        this.musicDirector = null;
        this.currentProduction = null;
        
        console.log('💡 Lighting Designer Agent: Ready to illuminate the stage with AI-driven design');
    }

    /**
     * Initialize Lighting Designer with system integration
     */
    async onInitialize() {
        try {
            console.log('💡 Lighting Designer: Initializing lighting design systems...');
            
            // Connect to Ollama interface for AI design
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI lighting design requires LLM assistance.');
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
            
            // Configure AI for lighting design
            this.ollamaInterface.updatePerformanceContext({
                role: 'lighting_designer',
                design_style: this.designStyle,
                creativity_mode: 'visual_design',
                specialization: 'theatrical_lighting'
            });
            
            // Connect to production agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('💡 Lighting Designer: Connected to Creative Director');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('💡 Lighting Designer: Connected to Technical Director');
            }
            
            if (window.musicDirectorAgent) {
                this.musicDirector = window.musicDirectorAgent;
                console.log('💡 Lighting Designer: Connected to Music Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize lighting systems
            await this.initializeLightingSystems();
            
            // Test design capabilities
            await this.testDesignCapabilities();
            
            console.log('💡 Lighting Designer: Ready to create stunning visual atmospheres!')
            
        } catch (error) {
            console.error('💡 Lighting Designer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI LIGHTING DESIGN:
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
     * Subscribe to production events for lighting coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('script:scene-complete', (data) => this.onSceneComplete(data));
            window.theaterEventBus.subscribe('performance:emotion-change', (data) => this.onEmotionChange(data));
            window.theaterEventBus.subscribe('music:tempo-change', (data) => this.onTempoChange(data));
            window.theaterEventBus.subscribe('stage:actor-movement', (data) => this.onActorMovement(data));
            window.theaterEventBus.subscribe('lighting:cue-trigger', (data) => this.onCueTrigger(data));
            
            console.log('💡 Lighting Designer: Subscribed to lighting coordination events');
        }
    }

    /**
     * Initialize lighting systems
     */
    async initializeLightingSystems() {
        console.log('💡 Lighting Designer: Initializing lighting control systems...');
        
        // Initialize DMX control simulation
        this.dmxController = {
            channels: new Array(512).fill(0),
            updateChannel: (channel, value) => {
                if (channel >= 0 && channel < 512) {
                    this.dmxController.channels[channel] = Math.max(0, Math.min(255, value));
                }
            },
            fadeChannel: async (channel, targetValue, duration) => {
                // Simulate smooth fading
                const startValue = this.dmxController.channels[channel];
                const steps = Math.floor(duration / 50); // 50ms steps
                const increment = (targetValue - startValue) / steps;
                
                for (let i = 0; i < steps; i++) {
                    this.dmxController.updateChannel(channel, startValue + (increment * i));
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
                this.dmxController.updateChannel(channel, targetValue);
            }
        };
        
        // Initialize fixture mapping
        this.initializeFixtureMapping();
        
        console.log('✅ Lighting Designer: Lighting control systems initialized');
    }

    /**
     * Test design capabilities
     */
    async testDesignCapabilities() {
        try {
            const testPrompt = `
            As a theatrical lighting designer, create a lighting design for a dramatic scene.
            
            Scene context:
            - A tense confrontation between two characters
            - Evening setting, interior
            - Emotional tone: suspenseful and dramatic
            
            Provide:
            1. Overall lighting concept
            2. Key light positions and angles
            3. Color choices and reasoning
            4. Intensity levels
            5. Special effects if needed
            6. Transition from previous scene
            
            Format as professional lighting design notes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 500
            });
            
            console.log('💡 Lighting Designer: Design capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('💡 Lighting Designer: Design capability test failed:', error);
            throw new Error(`Lighting design test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('💡 Lighting Designer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize lighting project
        await this.initializeLightingProject(data.production);
        
        // Develop overall lighting concept
        await this.developLightingConcept(data.production);
    }

    /**
     * Initialize lighting project
     */
    async initializeLightingProject(production) {
        console.log('💡 Lighting Designer: Initializing lighting project...');
        
        this.lightingProject = {
            production: production,
            plot: new Map(),
            cueSheet: new Map(),
            colorPalette: [],
            designConcept: null,
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Set initial lighting plot based on venue
        await this.createInitialLightingPlot();
        
        console.log('✅ Lighting Designer: Lighting project initialized');
    }

    /**
     * Develop overall lighting concept
     */
    async developLightingConcept(production) {
        try {
            console.log('💡 Lighting Designer: Developing lighting concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive lighting design concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall visual aesthetic and style
                2. Color palette and symbolism
                3. Key lighting moments and transitions
                4. Integration with set and costume design
                5. Emotional journey through lighting
                6. Technical requirements and special effects
                7. Audience sight lines and visibility
                8. Safety considerations
                
                Provide a detailed lighting design concept that will guide the entire production.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1000,
                    timeout: 30000
                });
                
                if (response && response.content) {
                    this.lightingProject.designConcept = response.content;
                    this.lightingProject.status = 'concept_complete';
                    
                    console.log('✅ Lighting Designer: Lighting concept developed');
                    
                    // Extract color palette from concept
                    await this.extractColorPalette(response.content);
                    
                    // Share concept with Creative Director
                    window.theaterEventBus?.publish('lighting:concept-complete', {
                        production: production,
                        concept: response.content,
                        colorPalette: this.lightingProject.colorPalette,
                        lightingDesigner: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Lighting Designer: Concept development failed:', error.message);
            this.lightingProject.status = 'concept_error';
        }
    }

    /**
     * Handle artistic vision from Creative Director
     */
    async onArtisticVisionReceived(data) {
        console.log('💡 Lighting Designer: Received artistic vision from Creative Director');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.adaptLightingToVision(data.vision);
        }
    }

    /**
     * Adapt lighting concept to artistic vision
     */
    async adaptLightingToVision(artisticVision) {
        try {
            console.log('💡 Lighting Designer: Adapting lighting to artistic vision...');
            
            const adaptationPrompt = `
            Adapt the lighting design to align with this artistic vision:
            
            Artistic Vision:
            ${artisticVision}
            
            Current Lighting Concept:
            ${this.lightingProject.designConcept || 'To be developed'}
            
            Provide specific lighting adaptations:
            1. How should the color palette be adjusted?
            2. What lighting qualities support this vision?
            3. How can lighting enhance the thematic elements?
            4. What special effects or techniques align with the vision?
            5. How should the lighting arc support the narrative?
            
            Suggest concrete lighting changes to implement the artistic vision.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                temperature: 0.8,
                max_tokens: 700
            });
            
            if (response && response.content) {
                this.lightingProject.visionAdaptation = response.content;
                
                console.log('✅ Lighting Designer: Lighting adapted to artistic vision');
                
                // Update color palette and design elements
                await this.updateDesignElements(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Lighting Designer: Vision adaptation failed:', error.message);
        }
    }

    /**
     * Handle scene completion for lighting design
     */
    async onSceneComplete(data) {
        console.log(`💡 Lighting Designer: Scene ${data.act}.${data.sceneNumber} completed, designing lighting...`);
        
        if (data.production.id === this.currentProduction?.id) {
            await this.designSceneLighting(data.scene);
        }
    }

    /**
     * Design lighting for a specific scene
     */
    async designSceneLighting(scene) {
        try {
            console.log(`💡 Lighting Designer: Designing lighting for scene ${scene.act}.${scene.scene}...`);
            
            const designPrompt = `
            Design lighting for this theatrical scene:
            
            Scene: Act ${scene.act}, Scene ${scene.scene}
            Content: ${scene.content.substring(0, 600)}...
            
            Lighting Design Requirements:
            1. Analyze the emotional content and dramatic needs
            2. Design key lighting positions and angles
            3. Specify color choices (RGB values or color names)
            4. Set intensity levels (0-100%)
            5. Plan transitions and cue timing
            6. Consider special effects or focus shifts
            7. Ensure visibility while maintaining atmosphere
            
            Provide detailed lighting cues and design notes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(designPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800,
                timeout: 45000
            });
            
            if (response && response.content) {
                const sceneLighting = {
                    scene: `${scene.act}.${scene.scene}`,
                    design: response.content,
                    cues: await this.extractLightingCues(response.content),
                    designedAt: new Date(),
                    status: 'designed'
                };
                
                // Add cues to cue sheet
                for (const cue of sceneLighting.cues) {
                    this.lightingProject.cueSheet.set(cue.number, cue);
                }
                
                console.log(`✅ Lighting Designer: Lighting designed for scene ${scene.act}.${scene.scene}`);
                
                // Notify Technical Director
                window.theaterEventBus?.publish('lighting:scene-designed', {
                    scene: scene,
                    lighting: sceneLighting,
                    cueCount: sceneLighting.cues.length,
                    lightingDesigner: this.config.name
                });
                
                return sceneLighting;
            }
            
        } catch (error) {
            console.error(`💡 Lighting Designer: Scene lighting design failed for ${scene.act}.${scene.scene}:`, error);
            return null;
        }
    }

    /**
     * Handle real-time emotion changes
     */
    async onEmotionChange(data) {
        console.log('💡 Lighting Designer: Emotion change detected -', data.emotion);
        
        await this.adaptLightingToEmotion(data.emotion, data.intensity || 0.5);
    }

    /**
     * Adapt lighting to match emotional state
     */
    async adaptLightingToEmotion(emotion, intensity) {
        try {
            console.log(`💡 Lighting Designer: Adapting lighting to ${emotion} (intensity: ${intensity})...`);
            
            const moodLighting = this.moodColorMapping[emotion];
            
            if (moodLighting) {
                // Calculate lighting adjustments
                const targetState = {
                    primaryColor: moodLighting.primary,
                    secondaryColor: moodLighting.secondary,
                    intensity: moodLighting.intensity * (0.5 + intensity * 0.5),
                    colorTemp: moodLighting.warmth === 'warm' ? 3000 : 5000
                };
                
                // Create smooth transition
                await this.transitionToLightingState(targetState, 2000); // 2 second transition
                
                // Update current state
                this.currentLightingState = {
                    ...this.currentLightingState,
                    ...targetState,
                    preset: emotion
                };
                
                // Generate AI enhancement
                const enhancementPrompt = `
                Enhance the lighting for emotional state: ${emotion}
                Current intensity: ${intensity}
                
                Current lighting:
                - Primary color: RGB(${moodLighting.primary.r}, ${moodLighting.primary.g}, ${moodLighting.primary.b})
                - Secondary color: RGB(${moodLighting.secondary.r}, ${moodLighting.secondary.g}, ${moodLighting.secondary.b})
                - Intensity: ${targetState.intensity * 100}%
                
                Suggest subtle enhancements:
                1. Focus area adjustments
                2. Shadow patterns
                3. Movement or effects
                4. Contrast modifications
                
                Keep suggestions practical for real-time execution.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(enhancementPrompt, {
                    temperature: 0.7,
                    max_tokens: 300,
                    timeout: 8000
                });
                
                if (response && response.content) {
                    console.log('✅ Lighting Designer: Emotional lighting enhanced');
                    
                    // Apply suggested enhancements
                    await this.applyLightingEnhancements(response.content);
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Lighting Designer: Emotional adaptation failed:', error.message);
        }
    }

    /**
     * Handle tempo changes from music
     */
    async onTempoChange(data) {
        console.log('💡 Lighting Designer: Tempo change detected -', data.tempo);
        
        // Adjust lighting effects to match musical tempo
        await this.syncLightingToTempo(data.tempo);
    }

    /**
     * Sync lighting effects to musical tempo
     */
    async syncLightingToTempo(tempo) {
        // Calculate effect speed based on tempo
        const effectSpeed = tempo / 60; // beats per second
        
        // Apply rhythmic lighting effects
        if (tempo > 120) {
            // Fast tempo - energetic effects
            this.startEffect('pulse', { speed: effectSpeed, intensity: 0.3 });
        } else if (tempo < 80) {
            // Slow tempo - gentle breathing
            this.startEffect('breathe', { speed: effectSpeed * 0.5, intensity: 0.2 });
        } else {
            // Medium tempo - subtle rhythm
            this.startEffect('wave', { speed: effectSpeed * 0.75, intensity: 0.15 });
        }
        
        console.log(`💡 Lighting Designer: Synced to tempo ${tempo} BPM`);
    }

    /**
     * Handle actor movement for lighting focus
     */
    async onActorMovement(data) {
        // Adjust lighting focus to follow key actors
        if (data.actor.role === 'lead' || data.actor.importance === 'high') {
            await this.adjustLightingFocus(data.actor.position);
        }
    }

    /**
     * Adjust lighting focus
     */
    async adjustLightingFocus(position) {
        console.log('💡 Lighting Designer: Adjusting focus to position:', position);
        
        // Calculate nearest lighting area
        const focusArea = this.calculateFocusArea(position);
        
        if (focusArea !== this.currentLightingState.focusArea) {
            // Smooth transition to new focus
            await this.transitionFocus(focusArea, 1500);
            
            this.currentLightingState.focusArea = focusArea;
        }
    }

    /**
     * Handle lighting cue triggers
     */
    async onCueTrigger(data) {
        console.log('💡 Lighting Designer: Cue triggered -', data.cueNumber);
        
        const cue = this.lightingProject.cueSheet.get(data.cueNumber);
        
        if (cue) {
            await this.executeLightingCue(cue);
        } else {
            console.warn(`⚠️ Lighting Designer: Cue ${data.cueNumber} not found`);
        }
    }

    /**
     * Execute a lighting cue
     */
    async executeLightingCue(cue) {
        console.log(`💡 Lighting Designer: Executing cue ${cue.number}...`);
        
        this.performanceTracking.currentCue = cue;
        this.performanceTracking.transitionInProgress = true;
        
        try {
            // Apply cue settings
            await this.transitionToLightingState(cue.state, cue.transitionTime || 3000);
            
            // Apply any special effects
            if (cue.effects) {
                for (const effect of cue.effects) {
                    this.startEffect(effect.type, effect.params);
                }
            }
            
            this.performanceTracking.transitionInProgress = false;
            console.log(`✅ Lighting Designer: Cue ${cue.number} executed`);
            
        } catch (error) {
            console.error(`💡 Lighting Designer: Cue execution failed:`, error);
            this.performanceTracking.transitionInProgress = false;
        }
    }

    /**
     * Transition to new lighting state
     */
    async transitionToLightingState(targetState, duration) {
        // In a real implementation, this would control actual lighting hardware
        // Here we simulate the transition
        
        const steps = Math.floor(duration / 50); // 50ms steps
        const startState = { ...this.currentLightingState };
        
        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            
            // Interpolate colors
            if (targetState.primaryColor) {
                this.currentLightingState.primaryColor = this.interpolateColor(
                    startState.primaryColor,
                    targetState.primaryColor,
                    progress
                );
            }
            
            // Interpolate intensity
            if (targetState.intensity !== undefined) {
                this.currentLightingState.intensity = 
                    startState.intensity + (targetState.intensity - startState.intensity) * progress;
            }
            
            // Update DMX channels
            this.updateDMXFromState();
            
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    /**
     * Interpolate between two colors
     */
    interpolateColor(color1, color2, progress) {
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * progress),
            g: Math.round(color1.g + (color2.g - color1.g) * progress),
            b: Math.round(color1.b + (color2.b - color1.b) * progress)
        };
    }

    /**
     * Start a lighting effect
     */
    startEffect(effectType, params) {
        const effect = {
            type: effectType,
            params: params,
            startTime: Date.now(),
            active: true
        };
        
        this.performanceTracking.activeEffects.push(effect);
        
        // Effect implementation would go here
        console.log(`💡 Lighting Designer: Started ${effectType} effect`);
    }

    /**
     * Extract lighting cues from design text
     */
    async extractLightingCues(designText) {
        const cues = [];
        let cueNumber = 1;
        
        // Simple extraction - in practice, would use more sophisticated parsing
        const lines = designText.split('\n');
        
        for (const line of lines) {
            if (line.toLowerCase().includes('cue') || line.toLowerCase().includes('transition')) {
                cues.push({
                    number: cueNumber++,
                    description: line,
                    state: this.parseStateFromDescription(line),
                    transitionTime: this.parseTransitionTime(line)
                });
            }
        }
        
        return cues;
    }

    /**
     * Extract color palette from concept
     */
    async extractColorPalette(conceptText) {
        // Use AI to extract color palette
        try {
            const palettePrompt = `
            Extract the color palette from this lighting design concept:
            
            ${conceptText}
            
            List the main colors as:
            1. Primary color (RGB values)
            2. Secondary color (RGB values)
            3. Accent colors (RGB values)
            4. Color symbolism and meaning
            
            Format as structured color data.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(palettePrompt, {
                temperature: 0.5,
                max_tokens: 400
            });
            
            if (response && response.content) {
                // Parse and store color palette
                this.lightingProject.colorPalette = this.parseColorPalette(response.content);
                console.log('💡 Lighting Designer: Color palette extracted');
            }
            
        } catch (error) {
            console.warn('⚠️ Lighting Designer: Color palette extraction failed:', error.message);
        }
    }

    /**
     * Initialize fixture mapping
     */
    initializeFixtureMapping() {
        // Map fixtures to stage positions
        const positions = ['USL', 'USC', 'USR', 'CSL', 'CS', 'CSR', 'DSL', 'DSC', 'DSR'];
        let channelOffset = 0;
        
        // Map spotlights
        for (let i = 0; i < this.lightingCapabilities.fixtures.spotlights.count; i++) {
            this.lightingProject.plot.set(`spot_${i}`, {
                type: 'spotlight',
                position: positions[i % positions.length],
                channels: { r: channelOffset, g: channelOffset + 1, b: channelOffset + 2, intensity: channelOffset + 3 },
                power: this.lightingCapabilities.fixtures.spotlights.power
            });
            channelOffset += 4;
        }
        
        console.log('💡 Lighting Designer: Fixture mapping initialized');
    }

    /**
     * Update DMX channels from current state
     */
    updateDMXFromState() {
        // Update main wash
        const mainIntensity = Math.round(this.currentLightingState.intensity * 255);
        const { r, g, b } = this.currentLightingState.primaryColor;
        
        // Update first 4 channels as example
        this.dmxController.updateChannel(0, r);
        this.dmxController.updateChannel(1, g);
        this.dmxController.updateChannel(2, b);
        this.dmxController.updateChannel(3, mainIntensity);
        
        // In practice, would update all fixtures based on state
    }

    /**
     * Calculate focus area from position
     */
    calculateFocusArea(position) {
        // Simple grid-based focus areas
        const x = position.x;
        const z = position.z;
        
        if (x < -5) {
            if (z < -5) return 'USL';
            if (z > 5) return 'DSL';
            return 'CSL';
        } else if (x > 5) {
            if (z < -5) return 'USR';
            if (z > 5) return 'DSR';
            return 'CSR';
        } else {
            if (z < -5) return 'USC';
            if (z > 5) return 'DSC';
            return 'CS';
        }
    }

    /**
     * Get lighting design status
     */
    getLightingStatus() {
        return {
            currentProject: {
                active: !!this.lightingProject.production,
                title: this.lightingProject.production?.title,
                status: this.lightingProject.status,
                cueCount: this.lightingProject.cueSheet.size,
                colorPalette: this.lightingProject.colorPalette.length
            },
            currentState: this.currentLightingState,
            capabilities: this.lightingCapabilities,
            performance: {
                currentCue: this.performanceTracking.currentCue?.number,
                transitionInProgress: this.performanceTracking.transitionInProgress,
                activeEffects: this.performanceTracking.activeEffects.length
            },
            dmxUsage: {
                channelsUsed: this.dmxController.channels.filter(ch => ch > 0).length,
                totalChannels: 512
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('💡 Lighting Designer: Concluding lighting design session...');
        
        // Stop all active effects
        this.performanceTracking.activeEffects = [];
        
        // Save final state
        if (this.lightingProject.status !== 'idle') {
            this.lightingProject.status = 'completed';
            this.lightingProject.completedAt = new Date();
        }
        
        // Generate lighting summary
        if (this.currentProduction) {
            const lightingSummary = this.generateLightingSummary();
            console.log('💡 Lighting Designer: Lighting summary generated');
        }
        
        console.log('💡 Lighting Designer: Lighting design concluded');
    }

    /**
     * Generate lighting summary
     */
    generateLightingSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            design: {
                conceptDeveloped: !!this.lightingProject.designConcept,
                cuesCreated: this.lightingProject.cueSheet.size,
                colorPaletteSize: this.lightingProject.colorPalette.length,
                fixturesMapped: this.lightingProject.plot.size
            },
            performance: {
                emotionalAdaptations: this.countEmotionalAdaptations(),
                liveTransitions: this.countLiveTransitions(),
                effectsUsed: this.countUniqueEffects()
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LightingDesignerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.LightingDesignerAgent = LightingDesignerAgent;
    console.log('💡 Lighting Designer Agent loaded - Ready for AI-driven lighting design');
}