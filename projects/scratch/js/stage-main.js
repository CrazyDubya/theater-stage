// Stage Main Module - Integration and animation loop
// This is the main entry point that imports and integrates all stage modules

// Import core modules
import { scene, camera, renderer, controls, lights, init as initCore, createLighting, onWindowResize } from './stage-core.js';
import { 
    stage, curtainLeft, curtainRight, curtainTop, moveablePlatforms, 
    rotatingStage, trapDoors, sceneryPanels, stageMarkers,
    createStage, createMoveablePlatforms, createRotatingStage, 
    createTrapDoors, createSceneryPanels, createStageMarkers
} from './stage-geometry.js';
import {
    propPlatformRelations, propRotatingStageRelations, propTrapDoorRelations,
    objectVelocities, updateAllPropRelationships, checkAllCollisions
} from './stage-physics.js';
import { PROP_CATALOG, props, propStates } from './stage-props.js';
import { actors, actorHeldProps, throwingProps } from './stage-actors.js';
import { currentLightingPreset, applyLightingPreset } from './stage-lighting.js';

// Main initialization function
export function init() {
    // Initialize core (scene, camera, renderer)
    initCore();
    
    // Create stage elements
    createStage();
    createLighting();
    createMoveablePlatforms();
    createRotatingStage();
    createTrapDoors();
    createSceneryPanels();
    createStageMarkers();
    
    // Set up window resize handler
    window.addEventListener('resize', onWindowResize, false);
    
    // Start animation loop
    animate();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Animate lights (subtle pulsing effect)
    if (lights && lights.length > 0) {
        lights.forEach((light, i) => {
            if (light.intensity !== undefined) {
                const baseIntensity = light.userData.baseIntensity || light.intensity;
                light.intensity = baseIntensity + Math.sin(time * 0.5 + i) * 0.1;
            }
        });
    }
    
    // Animate stage markers (subtle floating)
    if (stageMarkers && stageMarkers.length > 0) {
        stageMarkers.forEach((marker, i) => {
            if (marker.userData && marker.userData.baseY !== undefined) {
                marker.position.y = marker.userData.baseY + Math.sin(time * 2 + i * 0.5) * 0.05;
            }
        });
    }
    
    // Animate moveable platforms (if they have animation data)
    if (moveablePlatforms && moveablePlatforms.length > 0) {
        moveablePlatforms.forEach((platform, i) => {
            if (platform.userData.animating && platform.userData.targetY !== undefined) {
                const currentY = platform.position.y;
                const targetY = platform.userData.targetY;
                const diff = targetY - currentY;
                
                if (Math.abs(diff) > 0.01) {
                    platform.position.y += diff * 0.05; // Smooth interpolation
                } else {
                    platform.position.y = targetY;
                    platform.userData.animating = false;
                }
            }
        });
    }
    
    // Rotate the rotating stage (if enabled)
    if (rotatingStage && rotatingStage.userData.rotating && rotatingStage.visible) {
        const rotationSpeed = rotatingStage.userData.rotationSpeed || 0.005;
        rotatingStage.rotation.y += rotationSpeed;
    }
    
    // Animate trap doors (rotation animation when opening/closing)
    if (trapDoors && trapDoors.length > 0) {
        trapDoors.forEach(trapDoor => {
            if (trapDoor.userData.animating) {
                const targetRotation = trapDoor.userData.open ? Math.PI / 2 : 0;
                const diff = targetRotation - trapDoor.rotation.x;
                
                if (Math.abs(diff) > 0.01) {
                    trapDoor.rotation.x += diff * 0.1;
                } else {
                    trapDoor.rotation.x = targetRotation;
                    trapDoor.userData.animating = false;
                }
            }
        });
    }
    
    // Animate scenery panels (sliding animation)
    if (sceneryPanels && sceneryPanels.length > 0) {
        sceneryPanels.forEach(panel => {
            if (panel.userData.animating && panel.userData.targetPosition !== undefined) {
                const currentPos = panel.userData.currentPosition || 'center';
                const targetPos = panel.userData.targetPosition;
                
                let targetX = 0;
                if (targetPos === 'left') targetX = -10;
                else if (targetPos === 'right') targetX = 10;
                else if (targetPos === 'center') targetX = 0;
                
                const diff = targetX - panel.position.x;
                if (Math.abs(diff) > 0.01) {
                    panel.position.x += diff * 0.05;
                } else {
                    panel.position.x = targetX;
                    panel.userData.currentPosition = targetPos;
                    panel.userData.animating = false;
                }
            }
        });
    }
    
    // Update prop physics (gravity, throwing, collisions)
    if (props && props.length > 0 && throwingProps) {
        props.forEach(prop => {
            // Handle thrown props
            if (throwingProps.has(prop)) {
                const throwData = throwingProps.get(prop);
                const vel = throwData.velocity;
                
                // Apply gravity
                vel.y -= 0.01;
                
                // Update position
                prop.position.x += vel.x;
                prop.position.y += vel.y;
                prop.position.z += vel.z;
                
                // Check if hit the ground or a platform
                let groundLevel = 0.1;
                if (propPlatformRelations && propPlatformRelations.has(prop)) {
                    const platformIndex = propPlatformRelations.get(prop);
                    if (moveablePlatforms && moveablePlatforms[platformIndex]) {
                        groundLevel = moveablePlatforms[platformIndex].position.y + 0.6;
                    }
                }
                
                if (prop.position.y <= groundLevel) {
                    prop.position.y = groundLevel;
                    vel.y = -vel.y * 0.3; // Bounce with energy loss
                    vel.x *= 0.7; // Friction
                    vel.z *= 0.7;
                    
                    // Stop if moving too slowly
                    if (Math.abs(vel.x) < 0.01 && Math.abs(vel.y) < 0.01 && Math.abs(vel.z) < 0.01) {
                        throwingProps.delete(prop);
                    }
                }
                
                // Check collisions with other objects
                if (checkAllCollisions) {
                    const speed = Math.sqrt(vel.x*vel.x + vel.y*vel.y + vel.z*vel.z);
                    if (checkAllCollisions(prop, prop.position.x, prop.position.z, speed)) {
                        // Collision detected, bounce back
                        vel.x *= -0.5;
                        vel.z *= -0.5;
                    }
                }
            }
        });
    }
    
    // Update prop relationships with platforms, trap doors, and rotating stage
    if (updateAllPropRelationships) {
        updateAllPropRelationships();
    }
    
    // Update controls
    if (controls) {
        controls.update();
    }
    
    // Render the scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Initialize when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
