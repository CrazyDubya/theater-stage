/**
 * ChildWranglerAgent.js - AI-Powered Young Performer Supervision and Support
 * 
 * The Child Wrangler Agent uses Ollama LLM to manage all aspects of working
 * with child performers in theater productions, ensuring their safety, well-being,
 * education, and professional development while maintaining compliance with regulations.
 * 
 * Features:
 * - AI-driven child performer supervision and care
 * - Educational support and tutoring coordination
 * - Safety protocols and well-being monitoring
 * - Legal compliance and regulatory adherence
 * - Professional development and skill building
 * - Parent/guardian communication and collaboration
 */

class ChildWranglerAgent extends BaseAgent {
    constructor(config = {}) {
        super('child-wrangler', {
            name: 'Child Wrangler',
            role: 'child-wrangler',
            priority: 90, // Very high priority for child safety and welfare
            maxActionsPerSecond: 3,
            personality: config.personality || 'nurturing',
            ...config
        });
        
        // Child Wrangler specific properties
        this.ollamaInterface = null;
        this.careApproach = config.approach || 'safety-first-nurturing';
        this.creativityLevel = config.creativity || 0.60;
        
        // Child wrangler capabilities
        this.childCareCapabilities = {
            supervision: {
                safetyMonitoring: true,
                behaviorManagement: true,
                wellbeingAssessment: true,
                emergencyResponse: true,
                continuousSupervision: true
            },
            education: {
                tutoringCoordination: true,
                educationalSupport: true,
                curriculumCompliance: true,
                learningAccommodation: true,
                progressTracking: true
            },
            development: {
                skillBuilding: true,
                confidenceBuilding: true,
                socialDevelopment: true,
                professionalGuidance: true,
                talentNurturing: true
            },
            communication: {
                parentLiaison: true,
                childAdvocacy: true,
                teamCoordination: true,
                progressReporting: true,
                concernEscalation: true
            },
            compliance: {
                legalCompliance: true,
                workingTimeRegulation: true,
                educationRequirements: true,
                safetyStandards: true,
                documentationMaintenance: true
            },
            support: {
                emotionalSupport: true,
                practicalAssistance: true,
                conflictResolution: true,
                integrationSupport: true,
                familyCoordination: true
            }
        };
        
        // Current child care project
        this.childCareProject = {
            production: null,
            carePlan: null,
            childPerformers: new Map(),
            educationSchedule: new Map(),
            safetyProtocols: new Map(),
            parentCommunication: new Map(),
            status: 'idle'
        };
        
        // Child performer age groups and considerations
        this.ageGroupConsiderations = {
            preschool: {
                age_range: '3-5 years',
                characteristics: 'Limited attention span, need frequent breaks, high energy, learning through play',
                supervision: 'Constant supervision, immediate needs attention, comfort items important',
                education: 'Play-based learning, minimal formal education, development focus',
                regulations: 'Strict working hours, mandatory rest periods, limited performance time'
            },
            elementary: {
                age_range: '6-10 years',
                characteristics: 'Developing independence, peer relationships, structured learning capacity',
                supervision: 'Close supervision, safety awareness, group dynamics management',
                education: 'Formal curriculum requirements, homework support, reading development',
                regulations: 'Limited working hours, educational priority, performance restrictions'
            },
            middle_school: {
                age_range: '11-13 years',
                characteristics: 'Increased independence, social awareness, identity development',
                supervision: 'Guidance and mentoring, peer relationship support, responsibility building',
                education: 'Core academic subjects, study skills, time management',
                regulations: 'Moderate working hours, academic achievement priority, career guidance'
            },
            high_school: {
                age_range: '14-17 years',
                characteristics: 'Near-adult capabilities, career awareness, increased responsibility',
                supervision: 'Professional mentoring, independence support, career development',
                education: 'College preparation, career planning, professional skill development',
                regulations: 'Extended working hours permitted, professional development focus'
            }
        };
        
        // Safety protocols and procedures
        this.safetyProtocols = {
            physical_safety: {
                stage_safety: {
                    procedures: 'Age-appropriate safety training, stage awareness, emergency procedures',
                    equipment: 'Child-safe props, appropriate costumes, safety equipment',
                    supervision: 'Adult supervision during all stage activities, safety buddy system',
                    restrictions: 'Height restrictions, equipment limitations, stunt prohibitions'
                },
                venue_safety: {
                    procedures: 'Venue orientation, safe spaces identification, emergency exits',
                    areas: 'Designated child areas, restricted access zones, safe play spaces',
                    protocols: 'Check-in/check-out procedures, bathroom protocols, meal safety',
                    emergency: 'Emergency procedures, medical response, parent notification'
                }
            },
            emotional_safety: {
                psychological_wellbeing: {
                    monitoring: 'Stress level assessment, emotional state tracking, behavior observation',
                    support: 'Counseling availability, peer support, adult mentoring',
                    intervention: 'Early intervention, professional referral, family consultation',
                    prevention: 'Positive environment creation, bullying prevention, confidence building'
                },
                professional_boundaries: {
                    adult_interaction: 'Professional boundaries, appropriate communication, respect requirements',
                    peer_relationships: 'Healthy peer interaction, conflict resolution, social skills',
                    industry_exposure: 'Age-appropriate industry education, reality awareness, expectation management',
                    pressure_management: 'Performance pressure mitigation, stress reduction, balance maintenance'
                }
            }
        };
        
        // Educational support systems
        this.educationalSupport = {
            legal_requirements: {
                minimum_hours: 'State-mandated minimum educational hours per day',
                curriculum_standards: 'Grade-level curriculum compliance, standardized testing',
                certified_instruction: 'Qualified teacher requirements, educational supervision',
                documentation: 'Educational progress tracking, attendance records, achievement documentation'
            },
            tutoring_coordination: {
                individual_needs: 'Learning style assessment, academic strength/weakness identification',
                curriculum_alignment: 'School curriculum coordination, assignment completion',
                progress_monitoring: 'Regular assessment, parent communication, school liaison',
                resource_provision: 'Educational materials, technology access, quiet study spaces'
            },
            flexible_scheduling: {
                rehearsal_integration: 'Education around rehearsal schedule, priority balance',
                performance_accommodation: 'Education during performance periods, makeup work',
                travel_education: 'Education during travel, remote learning, tutoring coordination',
                break_utilization: 'Educational activities during breaks, informal learning'
            }
        };
        
        // Professional development and skill building
        this.professionalDevelopment = {
            performance_skills: {
                age_appropriate_training: 'Skill development appropriate to age and maturity',
                confidence_building: 'Positive reinforcement, achievement recognition, growth encouragement',
                professional_behavior: 'Industry etiquette, professional communication, responsibility development',
                artistic_growth: 'Creative expression, artistic exploration, talent development'
            },
            life_skills: {
                time_management: 'Schedule awareness, responsibility development, priority setting',
                social_skills: 'Peer interaction, adult communication, conflict resolution',
                self_advocacy: 'Voice development, need communication, boundary setting',
                independence: 'Age-appropriate independence, decision-making, self-care'
            },
            career_guidance: {
                industry_education: 'Age-appropriate industry knowledge, career awareness',
                goal_setting: 'Short and long-term goals, achievement planning, progress tracking',
                network_building: 'Professional relationship development, mentor connections',
                alternative_planning: 'Education backup plans, career alternatives, life balance'
            }
        };
        
        // Parent and family communication
        this.familyCommunication = {
            regular_updates: {
                daily_reports: 'Daily activity summary, behavior notes, concern identification',
                weekly_summaries: 'Progress assessment, educational updates, development observations',
                milestone_communication: 'Achievement celebration, challenge discussion, goal adjustment',
                emergency_notification: 'Immediate communication for safety, health, or behavior concerns'
            },
            collaboration_systems: {
                parent_involvement: 'Volunteer opportunities, observation permissions, feedback integration',
                home_school_coordination: 'Educational consistency, behavior management, routine alignment',
                medical_coordination: 'Health information sharing, medication management, emergency contacts',
                goal_alignment: 'Family goals, production goals, child development goals'
            },
            support_provision: {
                resource_sharing: 'Educational resources, development materials, industry information',
                guidance_offering: 'Parenting support, industry navigation, decision guidance',
                connection_facilitation: 'Family connections, support networks, community building',
                advocacy_support: 'Child advocacy, need representation, system navigation'
            }
        };
        
        // Integration with production system
        self.executiveProducer = null;
        this.castingDirector = null;
        this.stageManager = null;
        this.currentProduction = null;
        
        console.log('👶 Child Wrangler Agent: Ready for comprehensive young performer care, safety, and development');
    }

