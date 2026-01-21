// Stage Physics Module - Collision detection, physics calculations, relationship tracking

import { moveablePlatforms, rotatingStage, trapDoors, sceneryPanels } from './stage-geometry.js';

// Physics tracking
export let propPlatformRelations = new Map(); // prop -> platform
export let propRotatingStageRelations = new Set(); // props on rotating stage
export let propTrapDoorRelations = new Map(); // prop -> trapdoor
export let objectVelocities = new Map();

// Physics properties for objects
export const OBJECT_PHYSICS = {
    actor: { mass: 70, friction: 0.8 }, // ~70kg human
    table: { mass: 30, friction: 0.9 }, // Heavy, high friction
    chair: { mass: 8, friction: 0.7 },  // Lighter, can slide
    barrel: { mass: 50, friction: 0.6 }, // Heavy but can roll
    box: { mass: 20, friction: 0.8 },   // Medium weight
    plant: { mass: 5, friction: 0.7 },  // Light
    lamp: { mass: 3, friction: 0.9 },   // Very light
    cube: { mass: 10, friction: 0.7 },  // Default
    sphere: { mass: 8, friction: 0.4 }, // Low friction (rolls)
    cylinder: { mass: 12, friction: 0.6 },
    door: { mass: 25, friction: 0.9 }
};

// Get bounding box for an object (prop or actor)
export function getObjectBounds(obj) {
    // Default bounds based on object type
    let bounds = { width: 1, depth: 1, height: 1 };
    
    if (obj.userData.type === 'actor') {
        bounds = { width: 1, depth: 1, height: 2.5 };
    } else if (obj.userData.propType) {
        // Specific bounds for different prop types
        switch (obj.userData.propType) {
            case 'table':
                bounds = { width: 2, depth: 1.5, height: 1 };
                break;
            case 'chair':
                bounds = { width: 1, depth: 1, height: 1.5 };
                break;
            case 'barrel':
                bounds = { width: 1, depth: 1, height: 1.2 };
                break;
            case 'box':
                bounds = { width: 1.2, depth: 1.2, height: 1.2 };
                break;
            case 'plant':
                bounds = { width: 0.8, depth: 0.8, height: 1.2 };
                break;
            case 'lamp':
                bounds = { width: 0.8, depth: 0.8, height: 1.5 };
                break;
            case 'door':
                bounds = { width: 2.2, depth: 0.2, height: 2.5 };
                break;
            default:
                bounds = { width: 1, depth: 1, height: 1 };
        }
    }
    
    return bounds;
}

// Get mass of an object
export function getObjectMass(obj) {
    if (obj.userData.type === 'actor') {
        return OBJECT_PHYSICS.actor.mass;
    } else if (obj.userData.propType && OBJECT_PHYSICS[obj.userData.propType]) {
        return OBJECT_PHYSICS[obj.userData.propType].mass;
    }
    return 10; // Default mass
}

// Get friction coefficient
export function getObjectFriction(obj) {
    if (obj.userData.type === 'actor') {
        return OBJECT_PHYSICS.actor.friction;
    } else if (obj.userData.propType && OBJECT_PHYSICS[obj.userData.propType]) {
        return OBJECT_PHYSICS[obj.userData.propType].friction;
    }
    return 0.7; // Default friction
}

// Check collision between two objects
export function checkObjectCollision(obj1, pos1, obj2) {
    if (obj1 === obj2 || obj2.userData.hidden) return false;
    
    const bounds1 = getObjectBounds(obj1);
    const bounds2 = getObjectBounds(obj2);
    const pos2 = obj2.position;
    
    // Check X-Z plane collision (horizontal)
    const xOverlap = Math.abs(pos1.x - pos2.x) < (bounds1.width + bounds2.width) / 2;
    const zOverlap = Math.abs(pos1.z - pos2.z) < (bounds1.depth + bounds2.depth) / 2;
    
    // Check Y collision (vertical) - objects at different heights don't collide
    const yOverlap = Math.abs(pos1.y - pos2.y) < (bounds1.height + bounds2.height) / 2;
    
    return xOverlap && zOverlap && yOverlap;
}

