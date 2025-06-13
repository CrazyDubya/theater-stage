/**
 * MakeupArtistAgent.js - AI-Powered Character Transformation
 * 
 * The Makeup Artist Agent uses Ollama LLM to design and execute makeup
 * looks that transform actors into their characters. Combines artistry
 * with practical application for theatrical character realization.
 * 
 * Features:
 * - AI-driven makeup design and character transformation
 * - Period-accurate and stylistic makeup planning
 * - Special effects and prosthetics coordination
 * - Color theory and skin tone analysis
 * - Real-time application guidance and troubleshooting
 * - Integration with costume and lighting design
 */

class MakeupArtistAgent extends BaseAgent {
    constructor(config = {}) {
        super('makeup-artist', {
            name: 'Makeup Artist',
            role: 'makeup-artist',
            priority: 70, // High priority for character transformation
            maxActionsPerSecond: 5,
            personality: config.personality || 'artistic',
            ...config
        });
        
        // Makeup Artist specific properties
        this.ollamaInterface = null;
        this.artStyle = config.style || 'naturalistic';
        this.creativityLevel = config.creativity || 0.85;
        
        // Makeup artistry capabilities
        this.makeupCapabilities = {
            characterDesign: {
                ageProgression: true,
                periodAccuracy: true,
                fantasyCreatures: true,
                animalCharacters: true,
                historicalFigures: true
            },
            techniques: {
                naturalBeauty: true,
                theatricalEnhancement: true,
                specialEffects: true,
                prostheticApplication: true,
                bodyPainting: true
            },
            specialization: {
                woundSimulation: true,
                aging: true,
                fantasyMakeup: true,
                period_styles: true,
                ethnicCharacterization: true
            },
            technical: {
                colorMatching: true,
                skinToneAnalysis: true,
                lightingAdaptation: true,
                sweatProofFormulas: true,
                quickChangeSupport: true
            },
            collaborative: {
                costumeIntegration: true,
                lightingCoordination: true,
                hairStylingAlignment: true,
                performerConsultation: true,
                photographyOptimization: true
            }
        };
        
        // Current makeup project
        this.makeupProject = {
            production: null,
            designConcept: null,
            characterLooks: new Map(),
            colorPalettes: new Map(),
            applicationGuides: new Map(),
            specialEffects: new Map(),
            status: 'idle'
        };
        
        // Makeup techniques and styles
        this.makeupTechniques = {
            base_application: {
                foundation: {
                    purpose: 'Even skin tone and create base',
                    considerations: 'Skin type, lighting conditions, character needs',
                    techniques: ['stippling', 'buffing', 'airbrushing', 'finger blending']
                },
                concealer: {
                    purpose: 'Hide imperfections and create structure',
                    considerations: 'Color correction, highlight/shadow prep',
                    techniques: ['spot concealing', 'color correcting', 'undereye brightening']
                },
                powder: {
                    purpose: 'Set makeup and control shine',
                    considerations: 'Stage lights, performance duration, skin type',
                    techniques: ['pressing', 'dusting', 'baking', 'selective setting']
                }
            },
            character_transformation: {
                aging: {
                    techniques: ['wrinkle mapping', 'color progression', 'texture creation'],
                    materials: ['stipple sponges', 'alcohol paints', 'latex pieces'],
                    considerations: 'Natural aging patterns, character background'
                },
                fantasyCreatures: {
                    techniques: ['prosthetic application', 'color blending', 'texture work'],
                    materials: ['foam latex', 'gelatin', 'alcohol paints', 'adhesives'],
                    considerations: 'Movement restrictions, visibility, comfort'
                },
                period_styles: {
                    techniques: ['historical research', 'period color matching', 'style adaptation'],
                    materials: ['period-appropriate colors', 'traditional tools'],
                    considerations: 'Historical accuracy vs. theatrical needs'
                }
            },
            special_effects: {
                wounds: {
                    techniques: ['sculpting', 'color layering', 'texture application'],
                    materials: ['wax', 'gelatin', 'blood products', 'scar plastic'],
                    safety: 'Non-toxic materials, patch testing, easy removal'
                },
                fantasy_elements: {
                    techniques: ['airbrushing', 'stenciling', 'hand painting'],
                    materials: ['alcohol paints', 'temporary tattoos', 'glitter'],
                    considerations: 'Durability, skin sensitivity, removal process'
                }
            }
        };
        
        // Color theory and palette systems
        this.colorTheory = {
            skin_undertones: {
                cool: {
                    characteristics: 'Pink, red, or blue undertones',
                    complementary_colors: 'Blues, purples, cool pinks',
                    foundation_notes: 'Rose, beige, pink-based'
                },
                warm: {
                    characteristics: 'Yellow, golden, or peachy undertones',
                    complementary_colors: 'Golds, oranges, warm browns',
                    foundation_notes: 'Golden, yellow-based, camel'
                },
                neutral: {
                    characteristics: 'Balanced mix of warm and cool',
                    complementary_colors: 'Wide range of colors work',
                    foundation_notes: 'True beige, neutral tones'
                }
            },
            theatrical_palettes: {
                natural: {
                    philosophy: 'Enhance natural features subtly',
                    color_range: 'Skin tones, soft browns, muted colors',
                    application: 'Close viewing, intimate venues'
                },
                enhanced: {
                    philosophy: 'Amplify features for stage visibility',
                    color_range: 'Stronger colors, defined contrasts',
                    application: 'Medium theaters, dramatic lighting'
                },
                stylized: {
                    philosophy: 'Create specific artistic effect',
                    color_range: 'Bold colors, high contrast, creative choices',
                    application: 'Large venues, concept productions'
                }
            },
            period_palettes: {
                renaissance: {
                    characteristics: 'Pale skin, defined features, natural colors',
                    key_elements: 'White lead base, kohl eyes, red lips',
                    modern_adaptation: 'Safe alternatives to historical materials'
                },
                victorian: {
                    characteristics: 'Natural look, subtle enhancement',
                    key_elements: 'Clear skin, defined brows, berry lips',
                    considerations: 'Class distinctions, moral implications'
                },
                nineteen_twenties: {
                    characteristics: 'Dark eyes, thin brows, cupid bow lips',
                    key_elements: 'Kohl-rimmed eyes, rouge circles, bee-stung lips',
                    style_notes: 'Rebellion against Victorian restraint'
                }
            }
        };
        
        // Materials and product categories
        this.makeupMaterials = {
            base_products: {
                foundations: {
                    liquid: 'Natural finish, buildable coverage',
                    cream: 'Full coverage, good for dry skin',
                    powder: 'Quick application, oil control',
                    airbrush: 'Even coverage, long-wearing'
                },
                concealers: {
                    stick: 'Precise application, full coverage',
                    liquid: 'Natural finish, easy blending',
                    color_correctors: 'Address specific color issues'
                }
            },
            color_products: {
                eyeshadows: {
                    powder: 'Traditional, wide color range',
                    cream: 'Long-wearing, intense color',
                    alcohol_paints: 'Professional theater, waterproof'
                },
                lip_products: {
                    lipstick: 'Traditional, good color payoff',
                    lip_stain: 'Long-wearing, natural look',
                    grease_paint: 'Theater-specific, highly pigmented'
                }
            },
            special_effects: {
                prosthetics: {
                    foam_latex: 'Lightweight, detailed, professional',
                    gelatin: 'Flexible, easy to work with',
                    silicone: 'Realistic, durable, expensive'
                },
                adhesives: {
                    spirit_gum: 'Traditional, strong hold',
                    prosthetic_adhesive: 'Professional grade, skin safe',
                    medical_tape: 'Gentle removal, temporary application'
                }
            }
        };
        
        // Application workflows and timing
        this.applicationWorkflows = {
            pre_production: {
                design_phase: {
                    steps: ['Character analysis', 'Research', 'Concept sketches', 'Color selection'],
                    timeline: '2-4 weeks before opening',
                    deliverables: ['Makeup plots', 'Product lists', 'Application guides']
                },
                testing_phase: {
                    steps: ['Skin tests', 'Application trials', 'Photography tests', 'Adjustments'],
                    timeline: '1-2 weeks before tech',
                    deliverables: ['Finalized looks', 'Timing charts', 'Emergency procedures']
                }
            },
            performance_prep: {
                setup: {
                    time_required: '15-30 minutes before call',
                    tasks: ['Station prep', 'Product layout', 'Tool cleaning', 'Reference setup']
                },
                application: {
                    basic_makeup: '20-45 minutes per performer',
                    character_makeup: '45-90 minutes per performer',
                    special_effects: '60-120 minutes per performer'
                },
                maintenance: {
                    touch_ups: 'Between acts, quick fixes',
                    removal: 'Post-performance, thorough cleaning',
                    skin_care: 'Protection and restoration'
                }
            }
        };
        
        // Health and safety protocols
        this.safetyProtocols = {
            skin_safety: {
                patch_testing: 'Test all new products 24-48 hours before use',
                allergy_tracking: 'Maintain records of performer sensitivities',
                product_expiration: 'Regular inventory checks and replacement',
                hygiene_standards: 'Sanitization between uses, individual tools'
            },
            application_safety: {
                eye_area: 'Use only eye-safe products, avoid contact with eyes',
                lip_products: 'Food-safe materials for consumable scenes',
                prosthetic_application: 'Proper adhesion, safe removal procedures',
                emergency_procedures: 'Allergic reaction protocols, first aid'
            },
            workplace_safety: {
                ventilation: 'Proper air circulation for chemical products',
                lighting: 'Adequate illumination for detailed work',
                ergonomics: 'Proper seating and positioning',
                tool_maintenance: 'Regular cleaning and replacement schedules'
            }
        };
        
        // Performance tracking and quality assurance
        this.performanceTracking = {
            applicationTimes: new Map(),
            productPerformance: new Map(),
            performerFeedback: new Map(),
            photographicDocumentation: new Map()
        };
        
        // Budget and inventory management
        this.inventoryManagement = {
            productInventory: new Map(),
            budgetTracking: {
                allocated: 0,
                spent: 0,
                categories: {
                    base_products: 0.30,
                    color_products: 0.25,
                    special_effects: 0.20,
                    tools: 0.15,
                    consumables: 0.10
                }
            },
            supplierDatabase: new Map(),
            reorderAlerts: new Map()
        };
        
        // Integration with production system
        this.costumeDesigner = null;
        this.lightingDesigner = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        console.log('💄 Makeup Artist Agent: Ready to transform performers into characters');
    }

