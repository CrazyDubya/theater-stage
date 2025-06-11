/**
 * RenderLoop.js - High-Performance Animation Loop for 3D Theater Stage
 * 
 * Manages the main animation loop with optimized physics, collision detection,
 * and performance monitoring. Extracted from the main stage module for better
 * organization and maintainability.
 */

class StageRenderLoop {
    constructor() {
        this.isRunning = false;
        this.animationId = null;
        
        // Performance tracking
        this.frameCounter = 0;
        this.lastPerformanceLog = 0;
        
        // Animation settings
        this.performanceSettings = {
            maxCollisionDistance: 5,
            relationshipUpdateInterval: 6, // frames
            fpsUpdateInterval: 1000, // ms
            performanceLogInterval: 300 // frames (5 seconds at 60fps)
        };
        
        // Bind methods to preserve context
        this.animate = this.animate.bind(this);
        this.updateLightingAnimations = this.updateLightingAnimations.bind(this);
        this.updateMarkerAnimations = this.updateMarkerAnimations.bind(this);
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) {
            console.warn('RenderLoop: Already running');
            return;
        }
        
        console.log('RenderLoop: Starting animation loop');
        this.isRunning = true;
        this.animate();
    }

    /**
     * Stop the animation loop
     */
    stop() {
        if (!this.isRunning) {
            console.warn('RenderLoop: Not running');
            return;
        }
        
        console.log('RenderLoop: Stopping animation loop');
        this.isRunning = false;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Main animation loop - optimized for performance
     */
    animate(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        this.animationId = requestAnimationFrame(this.animate);
        
        // Update timing in state
        const deltaTime = currentTime - window.stageState.performance.lastFrameTime;
        window.stageState.performance.lastFrameTime = currentTime;
        window.stageState.performance.animationTime = currentTime * 0.001; // Convert to seconds
        window.stageState.performance.frameCount++;
        
        this.frameCounter = window.stageState.performance.frameCount;
        
        // Performance monitoring
        const frameStart = performance.now();
        window.stageState.performance.stats.collisionChecks = 0;
        
        // Cache animation time for performance
        const animationTime = window.stageState.performance.animationTime;
        
        // Update animations
        this.updateLightingAnimations(animationTime);
        this.updateMarkerAnimations(animationTime);
        this.updateCurtainAnimations(deltaTime);
        this.updateStageAnimations();
        
        // Update hair physics if modern hair system is available
        if (window.modernHairSystem && window.modernHairSystem.isInitialized) {
            window.modernHairSystem.updateHairPhysics(deltaTime * 0.001); // Convert to seconds
        }
        
        // Update VRM animations if system is available
        if (window.vrmActorSystem && window.vrmActorSystem.isInitialized) {
            window.vrmActorSystem.updateVRMAnimations(deltaTime * 0.001); // Convert to seconds
        }
        
        // Update theatrical actors if system is available (Phase 3A - Week 1)
        if (window.theatricalActorFactory && window.theatricalActorFactory.isInitialized) {
            window.theatricalActorFactory.update(deltaTime * 0.001); // Convert to seconds
        }
        
        // Update physics and relationships
        if (this.frameCounter % this.performanceSettings.relationshipUpdateInterval === 0) {
            this.updateAllObjectRelationships();
        }
        
        this.updatePhysics();
        
        // Update controls and render
        this.updateControlsAndRender();
        
        // Performance monitoring
        this.updatePerformanceStats(frameStart);
    }

    /**
     * Update lighting animations - optimized for specific presets only
     */
    updateLightingAnimations(time) {
        const currentPreset = window.stageState.ui.currentLightingPreset;
        
        // Only animate lights when specific presets are active
        if (currentPreset === 'default' || currentPreset === 'dramatic') {
            const lights = window.stageState.lights;
            lights.forEach((light, index) => {
                light.intensity = 0.8 + Math.sin(time + index) * 0.2;
            });
        }
    }

    /**
     * Update marker animations - only for visible markers
     */
    updateMarkerAnimations(time) {
        const stageMarkers = window.stageState.stageMarkers;
        
        // Only animate visible markers to avoid unnecessary work
        stageMarkers.forEach((marker, i) => {
            if (marker.visible) {
                marker.children[1].material.opacity = 0.3 + Math.sin(time * 3 + i) * 0.2;
            }
        });
    }

    /**
     * Update stage element animations (platforms, rotating stage, etc.)
     */
    updateStageAnimations() {
        this.updatePlatformAnimations();
        this.updateRotatingStageAnimation();
        this.updateSceneryPanelAnimations();
        this.updateTrapDoorAnimations();
    }

    /**
     * Update moveable platform animations
     */
    updatePlatformAnimations() {
        const platforms = window.stageState.moveablePlatforms;
        
        platforms.forEach(platform => {
            const userData = platform.userData;
            if (userData.moving) {
                const diff = userData.targetY - platform.position.y;
                if (Math.abs(diff) > 0.01) {
                    platform.position.y += diff * 0.05;
                } else {
                    platform.position.y = userData.targetY;
                    userData.moving = false;
                }
            }
        });
    }

    /**
     * Update rotating stage animation
     */
    updateRotatingStageAnimation() {
        const rotatingStage = window.stageState.stage.rotatingStage;
        
        if (rotatingStage && rotatingStage.userData.rotating && rotatingStage.visible) {
            rotatingStage.rotation.y += rotatingStage.userData.rotationSpeed;
        }
    }

    /**
     * Update scenery panel animations
     */
    updateSceneryPanelAnimations() {
        const sceneryPanels = window.stageState.sceneryPanels;
        
        sceneryPanels.forEach(panel => {
            const userData = panel.userData;
            if (userData.moving) {
                let targetX;
                
                if (userData.isBackdrop) {
                    // Backdrop slides from left using new corrected positioning
                    // 0% = -25, 25% = -18.75, 50% = -12.5, 75% = -6.25, 100% = 0
                    if (userData.targetPosition === 0) {
                        targetX = -25;
                    } else {
                        targetX = -25 + (userData.targetPosition * 25);
                    }
                } else {
                    // Midstage slides from right using new corrected positioning  
                    // 0% = +25, 25% = +18.75, 50% = +12.5, 75% = +6.25, 100% = 0
                    if (userData.targetPosition === 0) {
                        targetX = 25;
                    } else {
                        targetX = 25 - (userData.targetPosition * 25);
                    }
                }
                
                const diff = targetX - panel.position.x;
                if (Math.abs(diff) > 0.1) {
                    panel.position.x += diff * 0.05;
                } else {
                    panel.position.x = targetX;
                    userData.currentPosition = userData.targetPosition;
                    userData.moving = false;
                }
            }
        });
    }

    /**
     * Update trap door animations
     */
    updateTrapDoorAnimations() {
        const trapDoors = window.stageState.trapDoors;
        
        trapDoors.forEach(trapDoor => {
            const userData = trapDoor.userData;
            const door = trapDoor.children[0];
            const currentRotation = door.rotation.x;
            const diff = userData.targetRotation - currentRotation;
            
            if (Math.abs(diff) > 0.01) {
                door.rotation.x += diff * 0.1;
                door.position.z = Math.sin(door.rotation.x) * 1;
                door.position.y = -Math.abs(Math.sin(door.rotation.x)) * 0.5;
            } else {
                door.rotation.x = userData.targetRotation;
            }
        });
    }

    /**
     * Update object relationships (platform, rotating stage, trap door associations)
     */
    updateAllObjectRelationships() {
        if (window.stagePhysicsEngine) {
            window.stagePhysicsEngine.updateAllObjectRelationships();
        }
    }

    /**
     * Update physics for all active objects
     */
    updatePhysics() {
        const allObjects = [...window.stageState.props, ...window.stageState.actors];
        const objectVelocities = window.stageState.physics.objectVelocities;
        const propPlatformRelations = window.stageState.physics.propPlatformRelations;
        const propTrapDoorRelations = window.stageState.physics.propTrapDoorRelations;
        const propRotatingStageRelations = window.stageState.physics.propRotatingStageRelations;
        
        // Performance optimization: Filter objects that need physics updates
        const activeObjects = allObjects.filter(obj => {
            return objectVelocities.has(obj) || // Has velocity
                   propPlatformRelations.has(obj) || // On platform
                   propTrapDoorRelations.has(obj) || // Over trap door
                   propRotatingStageRelations.has(obj) || // On rotating stage
                   obj.userData.hidden; // Hidden state needs checking
        });
        
        window.stageState.performance.stats.activeObjects = activeObjects.length;
        
        activeObjects.forEach(obj => {
            this.updateObjectPhysics(obj);
        });
    }

    /**
     * Update physics for a single object
     */
    updateObjectPhysics(obj) {
        const propTrapDoorRelations = window.stageState.physics.propTrapDoorRelations;
        const propPlatformRelations = window.stageState.physics.propPlatformRelations;
        const propRotatingStageRelations = window.stageState.physics.propRotatingStageRelations;
        const objectVelocities = window.stageState.physics.objectVelocities;
        const rotatingStage = window.stageState.stage.rotatingStage;
        
        // Check if object should be hidden by trap door first
        if (propTrapDoorRelations.has(obj)) {
            const trapDoor = propTrapDoorRelations.get(obj);
            if (trapDoor.userData.open && trapDoor.visible) {
                obj.visible = false;
                obj.userData.hidden = true;
                return; // Skip other physics if hidden
            }
        }
        
        // Restore hidden objects if conditions change
        if (obj.userData.hidden) {
            const stillOverTrapDoor = propTrapDoorRelations.has(obj) && 
                                     propTrapDoorRelations.get(obj).userData.open;
            if (!stillOverTrapDoor) {
                obj.visible = true;
                obj.userData.hidden = false;
            } else {
                return; // Still hidden, skip other physics
            }
        }
        
        // Platform physics - elevation
        let baseY = obj.userData.originalY;
        if (propPlatformRelations.has(obj)) {
            const platform = propPlatformRelations.get(obj);
            // Platform is 0.5 units tall, positioned at y=0.25, so top is at 0.5
            baseY = platform.position.y + 0.25 + obj.userData.originalY;
        }
        
        // Apply elevation smoothly
        const yDiff = baseY - obj.position.y;
        if (Math.abs(yDiff) > 0.01) {
            obj.position.y += yDiff * 0.1;
        }
        
        // Apply velocity if object has momentum
        if (objectVelocities.has(obj)) {
            this.updateObjectVelocity(obj);
        }
        
        // Rotating stage physics - rotation (works even on platforms)
        if (propRotatingStageRelations.has(obj) && 
            rotatingStage.userData.rotating && 
            rotatingStage.visible) {
            this.updateRotatingStagePhysics(obj, rotatingStage);
        }
    }

    /**
     * Update object velocity and collision handling
     */
    updateObjectVelocity(obj) {
        const objectVelocities = window.stageState.physics.objectVelocities;
        const vel = objectVelocities.get(obj);
        
        if (Math.abs(vel.x) > 0.001 || Math.abs(vel.z) > 0.001) {
            const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            const newX = obj.position.x + vel.x;
            const newZ = obj.position.z + vel.z;
            
            // Play movement sound for fast-moving objects
            if (speed > 0.1 && window.audioManager) {
                window.audioManager.playMovementSound(obj, speed);
            }
            
            if (window.checkAllCollisions && !window.checkAllCollisions(obj, newX, newZ, speed)) {
                obj.position.x = newX;
                obj.position.z = newZ;
                
                // Apply friction to slow down
                const friction = window.getObjectFriction ? window.getObjectFriction(obj) : 0.7;
                vel.x *= (1 - friction * 0.1);
                vel.z *= (1 - friction * 0.1);
                
                // Stop if too slow
                if (Math.abs(vel.x) < 0.001 && Math.abs(vel.z) < 0.001) {
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
     * Update rotating stage physics for an object
     */
    updateRotatingStagePhysics(obj, rotatingStage) {
        const stageCenter = rotatingStage.position;
        const angle = rotatingStage.userData.rotationSpeed;
        
        // Calculate new position after rotation
        const dx = obj.position.x - stageCenter.x;
        const dz = obj.position.z - stageCenter.z;
        const radius = Math.sqrt(dx*dx + dz*dz);
        
        const newX = stageCenter.x + (dx * Math.cos(angle) - dz * Math.sin(angle));
        const newZ = stageCenter.z + (dx * Math.sin(angle) + dz * Math.cos(angle));
        
        // Calculate velocity from rotation
        const rotationalVelocity = radius * angle;
        
        // Check for collision with all objects before moving
        if (window.checkAllCollisions && !window.checkAllCollisions(obj, newX, newZ, rotationalVelocity)) {
            obj.position.x = newX;
            obj.position.z = newZ;
            
            // Also rotate the object itself
            obj.rotation.y += angle;
        } else {
            // Stop rotating stage if collision detected
            rotatingStage.userData.rotating = false;
            console.log('Rotation stopped due to collision');
        }
    }

    /**
     * Update controls and perform rendering
     */
    updateControlsAndRender() {
        const controls = window.stageState.controls;
        const renderer = window.stageState.renderer;
        const scene = window.stageState.scene;
        const camera = window.stageState.camera;
        
        if (controls) {
            controls.update();
        }
        
        // Update 3D audio listener position to match camera
        if (window.audioManager && camera) {
            window.audioManager.updateListenerPosition(camera);
        }
        
        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    /**
     * Update performance statistics and monitoring
     */
    updatePerformanceStats(frameStart) {
        const frameEnd = performance.now();
        const stats = window.stageState.performance.stats;
        
        stats.frameTime = frameEnd - frameStart;
        
        // Update FPS every second
        if (frameEnd - stats.lastFPSUpdate > this.performanceSettings.fpsUpdateInterval) {
            stats.fps = Math.round(1000 / stats.frameTime);
            stats.lastFPSUpdate = frameEnd;
            
            // Update memory stats
            if (window.resourceManager) {
                stats.memoryStats = window.resourceManager.getMemoryStats();
            }
            
            // Log performance stats every 5 seconds for monitoring
            if (this.frameCounter % this.performanceSettings.performanceLogInterval === 0) {
                this.logPerformanceStats();
            }
        }
    }

    /**
     * Log detailed performance statistics
     */
    logPerformanceStats() {
        const stats = window.stageState.performance.stats;
        const totalObjects = window.stageState.props.length + window.stageState.actors.length;
        
        console.log('Performance Stats:', {
            fps: stats.fps,
            frameTime: `${stats.frameTime.toFixed(2)}ms`,
            activeObjects: stats.activeObjects,
            totalObjects: totalObjects,
            collisionChecks: stats.collisionChecks,
            memory: stats.memoryStats
        });
    }

    /**
     * Update performance settings
     */
    updateSettings(newSettings) {
        this.performanceSettings = { ...this.performanceSettings, ...newSettings };
        console.log('RenderLoop: Settings updated', this.performanceSettings);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            frameCount: this.frameCounter,
            fps: window.stageState.performance.stats.fps,
            frameTime: window.stageState.performance.stats.frameTime,
            activeObjects: window.stageState.performance.stats.activeObjects
        };
    }

    /**
     * Update curtain animations for smooth opening/closing
     */
    updateCurtainAnimations(deltaTime) {
        const curtains = window.stageState?.stage?.curtains;
        if (!curtains) return;
        
        const animationSpeed = 0.03; // Smooth animation speed
        
        // Animate left curtain
        if (curtains.left?.userData?.animating) {
            const left = curtains.left;
            const diff = left.userData.targetX - left.position.x;
            if (Math.abs(diff) > 0.1) {
                left.position.x += diff * animationSpeed;
            } else {
                left.position.x = left.userData.targetX;
                left.userData.animating = false;
            }
        }
        
        // Animate right curtain
        if (curtains.right?.userData?.animating) {
            const right = curtains.right;
            const diff = right.userData.targetX - right.position.x;
            if (Math.abs(diff) > 0.1) {
                right.position.x += diff * animationSpeed;
            } else {
                right.position.x = right.userData.targetX;
                right.userData.animating = false;
            }
        }
        
        // Animate top curtain (front curtain)
        if (curtains.top?.userData?.animating) {
            const top = curtains.top;
            const diff = top.userData.targetY - top.position.y;
            if (Math.abs(diff) > 0.1) {
                top.position.y += diff * animationSpeed;
            } else {
                top.position.y = top.userData.targetY;
                top.userData.animating = false;
            }
        }
    }

    /**
     * Clean up and dispose resources
     */
    dispose() {
        this.stop();
        console.log('RenderLoop: Disposed');
    }
}

// Create global instance
const stageRenderLoop = new StageRenderLoop();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.stageRenderLoop = stageRenderLoop;
    console.log('RenderLoop loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stageRenderLoop, StageRenderLoop };
}