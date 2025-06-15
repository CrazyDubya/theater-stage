/**
 * OllamaConnector.js - Real Ollama API Integration for Theater Agents
 * 
 * Provides actual connection to local Ollama instance for AI-powered
 * agent reasoning and content generation. Uses OpenAI-compatible API.
 * 
 * Features:
 * - OpenAI-compatible API endpoint
 * - Request queuing and rate limiting
 * - Context management for agents
 * - Retry logic with exponential backoff
 * - Response caching for efficiency
 * - Real-time streaming support
 */

class OllamaConnector {
    constructor(config = {}) {
        this.config = {
            baseURL: config.baseURL || 'http://localhost:11434/v1',
            model: config.model || 'llama3.1',
            timeout: config.timeout || 120000, // 2 minutes for long generations
            maxRetries: config.maxRetries || 3,
            rateLimit: config.rateLimit || 100, // ms between requests
            temperature: config.temperature || 0.7,
            maxTokens: config.maxTokens || 4096
        };
        
        this.state = {
            isConnected: false,
            activeRequests: 0,
            totalRequests: 0,
            totalTokens: 0,
            errors: []
        };
        
        // Request queue for rate limiting
        this.requestQueue = [];
        this.processing = false;
        
        // Response cache
        this.cache = new Map();
        this.cacheMaxSize = 100;
        
        // Agent contexts
        this.agentContexts = new Map();
        
        console.log('🔌 OllamaConnector: Initialized with config:', this.config);
    }

    /**
     * Test connection to Ollama
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.config.baseURL}/models`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.state.isConnected = true;
                console.log('✅ OllamaConnector: Connected successfully');
                console.log('📋 Available models:', data);
                return { success: true, models: data };
            } else {
                throw new Error(`Connection failed: ${response.statusText}`);
            }
        } catch (error) {
            this.state.isConnected = false;
            this.state.errors.push({
                timestamp: new Date(),
                error: error.message
            });
            console.error('❌ OllamaConnector: Connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate completion for an agent
     */
    async generateCompletion(agentId, prompt, options = {}) {
        return new Promise((resolve, reject) => {
            const request = {
                agentId,
                prompt,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            };
            
            this.requestQueue.push(request);
            this.processQueue();
        });
    }

