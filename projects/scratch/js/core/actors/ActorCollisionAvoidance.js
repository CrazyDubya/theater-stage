/**
 * ActorCollisionAvoidance.js - Real-time Collision Avoidance for Theatrical Actors
 * 
 * Provides advanced collision avoidance capabilities that work alongside
 * the pathfinding system to create smooth, realistic actor movement:
 * - Real-time obstacle detection and avoidance
 * - Integration with existing PhysicsEngine
 * - Social spacing and actor-to-actor avoidance
 * - Dynamic path adjustment and flow fields
 * - Performance optimization for multiple actors
 * - Theater-specific behaviors (personal space, blocking)
 */

class ActorCollisionAvoidance {
    constructor(actorId) {
        this.actorId = actorId;
        
        // Avoidance parameters
        this.personalSpace = 1.2; // Minimum distance from other actors
        this.obstacleAvoidanceRadius = 1.5; // Distance to start avoiding obstacles
        this.maxAvoidanceForce = 2.0; // Maximum steering force
        this.lookAheadTime = 1.0; // Seconds to look ahead for potential collisions
        
        // Avoidance weights (how much each factor influences movement)
        this.weights = {
            obstacle: 1.0,      // Static obstacle avoidance
            actor: 0.8,         // Other actor avoidance
            personalSpace: 0.6, // Social spacing
            flowField: 0.4,     // Follow general flow
            separation: 0.7,    // Maintain separation from groups
            wallAvoidance: 1.2  // Stage boundary avoidance
        };
        
        // Detection settings
        this.sensorRange = 3.0; // How far ahead to look for obstacles
        this.sensorAngle = Math.PI / 3; // 60-degree sensor cone
        this.sensorCount = 5; // Number of sensors in the cone
        
        // Performance optimization
        this.lastAvoidanceUpdate = 0;
        this.avoidanceUpdateFrequency = 60; // Updates per second
        this.spatialHashSize = 2.0; // For spatial optimization
        
        // Avoidance state
        this.currentAvoidanceVector = { x: 0, z: 0 };
        this.nearbyObstacles = [];
        this.nearbyActors = [];
        this.isAvoiding = false;
        
        // Steering behaviors
        this.steeringForces = {
            obstacle: { x: 0, z: 0 },
            actor: { x: 0, z: 0 },
            separation: { x: 0, z: 0 },
            wall: { x: 0, z: 0 }
        };
        
        console.log(`🔄 ActorCollisionAvoidance created for actor ${actorId}`);
    }
    
    /**
     * Update collision avoidance (called each frame)
     */
    update(deltaTime, actorPosition, actorVelocity, targetDirection, stageState) {
        const currentTime = performance.now();
        
        // Check if we need to update avoidance calculations
        if (currentTime - this.lastAvoidanceUpdate < (1000 / this.avoidanceUpdateFrequency)) {
            return this.currentAvoidanceVector;
        }
        
        this.lastAvoidanceUpdate = currentTime;
        
        // Reset steering forces
        Object.keys(this.steeringForces).forEach(key => {
            this.steeringForces[key].x = 0;
            this.steeringForces[key].z = 0;
        });
        
        // Update nearby objects
        this.updateNearbyObjects(actorPosition, stageState);
        
        // Calculate steering forces
        this.calculateObstacleAvoidance(actorPosition, actorVelocity, targetDirection);
        this.calculateActorAvoidance(actorPosition, actorVelocity);
        this.calculateSeparationForce(actorPosition, actorVelocity);
        this.calculateWallAvoidance(actorPosition, actorVelocity, stageState);
        
        // Combine all steering forces
        this.combineSteeringForces();
        
        // Check if we're actively avoiding something
        const avoidanceMagnitude = Math.sqrt(
            this.currentAvoidanceVector.x * this.currentAvoidanceVector.x +
            this.currentAvoidanceVector.z * this.currentAvoidanceVector.z
        );
        
        this.isAvoiding = avoidanceMagnitude > 0.1;
        
        return this.currentAvoidanceVector;
    }
    
