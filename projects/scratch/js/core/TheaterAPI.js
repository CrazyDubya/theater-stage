/**
 * TheaterAPI.js - RESTful API Layer for Agent Control of 3D Theater Stage
 * 
 * Provides comprehensive API endpoints for external agents to control all aspects
 * of the theater including actors, stage elements, lighting, props, and performances.
 * 
 * Features:
 * - RESTful API design with proper HTTP methods
 * - WebSocket support for real-time updates
 * - Command pattern integration for undo/redo
 * - Comprehensive state monitoring
 * - Multi-agent coordination support
 */

class TheaterAPI {
    constructor() {
        this.isInitialized = false;
        this.webSocketServer = null;
        this.connectedAgents = new Map();
        this.commandHistory = [];
        this.maxCommandHistory = 100;
        
        // API endpoints registry
        this.endpoints = new Map();
        
        // Real-time event subscriptions
        this.eventSubscriptions = new Map();
        
        // Rate limiting and security
        this.rateLimits = new Map();
        this.apiKeys = new Set();
        
        console.log('🎭 TheaterAPI: API layer initialized');
    }

    /**
     * Initialize the API system
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('TheaterAPI already initialized');
            return;
        }

        try {
            // Wait for theater system dependencies
            await this.waitForDependencies();
            
            // Register all API endpoints
            this.registerEndpoints();
            
            // Initialize WebSocket for real-time communication
            this.initializeWebSocket();
            
            // Set up event listeners for state changes
            this.setupEventListeners();
            
            // Create mock HTTP server interface (browser-compatible)
            this.setupMockHTTPInterface();
            
            this.isInitialized = true;
            console.log('🎭 TheaterAPI: Initialization complete');
            
        } catch (error) {
            console.error('🎭 TheaterAPI: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for required theater system dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                const required = [
                    'window.stageState',
                    'window.theatricalActorFactory',
                    'window.threeStageBuilder',
                    'window.stageUIManager'
                ];
                
                const missing = required.filter(dep => {
                    const parts = dep.split('.');
                    let obj = window;
                    for (const part of parts.slice(1)) {
                        obj = obj[part];
                        if (!obj) return true;
                    }
                    return false;
                });
                
                if (missing.length === 0) {
                    resolve();
                } else {
                    console.log('TheaterAPI waiting for:', missing);
                    setTimeout(checkDependencies, 100);
                }
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('TheaterAPI dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Register all API endpoints
     */
    registerEndpoints() {
        console.log('🎭 TheaterAPI: Registering API endpoints...');
        
        // === ACTOR MANAGEMENT ===
        this.registerEndpoint('POST', '/api/actors', this.createActor.bind(this));
        this.registerEndpoint('GET', '/api/actors', this.getActors.bind(this));
        this.registerEndpoint('GET', '/api/actors/:id', this.getActor.bind(this));
        this.registerEndpoint('DELETE', '/api/actors/:id', this.deleteActor.bind(this));
        this.registerEndpoint('PUT', '/api/actors/:id/position', this.moveActor.bind(this));
        this.registerEndpoint('PUT', '/api/actors/:id/move-to-marker', this.moveActorToMarker.bind(this));
        this.registerEndpoint('POST', '/api/actors/scatter', this.scatterActors.bind(this));
        this.registerEndpoint('POST', '/api/actors/stop-all', this.stopAllActors.bind(this));
        
        // === ACTOR SELECTION ===
        this.registerEndpoint('POST', '/api/actors/select', this.selectActors.bind(this));
        this.registerEndpoint('DELETE', '/api/actors/select', this.clearSelection.bind(this));
        this.registerEndpoint('POST', '/api/actors/select-all', this.selectAllActors.bind(this));
        
        // === ACTOR PERFORMANCE ===
        this.registerEndpoint('PUT', '/api/actors/:id/performance', this.startPerformance.bind(this));
        this.registerEndpoint('PUT', '/api/actors/:id/state', this.setActorState.bind(this));
        this.registerEndpoint('POST', '/api/actors/performance-queue', this.triggerPerformanceQueue.bind(this));
        
        // === STAGE ELEMENTS ===
        this.registerEndpoint('PUT', '/api/stage/lighting', this.setLighting.bind(this));
        this.registerEndpoint('GET', '/api/stage/lighting/presets', this.getLightingPresets.bind(this));
        this.registerEndpoint('PUT', '/api/stage/camera', this.setCamera.bind(this));
        this.registerEndpoint('PUT', '/api/stage/curtains', this.toggleCurtains.bind(this));
        this.registerEndpoint('PUT', '/api/stage/markers/visibility', this.toggleMarkers.bind(this));
        this.registerEndpoint('PUT', '/api/stage/platforms', this.movePlatforms.bind(this));
        this.registerEndpoint('PUT', '/api/stage/rotating', this.controlRotatingStage.bind(this));
        this.registerEndpoint('PUT', '/api/stage/trapdoors', this.controlTrapDoors.bind(this));
        
        // === SCENERY & TEXTURES ===
        this.registerEndpoint('PUT', '/api/scenery/:panel/position', this.moveScenery.bind(this));
        this.registerEndpoint('PUT', '/api/scenery/:panel/texture', this.applyTexture.bind(this));
        this.registerEndpoint('GET', '/api/scenery/textures', this.getAvailableTextures.bind(this));
        
        // === PROPS ===
        this.registerEndpoint('POST', '/api/props', this.createProp.bind(this));
        this.registerEndpoint('GET', '/api/props', this.getProps.bind(this));
        this.registerEndpoint('DELETE', '/api/props/:id', this.deleteProp.bind(this));
        this.registerEndpoint('PUT', '/api/props/:id/position', this.moveProp.bind(this));
        
        // === SCENE MANAGEMENT ===
        this.registerEndpoint('POST', '/api/scene/save', this.saveScene.bind(this));
        this.registerEndpoint('POST', '/api/scene/load', this.loadScene.bind(this));
        this.registerEndpoint('GET', '/api/scene/list', this.listScenes.bind(this));
        this.registerEndpoint('POST', '/api/scene/export', this.exportScene.bind(this));
        
        // === STATE & MONITORING ===
        this.registerEndpoint('GET', '/api/state', this.getState.bind(this));
        this.registerEndpoint('GET', '/api/state/actors', this.getActorStates.bind(this));
        this.registerEndpoint('GET', '/api/state/stage', this.getStageState.bind(this));
        this.registerEndpoint('GET', '/api/performance/stats', this.getPerformanceStats.bind(this));
        
        // === COMMAND MANAGEMENT ===
        this.registerEndpoint('POST', '/api/commands/execute', this.executeCommand.bind(this));
        this.registerEndpoint('POST', '/api/commands/undo', this.undoCommand.bind(this));
        this.registerEndpoint('POST', '/api/commands/redo', this.redoCommand.bind(this));
        this.registerEndpoint('GET', '/api/commands/history', this.getCommandHistory.bind(this));
        
        console.log(`🎭 TheaterAPI: ${this.endpoints.size} endpoints registered`);
    }

