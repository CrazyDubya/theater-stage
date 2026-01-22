/**
 * @file Performance Profiling Utility
 * @module performance-profiler
 * 
 * Provides utilities for measuring and tracking performance metrics
 * in the theater-stage application.
 */

/**
 * @typedef {Object} PerformanceMetric
 * @property {string} name - Name of the metric
 * @property {number} duration - Duration in milliseconds
 * @property {number} timestamp - Timestamp when measurement was taken
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Performance Profiler class for tracking application performance
 */
export class PerformanceProfiler {
    constructor() {
        /** @type {Map<string, number>} */
        this.startTimes = new Map();
        
        /** @type {Array<PerformanceMetric>} */
        this.metrics = [];
        
        /** @type {Map<string, Array<number>>} */
        this.metricHistory = new Map();
        
        this.maxHistoryLength = 100;
    }

    /**
     * Start timing a performance metric
     * @param {string} name - Name of the metric to track
     * @returns {void}
     */
    start(name) {
        this.startTimes.set(name, performance.now());
    }

    /**
     * End timing a performance metric and record it
     * @param {string} name - Name of the metric being tracked
     * @param {Object} [metadata] - Optional metadata to attach
     * @returns {number|null} Duration in milliseconds, or null if not started
     */
    end(name, metadata = {}) {
        const startTime = this.startTimes.get(name);
        if (!startTime) {
            console.warn(`Performance metric "${name}" was never started`);
            return null;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Record metric
        const metric = {
            name,
            duration,
            timestamp: endTime,
            metadata
        };
        this.metrics.push(metric);

        // Update history
        if (!this.metricHistory.has(name)) {
            this.metricHistory.set(name, []);
        }
        const history = this.metricHistory.get(name);
        history.push(duration);
        
        // Limit history size
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }

        this.startTimes.delete(name);
        return duration;
    }

    /**
     * Measure a synchronous function
     * @param {string} name - Name of the measurement
     * @param {Function} fn - Function to measure
     * @returns {*} Return value of the function
     */
    measure(name, fn) {
        this.start(name);
        const result = fn();
        this.end(name);
        return result;
    }

    /**
     * Measure an async function
     * @param {string} name - Name of the measurement
     * @param {Function} fn - Async function to measure
     * @returns {Promise<*>} Promise resolving to function return value
     */
    async measureAsync(name, fn) {
        this.start(name);
        const result = await fn();
        this.end(name);
        return result;
    }

    /**
     * Get statistics for a specific metric
     * @param {string} name - Name of the metric
     * @returns {Object|null} Statistics object or null if no data
     */
    getStats(name) {
        const history = this.metricHistory.get(name);
        if (!history || history.length === 0) {
            return null;
        }

        const sorted = [...history].sort((a, b) => a - b);
        const sum = sorted.reduce((acc, val) => acc + val, 0);
        const avg = sum / sorted.length;
        const min = sorted[0];
        const max = sorted[sorted.length - 1];
        const median = sorted[Math.floor(sorted.length / 2)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];

        return {
            name,
            count: sorted.length,
            avg: avg.toFixed(2),
            min: min.toFixed(2),
            max: max.toFixed(2),
            median: median.toFixed(2),
            p95: p95.toFixed(2),
            p99: p99.toFixed(2)
        };
    }

    /**
     * Get all recorded metrics
     * @returns {Array<PerformanceMetric>}
     */
    getMetrics() {
        return [...this.metrics];
    }

    /**
     * Get statistics for all tracked metrics
     * @returns {Array<Object>}
     */
    getAllStats() {
        const stats = [];
        for (const [name] of this.metricHistory) {
            const stat = this.getStats(name);
            if (stat) {
                stats.push(stat);
            }
        }
        return stats;
    }

    /**
     * Print performance report to console
     * @param {string} [filter] - Optional filter for metric names
     * @returns {void}
     */
    report(filter = null) {
        const stats = this.getAllStats();
        const filtered = filter 
            ? stats.filter(s => s.name.includes(filter))
            : stats;

        if (filtered.length === 0) {
            console.log('No performance metrics recorded');
            return;
        }

        console.log('\n=== Performance Report ===');
        console.table(filtered);
    }

    /**
     * Clear all recorded metrics
     * @returns {void}
     */
    clear() {
        this.startTimes.clear();
        this.metrics = [];
        this.metricHistory.clear();
    }

    /**
     * Export metrics as JSON
     * @returns {string} JSON string of metrics
     */
    export() {
        return JSON.stringify({
            metrics: this.metrics,
            stats: this.getAllStats(),
            timestamp: Date.now()
        }, null, 2);
    }
}

/**
 * Global profiler instance
 * @type {PerformanceProfiler}
 */
export const profiler = new PerformanceProfiler();

/**
 * Create a Frame Rate Monitor
 */
export class FPSMonitor {
    constructor() {
        this.frameTimes = [];
        this.lastTime = performance.now();
        this.maxSamples = 60;
    }

    /**
     * Record a frame
     * @returns {number} Current FPS
     */
    tick() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.lastTime = now;

        this.frameTimes.push(delta);
        if (this.frameTimes.length > this.maxSamples) {
            this.frameTimes.shift();
        }

        return this.getFPS();
    }

    /**
     * Get current FPS
     * @returns {number} Frames per second
     */
    getFPS() {
        if (this.frameTimes.length === 0) {
            return 0;
        }
        const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        return Math.round(1000 / avg);
    }

    /**
     * Get average frame time
     * @returns {number} Average frame time in milliseconds
     */
    getAvgFrameTime() {
        if (this.frameTimes.length === 0) {
            return 0;
        }
        return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    }

    /**
     * Reset the monitor
     */
    reset() {
        this.frameTimes = [];
        this.lastTime = performance.now();
    }
}

/**
 * Global FPS monitor instance
 * @type {FPSMonitor}
 */
export const fpsMonitor = new FPSMonitor();