    /**
     * Update list of nearby objects for collision detection
     */
    updateNearbyObjects(actorPosition, stageState) {
        this.nearbyObstacles = [];
        this.nearbyActors = [];
        
        // Find nearby props (obstacles)
        if (stageState.objects && stageState.objects.props) {
            stageState.objects.props.forEach(prop => {
                const distance = this.getDistance(actorPosition, prop.position);
                if (distance <= this.sensorRange) {
                    this.nearbyObstacles.push({
                        object: prop,
                        position: prop.position,
                        distance: distance,
                        radius: this.getObjectRadius(prop),
                        type: 'prop'
                    });
                }
            });
        }
        
        // Find nearby actors
        if (stageState.objects && stageState.objects.actors) {
            stageState.objects.actors.forEach(actor => {
                if (actor.userData && actor.userData.id !== this.actorId) {
                    const distance = this.getDistance(actorPosition, actor.position);
                    if (distance <= this.sensorRange) {
                        this.nearbyActors.push({
                            object: actor,
                            position: actor.position,
                            distance: distance,
                            radius: 0.5, // Actor collision radius
                            type: 'actor',
                            id: actor.userData.id
                        });
                    }
                }
            });
        }
        
        // Add stage elements as obstacles
        this.addStageElementObstacles(actorPosition, stageState);
    }
    
    /**
     * Add stage elements as obstacles
     */
    addStageElementObstacles(actorPosition, stageState) {
        if (!stageState.stage) return;
        
        // Add moveable platforms
        if (stageState.stage.moveablePlatforms) {
            stageState.stage.moveablePlatforms.forEach(platform => {
                const distance = this.getDistance(actorPosition, platform.position);
                if (distance <= this.sensorRange) {
                    this.nearbyObstacles.push({
                        object: platform,
                        position: platform.position,
                        distance: distance,
                        radius: 2.0, // Platform radius
                        type: 'platform'
                    });
                }
            });
        }
        
        // Add scenery panels
        if (stageState.stage.sceneryPanels) {
            stageState.stage.sceneryPanels.forEach(panel => {
                if (panel.visible) {
                    const distance = this.getDistance(actorPosition, panel.position);
                    if (distance <= this.sensorRange) {
                        this.nearbyObstacles.push({
                            object: panel,
                            position: panel.position,
                            distance: distance,
                            radius: 1.5, // Panel width
                            type: 'scenery'
                        });
                    }
                }
            });
        }
    }
    
    /**
     * Calculate obstacle avoidance steering force
     */
    calculateObstacleAvoidance(actorPosition, actorVelocity, targetDirection) {
        if (this.nearbyObstacles.length === 0) return;
        
        const speed = Math.sqrt(actorVelocity.x * actorVelocity.x + actorVelocity.z * actorVelocity.z);
        const lookAheadDistance = Math.max(speed * this.lookAheadTime, 1.0);
        
        // Use multiple sensors to detect obstacles
        const sensors = this.createSensorRays(actorPosition, targetDirection, lookAheadDistance);
        
        let totalAvoidanceForce = { x: 0, z: 0 };
        let obstacleCount = 0;
        
        sensors.forEach((sensor, index) => {
            const closestObstacle = this.findClosestObstacleOnRay(
                actorPosition, 
                sensor.direction, 
                sensor.distance
            );
            
            if (closestObstacle) {
                const avoidanceForce = this.calculateObstacleAvoidanceForce(
                    actorPosition, 
                    closestObstacle, 
                    sensor.direction
                );
                
                // Weight by sensor position (center sensors have more influence)
                const centerIndex = Math.floor(sensors.length / 2);
                const sensorWeight = 1.0 - Math.abs(index - centerIndex) / centerIndex * 0.5;
                
                totalAvoidanceForce.x += avoidanceForce.x * sensorWeight;
                totalAvoidanceForce.z += avoidanceForce.z * sensorWeight;
                obstacleCount++;
            }
        });
        
        if (obstacleCount > 0) {
            totalAvoidanceForce.x /= obstacleCount;
            totalAvoidanceForce.z /= obstacleCount;
            
            // Limit force magnitude
            const forceMagnitude = Math.sqrt(
                totalAvoidanceForce.x * totalAvoidanceForce.x +
                totalAvoidanceForce.z * totalAvoidanceForce.z
            );
            
            if (forceMagnitude > this.maxAvoidanceForce) {
                totalAvoidanceForce.x = (totalAvoidanceForce.x / forceMagnitude) * this.maxAvoidanceForce;
                totalAvoidanceForce.z = (totalAvoidanceForce.z / forceMagnitude) * this.maxAvoidanceForce;
            }
        }
        
        this.steeringForces.obstacle = totalAvoidanceForce;
    }
    
