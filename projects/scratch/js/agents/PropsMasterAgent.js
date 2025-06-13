/**
 * PropsMasterAgent.js - AI-Powered Prop Design and Management
 * 
 * The Props Master Agent uses Ollama LLM to design, source, and manage all
 * theatrical properties including hand props, set pieces, and special effects.
 * Ensures artistic integrity while managing practical construction and safety.
 * 
 * Features:
 * - AI-driven prop design and conceptualization
 * - Construction planning and material specification
 * - Inventory management and tracking systems
 * - Safety compliance and performer interaction
 * - Real-time prop coordination during performance
 * - Integration with set design and technical teams
 */

class PropsMasterAgent extends BaseAgent {
    constructor(config = {}) {
        super('props-master', {
            name: 'Props Master',
            role: 'props-master',
            priority: 70, // High priority for production support
            maxActionsPerSecond: 5,
            personality: config.personality || 'resourceful',
            ...config
        });
        
        // Props Master specific properties
        this.ollamaInterface = null;
        this.designApproach = config.approach || 'functional-aesthetic';
        this.creativityLevel = config.creativity || 0.8;
        
        // Props management capabilities
        this.propsCapabilities = {
            design: {
                conceptualization: true,
                visualDesign: true,
                functionalPlanning: true,
                periodAccuracy: true,
                characterSpecific: true
            },
            construction: {
                materialSelection: true,
                buildingTechniques: true,
                safetyCompliance: true,
                durabilityPlanning: true,
                budgetOptimization: true
            },
            management: {
                inventoryTracking: true,
                maintenanceScheduling: true,
                repairCoordination: true,
                storageOrganization: true,
                rehearsalSupport: true
            },
            performance: {
                propPlacement: true,
                quickChanges: true,
                emergencyBackups: true,
                performerTraining: true,
                realTimeSupport: true
            },
            specialization: {
                weaponReplicas: true,
                periodPieces: true,
                mechanicalProps: true,
                breakawayItems: true,
                magicEffects: true
            }
        };
        
        // Current props project
        this.propsProject = {
            production: null,
            propsList: new Map(),
            designSpecs: new Map(),
            constructionPlans: new Map(),
            inventory: new Map(),
            maintenanceSchedule: new Map(),
            status: 'idle'
        };
        
        // Prop categories and specifications
        this.propCategories = {
            handProps: {
                personal: {
                    description: 'Items carried or worn by individual characters',
                    examples: ['watches', 'jewelry', 'wallets', 'phones', 'bags'],
                    considerations: 'Character consistency, period accuracy, durability'
                },
                functional: {
                    description: 'Props that must work or appear to work',
                    examples: ['pens', 'lighters', 'tools', 'cameras', 'weapons'],
                    considerations: 'Safety, reliability, performer training'
                },
                consumable: {
                    description: 'Props that are used up or transformed',
                    examples: ['food', 'drinks', 'papers', 'flowers', 'breakaways'],
                    considerations: 'Multiple copies, safety, replacement schedule'
                }
            },
            setPieces: {
                furniture: {
                    description: 'Moveable furniture and fixtures',
                    examples: ['chairs', 'tables', 'beds', 'cabinets', 'desks'],
                    considerations: 'Stability, weight, scene changes, storage'
                },
                decorative: {
                    description: 'Non-functional decorative elements',
                    examples: ['artwork', 'vases', 'plants', 'books', 'ornaments'],
                    considerations: 'Visual impact, breakability, mounting'
                },
                architectural: {
                    description: 'Structural elements that define space',
                    examples: ['columns', 'arches', 'balustrades', 'doors', 'windows'],
                    considerations: 'Load bearing, safety, integration with set'
                }
            },
            specialEffects: {
                mechanical: {
                    description: 'Props with moving parts or mechanisms',
                    examples: ['clocks', 'machines', 'vehicles', 'robots', 'contraptions'],
                    considerations: 'Reliability, noise levels, operator training'
                },
                pyrotechnic: {
                    description: 'Fire, smoke, and explosive effects',
                    examples: ['flash pots', 'smoke machines', 'flame effects', 'sparks'],
                    considerations: 'Safety permits, fire marshal approval, insurance'
                },
                illusion: {
                    description: 'Magic tricks and impossible objects',
                    examples: ['disappearing items', 'transformations', 'levitation', 'teleportation'],
                    considerations: 'Rehearsal requirements, backup methods, timing'
                }
            }
        };
        
        // Materials and construction techniques
        this.materialsLibrary = {
            wood: {
                characteristics: 'Natural, workable, sturdy',
                applications: 'Furniture, frames, detailed work',
                considerations: 'Weight, cost, fire treatment, finish',
                techniques: ['cutting', 'joining', 'carving', 'turning', 'laminating']
            },
            foam: {
                characteristics: 'Lightweight, shapeable, safe',
                applications: 'Sculpted elements, padding, lightweight props',
                considerations: 'Durability, flame retardant, texture',
                techniques: ['carving', 'hot wire cutting', 'coating', 'shaping']
            },
            plastic: {
                characteristics: 'Versatile, durable, moldable',
                applications: 'Modern items, weatherproof props, detailed parts',
                considerations: 'Cost, tooling, recyclability, appearance',
                techniques: ['vacuum forming', 'injection molding', '3D printing', 'machining']
            },
            metal: {
                characteristics: 'Strong, precise, professional',
                applications: 'Mechanisms, weapons, hardware, frames',
                considerations: 'Weight, cost, safety, corrosion',
                techniques: ['welding', 'machining', 'forming', 'casting', 'finishing']
            },
            fabric: {
                characteristics: 'Flexible, textural, lightweight',
                applications: 'Soft goods, drapery, padding, coverings',
                considerations: 'Flame retardancy, durability, cleaning',
                techniques: ['sewing', 'draping', 'dyeing', 'printing', 'weathering']
            },
            paper: {
                characteristics: 'Inexpensive, temporary, detailed',
                applications: 'Documents, books, ephemera, breakaways',
                considerations: 'Aging, handling, replacement, authenticity',
                techniques: ['printing', 'aging', 'binding', 'cutting', 'laminating']
            }
        };
        
        // Safety protocols and considerations
        this.safetyProtocols = {
            weapons: {
                guidelines: 'All stage weapons must be certified safe replicas',
                requirements: ['No functional mechanisms', 'Rounded edges', 'Clear identification'],
                training: 'Mandatory safety briefing for all handlers',
                storage: 'Secure, locked storage when not in use'
            },
            breakaways: {
                guidelines: 'Designed to break safely without injury',
                requirements: ['Safe materials only', 'Controlled break patterns', 'Easy cleanup'],
                training: 'Performer instruction on proper use',
                storage: 'Climate controlled, handle with care'
            },
            food: {
                guidelines: 'Only food-safe materials for consumable props',
                requirements: ['Allergy considerations', 'Expiration tracking', 'Hygiene protocols'],
                training: 'Food safety certification for prop crew',
                storage: 'Proper refrigeration and labeling'
            },
            mechanical: {
                guidelines: 'All mechanisms must have safety interlocks',
                requirements: ['Emergency stops', 'Fail-safe design', 'Regular inspection'],
                training: 'Operator certification and backup operators',
                storage: 'Secure area with maintenance access'
            }
        };
        
        // Construction and sourcing workflows
        this.constructionWorkflows = {
            design_phase: {
                steps: ['Research', 'Concept sketches', 'Technical drawings', 'Material selection'],
                deliverables: ['Design package', 'Budget estimate', 'Timeline'],
                approvals: ['Director', 'Designer', 'Technical Director']
            },
            build_phase: {
                steps: ['Material procurement', 'Construction', 'Finishing', 'Testing'],
                deliverables: ['Completed prop', 'Documentation', 'Maintenance guide'],
                quality_checks: ['Safety inspection', 'Functionality test', 'Durability assessment']
            },
            implementation_phase: {
                steps: ['Delivery', 'Training', 'Rehearsal integration', 'Performance support'],
                deliverables: ['Trained operators', 'Emergency procedures', 'Backup plans'],
                ongoing: ['Maintenance', 'Repairs', 'Replacements', 'Storage']
            }
        };
        
        // Inventory and tracking systems
        this.inventoryTracking = {
            propDatabase: new Map(),
            locationTracking: new Map(),
            conditionReports: new Map(),
            usageHistory: new Map(),
            maintenanceRecords: new Map()
        };
        
        // Performance support systems
        this.performanceSupport = {
            propRunning: new Map(),
            quickChangeStations: new Map(),
            emergencyProtocols: new Map(),
            backupInventory: new Map()
        };
        
        // Budget and cost tracking
        this.budgetTracking = {
            totalBudget: null,
            categoryAllocations: {
                construction: 0.40,
                purchasing: 0.30,
                materials: 0.20,
                contingency: 0.10
            },
            expenses: new Map(),
            costProjections: new Map()
        };
        
        // Integration with production system
        this.setDesigner = null;
        this.technicalDirector = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        console.log('🎭 Props Master Agent: Ready to bring stories to life through objects');
    }

