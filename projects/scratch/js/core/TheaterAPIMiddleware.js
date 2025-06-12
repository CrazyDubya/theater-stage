/**
 * TheaterAPIMiddleware.js - HTTP-style Interface for Ollama Function Calling
 * 
 * Provides HTTP-style methods (get, post, put, delete) that Ollama function calls
 * can use to interact with the theater system. Acts as middleware between
 * Ollama's function calling and the actual theater system controls.
 * 
 * Features:
 * - HTTP-style API methods (get, post, put, delete)
 * - Direct theater system integration
 * - Real-time state access
 * - Function call compatibility
 * - Error handling and logging
 */

class TheaterAPIMiddleware {
    constructor() {
        this.isInitialized = false;
        this.callHistory = [];
        this.maxHistory = 100;
        
        console.log('🎭 TheaterAPIMiddleware: HTTP-style interface initialized');
    }

    /**
     * Initialize middleware with theater system dependencies
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            // Wait for theater system to be ready
            await this.waitForTheaterSystem();
            
            // Create global interface for Ollama function calls
            this.createGlobalInterface();
            
            this.isInitialized = true;
            console.log('🎭 TheaterAPIMiddleware: Ready for Ollama function calls');
            return true;

        } catch (error) {
            console.error('🎭 TheaterAPIMiddleware: Initialization failed:', error);
            return false;
        }
    }

    /**
     * Wait for theater system dependencies
     */
    async waitForTheaterSystem() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                const required = [
                    window.stageState,
                    window.threeObjectFactory,
                    window.threeStageBuilder
                ];
                
                const optional = [
                    window.theatricalActorFactory,
                    window.stageUIManager
                ];
                
                // Check required dependencies
                const allRequired = required.every(dep => dep);
                
