/**
 * AIPlaywrightAgent.js - Autonomous Script Generation and Story Development
 * 
 * The AI Playwright Agent serves as the primary script writer and story developer
 * for theatrical productions. Using Ollama's local LLM capabilities, it generates
 * scripts, dialogue, character development, and narrative structures.
 * 
 * Features:
 * - Autonomous script generation from concepts or prompts
 * - Character development and dialogue creation
 * - Story structure and dramatic arc planning
 * - Real-time script adaptation during performances
 * - Integration with Creative Director for artistic vision alignment
 * - Collaborative script editing with human writers
 */

class AIPlaywrightAgent extends BaseAgent {
    constructor(config = {}) {
        super('ai-playwright', {
            name: 'AI Playwright',
            role: 'playwright',
            priority: 80, // High priority creative role
            maxActionsPerSecond: 3,
            personality: config.personality || 'creative',
            ...config
        });
        
        // Playwright specific properties
        this.ollamaInterface = null;
        this.writingStyle = config.writingStyle || 'adaptive';
        this.genreSpecialty = config.genreSpecialty || 'drama';
        this.creativityLevel = config.creativity || 0.85;
        
        // Script management
        this.currentScript = {
            title: null,
            genre: null,
            acts: [],
            characters: new Map(),
            themes: [],
            status: 'idle'
        };
        
        // Writing capabilities
        this.writingCapabilities = {
            dialogue: true,
            stageDirections: true,
            characterDevelopment: true,
            plotStructure: true,
            sceneTransitions: true,
            monologues: true
        };
        
        // Genre templates and structures
        this.genreTemplates = {
            drama: {
                acts: 3,
                structure: ['exposition', 'rising_action', 'climax', 'falling_action', 'resolution'],
                characterTypes: ['protagonist', 'antagonist', 'supporting', 'comic_relief'],
                themes: ['conflict', 'growth', 'relationships', 'moral_choice']
            },
            comedy: {
                acts: 3,
                structure: ['setup', 'complication', 'resolution'],
                characterTypes: ['comic_lead', 'straight_man', 'sidekick', 'authority_figure'],
                themes: ['misunderstanding', 'identity', 'relationships', 'social_satire']
            },
            musical: {
                acts: 2,
                structure: ['opening', 'development', 'complications', 'climax', 'finale'],
                characterTypes: ['lead_singer', 'romantic_interest', 'ensemble', 'character_role'],
                themes: ['dreams', 'love', 'community', 'transformation']
            },
            experimental: {
                acts: 'variable',
                structure: ['concept', 'exploration', 'variation', 'synthesis'],
                characterTypes: ['archetypal', 'symbolic', 'abstract', 'narrator'],
                themes: ['identity', 'reality', 'time', 'consciousness']
            }
        };
        
        // Script quality metrics
        this.qualityMetrics = {
            dialogue_quality: 0,
            plot_coherence: 0,
            character_development: 0,
            dramatic_tension: 0,
            originality: 0
        };
        
        // Integration with production system
        this.executiveProducer = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        // Collaboration features
        this.collaborationMode = config.collaboration || 'autonomous';
        this.humanPartner = null;
        this.revisionHistory = [];
        
        console.log('📝 AI Playwright Agent: Ready to create compelling stories and characters');
    }