    /**
     * Register an API endpoint
     */
    registerEndpoint(method, path, handler) {
        const key = `${method}:${path}`;
        this.endpoints.set(key, {
            method,
            path,
            handler,
            pathRegex: this.createPathRegex(path)
        });
    }

    /**
     * Create regex for path matching with parameters
     */
    createPathRegex(path) {
        const regexPath = path.replace(/:([^/]+)/g, '(?<$1>[^/]+)');
        return new RegExp(`^${regexPath}$`);
    }

    /**
     * Setup mock HTTP interface for browser environment
     */
    setupMockHTTPInterface() {
        // Create global API function for easy agent access
        window.theaterAPI = {
            call: this.callAPI.bind(this),
            get: (path, params) => this.callAPI('GET', path, params),
            post: (path, data) => this.callAPI('POST', path, data),
            put: (path, data) => this.callAPI('PUT', path, data),
            delete: (path) => this.callAPI('DELETE', path),
            
            // WebSocket interface
            subscribe: this.subscribe.bind(this),
            unsubscribe: this.unsubscribe.bind(this),
            
            // Batch operations
            batch: this.batchExecute.bind(this)
        };

        console.log('🎭 TheaterAPI: Global API interface created at window.theaterAPI');
    }

    /**
     * Main API call handler
     */
    async callAPI(method, path, data = null) {
        try {
            // Find matching endpoint
            const endpoint = this.findEndpoint(method, path);
            if (!endpoint) {
                throw new Error(`Endpoint not found: ${method} ${path}`);
            }

            // Extract path parameters
            const match = path.match(endpoint.pathRegex);
            const params = match ? match.groups || {} : {};

            // Create request context
            const context = {
                method,
                path,
                params,
                data,
                timestamp: Date.now()
            };

            // Apply rate limiting
            if (!this.checkRateLimit(context)) {
                throw new Error('Rate limit exceeded');
            }

            // Execute handler
            const result = await endpoint.handler(context);

            // Log API call
            console.log(`🎭 API: ${method} ${path}`, { params, data, result });

            return {
                success: true,
                data: result,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error(`🎭 API Error: ${method} ${path}`, error);
            return {
                success: false,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Find matching endpoint for method and path
     */
    findEndpoint(method, path) {
        for (const [key, endpoint] of this.endpoints) {
            if (endpoint.method === method && endpoint.pathRegex.test(path)) {
                return endpoint;
            }
        }
        return null;
    }

    /**
     * Initialize WebSocket for real-time communication
     */
    initializeWebSocket() {
        // For browser environment, we'll use a mock WebSocket interface
        // In a real implementation, this would connect to an actual WebSocket server
        
        this.webSocketInterface = {
            broadcast: (event, data) => {
                // Broadcast to all subscribed agents
                for (const [agentId, subscriptions] of this.eventSubscriptions) {
                    if (subscriptions.has(event)) {
                        this.sendToAgent(agentId, { event, data, timestamp: Date.now() });
                    }
                }
            },
            
            send: (agentId, data) => {
                this.sendToAgent(agentId, data);
            }
        };

        console.log('🎭 TheaterAPI: WebSocket interface ready');
    }

    /**
     * Setup event listeners for theater state changes
     */
    setupEventListeners() {
        // Monitor actor movements
        if (window.theatricalActorFactory) {
            const originalUpdate = window.theatricalActorFactory.update.bind(window.theatricalActorFactory);
            window.theatricalActorFactory.update = (deltaTime) => {
                originalUpdate(deltaTime);
                this.broadcastEvent('actors:update', this.getActorStates());
            };
        }

        // Monitor stage state changes
        if (window.stageState) {
            // Use Proxy to detect state changes
            this.monitorStateChanges();
        }

        console.log('🎭 TheaterAPI: Event listeners established');
    }

    /**
     * Monitor state changes using Proxy
     */
    monitorStateChanges() {
        // This would implement deep state monitoring
        // For now, we'll use periodic polling
        setInterval(() => {
            this.broadcastEvent('state:snapshot', this.getState());
        }, 1000); // Broadcast state every second
    }

    // === API ENDPOINT IMPLEMENTATIONS ===

    /**
     * Create a new actor
     */
    async createActor(context) {
        const { x = 0, z = 0, type = 'human_male' } = context.data || {};
        
        if (!window.threeObjectFactory) {
            throw new Error('ObjectFactory not available');
        }

        const actor = await window.threeObjectFactory.addActorAt(x, z, type);
        if (!actor) {
            throw new Error('Failed to create actor');
        }

        this.broadcastEvent('actor:created', {
            id: actor.userData.id,
            type,
            position: { x: actor.position.x, z: actor.position.z }
        });

        return {
            id: actor.userData.id,
            type,
            position: { x: actor.position.x, z: actor.position.z }
        };
    }

    /**
     * Get all actors
     */
    getActors(context) {
        if (!window.theatricalActorFactory) {
            throw new Error('ActorFactory not available');
        }

        const actors = window.theatricalActorFactory.getAllActors();
        return actors.map(actor => ({
            id: actor.id,
            type: actor.actorType,
            position: actor.position,
            state: actor.state,
            isMoving: actor.isMoving,
            targetPosition: actor.targetPosition
        }));
    }

    /**
     * Get specific actor
     */
    getActor(context) {
        const { id } = context.params;
        
        if (!window.theatricalActorFactory) {
            throw new Error('ActorFactory not available');
        }

        const actor = window.theatricalActorFactory.getActor(id);
        if (!actor) {
            throw new Error(`Actor ${id} not found`);
        }

        return {
            id: actor.id,
            type: actor.actorType,
            position: actor.position,
            state: actor.state,
            isMoving: actor.isMoving,
            targetPosition: actor.targetPosition,
            personality: actor.personality,
            status: actor.getStatus()
        };
    }

    /**
     * Move actor to position
     */
    moveActor(context) {
        const { id } = context.params;
        const { x, z } = context.data;

        if (!window.theatricalActorFactory) {
            throw new Error('ActorFactory not available');
        }

        const success = window.theatricalActorFactory.moveActorTo(id, x, z);
        if (!success) {
            throw new Error(`Failed to move actor ${id}`);
        }

        this.broadcastEvent('actor:moved', { id, position: { x, z } });
        return { id, position: { x, z } };
    }

    /**
     * Move actor to stage marker
     */
    moveActorToMarker(context) {
        const { id } = context.params;
        const { markerIndex } = context.data;

        const actor = window.theatricalActorFactory?.getActor(id);
        if (!actor) {
            throw new Error(`Actor ${id} not found`);
        }

        const success = actor.moveToStagePosition(markerIndex);
        if (!success) {
            throw new Error(`Failed to move actor ${id} to marker ${markerIndex}`);
        }

        this.broadcastEvent('actor:moved-to-marker', { id, markerIndex });
        return { id, markerIndex };
    }

    /**
     * Set lighting preset
     */
    setLighting(context) {
        const { preset } = context.data;

        if (!window.threeStageBuilder) {
            throw new Error('StageBuilder not available');
        }

        window.threeStageBuilder.applyLightingPreset(preset);
        this.broadcastEvent('lighting:changed', { preset });
        return { preset };
    }

    /**
     * Get current theater state
     */
    getState(context) {
        return {
            actors: this.getActorStates(),
            stage: this.getStageState(),
            performance: this.getPerformanceStats(),
            timestamp: Date.now()
        };
    }

    /**
     * Get actor states
     */
    getActorStates() {
        if (!window.theatricalActorFactory) return [];
        
        const actors = window.theatricalActorFactory.getAllActors();
        return actors.map(actor => ({
            id: actor.id,
            position: actor.position,
            state: actor.state,
            isMoving: actor.isMoving,
            targetPosition: actor.targetPosition
        }));
    }

    /**
     * Get stage state
     */
    getStageState() {
        if (!window.stageState) return {};
        
        return {
            curtains: window.stageState.stage.curtains.state,
            lighting: window.stageState.ui.currentLightingPreset,
            markers: {
                visible: window.stageState.stage.stageMarkers[0]?.visible || false,
                count: window.stageState.stage.stageMarkers.length
            },
            platforms: window.stageState.stage.moveablePlatforms.map(p => ({
                position: p.position.y,
                moving: p.userData.moving
            }))
        };
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        if (!window.theatricalActorFactory) return {};
        
        return window.theatricalActorFactory.getStats();
    }

    /**
     * Broadcast event to subscribed agents
     */
    broadcastEvent(event, data) {
        if (this.webSocketInterface) {
            this.webSocketInterface.broadcast(event, data);
        }
    }

    /**
     * Subscribe to events
     */
    subscribe(agentId, events) {
        if (!this.eventSubscriptions.has(agentId)) {
            this.eventSubscriptions.set(agentId, new Set());
        }
        
        const subscriptions = this.eventSubscriptions.get(agentId);
        events.forEach(event => subscriptions.add(event));
        
        console.log(`🎭 API: Agent ${agentId} subscribed to ${events.join(', ')}`);
        return { subscribed: events };
    }

    /**
     * Send data to specific agent
     */
    sendToAgent(agentId, data) {
        // In a real implementation, this would send via WebSocket
        console.log(`🎭 API → Agent ${agentId}:`, data);
        
        // For browser environment, we can trigger custom events
        window.dispatchEvent(new CustomEvent('theater-api-message', {
            detail: { agentId, data }
        }));
    }

    /**
     * Batch execute multiple API calls
     */
    async batchExecute(operations) {
        const results = [];
        
        for (const op of operations) {
            try {
                const result = await this.callAPI(op.method, op.path, op.data);
                results.push({ success: true, operation: op, result });
            } catch (error) {
                results.push({ success: false, operation: op, error: error.message });
            }
        }
        
        return results;
    }

    /**
     * Check rate limits
     */
    checkRateLimit(context) {
        // Simple rate limiting implementation
        const key = `${context.method}:${context.path}`;
        const now = Date.now();
        
        if (!this.rateLimits.has(key)) {
            this.rateLimits.set(key, { count: 1, resetTime: now + 60000 });
            return true;
        }
        
        const limit = this.rateLimits.get(key);
        if (now > limit.resetTime) {
            limit.count = 1;
            limit.resetTime = now + 60000;
            return true;
        }
        
        if (limit.count >= 100) { // 100 calls per minute
            return false;
        }
        
        limit.count++;
        return true;
    }

    /**
     * Get API statistics
     */
    getAPIStats() {
        return {
            isInitialized: this.isInitialized,
            endpointsRegistered: this.endpoints.size,
            connectedAgents: this.connectedAgents.size,
            eventSubscriptions: this.eventSubscriptions.size,
            commandHistoryLength: this.commandHistory.length
        };
    }
}

// Create global instance
const theaterAPI = new TheaterAPI();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.TheaterAPI = TheaterAPI;
    window.theaterAPIInstance = theaterAPI;
    console.log('🎭 TheaterAPI loaded - API layer available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TheaterAPI, theaterAPI };
}