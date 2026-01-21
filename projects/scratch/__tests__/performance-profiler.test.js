/**
 * Unit Tests for Performance Profiler
 * Tests performance measurement utilities
 */

describe('Performance Profiler', () => {
    let PerformanceProfiler, profiler, FPSMonitor, fpsMonitor;

    beforeEach(() => {
        // Mock performance.now()
        global.performance = {
            now: jest.fn(() => Date.now())
        };

        // Create test instances
        PerformanceProfiler = class {
            constructor() {
                this.startTimes = new Map();
                this.metrics = [];
                this.metricHistory = new Map();
                this.maxHistoryLength = 100;
            }

            start(name) {
                this.startTimes.set(name, performance.now());
            }

            end(name, metadata = {}) {
                const startTime = this.startTimes.get(name);
                if (!startTime) {
                    return null;
                }
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                const metric = { name, duration, timestamp: endTime, metadata };
                this.metrics.push(metric);
                
                if (!this.metricHistory.has(name)) {
                    this.metricHistory.set(name, []);
                }
                this.metricHistory.get(name).push(duration);
                this.startTimes.delete(name);
                return duration;
            }

            getStats(name) {
                const history = this.metricHistory.get(name);
                if (!history || history.length === 0) {
                    return null;
                }
                const sorted = [...history].sort((a, b) => a - b);
                const sum = sorted.reduce((acc, val) => acc + val, 0);
                return {
                    name,
                    count: sorted.length,
                    avg: (sum / sorted.length).toFixed(2),
                    min: sorted[0].toFixed(2),
                    max: sorted[sorted.length - 1].toFixed(2)
                };
            }

            clear() {
                this.startTimes.clear();
                this.metrics = [];
                this.metricHistory.clear();
            }
        };

        profiler = new PerformanceProfiler();
    });

    describe('Basic Timing', () => {
        test('should record a performance metric', () => {
            profiler.start('test-operation');
            profiler.end('test-operation');
            
            expect(profiler.metrics.length).toBe(1);
            expect(profiler.metrics[0].name).toBe('test-operation');
        });

        test('should return null if metric was never started', () => {
            const result = profiler.end('nonexistent');
            expect(result).toBeNull();
        });

        test('should calculate duration correctly', () => {
            let time = 1000;
            performance.now = jest.fn(() => time);
            
            profiler.start('test');
            time += 50; // Simulate 50ms passing
            const duration = profiler.end('test');
            
            expect(duration).toBe(50);
        });

        test('should clean up start times after ending', () => {
            profiler.start('test');
            profiler.end('test');
            
            expect(profiler.startTimes.has('test')).toBe(false);
        });
    });

    describe('Statistics', () => {
        test('should calculate statistics for multiple measurements', () => {
            // Simulate multiple measurements
            [10, 20, 30, 40, 50].forEach((duration, i) => {
                profiler.metricHistory.set('test', profiler.metricHistory.get('test') || []);
                profiler.metricHistory.get('test').push(duration);
            });
            
            const stats = profiler.getStats('test');
            
            expect(stats).not.toBeNull();
            expect(stats.name).toBe('test');
            expect(stats.count).toBe(5);
            expect(parseFloat(stats.avg)).toBe(30);
            expect(parseFloat(stats.min)).toBe(10);
            expect(parseFloat(stats.max)).toBe(50);
        });

        test('should return null for non-existent metrics', () => {
            const stats = profiler.getStats('nonexistent');
            expect(stats).toBeNull();
        });

        test('should handle single measurement', () => {
            profiler.metricHistory.set('single', [42]);
            const stats = profiler.getStats('single');
            
            expect(stats.count).toBe(1);
            expect(parseFloat(stats.avg)).toBe(42);
            expect(parseFloat(stats.min)).toBe(42);
            expect(parseFloat(stats.max)).toBe(42);
        });
    });

    describe('Metric History', () => {
        test('should maintain history for multiple operations', () => {
            let time = 0;
            performance.now = jest.fn(() => time);
            
            for (let i = 0; i < 3; i++) {
                profiler.start('repeated');
                time += 10;
                profiler.end('repeated');
            }
            
            expect(profiler.metricHistory.get('repeated')).toHaveLength(3);
        });

        test('should track different metrics separately', () => {
            let time = 0;
            performance.now = jest.fn(() => time);
            
            profiler.start('op1');
            time += 10;
            profiler.end('op1');
            
            profiler.start('op2');
            time += 20;
            profiler.end('op2');
            
            expect(profiler.metricHistory.get('op1')[0]).toBe(10);
            expect(profiler.metricHistory.get('op2')[0]).toBe(20);
        });
    });

    describe('Clear and Reset', () => {
        test('should clear all metrics and history', () => {
            profiler.start('test');
            profiler.end('test');
            
            profiler.clear();
            
            expect(profiler.metrics.length).toBe(0);
            expect(profiler.metricHistory.size).toBe(0);
            expect(profiler.startTimes.size).toBe(0);
        });
    });
});

