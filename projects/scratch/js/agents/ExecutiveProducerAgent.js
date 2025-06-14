/**
 * ExecutiveProducerAgent.js - Top-Level Project Coordination and Management
 * 
 * The Executive Producer Agent serves as the highest-level coordinator for all
 * theatrical productions, managing resources, timelines, creative vision alignment,
 * and stakeholder coordination across the entire 35-agent ecosystem.
 * 
 * Responsibilities:
 * - Project lifecycle management from concept to closing
 * - Multi-agent coordination and conflict resolution
 * - Resource allocation and budget management
 * - Timeline and milestone tracking
 * - Quality assurance and creative standards
 * - Human-AI collaboration interfaces
 */

class ExecutiveProducerAgent extends BaseAgent {
    constructor(config = {}) {
        super('executive-producer', {
            name: 'Executive Producer',
            role: 'producer',
            priority: 100, // Highest priority in the system
            maxActionsPerSecond: 10,
            personality: config.personality || 'authoritative',
            ...config
        });
        
        // Executive Producer specific properties
        this.projectState = {
            currentProduction: null,
            phase: 'idle', // idle, development, pre-production, production, performance, post-production
            startDate: null,
            targetOpeningDate: null,
            currentWeek: 0,
            totalWeeks: 20,
            budget: {
                allocated: 0,
                spent: 0,
                remaining: 0
            },
            timeline: new Map(),
            milestones: []
        };
        
        // Agent management
        this.managedAgents = new Map();
        this.agentHierarchy = {
            creative: ['creative-director', 'ai-playwright', 'script-editor', 'dramaturge'],
            technical: ['technical-director', 'lighting-designer', 'sound-designer', 'rigging-controller'],
            performance: ['assistant-director', 'choreographer', 'voice-coach', 'method-acting-coach'],
            design: ['production-designer', 'costume-designer', 'makeup-artist', 'set-designer'],
            audio: ['music-director', 'music-composer', 'sound-effects-coordinator', 'audio-mixer']
        };
        
        // Project management
        this.activeProjects = new Map();
        this.resourcePool = {
            computational: 100,
            storage: 100,
            network: 100,
            agents: new Set()
        };
        
        // Communication and coordination
        this.communicationLog = [];
        this.decisionHistory = [];
        this.conflictResolution = new Map();
        
        // Quality assurance
        this.qualityMetrics = {
            scriptQuality: 0,
            performanceQuality: 0,
            technicalQuality: 0,
            overallSatisfaction: 0
        };
        
        // Integration with existing systems
        this.ollamaInterface = null;
        this.stateManager = null;
        
        console.log('🎬 Executive Producer Agent: Ready to manage theatrical productions');
    }

