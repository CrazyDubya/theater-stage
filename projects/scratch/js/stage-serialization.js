// Stage Serialization Module - Save/load, texture management, undo/redo, UI

import { scene, camera, controls } from './stage-core.js';
import { stage, moveablePlatforms, rotatingStage, trapDoors, sceneryPanels, stageMarkers, curtainState, curtainLeft, curtainRight, updateCurtainPositions, moveSceneryPanel } from './stage-geometry.js';
import { props, selectedPropType, PROP_CATALOG, addPropAt, propStates, nextPropId } from './stage-props.js';
import { actors, nextActorId, addActorAt, pickUpProp, putDownProp, throwProp, sitOnProp, standUpFromProp, togglePropState, toggleDoorState } from './stage-actors.js';
import { currentLightingPreset, applyLightingPreset, setCameraPreset } from './stage-lighting.js';
import { updatePropRelationships, checkAllCollisions, objectVelocities, getObjectMass, getObjectFriction } from './stage-physics.js';

export let placementMode = null; // 'prop', 'actor', 'select-actor', 'select-prop', 'push'
export let placementMarker = null;

// Scene serializer for save/load functionality
export class SceneSerializer {
    constructor() {
        this.version = '1.0';
    }

    // Export current scene to JSON
    exportScene(sceneName = 'Untitled Scene', description = '') {
        const sceneData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            name: sceneName,
            description: description,
            stage: {
                actors: this.serializeActors(),
                props: this.serializeProps(),
                lighting: this.serializeLighting(),
                camera: this.serializeCamera(),
                stageElements: this.serializeStageElements()
            }
        };
        
