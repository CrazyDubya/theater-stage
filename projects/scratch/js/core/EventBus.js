/**
 * EventBus.js - Simple publish/subscribe event system for agent communication
 * 
 * Provides a centralized communication channel for all agents:
 * - Topic-based subscriptions
 * - Async event handling
 * - Event history tracking
 * - Performance monitoring
 */

class EventBus {
    constructor() {
        this.subscribers = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 1000;
        this.metrics = {
            totalEvents: 0,
            totalSubscriptions: 0,
            eventsByTopic: new Map()
        };
        
        console.log('EventBus initialized');
    }
    
    /**
     * Subscribe to an event topic
     * @param {string} topic - The event topic to subscribe to
     * @param {function} handler - The callback function to handle the event
     * @returns {function} Unsubscribe function
     */
    subscribe(topic, handler) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        
        this.subscribers.get(topic).add(handler);
        this.metrics.totalSubscriptions++;
        
        console.log(`EventBus: New subscription to '${topic}' (${this.subscribers.get(topic).size} total)`);
        
        // Return unsubscribe function
        return () => {
            const handlers = this.subscribers.get(topic);
            if (handlers) {
                handlers.delete(handler);
                if (handlers.size === 0) {
                    this.subscribers.delete(topic);
                }
            }
        };
    }
    
    /**
     * Publish an event to a topic
     * @param {string} topic - The event topic
     * @param {object} data - The event data
     */
    async publish(topic, data = {}) {
        const event = {
            topic,
            data,
            timestamp: Date.now(),
            id: `${topic}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        // Add to history
        this.addToHistory(event);
        
        // Update metrics
        this.metrics.totalEvents++;
        this.metrics.eventsByTopic.set(topic, 
            (this.metrics.eventsByTopic.get(topic) || 0) + 1
        );
        
        // Get all handlers for this topic
        const handlers = this.subscribers.get(topic) || new Set();
        
        // Also get wildcard handlers
        const wildcardHandlers = this.getWildcardHandlers(topic);
        
        // Combine all handlers
        const allHandlers = new Set([...handlers, ...wildcardHandlers]);
        
        console.log(`EventBus: Publishing '${topic}' to ${allHandlers.size} handlers`);
        
        // Execute handlers asynchronously
        const promises = [];
        for (const handler of allHandlers) {
            promises.push(this.executeHandler(handler, event));
        }
        
        // Wait for all handlers to complete
        await Promise.allSettled(promises);
    }
    
    /**
     * Execute a handler safely
     */
    async executeHandler(handler, event) {
        try {
            await handler(event.data);
        } catch (error) {
            console.error(`EventBus: Handler error for '${event.topic}':`, error);
        }
    }
    
    /**
     * Get handlers that match wildcard patterns
     */
    getWildcardHandlers(topic) {
        const handlers = new Set();
        
        for (const [pattern, patternHandlers] of this.subscribers) {
            if (pattern.includes('*')) {
                const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                if (regex.test(topic)) {
                    for (const handler of patternHandlers) {
                        handlers.add(handler);
                    }
                }
            }
        }
        
        return handlers;
    }
    
    /**
     * Add event to history
     */
    addToHistory(event) {
        this.eventHistory.push(event);
        
        // Trim history if too large
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
        }
    }
    
    /**
     * Get event history
     */
    getHistory(topic = null, limit = 100) {
        let history = this.eventHistory;
        
        if (topic) {
            history = history.filter(event => event.topic === topic);
        }
        
        return history.slice(-limit);
    }
    
    /**
     * Clear all subscriptions
     */
    clear() {
        this.subscribers.clear();
        this.eventHistory = [];
        console.log('EventBus: All subscriptions cleared');
    }
    
    /**
     * Subscribe to multiple topics with a single handler
     */
    subscribeToTopics(topics, handler) {
        const unsubscribeFunctions = topics.map(topic => this.subscribe(topic, handler));
        
        // Return function to unsubscribe from all topics
        return () => {
            unsubscribeFunctions.forEach(unsub => unsub());
        };
    }
    
    /**
     * Publish to multiple topics
     */
    publishToTopics(topics, data = {}) {
        return Promise.all(topics.map(topic => this.publish(topic, data)));
    }
    
    /**
     * Get recent events for analysis
     */
    getRecentEvents(minutes = 5) {
        const cutoff = Date.now() - (minutes * 60 * 1000);
        return this.eventHistory.filter(event => event.timestamp >= cutoff);
    }
    
    /**
     * Get event patterns and flows
     */
    analyzeEventPatterns() {
        const recentEvents = this.getRecentEvents(10);
        const patterns = {};
        
        // Analyze event sequences
        for (let i = 0; i < recentEvents.length - 1; i++) {
            const current = recentEvents[i].topic;
            const next = recentEvents[i + 1].topic;
            const pattern = `${current} -> ${next}`;
            
            patterns[pattern] = (patterns[pattern] || 0) + 1;
        }
        
        // Sort by frequency
        return Object.entries(patterns)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([pattern, count]) => ({ pattern, count }));
    }
    
    /**
     * Get topics by category
     */
    getTopicsByCategory() {
        const categories = {};
        
        for (const topic of this.subscribers.keys()) {
            const category = topic.split(':')[0];
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(topic);
        }
        
        return categories;
    }
    
    /**
     * Get bus statistics
     */
    getStats() {
        return {
            totalSubscribers: this.subscribers.size,
            totalEvents: this.metrics.totalEvents,
            activeTopics: Array.from(this.subscribers.keys()),
            eventsByTopic: Object.fromEntries(this.metrics.eventsByTopic),
            historySize: this.eventHistory.length,
            topicCategories: this.getTopicsByCategory(),
            recentEventCount: this.getRecentEvents().length,
            eventPatterns: this.analyzeEventPatterns()
        };
    }
}

// Create singleton instance
const theaterEventBus = new EventBus();

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventBus, theaterEventBus };
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
    window.theaterEventBus = theaterEventBus;
    console.log('Theater EventBus ready for agent communication');
}