    /**
     * Initialize AI Playwright with system integration
     */
    async onInitialize() {
        try {
            console.log('📝 AI Playwright: Connecting to creative writing systems...');
            
            // Connect to Ollama interface
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. Please ensure the Ollama interface module is loaded.');
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
            
            // Configure AI for creative writing
            this.ollamaInterface.updatePerformanceContext({
                genre: this.genreSpecialty,
                writing_style: this.writingStyle,
                creativity_mode: 'script_generation',
                current_role: 'playwright'
            });
            
            // Connect to executive producer and creative director
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('📝 AI Playwright: Connected to Executive Producer');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('📝 AI Playwright: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Test writing capabilities
            await this.testWritingCapabilities();
            
            console.log('📝 AI Playwright: Ready to write compelling theater!')
            
        } catch (error) {
            console.error('📝 AI Playwright: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED:
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
     * Subscribe to production events for script coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('creative:decision-needed', (data) => this.onCreativeDecisionNeeded(data));
            window.theaterEventBus.subscribe('creative:priority-focus', (data) => this.onPriorityFocus(data));
            
            console.log('📝 AI Playwright: Subscribed to production events');
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('📝 AI Playwright: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize script structure based on production type
        await this.initializeScriptStructure(data.production);
        
        // Begin script development
        if (data.phase === 'development') {
            await this.beginScriptDevelopment();
        }
    }

    /**
     * Handle artistic vision from Creative Director
     */
    async onArtisticVisionReceived(data) {
        console.log('📝 AI Playwright: Received artistic vision from Creative Director');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            // Adapt script to artistic vision
            await this.adaptScriptToVision(data.vision);
        }
    }

    /**
     * Handle creative decision requests
     */
    async onCreativeDecisionNeeded(data) {
        if (data.department === 'script' || data.area === 'story') {
            console.log('📝 AI Playwright: Creative decision requested for script');
            await this.handleScriptDecision(data);
        }
    }

    /**
     * Handle priority focus changes
     */
    async onPriorityFocus(data) {
        if (data.department === 'script') {
            console.log('📝 AI Playwright: Receiving priority focus -', data.directive);
            await this.focusOnScriptPriority(data.directive);
        }
    }

    /**
     * Test writing capabilities
     */
    async testWritingCapabilities() {
        try {
            const testPrompt = `
            Write a brief theatrical scene (2-3 minutes) featuring two characters meeting for the first time.
            Include:
            - Character names and brief descriptions
            - Natural dialogue
            - Stage directions
            - A clear emotional arc
            
            Format as a proper script excerpt.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 500
            });
            
            console.log('📝 AI Playwright: Writing capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('📝 AI Playwright: Writing capability test failed:', error);
            throw new Error(`Script writing test failed: ${error.message}`);
        }
    }

    /**
     * Initialize script structure for new production
     */
    async initializeScriptStructure(production) {
        console.log('📝 AI Playwright: Initializing script structure...');
        
        const genre = production.type || 'drama';
        const template = this.genreTemplates[genre] || this.genreTemplates.drama;
        
        this.currentScript = {
            title: production.title,
            genre: genre,
            template: template,
            acts: [],
            characters: new Map(),
            themes: template.themes.slice(),
            scenes: [],
            status: 'outlining',
            createdAt: new Date(),
            lastModified: new Date()
        };
        
        // Create basic act structure
        const actCount = typeof template.acts === 'number' ? template.acts : 3;
        for (let i = 1; i <= actCount; i++) {
            this.currentScript.acts.push({
                number: i,
                title: `Act ${i}`,
                scenes: [],
                summary: '',
                duration: 0
            });
        }
        
        console.log(`📝 AI Playwright: Script structure initialized - ${actCount} acts for ${genre}`);
    }

    /**
     * Begin script development process
     */
    async beginScriptDevelopment() {
        try {
            console.log('📝 AI Playwright: Beginning script development...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const developmentPrompt = `
                Begin developing a ${this.currentScript.genre} script titled "${this.currentScript.title}".
                
                Production context:
                - Title: ${this.currentScript.title}
                - Genre: ${this.currentScript.genre}
                - Structure: ${this.currentScript.acts.length} acts
                - Target themes: ${this.currentScript.themes.join(', ')}
                
                Create the initial outline including:
                1. Central conflict and story premise
                2. Main characters (2-4 key roles)
                3. Act summaries with dramatic progression
                4. Key scenes and turning points
                5. Thematic development
                
                Provide a structured outline that establishes the foundation for script writing.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(developmentPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1000,
                    timeout: 30000
                });
                
                if (response && response.content) {
                    await this.processScriptOutline(response.content);
                    
                    // Notify Creative Director of script progress
                    window.theaterEventBus?.publish('script:outline-complete', {
                        production: this.currentProduction,
                        outline: response.content,
                        playwright: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ AI Playwright: Script development failed:', error.message);
            this.currentScript.status = 'error';
        }
    }

    /**
     * Process and structure the script outline
     */
    async processScriptOutline(outlineContent) {
        console.log('📝 AI Playwright: Processing script outline...');
        
        // Update script with outline content
        this.currentScript.outline = outlineContent;
        this.currentScript.status = 'outlined';
        this.currentScript.lastModified = new Date();
        
        // Extract characters mentioned in outline
        await this.extractCharactersFromOutline(outlineContent);
        
        // Begin detailed scene development
        await this.beginSceneGeneration();
    }

    /**
     * Extract character information from outline
     */
    async extractCharactersFromOutline(outline) {
        try {
            const characterPrompt = `
            From this script outline, extract the main characters:
            
            ${outline}
            
            For each character, provide:
            - Name
            - Brief description (age, role, personality)
            - Character arc summary
            - Key relationships
            
            Format as structured character profiles.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(characterPrompt, {
                temperature: 0.7,
                max_tokens: 600
            });
            
            if (response && response.content) {
                this.currentScript.characterProfiles = response.content;
                console.log('📝 AI Playwright: Character profiles extracted');
            }
            
        } catch (error) {
            console.warn('⚠️ AI Playwright: Character extraction failed:', error.message);
        }
    }

    /**
     * Begin generating detailed scenes
     */
    async beginSceneGeneration() {
        console.log('📝 AI Playwright: Beginning scene generation...');
        
        this.currentScript.status = 'writing';
        
        // Start with Act 1, Scene 1
        await this.generateScene(1, 1, 'opening');
    }

    /**
     * Generate a specific scene
     */
    async generateScene(actNumber, sceneNumber, sceneType = 'standard') {
        try {
            console.log(`📝 AI Playwright: Generating Act ${actNumber}, Scene ${sceneNumber}...`);
            
            const scenePrompt = `
            Write Act ${actNumber}, Scene ${sceneNumber} for "${this.currentScript.title}".
            
            Context:
            - Genre: ${this.currentScript.genre}
            - Overall outline: ${this.currentScript.outline || 'See previous context'}
            - Characters: ${this.currentScript.characterProfiles || 'To be developed'}
            - Scene type: ${sceneType}
            
            Requirements:
            - Proper script formatting with character names, dialogue, and stage directions
            - Scene should be 3-5 minutes of performance time
            - Include clear staging and movement directions
            - Advance the plot and develop characters
            - Maintain ${this.currentScript.genre} genre conventions
            
            Write the complete scene with professional script formatting.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(scenePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 1200,
                timeout: 45000
            });
            
            if (response && response.content) {
                const scene = {
                    act: actNumber,
                    scene: sceneNumber,
                    type: sceneType,
                    content: response.content,
                    generatedAt: new Date(),
                    status: 'draft'
                };
                
                this.currentScript.scenes.push(scene);
                
                // Add to appropriate act
                const act = this.currentScript.acts[actNumber - 1];
                if (act) {
                    act.scenes.push(scene);
                }
                
                console.log(`✅ AI Playwright: Scene ${actNumber}.${sceneNumber} generated`);
                
                // Notify Creative Director
                window.theaterEventBus?.publish('script:scene-complete', {
                    production: this.currentProduction,
                    scene: scene,
                    act: actNumber,
                    sceneNumber: sceneNumber
                });
                
                return scene;
            }
            
        } catch (error) {
            console.error(`📝 AI Playwright: Scene generation failed for ${actNumber}.${sceneNumber}:`, error);
            return null;
        }
    }

    /**
     * Adapt script to artistic vision
     */
    async adaptScriptToVision(artisticVision) {
        try {
            console.log('📝 AI Playwright: Adapting script to artistic vision...');
            
            const adaptationPrompt = `
            Adapt the current script to align with this artistic vision:
            
            Artistic Vision:
            ${artisticVision}
            
            Current Script Status:
            - Title: ${this.currentScript.title}
            - Genre: ${this.currentScript.genre}
            - Status: ${this.currentScript.status}
            - Outline: ${this.currentScript.outline || 'In development'}
            
            Provide specific adaptations:
            1. How should the themes be adjusted?
            2. What character modifications align with the vision?
            3. How should the dramatic structure be refined?
            4. What stylistic changes support the artistic goals?
            
            Suggest concrete changes to implement the artistic vision.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                temperature: 0.8,
                max_tokens: 800
            });
            
            if (response && response.content) {
                this.currentScript.artisticAdaptations = response.content;
                this.currentScript.lastModified = new Date();
                
                console.log('✅ AI Playwright: Script adapted to artistic vision');
                
                // Implement high-priority adaptations
                await this.implementAdaptations(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ AI Playwright: Vision adaptation failed:', error.message);
        }
    }

    /**
     * Focus on script priority directive
     */
    async focusOnScriptPriority(directive) {
        console.log('📝 AI Playwright: Focusing on priority directive -', directive);
        
        if (directive.includes('quality')) {
            await this.enhanceScriptQuality();
        } else if (directive.includes('development')) {
            await this.accelerateScriptDevelopment();
        } else if (directive.includes('character')) {
            await this.enhanceCharacterDevelopment();
        }
    }

    /**
     * Enhance script quality
     */
    async enhanceScriptQuality() {
        try {
            console.log('📝 AI Playwright: Enhancing script quality...');
            
            const qualityPrompt = `
            Review and enhance the quality of the current script:
            
            Current Script: ${this.currentScript.title}
            Status: ${this.currentScript.status}
            Scenes completed: ${this.currentScript.scenes.length}
            
            Focus on improving:
            1. Dialogue naturalness and character voice
            2. Dramatic tension and pacing
            3. Character development and arcs
            4. Scene transitions and flow
            5. Thematic depth and resonance
            
            Provide specific quality improvements for the script.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(qualityPrompt, {
                temperature: 0.7,
                max_tokens: 800
            });
            
            if (response && response.content) {
                this.currentScript.qualityEnhancements = response.content;
                this.currentScript.lastModified = new Date();
                
                console.log('✅ AI Playwright: Script quality enhanced');
            }
            
        } catch (error) {
            console.warn('⚠️ AI Playwright: Quality enhancement failed:', error.message);
        }
    }

    /**
     * Generate real-time script adaptation during performance
     */
    async generateLiveScriptAdaptation(currentState, eventTrigger) {
        try {
            console.log('📝 AI Playwright: Generating live script adaptation...');
            
            const livePrompt = `
            LIVE PERFORMANCE ADAPTATION NEEDED
            
            Current performance state: ${JSON.stringify(currentState)}
            Event trigger: ${eventTrigger}
            
            As the playwright, adapt the script in real-time:
            1. How should characters respond to this situation?
            2. What dialogue would be appropriate?
            3. How can this advance the story?
            4. What stage directions support the moment?
            
            Generate immediate script content that actors can perform.
            Keep it brief but dramatically effective.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(livePrompt, {
                temperature: this.creativityLevel + 0.1,
                max_tokens: 400,
                timeout: 10000
            });
            
            if (response && response.content) {
                console.log('✅ AI Playwright: Live adaptation generated');
                return {
                    success: true,
                    adaptation: response.content,
                    timestamp: new Date()
                };
            }
            
        } catch (error) {
            console.error('📝 AI Playwright: Live adaptation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get current script status and metrics
     */
    getScriptStatus() {
        return {
            currentScript: {
                title: this.currentScript.title,
                genre: this.currentScript.genre,
                status: this.currentScript.status,
                acts: this.currentScript.acts.length,
                scenes: this.currentScript.scenes.length,
                characters: this.currentScript.characters.size,
                lastModified: this.currentScript.lastModified
            },
            writingCapabilities: this.writingCapabilities,
            qualityMetrics: this.qualityMetrics,
            production: {
                active: !!this.currentProduction,
                title: this.currentProduction?.title,
                phase: this.currentProduction?.status
            },
            collaboration: {
                mode: this.collaborationMode,
                hasHumanPartner: !!this.humanPartner,
                revisions: this.revisionHistory.length
            }
        };
    }

    /**
     * Handle script creation requests
     */
    async onCreativeBrief(brief) {
        console.log('📝 AI Playwright: Received creative brief');
        
        this.currentProduction = brief.production;
        
        // Initialize script based on brief
        await this.initializeScriptStructure(brief.production);
        
        // Apply artistic vision if provided
        if (brief.artisticVision) {
            await this.adaptScriptToVision(brief.artisticVision);
        }
        
        // Begin script development
        await this.beginScriptDevelopment();
    }

    /**
     * Export script in various formats
     */
    exportScript(format = 'text') {
        const script = this.currentScript;
        
        switch (format) {
            case 'text':
                return this.exportAsText();
            case 'json':
                return JSON.stringify(script, null, 2);
            case 'html':
                return this.exportAsHTML();
            default:
                return this.exportAsText();
        }
    }

    /**
     * Export script as formatted text
     */
    exportAsText() {
        let output = `${this.currentScript.title}\n`;
        output += `${this.currentScript.genre.toUpperCase()}\n`;
        output += `Generated by AI Playwright\n\n`;
        
        if (this.currentScript.outline) {
            output += `OUTLINE:\n${this.currentScript.outline}\n\n`;
        }
        
        if (this.currentScript.characterProfiles) {
            output += `CHARACTERS:\n${this.currentScript.characterProfiles}\n\n`;
        }
        
        this.currentScript.scenes.forEach((scene, index) => {
            output += `ACT ${scene.act}, SCENE ${scene.scene}\n`;
            output += `${scene.content}\n\n`;
        });
        
        return output;
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('📝 AI Playwright: Concluding script writing session...');
        
        if (this.currentScript.status === 'writing') {
            this.currentScript.status = 'draft';
            this.currentScript.lastModified = new Date();
        }
        
        // Save script if in active production
        if (this.currentProduction) {
            console.log('📝 AI Playwright: Script work saved for future sessions');
        }
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIPlaywrightAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.AIPlaywrightAgent = AIPlaywrightAgent;
    console.log('📝 AI Playwright Agent loaded - Ready for script generation');
}