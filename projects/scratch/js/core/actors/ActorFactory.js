/**
 * ActorFactory.js - Behavioral Actor System for 3D Theater Stage
 * 
 * Handles the behavioral layer for theater actors:
 * - Actor state management and behavior
 * - Movement and pathfinding
 * - Integration with existing actor visual systems
 * - Performance optimization for multiple actors
 * - Theater staging and choreography support
 * 
 * This system extends the existing ObjectFactory by adding behavioral
 * capabilities to actors created through VRM, Enhanced, or Legacy systems.
 */

class TheatricalActor {
    constructor(id, position, actorType, visualMesh = null) {
        // Core Identity
        this.id = id;
        this.actorType = actorType;
        this.visualMesh = visualMesh; // Reference to THREE.js mesh from ObjectFactory
        
        // Position and Movement
        this.position = { x: position.x, y: position.y || 0, z: position.z };
        this.targetPosition = null;
        this.movementSpeed = 1.0; // units per second
        this.isMoving = false;
        
        // Advanced Movement System
        this.movementSystem = new ActorMovement(this.id);
        this.lastRotation = 0;
        
        // Collision Avoidance System
        this.collisionAvoidance = new ActorCollisionAvoidance(this.id);
        this.currentVelocity = { x: 0, z: 0 };
        this.lastPosition = { ...this.position };
        
        // State Management (Enhanced with StateMachine)
        this.stateMachine = new ActorStateMachine(this.id);
        this.state = this.stateMachine.currentState; // For backward compatibility
        this.previousState = null;
        this.stateChangeTime = 0;
        
        // Behavioral Properties
        this.personality = {
            confidence: 0.5,    // 0-1: affects movement speed and decision making
            energy: 0.5,        // 0-1: affects animation speed and responsiveness
            sociability: 0.5    // 0-1: affects interaction with other actors
        };
        
        // Memory and Awareness
        this.memory = {
            lastPositions: [],      // Recent movement history
            nearbyActors: [],       // Currently nearby actors
            blockedPaths: new Map() // Paths that were recently blocked
        };
        
        // Performance Optimization
        this.lastUpdateTime = 0;
        this.updateFrequency = 60; // Updates per second (can be reduced for distant actors)
        this.isVisible = true;
        this.distanceFromCamera = 0;
        
        console.log(`🎭 Created TheatricalActor: ${this.id} (${this.actorType}) at (${this.position.x}, ${this.position.z})`);
    }
    
    /**
     * Update actor behavior (called each frame)
     */
    update(deltaTime, stageState) {
        const currentTime = performance.now();
        
        // Check if this actor needs updating (performance optimization)
        if (currentTime - this.lastUpdateTime < (1000 / this.updateFrequency)) {
            return;
        }
        
        this.lastUpdateTime = currentTime;
        
        // Update distance from camera for LOD
        this.updateDistanceFromCamera(stageState.core.camera);
        
        // Update state machine
        this.stateMachine.update(deltaTime, this.position, {
            stageState: stageState,
            nearbyActors: this.memory.nearbyActors,
            props: stageState.objects.props
        });
        
        // Sync state with state machine
        this.state = this.stateMachine.currentState;
        
        // Update behavior based on current state
        this.updateStateBehavior(deltaTime, stageState);
        
        // Update visual mesh position
        if (this.visualMesh) {
            this.visualMesh.position.set(this.position.x, this.position.y, this.position.z);
        }
        
        // Update nearby actors awareness
        this.updateSpatialAwareness(stageState.actors);
        
        // Clean up old memory
        this.cleanupMemory();
    }
    
    /**
     * Update behavior based on current state
     */
    updateStateBehavior(deltaTime, stageState) {
        switch (this.state) {
            case 'idle':
                this.updateIdleBehavior(deltaTime);
                break;
            case 'walking':
                this.updateWalkingBehavior(deltaTime);
                break;
            case 'positioning':
                this.updatePositioningBehavior(deltaTime);
                break;
            case 'blocked':
                this.updateBlockedBehavior(deltaTime);
                break;
            case 'performing':
                this.updatePerformingBehavior(deltaTime);
                break;
            case 'interacting':
                this.updateInteractingBehavior(deltaTime);
                break;
            case 'waiting':
                this.updateWaitingBehavior(deltaTime);
                break;
            case 'exiting':
                this.updateExitingBehavior(deltaTime);
                break;
            case 'error':
                this.updateErrorBehavior(deltaTime);
                break;
        }
    }
    
    /**
     * Update idle behavior
     */
    updateIdleBehavior(deltaTime) {
        // Subtle idle animations - breathing, looking around
        if (this.visualMesh) {
            const time = performance.now() * 0.001;
            // Gentle breathing animation
            const breathingScale = 1.0 + Math.sin(time * 2) * 0.02;
            this.visualMesh.scale.y = breathingScale;
            
            // Occasional look around (personality-based)
            if (Math.random() < this.personality.sociability * 0.001) {
                const lookAngle = (Math.random() - 0.5) * Math.PI * 0.5;
                this.visualMesh.rotation.y += lookAngle * deltaTime;
            }
        }
    }
    
