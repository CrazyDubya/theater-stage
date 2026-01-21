/**
 * @file Stage Props Module - Prop catalog and placement
 * @module stage-props
 */

import { scene } from './stage-core.js';
import { updatePropRelationships, checkAllCollisions } from './stage-physics.js';

/**
 * @typedef {Object} PropDefinition
 * @property {string} name - Display name of the prop
 * @property {string} category - Category (basic, furniture, items)
 * @property {Function} create - Function that returns THREE.Geometry
 * @property {number} color - Hex color code
 * @property {number} y - Default Y position
 * @property {Object} interactions - Interaction flags
 * @property {boolean} interactions.grabbable - Can be picked up
 * @property {boolean} interactions.throwable - Can be thrown
 * @property {boolean} [interactions.sittable] - Can be sat on
 * @property {boolean} [interactions.toggleable] - Has on/off state
 */

/**
 * @typedef {Object} PropState
 * @property {boolean} [on] - For lamps and lights
 * @property {boolean} [open] - For doors and containers
 * @property {Array} [contents] - For containers
 */

/** @type {Array<THREE.Mesh>} */
export let props = [];
/** @type {string} */
export let selectedPropType = 'cube'; // default prop type
/** @type {number} */
export let nextPropId = 1;
/** @type {Map<THREE.Mesh, PropState>} */
export let propStates = new Map(); // prop -> state object (e.g., lamp: {on: false}, door: {open: false})

/**
 * Prop catalog definitions
 * Contains all available prop types with their properties and behaviors
 * @type {Object.<string, PropDefinition>}
 */
export const PROP_CATALOG = {
    // Basic shapes
    cube: {
        name: 'Cube',
        category: 'basic',
        create: () => new THREE.BoxGeometry(1, 1, 1),
        color: 0x808080,
        y: 0.5,
        interactions: {
            grabbable: true,
            throwable: true
        }
    },
    sphere: {
        name: 'Sphere',
        category: 'basic',
        create: () => new THREE.SphereGeometry(0.5, 16, 16),
        color: 0x808080,
        y: 0.5,
        interactions: {
            grabbable: true,
            throwable: true
        }
    },
    cylinder: {
        name: 'Cylinder',
        category: 'basic',
        create: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
        color: 0x808080,
        y: 0.5,
        interactions: {
            grabbable: true,
            throwable: true
        }
    },
    // Furniture
    chair: {
        name: 'Chair',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            // Seat
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.1, 1),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            seat.position.y = 0.5;
            group.add(seat);
            // Back
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 0.1),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            back.position.set(0, 1, -0.45);
            group.add(back);
            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            for (let x of [-0.4, 0.4]) {
                for (let z of [-0.4, 0.4]) {
                    const leg = new THREE.Mesh(legGeometry, legMaterial);
                    leg.position.set(x, 0.25, z);
                    group.add(leg);
                }
            }
            return group;
        },
        y: 0,
        interactions: {
            sittable: true,
            seatHeight: 0.5
        }
    },
    table: {
        name: 'Table',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            // Top
            const top = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.1, 1.5),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            top.position.y = 1;
            group.add(top);
            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            for (let x of [-0.9, 0.9]) {
                for (let z of [-0.65, 0.65]) {
                    const leg = new THREE.Mesh(legGeometry, legMaterial);
                    leg.position.set(x, 0.5, z);
                    group.add(leg);
                }
            }
            return group;
        },
        y: 0,
        interactions: {}
    },
    // Stage props
    box: {
        name: 'Crate',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 1.2, 1.2),
                new THREE.MeshPhongMaterial({ color: 0xD2691E })
            );
            box.position.y = 0.6;
            group.add(box);
            // Add detail lines
            const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
            for (let i = 0; i < 3; i++) {
                const line = new THREE.Mesh(
                    new THREE.BoxGeometry(1.21, 0.02, 1.21),
                    lineMaterial
                );
                line.position.y = 0.2 + i * 0.4;
                group.add(line);
            }
            return group;
        },
        y: 0,
        interactions: {
            grabbable: true,
            throwable: false
        }
    },
    barrel: {
        name: 'Barrel',
        category: 'stage',
        create: () => {
            const group = new THREE.Group();
            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1.2, 12),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            barrel.position.y = 0.6;
            group.add(barrel);
            // Metal bands
            const bandMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
            for (let y of [0.2, 0.6, 1.0]) {
                const band = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.52, 0.52, 0.05, 12),
                    bandMaterial
                );
                band.position.y = y;
                group.add(band);
            }
            return group;
        },
        y: 0,
        interactions: {
            grabbable: true,
            throwable: false
        }
    },
    // Decorative
    plant: {
        name: 'Potted Plant',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            // Pot
            const pot = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.25, 0.4, 8),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            pot.position.y = 0.2;
            group.add(pot);
            // Plant
            const plantGeometry = new THREE.ConeGeometry(0.4, 0.8, 6);
            const plantMaterial = new THREE.MeshPhongMaterial({ color: 0x228B22 });
            const plant = new THREE.Mesh(plantGeometry, plantMaterial);
            plant.position.y = 0.8;
            group.add(plant);
            return group;
        },
        y: 0,
        interactions: {
            grabbable: true,
            throwable: false
        }
    },
    lamp: {
        name: 'Stage Lamp',
        category: 'decorative',
        create: () => {
            const group = new THREE.Group();
            // Base
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8),
                new THREE.MeshPhongMaterial({ color: 0x444444 })
            );
            base.position.y = 0.05;
            group.add(base);
            // Pole
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 1.5),
                new THREE.MeshPhongMaterial({ color: 0x666666 })
            );
            pole.position.y = 0.75;
            group.add(pole);
            // Shade
            const shade = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.2, 0.3, 8),
                new THREE.MeshPhongMaterial({ color: 0xFFFFE0 })
            );
            shade.position.y = 1.4;
            group.add(shade);
            return group;
        },
        y: 0,
        interactions: {
            toggleable: true,
            states: ['off', 'on']
        }
    },
    door: {
        name: 'Door',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            // Door frame
            const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
            const leftPost = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 2.5, 0.1),
                frameMaterial
            );
            leftPost.position.set(-1, 1.25, 0);
            group.add(leftPost);
            const rightPost = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 2.5, 0.1),
                frameMaterial
            );
            rightPost.position.set(1, 1.25, 0);
            group.add(rightPost);
            const topPost = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 0.1, 0.1),
                frameMaterial
            );
            topPost.position.set(0, 2.5, 0);
            group.add(topPost);
            // Door panel (will rotate)
            const door = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 2.3, 0.1),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            door.position.set(0, 1.15, 0);
            door.userData.isDoorPanel = true;
            group.add(door);
            // Door knob
            const knob = new THREE.Mesh(
                new THREE.SphereGeometry(0.08, 8, 8),
                new THREE.MeshPhongMaterial({ color: 0xFFD700 })
            );
            knob.position.set(0.7, 1.15, 0.1);
            group.add(knob);
            return group;
        },
        y: 0,
        interactions: {
            openable: true,
            states: ['closed', 'open']
        }
    }
};

