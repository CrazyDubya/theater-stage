/**
 * PhysicsEngine.js - Collision Detection and Object Relationship System
 * 
 * Manages all physics interactions in the 3D Theater Stage:
 * - Collision detection with spatial optimization
 * - Object relationship tracking (platforms, rotating stage, trap doors)
 * - Momentum and velocity calculations
 * - Physics properties for different object types
 * - Sound integration for collisions and movement
 * - Performance optimization with distance culling
 */

class StagePhysicsEngine {
    constructor() {
        this.isInitialized = false;
        
        // Physics properties for different object types
        this.objectPhysics = {
            actor: { mass: 70, friction: 0.8 }, // ~70kg human
            table: { mass: 30, friction: 0.9 }, // Heavy, high friction
            chair: { mass: 8, friction: 0.7 },  // Lighter, can slide
            modernChair: { mass: 12, friction: 0.8 }, // Modern chair
            sofa: { mass: 80, friction: 0.95 }, // Very heavy, doesn't move easily
            diningTable: { mass: 40, friction: 0.9 }, // Heavy dining table
            microphone: { mass: 15, friction: 0.8 }, // Microphone stand
            piano: { mass: 300, friction: 0.98 }, // Extremely heavy
            spotlight: { mass: 25, friction: 0.85 }, // Heavy spotlight
            tree: { mass: 100, friction: 0.95 }, // Very heavy tree
            fountain: { mass: 200, friction: 0.98 }, // Extremely heavy fountain
            bookshelf: { mass: 60, friction: 0.9 }, // Heavy bookshelf
            barrel: { mass: 50, friction: 0.6 }, // Heavy but can roll
            box: { mass: 20, friction: 0.8 },   // Medium weight
            plant: { mass: 5, friction: 0.7 },  // Light
            lamp: { mass: 3, friction: 0.9 },   // Very light
            cube: { mass: 10, friction: 0.7 },  // Default
            sphere: { mass: 8, friction: 0.4 }, // Low friction (rolls)
            cylinder: { mass: 12, friction: 0.6 }
        };
        
        // Performance optimization settings
        this.performanceConfig = {
            maxCollisionDistance: 5, // Only check objects within 5 units
            collisionChecksPerFrame: 0,
            spatialGridSize: 5, // For future spatial partitioning
            velocityThreshold: 0.001 // Minimum velocity to maintain
        };
        
        // Default bounding boxes for different object types
        this.defaultBounds = {
            actor: { width: 1, height: 2, depth: 1 },
            table: { width: 2, height: 1, depth: 1 },
            chair: { width: 1, height: 1, depth: 1 },
            modernChair: { width: 1.2, height: 1.5, depth: 1.2 },
            sofa: { width: 3, height: 1, depth: 1.5 },
            diningTable: { width: 3, height: 1, depth: 3 },
            microphone: { width: 0.6, height: 1.8, depth: 0.6 },
            piano: { width: 2, height: 1.2, depth: 1.2 },
            spotlight: { width: 0.5, height: 2, depth: 0.5 },
            tree: { width: 2.4, height: 4, depth: 2.4 },
            fountain: { width: 3, height: 1.5, depth: 3 },
            bookshelf: { width: 2, height: 2.5, depth: 0.4 },
            barrel: { width: 1, height: 1.2, depth: 1 },
            box: { width: 0.8, height: 0.5, depth: 0.6 },
            plant: { width: 0.5, height: 1.2, depth: 0.5 },
            lamp: { width: 0.4, height: 1.6, depth: 0.4 },
            cube: { width: 1, height: 1, depth: 1 },
            sphere: { width: 1, height: 1, depth: 1 },
            cylinder: { width: 1, height: 1, depth: 1 }
        };
    }

    /**
     * Initialize the physics engine
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('PhysicsEngine already initialized');
            return;
        }

        console.log('PhysicsEngine: Initializing collision and physics system...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Set up local references
            this.stageState = window.stageState;
            this.audioManager = window.audioManager;
            
            this.isInitialized = true;
            console.log('PhysicsEngine: Initialization complete');
            
        } catch (error) {
            console.error('PhysicsEngine: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (!window.stageState) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.audioManager) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('PhysicsEngine dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Update relationships for a single object (platforms, rotating stage, trap doors)
     */
    updateObjectRelationships(obj) {
        const objPos = obj.position;
        const relations = this.stageState.physics;
        
        // Clear existing relationships for this object
        relations.propPlatformRelations.delete(obj);
        relations.propRotatingStageRelations.delete(obj);
        relations.propTrapDoorRelations.delete(obj);
        
        // Check platform relationships
        this.stageState.moveablePlatforms.forEach((platform, index) => {
            const platPos = platform.position;
            
            // Check if object is on this platform (within bounds)
            if (Math.abs(objPos.x - platPos.x) < 1.5 && 
                Math.abs(objPos.z - platPos.z) < 1) {
                relations.propPlatformRelations.set(obj, platform);
            }
        });
        
        // Check rotating stage relationship
        const rotatingStage = this.stageState.stage.rotatingStage;
        if (rotatingStage && rotatingStage.visible) {
            const stagePos = rotatingStage.position;
            const distance = Math.sqrt(
                Math.pow(objPos.x - stagePos.x, 2) + 
                Math.pow(objPos.z - stagePos.z, 2)
            );
            
            if (distance < 5) { // Within rotating stage radius
                relations.propRotatingStageRelations.add(obj);
            }
        }
        
        // Check trap door relationships
        this.stageState.trapDoors.forEach((trapDoor, index) => {
            if (trapDoor.visible) {
                const trapPos = trapDoor.position;
                
                // Check if object is on this trap door
                if (Math.abs(objPos.x - trapPos.x) < 1 && 
                    Math.abs(objPos.z - trapPos.z) < 1) {
                    relations.propTrapDoorRelations.set(obj, trapDoor);
                }
            }
        });
    }