    /**
     * Update walking behavior with advanced movement and collision avoidance
     */
    updateWalkingBehavior(deltaTime) {
        if (this.targetPosition) {
            // Calculate current velocity
            this.updateVelocity(deltaTime);
            
            // LOOK-AHEAD COLLISION AVOIDANCE WITH PERSONAL SPACE
            const lookAheadResult = this.performLookAheadCheck(deltaTime);
            
            // Apply movement delay if needed for personal space
            if (lookAheadResult.shouldDelay) {
                console.log(`⏸️ Actor ${this.id} delaying movement for ${lookAheadResult.delayReason}`);
                return; // Skip movement this frame
            }
            
            // Adjust speed based on crowding and personal space
            const personalitySpeed = 0.5 + (this.personality.energy * 1.5); // 0.5 to 2.0 speed multiplier
            const adjustedSpeed = personalitySpeed * lookAheadResult.speedMultiplier;
            
            // Use advanced movement system with adjusted speed
            const movementResult = this.movementSystem.updateMovement(deltaTime, this.position, adjustedSpeed);
            
            if (movementResult.hasArrived) {
                // Check if height transition is also complete
                const heightDiff = this.targetPosition ? Math.abs(this.targetPosition.y - this.position.y) : 0;
                const heightComplete = heightDiff < 0.1; // Within 0.1 units
                
                if (heightComplete) {
                    // Fully arrived at destination including height
                    this.position.x = movementResult.newPosition.x;
                    this.position.z = movementResult.newPosition.z;
                    if (this.targetPosition) {
                        this.position.y = this.targetPosition.y;
                    }
                    this.targetPosition = null;
                    this.isMoving = false;
                    this.stateMachine.triggerEvent('arrived');
                    
                    console.log(`🎯 Actor ${this.id} arrived at destination (including height transition)`);
                    return;
                } else {
                    // Continue moving to complete height transition
                    this.position.x = movementResult.newPosition.x;
                    this.position.z = movementResult.newPosition.z;
                    // Height will be handled by the smooth transition code below
                }
            } else if (movementResult.isBlocked) {
                // Path is blocked
                this.stateMachine.triggerEvent('pathBlocked', {
                    blockageType: 'obstacle',
                    blockedBy: 'unknown'
                });
                
                console.log(`🚧 Actor ${this.id} path blocked`);
                return;
            }
            
            // Get intended movement direction
            const intendedMovement = {
                x: movementResult.newPosition.x - this.position.x,
                z: movementResult.newPosition.z - this.position.z
            };
            
            const movementMagnitude = Math.sqrt(
                intendedMovement.x * intendedMovement.x + 
                intendedMovement.z * intendedMovement.z
            );
            
            if (movementMagnitude > 0) {
                const targetDirection = {
                    x: intendedMovement.x / movementMagnitude,
                    z: intendedMovement.z / movementMagnitude
                };
                
                // Get collision avoidance force
                const avoidanceForce = this.collisionAvoidance.update(
                    deltaTime,
                    this.position,
                    this.currentVelocity,
                    targetDirection,
                    window.stageState
                );
                
                // Combine intended movement with avoidance force
                let finalPosition = { ...movementResult.newPosition };
                
                // Apply avoidance force if actively avoiding
                if (this.collisionAvoidance.isCurrentlyAvoiding()) {
                    const avoidanceStrength = 0.5; // How much avoidance affects movement
                    finalPosition.x += avoidanceForce.x * deltaTime * avoidanceStrength;
                    finalPosition.z += avoidanceForce.z * deltaTime * avoidanceStrength;
                    
                    // Check if avoidance movement is valid using PhysicsEngine
                    if (window.stagePhysicsEngine && window.stagePhysicsEngine.isInitialized) {
                        const testPosition = { 
                            x: finalPosition.x, 
                            y: this.position.y, 
                            z: finalPosition.z 
                        };
                        
                        const blocked = window.stagePhysicsEngine.checkAllCollisions(
                            this.visualMesh,
                            testPosition.x,
                            testPosition.z,
                            Math.abs(this.currentVelocity.x) + Math.abs(this.currentVelocity.z)
                        );
                        
                        if (blocked) {
                            // Avoidance movement would cause collision, use original pathfinding result
                            finalPosition = movementResult.newPosition;
                        }
                    }
                }
                
                // Update position with smooth height transition
                this.position.x = finalPosition.x;
                this.position.z = finalPosition.z;
                
                // Smooth height transition towards target height
                if (this.targetPosition) {
                    const heightDiff = this.targetPosition.y - this.position.y;
                    const heightTransitionSpeed = 2.0; // Units per second
                    const maxHeightChange = heightTransitionSpeed * deltaTime;
                    
                    if (Math.abs(heightDiff) > maxHeightChange) {
                        // Gradual height change
                        this.position.y += Math.sign(heightDiff) * maxHeightChange;
                    } else {
                        // Snap to target height if close enough
                        this.position.y = this.targetPosition.y;
                    }
                }
                
                // Update rotation to face movement direction (with avoidance influence)
                let facingDirection = targetDirection;
                if (this.collisionAvoidance.isCurrentlyAvoiding() && movementMagnitude > 0) {
                    // Blend facing direction with avoidance direction
                    const blendFactor = 0.3;
                    const avoidanceMagnitude = Math.sqrt(avoidanceForce.x * avoidanceForce.x + avoidanceForce.z * avoidanceForce.z);
                    
                    if (avoidanceMagnitude > 0) {
                        const avoidanceDirection = {
                            x: avoidanceForce.x / avoidanceMagnitude,
                            z: avoidanceForce.z / avoidanceMagnitude
                        };
                        
                        facingDirection = {
                            x: targetDirection.x * (1 - blendFactor) + avoidanceDirection.x * blendFactor,
                            z: targetDirection.z * (1 - blendFactor) + avoidanceDirection.z * blendFactor
                        };
                    }
                }
                
                if (this.visualMesh) {
                    const angle = Math.atan2(facingDirection.x, facingDirection.z);
                    this.lastRotation = angle;
                    this.visualMesh.rotation.y = angle;
                }
            }
        } else {
            // No target, return to idle
            this.stateMachine.triggerEvent('arrived');
        }
    }
    
