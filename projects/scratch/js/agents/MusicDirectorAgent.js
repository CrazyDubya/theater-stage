/**
 * MusicDirectorAgent.js - Musical Composition and Audio Direction
 * 
 * The Music Director Agent manages all musical aspects of theatrical productions,
 * including composition, arrangement, live music coordination, and audio design.
 * Works with Ollama LLM to generate original musical content and coordinate
 * musical elements with the overall production.
 * 
 * Features:
 * - AI-powered musical composition and arrangement
 * - Real-time musical adaptation during performances
 * - Integration with sound design and lighting
 * - Musical pacing and emotional arc coordination
 * - Live music direction and orchestration
 * - Collaborative music creation with human musicians
 */

class MusicDirectorAgent extends BaseAgent {
    constructor(config = {}) {
        super('music-director', {
            name: 'Music Director',
            role: 'music-director',
            priority: 75, // High priority for musical productions
            maxActionsPerSecond: 4,
            personality: config.personality || 'expressive',
            ...config
        });
        
        // Music Director specific properties
        this.ollamaInterface = null;
        this.musicalStyle = config.musicalStyle || 'adaptive';
        this.compositionLevel = config.compositionLevel || 'professional';
        this.creativityLevel = config.creativity || 0.8;
        
        // Musical capabilities
        this.musicalCapabilities = {
            composition: {
                melodies: true,
                harmonies: true,
                rhythms: true,
                arrangements: true
            },
            genres: {
                classical: true,
                contemporary: true,
                musical_theater: true,
                ambient: true,
                experimental: true
            },
            orchestration: {
                solo_instruments: true,
                small_ensemble: true,
                full_orchestra: false, // Limited by AI capabilities
                electronic: true
            },
            direction: {
                live_musicians: true,
                backing_tracks: true,
                real_time_adaptation: true,
                cue_coordination: true
            }
        };
        
        // Current musical project
        this.currentMusicalProject = {
            production: null,
            score: new Map(), // scene -> musical elements
            themes: new Map(), // character/concept -> musical theme
            arrangements: new Map(),
            status: 'idle'
        };
        
        // Musical elements and library
        this.musicalLibrary = {
            themes: new Map(),
            motifs: new Map(),
            progressions: new Map(),
            rhythmPatterns: new Map(),
            arrangements: new Map()
        };
        
        // Real-time music state
        this.realTimeMusic = {
            currentCue: null,
            activeThemes: [],
            tempo: 120,
            key: 'C major',
            dynamics: 'mf', // mezzo-forte
            mood: 'neutral'
        };
        
        // Musical analysis and theory
        this.musicalTheory = {
            scales: ['major', 'minor', 'dorian', 'lydian', 'mixolydian'],
            progressions: ['I-V-vi-IV', 'vi-IV-I-V', 'I-vi-ii-V', 'I-IV-V-I'],
            rhythms: ['4/4', '3/4', '6/8', '2/4', '5/4'],
            instruments: {
                strings: ['violin', 'viola', 'cello', 'double_bass', 'guitar'],
                woodwinds: ['flute', 'clarinet', 'oboe', 'bassoon', 'saxophone'],
                brass: ['trumpet', 'horn', 'trombone', 'tuba'],
                percussion: ['timpani', 'snare', 'cymbals', 'triangle'],
                keyboard: ['piano', 'harpsichord', 'organ', 'synthesizer']
            }
        };
        
        // Emotional musical mapping
        this.emotionalMapping = {
            joy: { keys: ['C major', 'G major', 'D major'], tempo: [120, 140], dynamics: ['f', 'ff'] },
            sadness: { keys: ['A minor', 'D minor', 'F# minor'], tempo: [60, 80], dynamics: ['p', 'pp'] },
            tension: { keys: ['diminished', 'chromatic'], tempo: [100, 160], dynamics: ['mf', 'f'] },
            mystery: { keys: ['B minor', 'F# minor'], tempo: [70, 90], dynamics: ['pp', 'p'] },
            triumph: { keys: ['C major', 'Bb major'], tempo: [110, 130], dynamics: ['f', 'ff'] }
        };
        
        // Integration with production system
        this.executiveProducer = null;
        this.creativeDirector = null;
        this.soundDesigner = null;
        this.currentProduction = null;
        
        // Live performance tracking
        this.performanceTracking = {
            currentScene: null,
            musicCues: [],
            liveAdaptations: [],
            audienceResponse: null
        };
        
        console.log('🎵 Music Director Agent: Ready to compose and direct musical elements');
    }

