/**
 * WardrobeSupervisorAgent.js - AI-Powered Costume Management and Maintenance
 * 
 * The Wardrobe Supervisor Agent uses Ollama LLM to manage all aspects of
 * costume organization, maintenance, and backstage wardrobe operations.
 * Ensures costume integrity and efficient quick changes during performances.
 * 
 * Features:
 * - AI-driven costume inventory and organization
 * - Maintenance scheduling and garment care
 * - Quick change coordination and backstage management
 * - Fitting supervision and alteration coordination
 * - Performance support and emergency repairs
 * - Integration with costume design and production teams
 */

class WardrobeSupervisorAgent extends BaseAgent {
    constructor(config = {}) {
        super('wardrobe-supervisor', {
            name: 'Wardrobe Supervisor',
            role: 'wardrobe-supervisor',
            priority: 55, // Important for costume management
            maxActionsPerSecond: 5,
            personality: config.personality || 'organized',
            ...config
        });
        
        // Wardrobe Supervisor specific properties
        this.ollamaInterface = null;
        this.managementApproach = config.approach || 'systematic-efficient';
        this.creativityLevel = config.creativity || 0.65;
        
        // Wardrobe supervisor capabilities
        this.wardrobeCapabilities = {
            inventory: {
                organizationSystems: true,
                catalogManagement: true,
                sizeTracking: true,
                conditionMonitoring: true,
                accessibilityPlanning: true
            },
            maintenance: {
                careProtocols: true,
                repairCoordination: true,
                cleaningSchedules: true,
                preservationTechniques: true,
                emergencyRepairs: true
            },
            fittings: {
                scheduleCoordination: true,
                progressTracking: true,
                alterationManagement: true,
                qualityControl: true,
                performerSupport: true
            },
            performance: {
                quickChangeCoordination: true,
                backstageOrganization: true,
                emergencySupport: true,
                performanceMaintenance: true,
                continuityTracking: true
            },
            logistics: {
                storageManagement: true,
                transportationCoordination: true,
                securityProtocols: true,
                insuranceTracking: true,
                budgetManagement: true
            },
            collaboration: {
                designerCoordination: true,
                performerSupport: true,
                crewTraining: true,
                departmentIntegration: true,
                communicationSystems: true
            }
        };
        
        // Current wardrobe project
        this.wardrobeProject = {
            production: null,
            managementPlan: null,
            inventory: new Map(),
            fittingSchedule: new Map(),
            maintenanceLog: new Map(),
            performanceTracker: new Map(),
            status: 'idle'
        };
        
        // Costume care and maintenance protocols
        this.costumeCareSystems = {
            fabric_care: {
                natural_fibers: {
                    cotton: {
                        washing: 'Machine wash warm, gentle cycle, air dry when possible',
                        storage: 'Clean, dry environment, acid-free tissue, cedar protection',
                        maintenance: 'Regular inspection, prompt stain treatment, careful pressing',
                        concerns: 'Shrinkage, color bleeding, wrinkle tendency'
                    },
                    wool: {
                        washing: 'Dry clean or hand wash cold, lay flat to dry',
                        storage: 'Moth protection, climate control, proper ventilation',
                        maintenance: 'Professional cleaning, steam pressing, pilling removal',
                        concerns: 'Shrinkage, moth damage, felting, stretching'
                    },
                    silk: {
                        washing: 'Dry clean or gentle hand wash, never wring',
                        storage: 'Acid-free environment, minimal folding, breathable covers',
                        maintenance: 'Professional cleaning, low-heat pressing, pH-neutral care',
                        concerns: 'Water spotting, UV damage, pH sensitivity, snagging'
                    },
                    linen: {
                        washing: 'Machine wash warm, steam while damp',
                        storage: 'Relaxed folding or hanging, good air circulation',
                        maintenance: 'Careful pressing while damp, wrinkle acceptance',
                        concerns: 'Wrinkle tendency, stiffness, potential shrinkage'
                    }
                },
                synthetic_fibers: {
                    polyester: {
                        washing: 'Machine wash warm, tumble dry low heat',
                        storage: 'Standard hanging or folding, static control',
                        maintenance: 'Regular washing, static prevention, careful heat application',
                        concerns: 'Static buildup, heat sensitivity, oil absorption'
                    },
                    nylon: {
                        washing: 'Machine wash cool, air dry preferred',
                        storage: 'Avoid UV exposure, proper ventilation',
                        maintenance: 'Gentle washing, UV protection, heat avoidance',
                        concerns: 'UV degradation, heat damage, static electricity'
                    },
                    spandex_lycra: {
                        washing: 'Cool water, gentle cycle, air dry only',
                        storage: 'Relaxed position, avoid stretching storage',
                        maintenance: 'No heat drying, chlorine avoidance, gentle handling',
                        concerns: 'Heat damage, chlorine degradation, overstretching'
                    }
                },
                specialty_materials: {
                    leather: {
                        care: 'Professional cleaning, conditioning, proper storage',
                        storage: 'Climate control, shape maintenance, breathable covers',
                        maintenance: 'Regular conditioning, professional repairs, water protection',
                        concerns: 'Cracking, stiffening, water damage, stretching'
                    },
                    fur_faux_fur: {
                        care: 'Professional cleaning, gentle brushing, storage care',
                        storage: 'Cool, dry environment, proper support, pest protection',
                        maintenance: 'Professional storage, seasonal inspection, repair coordination',
                        concerns: 'Matting, shedding, pest damage, heat sensitivity'
                    },
                    metallics: {
                        care: 'Gentle handling, minimal washing, professional cleaning',
                        storage: 'Tarnish prevention, cushioned storage, climate control',
                        maintenance: 'Spot cleaning, professional restoration, careful pressing',
                        concerns: 'Tarnishing, thread breakage, heat damage, oxidation'
                    }
                }
            },
            stain_treatment: {
                immediate_response: {
                    assessment: 'Identify stain type, fabric, and urgency level',
                    documentation: 'Record stain location, cause, and treatment attempts',
                    isolation: 'Prevent stain spreading, protect surrounding fabric',
                    professional_referral: 'When to involve professional cleaners'
                },
                common_stains: {
                    makeup: 'Gentle makeup remover, professional cleaning for heavy buildup',
                    sweat: 'Enzyme treatment, professional deodorizing, fabric protection',
                    food_beverages: 'Immediate blotting, appropriate solvent, professional treatment',
                    blood: 'Cold water treatment, enzyme cleaners, professional assistance',
                    oils_grease: 'Absorbent application, degreasing agents, professional cleaning'
                },
                treatment_protocols: {
                    testing: 'Inconspicuous area testing before full treatment',
                    documentation: 'Treatment record keeping, success/failure tracking',
                    follow_up: 'Post-treatment inspection, additional care if needed',
                    prevention: 'Protective measures, performer education, proactive care'
                }
            }
        };
        
        // Fitting and alteration management
        this.fittingManagement = {
            scheduling_systems: {
                initial_fittings: {
                    timing: 'Early in rehearsal process, before major construction',
                    goals: 'Size confirmation, style approval, comfort assessment',
                    documentation: 'Measurement confirmation, alteration needs, performer notes',
                    coordination: 'Designer presence, performer availability, alteration scheduling'
                },
                progress_fittings: {
                    timing: 'Mid-rehearsal, as construction progresses',
                    goals: 'Fit refinement, movement testing, comfort optimization',
                    documentation: 'Adjustment notes, timeline updates, quality checks',
                    coordination: 'Construction team, performer feedback, designer approval'
                },
                final_fittings: {
                    timing: 'Near tech week, all elements completed',
                    goals: 'Final approval, performance readiness, emergency protocols',
                    documentation: 'Final measurements, maintenance needs, performance notes',
                    coordination: 'Full team availability, performance simulation, sign-off'
                }
            },
            alteration_coordination: {
                priority_assessment: {
                    safety_issues: 'Immediate attention, highest priority',
                    comfort_problems: 'High priority, performer welfare',
                    aesthetic_adjustments: 'Medium priority, artistic vision',
                    minor_tweaks: 'Lower priority, time permitting'
                },
                workflow_management: {
                    intake_system: 'Alteration request documentation, priority assignment',
                    tracking_system: 'Progress monitoring, timeline management',
                    quality_control: 'Completion verification, performance testing',
                    communication: 'Status updates, completion notification'
                }
            }
        };
        
        // Quick change and performance support
        this.performanceSupport = {
            quick_change_systems: {
                planning: {
                    timing_analysis: 'Scene transition timing, available change time',
                    location_planning: 'Backstage areas, change booth placement',
                    costume_modification: 'Fastener optimization, accessibility improvements',
                    rehearsal_integration: 'Practice opportunities, timing refinement'
                },
                execution: {
                    pre_show_preparation: 'Costume organization, tool staging, crew briefing',
                    real_time_support: 'Quick change assistance, problem solving',
                    post_change_maintenance: 'Costume reset, damage assessment',
                    emergency_protocols: 'Backup plans, alternative solutions'
                }
            },
            backstage_organization: {
                storage_systems: {
                    performer_areas: 'Individual storage, easy access, security',
                    quick_change_stations: 'Dedicated areas, proper lighting, tool access',
                    emergency_supplies: 'Repair kits, backup pieces, cleaning supplies',
                    inventory_tracking: 'Real-time location tracking, usage monitoring'
                },
                workflow_optimization: {
                    traffic_patterns: 'Efficient movement, congestion avoidance',
                    communication_systems: 'Clear protocols, emergency alerts',
                    maintenance_schedules: 'Between-show care, damage assessment',
                    security_measures: 'Costume protection, access control'
                }
            }
        };
        
        // Quality control and standards
        this.qualityStandards = {
            pre_performance: {
                cleanliness: 'Stain-free, fresh appearance, appropriate care',
                condition: 'Structural integrity, secure fastenings, wear assessment',
                fit: 'Proper sizing, comfort verification, movement testing',
                completeness: 'All accessories present, backup availability'
            },
            during_performance: {
                monitoring: 'Visual checks, performer feedback, audience perspective',
                maintenance: 'Interval care, damage assessment, repairs as needed',
                adjustments: 'Fit modifications, comfort improvements, safety updates',
                documentation: 'Issue tracking, repair needs, replacement planning'
            },
            post_performance: {
                assessment: 'Wear evaluation, damage documentation, care needs',
                immediate_care: 'Stain treatment, ventilation, basic maintenance',
                planning: 'Next performance preparation, repair scheduling',
                long_term_care: 'Storage preparation, preservation planning'
            }
        };
        
        // Integration with production system
        this.costumeDesigner = null;
        this.stageManager = null;
        this.technicalDirector = null;
        this.currentProduction = null;
        
        console.log('👗 Wardrobe Supervisor Agent: Ready for comprehensive costume management and performance support');
    }

