// Stage Actors Module - Actor management and interactions

import { scene } from './stage-core.js';
import { updatePropRelationships, checkAllCollisions } from './stage-physics.js';
import { PROP_CATALOG, propStates } from './stage-props.js';

export const actors = [];
export let nextActorId = 1;

// Prop interaction tracking
export const actorHeldProps = new Map(); // actor -> prop being held
export const actorSittingOn = new Map(); // actor -> furniture prop being sat on
export const throwingProps = new Map(); // prop -> {velocity, thrownBy}

export function addActorAt(x, z) {
    // Create actor group
    const actorGroup = new THREE.Group();
    
    // Body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4169e1 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    actorGroup.add(body);
    
    // Head (sphere)
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffdbac 
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.3;
    actorGroup.add(head);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.1, 2.3, 0.3);
    actorGroup.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.1, 2.3, 0.3);
    actorGroup.add(rightEye);
    
    // Position and properties
    actorGroup.position.set(x, 0, z);
    actorGroup.castShadow = true;
    actorGroup.receiveShadow = true;
    
    // Add facing indicator (small cone pointing forward)
    const noseGeometry = new THREE.ConeGeometry(0.05, 0.1, 4);
    const noseMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.set(0, 2.3, 0.35);
    nose.rotation.x = Math.PI / 2;
    actorGroup.add(nose);
    
    const actorId = `actor_${nextActorId++}`;
    actorGroup.userData = { 
        type: 'actor',
        id: actorId,
        draggable: true,
        originalY: 0,
        hidden: false,
        name: `Actor ${actorId}`
    };
    
    // Check if position is occupied before placing
    actors.push(actorGroup); // Temporarily add to check collisions
    
    if (checkAllCollisions(actorGroup, x, z)) {
        // Position occupied, try to find nearby free spot
        actors.pop(); // Remove from list
        
        let placed = false;
        const offsets = [
            {x: 1, z: 0}, {x: -1, z: 0}, {x: 0, z: 1}, {x: 0, z: -1},
            {x: 1, z: 1}, {x: -1, z: 1}, {x: 1, z: -1}, {x: -1, z: -1}
        ];
        
        for (const offset of offsets) {
            const newX = x + offset.x * 1.5;
            const newZ = z + offset.z * 1.5;
            actors.push(actorGroup); // Re-add to check
            if (!checkAllCollisions(actorGroup, newX, newZ)) {
                actorGroup.position.set(newX, 0, newZ);
                placed = true;
                break;
            }
            actors.pop(); // Remove again
        }
        
        if (!placed) {
            console.log('Could not find free space for actor');
            return; // Don't place if no free space
        }
    }
    
    scene.add(actorGroup);
    if (actors[actors.length - 1] !== actorGroup) {
        actors.push(actorGroup);
    }
    
    // Actors use same physics as props
    updatePropRelationships(actorGroup);
}

// ===== PROP INTERACTION FUNCTIONS =====

// Pick up prop - actor grabs a prop
export function pickUpProp(actor, prop) {
    if (!actor || !prop) return false;
    
    // Check if prop is grabbable
    if (!prop.userData.interactions || !prop.userData.interactions.grabbable) {
        console.log('Prop is not grabbable');
        return false;
    }
    
    // Check if actor already holding something
    if (actorHeldProps.has(actor)) {
        console.log('Actor already holding a prop');
        return false;
    }
    
    // Check distance
    const distance = actor.position.distanceTo(prop.position);
    if (distance > 2) {
        console.log('Prop too far away');
        return false;
    }
    
    // Pick up the prop
    actorHeldProps.set(actor, prop);
    prop.userData.heldBy = actor;
    console.log(`${actor.userData.name} picked up ${prop.userData.name}`);
    return true;
}

// Put down prop - actor releases held prop
export function putDownProp(actor) {
    if (!actor) return false;
    
    const prop = actorHeldProps.get(actor);
    if (!prop) {
        console.log('Actor not holding anything');
        return false;
    }
    
    // Place prop near actor
    prop.position.x = actor.position.x;
    prop.position.z = actor.position.z + 1; // Slightly in front
    prop.position.y = prop.userData.originalY;
    delete prop.userData.heldBy;
    
    actorHeldProps.delete(actor);
    updatePropRelationships(prop);
    console.log(`${actor.userData.name} put down ${prop.userData.name}`);
    return true;
}

