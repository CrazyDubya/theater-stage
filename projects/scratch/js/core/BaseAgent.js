/**
 * BaseAgent.js - Foundation class for all theater agents
 * 
 * Provides core functionality that all agents inherit:
 * - State management
 * - Event bus integration
 * - Lifecycle management
 * - Error handling
 * - Performance metrics
 * 
 * This will be enhanced incrementally as we discover common patterns
 * across the agent implementations.
 */

class BaseAgent {
    constructor(id, config = {}) {
        // Core identification
        this.id = id;
        this.config = {
            name: config.name || id,
            role: config.role || 'agent',
            priority: config.priority || 50,
            maxActionsPerSecond: config.maxActionsPerSecond || 10,
            personality: config.personality || 'professional',
            ...config
        };
        
        // State management
        this.state = {
            status: 'created',
            initialized: false,
            running: false,
            lastAction: null,
            actionCount: 0,
            errors: []
        };
        
        // Performance tracking
        this.metrics = {
            totalActions: 0,
            successfulActions: 0,
            failedActions: 0,
            averageResponseTime: 0,
            startTime: null,
            uptime: 0
        };
        
        // Event handling
        this.eventSubscriptions = new Map();
        this.pendingEvents = [];
        
        // Lifecycle hooks (to be implemented by subclasses)
        this.lifecycleHooks = {
            onInitialize: this.onInitialize.bind(this),
            onStart: this.onStart.bind(this),
            onStop: this.onStop.bind(this),
            onError: this.onError.bind(this),
            onAction: this.onAction.bind(this)
        };
        
        console.log(`[${this.config.name}] Agent created with role: ${this.config.role}`);
    }
    
    /**
     * Initialize the agent
     */
    async initialize() {
        try {
            console.log(`[${this.config.name}] Initializing...`);
            this.state.status = 'initializing';
            
            // Connect to event bus if available
            if (window.theaterEventBus) {
                this.connectToEventBus();
            }
            
            // Call subclass initialization
            await this.onInitialize();
            
            this.state.initialized = true;
            this.state.status = 'ready';
            console.log(`[${this.config.name}] Initialization complete`);
            
            return true;
        } catch (error) {
            this.handleError('Initialization failed', error);
            return false;
        }
    }
    
    /**
     * Start the agent
     */
    async start() {
        if (!this.state.initialized) {
            console.warn(`[${this.config.name}] Cannot start - not initialized`);
            return false;
        }
        
        try {
            console.log(`[${this.config.name}] Starting...`);
            this.state.status = 'starting';
            this.metrics.startTime = Date.now();
            
            // Call subclass start logic
            await this.onStart();
            
            this.state.running = true;
            this.state.status = 'active';
            console.log(`[${this.config.name}] Started successfully`);
            
            // Start processing events
            this.startEventProcessing();
            
            return true;
        } catch (error) {
            this.handleError('Start failed', error);
            return false;
        }
    }
    
    /**
     * Stop the agent
     */
    async stop() {
        try {
            console.log(`[${this.config.name}] Stopping...`);
            this.state.status = 'stopping';
            this.state.running = false;
            
            // Stop event processing
            this.stopEventProcessing();
            
            // Call subclass stop logic
            await this.onStop();
            
            this.state.status = 'stopped';
            this.metrics.uptime = Date.now() - this.metrics.startTime;
            console.log(`[${this.config.name}] Stopped successfully`);
            
            return true;
        } catch (error) {
            this.handleError('Stop failed', error);
            return false;
        }
    }
    
    /**
     * Connect to the theater event bus
     */
    connectToEventBus() {
        if (!window.theaterEventBus) {
            console.warn(`[${this.config.name}] Event bus not available`);
            return;
        }
        
        // Subscribe to agent-specific channel
        this.subscribeToEvent(`agent:${this.id}`, (data) => this.handleDirectMessage(data));
        
        // Subscribe to role-based channel
        this.subscribeToEvent(`role:${this.config.role}`, (data) => this.handleRoleMessage(data));
        
        // Subscribe to broadcast channel
        this.subscribeToEvent('broadcast:all', (data) => this.handleBroadcast(data));
        
        console.log(`[${this.config.name}] Connected to event bus`);
    }
    
    /**
     * Subscribe to an event
     */
    subscribeToEvent(eventName, handler) {
        if (!window.theaterEventBus) return;
        
        const subscription = window.theaterEventBus.subscribe(eventName, handler);
        this.eventSubscriptions.set(eventName, subscription);
        
        return subscription;
    }
    
    /**
     * Publish an event
     */
    publishEvent(eventName, data) {
        if (!window.theaterEventBus) {
            console.warn(`[${this.config.name}] Cannot publish - event bus not available`);
            return;
        }
        
        window.theaterEventBus.publish(eventName, {
            ...data,
            source: this.id,
            timestamp: Date.now()
        });
        
        this.metrics.totalActions++;
    }
    
    /**
     * Handle direct messages to this agent
     */
    handleDirectMessage(data) {
        console.log(`[${this.config.name}] Received direct message:`, data);
        this.pendingEvents.push({ type: 'direct', data });
    }
    
    /**
     * Handle role-based messages
     */
    handleRoleMessage(data) {
        console.log(`[${this.config.name}] Received role message:`, data);
        this.pendingEvents.push({ type: 'role', data });
    }
    
