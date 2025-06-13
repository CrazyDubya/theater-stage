/**
 * SetDesignerAgent.js - AI-Powered Physical Environment Design
 * 
 * The Set Designer Agent uses Ollama LLM to create immersive physical environments
 * that support storytelling and enhance the theatrical experience. Coordinates with
 * production design, lighting, and technical teams for practical implementation.
 * 
 * Features:
 * - AI-driven set design and space planning
 * - 3D environment conceptualization
 * - Technical construction coordination
 * - Safety and accessibility compliance
 * - Budget-conscious design solutions
 * - Real-time adaptation for rehearsal needs
 */

class SetDesignerAgent extends BaseAgent {
    constructor(config = {}) {
        super('set-designer', {
            name: 'Set Designer',
            role: 'set-designer',
            priority: 80, // High priority for physical space creation
            maxActionsPerSecond: 5,
            personality: config.personality || 'spatial-thinker',
            ...config
        });
        
        // Set Designer specific properties
        this.ollamaInterface = null;
        this.designStyle = config.designStyle || 'functional-aesthetic';
        this.creativityLevel = config.creativity || 0.85;
        
        // Set design capabilities
        this.setCapabilities = {
            spacePlanning: {
                stageLayout: true,
                trafficFlow: true,
                sightlines: true,
                acoustics: true,
                accessibility: true
            },
            designStyles: {
                realistic: true,
                abstract: true,
                minimalist: true,
                period: true,
                conceptual: true
            },
            technicalSkills: {
                construction: true,
                engineering: true,
                materials: true,
                safety: true,
                budgeting: true
            },
            specialFeatures: {
                multilevel: true,
                movingPieces: true,
                interactiveElements: true,
                quickChanges: true,
                projectionSurfaces: true
            },
            coordination: {
                lighting: true,
                sound: true,
                costumes: true,
                props: true,
                technical: true
            }
        };
        
        // Current set design project
        this.designProject = {
            production: null,
            designConcept: null,
            spaceAnalysis: null,
            setModels: new Map(),
            constructionPlans: new Map(),
            materialSpecifications: new Map(),
            safetyAssessments: new Map(),
            status: 'idle'
        };
        
        // Physical space specifications
        this.spaceSpecifications = {
            stage: {
                dimensions: { width: 40, depth: 30, height: 20 }, // feet
                type: 'proscenium', // proscenium, thrust, arena, black_box
                capacity: null,
                technicalFeatures: [],
                limitations: []
            },
            audience: {
                capacity: null,
                sightlineAngles: [],
                acousticProperties: null,
                proximityToStage: null
            },
            technical: {
                flyGallery: false,
                trapdoors: false,
                orchestra_pit: false,
                loading_dock: false,
                storage: null
            }
        };
        
        // Design elements and materials
        this.designElements = {
            platforms: new Map(),
            walls: new Map(),
            entrances: new Map(),
            furniture: new Map(),
            practicalElements: new Map(),
            decorativeElements: new Map()
        };
        
        // Material library and specifications
        this.materialLibrary = {
            structural: {
                lumber: { cost: 'medium', durability: 'high', workability: 'high', weight: 'medium' },
                steel: { cost: 'high', durability: 'very_high', workability: 'medium', weight: 'high' },
                plywood: { cost: 'low', durability: 'medium', workability: 'high', weight: 'light' },
                mdf: { cost: 'low', durability: 'medium', workability: 'high', weight: 'medium' }
            },
            covering: {
                muslin: { cost: 'low', appearance: 'basic', paintability: 'excellent', durability: 'low' },
                canvas: { cost: 'medium', appearance: 'textured', paintability: 'good', durability: 'high' },
                lauan: { cost: 'medium', appearance: 'smooth', paintability: 'excellent', durability: 'medium' },
                foam: { cost: 'medium', appearance: 'varied', paintability: 'good', durability: 'medium' }
            },
            specialty: {
                plexiglass: { cost: 'high', appearance: 'transparent', workability: 'medium', safety: 'high' },
                scrim: { cost: 'medium', appearance: 'translucent', effects: 'lighting_friendly', durability: 'low' },
                mirror: { cost: 'high', appearance: 'reflective', effects: 'spatial_illusion', safety: 'medium' },
                texture_mediums: { cost: 'medium', appearance: 'varied', effects: 'surface_variety', durability: 'medium' }
            }
        };
        
        // Construction and technical tracking
        this.constructionTracking = {
            buildSchedule: new Map(),
            crewAssignments: new Map(),
            materialOrders: new Map(),
            progressUpdates: [],
            safetyInspections: new Map(),
            loadInPlan: null
        };
        
        // Safety and building codes
        this.safetyRequirements = {
            egress: {
                minExitWidth: 44, // inches
                maxTravelDistance: 200, // feet
                exitSigns: 'required',
                emergencyLighting: 'required'
            },
            structural: {
                loadCapacity: 'engineer_certified',
                railingHeight: 42, // inches minimum
                stairRiser: { max: 7.75, min: 4 }, // inches
                stairTread: { min: 11 } // inches
            },
            fire: {
                flameProofing: 'required',
                smokeDetection: 'required',
                clearanceToLights: 18, // inches minimum
                materialRestrictions: []
            }
        };
        
        // Budget and cost tracking
        this.budgetTracking = {
            totalBudget: null,
            allocations: {
                materials: 0.60,
                labor: 0.25,
                equipment: 0.10,
                contingency: 0.05
            },
            expenses: new Map(),
            costEstimates: new Map()
        };
        
        // Integration with production system
        this.productionDesigner = null;
        this.technicalDirector = null;
        this.lightingDesigner = null;
        this.currentProduction = null;
        
        console.log('🏗️ Set Designer Agent: Ready to create immersive physical environments');
    }