        return JSON.stringify(sceneData, null, 2);
    }

    // Import scene from JSON
    importScene(jsonData) {
        try {
            const sceneData = JSON.parse(jsonData);
            
            // Validate version
            if (sceneData.version !== this.version) {
                console.warn(`Scene version ${sceneData.version} may not be fully compatible with current version ${this.version}`);
            }
            
            // Clear current scene
            this.clearScene();
            
            // Import all elements
            this.deserializeActors(sceneData.stage.actors);
            this.deserializeProps(sceneData.stage.props);
            this.deserializeLighting(sceneData.stage.lighting);
            this.deserializeCamera(sceneData.stage.camera);
            this.deserializeStageElements(sceneData.stage.stageElements);
            
            return { success: true, name: sceneData.name, description: sceneData.description };
        } catch (error) {
            console.error('Failed to import scene:', error);
            return { success: false, error: error.message };
        }
    }

    // Serialize actors
    serializeActors() {
        return actors.map(actor => ({
            id: actor.userData.id,
            name: actor.userData.name,
            position: { x: actor.position.x, y: actor.position.y, z: actor.position.z },
            rotation: { x: actor.rotation.x, y: actor.rotation.y, z: actor.rotation.z },
            visible: actor.visible,
            hidden: actor.userData.hidden
        }));
    }

    // Serialize props
    serializeProps() {
        return props.map(prop => ({
            id: prop.userData.id,
            name: prop.userData.name,
            type: prop.userData.propType,
            position: { x: prop.position.x, y: prop.position.y, z: prop.position.z },
            rotation: { x: prop.rotation.x, y: prop.rotation.y, z: prop.rotation.z },
            visible: prop.visible,
            hidden: prop.userData.hidden
        }));
    }

    // Serialize lighting
    serializeLighting() {
        return {
            preset: currentLightingPreset,
            customSettings: {} // For future custom lighting settings
        };
    }

    // Serialize camera
    serializeCamera() {
        return {
            position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
            target: { x: controls.target.x, y: controls.target.y, z: controls.target.z }
        };
    }

    // Serialize stage elements
    serializeStageElements() {
        return {
            platforms: moveablePlatforms.map((platform, index) => ({
                index: index,
                height: platform.position.y,
                visible: platform.visible
            })),
            curtains: curtainState,
            rotatingStage: {
                visible: rotatingStage.visible,
                rotating: rotatingStage.userData.rotating,
                rotation: rotatingStage.rotation.y
            },
            trapDoors: trapDoors.map((trapDoor, index) => ({
                index: index,
                visible: trapDoor.visible,
                open: trapDoor.userData.open
            })),
            scenery: sceneryPanels.map((panel, index) => {
                const mesh = panel.children[0];
                const textureInfo = {
                    index: index,
                    position: panel.userData.currentPosition,
                    hasTexture: !!mesh.material.map,
                    textureScale: mesh.material.map ? {
                        x: mesh.material.map.repeat.x,
                        y: mesh.material.map.repeat.y
                    } : null
                };
                
                // If using a default texture, save its type
                if (mesh.material.map) {
                    const texture = mesh.material.map;
                    if (texture === textureManager.getDefaultTexture('brick')) {
                        textureInfo.defaultTexture = 'brick';
                    } else if (texture === textureManager.getDefaultTexture('wood')) {
                        textureInfo.defaultTexture = 'wood';
                    } else if (texture === textureManager.getDefaultTexture('sky')) {
                        textureInfo.defaultTexture = 'sky';
                    }
                }
                
                return textureInfo;
            }),
            markers: {
                visible: stageMarkers[0]?.visible || false
            }
        };
    }

    // Clear current scene
    clearScene() {
        // Remove all actors
        actors.forEach(actor => scene.remove(actor));
        actors.length = 0;
        
        // Remove all props
        props.forEach(prop => scene.remove(prop));
        props.length = 0;
        
        // Reset stage elements to defaults
        updateCurtainPositions();
        
        // Reset platforms
        moveablePlatforms.forEach(platform => {
            platform.position.y = 0.25;
            platform.userData.targetY = 0.25;
        });
        
        // Reset rotating stage
        rotatingStage.visible = false;
        rotatingStage.userData.rotating = false;
        rotatingStage.rotation.y = 0;
        
        // Reset trap doors
        trapDoors.forEach(trapDoor => {
            trapDoor.visible = false;
            trapDoor.userData.open = false;
            trapDoor.userData.targetRotation = 0;
        });
        
        // Reset scenery
        sceneryPanels.forEach(panel => {
            panel.userData.currentPosition = 0;
            panel.userData.targetPosition = 0;
            panel.position.x = panel.userData.isBackdrop ? -30 : 30;
        });
    }

    // Deserialize actors
    deserializeActors(actorData) {
        if (!actorData) return;
        
        actorData.forEach(data => {
            // Create actor at position
            addActorAt(data.position.x, data.position.z);
            
            // Get the last added actor
            const actor = actors[actors.length - 1];
            
            // Restore properties
            actor.position.set(data.position.x, data.position.y, data.position.z);
            actor.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
            actor.visible = data.visible;
            actor.userData.hidden = data.hidden;
            actor.userData.id = data.id;
            actor.userData.name = data.name;
        });
    }

    // Deserialize props
    deserializeProps(propData) {
        if (!propData) return;
        
        propData.forEach(data => {
            // Set the prop type and create it
            const oldType = selectedPropType;
            selectedPropType = data.type;
            addPropAt(data.position.x, data.position.z);
            selectedPropType = oldType;
            
            // Get the last added prop
            const prop = props[props.length - 1];
            
            // Restore properties
            prop.position.set(data.position.x, data.position.y, data.position.z);
            prop.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
            prop.visible = data.visible;
            prop.userData.hidden = data.hidden;
            prop.userData.id = data.id;
            prop.userData.name = data.name;
        });
    }

    // Deserialize lighting
    deserializeLighting(lightingData) {
        if (!lightingData) return;
        applyLightingPreset(lightingData.preset);
    }

    // Deserialize camera
    deserializeCamera(cameraData) {
        if (!cameraData) return;
        camera.position.set(cameraData.position.x, cameraData.position.y, cameraData.position.z);
        controls.target.set(cameraData.target.x, cameraData.target.y, cameraData.target.z);
        controls.update();
    }

    // Deserialize stage elements
    deserializeStageElements(elementsData) {
        if (!elementsData) return;
        
        // Platforms
        if (elementsData.platforms) {
            elementsData.platforms.forEach(platData => {
                if (platData.index < moveablePlatforms.length) {
                    const platform = moveablePlatforms[platData.index];
                    platform.position.y = platData.height;
                    platform.userData.targetY = platData.height;
                    platform.visible = platData.visible;
                }
            });
        }
        
        // Curtains
        if (elementsData.curtains) {
            curtainState = elementsData.curtains;
            updateCurtainPositions();
        }
        
        // Rotating stage
        if (elementsData.rotatingStage) {
            rotatingStage.visible = elementsData.rotatingStage.visible;
            rotatingStage.userData.rotating = elementsData.rotatingStage.rotating;
            rotatingStage.rotation.y = elementsData.rotatingStage.rotation;
        }
        
        // Trap doors
        if (elementsData.trapDoors) {
            elementsData.trapDoors.forEach(trapData => {
                if (trapData.index < trapDoors.length) {
                    const trapDoor = trapDoors[trapData.index];
                    trapDoor.visible = trapData.visible;
                    trapDoor.userData.open = trapData.open;
                    trapDoor.userData.targetRotation = trapData.open ? Math.PI / 2 : 0;
                }
            });
        }
        
        // Scenery
        if (elementsData.scenery) {
            elementsData.scenery.forEach(sceneryData => {
                if (sceneryData.index < sceneryPanels.length) {
                    moveSceneryPanel(sceneryData.index, sceneryData.position);
                    
                    // Restore textures
                    if (sceneryData.defaultTexture) {
                        const texture = textureManager.getDefaultTexture(sceneryData.defaultTexture);
                        if (texture) {
                            textureManager.applyTextureToPanel(sceneryData.index, texture);
                            
                            // Restore texture scale
                            if (sceneryData.textureScale) {
                                const panel = sceneryPanels[sceneryData.index];
                                const mesh = panel.children[0];
                                if (mesh.material.map) {
                                    mesh.material.map.repeat.set(
                                        sceneryData.textureScale.x,
                                        sceneryData.textureScale.y
                                    );
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Markers
        if (elementsData.markers) {
            stageMarkers.forEach(marker => {
                marker.visible = elementsData.markers.visible;
            });
        }
    }
}

// Create global serializer instance
export const sceneSerializer = new SceneSerializer();

// Texture management system
export class TextureManager {
    constructor() {
        this.textures = new Map();
        this.loader = new THREE.TextureLoader();
        this.defaultTextures = this.createDefaultTextures();
    }
    
    createDefaultTextures() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        
        const textures = {};
        
        // Create brick texture
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#654321';
        for (let y = 0; y < 256; y += 32) {
            for (let x = 0; x < 256; x += 64) {
                const offset = (y / 32) % 2 * 32;
                ctx.fillRect(x + offset, y, 60, 30);
            }
        }
        textures.brick = new THREE.CanvasTexture(canvas);
        textures.brick.wrapS = textures.brick.wrapT = THREE.RepeatWrapping;
        
        // Create wood texture
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#CD853F';
        for (let y = 0; y < 256; y += 16) {
            ctx.fillRect(0, y, 256, 8);
        }
        textures.wood = new THREE.CanvasTexture(canvas);
        textures.wood.wrapS = textures.wood.wrapT = THREE.RepeatWrapping;
        
        // Create sky texture
        const gradient = ctx.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);
        textures.sky = new THREE.CanvasTexture(canvas);
        
        return textures;
    }
    
    loadCustomTexture(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const texture = this.loader.load(e.target.result, 
                    () => resolve(texture),
                    undefined,
                    () => reject(new Error('Failed to load texture'))
                );
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    applyTextureToPanel(panelIndex, texture, scale = { x: 1, y: 1 }) {
        if (panelIndex >= sceneryPanels.length) return false;
        
        const panel = sceneryPanels[panelIndex];
        const mesh = panel.children[0]; // Main panel mesh
        
        // Clone texture to avoid sharing references
        const clonedTexture = texture.clone();
        clonedTexture.repeat.set(scale.x, scale.y);
        
        // Apply to material
        mesh.material.map = clonedTexture;
        mesh.material.needsUpdate = true;
        
        return true;
    }
    
    getDefaultTexture(name) {
        return this.defaultTextures[name];
    }
}

export const textureManager = new TextureManager();

// Command pattern for undo/redo system
export class Command {
    execute() {
        throw new Error('Execute method must be implemented');
    }
    
    undo() {
        throw new Error('Undo method must be implemented');
    }
    
    canMerge(otherCommand) {
        return false;
    }
}

export class PlaceObjectCommand extends Command {
    constructor(objectType, objectData, position) {
        super();
        this.objectType = objectType; // 'prop' or 'actor'
        this.objectData = objectData;
        this.position = position;
        this.objectRef = null;
    }
    
    execute() {
        if (this.objectType === 'prop') {
            const oldPropType = selectedPropType;
            selectedPropType = this.objectData.propType;
            addPropAt(this.position.x, this.position.z);
            selectedPropType = oldPropType;
            this.objectRef = props[props.length - 1];
        } else if (this.objectType === 'actor') {
            addActorAt(this.position.x, this.position.z);
            this.objectRef = actors[actors.length - 1];
        }
    }
    
    undo() {
        if (!this.objectRef) return;
        
        scene.remove(this.objectRef);
        if (this.objectType === 'prop') {
            const index = props.indexOf(this.objectRef);
            if (index > -1) props.splice(index, 1);
        } else if (this.objectType === 'actor') {
            const index = actors.indexOf(this.objectRef);
            if (index > -1) actors.splice(index, 1);
        }
    }
}

export class CommandManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50;
    }
    
    executeCommand(command) {
        command.execute();
        
        // Remove any commands after current index (we're creating a new branch)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Check if we can merge with the last command
        if (this.history.length > 0) {
            const lastCommand = this.history[this.history.length - 1];
            if (command.canMerge(lastCommand)) {
                // Replace the last command with the new one
                this.history[this.history.length - 1] = command;
                return;
            }
        }
        
        // Add new command
        this.history.push(command);
        this.currentIndex = this.history.length - 1;
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
        
        console.log(`Command executed. History: ${this.currentIndex + 1}/${this.history.length}`);
    }
    
    undo() {
        if (this.currentIndex >= 0) {
            const command = this.history[this.currentIndex];
            command.undo();
            this.currentIndex--;
            console.log(`Undid command. History: ${this.currentIndex + 1}/${this.history.length}`);
            return true;
        }
        return false;
    }
    
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const command = this.history[this.currentIndex];
            command.execute();
            console.log(`Redid command. History: ${this.currentIndex + 1}/${this.history.length}`);
            return true;
        }
        return false;
    }
    
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
    
    canUndo() {
        return this.currentIndex >= 0;
    }
    
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
}

export const commandManager = new CommandManager();

// Export UI interaction functions that will be used by main
export function createPlacementMarker() {
    const markerGroup = new THREE.Group();
    
    // Create a transparent circle to show placement location
    const ringGeometry = new THREE.RingGeometry(0.8, 1, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffff00,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    markerGroup.add(ring);
    
    // Add crosshair
    const lineGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        -1, 0, 0,
        1, 0, 0,
        0, 0, -1,
        0, 0, 1
    ]);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const crosshair = new THREE.LineSegments(lineGeometry, lineMaterial);
    crosshair.position.y = 0.01;
    markerGroup.add(crosshair);
    
    markerGroup.visible = false;
    scene.add(markerGroup);
    placementMarker = markerGroup;
}

export function onStageClick(event) {
    if (!placementMode) return;
    
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycaster to find where clicked
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    if (placementMode === 'select-actor') {
        // Check intersection with actors
        const intersects = raycaster.intersectObjects(actors, true);
        
        if (intersects.length > 0) {
            // Find the root actor object
            let targetActor = intersects[0].object;
            while (targetActor.parent && targetActor.parent !== scene) {
                targetActor = targetActor.parent;
            }
            
            if (targetActor.userData.type === 'actor') {
                window.setSelectedActor(targetActor);
                alert(`Selected: ${targetActor.userData.name}`);
            }
        }
        
        placementMode = null;
        return;
    }
    
    if (placementMode === 'select-prop') {
        // Check intersection with props
        const intersects = raycaster.intersectObjects(props, true);
        
        if (intersects.length > 0) {
            // Find the root prop object
            let targetProp = intersects[0].object;
            while (targetProp.parent && targetProp.parent !== scene) {
                targetProp = targetProp.parent;
            }
            
            if (targetProp.userData.type === 'prop') {
                window.setSelectedProp(targetProp);
                alert(`Selected: ${targetProp.userData.name}`);
            }
        }
        
        placementMode = null;
        return;
    }
    
    if (placementMode === 'push') {
        // Check intersection with all objects
        const allObjects = [...props, ...actors];
        const intersects = raycaster.intersectObjects(allObjects, true);
        
        if (intersects.length > 0) {
            // Find the root object (not child meshes)
            let targetObj = intersects[0].object;
            while (targetObj.parent && targetObj.parent !== scene) {
                targetObj = targetObj.parent;
            }
            
            // Apply push force
            const pushForce = 0.5; // Base push strength
            const mass = getObjectMass(targetObj);
            const pushVelocity = pushForce * (50 / mass); // Lighter objects move more
            
            // Calculate push direction from camera to object
            const pushDir = new THREE.Vector3();
            pushDir.subVectors(targetObj.position, camera.position);
            pushDir.y = 0; // Keep horizontal
            pushDir.normalize();
            
            // Apply velocity
            if (!objectVelocities.has(targetObj)) {
                objectVelocities.set(targetObj, { x: 0, z: 0 });
            }
            const vel = objectVelocities.get(targetObj);
            vel.x = pushDir.x * pushVelocity;
            vel.z = pushDir.z * pushVelocity;
            
            console.log(`Pushed ${targetObj.userData.name || targetObj.userData.id} with velocity ${pushVelocity.toFixed(2)}`);
        }
        
        // Stay in push mode for multiple pushes
        return;
    }
    
    // Check intersection with stage for placement
    const intersects = raycaster.intersectObject(stage);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        
        if (placementMode === 'prop') {
            const command = new PlaceObjectCommand('prop', 
                { propType: selectedPropType }, 
                { x: point.x, y: 0, z: point.z }
            );
            commandManager.executeCommand(command);
            window.updateUndoRedoButtons();
        } else if (placementMode === 'actor') {
            const command = new PlaceObjectCommand('actor', 
                {}, 
                { x: point.x, y: 0, z: point.z }
            );
            commandManager.executeCommand(command);
            window.updateUndoRedoButtons();
        }
        
        // Exit placement mode
        placementMode = null;
        placementMarker.visible = false;
    }
}