    /**
     * Initialize Makeup Artist with system integration
     */
    async onInitialize() {
        try {
            console.log('💄 Makeup Artist: Initializing character transformation systems...');
            
            // Connect to Ollama interface for AI makeup design
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI makeup design requires LLM assistance.');
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
            
            // Configure AI for makeup artistry
            this.ollamaInterface.updatePerformanceContext({
                role: 'makeup_artist',
                art_style: this.artStyle,
                creativity_mode: 'character_transformation',
                specialization: 'theatrical_makeup'
            });
            
            // Connect to related agents
            if (window.costumeDesignerAgent) {
                this.costumeDesigner = window.costumeDesignerAgent;
                console.log('💄 Makeup Artist: Connected to Costume Designer');
            }
            
            if (window.lightingDesignerAgent) {
                this.lightingDesigner = window.lightingDesignerAgent;
                console.log('💄 Makeup Artist: Connected to Lighting Designer');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('💄 Makeup Artist: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize makeup systems
            await this.initializeMakeupSystems();
            
            // Test makeup design capabilities
            await this.testMakeupDesignCapabilities();
            
            console.log('💄 Makeup Artist: Ready to create stunning character transformations!')
            
        } catch (error) {
            console.error('💄 Makeup Artist: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI MAKEUP DESIGN:
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
     * Subscribe to production events for makeup coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('casting:characters-assigned', (data) => this.onCharactersAssigned(data));
            window.theaterEventBus.subscribe('makeup:design-request', (data) => this.onMakeupDesignRequest(data));
            window.theaterEventBus.subscribe('makeup:character-transformation', (data) => this.onCharacterTransformation(data));
            window.theaterEventBus.subscribe('costume:color-palette', (data) => this.onCostumePaletteReceived(data));
            window.theaterEventBus.subscribe('lighting:design-complete', (data) => this.onLightingDesignReceived(data));
            
            console.log('💄 Makeup Artist: Subscribed to character transformation events');
        }
    }

    /**
     * Initialize makeup systems
     */
    async initializeMakeupSystems() {
        console.log('💄 Makeup Artist: Initializing makeup systems...');
        
        // Initialize design tools
        this.initializeDesignTools();
        
        // Initialize color analysis tools
        this.initializeColorAnalysisTools();
        
        // Initialize application tracking
        this.initializeApplicationTracking();
        
        console.log('✅ Makeup Artist: Makeup systems initialized');
    }

    /**
     * Initialize design tools
     */
    initializeDesignTools() {
        this.designTools = {
            characterAnalyzer: (character, script) => this.analyzeCharacterNeeds(character, script),
            colorMatcher: (skin, costume, lighting) => this.matchColors(skin, costume, lighting),
            lookGenerator: (character, style) => this.generateCharacterLook(character, style),
            applicationPlanner: (look, time) => this.planApplication(look, time)
        };
        
        console.log('💄 Makeup Artist: Design tools initialized');
    }

    /**
     * Initialize color analysis tools
     */
    initializeColorAnalysisTools() {
        this.colorAnalysisTools = {
            skinToneAnalysis: (performer) => this.analyzeSkinTone(performer),
            paletteCreation: (undertones, style) => this.createColorPalette(undertones, style),
            lightingAdaptation: (palette, lighting) => this.adaptForLighting(palette, lighting),
            continuityChecker: (looks) => this.checkColorContinuity(looks)
        };
        
        console.log('💄 Makeup Artist: Color analysis tools initialized');
    }

    /**
     * Initialize application tracking
     */
    initializeApplicationTracking() {
        this.trackingSystems = {
            timingTracker: new Map(),
            qualityMonitor: new Map(),
            performerFeedback: new Map(),
            productUsage: new Map()
        };
        
        console.log('💄 Makeup Artist: Application tracking initialized');
    }

    /**
     * Test makeup design capabilities
     */
    async testMakeupDesignCapabilities() {
        try {
            const testPrompt = `
            As a makeup artist, design a character transformation for a theatrical role.
            
            Character requirements:
            - Character: An aging king losing his power and sanity
            - Age: Transform 35-year-old actor to appear 70
            - Emotional state: Deteriorating mental state, physical frailty
            - Setting: Shakespearean tragedy, period costume drama
            - Performance: Large theater, dramatic lighting
            
            Provide:
            1. Overall makeup concept and approach
            2. Aging techniques and application methods
            3. Color palette and product recommendations
            4. Special considerations for the character's mental state
            5. Integration with costume and lighting design
            6. Application timeline and maintenance requirements
            7. Safety considerations and product testing needs
            8. Backup plans for makeup maintenance during performance
            
            Format as comprehensive makeup design specification.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('💄 Makeup Artist: Design capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('💄 Makeup Artist: Design capability test failed:', error);
            throw new Error(`Makeup design test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('💄 Makeup Artist: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize makeup project
        await this.initializeMakeupProject(data.production);
        
        // Develop makeup concept
        await this.developMakeupConcept(data.production);
    }

    /**
     * Initialize makeup project
     */
    async initializeMakeupProject(production) {
        console.log('💄 Makeup Artist: Initializing makeup project...');
        
        this.makeupProject = {
            production: production,
            designConcept: null,
            characterLooks: new Map(),
            colorPalettes: new Map(),
            applicationGuides: new Map(),
            specialEffects: new Map(),
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Set up budget tracking
        await this.setupBudgetTracking(production);
        
        console.log('✅ Makeup Artist: Makeup project initialized');
    }

    /**
     * Develop makeup concept for production
     */
    async developMakeupConcept(production) {
        try {
            console.log('💄 Makeup Artist: Developing makeup concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive makeup design concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall aesthetic approach and artistic style
                2. Period accuracy and historical research needs
                3. Character transformation requirements
                4. Color palette and visual harmony
                5. Technical considerations for stage performance
                6. Integration with costume and lighting design
                7. Special effects and prosthetic needs
                8. Practical application and maintenance requirements
                9. Budget considerations and resource optimization
                10. Safety protocols and performer comfort
                
                Provide a detailed makeup concept that will guide all character transformations and serve as the foundation for individual character makeup designs.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.makeupProject.designConcept = response.content;
                    this.makeupProject.status = 'concept_complete';
                    
                    console.log('✅ Makeup Artist: Makeup concept developed');
                    
                    // Extract technical requirements from concept
                    await this.extractTechnicalRequirements(response.content);
                    
                    // Begin color palette development
                    await this.beginColorPaletteDevelopment(production, response.content);
                    
                    // Share concept with production team
                    window.theaterEventBus?.publish('makeup:concept-complete', {
                        production: production,
                        concept: response.content,
                        makeupArtist: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Makeup Artist: Concept development failed:', error.message);
            this.makeupProject.status = 'concept_error';
        }
    }

    /**
     * Handle character assignments
     */
    async onCharactersAssigned(data) {
        console.log('💄 Makeup Artist: Character assignments received');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.designCharacterMakeup(data.assignments);
        }
    }

    /**
     * Design makeup for assigned characters
     */
    async designCharacterMakeup(assignments) {
        console.log('💄 Makeup Artist: Designing character makeup...');
        
        for (const assignment of assignments) {
            await this.createCharacterMakeupDesign(assignment.character, assignment.performer);
        }
    }

    /**
     * Create makeup design for specific character
     */
    async createCharacterMakeupDesign(character, performer) {
        try {
            console.log(`💄 Makeup Artist: Creating makeup design for ${character.name}...`);
            
            const designPrompt = `
            Create a detailed makeup design for this character and performer:
            
            Character: ${character.name}
            Character Description: ${character.description || 'Character details to be determined'}
            Character Age: ${character.age || 'Age not specified'}
            Character Role: ${character.role || 'Supporting role'}
            
            Performer: ${performer.name}
            Performer Age: ${performer.age || 'Age not provided'}
            Skin Information: ${performer.skinTone || 'To be assessed'}
            
            Production Context:
            - Production: ${this.currentProduction?.title}
            - Makeup Concept: ${this.makeupProject.designConcept}
            - Art Style: ${this.artStyle}
            
            Create comprehensive makeup design:
            1. Character analysis and transformation goals
            2. Base makeup approach and foundation selection
            3. Feature enhancement and modification techniques
            4. Color palette specific to this character
            5. Special effects or prosthetic requirements
            6. Age or fantasy transformation methods
            7. Application sequence and timing
            8. Maintenance and touch-up protocols
            9. Integration with costume and hair design
            10. Photography and stage lighting considerations
            
            Provide detailed makeup design suitable for professional application.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(designPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const makeupDesign = {
                    character: character,
                    performer: performer,
                    design: response.content,
                    colorPalette: await this.extractColorPalette(response.content),
                    applicationGuide: await this.createApplicationGuide(response.content),
                    specialRequirements: await this.extractSpecialRequirements(response.content),
                    designedAt: new Date(),
                    status: 'designed'
                };
                
                this.makeupProject.characterLooks.set(character.name, makeupDesign);
                
                console.log(`✅ Makeup Artist: Makeup design created for ${character.name}`);
                
                // Notify production team
                window.theaterEventBus?.publish('makeup:character-design-ready', {
                    character: character,
                    design: makeupDesign,
                    makeupArtist: this.config.name
                });
                
                return makeupDesign;
            }
            
        } catch (error) {
            console.error(`💄 Makeup Artist: Character makeup design failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Handle makeup design requests
     */
    async onMakeupDesignRequest(data) {
        console.log('💄 Makeup Artist: Makeup design requested -', data.designType);
        
        await this.createSpecialMakeupDesign(data.designType, data.requirements, data.deadline);
    }

    /**
     * Handle character transformation requests
     */
    async onCharacterTransformation(data) {
        console.log('💄 Makeup Artist: Character transformation requested -', data.transformationType);
        
        await this.designCharacterTransformation(data.transformationType, data.character, data.specifics);
    }

    /**
     * Handle costume palette coordination
     */
    async onCostumePaletteReceived(data) {
        console.log('💄 Makeup Artist: Costume color palette received');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.coordinateMakeupWithCostumes(data.palette, data.characters);
        }
    }

    /**
     * Handle lighting design coordination
     */
    async onLightingDesignReceived(data) {
        console.log('💄 Makeup Artist: Lighting design received');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.adaptMakeupForLighting(data.lightingPlan, data.colorTemperatures);
        }
    }

    /**
     * Coordinate makeup with costume colors
     */
    async coordinateMakeupWithCostumes(costumePalette, characters) {
        try {
            console.log('💄 Makeup Artist: Coordinating makeup with costume colors...');
            
            const coordinationPrompt = `
            Coordinate makeup colors with costume design palette:
            
            Costume Palette: ${JSON.stringify(costumePalette)}
            Characters: ${characters.map(c => c.name).join(', ')}
            
            Current Makeup Concept: ${this.makeupProject.designConcept}
            Production: ${this.currentProduction?.title}
            
            Provide coordination guidelines:
            1. How should makeup colors complement costume colors?
            2. Which characters need specific color coordination?
            3. What adjustments to existing makeup designs are needed?
            4. How can makeup enhance the costume design story?
            5. What color conflicts should be avoided?
            6. How can makeup and costume create visual unity?
            
            Ensure makeup enhances rather than competes with costume design.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(coordinationPrompt, {
                temperature: 0.8,
                max_tokens: 700
            });
            
            if (response && response.content) {
                this.makeupProject.costumeCoordination = response.content;
                
                console.log('✅ Makeup Artist: Makeup coordinated with costume colors');
                
                // Update character looks based on coordination
                await this.updateCharacterLooksForCostumes(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Makeup Artist: Costume coordination failed:', error.message);
        }
    }

    /**
     * Adapt makeup for lighting conditions
     */
    async adaptMakeupForLighting(lightingPlan, colorTemperatures) {
        try {
            console.log('💄 Makeup Artist: Adapting makeup for lighting...');
            
            const lightingAdaptationPrompt = `
            Adapt makeup designs for specific lighting conditions:
            
            Lighting Plan: ${lightingPlan}
            Color Temperatures: ${JSON.stringify(colorTemperatures)}
            
            Current Makeup Designs: ${this.makeupProject.characterLooks.size} character looks
            Production: ${this.currentProduction?.title}
            
            Provide lighting adaptations:
            1. How do different color temperatures affect makeup colors?
            2. Which makeup colors need adjustment for stage lighting?
            3. What intensity adjustments are needed for visibility?
            4. How should highlighting and contouring adapt to lighting angles?
            5. What special considerations are needed for colored lighting?
            6. How can makeup work with lighting to enhance character?
            
            Ensure makeup remains effective under all lighting conditions.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(lightingAdaptationPrompt, {
                temperature: 0.7,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.makeupProject.lightingAdaptation = response.content;
                
                console.log('✅ Makeup Artist: Makeup adapted for lighting');
                
                // Update character looks for lighting
                await this.updateCharacterLooksForLighting(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Makeup Artist: Lighting adaptation failed:', error.message);
        }
    }

    /**
     * Extract technical requirements from concept
     */
    async extractTechnicalRequirements(concept) {
        // Simplified extraction - would use AI parsing in practice
        return {
            products: 'Professional theater makeup',
            tools: 'Brushes, sponges, airbrush system',
            special_effects: 'Prosthetics and aging materials',
            timeline: 'Character-dependent application times'
        };
    }

    /**
     * Extract color palette from design
     */
    async extractColorPalette(design) {
        // Simplified extraction - would parse actual color specifications
        return {
            base: 'Natural skin tones',
            accents: 'Character-specific colors',
            special: 'Effects and transformation colors',
            setting: 'Powders and finishing products'
        };
    }

    /**
     * Create application guide from design
     */
    async createApplicationGuide(design) {
        // Simplified guide creation
        return {
            preparation: 'Skin prep and base application',
            sequence: 'Step-by-step application order',
            timing: 'Estimated application time',
            maintenance: 'Touch-up and removal procedures'
        };
    }

    /**
     * Setup budget tracking for production
     */
    async setupBudgetTracking(production) {
        this.inventoryManagement.budgetTracking.allocated = production.budget?.makeup || 5000;
        this.inventoryManagement.budgetTracking.spent = 0;
        this.inventoryManagement.budgetTracking.remaining = this.inventoryManagement.budgetTracking.allocated;
        
        console.log('💰 Makeup Artist: Budget tracking initialized');
    }

    /**
     * Get makeup artistry status
     */
    getMakeupArtistStatus() {
        return {
            currentProject: {
                active: !!this.makeupProject.production,
                title: this.makeupProject.production?.title,
                status: this.makeupProject.status,
                conceptComplete: !!this.makeupProject.designConcept,
                characterLooksDesigned: this.makeupProject.characterLooks.size
            },
            design: {
                characterLooks: this.makeupProject.characterLooks.size,
                colorPalettes: this.makeupProject.colorPalettes.size,
                applicationGuides: this.makeupProject.applicationGuides.size,
                specialEffects: this.makeupProject.specialEffects.size
            },
            budget: {
                allocated: this.inventoryManagement.budgetTracking.allocated,
                spent: this.inventoryManagement.budgetTracking.spent,
                remaining: this.inventoryManagement.budgetTracking.remaining,
                utilization: this.calculateBudgetUtilization()
            },
            capabilities: this.makeupCapabilities,
            technical: {
                makeupTechniques: Object.keys(this.makeupTechniques).length,
                colorTheoryFrameworks: Object.keys(this.colorTheory).length,
                materialCategories: Object.keys(this.makeupMaterials).length,
                safetyProtocols: Object.keys(this.safetyProtocols).length
            }
        };
    }

    /**
     * Calculate budget utilization
     */
    calculateBudgetUtilization() {
        if (!this.inventoryManagement.budgetTracking.allocated) return 0;
        return (this.inventoryManagement.budgetTracking.spent / this.inventoryManagement.budgetTracking.allocated) * 100;
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('💄 Makeup Artist: Concluding makeup design session...');
        
        // Finalize makeup project
        if (this.makeupProject.status !== 'idle') {
            this.makeupProject.status = 'completed';
            this.makeupProject.completedAt = new Date();
        }
        
        // Generate makeup summary
        if (this.currentProduction) {
            const makeupSummary = this.generateMakeupSummary();
            console.log('💄 Makeup Artist: Makeup summary generated');
        }
        
        console.log('💄 Makeup Artist: Character transformation work concluded');
    }

    /**
     * Generate makeup summary
     */
    generateMakeupSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            design: {
                conceptDeveloped: !!this.makeupProject.designConcept,
                characterLooksCreated: this.makeupProject.characterLooks.size,
                colorPalettesDesigned: this.makeupProject.colorPalettes.size,
                applicationGuidesGenerated: this.makeupProject.applicationGuides.size
            },
            coordination: {
                costumeIntegration: !!this.makeupProject.costumeCoordination,
                lightingAdaptation: !!this.makeupProject.lightingAdaptation,
                costumeDesignerCoordination: !!this.costumeDesigner,
                lightingDesignerCoordination: !!this.lightingDesigner
            },
            budget: {
                totalAllocated: this.inventoryManagement.budgetTracking.allocated,
                amountSpent: this.inventoryManagement.budgetTracking.spent,
                utilizationRate: this.calculateBudgetUtilization()
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MakeupArtistAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.MakeupArtistAgent = MakeupArtistAgent;
    console.log('💄 Makeup Artist Agent loaded - Ready for character transformation');
}