    /**
     * Initialize Wardrobe Supervisor with system integration
     */
    async onInitialize() {
        try {
            console.log('👗 Wardrobe Supervisor: Initializing wardrobe management systems...');
            
            // Connect to Ollama interface for AI wardrobe management
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI wardrobe management requires LLM assistance.');
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
            
            // Configure AI for wardrobe management
            this.ollamaInterface.updatePerformanceContext({
                role: 'wardrobe_supervisor',
                management_approach: this.managementApproach,
                creativity_mode: 'organizational_efficiency',
                specialization: 'costume_lifecycle_management'
            });
            
            // Connect to related agents
            if (window.costumeDesignerAgent) {
                this.costumeDesigner = window.costumeDesignerAgent;
                console.log('👗 Wardrobe Supervisor: Connected to Costume Designer');
            }
            
            if (window.stageManagerAgent) {
                this.stageManager = window.stageManagerAgent;
                console.log('👗 Wardrobe Supervisor: Connected to Stage Manager');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('👗 Wardrobe Supervisor: Connected to Technical Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize wardrobe systems
            await this.initializeWardrobeSystems();
            
            // Test wardrobe capabilities
            await this.testWardrobeCapabilities();
            
            console.log('👗 Wardrobe Supervisor: Ready for costume management!')
            
        } catch (error) {
            console.error('👗 Wardrobe Supervisor: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI WARDROBE MANAGEMENT:
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
     * Subscribe to production events for wardrobe management
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('costume:fitting-request', (data) => this.onFittingRequest(data));
            window.theaterEventBus.subscribe('wardrobe:maintenance-needed', (data) => this.onMaintenanceRequest(data));
            window.theaterEventBus.subscribe('performance:quick-change', (data) => this.onQuickChangeRequest(data));
            window.theaterEventBus.subscribe('costume:damage-report', (data) => this.onDamageReport(data));
            window.theaterEventBus.subscribe('technical:performance-support', (data) => this.onPerformanceSupport(data));
            
            console.log('👗 Wardrobe Supervisor: Subscribed to wardrobe management events');
        }
    }

    /**
     * Initialize wardrobe systems
     */
    async initializeWardrobeSystems() {
        console.log('👗 Wardrobe Supervisor: Initializing wardrobe systems...');
        
        // Initialize inventory management
        this.initializeInventoryManagement();
        
        // Initialize maintenance systems
        this.initializeMaintenanceSystems();
        
        // Initialize fitting coordination
        this.initializeFittingCoordination();
        
        // Initialize performance support
        this.initializePerformanceSupport();
        
        console.log('✅ Wardrobe Supervisor: Wardrobe systems initialized');
    }

    /**
     * Initialize inventory management
     */
    initializeInventoryManagement() {
        this.inventoryManagement = {
            catalogSystem: (costumes, categories) => this.catalogCostumes(costumes, categories),
            conditionTracking: (item, assessment) => this.trackCondition(item, assessment),
            organizationSystem: (space, efficiency) => this.organizeWardrobe(space, efficiency),
            accessibilityPlanning: (performer, needs) => this.planAccessibility(performer, needs)
        };
        
        console.log('👗 Wardrobe Supervisor: Inventory management initialized');
    }

    /**
     * Initialize maintenance systems
     */
    initializeMaintenanceSystems() {
        this.maintenanceSystems = {
            careProtocols: (fabric, treatment) => this.applyCareProtocol(fabric, treatment),
            repairCoordination: (damage, priority) => this.coordinateRepair(damage, priority),
            cleaningSchedules: (items, timeline) => this.scheduleCleaningCare(items, timeline),
            emergencyRepairs: (issue, urgency) => this.handleEmergencyRepair(issue, urgency)
        };
        
        console.log('👗 Wardrobe Supervisor: Maintenance systems initialized');
    }

    /**
     * Initialize fitting coordination
     */
    initializeFittingCoordination() {
        this.fittingCoordination = {
            scheduleManagement: new Map(),
            progressTracking: new Map(),
            alterationCoordination: new Map(),
            qualityControl: new Map()
        };
        
        console.log('👗 Wardrobe Supervisor: Fitting coordination initialized');
    }

    /**
     * Initialize performance support
     */
    initializePerformanceSupport() {
        this.performanceSupportSystems = {
            quickChangePrep: new Map(),
            backstageOrganization: new Map(),
            realTimeSupport: new Map(),
            emergencyProtocols: new Map()
        };
        
        console.log('👗 Wardrobe Supervisor: Performance support initialized');
    }

    /**
     * Test wardrobe capabilities
     */
    async testWardrobeCapabilities() {
        try {
            const testPrompt = `
            As a wardrobe supervisor, develop a comprehensive costume management plan for a theater production.
            
            Wardrobe supervisor scenario:
            - Production: Period drama with elaborate costumes and complex quick changes
            - Challenges: Delicate fabrics, multiple costume changes, tight backstage space
            - Requirements: Inventory management, maintenance protocols, performance support
            - Goals: Costume integrity, efficient operations, performer support
            - Timeline: 8-week production period with daily performances
            
            Provide:
            1. Inventory organization and management systems
            2. Costume care and maintenance protocols
            3. Fitting coordination and alteration management
            4. Quick change planning and backstage organization
            5. Performance support and emergency procedures
            6. Quality control standards and monitoring
            7. Integration with costume design and production teams
            8. Long-term preservation and storage planning
            
            Format as comprehensive wardrobe management plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('👗 Wardrobe Supervisor: Wardrobe capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('👗 Wardrobe Supervisor: Wardrobe capability test failed:', error);
            throw new Error(`Wardrobe management test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('👗 Wardrobe Supervisor: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize wardrobe project
        await this.initializeWardrobeProject(data.production);
        
        // Develop wardrobe management plan
        await this.developWardrobeManagementPlan(data.production);
    }

    /**
     * Initialize wardrobe project
     */
    async initializeWardrobeProject(production) {
        console.log('👗 Wardrobe Supervisor: Initializing wardrobe project...');
        
        this.wardrobeProject = {
            production: production,
            managementPlan: null,
            inventory: new Map(),
            fittingSchedule: new Map(),
            maintenanceLog: new Map(),
            performanceTracker: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ Wardrobe Supervisor: Wardrobe project initialized');
    }

    /**
     * Develop wardrobe management plan for production
     */
    async developWardrobeManagementPlan(production) {
        try {
            console.log('👗 Wardrobe Supervisor: Developing wardrobe management plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive wardrobe management plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Inventory organization and costume cataloging systems
                2. Costume care protocols and maintenance scheduling
                3. Fitting coordination and alteration management workflows
                4. Quick change planning and backstage organization strategies
                5. Performance support protocols and emergency procedures
                6. Quality control standards and monitoring systems
                7. Integration with costume design and production teams
                8. Budget management and resource optimization
                9. Storage solutions and preservation techniques
                10. Long-term sustainability and costume lifecycle management
                
                Provide a detailed wardrobe management plan that ensures costume integrity, operational efficiency, and excellent performer support.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.wardrobeProject.managementPlan = response.content;
                    this.wardrobeProject.status = 'plan_complete';
                    
                    console.log('✅ Wardrobe Supervisor: Wardrobe management plan developed');
                    
                    // Extract management priorities
                    await this.extractManagementPriorities(response.content);
                    
                    // Begin inventory setup
                    await this.beginInventorySetup(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('wardrobe:management-plan-complete', {
                        production: production,
                        plan: response.content,
                        wardrobeSupervisor: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Wardrobe Supervisor: Plan development failed:', error.message);
            this.wardrobeProject.status = 'plan_error';
        }
    }

    /**
     * Handle fitting requests
     */
    async onFittingRequest(data) {
        console.log('👗 Wardrobe Supervisor: Fitting requested -', data.performer);
        
        await this.scheduleFitting(data.performer, data.costumes, data.priority);
    }

    /**
     * Handle maintenance requests
     */
    async onMaintenanceRequest(data) {
        console.log('👗 Wardrobe Supervisor: Maintenance needed -', data.costumes);
        
        await this.coordinateMaintenance(data.costumes, data.maintenanceType, data.urgency);
    }

    /**
     * Handle quick change requests
     */
    async onQuickChangeRequest(data) {
        console.log('👗 Wardrobe Supervisor: Quick change coordination requested');
        
        await this.planQuickChange(data.performer, data.costumes, data.timing);
    }

    /**
     * Extract management priorities from plan
     */
    async extractManagementPriorities(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            organization: 'Efficient inventory systems, clear cataloging, easy access',
            maintenance: 'Proactive care, quality preservation, emergency preparedness',
            performance: 'Smooth operations, quick changes, performer support',
            collaboration: 'Designer coordination, team integration, clear communication'
        };
    }

    /**
     * Get wardrobe supervisor status
     */
    getWardrobeSupervisorStatus() {
        return {
            currentProject: {
                active: !!this.wardrobeProject.production,
                title: this.wardrobeProject.production?.title,
                status: this.wardrobeProject.status,
                planComplete: !!this.wardrobeProject.managementPlan,
                inventorySize: this.wardrobeProject.inventory.size
            },
            wardrobe: {
                fittingsScheduled: this.wardrobeProject.fittingSchedule.size,
                maintenanceItems: this.wardrobeProject.maintenanceLog.size,
                performanceTrackers: this.wardrobeProject.performanceTracker.size
            },
            capabilities: this.wardrobeCapabilities,
            systems: {
                costumeCareSystems: Object.keys(this.costumeCareSystems).length,
                fittingManagement: Object.keys(this.fittingManagement).length,
                performanceSupport: Object.keys(this.performanceSupport).length,
                qualityStandards: Object.keys(this.qualityStandards).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('👗 Wardrobe Supervisor: Concluding wardrobe management session...');
        
        // Finalize wardrobe project
        if (this.wardrobeProject.status !== 'idle') {
            this.wardrobeProject.status = 'completed';
            this.wardrobeProject.completedAt = new Date();
        }
        
        // Generate wardrobe summary
        if (this.currentProduction) {
            const wardrobeSummary = this.generateWardrobeSummary();
            console.log('👗 Wardrobe Supervisor: Wardrobe management summary generated');
        }
        
        console.log('👗 Wardrobe Supervisor: Costume management and performance support concluded');
    }

    /**
     * Generate wardrobe summary
     */
    generateWardrobeSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            management: {
                planDeveloped: !!this.wardrobeProject.managementPlan,
                inventoryManaged: this.wardrobeProject.inventory.size,
                fittingsCoordinated: this.wardrobeProject.fittingSchedule.size,
                maintenanceCompleted: this.wardrobeProject.maintenanceLog.size
            },
            performance: {
                quickChangesSupported: this.calculateQuickChangeSupport(),
                qualityMaintained: this.calculateQualityMaintenance(),
                emergencyResponseEffectiveness: this.calculateEmergencyResponse()
            },
            collaboration: {
                costumeDesignerCoordination: !!this.costumeDesigner,
                stageManagerIntegration: !!this.stageManager,
                technicalDirectorAlignment: !!this.technicalDirector
            }
        };
    }

    /**
     * Calculate quick change support metrics
     */
    calculateQuickChangeSupport() {
        return Array.from(this.wardrobeProject.performanceTracker.values())
            .filter(tracker => tracker.quickChangeSuccess).length;
    }

    /**
     * Calculate quality maintenance metrics
     */
    calculateQualityMaintenance() {
        return Array.from(this.wardrobeProject.maintenanceLog.values())
            .filter(log => log.qualityMaintained).length;
    }

    /**
     * Calculate emergency response effectiveness
     */
    calculateEmergencyResponse() {
        const emergencies = Array.from(this.wardrobeProject.performanceTracker.values())
            .filter(tracker => tracker.emergencyHandled);
        return emergencies.length > 0
            ? emergencies.filter(emergency => emergency.responseSuccess).length / emergencies.length * 100
            : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WardrobeSupervisorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.WardrobeSupervisorAgent = WardrobeSupervisorAgent;
    console.log('👗 Wardrobe Supervisor Agent loaded - Ready for comprehensive costume management and performance support');
}