    /**
     * Update velocity tracking for collision avoidance
     */
    updateVelocity(deltaTime) {
        if (deltaTime > 0) {
            this.currentVelocity.x = (this.position.x - this.lastPosition.x) / deltaTime;
            this.currentVelocity.z = (this.position.z - this.lastPosition.z) / deltaTime;
            
            // Update last position for next frame
            this.lastPosition.x = this.position.x;
            this.lastPosition.z = this.position.z;
        }
    }
    
    /**
     * Perform look-ahead collision check with personal space management
     */
    performLookAheadCheck(deltaTime) {
        const lookAheadDistance = 2.0; // How far ahead to check
        const personalSpaceRadius = 1.2; // Minimum distance from other actors
        const comfortZoneRadius = 1.8; // Preferred distance from other actors
        
        // Calculate intended movement direction
        if (!this.targetPosition) {
            return { shouldDelay: false, speedMultiplier: 1.0, delayReason: null };
        }
        
        const directionToTarget = {
            x: this.targetPosition.x - this.position.x,
            z: this.targetPosition.z - this.position.z
        };
        
        const distanceToTarget = Math.sqrt(directionToTarget.x * directionToTarget.x + directionToTarget.z * directionToTarget.z);
        
        if (distanceToTarget < 0.1) {
            return { shouldDelay: false, speedMultiplier: 1.0, delayReason: null };
        }
        
        // Normalize direction
        const normalizedDirection = {
            x: directionToTarget.x / distanceToTarget,
            z: directionToTarget.z / distanceToTarget
        };
        
        // Calculate look-ahead position
        const lookAheadPos = {
            x: this.position.x + normalizedDirection.x * lookAheadDistance,
            z: this.position.z + normalizedDirection.z * lookAheadDistance
        };
        
        // Check for other actors in the area
        if (!window.theatricalActorFactory) {
            return { shouldDelay: false, speedMultiplier: 1.0, delayReason: null };
        }
        
        const allActors = window.theatricalActorFactory.getAllActors();
        let closestDistance = Infinity;
        let actorsInPersonalSpace = 0;
        let actorsInComfortZone = 0;
        let wouldCollideActor = null;
        
        for (const otherActor of allActors) {
            if (otherActor.id === this.id) continue;
            
            // Check distance to other actor
            const dx = otherActor.position.x - this.position.x;
            const dz = otherActor.position.z - this.position.z;
            const currentDistance = Math.sqrt(dx * dx + dz * dz);
            
            if (currentDistance < closestDistance) {
                closestDistance = currentDistance;
            }
            
            // Count actors in personal space and comfort zone
            if (currentDistance < personalSpaceRadius) {
                actorsInPersonalSpace++;
            } else if (currentDistance < comfortZoneRadius) {
                actorsInComfortZone++;
            }
            
            // Check if movement would cause collision with this actor
            const futureDistance = Math.sqrt(
                (otherActor.position.x - lookAheadPos.x) ** 2 + 
                (otherActor.position.z - lookAheadPos.z) ** 2
            );
            
            if (futureDistance < personalSpaceRadius) {
                // Check if other actor is also moving toward us
                if (otherActor.targetPosition) {
                    const otherDirection = {
                        x: otherActor.targetPosition.x - otherActor.position.x,
                        z: otherActor.targetPosition.z - otherActor.position.z
                    };
                    
                    const otherToUs = {
                        x: this.position.x - otherActor.position.x,
                        z: this.position.z - otherActor.position.z
                    };
                    
                    // Dot product to check if they're moving toward each other
                    const dotProduct = otherDirection.x * otherToUs.x + otherDirection.z * otherToUs.z;
                    
                    if (dotProduct > 0) {
                        // They're moving toward us, higher chance of collision
                        wouldCollideActor = otherActor;
                        break;
                    }
                }
                
                wouldCollideActor = otherActor;
            }
        }
        
        // Decision making based on personal space and look-ahead
        
        // 1. If would collide with another actor, delay movement
        if (wouldCollideActor) {
            // Add random delay to prevent deadlocks
            const randomDelay = Math.random() < 0.3; // 30% chance to add extra delay
            
            if (randomDelay || this.personality.confidence < 0.4) {
                return { 
                    shouldDelay: true, 
                    speedMultiplier: 0.0, 
                    delayReason: `potential collision with ${wouldCollideActor.id}` 
                };
            }
        }
        
        // 2. If too many actors in personal space, slow down significantly
        if (actorsInPersonalSpace > 0) {
            const speedReduction = Math.max(0.2, 1.0 - (actorsInPersonalSpace * 0.3));
            return { 
                shouldDelay: false, 
                speedMultiplier: speedReduction, 
                delayReason: `${actorsInPersonalSpace} actors in personal space` 
            };
        }
        
        // 3. If actors in comfort zone, reduce speed slightly
        if (actorsInComfortZone > 0) {
            const speedReduction = Math.max(0.5, 1.0 - (actorsInComfortZone * 0.15));
            return { 
                shouldDelay: false, 
                speedMultiplier: speedReduction, 
                delayReason: `${actorsInComfortZone} actors in comfort zone` 
            };
        }
        
        // 4. If closest actor is still reasonably far, normal speed
        if (closestDistance > comfortZoneRadius) {
            return { shouldDelay: false, speedMultiplier: 1.0, delayReason: null };
        }
        
        // 5. Default: slight speed reduction for courtesy
        return { shouldDelay: false, speedMultiplier: 0.8, delayReason: 'courtesy spacing' };
    }
    