                if (allRequired) {
                    console.log('🎭 TheaterAPIMiddleware: Required dependencies ready');
                    
                    // Log optional dependencies status
                    optional.forEach((dep, index) => {
                        const name = ['theatricalActorFactory', 'stageUIManager'][index];
                        console.log(`🎭 TheaterAPIMiddleware: ${name} ${dep ? 'available' : 'not available'}`);
                    });
                    
                    resolve();
                } else {
                    const missing = required.filter(dep => !dep);
                    console.log('🎭 TheaterAPIMiddleware: Waiting for dependencies:', missing.length);
                    setTimeout(checkDependencies, 100);
                }
            };
            
            checkDependencies();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Theater system not ready - missing required dependencies'));
            }, 10000);
        });
    }

    /**
     * Create global HTTP-style interface for Ollama
     */
    createGlobalInterface() {
        window.theaterAPI = {
            get: this.get.bind(this),
            post: this.post.bind(this),
            put: this.put.bind(this),
            delete: this.delete.bind(this),
            patch: this.patch.bind(this),
            
            // Batch operations
            batch: this.batch.bind(this),
            
            // Real-time subscriptions
            subscribe: this.subscribe.bind(this),
            unsubscribe: this.unsubscribe.bind(this)
        };
        
        console.log('🎭 TheaterAPIMiddleware: Global window.theaterAPI interface created');
    }

    /**
     * HTTP GET - Retrieve data
     */
    async get(path, options = {}) {
        try {
            console.log(`🎭 API GET: ${path}`);
            
            const result = await this.routeRequest('GET', path, null, options);
            this.logAPICall('GET', path, null, result);
            
            return { success: true, data: result, timestamp: Date.now() };

        } catch (error) {
            console.error(`🎭 API GET ${path} failed:`, error);
            const errorResult = { success: false, error: error.message, timestamp: Date.now() };
            this.logAPICall('GET', path, null, errorResult);
            return errorResult;
        }
    }

    /**
     * HTTP POST - Create data
     */
    async post(path, data = {}, options = {}) {
        try {
            console.log(`🎭 API POST: ${path}`, data);
            
            const result = await this.routeRequest('POST', path, data, options);
            this.logAPICall('POST', path, data, result);
            
            return { success: true, data: result, timestamp: Date.now() };

        } catch (error) {
            console.error(`🎭 API POST ${path} failed:`, error);
            const errorResult = { success: false, error: error.message, timestamp: Date.now() };
            this.logAPICall('POST', path, data, errorResult);
            return errorResult;
        }
    }

    /**
     * HTTP PUT - Update data
     */
    async put(path, data = {}, options = {}) {
        try {
            console.log(`🎭 API PUT: ${path}`, data);
            
            const result = await this.routeRequest('PUT', path, data, options);
            this.logAPICall('PUT', path, data, result);
            
            return { success: true, data: result, timestamp: Date.now() };

        } catch (error) {
            console.error(`🎭 API PUT ${path} failed:`, error);
            const errorResult = { success: false, error: error.message, timestamp: Date.now() };
            this.logAPICall('PUT', path, data, errorResult);
            return errorResult;
        }
    }

    /**
     * HTTP DELETE - Remove data
     */
    async delete(path, options = {}) {
        try {
            console.log(`🎭 API DELETE: ${path}`);
            
            const result = await this.routeRequest('DELETE', path, null, options);
            this.logAPICall('DELETE', path, null, result);
            
            return { success: true, data: result, timestamp: Date.now() };

        } catch (error) {
            console.error(`🎭 API DELETE ${path} failed:`, error);
            const errorResult = { success: false, error: error.message, timestamp: Date.now() };
            this.logAPICall('DELETE', path, null, errorResult);
            return errorResult;
        }
    }

    /**
     * HTTP PATCH - Partial update
     */
    async patch(path, data = {}, options = {}) {
        return this.put(path, data, options); // Alias to PUT for simplicity
    }

    /**
     * Route API request to appropriate handler
     */
    async routeRequest(method, path, data, options) {
        const route = this.parseRoute(path);
        
        switch (route.endpoint) {
            // === ACTOR ENDPOINTS ===
            case '/api/actors':
                return this.handleActorsEndpoint(method, route, data);
                
            case '/api/actors/:id':
                return this.handleActorEndpoint(method, route, data);
                
            case '/api/actors/:id/position':
                return this.handleActorPositionEndpoint(method, route, data);
                
            case '/api/actors/:id/move-to-marker':
                return this.handleActorMarkerEndpoint(method, route, data);
                
            case '/api/actors/select':
                return this.handleActorSelectionEndpoint(method, route, data);
                
            case '/api/actors/scatter':
                return this.handleActorScatterEndpoint(method, route, data);
                
            // === STAGE ENDPOINTS ===
            case '/api/stage/lighting':
                return this.handleStageLightingEndpoint(method, route, data);
                
            case '/api/stage/camera':
                return this.handleStageCameraEndpoint(method, route, data);
                
            case '/api/stage/curtains':
                return this.handleStageCurtainsEndpoint(method, route, data);
                
            case '/api/stage/markers/visibility':
                return this.handleStageMarkersEndpoint(method, route, data);
                
            // === STATE ENDPOINTS ===
            case '/api/state':
                return this.handleStateEndpoint(method, route, data);
                
            case '/api/state/actors':
                return this.handleActorsStateEndpoint(method, route, data);
                
            case '/api/state/stage':
                return this.handleStageStateEndpoint(method, route, data);
                
            default:
                throw new Error(`Unknown endpoint: ${path}`);
        }
    }

    /**
     * Parse route to extract endpoint pattern and parameters
     */
    parseRoute(path) {
        // Extract ID parameters from paths like /api/actors/actor_123
        const parts = path.split('/');
        let endpoint = path;
        const params = {};
        
        // Handle actor ID routes
        if (parts[2] === 'actors' && parts[3] && !parts[3].startsWith('select') && !parts[3].startsWith('scatter')) {
            params.id = parts[3];
            endpoint = '/api/actors/:id';
            
            if (parts[4] === 'position') {
                endpoint = '/api/actors/:id/position';
            } else if (parts[4] === 'move-to-marker') {
                endpoint = '/api/actors/:id/move-to-marker';
            }
        }
        
        return { endpoint, params, originalPath: path };
    }

    /**
     * Handle actors collection endpoint
     */
    async handleActorsEndpoint(method, route, data) {
        switch (method) {
            case 'GET':
                return this.getAllActors();
                
            case 'POST':
                return this.createActor(data);
                
            default:
                throw new Error(`Method ${method} not supported for /api/actors`);
        }
    }

    /**
     * Handle individual actor endpoint
     */
    async handleActorEndpoint(method, route, data) {
        const actorId = route.params.id;
        
        switch (method) {
            case 'GET':
                return this.getActor(actorId);
                
            case 'DELETE':
                return this.deleteActor(actorId);
                
            default:
                throw new Error(`Method ${method} not supported for /api/actors/:id`);
        }
    }

    /**
     * Handle actor position endpoint
     */
    async handleActorPositionEndpoint(method, route, data) {
        const actorId = route.params.id;
        
        switch (method) {
            case 'PUT':
                return this.moveActor(actorId, data.x, data.z);
                
            default:
                throw new Error(`Method ${method} not supported for actor position`);
        }
    }

    /**
     * Handle actor marker movement endpoint
     */
    async handleActorMarkerEndpoint(method, route, data) {
        const actorId = route.params.id;
        
        switch (method) {
            case 'PUT':
                return this.moveActorToMarker(actorId, data.markerIndex);
                
            default:
                throw new Error(`Method ${method} not supported for actor marker movement`);
        }
    }

    /**
     * Handle stage lighting endpoint
     */
    async handleStageLightingEndpoint(method, route, data) {
        switch (method) {
            case 'PUT':
                return this.setLighting(data.preset);
                
            case 'GET':
                return this.getLighting();
                
            default:
                throw new Error(`Method ${method} not supported for stage lighting`);
        }
    }

    /**
     * Handle stage camera endpoint
     */
    async handleStageCameraEndpoint(method, route, data) {
        switch (method) {
            case 'PUT':
                return this.setCamera(data.preset);
                
            case 'GET':
                return this.getCamera();
                
            default:
                throw new Error(`Method ${method} not supported for stage camera`);
        }
    }

    /**
     * Handle stage curtains endpoint
     */
    async handleStageCurtainsEndpoint(method, route, data) {
        switch (method) {
            case 'PUT':
                return this.toggleCurtains();
                
            default:
                throw new Error(`Method ${method} not supported for stage curtains`);
        }
    }

    /**
     * Handle complete state endpoint
     */
    async handleStateEndpoint(method, route, data) {
        switch (method) {
            case 'GET':
                return this.getCompleteState();
                
            default:
                throw new Error(`Method ${method} not supported for state`);
        }
    }

    // === THEATER SYSTEM INTEGRATION METHODS ===

    /**
     * Get all actors
     */
    getAllActors() {
        // Try behavioral actors first
        if (window.theatricalActorFactory?.isInitialized) {
            const actors = window.theatricalActorFactory.getAllActors();
            return actors.map(actor => ({
                id: actor.id,
                type: actor.actorType || 'unknown',
                position: {
                    x: actor.position.x,
                    y: actor.position.y,
                    z: actor.position.z
                },
                targetPosition: actor.targetPosition,
                state: actor.state,
                isMoving: actor.isMoving,
                isSelected: actor.visualMesh?.userData?.isSelected || false
            }));
        }
        
        // Fallback to visual actors from stageState
        if (window.stageState?.objects?.actors) {
            const actors = window.stageState.objects.actors;
            return actors.map(actor => ({
                id: actor.userData.id,
                type: actor.userData.actorType || 'unknown',
                position: {
                    x: actor.position.x,
                    y: actor.position.y,
                    z: actor.position.z
                },
                targetPosition: null,
                state: 'unknown',
                isMoving: false,
                isSelected: actor.userData.isSelected || false
            }));
        }
        
        return [];
    }

    /**
     * Create new actor
     */
    async createActor(data) {
        if (!window.threeObjectFactory) {
            throw new Error('Object factory not available');
        }
        
        const { x = 0, z = 0, type = 'human_male' } = data;
        
        // Use the ObjectFactory's addActorAt method which creates both visual and behavioral actors
        const visualActor = await window.threeObjectFactory.addActorAt(x, z, type);
        
        if (!visualActor) {
            throw new Error('Failed to create actor');
        }
        
        return {
            id: visualActor.userData.id,
            type: type,
            position: { x: visualActor.position.x, y: visualActor.position.y, z: visualActor.position.z },
            created: Date.now()
        };
    }

    /**
     * Get specific actor
     */
    getActor(actorId) {
        // Try behavioral actor first
        if (window.theatricalActorFactory?.isInitialized) {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                return {
                    id: actor.id,
                    type: actor.actorType || 'unknown',
                    position: {
                        x: actor.position.x,
                        y: actor.position.y,
                        z: actor.position.z
                    },
                    targetPosition: actor.targetPosition,
                    state: actor.state,
                    isMoving: actor.isMoving,
                    isSelected: actor.visualMesh?.userData?.isSelected || false
                };
            }
        }
        
        // Fallback to visual actor from stageState
        if (window.stageState?.objects?.actors) {
            const actor = window.stageState.objects.actors.find(a => a.userData.id === actorId);
            if (actor) {
                return {
                    id: actor.userData.id,
                    type: actor.userData.actorType || 'unknown',
                    position: {
                        x: actor.position.x,
                        y: actor.position.y,
                        z: actor.position.z
                    },
                    targetPosition: null,
                    state: 'unknown',
                    isMoving: false,
                    isSelected: actor.userData.isSelected || false
                };
            }
        }
        
        throw new Error(`Actor ${actorId} not found`);
    }

    /**
     * Delete actor
     */
    async deleteActor(actorId) {
        if (!window.theatricalActorFactory) {
            throw new Error('Actor factory not available');
        }
        
        const success = window.theatricalActorFactory.removeActor(actorId);
        
        if (!success) {
            throw new Error(`Failed to delete actor ${actorId}`);
        }
        
        return { deleted: actorId, timestamp: Date.now() };
    }

    /**
     * Move actor to position
     */
    async moveActor(actorId, x, z) {
        // Try behavioral movement first
        if (window.theatricalActorFactory?.isInitialized) {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                const success = window.theatricalActorFactory.moveActorTo(actorId, x, z);
                if (success) {
                    return {
                        actorId: actorId,
                        newPosition: { x: actor.position.x, z: actor.position.z },
                        targetPosition: { x, z },
                        timestamp: Date.now()
                    };
                }
            }
        }
        
        // Fallback to direct visual actor movement
        if (window.stageState?.objects?.actors) {
            const visualActor = window.stageState.objects.actors.find(a => a.userData.id === actorId);
            if (visualActor) {
                visualActor.position.set(x, visualActor.position.y, z);
                return {
                    actorId: actorId,
                    newPosition: { x: visualActor.position.x, z: visualActor.position.z },
                    targetPosition: { x, z },
                    timestamp: Date.now()
                };
            }
        }
        
        throw new Error(`Actor ${actorId} not found or movement failed`);
    }

    /**
     * Move actor to stage marker
     */
    async moveActorToMarker(actorId, markerIndex) {
        if (!window.stageState?.stage?.stageMarkers) {
            throw new Error('Stage markers not available');
        }
        
        const markers = window.stageState.stage.stageMarkers;
        if (markerIndex < 0 || markerIndex >= markers.length) {
            throw new Error(`Invalid marker index: ${markerIndex}`);
        }
        
        const marker = markers[markerIndex];
        const markerPos = marker.position;
        
        return this.moveActor(actorId, markerPos.x, markerPos.z);
    }

    /**
     * Set stage lighting
     */
    async setLighting(preset) {
        const validPresets = ['normal', 'dramatic', 'evening', 'concert', 'spotlight'];
        if (!validPresets.includes(preset)) {
            throw new Error(`Invalid lighting preset: ${preset}. Valid: ${validPresets.join(', ')}`);
        }
        
        // Use the global applyLightingPreset function from stage.js
        if (window.applyLightingPreset) {
            window.applyLightingPreset(preset);
        } else {
            throw new Error('Lighting system not available');
        }
        
        return {
            preset: preset,
            timestamp: Date.now()
        };
    }

    /**
     * Set camera view
     */
    async setCamera(preset) {
        const validPresets = ['audience', 'overhead', 'backstage', 'stage-left', 'stage-right', 'close'];
        if (!validPresets.includes(preset)) {
            throw new Error(`Invalid camera preset: ${preset}. Valid: ${validPresets.join(', ')}`);
        }
        
        // Use the global setCameraPreset function from stage.js
        if (window.setCameraPreset) {
            window.setCameraPreset(preset);
        } else {
            throw new Error('Camera system not available');
        }
        
        return {
            preset: preset,
            timestamp: Date.now()
        };
    }

    /**
     * Toggle curtains
     */
    async toggleCurtains() {
        if (!window.threeStageBuilder) {
            throw new Error('Stage builder not available');
        }
        
        // Toggle curtains
        if (window.threeStageBuilder.toggleCurtains) {
            window.threeStageBuilder.toggleCurtains();
        } else if (window.stageState?.stage?.curtains) {
            const curtains = window.stageState.stage.curtains;
            curtains.state = curtains.state === 'open' ? 'closed' : 'open';
        }
        
        return {
            state: window.stageState?.stage?.curtains?.state || 'unknown',
            timestamp: Date.now()
        };
    }

    /**
     * Get complete theater state
     */
    getCompleteState() {
        return {
            actors: this.getAllActors(),
            stage: {
                lighting: window.stageState?.ui?.currentLightingPreset || 'normal',
                camera: window.stageState?.ui?.currentCameraPreset || 'audience',
                curtains: window.stageState?.stage?.curtains?.state || 'open',
                markers: {
                    visible: window.stageState?.stage?.stageMarkers?.[0]?.visible || false,
                    count: window.stageState?.stage?.stageMarkers?.length || 0
                }
            },
            performance: {
                startTime: Date.now(),
                actorCount: this.getAllActors().length
            },
            timestamp: Date.now()
        };
    }

    /**
     * Log API call for debugging
     */
    logAPICall(method, path, data, result) {
        const logEntry = {
            method,
            path,
            data,
            result: result.success ? 'success' : 'error',
            timestamp: Date.now()
        };
        
        this.callHistory.push(logEntry);
        
        // Keep history manageable
        if (this.callHistory.length > this.maxHistory) {
            this.callHistory = this.callHistory.slice(-50);
        }
    }

    /**
     * Batch operations for efficiency
     */
    async batch(operations) {
        const results = [];
        
        for (const op of operations) {
            try {
                let result;
                switch (op.method.toUpperCase()) {
                    case 'GET':
                        result = await this.get(op.path, op.options);
                        break;
                    case 'POST':
                        result = await this.post(op.path, op.data, op.options);
                        break;
                    case 'PUT':
                        result = await this.put(op.path, op.data, op.options);
                        break;
                    case 'DELETE':
                        result = await this.delete(op.path, op.options);
                        break;
                    default:
                        throw new Error(`Unsupported method: ${op.method}`);
                }
                results.push(result);
            } catch (error) {
                results.push({ success: false, error: error.message, operation: op });
            }
        }
        
        return results;
    }

    /**
     * Subscribe to real-time events (placeholder)
     */
    subscribe(agentId, events) {
        console.log(`🎭 Subscription: ${agentId} -> ${events.join(', ')}`);
        return { subscribed: events, agentId };
    }

    /**
     * Unsubscribe from events (placeholder)
     */
    unsubscribe(agentId, events) {
        console.log(`🎭 Unsubscription: ${agentId} -> ${events.join(', ')}`);
        return { unsubscribed: events, agentId };
    }

    /**
     * Get middleware statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            callCount: this.callHistory.length,
            recentCalls: this.callHistory.slice(-10),
            lastCall: this.callHistory[this.callHistory.length - 1] || null
        };
    }
}

// Create global instance
const theaterAPIMiddleware = new TheaterAPIMiddleware();

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    window.theaterAPIMiddleware = theaterAPIMiddleware;
    
    // Initialize automatically when theater system is ready
    window.addEventListener('load', async () => {
        // Wait a bit for theater system to initialize
        setTimeout(async () => {
            await theaterAPIMiddleware.initialize();
        }, 2000);
    });
    
    console.log('🎭 TheaterAPIMiddleware loaded - HTTP-style interface for Ollama');
}

// ES6 module export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TheaterAPIMiddleware, theaterAPIMiddleware };
}