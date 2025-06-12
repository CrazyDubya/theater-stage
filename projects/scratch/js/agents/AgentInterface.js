/**
 * AgentInterface.js - Base Agent Interface for Theater Control
 * 
 * Provides a standardized interface for AI agents to control the 3D theater stage.
 * Includes utilities for common operations, state monitoring, and coordination.
 */

class BaseAgent {
    constructor(agentId, config = {}) {
        this.agentId = agentId;
        this.config = {
            name: config.name || `Agent-${agentId}`,
            role: config.role || 'general',
            priority: config.priority || 1,
            maxActionsPerSecond: config.maxActionsPerSecond || 10,
            ...config
        };
        
        this.isActive = false;
        this.actionQueue = [];
        this.subscriptions = new Set();
        this.stateCache = new Map();
        this.lastActionTime = 0;
        
        // Performance tracking
        this.stats = {
            actionsExecuted: 0,
            errors: 0,
            startTime: Date.now(),
            lastActivity: Date.now()
        };
        
        console.log(`🤖 Agent ${this.agentId} (${this.config.name}) initialized`);
    }

    /**
     * Initialize the agent and connect to theater API
     */
    async initialize() {
        try {
            // Wait for theater API to be available
            await this.waitForAPI();
            
            // Subscribe to relevant events
            this.setupEventSubscriptions();
            
            // Set up action processing loop
            this.startActionLoop();
            
            // Initialize agent-specific logic
            await this.onInitialize();
            
            this.isActive = true;
            console.log(`🤖 Agent ${this.agentId} activated`);
            
        } catch (error) {
            console.error(`🤖 Agent ${this.agentId} initialization failed:`, error);
            throw error;
        }
    }

    /**
     * Wait for theater API to be available
     */
    async waitForAPI() {
        return new Promise((resolve, reject) => {
            const checkAPI = () => {
                if (window.theaterAPI && window.theaterAPIMiddleware?.isInitialized) {
                    console.log('🤖 Agent: Theater API ready for agent initialization');
                    resolve();
                } else {
                    console.log('🤖 Agent: Waiting for Theater API...', {
                        theaterAPI: !!window.theaterAPI,
                        middleware: !!window.theaterAPIMiddleware,
                        middlewareInit: window.theaterAPIMiddleware?.isInitialized
                    });
                    setTimeout(checkAPI, 100);
                }
            };
            
            checkAPI();
            
            const timeout = this.config.timeout || 10000;
            setTimeout(() => {
                reject(new Error(`Theater API not available after ${timeout/1000} seconds`));
            }, timeout);
        });
    }

    /**
     * Setup event subscriptions
     */
    setupEventSubscriptions() {
        const defaultEvents = [
            'actors:update',
            'actor:created',
            'actor:moved',
            'state:snapshot',
            'lighting:changed'
        ];
        
        // Subscribe to events
        window.theaterAPI.subscribe(this.agentId, defaultEvents);
        this.subscriptions = new Set(defaultEvents);
        
        // Listen for events
        window.addEventListener('theater-api-message', (event) => {
            if (event.detail.agentId === this.agentId) {
                this.handleEvent(event.detail.data);
            }
        });
    }

    /**
     * Handle incoming events
     */
    handleEvent(eventData) {
        const { event, data, timestamp } = eventData;
        
        // Update state cache
        this.updateStateCache(event, data);
        
        // Call agent-specific event handler
        this.onEvent(event, data, timestamp);
    }

