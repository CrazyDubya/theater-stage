/**
 * MovementCoachAgent.js - AI-Powered Physical Performance Training
 * 
 * The Movement Coach Agent uses Ollama LLM to guide performers in developing
 * expressive physicality, body awareness, and character-driven movement.
 * Focuses on non-dance physical performance and embodied storytelling.
 * 
 * Features:
 * - AI-driven movement analysis and coaching
 * - Character physicality development
 * - Body awareness and spatial training
 * - Gesture and posture coaching
 * - Physical storytelling techniques
 * - Integration with character development and voice work
 */

class MovementCoachAgent extends BaseAgent {
    constructor(config = {}) {
        super('movement-coach', {
            name: 'Movement Coach',
            role: 'movement-coach',
            priority: 75, // High priority for embodied performance
            maxActionsPerSecond: 5,
            personality: config.personality || 'intuitive',
            ...config
        });
        
        // Movement Coach specific properties
        this.ollamaInterface = null;
        this.movementApproach = config.approach || 'character-driven';
        this.creativityLevel = config.creativity || 0.8;
        
        // Movement coaching capabilities
        this.movementCapabilities = {
            bodyAwareness: {
                spatialAwareness: true,
                kinestheticSensitivity: true,
                breathingIntegration: true,
                tensionRelease: true,
                alignmentTraining: true
            },
            characterPhysicality: {
                characterBodyLanguage: true,
                emotionalEmbodiment: true,
                socialStatusPhysics: true,
                agePhysicality: true,
                psychologicalStates: true
            },
            performanceSkills: {
                stagePresence: true,
                spatialRelationships: true,
                physicalStorytelling: true,
                ensembleMovement: true,
                audienceConnection: true
            },
            technicalSkills: {
                bodyIsolation: true,
                coordinationTraining: true,
                balanceWork: true,
                flexibilityDevelopment: true,
                strengthBuilding: true
            },
            styleSpecialty: {
                periodMovement: true,
                animalWork: true,
                maskWork: true,
                mimeElements: true,
                neutralMask: true
            }
        };
        
        // Current movement project
        this.movementProject = {
            production: null,
            movementConcept: null,
            characterMovement: new Map(),
            trainingPrograms: new Map(),
            ensembleWork: new Map(),
            progressTracking: new Map(),
            status: 'idle'
        };
        
        // Movement training systems and methodologies
        this.trainingMethods = {
            laban_movement: {
                description: 'Rudolf Laban\'s movement analysis system',
                components: {
                    efforts: {
                        weight: ['light', 'strong'],
                        time: ['sustained', 'sudden'],
                        space: ['direct', 'indirect'],
                        flow: ['bound', 'free']
                    },
                    shapes: ['pin', 'wall', 'ball', 'screw'],
                    spatial_patterns: ['central', 'peripheral', 'transverse']
                },
                applications: ['Character development', 'Emotional expression', 'Movement quality']
            },
            alexander_technique: {
                description: 'Body alignment and use awareness',
                principles: ['Primary control', 'Inhibition', 'Direction', 'End-gaining vs means-whereby'],
                applications: ['Posture improvement', 'Tension release', 'Ease of movement'],
                benefits: ['Reduced strain', 'Improved presence', 'Enhanced awareness']
            },
            viewpoints: {
                description: 'Compositional approach to movement and time',
                viewpoints: {
                    spatial: ['shape', 'gesture', 'architecture', 'spatial_relationship', 'topography'],
                    temporal: ['tempo', 'duration', 'kinesthetic_response', 'repetition']
                },
                applications: ['Ensemble work', 'Improvisation', 'Spatial awareness']
            },
            animal_work: {
                description: 'Character development through animal observation',
                process: ['Observation', 'Imitation', 'Abstraction', 'Integration'],
                benefits: ['Physicality discovery', 'Instinct development', 'Non-human perspectives'],
                applications: ['Character creation', 'Energy work', 'Ensemble connection']
            },
            mask_work: {
                description: 'Physical expression through mask discipline',
                types: ['Neutral mask', 'Character masks', 'Half masks', 'Full masks'],
                principles: ['Economy of gesture', 'Clear intention', 'Full body expression'],
                benefits: ['Physical honesty', 'Presence development', 'Non-verbal communication']
            }
        };
        
        // Character physicality frameworks
        this.characterPhysicality = {
            age_physicality: {
                child: {
                    characteristics: 'High energy, impulsive movement, exploring boundaries',
                    physicality: 'Quick changes, full-body expression, curiosity-driven',
                    voice_integration: 'Physical voice, breath-sound connection'
                },
                adolescent: {
                    characteristics: 'Awkward growth, self-consciousness, emotional volatility',
                    physicality: 'Gangly movement, withdrawn or explosive expression',
                    voice_integration: 'Voice changes, inconsistent control'
                },
                adult: {
                    characteristics: 'Controlled movement, established patterns, purpose-driven',
                    physicality: 'Efficient movement, social awareness, role-based postures',
                    voice_integration: 'Coordinated voice-body relationship'
                },
                elderly: {
                    characteristics: 'Physical limitations, accumulated wisdom, economy of movement',
                    physicality: 'Measured pace, careful balance, gesture precision',
                    voice_integration: 'Breath support changes, vocal wisdom'
                }
            },
            social_status: {
                aristocratic: {
                    characteristics: 'Elevated posture, refined gestures, space claiming',
                    movement_quality: 'Controlled, elegant, expectant of service',
                    spatial_relationship: 'Central positioning, expansive use of space'
                },
                working_class: {
                    characteristics: 'Practical movement, efficient gestures, tool familiarity',
                    movement_quality: 'Direct, purposeful, labor-influenced',
                    spatial_relationship: 'Adaptive to space, respectful boundaries'
                },
                merchant: {
                    characteristics: 'Persuasive gestures, social adaptability, transaction awareness',
                    movement_quality: 'Engaging, calculated, opportunity-seeking',
                    spatial_relationship: 'Market-savvy, customer-oriented positioning'
                }
            },
            psychological_states: {
                confidence: {
                    physicality: 'Upright posture, open gestures, steady gait',
                    breathing: 'Deep, regular, supported',
                    spatial_use: 'Comfortable claiming of space'
                },
                anxiety: {
                    physicality: 'Tension in shoulders, restricted gestures, quick movements',
                    breathing: 'Shallow, irregular, chest-focused',
                    spatial_use: 'Contracted, protective positioning'
                },
                depression: {
                    physicality: 'Sunken posture, minimal gestures, slow movement',
                    breathing: 'Limited, deflated, effortful',
                    spatial_use: 'Withdrawal, minimal space claiming'
                },
                anger: {
                    physicality: 'Rigid posture, sharp gestures, aggressive stance',
                    breathing: 'Forceful, irregular, held breath',
                    spatial_use: 'Invasive, territorial, confrontational'
                }
            }
        };
        
        // Physical training exercises and progressions
        this.trainingExercises = {
            body_awareness: {
                tension_release: {
                    exercises: ['Progressive relaxation', 'Shake-out sequences', 'Tension-release contrasts'],
                    progression: 'Awareness → Control → Integration',
                    applications: 'Character preparation, performance stamina'
                },
                alignment: {
                    exercises: ['Wall work', 'Floor sequences', 'Partner sensing'],
                    progression: 'Static → Dynamic → Applied',
                    applications: 'Posture improvement, character physicality'
                },
                breathing_integration: {
                    exercises: ['Breath-movement coordination', 'Voice-body connection', 'Emotional breathing'],
                    progression: 'Mechanical → Expressive → Character-specific',
                    applications: 'Performance stamina, emotional expression'
                }
            },
            spatial_work: {
                personal_space: {
                    exercises: ['Bubble work', 'Space claiming', 'Boundary exploration'],
                    progression: 'Self-awareness → Other-awareness → Scene application',
                    applications: 'Character relationships, stage presence'
                },
                group_dynamics: {
                    exercises: ['Flocking', 'Space sharing', 'Ensemble sculpting'],
                    progression: 'Following → Leading → Co-creating',
                    applications: 'Ensemble scenes, crowd work'
                },
                architecture: {
                    exercises: ['Space reading', 'Level work', 'Obstacle navigation'],
                    progression: 'Exploration → Adaptation → Creative use',
                    applications: 'Set integration, environmental storytelling'
                }
            },
            character_development: {
                animal_work: {
                    exercises: ['Animal observation', 'Movement imitation', 'Human abstraction'],
                    progression: 'Literal → Metaphorical → Integrated',
                    applications: 'Character essence, instinct development'
                },
                period_movement: {
                    exercises: ['Historical research', 'Costume influence', 'Social context'],
                    progression: 'Research → Practice → Embodiment',
                    applications: 'Period authenticity, character believability'
                },
                emotional_embodiment: {
                    exercises: ['Emotion-movement exploration', 'State transitions', 'Physical subtext'],
                    progression: 'Recognition → Expression → Subtlety',
                    applications: 'Character psychology, scene dynamics'
                }
            }
        };
        
        // Assessment and feedback systems
        self.assessmentCriteria = {
            physical_awareness: {
                body_consciousness: 'Awareness of physical habits and patterns',
                spatial_intelligence: 'Understanding of space and relationships',
                kinesthetic_sensitivity: 'Responsiveness to physical sensations',
                breath_integration: 'Coordination of breath with movement'
            },
            expressive_range: {
                emotional_embodiment: 'Physical expression of internal states',
                character_differentiation: 'Distinct physicality for different roles',
                storytelling_clarity: 'Clear communication through movement',
                authentic_expression: 'Genuine vs. imitated physical responses'
            },
            technical_skills: {
                coordination: 'Body parts working together effectively',
                balance: 'Stability and weight management',
                flexibility: 'Range of motion and adaptability',
                stamina: 'Sustained physical performance capability'
            },
            performance_integration: {
                voice_body_unity: 'Coordinated vocal and physical expression',
                character_consistency: 'Maintained physicality throughout performance',
                ensemble_awareness: 'Responsiveness to other performers',
                audience_connection: 'Physical communication with audience'
            }
        };
        
        // Injury prevention and safety
        this.safetyProtocols = {
            warmup_procedures: {
                duration: '15-20 minutes minimum',
                components: ['Joint mobility', 'Muscle activation', 'Coordination preparation'],
                progressions: ['Gentle → Moderate → Performance-ready'],
                monitoring: 'Individual needs assessment, injury history consideration'
            },
            injury_prevention: {
                risk_assessment: 'Evaluation of movement demands and performer capabilities',
                modification_strategies: 'Adaptations for limitations or injuries',
                rest_requirements: 'Recovery time between intensive sessions',
                professional_referral: 'When to consult medical professionals'
            },
            cooldown_procedures: {
                duration: '10-15 minutes',
                components: ['Gentle movement', 'Stretching', 'Relaxation'],
                focus: 'Transition from performance to normal state',
                assessment: 'Check for strain, fatigue, or discomfort'
            }
        };
        
        // Integration with related disciplines
        this.disciplinaryIntegration = {
            voice_work: {
                connection_points: ['Breath support', 'Resonance', 'Emotional expression'],
                collaborative_exercises: ['Voice-movement improvisation', 'Character voice-body discovery'],
                shared_goals: 'Unified character expression, performance stamina'
            },
            acting_technique: {
                connection_points: ['Character development', 'Emotional truth', 'Scene objectives'],
                collaborative_exercises: ['Physical objective work', 'Status exercises', 'Relationship exploration'],
                shared_goals: 'Believable characterization, truthful performance'
            },
            dance_choreography: {
                connection_points: ['Rhythm', 'Spatial awareness', 'Group coordination'],
                collaborative_exercises: ['Movement phrase development', 'Musical integration'],
                shared_goals: 'Performance precision, artistic expression'
            }
        };
        
        // Performance tracking and documentation
        this.performanceTracking = {
            progressAssessment: new Map(),
            characterDevelopment: new Map(),
            ensembleIntegration: new Map(),
            injuryMonitoring: new Map()
        };
        
        // Integration with production system
        this.voiceCoach = null;
        this.choreographer = null;
        this.methodActingCoach = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        console.log('🤸 Movement Coach Agent: Ready to guide expressive physicality and embodied storytelling');
    }

