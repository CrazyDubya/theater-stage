/**
 * ProductionDesignerAgent.js - AI-Driven Visual Design Coordination
 * 
 * The Production Designer Agent uses Ollama LLM to create cohesive visual concepts
 * that unify all design elements across the theatrical production. Coordinates with
 * lighting, costume, and set design to ensure artistic vision consistency.
 * 
 * Features:
 * - AI-driven overall visual concept development
 * - Cross-departmental design coordination
 * - Color palette and style guide generation
 * - Visual storytelling through design
 * - Real-time design adaptation and feedback
 * - Integration with all visual production elements
 */

class ProductionDesignerAgent extends BaseAgent {
    constructor(config = {}) {
        super('production-designer', {
            name: 'Production Designer',
            role: 'production-designer',
            priority: 80, // High priority for visual coordination
            maxActionsPerSecond: 5,
            personality: config.personality || 'visionary',
            ...config
        });
        
        // Production Designer specific properties
        this.ollamaInterface = null;
        this.designStyle = config.designStyle || 'cohesive';
        this.creativityLevel = config.creativity || 0.85;
        
        // Visual design capabilities
        this.designCapabilities = {
            conceptDevelopment: {
                overallVision: true,
                visualThemes: true,
                colorTheory: true,
                styleUnification: true,
                periodResearch: true
            },
            coordination: {
                setDesign: true,
                costumeDesign: true,
                lightingDesign: true,
                propDesign: true,
                makeupDesign: true
            },
            documentation: {
                styleGuides: true,
                colorPalettes: true,
                moodBoards: true,
                designBibles: true,
                referenceCollections: true
            },
            adaptation: {
                realTimeChanges: true,
                budgetConstraints: true,
                technicalLimitations: true,
                directionalFeedback: true
            }
        };
        
        // Current design project
        this.designProject = {
            production: null,
            overallConcept: null,
            visualThemes: [],
            colorPalette: {
                primary: [],
                secondary: [],
                accent: [],
                neutral: []
            },
            styleGuide: new Map(),
            departmentCoordination: new Map(),
            status: 'idle'
        };
        
        // Design elements and coordination
        this.visualElements = {
            period: null,
            genre: null,
            mood: null,
            symbolism: new Map(),
            visualMotifs: [],
            designPrinciples: []
        };
        
        // Department coordination tracking
        this.departmentCoordination = {
            lighting: { 
                status: 'pending', 
                colorAlignment: null, 
                moodCoordination: null,
                lastSync: null 
            },
            costume: { 
                status: 'pending', 
                styleAlignment: null, 
                colorCoordination: null,
                lastSync: null 
            },
            set: { 
                status: 'pending', 
                themeAlignment: null, 
                spatialCoordination: null,
                lastSync: null 
            },
            props: { 
                status: 'pending', 
                styleConsistency: null, 
                functionalAlignment: null,
                lastSync: null 
            }
        };
        
        // Design evolution tracking
        this.designEvolution = {
            conceptRevisions: [],
            feedbackIncorporated: [],
            adaptationHistory: [],
            designDecisions: []
        };
        
        // Research and reference systems
        this.researchDatabase = {
            historicalPeriods: new Map(),
            visualStyles: new Map(),
            colorPsychology: new Map(),
            culturalReferences: new Map()
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.lightingDesigner = null;
        this.costumeDesigner = null;
        this.currentProduction = null;
        
        console.log('🎨 Production Designer Agent: Ready to create unified visual experiences');
    }

    /**
     * Initialize Production Designer with system integration
     */
    async onInitialize() {
        try {
            console.log('🎨 Production Designer: Initializing visual design coordination...');
            
            // Connect to Ollama interface for AI design
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI design coordination requires LLM assistance.');
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
            
            // Configure AI for visual design coordination
            this.ollamaInterface.updatePerformanceContext({
                role: 'production_designer',
                design_style: this.designStyle,
                creativity_mode: 'visual_coordination',
                specialization: 'theatrical_design'
            });
            
            // Connect to design-related agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎨 Production Designer: Connected to Creative Director');
            }
            
            if (window.lightingDesignerAgent) {
                this.lightingDesigner = window.lightingDesignerAgent;
                console.log('🎨 Production Designer: Connected to Lighting Designer');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize design research database
            await this.initializeResearchDatabase();
            
            // Test design capabilities
            await this.testDesignCapabilities();
            
            console.log('🎨 Production Designer: Ready to coordinate visual excellence!')
            
        } catch (error) {
            console.error('🎨 Production Designer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI DESIGN COORDINATION:
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
     * Subscribe to production events for design coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('lighting:concept-complete', (data) => this.onLightingConceptReceived(data));
            window.theaterEventBus.subscribe('design:feedback-received', (data) => this.onDesignFeedback(data));
            window.theaterEventBus.subscribe('design:coordination-needed', (data) => this.onCoordinationNeeded(data));
            window.theaterEventBus.subscribe('budget:design-constraints', (data) => this.onBudgetConstraints(data));
            
            console.log('🎨 Production Designer: Subscribed to design coordination events');
        }
    }

    /**
     * Initialize design research database
     */
    async initializeResearchDatabase() {
        console.log('🎨 Production Designer: Initializing design research database...');
        
        // Historical periods
        this.researchDatabase.historicalPeriods.set('victorian', {
            colors: ['deep burgundy', 'forest green', 'gold', 'ivory'],
            textures: ['velvet', 'brocade', 'silk', 'lace'],
            patterns: ['damask', 'floral', 'geometric'],
            mood: 'ornate and formal'
        });
        
        this.researchDatabase.historicalPeriods.set('art_deco', {
            colors: ['black', 'gold', 'silver', 'emerald'],
            textures: ['metallic', 'geometric', 'sleek'],
            patterns: ['zigzag', 'sunburst', 'geometric'],
            mood: 'glamorous and modern'
        });
        
        // Visual styles
        this.researchDatabase.visualStyles.set('minimalist', {
            principles: ['simplicity', 'clean lines', 'negative space'],
            colors: ['white', 'black', 'grey', 'single accent'],
            approach: 'less is more'
        });
        
        this.researchDatabase.visualStyles.set('expressionist', {
            principles: ['emotional intensity', 'distortion', 'symbolism'],
            colors: ['bold contrasts', 'saturated hues', 'dramatic shadows'],
            approach: 'emotion over realism'
        });
        
        // Color psychology
        this.researchDatabase.colorPsychology.set('red', {
            emotions: ['passion', 'anger', 'energy', 'danger'],
            theatrical_use: ['dramatic moments', 'conflict', 'intensity'],
            combinations: ['black for drama', 'white for contrast']
        });
        
        this.researchDatabase.colorPsychology.set('blue', {
            emotions: ['calm', 'sadness', 'trust', 'contemplation'],
            theatrical_use: ['peaceful scenes', 'melancholy', 'reflection'],
            combinations: ['white for serenity', 'grey for sadness']
        });
        
        console.log('✅ Production Designer: Research database initialized');
    }

    /**
     * Test design capabilities
     */
    async testDesignCapabilities() {
        try {
            const testPrompt = `
            As a production designer, create a unified visual concept for a theatrical production.
            
            Production details:
            - Genre: Contemporary drama
            - Setting: Urban apartment, present day
            - Themes: Isolation, connection, modern life
            
            Provide:
            1. Overall visual concept and approach
            2. Color palette with psychological reasoning
            3. Design principles and visual themes
            4. Coordination strategy for all departments
            5. Key visual elements and symbolism
            6. Adaptation considerations for budget/technical constraints
            
            Format as comprehensive design brief.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 700
            });
            
            console.log('🎨 Production Designer: Design capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎨 Production Designer: Design capability test failed:', error);
            throw new Error(`Production design test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎨 Production Designer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize design project
        await this.initializeDesignProject(data.production);
        
        // Develop overall visual concept
        await this.developVisualConcept(data.production);
    }

    /**
     * Initialize design project
     */
    async initializeDesignProject(production) {
        console.log('🎨 Production Designer: Initializing design project...');
        
        this.designProject = {
            production: production,
            overallConcept: null,
            visualThemes: [],
            colorPalette: {
                primary: [],
                secondary: [],
                accent: [],
                neutral: []
            },
            styleGuide: new Map(),
            departmentCoordination: new Map(),
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Extract initial visual elements from production type
        await this.extractInitialVisualElements(production);
        
        console.log('✅ Production Designer: Design project initialized');
    }

    /**
     * Develop overall visual concept
     */
    async developVisualConcept(production) {
        try {
            console.log('🎨 Production Designer: Developing visual concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive visual design concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall visual philosophy and aesthetic approach
                2. Color palette with psychological and symbolic reasoning
                3. Visual themes that support the narrative
                4. Style consistency across all design departments
                5. Period, genre, and cultural considerations
                6. Symbolic elements and visual metaphors
                7. Audience experience and emotional journey
                8. Technical and budgetary feasibility
                
                Provide a detailed visual concept that will unify all design elements and guide every visual decision in the production.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.designProject.overallConcept = response.content;
                    this.designProject.status = 'concept_complete';
                    
                    console.log('✅ Production Designer: Visual concept developed');
                    
                    // Extract design elements from concept
                    await this.extractDesignElements(response.content);
                    
                    // Generate color palette
                    await this.generateColorPalette(response.content);
                    
                    // Create style guide
                    await this.createStyleGuide(response.content);
                    
                    // Share concept with all design departments
                    window.theaterEventBus?.publish('design:concept-complete', {
                        production: production,
                        concept: response.content,
                        colorPalette: this.designProject.colorPalette,
                        styleGuide: this.designProject.styleGuide,
                        productionDesigner: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Production Designer: Concept development failed:', error.message);
            this.designProject.status = 'concept_error';
        }
    }

    /**
     * Handle artistic vision from Creative Director
     */
    async onArtisticVisionReceived(data) {
        console.log('🎨 Production Designer: Received artistic vision from Creative Director');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.alignDesignWithVision(data.vision);
        }
    }

    /**
     * Align design concept with artistic vision
     */
    async alignDesignWithVision(artisticVision) {
        try {
            console.log('🎨 Production Designer: Aligning design with artistic vision...');
            
            const alignmentPrompt = `
            Align the visual design concept with this artistic vision:
            
            Artistic Vision:
            ${artisticVision}
            
            Current Visual Concept:
            ${this.designProject.overallConcept || 'To be developed'}
            
            Provide specific design alignments:
            1. How should the visual aesthetic support this vision?
            2. What color adjustments enhance the artistic goals?
            3. How can visual themes reinforce the vision?
            4. What design elements need modification?
            5. How should department coordination change?
            6. What new visual opportunities does this vision create?
            
            Suggest concrete design changes to perfectly support the artistic vision.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(alignmentPrompt, {
                temperature: 0.8,
                max_tokens: 800
            });
            
            if (response && response.content) {
                this.designEvolution.conceptRevisions.push({
                    type: 'artistic_vision_alignment',
                    content: response.content,
                    timestamp: new Date()
                });
                
                console.log('✅ Production Designer: Design aligned with artistic vision');
                
                // Update design elements based on alignment
                await this.updateDesignElements(response.content);
                
                // Notify all departments of changes
                await this.coordinateDesignChanges(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Production Designer: Vision alignment failed:', error.message);
        }
    }

    /**
     * Handle lighting concept from Lighting Designer
     */
    async onLightingConceptReceived(data) {
        console.log('🎨 Production Designer: Received lighting concept from Lighting Designer');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.coordinateWithLightingConcept(data.concept, data.colorPalette);
        }
    }

    /**
     * Coordinate design with lighting concept
     */
    async coordinateWithLightingConcept(lightingConcept, lightingColorPalette) {
        try {
            console.log('🎨 Production Designer: Coordinating with lighting design...');
            
            const coordinationPrompt = `
            Coordinate the overall visual design with this lighting concept:
            
            Lighting Concept:
            ${lightingConcept}
            
            Lighting Color Palette:
            ${JSON.stringify(lightingColorPalette)}
            
            Current Visual Design:
            ${this.designProject.overallConcept}
            
            Provide coordination guidelines:
            1. How should costume colors work with lighting?
            2. What set design elements enhance lighting effects?
            3. How can prop design support lighting moods?
            4. What color palette adjustments optimize lighting coordination?
            5. How should texture choices respond to lighting?
            6. What visual elements create synergy with lighting?
            
            Ensure all design elements work harmoniously with lighting.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(coordinationPrompt, {
                temperature: 0.7,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.departmentCoordination.lighting = {
                    status: 'coordinated',
                    colorAlignment: 'optimized',
                    moodCoordination: 'synchronized',
                    lastSync: new Date(),
                    guidelines: response.content
                };
                
                console.log('✅ Production Designer: Coordinated with lighting design');
                
                // Update style guide with lighting considerations
                await this.updateStyleGuideForLighting(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Production Designer: Lighting coordination failed:', error.message);
        }
    }

    /**
     * Handle design feedback
     */
    async onDesignFeedback(data) {
        console.log('🎨 Production Designer: Design feedback received from', data.source);
        
        await this.incorporateDesignFeedback(data.feedback, data.source, data.priority);
    }

    /**
     * Incorporate design feedback
     */
    async incorporateDesignFeedback(feedback, source, priority) {
        try {
            console.log(`🎨 Production Designer: Incorporating ${priority} feedback from ${source}...`);
            
            const feedbackPrompt = `
            Incorporate this design feedback into the visual concept:
            
            Feedback Source: ${source}
            Priority Level: ${priority}
            Feedback: ${feedback}
            
            Current Visual Concept:
            ${this.designProject.overallConcept}
            
            Provide specific adaptations:
            1. How should the visual concept be modified?
            2. What design elements need adjustment?
            3. How do these changes affect department coordination?
            4. What new opportunities does this feedback create?
            5. How can we maintain design integrity while adapting?
            
            Suggest practical changes that address the feedback while preserving visual excellence.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(feedbackPrompt, {
                temperature: 0.7,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.designEvolution.feedbackIncorporated.push({
                    source: source,
                    priority: priority,
                    originalFeedback: feedback,
                    adaptations: response.content,
                    timestamp: new Date()
                });
                
                console.log('✅ Production Designer: Feedback incorporated');
                
                // Apply changes if high priority
                if (priority === 'high' || priority === 'urgent') {
                    await this.applyDesignChanges(response.content);
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Production Designer: Feedback incorporation failed:', error.message);
        }
    }

    /**
     * Generate color palette from concept
     */
    async generateColorPalette(concept) {
        try {
            const palettePrompt = `
            Generate a comprehensive color palette from this visual concept:
            
            ${concept}
            
            Provide colors in these categories:
            1. Primary colors (2-3 main colors)
            2. Secondary colors (3-4 supporting colors)
            3. Accent colors (2-3 highlight colors)
            4. Neutral colors (3-4 base colors)
            
            For each color, include:
            - Color name and hex code
            - Psychological/symbolic meaning
            - Intended use in production
            - Department applications
            
            Ensure the palette supports the overall visual concept and narrative themes.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(palettePrompt, {
                temperature: 0.6,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.designProject.colorPalette = this.parseColorPalette(response.content);
                console.log('🎨 Production Designer: Color palette generated');
            }
            
        } catch (error) {
            console.warn('⚠️ Production Designer: Color palette generation failed:', error.message);
        }
    }

    /**
     * Create style guide
     */
    async createStyleGuide(concept) {
        try {
            const styleGuidePrompt = `
            Create a comprehensive style guide from this visual concept:
            
            ${concept}
            
            Include guidelines for:
            1. Typography and text treatments
            2. Visual hierarchy and composition
            3. Texture and material choices
            4. Pattern and motif usage
            5. Spatial relationships and proportions
            6. Department-specific applications
            7. Do's and don'ts for consistency
            8. Adaptation guidelines for different scenes
            
            Format as practical guidelines that all departments can follow.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(styleGuidePrompt, {
                temperature: 0.6,
                max_tokens: 800
            });
            
            if (response && response.content) {
                this.designProject.styleGuide = this.parseStyleGuide(response.content);
                console.log('🎨 Production Designer: Style guide created');
            }
            
        } catch (error) {
            console.warn('⚠️ Production Designer: Style guide creation failed:', error.message);
        }
    }

    /**
     * Parse color palette from AI response
     */
    parseColorPalette(content) {
        // Simplified parsing - in practice would be more sophisticated
        const palette = {
            primary: ['#2C3E50', '#E74C3C'], // Example defaults
            secondary: ['#3498DB', '#F39C12', '#8E44AD'],
            accent: ['#E67E22', '#1ABC9C'],
            neutral: ['#ECF0F1', '#95A5A6', '#34495E']
        };
        
        // Extract colors from content (simplified)
        if (content.includes('primary')) {
            // Would parse actual color values from AI response
        }
        
        return palette;
    }

    /**
     * Parse style guide from AI response
     */
    parseStyleGuide(content) {
        const styleGuide = new Map();
        
        // Extract style guidelines (simplified)
        styleGuide.set('typography', 'Modern, clean, readable');
        styleGuide.set('textures', 'Natural, tactile, varied');
        styleGuide.set('patterns', 'Geometric, subtle, purposeful');
        styleGuide.set('composition', 'Balanced, dynamic, focused');
        
        return styleGuide;
    }

    /**
     * Get production design status
     */
    getDesignStatus() {
        return {
            currentProject: {
                active: !!this.designProject.production,
                title: this.designProject.production?.title,
                status: this.designProject.status,
                conceptComplete: !!this.designProject.overallConcept,
                colorPaletteReady: this.designProject.colorPalette.primary.length > 0
            },
            coordination: {
                lighting: this.departmentCoordination.lighting.status,
                costume: this.departmentCoordination.costume.status,
                set: this.departmentCoordination.set.status,
                props: this.departmentCoordination.props.status
            },
            capabilities: this.designCapabilities,
            evolution: {
                revisions: this.designEvolution.conceptRevisions.length,
                feedbackIncorporated: this.designEvolution.feedbackIncorporated.length,
                adaptations: this.designEvolution.adaptationHistory.length
            },
            research: {
                periodsAvailable: this.researchDatabase.historicalPeriods.size,
                stylesAvailable: this.researchDatabase.visualStyles.size,
                colorPsychology: this.researchDatabase.colorPsychology.size
            }
        };
    }

    /**
     * Handle creative brief from production team
     */
    async onCreativeBrief(brief) {
        console.log('🎨 Production Designer: Received creative brief for visual coordination');
        
        this.currentProduction = brief.production;
        
        // Initialize design approach based on brief
        await this.initializeDesignProject(brief.production);
        
        // Develop visual concept aligned with artistic vision
        if (brief.artisticVision) {
            await this.alignDesignWithVision(brief.artisticVision);
        } else {
            await this.developVisualConcept(brief.production);
        }
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎨 Production Designer: Concluding visual design coordination...');
        
        // Finalize design project
        if (this.designProject.status !== 'idle') {
            this.designProject.status = 'completed';
            this.designProject.completedAt = new Date();
        }
        
        // Generate design summary
        if (this.currentProduction) {
            const designSummary = this.generateDesignSummary();
            console.log('🎨 Production Designer: Design summary generated');
        }
        
        console.log('🎨 Production Designer: Visual coordination concluded');
    }

    /**
     * Generate design summary
     */
    generateDesignSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            design: {
                conceptDeveloped: !!this.designProject.overallConcept,
                colorPaletteCreated: this.designProject.colorPalette.primary.length > 0,
                styleGuideComplete: this.designProject.styleGuide.size > 0,
                departmentsCoordinated: Object.values(this.departmentCoordination).filter(d => d.status === 'coordinated').length
            },
            evolution: {
                revisionsCount: this.designEvolution.conceptRevisions.length,
                feedbackAddressed: this.designEvolution.feedbackIncorporated.length,
                adaptationsMade: this.designEvolution.adaptationHistory.length
            },
            coordination: {
                successfulCoordinations: Object.values(this.departmentCoordination).filter(d => d.status === 'coordinated').length,
                totalDepartments: Object.keys(this.departmentCoordination).length
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductionDesignerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.ProductionDesignerAgent = ProductionDesignerAgent;
    console.log('🎨 Production Designer Agent loaded - Ready for unified visual design');
}