/**
 * ChoreographerAgent.js - AI-Powered Movement and Dance Coordination
 * 
 * The Choreographer Agent uses Ollama LLM to create expressive movement sequences,
 * stage blocking, and dance choreography that enhances storytelling and character
 * development. Coordinates with music and direction for seamless performances.
 * 
 * Features:
 * - AI-driven choreography generation and movement design
 * - Character-based movement vocabulary development
 * - Musical synchronization and rhythm coordination
 * - Spatial awareness and stage utilization
 * - Real-time movement adaptation during performance
 * - Integration with music, lighting, and direction systems
 */

class ChoreographerAgent extends BaseAgent {
    constructor(config = {}) {
        super('choreographer', {
            name: 'Choreographer',
            role: 'choreographer',
            priority: 70, // Medium-high priority for movement coordination
            maxActionsPerSecond: 6,
            personality: config.personality || 'expressive',
            ...config
        });
        
        // Choreographer specific properties
        this.ollamaInterface = null;
        this.movementStyle = config.movementStyle || 'theatrical';
        this.creativityLevel = config.creativity || 0.85;
        
        // Movement and choreography capabilities
        this.movementCapabilities = {
            choreographyStyles: {
                classical: true,
                contemporary: true,
                jazz: true,
                theatrical: true,
                folk: true,
                abstract: true
            },
            stageMovement: {
                blocking: true,
                transitions: true,
                formations: true,
                gestural: true,
                spatial: true
            },
            characterMovement: {
                personalityExpression: true,
                emotionalStates: true,
                relationshipDynamics: true,
                statusIndication: true,
                arcDevelopment: true
            },
            musicalIntegration: {
                rhythmSync: true,
                tempoAdaptation: true,
                dynamicResponse: true,
                phraseMimetic: true,
                counterpointMovement: true
            }
        };
        
        // Current choreography project
        this.choreographyProject = {
            production: null,
            movementConcept: null,
            characterMovementProfiles: new Map(),
            choreographySequences: new Map(),
            blockingPlan: new Map(),
            musicalCoordination: null,
            status: 'idle'
        };
        
        // Movement vocabulary and patterns
        this.movementVocabulary = {
            basic: {
                walk: { energy: 'neutral', space: 'linear', time: 'steady' },
                run: { energy: 'high', space: 'linear', time: 'quick' },
                turn: { energy: 'medium', space: 'circular', time: 'variable' },
                gesture: { energy: 'variable', space: 'personal', time: 'accented' },
                stillness: { energy: 'controlled', space: 'fixed', time: 'sustained' }
            },
            expressive: {
                reach: { intention: 'desire', quality: 'sustained', direction: 'up/forward' },
                withdraw: { intention: 'protection', quality: 'quick', direction: 'inward' },
                advance: { intention: 'assertion', quality: 'strong', direction: 'forward' },
                retreat: { intention: 'submission', quality: 'light', direction: 'backward' },
                embrace: { intention: 'connection', quality: 'flowing', direction: 'around' }
            },
            theatrical: {
                entrance: { impact: 'high', positioning: 'strategic', timing: 'precise' },
                exit: { resolution: 'clear', positioning: 'motivated', timing: 'musical' },
                focus: { attention: 'directed', body: 'oriented', energy: 'projected' },
                transition: { flow: 'seamless', purpose: 'clear', rhythm: 'musical' }
            }
        };
        
        // Stage space and positioning
        this.stageGeometry = {
            areas: {
                USC: { x: 0, z: -10, strength: 'strong', visibility: 'high' },
                USR: { x: 5, z: -10, strength: 'medium', visibility: 'high' },
                USL: { x: -5, z: -10, strength: 'medium', visibility: 'high' },
                CS: { x: 0, z: 0, strength: 'strongest', visibility: 'highest' },
                CSR: { x: 5, z: 0, strength: 'strong', visibility: 'high' },
                CSL: { x: -5, z: 0, strength: 'strong', visibility: 'high' },
                DSC: { x: 0, z: 10, strength: 'intimate', visibility: 'very_high' },
                DSR: { x: 5, z: 10, strength: 'medium', visibility: 'medium' },
                DSL: { x: -5, z: 10, strength: 'medium', visibility: 'medium' }
            },
            pathways: new Map(),
            formations: new Map()
        };
        
        // Musical coordination tracking
        this.musicalCoordination = {
            currentTempo: 120,
            currentSignature: '4/4',
            musicDirector: null,
            syncPoints: [],
            adaptationHistory: []
        };
        
        // Performance tracking
        this.performanceTracking = {
            currentSequence: null,
            activeMovements: [],
            spatialOccupancy: new Map(),
            movementEvents: [],
            adaptationResponses: []
        };
        
        // Integration with production system
        this.musicDirector = null;
        this.creativeDirector = null;
        this.lightingDesigner = null;
        this.currentProduction = null;
        
        console.log('💃 Choreographer Agent: Ready to create expressive movement and dance');
    }