// Handle collision response with momentum transfer
export function handleCollisionResponse(obj1, obj2, velocity1) {
    const mass1 = getObjectMass(obj1);
    const mass2 = getObjectMass(obj2);
    const friction2 = getObjectFriction(obj2);
    
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

// Check if object can move to new position
export function checkAllCollisions(movingObj, newX, newZ, velocity = 0) {
    const testPos = { x: newX, y: movingObj.position.y, z: newZ };
    let collisionHandled = false;
    
    // Check collision with all props (import from props module at runtime)
    const { props } = await import('./stage-props.js');
    for (let prop of props) {
        if (checkObjectCollision(movingObj, testPos, prop)) {
            if (velocity > 0) {
                // Calculate collision response
                const response = handleCollisionResponse(movingObj, prop, velocity);
                
                if (response.obj2ShouldMove) {
                    // Calculate push direction
                    const dx = prop.position.x - movingObj.position.x;
                    const dz = prop.position.z - movingObj.position.z;
                    const dist = Math.sqrt(dx*dx + dz*dz);
                    
                    if (dist > 0) {
                        // Set velocity for the pushed object
                        if (!objectVelocities.has(prop)) {
                            objectVelocities.set(prop, { x: 0, z: 0 });
                        }
                        const vel = objectVelocities.get(prop);
                        vel.x = (dx/dist) * response.obj2Velocity;
                        vel.z = (dz/dist) * response.obj2Velocity;
                    }
                }
                
                collisionHandled = true;
                return !response.obj1Moves; // Can move if momentum allows
            }
            return true; // Static collision
        }
    }
    
    // Check collision with all actors
    const { actors } = await import('./stage-actors.js');
    for (let actor of actors) {
        if (checkObjectCollision(movingObj, testPos, actor)) {
            if (velocity > 0) {
                const response = handleCollisionResponse(movingObj, actor, velocity);
                
                if (response.obj2ShouldMove) {
                    const dx = actor.position.x - movingObj.position.x;
                    const dz = actor.position.z - movingObj.position.z;
                    const dist = Math.sqrt(dx*dx + dz*dz);
                    
                    if (dist > 0) {
                        if (!objectVelocities.has(actor)) {
                            objectVelocities.set(actor, { x: 0, z: 0 });
                        }
                        const vel = objectVelocities.get(actor);
                        vel.x = (dx/dist) * response.obj2Velocity;
                        vel.z = (dz/dist) * response.obj2Velocity;
                    }
                }
                
                collisionHandled = true;
                return !response.obj1Moves;
            }
            return true;
        }
    }
    
    // Check scenery panel collisions (immovable)
    if (checkPropSceneryCollision(movingObj, newX, newZ)) {
        return true;
    }
    
    return false; // No collision
}

export function checkPropSceneryCollision(prop, newX, newZ) {
    const bounds = getObjectBounds(prop);
    const propRadius = Math.max(bounds.width, bounds.depth) / 2;
    
    // Check collision with each scenery panel
    for (let panel of sceneryPanels) {
        if (panel.userData.currentPosition > 0) { // Panel is on stage
            const panelX = panel.position.x;
            const panelZ = panel.position.z;
            const panelBounds = panel.userData.panelBounds;
            
            // Check if prop would collide with panel
            if (Math.abs(newZ - panelZ) < propRadius && 
                newX + propRadius > panelX + panelBounds.minX && 
                newX - propRadius < panelX + panelBounds.maxX) {
                
                // Check if prop can pass through cutout
                if (panel.userData.hasPassthrough) {
                    const passthrough = panel.userData.passthroughBounds;
                    const propY = prop.position.y;
                    
                    if (newX > panelX + passthrough.minX && 
                        newX < panelX + passthrough.maxX &&
                        propY > passthrough.minY && 
                        propY < passthrough.maxY) {
                        // Prop can pass through cutout
                        continue;
                    }
                }
                
                // Collision detected - prevent movement
                return true;
            }
        }
    }
    return false;
}

export function updatePropRelationships(prop) {
    const propPos = prop.position;
    
    // Clear existing relationships for this prop
    propPlatformRelations.delete(prop);
    propRotatingStageRelations.delete(prop);
    propTrapDoorRelations.delete(prop);
    
    // Check platform relationships
    moveablePlatforms.forEach((platform, index) => {
        const platPos = platform.position;
        const platData = platform.userData;
        
        // Check if prop is on this platform (within bounds)
        if (Math.abs(propPos.x - platPos.x) < 1.5 && 
            Math.abs(propPos.z - platPos.z) < 1) {
            propPlatformRelations.set(prop, platform);
        }
    });
    
    // Check rotating stage relationship
    if (rotatingStage && rotatingStage.visible) {
        const stagePos = rotatingStage.position;
        const distance = Math.sqrt(
            Math.pow(propPos.x - stagePos.x, 2) + 
            Math.pow(propPos.z - stagePos.z, 2)
        );
        
        if (distance < 5) { // Within rotating stage radius
            propRotatingStageRelations.add(prop);
        }
    }
    
    // Check trap door relationships
    trapDoors.forEach((trapDoor, index) => {
        if (trapDoor.visible) {
            const trapPos = trapDoor.position;
            
            // Check if prop is on this trap door
            if (Math.abs(propPos.x - trapPos.x) < 1 && 
                Math.abs(propPos.z - trapPos.z) < 1) {
                propTrapDoorRelations.set(prop, trapDoor);
            }
        }
    });
}

export async function updateAllPropRelationships() {
    // Update props
    const { props } = await import('./stage-props.js');
    props.forEach(prop => {
        if (!prop.userData.hidden) {
            updatePropRelationships(prop);
        }
    });
    
    // Update actors (they use same physics)
    const { actors } = await import('./stage-actors.js');
    actors.forEach(actor => {
        if (!actor.userData.hidden) {
            updatePropRelationships(actor);
        }
    });
}