    /**
     * Update positioning behavior
     */
    updatePositioningBehavior(deltaTime) {
        // Similar to walking but with more precision
        this.updateWalkingBehavior(deltaTime);
    }
    
    /**
     * Update blocked behavior with collision avoidance assistance
     */
    updateBlockedBehavior(deltaTime) {
        // Update velocity tracking
        this.updateVelocity(deltaTime);
        
        // Visual indication of being blocked - slight agitation
        if (this.visualMesh) {
            const time = performance.now() * 0.001;
            this.visualMesh.rotation.y += Math.sin(time * 8) * 0.1 * deltaTime;
        }
        
        // The state machine handles retry logic, but we can add visual feedback here
        const stateInfo = this.stateMachine.getCurrentStateInfo();
        if (stateInfo.stateData && stateInfo.stateData.retryCount > 0) {
            // Show different visual indication based on retry count
            const intensity = Math.min(stateInfo.stateData.retryCount / 3, 1.0);
            if (this.visualMesh && this.visualMesh.material && this.visualMesh.material.color) {
                // Gradually turn more red as retries increase
                this.visualMesh.material.color.setRGB(1.0, 1.0 - intensity * 0.5, 1.0 - intensity * 0.5);
            }
            
            // Use collision avoidance to try to find escape direction
            if (this.targetPosition) {
                const targetDirection = {
                    x: this.targetPosition.x - this.position.x,
                    z: this.targetPosition.z - this.position.z
                };
                
                const targetMagnitude = Math.sqrt(targetDirection.x * targetDirection.x + targetDirection.z * targetDirection.z);
                if (targetMagnitude > 0) {
                    targetDirection.x /= targetMagnitude;
                    targetDirection.z /= targetMagnitude;
                    
                    // Get avoidance suggestion
                    const avoidanceForce = this.collisionAvoidance.update(
                        deltaTime,
                        this.position,
                        this.currentVelocity,
                        targetDirection,
                        window.stageState
                    );
                    
                    // If avoidance suggests a strong direction, try micro-movement
                    const avoidanceMagnitude = Math.sqrt(avoidanceForce.x * avoidanceForce.x + avoidanceForce.z * avoidanceForce.z);
                    if (avoidanceMagnitude > 0.5) {
                        const microStep = 0.1 * deltaTime;
                        const testPosition = {
                            x: this.position.x + avoidanceForce.x * microStep,
                            y: this.position.y,
                            z: this.position.z + avoidanceForce.z * microStep
                        };
                        
                        // Check if micro-movement is valid
                        let canMove = true;
                        if (window.stagePhysicsEngine && window.stagePhysicsEngine.isInitialized) {
                            canMove = !window.stagePhysicsEngine.checkAllCollisions(
                                this.visualMesh,
                                testPosition.x,
                                testPosition.z,
                                avoidanceMagnitude
                            );
                        }
                        
                        if (canMove) {
                            this.position = testPosition;
                            console.log(`🔄 Actor ${this.id} micro-adjusting position to escape blockage`);
                        }
                    }
                }
            }
        }
    }
    
    /**
     * Update performing behavior
     */
    updatePerformingBehavior(deltaTime) {
        // Enhanced animation during performance
        if (this.visualMesh) {
            const time = performance.now() * 0.001;
            // More dramatic movements
            this.visualMesh.rotation.y += Math.sin(time * 3) * 0.5 * deltaTime;
            const scale = 1.0 + Math.sin(time * 4) * 0.1;
            this.visualMesh.scale.set(scale, scale, scale);
        }
    }
    
