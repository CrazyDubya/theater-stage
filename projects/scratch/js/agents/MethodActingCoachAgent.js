/**
 * MethodActingCoachAgent.js - AI-Powered Deep Performance Training
 * 
 * The Method Acting Coach Agent uses Ollama LLM to guide performers in developing
 * authentic, emotionally truthful performances through method acting techniques.
 * Focuses on character psychology, emotional memory, and immersive preparation.
 * 
 * Features:
 * - AI-driven method acting training and guidance
 * - Character psychology development and analysis
 * - Emotional memory and sense memory exercises
 * - Improvisation and spontaneity training
 * - Real-time performance depth coaching
 * - Integration with script analysis and character development
 */

class MethodActingCoachAgent extends BaseAgent {
    constructor(config = {}) {
        super('method-acting-coach', {
            name: 'Method Acting Coach',
            role: 'method-acting-coach',
            priority: 75, // High priority for performance depth
            maxActionsPerSecond: 4,
            personality: config.personality || 'intuitive',
            ...config
        });
        
        // Method Acting Coach specific properties
        this.ollamaInterface = null;
        this.coachingPhilosophy = config.philosophy || 'stanislavski-based';
        this.creativityLevel = config.creativity || 0.8;
        
        // Method acting capabilities
        this.methodCapabilities = {
            characterAnalysis: {
                psychologicalProfile: true,
                motivationMapping: true,
                objectiveIdentification: true,
                obstacleAnalysis: true,
                relationshipDynamics: true
            },
            emotionalWork: {
                emotionalMemory: true,
                affectiveMemory: true,
                sensoryWork: true,
                substitution: true,
                emotionalPreparation: true
            },
            physicalWork: {
                animalStudy: true,
                physicalCharacterization: true,
                gestureWork: true,
                postureAdaptation: true,
                movementPsychology: true
            },
            improvisationTraining: {
                spontaneityExercises: true,
                momentToMoment: true,
                listeningAndReacting: true,
                truthfulMoments: true,
                ensembleWork: true
            },
            sceneWork: {
                beatAnalysis: true,
                actionIdentification: true,
                givenCircumstances: true,
                magicIf: true,
                adaptationCoaching: true
            }
        };
        
        // Current coaching project
        this.coachingProject = {
            production: null,
            performerProfiles: new Map(),
            characterAnalyses: new Map(),
            emotionalExercises: new Map(),
            sceneWork: new Map(),
            progressTracking: new Map(),
            status: 'idle'
        };
        
        // Method acting techniques library
        this.methodTechniques = {
            stanislavski: {
                emotionalMemory: {
                    description: 'Using personal memories to create authentic emotion',
                    exercise: 'Recall a specific moment when you felt the target emotion',
                    application: 'Character emotional states'
                },
                physicalActions: {
                    description: 'Creating truthful physical behavior',
                    exercise: 'Simple realistic tasks with obstacles',
                    application: 'Authentic stage behavior'
                },
                givenCircumstances: {
                    description: 'Understanding the complete world of the character',
                    exercise: 'Who, what, where, when, why analysis',
                    application: 'Character context and reality'
                },
                magicIf: {
                    description: 'What would I do if I were in this situation?',
                    exercise: 'Personal connection to character circumstances',
                    application: 'Believable character choices'
                }
            },
            strasberg: {
                sensoryWork: {
                    description: 'Developing sense memory for authentic reactions',
                    exercise: 'Recreating sensory experiences without stimuli',
                    application: 'Physical and emotional reality'
                },
                animalWork: {
                    description: 'Using animal studies for character physicality',
                    exercise: 'Observe and embody animal characteristics',
                    application: 'Physical character transformation'
                },
                privateMovement: {
                    description: 'Personal physical and emotional preparation',
                    exercise: 'Individual warm-up and character connection',
                    application: 'Pre-performance preparation'
                }
            },
            meisner: {
                repetition: {
                    description: 'Developing authentic listening and reacting',
                    exercise: 'Word repetition with spontaneous variations',
                    application: 'Truthful moment-to-moment work'
                },
                emotionalPreparation: {
                    description: 'Bringing personal emotional life to the role',
                    exercise: 'Using substitution and preparation',
                    application: 'Authentic emotional availability'
                },
                improvisation: {
                    description: 'Spontaneous truthful behavior',
                    exercise: 'Unscripted scenarios with objectives',
                    application: 'Alive and spontaneous performance'
                }
            }
        };
        
        // Character analysis framework
        this.characterAnalysisFramework = {
            biography: {
                personal_history: 'Life events that shaped the character',
                relationships: 'Key relationships and their impact',
                traumas_triumphs: 'Formative experiences',
                secrets: 'Hidden aspects and motivations'
            },
            psychology: {
                personality_type: 'Core personality characteristics',
                defense_mechanisms: 'How character protects themselves',
                fears_desires: 'Deep psychological drivers',
                world_view: 'How character sees reality'
            },
            objectives: {
                super_objective: 'Overall life goal/driving need',
                scene_objectives: 'What character wants in each scene',
                beat_objectives: 'Moment-to-moment wants',
                obstacles: 'What prevents achievement of objectives'
            },
            relationships: {
                status_dynamics: 'Power relationships with other characters',
                emotional_connections: 'Quality of relationships',
                history: 'Shared experiences with other characters',
                current_state: 'Present relationship dynamics'
            }
        };
        
        // Emotional work tracking
        this.emotionalWork = {
            emotionalRangeAssessment: new Map(),
            personalEmotionalConnections: new Map(),
            substitutionWork: new Map(),
            emotionalMemoryBank: new Map()
        };
        
        // Scene work tracking
        this.sceneWorkTracking = {
            beatAnalyses: new Map(),
            actionWork: new Map(),
            momentToMomentCoaching: new Map(),
            improvisationSessions: new Map()
        };
        
        // Performance development tracking
        this.performanceDevelopment = {
            authenticityAssessments: [],
            depthProgression: new Map(),
            breakthroughMoments: [],
            challengeAreas: new Map()
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.aiPlaywright = null;
        this.currentProduction = null;
        
        console.log('🎭 Method Acting Coach Agent: Ready to guide deep, authentic performances');
    }

    /**
     * Initialize Method Acting Coach with system integration
     */
    async onInitialize() {
        try {
            console.log('🎭 Method Acting Coach: Initializing performance depth training...');
            
            // Connect to Ollama interface for AI coaching
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI method coaching requires LLM assistance.');
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
            
            // Configure AI for method acting coaching
            this.ollamaInterface.updatePerformanceContext({
                role: 'method_acting_coach',
                philosophy: this.coachingPhilosophy,
                creativity_mode: 'emotional_depth_coaching',
                specialization: 'character_psychology'
            });
            
            // Connect to related agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎭 Method Acting Coach: Connected to Creative Director');
            }
            
            if (window.aiPlaywrightAgent) {
                this.aiPlaywright = window.aiPlaywrightAgent;
                console.log('🎭 Method Acting Coach: Connected to AI Playwright');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize coaching systems
            await this.initializeCoachingSystems();
            
            // Test method coaching capabilities
            await this.testMethodCoachingCapabilities();
            
            console.log('🎭 Method Acting Coach: Ready to unlock authentic performances!')
            
        } catch (error) {
            console.error('🎭 Method Acting Coach: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI METHOD COACHING:
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
     * Subscribe to production events for method coaching
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('script:character-profiles', (data) => this.onCharacterProfilesReceived(data));
            window.theaterEventBus.subscribe('rehearsal:depth-needed', (data) => this.onDepthNeeded(data));
            window.theaterEventBus.subscribe('performance:authenticity-issue', (data) => this.onAuthenticityIssue(data));
            window.theaterEventBus.subscribe('method:emotional-work-request', (data) => this.onEmotionalWorkRequested(data));
            window.theaterEventBus.subscribe('scene:analysis-needed', (data) => this.onSceneAnalysisNeeded(data));
            
            console.log('🎭 Method Acting Coach: Subscribed to performance depth events');
        }
    }

    /**
     * Initialize coaching systems
     */
    async initializeCoachingSystems() {
        console.log('🎭 Method Acting Coach: Initializing coaching systems...');
        
        // Initialize exercise library
        this.initializeExerciseLibrary();
        
        // Initialize assessment criteria
        this.initializeAssessmentCriteria();
        
        // Initialize character analysis tools
        this.initializeCharacterAnalysisTools();
        
        console.log('✅ Method Acting Coach: Coaching systems initialized');
    }

    /**
     * Initialize exercise library
     */
    initializeExerciseLibrary() {
        this.exerciseLibrary = {
            beginnerLevel: {
                relaxation: 'Progressive muscle relaxation for stage readiness',
                concentration: 'Object focus and attention exercises',
                sensoryWork: 'Basic five senses awareness',
                emotionalRecall: 'Simple emotional memory exercises'
            },
            intermediateLevel: {
                characterPhysicality: 'Animal studies and physical transformation',
                emotionalMemory: 'Advanced emotional substitution work',
                improvisation: 'Spontaneous scene work',
                objectiveWork: 'Clear intention and obstacle work'
            },
            advancedLevel: {
                complexEmotions: 'Layered emotional work and contradiction',
                ensembleWork: 'Advanced relationship dynamics',
                textualAnalysis: 'Deep script and subtext exploration',
                performanceIntegration: 'Method technique in performance'
            }
        };
        
        console.log('🎭 Method Acting Coach: Exercise library initialized');
    }

    /**
     * Initialize assessment criteria
     */
    initializeAssessmentCriteria() {
        this.assessmentCriteria = {
            authenticity: {
                truthfulness: { weight: 0.30, scale: [1, 10] },
                believability: { weight: 0.25, scale: [1, 10] },
                spontaneity: { weight: 0.25, scale: [1, 10] },
                emotional_honesty: { weight: 0.20, scale: [1, 10] }
            },
            technique: {
                concentration: { weight: 0.25, scale: [1, 10] },
                relaxation: { weight: 0.20, scale: [1, 10] },
                sensory_work: { weight: 0.25, scale: [1, 10] },
                emotional_preparation: { weight: 0.30, scale: [1, 10] }
            },
            characterization: {
                psychology_depth: { weight: 0.35, scale: [1, 10] },
                physical_truth: { weight: 0.25, scale: [1, 10] },
                objective_clarity: { weight: 0.25, scale: [1, 10] },
                relationship_reality: { weight: 0.15, scale: [1, 10] }
            }
        };
        
        console.log('🎭 Method Acting Coach: Assessment criteria initialized');
    }

    /**
     * Initialize character analysis tools
     */
    initializeCharacterAnalysisTools() {
        this.analysisTools = {
            biographyBuilder: (character) => this.buildCharacterBiography(character),
            psychologyMapper: (character) => this.mapCharacterPsychology(character),
            objectiveIdentifier: (scene, character) => this.identifyObjectives(scene, character),
            relationshipAnalyzer: (characters) => this.analyzeRelationships(characters)
        };
        
        console.log('🎭 Method Acting Coach: Character analysis tools initialized');
    }

    /**
     * Test method coaching capabilities
     */
    async testMethodCoachingCapabilities() {
        try {
            const testPrompt = `
            As a method acting coach, guide a performer in developing a complex character.
            
            Character scenario:
            - Character: A middle-aged parent struggling with their teenager
            - Scene context: Confronting their child about a serious mistake
            - Emotional challenge: Balancing anger, disappointment, and love
            - Performance issue: Actor is playing general emotions rather than specific ones
            
            Provide method coaching guidance:
            1. Character psychology analysis for this specific moment
            2. Emotional memory exercises to access authentic feelings
            3. Physical actions to create truthful behavior
            4. Objective and obstacle work for this scene
            5. Substitution suggestions for personal connection
            6. Improvisation exercises to explore the relationship
            
            Format as practical method acting coaching session.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🎭 Method Acting Coach: Coaching capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎭 Method Acting Coach: Coaching capability test failed:', error);
            throw new Error(`Method coaching test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎭 Method Acting Coach: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize coaching project
        await this.initializeCoachingProject(data.production);
        
        // Develop method approach for production
        await this.developMethodApproach(data.production);
    }

    /**
     * Initialize coaching project
     */
    async initializeCoachingProject(production) {
        console.log('🎭 Method Acting Coach: Initializing coaching project...');
        
        this.coachingProject = {
            production: production,
            performerProfiles: new Map(),
            characterAnalyses: new Map(),
            emotionalExercises: new Map(),
            sceneWork: new Map(),
            progressTracking: new Map(),
            status: 'assessment_phase',
            createdAt: new Date()
        };
        
        // Analyze production method requirements
        await this.analyzeProductionMethodRequirements(production);
        
        console.log('✅ Method Acting Coach: Coaching project initialized');
    }

    /**
     * Develop method approach for production
     */
    async developMethodApproach(production) {
        try {
            console.log('🎭 Method Acting Coach: Developing method approach...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const approachPrompt = `
                Develop a comprehensive method acting approach for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall method philosophy best suited for this production
                2. Character depth and psychological complexity requirements
                3. Emotional demands and preparation strategies
                4. Specific method techniques for this genre/style
                5. Performer assessment and individual coaching needs
                6. Scene work and relationship development priorities
                7. Integration with director's vision and script analysis
                8. Rehearsal process and method technique application
                9. Performance sustainability and emotional health
                10. Ensemble work and group dynamic considerations
                
                Provide a detailed method coaching plan that will deepen all performances and create authentic, compelling characters.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(approachPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.coachingProject.methodApproach = response.content;
                    this.coachingProject.status = 'approach_complete';
                    
                    console.log('✅ Method Acting Coach: Method approach developed');
                    
                    // Extract coaching priorities from approach
                    await this.extractCoachingPriorities(response.content);
                    
                    // Share approach with production team
                    window.theaterEventBus?.publish('method:approach-complete', {
                        production: production,
                        approach: response.content,
                        methodCoach: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Method Acting Coach: Approach development failed:', error.message);
            this.coachingProject.status = 'approach_error';
        }
    }

    /**
     * Handle character profiles from script
     */
    async onCharacterProfilesReceived(data) {
        console.log('🎭 Method Acting Coach: Received character profiles from script');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.analyzeCharactersForMethod(data.characters);
        }
    }

    /**
     * Analyze characters for method acting work
     */
    async analyzeCharactersForMethod(characters) {
        console.log('🎭 Method Acting Coach: Analyzing characters for method work...');
        
        for (const character of characters) {
            await this.createCharacterMethodAnalysis(character);
        }
    }

    /**
     * Create comprehensive character method analysis
     */
    async createCharacterMethodAnalysis(character) {
        try {
            console.log(`🎭 Method Acting Coach: Creating method analysis for ${character.name}...`);
            
            const analysisPrompt = `
            Create a comprehensive method acting analysis for this character:
            
            Character: ${character.name}
            Description: ${character.description || 'No description provided'}
            Personality: ${character.personality || 'To be determined'}
            Role: ${character.role || 'Supporting'}
            Background: ${character.background || 'General'}
            
            Production Context:
            Type: ${this.currentProduction.type}
            Method Approach: ${this.coachingProject.methodApproach || 'To be developed'}
            
            Provide detailed method analysis:
            1. Character biography and psychological foundation
            2. Super-objective and driving need analysis
            3. Key relationships and their psychological impact
            4. Emotional landscape and memory work requirements
            5. Physical characteristics and embodiment needs
            6. Specific method techniques for this character
            7. Potential emotional preparation strategies
            8. Scene objectives and obstacle identification
            9. Substitution and personalization opportunities
            10. Character arc and transformation requirements
            
            Format as comprehensive method acting character study.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 1000,
                timeout: 45000
            });
            
            if (response && response.content) {
                const characterAnalysis = {
                    character: character,
                    methodAnalysis: response.content,
                    coachingPriorities: await this.extractCoachingPriorities(response.content),
                    exerciseRecommendations: await this.extractExerciseRecommendations(response.content),
                    analyzedAt: new Date(),
                    status: 'analyzed'
                };
                
                this.coachingProject.characterAnalyses.set(character.name, characterAnalysis);
                
                console.log(`✅ Method Acting Coach: Character analysis complete for ${character.name}`);
                
                // Create coaching plan for this character
                if (character.performer) {
                    await this.createCharacterCoachingPlan(character, characterAnalysis);
                }
                
                // Notify production team
                window.theaterEventBus?.publish('method:character-analysis-ready', {
                    character: character,
                    analysis: characterAnalysis,
                    methodCoach: this.config.name
                });
                
                return characterAnalysis;
            }
            
        } catch (error) {
            console.error(`🎭 Method Acting Coach: Character analysis failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Handle depth needed requests
     */
    async onDepthNeeded(data) {
        console.log('🎭 Method Acting Coach: Performance depth needed -', data.area);
        
        await this.provideDepthCoaching(data.area, data.performer, data.scene, data.urgency || 'normal');
    }

    /**
     * Provide depth coaching for specific area
     */
    async provideDepthCoaching(area, performer, scene, urgency) {
        try {
            console.log(`🎭 Method Acting Coach: Providing ${area} depth coaching for ${performer}...`);
            
            const depthPrompt = `
            Provide method acting coaching to deepen this specific performance area:
            
            Area Needing Depth: ${area}
            Performer: ${performer}
            Scene Context: ${scene || 'General performance'}
            Urgency: ${urgency}
            
            Current Context:
            - Production: ${this.currentProduction?.title}
            - Method Approach: ${this.coachingProject.methodApproach}
            - Available techniques: ${Object.keys(this.methodTechniques).join(', ')}
            
            Provide specific method coaching:
            1. What's missing in the current performance of this area?
            2. Which method techniques best address this need?
            3. Specific exercises to deepen this area immediately
            4. Emotional or physical preparation recommendations
            5. How can the performer personalize this moment?
            6. What substitutions might help access authentic feeling?
            
            Keep coaching practical and immediately applicable for ${urgency} implementation.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(depthPrompt, {
                temperature: 0.8,
                max_tokens: 600,
                timeout: urgency === 'urgent' ? 8000 : 20000
            });
            
            if (response && response.content) {
                const depthCoaching = {
                    area: area,
                    performer: performer,
                    scene: scene,
                    urgency: urgency,
                    coaching: response.content,
                    providedAt: new Date()
                };
                
                this.performanceDevelopment.authenticityAssessments.push(depthCoaching);
                
                console.log('✅ Method Acting Coach: Depth coaching provided');
                
                // Implement coaching if urgent
                if (urgency === 'urgent') {
                    await this.implementUrgentDepthWork(depthCoaching);
                }
                
                return depthCoaching;
            }
            
        } catch (error) {
            console.error(`🎭 Method Acting Coach: Depth coaching failed for ${area}:`, error);
            return null;
        }
    }

    /**
     * Handle authenticity issues
     */
    async onAuthenticityIssue(data) {
        console.log('🎭 Method Acting Coach: Authenticity issue detected -', data.issue);
        
        await this.addressAuthenticityIssue(data.issue, data.performer, data.moment);
    }

    /**
     * Address specific authenticity issue
     */
    async addressAuthenticityIssue(issue, performer, moment) {
        console.log(`🎭 Method Acting Coach: Addressing authenticity issue for ${performer}...`);
        
        const authenticityStrategies = {
            generalEmotion: 'Focus on specific circumstances and personal connection',
            indication: 'Stop showing emotion, start experiencing moment-to-moment',
            tension: 'Use relaxation and concentration exercises',
            disconnection: 'Apply substitution and emotional preparation techniques'
        };
        
        const strategy = authenticityStrategies[issue] || 'General method technique application';
        
        // Create authenticity coaching plan
        const authenticityPlan = {
            issue: issue,
            performer: performer,
            moment: moment,
            strategy: strategy,
            exercises: this.selectAuthenticityExercises(issue),
            createdAt: new Date()
        };
        
        this.performanceDevelopment.challengeAreas.set(performer, authenticityPlan);
        
        // Notify production team
        window.theaterEventBus?.publish('method:authenticity-plan-ready', {
            plan: authenticityPlan,
            methodCoach: this.config.name
        });
    }

    /**
     * Handle emotional work requests
     */
    async onEmotionalWorkRequested(data) {
        console.log('🎭 Method Acting Coach: Emotional work requested -', data.emotionType);
        
        await this.designEmotionalWork(data.emotionType, data.performer, data.character, data.context);
    }

    /**
     * Design specific emotional work
     */
    async designEmotionalWork(emotionType, performer, character, context) {
        try {
            console.log(`🎭 Method Acting Coach: Designing ${emotionType} work for ${performer}...`);
            
            const emotionalPrompt = `
            Design specific emotional method work for this performer and character:
            
            Emotion Type: ${emotionType}
            Performer: ${performer}
            Character: ${character}
            Context: ${context}
            
            Character Analysis Available: ${this.coachingProject.characterAnalyses.has(character) ? 'Yes' : 'No'}
            
            Provide detailed emotional method work:
            1. Analysis of this emotion within the character's psychology
            2. Emotional memory exercises specific to this emotion
            3. Substitution techniques for personal connection
            4. Physical actions that support this emotional state
            5. Sense memory work that might unlock this emotion
            6. Preparation exercises for accessing this emotion
            7. Safety considerations and emotional health
            8. Integration with scene objectives and circumstances
            
            Ensure the work serves both authenticity and performer wellbeing.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(emotionalPrompt, {
                temperature: 0.8,
                max_tokens: 700,
                timeout: 30000
            });
            
            if (response && response.content) {
                const emotionalWork = {
                    emotionType: emotionType,
                    performer: performer,
                    character: character,
                    context: context,
                    exercises: response.content,
                    createdAt: new Date()
                };
                
                this.coachingProject.emotionalExercises.set(`${performer}_${emotionType}`, emotionalWork);
                
                console.log(`✅ Method Acting Coach: ${emotionType} work designed for ${performer}`);
                
                return emotionalWork;
            }
            
        } catch (error) {
            console.error(`🎭 Method Acting Coach: Emotional work design failed for ${emotionType}:`, error);
            return null;
        }
    }

    /**
     * Handle scene analysis requests
     */
    async onSceneAnalysisNeeded(data) {
        console.log('🎭 Method Acting Coach: Scene analysis requested -', data.scene);
        
        await this.analyzeSceneForMethod(data.scene, data.characters, data.objectives);
    }

    /**
     * Analyze scene for method acting work
     */
    async analyzeSceneForMethod(scene, characters, objectives) {
        try {
            console.log(`🎭 Method Acting Coach: Analyzing scene for method work...`);
            
            const scenePrompt = `
            Provide method acting analysis for this scene:
            
            Scene: ${scene}
            Characters: ${characters.join(', ')}
            Stated Objectives: ${objectives || 'To be determined'}
            
            Production: ${this.currentProduction?.title}
            Available Character Analyses: ${characters.filter(c => this.coachingProject.characterAnalyses.has(c)).join(', ')}
            
            Provide comprehensive scene method analysis:
            1. Beat-by-beat breakdown with emotional objectives
            2. Relationship dynamics and status changes
            3. Subtext and unspoken objectives
            4. Physical actions and psychological gestures
            5. Emotional journey for each character
            6. Key obstacles and tactics for overcoming them
            7. Given circumstances specific to this scene
            8. Improvisation opportunities for exploration
            9. Substitution and personalization suggestions
            10. Rehearsal process and method technique application
            
            Focus on creating authentic, lived-in moments between characters.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(scenePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 1000,
                timeout: 45000
            });
            
            if (response && response.content) {
                const sceneAnalysis = {
                    scene: scene,
                    characters: characters,
                    analysis: response.content,
                    beatWork: await this.extractBeatWork(response.content),
                    relationshipWork: await this.extractRelationshipWork(response.content),
                    analyzedAt: new Date()
                };
                
                this.coachingProject.sceneWork.set(scene, sceneAnalysis);
                
                console.log(`✅ Method Acting Coach: Scene analysis complete`);
                
                // Notify production team
                window.theaterEventBus?.publish('method:scene-analysis-ready', {
                    scene: scene,
                    analysis: sceneAnalysis,
                    methodCoach: this.config.name
                });
                
                return sceneAnalysis;
            }
            
        } catch (error) {
            console.error(`🎭 Method Acting Coach: Scene analysis failed:`, error);
            return null;
        }
    }

    /**
     * Extract coaching priorities from analysis
     */
    async extractCoachingPriorities(analysisContent) {
        // Simplified extraction - would use AI parsing in practice
        return [
            'Emotional depth development',
            'Character psychology exploration',
            'Authentic moment-to-moment work',
            'Relationship dynamic coaching'
        ];
    }

    /**
     * Extract exercise recommendations from analysis
     */
    async extractExerciseRecommendations(analysisContent) {
        // Simplified extraction - would parse specific exercises
        return [
            'Emotional memory work',
            'Character physicality exercises',
            'Objective and obstacle work',
            'Improvisation and spontaneity training'
        ];
    }

    /**
     * Select authenticity exercises based on issue
     */
    selectAuthenticityExercises(issue) {
        const exerciseMap = {
            generalEmotion: ['Emotional specificity work', 'Circumstance analysis'],
            indication: ['Concentration exercises', 'Truthful activity work'],
            tension: ['Relaxation techniques', 'Physical release work'],
            disconnection: ['Substitution exercises', 'Personal connection work']
        };
        
        return exerciseMap[issue] || ['General method technique work'];
    }

    /**
     * Get method coaching status
     */
    getMethodCoachingStatus() {
        return {
            currentProject: {
                active: !!this.coachingProject.production,
                title: this.coachingProject.production?.title,
                status: this.coachingProject.status,
                approachComplete: !!this.coachingProject.methodApproach,
                characterAnalysesReady: this.coachingProject.characterAnalyses.size
            },
            coaching: {
                performerProfiles: this.coachingProject.performerProfiles.size,
                characterAnalyses: this.coachingProject.characterAnalyses.size,
                emotionalExercises: this.coachingProject.emotionalExercises.size,
                sceneWork: this.coachingProject.sceneWork.size
            },
            development: {
                authenticityAssessments: this.performanceDevelopment.authenticityAssessments.length,
                depthProgression: this.performanceDevelopment.depthProgression.size,
                breakthroughMoments: this.performanceDevelopment.breakthroughMoments.length,
                challengeAreas: this.performanceDevelopment.challengeAreas.size
            },
            capabilities: this.methodCapabilities,
            techniques: {
                stanislavskiTechniques: Object.keys(this.methodTechniques.stanislavski).length,
                strasbergTechniques: Object.keys(this.methodTechniques.strasberg).length,
                meisnerTechniques: Object.keys(this.methodTechniques.meisner).length,
                exerciseLevels: Object.keys(this.exerciseLibrary).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎭 Method Acting Coach: Concluding method coaching session...');
        
        // Finalize coaching project
        if (this.coachingProject.status !== 'idle') {
            this.coachingProject.status = 'completed';
            this.coachingProject.completedAt = new Date();
        }
        
        // Generate method coaching summary
        if (this.currentProduction) {
            const coachingSummary = this.generateMethodCoachingSummary();
            console.log('🎭 Method Acting Coach: Coaching summary generated');
        }
        
        console.log('🎭 Method Acting Coach: Method coaching concluded');
    }

    /**
     * Generate method coaching summary
     */
    generateMethodCoachingSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            coaching: {
                approachDeveloped: !!this.coachingProject.methodApproach,
                characterAnalysesCreated: this.coachingProject.characterAnalyses.size,
                emotionalExercisesDesigned: this.coachingProject.emotionalExercises.size,
                sceneWorkCompleted: this.coachingProject.sceneWork.size
            },
            development: {
                performersSupported: this.coachingProject.performerProfiles.size,
                authenticityIssuesAddressed: this.performanceDevelopment.challengeAreas.size,
                depthCoachingSessions: this.performanceDevelopment.authenticityAssessments.length
            },
            techniques: {
                methodApproachUsed: this.coachingPhilosophy,
                exerciseLevelsEmployed: Object.keys(this.exerciseLibrary).length,
                analysisFrameworkUtilized: Object.keys(this.characterAnalysisFramework).length
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MethodActingCoachAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.MethodActingCoachAgent = MethodActingCoachAgent;
    console.log('🎭 Method Acting Coach Agent loaded - Ready for deep, authentic performance guidance');
}