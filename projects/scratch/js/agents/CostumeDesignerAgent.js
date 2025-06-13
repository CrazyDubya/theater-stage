/**
 * CostumeDesignerAgent.js - AI-Driven Wardrobe and Character Design
 * 
 * The Costume Designer Agent uses Ollama LLM to create character-driven costume
 * designs that support storytelling and character development. Coordinates with
 * production design for visual cohesion and adapts to practical considerations.
 * 
 * Features:
 * - AI-powered costume design generation
 * - Character-based wardrobe development
 * - Period and style research integration
 * - Color coordination with overall design
 * - Practical construction and budget considerations
 * - Real-time design adaptation and feedback
 */

class CostumeDesignerAgent extends BaseAgent {
    constructor(config = {}) {
        super('costume-designer', {
            name: 'Costume Designer',
            role: 'costume-designer',
            priority: 70, // Medium-high priority for character support
            maxActionsPerSecond: 4,
            personality: config.personality || 'character-focused',
            ...config
        });
        
        // Costume Designer specific properties
        this.ollamaInterface = null;
        this.designApproach = config.designApproach || 'character-driven';
        this.creativityLevel = config.creativity || 0.8;
        
        // Costume design capabilities
        this.costumeCapabilities = {
            characterDevelopment: {
                personalityExpression: true,
                statusIndication: true,
                emotionalSupport: true,
                arcDevelopment: true,
                relationshipDynamics: true
            },
            technicalSkills: {
                periodResearch: true,
                fabricSelection: true,
                constructionPlanning: true,
                fittingCoordination: true,
                maintenanceConsiderations: true
            },
            designIntegration: {
                colorCoordination: true,
                lightingCompatibility: true,
                setHarmony: true,
                movementAccommodation: true,
                quickChanges: true
            },
            practicalConsiderations: {
                budgetConstraints: true,
                timeConstraints: true,
                performerComfort: true,
                durabilityRequirements: true,
                cleaningRequirements: true
            }
        };
        
        // Current costume project
        this.costumeProject = {
            production: null,
            designConcept: null,
            characterWardrobes: new Map(),
            fabricPalette: [],
            constructionPlan: new Map(),
            fittingSchedule: new Map(),
            status: 'idle'
        };
        
        // Character wardrobe tracking
        this.characterWardrobes = new Map();
        
        // Fabric and material library
        this.fabricLibrary = {
            natural: {
                cotton: { weight: 'light-heavy', care: 'easy', cost: 'low', drape: 'structured' },
                wool: { weight: 'medium-heavy', care: 'moderate', cost: 'medium', drape: 'flowing' },
                silk: { weight: 'light-medium', care: 'delicate', cost: 'high', drape: 'elegant' },
                linen: { weight: 'light-medium', care: 'moderate', cost: 'medium', drape: 'casual' },
                leather: { weight: 'heavy', care: 'special', cost: 'high', drape: 'structured' }
            },
            synthetic: {
                polyester: { weight: 'light-medium', care: 'easy', cost: 'low', drape: 'versatile' },
                nylon: { weight: 'light', care: 'easy', cost: 'low', drape: 'smooth' },
                spandex: { weight: 'light', care: 'easy', cost: 'medium', drape: 'stretch' },
                acrylic: { weight: 'light-medium', care: 'easy', cost: 'low', drape: 'soft' }
            },
            specialty: {
                velvet: { weight: 'medium-heavy', care: 'delicate', cost: 'high', drape: 'luxurious' },
                brocade: { weight: 'heavy', care: 'delicate', cost: 'high', drape: 'formal' },
                tulle: { weight: 'light', care: 'delicate', cost: 'medium', drape: 'ethereal' },
                denim: { weight: 'medium-heavy', care: 'easy', cost: 'low', drape: 'casual' }
            }
        };
        
        // Period and style research
        this.periodResearch = {
            historical: new Map(),
            contemporary: new Map(),
            futuristic: new Map(),
            fantasy: new Map()
        };
        
        // Color coordination tracking
        this.colorCoordination = {
            productionPalette: null,
            characterPalettes: new Map(),
            lightingConsiderations: null,
            setCompatibility: null
        };
        
        // Construction and practical tracking
        this.constructionTracking = {
            measurements: new Map(),
            fittings: new Map(),
            alterations: new Map(),
            maintenanceNotes: new Map()
        };
        
        // Integration with production system
        this.productionDesigner = null;
        this.lightingDesigner = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        console.log('👗 Costume Designer Agent: Ready to dress characters for compelling storytelling');
    }

