/**
 * DanceCaptainAgent.js - AI-Powered Movement Coordination and Training
 * 
 * The Dance Captain Agent uses Ollama LLM to manage choreography execution,
 * movement training, and dance coordination for theatrical productions.
 * Ensures consistent movement quality and supports performer development.
 * 
 * Features:
 * - AI-driven movement coaching and correction
 * - Choreography maintenance and cleaning
 * - Performer training and skill development
 * - Movement integration with music and staging
 * - Style consistency and quality control
 * - Injury prevention and physical wellness
 */

class DanceCaptainAgent extends BaseAgent {
    constructor(config = {}) {
        super('dance-captain', {
            name: 'Dance Captain',
            role: 'dance-captain',
            priority: 65, // Important for movement quality and training
            maxActionsPerSecond: 5,
            personality: config.personality || 'encouraging',
            ...config
        });
        
        // Dance Captain specific properties
        this.ollamaInterface = null;
        this.coachingApproach = config.approach || 'supportive-technical';
        this.creativityLevel = config.creativity || 0.70;
        
        // Dance Captain capabilities
        this.danceCapabilities = {
            movementCoaching: {
                techniqueCorrection: true,
                styleConsistency: true,
                performanceQuality: true,
                individualSupport: true,
                groupCoordination: true
            },
            choreographyMaintenance: {
                routineCleaning: true,
                styleMaintenance: true,
                spacingCorrection: true,
                timingAdjustment: true,
                energyManagement: true
            },
            training: {
                skillDevelopment: true,
                strengthBuilding: true,
                flexibilityImprovement: true,
                coordinationTraining: true,
                confidenceBuilding: true
            },
            integration: {
                musicSynchronization: true,
                stageCoordination: true,
                costumeAdaptation: true,
                lightingCoordination: true,
                scenicIntegration: true
            },
            wellness: {
                injuryPrevention: true,
                physicalConditioning: true,
                warmUpProtocols: true,
                recoverySupport: true,
                healthMonitoring: true
            },
            performance: {
                energyMaintenance: true,
                consistencyAssurance: true,
                momentumBuilding: true,
                audienceConnection: true,
                showReadiness: true
            }
        };
        
        // Current dance project
        this.danceProject = {
            production: null,
            movementPlan: null,
            rehearsalSchedule: new Map(),
            performerProgress: new Map(),
            choreographyNotes: new Map(),
            performanceMetrics: new Map(),
            status: 'idle'
        };
        
        // Movement styles and techniques
        this.movementStyles = {
            classical_styles: {
                ballet: {
                    characteristics: 'Precision, grace, turnout, extension, classical positions',
                    techniques: 'Barre work, center combinations, port de bras, grand allegro',
                    applications: 'Classical productions, elegant characters, formal scenes',
                    training_focus: 'Technique, strength, flexibility, artistic expression'
                },
                modern: {
                    characteristics: 'Floor work, contraction/release, gravity, organic movement',
                    techniques: 'Graham, Limon, Horton techniques, improvisation, floor sequences',
                    applications: 'Contemporary works, emotional expression, abstract concepts',
                    training_focus: 'Core strength, flexibility, emotional connection, creativity'
                },
                jazz: {
                    characteristics: 'Syncopation, isolation, sharp dynamics, popular music styles',
                    techniques: 'Jazz walks, kicks, turns, isolations, commercial dance',
                    applications: 'Musical theater, contemporary shows, energetic numbers',
                    training_focus: 'Rhythm, coordination, performance quality, versatility'
                }
            },
            theatrical_styles: {
                musical_theater: {
                    characteristics: 'Character-driven, narrative support, audience engagement',
                    techniques: 'Storytelling through movement, character physicality, staging awareness',
                    applications: 'Book musicals, character numbers, ensemble pieces',
                    training_focus: 'Acting through dance, character development, stage presence'
                },
                period_styles: {
                    characteristics: 'Historical accuracy, cultural authenticity, style specificity',
                    techniques: 'Minuet, waltz, social dances, folk traditions, courtly movement',
                    applications: 'Period productions, cultural works, historical accuracy',
                    training_focus: 'Research, authenticity, cultural sensitivity, adaptation'
                },
                contemporary_fusion: {
                    characteristics: 'Style blending, modern interpretation, creative innovation',
                    techniques: 'Multiple style integration, creative interpretation, original movement',
                    applications: 'Original works, reimagined classics, experimental theater',
                    training_focus: 'Versatility, creativity, adaptation, artistic risk-taking'
                }
            },
            specialized_movement: {
                stage_combat: {
                    characteristics: 'Safety first, illusion of violence, dramatic impact',
                    techniques: 'Unarmed combat, sword work, safety protocols, reaction timing',
                    applications: 'Action scenes, dramatic conflicts, period battles',
                    training_focus: 'Safety, precision, dramatic effect, partner awareness'
                },
                acrobatics: {
                    characteristics: 'Physical skill, spectacular effects, controlled risk',
                    techniques: 'Tumbling, aerial work, partner acrobatics, safety systems',
                    applications: 'Circus theater, physical comedy, spectacular moments',
                    training_focus: 'Strength, control, safety, progressive skill building'
                },
                character_movement: {
                    characteristics: 'Physical character development, age/disability portrayal',
                    techniques: 'Body language, gait modification, posture, gesture',
                    applications: 'Character development, age transformation, physical comedy',
                    training_focus: 'Observation, authenticity, physical transformation, health'
                }
            }
        };
        
        // Training methodologies and techniques
        this.trainingMethodologies = {
            technical_training: {
                progressive_development: {
                    approach: 'Building skills systematically from basic to advanced',
                    benefits: 'Solid foundation, injury prevention, consistent progress',
                    implementation: 'Structured curriculum, skill assessments, gradual advancement',
                    monitoring: 'Regular evaluation, adjustment based on progress, individual pacing'
                },
                muscle_memory: {
                    approach: 'Repetition and consistency to build automatic responses',
                    benefits: 'Reliability under pressure, consistent performance quality',
                    implementation: 'Daily practice, breakdown drills, mental rehearsal',
                    monitoring: 'Consistency tracking, error analysis, refinement focus'
                },
                cross_training: {
                    approach: 'Multiple movement styles to build versatility and strength',
                    benefits: 'Injury prevention, artistic versatility, physical development',
                    implementation: 'Style variety, strength training, flexibility work',
                    monitoring: 'Balanced development, adaptation assessment, weakness addressing'
                }
            },
            artistic_development: {
                performance_quality: {
                    focus: 'Artistic expression, audience connection, emotional authenticity',
                    techniques: 'Emotional preparation, character work, audience awareness',
                    development: 'Performance opportunities, feedback, artistic exploration',
                    assessment: 'Artistic growth, audience impact, expressive range'
                },
                style_mastery: {
                    focus: 'Understanding and embodying different movement styles',
                    techniques: 'Style study, cultural research, mentor observation',
                    development: 'Immersive training, style-specific classes, cultural education',
                    assessment: 'Authenticity, stylistic accuracy, cultural sensitivity'
                },
                creative_expression: {
                    focus: 'Individual artistic voice, interpretive skills, innovation',
                    techniques: 'Improvisation, personal interpretation, creative exploration',
                    development: 'Creative exercises, individual coaching, artistic challenges',
                    assessment: 'Originality, artistic risk-taking, personal growth'
                }
            },
            physical_conditioning: {
                strength_training: {
                    focus: 'Building muscular strength for dance demands',
                    methods: 'Bodyweight exercises, resistance training, functional movement',
                    progression: 'Graduated intensity, dance-specific exercises, injury prevention',
                    monitoring: 'Strength assessments, fatigue management, recovery tracking'
                },
                flexibility_development: {
                    focus: 'Range of motion, injury prevention, aesthetic lines',
                    methods: 'Dynamic stretching, static holds, PNF techniques, yoga integration',
                    progression: 'Daily practice, targeted areas, gradual improvement',
                    monitoring: 'Flexibility measurements, pain awareness, improvement tracking'
                },
                cardiovascular_fitness: {
                    focus: 'Endurance for extended performances, recovery capacity',
                    methods: 'Dance cardio, interval training, performance stamina building',
                    progression: 'Endurance building, performance simulation, recovery enhancement',
                    monitoring: 'Stamina assessments, performance fatigue, recovery rates'
                }
            }
        };
        
        // Rehearsal and coaching strategies
        this.rehearsalStrategies = {
            skill_development: {
                breakdown_method: {
                    approach: 'Complex movements broken into manageable components',
                    benefits: 'Understanding, confidence building, error identification',
                    implementation: 'Step-by-step instruction, component mastery, integration',
                    progression: 'Simple to complex, slow to tempo, parts to whole'
                },
                repetition_with_variation: {
                    approach: 'Multiple practice methods for the same material',
                    benefits: 'Deeper understanding, adaptation skills, engagement',
                    implementation: 'Different tempos, styles, contexts, partner variations',
                    progression: 'Basic repetition, variation introduction, creative adaptation'
                },
                peer_learning: {
                    approach: 'Performers learning from and teaching each other',
                    benefits: 'Community building, diverse perspectives, leadership development',
                    implementation: 'Partner work, group feedback, mentorship programs',
                    progression: 'Observation skills, constructive feedback, teaching abilities'
                }
            },
            quality_maintenance: {
                daily_cleaning: {
                    purpose: 'Maintaining choreographic integrity and performance quality',
                    focus: 'Technical precision, style consistency, energy maintenance',
                    methods: 'Review sessions, individual notes, group refinement',
                    timing: 'Regular schedule, pre-performance focus, ongoing maintenance'
                },
                video_analysis: {
                    purpose: 'Objective assessment and improvement identification',
                    focus: 'Visual feedback, pattern recognition, progress documentation',
                    methods: 'Recording review, comparison analysis, goal setting',
                    timing: 'Periodic assessment, milestone documentation, improvement tracking'
                },
                performance_feedback: {
                    purpose: 'Real-time improvement and adaptation',
                    focus: 'Immediate corrections, energy adjustments, moment-specific notes',
                    methods: 'Post-rehearsal notes, individual meetings, group discussions',
                    timing: 'Immediate feedback, session summaries, ongoing dialogue'
                }
            }
        };
        
        // Integration with production elements
        this.productionIntegration = {
            music_coordination: {
                rhythm_accuracy: {
                    focus: 'Precise timing with musical elements',
                    techniques: 'Metronome work, musical phrasing, accent coordination',
                    challenges: 'Tempo changes, complex rhythms, live music adaptation',
                    solutions: 'Music director collaboration, conductor awareness, flexibility training'
                },
                musical_interpretation: {
                    focus: 'Movement that enhances and supports musical storytelling',
                    techniques: 'Musical analysis, emotional matching, dynamic coordination',
                    challenges: 'Complex scores, mood transitions, ensemble coordination',
                    solutions: 'Score study, musical coaching, rehearsal integration'
                }
            },
            staging_integration: {
                spatial_awareness: {
                    focus: 'Movement within set limitations and stage geography',
                    techniques: 'Spacing rehearsals, marking practice, traffic patterns',
                    challenges: 'Set changes, multiple levels, sight line preservation',
                    solutions: 'Technical rehearsals, spacing adaptations, safety protocols'
                },
                costume_coordination: {
                    focus: 'Movement adaptation for costume requirements',
                    techniques: 'Costume rehearsals, movement modification, safety awareness',
                    challenges: 'Restrictive costumes, quick changes, period accuracy',
                    solutions: 'Designer collaboration, movement adaptation, change rehearsals'
                }
            }
        };
        
        // Performance standards and quality metrics
        this.performanceStandards = {
            technical_excellence: {
                precision: 'Accurate execution of choreographic elements',
                consistency: 'Reliable performance quality across all shows',
                coordination: 'Ensemble unity and timing accuracy',
                safety: 'Risk-free execution of all movement elements'
            },
            artistic_quality: {
                expression: 'Emotional authenticity and character truth',
                style: 'Appropriate stylistic execution and authenticity',
                energy: 'Appropriate dynamic range and performance energy',
                connection: 'Audience engagement and emotional impact'
            },
            physical_wellness: {
                conditioning: 'Adequate physical preparation for demands',
                injury_prevention: 'Proactive health and safety measures',
                endurance: 'Stamina for full performance demands',
                recovery: 'Appropriate rest and recovery protocols'
            }
        };
        
        // Integration with production system
        this.choreographer = null;
        this.musicDirector = null;
        this.movementCoach = null;
        this.currentProduction = null;
        
        console.log('💃 Dance Captain Agent: Ready for movement excellence and performer development');
    }