    /**
     * Process request queue with rate limiting
     */
    async processQueue() {
        if (this.processing || this.requestQueue.length === 0) return;
        
        this.processing = true;
        
        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift();
            
            try {
                const result = await this.executeRequest(request);
                request.resolve(result);
            } catch (error) {
                request.reject(error);
            }
            
            // Rate limiting
            if (this.requestQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, this.config.rateLimit));
            }
        }
        
        this.processing = false;
    }

    /**
     * Execute a single request with retry logic
     */
    async executeRequest(request, retryCount = 0) {
        const { agentId, prompt, options } = request;
        
        // Check cache first
        const cacheKey = `${agentId}:${prompt.substring(0, 100)}`;
        if (this.cache.has(cacheKey) && !options.noCache) {
            console.log('📦 OllamaConnector: Using cached response');
            return this.cache.get(cacheKey);
        }
        
        // Get agent context
        const context = this.getAgentContext(agentId);
        
        // Build messages array
        const messages = [
            {
                role: 'system',
                content: context.systemPrompt || `You are ${agentId}, a theater production agent.`
            }
        ];
        
        // Add conversation history
        if (context.history) {
            messages.push(...context.history);
        }
        
        // Add current prompt
        messages.push({
            role: 'user',
            content: prompt
        });
        
        try {
            this.state.activeRequests++;
            
            const response = await fetch(`${this.config.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ollama' // Required but unused
                },
                body: JSON.stringify({
                    model: options.model || this.config.model,
                    messages: messages,
                    temperature: options.temperature || this.config.temperature,
                    max_tokens: options.maxTokens || this.config.maxTokens,
                    stream: false
                }),
                signal: AbortSignal.timeout(this.config.timeout)
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Update statistics
            this.state.totalRequests++;
            this.state.totalTokens += data.usage?.total_tokens || 0;
            this.state.activeRequests--;
            
            // Extract response
            const result = {
                content: data.choices[0].message.content,
                usage: data.usage,
                model: data.model,
                timestamp: new Date()
            };
            
            // Update context history
            this.updateAgentContext(agentId, prompt, result.content);
            
            // Cache response
            this.cache.set(cacheKey, result);
            this.maintainCacheSize();
            
            console.log(`✅ OllamaConnector: Generated response for ${agentId}`);
            return result;
            
        } catch (error) {
            this.state.activeRequests--;
            
            // Retry logic
            if (retryCount < this.config.maxRetries) {
                console.warn(`⚠️ OllamaConnector: Retry ${retryCount + 1} for ${agentId}`);
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
                return this.executeRequest(request, retryCount + 1);
            }
            
            // Log error
            this.state.errors.push({
                timestamp: new Date(),
                agentId,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Get or create agent context
     */
    getAgentContext(agentId) {
        if (!this.agentContexts.has(agentId)) {
            this.agentContexts.set(agentId, {
                agentId,
                systemPrompt: null,
                history: [],
                metadata: {}
            });
        }
        return this.agentContexts.get(agentId);
    }

    /**
     * Update agent context with conversation history
     */
    updateAgentContext(agentId, userPrompt, assistantResponse) {
        const context = this.getAgentContext(agentId);
        
        // Add to history
        context.history.push(
            { role: 'user', content: userPrompt },
            { role: 'assistant', content: assistantResponse }
        );
        
        // Keep only last 10 exchanges
        if (context.history.length > 20) {
            context.history = context.history.slice(-20);
        }
    }

    /**
     * Set system prompt for an agent
     */
    setAgentSystemPrompt(agentId, systemPrompt) {
        const context = this.getAgentContext(agentId);
        context.systemPrompt = systemPrompt;
        console.log(`🎭 OllamaConnector: Set system prompt for ${agentId}`);
    }

    /**
     * Clear agent context
     */
    clearAgentContext(agentId) {
        if (this.agentContexts.has(agentId)) {
            this.agentContexts.delete(agentId);
            console.log(`🗑️ OllamaConnector: Cleared context for ${agentId}`);
        }
    }

    /**
     * Maintain cache size
     */
    maintainCacheSize() {
        if (this.cache.size > this.cacheMaxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    /**
     * Get connector statistics
     */
    getStatistics() {
        return {
            isConnected: this.state.isConnected,
            activeRequests: this.state.activeRequests,
            totalRequests: this.state.totalRequests,
            totalTokens: this.state.totalTokens,
            queueLength: this.requestQueue.length,
            cacheSize: this.cache.size,
            errorCount: this.state.errors.length,
            recentErrors: this.state.errors.slice(-5)
        };
    }

    /**
     * Stream completion for real-time generation
     */
    async streamCompletion(agentId, prompt, onChunk, options = {}) {
        const context = this.getAgentContext(agentId);
        
        const messages = [
            {
                role: 'system',
                content: context.systemPrompt || `You are ${agentId}, a theater production agent.`
            },
            ...context.history,
            {
                role: 'user',
                content: prompt
            }
        ];
        
        try {
            const response = await fetch(`${this.config.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ollama'
                },
                body: JSON.stringify({
                    model: options.model || this.config.model,
                    messages: messages,
                    temperature: options.temperature || this.config.temperature,
                    max_tokens: options.maxTokens || this.config.maxTokens,
                    stream: true
                })
            });
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0]?.delta?.content || '';
                            fullContent += content;
                            
                            if (content && onChunk) {
                                onChunk(content);
                            }
                        } catch (e) {
                            // Ignore parse errors
                        }
                    }
                }
            }
            
            // Update context
            this.updateAgentContext(agentId, prompt, fullContent);
            
            return { content: fullContent };
            
        } catch (error) {
            console.error(`❌ OllamaConnector: Stream error for ${agentId}:`, error);
            throw error;
        }
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OllamaConnector;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.OllamaConnector = OllamaConnector;
    console.log('🔌 OllamaConnector loaded - Ready for real AI agent integration');
}