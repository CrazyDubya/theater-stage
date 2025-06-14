/**
 * UnderstudiesCoordinatorAgent.js - AI-Powered Backup Performer Management
 * 
 * The Understudies Coordinator Agent uses Ollama LLM to manage all aspects
 * of understudy and swing performer coordination, ensuring seamless coverage
 * for absent performers and maintaining show quality standards.
 * 
 * Features:
 * - AI-driven understudy scheduling and coordination
 * - Backup performer training and preparation
 * - Emergency coverage and last-minute substitutions
 * - Performance quality maintenance with alternates
 * - Integration with casting and production management
 * - Risk mitigation and contingency planning
 */

class UnderstudiesCoordinatorAgent extends BaseAgent {
    constructor(config = {}) {
        super('understudies-coordinator', {
            name: 'Understudies Coordinator',
            role: 'understudies-coordinator',
            priority: 50, // Important for production continuity
            maxActionsPerSecond: 4,
            personality: config.personality || 'reliable',
            ...config
        });
        
        // Understudies Coordinator specific properties
        this.ollamaInterface = null;
        this.coordinationApproach = config.approach || 'proactive-prepared';
        this.creativityLevel = config.creativity || 0.70;
        
        // Understudies coordination capabilities
        this.understudiesCapabilities = {
            scheduling: {
                coverageManagement: true,
                availabilityTracking: true,
                conflictResolution: true,
                emergencyCoordination: true,
                performanceCalendar: true
            },
            training: {
                preparationCoordination: true,
                rehearsalScheduling: true,
                skillDevelopment: true,
                performanceReadiness: true,
                qualityMaintenance: true
            },
            communication: {
                performerNotification: true,
                productionLiaison: true,
                emergencyAlerts: true,
                statusUpdates: true,
                feedbackCoordination: true
            },
            qualityAssurance: {
                readinessAssessment: true,
                performanceMonitoring: true,
                improvementPlanning: true,
                standardsMaintenance: true,
                integrationSupport: true
            },
            riskManagement: {
                contingencyPlanning: true,
                emergencyProcedures: true,
                backupStrategies: true,
                crisisManagement: true,
                preventativeActions: true
            },
            collaboration: {
                castingCoordination: true,
                directorLiaison: true,
                coachingIntegration: true,
                productionSupport: true,
                performerAdvocacy: true
            }
        };
        
        // Current understudies project
        this.understudiesProject = {
            production: null,
            coveragePlan: null,
            understudyRoster: new Map(),
            trainingSchedule: new Map(),
            performanceTracking: new Map(),
            emergencyProtocols: new Map(),
            status: 'idle'
        };
        
        // Understudy types and coverage strategies
        this.coverageStrategies = {
            understudy_types: {
                principal_understudies: {
                    definition: 'Dedicated backup for specific leading roles',
                    preparation: 'Full role preparation, regular rehearsals, detailed coaching',
                    scheduling: 'Coordinated availability, performance-ready at all times',
                    integration: 'Regular cast integration, relationship building, artistic consistency'
                },
                ensemble_swings: {
                    definition: 'Multi-role coverage for ensemble positions',
                    preparation: 'Multiple track learning, quick-change training, versatility focus',
                    scheduling: 'Flexible availability, cross-training coordination',
                    integration: 'Ensemble integration, spacing familiarity, musical accuracy'
                },
                standby_performers: {
                    definition: 'On-call coverage for emergency situations',
                    preparation: 'Rapid preparation protocols, essential scenes focus',
                    scheduling: 'Emergency availability, last-minute readiness',
                    integration: 'Crisis integration, minimal rehearsal dependency'
                }
            },
            coverage_models: {
                one_to_one: {
                    structure: 'Single understudy per principal role',
                    advantages: 'Dedicated preparation, role specialization, quality consistency',
                    challenges: 'Higher cost, scheduling conflicts, limited flexibility',
                    best_for: 'Complex leading roles, star vehicles, quality-critical productions'
                },
                multi_role_coverage: {
                    structure: 'Single performer covering multiple similar roles',
                    advantages: 'Cost efficiency, performer development, scheduling flexibility',
                    challenges: 'Preparation complexity, potential quality variance',
                    best_for: 'Ensemble shows, similar character types, budget constraints'
                },
                swing_system: {
                    structure: 'Rotating performers covering multiple tracks',
                    advantages: 'Maximum flexibility, cost efficiency, experience diversity',
                    challenges: 'Complex coordination, training intensity, integration challenges',
                    best_for: 'Large ensemble shows, tour productions, long runs'
                }
            }
        };
        
        // Training and preparation protocols
        this.trainingProtocols = {
            preparation_phases: {
                initial_learning: {
                    timeline: 'First 2-3 weeks of rehearsal',
                    focus: 'Script learning, basic blocking, character understanding',
                    methods: 'Independent study, coaching sessions, observation',
                    goals: 'Foundational knowledge, preparation framework, role comprehension'
                },
                rehearsal_integration: {
                    timeline: 'Mid-rehearsal period',
                    focus: 'Staging rehearsals, scene work, ensemble integration',
                    methods: 'Put-in rehearsals, scene study, coaching intensives',
                    goals: 'Performance readiness, ensemble chemistry, technical proficiency'
                },
                performance_preparation: {
                    timeline: 'Tech week and beyond',
                    focus: 'Full run-throughs, technical integration, polish work',
                    methods: 'Complete rehearsals, technical runs, performance simulations',
                    goals: 'Show-ready performance, seamless integration, quality maintenance'
                },
                maintenance_training: {
                    timeline: 'Throughout run',
                    focus: 'Skill maintenance, adaptation, continuous improvement',
                    methods: 'Regular brush-up rehearsals, coaching check-ins, performance notes',
                    goals: 'Readiness maintenance, quality consistency, adaptation capability'
                }
            },
            skill_development: {
                role_specific_training: {
                    character_work: 'Character development, motivation, relationships',
                    vocal_preparation: 'Song learning, vocal coaching, style work',
                    movement_training: 'Choreography, blocking, character physicality',
                    scene_study: 'Dramatic work, comedic timing, emotional preparation'
                },
                technical_skills: {
                    quick_change_training: 'Costume changes, efficiency, safety protocols',
                    spacing_familiarity: 'Stage geography, ensemble positioning, traffic patterns',
                    cue_awareness: 'Light cues, sound cues, entrance/exit timing',
                    safety_protocols: 'Stage safety, emergency procedures, risk awareness'
                },
                integration_skills: {
                    ensemble_work: 'Chemistry building, collaborative skills, support techniques',
                    adaptation_abilities: 'Flexibility, problem-solving, real-time adjustment',
                    communication_skills: 'Professional interaction, feedback reception, team coordination',
                    performance_confidence: 'Stage presence, audience connection, professional demeanor'
                }
            }
        };
        
        // Emergency procedures and protocols
        self.emergencyProtocols = {
            notification_systems: {
                immediate_alerts: {
                    timeline: 'Within 30 minutes of absence notification',
                    recipients: 'Understudy, director, stage manager, relevant departments',
                    methods: 'Phone calls, text messages, emergency contacts',
                    content: 'Performance details, arrival time, preparation requirements'
                },
                preparation_coordination: {
                    timeline: '2-4 hours before performance',
                    activities: 'Costume fittings, makeup coordination, final coaching',
                    personnel: 'Wardrobe, makeup, coaching staff, technical crew',
                    priorities: 'Safety, quality, performer confidence, show continuity'
                },
                performance_support: {
                    timeline: 'Performance day',
                    support: 'Extra coaching, technical rehearsal, confidence building',
                    monitoring: 'Performance quality, audience reception, performer welfare',
                    follow_up: 'Post-performance notes, experience debriefing, improvement planning'
                }
            },
            contingency_planning: {
                multiple_absences: {
                    scenarios: 'Multiple principal absences, ensemble illness patterns',
                    strategies: 'Cascading coverage, role consolidation, scene adaptation',
                    decision_points: 'Performance viability, quality thresholds, audience notification',
                    implementation: 'Quick rehearsal protocols, technical adaptations, communication plans'
                },
                last_minute_changes: {
                    scenarios: 'Day-of illness, emergency departures, unexpected conflicts',
                    protocols: 'Rapid assessment, immediate notification, accelerated preparation',
                    support_systems: 'Emergency coaching, technical assistance, performance adaptation',
                    quality_control: 'Minimum standards, safety priorities, audience experience'
                }
            }
        };
        
        // Performance quality standards
        this.qualityStandards = {
            readiness_criteria: {
                script_knowledge: 'Complete line accuracy, cue awareness, scene understanding',
                staging_proficiency: 'Blocking accuracy, spatial awareness, ensemble integration',
                character_development: 'Role understanding, relationship dynamics, performance quality',
                technical_competence: 'Costume familiarity, prop usage, safety compliance'
            },
            performance_expectations: {
                artistic_quality: 'Character consistency, emotional authenticity, professional standard',
                technical_execution: 'Staging accuracy, cue precision, safety compliance',
                ensemble_integration: 'Chemistry maintenance, collaborative spirit, supportive interaction',
                audience_experience: 'Performance quality, show continuity, entertainment value'
            },
            monitoring_systems: {
                preparation_assessment: 'Regular readiness evaluations, skill development tracking',
                performance_review: 'Post-performance feedback, quality assessment, improvement planning',
                ongoing_development: 'Skill enhancement, training opportunities, career support',
                feedback_integration: 'Continuous improvement, adaptation strategies, professional growth'
            }
        };
        
        // Integration with production system
        this.castingDirector = null;
        this.stageManager = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        console.log('🎭 Understudies Coordinator Agent: Ready for seamless backup performer management and production continuity');
    }

