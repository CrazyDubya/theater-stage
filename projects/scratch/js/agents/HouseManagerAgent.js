/**
 * HouseManagerAgent.js - AI-Powered Audience Services and Venue Operations
 * 
 * The House Manager Agent uses Ollama LLM to manage all front-of-house
 * operations, ensuring excellent audience experience and smooth venue
 * operations from arrival to departure.
 * 
 * Features:
 * - AI-driven audience service coordination
 * - Venue operations and safety management
 * - Guest relations and hospitality excellence
 * - Emergency procedures and crowd management
 * - Accessibility services and accommodation
 * - Integration with box office and production teams
 */

class HouseManagerAgent extends BaseAgent {
    constructor(config = {}) {
        super('house-manager', {
            name: 'House Manager',
            role: 'house-manager',
            priority: 70, // High priority for audience safety and experience
            maxActionsPerSecond: 6,
            personality: config.personality || 'hospitable',
            ...config
        });
        
        // House Manager specific properties
        this.ollamaInterface = null;
        this.serviceApproach = config.approach || 'excellence-focused';
        this.creativityLevel = config.creativity || 0.65;
        
        // House management capabilities
        this.houseCapabilities = {
            audienceServices: {
                guestRelations: true,
                hospitalityCoordination: true,
                specialServices: true,
                complaintResolution: true,
                experienceOptimization: true
            },
            venueOperations: {
                facilityManagement: true,
                safetyProtocols: true,
                emergencyProcedures: true,
                crowdManagement: true,
                accessibilityServices: true
            },
            staffManagement: {
                volunteerCoordination: true,
                ushersTeamManagement: true,
                trainingPrograms: true,
                performanceMonitoring: true,
                communicationSystems: true
            },
            eventCoordination: {
                preShowPreparation: true,
                intermissionManagement: true,
                postShowOperations: true,
                specialEvents: true,
                vipServices: true
            },
            communication: {
                audienceAnnouncements: true,
                staffCoordination: true,
            emergencyInformation: true,
                multilingual Support: true,
                digitalIntegration: true
            },
            businessOperations: {
                concessionManagement: true,
                merchandiseCoordination: true,
                boxOfficeSupport: true,
                financialTracking: true,
                vendorCoordination: true
            }
        };
        
        // Current house management project
        this.houseProject = {
            production: null,
            operationsP1an: null,
            staffSchedule: new Map(),
            audienceServices: new Map(),
            emergencyProcedures: new Map(),
            performanceMetrics: new Map(),
            status: 'idle'
        };
        
        // Audience service standards and protocols
        this.audienceServiceStandards = {
            greeting_protocols: {
                arrival_experience: {
                    welcome: 'Warm, professional greeting within 30 seconds of entry',
                    guidance: 'Clear directions to seating, facilities, and services',
                    assistance: 'Proactive help for elderly, disabled, or confused guests',
                    information: 'Program distribution, timing updates, facility orientation'
                },
                special_needs: {
                    accessibility: 'Wheelchair assistance, visual/audio aids, accessible seating',
                    language_barriers: 'Translation services, multilingual staff, clear signage',
                    medical_needs: 'First aid availability, medical emergency protocols',
                    family_services: 'Child accommodations, family seating, nursing facilities'
                },
                vip_treatment: {
                    donors_subscribers: 'Recognition, premium service, exclusive access',
                    media_critics: 'Professional courtesy, optimal seating, press services',
                    special_guests: 'Personalized attention, meet-and-greet coordination',
                    group_services: 'Group coordination, educational programs, special arrangements'
                }
            },
            service_excellence: {
                response_times: {
                    routine_requests: 'Immediate acknowledgment, 2-minute response',
                    urgent_issues: 'Immediate response, escalation protocols',
                    emergencies: 'Instant response, professional emergency procedures',
                    complaints: 'Immediate attention, follow-up within 24 hours'
                },
                communication_standards: {
                    clarity: 'Clear, concise information delivered professionally',
                    courtesy: 'Respectful, patient, helpful attitude in all interactions',
                    accuracy: 'Correct information about show times, policies, facilities',
                    follow_through: 'Completion of promises, proactive updates'
                },
                problem_resolution: {
                    listening: 'Active listening, empathy, understanding of concerns',
                    solutions: 'Creative problem-solving, reasonable accommodations',
                    escalation: 'Clear escalation procedures, management involvement',
                    documentation: 'Incident recording, pattern recognition, improvement planning'
                }
            }
        };
        
        // Venue operations and safety management
        this.venueOperations = {
            facility_management: {
                pre_show_checklist: {
                    cleanliness: 'Lobby, restrooms, seating areas cleaned and maintained',
                    lighting: 'Appropriate lighting levels, emergency lighting tested',
                    temperature: 'Comfortable climate control, ventilation systems operational',
                    equipment: 'Audio systems, digital displays, elevators functional',
                    supplies: 'Programs, concessions, merchandise stocked and ready'
                },
                ongoing_maintenance: {
                    monitoring: 'Continuous facility monitoring, issue identification',
                    immediate_response: 'Quick resolution of facility problems',
                    communication: 'Staff notification of issues, solution coordination',
                    documentation: 'Maintenance logs, issue tracking, follow-up planning'
                }
            },
            safety_protocols: {
                crowd_management: {
                    capacity_monitoring: 'Attendance tracking, fire code compliance',
                    flow_management: 'Efficient entry/exit, congestion prevention',
                    behavior_monitoring: 'Disruptive behavior identification, intervention',
                    emergency_egress: 'Clear pathways, evacuation route maintenance'
                },
                emergency_procedures: {
                    medical_emergencies: 'First aid response, emergency services coordination',
                    facility_emergencies: 'Fire, electrical, structural emergency protocols',
                    security_issues: 'Disruptive behavior, threats, theft response',
                    weather_emergencies: 'Severe weather protocols, audience safety measures'
                },
                accessibility_compliance: {
                    ada_requirements: 'Full compliance with accessibility regulations',
                    equipment_maintenance: 'Assistive devices, ramps, elevators functional',
                    staff_training: 'Disability awareness, assistance techniques, sensitivity',
                    service_coordination: 'Sign language, audio description, mobility assistance'
                }
            }
        };
        
        // Staff management and coordination
        this.staffManagement = {
            team_structure: {
                ushers: {
                    responsibilities: 'Seating assistance, program distribution, crowd management',
                    training_needs: 'Customer service, emergency procedures, venue knowledge',
                    supervision: 'Direct oversight, performance feedback, problem resolution',
                    scheduling: 'Appropriate coverage, break coordination, special event staffing'
                },
                volunteers: {
                    recruitment: 'Community outreach, skill-based matching, motivation',
                    training: 'Service standards, venue procedures, emergency protocols',
                    recognition: 'Appreciation programs, feedback systems, retention strategies',
                    coordination: 'Clear roles, communication systems, support structures'
                },
                security: {
                    coordination: 'Professional security services, crowd control',
                    protocols: 'Incident response, escalation procedures, documentation',
                    communication: 'Direct lines to house management, emergency services',
                    training: 'De-escalation techniques, customer service, emergency response'
                }
            },
            training_programs: {
                orientation: {
                    venue_knowledge: 'Facility layout, services, policies, procedures',
                    customer_service: 'Service excellence standards, communication skills',
                    emergency_procedures: 'Safety protocols, evacuation procedures, incident response',
                    diversity_training: 'Cultural sensitivity, accessibility awareness, inclusion'
                },
                ongoing_development: {
                    skill_enhancement: 'Advanced customer service, problem-solving techniques',
                    specialized_training: 'Accessibility services, multilingual support, technology',
                    team_building: 'Collaboration, communication, shared responsibility',
                    performance_improvement: 'Feedback integration, goal setting, professional growth'
                }
            }
        };
        
        // Event coordination and special services
        this.eventCoordination = {
            performance_timeline: {
                pre_show: {
                    timing: '2 hours before curtain',
                    activities: 'Facility preparation, staff briefing, early arrivals',
                    priorities: 'Safety checks, service readiness, problem prevention',
                    communication: 'Team coordination, production liaison, information updates'
                },
                house_open: {
                    timing: '45 minutes before curtain',
                    activities: 'Guest arrivals, seating, information services',
                    priorities: 'Smooth flow, excellent service, last-minute accommodations',
                    communication: 'Ongoing updates, problem resolution, production coordination'
                },
                intermission: {
                    timing: 'Interval between acts',
                    activities: 'Facility services, guest accommodations, concession sales',
                    priorities: 'Efficient service, comfort maintenance, return preparation',
                    communication: 'Timing coordination, service updates, issue resolution'
                },
                post_show: {
                    timing: 'After final curtain',
                    activities: 'Guest departure, facility securing, cleanup coordination',
                    priorities: 'Safe exit, lost item assistance, feedback collection',
                    communication: 'Departure coordination, security handoff, day wrap-up'
                }
            },
            special_events: {
                opening_nights: {
                    preparations: 'Enhanced service, VIP coordination, media management',
                    staffing: 'Additional personnel, specialized roles, extended hours',
                    services: 'Reception coordination, special accommodations, photography',
                    coordination: 'Production team liaison, vendor management, timeline adherence'
                },
                fundraising_events: {
                    preparations: 'Donor recognition, premium service standards, special arrangements',
                    logistics: 'Catering coordination, space management, program integration',
                    hospitality: 'VIP treatment, personal attention, relationship building',
                    follow_up: 'Thank you coordination, feedback collection, relationship maintenance'
                }
            }
        };
        
        // Quality metrics and performance standards
        this.performanceStandards = {
            service_metrics: {
                guest_satisfaction: 'Survey scores, feedback analysis, service quality indicators',
                response_times: 'Service delivery speed, problem resolution efficiency',
                complaint_resolution: 'Issue resolution rates, follow-up effectiveness',
                staff_performance: 'Service quality, professionalism, knowledge demonstration'
            },
            operational_metrics: {
                facility_condition: 'Cleanliness standards, maintenance responsiveness, comfort levels',
                safety_compliance: 'Incident rates, emergency preparedness, protocol adherence',
                efficiency_measures: 'Seating speed, queue management, service delivery times',
                accessibility_success: 'Accommodation effectiveness, barrier removal, service quality'
            },
            business_metrics: {
                concession_performance: 'Sales volume, service quality, customer satisfaction',
                cost_management: 'Budget adherence, resource optimization, vendor performance',
                revenue_support: 'Service contribution to overall revenue, upselling effectiveness',
                operational_efficiency: 'Staffing optimization, resource utilization, cost control'
            }
        };
        
        // Integration with production system
        this.executiveProducer = null;
        this.marketingDirector = null;
        this.technicalDirector = null;
        this.currentProduction = null;
        
        console.log('🏛️ House Manager Agent: Ready for exceptional audience experience and venue operations');
    }