    /**
     * Initialize Set Designer with system integration
     */
    async onInitialize() {
        try {
            console.log('🏗️ Set Designer: Initializing set design systems...');
            
            // Connect to Ollama interface for AI design
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI set design requires LLM assistance.');
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
            
            // Configure AI for set design
            this.ollamaInterface.updatePerformanceContext({
                role: 'set_designer',
                design_style: this.designStyle,
                creativity_mode: 'spatial_design',
                specialization: 'theatrical_environments'
            });
            
            // Connect to related agents
            if (window.productionDesignerAgent) {
                this.productionDesigner = window.productionDesignerAgent;
                console.log('🏗️ Set Designer: Connected to Production Designer');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('🏗️ Set Designer: Connected to Technical Director');
            }
            
            if (window.lightingDesignerAgent) {
                this.lightingDesigner = window.lightingDesignerAgent;
                console.log('🏗️ Set Designer: Connected to Lighting Designer');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize design systems
            await this.initializeDesignSystems();
            
            // Test set design capabilities
            await this.testSetDesignCapabilities();
            
            console.log('🏗️ Set Designer: Ready to create compelling physical environments!')
            
        } catch (error) {
            console.error('🏗️ Set Designer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI SET DESIGN:
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
     * Subscribe to production events for set coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('design:concept-complete', (data) => this.onDesignConceptReceived(data));
            window.theaterEventBus.subscribe('technical:space-requirements', (data) => this.onSpaceRequirements(data));
            window.theaterEventBus.subscribe('rehearsal:space-needs', (data) => this.onRehearsalSpaceNeeds(data));
            window.theaterEventBus.subscribe('set:construction-update', (data) => this.onConstructionUpdate(data));
            window.theaterEventBus.subscribe('budget:set-constraints', (data) => this.onBudgetConstraints(data));
            
            console.log('🏗️ Set Designer: Subscribed to set design coordination events');
        }
    }

    /**
     * Initialize design systems
     */
    async initializeDesignSystems() {
        console.log('🏗️ Set Designer: Initializing design systems...');
        
        // Initialize space analysis tools
        this.initializeSpaceAnalysis();
        
        // Initialize material database
        this.initializeMaterialDatabase();
        
        // Initialize safety protocols
        this.initializeSafetyProtocols();
        
        console.log('✅ Set Designer: Design systems initialized');
    }

    /**
     * Initialize space analysis tools
     */
    initializeSpaceAnalysis() {
        this.spaceAnalysisTools = {
            sightlineCalculator: (stagePos, audiencePos) => {
                // Simplified sightline calculation
                const angle = Math.atan2(stagePos.height, audiencePos.distance);
                return angle > 0.087; // 5 degrees minimum
            },
            acousticAnalyzer: (material, volume) => {
                const absorptionCoefficients = {
                    wood: 0.1,
                    fabric: 0.5,
                    concrete: 0.02,
                    carpet: 0.3
                };
                return absorptionCoefficients[material] || 0.1;
            },
            loadCalculator: (span, load, material) => {
                // Simplified load calculation
                const materialStrengths = {
                    lumber: 1000, // psi
                    steel: 36000,
                    plywood: 800
                };
                return (materialStrengths[material] || 800) * span;
            }
        };
        
        console.log('🏗️ Set Designer: Space analysis tools initialized');
    }

    /**
     * Initialize material database
     */
    initializeMaterialDatabase() {
        // Extend material library with detailed specifications
        this.materialSpecifications = {
            lumber: {
                '2x4': { actualSize: '1.5x3.5', lengthsAvailable: [8, 10, 12, 16], grade: 'construction' },
                '2x6': { actualSize: '1.5x5.5', lengthsAvailable: [8, 10, 12, 16], grade: 'construction' },
                '2x8': { actualSize: '1.5x7.25', lengthsAvailable: [8, 10, 12, 16], grade: 'construction' },
                '4x4': { actualSize: '3.5x3.5', lengthsAvailable: [8, 10, 12], grade: 'post' }
            },
            sheeting: {
                'plywood_3/4': { thickness: 0.75, sizes: ['4x8'], grade: 'AB' },
                'plywood_1/2': { thickness: 0.5, sizes: ['4x8'], grade: 'AB' },
                'osb_3/4': { thickness: 0.75, sizes: ['4x8'], grade: 'structural' },
                'lauan_1/4': { thickness: 0.25, sizes: ['4x8'], grade: 'smooth' }
            }
        };
        
        console.log('🏗️ Set Designer: Material database initialized');
    }

    /**
     * Initialize safety protocols
     */
    initializeSafetyProtocols() {
        this.safetyChecklist = {
            structural: [
                'All connections properly fastened',
                'Load calculations verified',
                'Railings meet height requirements',
                'Stairs meet riser/tread specifications'
            ],
            fire: [
                'All materials flame-proofed',
                'Clearances from lights maintained',
                'Exit paths clearly marked',
                'Emergency lighting functional'
            ],
            electrical: [
                'All wiring by qualified electrician',
                'GFCI protection where required',
                'Proper grounding',
                'Load calculations within limits'
            ]
        };
        
        console.log('🏗️ Set Designer: Safety protocols initialized');
    }

    /**
     * Test set design capabilities
     */
    async testSetDesignCapabilities() {
        try {
            const testPrompt = `
            As a set designer, create a set design for a theatrical production.
            
            Production details:
            - Play: Contemporary family drama
            - Setting: Modern living room, multiple time periods
            - Themes: Memory, family dynamics, change over time
            - Stage: Proscenium, 40'W x 30'D
            - Budget: Moderate, practical solutions preferred
            
            Provide:
            1. Overall set concept and approach
            2. Key structural elements and their purposes
            3. Materials and construction methods
            4. Sight line and traffic flow considerations
            5. Integration with lighting design needs
            6. Quick change capabilities for time transitions
            7. Safety considerations and code compliance
            8. Budget-conscious material choices
            
            Format as comprehensive set design proposal.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🏗️ Set Designer: Design capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🏗️ Set Designer: Design capability test failed:', error);
            throw new Error(`Set design test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🏗️ Set Designer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize design project
        await this.initializeDesignProject(data.production);
        
        // Analyze space requirements
        await this.analyzeSpaceRequirements(data.production);
    }

    /**
     * Initialize design project
     */
    async initializeDesignProject(production) {
        console.log('🏗️ Set Designer: Initializing design project...');
        
        this.designProject = {
            production: production,
            designConcept: null,
            spaceAnalysis: null,
            setModels: new Map(),
            constructionPlans: new Map(),
            materialSpecifications: new Map(),
            safetyAssessments: new Map(),
            status: 'space_analysis',
            createdAt: new Date()
        };
        
        // Extract space requirements from production
        await this.extractSpaceRequirements(production);
        
        console.log('✅ Set Designer: Design project initialized');
    }

    /**
     * Analyze space requirements for production
     */
    async analyzeSpaceRequirements(production) {
        try {
            console.log('🏗️ Set Designer: Analyzing space requirements...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const analysisPrompt = `
                Analyze the space and set requirements for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Story setting and environmental needs
                2. Character movement and traffic patterns
                3. Scene change requirements and flexibility
                4. Audience experience and immersion
                5. Technical integration (lighting, sound, effects)
                6. Safety and accessibility requirements
                7. Budget and construction feasibility
                8. Rehearsal and performance practicality
                9. Multi-scene functionality if needed
                10. Period accuracy vs. theatrical effectiveness
                
                Provide detailed space analysis including:
                - Primary playing areas and their functions
                - Entrance and exit requirements
                - Level changes and vertical elements
                - Storage and quick-change considerations
                - Sight line optimization
                - Acoustic considerations
                
                Format as comprehensive space analysis report.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1000,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.designProject.spaceAnalysis = response.content;
                    this.designProject.status = 'analysis_complete';
                    
                    console.log('✅ Set Designer: Space analysis complete');
                    
                    // Extract spatial elements from analysis
                    await this.extractSpatialElements(response.content);
                    
                    // Begin concept development
                    await this.developSetConcept(production, response.content);
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Set Designer: Space analysis failed:', error.message);
            this.designProject.status = 'analysis_error';
        }
    }

    /**
     * Handle design concept from Production Designer
     */
    async onDesignConceptReceived(data) {
        console.log('🏗️ Set Designer: Received design concept from Production Designer');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.alignSetWithProductionDesign(data.concept, data.colorPalette, data.styleGuide);
        }
    }

    /**
     * Align set design with overall production design
     */
    async alignSetWithProductionDesign(designConcept, colorPalette, styleGuide) {
        try {
            console.log('🏗️ Set Designer: Aligning set with production design...');
            
            const alignmentPrompt = `
            Align the set design with this overall production design concept:
            
            Production Design Concept:
            ${designConcept}
            
            Color Palette:
            ${JSON.stringify(colorPalette)}
            
            Current Space Analysis:
            ${this.designProject.spaceAnalysis || 'To be completed'}
            
            Provide specific set design alignment:
            1. How should set colors support the production palette?
            2. What materials and textures align with the overall aesthetic?
            3. How can set architecture support the visual style?
            4. What design elements should be emphasized or minimized?
            5. How should the set frame and support other design elements?
            6. What opportunities exist for visual integration?
            
            Ensure the set design enhances the overall production vision while serving practical needs.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(alignmentPrompt, {
                temperature: 0.8,
                max_tokens: 700
            });
            
            if (response && response.content) {
                this.designProject.productionAlignment = response.content;
                
                console.log('✅ Set Designer: Set aligned with production design');
                
                // Update set concept based on alignment
                await this.updateSetConceptForAlignment(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Set Designer: Production design alignment failed:', error.message);
        }
    }

    /**
     * Develop comprehensive set concept
     */
    async developSetConcept(production, spaceAnalysis) {
        try {
            console.log('🏗️ Set Designer: Developing set concept...');
            
            const conceptPrompt = `
            Develop a comprehensive set design concept based on this space analysis:
            
            Space Analysis:
            ${spaceAnalysis}
            
            Production: ${production.title} (${production.type})
            
            Create detailed set concept including:
            1. Overall design philosophy and approach
            2. Key structural elements and their placement
            3. Material choices with practical justification
            4. Construction methods and techniques
            5. Integration with lighting and technical needs
            6. Safety considerations and code compliance
            7. Budget optimization strategies
            8. Timeline and construction sequence
            9. Adaptability for rehearsal and performance
            10. Maintenance and strike considerations
            
            Provide a complete set design that balances artistic vision with practical execution.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 1200,
                timeout: 45000
            });
            
            if (response && response.content) {
                this.designProject.designConcept = response.content;
                this.designProject.status = 'concept_complete';
                
                console.log('✅ Set Designer: Set concept developed');
                
                // Create construction plans
                await this.createConstructionPlans(response.content);
                
                // Generate material specifications
                await this.generateMaterialSpecifications(response.content);
                
                // Share concept with production team
                window.theaterEventBus?.publish('set:concept-complete', {
                    production: production,
                    concept: response.content,
                    spaceAnalysis: spaceAnalysis,
                    setDesigner: this.config.name
                });
                
                return response.content;
            }
            
        } catch (error) {
            console.error('🏗️ Set Designer: Concept development failed:', error);
            return null;
        }
    }

    /**
     * Handle space requirements from technical team
     */
    async onSpaceRequirements(data) {
        console.log('🏗️ Set Designer: Technical space requirements received');
        
        await this.incorporateSpaceRequirements(data.requirements, data.priority);
    }

    /**
     * Incorporate technical space requirements
     */
    async incorporateSpaceRequirements(requirements, priority) {
        try {
            console.log(`🏗️ Set Designer: Incorporating ${priority} space requirements...`);
            
            const requirementsPrompt = `
            Incorporate these technical space requirements into the set design:
            
            Requirements: ${requirements}
            Priority: ${priority}
            
            Current Set Concept:
            ${this.designProject.designConcept || 'To be developed'}
            
            Provide specific adaptations:
            1. How can these requirements be integrated into the current design?
            2. What structural changes are needed?
            3. How do these changes affect other design elements?
            4. What are the cost and timeline implications?
            5. How can we maintain design integrity while meeting requirements?
            
            Suggest practical modifications that address the requirements effectively.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(requirementsPrompt, {
                temperature: 0.7,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.designProject.requirementAdaptations = response.content;
                
                console.log('✅ Set Designer: Space requirements incorporated');
                
                // Update construction plans if needed
                if (priority === 'high' || priority === 'urgent') {
                    await this.updateConstructionPlans(response.content);
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Set Designer: Requirements incorporation failed:', error.message);
        }
    }

    /**
     * Handle rehearsal space needs
     */
    async onRehearsalSpaceNeeds(data) {
        console.log('🏗️ Set Designer: Rehearsal space needs identified');
        
        await this.adaptForRehearsalNeeds(data.needs, data.timeline);
    }

    /**
     * Adapt set for rehearsal needs
     */
    async adaptForRehearsalNeeds(needs, timeline) {
        const rehearsalAdaptations = {
            taping: 'Floor tape outline of set pieces',
            rehearsalPieces: 'Simplified temporary structures',
            partialBuild: 'Key elements built early for practice',
            fullSet: 'Complete set available for rehearsal'
        };
        
        const adaptation = this.selectRehearsalAdaptation(needs, timeline);
        
        console.log(`🏗️ Set Designer: Implementing ${adaptation} for rehearsal`);
        
        // Create rehearsal plan
        const rehearsalPlan = {
            needs: needs,
            timeline: timeline,
            adaptation: adaptation,
            implementation: rehearsalAdaptations[adaptation],
            createdAt: new Date()
        };
        
        this.constructionTracking.rehearsalPlan = rehearsalPlan;
        
        // Notify production team
        window.theaterEventBus?.publish('set:rehearsal-plan-ready', {
            plan: rehearsalPlan,
            setDesigner: this.config.name
        });
    }

    /**
     * Select appropriate rehearsal adaptation
     */
    selectRehearsalAdaptation(needs, timeline) {
        if (timeline < 7) return 'taping';
        if (timeline < 14) return 'rehearsalPieces';
        if (timeline < 21) return 'partialBuild';
        return 'fullSet';
    }

    /**
     * Create construction plans
     */
    async createConstructionPlans(setConcept) {
        console.log('🏗️ Set Designer: Creating construction plans...');
        
        // Extract construction elements (simplified)
        const constructionElements = this.extractConstructionElements(setConcept);
        
        // Create build schedule
        const buildSchedule = this.createBuildSchedule(constructionElements);
        
        // Generate material lists
        const materialLists = this.generateMaterialLists(constructionElements);
        
        this.designProject.constructionPlans.set('main', {
            elements: constructionElements,
            schedule: buildSchedule,
            materials: materialLists,
            createdAt: new Date()
        });
        
        console.log('🏗️ Set Designer: Construction plans created');
    }

    /**
     * Extract construction elements from concept
     */
    extractConstructionElements(setConcept) {
        // Simplified extraction - would parse actual design elements
        return [
            { type: 'platform', dimensions: '8x8x2', material: 'plywood', priority: 1 },
            { type: 'wall', dimensions: '12x8', material: 'framed_flat', priority: 2 },
            { type: 'stairs', dimensions: '4x8', material: 'lumber', priority: 3 },
            { type: 'door', dimensions: '3x7', material: 'practiced', priority: 2 }
        ];
    }

    /**
     * Create build schedule
     */
    createBuildSchedule(elements) {
        return {
            week1: 'Frame construction and platform building',
            week2: 'Wall construction and installation',
            week3: 'Detail work and painting',
            week4: 'Final assembly and technical integration'
        };
    }

    /**
     * Generate material specifications
     */
    async generateMaterialSpecifications(setConcept) {
        // Create detailed material specifications
        const specifications = {
            lumber: '2x4 construction grade, various lengths',
            sheeting: '3/4" plywood for platforms, 1/4" lauan for facing',
            hardware: 'Deck screws, carriage bolts, hinges',
            paint: 'Scenic paint, primer, flame retardant'
        };
        
        this.designProject.materialSpecifications.set('main', specifications);
        
        console.log('🏗️ Set Designer: Material specifications generated');
    }

    /**
     * Get set design status
     */
    getSetDesignStatus() {
        return {
            currentProject: {
                active: !!this.designProject.production,
                title: this.designProject.production?.title,
                status: this.designProject.status,
                spaceAnalysisComplete: !!this.designProject.spaceAnalysis,
                conceptComplete: !!this.designProject.designConcept
            },
            design: {
                setModels: this.designProject.setModels.size,
                constructionPlans: this.designProject.constructionPlans.size,
                materialSpecs: this.designProject.materialSpecifications.size,
                safetyAssessments: this.designProject.safetyAssessments.size
            },
            construction: {
                scheduleCreated: !!this.constructionTracking.buildSchedule.size,
                crewAssigned: this.constructionTracking.crewAssignments.size,
                materialsOrdered: this.constructionTracking.materialOrders.size,
                progressUpdates: this.constructionTracking.progressUpdates.length
            },
            capabilities: this.setCapabilities,
            space: {
                stageType: this.spaceSpecifications.stage.type,
                dimensions: this.spaceSpecifications.stage.dimensions,
                technicalFeatures: this.spaceSpecifications.technical
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🏗️ Set Designer: Concluding set design session...');
        
        // Finalize design project
        if (this.designProject.status !== 'idle') {
            this.designProject.status = 'completed';
            this.designProject.completedAt = new Date();
        }
        
        // Generate set design summary
        if (this.currentProduction) {
            const setDesignSummary = this.generateSetDesignSummary();
            console.log('🏗️ Set Designer: Set design summary generated');
        }
        
        console.log('🏗️ Set Designer: Set design concluded');
    }

    /**
     * Generate set design summary
     */
    generateSetDesignSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            design: {
                spaceAnalysisCompleted: !!this.designProject.spaceAnalysis,
                conceptDeveloped: !!this.designProject.designConcept,
                constructionPlansCreated: this.designProject.constructionPlans.size,
                materialSpecificationsGenerated: this.designProject.materialSpecifications.size
            },
            coordination: {
                productionDesignAligned: !!this.designProject.productionAlignment,
                technicalRequirementsIncorporated: !!this.designProject.requirementAdaptations,
                rehearsalNeedsAddressed: !!this.constructionTracking.rehearsalPlan
            },
            construction: {
                buildScheduleCreated: !!this.constructionTracking.buildSchedule,
                safetyAssessmentsCompleted: this.designProject.safetyAssessments.size,
                budgetEstimatesGenerated: this.budgetTracking.costEstimates.size
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SetDesignerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.SetDesignerAgent = SetDesignerAgent;
    console.log('🏗️ Set Designer Agent loaded - Ready for immersive environment creation');
}