    /**
     * Create sensor rays for obstacle detection
     */
    createSensorRays(position, direction, distance) {
        const sensors = [];
        const angleStep = this.sensorAngle / (this.sensorCount - 1);
        const startAngle = -this.sensorAngle / 2;
        
        // Calculate base direction angle
        const baseAngle = Math.atan2(direction.x, direction.z);
        
        for (let i = 0; i < this.sensorCount; i++) {
            const sensorAngle = baseAngle + startAngle + (angleStep * i);
            const sensorDirection = {
                x: Math.sin(sensorAngle),
                z: Math.cos(sensorAngle)
            };
            
            sensors.push({
                direction: sensorDirection,
                distance: distance,
                angle: sensorAngle
            });
        }
        
        return sensors;
    }
    
    /**
     * Find closest obstacle on a ray
     */
    findClosestObstacleOnRay(origin, direction, maxDistance) {
        let closestObstacle = null;
        let closestDistance = maxDistance;
        
        this.nearbyObstacles.forEach(obstacle => {
            const intersectionDistance = this.rayCircleIntersection(
                origin,
                direction,
                obstacle.position,
                obstacle.radius + this.obstacleAvoidanceRadius
            );
            
            if (intersectionDistance !== null && intersectionDistance < closestDistance) {
                closestDistance = intersectionDistance;
                closestObstacle = obstacle;
            }
        });
        
        return closestObstacle;
    }
    
    /**
     * Calculate ray-circle intersection
     */
    rayCircleIntersection(rayOrigin, rayDirection, circleCenter, circleRadius) {
        const dx = circleCenter.x - rayOrigin.x;
        const dz = circleCenter.z - rayOrigin.z;
        
        // Project circle center onto ray
        const projection = dx * rayDirection.x + dz * rayDirection.z;
        
        if (projection < 0) return null; // Circle is behind ray origin
        
        // Find closest point on ray to circle center
        const closestX = rayOrigin.x + rayDirection.x * projection;
        const closestZ = rayOrigin.z + rayDirection.z * projection;
        
        // Calculate distance from circle center to closest point on ray
        const distanceToRay = Math.sqrt(
            (circleCenter.x - closestX) * (circleCenter.x - closestX) +
            (circleCenter.z - closestZ) * (circleCenter.z - closestZ)
        );
        
        if (distanceToRay <= circleRadius) {
            // Calculate intersection distance
            const distanceToClosestPoint = Math.sqrt(projection * projection);
            const intersectionOffset = Math.sqrt(circleRadius * circleRadius - distanceToRay * distanceToRay);
            return distanceToClosestPoint - intersectionOffset;
        }
        
        return null;
    }
    
    /**
     * Calculate avoidance force for a specific obstacle
     */
    calculateObstacleAvoidanceForce(actorPosition, obstacle, rayDirection) {
        const dx = obstacle.position.x - actorPosition.x;
        const dz = obstacle.position.z - actorPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance === 0) return { x: 0, z: 0 };
        
        // Calculate avoidance direction (perpendicular to approach direction)
        const approachX = dx / distance;
        const approachZ = dz / distance;
        
        // Choose left or right avoidance based on which is closer to ray direction
        const leftAvoidX = -approachZ;
        const leftAvoidZ = approachX;
        const rightAvoidX = approachZ;
        const rightAvoidZ = -approachX;
        
        // Calculate dot products to choose direction
        const leftDot = leftAvoidX * rayDirection.x + leftAvoidZ * rayDirection.z;
        const rightDot = rightAvoidX * rayDirection.x + rightAvoidZ * rayDirection.z;
        
        let avoidX, avoidZ;
        if (Math.abs(leftDot) > Math.abs(rightDot)) {
            avoidX = leftAvoidX;
            avoidZ = leftAvoidZ;
        } else {
            avoidX = rightAvoidX;
            avoidZ = rightAvoidZ;
        }
        
        // Calculate force strength based on distance
        const safeDistance = obstacle.radius + this.obstacleAvoidanceRadius;
        const forceStrength = Math.max(0, (safeDistance - distance) / safeDistance);
        