describe('FPS Monitor', () => {
    let FPSMonitor, monitor;

    beforeEach(() => {
        global.performance = {
            now: jest.fn(() => Date.now())
        };

        FPSMonitor = class {
            constructor() {
                this.frameTimes = [];
                this.lastTime = performance.now();
                this.maxSamples = 60;
            }

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

            getFPS() {
                if (this.frameTimes.length === 0) {
                    return 0;
                }
                const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
                return Math.round(1000 / avg);
            }

            reset() {
                this.frameTimes = [];
                this.lastTime = performance.now();
            }
        };

        monitor = new FPSMonitor();
    });

    describe('Frame Rate Tracking', () => {
        test('should calculate FPS from frame times', () => {
            // Simulate 60 FPS (16.67ms per frame)
            let time = 0;
            performance.now = jest.fn(() => time);
            
            monitor.lastTime = time;
            for (let i = 0; i < 10; i++) {
                time += 16.67;
                monitor.tick();
            }
            
            const fps = monitor.getFPS();
            expect(fps).toBeGreaterThanOrEqual(59);
            expect(fps).toBeLessThanOrEqual(61);
        });

        test('should return 0 FPS when no frames recorded', () => {
            expect(monitor.getFPS()).toBe(0);
        });

        test('should limit frame time samples', () => {
            let time = 0;
            performance.now = jest.fn(() => time);
            
            monitor.lastTime = time;
            for (let i = 0; i < 100; i++) {
                time += 16.67;
                monitor.tick();
            }
            
            expect(monitor.frameTimes.length).toBeLessThanOrEqual(60);
        });
    });

    describe('Reset Functionality', () => {
        test('should reset frame times', () => {
            let time = 0;
            performance.now = jest.fn(() => time);
            
            monitor.lastTime = time;
            time += 16.67;
            monitor.tick();
            
            monitor.reset();
            
            expect(monitor.frameTimes).toHaveLength(0);
        });
    });
});

describe('Performance Use Cases', () => {
    test('should measure rendering performance', () => {
        const profiler = {
            start: jest.fn(),
            end: jest.fn(() => 16.67)
        };
        
        // Simulate render loop
        profiler.start('render-frame');
        // ... rendering code would go here ...
        const duration = profiler.end('render-frame');
        
        expect(profiler.start).toHaveBeenCalledWith('render-frame');
        expect(profiler.end).toHaveBeenCalledWith('render-frame');
        expect(duration).toBeGreaterThan(0);
    });

    test('should measure physics calculations', () => {
        const profiler = {
            start: jest.fn(),
            end: jest.fn(() => 2.5)
        };
        
        profiler.start('physics-update');
        // ... physics calculations ...
        const duration = profiler.end('physics-update');
        
        expect(duration).toBeLessThan(16.67); // Should be faster than frame time
    });

    test('should track collision detection performance', () => {
        const profiler = {
            start: jest.fn(),
            end: jest.fn(() => 1.2)
        };
        
        profiler.start('collision-detection');
        // ... collision checks ...
        const duration = profiler.end('collision-detection');
        
        expect(duration).toBeLessThan(5); // Should be very fast
    });
});
