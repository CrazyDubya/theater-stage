/**
 * FightChoreographerAgent.js - AI-Powered Stage Combat Coordination
 * 
 * The Fight Choreographer Agent uses Ollama LLM to design and coordinate safe,
 * compelling stage combat sequences. Prioritizes performer safety while creating
 * visually striking and dramatically effective fight choreography.
 * 
 * Features:
 * - AI-driven fight choreography design and planning
 * - Safety protocol enforcement and risk assessment
 * - Weapon training and technique instruction
 * - Real-time safety monitoring during performance
 * - Integration with director vision and story needs
 * - Specialized training for different combat styles
 */

class FightChoreographerAgent extends BaseAgent {
    constructor(config = {}) {
        super('fight-choreographer', {
            name: 'Fight Choreographer',
            role: 'fight-choreographer',
            priority: 80, // Very high priority for safety
            maxActionsPerSecond: 4,
            personality: config.personality || 'safety-focused',
            ...config
        });
        
        // Fight Choreographer specific properties
        this.ollamaInterface = null;
        this.choreographyStyle = config.style || 'theatrical-realism';
        this.creativityLevel = config.creativity || 0.75; // Lower creativity for safety
        
        // Stage combat capabilities
        this.combatCapabilities = {
            safetyManagement: {
                riskAssessment: true,
                injuryPrevention: true,
                emergencyProtocols: true,
                performerWellbeing: true,
                equipmentInspection: true
            },
            choreographyDesign: {
                handToHandCombat: true,
                weaponCombat: true,
                groupFighting: true,
                fallsAndStunts: true,
                periodAccurateTechniques: true
            },
            weaponSpecialties: {
                swords: true,
                daggers: true,
                staffs: true,
                unarmedCombat: true,
                firearms: true
            },
            trainingExpertise: {
                basicSafety: true,
                techniqueInstruction: true,
                rehearsalSupervision: true,
                performanceCoaching: true,
                emergencyResponse: true
            },
            styleExpertise: {
                europeanSwordplay: true,
                easternMartialArts: true,
                modernCombat: true,
                fantasyFighting: true,
                historicalCombat: true
            }
        };
        
        // Current fight project
        this.fightProject = {
            production: null,
            combatConcept: null,
            fightSequences: new Map(),
            safetyProtocols: new Map(),
            trainingSchedule: new Map(),
            performerAssessments: new Map(),
            status: 'idle'
        };
        
        // Safety protocols and standards
        this.safetyProtocols = {
            pre_rehearsal: {
                warmup: {
                    duration: '15-20 minutes',
                    components: ['cardiovascular prep', 'joint mobility', 'muscle activation'],
                    mandatory: true
                },
                equipment_check: {
                    weapons: 'Inspect for damage, wear, proper function',
                    protective_gear: 'Verify fit, condition, coverage',
                    environment: 'Clear space, appropriate flooring, lighting',
                    documentation: 'Log all equipment status'
                },
                performer_assessment: {
                    physical_condition: 'Check for injuries, fatigue, illness',
                    mental_state: 'Assess focus, confidence, readiness',
                    skill_level: 'Verify technique competency for sequence',
                    consent: 'Confirm willing participation in all elements'
                }
            },
            during_rehearsal: {
                supervision: {
                    constant_oversight: 'Fight choreographer present at all times',
                    safety_calls: 'Authority to stop any sequence immediately',
                    technique_correction: 'Immediate feedback on dangerous execution',
                    pace_management: 'Control intensity and repetition'
                },
                communication: {
                    clear_cues: 'Establish and maintain consistent signals',
                    check_ins: 'Regular performer welfare assessments',
                    problem_reporting: 'Immediate stop for any issues',
                    documentation: 'Record incidents, adjustments, concerns'
                }
            },
            post_rehearsal: {
                cooldown: {
                    duration: '10-15 minutes',
                    components: ['gentle movement', 'stretching', 'breathing'],
                    mandatory: true
                },
                assessment: {
                    performer_feedback: 'Check for pain, discomfort, concerns',
                    technique_review: 'Discuss improvements and safety notes',
                    equipment_maintenance: 'Clean, inspect, store properly',
                    preparation_notes: 'Plan for next session'
                }
            }
        };
        
        // Combat techniques and styles
        this.combatTechniques = {
            unarmed_combat: {
                striking: {
                    punches: {
                        safety: 'No contact, controlled distance, clear targeting',
                        techniques: ['jab', 'cross', 'hook', 'uppercut'],
                        staging: 'React before impact, sell the effect'
                    },
                    kicks: {
                        safety: 'Low kicks only, no head contact, stable footing',
                        techniques: ['front kick', 'side kick', 'sweep'],
                        staging: 'Clear miss distance, dramatic reaction'
                    }
                },
                grappling: {
                    throws: {
                        safety: 'Proper falling technique, padded surfaces, slow execution',
                        techniques: ['hip toss', 'shoulder throw', 'trip'],
                        staging: 'Cooperative movement, controlled landing'
                    },
                    holds: {
                        safety: 'No pressure on joints/neck, clear escape signals',
                        techniques: ['arm lock', 'choke hold simulation', 'pin'],
                        staging: 'Apparent force without actual restraint'
                    }
                }
            },
            weapon_combat: {
                swords: {
                    single_sword: {
                        safety: 'Blunted edges, tip control, measure distance',
                        techniques: ['cut', 'thrust', 'parry', 'bind'],
                        staging: 'Sound effects enhance visual'
                    },
                    sword_and_dagger: {
                        safety: 'Additional complexity requires extra training',
                        techniques: ['simultaneous attack/defense', 'dagger parries', 'complex binds'],
                        staging: 'Coordinated dual-weapon choreography'
                    }
                },
                staff_weapons: {
                    quarterstaff: {
                        safety: 'Padded ends, controlled swings, clear patterns',
                        techniques: ['thrust', 'sweep', 'block', 'spin'],
                        staging: 'Large movements for visual impact'
                    },
                    spear: {
                        safety: 'Rubber tip, thrust control, formation fighting',
                        techniques: ['thrust', 'sweep', 'block', 'formation'],
                        staging: 'Military precision and coordination'
                    }
                }
            },
            falls_and_stunts: {
                basic_falls: {
                    backwards: {
                        safety: 'Proper breakfall technique, padded surface',
                        technique: 'Chin to chest, arm slap, roll out',
                        progression: 'Start low, increase height gradually'
                    },
                    forwards: {
                        safety: 'Hand placement, head protection, roll through',
                        technique: 'Forward roll, side fall, controlled collapse',
                        progression: 'Practice components separately first'
                    }
                },
                death_scenes: {
                    sword_death: {
                        safety: 'No actual contact, dramatic timing',
                        technique: 'Reaction before contact, staged penetration',
                        staging: 'Body positioning hides blade'
                    },
                    poison_death: {
                        safety: 'Controlled collapse, safe surface',
                        technique: 'Progressive weakness, supported fall',
                        staging: 'Internal struggle made external'
                    }
                }
            }
        };
        
        // Weapon specifications and safety
        this.weaponSpecifications = {
            stage_swords: {
                rapier: {
                    characteristics: 'Light, flexible blade; minimal hand protection',
                    safety_features: 'Blunted tip, flexible steel, button end',
                    techniques: 'Thrusting primary, cutting secondary',
                    training_level: 'Intermediate to advanced'
                },
                broadsword: {
                    characteristics: 'Heavier blade, significant hand protection',
                    safety_features: 'Dulled edges, rounded tip, balanced weight',
                    techniques: 'Cutting primary, thrusting secondary',
                    training_level: 'Beginner to intermediate'
                },
                smallsword: {
                    characteristics: 'Very light, thrusting only weapon',
                    safety_features: 'Flexible blade, button tip, light weight',
                    techniques: 'Precise thrusting, elegant movement',
                    training_level: 'Intermediate'
                }
            },
            daggers: {
                main_gauche: {
                    characteristics: 'Left-hand defensive weapon',
                    safety_features: 'Dulled blade, protective crossguard',
                    techniques: 'Parrying, trapping, close combat',
                    training_level: 'Advanced'
                },
                rondel: {
                    characteristics: 'Thrusting dagger, armor piercing design',
                    safety_features: 'Blunted point, secure grip',
                    techniques: 'Close-quarters thrusting',
                    training_level: 'Intermediate'
                }
            },
            improvised_weapons: {
                furniture: {
                    chairs: {
                        safety: 'Lightweight construction, breakaway elements',
                        techniques: 'Blocking, striking, throwing',
                        staging: 'Pre-weakened for dramatic breaks'
                    },
                    bottles: {
                        safety: 'Sugar glass or rubber construction',
                        techniques: 'Throwing, breaking, threatening',
                        staging: 'Hidden switch for break effect'
                    }
                }
            }
        };
        
        // Training progressions and assessments
        this.trainingProgressions = {
            beginner: {
                week_1: {
                    focus: 'Basic safety and stance',
                    skills: ['proper grip', 'basic guard', 'footwork', 'measure'],
                    assessment: 'Safety consciousness, basic control'
                },
                week_2: {
                    focus: 'Simple attacks and defenses',
                    skills: ['basic cuts', 'simple parries', 'recovery', 'timing'],
                    assessment: 'Technique accuracy, safety maintenance'
                },
                week_3: {
                    focus: 'Combination movements',
                    skills: ['attack sequences', 'defense chains', 'flow', 'stamina'],
                    assessment: 'Sequence retention, consistent safety'
                }
            },
            intermediate: {
                week_1: {
                    focus: 'Advanced techniques',
                    skills: ['complex attacks', 'advanced parries', 'counters', 'speed'],
                    assessment: 'Technical proficiency, adaptation'
                },
                week_2: {
                    focus: 'Partner coordination',
                    skills: ['precise timing', 'mutual safety', 'dramatic effect', 'improvisation'],
                    assessment: 'Partnership skills, performance quality'
                }
            },
            advanced: {
                ongoing: {
                    focus: 'Mastery and teaching',
                    skills: ['flawless execution', 'safety leadership', 'choreography creation', 'mentoring'],
                    assessment: 'Mastery demonstration, leadership capability'
                }
            }
        };
        
        // Performance risk assessment
        this.riskAssessment = {
            environmental_factors: {
                stage_surface: { risk_level: 'high', mitigation: 'Non-slip treatment, inspection' },
                lighting: { risk_level: 'medium', mitigation: 'Adequate visibility, no shadows' },
                space_constraints: { risk_level: 'high', mitigation: 'Choreography adaptation, clear boundaries' },
                audience_proximity: { risk_level: 'medium', mitigation: 'Safety barriers, controlled movement' }
            },
            performer_factors: {
                experience_level: { assessment: 'Individual evaluation required' },
                physical_condition: { assessment: 'Daily check required' },
                stress_level: { assessment: 'Performance anxiety monitoring' },
                costume_restrictions: { assessment: 'Movement limitation analysis' }
            },
            sequence_complexity: {
                simple_sequences: { risk_level: 'low', description: 'Basic attack/defense patterns' },
                moderate_sequences: { risk_level: 'medium', description: 'Multiple weapons, movement' },
                complex_sequences: { risk_level: 'high', description: 'Group fights, stunts, elevated surfaces' }
            }
        };
        
        // Emergency protocols
        this.emergencyProtocols = {
            injury_response: {
                immediate: {
                    stop_all_activity: 'Halt rehearsal/performance immediately',
                    assess_injury: 'Determine severity without moving injured person',
                    call_help: 'Contact appropriate medical assistance',
                    secure_area: 'Clear space, maintain calm'
                },
                documentation: {
                    incident_report: 'Detailed description of events leading to injury',
                    witness_statements: 'Collect accounts from all present',
                    medical_records: 'Hospital reports, treatment details',
                    follow_up: 'Return-to-activity assessment'
                }
            },
            equipment_failure: {
                weapon_break: {
                    immediate_stop: 'Halt activity, clear broken pieces',
                    injury_check: 'Assess all participants for cuts/injuries',
                    replacement: 'Substitute backup equipment if available',
                    investigation: 'Determine cause of failure'
                }
            },
            performance_emergencies: {
                performer_freeze: {
                    assessment: 'Determine if injury or performance anxiety',
                    support: 'Calm assistance, safety priority',
                    continuation: 'Modify or skip sequence as needed',
                    follow_up: 'Post-performance check-in'
                }
            }
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.stageManager = null;
        this.technicalDirector = null;
        this.currentProduction = null;
        
        console.log('⚔️ Fight Choreographer Agent: Ready to create safe and spectacular stage combat');
    }

    /**
     * Initialize Fight Choreographer with system integration
     */
    async onInitialize() {
        try {
            console.log('⚔️ Fight Choreographer: Initializing stage combat systems...');
            
            // Connect to Ollama interface for AI choreography
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI fight choreography requires LLM assistance.');
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
            
            // Configure AI for fight choreography with safety focus
            this.ollamaInterface.updatePerformanceContext({
                role: 'fight_choreographer',
                choreography_style: this.choreographyStyle,
                creativity_mode: 'safety_first_choreography',
                specialization: 'stage_combat_safety'
            });
            
            // Connect to related agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('⚔️ Fight Choreographer: Connected to Creative Director');
            }
            
            if (window.stageManagerAgent) {
                this.stageManager = window.stageManagerAgent;
                console.log('⚔️ Fight Choreographer: Connected to Stage Manager');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('⚔️ Fight Choreographer: Connected to Technical Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize combat systems
            await this.initializeCombatSystems();
            
            // Test fight choreography capabilities
            await this.testFightChoreographyCapabilities();
            
            console.log('⚔️ Fight Choreographer: Ready to create safe and spectacular combat!')
            
        } catch (error) {
            console.error('⚔️ Fight Choreographer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI FIGHT CHOREOGRAPHY:
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
     * Subscribe to production events for fight coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('script:fight-scenes-identified', (data) => this.onFightScenesIdentified(data));
            window.theaterEventBus.subscribe('fight:choreography-request', (data) => this.onChoreographyRequested(data));
            window.theaterEventBus.subscribe('fight:safety-concern', (data) => this.onSafetyConcern(data));
            window.theaterEventBus.subscribe('fight:training-needed', (data) => this.onTrainingNeeded(data));
            window.theaterEventBus.subscribe('performance:fight-emergency', (data) => this.onFightEmergency(data));
            
            console.log('⚔️ Fight Choreographer: Subscribed to stage combat events');
        }
    }

    /**
     * Initialize combat systems
     */
    async initializeCombatSystems() {
        console.log('⚔️ Fight Choreographer: Initializing combat systems...');
        
        // Initialize safety management
        this.initializeSafetyManagement();
        
        // Initialize choreography tools
        this.initializeChoreographyTools();
        
        // Initialize training systems
        this.initializeTrainingSystems();
        
        console.log('✅ Fight Choreographer: Combat systems initialized');
    }

    /**
     * Initialize safety management
     */
    initializeSafetyManagement() {
        this.safetyManagement = {
            riskAssessor: (sequence, performers) => this.assessRisk(sequence, performers),
            protocolEnforcer: (situation) => this.enforceProtocol(situation),
            emergencyResponder: (emergency) => this.respondToEmergency(emergency),
            safetyMonitor: () => this.monitorSafety()
        };
        
        console.log('⚔️ Fight Choreographer: Safety management initialized');
    }

    /**
     * Initialize choreography tools
     */
    initializeChoreographyTools() {
        this.choreographyTools = {
            sequenceDesigner: (requirements) => this.designFightSequence(requirements),
            movementPlanner: (space, performers) => this.planMovement(space, performers),
            timingCoordinator: (sequence, music) => this.coordinateTiming(sequence, music),
            effectIntegrator: (choreography, effects) => this.integrateEffects(choreography, effects)
        };
        
        console.log('⚔️ Fight Choreographer: Choreography tools initialized');
    }

    /**
     * Initialize training systems
     */
    initializeTrainingSystems() {
        this.trainingSystems = {
            skillAssessor: (performer) => this.assessPerformerSkills(performer),
            progressionPlanner: (level, goals) => this.planTrainingProgression(level, goals),
            sessionManager: (training) => this.manageTrainingSession(training),
            performanceEvaluator: (execution) => this.evaluatePerformance(execution)
        };
        
        console.log('⚔️ Fight Choreographer: Training systems initialized');
    }

    /**
     * Test fight choreography capabilities
     */
    async testFightChoreographyCapabilities() {
        try {
            const testPrompt = `
            As a fight choreographer, design a safe stage combat sequence for a theatrical production.
            
            Scene requirements:
            - Setting: Medieval sword duel between protagonist and antagonist
            - Dramatic purpose: Climactic confrontation, hero's redemption
            - Performers: One experienced, one beginner in stage combat
            - Space: 15x20 foot stage area with steps downstage
            - Duration: 3-4 minutes of combat
            - Safety priority: Absolute - no acceptable risk of injury
            
            Provide:
            1. Overall choreographic concept and dramatic arc
            2. Specific safety protocols for this sequence
            3. Training plan for the beginner performer
            4. Step-by-step choreography breakdown
            5. Risk assessment and mitigation strategies
            6. Equipment specifications and safety features
            7. Integration with direction and staging
            8. Emergency protocols specific to this sequence
            
            Format as comprehensive fight choreography plan with safety emphasis.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('⚔️ Fight Choreographer: Choreography capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('⚔️ Fight Choreographer: Choreography capability test failed:', error);
            throw new Error(`Fight choreography test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('⚔️ Fight Choreographer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize fight project
        await this.initializeFightProject(data.production);
        
        // Develop combat concept
        await this.developCombatConcept(data.production);
    }

    /**
     * Initialize fight project
     */
    async initializeFightProject(production) {
        console.log('⚔️ Fight Choreographer: Initializing fight project...');
        
        this.fightProject = {
            production: production,
            combatConcept: null,
            fightSequences: new Map(),
            safetyProtocols: new Map(),
            trainingSchedule: new Map(),
            performerAssessments: new Map(),
            status: 'safety_planning',
            createdAt: new Date()
        };
        
        // Establish safety protocols
        await this.establishSafetyProtocols(production);
        
        console.log('✅ Fight Choreographer: Fight project initialized');
    }

    /**
     * Develop combat concept for production
     */
    async developCombatConcept(production) {
        try {
            console.log('⚔️ Fight Choreographer: Developing combat concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive stage combat concept for a ${production.type} production titled "${production.title}".
                
                Safety is the absolute top priority. Consider:
                1. Overall approach to stage violence and combat
                2. Safety protocols and risk management strategies
                3. Performer training requirements and timelines
                4. Equipment needs and safety specifications
                5. Integration with directorial vision while maintaining safety
                6. Choreographic style appropriate for the production
                7. Staging considerations for safe execution
                8. Emergency protocols and contingency planning
                9. Audience impact while ensuring performer wellbeing
                10. Budget considerations for safety equipment and training
                
                Provide a detailed combat concept that prioritizes safety while serving the dramatic needs of the production.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.fightProject.combatConcept = response.content;
                    this.fightProject.status = 'concept_complete';
                    
                    console.log('✅ Fight Choreographer: Combat concept developed');
                    
                    // Extract safety requirements from concept
                    await this.extractSafetyRequirements(response.content);
                    
                    // Begin training plan development
                    await this.beginTrainingPlanDevelopment(production, response.content);
                    
                    // Share concept with production team
                    window.theaterEventBus?.publish('fight:concept-complete', {
                        production: production,
                        concept: response.content,
                        fightChoreographer: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Fight Choreographer: Combat concept development failed:', error.message);
            this.fightProject.status = 'concept_error';
        }
    }

    /**
     * Handle fight scenes identification
     */
    async onFightScenesIdentified(data) {
        console.log('⚔️ Fight Choreographer: Fight scenes identified in script');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.analyzeFightScenes(data.scenes);
        }
    }

    /**
     * Analyze fight scenes for safety and choreography
     */
    async analyzeFightScenes(scenes) {
        console.log('⚔️ Fight Choreographer: Analyzing fight scenes...');
        
        for (const scene of scenes) {
            await this.analyzeIndividualFightScene(scene);
        }
    }

    /**
     * Analyze individual fight scene
     */
    async analyzeIndividualFightScene(scene) {
        try {
            console.log(`⚔️ Fight Choreographer: Analyzing fight scene - ${scene.name}...`);
            
            const analysisPrompt = `
            Analyze this fight scene for safety and choreographic requirements:
            
            Scene: ${scene.name}
            Description: ${scene.description || 'Fight scene details to be determined'}
            Characters: ${scene.characters?.join(', ') || 'Characters not specified'}
            Weapons: ${scene.weapons?.join(', ') || 'Weapons not specified'}
            Context: ${scene.context || 'Context not provided'}
            
            Production: ${this.currentProduction?.title}
            Combat Concept: ${this.fightProject.combatConcept}
            
            Provide comprehensive safety analysis:
            1. Risk assessment for this specific scene
            2. Safety protocols required
            3. Training requirements for performers
            4. Equipment and weapon specifications
            5. Choreographic approach and style
            6. Space and staging considerations
            7. Integration with scene's dramatic purpose
            8. Timeline for safe preparation
            9. Emergency protocols for this scene
            10. Performance monitoring requirements
            
            Prioritize safety while serving dramatic needs.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const sceneAnalysis = {
                    scene: scene,
                    analysis: response.content,
                    riskLevel: this.assessSceneRiskLevel(response.content),
                    safetyRequirements: await this.extractSceneSafetyRequirements(response.content),
                    trainingNeeds: await this.extractTrainingNeeds(response.content),
                    analyzedAt: new Date(),
                    status: 'analyzed'
                };
                
                this.fightProject.fightSequences.set(scene.name, sceneAnalysis);
                
                console.log(`✅ Fight Choreographer: Scene analysis complete - ${scene.name}`);
                
                // If high risk, immediate safety planning
                if (sceneAnalysis.riskLevel === 'high') {
                    await this.planHighRiskSafety(scene, sceneAnalysis);
                }
                
                return sceneAnalysis;
            }
            
        } catch (error) {
            console.error(`⚔️ Fight Choreographer: Scene analysis failed for ${scene.name}:`, error);
            return null;
        }
    }

    /**
     * Handle choreography requests
     */
    async onChoreographyRequested(data) {
        console.log('⚔️ Fight Choreographer: Choreography requested -', data.sequenceType);
        
        await this.createFightChoreography(data.sequenceType, data.requirements, data.safetyLevel);
    }

    /**
     * Handle safety concerns
     */
    async onSafetyConcern(data) {
        console.log('⚔️ Fight Choreographer: Safety concern raised -', data.concern);
        
        await this.addressSafetyConcern(data.concern, data.severity, data.source);
    }

    /**
     * Address safety concern immediately
     */
    async addressSafetyConcern(concern, severity, source) {
        const safetyConcern = {
            concern: concern,
            severity: severity,
            source: source,
            response: await this.generateSafetyResponse(concern, severity),
            addressedAt: new Date(),
            status: severity === 'urgent' ? 'immediate_action' : 'under_review'
        };
        
        this.fightProject.safetyProtocols.set(`concern_${Date.now()}`, safetyConcern);
        
        // If urgent, halt relevant activities
        if (severity === 'urgent') {
            await this.implementEmergencyStop(concern);
        }
        
        console.log(`⚔️ Fight Choreographer: Safety concern addressed - ${concern}`);
        
        // Notify relevant personnel
        window.theaterEventBus?.publish('fight:safety-addressed', {
            concern: safetyConcern,
            fightChoreographer: this.config.name
        });
    }

    /**
     * Handle training requests
     */
    async onTrainingNeeded(data) {
        console.log('⚔️ Fight Choreographer: Training needed -', data.trainingType);
        
        await this.planTraining(data.trainingType, data.performers, data.timeline);
    }

    /**
     * Handle fight emergencies
     */
    async onFightEmergency(data) {
        console.log('⚔️ Fight Choreographer: FIGHT EMERGENCY -', data.emergencyType);
        
        await this.respondToFightEmergency(data.emergencyType, data.details, data.location);
    }

    /**
     * Respond to fight emergency
     */
    async respondToFightEmergency(emergencyType, details, location) {
        console.log(`⚔️ Fight Choreographer: Responding to ${emergencyType} emergency...`);
        
        const emergencyResponse = {
            emergencyType: emergencyType,
            details: details,
            location: location,
            response: this.emergencyProtocols[emergencyType] || this.emergencyProtocols.injury_response,
            respondedAt: new Date(),
            status: 'emergency_active'
        };
        
        // Implement immediate emergency protocol
        await this.implementEmergencyProtocol(emergencyResponse);
        
        // Notify all relevant personnel
        window.theaterEventBus?.publish('fight:emergency-response', {
            emergency: emergencyResponse,
            fightChoreographer: this.config.name
        });
    }

    /**
     * Assess scene risk level
     */
    assessSceneRiskLevel(analysisContent) {
        // Simplified assessment - would use more sophisticated analysis
        if (analysisContent.includes('high risk') || analysisContent.includes('dangerous')) {
            return 'high';
        } else if (analysisContent.includes('moderate') || analysisContent.includes('caution')) {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Extract safety requirements from analysis
     */
    async extractSceneSafetyRequirements(analysisContent) {
        // Simplified extraction - would parse detailed requirements
        return [
            'Proper safety equipment required',
            'Adequate training time needed',
            'Constant supervision during rehearsal',
            'Emergency protocols established'
        ];
    }

    /**
     * Establish safety protocols for production
     */
    async establishSafetyProtocols(production) {
        const productionSafetyProtocols = {
            ...this.safetyProtocols,
            production_specific: {
                venue_safety: 'Specific to performance venue',
                cast_considerations: 'Based on performer experience levels',
                equipment_standards: 'Production-specific weapon requirements',
                emergency_contacts: 'Local medical and safety resources'
            }
        };
        
        this.fightProject.safetyProtocols.set('production_protocols', productionSafetyProtocols);
        
        console.log('⚔️ Fight Choreographer: Production safety protocols established');
    }

    /**
     * Get fight choreographer status
     */
    getFightChoreographerStatus() {
        return {
            currentProject: {
                active: !!this.fightProject.production,
                title: this.fightProject.production?.title,
                status: this.fightProject.status,
                conceptComplete: !!this.fightProject.combatConcept,
                scenesAnalyzed: this.fightProject.fightSequences.size
            },
            safety: {
                protocolsEstablished: this.fightProject.safetyProtocols.size,
                performerAssessments: this.fightProject.performerAssessments.size,
                riskMitigationActive: this.calculateRiskMitigation(),
                emergencyProceduresReady: Object.keys(this.emergencyProtocols).length
            },
            training: {
                trainingScheduled: this.fightProject.trainingSchedule.size,
                progressionLevels: Object.keys(this.trainingProgressions).length,
                skillAssessments: this.calculateSkillAssessments()
            },
            capabilities: this.combatCapabilities,
            technical: {
                combatTechniques: Object.keys(this.combatTechniques).length,
                weaponSpecifications: Object.keys(this.weaponSpecifications).length,
                safetyProtocols: Object.keys(this.safetyProtocols).length,
                riskAssessmentCategories: Object.keys(this.riskAssessment).length
            }
        };
    }

    /**
     * Calculate risk mitigation effectiveness
     */
    calculateRiskMitigation() {
        return Array.from(this.fightProject.fightSequences.values())
            .filter(sequence => sequence.riskLevel !== 'high').length;
    }

    /**
     * Calculate skill assessments completed
     */
    calculateSkillAssessments() {
        return this.fightProject.performerAssessments.size;
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('⚔️ Fight Choreographer: Concluding stage combat session...');
        
        // Finalize fight project
        if (this.fightProject.status !== 'idle') {
            this.fightProject.status = 'completed';
            this.fightProject.completedAt = new Date();
        }
        
        // Generate fight choreography summary
        if (this.currentProduction) {
            const fightSummary = this.generateFightSummary();
            console.log('⚔️ Fight Choreographer: Fight choreography summary generated');
        }
        
        console.log('⚔️ Fight Choreographer: Stage combat work concluded');
    }

    /**
     * Generate fight choreography summary
     */
    generateFightSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            safety: {
                conceptDeveloped: !!this.fightProject.combatConcept,
                protocolsEstablished: this.fightProject.safetyProtocols.size,
                riskAssessmentsCompleted: this.fightProject.fightSequences.size,
                emergencyProceduresReady: Object.keys(this.emergencyProtocols).length
            },
            choreography: {
                scenesAnalyzed: this.fightProject.fightSequences.size,
                sequencesChoreographed: this.calculateChoreographedSequences(),
                trainingPlansCreated: this.fightProject.trainingSchedule.size,
                performerAssessments: this.fightProject.performerAssessments.size
            },
            coordination: {
                creativeDirectorIntegration: !!this.creativeDirector,
                stageManagerCoordination: !!this.stageManager,
                technicalDirectorCollaboration: !!this.technicalDirector,
                safetyPriorityMaintained: true
            }
        };
    }

    /**
     * Calculate choreographed sequences
     */
    calculateChoreographedSequences() {
        return Array.from(this.fightProject.fightSequences.values())
            .filter(sequence => sequence.status === 'choreographed').length;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FightChoreographerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.FightChoreographerAgent = FightChoreographerAgent;
    console.log('⚔️ Fight Choreographer Agent loaded - Ready for safe and spectacular stage combat');
}