    /**
     * Update internal state cache
     */
    updateStateCache(event, data) {
        this.stateCache.set(event, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Start action processing loop
     */
    startActionLoop() {
        const processActions = async () => {
            if (this.isActive && this.actionQueue.length > 0) {
                await this.processActionQueue();
            }
            
            // Continue loop
            if (this.isActive) {
                setTimeout(processActions, 100); // Process every 100ms
            }
        };
        
        processActions();
    }

    /**
     * Process queued actions with rate limiting
     */
    async processActionQueue() {
        const now = Date.now();
        const timeSinceLastAction = now - this.lastActionTime;
        const minInterval = 1000 / this.config.maxActionsPerSecond;
        
        if (timeSinceLastAction < minInterval) {
            return; // Rate limited
        }
        
        const action = this.actionQueue.shift();
        if (!action) return;
        
        try {
            await this.executeAction(action);
            this.stats.actionsExecuted++;
            this.stats.lastActivity = now;
            this.lastActionTime = now;
            
        } catch (error) {
            console.error(`🤖 Agent ${this.agentId} action failed:`, error);
            this.stats.errors++;
            
            // Retry logic for failed actions
            if (action.retries < (action.maxRetries || 3)) {
                action.retries = (action.retries || 0) + 1;
                this.actionQueue.unshift(action); // Retry at front of queue
            }
        }
    }

    /**
     * Execute a single action
     */
    async executeAction(action) {
        const { method, path, data } = action;
        
        if (!window.theaterAPI) {
            throw new Error('Theater API not available');
        }
        
        let result;
        
        // Use the correct API method based on HTTP method
        switch (method.toUpperCase()) {
            case 'GET':
                result = await window.theaterAPI.get(path);
                break;
            case 'POST':
                result = await window.theaterAPI.post(path, data);
                break;
            case 'PUT':
                result = await window.theaterAPI.put(path, data);
                break;
            case 'DELETE':
                result = await window.theaterAPI.delete(path);
                break;
            case 'PATCH':
                result = await window.theaterAPI.patch(path, data);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${method}`);
        }
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // Call action completion callback if provided
        if (action.onComplete) {
            action.onComplete(result.data);
        }
        
        return result.data;
    }

    // === UTILITY METHODS FOR COMMON OPERATIONS ===

    /**
     * Queue an action for execution
     */
    queueAction(method, path, data = null, options = {}) {
        const action = {
            method,
            path,
            data,
            timestamp: Date.now(),
            retries: 0,
            maxRetries: options.maxRetries || 3,
            onComplete: options.onComplete
        };
        
        if (options.priority === 'high') {
            this.actionQueue.unshift(action); // Add to front
        } else {
            this.actionQueue.push(action); // Add to back
        }
    }

    /**
     * Get current theater state
     */
    async getState() {
        const result = await window.theaterAPI.get('/api/state');
        return result.data;
    }

    /**
     * Get all actors
     */
    async getActors() {
        const result = await window.theaterAPI.get('/api/actors');
        return result.data;
    }

    /**
     * Create a new actor
     */
    async createActor(x = 0, z = 0, type = 'human_male') {
        const result = await window.theaterAPI.post('/api/actors', { x, z, type });
        return result.data;
    }

    /**
     * Move actor to position
     */
    moveActor(actorId, x, z, options = {}) {
        this.queueAction('PUT', `/api/actors/${actorId}/position`, { x, z }, options);
    }

    /**
     * Move actor to stage marker
     */
    moveActorToMarker(actorId, markerIndex, options = {}) {
        this.queueAction('PUT', `/api/actors/${actorId}/move-to-marker`, { markerIndex }, options);
    }

    /**
     * Set lighting preset
     */
    setLighting(preset, options = {}) {
        this.queueAction('PUT', '/api/stage/lighting', { preset }, options);
    }

    /**
     * Set camera view
     */
    setCamera(preset, options = {}) {
        this.queueAction('PUT', '/api/stage/camera', { preset }, options);
    }

    /**
     * Toggle curtains
     */
    toggleCurtains(options = {}) {
        this.queueAction('PUT', '/api/stage/curtains', {}, options);
    }

    /**
     * Select actors
     */
    selectActors(actorIds, options = {}) {
        this.queueAction('POST', '/api/actors/select', { actorIds }, options);
    }

    /**
     * Get agent statistics
     */
    getStats() {
        const uptime = Date.now() - this.stats.startTime;
        const actionsPerMinute = this.stats.actionsExecuted / (uptime / 60000);
        
        return {
            ...this.stats,
            uptime,
            actionsPerMinute: actionsPerMinute.toFixed(2),
            queueLength: this.actionQueue.length,
            subscriptions: Array.from(this.subscriptions),
            cacheSize: this.stateCache.size
        };
    }

    /**
     * Stop the agent
     */
    stop() {
        this.isActive = false;
        this.actionQueue = [];
        console.log(`🤖 Agent ${this.agentId} stopped`);
    }

    // === ABSTRACT METHODS (to be implemented by subclasses) ===

    /**
     * Agent-specific initialization logic
     */
    async onInitialize() {
        // Override in subclasses
    }

    /**
     * Handle theater events
     */
    onEvent(event, data, timestamp) {
        // Override in subclasses
    }

    /**
     * Agent main logic loop (called periodically)
     */
    async onUpdate(deltaTime) {
        // Override in subclasses
    }
}

/**
 * Agent Manager - Coordinates multiple agents
 */
class AgentManager {
    constructor() {
        this.agents = new Map();
        this.isActive = false;
        this.updateInterval = null;
        this.lastUpdateTime = Date.now();
        
        console.log('🤖 AgentManager initialized');
    }

    /**
     * Register a new agent
     */
    async registerAgent(agent) {
        if (this.agents.has(agent.agentId)) {
            throw new Error(`Agent ${agent.agentId} already registered`);
        }
        
        this.agents.set(agent.agentId, agent);
        await agent.initialize();
        
        console.log(`🤖 Agent ${agent.agentId} registered and initialized`);
        return agent;
    }

    /**
     * Remove an agent
     */
    removeAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.stop();
            this.agents.delete(agentId);
            console.log(`🤖 Agent ${agentId} removed`);
        }
    }

    /**
     * Start the agent management system
     */
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.lastUpdateTime = Date.now();
        
        // Start update loop
        this.updateInterval = setInterval(() => {
            this.update();
        }, 100); // Update every 100ms
        
        console.log('🤖 AgentManager started');
    }

    /**
     * Stop the agent management system
     */
    stop() {
        this.isActive = false;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Stop all agents
        for (const agent of this.agents.values()) {
            agent.stop();
        }
        
        console.log('🤖 AgentManager stopped');
    }

    /**
     * Update all agents
     */
    async update() {
        if (!this.isActive) return;
        
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // Update each active agent
        for (const agent of this.agents.values()) {
            if (agent.isActive) {
                try {
                    await agent.onUpdate(deltaTime);
                } catch (error) {
                    console.error(`🤖 Agent ${agent.agentId} update error:`, error);
                }
            }
        }
    }

    /**
     * Get all agent statistics
     */
    getAllStats() {
        const stats = {};
        for (const [agentId, agent] of this.agents) {
            stats[agentId] = agent.getStats();
        }
        return stats;
    }

    /**
     * Broadcast message to all agents
     */
    broadcast(message) {
        for (const agent of this.agents.values()) {
            agent.handleEvent({
                event: 'manager:broadcast',
                data: message,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get agent by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }

    /**
     * Get all agents
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
}

// Create global instances
const agentManager = new AgentManager();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.BaseAgent = BaseAgent;
    window.AgentManager = AgentManager;
    window.agentManager = agentManager;
    console.log('🤖 Agent system loaded - BaseAgent and AgentManager available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BaseAgent, AgentManager, agentManager };
}