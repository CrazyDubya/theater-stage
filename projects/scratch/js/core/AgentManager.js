/**
 * AgentManager.js - Central coordination system for all theater agents
 * 
 * Manages the lifecycle and coordination of all theater production agents:
 * - Agent registration and discovery
 * - Production workflow orchestration
 * - Inter-agent communication facilitation
 * - System health monitoring
 * - Performance analytics
 */

class AgentManager {
    constructor() {
        this.agents = new Map();
        this.agentsByRole = new Map();
        this.productions = new Map();
        this.workflows = new Map();
        
        this.state = {
            initialized: false,
            activeProductions: 0,
            totalAgents: 0,
            healthStatus: 'unknown'
        };
        
        this.metrics = {
            agentConnections: 0,
            eventCount: 0,
            productionCount: 0,
            systemUptime: 0
        };
        
        console.log('AgentManager: Theater production coordination system created');
    }
    
    /**
     * Initialize the agent management system
     */
    async initialize() {
        try {
            console.log('AgentManager: Initializing theater production system...');
            
            // Ensure core systems are available
            await this.ensureCoreSystemsReady();
            
            // Set up agent discovery
            this.setupAgentDiscovery();
            
            // Set up production workflows
            this.setupProductionWorkflows();
            
            // Start monitoring
            this.startSystemMonitoring();
            
            this.state.initialized = true;
            this.metrics.systemUptime = Date.now();
            
            console.log('✅ AgentManager: Theater production system ready');
            return true;
            
        } catch (error) {
            console.error('❌ AgentManager: Initialization failed:', error);
            return false;
        }
    }
    
    /**
     * Ensure core systems are ready
     */
    async ensureCoreSystemsReady() {
        // Check EventBus
        if (!window.theaterEventBus) {
            throw new Error('EventBus not available - required for agent communication');
        }
        
        // Check Ollama interface
        if (!window.ollamaTheaterInterface) {
            console.warn('OllamaTheaterInterface not available - agents will run in limited mode');
        } else if (!window.ollamaTheaterInterface.isInitialized) {
            await window.ollamaTheaterInterface.initialize();
        }
        
        console.log('AgentManager: Core systems verified');
    }
    
    /**
     * Set up agent discovery and registration
     */
    setupAgentDiscovery() {
        // Listen for agent initialization
        window.theaterEventBus.subscribe('agent:ready', (data) => this.onAgentReady(data));
        window.theaterEventBus.subscribe('agent:connected', (data) => this.onAgentConnected(data));
        window.theaterEventBus.subscribe('agent:error', (data) => this.onAgentError(data));
        
        console.log('AgentManager: Agent discovery configured');
    }
    
    /**
     * Set up production workflow management
     */
    setupProductionWorkflows() {
        // Define standard production workflow
        this.workflows.set('standard_production', {
            phases: [
                'development',      // Script, concept, planning
                'pre_production',   // Design, casting, preparation
                'rehearsal',        // Training, integration, refinement
                'technical',        // Tech rehearsals, integration
                'performance',      // Live performances
                'post_production'   // Cleanup, archival, analysis
            ],
            transitions: {
                'development -> pre_production': 'script_approved',
                'pre_production -> rehearsal': 'designs_approved',
                'rehearsal -> technical': 'blocking_complete',
                'technical -> performance': 'tech_approved',
                'performance -> post_production': 'run_complete'
            }
        });
        
        console.log('AgentManager: Production workflows configured');
    }
    
    /**
     * Register an agent
     */
    registerAgent(agent) {
        if (!agent.id || !agent.config) {
            console.error('AgentManager: Invalid agent registration - missing id or config');
            return false;
        }
        
        // Register by ID
        this.agents.set(agent.id, agent);
        
        // Register by role
        const role = agent.config.role;
        if (!this.agentsByRole.has(role)) {
            this.agentsByRole.set(role, []);
        }
        this.agentsByRole.get(role).push(agent);
        
        this.state.totalAgents = this.agents.size;
        
        console.log(`AgentManager: Agent registered - ${agent.config.name} (${role})`);
        
        // Auto-connect to related agents
        this.facilitateAgentConnections(agent);
        
        return true;
    }
    
    /**
     * Facilitate connections between related agents
     */
    facilitateAgentConnections(newAgent) {
        const role = newAgent.config.role;
        
        // Define connection patterns
        const connectionPatterns = {
            'creative-director': ['executive-producer', 'ai-playwright', 'production-designer'],
            'technical-director': ['executive-producer', 'stage-manager', 'lighting-designer', 'sound-designer'],
            'voice-coach': ['movement-coach', 'dialect-coach', 'method-acting-coach'],
            'lighting-designer': ['production-designer', 'costume-designer', 'makeup-artist'],
            'sound-designer': ['music-director', 'music-composer', 'technical-director'],
            'costume-designer': ['makeup-artist', 'production-designer', 'set-designer'],
            'choreographer': ['movement-coach', 'music-director', 'stage-manager'],
            'stage-manager': ['technical-director', 'assistant-director', 'fight-choreographer']
        };
        
        const relatedRoles = connectionPatterns[role] || [];
        
        relatedRoles.forEach(targetRole => {
            const targetAgents = this.agentsByRole.get(targetRole) || [];
            targetAgents.forEach(targetAgent => {
                this.connectAgents(newAgent, targetAgent);
            });
        });
    }
    