    /**
     * Initialize Understudies Coordinator with system integration
     */
    async onInitialize() {
        try {
            console.log('🎭 Understudies Coordinator: Initializing understudies coordination systems...');
            
            // Connect to Ollama interface for AI understudies coordination
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI understudies coordination requires LLM assistance.');
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
            
            // Configure AI for understudies coordination
            this.ollamaInterface.updatePerformanceContext({
                role: 'understudies_coordinator',
                coordination_approach: this.coordinationApproach,
                creativity_mode: 'continuity_assurance',
                specialization: 'backup_performer_management'
            });
            
            // Connect to related agents
            if (window.castingDirectorAgent) {
                this.castingDirector = window.castingDirectorAgent;
                console.log('🎭 Understudies Coordinator: Connected to Casting Director');
            }
            
            if (window.stageManagerAgent) {
                this.stageManager = window.stageManagerAgent;
                console.log('🎭 Understudies Coordinator: Connected to Stage Manager');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎭 Understudies Coordinator: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize understudies systems
            await this.initializeUnderstudiesSystems();
            
            // Test understudies capabilities
            await this.testUnderstudiesCapabilities();
            
            console.log('🎭 Understudies Coordinator: Ready for backup performer coordination!')
            
        } catch (error) {
            console.error('🎭 Understudies Coordinator: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI UNDERSTUDIES COORDINATION:
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
     * Subscribe to production events for understudies coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('casting:complete', (data) => this.onCastingComplete(data));
            window.theaterEventBus.subscribe('understudies:absence-notification', (data) => this.onAbsenceNotification(data));
            window.theaterEventBus.subscribe('understudies:emergency-coverage', (data) => this.onEmergencyCoverage(data));
            window.theaterEventBus.subscribe('rehearsal:understudy-needed', (data) => this.onUnderstudyRehearsal(data));
            window.theaterEventBus.subscribe('performance:coverage-required', (data) => this.onPerformanceCoverage(data));
            
            console.log('🎭 Understudies Coordinator: Subscribed to understudies coordination events');
        }
    }

    /**
     * Initialize understudies systems
     */
    async initializeUnderstudiesSystems() {
        console.log('🎭 Understudies Coordinator: Initializing understudies systems...');
        
        // Initialize coverage management
        this.initializeCoverageManagement();
        
        // Initialize training coordination
        this.initializeTrainingCoordination();
        
        // Initialize emergency protocols
        this.initializeEmergencyProtocols();
        
        // Initialize quality assurance
        this.initializeQualityAssurance();
        
        console.log('✅ Understudies Coordinator: Understudies systems initialized');
    }

    /**
     * Initialize coverage management
     */
    initializeCoverageManagement() {
        this.coverageManagement = {
            scheduleCoordination: (performers, availability) => this.coordinateSchedule(performers, availability),
            conflictResolution: (conflicts, priorities) => this.resolveScheduleConflicts(conflicts, priorities),
            emergencyCoordination: (emergency, coverage) => this.coordinateEmergencyCoverage(emergency, coverage),
            availabilityTracking: (performer, schedule) => this.trackAvailability(performer, schedule)
        };
        
        console.log('🎭 Understudies Coordinator: Coverage management initialized');
    }

    /**
     * Initialize training coordination
     */
    initializeTrainingCoordination() {
        this.trainingCoordination = {
            preparationPlanning: (understudy, role) => this.planPreparation(understudy, role),
            rehearsalScheduling: (sessions, priorities) => this.scheduleRehearsals(sessions, priorities),
            skillDevelopment: (performer, needs) => this.developSkills(performer, needs),
            readinessAssessment: (understudy, standards) => this.assessReadiness(understudy, standards)
        };
        
        console.log('🎭 Understudies Coordinator: Training coordination initialized');
    }

    /**
     * Initialize emergency protocols
     */
    initializeEmergencyProtocols() {
        this.emergencyProtocolsSystems = {
            notificationSystems: new Map(),
            contingencyPlanning: new Map(),
            crisisManagement: new Map(),
            recoveryProcedures: new Map()
        };
        
        console.log('🎭 Understudies Coordinator: Emergency protocols initialized');
    }

    /**
     * Initialize quality assurance
     */
    initializeQualityAssurance() {
        this.qualityAssuranceSystems = {
            readinessTracking: new Map(),
            performanceMonitoring: new Map(),
            improvementPlanning: new Map(),
            standardsCompliance: new Map()
        };
        
        console.log('🎭 Understudies Coordinator: Quality assurance initialized');
    }

    /**
     * Test understudies coordination capabilities
     */
    async testUnderstudiesCapabilities() {
        try {
            const testPrompt = `
            As an understudies coordinator, develop a comprehensive backup performer management plan.
            
            Understudies coordination scenario:
            - Production: Musical theater with complex roles and multiple performance dates
            - Challenges: Principal absences, ensemble illness, last-minute coverage needs
            - Requirements: Seamless coverage, quality maintenance, emergency preparedness
            - Goals: Production continuity, performer development, risk mitigation
            - Timeline: 8-week rehearsal period plus 12-week performance run
            
            Provide:
            1. Coverage strategy and understudy assignment plan
            2. Training protocols and preparation coordination
            3. Emergency procedures and last-minute coverage protocols
            4. Quality assurance and performance readiness standards
            5. Communication systems and notification procedures
            6. Integration with casting and production management
            7. Risk mitigation and contingency planning
            8. Performer development and career support strategies
            
            Format as comprehensive understudies coordination plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🎭 Understudies Coordinator: Understudies capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎭 Understudies Coordinator: Understudies capability test failed:', error);
            throw new Error(`Understudies coordination test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎭 Understudies Coordinator: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize understudies project
        await this.initializeUnderstudiesProject(data.production);
        
        // Develop coverage plan
        await this.developCoveragePlan(data.production);
    }

    /**
     * Initialize understudies project
     */
    async initializeUnderstudiesProject(production) {
        console.log('🎭 Understudies Coordinator: Initializing understudies project...');
        
        this.understudiesProject = {
            production: production,
            coveragePlan: null,
            understudyRoster: new Map(),
            trainingSchedule: new Map(),
            performanceTracking: new Map(),
            emergencyProtocols: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ Understudies Coordinator: Understudies project initialized');
    }

    /**
     * Develop coverage plan for production
     */
    async developCoveragePlan(production) {
        try {
            console.log('🎭 Understudies Coordinator: Developing coverage plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive understudies coverage plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Coverage strategy and understudy assignment optimization
                2. Training protocols and preparation coordination systems
                3. Emergency procedures and last-minute coverage protocols
                4. Quality assurance standards and performance readiness criteria
                5. Communication systems and notification procedures
                6. Integration with casting, directing, and production management
                7. Risk mitigation strategies and contingency planning
                8. Performer development opportunities and career support
                9. Budget considerations and resource optimization
                10. Long-term sustainability and coverage system maintenance
                
                Provide a detailed coverage plan that ensures production continuity, performer development, and quality maintenance.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.understudiesProject.coveragePlan = response.content;
                    this.understudiesProject.status = 'plan_complete';
                    
                    console.log('✅ Understudies Coordinator: Coverage plan developed');
                    
                    // Extract coverage priorities
                    await this.extractCoveragePriorities(response.content);
                    
                    // Begin roster development
                    await this.beginRosterDevelopment(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('understudies:coverage-plan-complete', {
                        production: production,
                        plan: response.content,
                        understudiesCoordinator: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Understudies Coordinator: Plan development failed:', error.message);
            this.understudiesProject.status = 'plan_error';
        }
    }

    /**
     * Handle casting completion
     */
    async onCastingComplete(data) {
        console.log('🎭 Understudies Coordinator: Casting complete - setting up understudies');
        
        await this.establishUnderstudyAssignments(data.cast, data.roles);
    }

    /**
     * Handle absence notifications
     */
    async onAbsenceNotification(data) {
        console.log('🎭 Understudies Coordinator: Absence notification received -', data.performer);
        
        await this.coordinateAbsenceCoverage(data.performer, data.dates, data.urgency);
    }

    /**
     * Handle emergency coverage
     */
    async onEmergencyCoverage(data) {
        console.log('🎭 Understudies Coordinator: Emergency coverage requested');
        
        await this.executeEmergencyCoverage(data.role, data.timing, data.circumstances);
    }

    /**
     * Extract coverage priorities from plan
     */
    async extractCoveragePriorities(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            continuity: 'Seamless production continuity and show quality maintenance',
            preparation: 'Thorough understudy preparation and readiness',
            communication: 'Clear communication systems and emergency protocols',
            development: 'Performer development and career advancement support'
        };
    }

    /**
     * Get understudies coordinator status
     */
    getUnderstudiesCoordinatorStatus() {
        return {
            currentProject: {
                active: !!this.understudiesProject.production,
                title: this.understudiesProject.production?.title,
                status: this.understudiesProject.status,
                planComplete: !!this.understudiesProject.coveragePlan,
                rosterSize: this.understudiesProject.understudyRoster.size
            },
            coordination: {
                trainingScheduled: this.understudiesProject.trainingSchedule.size,
                performanceTracking: this.understudiesProject.performanceTracking.size,
                emergencyProtocols: this.understudiesProject.emergencyProtocols.size
            },
            capabilities: this.understudiesCapabilities,
            systems: {
                coverageStrategies: Object.keys(this.coverageStrategies).length,
                trainingProtocols: Object.keys(this.trainingProtocols).length,
                emergencyProtocols: Object.keys(self.emergencyProtocols || {}).length,
                qualityStandards: Object.keys(this.qualityStandards).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎭 Understudies Coordinator: Concluding understudies coordination session...');
        
        // Finalize understudies project
        if (this.understudiesProject.status !== 'idle') {
            this.understudiesProject.status = 'completed';
            this.understudiesProject.completedAt = new Date();
        }
        
        // Generate understudies summary
        if (this.currentProduction) {
            const understudiesSummary = this.generateUnderstudiesSummary();
            console.log('🎭 Understudies Coordinator: Understudies coordination summary generated');
        }
        
        console.log('🎭 Understudies Coordinator: Backup performer management and production continuity concluded');
    }

    /**
     * Generate understudies summary
     */
    generateUnderstudiesSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            coordination: {
                planDeveloped: !!this.understudiesProject.coveragePlan,
                rosterManaged: this.understudiesProject.understudyRoster.size,
                trainingCoordinated: this.understudiesProject.trainingSchedule.size,
                emergencyResponsesHandled: this.understudiesProject.emergencyProtocols.size
            },
            performance: {
                coverageSuccess: this.calculateCoverageSuccess(),
                qualityMaintenance: this.calculateQualityMaintenance(),
                emergencyResponseEffectiveness: this.calculateEmergencyResponse()
            },
            collaboration: {
                castingDirectorCoordination: !!this.castingDirector,
                stageManagerIntegration: !!this.stageManager,
                creativeDirectorAlignment: !!this.creativeDirector
            }
        };
    }

    /**
     * Calculate coverage success metrics
     */
    calculateCoverageSuccess() {
        const tracking = Array.from(this.understudiesProject.performanceTracking.values());
        return tracking.length > 0
            ? tracking.filter(track => track.coverageSuccessful).length / tracking.length * 100
            : 0;
    }

    /**
     * Calculate quality maintenance metrics
     */
    calculateQualityMaintenance() {
        return Array.from(this.understudiesProject.performanceTracking.values())
            .filter(track => track.qualityMaintained).length;
    }

    /**
     * Calculate emergency response effectiveness
     */
    calculateEmergencyResponse() {
        const emergencies = Array.from(this.understudiesProject.emergencyProtocols.values());
        return emergencies.length > 0
            ? emergencies.filter(emergency => emergency.responseSuccessful).length / emergencies.length * 100
            : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnderstudiesCoordinatorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.UnderstudiesCoordinatorAgent = UnderstudiesCoordinatorAgent;
    console.log('🎭 Understudies Coordinator Agent loaded - Ready for seamless backup performer management and production continuity');
}