export function onMouseMove(event) {
    if (!placementMode || !placementMarker.visible) return;
    
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycaster to find where mouse hovers over stage
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Check intersection with stage
    const intersects = raycaster.intersectObject(stage);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        placementMarker.position.set(point.x, 0.1, point.z);
    }
}

export function onKeyDown(event) {
    // Check for Ctrl+Z (undo) and Ctrl+Y (redo)
    if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            if (commandManager.undo()) {
                window.updateUndoRedoButtons();
            }
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
            event.preventDefault();
            if (commandManager.redo()) {
                window.updateUndoRedoButtons();
            }
        }
    }
}

export function toggleMarkers() {
    stageMarkers.forEach(marker => {
        marker.visible = !marker.visible;
    });
}

export function toggleCurtains() {
    const duration = 2500;
    const startTime = Date.now();
    
    if (curtainState === 'closed') {
        curtainState = 'opening';
        
        function openCurtains() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            // Open: move curtains far apart
            curtainLeft.position.x = -2 - (18 * eased);  // Move left curtain far left
            curtainRight.position.x = 2 + (18 * eased);  // Move right curtain far right
            
            if (progress < 1) {
                requestAnimationFrame(openCurtains);
            } else {
                curtainState = 'open';
            }
        }
        openCurtains();
    } else {
        curtainState = 'closing';
        
        function closeCurtains() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            
            // Close: move curtains together to center
            curtainLeft.position.x = -20 + (18 * eased);  // Move from far left to center
            curtainRight.position.x = 20 - (18 * eased);   // Move from far right to center
            
            if (progress < 1) {
                requestAnimationFrame(closeCurtains);
            } else {
                curtainState = 'closed';
            }
        }
        closeCurtains();
    }
}