// Throw prop - actor throws held prop
export function throwProp(actor, direction, force = 5) {
    if (!actor) return false;
    
    const prop = actorHeldProps.get(actor);
    if (!prop) {
        console.log('Actor not holding anything to throw');
        return false;
    }
    
    // Check if prop is throwable
    if (!prop.userData.interactions || !prop.userData.interactions.throwable) {
        console.log('Prop cannot be thrown');
        return false;
    }
    
    // Release from actor
    actorHeldProps.delete(actor);
    delete prop.userData.heldBy;
    
    // Calculate throw velocity
    const throwDir = direction || new THREE.Vector3(0, 0, -1);
    throwDir.normalize();
    
    const velocity = {
        x: throwDir.x * force,
        y: 2, // upward component
        z: throwDir.z * force
    };
    
    throwingProps.set(prop, {
        velocity: velocity,
        thrownBy: actor,
        gravity: -9.8
    });
    
    console.log(`${actor.userData.name} threw ${prop.userData.name}`);
    return true;
}

// Sit on furniture - actor sits on a sittable prop
export function sitOnProp(actor, prop) {
    if (!actor || !prop) return false;
    
    // Check if prop is sittable
    if (!prop.userData.interactions || !prop.userData.interactions.sittable) {
        console.log('Cannot sit on this prop');
        return false;
    }
    
    // Check if someone already sitting
    for (const [otherActor, sittingProp] of actorSittingOn) {
        if (sittingProp === prop) {
            console.log('Someone already sitting here');
            return false;
        }
    }
    
    // Check distance
    const distance = actor.position.distanceTo(prop.position);
    if (distance > 2) {
        console.log('Prop too far away');
        return false;
    }
    
    // Sit down
    actorSittingOn.set(actor, prop);
    actor.position.x = prop.position.x;
    actor.position.z = prop.position.z;
    actor.position.y = prop.userData.interactions.seatHeight || 0.5;
    
    console.log(`${actor.userData.name} sat on ${prop.userData.name}`);
    return true;
}

// Stand up from furniture
export function standUpFromProp(actor) {
    if (!actor) return false;
    
    const prop = actorSittingOn.get(actor);
    if (!prop) {
        console.log('Actor not sitting');
        return false;
    }
    
    // Stand up - move slightly forward
    actor.position.z += 1;
    actor.position.y = 0; // Reset to ground level
    
    actorSittingOn.delete(actor);
    console.log(`${actor.userData.name} stood up`);
    return true;
}

// Toggle prop state (lamp on/off, etc)
export function togglePropState(prop) {
    if (!prop) return false;
    
    const propDef = PROP_CATALOG[prop.userData.propType];
    if (!propDef || !propDef.interactions || !propDef.interactions.toggleable) {
        console.log('Prop cannot be toggled');
        return false;
    }
    
    const state = propStates.get(prop);
    if (!state) return false;
    
    // Toggle between states
    const states = propDef.interactions.states;
    const currentIndex = states.indexOf(state.currentState);
    const nextIndex = (currentIndex + 1) % states.length;
    state.currentState = states[nextIndex];
    
    // Apply visual changes based on prop type
    if (prop.userData.propType === 'lamp') {
        // Find shade and update color
        prop.traverse(child => {
            if (child instanceof THREE.Mesh && child.position.y > 1) {
                if (state.currentState === 'on') {
                    child.material.color.setHex(0xFFFF99);
                    child.material.emissive = new THREE.Color(0xFFFF66);
                    child.material.emissiveIntensity = 0.5;
                } else {
                    child.material.color.setHex(0xFFFFE0);
                    child.material.emissive = new THREE.Color(0x000000);
                    child.material.emissiveIntensity = 0;
                }
            }
        });
    }
    
    console.log(`${prop.userData.name} toggled to ${state.currentState}`);
    return true;
}

// Open/close door
export function toggleDoorState(prop) {
    if (!prop) return false;
    
    const propDef = PROP_CATALOG[prop.userData.propType];
    if (!propDef || !propDef.interactions || !propDef.interactions.openable) {
        console.log('Prop cannot be opened/closed');
        return false;
    }
    
    const state = propStates.get(prop);
    if (!state) return false;
    
    // Toggle between states
    const states = propDef.interactions.states;
    const currentIndex = states.indexOf(state.currentState);
    const nextIndex = (currentIndex + 1) % states.length;
    state.currentState = states[nextIndex];
    
    // Apply visual changes - rotate door panel
    if (prop.userData.propType === 'door') {
        prop.traverse(child => {
            if (child.userData.isDoorPanel) {
                if (state.currentState === 'open') {
                    // Rotate door 90 degrees
                    child.rotation.y = Math.PI / 2;
                    child.position.x = 0.9; // Pivot adjustment
                } else {
                    // Close door
                    child.rotation.y = 0;
                    child.position.x = 0;
                }
            }
        });
    }
    
    console.log(`${prop.userData.name} ${state.currentState}`);
    return true;
}