    /**
     * Initialize Child Wrangler with system integration
     */
    async onInitialize() {
        try {
            console.log('👶 Child Wrangler: Initializing child care and supervision systems...');
            
            // Connect to Ollama interface for AI child care coordination
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI child care requires LLM assistance.');
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
            
            // Configure AI for child care
            this.ollamaInterface.updatePerformanceContext({
                role: 'child_wrangler',
                care_approach: this.careApproach,
                creativity_mode: 'child_development_support',
                specialization: 'young_performer_welfare'
            });
            
            // Connect to related agents
            if (window.executiveProducerAgent) {
                self.executiveProducer = window.executiveProducerAgent;
                console.log('👶 Child Wrangler: Connected to Executive Producer');
            }
            
            if (window.castingDirectorAgent) {
                this.castingDirector = window.castingDirectorAgent;
                console.log('👶 Child Wrangler: Connected to Casting Director');
            }
            
            if (window.stageManagerAgent) {
                this.stageManager = window.stageManagerAgent;
                console.log('👶 Child Wrangler: Connected to Stage Manager');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize child care systems
            await this.initializeChildCareSystems();
            
            // Test child care capabilities
            await this.testChildCareCapabilities();
            
            console.log('👶 Child Wrangler: Ready for young performer care!')
            
        } catch (error) {
            console.error('👶 Child Wrangler: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI CHILD CARE:
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
     * Subscribe to production events for child care
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('child-care:supervision-needed', (data) => this.onSupervisionNeeded(data));
            window.theaterEventBus.subscribe('child-care:educational-support', (data) => this.onEducationalSupport(data));
            window.theaterEventBus.subscribe('child-care:safety-concern', (data) => this.onSafetyConcern(data));
            window.theaterEventBus.subscribe('child-care:parent-communication', (data) => this.onParentCommunication(data));
            window.theaterEventBus.subscribe('casting:child-performer-cast', (data) => this.onChildPerformerCast(data));
            
            console.log('👶 Child Wrangler: Subscribed to child care events');
        }
    }

    /**
     * Initialize child care systems
     */
    async initializeChildCareSystems() {
        console.log('👶 Child Wrangler: Initializing child care systems...');
        
        // Initialize supervision systems
        this.initializeSupervisionSystems();
        
        // Initialize educational support
        this.initializeEducationalSystems();
        
        // Initialize safety protocols
        this.initializeSafetyProtocols();
        
        // Initialize family communication
        this.initializeFamilyCommunication();
        
        console.log('✅ Child Wrangler: Child care systems initialized');
    }

    /**
     * Initialize supervision systems
     */
    initializeSupervisionSystems() {
        this.supervisionSystems = {
            safetyMonitoring: (child, environment) => this.monitorChildSafety(child, environment),
            behaviorManagement: (child, situation) => this.manageBehavior(child, situation),
            wellbeingAssessment: (child, indicators) => this.assessWellbeing(child, indicators),
            emergencyResponse: (emergency, child) => this.respondToEmergency(emergency, child)
        };
        
        console.log('👶 Child Wrangler: Supervision systems initialized');
    }

    /**
     * Initialize educational systems
     */
    initializeEducationalSystems() {
        this.educationalSystems = {
            tutoringCoordination: (child, needs) => this.coordinateTutoring(child, needs),
            curriculumSupport: (child, requirements) => this.supportCurriculum(child, requirements),
            progressTracking: (child, goals) => this.trackEducationalProgress(child, goals),
            accommodationPlanning: (child, needs) => this.planAccommodations(child, needs)
        };
        
        console.log('👶 Child Wrangler: Educational systems initialized');
    }

    /**
     * Initialize safety protocols
     */
    initializeSafetyProtocols() {
        this.safetyProtocolsSystems = {
            physicalSafety: new Map(),
            emotionalSafety: new Map(),
            emergencyProcedures: new Map(),
            complianceTracking: new Map()
        };
        
        console.log('👶 Child Wrangler: Safety protocols initialized');
    }

    /**
     * Initialize family communication
     */
    initializeFamilyCommunication() {
        this.familyCommunicationSystems = {
            regularUpdates: new Map(),
            collaborationTracking: new Map(),
            supportProvision: new Map(),
            emergencyContacts: new Map()
        };
        
        console.log('👶 Child Wrangler: Family communication initialized');
    }

    /**
     * Test child care capabilities
     */
    async testChildCareCapabilities() {
        try {
            const testPrompt = `
            As a child wrangler, develop a comprehensive young performer care and development plan.
            
            Child care scenario:
            - Production: Family musical with 8 child performers ages 6-16
            - Challenges: Educational requirements, safety compliance, varying maturity levels
            - Requirements: Legal compliance, educational support, safety protocols, family coordination
            - Goals: Child welfare, professional development, production success, family satisfaction
            - Timeline: 10-week rehearsal and 8-week performance period
            
            Provide:
            1. Age-appropriate supervision and care protocols
            2. Educational support and tutoring coordination
            3. Safety procedures and compliance systems
            4. Professional development and skill building programs
            5. Parent and family communication strategies
            6. Emergency procedures and crisis management
            7. Integration with production and creative teams
            8. Long-term child welfare and development support
            
            Format as comprehensive child care plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('👶 Child Wrangler: Child care capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('👶 Child Wrangler: Child care capability test failed:', error);
            throw new Error(`Child care test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('👶 Child Wrangler: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize child care project
        await this.initializeChildCareProject(data.production);
        
        // Develop child care plan
        await this.developChildCarePlan(data.production);
    }

    /**
     * Initialize child care project
     */
    async initializeChildCareProject(production) {
        console.log('👶 Child Wrangler: Initializing child care project...');
        
        this.childCareProject = {
            production: production,
            carePlan: null,
            childPerformers: new Map(),
            educationSchedule: new Map(),
            safetyProtocols: new Map(),
            parentCommunication: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ Child Wrangler: Child care project initialized');
    }

    /**
     * Develop child care plan for production
     */
    async developChildCarePlan(production) {
        try {
            console.log('👶 Child Wrangler: Developing child care plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive child care plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Age-appropriate supervision and safety protocols
                2. Educational support and tutoring coordination
                3. Professional development and skill building
                4. Legal compliance and regulatory requirements
                5. Parent and family communication and collaboration
                6. Emergency procedures and crisis management
                7. Integration with production and creative teams
                8. Child welfare and well-being prioritization
                9. Long-term development and career guidance
                10. Balance between professional and personal growth
                
                Provide a detailed child care plan that ensures safety, development, compliance, and excellence in young performer support.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.childCareProject.carePlan = response.content;
                    this.childCareProject.status = 'plan_complete';
                    
                    console.log('✅ Child Wrangler: Child care plan developed');
                    
                    // Extract care priorities
                    await this.extractCarePriorities(response.content);
                    
                    // Begin safety protocol setup
                    await this.beginSafetyProtocolSetup(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('child-care:plan-complete', {
                        production: production,
                        plan: response.content,
                        childWrangler: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Child Wrangler: Plan development failed:', error.message);
            this.childCareProject.status = 'plan_error';
        }
    }

    /**
     * Handle child performer casting
     */
    async onChildPerformerCast(data) {
        console.log('👶 Child Wrangler: Child performer cast -', data.performer.name);
        
        await this.onboardChildPerformer(data.performer, data.role, data.requirements);
    }

    /**
     * Handle supervision requests
     */
    async onSupervisionNeeded(data) {
        console.log('👶 Child Wrangler: Supervision needed -', data.activity);
        
        await this.provideSupervision(data.children, data.activity, data.duration);
    }

    /**
     * Handle safety concerns
     */
    async onSafetyConcern(data) {
        console.log('👶 Child Wrangler: Safety concern reported');
        
        await this.addressSafetyConcern(data.concern, data.child, data.severity);
    }

    /**
     * Extract care priorities from plan
     */
    async extractCarePriorities(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            safety: 'Physical and emotional safety as absolute priority',
            education: 'Educational requirements and academic support',
            development: 'Professional and personal growth balance',
            family: 'Strong family communication and collaboration'
        };
    }

    /**
     * Get child wrangler status
     */
    getChildWranglerStatus() {
        return {
            currentProject: {
                active: !!this.childCareProject.production,
                title: this.childCareProject.production?.title,
                status: this.childCareProject.status,
                planComplete: !!this.childCareProject.carePlan,
                childrenSupervised: this.childCareProject.childPerformers.size
            },
            childCare: {
                educationScheduled: this.childCareProject.educationSchedule.size,
                safetyProtocols: this.childCareProject.safetyProtocols.size,
                parentCommunications: this.childCareProject.parentCommunication.size
            },
            capabilities: this.childCareCapabilities,
            systems: {
                ageGroupConsiderations: Object.keys(this.ageGroupConsiderations).length,
                safetyProtocols: Object.keys(this.safetyProtocols).length,
                educationalSupport: Object.keys(this.educationalSupport).length,
                familyCommunication: Object.keys(this.familyCommunication).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('👶 Child Wrangler: Concluding child care session...');
        
        // Finalize child care project
        if (this.childCareProject.status !== 'idle') {
            this.childCareProject.status = 'completed';
            this.childCareProject.completedAt = new Date();
        }
        
        // Generate child care summary
        if (this.currentProduction) {
            const childCareSummary = this.generateChildCareSummary();
            console.log('👶 Child Wrangler: Child care summary generated');
        }
        
        console.log('👶 Child Wrangler: Young performer care, safety, and development concluded');
    }

    /**
     * Generate child care summary
     */
    generateChildCareSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            childCare: {
                planDeveloped: !!this.childCareProject.carePlan,
                childrenSupported: this.childCareProject.childPerformers.size,
                educationCoordinated: this.childCareProject.educationSchedule.size,
                safetyMaintained: this.childCareProject.safetyProtocols.size
            },
            outcomes: {
                safetyCompliance: this.calculateSafetyCompliance(),
                educationalSuccess: this.calculateEducationalSuccess(),
                familySatisfaction: this.calculateFamilySatisfaction()
            },
            collaboration: {
                executiveProducerCoordination: !!self.executiveProducer,
                castingDirectorIntegration: !!this.castingDirector,
                stageManagerAlignment: !!this.stageManager
            }
        };
    }

    /**
     * Calculate safety compliance metrics
     */
    calculateSafetyCompliance() {
        return Array.from(this.childCareProject.safetyProtocols.values())
            .filter(protocol => protocol.complianceAchieved).length;
    }

    /**
     * Calculate educational success metrics
     */
    calculateEducationalSuccess() {
        const schedules = Array.from(this.childCareProject.educationSchedule.values());
        return schedules.length > 0
            ? schedules.filter(schedule => schedule.goalsAchieved).length / schedules.length * 100
            : 0;
    }

    /**
     * Calculate family satisfaction metrics
     */
    calculateFamilySatisfaction() {
        const communications = Array.from(this.childCareProject.parentCommunication.values());
        return communications.length > 0
            ? communications.reduce((sum, comm) => sum + (comm.satisfactionRating || 0), 0) / communications.length
            : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChildWranglerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.ChildWranglerAgent = ChildWranglerAgent;
    console.log('👶 Child Wrangler Agent loaded - Ready for comprehensive young performer care, safety, and development');
}