    /**
     * Initialize Movement Coach with system integration
     */
    async onInitialize() {
        try {
            console.log('🤸 Movement Coach: Initializing movement training systems...');
            
            // Connect to Ollama interface for AI movement coaching
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI movement coaching requires LLM assistance.');
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
            
            // Configure AI for movement coaching
            this.ollamaInterface.updatePerformanceContext({
                role: 'movement_coach',
                movement_approach: this.movementApproach,
                creativity_mode: 'embodied_expression',
                specialization: 'physical_performance'
            });
            
            // Connect to related agents
            if (window.voiceCoachAgent) {
                this.voiceCoach = window.voiceCoachAgent;
                console.log('🤸 Movement Coach: Connected to Voice Coach');
            }
            
            if (window.choreographerAgent) {
                this.choreographer = window.choreographerAgent;
                console.log('🤸 Movement Coach: Connected to Choreographer');
            }
            
            if (window.methodActingCoachAgent) {
                this.methodActingCoach = window.methodActingCoachAgent;
                console.log('🤸 Movement Coach: Connected to Method Acting Coach');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🤸 Movement Coach: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize movement systems
            await this.initializeMovementSystems();
            
            // Test movement coaching capabilities
            await this.testMovementCoachingCapabilities();
            
            console.log('🤸 Movement Coach: Ready to guide expressive physicality!')
            
        } catch (error) {
            console.error('🤸 Movement Coach: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI MOVEMENT COACHING:
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
     * Subscribe to production events for movement coaching
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('casting:characters-assigned', (data) => this.onCharactersAssigned(data));
            window.theaterEventBus.subscribe('movement:coaching-request', (data) => this.onMovementCoachingRequested(data));
            window.theaterEventBus.subscribe('movement:physicality-development', (data) => this.onPhysicalityDevelopment(data));
            window.theaterEventBus.subscribe('rehearsal:movement-notes', (data) => this.onMovementNotes(data));
            window.theaterEventBus.subscribe('performance:physical-feedback', (data) => this.onPhysicalFeedback(data));
            
            console.log('🤸 Movement Coach: Subscribed to movement coaching events');
        }
    }

    /**
     * Initialize movement systems
     */
    async initializeMovementSystems() {
        console.log('🤸 Movement Coach: Initializing movement systems...');
        
        // Initialize body awareness tools
        this.initializeBodyAwarenessTools();
        
        // Initialize character physicality tools
        this.initializeCharacterPhysicalityTools();
        
        // Initialize training assessment
        this.initializeTrainingAssessment();
        
        console.log('✅ Movement Coach: Movement systems initialized');
    }

    /**
     * Initialize body awareness tools
     */
    initializeBodyAwarenessTools() {
        this.bodyAwarenessTools = {
            tensionMapper: (performer) => this.mapPhysicalTension(performer),
            breathAnalyzer: (pattern) => this.analyzeBreathPattern(pattern),
            alignmentChecker: (posture) => this.checkAlignment(posture),
            spatialAssessor: (awareness) => this.assessSpatialAwareness(awareness)
        };
        
        console.log('🤸 Movement Coach: Body awareness tools initialized');
    }

    /**
     * Initialize character physicality tools
     */
    initializeCharacterPhysicalityTools() {
        this.physicalityTools = {
            characterAnalyzer: (character, context) => this.analyzeCharacterPhysicality(character, context),
            movementGenerator: (traits) => this.generateMovementVocabulary(traits),
            physicalityComparator: (characters) => this.compareCharacterPhysicalities(characters),
            integrationPlanner: (physicality, voice) => this.planVoiceBodyIntegration(physicality, voice)
        };
        
        console.log('🤸 Movement Coach: Character physicality tools initialized');
    }

    /**
     * Initialize training assessment
     */
    initializeTrainingAssessment() {
        this.assessmentSystems = {
            progressTracker: new Map(),
            skillEvaluator: new Map(),
            safetyMonitor: new Map(),
            integrationChecker: new Map()
        };
        
        console.log('🤸 Movement Coach: Training assessment initialized');
    }

    /**
     * Test movement coaching capabilities
     */
    async testMovementCoachingCapabilities() {
        try {
            const testPrompt = `
            As a movement coach, develop a physical character transformation for a theatrical role.
            
            Character requirements:
            - Character: A proud, aging monarch losing their grip on power
            - Actor: 40-year-old performer with good physical capability
            - Challenge: Show physical deterioration while maintaining regal bearing
            - Production: Classical drama, large theater venue
            - Integration: Must work with voice coach and character development
            
            Provide:
            1. Character physicality analysis and concept
            2. Body awareness training to prepare the actor
            3. Specific movement exercises for character development
            4. Age physicality techniques and progression
            5. Status and power expression through posture and gesture
            6. Decline portrayal without stereotyping
            7. Integration with vocal work and breath support
            8. Rehearsal plan and milestone assessments
            
            Format as comprehensive movement coaching plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🤸 Movement Coach: Coaching capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🤸 Movement Coach: Coaching capability test failed:', error);
            throw new Error(`Movement coaching test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🤸 Movement Coach: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize movement project
        await this.initializeMovementProject(data.production);
        
        // Develop movement concept
        await this.developMovementConcept(data.production);
    }

    /**
     * Initialize movement project
     */
    async initializeMovementProject(production) {
        console.log('🤸 Movement Coach: Initializing movement project...');
        
        this.movementProject = {
            production: production,
            movementConcept: null,
            characterMovement: new Map(),
            trainingPrograms: new Map(),
            ensembleWork: new Map(),
            progressTracking: new Map(),
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Analyze production movement needs
        await this.analyzeProductionMovementNeeds(production);
        
        console.log('✅ Movement Coach: Movement project initialized');
    }

    /**
     * Develop movement concept for production
     */
    async developMovementConcept(production) {
        try {
            console.log('🤸 Movement Coach: Developing movement concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive movement concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall physical language and movement style for the production
                2. Character-specific physicality requirements
                3. Ensemble movement and spatial relationships
                4. Period or style-specific movement considerations
                5. Integration with voice work and character development
                6. Physical storytelling opportunities
                7. Body awareness and safety considerations
                8. Training timeline and performer preparation
                9. Space and venue considerations for movement
                10. Accessibility and inclusion in movement work
                
                Provide a detailed movement concept that guides all physical performance aspects while respecting performer capabilities and safety.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.movementProject.movementConcept = response.content;
                    this.movementProject.status = 'concept_complete';
                    
                    console.log('✅ Movement Coach: Movement concept developed');
                    
                    // Extract training requirements from concept
                    await this.extractTrainingRequirements(response.content);
                    
                    // Begin character physicality planning
                    await this.beginCharacterPhysicalityPlanning(production, response.content);
                    
                    // Share concept with production team
                    window.theaterEventBus?.publish('movement:concept-complete', {
                        production: production,
                        concept: response.content,
                        movementCoach: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Movement Coach: Concept development failed:', error.message);
            this.movementProject.status = 'concept_error';
        }
    }

    /**
     * Handle character assignments
     */
    async onCharactersAssigned(data) {
        console.log('🤸 Movement Coach: Character assignments received');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.developCharacterPhysicalities(data.assignments);
        }
    }

    /**
     * Develop physicalities for assigned characters
     */
    async developCharacterPhysicalities(assignments) {
        console.log('🤸 Movement Coach: Developing character physicalities...');
        
        for (const assignment of assignments) {
            await this.createCharacterPhysicality(assignment.character, assignment.performer);
        }
    }

    /**
     * Create physicality for specific character
     */
    async createCharacterPhysicality(character, performer) {
        try {
            console.log(`🤸 Movement Coach: Creating physicality for ${character.name}...`);
            
            const physicalityPrompt = `
            Develop a detailed physical characterization for this role:
            
            Character: ${character.name}
            Character Description: ${character.description || 'Character details to be determined'}
            Character Age: ${character.age || 'Age not specified'}
            Background: ${character.background || 'Background not provided'}
            
            Performer: ${performer.name}
            Physical Capabilities: ${performer.physicalCapabilities || 'To be assessed'}
            Movement Experience: ${performer.movementExperience || 'Unknown'}
            
            Production Context:
            - Production: ${this.currentProduction?.title}
            - Movement Concept: ${this.movementProject.movementConcept}
            - Approach: ${this.movementApproach}
            
            Create comprehensive character physicality:
            1. Overall physical concept and energy for this character
            2. Posture and alignment characteristics
            3. Gesture vocabulary and movement patterns
            4. Spatial relationships and territory use
            5. Breathing patterns and rhythm
            6. Age, status, and psychological physicality
            7. Character arc reflected in physical evolution
            8. Training exercises specific to this character
            9. Integration with voice work and emotion
            10. Rehearsal progression and milestones
            
            Provide movement coaching plan suitable for character embodiment.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(physicalityPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const characterPhysicality = {
                    character: character,
                    performer: performer,
                    physicality: response.content,
                    movementVocabulary: await this.extractMovementVocabulary(response.content),
                    trainingPlan: await this.createTrainingPlan(response.content),
                    progressMarkers: await this.defineProgressMarkers(response.content),
                    createdAt: new Date(),
                    status: 'developed'
                };
                
                this.movementProject.characterMovement.set(character.name, characterPhysicality);
                
                console.log(`✅ Movement Coach: Physicality created for ${character.name}`);
                
                // Notify production team
                window.theaterEventBus?.publish('movement:character-physicality-ready', {
                    character: character,
                    physicality: characterPhysicality,
                    movementCoach: this.config.name
                });
                
                return characterPhysicality;
            }
            
        } catch (error) {
            console.error(`🤸 Movement Coach: Character physicality creation failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Handle movement coaching requests
     */
    async onMovementCoachingRequested(data) {
        console.log('🤸 Movement Coach: Movement coaching requested -', data.coachingType);
        
        await this.provideMovementCoaching(data.coachingType, data.performer, data.focus);
    }

    /**
     * Handle physicality development requests
     */
    async onPhysicalityDevelopment(data) {
        console.log('🤸 Movement Coach: Physicality development requested -', data.character);
        
        await this.guidePhysicalityDevelopment(data.character, data.performer, data.goals);
    }

    /**
     * Handle movement notes from rehearsal
     */
    async onMovementNotes(data) {
        console.log('🤸 Movement Coach: Movement notes received from rehearsal');
        
        await this.processMovementNotes(data.notes, data.scene, data.adjustments);
    }

    /**
     * Handle physical feedback during performance
     */
    async onPhysicalFeedback(data) {
        console.log('🤸 Movement Coach: Physical feedback received');
        
        await this.analyzePhysicalPerformance(data.feedback, data.performer, data.scene);
    }

    /**
     * Extract training requirements from concept
     */
    async extractTrainingRequirements(concept) {
        // Simplified extraction - would use AI parsing in practice
        return {
            bodyAwareness: 'Fundamental preparation',
            characterWork: 'Role-specific development',
            ensembleSkills: 'Group coordination',
            safetyFocus: 'Injury prevention'
        };
    }

    /**
     * Extract movement vocabulary from physicality
     */
    async extractMovementVocabulary(physicality) {
        // Simplified extraction - would parse specific movements
        return {
            posture: 'Character-specific alignment',
            gestures: 'Signature movement patterns',
            walk: 'Distinctive gait and rhythm',
            spatial: 'Territory and relationship patterns'
        };
    }

    /**
     * Get movement coach status
     */
    getMovementCoachStatus() {
        return {
            currentProject: {
                active: !!this.movementProject.production,
                title: this.movementProject.production?.title,
                status: this.movementProject.status,
                conceptComplete: !!this.movementProject.movementConcept,
                characterPhysicalitiesDeveloped: this.movementProject.characterMovement.size
            },
            training: {
                characterMovement: this.movementProject.characterMovement.size,
                trainingPrograms: this.movementProject.trainingPrograms.size,
                ensembleWork: this.movementProject.ensembleWork.size,
                progressTracking: this.movementProject.progressTracking.size
            },
            capabilities: this.movementCapabilities,
            methods: {
                trainingMethods: Object.keys(this.trainingMethods).length,
                physicalityFrameworks: Object.keys(this.characterPhysicality).length,
                exerciseCategories: Object.keys(this.trainingExercises).length,
                assessmentCriteria: Object.keys(self.assessmentCriteria).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🤸 Movement Coach: Concluding movement coaching session...');
        
        // Finalize movement project
        if (this.movementProject.status !== 'idle') {
            this.movementProject.status = 'completed';
            this.movementProject.completedAt = new Date();
        }
        
        // Generate movement summary
        if (this.currentProduction) {
            const movementSummary = this.generateMovementSummary();
            console.log('🤸 Movement Coach: Movement summary generated');
        }
        
        console.log('🤸 Movement Coach: Physical performance coaching concluded');
    }

    /**
     * Generate movement summary
     */
    generateMovementSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            movement: {
                conceptDeveloped: !!this.movementProject.movementConcept,
                characterPhysicalitiesCreated: this.movementProject.characterMovement.size,
                trainingProgramsImplemented: this.movementProject.trainingPrograms.size,
                ensembleWorkCompleted: this.movementProject.ensembleWork.size
            },
            progress: {
                performersTracked: this.movementProject.progressTracking.size,
                physicalSkillsDeveloped: this.calculateSkillsDeveloped(),
                safetyProtocolsImplemented: Object.keys(this.safetyProtocols).length
            },
            collaboration: {
                voiceCoachIntegration: !!this.voiceCoach,
                choreographerCoordination: !!this.choreographer,
                actingCoachAlignment: !!this.methodActingCoach,
                creativeDirectorCollaboration: !!this.creativeDirector
            }
        };
    }

    /**
     * Calculate skills developed
     */
    calculateSkillsDeveloped() {
        return Array.from(this.movementProject.progressTracking.values())
            .reduce((total, progress) => total + progress.skillsAcquired.length, 0);
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MovementCoachAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.MovementCoachAgent = MovementCoachAgent;
    console.log('🤸 Movement Coach Agent loaded - Ready for expressive physicality and embodied storytelling');
}