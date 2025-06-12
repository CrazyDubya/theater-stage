/**
 * OllamaInterface.js - Local LLM Integration for AI-Driven Theater
 * 
 * Provides comprehensive interface to Ollama local LLM for theater control.
 * Supports function calling, streaming responses, and real-time performance generation.
 * 
 * Based on 2024 research:
 * - Stanford's LLM live-scripts for real-time theater
 * - MIT's algorithmic choreography systems
 * - Ollama's function calling and streaming capabilities
 */

class OllamaTheaterInterface {
    constructor() {
        this.isInitialized = false;
        this.ollamaUrl = 'http://localhost:11434';
        this.defaultModel = 'llama3.2:3b';
        this.availableModels = new Set();
        this.isConnected = false;
        
        // Performance optimization
        this.responseCache = new Map();
        this.maxCacheSize = 100;
        this.avgResponseTime = 0;
        this.responseCount = 0;
        
        // Theater-specific function definitions for Ollama
        this.theaterTools = this.defineTheaterTools();
        
        // AI personality and context
        this.directorPersonality = 'collaborative'; // collaborative, dramatic, experimental, classical
        this.performanceContext = {
            genre: 'mixed',
            mood: 'neutral',
            audience_type: 'general',
            performance_duration: 0,
            current_scene: 'setup'
        };
        
        console.log('🎭 OllamaTheaterInterface: Local AI theater system initialized');
    }

    /**
     * Initialize connection to local Ollama instance
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('OllamaInterface already initialized');
            return true;
        }

        try {
            console.log('🎭 OllamaInterface: Connecting to local Ollama...');
            
            // Test Ollama connection
            await this.testConnection();
            
            // Get available models
            await this.loadAvailableModels();
            
            // Verify default model is available
            await this.ensureDefaultModel();
            
            // Initialize theater API integration
            await this.integrateWithTheaterAPI();
            
            this.isInitialized = true;
            this.isConnected = true;
            
            console.log('🎭 OllamaInterface: Local AI ready for theater control');
            return true;
            
        } catch (error) {
            console.error('🎭 OllamaInterface: Initialization failed:', error);
            this.isConnected = false;
            
            // Provide helpful error messages
            if (error.message.includes('ECONNREFUSED')) {
                console.error('❌ Ollama not running. Please start Ollama: `ollama serve`');
            } else if (error.message.includes('model')) {
                console.error('❌ No models available. Install any model with: `ollama pull llama3` or similar');
            }
            
            return false;
        }
    }

    /**
     * Test connection to Ollama server
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`);
            if (!response.ok) {
                throw new Error(`Ollama server responded with ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`🎭 Connected to Ollama with ${data.models?.length || 0} models available`);
            return true;
            
        } catch (error) {
            throw new Error(`Failed to connect to Ollama at ${this.ollamaUrl}: ${error.message}`);
        }
    }

    /**
     * Load available models from Ollama
     */
    async loadAvailableModels() {
        try {
            const response = await fetch(`${this.ollamaUrl}/api/tags`);
            const data = await response.json();
            
            this.availableModels.clear();
            if (data.models) {
                data.models.forEach(model => {
                    this.availableModels.add(model.name);
                });
            }
            
            console.log('🎭 Available models:', Array.from(this.availableModels));
            return Array.from(this.availableModels);
            
        } catch (error) {
            console.error('Failed to load available models:', error);
            return [];
        }
    }