    /**
     * Handle broadcast messages
     */
    handleBroadcast(data) {
        console.log(`[${this.config.name}] Received broadcast:`, data);
        this.pendingEvents.push({ type: 'broadcast', data });
    }
    
    /**
     * Start processing events
     */
    startEventProcessing() {
        if (this.eventProcessor) return;
        
        this.eventProcessor = setInterval(() => {
            this.processEvents();
        }, 1000 / this.config.maxActionsPerSecond);
    }
    
    /**
     * Stop processing events
     */
    stopEventProcessing() {
        if (this.eventProcessor) {
            clearInterval(this.eventProcessor);
            this.eventProcessor = null;
        }
    }
    
    /**
     * Process pending events
     */
    async processEvents() {
        if (this.pendingEvents.length === 0) return;
        
        const event = this.pendingEvents.shift();
        try {
            await this.onAction(event);
            this.metrics.successfulActions++;
        } catch (error) {
            this.handleError(`Error processing event: ${event.type}`, error);
            this.metrics.failedActions++;
        }
    }
    
    /**
     * Handle errors
     */
    handleError(message, error) {
        console.error(`[${this.config.name}] ${message}:`, error);
        
        this.state.errors.push({
            message,
            error: error.message,
            timestamp: Date.now()
        });
        
        // Call subclass error handler
        this.onError(message, error);
        
        // Publish error event
        this.publishEvent('agent:error', {
            agent: this.id,
            message,
            error: error.message
        });
    }
    
    /**
     * Get agent status
     */
    getStatus() {
        return {
            id: this.id,
            config: this.config,
            state: this.state,
            metrics: {
                ...this.metrics,
                uptime: this.state.running ? Date.now() - this.metrics.startTime : this.metrics.uptime,
                successRate: this.metrics.totalActions > 0 
                    ? (this.metrics.successfulActions / this.metrics.totalActions) * 100 
                    : 0
            },
            integrations: this.getIntegrationStatus(),
            specialization: this.getSpecializationStatus()
        };
    }
    
    /**
     * Get integration status with other agents
     */
    getIntegrationStatus() {
        const integrations = {};
        
        // Check for common agent connections
        const commonConnections = [
            'creativeDirector', 'technicalDirector', 'stageManager',
            'voiceCoach', 'choreographer', 'lightingDesigner',
            'soundDesigner', 'costumeDesigner', 'setDesigner'
        ];
        
        commonConnections.forEach(connection => {
            if (this[connection]) {
                integrations[connection] = {
                    connected: true,
                    agentId: this[connection].id || 'unknown'
                };
            }
        });
        
        return integrations;
    }
    
    /**
     * Get specialization-specific status (override in subclasses)
     */
    getSpecializationStatus() {
        return {
            type: this.config.role,
            capabilities: this.capabilities || {},
            currentProject: this.currentProject || null
        };
    }
    
    /**
     * Add common project management functionality
     */
    initializeProject(production) {
        this.currentProject = {
            production: production,
            status: 'initializing',
            createdAt: new Date(),
            lastUpdate: new Date()
        };
        
        this.publishEvent('project:initialized', {
            agent: this.id,
            production: production
        });
    }
    
    /**
     * Update project status
     */
    updateProjectStatus(status, details = {}) {
        if (this.currentProject) {
            this.currentProject.status = status;
            this.currentProject.lastUpdate = new Date();
            
            this.publishEvent('project:status-updated', {
                agent: this.id,
                status: status,
                details: details
            });
        }
    }
    
    /**
     * Add common integration patterns
     */
    connectToAgent(agentType, agent) {
        this[agentType] = agent;
        console.log(`[${this.config.name}] Connected to ${agentType}: ${agent.config?.name || 'unknown'}`);
        
        this.publishEvent('agent:connected', {
            sourceAgent: this.id,
            targetAgent: agent.id,
            connectionType: agentType
        });
    }
    
    /**
     * Add common collaboration request
     */
    requestCollaboration(targetAgentType, requestType, data) {
        if (this[targetAgentType]) {
            this.publishEvent(`${targetAgentType}:collaboration-request`, {
                requestingAgent: this.id,
                requestType: requestType,
                data: data
            });
        } else {
            console.warn(`[${this.config.name}] Cannot collaborate with ${targetAgentType} - not connected`);
        }
    }
    
    // Lifecycle hooks (to be overridden by subclasses)
    
    /**
     * Called during initialization
     * Override in subclasses to add custom initialization logic
     */
    async onInitialize() {
        // Default: no-op
    }
    
    /**
     * Called when agent starts
     * Override in subclasses to add custom start logic
     */
    async onStart() {
        // Default: no-op
    }
    
    /**
     * Called when agent stops
     * Override in subclasses to add custom stop logic
     */
    async onStop() {
        // Default: no-op
    }
    
    /**
     * Called when an error occurs
     * Override in subclasses to add custom error handling
     */
    onError(message, error) {
        // Default: no-op
    }
    
    /**
     * Called to process an action/event
     * Override in subclasses to add custom action logic
     */
    async onAction(event) {
        // Default: log the event
        console.log(`[${this.config.name}] Processing event:`, event);
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.BaseAgent = BaseAgent;
    console.log('BaseAgent loaded - Foundation for all theater agents');
}