        return {
            x: avoidX * forceStrength * this.maxAvoidanceForce,
            z: avoidZ * forceStrength * this.maxAvoidanceForce
        };
    }
    
    /**
     * Calculate actor-to-actor avoidance
     */
    calculateActorAvoidance(actorPosition, actorVelocity) {
        if (this.nearbyActors.length === 0) return;
        
        let totalForce = { x: 0, z: 0 };
        
        this.nearbyActors.forEach(nearbyActor => {
            const distance = nearbyActor.distance;
            const requiredDistance = this.personalSpace;
            
            if (distance < requiredDistance) {
                const dx = actorPosition.x - nearbyActor.position.x;
                const dz = actorPosition.z - nearbyActor.position.z;
                
                if (distance > 0) {
                    const normalizedDx = dx / distance;
                    const normalizedDz = dz / distance;
                    
                    // Stronger avoidance for closer actors
                    const forceStrength = (requiredDistance - distance) / requiredDistance;
                    
                    totalForce.x += normalizedDx * forceStrength;
                    totalForce.z += normalizedDz * forceStrength;
                }
            }
        });
        
        // Normalize and apply maximum force
        const forceMagnitude = Math.sqrt(totalForce.x * totalForce.x + totalForce.z * totalForce.z);
        if (forceMagnitude > this.maxAvoidanceForce) {
            totalForce.x = (totalForce.x / forceMagnitude) * this.maxAvoidanceForce;
            totalForce.z = (totalForce.z / forceMagnitude) * this.maxAvoidanceForce;
        }
        
        this.steeringForces.actor = totalForce;
    }
    
    /**
     * Calculate separation force to maintain spacing in groups
     */
    calculateSeparationForce(actorPosition, actorVelocity) {
        if (this.nearbyActors.length < 2) return;
        
        let separationForce = { x: 0, z: 0 };
        let neighborCount = 0;
        
        this.nearbyActors.forEach(nearbyActor => {
            if (nearbyActor.distance < this.personalSpace * 1.5) {
                const dx = actorPosition.x - nearbyActor.position.x;
                const dz = actorPosition.z - nearbyActor.position.z;
                const distance = nearbyActor.distance;
                
                if (distance > 0) {
                    // Weight by inverse distance (closer = stronger separation)
                    const weight = 1.0 / distance;
                    separationForce.x += (dx / distance) * weight;
                    separationForce.z += (dz / distance) * weight;
                    neighborCount++;
                }
            }
        });
        
        if (neighborCount > 0) {
            separationForce.x /= neighborCount;
            separationForce.z /= neighborCount;
            
            // Limit force magnitude
            const forceMagnitude = Math.sqrt(
                separationForce.x * separationForce.x + 
                separationForce.z * separationForce.z
            );
            
            if (forceMagnitude > this.maxAvoidanceForce * 0.5) {
                separationForce.x = (separationForce.x / forceMagnitude) * this.maxAvoidanceForce * 0.5;
                separationForce.z = (separationForce.z / forceMagnitude) * this.maxAvoidanceForce * 0.5;
            }
        }
        
        this.steeringForces.separation = separationForce;
    }
    
    /**
     * Calculate wall avoidance for stage boundaries
     */
    calculateWallAvoidance(actorPosition, actorVelocity, stageState) {
        let wallForce = { x: 0, z: 0 };
        
        // Define stage boundaries (should come from stage configuration)
        const stageBounds = {
            minX: -10,
            maxX: 10,
            minZ: -10,
            maxZ: 10
        };
        
        const wallBuffer = 2.0; // Distance from wall to start avoiding
        
        // Check proximity to each wall
        if (actorPosition.x - stageBounds.minX < wallBuffer) {
            const force = (wallBuffer - (actorPosition.x - stageBounds.minX)) / wallBuffer;
            wallForce.x += force;
        }
        
        if (stageBounds.maxX - actorPosition.x < wallBuffer) {
            const force = (wallBuffer - (stageBounds.maxX - actorPosition.x)) / wallBuffer;
            wallForce.x -= force;
        }
        
        if (actorPosition.z - stageBounds.minZ < wallBuffer) {
            const force = (wallBuffer - (actorPosition.z - stageBounds.minZ)) / wallBuffer;
            wallForce.z += force;
        }
        
        if (stageBounds.maxZ - actorPosition.z < wallBuffer) {
            const force = (wallBuffer - (stageBounds.maxZ - actorPosition.z)) / wallBuffer;
            wallForce.z -= force;
        }
        
        this.steeringForces.wall = wallForce;
    }
    
    /**
     * Combine all steering forces into final avoidance vector
     */
    combineSteeringForces() {
        let combinedForce = { x: 0, z: 0 };
        
        // Apply weights to each steering force
        combinedForce.x += this.steeringForces.obstacle.x * this.weights.obstacle;
        combinedForce.z += this.steeringForces.obstacle.z * this.weights.obstacle;
        
        combinedForce.x += this.steeringForces.actor.x * this.weights.actor;
        combinedForce.z += this.steeringForces.actor.z * this.weights.actor;
        
        combinedForce.x += this.steeringForces.separation.x * this.weights.separation;
        combinedForce.z += this.steeringForces.separation.z * this.weights.separation;
        
        combinedForce.x += this.steeringForces.wall.x * this.weights.wallAvoidance;
        combinedForce.z += this.steeringForces.wall.z * this.weights.wallAvoidance;
        
        // Limit final force magnitude
        const combinedMagnitude = Math.sqrt(combinedForce.x * combinedForce.x + combinedForce.z * combinedForce.z);
        if (combinedMagnitude > this.maxAvoidanceForce) {
            combinedForce.x = (combinedForce.x / combinedMagnitude) * this.maxAvoidanceForce;
            combinedForce.z = (combinedForce.z / combinedMagnitude) * this.maxAvoidanceForce;
        }
        
        this.currentAvoidanceVector = combinedForce;
    }
    
    /**
     * Get object radius for collision calculations
     */
    getObjectRadius(obj) {
        if (obj.userData && obj.userData.type) {
            // Use PhysicsEngine bounds if available
            if (window.stagePhysicsEngine && window.stagePhysicsEngine.defaultBounds) {
                const bounds = window.stagePhysicsEngine.defaultBounds[obj.userData.type];
                if (bounds) {
                    return Math.max(bounds.width, bounds.depth) / 2;
                }
            }
        }
        
        // Default radius
        return 0.5;
    }
    
    /**
     * Calculate distance between two positions
     */
    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dz * dz);
    }
    
    /**
     * Check if actor is currently avoiding obstacles
     */
    isCurrentlyAvoiding() {
        return this.isAvoiding;
    }
    
    /**
     * Get avoidance debug information
     */
    getAvoidanceDebugInfo() {
        return {
            actorId: this.actorId,
            isAvoiding: this.isAvoiding,
            nearbyObstacles: this.nearbyObstacles.length,
            nearbyActors: this.nearbyActors.length,
            currentForce: {
                x: this.currentAvoidanceVector.x.toFixed(3),
                z: this.currentAvoidanceVector.z.toFixed(3)
            },
            steeringForces: {
                obstacle: {
                    x: this.steeringForces.obstacle.x.toFixed(3),
                    z: this.steeringForces.obstacle.z.toFixed(3)
                },
                actor: {
                    x: this.steeringForces.actor.x.toFixed(3),
                    z: this.steeringForces.actor.z.toFixed(3)
                },
                separation: {
                    x: this.steeringForces.separation.x.toFixed(3),
                    z: this.steeringForces.separation.z.toFixed(3)
                },
                wall: {
                    x: this.steeringForces.wall.x.toFixed(3),
                    z: this.steeringForces.wall.z.toFixed(3)
                }
            },
            personalSpace: this.personalSpace,
            sensorRange: this.sensorRange
        };
    }
    
    /**
     * Update avoidance parameters (for tuning)
     */
    updateParameters(params) {
        if (params.personalSpace !== undefined) this.personalSpace = params.personalSpace;
        if (params.obstacleAvoidanceRadius !== undefined) this.obstacleAvoidanceRadius = params.obstacleAvoidanceRadius;
        if (params.maxAvoidanceForce !== undefined) this.maxAvoidanceForce = params.maxAvoidanceForce;
        if (params.sensorRange !== undefined) this.sensorRange = params.sensorRange;
        if (params.weights !== undefined) {
            Object.assign(this.weights, params.weights);
        }
        
        console.log(`🔄 Actor ${this.actorId} avoidance parameters updated`);
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.ActorCollisionAvoidance = ActorCollisionAvoidance;
    console.log('🔄 ActorCollisionAvoidance loaded - collision avoidance system available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ActorCollisionAvoidance };
}