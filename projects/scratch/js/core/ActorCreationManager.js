/**
 * ActorCreationManager.js - Clean Actor Creation System
 * 
 * COMPLETELY SEPARATE from ObjectFactory.js to avoid contamination.
 * Manages multiple actor systems without interference.
 */

class ActorCreationManager {
    constructor() {
        this.isInitialized = false;
        this.availableSystems = [];
        this.primarySystem = null;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('ActorCreationManager: Initializing clean actor creation...');
        
        // Initialize Primitive Actor System (PRIMARY)
        if (window.primitiveActorSystem) {
            await window.primitiveActorSystem.initialize();
            if (window.primitiveActorSystem.isInitialized) {
                this.primarySystem = 'primitive';
                this.availableSystems.push('primitive');
                console.log('✅ Primitive Actor System ready');
            }
        }
        
        // Initialize Enhanced Actor System (SECONDARY - only if working)
        if (window.enhancedActorSystem) {
            try {
                await window.enhancedActorSystem.initialize();
                if (window.enhancedActorSystem.isInitialized) {
                    this.availableSystems.push('enhanced');
                    console.log('✅ Enhanced Actor System ready');
                }
            } catch (error) {
                console.warn('⚠️ Enhanced Actor System failed, skipping:', error.message);
            }
        }
        
        // Initialize Advanced Actor System V2 (TERTIARY)
        if (window.advancedActorSystemV2) {
            try {
                await window.advancedActorSystemV2.initialize();
                if (window.advancedActorSystemV2.isInitialized) {
                    this.availableSystems.push('advanced');
                    console.log('✅ Advanced Actor System V2 ready');
                }
            } catch (error) {
                console.warn('⚠️ Advanced Actor System V2 failed, skipping:', error.message);
            }
        }
        
        this.isInitialized = true;
        console.log(`🎭 ActorCreationManager ready with systems: [${this.availableSystems.join(', ')}]`);
        console.log(`🎯 Primary system: ${this.primarySystem}`);
    }

    async createActor(actorType, position = { x: 0, y: 0, z: 0 }) {
        if (!this.isInitialized) {
            console.error('ActorCreationManager: Not initialized!');
            return null;
        }

        console.log(`🎭 Creating actor: ${actorType} at (${position.x}, ${position.y}, ${position.z})`);
        console.log(`🎯 Available systems: [${this.availableSystems.join(', ')}]`);

        let actor = null;

        // Try PRIMARY system first (Primitive)
        if (this.availableSystems.includes('primitive')) {
            console.log('🎨 Trying Primitive Actor System...');
            try {
                actor = window.primitiveActorSystem.createPrimitiveActor(actorType);
                if (actor) {
                    actor.position.set(position.x, position.y, position.z);
                    console.log('✅ Primitive actor created successfully');
                    return actor;
                }
            } catch (error) {
                console.error('❌ Primitive system failed:', error);
            }
        }

        // Try SECONDARY system (Enhanced)
        if (!actor && this.availableSystems.includes('enhanced')) {
            console.log('🎨 Trying Enhanced Actor System...');
            try {
                actor = window.enhancedActorSystem.createEnhancedActor(actorType);
                if (actor) {
                    actor.position.set(position.x, position.y, position.z);
                    console.log('✅ Enhanced actor created successfully');
                    return actor;
                }
            } catch (error) {
                console.error('❌ Enhanced system failed:', error);
            }
        }

        // Try TERTIARY system (Advanced V2)
        if (!actor && this.availableSystems.includes('advanced')) {
            console.log('🎨 Trying Advanced Actor System V2...');
            try {
                actor = await window.advancedActorSystemV2.createAdvancedActor(actorType, position);
                if (actor) {
                    console.log('✅ Advanced V2 actor created successfully');
                    return actor;
                }
            } catch (error) {
                console.error('❌ Advanced V2 system failed:', error);
            }
        }

        console.error('💥 ALL ACTOR SYSTEMS FAILED to create actor:', actorType);
        return null;
    }

    getAvailableActorTypes() {
        const allTypes = {};

        // Get types from available systems
        if (this.availableSystems.includes('primitive') && window.primitiveActorSystem) {
            const primitiveTypes = window.primitiveActorSystem.getActorTypes();
            Object.entries(primitiveTypes).forEach(([key, type]) => {
                allTypes[key] = {
                    ...type,
                    name: `🎭 ${type.name}`,
                    source: 'primitive',
                    priority: 1
                };
            });
        }

        if (this.availableSystems.includes('enhanced') && window.enhancedActorSystem) {
            try {
                const enhancedTypes = window.enhancedActorSystem.getActorTypes();
                Object.entries(enhancedTypes).forEach(([key, type]) => {
                    if (!allTypes[key]) { // Don't override primitive types
                        allTypes[key] = {
                            ...type,
                            name: `⭐ ${type.name}`,
                            source: 'enhanced',
                            priority: 2
                        };
                    }
                });
            } catch (error) {
                console.warn('Enhanced system getActorTypes failed:', error);
            }
        }

        if (this.availableSystems.includes('advanced') && window.advancedActorSystemV2) {
            try {
                const advancedTypes = window.advancedActorSystemV2.getAvailableActors();
                Object.entries(advancedTypes).forEach(([key, type]) => {
                    if (!allTypes[key]) { // Don't override higher priority types
                        // Special handling for ReadyPlayerMe avatars
                        const icon = type.type === 'readyplayerme' ? '🎭' : '🚀';
                        const label = type.type === 'readyplayerme' ? 'ReadyPlayerMe' : 'Advanced';
                        
                        allTypes[key] = {
                            ...type,
                            name: `${icon} ${type.name}`,
                            source: 'advanced',
                            priority: 3,
                            category: type.type === 'readyplayerme' ? 'Professional' : 'Advanced'
                        };
                    }
                });
            } catch (error) {
                console.warn('Advanced V2 system getAvailableActors failed:', error);
            }
        }

        console.log(`📋 Available actor types: ${Object.keys(allTypes).length}`);
        return allTypes;
    }

    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            primarySystem: this.primarySystem,
            availableSystems: this.availableSystems,
            totalSystems: this.availableSystems.length
        };
    }
}

// Create global instance
const actorCreationManager = new ActorCreationManager();

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.actorCreationManager = actorCreationManager;
    console.log('ActorCreationManager loaded - Clean actor creation ready');
}