    /**
     * Update interacting behavior
     */
    updateInteractingBehavior(deltaTime) {
        // Turn toward interaction target if specified
        const stateInfo = this.stateMachine.getCurrentStateInfo();
        if (stateInfo.stateData && stateInfo.stateData.target) {
            // Would implement turning toward target
        }
    }
    
    /**
     * Update waiting behavior
     */
    updateWaitingBehavior(deltaTime) {
        // Patient waiting animation
        if (this.visualMesh) {
            const time = performance.now() * 0.001;
            // Slower, more patient movements
            this.visualMesh.rotation.y += Math.sin(time * 0.5) * 0.1 * deltaTime;
        }
    }
    
    /**
     * Update exiting behavior
     */
    updateExitingBehavior(deltaTime) {
        // Faster movement when exiting
        this.updateWalkingBehavior(deltaTime);
    }
    
    /**
     * Update error behavior
     */
    updateErrorBehavior(deltaTime) {
        // Visual error indication - red coloring or erratic movement
        if (this.visualMesh && this.visualMesh.material) {
            const time = performance.now() * 0.001;
            // Flash red to indicate error
            const redIntensity = 0.5 + Math.sin(time * 10) * 0.5;
            if (this.visualMesh.material.color) {
                this.visualMesh.material.color.setRGB(redIntensity, 0.2, 0.2);
            }
        }
    }
    
    /**
     * Set movement target using advanced pathfinding system with height calculation
     */
    moveTo(targetX, targetZ) {
        // Calculate appropriate height for target position
        const targetY = this.calculateHeightForPosition(targetX, targetZ);
        
        this.targetPosition = { x: targetX, y: targetY, z: targetZ };
        
        // Use advanced movement system to calculate path
        const pathFound = this.movementSystem.setTarget(targetX, targetZ, this.position.x, this.position.z);
        
        if (pathFound) {
            this.isMoving = true;
            
            // Trigger state machine event
            this.stateMachine.triggerEvent('moveTo', {
                targetPosition: this.targetPosition,
                speed: this.movementSpeed,
                pathfinding: true
            });
            
            console.log(`🗺️ Actor ${this.id} pathfinding to (${targetX}, ${targetZ})`);
        } else {
            console.warn(`🚫 Actor ${this.id} cannot find path to (${targetX}, ${targetZ})`);
            
            // Trigger blocked state if no path found
            this.stateMachine.triggerEvent('pathBlocked', {
                blockageType: 'no_path',
                targetPosition: this.targetPosition
            });
        }
    }
    
    /**
     * Stop movement and return to idle
     */
    stopMovement() {
        this.isMoving = false;
        this.targetPosition = null;
        
        // Stop the movement system
        this.movementSystem.stop();
        
        // Trigger state machine event
        this.stateMachine.triggerEvent('arrived');
        
        console.log(`🛑 Actor ${this.id} stopped at (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)}, ${this.position.z.toFixed(2)})`);
    }
    
    /**
     * Calculate appropriate height for a given position
     */
    calculateHeightForPosition(x, z) {
        // All areas are at the same level for easy movement
        return 0;
    }
    
    /**
     * Start a performance action
     */
    startPerformance(performanceType = 'generic', duration = 3000, critical = false) {
        this.stateMachine.triggerEvent('startPerformance', {
            performance: performanceType,
            duration: duration,
            critical: critical
        });
        
        console.log(`🎭 Actor ${this.id} starting performance: ${performanceType}`);
    }
    
    /**
     * Start interacting with target
     */
    startInteraction(target, interactionType = 'generic', duration = 2000) {
        this.stateMachine.triggerEvent('interactWith', {
            target: target,
            interactionType: interactionType,
            duration: duration
        });
        
        console.log(`🤝 Actor ${this.id} interacting with ${target}: ${interactionType}`);
    }
    
    /**
     * Wait for cue or condition
     */
    waitForCue(waitingFor = 'cue', timeout = 30000, condition = null) {
        this.stateMachine.triggerEvent('waitForCue', {
            waitingFor: waitingFor,
            timeout: timeout,
            condition: condition
        });
        
        console.log(`⏳ Actor ${this.id} waiting for: ${waitingFor}`);
    }
    
    /**
     * Signal that a cue has been received
     */
    receiveCue() {
        this.stateMachine.triggerEvent('cueReceived');
        console.log(`✅ Actor ${this.id} received cue`);
    }
    
    /**
     * Exit the stage
     */
    exitStage(exitPoint = 'default', speed = 1.2) {
        this.stateMachine.triggerEvent('exitStage', {
            exitPoint: exitPoint,
            speed: speed
        });
        
        console.log(`🚪 Actor ${this.id} exiting stage via ${exitPoint}`);
    }
    