    /**
     * Ensure default model is available and supports function calling
     */
    async ensureDefaultModel() {
        const availableArray = Array.from(this.availableModels);
        console.log(`🎭 Available models: ${availableArray.join(', ')}`);
        
        // Models that support function calling (from Ollama documentation)
        const toolsSupportedModels = [
            'llama3.1', 'llama3.2', 'mistral', 'mistral-small', 'mistral-large', 
            'mistral-nemo', 'qwen2.5', 'command-r-plus', 'hermes3', 'mixtral'
        ];
        
        // Find the best available model that supports function calling
        for (const toolsModel of toolsSupportedModels) {
            const matchingModel = availableArray.find(model => 
                model.toLowerCase().includes(toolsModel.toLowerCase())
            );
            if (matchingModel) {
                this.defaultModel = matchingModel;
                console.log(`🎭 Selected model with function calling support: ${this.defaultModel}`);
                return;
            }
        }
        
        // Fallback to any available model (without function calling)
        if (availableArray.length > 0) {
            this.defaultModel = availableArray[0];
            console.warn(`🎭 Using model without function calling support: ${this.defaultModel}`);
            console.warn(`🎭 Install a supported model: ollama pull llama3.1`);
            return;
        }
        
        throw new Error(`No models available. Install: ollama pull llama3.1`);
    }

    /**
     * Check if current model supports function calling/tools
     */
    modelSupportsTools() {
        const toolsSupportedModels = [
            'llama3.1', 'llama3.2', 'mistral', 'mistral-small', 'mistral-large', 
            'mistral-nemo', 'qwen2.5', 'command-r-plus', 'hermes3', 'mixtral'
        ];
        
        return toolsSupportedModels.some(supportedModel => 
            this.defaultModel.toLowerCase().includes(supportedModel.toLowerCase())
        );
    }

