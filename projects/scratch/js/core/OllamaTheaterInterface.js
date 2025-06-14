/**
 * OllamaTheaterInterface.js - Ollama LLM integration for theater agents
 * 
 * Provides a unified interface for all agents to communicate with Ollama:
 * - Connection management
 * - Request queuing and rate limiting
 * - Context management
 * - Response caching
 * 
 * NOTE: This is a stub implementation. Full Ollama integration requires:
 * 1. Ollama server running locally (ollama serve)
 * 2. Appropriate model installed (ollama pull llama3.1)
 * 3. HTTP client for API communication
 */

class OllamaTheaterInterface {
    constructor() {
        this.config = {
            baseUrl: 'http://localhost:11434',
            model: 'llama3.1',
            defaultTimeout: 30000,
            maxRetries: 3,
            rateLimitDelay: 100 // ms between requests
        };
        
        this.state = {
            isInitialized: false,
            isConnected: false,
            lastRequest: null,
            activeRequests: 0,
            totalRequests: 0
        };
        
        this.performanceContext = {
            role: 'theater_agent',
            production: null,
            specialization: null
        };
        
        // Request queue for rate limiting
        this.requestQueue = [];
        this.processing = false;
        
        // Response cache
        this.responseCache = new Map();
        this.maxCacheSize = 100;
        
        console.log('OllamaTheaterInterface created');
    }
    
    /**
     * Initialize the Ollama interface
     */
    async initialize() {
        try {
            console.log('Initializing Ollama interface...');
            
            // In production, this would check Ollama server availability
            // For now, we'll simulate initialization
            await this.checkConnection();
            
            this.state.isInitialized = true;
            console.log('Ollama interface initialized');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize Ollama interface:', error);
            return false;
        }
    }
    
    /**
     * Check connection to Ollama server
     */
    async checkConnection() {
        try {
            // In production, this would make an actual API call to Ollama
            // For now, we'll simulate a connection check
            console.log('Checking Ollama connection...');
            
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // For development, always return connected
            // In production, this would check actual server status
            this.state.isConnected = true;
            console.log('Ollama connection established');
            
            return true;
        } catch (error) {
            console.error('Ollama connection failed:', error);
            this.state.isConnected = false;
            return false;
        }
    }
    
    /**
     * Update performance context for better responses
     */
    updatePerformanceContext(context) {
        this.performanceContext = {
            ...this.performanceContext,
            ...context
        };
        console.log('Performance context updated:', this.performanceContext);
    }
    
    /**
     * Generate a performance (main method for agent use)
     */
    async generatePerformance(prompt, options = {}) {
        const request = {
            prompt,
            options: {
                temperature: options.temperature || 0.7,
                max_tokens: options.max_tokens || 500,
                timeout: options.timeout || this.config.defaultTimeout,
                ...options
            },
            context: this.performanceContext,
            timestamp: Date.now()
        };
        
        // Check cache first
        const cacheKey = this.getCacheKey(request);
        if (this.responseCache.has(cacheKey)) {
            console.log('Returning cached response');
            return this.responseCache.get(cacheKey);
        }
        
        // Add to queue
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ request, resolve, reject });
            this.processQueue();
        });
    }
    
    /**
     * Process the request queue
     */
    async processQueue() {
        if (this.processing || this.requestQueue.length === 0) return;
        
        this.processing = true;
        
        while (this.requestQueue.length > 0) {
            const { request, resolve, reject } = this.requestQueue.shift();
            
            try {
                // Rate limiting
                if (this.state.lastRequest) {
                    const elapsed = Date.now() - this.state.lastRequest;
                    if (elapsed < this.config.rateLimitDelay) {
                        await new Promise(r => setTimeout(r, this.config.rateLimitDelay - elapsed));
                    }
                }
                
                // Make the request
                const response = await this.makeRequest(request);
                
                // Cache the response
                this.cacheResponse(request, response);
                
                // Update state
                this.state.lastRequest = Date.now();
                this.state.totalRequests++;
                
                resolve(response);
            } catch (error) {
                reject(error);
            }
        }
        
        this.processing = false;
    }
    
    /**
     * Make actual request to Ollama
     */
    async makeRequest(request) {
        this.state.activeRequests++;
        
        try {
            // In production, this would make an actual HTTP request to Ollama API
            // For now, we'll simulate a response based on the context
            console.log(`Ollama request for ${this.performanceContext.role}:`, 
                request.prompt.substring(0, 100) + '...');
            
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
            
            // Generate a contextual mock response
            const response = this.generateMockResponse(request);
            
            return response;
        } finally {
            this.state.activeRequests--;
        }
    }
    
    /**
     * Generate a mock response based on context
     */
    generateMockResponse(request) {
        const { role, specialization } = this.performanceContext;
        
        // Create a response that acknowledges the role and request
        let content = `As a ${role}`;
        if (specialization) {
            content += ` specializing in ${specialization}`;
        }
        content += `, I understand your request.\n\n`;
        
        // Add some role-specific mock content
        const roleMocks = {
            'creative_director': 'I envision a production that explores the human condition through innovative staging and emotional depth.',
            'fight_choreographer': 'Safety is paramount. I recommend stage combat techniques that prioritize performer wellbeing while maintaining dramatic impact.',
            'makeup_artist': 'I propose character transformations using professional theatrical makeup techniques and period-appropriate designs.',
            'lighting_designer': 'I suggest a lighting design that enhances mood, supports the narrative, and creates visual poetry on stage.',
            'sound_designer': 'I recommend a soundscape that immerses the audience while supporting the emotional journey of the performance.'
        };
        
        content += roleMocks[role] || 'I will provide professional expertise to enhance this production.';
        
        return {
            content,
            model: this.config.model,
            created_at: new Date().toISOString(),
            done: true,
            context: this.performanceContext,
            eval_count: content.length,
            eval_duration: 1000000 * (200 + Math.random() * 100)
        };
    }
    
    /**
     * Get cache key for a request
     */
    getCacheKey(request) {
        return `${request.context.role}_${request.context.specialization}_${
            request.prompt.substring(0, 50)}_${request.options.temperature}`;
    }
    
    /**
     * Cache a response
     */
    cacheResponse(request, response) {
        const key = this.getCacheKey(request);
        this.responseCache.set(key, response);
        
        // Trim cache if too large
        if (this.responseCache.size > this.maxCacheSize) {
            const firstKey = this.responseCache.keys().next().value;
            this.responseCache.delete(firstKey);
        }
    }
    
    /**
     * Get interface statistics
     */
    getStats() {
        return {
            state: this.state,
            queueLength: this.requestQueue.length,
            cacheSize: this.responseCache.size,
            performanceContext: this.performanceContext
        };
    }
}

// Create singleton instance
const ollamaTheaterInterface = new OllamaTheaterInterface();

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OllamaTheaterInterface, ollamaTheaterInterface };
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.OllamaTheaterInterface = OllamaTheaterInterface;
    window.ollamaTheaterInterface = ollamaTheaterInterface;
    console.log('Ollama Theater Interface ready (mock mode)');
}