    /**
     * Move to a stage marker position
     */
    moveToStagePosition(markerIndex) {
        if (window.stageState && window.stageState.stage.stageMarkers) {
            const markers = window.stageState.stage.stageMarkers;
            
            if (markerIndex >= 0 && markerIndex < markers.length) {
                const marker = markers[markerIndex];
                const targetX = marker.position.x;
                const targetZ = marker.position.z;
                
                console.log(`🎯 Actor ${this.id} moving to stage marker ${markerIndex}`);
                this.moveTo(targetX, targetZ);
                
                return true;
            } else {
                console.warn(`🎯 Actor ${this.id}: Invalid stage marker index ${markerIndex}`);
                return false;
            }
        } else {
            console.warn(`🎯 Actor ${this.id}: No stage markers available`);
            return false;
        }
    }
    
    /**
     * Move to nearest stage marker
     */
    moveToNearestStageMarker() {
        if (window.stageState && window.stageState.stage.stageMarkers) {
            const markers = window.stageState.stage.stageMarkers;
            let nearestIndex = 0;
            let nearestDistance = Infinity;
            
            markers.forEach((marker, index) => {
                const dx = marker.position.x - this.position.x;
                const dz = marker.position.z - this.position.z;
                const distance = Math.sqrt(dx * dx + dz * dz);
                
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = index;
                }
            });
            
            console.log(`🎯 Actor ${this.id} moving to nearest stage marker ${nearestIndex} (${nearestDistance.toFixed(2)} units away)`);
            return this.moveToStagePosition(nearestIndex);
        } else {
            console.warn(`🎯 Actor ${this.id}: No stage markers available`);
            return false;
        }
    }
    
    /**
     * Change actor state (legacy method - now uses state machine)
     */
    setState(newState) {
        // Legacy support - map simple states to state machine events
        const stateEventMap = {
            'idle': 'reset',
            'walking': 'moveTo',
            'blocked': 'pathBlocked',
            'performing': 'startPerformance'
        };
        
        const event = stateEventMap[newState];
        if (event) {
            this.stateMachine.triggerEvent(event);
        } else {
            console.warn(`🎭 Actor ${this.id}: Cannot set state '${newState}' directly. Use state machine events.`);
        }
    }
    
    /**
     * Update distance from camera for LOD
     */
    updateDistanceFromCamera(camera) {
        if (camera) {
            const dx = camera.position.x - this.position.x;
            const dy = camera.position.y - this.position.y;
            const dz = camera.position.z - this.position.z;
            this.distanceFromCamera = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Adjust update frequency based on distance
            if (this.distanceFromCamera > 50) {
                this.updateFrequency = 10; // Distant actors update less frequently
            } else if (this.distanceFromCamera > 20) {
                this.updateFrequency = 30;
            } else {
                this.updateFrequency = 60; // Close actors update at full rate
            }
        }
    }
    
    /**
     * Update awareness of nearby actors
     */
    updateSpatialAwareness(allActors) {
        this.memory.nearbyActors = [];
        
        for (const otherActor of allActors) {
            if (otherActor.id === this.id) continue;
            
            const dx = otherActor.position.x - this.position.x;
            const dz = otherActor.position.z - this.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance < 3.0) { // Within 3 units
                this.memory.nearbyActors.push({
                    id: otherActor.id,
                    distance: distance,
                    position: { ...otherActor.position }
                });
            }
        }
    }
    
    /**
     * Clean up old memory data
     */
    cleanupMemory() {
        const currentTime = performance.now();
        
        // Keep only recent positions (last 5 seconds)
        this.memory.lastPositions = this.memory.lastPositions.filter(
            pos => currentTime - pos.time < 5000
        );
        
        // Clear old blocked paths (after 10 seconds)
        for (const [path, time] of this.memory.blockedPaths.entries()) {
            if (currentTime - time > 10000) {
                this.memory.blockedPaths.delete(path);
            }
        }
    }
    
    /**
     * Get actor status for debugging
     */
    getStatus() {
        const stateMachineInfo = this.stateMachine.getCurrentStateInfo();
        const movementStatus = this.movementSystem.getMovementStatus();
        const avoidanceInfo = this.collisionAvoidance.getAvoidanceDebugInfo();
        
        return {
            id: this.id,
            type: this.actorType,
            state: this.state,
            previousState: stateMachineInfo.previousState,
            timeInState: (stateMachineInfo.timeInState / 1000).toFixed(1) + 's',
            position: { ...this.position },
            targetPosition: this.targetPosition ? { ...this.targetPosition } : null,
            velocity: {
                x: this.currentVelocity.x.toFixed(3),
                z: this.currentVelocity.z.toFixed(3)
            },
            isMoving: this.isMoving,
            pathfinding: {
                hasPath: movementStatus.hasValidPath,
                pathLength: movementStatus.pathLength,
                currentWaypoint: movementStatus.currentPathIndex,
                isFollowingPath: movementStatus.isMoving
            },
            collisionAvoidance: {
                isAvoiding: avoidanceInfo.isAvoiding,
                nearbyObstacles: avoidanceInfo.nearbyObstacles,
                nearbyActors: avoidanceInfo.nearbyActors,
                avoidanceForce: avoidanceInfo.currentForce
            },
            nearbyActors: this.memory.nearbyActors.length,
            distanceFromCamera: this.distanceFromCamera.toFixed(1),
            updateFrequency: this.updateFrequency,
            transitionCount: stateMachineInfo.transitionCount,
            eventQueueLength: stateMachineInfo.eventQueueLength,
            personality: { ...this.personality }
        };
    }
    
    /**
     * Get detailed state machine debug info
     */
    getStateMachineDebug() {
        return this.stateMachine.getDebugInfo();
    }
    
    /**
     * Get state transition history
     */
    getStateHistory() {
        return this.stateMachine.getStateHistory();
    }
}