    /**
     * Update relationships for all objects
     */
    updateAllObjectRelationships() {
        // Safety check for stageState
        if (!this.stageState || !this.stageState.props) {
            console.warn('PhysicsEngine: stageState not available for updateAllObjectRelationships');
            return;
        }
        
        // Update props
        this.stageState.props.forEach(prop => {
            if (!prop.userData.hidden) {
                this.updateObjectRelationships(prop);
            }
        });
        
        // Update actors (they use same physics)
        this.stageState.actors.forEach(actor => {
            if (!actor.userData.hidden) {
                this.updateObjectRelationships(actor);
            }
        });
    }

    /**
     * Get bounding box for an object
     */
    getObjectBounds(obj) {
        if (obj.userData.type === 'actor') {
            return this.defaultBounds.actor;
        } else if (obj.userData.propType && this.defaultBounds[obj.userData.propType]) {
            return this.defaultBounds[obj.userData.propType];
        }
        
        // Default bounds
        return { width: 1, height: 1, depth: 1 };
    }

    /**
     * Get object mass for physics calculations
     */
    getObjectMass(obj) {
        if (obj.userData.type === 'actor') {
            return this.objectPhysics.actor.mass;
        } else if (obj.userData.propType && this.objectPhysics[obj.userData.propType]) {
            return this.objectPhysics[obj.userData.propType].mass;
        }
        return 10; // Default mass
    }

    /**
     * Get object friction coefficient
     */
    getObjectFriction(obj) {
        if (obj.userData.type === 'actor') {
            return this.objectPhysics.actor.friction;
        } else if (obj.userData.propType && this.objectPhysics[obj.userData.propType]) {
            return this.objectPhysics[obj.userData.propType].friction;
        }
        return 0.7; // Default friction
    }

    /**
     * Check collision between two objects
     */
    checkObjectCollision(obj1, pos1, obj2) {
        if (obj1 === obj2 || obj2.userData.hidden) return false;
        
        const bounds1 = this.getObjectBounds(obj1);
        const bounds2 = this.getObjectBounds(obj2);
        const pos2 = obj2.position;
        
        // Check X-Z plane collision (horizontal)
        const xOverlap = Math.abs(pos1.x - pos2.x) < (bounds1.width + bounds2.width) / 2;
        const zOverlap = Math.abs(pos1.z - pos2.z) < (bounds1.depth + bounds2.depth) / 2;
        
        // Check Y collision (vertical) - objects at different heights don't collide
        const yOverlap = Math.abs(pos1.y - pos2.y) < (bounds1.height + bounds2.height) / 2;
        
        return xOverlap && zOverlap && yOverlap;
    }

    /**
     * Handle collision response with momentum transfer
     */
    handleCollisionResponse(obj1, obj2, velocity1) {
        const mass1 = this.getObjectMass(obj1);
        const mass2 = this.getObjectMass(obj2);
        const friction2 = this.getObjectFriction(obj2);
        
        // Calculate momentum transfer
        const totalMass = mass1 + mass2;
        const momentum1 = mass1 * velocity1;
        
        // If obj2 is immovable (like a heavy table), it doesn't move
        if (mass2 > mass1 * 5) { // Object 2 is 5x heavier
            return { obj1Moves: false, obj2Velocity: 0 };
        }
        
        // Calculate resulting velocities based on momentum conservation
        const velocity2 = (momentum1 / totalMass) * (1 - friction2);
        const newVelocity1 = velocity1 * (1 - mass2/totalMass) * friction2;
        
        return {
            obj1Moves: Math.abs(newVelocity1) > 0.01,
            obj1Velocity: newVelocity1,
            obj2Velocity: velocity2,
            obj2ShouldMove: Math.abs(velocity2) > 0.01
        };
    }