    /**
     * Connect two agents
     */
    connectAgents(agent1, agent2) {
        try {
            // Convert role to property name (e.g., 'creative-director' -> 'creativeDirector')
            const propName1 = this.roleToPropertyName(agent2.config.role);
            const propName2 = this.roleToPropertyName(agent1.config.role);
            
            // Use BaseAgent's connectToAgent method if available
            if (agent1.connectToAgent) {
                agent1.connectToAgent(propName1, agent2);
            } else {
                agent1[propName1] = agent2;
            }
            
            if (agent2.connectToAgent) {
                agent2.connectToAgent(propName2, agent1);
            } else {
                agent2[propName2] = agent1;
            }
            
            this.metrics.agentConnections++;
            
            console.log(`AgentManager: Connected ${agent1.config.name} ↔ ${agent2.config.name}`);
            
        } catch (error) {
            console.warn(`AgentManager: Failed to connect agents:`, error);
        }
    }
    
    /**
     * Convert role to property name
     */
    roleToPropertyName(role) {
        return role.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
    }
    
    /**
     * Start a new production
     */
    async startProduction(productionConfig) {
        try {
            console.log(`AgentManager: Starting production "${productionConfig.title}"`);
            
            const production = {
                id: `prod_${Date.now()}`,
                ...productionConfig,
                status: 'development',
                startedAt: new Date(),
                agents: new Set(),
                workflow: this.workflows.get('standard_production')
            };
            
            this.productions.set(production.id, production);
            this.state.activeProductions++;
            this.metrics.productionCount++;
            
            // Notify all agents
            window.theaterEventBus.publish('production:started', {
                production: production
            });
            
            // Initialize agent projects
            for (const agent of this.agents.values()) {
                if (agent.initializeProject) {
                    agent.initializeProject(production);
                }
                production.agents.add(agent.id);
            }
            
            console.log(`✅ AgentManager: Production "${production.title}" started with ${production.agents.size} agents`);
            
            return production;
            
        } catch (error) {
            console.error('AgentManager: Failed to start production:', error);
            return null;
        }
    }
    
    /**
     * Get system status
     */
    getSystemStatus() {
        const agentStats = {};
        
        // Calculate per-role statistics
        for (const [role, agents] of this.agentsByRole) {
            agentStats[role] = {
                count: agents.length,
                active: agents.filter(a => a.state?.running).length,
                errors: agents.filter(a => a.state?.errors?.length > 0).length
            };
        }
        
        return {
            state: this.state,
            metrics: {
                ...this.metrics,
                uptime: this.state.initialized ? Date.now() - this.metrics.systemUptime : 0
            },
            agents: {
                total: this.agents.size,
                byRole: agentStats,
                connections: this.metrics.agentConnections
            },
            productions: {
                active: this.state.activeProductions,
                total: this.metrics.productionCount,
                list: Array.from(this.productions.values()).map(p => ({
                    id: p.id,
                    title: p.title,
                    status: p.status,
                    agentCount: p.agents.size
                }))
            }
        };
    }
    
    /**
     * Start system monitoring
     */
    startSystemMonitoring() {
        // Health check every 30 seconds
        setInterval(() => {
            this.performHealthCheck();
        }, 30000);
        
        // Metrics collection every 5 minutes
        setInterval(() => {
            this.collectMetrics();
        }, 300000);
        
        console.log('AgentManager: System monitoring started');
    }
    
    /**
     * Perform system health check
     */
    performHealthCheck() {
        const totalAgents = this.agents.size;
        const activeAgents = Array.from(this.agents.values())
            .filter(agent => agent.state?.running).length;
        
        const healthRatio = totalAgents > 0 ? activeAgents / totalAgents : 0;
        
        if (healthRatio >= 0.9) {
            this.state.healthStatus = 'healthy';
        } else if (healthRatio >= 0.7) {
            this.state.healthStatus = 'degraded';
        } else {
            this.state.healthStatus = 'unhealthy';
        }
        
        if (this.state.healthStatus !== 'healthy') {
            console.warn(`AgentManager: System health: ${this.state.healthStatus} (${activeAgents}/${totalAgents} agents active)`);
        }
    }
    
    /**
     * Collect system metrics
     */
    collectMetrics() {
        const eventBusStats = window.theaterEventBus?.getStats();
        if (eventBusStats) {
            this.metrics.eventCount = eventBusStats.totalEvents;
        }
        
        // Log summary
        console.log('AgentManager: System metrics -', {
            agents: this.agents.size,
            productions: this.state.activeProductions,
            connections: this.metrics.agentConnections,
            events: this.metrics.eventCount,
            health: this.state.healthStatus
        });
    }
    
    /**
     * Event handlers
     */
    onAgentReady(data) {
        console.log(`AgentManager: Agent ready - ${data.agent}`);
    }
    
    onAgentConnected(data) {
        console.log(`AgentManager: Agent connection - ${data.sourceAgent} → ${data.targetAgent}`);
    }
    
    onAgentError(data) {
        console.warn(`AgentManager: Agent error - ${data.agent}: ${data.message}`);
    }
}

// Create singleton instance
const theaterAgentManager = new AgentManager();

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AgentManager, theaterAgentManager };
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.AgentManager = AgentManager;
    window.theaterAgentManager = theaterAgentManager;
    console.log('Theater Agent Manager ready for production coordination');
}