    /**
     * Initialize Costume Designer with system integration
     */
    async onInitialize() {
        try {
            console.log('👗 Costume Designer: Initializing costume design systems...');
            
            // Connect to Ollama interface for AI costume design
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI costume design requires LLM assistance.');
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
            
            // Configure AI for costume design
            this.ollamaInterface.updatePerformanceContext({
                role: 'costume_designer',
                design_approach: this.designApproach,
                creativity_mode: 'character_costume_design',
                specialization: 'theatrical_costume'
            });
            
            // Connect to design-related agents
            if (window.productionDesignerAgent) {
                this.productionDesigner = window.productionDesignerAgent;
                console.log('👗 Costume Designer: Connected to Production Designer');
            }
            
            if (window.lightingDesignerAgent) {
                this.lightingDesigner = window.lightingDesignerAgent;
                console.log('👗 Costume Designer: Connected to Lighting Designer');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('👗 Costume Designer: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize period research database
            await this.initializePeriodResearch();
            
            // Test design capabilities
            await this.testCostumeDesignCapabilities();
            
            console.log('👗 Costume Designer: Ready to create character-defining costumes!')
            
        } catch (error) {
            console.error('👗 Costume Designer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI COSTUME DESIGN:
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
     * Subscribe to production events for costume coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('design:concept-complete', (data) => this.onDesignConceptReceived(data));
            window.theaterEventBus.subscribe('script:character-profiles', (data) => this.onCharacterProfilesReceived(data));
            window.theaterEventBus.subscribe('costume:fitting-needed', (data) => this.onFittingNeeded(data));
            window.theaterEventBus.subscribe('performance:character-change', (data) => this.onCharacterChange(data));
            window.theaterEventBus.subscribe('budget:costume-constraints', (data) => this.onBudgetConstraints(data));
            
            console.log('👗 Costume Designer: Subscribed to costume coordination events');
        }
    }

    /**
     * Initialize period research database
     */
    async initializePeriodResearch() {
        console.log('👗 Costume Designer: Initializing period research...');
        
        // Historical periods
        this.periodResearch.historical.set('victorian', {
            silhouettes: ['fitted bodice', 'full skirt', 'high neckline', 'long sleeves'],
            fabrics: ['silk', 'velvet', 'wool', 'cotton'],
            colors: ['deep jewel tones', 'black', 'white', 'muted colors'],
            accessories: ['gloves', 'hat', 'jewelry', 'shawl'],
            characteristics: 'formal, modest, structured'
        });
        
        this.periodResearch.historical.set('1920s', {
            silhouettes: ['dropped waist', 'loose fit', 'shorter hem', 'simple lines'],
            fabrics: ['silk', 'chiffon', 'beads', 'metallic'],
            colors: ['black', 'gold', 'silver', 'jewel tones'],
            accessories: ['headband', 'long necklaces', 'gloves', 'T-bar shoes'],
            characteristics: 'rebellious, modern, geometric'
        });
        
        // Contemporary styles
        this.periodResearch.contemporary.set('business', {
            silhouettes: ['tailored', 'structured', 'professional', 'clean lines'],
            fabrics: ['wool', 'cotton blend', 'polyester', 'silk'],
            colors: ['navy', 'black', 'grey', 'white', 'subtle colors'],
            accessories: ['minimal jewelry', 'professional bag', 'classic shoes'],
            characteristics: 'authoritative, polished, confident'
        });
        
        this.periodResearch.contemporary.set('casual', {
            silhouettes: ['relaxed', 'comfortable', 'varied', 'practical'],
            fabrics: ['cotton', 'denim', 'jersey', 'blends'],
            colors: ['varied', 'personal preference', 'seasonal'],
            accessories: ['casual shoes', 'practical bags', 'personal items'],
            characteristics: 'comfortable, personal, approachable'
        });
        
        console.log('✅ Costume Designer: Period research database initialized');
    }

    /**
     * Test costume design capabilities
     */
    async testCostumeDesignCapabilities() {
        try {
            const testPrompt = `
            As a costume designer, create costume designs for a character in a theatrical production.
            
            Character details:
            - Name: Sarah, a young professional in modern times
            - Personality: Ambitious but insecure, trying to prove herself
            - Arc: Starts uncertain, gains confidence throughout the story
            - Setting: Contemporary office drama
            
            Provide:
            1. Overall costume concept for the character
            2. Specific outfit descriptions for key scenes
            3. Color choices and psychological reasoning
            4. Fabric selections and practical considerations
            5. Accessories and details that support character development
            6. Transformation elements that show character growth
            
            Format as detailed costume design notes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 700
            });
            
            console.log('👗 Costume Designer: Design capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('👗 Costume Designer: Design capability test failed:', error);
            throw new Error(`Costume design test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('👗 Costume Designer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize costume project
        await this.initializeCostumeProject(data.production);
        
        // Develop overall costume concept
        await this.developCostumeConcept(data.production);
    }

    /**
     * Initialize costume project
     */
    async initializeCostumeProject(production) {
        console.log('👗 Costume Designer: Initializing costume project...');
        
        this.costumeProject = {
            production: production,
            designConcept: null,
            characterWardrobes: new Map(),
            fabricPalette: [],
            constructionPlan: new Map(),
            fittingSchedule: new Map(),
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Research period/style for production
        await this.researchProductionStyle(production);
        
        console.log('✅ Costume Designer: Costume project initialized');
    }

    /**
     * Develop overall costume concept
     */
    async developCostumeConcept(production) {
        try {
            console.log('👗 Costume Designer: Developing costume concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive costume design concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall costume philosophy and approach
                2. Character differentiation through costume
                3. Period accuracy vs. creative interpretation
                4. Color palette that supports storytelling
                5. Fabric choices for performance requirements
                6. Costume changes and practical considerations
                7. Budget and construction feasibility
                8. Integration with lighting and set design
                9. Character arc support through costume evolution
                10. Symbolic elements and visual metaphors
                
                Provide a detailed costume concept that will guide all character wardrobe decisions and support the narrative through visual storytelling.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1000,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.costumeProject.designConcept = response.content;
                    this.costumeProject.status = 'concept_complete';
                    
                    console.log('✅ Costume Designer: Costume concept developed');
                    
                    // Extract fabric palette from concept
                    await this.extractFabricPalette(response.content);
                    
                    // Share concept with design team
                    window.theaterEventBus?.publish('costume:concept-complete', {
                        production: production,
                        concept: response.content,
                        fabricPalette: this.costumeProject.fabricPalette,
                        costumeDesigner: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Costume Designer: Concept development failed:', error.message);
            this.costumeProject.status = 'concept_error';
        }
    }

    /**
     * Handle design concept from Production Designer
     */
    async onDesignConceptReceived(data) {
        console.log('👗 Costume Designer: Received design concept from Production Designer');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.coordinateWithProductionDesign(data.concept, data.colorPalette, data.styleGuide);
        }
    }

    /**
     * Coordinate costume design with overall production design
     */
    async coordinateWithProductionDesign(designConcept, colorPalette, styleGuide) {
        try {
            console.log('👗 Costume Designer: Coordinating with production design...');
            
            const coordinationPrompt = `
            Coordinate costume design with the overall production design:
            
            Production Design Concept:
            ${designConcept}
            
            Color Palette:
            ${JSON.stringify(colorPalette)}
            
            Current Costume Concept:
            ${this.costumeProject.designConcept || 'To be developed'}
            
            Provide costume coordination guidelines:
            1. How should costume colors work within the production palette?
            2. What fabric textures complement the overall design aesthetic?
            3. How can costume silhouettes support the visual style?
            4. What design elements should be coordinated vs. contrasted?
            5. How should character costumes relate to set design?
            6. What opportunities exist for visual harmony?
            
            Ensure costumes enhance the overall visual experience while maintaining character focus.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(coordinationPrompt, {
                temperature: 0.7,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.colorCoordination.productionPalette = colorPalette;
                this.colorCoordination.setCompatibility = response.content;
                
                console.log('✅ Costume Designer: Coordinated with production design');
                
                // Update costume concept with coordination
                await this.updateCostumeConceptForCoordination(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Costume Designer: Production design coordination failed:', error.message);
        }
    }

    /**
     * Handle character profiles from script
     */
    async onCharacterProfilesReceived(data) {
        console.log('👗 Costume Designer: Received character profiles from script');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.designCharacterWardrobes(data.characters);
        }
    }

    /**
     * Design wardrobes for specific characters
     */
    async designCharacterWardrobes(characters) {
        console.log('👗 Costume Designer: Designing character wardrobes...');
        
        for (const character of characters) {
            await this.designIndividualCharacterWardrobe(character);
        }
    }

    /**
     * Design wardrobe for individual character
     */
    async designIndividualCharacterWardrobe(character) {
        try {
            console.log(`👗 Costume Designer: Designing wardrobe for ${character.name}...`);
            
            const wardrobePrompt = `
            Design a complete wardrobe for this character:
            
            Character: ${character.name}
            Description: ${character.description || 'No description provided'}
            Personality: ${character.personality || 'To be determined'}
            Role: ${character.role || 'Supporting'}
            Arc: ${character.arc || 'Static character'}
            
            Production Context:
            Type: ${this.currentProduction.type}
            Overall Costume Concept: ${this.costumeProject.designConcept}
            Color Coordination: ${this.colorCoordination.productionPalette ? 'Required' : 'Flexible'}
            
            Provide detailed wardrobe design:
            1. Character costume concept and approach
            2. Specific outfit descriptions for each scene/act
            3. Color choices that support character and production
            4. Fabric selections with practical justification
            5. Accessories and details that reveal character
            6. Costume changes and transformation elements
            7. Construction notes and special requirements
            8. Fitting and alteration considerations
            
            Ensure the wardrobe serves both character development and visual storytelling.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(wardrobePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const characterWardrobe = {
                    character: character,
                    wardrobe: response.content,
                    outfits: await this.extractOutfits(response.content),
                    fittingNotes: [],
                    designedAt: new Date(),
                    status: 'designed'
                };
                
                this.costumeProject.characterWardrobes.set(character.name, characterWardrobe);
                this.characterWardrobes.set(character.name, characterWardrobe);
                
                console.log(`✅ Costume Designer: Wardrobe designed for ${character.name}`);
                
                // Schedule fitting if performer assigned
                if (character.performer) {
                    await this.scheduleFitting(character);
                }
                
                // Notify production team
                window.theaterEventBus?.publish('costume:character-designed', {
                    character: character,
                    wardrobe: characterWardrobe,
                    costumeDesigner: this.config.name
                });
                
                return characterWardrobe;
            }
            
        } catch (error) {
            console.error(`👗 Costume Designer: Character wardrobe design failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Handle fitting requests
     */
    async onFittingNeeded(data) {
        console.log('👗 Costume Designer: Fitting requested for', data.character);
        
        await this.scheduleFitting(data.character, data.urgency);
    }

    /**
     * Schedule costume fitting
     */
    async scheduleFitting(character, urgency = 'normal') {
        const fitting = {
            character: character.name,
            performer: character.performer,
            scheduledDate: this.calculateFittingDate(urgency),
            urgency: urgency,
            notes: [],
            status: 'scheduled'
        };
        
        this.costumeProject.fittingSchedule.set(character.name, fitting);
        this.constructionTracking.fittings.set(character.name, fitting);
        
        console.log(`📅 Costume Designer: Fitting scheduled for ${character.name} (${urgency})`);
        
        // Notify scheduling system
        window.theaterEventBus?.publish('costume:fitting-scheduled', {
            fitting: fitting,
            costumeDesigner: this.config.name
        });
    }

    /**
     * Handle character changes during performance
     */
    async onCharacterChange(data) {
        console.log('👗 Costume Designer: Character change detected -', data.character);
        
        await this.handleCostumeChange(data.character, data.changeType, data.timeframe);
    }

    /**
     * Handle costume changes
     */
    async handleCostumeChange(character, changeType, timeframe) {
        console.log(`👗 Costume Designer: Handling ${changeType} change for ${character}...`);
        
        const wardrobe = this.characterWardrobes.get(character);
        
        if (wardrobe) {
            // Check if quick change is needed
            if (timeframe && timeframe < 120000) { // Less than 2 minutes
                await this.planQuickChange(wardrobe, changeType, timeframe);
            } else {
                await this.planStandardChange(wardrobe, changeType);
            }
        }
    }

    /**
     * Plan quick costume change
     */
    async planQuickChange(wardrobe, changeType, timeframe) {
        console.log(`👗 Costume Designer: Planning quick change (${timeframe/1000}s)...`);
        
        // Quick change strategies
        const strategies = {
            color: 'Add/remove colored overlay piece',
            mood: 'Change accessories and posture cues',
            status: 'Add/remove jacket or outer layer',
            time_period: 'Swap key period-defining pieces'
        };
        
        const strategy = strategies[changeType] || 'Minimal essential changes only';
        
        // Notify wardrobe team
        window.theaterEventBus?.publish('costume:quick-change-needed', {
            character: wardrobe.character.name,
            strategy: strategy,
            timeframe: timeframe,
            costumeDesigner: this.config.name
        });
    }

    /**
     * Research production style
     */
    async researchProductionStyle(production) {
        const productionType = production.type;
        const period = this.extractPeriodFromProduction(production);
        
        // Get appropriate research data
        const research = this.periodResearch.historical.get(period) || 
                        this.periodResearch.contemporary.get('casual');
        
        if (research) {
            console.log(`👗 Costume Designer: Research completed for ${period} style`);
        }
    }

    /**
     * Extract fabric palette from concept
     */
    async extractFabricPalette(concept) {
        // Simplified extraction - in practice would use AI parsing
        this.costumeProject.fabricPalette = [
            { name: 'cotton', category: 'natural', use: 'casual_wear' },
            { name: 'wool', category: 'natural', use: 'formal_wear' },
            { name: 'silk', category: 'natural', use: 'elegant_wear' },
            { name: 'polyester', category: 'synthetic', use: 'practical_wear' }
        ];
        
        console.log('👗 Costume Designer: Fabric palette extracted');
    }

    /**
     * Extract outfits from wardrobe description
     */
    async extractOutfits(wardrobeDescription) {
        // Simplified extraction - would parse actual outfit details
        return [
            { scene: 'Act1Scene1', description: 'Professional business attire', quickChange: false },
            { scene: 'Act1Scene2', description: 'Casual weekend clothes', quickChange: false },
            { scene: 'Act2Scene1', description: 'Formal evening wear', quickChange: true }
        ];
    }

    /**
     * Calculate fitting date based on urgency
     */
    calculateFittingDate(urgency) {
        const now = new Date();
        const daysToAdd = {
            urgent: 1,
            high: 2,
            normal: 5,
            low: 7
        }[urgency] || 5;
        
        now.setDate(now.getDate() + daysToAdd);
        return now;
    }

    /**
     * Extract period from production
     */
    extractPeriodFromProduction(production) {
        // Simplified extraction - would analyze production details
        if (production.title.toLowerCase().includes('victorian')) return 'victorian';
        if (production.title.toLowerCase().includes('1920')) return '1920s';
        return 'contemporary';
    }

    /**
     * Get costume design status
     */
    getCostumeStatus() {
        return {
            currentProject: {
                active: !!this.costumeProject.production,
                title: this.costumeProject.production?.title,
                status: this.costumeProject.status,
                conceptComplete: !!this.costumeProject.designConcept,
                charactersDesigned: this.costumeProject.characterWardrobes.size
            },
            wardrobes: {
                charactersComplete: this.characterWardrobes.size,
                fittingsScheduled: this.costumeProject.fittingSchedule.size,
                constructionItems: this.costumeProject.constructionPlan.size
            },
            coordination: {
                productionDesignAligned: !!this.colorCoordination.productionPalette,
                lightingCompatible: !!this.colorCoordination.lightingConsiderations,
                fabricPaletteReady: this.costumeProject.fabricPalette.length > 0
            },
            capabilities: this.costumeCapabilities,
            research: {
                historicalPeriods: this.periodResearch.historical.size,
                contemporaryStyles: this.periodResearch.contemporary.size,
                fabricOptions: Object.keys(this.fabricLibrary.natural).length + Object.keys(this.fabricLibrary.synthetic).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('👗 Costume Designer: Concluding costume design session...');
        
        // Finalize costume project
        if (this.costumeProject.status !== 'idle') {
            this.costumeProject.status = 'completed';
            this.costumeProject.completedAt = new Date();
        }
        
        // Generate costume summary
        if (this.currentProduction) {
            const costumeSummary = this.generateCostumeSummary();
            console.log('👗 Costume Designer: Costume summary generated');
        }
        
        console.log('👗 Costume Designer: Costume design concluded');
    }

    /**
     * Generate costume summary
     */
    generateCostumeSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            design: {
                conceptDeveloped: !!this.costumeProject.designConcept,
                charactersDesigned: this.characterWardrobes.size,
                outfitsCreated: Array.from(this.characterWardrobes.values()).reduce((total, wardrobe) => total + wardrobe.outfits.length, 0),
                fabricPaletteSize: this.costumeProject.fabricPalette.length
            },
            coordination: {
                productionDesignCoordination: !!this.colorCoordination.productionPalette,
                lightingCoordination: !!this.colorCoordination.lightingConsiderations
            },
            practical: {
                fittingsScheduled: this.costumeProject.fittingSchedule.size,
                constructionPlanned: this.costumeProject.constructionPlan.size
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CostumeDesignerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.CostumeDesignerAgent = CostumeDesignerAgent;
    console.log('👗 Costume Designer Agent loaded - Ready for character-driven costume design');
}