class TheatricalActorFactory {
    constructor() {
        this.isInitialized = false;
        this.actors = new Map(); // behavioral actors
        this.lastUpdateTime = 0;
        
        // Performance monitoring
        this.stats = {
            totalActors: 0,
            activeActors: 0,
            averageUpdateTime: 0,
            totalUpdateTime: 0,
            updateCount: 0
        };
        
        console.log('🎭 TheatricalActorFactory created');
    }
    
    /**
     * Initialize the factory
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('TheatricalActorFactory already initialized');
            return;
        }
        
        console.log('🎭 TheatricalActorFactory: Initializing behavioral actor system...');
        
        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Get references to existing systems
            this.stageState = window.stageState;
            this.objectFactory = window.threeObjectFactory;
            
            // Hook into existing actor creation
            this.hookIntoObjectFactory();
            
            this.isInitialized = true;
            console.log('🎭 TheatricalActorFactory: Initialization complete');
            
        } catch (error) {
            console.error('🎭 TheatricalActorFactory: Initialization failed:', error);
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
                    console.log('TheatricalActorFactory waiting for: window.stageState');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.threeObjectFactory?.isInitialized) {
                    console.log('TheatricalActorFactory waiting for: window.threeObjectFactory');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                console.log('🎭 TheatricalActorFactory: All dependencies satisfied!');
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('TheatricalActorFactory dependencies not available after 10 seconds'));
            }, 10000);
        });
    }
    
    /**
     * Hook into existing ObjectFactory to add behavioral layer
     */
    hookIntoObjectFactory() {
        // Store original addActorAt method
        const originalAddActorAt = this.objectFactory.addActorAt.bind(this.objectFactory);
        
        // Override addActorAt to add behavioral layer and place actors backstage
        this.objectFactory.addActorAt = async (x, z, actorType = null) => {
            console.log('🎭 Behavioral layer intercepting actor creation...');
            
            // Determine backstage position instead of on-stage position
            const backstagePosition = this.getBackstageStartPosition();
            console.log(`🎭 Placing new actor backstage at (${backstagePosition.x}, ${backstagePosition.z}) instead of on-stage (${x}, ${z})`);
            
            // Create visual actor using original method with backstage position
            const visualActor = await originalAddActorAt(backstagePosition.x, backstagePosition.z, actorType);
            
            if (visualActor) {
                // Set the correct backstage height for the visual actor
                visualActor.position.y = backstagePosition.y;
                
                // Create behavioral layer with backstage position
                const behavioralActor = this.createBehavioralActor(visualActor, backstagePosition.x, backstagePosition.z, actorType);
                
                // Update behavioral actor position to include correct height
                behavioralActor.position.y = backstagePosition.y;
                
                // Store behavioral actor
                this.actors.set(visualActor.userData.id, behavioralActor);
                
                console.log(`🎭 Behavioral actor created: ${behavioralActor.id} at backstage position (${backstagePosition.x}, ${backstagePosition.z})`);
            }
            
            return visualActor;
        };
        
        console.log('🎭 Hooked into ObjectFactory for behavioral layer');
    }
    
