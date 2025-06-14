/**
 * AIDirectorAgent.js - Creative Director for AI Theater Productions
 * 
 * Enhanced AI Creative Director that coordinates artistic vision across all departments.
 * Now serves as the primary creative authority under Executive Producer oversight.
 * Inspired by Stanford's live-script research and MIT's algorithmic choreography.
 * 
 * Features:
 * - Artistic vision coordination across all creative departments
 * - Real-time performance generation using Ollama
 * - Multi-departmental creative decision making
 * - Style consistency enforcement
 * - Collaborative human-AI creative direction
 * - Integration with 35-agent ecosystem
 */

class AIDirectorAgent extends BaseAgent {
    constructor(config = {}) {
        super('creative-director', {
            name: 'Creative Director',
            role: 'creative-director',
            priority: 90, // High priority, second only to Executive Producer
            maxActionsPerSecond: 5,
            personality: config.personality || 'visionary',
            ...config
        });
        
        // Creative Director specific properties
        this.ollamaInterface = null;
        this.artisticVision = config.vision || 'collaborative-storytelling';
        this.creativityLevel = config.creativity || 0.8; // Increased for creative leadership
        this.humanCollaboration = config.humanCollaboration || true;
        
        // Enhanced creative capabilities
        this.liveScriptGenerator = null;
        this.contextualDirector = null;
        this.intelligentAnalysis = config.intelligentAnalysis !== false;
        
        // Creative department coordination
        this.creativeDepartments = {
            script: { lead: null, team: [], status: 'idle' },
            design: { lead: null, team: [], status: 'idle' },
            music: { lead: null, team: [], status: 'idle' },
            performance: { lead: null, team: [], status: 'idle' }
        };
        
        // Artistic vision and style management
        this.productionStyle = {
            genre: config.genre || 'adaptive',
            aesthetic: config.aesthetic || 'contemporary',
            mood: config.mood || 'exploratory',
            complexity: config.complexity || 'medium',
            target_audience: config.audience || 'general'
        };
        
        // Creative decision tracking
        this.creativeDecisions = [];
        this.styleConsistency = new Map();
        this.artisticStandards = {
            script_quality: 0.8,
            design_coherence: 0.8,
            performance_quality: 0.8,
            technical_execution: 0.7
        };
        
        // Integration with production system
        this.executiveProducer = null;
        this.currentProduction = null;
        this.productionPhase = 'idle';
        
        // Performance state tracking
        this.currentPerformance = {
            title: 'Untitled Performance',
            genre: 'mixed',
            acts: [],
            currentAct: 0,
            startTime: null,
            audienceEngagement: 0.5
        };
        
        // Decision-making context
        this.decisionHistory = [];
        this.performanceGoals = [];
        this.constraints = {
            maxActors: 10,
            safetyFirst: true,
            budgetConstraints: false,
            timeLimit: null
        };
        
        // Learning and adaptation
        this.performanceMemory = new Map();
        this.successfulPatterns = [];
        this.improvedTechniques = [];
        
        // Error handling and recovery
        this.consecutiveErrors = 0;
        this.errorBackoffUntil = null;
        this.maxConsecutiveErrors = 3;
        
        console.log(`🎨 Creative Director Agent: ${this.config.personality} creative director ready`);
    }

    /**
     * Initialize Creative Director with enhanced coordination capabilities
     */
    async onInitialize() {
        try {
            console.log('🎨 Creative Director: Connecting to creative systems...');
            
            // Initialize Ollama interface with safety checks
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. Please ensure the Ollama interface module is loaded.');
            }
            
            this.ollamaInterface = window.ollamaTheaterInterface;
            
            if (!this.ollamaInterface.isInitialized) {
                console.log('🎨 Creative Director: Initializing Ollama interface...');
                const initSuccess = await window.ollamaTheaterInterface.initialize();
                if (!initSuccess) {
                    throw new Error('Failed to initialize Ollama interface');
                }
                this.ollamaInterface = window.ollamaTheaterInterface;
            }
            
            if (!this.ollamaInterface.isConnected) {
                throw new Error('Cannot connect to Ollama. Please ensure Ollama is running: `ollama serve`');
            }
            
            // Configure AI personality for creative direction
            this.ollamaInterface.updatePerformanceContext({
                genre: this.productionStyle.genre,
                mood: this.productionStyle.mood,
                audience_type: this.productionStyle.target_audience,
                current_scene: 'creative-initialization'
            });
            
            // Register with Executive Producer if available
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('🎨 Creative Director: Registered with Executive Producer');
            }
            