    /**
     * Initialize Dance Captain with system integration
     */
    async onInitialize() {
        try {
            console.log('💃 Dance Captain: Initializing movement coordination and training systems...');
            
            // Connect to Ollama interface for AI dance coaching
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI dance coaching requires LLM assistance.');
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
            
            // Configure AI for dance coaching
            this.ollamaInterface.updatePerformanceContext({
                role: 'dance_captain',
                coaching_approach: this.coachingApproach,
                creativity_mode: 'movement_optimization',
                specialization: 'performance_quality_training'
            });
            
            // Connect to related agents
            if (window.choreographerAgent) {
                this.choreographer = window.choreographerAgent;
                console.log('💃 Dance Captain: Connected to Choreographer');
            }
            
            if (window.musicDirectorAgent) {
                this.musicDirector = window.musicDirectorAgent;
                console.log('💃 Dance Captain: Connected to Music Director');
            }
            
            if (window.movementCoachAgent) {
                this.movementCoach = window.movementCoachAgent;
                console.log('💃 Dance Captain: Connected to Movement Coach');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize dance systems
            await this.initializeDanceSystems();
            
            // Test dance captain capabilities
            await this.testDanceCapabilities();
            
            console.log('💃 Dance Captain: Ready for movement excellence!')
            
        } catch (error) {
            console.error('💃 Dance Captain: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI DANCE COACHING:
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
     * Subscribe to production events for dance coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('choreography:created', (data) => this.onChoreographyCreated(data));
            window.theaterEventBus.subscribe('rehearsal:movement-notes', (data) => this.onMovementNotes(data));
            window.theaterEventBus.subscribe('performance:quality-check', (data) => this.onQualityCheck(data));
            window.theaterEventBus.subscribe('performer:coaching-request', (data) => this.onCoachingRequest(data));
            window.theaterEventBus.subscribe('music:tempo-change', (data) => this.onTempoChange(data));
            
            console.log('💃 Dance Captain: Subscribed to dance coordination events');
        }
    }

    /**
     * Initialize dance systems
     */
    async initializeDanceSystems() {
        console.log('💃 Dance Captain: Initializing dance systems...');
        
        // Initialize movement coaching systems
        this.initializeMovementCoaching();
        
        // Initialize rehearsal management
        this.initializeRehearsalManagement();
        
        // Initialize quality control systems
        this.initializeQualityControl();
        
        // Initialize performer tracking
        this.initializePerformerTracking();
        
        console.log('✅ Dance Captain: Dance systems initialized');
    }

    /**
     * Initialize movement coaching systems
     */
    initializeMovementCoaching() {
        this.movementCoaching = {
            techniqueAnalysis: (movement, performer) => this.analyzeTechnique(movement, performer),
            correctionGuidance: (issue, solution) => this.provideCorrectionGuidance(issue, solution),
            skillDevelopment: (performer, goals) => this.developSkillPlan(performer, goals),
            confidenceBuilding: (performer, challenges) => this.buildConfidence(performer, challenges)
        };
        
        console.log('💃 Dance Captain: Movement coaching systems initialized');
    }

    /**
     * Initialize rehearsal management
     */
    initializeRehearsalManagement() {
        this.rehearsalManagement = {
            sessionPlanning: (objectives, time) => this.planRehearsalSession(objectives, time),
            progressTracking: (session, outcomes) => this.trackProgress(session, outcomes),
            noteManagement: (notes, priority) => this.manageRehearsalNotes(notes, priority),
            scheduleOptimization: (availability, needs) => this.optimizeSchedule(availability, needs)
        };
        
        console.log('💃 Dance Captain: Rehearsal management initialized');
    }

    /**
     * Initialize quality control systems
     */
    initializeQualityControl() {
        this.qualityControl = {
            performanceAssessment: new Map(),
            consistencyTracking: new Map(),
            improvementPlanning: new Map(),
            standardsMaintenance: new Map()
        };
        
        console.log('💃 Dance Captain: Quality control systems initialized');
    }

    /**
     * Initialize performer tracking
     */
    initializePerformerTracking() {
        this.performerTracking = {
            skillAssessment: new Map(),
            progressMonitoring: new Map(),
            individualSupport: new Map(),
            wellnessTracking: new Map()
        };
        
        console.log('💃 Dance Captain: Performer tracking initialized');
    }

    /**
     * Test dance captain capabilities
     */
    async testDanceCapabilities() {
        try {
            const testPrompt = `
            As a dance captain, develop a comprehensive movement training and maintenance plan.
            
            Dance captain scenario:
            - Production: Musical theater with complex choreography and ensemble numbers
            - Cast: Mixed experience levels, 15 performers, diverse movement backgrounds
            - Challenges: Maintaining quality, supporting struggling performers, ensemble unity
            - Timeline: 6-week rehearsal period, ongoing performance maintenance
            - Goals: Technical excellence, artistic expression, injury prevention
            
            Provide:
            1. Movement coaching and training strategy
            2. Rehearsal planning and quality maintenance protocols
            3. Individual performer support and development plans
            4. Integration with music, staging, and costume requirements
            5. Injury prevention and physical wellness protocols
            6. Performance quality standards and assessment methods
            7. Troubleshooting common movement challenges
            8. Long-term skill development and artistic growth
            
            Format as comprehensive dance captain plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('💃 Dance Captain: Dance captain capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('💃 Dance Captain: Dance capability test failed:', error);
            throw new Error(`Dance captain test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('💃 Dance Captain: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize dance project
        await this.initializeDanceProject(data.production);
        
        // Develop movement training plan
        await this.developMovementTrainingPlan(data.production);
    }

    /**
     * Initialize dance project
     */
    async initializeDanceProject(production) {
        console.log('💃 Dance Captain: Initializing dance project...');
        
        this.danceProject = {
            production: production,
            movementPlan: null,
            rehearsalSchedule: new Map(),
            performerProgress: new Map(),
            choreographyNotes: new Map(),
            performanceMetrics: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ Dance Captain: Dance project initialized');
    }

    /**
     * Develop movement training plan for production
     */
    async developMovementTrainingPlan(production) {
        try {
            console.log('💃 Dance Captain: Developing movement training plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive movement training plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Movement coaching strategy and individual performer support
                2. Rehearsal planning and choreography maintenance protocols
                3. Quality control standards and performance assessment methods
                4. Integration with music, staging, and costume requirements
                5. Injury prevention and physical wellness programs
                6. Skill development progression and artistic growth planning
                7. Ensemble coordination and unity building techniques
                8. Performance preparation and maintenance strategies
                9. Troubleshooting common movement challenges
                10. Long-term development and career support
                
                Provide a detailed movement training plan that ensures technical excellence, artistic expression, and performer wellness.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.danceProject.movementPlan = response.content;
                    this.danceProject.status = 'plan_complete';
                    
                    console.log('✅ Dance Captain: Movement training plan developed');
                    
                    // Extract training priorities
                    await this.extractTrainingPriorities(response.content);
                    
                    // Begin rehearsal scheduling
                    await this.beginRehearsalScheduling(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('dance:training-plan-complete', {
                        production: production,
                        plan: response.content,
                        danceCaptain: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Dance Captain: Plan development failed:', error.message);
            this.danceProject.status = 'plan_error';
        }
    }

    /**
     * Handle choreography creation
     */
    async onChoreographyCreated(data) {
        console.log('💃 Dance Captain: New choreography received -', data.section);
        
        await this.analyzeChoreographyRequirements(data.choreography, data.difficulty);
    }

    /**
     * Handle movement notes
     */
    async onMovementNotes(data) {
        console.log('💃 Dance Captain: Movement notes received');
        
        await this.processMovementNotes(data.notes, data.performers, data.priority);
    }

    /**
     * Handle quality checks
     */
    async onQualityCheck(data) {
        console.log('💃 Dance Captain: Quality check requested');
        
        await this.performQualityAssessment(data.section, data.criteria);
    }

    /**
     * Extract training priorities from plan
     */
    async extractTrainingPriorities(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            technical: 'Precision and consistency in execution',
            artistic: 'Character expression and emotional authenticity',
            physical: 'Strength, flexibility, and injury prevention',
            ensemble: 'Unity, timing, and spatial awareness'
        };
    }

    /**
     * Get dance captain status
     */
    getDanceCaptainStatus() {
        return {
            currentProject: {
                active: !!this.danceProject.production,
                title: this.danceProject.production?.title,
                status: this.danceProject.status,
                planComplete: !!this.danceProject.movementPlan,
                rehearsalsScheduled: this.danceProject.rehearsalSchedule.size
            },
            training: {
                performersTracked: this.danceProject.performerProgress.size,
                choreographyNotes: this.danceProject.choreographyNotes.size,
                performanceMetrics: this.danceProject.performanceMetrics.size
            },
            capabilities: this.danceCapabilities,
            methodologies: {
                movementStyles: Object.keys(this.movementStyles).length,
                trainingMethods: Object.keys(this.trainingMethodologies).length,
                rehearsalStrategies: Object.keys(this.rehearsalStrategies).length,
                performanceStandards: Object.keys(this.performanceStandards).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('💃 Dance Captain: Concluding movement coordination session...');
        
        // Finalize dance project
        if (this.danceProject.status !== 'idle') {
            this.danceProject.status = 'completed';
            this.danceProject.completedAt = new Date();
        }
        
        // Generate dance captain summary
        if (this.currentProduction) {
            const danceSummary = this.generateDanceSummary();
            console.log('💃 Dance Captain: Movement coordination summary generated');
        }
        
        console.log('💃 Dance Captain: Movement excellence and performer development concluded');
    }

    /**
     * Generate dance captain summary
     */
    generateDanceSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            training: {
                planDeveloped: !!this.danceProject.movementPlan,
                rehearsalsCompleted: this.danceProject.rehearsalSchedule.size,
                performersSupported: this.danceProject.performerProgress.size,
                qualityMaintained: this.danceProject.choreographyNotes.size
            },
            performance: {
                technicalStandards: this.calculateTechnicalStandards(),
                artisticQuality: this.calculateArtisticQuality(),
                ensembleUnity: this.calculateEnsembleUnity()
            },
            collaboration: {
                choreographerCoordination: !!this.choreographer,
                musicDirectorIntegration: !!this.musicDirector,
                movementCoachAlignment: !!this.movementCoach
            }
        };
    }

    /**
     * Calculate technical standards
     */
    calculateTechnicalStandards() {
        return Array.from(this.danceProject.performanceMetrics.values())
            .filter(metric => metric.technicalPassed).length;
    }

    /**
     * Calculate artistic quality
     */
    calculateArtisticQuality() {
        const metrics = Array.from(this.danceProject.performanceMetrics.values());
        return metrics.length > 0
            ? metrics.reduce((sum, metric) => sum + (metric.artisticScore || 0), 0) / metrics.length
            : 0;
    }

    /**
     * Calculate ensemble unity
     */
    calculateEnsembleUnity() {
        return Array.from(this.danceProject.performerProgress.values())
            .filter(progress => progress.ensembleReady).length;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DanceCaptainAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.DanceCaptainAgent = DanceCaptainAgent;
    console.log('💃 Dance Captain Agent loaded - Ready for movement excellence and performer development');
}