    /**
     * Initialize Music Director with system integration
     */
    async onInitialize() {
        try {
            console.log('🎵 Music Director: Initializing musical composition systems...');
            
            // Connect to Ollama interface for AI composition
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. Music composition requires AI assistance.');
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
            
            // Configure AI for musical composition
            this.ollamaInterface.updatePerformanceContext({
                role: 'music_director',
                composition_style: this.musicalStyle,
                creativity_mode: 'musical_composition',
                genre: 'theatrical'
            });
            
            // Connect to production agents
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('🎵 Music Director: Connected to Executive Producer');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎵 Music Director: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize musical library
            await this.initializeMusicalLibrary();
            
            // Test composition capabilities
            await this.testCompositionCapabilities();
            
            console.log('🎵 Music Director: Ready for musical composition and direction!')
            
        } catch (error) {
            console.error('🎵 Music Director: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR MUSIC COMPOSITION:
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
     * Subscribe to production events for musical coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('script:scene-complete', (data) => this.onSceneComplete(data));
            window.theaterEventBus.subscribe('performance:scene-change', (data) => this.onSceneChange(data));
            window.theaterEventBus.subscribe('performance:emotion-change', (data) => this.onEmotionChange(data));
            window.theaterEventBus.subscribe('music:cue-needed', (data) => this.onMusicCueNeeded(data));
            
            console.log('🎵 Music Director: Subscribed to musical coordination events');
        }
    }

    /**
     * Initialize musical library with basic elements
     */
    async initializeMusicalLibrary() {
        console.log('🎵 Music Director: Initializing musical library...');
        
        // Basic musical themes for different emotions
        this.musicalLibrary.themes.set('heroic', {
            key: 'C major',
            progression: 'I-V-vi-IV',
            tempo: 120,
            instruments: ['brass', 'strings'],
            dynamics: 'f'
        });
        
        this.musicalLibrary.themes.set('romantic', {
            key: 'F major',
            progression: 'I-vi-ii-V',
            tempo: 80,
            instruments: ['strings', 'woodwinds'],
            dynamics: 'p'
        });
        
        this.musicalLibrary.themes.set('mysterious', {
            key: 'B minor',
            progression: 'i-VII-VI-VII',
            tempo: 70,
            instruments: ['strings', 'piano'],
            dynamics: 'pp'
        });
        
        console.log('✅ Music Director: Musical library initialized');
    }

    /**
     * Test composition capabilities
     */
    async testCompositionCapabilities() {
        try {
            const testPrompt = `
            As a music director, compose a brief musical theme for a theatrical scene.
            
            Requirements:
            - 8-bar melody in C major
            - Moderate tempo (around 100 BPM)
            - Suitable for a dramatic entrance
            - Include specific instruments and dynamics
            
            Provide the composition as musical notation description and performance instructions.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 400
            });
            
            console.log('🎵 Music Director: Composition capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎵 Music Director: Composition capability test failed:', error);
            throw new Error(`Musical composition test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎵 Music Director: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize musical project structure
        await this.initializeMusicalProject(data.production);
        
        // Begin musical concept development
        await this.developMusicalConcept(data.production);
    }

    /**
     * Initialize musical project structure
     */
    async initializeMusicalProject(production) {
        console.log('🎵 Music Director: Initializing musical project structure...');
        
        this.currentMusicalProject = {
            production: production,
            score: new Map(),
            themes: new Map(),
            arrangements: new Map(),
            status: 'concept_development',
            createdAt: new Date(),
            lastModified: new Date()
        };
        
        // Create basic musical structure based on production type
        const productionType = production.type || 'drama';
        await this.createMusicalStructure(productionType);
        
        console.log('✅ Music Director: Musical project structure initialized');
    }

    /**
     * Develop overall musical concept for production
     */
    async developMusicalConcept(production) {
        try {
            console.log('🎵 Music Director: Developing musical concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive musical concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall musical style and genre
                2. Key musical themes and motifs
                3. Instrumentation approach
                4. Musical arc throughout the production
                5. Integration with dramatic elements
                6. Audience engagement strategies
                
                Provide a detailed musical concept that will guide composition and performance.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 800,
                    timeout: 30000
                });
                
                if (response && response.content) {
                    this.currentMusicalProject.concept = response.content;
                    this.currentMusicalProject.status = 'concept_complete';
                    
                    console.log('✅ Music Director: Musical concept developed');
                    
                    // Share concept with Creative Director
                    window.theaterEventBus?.publish('music:concept-complete', {
                        production: production,
                        concept: response.content,
                        musicDirector: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Music Director: Musical concept development failed:', error.message);
            this.currentMusicalProject.status = 'concept_error';
        }
    }

    /**
     * Handle artistic vision from Creative Director
     */
    async onArtisticVisionReceived(data) {
        console.log('🎵 Music Director: Received artistic vision from Creative Director');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.adaptMusicalConceptToVision(data.vision);
        }
    }

    /**
     * Adapt musical concept to artistic vision
     */
    async adaptMusicalConceptToVision(artisticVision) {
        try {
            console.log('🎵 Music Director: Adapting musical concept to artistic vision...');
            
            const adaptationPrompt = `
            Adapt the musical concept to align with this artistic vision:
            
            Artistic Vision:
            ${artisticVision}
            
            Current Musical Concept:
            ${this.currentMusicalProject.concept || 'To be developed'}
            
            Provide specific musical adaptations:
            1. How should the musical style be adjusted?
            2. What instruments would best support this vision?
            3. How should the emotional musical arc be modified?
            4. What specific themes or motifs align with the vision?
            5. How can music enhance the artistic goals?
            
            Suggest concrete musical changes to implement the artistic vision.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                temperature: 0.8,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.currentMusicalProject.visionAdaptation = response.content;
                this.currentMusicalProject.lastModified = new Date();
                
                console.log('✅ Music Director: Musical concept adapted to artistic vision');
                
                // Update musical themes and elements
                await this.updateMusicalElements(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Music Director: Vision adaptation failed:', error.message);
        }
    }

    /**
     * Handle scene completion for musical scoring
     */
    async onSceneComplete(data) {
        console.log(`🎵 Music Director: Scene ${data.act}.${data.sceneNumber} completed, composing music...`);
        
        if (data.production.id === this.currentProduction?.id) {
            await this.composeSceneMusic(data.scene);
        }
    }

    /**
     * Compose music for a specific scene
     */
    async composeSceneMusic(scene) {
        try {
            console.log(`🎵 Music Director: Composing music for scene ${scene.act}.${scene.scene}...`);
            
            const compositionPrompt = `
            Compose music for this theatrical scene:
            
            Scene: Act ${scene.act}, Scene ${scene.scene}
            Content: ${scene.content.substring(0, 500)}...
            
            Musical Requirements:
            1. Analyze the emotional content and dramatic arc
            2. Suggest appropriate instrumentation
            3. Recommend tempo and dynamics
            4. Identify key musical moments and transitions
            5. Propose specific musical cues for entrances/exits
            6. Consider how music supports the dialogue and action
            
            Provide detailed musical direction for this scene.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(compositionPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800,
                timeout: 45000
            });
            
            if (response && response.content) {
                const sceneMusic = {
                    scene: `${scene.act}.${scene.scene}`,
                    composition: response.content,
                    composedAt: new Date(),
                    status: 'composed'
                };
                
                this.currentMusicalProject.score.set(sceneMusic.scene, sceneMusic);
                
                console.log(`✅ Music Director: Music composed for scene ${scene.act}.${scene.scene}`);
                
                // Notify Creative Director
                window.theaterEventBus?.publish('music:scene-scored', {
                    scene: scene,
                    music: sceneMusic,
                    musicDirector: this.config.name
                });
                
                return sceneMusic;
            }
            
        } catch (error) {
            console.error(`🎵 Music Director: Scene composition failed for ${scene.act}.${scene.scene}:`, error);
            return null;
        }
    }

    /**
     * Handle real-time scene changes during performance
     */
    async onSceneChange(data) {
        console.log('🎵 Music Director: Scene change detected, adapting music...');
        
        const newScene = `${data.act}.${data.scene}`;
        
        // Get composed music for this scene
        const sceneMusic = this.currentMusicalProject.score.get(newScene);
        
        if (sceneMusic) {
            await this.transitionToSceneMusic(sceneMusic);
        } else {
            // Compose emergency music for unscored scene
            await this.composeEmergencyMusic(data);
        }
    }

    /**
     * Handle emotion changes for musical adaptation
     */
    async onEmotionChange(data) {
        console.log('🎵 Music Director: Emotion change detected -', data.emotion);
        
        await this.adaptMusicToEmotion(data.emotion, data.intensity || 0.5);
    }

    /**
     * Adapt music to match emotional state
     */
    async adaptMusicToEmotion(emotion, intensity) {
        try {
            console.log(`🎵 Music Director: Adapting music to ${emotion} (intensity: ${intensity})...`);
            
            const emotionalMapping = this.emotionalMapping[emotion];
            
            if (emotionalMapping) {
                // Update real-time music state
                this.realTimeMusic.mood = emotion;
                this.realTimeMusic.key = emotionalMapping.keys[0];
                this.realTimeMusic.tempo = emotionalMapping.tempo[0] + (intensity * 20);
                this.realTimeMusic.dynamics = emotionalMapping.dynamics[0];
                
                // Generate real-time musical adaptation
                const adaptationPrompt = `
                Adapt the current music to match the emotion: ${emotion}
                Intensity level: ${intensity}
                
                Current musical state:
                - Key: ${this.realTimeMusic.key}
                - Tempo: ${this.realTimeMusic.tempo}
                - Dynamics: ${this.realTimeMusic.dynamics}
                
                Provide specific musical instructions for real-time adaptation:
                1. How should the tempo be adjusted?
                2. What instruments should be emphasized?
                3. How should dynamics change?
                4. What musical techniques convey this emotion?
                
                Keep instructions practical for live performance.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                    temperature: 0.7,
                    max_tokens: 400,
                    timeout: 10000
                });
                
                if (response && response.content) {
                    this.performanceTracking.liveAdaptations.push({
                        emotion: emotion,
                        intensity: intensity,
                        adaptation: response.content,
                        timestamp: new Date()
                    });
                    
                    console.log('✅ Music Director: Music adapted to emotional state');
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Music Director: Emotional adaptation failed:', error.message);
        }
    }

    /**
     * Handle music cue requests
     */
    async onMusicCueNeeded(data) {
        console.log('🎵 Music Director: Music cue requested -', data.cueType);
        
        await this.generateMusicCue(data.cueType, data.context, data.urgency || 'normal');
    }

    /**
     * Generate specific music cue
     */
    async generateMusicCue(cueType, context, urgency) {
        try {
            console.log(`🎵 Music Director: Generating ${cueType} cue...`);
            
            const cuePrompt = `
            Generate a musical cue for this situation:
            
            Cue Type: ${cueType}
            Context: ${JSON.stringify(context)}
            Urgency: ${urgency}
            
            Provide specific musical instructions:
            1. Instrumentation and arrangement
            2. Tempo and rhythm
            3. Key and harmonic structure
            4. Duration and dynamics
            5. Entry and exit timing
            6. Coordination with stage action
            
            Make the cue theatrically effective and practical to execute.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(cuePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 500,
                timeout: urgency === 'urgent' ? 8000 : 15000
            });
            
            if (response && response.content) {
                const musicCue = {
                    type: cueType,
                    context: context,
                    instructions: response.content,
                    urgency: urgency,
                    generatedAt: new Date()
                };
                
                this.performanceTracking.musicCues.push(musicCue);
                
                console.log(`✅ Music Director: ${cueType} cue generated`);
                
                // Execute cue if urgent
                if (urgency === 'urgent') {
                    await this.executeMusicCue(musicCue);
                }
                
                return musicCue;
            }
            
        } catch (error) {
            console.error(`🎵 Music Director: Cue generation failed for ${cueType}:`, error);
            return null;
        }
    }

    /**
     * Execute a music cue
     */
    async executeMusicCue(cue) {
        console.log(`🎵 Music Director: Executing ${cue.type} cue...`);
        
        // In a real implementation, this would interface with audio systems
        this.realTimeMusic.currentCue = cue;
        
        // Notify audio systems
        window.theaterEventBus?.publish('audio:music-cue', {
            cue: cue,
            musicDirector: this.config.name,
            timestamp: new Date()
        });
    }

    /**
     * Create musical structure based on production type
     */
    async createMusicalStructure(productionType) {
        const structures = {
            drama: {
                acts: 3,
                musicalElements: ['underscoring', 'transitions', 'emotional_support'],
                intensity: 'moderate'
            },
            comedy: {
                acts: 3,
                musicalElements: ['comedic_timing', 'transitions', 'energy_boosts'],
                intensity: 'light'
            },
            musical: {
                acts: 2,
                musicalElements: ['songs', 'dance_numbers', 'underscoring', 'orchestrations'],
                intensity: 'high'
            },
            experimental: {
                acts: 'variable',
                musicalElements: ['ambient', 'electronic', 'unconventional'],
                intensity: 'variable'
            }
        };
        
        const structure = structures[productionType] || structures.drama;
        this.currentMusicalProject.structure = structure;
        
        console.log(`🎵 Music Director: ${productionType} musical structure created`);
    }

    /**
     * Get musical direction status and metrics
     */
    getMusicalStatus() {
        return {
            currentProject: {
                active: !!this.currentMusicalProject.production,
                title: this.currentMusicalProject.production?.title,
                status: this.currentMusicalProject.status,
                scoredScenes: this.currentMusicalProject.score.size,
                themes: this.currentMusicalProject.themes.size
            },
            capabilities: this.musicalCapabilities,
            realTimeMusic: this.realTimeMusic,
            performanceTracking: {
                cuesGenerated: this.performanceTracking.musicCues.length,
                liveAdaptations: this.performanceTracking.liveAdaptations.length,
                currentScene: this.performanceTracking.currentScene
            },
            library: {
                themes: this.musicalLibrary.themes.size,
                motifs: this.musicalLibrary.motifs.size,
                arrangements: this.musicalLibrary.arrangements.size
            }
        };
    }

    /**
     * Handle creative brief from production team
     */
    async onCreativeBrief(brief) {
        console.log('🎵 Music Director: Received creative brief for musical direction');
        
        this.currentProduction = brief.production;
        
        // Initialize musical approach based on brief
        await this.initializeMusicalProject(brief.production);
        
        // Develop musical concept aligned with artistic vision
        if (brief.artisticVision) {
            await this.adaptMusicalConceptToVision(brief.artisticVision);
        } else {
            await this.developMusicalConcept(brief.production);
        }
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎵 Music Director: Concluding musical direction session...');
        
        // Finalize current musical project
        if (this.currentMusicalProject.status !== 'idle') {
            this.currentMusicalProject.status = 'completed';
            this.currentMusicalProject.completedAt = new Date();
        }
        
        // Generate musical summary
        if (this.currentProduction) {
            const musicalSummary = this.generateMusicalSummary();
            console.log('🎼 Music Director: Musical summary generated');
        }
        
        console.log('🎵 Music Director: Musical direction concluded');
    }

    /**
     * Generate musical summary
     */
    generateMusicalSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            musical: {
                conceptDeveloped: !!this.currentMusicalProject.concept,
                scenesScored: this.currentMusicalProject.score.size,
                themesCreated: this.currentMusicalProject.themes.size,
                cuesGenerated: this.performanceTracking.musicCues.length
            },
            performance: {
                liveAdaptations: this.performanceTracking.liveAdaptations.length,
                emotionalResponses: this.countEmotionalResponses(),
                realTimeDirection: this.assessRealTimeDirection()
            },
            creativity: {
                originalCompositions: this.countOriginalCompositions(),
                adaptations: this.countAdaptations(),
                improvisation: this.assessImprovisation()
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicDirectorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.MusicDirectorAgent = MusicDirectorAgent;
    console.log('🎵 Music Director Agent loaded - Ready for musical composition and direction');
}