    /**
     * Initialize House Manager with system integration
     */
    async onInitialize() {
        try {
            console.log('🏛️ House Manager: Initializing house management systems...');
            
            // Connect to Ollama interface for AI house management
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI house management requires LLM assistance.');
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
            
            // Configure AI for house management
            this.ollamaInterface.updatePerformanceContext({
                role: 'house_manager',
                service_approach: this.serviceApproach,
                creativity_mode: 'hospitality_excellence',
                specialization: 'audience_experience_optimization'
            });
            
            // Connect to related agents
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('🏛️ House Manager: Connected to Executive Producer');
            }
            
            if (window.marketingDirectorAgent) {
                this.marketingDirector = window.marketingDirectorAgent;
                console.log('🏛️ House Manager: Connected to Marketing Director');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('🏛️ House Manager: Connected to Technical Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize house management systems
            await this.initializeHouseSystems();
            
            // Test house management capabilities
            await this.testHouseCapabilities();
            
            console.log('🏛️ House Manager: Ready for audience excellence!')
            
        } catch (error) {
            console.error('🏛️ House Manager: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI HOUSE MANAGEMENT:
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
     * Subscribe to production events for house management
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('house:audience-arrival', (data) => this.onAudienceArrival(data));
            window.theaterEventBus.subscribe('house:special-service', (data) => this.onSpecialServiceRequest(data));
            window.theaterEventBus.subscribe('house:emergency', (data) => this.onEmergencyProtocol(data));
            window.theaterEventBus.subscribe('performance:timing-update', (data) => this.onTimingUpdate(data));
            window.theaterEventBus.subscribe('house:feedback', (data) => this.onAudienceFeedback(data));
            
            console.log('🏛️ House Manager: Subscribed to house management events');
        }
    }

    /**
     * Initialize house management systems
     */
    async initializeHouseSystems() {
        console.log('🏛️ House Manager: Initializing house systems...');
        
        // Initialize audience services
        this.initializeAudienceServices();
        
        // Initialize venue operations
        this.initializeVenueOperations();
        
        // Initialize staff management
        this.initializeStaffManagement();
        
        // Initialize event coordination
        this.initializeEventCoordination();
        
        console.log('✅ House Manager: House systems initialized');
    }

    /**
     * Initialize audience services
     */
    initializeAudienceServices() {
        this.audienceServices = {
            guestRelations: (guest, needs) => this.manageGuestRelations(guest, needs),
            specialServices: (request, accommodations) => this.provideSpecialServices(request, accommodations),
            complaintResolution: (complaint, urgency) => this.resolveComplaint(complaint, urgency),
            hospitalityCoordination: (event, requirements) => this.coordinateHospitality(event, requirements)
        };
        
        console.log('🏛️ House Manager: Audience services initialized');
    }

    /**
     * Initialize venue operations
     */
    initializeVenueOperations() {
        this.venueOperationsSystems = {
            facilityManagement: (area, standards) => this.manageFacility(area, standards),
            safetyProtocols: (situation, response) => this.implementSafetyProtocol(situation, response),
            crowdManagement: (capacity, flow) => this.manageCrowd(capacity, flow),
            emergencyProcedures: (emergency, response) => this.executeEmergencyProcedure(emergency, response)
        };
        
        console.log('🏛️ House Manager: Venue operations initialized');
    }

    /**
     * Initialize staff management
     */
    initializeStaffManagement() {
        this.staffManagementSystems = {
            scheduling: new Map(),
            training: new Map(),
            performance: new Map(),
            communication: new Map()
        };
        
        console.log('🏛️ House Manager: Staff management initialized');
    }

    /**
     * Initialize event coordination
     */
    initializeEventCoordination() {
        this.eventCoordinationSystems = {
            timeline: new Map(),
            specialEvents: new Map(),
            services: new Map(),
            logistics: new Map()
        };
        
        console.log('🏛️ House Manager: Event coordination initialized');
    }

    /**
     * Test house management capabilities
     */
    async testHouseCapabilities() {
        try {
            const testPrompt = `
            As a house manager, develop a comprehensive audience experience and venue operations plan.
            
            House management scenario:
            - Venue: 600-seat theater with diverse audience demographics
            - Challenges: Accessibility needs, VIP services, emergency preparedness
            - Requirements: Excellent guest services, safety compliance, operational efficiency
            - Goals: Outstanding audience experience, smooth operations, safety excellence
            - Events: Regular performances plus special events and fundraisers
            
            Provide:
            1. Audience service standards and guest relations protocols
            2. Venue operations and facility management procedures
            3. Staff management and training programs
            4. Emergency procedures and safety protocols
            5. Special event coordination and VIP services
            6. Accessibility services and accommodation procedures
            7. Quality monitoring and performance metrics
            8. Integration with production and marketing teams
            
            Format as comprehensive house management plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🏛️ House Manager: House management capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🏛️ House Manager: House capability test failed:', error);
            throw new Error(`House management test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🏛️ House Manager: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize house project
        await this.initializeHouseProject(data.production);
        
        // Develop house operations plan
        await this.developHouseOperationsPlan(data.production);
    }

    /**
     * Initialize house project
     */
    async initializeHouseProject(production) {
        console.log('🏛️ House Manager: Initializing house project...');
        
        this.houseProject = {
            production: production,
            operationsPlan: null,
            staffSchedule: new Map(),
            audienceServices: new Map(),
            emergencyProcedures: new Map(),
            performanceMetrics: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ House Manager: House project initialized');
    }

    /**
     * Develop house operations plan for production
     */
    async developHouseOperationsPlan(production) {
        try {
            console.log('🏛️ House Manager: Developing house operations plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive house operations plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Audience service standards and guest relations excellence
                2. Venue operations and facility management protocols
                3. Staff management, training, and performance standards
                4. Emergency procedures and safety protocol implementation
                5. Special event coordination and VIP service delivery
                6. Accessibility services and accommodation procedures
                7. Quality monitoring systems and performance metrics
                8. Integration with production, marketing, and technical teams
                9. Revenue support through concessions and merchandise
                10. Long-term audience relationship building and retention
                
                Provide a detailed house operations plan that ensures exceptional audience experience, operational excellence, and safety compliance.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.houseProject.operationsPlan = response.content;
                    this.houseProject.status = 'plan_complete';
                    
                    console.log('✅ House Manager: House operations plan developed');
                    
                    // Extract service priorities
                    await this.extractServicePriorities(response.content);
                    
                    // Begin staff scheduling
                    await this.beginStaffScheduling(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('house:operations-plan-complete', {
                        production: production,
                        plan: response.content,
                        houseManager: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ House Manager: Plan development failed:', error.message);
            this.houseProject.status = 'plan_error';
        }
    }

    /**
     * Handle audience arrivals
     */
    async onAudienceArrival(data) {
        console.log('🏛️ House Manager: Audience arrival coordination -', data.guestCount);
        
        await this.coordinateAudienceArrival(data.guestCount, data.specialNeeds, data.timing);
    }

    /**
     * Handle special service requests
     */
    async onSpecialServiceRequest(data) {
        console.log('🏛️ House Manager: Special service requested -', data.serviceType);
        
        await this.provideSpecialService(data.serviceType, data.requirements, data.priority);
    }

    /**
     * Handle emergency protocols
     */
    async onEmergencyProtocol(data) {
        console.log('🏛️ House Manager: Emergency protocol activated -', data.emergencyType);
        
        await this.executeEmergencyResponse(data.emergencyType, data.severity, data.location);
    }

    /**
     * Extract service priorities from plan
     */
    async extractServicePriorities(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            safety: 'Guest safety and emergency preparedness as top priority',
            service: 'Exceptional hospitality and guest satisfaction excellence',
            accessibility: 'Full accessibility compliance and accommodation services',
            efficiency: 'Smooth operations and optimal resource utilization'
        };
    }

    /**
     * Get house manager status
     */
    getHouseManagerStatus() {
        return {
            currentProject: {
                active: !!this.houseProject.production,
                title: this.houseProject.production?.title,
                status: this.houseProject.status,
                planComplete: !!this.houseProject.operationsPlan,
                staffScheduled: this.houseProject.staffSchedule.size
            },
            operations: {
                audienceServices: this.houseProject.audienceServices.size,
                emergencyProcedures: this.houseProject.emergencyProcedures.size,
                performanceMetrics: this.houseProject.performanceMetrics.size
            },
            capabilities: this.houseCapabilities,
            standards: {
                audienceServiceStandards: Object.keys(this.audienceServiceStandards).length,
                venueOperations: Object.keys(this.venueOperations).length,
                staffManagement: Object.keys(this.staffManagement).length,
                performanceStandards: Object.keys(this.performanceStandards).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🏛️ House Manager: Concluding house management session...');
        
        // Finalize house project
        if (this.houseProject.status !== 'idle') {
            this.houseProject.status = 'completed';
            this.houseProject.completedAt = new Date();
        }
        
        // Generate house management summary
        if (this.currentProduction) {
            const houseSummary = this.generateHouseSummary();
            console.log('🏛️ House Manager: House management summary generated');
        }
        
        console.log('🏛️ House Manager: Audience experience and venue operations concluded');
    }

    /**
     * Generate house management summary
     */
    generateHouseSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            operations: {
                planDeveloped: !!this.houseProject.operationsPlan,
                staffManaged: this.houseProject.staffSchedule.size,
                servicesProvided: this.houseProject.audienceServices.size,
                emergencyProcedures: this.houseProject.emergencyProcedures.size
            },
            performance: {
                guestSatisfaction: this.calculateGuestSatisfaction(),
                safetyCompliance: this.calculateSafetyCompliance(),
                operationalEfficiency: this.calculateOperationalEfficiency()
            },
            collaboration: {
                executiveProducerCoordination: !!this.executiveProducer,
                marketingDirectorIntegration: !!this.marketingDirector,
                technicalDirectorAlignment: !!this.technicalDirector
            }
        };
    }

    /**
     * Calculate guest satisfaction metrics
     */
    calculateGuestSatisfaction() {
        const services = Array.from(this.houseProject.audienceServices.values());
        return services.length > 0
            ? services.reduce((sum, service) => sum + (service.satisfactionRating || 0), 0) / services.length
            : 0;
    }

    /**
     * Calculate safety compliance metrics
     */
    calculateSafetyCompliance() {
        return Array.from(this.houseProject.emergencyProcedures.values())
            .filter(procedure => procedure.complianceAchieved).length;
    }

    /**
     * Calculate operational efficiency metrics
     */
    calculateOperationalEfficiency() {
        const metrics = Array.from(this.houseProject.performanceMetrics.values());
        return metrics.length > 0
            ? metrics.reduce((sum, metric) => sum + (metric.efficiencyScore || 0), 0) / metrics.length
            : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HouseManagerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.HouseManagerAgent = HouseManagerAgent;
    console.log('🏛️ House Manager Agent loaded - Ready for exceptional audience experience and venue operations');
}