    /**
     * Initialize Executive Producer with full system integration
     */
    async onInitialize() {
        try {
            console.log('🎬 Executive Producer: Initializing production management system...');
            
            // Connect to existing AI systems
            if (window.ollamaTheaterInterface) {
                this.ollamaInterface = window.ollamaTheaterInterface;
                console.log('🎬 Connected to Ollama AI system');
            }
            
            // Connect to state management
            if (window.stageState) {
                this.stageState = window.stageState;
                console.log('🎬 Connected to theater state management');
            }
            
            // Register with agent system
            if (window.agentSystem) {
                window.agentSystem.registerAgent(this);
                console.log('🎬 Registered with agent coordination system');
            }
            
            // Initialize agent discovery and registration
            await this.discoverAndRegisterAgents();
            
            // Set up communication channels
            this.setupCommunicationChannels();
            
            // Initialize default project templates
            this.initializeProjectTemplates();
            
            console.log('🎬 Executive Producer: Initialization complete - ready for production management');
            
        } catch (error) {
            console.error('🎬 Executive Producer: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Discover and register all available agents in the system
     */
    async discoverAndRegisterAgents() {
        console.log('🎬 Executive Producer: Discovering available agents...');
        
        // Check for existing agents
        const agentChecks = [
            { key: 'creative-director', instance: window.aiDirectorAgent, name: 'Creative Director' },
            { key: 'technical-director', instance: null, name: 'Technical Director' },
            { key: 'ai-playwright', instance: null, name: 'AI Playwright' },
            { key: 'script-editor', instance: null, name: 'Script Editor' },
            { key: 'assistant-director', instance: null, name: 'Assistant Director' }
        ];
        
        let discoveredAgents = 0;
        for (const agent of agentChecks) {
            if (agent.instance && agent.instance.isActive) {
                this.managedAgents.set(agent.key, {
                    instance: agent.instance,
                    name: agent.name,
                    status: 'active',
                    department: this.getDepartmentForAgent(agent.key),
                    priority: this.getPriorityForAgent(agent.key)
                });
                discoveredAgents++;
                console.log(`✅ Discovered: ${agent.name}`);
            } else {
                console.log(`⚠️ Not found: ${agent.name} (will be created)`);
            }
        }
        
        console.log(`🎬 Executive Producer: Discovered ${discoveredAgents} active agents`);
        return discoveredAgents;
    }

    /**
     * Set up communication channels between agents
     */
    setupCommunicationChannels() {
        // Create event bus for agent communication
        if (!window.theaterEventBus) {
            window.theaterEventBus = {
                events: new Map(),
                subscribe: (event, callback) => {
                    if (!window.theaterEventBus.events.has(event)) {
                        window.theaterEventBus.events.set(event, []);
                    }
                    window.theaterEventBus.events.get(event).push(callback);
                },
                publish: (event, data) => {
                    if (window.theaterEventBus.events.has(event)) {
                        window.theaterEventBus.events.get(event).forEach(callback => {
                            try {
                                callback(data);
                            } catch (error) {
                                console.warn(`Event callback error for ${event}:`, error);
                            }
                        });
                    }
                }
            };
        }
        
        // Subscribe to key events
        window.theaterEventBus.subscribe('agent:created', (data) => this.onAgentCreated(data));
        window.theaterEventBus.subscribe('agent:error', (data) => this.onAgentError(data));
        window.theaterEventBus.subscribe('production:milestone', (data) => this.onMilestoneReached(data));
        
        console.log('🎬 Executive Producer: Communication channels established');
    }

    /**
     * Initialize project templates for different types of productions
     */
    initializeProjectTemplates() {
        this.projectTemplates = {
            'classic-drama': {
                name: 'Classic Drama',
                duration: 20,
                phases: {
                    development: 4,
                    preProduction: 4,
                    design: 4,
                    technical: 4,
                    rehearsal: 4
                },
                requiredAgents: ['ai-playwright', 'creative-director', 'script-editor', 'dramaturge'],
                budget: 100000,
                complexity: 'medium'
            },
            'musical-theater': {
                name: 'Musical Theater',
                duration: 24,
                phases: {
                    development: 6,
                    preProduction: 6,
                    design: 4,
                    technical: 4,
                    rehearsal: 4
                },
                requiredAgents: ['ai-playwright', 'music-director', 'choreographer', 'voice-coach'],
                budget: 150000,
                complexity: 'high'
            },
            'experimental': {
                name: 'Experimental Theater',
                duration: 16,
                phases: {
                    development: 4,
                    preProduction: 3,
                    design: 3,
                    technical: 3,
                    rehearsal: 3
                },
                requiredAgents: ['creative-director', 'improvisation-partner', 'projection-designer'],
                budget: 75000,
                complexity: 'variable'
            }
        };
        
        console.log('🎬 Executive Producer: Project templates initialized');
    }

    /**
     * Start a new theatrical production
     */
    async startProduction(productionConfig) {
        try {
            console.log('🎬 Executive Producer: Starting new production...');
            
            const production = {
                id: `production_${Date.now()}`,
                title: productionConfig.title || 'Untitled Production',
                type: productionConfig.type || 'classic-drama',
                template: this.projectTemplates[productionConfig.type] || this.projectTemplates['classic-drama'],
                startDate: new Date(),
                targetDate: productionConfig.targetDate,
                budget: productionConfig.budget,
                requirements: productionConfig.requirements || {},
                status: 'development',
                agents: new Set(),
                milestones: []
            };
            
            // Store as current production
            this.projectState.currentProduction = production;
            this.projectState.phase = 'development';
            this.projectState.startDate = production.startDate;
            this.projectState.currentWeek = 1;
            this.projectState.totalWeeks = production.template.duration;
            
            // Create development milestone
            this.addMilestone({
                name: 'Development Phase Start',
                date: production.startDate,
                phase: 'development',
                required: true,
                completed: true
            });
            
            // Allocate required agents
            await this.allocateAgentsForProduction(production);
            
            // Create initial project brief using AI
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                await this.generateProjectBrief(production);
            }
            
            // Notify all systems
            window.theaterEventBus?.publish('production:started', {
                production: production,
                phase: 'development',
                executiveProducer: this.config.name
            });
            
            console.log(`🎬 Executive Producer: Production "${production.title}" started successfully`);
            return production;
            
        } catch (error) {
            console.error('🎬 Executive Producer: Failed to start production:', error);
            throw new Error(`Production startup failed: ${error.message}`);
        }
    }

    /**
     * Allocate required agents for a production
     */
    async allocateAgentsForProduction(production) {
        console.log('🎬 Executive Producer: Allocating agents for production...');
        
        const requiredAgents = production.template.requiredAgents;
        const allocatedAgents = [];
        
        for (const agentKey of requiredAgents) {
            if (this.managedAgents.has(agentKey)) {
                const agent = this.managedAgents.get(agentKey);
                agent.status = 'allocated';
                agent.production = production.id;
                allocatedAgents.push(agentKey);
                production.agents.add(agentKey);
                console.log(`✅ Allocated: ${agent.name} to production`);
            } else {
                console.warn(`⚠️ Required agent not available: ${agentKey}`);
                // Add to creation queue
                this.queueAgentCreation(agentKey, production.id);
            }
        }
        
        console.log(`🎬 Executive Producer: Allocated ${allocatedAgents.length}/${requiredAgents.length} agents`);
        return allocatedAgents;
    }

    /**
     * Generate project brief using AI
     */
    async generateProjectBrief(production) {
        try {
            console.log('🎬 Executive Producer: Generating AI-powered project brief...');
            
            const briefPrompt = `
            As an Executive Producer, create a comprehensive project brief for a new ${production.type} production:
            
            Title: ${production.title}
            Budget: $${production.budget?.toLocaleString() || 'TBD'}
            Timeline: ${production.template.duration} weeks
            
            Please provide:
            1. Creative vision and artistic goals
            2. Target audience and market positioning
            3. Key creative challenges and opportunities
            4. Resource requirements and constraints
            5. Success metrics and evaluation criteria
            6. Risk assessment and mitigation strategies
            
            Format as a professional production brief that will guide all creative and technical teams.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(briefPrompt, {
                temperature: 0.7,
                max_tokens: 1000,
                timeout: 20000
            });
            
            if (response && response.content) {
                production.brief = response.content;
                console.log('✅ Executive Producer: Project brief generated successfully');
                
                // Store in project files
                this.saveProjectBrief(production);
            }
            
        } catch (error) {
            console.warn('⚠️ Executive Producer: Failed to generate project brief:', error.message);
            // Continue without AI-generated brief
            production.brief = `Production Brief for ${production.title}\nType: ${production.type}\nGenerated: ${new Date().toLocaleDateString()}`;
        }
    }

    /**
     * Save project brief to files
     */
    saveProjectBrief(production) {
        // Store project brief in state for other agents to access
        if (this.stageState) {
            if (!this.stageState.productions) {
                this.stageState.productions = new Map();
            }
            this.stageState.productions.set(production.id, {
                ...production,
                briefGeneratedAt: new Date(),
                managedBy: 'executive-producer'
            });
        }
        
        console.log('📝 Executive Producer: Project brief saved to state management');
    }

    /**
     * Add milestone to current production
     */
    addMilestone(milestone) {
        if (this.projectState.currentProduction) {
            milestone.id = `milestone_${Date.now()}`;
            milestone.createdAt = new Date();
            this.projectState.milestones.push(milestone);
            this.projectState.currentProduction.milestones.push(milestone);
            
            console.log(`📅 Executive Producer: Milestone added - ${milestone.name}`);
            
            // Notify other agents
            window.theaterEventBus?.publish('production:milestone', {
                milestone: milestone,
                production: this.projectState.currentProduction,
                phase: this.projectState.phase
            });
        }
    }

    /**
     * Queue agent creation for missing required agents
     */
    queueAgentCreation(agentKey, productionId) {
        if (!this.agentCreationQueue) {
            this.agentCreationQueue = [];
        }
        
        this.agentCreationQueue.push({
            agentKey: agentKey,
            productionId: productionId,
            requestedAt: new Date(),
            priority: this.getPriorityForAgent(agentKey)
        });
        
        console.log(`📋 Executive Producer: Queued creation of ${agentKey} for production ${productionId}`);
    }

    /**
     * Get department for agent type
     */
    getDepartmentForAgent(agentKey) {
        for (const [dept, agents] of Object.entries(this.agentHierarchy)) {
            if (agents.includes(agentKey)) {
                return dept;
            }
        }
        return 'general';
    }

    /**
     * Get priority for agent type
     */
    getPriorityForAgent(agentKey) {
        const priorities = {
            'creative-director': 90,
            'ai-playwright': 80,
            'technical-director': 85,
            'script-editor': 70,
            'assistant-director': 75
        };
        return priorities[agentKey] || 50;
    }

    /**
     * Handle agent creation events
     */
    onAgentCreated(data) {
        console.log(`🎬 Executive Producer: New agent created - ${data.agentType}`);
        
        // Register the new agent
        if (data.instance) {
            this.managedAgents.set(data.agentType, {
                instance: data.instance,
                name: data.name || data.agentType,
                status: 'available',
                department: this.getDepartmentForAgent(data.agentType),
                priority: this.getPriorityForAgent(data.agentType),
                createdAt: new Date()
            });
            
            // Check if this agent was needed for current production
            if (this.projectState.currentProduction) {
                const requiredAgents = this.projectState.currentProduction.template.requiredAgents;
                if (requiredAgents.includes(data.agentType)) {
                    this.allocateAgentToProduction(data.agentType, this.projectState.currentProduction.id);
                }
            }
        }
    }

    /**
     * Handle agent error events
     */
    onAgentError(data) {
        console.error(`🎬 Executive Producer: Agent error reported - ${data.agentType}:`, data.error);
        
        // Update agent status
        if (this.managedAgents.has(data.agentType)) {
            const agent = this.managedAgents.get(data.agentType);
            agent.status = 'error';
            agent.lastError = data.error;
            agent.errorTime = new Date();
            
            // Determine if this affects current production
            if (agent.production === this.projectState.currentProduction?.id) {
                console.warn(`⚠️ Executive Producer: Production agent error - may impact timeline`);
                this.assessProductionImpact(data.agentType, data.error);
            }
        }
    }

    /**
     * Handle milestone completion
     */
    onMilestoneReached(data) {
        console.log(`🎬 Executive Producer: Milestone reached - ${data.milestone.name}`);
        
        // Update milestone status
        const milestone = this.projectState.milestones.find(m => m.id === data.milestone.id);
        if (milestone) {
            milestone.completed = true;
            milestone.completedAt = new Date();
            
            // Check if this triggers phase transition
            this.checkPhaseTransition();
        }
    }

    /**
     * Check if current phase should transition to next
     */
    checkPhaseTransition() {
        if (!this.projectState.currentProduction) return;
        
        const currentPhase = this.projectState.phase;
        const phaseConfig = this.projectState.currentProduction.template.phases;
        
        // Check if current phase milestones are complete
        const phaseMilestones = this.projectState.milestones.filter(m => m.phase === currentPhase);
        const completedMilestones = phaseMilestones.filter(m => m.completed);
        
        if (phaseMilestones.length > 0 && completedMilestones.length === phaseMilestones.length) {
            this.transitionToNextPhase();
        }
    }

    /**
     * Transition to next production phase
     */
    transitionToNextPhase() {
        const phaseOrder = ['development', 'preProduction', 'design', 'technical', 'rehearsal', 'performance'];
        const currentIndex = phaseOrder.indexOf(this.projectState.phase);
        
        if (currentIndex < phaseOrder.length - 1) {
            const nextPhase = phaseOrder[currentIndex + 1];
            this.projectState.phase = nextPhase;
            
            console.log(`🎬 Executive Producer: Transitioning to ${nextPhase} phase`);
            
            // Add phase start milestone
            this.addMilestone({
                name: `${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)} Phase Start`,
                date: new Date(),
                phase: nextPhase,
                required: true,
                completed: true
            });
            
            // Notify all agents of phase change
            window.theaterEventBus?.publish('production:phase-change', {
                previousPhase: phaseOrder[currentIndex],
                newPhase: nextPhase,
                production: this.projectState.currentProduction,
                week: this.projectState.currentWeek
            });
        }
    }

    /**
     * Get current production status
     */
    getProductionStatus() {
        return {
            production: this.projectState.currentProduction,
            phase: this.projectState.phase,
            week: this.projectState.currentWeek,
            totalWeeks: this.projectState.totalWeeks,
            progress: (this.projectState.currentWeek / this.projectState.totalWeeks) * 100,
            agents: Array.from(this.managedAgents.keys()),
            milestones: this.projectState.milestones,
            budget: this.projectState.budget
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎬 Executive Producer: Shutting down production management...');
        
        // Notify all managed agents
        this.managedAgents.forEach((agent, key) => {
            if (agent.instance && typeof agent.instance.onProductionEnd === 'function') {
                try {
                    agent.instance.onProductionEnd();
                } catch (error) {
                    console.warn(`Failed to notify agent ${key} of production end:`, error);
                }
            }
        });
        
        // Clear production state
        this.projectState.currentProduction = null;
        this.projectState.phase = 'idle';
        
        console.log('🎬 Executive Producer: Shutdown complete');
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExecutiveProducerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.ExecutiveProducerAgent = ExecutiveProducerAgent;
}