export function movePlatforms() {
    moveablePlatforms.forEach((platform, index) => {
        const userData = platform.userData;
        userData.moving = true;
        userData.targetY = userData.targetY === userData.baseY ? userData.baseY + 3 : userData.baseY;
    });
}

export function rotateCenter() {
    if (rotatingStage && rotatingStage.visible) {
        const userData = rotatingStage.userData;
        userData.rotating = !userData.rotating;
        console.log(`Rotating stage is now ${userData.rotating ? 'rotating' : 'stopped'}`);
    } else {
        alert('Please show the rotating stage first using "Show/Hide Rotating Stage" button');
    }
}

export function toggleTrapDoors() {
    trapDoors.forEach(trapDoor => {
        if (trapDoor.visible) {
            const userData = trapDoor.userData;
            userData.open = !userData.open;
            userData.targetRotation = userData.open ? Math.PI / 2 : 0;
        }
    });
}

export function toggleRotatingStageVisibility() {
    if (rotatingStage) {
        rotatingStage.visible = !rotatingStage.visible;
        if (!rotatingStage.visible) {
            rotatingStage.userData.rotating = false;
        }
    }
}

export function toggleTrapDoorsVisibility() {
    trapDoors.forEach(trapDoor => {
        trapDoor.visible = !trapDoor.visible;
        if (!trapDoor.visible) {
            trapDoor.userData.open = false;
            trapDoor.userData.targetRotation = 0;
            trapDoor.children[0].rotation.x = 0;
            trapDoor.children[0].position.z = 0;
            trapDoor.children[0].position.y = 0;
        }
    });
}