    /**
     * Check for collision with scenery panels
     */
    checkSceneryCollision(movingObj, newX, newZ) {
        const bounds = this.getObjectBounds(movingObj);
        const objRadius = Math.max(bounds.width, bounds.depth) / 2;
        
        // Check collision with each scenery panel
        for (let panel of this.stageState.sceneryPanels) {
            if (!panel.visible) continue;
            
            const panelData = panel.userData;
            const panelPos = panel.position;
            
            // Simple collision check with panel bounds
            const panelBounds = panelData.panelBounds;
            const distX = Math.abs(newX - panelPos.x);
            const distZ = Math.abs(newZ - panelPos.z);
            
            // Check if object would intersect panel bounds
            if (distX < (panelBounds.maxX - panelBounds.minX) / 2 + objRadius &&
                distZ < 0.5 + objRadius) { // Panel thickness
                
                // If panel has passthrough, check if object can pass through
                if (panelData.hasPassthrough) {
                    const passthroughBounds = panelData.passthroughBounds;
                    const localX = newX - panelPos.x;
                    const localY = movingObj.position.y;
                    
                    // Check if object fits through the passthrough opening
                    if (localX >= passthroughBounds.minX && localX <= passthroughBounds.maxX &&
                        localY >= passthroughBounds.minY && localY <= passthroughBounds.maxY) {
                        continue; // Can pass through
                    }
                }
                
                return true; // Collision with panel
            }
        }
        
        return false; // No collision
    }

    /**
     * Comprehensive collision check for an object at a new position
     */
    checkAllCollisions(movingObj, newX, newZ, velocity = 0) {
        const testPos = { x: newX, y: movingObj.position.y, z: newZ };
        let collisionHandled = false;
        
        // Reset collision counter
        this.performanceConfig.collisionChecksPerFrame = 0;
        
        // Check collision with props
        const propCollision = this.checkCollisionWithObjects(
            movingObj, testPos, this.stageState.props, velocity
        );
        if (propCollision !== null) return propCollision;
        
        // Check collision with actors
        const actorCollision = this.checkCollisionWithObjects(
            movingObj, testPos, this.stageState.actors, velocity
        );
        if (actorCollision !== null) return actorCollision;
        
        // Check scenery panel collisions (immovable)
        if (this.checkSceneryCollision(movingObj, newX, newZ)) {
            return true;
        }
        
        // Update performance stats
        this.stageState.performance.stats.collisionChecks = this.performanceConfig.collisionChecksPerFrame;
        
        return false; // No collision
    }

    /**
     * Check collision with a specific group of objects
     */
    checkCollisionWithObjects(movingObj, testPos, objects, velocity) {
        for (let obj of objects) {
            if (obj === movingObj) continue; // Skip self
            
            // Performance optimization: Early distance check
            const dx = obj.position.x - testPos.x;
            const dz = obj.position.z - testPos.z;
            const distanceSquared = dx * dx + dz * dz;
            
            if (distanceSquared > this.performanceConfig.maxCollisionDistance * this.performanceConfig.maxCollisionDistance) {
                continue; // Skip distant objects
            }
            
            this.performanceConfig.collisionChecksPerFrame++;
            
            if (this.checkObjectCollision(movingObj, testPos, obj)) {
                if (velocity > 0) {
                    // Calculate collision response
                    const response = this.handleCollisionResponse(movingObj, obj, velocity);
                    
                    if (response.obj2ShouldMove) {
                        // Calculate push direction
                        const pushDx = obj.position.x - movingObj.position.x;
                        const pushDz = obj.position.z - movingObj.position.z;
                        const dist = Math.sqrt(pushDx * pushDx + pushDz * pushDz);
                        
                        if (dist > 0) {
                            // Set velocity for the pushed object
                            const objectVelocities = this.stageState.physics.objectVelocities;
                            if (!objectVelocities.has(obj)) {
                                objectVelocities.set(obj, { x: 0, z: 0 });
                            }
                            const vel = objectVelocities.get(obj);
                            vel.x = (pushDx / dist) * response.obj2Velocity;
                            vel.z = (pushDz / dist) * response.obj2Velocity;
                        }
                    }
                    
                    // Play collision sound
                    if (this.audioManager) {
                        this.audioManager.playCollisionSound(movingObj, obj, velocity);
                    }
                    
                    return !response.obj1Moves; // Can move if momentum allows
                }
                return true; // Static collision
            }
        }
        
        return null; // No collision found
    }