    /**
     * Define theater-specific function tools for Ollama
     */
    defineTheaterTools() {
        return [
            {
                type: 'function',
                function: {
                    name: 'move_actor',
                    description: 'Move an actor to specific coordinates or stage marker',
                    parameters: {
                        type: 'object',
                        properties: {
                            actor_id: { 
                                type: 'string', 
                                description: 'ID of the actor to move' 
                            },
                            x: { 
                                type: 'number', 
                                description: 'X coordinate (-10 to 10)' 
                            },
                            z: { 
                                type: 'number', 
                                description: 'Z coordinate (-7 to 7)' 
                            },
                            marker_index: { 
                                type: 'number', 
                                description: 'Stage marker index (0-19)' 
                            }
                        },
                        oneOf: [
                            { required: ['actor_id', 'x', 'z'] },
                            { required: ['actor_id', 'marker_index'] }
                        ]
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'create_formation',
                    description: 'Arrange multiple actors in geometric formations',
                    parameters: {
                        type: 'object',
                        properties: {
                            formation_type: {
                                type: 'string',
                                enum: ['line', 'circle', 'triangle', 'scatter', 'arc', 'diamond'],
                                description: 'Type of formation to create'
                            },
                            actor_ids: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'Array of actor IDs to include'
                            },
                            center_x: { 
                                type: 'number', 
                                description: 'Center X coordinate for formation' 
                            },
                            center_z: { 
                                type: 'number', 
                                description: 'Center Z coordinate for formation' 
                            },
                            scale: { 
                                type: 'number', 
                                minimum: 0.5, 
                                maximum: 3.0,
                                description: 'Scale factor for formation size' 
                            }
                        },
                        required: ['formation_type', 'actor_ids']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'set_lighting',
                    description: 'Change stage lighting to match scene mood',
                    parameters: {
                        type: 'object',
                        properties: {
                            preset: {
                                type: 'string',
                                enum: ['normal', 'dramatic', 'evening', 'concert', 'spotlight'],
                                description: 'Lighting preset to apply'
                            },
                            intensity: { 
                                type: 'number', 
                                minimum: 0, 
                                maximum: 1,
                                description: 'Overall intensity level' 
                            }
                        },
                        required: ['preset']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'set_camera_view',
                    description: 'Change camera angle for optimal viewing',
                    parameters: {
                        type: 'object',
                        properties: {
                            preset: {
                                type: 'string',
                                enum: ['audience', 'overhead', 'backstage', 'stage-left', 'stage-right', 'close'],
                                description: 'Camera view preset'
                            },
                            focus_actor: { 
                                type: 'string', 
                                description: 'Actor ID to focus on' 
                            }
                        },
                        required: ['preset']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'control_curtains',
                    description: 'Open or close theater curtains',
                    parameters: {
                        type: 'object',
                        properties: {
                            action: {
                                type: 'string',
                                enum: ['open', 'close', 'toggle'],
                                description: 'Curtain action to perform'
                            }
                        },
                        required: ['action']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'create_actor',
                    description: 'Create a new actor on stage',
                    parameters: {
                        type: 'object',
                        properties: {
                            type: {
                                type: 'string',
                                enum: ['human_male', 'human_female', 'child', 'elderly'],
                                description: 'Type of actor to create'
                            },
                            x: { 
                                type: 'number', 
                                description: 'X coordinate for placement' 
                            },
                            z: { 
                                type: 'number', 
                                description: 'Z coordinate for placement' 
                            },
                            name: { 
                                type: 'string', 
                                description: 'Character name for the actor' 
                            }
                        },
                        required: ['type']
                    }
                }
            },
            {
                type: 'function',
                function: {
                    name: 'get_stage_state',
                    description: 'Get current state of all actors and stage elements',
                    parameters: {
                        type: 'object',
                        properties: {},
                        additionalProperties: false
                    }
                }
            }
        ];
    }

    /**
     * Generate performance content using Ollama with comprehensive error handling
     */
    async generatePerformance(prompt, options = {}) {
        const startTime = Date.now();
        const timeout = options.timeout || 30000; // 30 second default timeout
        const maxRetries = options.maxRetries || 2; // Maximum retry attempts
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const fullPrompt = this.buildPerformancePrompt(prompt, options);
                
                const requestBody = {
                    model: options.model || this.defaultModel,
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt()
                        },
                        {
                            role: 'user',
                            content: fullPrompt
                        }
                    ],
                    stream: options.stream || false,
                    options: {
                        temperature: options.temperature || 0.7,
                        top_p: options.top_p || 0.9,
                        num_predict: options.max_tokens || 1000
                    }
                };

                // Only add tools if the model supports them
                if (this.modelSupportsTools()) {
                    requestBody.tools = this.theaterTools;
                    console.log('🎭 Using function calling with tools');
                } else {
                    console.log('🎭 Model does not support function calling, using text-only mode');
                }

                // Create abort controller for timeout protection
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, timeout);

                try {
                    console.log(`🎭 Ollama request attempt ${attempt + 1}/${maxRetries + 1} (timeout: ${timeout}ms)`);
                    
                    const response = await fetch(`${this.ollamaUrl}/api/chat`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        // Check for specific HTTP errors
                        if (response.status === 404) {
                            throw new Error(`Model '${requestBody.model}' not found. Install with: ollama pull ${requestBody.model}`);
                        } else if (response.status === 503) {
                            throw new Error('Ollama server overloaded. Please wait and try again.');
                        } else {
                            throw new Error(`Ollama request failed: ${response.status} ${response.statusText}`);
                        }
                    }

                    if (options.stream) {
                        return this.handleStreamingResponse(response, timeout);
                    } else {
                        const data = await response.json();
                        this.updateResponseStats(Date.now() - startTime);
                        this.isConnected = true; // Mark as connected on success
                        return this.processAIResponse(data);
                    }

                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    
                    if (fetchError.name === 'AbortError') {
                        const errorMsg = `Ollama request timed out after ${timeout}ms. Consider increasing timeout or checking server status.`;
                        if (attempt < maxRetries) {
                            console.warn(`⚠️ ${errorMsg} Retrying... (${attempt + 1}/${maxRetries})`);
                            await this.delay(1000 * (attempt + 1)); // Exponential backoff
                            continue;
                        } else {
                            throw new Error(errorMsg);
                        }
                    }
                    
                    throw fetchError;
                }

            } catch (error) {
                console.error(`🎭 OllamaInterface: Attempt ${attempt + 1} failed:`, error.message);
                
                // Check if we should retry
                if (attempt < maxRetries && this.shouldRetry(error)) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
                    console.log(`⏳ Retrying in ${delay}ms...`);
                    await this.delay(delay);
                    continue;
                } else {
                    // Final attempt failed, provide user-friendly error messages
                    this.isConnected = false;
                    
                    if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
                        throw new Error('Cannot connect to Ollama. Please ensure Ollama is running: `ollama serve`');
                    } else if (error.message.includes('timeout')) {
                        throw new Error(`AI Director timed out after ${timeout}ms. ${error.message}`);
                    } else if (error.message.includes('Model') && error.message.includes('not found')) {
                        throw new Error(error.message); // Pass through model-specific errors
                    } else if (error.message.includes('overloaded')) {
                        throw new Error('Ollama server is overloaded. Please wait a moment and try again.');
                    } else {
                        throw new Error(`AI Director error: ${error.message}`);
                    }
                }
            }
        }
    }

    /**
     * Determine if an error is retryable
     */
    shouldRetry(error) {
        const retryableErrors = [
            'timeout',
            'ECONNRESET',
            'ETIMEDOUT',
            'ENOTFOUND',
            'overloaded',
            'temporary'
        ];
        
        return retryableErrors.some(retryable => 
            error.message.toLowerCase().includes(retryable.toLowerCase())
        );
    }

    /**
     * Utility delay function for retries
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Handle streaming responses from Ollama with timeout protection
     */
    async handleStreamingResponse(response, timeout = 60000) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const results = [];
        let lastChunkTime = Date.now();

        try {
            while (true) {
                // Check for stream timeout (no data received for too long)
                if (Date.now() - lastChunkTime > timeout) {
                    throw new Error(`Stream timed out after ${timeout}ms of inactivity`);
                }

                const { value, done } = await reader.read();
                if (done) break;

                lastChunkTime = Date.now(); // Update last chunk time
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.message) {
                            results.push(data);
                            
                            // Execute function calls immediately for real-time control
                            if (data.message.tool_calls) {
                                try {
                                    await this.executeToolCalls(data.message.tool_calls);
                                } catch (toolError) {
                                    console.warn('⚠️ Function call execution failed:', toolError.message);
                                    // Continue processing other chunks
                                }
                            }
                            
                            // Broadcast content updates
                            if (data.message.content) {
                                try {
                                    this.broadcastDirectorNarrative(data.message.content);
                                } catch (broadcastError) {
                                    console.warn('⚠️ Failed to broadcast narrative:', broadcastError.message);
                                    // Continue processing
                                }
                            }
                        }
                    } catch (parseError) {
                        console.warn('⚠️ Failed to parse streaming response chunk:', parseError.message);
                        // Continue processing other chunks
                    }
                }
            }
        } catch (streamError) {
            console.error('🚨 Streaming response error:', streamError.message);
            throw new Error(`Streaming failed: ${streamError.message}`);
        } finally {
            try {
                reader.releaseLock();
            } catch (releaseError) {
                console.warn('⚠️ Failed to release stream reader:', releaseError.message);
            }
        }

        return results;
    }

    /**
     * Execute function calls from AI responses
     */
    async executeToolCalls(toolCalls) {
        const results = [];

        for (const toolCall of toolCalls) {
            try {
                const { function: func } = toolCall;
                const result = await this.executeTheaterFunction(func.name, func.arguments);
                
                results.push({
                    toolCall: toolCall,
                    result: result,
                    success: true
                });

                console.log(`🎭 AI executed: ${func.name}`, func.arguments);

            } catch (error) {
                console.error(`🎭 Function execution failed: ${toolCall.function.name}`, error);
                results.push({
                    toolCall: toolCall,
                    error: error.message,
                    success: false
                });
            }
        }

        return results;
    }

    /**
     * Execute theater-specific functions
     */
    async executeTheaterFunction(functionName, args) {
        const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;

        // Check if theater API is available
        if (!window.theaterAPI) {
            console.warn('🎭 Theater API not available - function calls will be simulated');
            return { 
                success: false, 
                error: 'Theater API not available',
                function: functionName,
                args: parsedArgs,
                message: 'Would have executed: ' + functionName
            };
        }

        switch (functionName) {
            case 'move_actor':
                if (parsedArgs.marker_index !== undefined) {
                    return await window.theaterAPI.put(
                        `/api/actors/${parsedArgs.actor_id}/move-to-marker`,
                        { markerIndex: parsedArgs.marker_index }
                    );
                } else {
                    return await window.theaterAPI.put(
                        `/api/actors/${parsedArgs.actor_id}/position`,
                        { x: parsedArgs.x, z: parsedArgs.z }
                    );
                }

            case 'create_formation':
                return await this.createActorFormation(parsedArgs);

            case 'set_lighting':
                return await window.theaterAPI.put('/api/stage/lighting', { 
                    preset: parsedArgs.preset 
                });

            case 'set_camera_view':
                return await window.theaterAPI.put('/api/stage/camera', { 
                    preset: parsedArgs.preset 
                });

            case 'control_curtains':
                return await window.theaterAPI.put('/api/stage/curtains', {});

            case 'create_actor':
                return await window.theaterAPI.post('/api/actors', {
                    x: parsedArgs.x || 0,
                    z: parsedArgs.z || 0,
                    type: parsedArgs.type
                });

            case 'get_stage_state':
                return await window.theaterAPI.get('/api/state');

            default:
                throw new Error(`Unknown function: ${functionName}`);
        }
    }

    /**
     * Create actor formation based on AI specifications
     */
    async createActorFormation(args) {
        const { formation_type, actor_ids, center_x = 0, center_z = 0, scale = 1.0 } = args;
        
        // Generate formation positions
        const positions = this.calculateFormationPositions(
            formation_type, 
            actor_ids.length, 
            center_x, 
            center_z, 
            scale
        );

        // Move each actor to their formation position
        const results = [];
        for (let i = 0; i < actor_ids.length; i++) {
            const pos = positions[i];
            if (pos) {
                const result = await window.theaterAPI.put(
                    `/api/actors/${actor_ids[i]}/position`,
                    { x: pos.x, z: pos.z }
                );
                results.push(result);
            }
        }

        return { formation: formation_type, positions: results.length };
    }

    /**
     * Calculate positions for different formation types
     */
    calculateFormationPositions(type, count, centerX, centerZ, scale) {
        const positions = [];
        const radius = scale * Math.max(2, count * 0.3);

        switch (type) {
            case 'circle':
                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2;
                    positions.push({
                        x: centerX + Math.cos(angle) * radius,
                        z: centerZ + Math.sin(angle) * radius
                    });
                }
                break;

            case 'line':
                const spacing = scale * 2;
                const totalWidth = (count - 1) * spacing;
                for (let i = 0; i < count; i++) {
                    positions.push({
                        x: centerX - totalWidth/2 + i * spacing,
                        z: centerZ
                    });
                }
                break;

            case 'triangle':
                let index = 0;
                for (let row = 0; row < count && index < count; row++) {
                    const actorsInRow = Math.min(row + 1, count - index);
                    const rowSpacing = scale * 1.5;
                    const actorSpacing = scale * 1.2;
                    
                    for (let col = 0; col < actorsInRow; col++) {
                        positions.push({
                            x: centerX - (actorsInRow - 1) * actorSpacing / 2 + col * actorSpacing,
                            z: centerZ - row * rowSpacing
                        });
                        index++;
                    }
                }
                break;

            case 'scatter':
                for (let i = 0; i < count; i++) {
                    positions.push({
                        x: centerX + (Math.random() - 0.5) * radius * 2,
                        z: centerZ + (Math.random() - 0.5) * radius * 2
                    });
                }
                break;

            default:
                // Default to line formation
                return this.calculateFormationPositions('line', count, centerX, centerZ, scale);
        }

        return positions;
    }

    /**
     * Build comprehensive prompt for performance generation
     */
    buildPerformancePrompt(userPrompt, options) {
        const context = this.performanceContext;
        
        return `
**THEATER DIRECTION TASK**

Context:
- Performance Genre: ${context.genre}
- Current Mood: ${context.mood}
- Audience Type: ${context.audience_type}
- Scene: ${context.current_scene}
- Available Stage: 20x15 units with 20 stage markers
- Current Stage State: ${options.currentState ? JSON.stringify(options.currentState) : 'Unknown'}

User Request: ${userPrompt}

As an expert theater director, create a compelling performance response that:
1. Uses the available function tools to control actors, lighting, and camera
2. Creates visually interesting stage compositions
3. Maintains dramatic flow and pacing
4. Responds appropriately to the user's request
5. Consider actor safety and realistic movement constraints

Generate specific, actionable directions using function calls.
Be creative but practical. Focus on immediate, implementable actions.
`;
    }

    /**
     * Get system prompt for theater AI personality
     */
    getSystemPrompt() {
        return `You are an expert AI theater director with deep knowledge of stagecraft, choreography, and dramatic storytelling. You have complete control over a 3D theater stage with actors, lighting, camera angles, and stage elements.

Your directing style is ${this.directorPersonality} and you excel at:
- Creating visually compelling stage compositions
- Coordinating actor movements for maximum dramatic impact
- Using lighting to enhance mood and atmosphere
- Adapting performances in real-time based on context
- Balancing artistic vision with practical constraints

You communicate through function calls that directly control the stage. Always provide clear reasoning for your creative choices and consider the overall flow of the performance.

Stage specifications:
- Dimensions: 20 units wide × 15 units deep
- 20 stage markers positioned across upstage, center, and downstage areas
- Backstage areas on left and right for actor staging
- Full lighting, camera, and curtain control available

Be bold, creative, and precise in your directions.`;
    }

    /**
     * Integrate with existing theater API system
     */
    async integrateWithTheaterAPI() {
        if (!window.theaterAPI) {
            console.warn('TheaterAPI not available - some functions may be limited');
            return;
        }

        // Test API connectivity
        try {
            await window.theaterAPI.get('/api/state');
            console.log('🎭 OllamaInterface: Successfully integrated with TheaterAPI');
        } catch (error) {
            console.warn('🎭 OllamaInterface: TheaterAPI integration limited:', error.message);
        }
    }

    /**
     * Process AI response and extract actionable content
     */
    processAIResponse(data) {
        const response = {
            content: data.message?.content || '',
            toolCalls: data.message?.tool_calls || [],
            model: data.model,
            timestamp: Date.now()
        };

        // Execute function calls if present
        if (response.toolCalls.length > 0) {
            this.executeToolCalls(response.toolCalls);
        }

        return response;
    }

    /**
     * Broadcast director narrative to UI
     */
    broadcastDirectorNarrative(content) {
        if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('ai-director-narrative', {
                detail: { content, timestamp: Date.now() }
            }));
        }
    }

    /**
     * Update performance context
     */
    updatePerformanceContext(updates) {
        this.performanceContext = {
            ...this.performanceContext,
            ...updates
        };

        console.log('🎭 Performance context updated:', this.performanceContext);
    }

    /**
     * Update response statistics
     */
    updateResponseStats(responseTime) {
        this.responseCount++;
        this.avgResponseTime = (this.avgResponseTime * (this.responseCount - 1) + responseTime) / this.responseCount;
    }

    /**
     * Get interface statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            isConnected: this.isConnected,
            defaultModel: this.defaultModel,
            availableModels: Array.from(this.availableModels),
            avgResponseTime: Math.round(this.avgResponseTime),
            responseCount: this.responseCount,
            cacheSize: this.responseCache.size,
            performanceContext: { ...this.performanceContext }
        };
    }

    /**
     * Disconnect and cleanup
     */
    disconnect() {
        this.isConnected = false;
        this.responseCache.clear();
        console.log('🎭 OllamaInterface: Disconnected from local AI');
    }
}

// Create global instance
const ollamaTheaterInterface = new OllamaTheaterInterface();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.OllamaTheaterInterface = OllamaTheaterInterface;
    window.ollamaTheaterInterface = ollamaTheaterInterface;
    console.log('🎭 OllamaInterface loaded - Local AI theater control available');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OllamaTheaterInterface, ollamaTheaterInterface };
}