/**
 * Add a prop to the stage at the specified coordinates
 * Automatically handles collision detection and finds nearby free spot if needed
 * @param {number} x - X coordinate on the stage
 * @param {number} z - Z coordinate on the stage
 * @returns {THREE.Mesh|null} The created prop object or null if placement failed
 */
export function addPropAt(x, z) {
    const propDef = PROP_CATALOG[selectedPropType];
    if (!propDef) return;
    
    let propObject;
    const result = propDef.create();
    
    if (result instanceof THREE.Group) {
        propObject = result;
    } else {
        // Single geometry - wrap in mesh
        const material = new THREE.MeshPhongMaterial({
            color: propDef.color || new THREE.Color(Math.random(), Math.random(), Math.random())
        });
        propObject = new THREE.Mesh(result, material);
    }
    
    propObject.position.set(x, propDef.y, z);
    propObject.castShadow = true;
    propObject.receiveShadow = true;
    
    const propId = `prop_${nextPropId++}`;
    propObject.userData = { 
        type: 'prop',
        propType: selectedPropType,
        id: propId,
        name: `${propDef.name} (${propId})`,
        draggable: true,
        originalY: propDef.y,
        hidden: false,
        interactions: propDef.interactions || {}
    };
    
    // Initialize prop state if it has stateful interactions
    if (propDef.interactions) {
        if (propDef.interactions.toggleable || propDef.interactions.openable) {
            propStates.set(propObject, {
                currentState: propDef.interactions.states ? propDef.interactions.states[0] : 'closed'
            });
        }
    }
    
    // Check if position is occupied before placing
    const tempProps = [...props];
    props.push(propObject); // Temporarily add to check collisions
    
    if (checkAllCollisions(propObject, x, z)) {
        // Position occupied, try to find nearby free spot
        props.pop(); // Remove from list
        
        let placed = false;
        const offsets = [
            {x: 1, z: 0}, {x: -1, z: 0}, {x: 0, z: 1}, {x: 0, z: -1},
            {x: 1, z: 1}, {x: -1, z: 1}, {x: 1, z: -1}, {x: -1, z: -1}
        ];
        
        for (let offset of offsets) {
            const newX = x + offset.x * 1.5;
            const newZ = z + offset.z * 1.5;
            props.push(propObject); // Re-add to check
            if (!checkAllCollisions(propObject, newX, newZ)) {
                propObject.position.set(newX, propDef.y, newZ);
                placed = true;
                break;
            }
            props.pop(); // Remove again
        }
        
        if (!placed) {
            console.log('Could not find free space for prop');
            return; // Don't place if no free space
        }
    }
    
    scene.add(propObject);
    if (props[props.length - 1] !== propObject) {
        props.push(propObject);
    }
    
    // Check initial relationships
    updatePropRelationships(propObject);
}