// Export setupUI to be called by main
export function setupUI() {
    // Create toggle button for menu
    const toggleButton = document.createElement('button');
    toggleButton.id = 'menu-toggle';
    toggleButton.textContent = '☰';
    toggleButton.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 20px;
        z-index: 1000;
    `;
    
    const uiContainer = document.createElement('div');
    uiContainer.id = 'ui-container';
    uiContainer.style.cssText = `
        position: absolute;
        top: 60px;
        left: 10px;
        background: rgba(0,0,0,0.7);
        padding: 15px;
        border-radius: 5px;
        color: white;
        font-family: Arial, sans-serif;
        transition: transform 0.3s ease;
    `;
    
    let menuVisible = true;
    toggleButton.addEventListener('click', () => {
        menuVisible = !menuVisible;
        if (menuVisible) {
            uiContainer.style.transform = 'translateX(0)';
            toggleButton.textContent = '☰';
        } else {
            uiContainer.style.transform = 'translateX(-350px)';
            toggleButton.textContent = '→';
        }
    });

    const lightingSelect = document.createElement('select');
    lightingSelect.style.cssText = 'margin: 5px 0; padding: 5px; width: 150px;';
    lightingSelect.innerHTML = `
        <option value="default">Default</option>
        <option value="day">Day</option>
        <option value="night">Night</option>
        <option value="sunset">Sunset</option>
        <option value="dramatic">Dramatic</option>
    `;
    lightingSelect.addEventListener('change', (e) => applyLightingPreset(e.target.value));

    // Prop selector
    const propSelect = document.createElement('select');
    propSelect.style.cssText = 'margin: 5px 0; padding: 5px; width: 150px;';
    
    // Group props by category
    const categories = {};
    Object.entries(PROP_CATALOG).forEach(([key, prop]) => {
        if (!categories[prop.category]) {
            categories[prop.category] = [];
        }
        categories[prop.category].push({ key, ...prop });
    });
    
    // Build options
    Object.entries(categories).forEach(([category, propsInCat]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);
        propsInCat.forEach(prop => {
            const option = document.createElement('option');
            option.value = prop.key;
            option.textContent = prop.name;
            optgroup.appendChild(option);
        });
        propSelect.appendChild(optgroup);
    });
    
    propSelect.addEventListener('change', (e) => {
        selectedPropType = e.target.value;
    });
    
    const propButton = document.createElement('button');
    propButton.textContent = 'Place Prop';
    propButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    propButton.addEventListener('click', () => {
        placementMode = 'prop';
        placementMarker.visible = true;
    });
    
    const actorButton = document.createElement('button');
    actorButton.textContent = 'Place Actor';
    actorButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    actorButton.addEventListener('click', () => {
        placementMode = 'actor';
        placementMarker.visible = true;
    });

    const markerToggle = document.createElement('button');
    markerToggle.textContent = 'Toggle Markers';
    markerToggle.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    markerToggle.addEventListener('click', toggleMarkers);

    const curtainButton = document.createElement('button');
    curtainButton.textContent = 'Toggle Curtains';
    curtainButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    curtainButton.addEventListener('click', toggleCurtains);

    const platformButton = document.createElement('button');
    platformButton.textContent = 'Move Platforms';
    platformButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    platformButton.addEventListener('click', movePlatforms);

    const rotateButton = document.createElement('button');
    rotateButton.textContent = 'Start/Stop Rotation';
    rotateButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    rotateButton.addEventListener('click', rotateCenter);

    const trapButton = document.createElement('button');
    trapButton.textContent = 'Toggle Trap Doors';
    trapButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    trapButton.addEventListener('click', toggleTrapDoors);

    const showRotatingButton = document.createElement('button');
    showRotatingButton.textContent = 'Show/Hide Rotating Stage';
    showRotatingButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    showRotatingButton.addEventListener('click', toggleRotatingStageVisibility);

    const showTrapDoorsButton = document.createElement('button');
    showTrapDoorsButton.textContent = 'Show/Hide Trap Doors';
    showTrapDoorsButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    showTrapDoorsButton.addEventListener('click', toggleTrapDoorsVisibility);

    // Scenery controls
    const sceneryLabel = document.createElement('div');
    sceneryLabel.innerHTML = '<strong>Scenery Panels</strong>';
    sceneryLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const backdropSelect = document.createElement('select');
    backdropSelect.style.cssText = 'margin: 5px 0; padding: 5px; width: 150px;';
    backdropSelect.innerHTML = `
        <option value="0">Backdrop: Off</option>
        <option value="0.25">Backdrop: 1/4</option>
        <option value="0.5">Backdrop: 1/2</option>
        <option value="0.75">Backdrop: 3/4</option>
        <option value="1">Backdrop: Full</option>
    `;
    backdropSelect.addEventListener('change', (e) => moveSceneryPanel(0, parseFloat(e.target.value)));
    
    const midstageSelect = document.createElement('select');
    midstageSelect.style.cssText = 'margin: 5px 0; padding: 5px; width: 150px;';
    midstageSelect.innerHTML = `
        <option value="0">Midstage: Off</option>
        <option value="0.25">Midstage: 1/4</option>
        <option value="0.5">Midstage: 1/2</option>
        <option value="0.75">Midstage: 3/4</option>
        <option value="1">Midstage: Full</option>
    `;
    midstageSelect.addEventListener('change', (e) => moveSceneryPanel(1, parseFloat(e.target.value)));

    // Texture controls
    const textureLabel = document.createElement('div');
    textureLabel.innerHTML = '<strong>Scenery Textures</strong>';
    textureLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const panelSelect = document.createElement('select');
    panelSelect.style.cssText = 'margin: 5px 0; padding: 5px; width: 150px;';
    panelSelect.innerHTML = `
        <option value="0">Backdrop Panel</option>
        <option value="1">Midstage Panel</option>
    `;
    
    const defaultTextureSelect = document.createElement('select');
    defaultTextureSelect.style.cssText = 'margin: 5px 0; padding: 5px; width: 150px;';
    defaultTextureSelect.innerHTML = `
        <option value="">Select Default Texture...</option>
        <option value="brick">Brick Wall</option>
        <option value="wood">Wood Planks</option>
        <option value="sky">Sky Gradient</option>
    `;
    defaultTextureSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            const panelIndex = parseInt(panelSelect.value);
            const texture = textureManager.getDefaultTexture(e.target.value);
            textureManager.applyTextureToPanel(panelIndex, texture);
            console.log(`Applied ${e.target.value} texture to panel ${panelIndex}`);
        }
    });
    
    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Upload Image';
    uploadButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    uploadButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                const texture = await textureManager.loadCustomTexture(file);
                const panelIndex = parseInt(panelSelect.value);
                textureManager.applyTextureToPanel(panelIndex, texture);
                console.log(`Applied custom texture to panel ${panelIndex}`);
                alert('Texture applied successfully!');
            } catch (error) {
                console.error('Texture loading failed:', error);
                alert('Failed to load texture: ' + error.message);
            }
        };
        
        input.click();
    });
    
    const textureScaleLabel = document.createElement('div');
    textureScaleLabel.textContent = 'Texture Scale:';
    textureScaleLabel.style.cssText = 'margin-top: 5px; font-size: 12px;';
    
    const scaleSlider = document.createElement('input');
    scaleSlider.type = 'range';
    scaleSlider.min = '0.1';
    scaleSlider.max = '5';
    scaleSlider.step = '0.1';
    scaleSlider.value = '1';
    scaleSlider.style.cssText = 'margin: 5px 0; width: 150px;';
    scaleSlider.addEventListener('input', (e) => {
        const scale = parseFloat(e.target.value);
        const panelIndex = parseInt(panelSelect.value);
        const panel = sceneryPanels[panelIndex];
        if (panel && panel.children[0].material.map) {
            panel.children[0].material.map.repeat.set(scale, scale);
        }
    });

    // Save/Load controls
    const saveLoadLabel = document.createElement('div');
    saveLoadLabel.innerHTML = '<strong>Save/Load Scene</strong>';
    saveLoadLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Scene';
    saveButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    saveButton.addEventListener('click', () => {
        // Note: saveScene() is defined in stage-save-load.js
        if (typeof saveScene !== 'undefined') {
            saveScene();
        } else {
            alert('Save functionality not available');
        }
    });
    
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load Scene';
    loadButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    loadButton.addEventListener('click', () => {
        // Note: loadScene() is defined in stage-save-load.js
        if (typeof loadScene !== 'undefined') {
            loadScene();
        } else {
            alert('Load functionality not available');
        }
    });
    
    // Physics test button
    const physicsLabel = document.createElement('div');
    physicsLabel.innerHTML = '<strong>Physics Test</strong>';
    physicsLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const pushButton = document.createElement('button');
    pushButton.textContent = 'Push Mode';
    pushButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    pushButton.addEventListener('click', () => {
        placementMode = 'push';
        placementMarker.visible = true;
        alert('Click on an object to push it! Lighter objects move more.');
    });
    
    // Prop Interaction controls
    const interactionLabel = document.createElement('div');
    interactionLabel.innerHTML = '<strong>Prop Interactions</strong>';
    interactionLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const interactionInfo = document.createElement('div');
    interactionInfo.style.cssText = 'font-size: 11px; margin: 5px 0; color: #aaa;';
    interactionInfo.innerHTML = 'Click actor, then prop to interact';
    
    let selectedActor = null;
    let selectedProp = null;
    
    const selectActorButton = document.createElement('button');
    selectActorButton.textContent = 'Select Actor';
    selectActorButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    selectActorButton.addEventListener('click', () => {
        placementMode = 'select-actor';
        placementMarker.visible = false;
        alert('Click on an actor to select it');
    });
    
    const selectPropButton = document.createElement('button');
    selectPropButton.textContent = 'Select Prop';
    selectPropButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    selectPropButton.addEventListener('click', () => {
        placementMode = 'select-prop';
        placementMarker.visible = false;
        alert('Click on a prop to select it');
    });
    
    const pickUpButton = document.createElement('button');
    pickUpButton.textContent = 'Pick Up';
    pickUpButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    pickUpButton.addEventListener('click', () => {
        if (selectedActor && selectedProp) {
            pickUpProp(selectedActor, selectedProp);
        } else {
            alert('Select an actor and a prop first');
        }
    });
    
    const putDownButton = document.createElement('button');
    putDownButton.textContent = 'Put Down';
    putDownButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    putDownButton.addEventListener('click', () => {
        if (selectedActor) {
            putDownProp(selectedActor);
        } else {
            alert('Select an actor first');
        }
    });
    
    const throwButton = document.createElement('button');
    throwButton.textContent = 'Throw';
    throwButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    throwButton.addEventListener('click', () => {
        if (selectedActor) {
            // Get actor facing direction (or default forward)
            const direction = new THREE.Vector3(0, 0, -1);
            throwProp(selectedActor, direction, 5);
        } else {
            alert('Select an actor first');
        }
    });
    
    const sitButton = document.createElement('button');
    sitButton.textContent = 'Sit';
    sitButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    sitButton.addEventListener('click', () => {
        if (selectedActor && selectedProp) {
            sitOnProp(selectedActor, selectedProp);
        } else {
            alert('Select an actor and a sittable prop first');
        }
    });
    
    const standButton = document.createElement('button');
    standButton.textContent = 'Stand Up';
    standButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    standButton.addEventListener('click', () => {
        if (selectedActor) {
            standUpFromProp(selectedActor);
        } else {
            alert('Select an actor first');
        }
    });
    
    const toggleStateButton = document.createElement('button');
    toggleStateButton.textContent = 'Toggle Prop State';
    toggleStateButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    toggleStateButton.addEventListener('click', () => {
        if (selectedProp) {
            const result = togglePropState(selectedProp) || toggleDoorState(selectedProp);
            if (!result) {
                alert('Prop does not have toggleable state');
            }
        } else {
            alert('Select a prop first');
        }
    });
    
    // Store references for selection
    window.selectedActor = null;
    window.selectedProp = null;
    window.setSelectedActor = (actor) => {
        window.selectedActor = actor;
        selectedActor = actor;
        console.log('Selected actor:', actor.userData.name);
    };
    window.setSelectedProp = (prop) => {
        window.selectedProp = prop;
        selectedProp = prop;
        console.log('Selected prop:', prop.userData.name);
    };
    
    // Undo/Redo controls
    const undoRedoLabel = document.createElement('div');
    undoRedoLabel.innerHTML = '<strong>Undo/Redo</strong>';
    undoRedoLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const undoButton = document.createElement('button');
    undoButton.textContent = 'Undo (Ctrl+Z)';
    undoButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    undoButton.addEventListener('click', () => {
        if (commandManager.undo()) {
            updateUndoRedoButtons();
        }
    });
    
    const redoButton = document.createElement('button');
    redoButton.textContent = 'Redo (Ctrl+Y)';
    redoButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    redoButton.addEventListener('click', () => {
        if (commandManager.redo()) {
            updateUndoRedoButtons();
        }
    });
    
    function updateUndoRedoButtons() {
        undoButton.disabled = !commandManager.canUndo();
        redoButton.disabled = !commandManager.canRedo();
        undoButton.style.opacity = commandManager.canUndo() ? '1' : '0.5';
        redoButton.style.opacity = commandManager.canRedo() ? '1' : '0.5';
    }
    
    // Initialize button states
    updateUndoRedoButtons();
    
    // Store reference for global access
    window.updateUndoRedoButtons = updateUndoRedoButtons;

    const cameraSelect = document.createElement('select');
    cameraSelect.style.cssText = 'margin: 5px 0; padding: 5px; width: 150px;';
    cameraSelect.innerHTML = `
        <option value="audience">Audience View</option>
        <option value="overhead">Overhead</option>
        <option value="stage-left">Stage Left</option>
        <option value="stage-right">Stage Right</option>
        <option value="close-up">Close Up</option>
    `;
    cameraSelect.addEventListener('change', (e) => setCameraPreset(e.target.value));

    uiContainer.innerHTML = '<div style="margin-bottom: 10px;"><strong>Controls</strong></div>';
    uiContainer.appendChild(document.createTextNode('Lighting: '));
    uiContainer.appendChild(lightingSelect);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(document.createTextNode('Camera: '));
    uiContainer.appendChild(cameraSelect);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(document.createTextNode('Prop Type: '));
    uiContainer.appendChild(propSelect);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(propButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(actorButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(markerToggle);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(curtainButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(platformButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(rotateButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(trapButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(showRotatingButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(showTrapDoorsButton);
    uiContainer.appendChild(sceneryLabel);
    uiContainer.appendChild(backdropSelect);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(midstageSelect);
    uiContainer.appendChild(textureLabel);
    uiContainer.appendChild(panelSelect);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(defaultTextureSelect);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(uploadButton);
    uiContainer.appendChild(textureScaleLabel);
    uiContainer.appendChild(scaleSlider);
    uiContainer.appendChild(saveLoadLabel);
    uiContainer.appendChild(saveButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(loadButton);
    uiContainer.appendChild(physicsLabel);
    uiContainer.appendChild(pushButton);
    uiContainer.appendChild(interactionLabel);
    uiContainer.appendChild(interactionInfo);
    uiContainer.appendChild(selectActorButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(selectPropButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(pickUpButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(putDownButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(throwButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(sitButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(standButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(toggleStateButton);
    uiContainer.appendChild(undoRedoLabel);
    uiContainer.appendChild(undoButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(redoButton);

    document.body.appendChild(toggleButton);
    document.body.appendChild(uiContainer);
}