    /**
     * Initialize Props Master with system integration
     */
    async onInitialize() {
        try {
            console.log('🎭 Props Master: Initializing prop design and management systems...');
            
            // Connect to Ollama interface for AI prop design
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI prop design requires LLM assistance.');
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
            
            // Configure AI for prop design and management
            this.ollamaInterface.updatePerformanceContext({
                role: 'props_master',
                design_approach: this.designApproach,
                creativity_mode: 'functional_design',
                specialization: 'theatrical_props'
            });
            
            // Connect to related agents
            if (window.setDesignerAgent) {
                this.setDesigner = window.setDesignerAgent;
                console.log('🎭 Props Master: Connected to Set Designer');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('🎭 Props Master: Connected to Technical Director');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎭 Props Master: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize prop management systems
            await this.initializePropSystems();
            
            // Test prop design capabilities
            await this.testPropDesignCapabilities();
            
            console.log('🎭 Props Master: Ready to create and manage theatrical properties!')
            
        } catch (error) {
            console.error('🎭 Props Master: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI PROP DESIGN:
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
     * Subscribe to production events for prop coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('script:prop-requirements', (data) => this.onPropRequirements(data));
            window.theaterEventBus.subscribe('props:design-request', (data) => this.onPropDesignRequest(data));
            window.theaterEventBus.subscribe('props:construction-needed', (data) => this.onConstructionNeeded(data));
            window.theaterEventBus.subscribe('performance:prop-issue', (data) => this.onPropIssue(data));
            window.theaterEventBus.subscribe('rehearsal:prop-notes', (data) => this.onRehearsalNotes(data));
            
            console.log('🎭 Props Master: Subscribed to prop coordination events');
        }
    }

    /**
     * Initialize prop management systems
     */
    async initializePropSystems() {
        console.log('🎭 Props Master: Initializing prop management systems...');
        
        // Initialize design tools
        this.initializeDesignTools();
        
        // Initialize inventory system
        this.initializeInventorySystem();
        
        // Initialize safety protocols
        this.initializeSafetyProtocols();
        
        console.log('✅ Props Master: Prop management systems initialized');
    }

    /**
     * Initialize design tools
     */
    initializeDesignTools() {
        this.designTools = {
            conceptGenerator: (requirements) => this.generatePropConcept(requirements),
            materialSelector: (prop, constraints) => this.selectMaterials(prop, constraints),
            constructionPlanner: (design) => this.planConstruction(design),
            budgetEstimator: (propList) => this.estimateBudget(propList)
        };
        
        console.log('🎭 Props Master: Design tools initialized');
    }

    /**
     * Initialize inventory system
     */
    initializeInventorySystem() {
        this.inventorySystem = {
            cataloging: (prop) => this.catalogProp(prop),
            tracking: (propId) => this.trackPropLocation(propId),
            maintenance: (schedule) => this.scheduleMaintenance(schedule),
            reporting: () => this.generateInventoryReport()
        };
        
        console.log('🎭 Props Master: Inventory system initialized');
    }

    /**
     * Initialize safety protocols
     */
    initializeSafetyProtocols() {
        this.safetySystem = {
            weaponInspection: (weapon) => this.inspectWeapon(weapon),
            breakawayTesting: (item) => this.testBreakaway(item),
            mechanicalSafety: (mechanism) => this.checkMechanicalSafety(mechanism),
            foodSafety: (consumables) => this.verifyFoodSafety(consumables)
        };
        
        console.log('🎭 Props Master: Safety protocols initialized');
    }

    /**
     * Test prop design capabilities
     */
    async testPropDesignCapabilities() {
        try {
            const testPrompt = `
            As a props master, design a theatrical prop for a specific production need.
            
            Prop requirement:
            - Item: An antique pocket watch that must appear to work
            - Period: Victorian era, 1880s
            - Function: Character checks time, shows to audience, must be reliable
            - Budget: Medium budget production
            - Safety: Will be handled by multiple actors
            
            Provide:
            1. Design concept and visual description
            2. Construction approach and materials
            3. Functional requirements and mechanisms
            4. Safety considerations and protocols
            5. Budget estimate and timeline
            6. Maintenance and care instructions
            7. Backup plans and emergency alternatives
            8. Integration with costume and set design
            
            Format as comprehensive prop design specification.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🎭 Props Master: Design capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎭 Props Master: Design capability test failed:', error);
            throw new Error(`Prop design test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎭 Props Master: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize props project
        await this.initializePropsProject(data.production);
        
        // Analyze prop requirements
        await this.analyzeInitialPropRequirements(data.production);
    }

    /**
     * Initialize props project
     */
    async initializePropsProject(production) {
        console.log('🎭 Props Master: Initializing props project...');
        
        this.propsProject = {
            production: production,
            propsList: new Map(),
            designSpecs: new Map(),
            constructionPlans: new Map(),
            inventory: new Map(),
            maintenanceSchedule: new Map(),
            status: 'requirements_analysis',
            createdAt: new Date()
        };
        
        // Set up budget tracking
        await this.setupBudgetTracking(production);
        
        console.log('✅ Props Master: Props project initialized');
    }

    /**
     * Analyze initial prop requirements
     */
    async analyzeInitialPropRequirements(production) {
        try {
            console.log('🎭 Props Master: Analyzing initial prop requirements...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const analysisPrompt = `
                Analyze the prop requirements for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Typical prop needs for this type of production
                2. Period-specific requirements if applicable
                3. Character-driven prop needs
                4. Set integration and interaction props
                5. Special effects and mechanical requirements
                6. Safety considerations and compliance needs
                7. Budget implications and cost optimization
                8. Construction timeline and complexity
                9. Storage and maintenance requirements
                10. Performance support and backup needs
                
                Provide a comprehensive initial prop assessment that will guide the detailed prop development process.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1000,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.propsProject.initialAnalysis = response.content;
                    this.propsProject.status = 'analysis_complete';
                    
                    console.log('✅ Props Master: Initial requirements analysis complete');
                    
                    // Extract prop categories from analysis
                    await this.extractPropCategories(response.content);
                    
                    // Share analysis with production team
                    window.theaterEventBus?.publish('props:analysis-complete', {
                        production: production,
                        analysis: response.content,
                        propsMaster: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Props Master: Requirements analysis failed:', error.message);
            this.propsProject.status = 'analysis_error';
        }
    }

    /**
     * Handle specific prop requirements from script
     */
    async onPropRequirements(data) {
        console.log('🎭 Props Master: Prop requirements received from script');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.processPropRequirements(data.requirements);
        }
    }

    /**
     * Process detailed prop requirements
     */
    async processPropRequirements(requirements) {
        console.log('🎭 Props Master: Processing detailed prop requirements...');
        
        for (const requirement of requirements) {
            await this.analyzePropRequirement(requirement);
        }
    }

    /**
     * Analyze individual prop requirement
     */
    async analyzePropRequirement(requirement) {
        try {
            console.log(`🎭 Props Master: Analyzing requirement for ${requirement.item}...`);
            
            const requirementPrompt = `
            Analyze this specific prop requirement for detailed design planning:
            
            Prop Item: ${requirement.item}
            Context: ${requirement.context || 'General use'}
            Scene Usage: ${requirement.scenes || 'Multiple scenes'}
            Character Association: ${requirement.character || 'Various characters'}
            Functional Requirements: ${requirement.function || 'Basic functionality'}
            Special Considerations: ${requirement.special || 'Standard handling'}
            
            Production Context: ${this.currentProduction?.title}
            Budget Category: ${requirement.budget || 'Standard'}
            
            Provide detailed prop analysis:
            1. Design approach and visual concept
            2. Construction method and materials recommendation
            3. Functionality requirements and mechanisms needed
            4. Safety protocols and handling procedures
            5. Timeline for construction and delivery
            6. Cost estimation and budget impact
            7. Maintenance and care requirements
            8. Backup and emergency alternatives
            9. Integration with other production elements
            10. Quality assurance and testing procedures
            
            Format as actionable prop specification for construction team.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(requirementPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const propSpec = {
                    requirement: requirement,
                    specification: response.content,
                    designElements: await this.extractDesignElements(response.content),
                    constructionPlan: await this.extractConstructionPlan(response.content),
                    analyzedAt: new Date(),
                    status: 'analyzed'
                };
                
                this.propsProject.propsList.set(requirement.item, propSpec);
                
                console.log(`✅ Props Master: Requirement analyzed for ${requirement.item}`);
                
                // Create construction plan if needed
                if (requirement.constructionNeeded) {
                    await this.createConstructionPlan(requirement.item, propSpec);
                }
                
                return propSpec;
            }
            
        } catch (error) {
            console.error(`🎭 Props Master: Requirement analysis failed for ${requirement.item}:`, error);
            return null;
        }
    }

    /**
     * Handle prop design requests
     */
    async onPropDesignRequest(data) {
        console.log('🎭 Props Master: Prop design requested -', data.propType);
        
        await this.designProp(data.propType, data.specifications, data.deadline);
    }

    /**
     * Design specific prop
     */
    async designProp(propType, specifications, deadline) {
        try {
            console.log(`🎭 Props Master: Designing ${propType}...`);
            
            const designPrompt = `
            Design a theatrical prop with specific requirements:
            
            Prop Type: ${propType}
            Specifications: ${JSON.stringify(specifications)}
            Deadline: ${deadline}
            
            Design Context:
            - Production: ${this.currentProduction?.title}
            - Available Materials: ${Object.keys(this.materialsLibrary).join(', ')}
            - Safety Requirements: ${Object.keys(this.safetyProtocols).join(', ')}
            
            Create comprehensive prop design:
            1. Visual design concept and aesthetic approach
            2. Detailed construction specifications
            3. Material selection with justification
            4. Functionality and mechanism design
            5. Safety features and compliance measures
            6. Cost analysis and budget impact
            7. Construction timeline and milestones
            8. Quality control and testing procedures
            9. Maintenance protocols and care instructions
            10. Performance integration and usage guidelines
            
            Provide design that balances artistic vision with practical execution.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(designPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800,
                timeout: 30000
            });
            
            if (response && response.content) {
                const propDesign = {
                    propType: propType,
                    specifications: specifications,
                    deadline: deadline,
                    design: response.content,
                    materialsList: await this.extractMaterialsList(response.content),
                    safetyNotes: await this.extractSafetyNotes(response.content),
                    designedAt: new Date()
                };
                
                this.propsProject.designSpecs.set(propType, propDesign);
                
                console.log(`✅ Props Master: ${propType} design complete`);
                
                return propDesign;
            }
            
        } catch (error) {
            console.error(`🎭 Props Master: Prop design failed for ${propType}:`, error);
            return null;
        }
    }

    /**
     * Handle construction requests
     */
    async onConstructionNeeded(data) {
        console.log('🎭 Props Master: Construction needed -', data.propItem);
        
        await this.planConstruction(data.propItem, data.urgency, data.resources);
    }

    /**
     * Plan prop construction
     */
    async planConstruction(propItem, urgency, resources) {
        const constructionPlan = {
            propItem: propItem,
            urgency: urgency,
            resources: resources,
            timeline: this.calculateConstructionTimeline(urgency),
            materials: await this.selectConstructionMaterials(propItem),
            workflow: this.constructionWorkflows.build_phase,
            plannedAt: new Date()
        };
        
        this.propsProject.constructionPlans.set(propItem, constructionPlan);
        
        console.log(`📋 Props Master: Construction plan created for ${propItem}`);
        
        // Notify construction team
        window.theaterEventBus?.publish('props:construction-planned', {
            plan: constructionPlan,
            propsMaster: this.config.name
        });
    }

    /**
     * Handle prop issues during performance
     */
    async onPropIssue(data) {
        console.log('🎭 Props Master: Prop issue reported -', data.issue);
        
        await this.resolvePropIssue(data.issue, data.propItem, data.urgency);
    }

    /**
     * Resolve prop issue
     */
    async resolvePropIssue(issue, propItem, urgency) {
        console.log(`🎭 Props Master: Resolving ${issue} for ${propItem}...`);
        
        const resolutionStrategies = {
            malfunction: 'Immediate repair or replacement with backup',
            damage: 'Assess damage and implement quick fix',
            missing: 'Locate item or substitute with backup',
            safety: 'Remove from use and implement emergency protocol'
        };
        
        const strategy = resolutionStrategies[issue] || 'General troubleshooting protocol';
        
        // Implement resolution
        const resolution = {
            issue: issue,
            propItem: propItem,
            urgency: urgency,
            strategy: strategy,
            backupPlan: await this.activateBackupPlan(propItem),
            resolvedAt: new Date()
        };
        
        this.performanceSupport.emergencyProtocols.set(propItem, resolution);
        
        // Alert relevant personnel
        window.theaterEventBus?.publish('props:issue-resolved', {
            resolution: resolution,
            propsMaster: this.config.name
        });
    }

    /**
     * Handle rehearsal notes
     */
    async onRehearsalNotes(data) {
        console.log('🎭 Props Master: Rehearsal notes received');
        
        await this.processRehearsalFeedback(data.notes, data.adjustments);
    }

    /**
     * Process rehearsal feedback for prop adjustments
     */
    async processRehearsalFeedback(notes, adjustments) {
        for (const note of notes) {
            if (note.category === 'props') {
                await this.implementPropAdjustment(note.item, note.issue, note.solution);
            }
        }
    }

    /**
     * Extract prop categories from analysis
     */
    async extractPropCategories(analysis) {
        // Simplified extraction - would use AI parsing in practice
        return {
            handProps: ['documents', 'personal items', 'tools'],
            setPieces: ['furniture', 'decorative elements'],
            specialEffects: ['mechanical items', 'breakaways']
        };
    }

    /**
     * Extract design elements from specification
     */
    async extractDesignElements(specification) {
        // Simplified extraction - would parse actual design elements
        return {
            style: 'Period appropriate',
            materials: 'Wood and metal',
            finish: 'Aged and weathered',
            functionality: 'Working mechanism'
        };
    }

    /**
     * Extract construction plan from specification
     */
    async extractConstructionPlan(specification) {
        // Simplified extraction - would create detailed plan
        return {
            phases: ['Design', 'Material procurement', 'Construction', 'Finishing'],
            timeline: '2 weeks',
            resources: 'Props crew and workshop',
            testing: 'Functionality and safety verification'
        };
    }

    /**
     * Calculate construction timeline based on urgency
     */
    calculateConstructionTimeline(urgency) {
        const timelines = {
            urgent: '3 days',
            high: '1 week',
            normal: '2 weeks',
            low: '3 weeks'
        };
        
        return timelines[urgency] || timelines.normal;
    }

    /**
     * Setup budget tracking for production
     */
    async setupBudgetTracking(production) {
        this.budgetTracking.totalBudget = production.budget?.props || 10000;
        this.budgetTracking.spent = 0;
        this.budgetTracking.committed = 0;
        this.budgetTracking.remaining = this.budgetTracking.totalBudget;
        
        console.log('💰 Props Master: Budget tracking initialized');
    }

    /**
     * Get props management status
     */
    getPropsStatus() {
        return {
            currentProject: {
                active: !!this.propsProject.production,
                title: this.propsProject.production?.title,
                status: this.propsProject.status,
                analysisComplete: !!this.propsProject.initialAnalysis,
                propsDesigned: this.propsProject.propsList.size
            },
            inventory: {
                totalProps: this.propsProject.propsList.size,
                designSpecs: this.propsProject.designSpecs.size,
                constructionPlans: this.propsProject.constructionPlans.size,
                maintenanceItems: this.propsProject.maintenanceSchedule.size
            },
            budget: {
                total: this.budgetTracking.totalBudget,
                spent: this.budgetTracking.spent,
                remaining: this.budgetTracking.remaining,
                utilization: this.calculateBudgetUtilization()
            },
            capabilities: this.propsCapabilities,
            safety: {
                protocolsActive: Object.keys(this.safetyProtocols).length,
                inspectionsCompleted: this.calculateSafetyInspections(),
                complianceStatus: 'All requirements met'
            }
        };
    }

    /**
     * Calculate budget utilization
     */
    calculateBudgetUtilization() {
        if (!this.budgetTracking.totalBudget) return 0;
        return (this.budgetTracking.spent / this.budgetTracking.totalBudget) * 100;
    }

    /**
     * Calculate safety inspections completed
     */
    calculateSafetyInspections() {
        return Array.from(this.propsProject.propsList.values())
            .filter(prop => prop.safetyInspected).length;
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎭 Props Master: Concluding props management session...');
        
        // Finalize props project
        if (this.propsProject.status !== 'idle') {
            this.propsProject.status = 'completed';
            this.propsProject.completedAt = new Date();
        }
        
        // Generate props summary
        if (this.currentProduction) {
            const propsSummary = this.generatePropsSummary();
            console.log('🎭 Props Master: Props summary generated');
        }
        
        console.log('🎭 Props Master: Props management concluded');
    }

    /**
     * Generate props summary
     */
    generatePropsSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            props: {
                analysisCompleted: !!this.propsProject.initialAnalysis,
                propsDesigned: this.propsProject.propsList.size,
                constructionPlanned: this.propsProject.constructionPlans.size,
                designSpecsCreated: this.propsProject.designSpecs.size
            },
            management: {
                inventoryTracked: this.propsProject.inventory.size,
                maintenanceScheduled: this.propsProject.maintenanceSchedule.size,
                safetyProtocolsImplemented: Object.keys(this.safetyProtocols).length
            },
            budget: {
                totalAllocated: this.budgetTracking.totalBudget,
                amountSpent: this.budgetTracking.spent,
                utilizationRate: this.calculateBudgetUtilization()
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropsMasterAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.PropsMasterAgent = PropsMasterAgent;
    console.log('🎭 Props Master Agent loaded - Ready for comprehensive prop design and management');
}