    /**
     * Apply velocity and physics to an object
     */
    updateObjectVelocity(obj) {
        const objectVelocities = this.stageState.physics.objectVelocities;
        
        if (!objectVelocities.has(obj)) return;
        
        const vel = objectVelocities.get(obj);
        
        if (Math.abs(vel.x) > this.performanceConfig.velocityThreshold || 
            Math.abs(vel.z) > this.performanceConfig.velocityThreshold) {
            
            const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            const newX = obj.position.x + vel.x;
            const newZ = obj.position.z + vel.z;
            
            // Play movement sound for fast-moving objects
            if (speed > 0.1 && this.audioManager) {
                this.audioManager.playMovementSound(obj, speed);
            }
            
            if (!this.checkAllCollisions(obj, newX, newZ, speed)) {
                obj.position.x = newX;
                obj.position.z = newZ;
                
                // Apply friction to slow down
                const friction = this.getObjectFriction(obj);
                vel.x *= (1 - friction * 0.1);
                vel.z *= (1 - friction * 0.1);
                
                // Stop if too slow
                if (Math.abs(vel.x) < this.performanceConfig.velocityThreshold && 
                    Math.abs(vel.z) < this.performanceConfig.velocityThreshold) {
                    vel.x = 0;
                    vel.z = 0;
                }
            } else {
                // Bounce off with reduced velocity
                vel.x *= -0.3;
                vel.z *= -0.3;
            }
        }
    }

    /**
     * Set velocity for an object (for pushing, throwing, etc.)
     */
    setObjectVelocity(obj, velX, velZ) {
        const objectVelocities = this.stageState.physics.objectVelocities;
        
        if (!objectVelocities.has(obj)) {
            objectVelocities.set(obj, { x: 0, z: 0 });
        }
        
        const vel = objectVelocities.get(obj);
        vel.x = velX;
        vel.z = velZ;
    }

    /**
     * Apply impulse to an object (instant force)
     */
    applyImpulse(obj, forceX, forceZ) {
        const mass = this.getObjectMass(obj);
        const impulseX = forceX / mass;
        const impulseZ = forceZ / mass;
        
        this.setObjectVelocity(obj, impulseX, impulseZ);
    }

    /**
     * Check if an object is on a platform
     */
    isObjectOnPlatform(obj) {
        return this.stageState.physics.propPlatformRelations.has(obj);
    }

    /**
     * Check if an object is on the rotating stage
     */
    isObjectOnRotatingStage(obj) {
        return this.stageState.physics.propRotatingStageRelations.has(obj);
    }

    /**
     * Check if an object is over a trap door
     */
    isObjectOverTrapDoor(obj) {
        return this.stageState.physics.propTrapDoorRelations.has(obj);
    }

    /**
     * Get the platform an object is on (if any)
     */
    getObjectPlatform(obj) {
        return this.stageState.physics.propPlatformRelations.get(obj) || null;
    }

    /**
     * Get the trap door an object is over (if any)
     */
    getObjectTrapDoor(obj) {
        return this.stageState.physics.propTrapDoorRelations.get(obj) || null;
    }

    /**
     * Clear all physics relationships for an object
     */
    clearObjectRelationships(obj) {
        const relations = this.stageState.physics;
        relations.propPlatformRelations.delete(obj);
        relations.propRotatingStageRelations.delete(obj);
        relations.propTrapDoorRelations.delete(obj);
        relations.objectVelocities.delete(obj);
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return {
            collisionChecksThisFrame: this.performanceConfig.collisionChecksPerFrame,
            maxCollisionDistance: this.performanceConfig.maxCollisionDistance,
            activeVelocities: this.stageState.physics.objectVelocities.size,
            platformRelations: this.stageState.physics.propPlatformRelations.size,
            rotatingStageRelations: this.stageState.physics.propRotatingStageRelations.size,
            trapDoorRelations: this.stageState.physics.propTrapDoorRelations.size
        };
    }

    /**
     * Update physics configuration
     */
    updateConfig(newConfig) {
        this.performanceConfig = { ...this.performanceConfig, ...newConfig };
        console.log('PhysicsEngine: Configuration updated', this.performanceConfig);
    }

    /**
     * Add custom physics properties for a new object type
     */
    addObjectPhysics(objectType, physics) {
        this.objectPhysics[objectType] = physics;
        console.log(`PhysicsEngine: Added physics for ${objectType}:`, physics);
    }

    /**
     * Add custom bounds for a new object type
     */
    addObjectBounds(objectType, bounds) {
        this.defaultBounds[objectType] = bounds;
        console.log(`PhysicsEngine: Added bounds for ${objectType}:`, bounds);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            objectTypes: Object.keys(this.objectPhysics).length,
            boundsTypes: Object.keys(this.defaultBounds).length,
            performanceConfig: this.performanceConfig
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        console.log('PhysicsEngine: Disposing');
        this.isInitialized = false;
    }
}

// Create global instance
const stagePhysicsEngine = new StagePhysicsEngine();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.stagePhysicsEngine = stagePhysicsEngine;
    console.log('PhysicsEngine loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stagePhysicsEngine, StagePhysicsEngine };
}