    /**
     * Get backstage starting position for new actors with better spacing
     */
    getBackstageStartPosition() {
        // Define expanded backstage areas with better spacing
        const backstageAreas = {
            left: { 
                xMin: -15,   // Wider area
                xMax: -10,   // Multiple X positions
                y: 0,        // Same level as main stage for easy access
                zMin: -6,    // Extended depth
                zMax: 4,     // More spacing
                name: 'Backstage Left' 
            },
            right: { 
                xMin: 10,    // Multiple X positions
                xMax: 15,    // Wider area
                y: 0,        // Same level as main stage for easy access
                zMin: -6,    // Extended depth
                zMax: 4,     // More spacing
                name: 'Backstage Right' 
            }
        };
        
        // Cycle through areas to distribute actors better
        const actorCount = this.actors.size;
        const useLeftSide = (actorCount % 2) === 0;
        const selectedArea = useLeftSide ? backstageAreas.left : backstageAreas.right;
        
        // Calculate position based on number of actors on this side
        const actorsOnThisSide = Math.floor(actorCount / 2) + (useLeftSide ? (actorCount % 2) : 0);
        
        // Use a grid-based approach for better spacing
        const maxActorsPerRow = 3;
        const row = Math.floor(actorsOnThisSide / maxActorsPerRow);
        const col = actorsOnThisSide % maxActorsPerRow;
        
        // Calculate spacing
        const xSpacing = (selectedArea.xMax - selectedArea.xMin) / Math.max(1, maxActorsPerRow);
        const zSpacing = (selectedArea.zMax - selectedArea.zMin) / Math.max(1, 4); // Up to 4 rows
        
        // Base position with grid spacing
        const baseX = selectedArea.xMin + (col + 0.5) * xSpacing;
        const baseZ = selectedArea.zMin + (row + 0.5) * zSpacing;
        
        // Add smaller randomization for natural look but maintain spacing
        const randomOffsetX = (Math.random() - 0.5) * 0.5; // Reduced randomization
        const randomOffsetZ = (Math.random() - 0.5) * 0.5;
        
        const position = {
            x: baseX + randomOffsetX,
            y: selectedArea.y,
            z: Math.max(selectedArea.zMin, Math.min(selectedArea.zMax, baseZ + randomOffsetZ))
        };
        
        console.log(`🎭 New actor assigned to ${selectedArea.name} at grid(${row},${col}) position (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
        
        return position;
    }
    
    /**
     * Create behavioral actor from visual actor
     */
    createBehavioralActor(visualActor, x, z, actorType) {
        const behavioralActor = new TheatricalActor(
            visualActor.userData.id,
            { x, y: 0, z },
            actorType || visualActor.userData.actorType,
            visualActor
        );
        
        // Set personality based on actor type
        this.assignPersonality(behavioralActor, actorType);
        
        return behavioralActor;
    }
    
    /**
     * Assign personality traits based on actor type
     */
    assignPersonality(actor, actorType) {
        const personalityMap = {
            'human_male': { confidence: 0.7, energy: 0.6, sociability: 0.5 },
            'human_female': { confidence: 0.6, energy: 0.7, sociability: 0.8 },
            'child': { confidence: 0.3, energy: 0.9, sociability: 0.9 },
            'elderly': { confidence: 0.8, energy: 0.3, sociability: 0.6 },
            'robot': { confidence: 0.9, energy: 0.5, sociability: 0.2 },
            'alien': { confidence: 0.5, energy: 0.8, sociability: 0.3 }
        };
        
        const personality = personalityMap[actorType] || { confidence: 0.5, energy: 0.5, sociability: 0.5 };
        actor.personality = { ...personality };
        
        // Adjust movement speed based on personality
        actor.movementSpeed = 0.5 + (actor.personality.energy * 1.5); // 0.5 to 2.0 units/second
        
        console.log(`🎭 Actor ${actor.id} personality: confidence=${personality.confidence}, energy=${personality.energy}, sociability=${personality.sociability}`);
    }
    
    /**
     * Update all behavioral actors
     */
    update(deltaTime) {
        if (!this.isInitialized || this.actors.size === 0) {
            return;
        }
        
        const updateStartTime = performance.now();
        let activeCount = 0;
        
        // Update each behavioral actor
        for (const actor of this.actors.values()) {
            actor.update(deltaTime, this.stageState);
            if (actor.isMoving) activeCount++;
        }
        
        // Update performance stats
        const updateTime = performance.now() - updateStartTime;
        this.updateStats(updateTime, activeCount);
    }
    
    /**
     * Move actor to position
     */
    moveActorTo(actorId, x, z) {
        const actor = this.actors.get(actorId);
        if (actor) {
            actor.moveTo(x, z);
            return true;
        }
        console.warn(`🎭 Actor not found: ${actorId}`);
        return false;
    }
    
    /**
     * Get actor by ID
     */
    getActor(actorId) {
        return this.actors.get(actorId);
    }
    
    /**
     * Get all actors
     */
    getAllActors() {
        return Array.from(this.actors.values());
    }
    
    /**
     * Remove actor
     */
    removeActor(actorId) {
        const actor = this.actors.get(actorId);
        if (actor) {
            this.actors.delete(actorId);
            console.log(`🎭 Behavioral actor removed: ${actorId}`);
            return true;
        }
        return false;
    }
    
    /**
     * Update performance statistics
     */
    updateStats(updateTime, activeCount) {
        this.stats.updateCount++;
        this.stats.totalUpdateTime += updateTime;
        this.stats.averageUpdateTime = this.stats.totalUpdateTime / this.stats.updateCount;
        this.stats.totalActors = this.actors.size;
        this.stats.activeActors = activeCount;
    }
    
    /**
     * Get performance statistics
     */
    getStats() {
        return {
            ...this.stats,
            isInitialized: this.isInitialized,
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    
    /**
     * Estimate memory usage
     */
    estimateMemoryUsage() {
        // Rough estimate: each actor uses ~2KB for behavioral data
        return this.actors.size * 2; // KB
    }
    
    /**
     * Get debug information for all actors
     */
    getDebugInfo() {
        const actors = [];
        for (const actor of this.actors.values()) {
            actors.push(actor.getStatus());
        }
        return {
            stats: this.getStats(),
            actors: actors
        };
    }
    
    /**
     * Clean up resources
     */
    dispose() {
        console.log('🎭 TheatricalActorFactory: Disposing');
        this.actors.clear();
        this.isInitialized = false;
    }
}

// Create global instance
const theatricalActorFactory = new TheatricalActorFactory();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.theatricalActorFactory = theatricalActorFactory;
    console.log('🎭 TheatricalActorFactory loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { theatricalActorFactory, TheatricalActorFactory, TheatricalActor };
}