            // Set up creative department coordination
            await this.initializeCreativeDepartments();
            
            // Initialize Phase 4B components
            await this.initializePhase4BComponents();
            
            // Test AI capabilities
            await this.testAICapabilities();
            
            // Initialize performance
            await this.initializePerformance();
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            console.log('🎨 Creative Director: Ready to lead creative vision and coordinate artistic departments!');
            
        } catch (error) {
            console.error('🎭 AI Director initialization failed:', error);
            
            // Provide helpful guidance
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
     * Initialize Phase 4B components: Live Script Generator and Contextual Director
     */
    async initializePhase4BComponents() {
        try {
            console.log('🎭 AI Director: Initializing Phase 4B capabilities...');
            
            // Initialize Live Script Generator
            if (window.LiveScriptGenerator) {
                try {
                    this.liveScriptGenerator = new window.LiveScriptGenerator(this.ollamaInterface);
                    await this.liveScriptGenerator.initialize();
                    console.log('🎬 Live Script Generator initialized');
                } catch (error) {
                    console.warn('🎬 Live Script Generator failed to initialize:', error.message);
                    this.liveScriptGenerator = null;
                }
            } else {
                console.warn('🎬 LiveScriptGenerator not available - live script features disabled');
            }
            
            // Initialize Contextual Director
            if (window.ContextualDirector && window.theaterAPI) {
                try {
                    this.contextualDirector = new window.ContextualDirector(this.ollamaInterface, window.theaterAPI);
                    await this.contextualDirector.initialize();
                    console.log('🎭 Contextual Director initialized');
                } catch (error) {
                    console.warn('🎭 Contextual Director failed to initialize:', error.message);
                    this.contextualDirector = null;
                }
            } else {
                const missing = [];
                if (!window.ContextualDirector) missing.push('ContextualDirector');
                if (!window.theaterAPI) missing.push('theaterAPI');
                console.warn(`🎭 ContextualDirector not available - missing: ${missing.join(', ')}`);
            }
            
            console.log('🎭 AI Director: Phase 4B components ready');
            
        } catch (error) {
            console.warn('🎭 Phase 4B initialization partially failed:', error);
            // Continue without Phase 4B features
        }
    }

    /**
     * Test AI capabilities and model performance
     */
    async testAICapabilities() {
        try {
            const testPrompt = `
            Quick test: You are directing a theater performance. 
            There are 3 actors on stage. Create a simple but visually interesting arrangement.
            Use your available functions to position them effectively.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: 0.5,
                max_tokens: 200
            });
            
            console.log('🎭 AI Director: AI capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎭 AI Director: AI capability test failed:', error);
            throw new Error(`AI model test failed: ${error.message}`);
        }
    }

    /**
     * Initialize a new performance
     */
    async initializePerformance() {
        try {
            // Get current stage state
            const stageState = await this.getState();
            
            // Generate opening performance concept
            const initPrompt = `
            You are starting to direct a new theater performance.
            
            Current stage state:
            - Actors available: ${stageState.actors?.length || 0}
            - Stage lighting: ${stageState.stage?.lighting || 'normal'}
            - Curtains: ${stageState.stage?.curtains || 'closed'}
            
            As a ${this.config.personality} director, create an engaging opening sequence:
            1. Set appropriate lighting for the mood you want to create
            2. Position any existing actors in compelling starting positions
            3. Set camera angle for maximum impact
            4. Open curtains when ready to begin
            
            Consider this a fresh start - be creative and set the tone for an memorable performance.
            `;
            
            console.log('🎭 AI Director: Generating opening sequence...');
            
            // Use streaming for real-time execution
            await this.ollamaInterface.generatePerformance(initPrompt, {
                stream: true,
                temperature: this.creativityLevel,
                currentState: stageState
            });
            
            this.currentPerformance.startTime = Date.now();
            
            console.log('🎭 AI Director: Performance initialized!');
            
        } catch (error) {
            console.error('🎭 AI Director: Performance initialization failed:', error);
            this.handleAnalysisError(error);
        }
    }

    /**
     * Initialize creative department coordination
     */
    async initializeCreativeDepartments() {
        console.log('🎨 Creative Director: Initializing department coordination...');
        
        // Discover existing creative agents
        const departmentMap = {
            script: ['ai-playwright', 'script-editor', 'dramaturge'],
            design: ['production-designer', 'costume-designer', 'set-designer', 'makeup-artist'],
            music: ['music-director', 'music-composer', 'sound-designer'],
            performance: ['choreographer', 'voice-coach', 'method-acting-coach']
        };
        
        for (const [dept, agentTypes] of Object.entries(departmentMap)) {
            for (const agentType of agentTypes) {
                const agent = this.findAgent(agentType);
                if (agent) {
                    if (!this.creativeDepartments[dept].lead) {
                        this.creativeDepartments[dept].lead = agent;
                        console.log(`👑 ${dept} department lead: ${agentType}`);
                    } else {
                        this.creativeDepartments[dept].team.push(agent);
                        console.log(`👥 ${dept} team member: ${agentType}`);
                    }
                }
            }
        }
    }

    /**
     * Subscribe to production events for creative coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('production:phase-change', (data) => this.onPhaseChange(data));
            window.theaterEventBus.subscribe('creative:decision-needed', (data) => this.onCreativeDecisionNeeded(data));
            window.theaterEventBus.subscribe('agent:created', (data) => this.onAgentJoined(data));
            
            console.log('🎨 Creative Director: Subscribed to production events');
        }
    }

    /**
     * Handle production start event
     */
    async onProductionStarted(data) {
        console.log('🎨 Creative Director: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        this.productionPhase = data.phase;
        
        // Establish artistic vision for the production
        await this.establishArtisticVision(data.production);
        
        // Coordinate with all creative departments
        await this.coordinateCreativeKickoff();
    }

    /**
     * Establish artistic vision for production
     */
    async establishArtisticVision(production) {
        try {
            console.log('🎨 Creative Director: Establishing artistic vision...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const visionPrompt = `
                As a Creative Director, establish the artistic vision for this production:
                
                Title: ${production.title}
                Type: ${production.type}
                Brief: ${production.brief || 'To be developed'}
                
                Define:
                1. Core artistic themes and messages
                2. Visual aesthetic and style direction
                3. Performance tone and approach
                4. Audience experience goals
                5. Creative challenges and opportunities
                6. Success criteria for artistic excellence
                
                Provide a comprehensive creative vision that will guide all departments.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(visionPrompt, {
                    temperature: 0.8,
                    max_tokens: 800,
                    timeout: 25000
                });
                
                if (response && response.content) {
                    production.artisticVision = response.content;
                    this.artisticVision = response.content;
                    
                    console.log('✅ Creative Director: Artistic vision established');
                    
                    // Share vision with Executive Producer
                    if (this.executiveProducer) {
                        window.theaterEventBus?.publish('creative:vision-established', {
                            production: production,
                            vision: response.content,
                            creativeDirector: this.config.name
                        });
                    }
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Creative Director: Failed to establish AI-powered vision:', error.message);
            // Fallback to basic vision
            production.artisticVision = `Artistic vision for ${production.title} - ${production.type} production`;
        }
    }

    /**
     * Coordinate creative kickoff with all departments
     */
    async coordinateCreativeKickoff() {
        console.log('🎨 Creative Director: Coordinating creative kickoff...');
        
        for (const [dept, deptData] of Object.entries(this.creativeDepartments)) {
            if (deptData.lead) {
                try {
                    // Send creative brief to department lead
                    if (typeof deptData.lead.onCreativeBrief === 'function') {
                        await deptData.lead.onCreativeBrief({
                            production: this.currentProduction,
                            artisticVision: this.artisticVision,
                            departmentRole: dept,
                            creativeDirector: this
                        });
                    }
                    
                    deptData.status = 'active';
                    console.log(`✅ ${dept} department briefed and activated`);
                    
                } catch (error) {
                    console.warn(`⚠️ Failed to brief ${dept} department:`, error.message);
                }
            } else {
                console.warn(`⚠️ No lead assigned for ${dept} department`);
            }
        }
    }

    /**
     * Handle production phase changes
     */
    async onPhaseChange(data) {
        console.log(`🎨 Creative Director: Phase transition - ${data.previousPhase} → ${data.newPhase}`);
        
        this.productionPhase = data.newPhase;
        
        // Adjust creative focus based on phase
        switch (data.newPhase) {
            case 'development':
                await this.focusOnScriptDevelopment();
                break;
            case 'preProduction':
                await this.focusOnDesignConcepts();
                break;
            case 'design':
                await this.focusOnDesignExecution();
                break;
            case 'technical':
                await this.focusOnTechnicalIntegration();
                break;
            case 'rehearsal':
                await this.focusOnPerformanceRefinement();
                break;
        }
    }

    /**
     * Focus creative energy on script development
     */
    async focusOnScriptDevelopment() {
        console.log('📝 Creative Director: Focusing on script development...');
        
        // Prioritize script department
        if (this.creativeDepartments.script.lead) {
            window.theaterEventBus?.publish('creative:priority-focus', {
                department: 'script',
                phase: 'development',
                directive: 'Prioritize script quality and story development'
            });
        }
    }

    /**
     * Focus on design concepts
     */
    async focusOnDesignConcepts() {
        console.log('🎨 Creative Director: Focusing on design concepts...');
        
        // Prioritize design department
        if (this.creativeDepartments.design.lead) {
            window.theaterEventBus?.publish('creative:priority-focus', {
                department: 'design',
                phase: 'preProduction',
                directive: 'Develop visual concepts aligned with artistic vision'
            });
        }
    }

    /**
     * Find agent by type
     */
    findAgent(agentType) {
        // Check global agent registry
        if (window.agentSystem && window.agentSystem.agents) {
            return window.agentSystem.agents.get(agentType);
        }
        
        // Check individual global variables
        const agentMappings = {
            'ai-playwright': 'aiPlaywrightAgent',
            'script-editor': 'scriptEditorAgent',
            'music-director': 'musicDirectorAgent'
        };
        
        const globalVar = agentMappings[agentType];
        if (globalVar && window[globalVar]) {
            return window[globalVar];
        }
        
        return null;
    }

    /**
     * Handle theater events with AI decision making
     */
    async onEvent(event, data, timestamp) {
        try {
            // Process event through AI director brain
            await this.processEventWithAI(event, data, timestamp);
            
        } catch (error) {
            console.error(`🎭 AI Director: Event processing failed for ${event}:`, error);
        }
    }

    /**
     * Process events using AI reasoning with circuit breaker pattern
     */
    async processEventWithAI(event, data, timestamp) {
        // Check if we're in error backoff period
        if (this.errorBackoffUntil && Date.now() < this.errorBackoffUntil) {
            console.log('🎭 AI Director: In error backoff, skipping event processing');
            return;
        }
        
        // Only process significant events to avoid overwhelming the AI
        const significantEvents = [
            'actor:created',
            'actor:moved', 
            'lighting:changed',
            'performance:audience-reaction',
            'system:user-input'
        ];
        
        if (!significantEvents.includes(event)) {
            return;
        }
        
        const eventPrompt = `
        LIVE PERFORMANCE EVENT: ${event}
        
        Event details: ${JSON.stringify(data)}
        Timestamp: ${new Date(timestamp).toLocaleTimeString()}
        Performance duration: ${Math.round((Date.now() - this.currentPerformance.startTime) / 1000)}s
        
        As the AI director, how should the performance adapt to this event?
        Consider:
        - Does this create new dramatic opportunities?
        - Should other actors respond to this change?
        - Are lighting or camera adjustments needed?
        - How can this enhance the overall performance?
        
        Provide immediate, specific responses using function calls.
        Think like a master director - turn every moment into magic.
        `;
        
        // Generate AI response in background to avoid blocking
        setTimeout(async () => {
            try {
                await this.ollamaInterface.generatePerformance(eventPrompt, {
                    stream: true,
                    temperature: this.creativityLevel * 0.8,
                    max_tokens: 300,
                    timeout: 15000 // 15 second timeout for background events
                });
                
                // Reset error count on success
                this.consecutiveErrors = 0;
                this.errorBackoffUntil = null;
                
            } catch (error) {
                this.handleEventProcessingError(error);
            }
        }, 100);
    }

    /**
     * Handle event processing errors with exponential backoff
     */
    handleEventProcessingError(error) {
        this.consecutiveErrors++;
        
        console.warn(`🎭 AI Director: Event processing error #${this.consecutiveErrors}:`, error.message);
        
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
            // Exponential backoff: start with 30 seconds, double each failure, max 5 minutes
            const backoffSeconds = Math.min(30 * Math.pow(2, this.consecutiveErrors - this.maxConsecutiveErrors), 300);
            this.errorBackoffUntil = Date.now() + (backoffSeconds * 1000);
            
            console.error(`🎭 AI Director: Too many consecutive errors, backing off for ${backoffSeconds} seconds`);
            
            // Notify user about the issue
            this.notifyUserOfError(`AI Director paused due to errors (${Math.round(backoffSeconds/60)}m)`);
        } else {
            // Short backoff for minor errors
            this.errorBackoffUntil = Date.now() + (10 * 1000); // 10 seconds
        }
    }

    /**
     * Notify user of AI Director errors
     */
    notifyUserOfError(message) {
        if (typeof window !== 'undefined' && window.document) {
            // Update AI status display if available
            const statusEl = document.getElementById('ai-status');
            if (statusEl) {
                statusEl.textContent = `Status: ${message}`;
                statusEl.style.color = '#ff6b6b';
            }
            
            // Also use notification manager if available
            if (window.notificationManager) {
                window.notificationManager.show(message, 'warning');
            }
        }
        
        console.error(`🎭 AI Director: ${message}`);
    }

    /**
     * Periodic AI performance analysis and improvement - Enhanced with Contextual Director
     */
    async onUpdate(deltaTime) {
        if (!this.isActive || !this.ollamaInterface?.isConnected) {
            return;
        }
        
        // Check error state and back off if needed
        if (this.errorBackoffUntil && Date.now() < this.errorBackoffUntil) {
            return;
        }
        
        // Run periodic analysis every 30 seconds (or 15 seconds with contextual director)
        const analysisInterval = this.contextualDirector ? 15000 : 30000;
        if (!this.lastAnalysis || (Date.now() - this.lastAnalysis) > analysisInterval) {
            try {
                await this.performPeriodicAnalysis();
                this.lastAnalysis = Date.now();
                // Reset error backoff on success
                this.errorBackoffUntil = null;
                this.consecutiveErrors = 0;
            } catch (error) {
                this.handleAnalysisError(error);
            }
        }
        
        // Handle any queued actions
        if (this.actionQueue.length > 0) {
            try {
                await this.processActionQueue();
            } catch (error) {
                console.warn('🎭 AI Director: Action queue processing error:', error.message);
            }
        }
    }

    /**
     * Perform periodic performance analysis - Enhanced with Contextual Director
     */
    async performPeriodicAnalysis() {
        try {
            const currentState = await this.getState();
            const performanceDuration = Date.now() - this.currentPerformance.startTime;
            
            console.log('🎭 AI Director: Analyzing performance and planning improvements...');
            
            // Phase 4B: Use Contextual Director if available
            if (this.contextualDirector && this.intelligentAnalysis) {
                console.log('🎭 Using Contextual Director for intelligent analysis');
                
                const analysis = await this.contextualDirector.analyzePerformanceState(currentState);
                
                if (analysis && analysis.suggestions.length > 0) {
                    // Implement high-priority suggestions
                    const urgentSuggestions = analysis.suggestions.filter(s => s.priority >= 7);
                    
                    if (urgentSuggestions.length > 0) {
                        console.log(`🎭 Implementing ${urgentSuggestions.length} intelligent improvements`);
                        await this.contextualDirector.implementSuggestions(urgentSuggestions, { maxSuggestions: 2 });
                    }
                }
                
                return analysis;
            }
            
            // Fallback to original analysis method
            const analysisPrompt = `
            PERFORMANCE ANALYSIS CHECKPOINT
            
            Current state: ${JSON.stringify(currentState, null, 2)}
            Performance duration: ${Math.round(performanceDuration / 1000)}s
            Style: ${this.performanceStyle}
            
            As an expert AI director, analyze the current performance:
            
            1. VISUAL COMPOSITION: Are actors positioned for maximum dramatic impact?
            2. PACING: Is the performance energy appropriate for the duration?
            3. ENGAGEMENT: What would increase audience interest right now?
            4. OPPORTUNITIES: What creative possibilities are being missed?
            5. IMPROVEMENTS: What specific changes would enhance the performance?
            
            Provide 1-3 specific, immediate improvements using function calls.
            Be bold but purposeful. Every moment should captivate the audience.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                stream: true,
                temperature: this.creativityLevel,
                max_tokens: 400
            });
            
            return response;
            
        } catch (error) {
            console.warn('🎭 AI Director: Periodic analysis failed:', error);
            return null;
        }
    }

    /**
     * Handle user input with AI interpretation - Enhanced with Live Script Generation
     */
    async handleUserInput(userInput, inputType = 'text') {
        try {
            const currentState = await this.getState();
            
            console.log(`🎭 AI Director: Processing audience input: "${userInput}"`);
            
            // Phase 4B: Use Live Script Generator if available
            if (this.liveScriptGenerator) {
                console.log('🎬 Using Live Script Generator for audience input');
                
                const scriptResponse = await this.liveScriptGenerator.generateRealTimeScript(
                    userInput, 
                    currentState,
                    {
                        genre: this.currentPerformance.genre,
                        creativity: this.creativityLevel + 0.1,
                        style: this.performanceStyle
                    }
                );
                
                if (scriptResponse.success) {
                    console.log('🎬 Live script generated successfully');
                    return scriptResponse;
                }
            }
            
            // Fallback to original method
            const userPrompt = `
            LIVE AUDIENCE INPUT RECEIVED
            
            Input type: ${inputType}
            User said: "${userInput}"
            
            Current performance state: ${JSON.stringify(currentState)}
            Performance style: ${this.performanceStyle}
            
            As a ${this.config.personality} AI director, incorporate this audience input into the ongoing performance:
            
            1. How can this input enhance the current scene?
            2. What immediate changes would make this input feel integrated?
            3. How can we surprise and delight the audience who made this suggestion?
            4. What creative interpretation makes this input theatrical?
            
            Generate immediate, specific actions using function calls.
            Make the audience feel heard and amazed by the response.
            You have 5 seconds to respond - be quick and brilliant.
            `;
            
            // Quick response for live interaction
            const response = await this.ollamaInterface.generatePerformance(userPrompt, {
                stream: true,
                temperature: this.creativityLevel + 0.1, // Extra creativity for audience interaction
                max_tokens: 250
            });
            
            return { success: true, response: response, method: 'traditional' };
            
        } catch (error) {
            console.error('🎭 AI Director: User input processing failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate complete performance from concept - Enhanced with Live Script Generator
     */
    async generateFullPerformance(concept, duration = 300000) {
        try {
            console.log(`🎭 AI Director: Generating full performance: "${concept}"`);
            
            // Phase 4B: Use Live Script Generator if available
            if (this.liveScriptGenerator) {
                console.log('🎬 Using Live Script Generator for full performance');
                
                const scriptResponse = await this.liveScriptGenerator.generateFullPerformance(
                    concept,
                    duration,
                    {
                        genre: this.inferGenreFromConcept(concept),
                        style: this.performanceStyle,
                        audience: 'general',
                        personality: this.config.personality
                    }
                );
                
                // Update performance tracking
                this.currentPerformance.title = concept;
                this.currentPerformance.startTime = Date.now();
                this.currentPerformance.genre = this.inferGenreFromConcept(concept);
                
                return scriptResponse;
            }
            
            // Fallback to original method
            const performancePrompt = `
            FULL PERFORMANCE GENERATION REQUEST
            
            Concept: "${concept}"
            Target duration: ${duration / 1000} seconds
            Available stage: 20x15 units with 20 markers
            Director style: ${this.config.personality}
            Performance style: ${this.performanceStyle}
            
            Create a complete performance that includes:
            
            ACT 1 (Opening - first 30% of time):
            - Compelling opening that establishes mood and concept
            - Character introductions through positioning and movement
            - Initial lighting and staging setup
            
            ACT 2 (Development - middle 40% of time):
            - Escalating dramatic action
            - Complex formations and interactions
            - Lighting and camera changes for variety
            
            ACT 3 (Climax and Resolution - final 30% of time):
            - Dramatic peak with maximum visual impact
            - Satisfying resolution of the concept
            - Memorable ending sequence
            
            Generate the OPENING SEQUENCE ONLY for now using function calls.
            We'll develop the rest as the performance progresses.
            
            Be ambitious, creative, and specific. This should be unforgettable.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(performancePrompt, {
                stream: true,
                temperature: this.creativityLevel,
                max_tokens: 600
            });
            
            // Update performance tracking
            this.currentPerformance.title = concept;
            this.currentPerformance.startTime = Date.now();
            
            return response;
            
        } catch (error) {
            console.error('🎭 AI Director: Full performance generation failed:', error);
            throw error;
        }
    }

    /**
     * Emergency performance recovery
     */
    async handleEmergencyRecovery(issue) {
        try {
            const emergencyPrompt = `
            EMERGENCY PERFORMANCE SITUATION
            
            Issue: ${issue}
            Current time: ${new Date().toLocaleTimeString()}
            
            As an expert AI director, you must immediately recover the performance:
            
            1. What's the most graceful way to handle this situation?
            2. How can we turn this challenge into a dramatic opportunity?
            3. What specific actions will get the performance back on track?
            4. How do we maintain audience engagement during recovery?
            
            Generate IMMEDIATE recovery actions using function calls.
            The show must go on - be resourceful and creative!
            `;
            
            console.log(`🎭 AI Director: Handling emergency: ${issue}`);
            
            await this.ollamaInterface.generatePerformance(emergencyPrompt, {
                stream: true,
                temperature: 0.9, // High creativity for emergency situations
                max_tokens: 200
            });
            
        } catch (error) {
            console.error('🎭 AI Director: Emergency recovery failed:', error);
        }
    }

    /**
     * Infer genre from performance concept
     */
    inferGenreFromConcept(concept) {
        const lowerConcept = concept.toLowerCase();
        
        if (lowerConcept.includes('comedy') || lowerConcept.includes('funny') || lowerConcept.includes('humor')) {
            return 'comedic';
        }
        if (lowerConcept.includes('romance') || lowerConcept.includes('love') || lowerConcept.includes('wedding')) {
            return 'romantic';
        }
        if (lowerConcept.includes('mystery') || lowerConcept.includes('detective') || lowerConcept.includes('secret')) {
            return 'mystery';
        }
        if (lowerConcept.includes('drama') || lowerConcept.includes('tragic') || lowerConcept.includes('conflict')) {
            return 'dramatic';
        }
        if (lowerConcept.includes('experimental') || lowerConcept.includes('abstract') || lowerConcept.includes('avant')) {
            return 'experimental';
        }
        
        return 'mixed';
    }

    /**
     * Get director statistics and insights - Enhanced with Phase 4B
     */
    getDirectorStats() {
        const baseStats = this.getStats();
        const ollamaStats = this.ollamaInterface?.getStats() || {};
        
        return {
            ...baseStats,
            aiConnection: {
                connected: this.ollamaInterface?.isConnected || false,
                model: ollamaStats.defaultModel,
                avgResponseTime: ollamaStats.avgResponseTime,
                responseCount: ollamaStats.responseCount
            },
            performance: {
                ...this.currentPerformance,
                duration: this.currentPerformance.startTime ? 
                    Date.now() - this.currentPerformance.startTime : 0
            },
            creativity: {
                level: this.creativityLevel,
                style: this.performanceStyle,
                personality: this.config.personality
            },
            decisions: {
                totalDecisions: this.decisionHistory.length,
                successfulPatterns: this.successfulPatterns.length,
                lastDecision: this.decisionHistory[this.decisionHistory.length - 1]
            },
            // Phase 4B: Enhanced capabilities
            phase4B: {
                liveScriptGenerator: {
                    available: !!this.liveScriptGenerator,
                    initialized: this.liveScriptGenerator?.isInitialized || false,
                    stats: this.liveScriptGenerator?.getScriptStats() || null
                },
                contextualDirector: {
                    available: !!this.contextualDirector,
                    initialized: this.contextualDirector?.isInitialized || false,
                    intelligentAnalysis: this.intelligentAnalysis,
                    stats: this.contextualDirector?.getDirectorStats() || null
                }
            }
        };
    }

    /**
     * Update director configuration
     */
    updateDirectorConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.creativityLevel = newConfig.creativity || this.creativityLevel;
        this.performanceStyle = newConfig.style || this.performanceStyle;
        
        // Update Ollama context
        if (this.ollamaInterface) {
            this.ollamaInterface.updatePerformanceContext({
                mood: newConfig.mood,
                genre: newConfig.genre,
                audience_type: newConfig.audienceType
            });
        }
        
        console.log('🎭 AI Director: Configuration updated', this.config);
    }

    /**
     * Handle analysis errors with backoff strategy and user notification
     */
    handleAnalysisError(error) {
        this.consecutiveErrors++;
        
        console.warn(`🎭 AI Director: Analysis error #${this.consecutiveErrors}:`, error.message);
        
        if (this.consecutiveErrors >= this.maxConsecutiveErrors) {
            // Exponential backoff: 5 minutes for first major failure, doubling each time, max 60 minutes
            const backoffMinutes = Math.min(5 * Math.pow(2, this.consecutiveErrors - this.maxConsecutiveErrors), 60);
            this.errorBackoffUntil = Date.now() + (backoffMinutes * 60 * 1000);
            
            console.error(`🎭 AI Director: Too many consecutive errors, backing off for ${backoffMinutes} minutes`);
            
            // Notify user using unified notification system
            this.notifyUserOfError(`AI Director paused due to analysis errors (${backoffMinutes}m)`);
            
        } else {
            // Short backoff for minor errors
            this.errorBackoffUntil = Date.now() + (30 * 1000); // 30 seconds
            
            // Brief notification for minor errors
            if (typeof window !== 'undefined' && window.document) {
                const statusEl = document.getElementById('ai-status');
                if (statusEl) {
                    statusEl.textContent = `Status: Temporary error, retrying...`;
                    statusEl.style.color = '#ffa500'; // Orange for warnings
                    
                    // Reset to normal after backoff period
                    setTimeout(() => {
                        if (statusEl.style.color === 'rgb(255, 165, 0)') { // Still orange
                            statusEl.textContent = 'Status: Active';
                            statusEl.style.color = '#4CAF50';
                        }
                    }, 30000);
                }
            }
        }
    }

    /**
     * Stop AI Director gracefully
     */
    stop() {
        console.log('🎭 AI Director: Performance concluded. Thank you for the standing ovation!');
        
        // Save performance memory for future reference
        if (this.currentPerformance.startTime) {
            const performanceRecord = {
                ...this.currentPerformance,
                endTime: Date.now(),
                decisionCount: this.decisionHistory.length,
                finalStats: this.getDirectorStats()
            };
            
            this.performanceMemory.set(Date.now(), performanceRecord);
        }
        
        super.stop();
    }
}

// Enhanced Director with specialized personalities
class ExperimentalDirector extends AIDirectorAgent {
    constructor() {
        super({
            personality: 'experimental',
            style: 'avant-garde',
            creativity: 0.9,
            name: 'Experimental AI Director'
        });
    }
}

class ClassicalDirector extends AIDirectorAgent {
    constructor() {
        super({
            personality: 'classical',
            style: 'traditional',
            creativity: 0.6,
            name: 'Classical AI Director'
        });
    }
}

class ComedyDirector extends AIDirectorAgent {
    constructor() {
        super({
            personality: 'comedic',
            style: 'humorous',
            creativity: 0.8,
            name: 'Comedy AI Director'
        });
    }
}

// Export classes
if (typeof window !== 'undefined') {
    window.AIDirectorAgent = AIDirectorAgent;
    window.ExperimentalDirector = ExperimentalDirector;
    window.ClassicalDirector = ClassicalDirector;
    window.ComedyDirector = ComedyDirector;
    
    console.log('🎭 AI Director Agents loaded - Local AI theater direction available');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AIDirectorAgent,
        ExperimentalDirector,
        ClassicalDirector,
        ComedyDirector
    };
}