    /**
     * Initialize Choreographer with system integration
     */
    async onInitialize() {
        try {
            console.log('💃 Choreographer: Initializing movement design systems...');
            
            // Connect to Ollama interface for AI choreography
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI choreography requires LLM assistance.');
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
            
            // Configure AI for choreography and movement
            this.ollamaInterface.updatePerformanceContext({
                role: 'choreographer',
                movement_style: this.movementStyle,
                creativity_mode: 'movement_choreography',
                specialization: 'theatrical_movement'
            });
            
            // Connect to related agents
            if (window.musicDirectorAgent) {
                this.musicDirector = window.musicDirectorAgent;
                this.musicalCoordination.musicDirector = this.musicDirector;
                console.log('💃 Choreographer: Connected to Music Director');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('💃 Choreographer: Connected to Creative Director');
            }
            
            if (window.lightingDesignerAgent) {
                this.lightingDesigner = window.lightingDesignerAgent;
                console.log('💃 Choreographer: Connected to Lighting Designer');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize movement systems
            await this.initializeMovementSystems();
            
            // Test choreography capabilities
            await this.testChoreographyCapabilities();
            
            console.log('💃 Choreographer: Ready to create compelling movement and dance!')
            
        } catch (error) {
            console.error('💃 Choreographer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI CHOREOGRAPHY:
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
     * Subscribe to production events for movement coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('music:tempo-change', (data) => this.onTempoChange(data));
            window.theaterEventBus.subscribe('music:scene-scored', (data) => this.onSceneScored(data));
            window.theaterEventBus.subscribe('performance:emotion-change', (data) => this.onEmotionChange(data));
            window.theaterEventBus.subscribe('stage:actor-movement', (data) => this.onActorMovement(data));
            window.theaterEventBus.subscribe('movement:sequence-needed', (data) => this.onSequenceNeeded(data));
            
            console.log('💃 Choreographer: Subscribed to movement coordination events');
        }
    }

    /**
     * Initialize movement systems
     */
    async initializeMovementSystems() {
        console.log('💃 Choreographer: Initializing movement coordination systems...');
        
        // Initialize stage pathways
        this.initializeStagePathways();
        
        // Initialize movement formations
        this.initializeMovementFormations();
        
        // Initialize character movement profiles
        this.initializeCharacterMovementProfiles();
        
        console.log('✅ Choreographer: Movement systems initialized');
    }

    /**
     * Initialize stage pathways for movement
     */
    initializeStagePathways() {
        // Define common stage pathways
        this.stageGeometry.pathways.set('cross_stage', {
            start: 'CSL',
            end: 'CSR', 
            type: 'linear',
            energy: 'assertive',
            visibility: 'high'
        });
        
        this.stageGeometry.pathways.set('upstage_sweep', {
            start: 'USL',
            end: 'USR',
            type: 'arc',
            energy: 'flowing',
            visibility: 'background'
        });
        
        this.stageGeometry.pathways.set('center_spiral', {
            start: 'USC',
            end: 'CS',
            type: 'spiral',
            energy: 'building',
            visibility: 'focus'
        });
        
        console.log('💃 Choreographer: Stage pathways initialized');
    }

    /**
     * Initialize movement formations
     */
    initializeMovementFormations() {
        // Define common formations
        this.stageGeometry.formations.set('line', {
            pattern: 'linear',
            spacing: 'even',
            facing: 'audience',
            energy: 'unified',
            applications: ['opening', 'closing', 'chorus']
        });
        
        this.stageGeometry.formations.set('circle', {
            pattern: 'circular',
            spacing: 'even',
            facing: 'inward',
            energy: 'intimate',
            applications: ['ritual', 'discussion', 'unity']
        });
        
        this.stageGeometry.formations.set('triangle', {
            pattern: 'triangular',
            spacing: 'hierarchical',
            facing: 'varied',
            energy: 'dynamic',
            applications: ['conflict', 'power', 'decision']
        });
        
        console.log('💃 Choreographer: Movement formations initialized');
    }

    /**
     * Initialize character movement profiles
     */
    initializeCharacterMovementProfiles() {
        // Basic character archetypes and their movement qualities
        const archetypeProfiles = {
            leader: { energy: 'strong', space: 'direct', time: 'sudden', flow: 'bound' },
            follower: { energy: 'light', space: 'indirect', time: 'sustained', flow: 'free' },
            rebel: { energy: 'strong', space: 'direct', time: 'sudden', flow: 'free' },
            wise: { energy: 'light', space: 'indirect', time: 'sustained', flow: 'bound' },
            lover: { energy: 'light', space: 'indirect', time: 'sustained', flow: 'free' }
        };
        
        // Store for character assignment
        this.characterMovementArchetypes = archetypeProfiles;
        
        console.log('💃 Choreographer: Character movement profiles initialized');
    }

    /**
     * Test choreography capabilities
     */
    async testChoreographyCapabilities() {
        try {
            const testPrompt = `
            As a choreographer, create a movement sequence for a theatrical scene.
            
            Scene context:
            - 3 characters in a tense confrontation
            - Emotional progression: suspicion → accusation → revelation
            - Stage space: center stage area
            - Music: building tension, 4/4 time, moderate tempo
            
            Provide:
            1. Overall movement concept for the scene
            2. Character positioning and spatial relationships
            3. Movement qualities for each character
            4. Key movement moments synchronized with emotional beats
            5. Musical coordination and rhythm integration
            6. Lighting integration opportunities
            
            Format as detailed choreography notes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 700
            });
            
            console.log('💃 Choreographer: Choreography capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('💃 Choreographer: Choreography capability test failed:', error);
            throw new Error(`Choreography test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('💃 Choreographer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize choreography project
        await this.initializeChoreographyProject(data.production);
        
        // Develop overall movement concept
        await this.developMovementConcept(data.production);
    }

    /**
     * Initialize choreography project
     */
    async initializeChoreographyProject(production) {
        console.log('💃 Choreographer: Initializing choreography project...');
        
        this.choreographyProject = {
            production: production,
            movementConcept: null,
            characterMovementProfiles: new Map(),
            choreographySequences: new Map(),
            blockingPlan: new Map(),
            musicalCoordination: null,
            status: 'concept_development',
            createdAt: new Date()
        };
        
        console.log('✅ Choreographer: Choreography project initialized');
    }

    /**
     * Develop overall movement concept
     */
    async developMovementConcept(production) {
        try {
            console.log('💃 Choreographer: Developing movement concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive movement and choreography concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall movement philosophy and aesthetic approach
                2. Character movement vocabulary and expression
                3. Spatial utilization and stage geography
                4. Musical integration and rhythmic coordination
                5. Emotional journey through physical expression
                6. Symbolic and metaphorical movement elements
                7. Practical considerations for performers
                8. Integration with lighting and design elements
                9. Audience engagement through movement
                10. Safety and feasibility of movement sequences
                
                Provide a detailed movement concept that will guide all choreographic decisions and support the narrative through expressive movement.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.choreographyProject.movementConcept = response.content;
                    this.choreographyProject.status = 'concept_complete';
                    
                    console.log('✅ Choreographer: Movement concept developed');
                    
                    // Extract movement principles from concept
                    await this.extractMovementPrinciples(response.content);
                    
                    // Share concept with production team
                    window.theaterEventBus?.publish('movement:concept-complete', {
                        production: production,
                        concept: response.content,
                        choreographer: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Choreographer: Concept development failed:', error.message);
            this.choreographyProject.status = 'concept_error';
        }
    }

    /**
     * Handle artistic vision from Creative Director
     */
    async onArtisticVisionReceived(data) {
        console.log('💃 Choreographer: Received artistic vision from Creative Director');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.adaptMovementToVision(data.vision);
        }
    }

    /**
     * Adapt movement concept to artistic vision
     */
    async adaptMovementToVision(artisticVision) {
        try {
            console.log('💃 Choreographer: Adapting movement to artistic vision...');
            
            const adaptationPrompt = `
            Adapt the movement and choreography concept to align with this artistic vision:
            
            Artistic Vision:
            ${artisticVision}
            
            Current Movement Concept:
            ${this.choreographyProject.movementConcept || 'To be developed'}
            
            Provide specific movement adaptations:
            1. How should the movement vocabulary support this vision?
            2. What choreographic qualities enhance the artistic goals?
            3. How can staging and blocking reinforce the vision?
            4. What movement dynamics align with the thematic elements?
            5. How should character movement reflect the artistic approach?
            6. What spatial choices support the overall aesthetic?
            
            Suggest concrete movement changes to embody the artistic vision.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                temperature: 0.8,
                max_tokens: 700
            });
            
            if (response && response.content) {
                this.choreographyProject.visionAdaptation = response.content;
                
                console.log('✅ Choreographer: Movement adapted to artistic vision');
                
                // Update movement principles based on adaptation
                await this.updateMovementPrinciples(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Choreographer: Vision adaptation failed:', error.message);
        }
    }

    /**
     * Handle tempo changes from music
     */
    async onTempoChange(data) {
        console.log('💃 Choreographer: Tempo change detected -', data.tempo);
        
        await this.adaptMovementToTempo(data.tempo, data.signature);
    }

    /**
     * Adapt movement to musical tempo
     */
    async adaptMovementToTempo(tempo, signature) {
        try {
            console.log(`💃 Choreographer: Adapting movement to ${tempo} BPM, ${signature}...`);
            
            this.musicalCoordination.currentTempo = tempo;
            this.musicalCoordination.currentSignature = signature;
            
            // Calculate movement timing based on tempo
            const movementTiming = this.calculateMovementTiming(tempo, signature);
            
            // Generate movement adaptation
            const adaptationPrompt = `
            Adapt current movement sequences to new musical parameters:
            
            New Tempo: ${tempo} BPM
            Time Signature: ${signature}
            Previous Tempo: ${this.musicalCoordination.currentTempo || 'Not set'}
            
            Current Movement Style: ${this.movementStyle}
            Active Sequences: ${this.performanceTracking.activeMovements.length}
            
            Provide movement adaptations:
            1. How should movement rhythm change for this tempo?
            2. What movement qualities best match this musical feel?
            3. How should spatial patterns adapt to the new rhythm?
            4. What coordination techniques ensure musical synchronization?
            5. How can movement transitions align with musical phrases?
            
            Keep adaptations practical for real-time execution.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                temperature: 0.7,
                max_tokens: 500,
                timeout: 10000
            });
            
            if (response && response.content) {
                this.musicalCoordination.adaptationHistory.push({
                    tempo: tempo,
                    signature: signature,
                    adaptation: response.content,
                    timestamp: new Date()
                });
                
                console.log('✅ Choreographer: Movement adapted to musical tempo');
                
                // Apply real-time movement adjustments
                await this.applyMovementAdjustments(response.content, movementTiming);
            }
            
        } catch (error) {
            console.warn('⚠️ Choreographer: Tempo adaptation failed:', error.message);
        }
    }

    /**
     * Handle scene scoring from music director
     */
    async onSceneScored(data) {
        console.log('💃 Choreographer: Scene scored by Music Director -', data.scene.scene);
        
        if (data.scene.production?.id === this.currentProduction?.id) {
            await this.choreographScene(data.scene, data.music);
        }
    }

    /**
     * Choreograph a specific scene
     */
    async choreographScene(scene, musicData) {
        try {
            console.log(`💃 Choreographer: Choreographing scene ${scene.scene}...`);
            
            const choreographyPrompt = `
            Create choreography for this theatrical scene:
            
            Scene: ${scene.scene}
            Content: ${scene.content?.substring(0, 600)}...
            
            Musical Context:
            ${musicData?.composition || 'No specific music data provided'}
            
            Choreography Requirements:
            1. Analyze character relationships and emotional dynamics
            2. Design blocking that supports the narrative
            3. Create movement sequences for key dramatic moments
            4. Coordinate movement with musical elements
            5. Utilize stage space effectively for visual impact
            6. Ensure movement serves character development
            7. Consider lighting integration opportunities
            8. Plan transitions and movement flow
            
            Provide detailed choreography and blocking notes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(choreographyPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 1000,
                timeout: 45000
            });
            
            if (response && response.content) {
                const sceneChoreography = {
                    scene: scene.scene,
                    choreography: response.content,
                    movements: await this.extractMovements(response.content),
                    musicalSync: musicData ? await this.extractMusicalSyncPoints(response.content) : [],
                    choreographedAt: new Date(),
                    status: 'choreographed'
                };
                
                this.choreographyProject.choreographySequences.set(scene.scene, sceneChoreography);
                
                console.log(`✅ Choreographer: Scene ${scene.scene} choreographed`);
                
                // Notify production team
                window.theaterEventBus?.publish('movement:scene-choreographed', {
                    scene: scene,
                    choreography: sceneChoreography,
                    choreographer: this.config.name
                });
                
                return sceneChoreography;
            }
            
        } catch (error) {
            console.error(`💃 Choreographer: Scene choreography failed for ${scene.scene}:`, error);
            return null;
        }
    }

    /**
     * Handle emotion changes during performance
     */
    async onEmotionChange(data) {
        console.log('💃 Choreographer: Emotion change detected -', data.emotion);
        
        await this.adaptMovementToEmotion(data.emotion, data.intensity || 0.5);
    }

    /**
     * Adapt movement to emotional state
     */
    async adaptMovementToEmotion(emotion, intensity) {
        try {
            console.log(`💃 Choreographer: Adapting movement to ${emotion} (intensity: ${intensity})...`);
            
            // Get movement qualities for emotion
            const emotionalMovement = this.getEmotionalMovementQualities(emotion, intensity);
            
            // Generate movement adaptation
            const adaptationPrompt = `
            Adapt current movement to express this emotional state:
            
            Emotion: ${emotion}
            Intensity: ${intensity}
            
            Current Movement Context:
            - Active movements: ${this.performanceTracking.activeMovements.length}
            - Stage occupancy: ${this.performanceTracking.spatialOccupancy.size} areas
            - Movement style: ${this.movementStyle}
            
            Suggested Movement Qualities:
            - Energy: ${emotionalMovement.energy}
            - Space: ${emotionalMovement.space}
            - Time: ${emotionalMovement.time}
            - Flow: ${emotionalMovement.flow}
            
            Provide specific movement adaptations:
            1. How should movement quality change to express this emotion?
            2. What spatial adjustments enhance emotional expression?
            3. How should movement rhythm reflect the emotional intensity?
            4. What gestural elements support the emotional state?
            5. How can movement transitions convey emotional shifts?
            
            Keep adaptations practical for real-time performance.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                temperature: 0.8,
                max_tokens: 500,
                timeout: 10000
            });
            
            if (response && response.content) {
                this.performanceTracking.adaptationResponses.push({
                    emotion: emotion,
                    intensity: intensity,
                    adaptation: response.content,
                    timestamp: new Date()
                });
                
                console.log('✅ Choreographer: Movement adapted to emotional state');
                
                // Apply movement adjustments
                await this.applyEmotionalMovementAdjustments(response.content, emotionalMovement);
            }
            
        } catch (error) {
            console.warn('⚠️ Choreographer: Emotional adaptation failed:', error.message);
        }
    }

    /**
     * Handle sequence requests
     */
    async onSequenceNeeded(data) {
        console.log('💃 Choreographer: Movement sequence requested -', data.sequenceType);
        
        await this.generateMovementSequence(data.sequenceType, data.parameters, data.urgency);
    }

    /**
     * Generate specific movement sequence
     */
    async generateMovementSequence(sequenceType, parameters, urgency) {
        try {
            console.log(`💃 Choreographer: Generating ${sequenceType} sequence...`);
            
            const sequencePrompt = `
            Generate a movement sequence for this request:
            
            Sequence Type: ${sequenceType}
            Parameters: ${JSON.stringify(parameters)}
            Urgency: ${urgency}
            
            Context:
            - Production: ${this.currentProduction?.title}
            - Movement style: ${this.movementStyle}
            - Current tempo: ${this.musicalCoordination.currentTempo} BPM
            - Available stage areas: ${Object.keys(this.stageGeometry.areas).join(', ')}
            
            Provide detailed sequence:
            1. Sequence structure and progression
            2. Movement vocabulary and qualities
            3. Spatial positioning and pathways
            4. Timing and musical coordination
            5. Character roles and relationships
            6. Performance notes and cues
            
            Make the sequence theatrically effective and safe to execute.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(sequencePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 700,
                timeout: urgency === 'urgent' ? 10000 : 25000
            });
            
            if (response && response.content) {
                const movementSequence = {
                    type: sequenceType,
                    parameters: parameters,
                    sequence: response.content,
                    generatedAt: new Date(),
                    urgency: urgency
                };
                
                this.performanceTracking.currentSequence = movementSequence;
                this.performanceTracking.movementEvents.push(movementSequence);
                
                console.log(`✅ Choreographer: ${sequenceType} sequence generated`);
                
                // Execute sequence if urgent
                if (urgency === 'urgent') {
                    await this.executeMovementSequence(movementSequence);
                }
                
                return movementSequence;
            }
            
        } catch (error) {
            console.error(`💃 Choreographer: Sequence generation failed for ${sequenceType}:`, error);
            return null;
        }
    }

    /**
     * Get emotional movement qualities
     */
    getEmotionalMovementQualities(emotion, intensity) {
        const emotionalMappings = {
            joy: { energy: 'light', space: 'indirect', time: 'quick', flow: 'free' },
            sadness: { energy: 'light', space: 'direct', time: 'sustained', flow: 'bound' },
            anger: { energy: 'strong', space: 'direct', time: 'sudden', flow: 'bound' },
            fear: { energy: 'light', space: 'indirect', time: 'sudden', flow: 'bound' },
            love: { energy: 'light', space: 'indirect', time: 'sustained', flow: 'free' },
            tension: { energy: 'strong', space: 'direct', time: 'sudden', flow: 'bound' }
        };
        
        const baseQualities = emotionalMappings[emotion] || emotionalMappings.joy;
        
        // Adjust for intensity
        return {
            energy: intensity > 0.7 ? 'strong' : baseQualities.energy,
            space: baseQualities.space,
            time: intensity > 0.7 ? 'sudden' : baseQualities.time,
            flow: baseQualities.flow
        };
    }

    /**
     * Calculate movement timing from tempo
     */
    calculateMovementTiming(tempo, signature) {
        const beatsPerSecond = tempo / 60;
        const measuresPerMinute = tempo / parseInt(signature.split('/')[0]);
        
        return {
            beatDuration: 1000 / beatsPerSecond,
            measureDuration: 60000 / measuresPerMinute,
            phraseLength: 4, // 4-measure phrases
            phrasePattern: [1, 0.5, 0.75, 0.25] // rhythmic emphasis pattern
        };
    }

    /**
     * Extract movements from choreography text
     */
    async extractMovements(choreographyText) {
        // Simplified extraction - would use more sophisticated parsing
        return [
            { type: 'entrance', timing: '0:00', position: 'USL', quality: 'strong' },
            { type: 'gesture', timing: '0:15', position: 'CS', quality: 'expressive' },
            { type: 'transition', timing: '0:30', position: 'DSR', quality: 'flowing' }
        ];
    }

    /**
     * Get choreography status
     */
    getChoreographyStatus() {
        return {
            currentProject: {
                active: !!this.choreographyProject.production,
                title: this.choreographyProject.production?.title,
                status: this.choreographyProject.status,
                conceptComplete: !!this.choreographyProject.movementConcept,
                scenesChoreographed: this.choreographyProject.choreographySequences.size
            },
            musicalCoordination: {
                musicDirectorConnected: !!this.musicDirector,
                currentTempo: this.musicalCoordination.currentTempo,
                syncPoints: this.musicalCoordination.syncPoints.length,
                adaptations: this.musicalCoordination.adaptationHistory.length
            },
            performance: {
                currentSequence: this.performanceTracking.currentSequence?.type,
                activeMovements: this.performanceTracking.activeMovements.length,
                spatialOccupancy: this.performanceTracking.spatialOccupancy.size,
                adaptationResponses: this.performanceTracking.adaptationResponses.length
            },
            capabilities: this.movementCapabilities,
            stage: {
                areasAvailable: Object.keys(this.stageGeometry.areas).length,
                pathwaysMapping: this.stageGeometry.pathways.size,
                formationsReady: this.stageGeometry.formations.size
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('💃 Choreographer: Concluding movement and choreography session...');
        
        // Finalize choreography project
        if (this.choreographyProject.status !== 'idle') {
            this.choreographyProject.status = 'completed';
            this.choreographyProject.completedAt = new Date();
        }
        
        // Clear active movements
        this.performanceTracking.activeMovements = [];
        this.performanceTracking.spatialOccupancy.clear();
        
        // Generate choreography summary
        if (this.currentProduction) {
            const choreographySummary = this.generateChoreographySummary();
            console.log('💃 Choreographer: Choreography summary generated');
        }
        
        console.log('💃 Choreographer: Movement and choreography concluded');
    }

    /**
     * Generate choreography summary
     */
    generateChoreographySummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            choreography: {
                conceptDeveloped: !!this.choreographyProject.movementConcept,
                scenesChoreographed: this.choreographyProject.choreographySequences.size,
                sequencesGenerated: this.performanceTracking.movementEvents.length,
                characterProfilesCreated: this.choreographyProject.characterMovementProfiles.size
            },
            musicalIntegration: {
                tempoAdaptations: this.musicalCoordination.adaptationHistory.length,
                syncPointsCreated: this.musicalCoordination.syncPoints.length,
                musicDirectorCollaboration: !!this.musicDirector
            },
            performance: {
                emotionalAdaptations: this.performanceTracking.adaptationResponses.length,
                realTimeSequences: this.performanceTracking.movementEvents.filter(e => e.urgency === 'urgent').length,
                spatialUtilization: this.calculateSpatialUtilization()
            }
        };
    }

    /**
     * Calculate spatial utilization
     */
    calculateSpatialUtilization() {
        const totalAreas = Object.keys(this.stageGeometry.areas).length;
        const usedAreas = this.performanceTracking.spatialOccupancy.size;
        return totalAreas > 0 ? (usedAreas / totalAreas) * 100 : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChoreographerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.ChoreographerAgent = ChoreographerAgent;
    console.log('💃 Choreographer Agent loaded - Ready for expressive movement and dance');
}