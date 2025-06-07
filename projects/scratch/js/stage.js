// =============================================================================
// 3D Theater Stage - Modular Architecture
// State management now handled by StateManager.js
// =============================================================================

// Global state access (will be set up by ModuleLoader)
// Note: stageState is defined in StateManager.js, we just reference it here

// Legacy global variable getters for gradual migration
// These will be replaced with direct stageState access over time
let scene, camera, renderer, controls;
let stage, lights, stageMarkers, props, actors;
let currentLightingPreset, moveablePlatforms, rotatingStage, trapDoors;
let curtainLeft, curtainRight, curtainTop, curtainState, sceneryPanels;
let placementMode, placementMarker, selectedPropType, selectedActorType, selectedSceneryPanel;
let nextActorId, nextPropId;
let propPlatformRelations, propRotatingStageRelations, propTrapDoorRelations, objectVelocities;
let performanceStats;

// Initialize state references once modules are loaded
function initializeStateReferences() {
    if (window.stageState) {
        const stageState = window.stageState;
        
        // Set up legacy global references for gradual migration
        scene = stageState.core.scene;
        camera = stageState.core.camera;
        renderer = stageState.core.renderer;
        controls = stageState.core.controls;
        
        stage = stageState.stage.stage;
        lights = stageState.stage.lights;
        stageMarkers = stageState.stage.stageMarkers;
        moveablePlatforms = stageState.stage.moveablePlatforms;
        rotatingStage = stageState.stage.rotatingStage;
        trapDoors = stageState.stage.trapDoors;
        sceneryPanels = stageState.stage.sceneryPanels;
        curtainLeft = stageState.stage.curtains.left;
        curtainRight = stageState.stage.curtains.right;
        curtainTop = stageState.stage.curtains.top;
        curtainState = stageState.stage.curtains.state;
        
        props = stageState.objects.props;
        actors = stageState.objects.actors;
        nextActorId = stageState.objects.nextActorId;
        nextPropId = stageState.objects.nextPropId;
        
        placementMode = stageState.ui.placementMode;
        placementMarker = stageState.ui.placementMarker;
        selectedPropType = stageState.ui.selectedPropType;
        selectedActorType = stageState.ui.selectedActorType;
        selectedSceneryPanel = stageState.ui.selectedSceneryPanel;
        currentLightingPreset = stageState.ui.currentLightingPreset;
        
        propPlatformRelations = stageState.physics.propPlatformRelations;
        propRotatingStageRelations = stageState.physics.propRotatingStageRelations;
        propTrapDoorRelations = stageState.physics.propTrapDoorRelations;
        objectVelocities = stageState.physics.objectVelocities;
        
        frameCount = stageState.performance.frameCount;
        lastFrameTime = stageState.performance.lastFrameTime;
        animationTime = stageState.performance.animationTime;
        performanceStats = stageState.performance.stats;
        
        // Register managers
        if (window.threeSceneManager) {
            stageState.managers.threeScene = window.threeSceneManager;
        }
        
        console.log('State references initialized');
    }
}

// Scene serializer for save/load functionality
class SceneSerializer {
    constructor() {
        this.version = '1.0';
        this.storageKey = 'theaterStage_savedScenes';
        this.currentSceneName = null;
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
    async importScene(jsonData) {
        try {
            const sceneData = JSON.parse(jsonData);
            
            // Validate version
            if (sceneData.version !== this.version) {
                console.warn(`Scene version ${sceneData.version} may not be fully compatible with current version ${this.version}`);
            }
            
            // Clear current scene
            this.clearScene();
            
            // Import all elements
            await this.deserializeActors(sceneData.stage.actors);
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
        // Properly dispose all actors
        actors.forEach(actor => {
            scene.remove(actor);
            resourceManager.disposeObject(actor);
        });
        actors = [];
        nextActorId = 1;
        
        // Properly dispose all props
        props.forEach(prop => {
            scene.remove(prop);
            resourceManager.disposeObject(prop);
        });
        props = [];
        nextPropId = 1;
        
        // Clear relationships and velocities
        propPlatformRelations.clear();
        propRotatingStageRelations.clear();
        propTrapDoorRelations.clear();
        objectVelocities.clear();
        
        // Reset stage elements to defaults
        curtainState = 'closed';
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
            panel.position.x = panel.userData.isBackdrop ? -25 : 25;
        });
    }

    // Deserialize actors
    async deserializeActors(actorData) {
        if (!actorData) return;
        
        for (const data of actorData) {
            // Extract ID number for proper ordering
            const idNum = parseInt(data.id.split('_')[1]);
            if (idNum >= nextActorId) nextActorId = idNum + 1;
            
            // Create actor at position
            const actor = await window.threeObjectFactory.addActorAt(data.position.x, data.position.z, data.actorType || selectedActorType);
            
            if (!actor) continue; // Skip if actor creation failed
            
            // Restore properties
            actor.position.set(data.position.x, data.position.y, data.position.z);
            actor.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
            actor.visible = data.visible;
            actor.userData.hidden = data.hidden;
            actor.userData.id = data.id;
            actor.userData.name = data.name;
        }
    }

    // Deserialize props
    deserializeProps(propData) {
        if (!propData) return;
        
        propData.forEach(data => {
            // Extract ID number for proper ordering
            const idNum = parseInt(data.id.split('_')[1]);
            if (idNum >= nextPropId) nextPropId = idNum + 1;
            
            // Set the prop type and create it
            selectedPropType = data.type;
            const prop = window.threeObjectFactory.addPropAt(data.position.x, data.position.z, data.type);
            
            if (!prop) return; // Skip if prop creation failed
            
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

    // Save scene to localStorage
    saveScene(name = null, description = '') {
        if (!name) {
            name = prompt('Enter a name for this scene:', this.currentSceneName || 'My Scene');
            if (!name) return false;
        }
        
        if (!description && !this.currentSceneName) {
            description = prompt('Enter a description (optional):', '') || '';
        }
        
        try {
            const sceneData = {
                name: name,
                description: description,
                data: this.exportScene(name, description),
                timestamp: new Date().toISOString(),
                stats: {
                    props: props.length,
                    actors: actors.length,
                    lightingPreset: currentLightingPreset
                }
            };
            
            const savedScenes = this.getSavedScenes();
            savedScenes[name] = sceneData;
            
            localStorage.setItem(this.storageKey, JSON.stringify(savedScenes));
            this.currentSceneName = name;
            
            alert(`Scene "${name}" saved successfully!`);
            return true;
        } catch (error) {
            console.error('Failed to save scene:', error);
            alert('Failed to save scene: ' + error.message);
            return false;
        }
    }

    // Show load dialog
    showLoadDialog() {
        const savedScenes = this.getSavedScenes();
        
        if (Object.keys(savedScenes).length === 0) {
            alert('No saved scenes found. Use "Load from File" to import a scene.');
            this.loadFromFile();
            return;
        }
        
        const sceneNames = Object.keys(savedScenes);
        const selectedScene = prompt('Select a scene to load:\n' + sceneNames.map((name, i) => `${i+1}. ${name}`).join('\n') + '\n\nEnter the number or name:');
        
        if (!selectedScene) return;
        
        let sceneName;
        if (!isNaN(selectedScene)) {
            const index = parseInt(selectedScene) - 1;
            if (index >= 0 && index < sceneNames.length) {
                sceneName = sceneNames[index];
            }
        } else {
            sceneName = selectedScene;
        }
        
        if (sceneName && savedScenes[sceneName]) {
            this.loadScene(sceneName);
        } else {
            alert('Scene not found!');
        }
    }

    // Load scene from localStorage
    loadScene(name) {
        const savedScenes = this.getSavedScenes();
        const sceneData = savedScenes[name];
        
        if (!sceneData) {
            alert('Scene not found!');
            return false;
        }
        
        try {
            const result = this.importScene(sceneData.data);
            if (result.success) {
                this.currentSceneName = name;
                alert(`Scene "${name}" loaded successfully!`);
                return true;
            } else {
                alert('Failed to load scene: ' + result.error);
                return false;
            }
        } catch (error) {
            console.error('Failed to load scene:', error);
            alert('Failed to load scene: ' + error.message);
            return false;
        }
    }

    // Export scene to file
    exportToFile(name = null) {
        if (!name) name = this.currentSceneName || 'My Scene';
        
        const sceneJson = this.exportScene(name, '');
        const blob = new Blob([sceneJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_scene.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Scene "${name}" has been downloaded as a JSON file.\nYou can load this file later using "Load Scene" > "Load from File".`);
    }

    // Load from file
    loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = this.importScene(e.target.result);
                    if (result.success) {
                        this.currentSceneName = result.name;
                        alert(`Scene "${result.name}" loaded successfully!`);
                    } else {
                        alert('Failed to load scene: ' + result.error);
                    }
                } catch (error) {
                    console.error('Failed to load scene from file:', error);
                    alert('Failed to load scene: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Get saved scenes from localStorage
    getSavedScenes() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Failed to read saved scenes:', error);
            return {};
        }
    }
}

// Create global serializer instance
const sceneSerializer = new SceneSerializer();

// Helper function to update curtain positions immediately
function updateCurtainPositions() {
    // Use StageBuilder module for curtain updates
    window.threeStageBuilder.updateCurtainPositions();
}

async function init() {
    console.log('Initializing 3D Theater Stage...');
    
    try {
        // Check if modules are loaded
        console.log('Checking module availability:', {
            stateManager: !!window.stageState,
            sceneManager: !!window.threeSceneManager,
            stageBuilder: !!window.threeStageBuilder,
            objectFactory: !!window.threeObjectFactory,
            physicsEngine: !!window.stagePhysicsEngine,
            audioSystem: !!window.stageAudioSystem,
            textureManager: !!window.stageTextureManager,
            uiManager: !!window.stageUIManager,
            renderLoop: !!window.stageRenderLoop
        });
        
        // Initialize state references
        initializeStateReferences();
        
        // Initialize Three.js scene using SceneManager
        await window.threeSceneManager.initialize();
        
        // Update local references after SceneManager initialization
        scene = window.stageState.core.scene;
        camera = window.stageState.core.camera;
        renderer = window.stageState.core.renderer;
        controls = window.stageState.core.controls;
        
        // Build all stage elements using StageBuilder
        await window.threeStageBuilder.initialize();
        
        // Initialize object creation system
        await window.threeObjectFactory.initialize();
        
        // Initialize physics engine
        await window.stagePhysicsEngine.initialize();
        
        // Initialize audio system
        await window.stageAudioSystem.initialize();
        
        // Initialize texture manager
        await window.stageTextureManager.initialize();
        
        // Initialize enhanced actor system
        if (window.enhancedActorSystem) {
            await window.enhancedActorSystem.initialize();
        }
        
        // Initialize NEW Clean Actor Creation Manager (replaces broken VRM system)
        if (window.actorCreationManager) {
            await window.actorCreationManager.initialize();
        }
        
        // Initialize UI manager
        await window.stageUIManager.initialize();
        
        // Set legacy references for backward compatibility
        window.audioManager = window.stageAudioSystem;
        window.textureManager = window.stageTextureManager;
        
        // Update local references after stage creation
        stage = window.stageState.stage.stage;
        lights = window.stageState.stage.lights;
        stageMarkers = window.stageState.stage.stageMarkers;
        moveablePlatforms = window.stageState.stage.moveablePlatforms;
        rotatingStage = window.stageState.stage.rotatingStage;
        trapDoors = window.stageState.stage.trapDoors;
        sceneryPanels = window.stageState.stage.sceneryPanels;
        curtainLeft = window.stageState.stage.curtains.left;
        curtainRight = window.stageState.stage.curtains.right;
        curtainTop = window.stageState.stage.curtains.top;
        
        // Set initial curtain state
        window.threeStageBuilder.updateCurtainPositions();
        
        createPlacementMarker();
        
        // UI setup is now handled by UIManager module

        // Set up additional event handlers (SceneManager handles resize)
        window.addEventListener('click', onStageClick, false);
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('keydown', onKeyDown, false);
        
        console.log('3D Theater Stage initialization complete!');
        
        // DEBUG: Inspect UI after initialization
        setTimeout(() => {
            console.log('=== UI INSPECTION ===');
            if (window.stageUIManager) {
                console.log('UIManager exists:', !!window.stageUIManager);
                console.log('UIManager initialized:', window.stageUIManager.isInitialized);
                console.log('Panels count:', window.stageUIManager.panels ? window.stageUIManager.panels.size : 'No panels');
                
                if (window.stageUIManager.panels) {
                    window.stageUIManager.panels.forEach((panel, id) => {
                        console.log(`Panel '${id}':`, {
                            element: panel.element,
                            children: panel.element ? panel.element.children.length : 'No element',
                            display: panel.element ? panel.element.style.display : 'No style',
                            innerHTML: panel.element ? panel.element.innerHTML.substring(0, 100) + '...' : 'No content'
                        });
                    });
                }
                
                console.log('UI Container:', window.stageUIManager.uiContainer);
                console.log('Tab Container:', window.stageUIManager.tabContainer);
            }
            
            // Check if any UI elements exist in DOM
            const menuButtons = document.querySelectorAll('button');
            console.log('Total buttons in DOM:', menuButtons.length);
            
            const selects = document.querySelectorAll('select');
            console.log('Total selects in DOM:', selects.length);
            
            console.log('=== END UI INSPECTION ===');
        }, 2000);
        
    } catch (error) {
        console.error('Failed to initialize 3D Theater Stage:', error);
    }
}

// Stage creation functions moved to StageBuilder module

function createPlacementMarker() {
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

async function onStageClick(event) {
    // Get placement mode from UIManager
    const currentPlacementMode = window.stageUIManager ? window.stageUIManager.uiState.placementMode : placementMode;
    if (!currentPlacementMode) return;
    
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycaster to find where clicked
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    if (currentPlacementMode === 'push') {
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
            const mass = window.stagePhysicsEngine.getObjectMass(targetObj);
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
        
        if (currentPlacementMode === 'prop') {
            console.log('Placing prop at:', point.x, point.z);
            
            // Use command pattern for undo/redo support
            if (window.stageCommandManager && window.AddObjectCommand) {
                const propType = window.stageUIManager ? window.stageUIManager.uiState.selectedPropType : selectedPropType;
                const command = new window.AddObjectCommand('prop', { type: propType }, { x: point.x, z: point.z });
                
                try {
                    await window.stageCommandManager.executeCommand(command);
                    console.log('Prop placed successfully with undo support');
                } catch (error) {
                    console.log('Failed to place prop:', error.message);
                }
            } else {
                // Fallback to direct placement
                const prop = window.threeObjectFactory.addPropAt(point.x, point.z);
                if (prop) {
                    console.log('Prop placed successfully (no undo support)');
                } else {
                    console.log('Failed to place prop');
                }
            }
        } else if (currentPlacementMode === 'actor') {
            console.log('Placing actor at:', point.x, point.z);
            
            // Use command pattern for undo/redo support
            if (window.stageCommandManager && window.AddObjectCommand) {
                const actorType = window.stageUIManager ? window.stageUIManager.uiState.selectedActorType : selectedActorType;
                const command = new window.AddObjectCommand('actor', { type: actorType }, { x: point.x, z: point.z });
                
                try {
                    await window.stageCommandManager.executeCommand(command);
                    console.log('Actor placed successfully with undo support');
                } catch (error) {
                    console.log('Failed to place actor:', error.message);
                }
            } else {
                // Fallback to direct placement
                const actor = await window.threeObjectFactory.addActorAt(point.x, point.z);
                if (actor) {
                    console.log('Actor placed successfully (no undo support)');
                } else {
                    console.log('Failed to place actor - check console for errors');
                }
            }
        }
        
        // Exit placement mode
        placementMode = null;
        placementMarker.visible = false;
        
        // Update UI state
        if (window.stageUIManager) {
            window.stageUIManager.setPlacementMode(null);
        }
    }
}

function onMouseMove(event) {
    const currentPlacementMode = window.stageUIManager ? window.stageUIManager.uiState.placementMode : placementMode;
    if (!currentPlacementMode || !placementMarker.visible) return;
    
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

// addControls() function now handled by SceneManager

function onKeyDown(event) {
    // Check for Ctrl+Z (undo) and Ctrl+Y (redo)
    if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            console.log('Undo requested (not implemented)');
        } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
            event.preventDefault();
            console.log('Redo requested (not implemented)');
        }
    }
}

// onWindowResize() function now handled by SceneManager

// UI management functions are now handled by UIManager module
// Legacy UI functions removed - see js/core/UIManager.js

// Legacy helper functions - maintained for compatibility
const createLabel = (text) => UIFactory.createLabel(text);
const createButton = (text, onClick) => UIFactory.createButton(text, onClick);
const createSpacer = () => UIFactory.createSpacer();

// Legacy UI creation function - still used for backward compatibility
function createLegacyUI() {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = '☰';
    toggleButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1001;
        font-size: 18px;
    `;
    
    const uiContainer = document.createElement('div');
    uiContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 70px;
        width: 350px;
        background: rgba(0,0,0,0.9);
        border-radius: 10px;
        color: white;
        z-index: 1000;
        transition: transform 0.3s ease;
        transform: translateX(0);
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
    
    // Create tab system
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
        display: flex;
        background: rgba(0,0,0,0.8);
        border-radius: 5px 5px 0 0;
    `;
    
    const tabs = {
        objects: { label: 'Objects', icon: '🎭' },
        stage: { label: 'Stage', icon: '🎪' },
        scenery: { label: 'Scenery', icon: '🖼️' },
        controls: { label: 'Controls', icon: '⚙️' }
    };
    
    const tabButtons = {};
    const tabPanels = {};
    let activeTab = 'objects';
    
    // Create tab buttons
    Object.entries(tabs).forEach(([key, tab]) => {
        const button = document.createElement('button');
        button.textContent = tab.icon + ' ' + tab.label;
        button.style.cssText = `
            flex: 1;
            padding: 10px;
            border: none;
            background: ${key === activeTab ? 'rgba(255,255,255,0.1)' : 'transparent'};
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.3s;
        `;
        
        button.addEventListener('click', () => {
            Object.keys(tabButtons).forEach(k => {
                tabButtons[k].style.background = k === key ? 'rgba(255,255,255,0.1)' : 'transparent';
                tabPanels[k].style.display = k === key ? 'block' : 'none';
            });
            activeTab = key;
        });
        
        tabButtons[key] = button;
        tabContainer.appendChild(button);
    });
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 15px;
        max-height: calc(100vh - 140px);
        overflow-y: auto;
    `;
    
    // Create all tab panels
    const objectsPanel = createObjectsPanel();
    const stagePanel = createStagePanel();
    const sceneryPanel = createSceneryPanel();
    const controlsPanel = createControlsPanel();
    
    tabPanels.objects = objectsPanel;
    tabPanels.stage = stagePanel;
    tabPanels.scenery = sceneryPanel;
    tabPanels.controls = controlsPanel;
    
    // Initially hide all but objects panel
    objectsPanel.style.display = 'block';
    stagePanel.style.display = 'none';
    sceneryPanel.style.display = 'none';
    controlsPanel.style.display = 'none';
    
    // Add panels to content container
    contentContainer.appendChild(objectsPanel);
    contentContainer.appendChild(stagePanel);
    contentContainer.appendChild(sceneryPanel);
    contentContainer.appendChild(controlsPanel);
    
    // Assemble UI
    uiContainer.appendChild(tabContainer);
    uiContainer.appendChild(contentContainer);
    
    document.body.appendChild(toggleButton);
    document.body.appendChild(uiContainer);
}

function createObjectsPanel() {
    return UIFactory.createPanel([
        UIFactory.createLabel('Props'),
        createPropSelector(),
        UIFactory.createButton('Place Prop', () => {
            placementMode = 'prop';
            placementMarker.visible = true;
        }),
        '10px', // Spacer
        UIFactory.createLabel('Actors'),
        createActorSelector(),
        UIFactory.createButton('Place Actor', () => {
            placementMode = 'actor';
            placementMarker.visible = true;
        })
    ]);
}

function createStagePanel() {
    const panel = document.createElement('div');
    
    // Lighting section
    const lightingLabel = createLabel('Lighting');
    const lightingSelect = createLightingSelector();
    
    // Camera section
    const cameraLabel = createLabel('Camera View');
    const cameraSelect = createCameraSelector();
    
    // Stage elements section
    const elementsLabel = createLabel('Stage Elements');
    const markerToggle = createButton('Toggle Markers', toggleMarkers);
    const curtainButton = createButton('Toggle Curtains', toggleCurtains);
    const platformButton = createButton('Move Platforms', movePlatforms);
    
    // Special effects
    const effectsLabel = createLabel('Special Effects');
    const showRotatingButton = createButton('Show/Hide Rotating Stage', toggleRotatingStageVisibility);
    const rotateButton = createButton('Start/Stop Rotation', rotateCenter);
    const showTrapDoorsButton = createButton('Show/Hide Trap Doors', toggleTrapDoorsVisibility);
    const trapButton = createButton('Toggle Trap Doors', toggleTrapDoors);
    
    // Assemble panel
    panel.appendChild(lightingLabel);
    panel.appendChild(lightingSelect);
    panel.appendChild(createSpacer());
    panel.appendChild(cameraLabel);
    panel.appendChild(cameraSelect);
    panel.appendChild(createSpacer());
    panel.appendChild(elementsLabel);
    panel.appendChild(markerToggle);
    panel.appendChild(curtainButton);
    panel.appendChild(platformButton);
    panel.appendChild(createSpacer());
    panel.appendChild(effectsLabel);
    panel.appendChild(showRotatingButton);
    panel.appendChild(rotateButton);
    panel.appendChild(showTrapDoorsButton);
    panel.appendChild(trapButton);
    
    return panel;
}

function createSceneryPanel() {
    const panel = document.createElement('div');
    
    // Scenery position
    const positionLabel = createLabel('Scenery Position');
    const backdropSelect = createBackdropSelector();
    const midstageSelect = createMidstageSelector();
    
    // Texture controls
    const textureLabel = createLabel('Textures');
    const panelSelect = createPanelSelector();
    const defaultTextureSelect = createDefaultTextureSelector();
    const uploadButton = createButton('Upload Image', handleTextureUpload);
    
    // Texture scale
    const scaleLabel = createLabel('Texture Scale');
    const scaleSlider = createScaleSlider();
    
    // Assemble panel
    panel.appendChild(positionLabel);
    panel.appendChild(backdropSelect);
    panel.appendChild(midstageSelect);
    panel.appendChild(createSpacer());
    panel.appendChild(textureLabel);
    panel.appendChild(panelSelect);
    panel.appendChild(defaultTextureSelect);
    panel.appendChild(uploadButton);
    panel.appendChild(createSpacer());
    panel.appendChild(scaleLabel);
    panel.appendChild(scaleSlider);
    
    return panel;
}

function createControlsPanel() {
    const panel = document.createElement('div');
    
    // Save/Load section
    const saveLoadLabel = createLabel('Save/Load Scene');
    const saveButton = createButton('Save Scene', saveScene);
    const loadButton = createButton('Load Scene', loadScene);
    const exportButton = createButton('Export to File', () => sceneManager.exportToFile());
    
    // Undo/Redo section
    const undoRedoLabel = createLabel('Undo/Redo');
    const { undoButton, redoButton } = createUndoRedoButtons();
    
    // Physics section
    const physicsLabel = createLabel('Physics Test');
    const pushButton = createButton('Push Mode', () => {
        placementMode = 'push';
        placementMarker.visible = true;
        alert('Click on an object to push it! Lighter objects move more.');
    });
    
    // Audio section
    const audioLabel = createLabel('Audio System');
    const { audioInitButton, volumeControls } = createAudioControls();
    
    // Assemble panel
    panel.appendChild(saveLoadLabel);
    const saveLoadDiv = document.createElement('div');
    saveLoadDiv.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 5px;';
    saveLoadDiv.appendChild(saveButton);
    saveLoadDiv.appendChild(loadButton);
    panel.appendChild(saveLoadDiv);
    panel.appendChild(exportButton);
    
    panel.appendChild(createSpacer());
    panel.appendChild(undoRedoLabel);
    const undoRedoDiv = document.createElement('div');
    undoRedoDiv.appendChild(undoButton);
    undoRedoDiv.appendChild(document.createTextNode(' '));
    undoRedoDiv.appendChild(redoButton);
    panel.appendChild(undoRedoDiv);
    
    panel.appendChild(createSpacer());
    panel.appendChild(physicsLabel);
    panel.appendChild(pushButton);
    
    panel.appendChild(createSpacer());
    panel.appendChild(audioLabel);
    panel.appendChild(audioInitButton);
    panel.appendChild(volumeControls);
    
    return panel;
}

function createPropSelector() {
    // Group props by category using ObjectFactory
    const categories = {};
    const propCatalog = window.threeObjectFactory.getPropCatalog();
    Object.entries(propCatalog).forEach(([key, prop]) => {
        if (!categories[prop.category]) {
            categories[prop.category] = [];
        }
        categories[prop.category].push({ value: key, label: prop.name });
    });
    
    return UIFactory.createSelect(
        categories,
        () => selectedPropType = event.target.value,
        { grouped: true }
    );
}

function createActorSelector() {
    const actorTypes = window.threeObjectFactory.getActorTypes();
    const actors = Object.entries(actorTypes).map(([key, actor]) => ({
        value: key,
        label: actor.name
    }));
    
    return UIFactory.createSelect(
        actors,
        () => selectedActorType = event.target.value
    );
}

function createLightingSelector() {
    const presets = [
        { value: 'normal', label: 'Normal (Bright)' },
        { value: 'dramatic', label: 'Dramatic (Dim Sides)' },
        { value: 'evening', label: 'Evening (Warm)' },
        { value: 'concert', label: 'Concert (Cool)' },
        { value: 'spotlight', label: 'Spotlight (Center Only)' }
    ];
    
    return UIFactory.createSelect(
        presets,
        () => applyLightingPreset(event.target.value)
    );
}

function createCameraSelector() {
    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
    
    const presets = [
        { value: 'audience', label: 'Audience View' },
        { value: 'overhead', label: 'Overhead' },
        { value: 'backstage', label: 'Backstage' },
        { value: 'stage-left', label: 'Stage Left' },
        { value: 'stage-right', label: 'Stage Right' },
        { value: 'close-up', label: 'Close-up Center' }
    ];
    
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.value;
        option.textContent = preset.label;
        select.appendChild(option);
    });
    
    select.addEventListener('change', () => {
        setCameraPreset(select.value);
    });
    
    return select;
}

function createBackdropSelector() {
    const label = document.createElement('div');
    label.innerHTML = '<strong>Backdrop Position:</strong>';
    label.style.cssText = 'margin-bottom: 5px;';
    
    const container = document.createElement('div');
    container.appendChild(label);
    
    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
    
    const positions = [
        { value: 0, label: 'Hidden' },
        { value: 0.25, label: '1/4 In' },
        { value: 0.5, label: '1/2 In' },
        { value: 0.75, label: '3/4 In' },
        { value: 1, label: 'Fully In' }
    ];
    
    positions.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos.value;
        option.textContent = pos.label;
        select.appendChild(option);
    });
    
    select.addEventListener('change', () => {
        moveSceneryPanel(0, parseFloat(select.value));
    });
    
    container.appendChild(select);
    return container;
}

function createMidstageSelector() {
    const label = document.createElement('div');
    label.innerHTML = '<strong>Midstage Position:</strong>';
    label.style.cssText = 'margin-bottom: 5px;';
    
    const container = document.createElement('div');
    container.appendChild(label);
    
    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
    
    const positions = [
        { value: 0, label: 'Hidden' },
        { value: 0.25, label: '1/4 In' },
        { value: 0.5, label: '1/2 In' },
        { value: 0.75, label: '3/4 In' },
        { value: 1, label: 'Fully In' }
    ];
    
    positions.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos.value;
        option.textContent = pos.label;
        select.appendChild(option);
    });
    
    select.addEventListener('change', () => {
        moveSceneryPanel(1, parseFloat(select.value));
    });
    
    container.appendChild(select);
    return container;
}

function createPanelSelector() {
    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
    
    const option1 = document.createElement('option');
    option1.value = '0';
    option1.textContent = 'Backdrop Panel';
    select.appendChild(option1);
    
    const option2 = document.createElement('option');
    option2.value = '1';
    option2.textContent = 'Midstage Panel';
    select.appendChild(option2);
    
    select.addEventListener('change', () => {
        selectedSceneryPanel = parseInt(select.value);
        if (window.stageState) {
            window.stageState.ui.selectedSceneryPanel = selectedSceneryPanel;
        }
        console.log('Panel selection changed to:', selectedSceneryPanel);
    });
    
    return select;
}

function createDefaultTextureSelector() {
    const select = document.createElement('select');
    select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
    
    const textures = [
        { value: 'none', label: 'None (Color Only)' },
        { value: 'brick', label: 'Brick Wall' },
        { value: 'wood', label: 'Wood Planks' },
        { value: 'sky', label: 'Sky Gradient' },
        { value: 'forest', label: 'Forest Scene' },
        { value: 'castle', label: 'Castle Wall' },
        { value: 'city', label: 'City Skyline' },
        { value: 'fabric', label: 'Theater Curtain' },
        { value: 'marble', label: 'Marble Surface' }
    ];
    
    textures.forEach(texture => {
        const option = document.createElement('option');
        option.value = texture.value;
        option.textContent = texture.label;
        select.appendChild(option);
    });
    
    select.addEventListener('change', () => {
        applyDefaultTexture(select.value);
    });
    
    return select;
}

function createScaleSlider() {
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0.1';
    slider.max = '3';
    slider.step = '0.1';
    slider.value = '1';
    slider.style.cssText = 'width: 100%; margin: 5px 0;';
    
    slider.addEventListener('input', () => {
        if (selectedSceneryPanel !== null) {
            adjustTextureScale(selectedSceneryPanel, parseFloat(slider.value));
        }
    });
    
    return slider;
}

function createUndoRedoButtons() {
    const undoButton = UIFactory.createButton('Undo', () => {
        console.log('Undo clicked (not implemented)');
    }, { small: true });
    
    const redoButton = UIFactory.createButton('Redo', () => {
        console.log('Redo clicked (not implemented)');
    }, { small: true });
    
    // Make these buttons globally accessible for updates
    window.updateUndoRedoButtons = () => {
        undoButton.disabled = true; // Always disabled since not implemented
        redoButton.disabled = true;
    };
    
    // Initial state
    window.updateUndoRedoButtons();
    
    return { undoButton, redoButton };
}

function createAudioControls() {
    const audioInitButton = UIFactory.createButton('Initialize Audio', initializeAudio);
    
    const volumeControls = document.createElement('div');
    volumeControls.innerHTML = `
        <div style="margin: 5px 0;">
            <label>Master Volume:</label><br>
            <input type="range" id="master-volume" min="0" max="1" step="0.1" value="0.5" style="width: 100%;">
        </div>
        <div style="margin: 5px 0;">
            <label>Ambience Volume:</label><br>
            <input type="range" id="ambience-volume" min="0" max="1" step="0.1" value="0.3" style="width: 100%;">
        </div>
    `;
    
    return { audioInitButton, volumeControls };
}

function handleTextureUpload() {
    console.log('Texture upload started - panel:', selectedSceneryPanel);
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            console.log('Loading texture from file:', file.name);
            
            if (!window.stageTextureManager) {
                console.error('TextureManager not available');
                alert('Texture system not initialized');
                return;
            }
            
            const texture = await window.stageTextureManager.loadCustomTexture(file);
            const panelIndex = window.stageUIManager ? window.stageUIManager.uiState.selectedSceneryPanel : (selectedSceneryPanel || 0);
            
            // Debug: Check if panel exists and is visible
            const panel = sceneryPanels[panelIndex];
            console.log('Panel info:', {
                index: panelIndex,
                panel: panel,
                position: panel ? panel.position : null,
                visible: panel ? panel.visible : null,
                children: panel ? panel.children.length : 0
            });
            
            // Make sure the panel is visible and in view
            if (panel) {
                window.moveSceneryToPosition(panelIndex, 1.0); // Move to full position
                
                // For immediate visibility, also set the panel position directly
                panel.position.x = 0; // Center position for full visibility
                panel.userData.currentPosition = 1.0;
                panel.userData.targetPosition = 1.0;
                panel.userData.moving = false;
            }
            
            const success = window.stageTextureManager.applyTextureToPanel(panelIndex, texture);
            if (success) {
                console.log(`Applied custom texture to panel ${panelIndex}`);
                alert('Texture applied successfully!');
            } else {
                alert('Failed to apply texture to panel');
            }
        } catch (error) {
            console.error('Texture loading failed:', error);
            alert('Failed to load texture: ' + error.message);
        }
    };
    
    input.click();
}

function applyDefaultTexture(textureType) {
    const panelIndex = window.stageUIManager ? window.stageUIManager.uiState.selectedSceneryPanel : (selectedSceneryPanel || 0);
    
    if (textureType === 'none') {
        window.stageTextureManager.removeTextureFromPanel(panelIndex);
        return;
    }
    
    const texture = window.stageTextureManager.getDefaultTexture(textureType);
    if (texture) {
        window.stageTextureManager.applyTextureToPanel(panelIndex, texture);
        console.log(`Applied ${textureType} texture to panel ${panelIndex}`);
    }
}

function adjustTextureScale(panelIndex, scale) {
    window.stageTextureManager.adjustTextureScale(panelIndex, scale);
}

async function initializeAudio() {
    const success = await window.stageAudioSystem.initialize();
    if (success) {
        console.log('Audio system initialized successfully');
        alert('Audio system enabled');
    } else {
        console.error('Failed to initialize audio system');
        alert('Failed to initialize audio system');
    }
}

function applyLightingPreset(preset) {
    currentLightingPreset = preset;
    
    switch(preset) {
        case 'normal':
            scene.background = new THREE.Color(0x001122);
            scene.fog = new THREE.Fog(0x001122, 10, 100);
            lights.forEach(light => {
                light.intensity = 1;
                light.color.setHex(0xffffff);
            });
            break;
        case 'dramatic':
            scene.background = new THREE.Color(0x000000);
            scene.fog = new THREE.Fog(0x000000, 5, 50);
            lights.forEach((light, i) => {
                light.intensity = i === 2 ? 1.5 : 0.3; // Center light bright, sides dim
                light.color.setHex(0xffffff);
            });
            break;
        case 'evening':
            scene.background = new THREE.Color(0xFF6B35);
            scene.fog = new THREE.Fog(0xFF6B35, 15, 90);
            lights.forEach(light => {
                light.intensity = 0.8;
                light.color.setHex(0xFFB700); // Warm golden color
            });
            break;
        case 'concert':
            scene.background = new THREE.Color(0x000033);
            scene.fog = new THREE.Fog(0x000033, 10, 80);
            lights.forEach((light, i) => {
                light.intensity = 1.2;
                light.color.setHex(0x4169e1); // Cool blue color
            });
            break;
        case 'spotlight':
            scene.background = new THREE.Color(0x000000);
            scene.fog = new THREE.Fog(0x000000, 5, 30);
            lights.forEach((light, i) => {
                if (i === 2) { // Center spotlight only
                    light.intensity = 2.0;
                    light.color.setHex(0xffffff);
                } else {
                    light.intensity = 0.1; // Very dim side lights
                    light.color.setHex(0xffffff);
                }
            });
            break;
        default:
            // Default case (same as normal)
            scene.background = new THREE.Color(0x001122);
            scene.fog = new THREE.Fog(0x001122, 10, 100);
            lights.forEach(light => {
                light.intensity = 1;
                light.color.setHex(0xffffff);
            });
    }
}

// Object creation moved to ObjectFactory module - legacy code removed

function addPropAt(x, z) {
    const propDef = PROP_CATALOG[selectedPropType];
    if (!propDef) return;
    
    let propObject;
    const result = propDef.create();
    
    if (result instanceof THREE.Group) {
        propObject = result;
    } else {
        // Single geometry - wrap in mesh using ResourceManager
        const material = resourceManager.getMaterial('phong', {
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
        originalY: propDef.y,
        hidden: false
    };
    
    // Check if position is occupied before placing
    if (window.checkAllCollisions && window.checkAllCollisions(propObject, x, z)) {
        console.log('Position occupied, cannot place prop');
        resourceManager.disposeObject(propObject);
        return null;
    }
    
    scene.add(propObject);
    props.push(propObject);
    
    // Play placement sound
    if (window.stageAudioSystem) {
        window.stageAudioSystem.playSound('place', { x, y: propDef.y, z }, 'effects');
    }
    
    console.log(`Added ${propDef.name} at (${x}, ${propDef.y}, ${z})`);
    return propObject;
}

// ACTOR_TYPES and prop creation moved to ObjectFactory module

async function addActorAt(x, z) {
    const actor = await window.threeObjectFactory.addActorAt(x, z, selectedActorType);
    if (actor) {
        actors.push(actor);
        console.log(`Added ${selectedActorType} actor at (${x}, 0, ${z})`);
    }
    return actor;
}

// Legacy functions for stage interaction

function toggleMarkers() {
    stageMarkers.forEach(marker => {
        marker.visible = !marker.visible;
    });
}

function addActorAt(x, z) {
    // Create detailed actor based on selected type
    const actorGroup = createDetailedActor(selectedActorType);
    
    // Position and properties
    actorGroup.position.set(x, 0, z);
    actorGroup.castShadow = true;
    actorGroup.receiveShadow = true;
    
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
    
    if (window.checkAllCollisions && window.checkAllCollisions(actorGroup, x, z)) {
        console.log('Position occupied, cannot place actor');
        actors.pop(); // Remove from temporary position
        resourceManager.disposeObject(actorGroup);
        return null;
    }
    
    scene.add(actorGroup);
    
    // Play placement sound
    if (window.stageAudioSystem) {
        window.stageAudioSystem.playSound('place', { x, y: 0, z }, 'effects');
    }
    
    console.log(`Added ${selectedActorType} actor at (${x}, 0, ${z})`);
    return actorGroup;
}

function setCameraPreset(preset) {
    const startTime = Date.now();
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    
    let endPos, endTarget;
    
    switch(preset) {
        case 'audience':
            endPos = new THREE.Vector3(0, 5, 20);
            endTarget = new THREE.Vector3(0, 0, 0);
            break;
        case 'overhead':
            endPos = new THREE.Vector3(0, 25, 0);
            endTarget = new THREE.Vector3(0, 0, 0);
            break;
        case 'stage-left':
            endPos = new THREE.Vector3(-20, 8, 0);
            endTarget = new THREE.Vector3(0, 0, 0);
            break;
        case 'stage-right':
            endPos = new THREE.Vector3(20, 8, 0);
            endTarget = new THREE.Vector3(0, 0, 0);
            break;
        default:
            return;
    }
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const duration = 2000; // 2 seconds
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing
        const eased = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPos, endPos, eased);
        controls.target.lerpVectors(startTarget, endTarget, eased);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    animateCamera();
}

function toggleCurtains() {
    // Use StageBuilder module for curtain toggle functionality
    window.threeStageBuilder.toggleCurtains();
    
    // Update local state reference
    curtainState = window.stageState.stage.curtains.state;
}

function movePlatforms() {
    moveablePlatforms.forEach((platform, index) => {
        const userData = platform.userData;
        userData.moving = true;
        userData.targetY = userData.targetY === userData.baseY ? userData.baseY + 3 : userData.baseY;
    });
}

function toggleRotatingStageVisibility() {
    if (rotatingStage) {
        rotatingStage.visible = !rotatingStage.visible;
        console.log('Rotating stage visibility:', rotatingStage.visible);
    }
}

function toggleTrapDoorsVisibility() {
    if (trapDoors) {
        trapDoors.forEach(trapDoor => {
            trapDoor.visible = !trapDoor.visible;
        });
        console.log('Trap doors visibility:', trapDoors[0]?.visible);
    }
}

function rotateCenter() {
    if (rotatingStage && rotatingStage.visible) {
        rotatingStage.userData.rotating = !rotatingStage.userData.rotating;
        console.log('Rotating stage rotation:', rotatingStage.userData.rotating);
    }
}

function toggleTrapDoors() {
    if (trapDoors) {
        trapDoors.forEach(trapDoor => {
            if (trapDoor.visible) {
                trapDoor.userData.open = !trapDoor.userData.open;
                trapDoor.userData.targetRotation = trapDoor.userData.open ? Math.PI / 2 : 0;
            }
        });
        console.log('Trap doors open:', trapDoors[0]?.userData.open);
    }
}

// All legacy object catalogs and corrupted syntax removed - functionality moved to ObjectFactory module

function checkPropSceneryCollision(prop, newX, newZ) {
    const bounds = window.stagePhysicsEngine.getObjectBounds(prop);
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

// Performance optimization: Cache timing and reduce expensive operations (now managed by StateManager)
let frameCount = 0, lastFrameTime = 0, animationTime = 0;

// Helper function to properly remove and dispose objects
function removeObjectProperly(object) {
    if (!object) return;
    
    // Remove from appropriate arrays
    if (object.userData.type === 'prop') {
        const index = props.indexOf(object);
        if (index > -1) props.splice(index, 1);
        
        // Clean up relationships
        propPlatformRelations.delete(object);
        propRotatingStageRelations.delete(object);
        propTrapDoorRelations.delete(object);
        objectVelocities.delete(object);
    } else if (object.userData.type === 'actor') {
        const index = actors.indexOf(object);
        if (index > -1) actors.splice(index, 1);
        
        // Clean up relationships
        objectVelocities.delete(object);
    }
    
    // Remove from scene and dispose using ResourceManager
    scene.remove(object);
    resourceManager.disposeObject(object);
}

// Simple ResourceManager for Three.js resource management
class ResourceManager {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
        this.textures = new Map();
        this.disposedObjects = new Set();
    }
    
    // Reuse geometries instead of creating new ones
    getGeometry(type, params = {}) {
        const key = `${type}_${JSON.stringify(params)}`;
        if (!this.geometries.has(key)) {
            this.geometries.set(key, this.createGeometry(type, params));
        }
        return this.geometries.get(key);
    }
    
    // Create geometry based on type
    createGeometry(type, params) {
        switch (type) {
            case 'box':
                return new THREE.BoxGeometry(
                    params.width || 1, 
                    params.height || 1, 
                    params.depth || 1
                );
            case 'sphere':
                return new THREE.SphereGeometry(
                    params.radius || 0.5, 
                    params.widthSegments || 16, 
                    params.heightSegments || 16
                );
            case 'cylinder':
                return new THREE.CylinderGeometry(
                    params.radiusTop || 1,
                    params.radiusBottom || 1,
                    params.height || 1,
                    params.radialSegments || 16
                );
            case 'plane':
                return new THREE.PlaneGeometry(
                    params.width || 1,
                    params.height || 1
                );
            default:
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }
    
    // Reuse materials
    getMaterial(type, params = {}) {
        const key = `${type}_${JSON.stringify(params)}`;
        if (!this.materials.has(key)) {
            this.materials.set(key, this.createMaterial(type, params));
        }
        return this.materials.get(key);
    }
    
    // Create material based on type
    createMaterial(type, params) {
        switch (type) {
            case 'phong':
                return new THREE.MeshPhongMaterial(params);
            case 'basic':
                return new THREE.MeshBasicMaterial(params);
            case 'lambert':
                return new THREE.MeshLambertMaterial(params);
            default:
                return new THREE.MeshPhongMaterial(params);
        }
    }
    
    // Dispose object and its resources
    disposeObject(object) {
        if (!object) return;
        
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                    if (mat.map) mat.map.dispose();
                    mat.dispose();
                });
            } else {
                if (object.material.map) object.material.map.dispose();
                object.material.dispose();
            }
        }
        
        // Recursively dispose children
        if (object.children) {
            object.children.forEach(child => this.disposeObject(child));
        }
        
        this.disposedObjects.add(object);
    }
    
    // Memory stats for performance monitoring
    getMemoryStats() {
        return {
            geometries: this.geometries.size,
            materials: this.materials.size,
            textures: this.textures.size,
            disposedObjects: this.disposedObjects.size
        };
    }
    
    // Event listener management for UI components
    addEventListenerManaged(element, eventType, handler) {
        // Simple event listener management - can be enhanced later
        element.addEventListener(eventType, handler);
    }
}

// Create global resource manager  
const resourceManager = new ResourceManager();
window.resourceManager = resourceManager;

// Global collision check function for ObjectFactory
window.checkAllCollisions = function(object, x, z) {
    // Simple collision check - can be enhanced later
    return false; // For now, allow all placements
};

// Global prop relationships function for ObjectFactory
window.updatePropRelationships = function(prop) {
    // Simple relationship update - can be enhanced later
    console.log('Updating prop relationships for:', prop.userData.id);
};

// Global texture upload function for UIManager
window.handleTextureUpload = handleTextureUpload;

// Global texture application function for UIManager
window.applyDefaultTexture = applyDefaultTexture;

// Global scenery movement function for UIManager
window.moveSceneryToPosition = function(panelIndex, position) {
    if (!sceneryPanels || panelIndex >= sceneryPanels.length) {
        console.error('Invalid scenery panel index:', panelIndex);
        return;
    }
    
    const panel = sceneryPanels[panelIndex];
    if (!panel) return;
    
    // Calculate target position based on panel type
    // Stage is 20 units wide (x=-10 to x=10). Panels start at x=±25 (hidden off-stage)
    // Position values should represent incremental movement onto stage, not full traversal
    let targetX;
    
    if (panel.userData.isBackdrop) {
        // Backdrop moves from left side incrementally onto stage
        // 0% = -25 (completely hidden off-stage left)
        // 25% = -15 (panel edge just touching stage left at x=-10)  
        // 50% = -10 (panel 1/4 onto stage)
        // 75% = -5 (panel 1/2 onto stage)
        // 100% = 0 (panel 3/4 onto stage, centered)
        if (position === 0) {
            targetX = -25; // Completely hidden off-stage
        } else {
            // Linear interpolation from hidden (-25) to center-ish (0)
            targetX = -25 + (position * 25); 
        }
    } else {
        // Midstage moves from right side incrementally onto stage
        // 0% = +25 (completely hidden off-stage right)
        // 25% = +15 (panel edge just touching stage right at x=+10)
        // 50% = +10 (panel 1/4 onto stage) 
        // 75% = +5 (panel 1/2 onto stage)
        // 100% = 0 (panel 3/4 onto stage, centered)
        if (position === 0) {
            targetX = 25; // Completely hidden off-stage
        } else {
            // Linear interpolation from hidden (+25) to center-ish (0)
            targetX = 25 - (position * 25);
        }
    }
    
    // Set position immediately (no animation for now)
    panel.position.x = targetX;
    panel.userData.currentPosition = position;
    panel.userData.targetPosition = position;
    
    console.log(`DEBUG: Panel ${panelIndex} (${panel.userData.isBackdrop ? 'backdrop' : 'midstage'}) position ${position}% -> targetX: ${targetX}`);
    console.log(`DEBUG: New calculation: ${panel.userData.isBackdrop ? '-25 + (' + position + ' * 25) = ' + (-25 + (position * 25)) : '25 - (' + position + ' * 25) = ' + (25 - (position * 25))}`);
    console.log(`DEBUG: Panel final position.x: ${panel.position.x}`);
};

// Create global scene manager
const sceneManager = new SceneSerializer();

// Updated save/load functions
function saveScene() {
    sceneManager.saveScene();
}

function loadScene() {
    sceneManager.showLoadDialog();
}

// Debug function for texture upload testing
function debugTextureUpload() {
    console.log('=== TEXTURE DEBUG INFO ===');
    console.log('Number of scenery panels:', sceneryPanels.length);
    
    sceneryPanels.forEach((panel, index) => {
        console.log(`Panel ${index}:`, {
            name: panel.userData.name,
            position: panel.position,
            visible: panel.visible,
            currentPosition: panel.userData.currentPosition,
            targetPosition: panel.userData.targetPosition,
            moving: panel.userData.moving,
            hasChildren: panel.children.length,
            mesh: panel.children[0],
            material: panel.children[0]?.material,
            hasTexture: panel.children[0]?.material?.map !== null
        });
    });
    
    // Force backdrop to visible position for testing
    if (sceneryPanels[0]) {
        const backdrop = sceneryPanels[0];
        backdrop.position.x = 0;
        backdrop.userData.currentPosition = 1.0;
        backdrop.userData.targetPosition = 1.0;
        backdrop.userData.moving = false;
        console.log('Forced backdrop to center position');
    }
}

// Make debug function available globally
window.debugTextureUpload = debugTextureUpload;

// ReadyPlayerMe testing function
window.testReadyPlayerMe = async function() {
    console.log('🧪 Starting ReadyPlayerMe integration test...');
    
    if (!window.advancedActorSystemV2) {
        console.error('❌ AdvancedActorSystemV2 not available');
        return false;
    }
    
    try {
        const result = await window.advancedActorSystemV2.testReadyPlayerMe();
        
        if (result.success && result.actor) {
            // Add to scene for visual verification
            window.stageState.core.scene.add(result.actor);
            window.stageState.objects.actors.push(result.actor);
            
            console.log('🎉 ReadyPlayerMe test SUCCESSFUL - actor added to scene');
            console.log('💡 Tip: Use window.addCustomRPMAvatar("Name", "avatar_id") to add more');
            
            return true;
        } else {
            console.log('⚠️ ReadyPlayerMe test completed with fallback');
            return false;
        }
    } catch (error) {
        console.error('💥 ReadyPlayerMe test failed:', error);
        return false;
    }
};

// Helper function to add custom ReadyPlayerMe avatars
window.addCustomRPMAvatar = function(name, avatarId, metadata = {}) {
    if (!window.advancedActorSystemV2) {
        console.error('❌ AdvancedActorSystemV2 not available');
        return false;
    }
    
    try {
        const key = window.advancedActorSystemV2.addCustomAvatar(name, avatarId, metadata);
        console.log(`✅ Custom avatar added! Use actor type: "${key}"`);
        console.log(`🎭 Create with: window.actorCreationManager.createActor("${key}", {x: 0, y: 0, z: 0})`);
        return key;
    } catch (error) {
        console.error('❌ Failed to add custom avatar:', error);
        return false;
    }
};

// Helper function to get ReadyPlayerMe creation URL  
window.getRPMCreationURL = function() {
    if (!window.advancedActorSystemV2) {
        console.error('❌ AdvancedActorSystemV2 not available');
        return null;
    }
    
    const url = window.advancedActorSystemV2.getAvatarCreationURL();
    console.log('🎨 Create your avatar at:', url);
    console.log('💡 After creation, copy the GLB URL and extract the avatar ID');
    console.log('📝 Then use: window.addCustomRPMAvatar("MyAvatar", "avatar_id_here")');
    
    return url;
};

// Wait for all modules to load, then initialize
window.addEventListener('load', async () => {
    console.log('=== STAGE APPLICATION STARTING ===');
    
    // Small delay to ensure all scripts are fully parsed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
        console.log('About to call init()...');
        await init();
        console.log('init() completed successfully');
        
        // Add some default audience members for immediate testing
        console.log('Adding default audience members...');
        await addDefaultAudience();
        
        // Start the animation loop using RenderLoop module
        if (window.stageRenderLoop) {
            console.log('Starting render loop...');
            window.stageRenderLoop.start();
            console.log('Application fully initialized!');
        } else {
            console.error('RenderLoop module not found');
        }
    } catch (error) {
        console.error('Initialization failed:', error);
        console.error('Error stack:', error.stack);
    }
});

// Add default audience members for immediate testing
async function addDefaultAudience() {
    console.log('🎬 TESTING ACTOR CREATION SYSTEM - MANDATORY VALIDATION');
    
    const audiencePositions = [
        { x: -3, z: 3, type: 'human_male' },
        { x: 0, z: 3, type: 'human_female' }, 
        { x: 3, z: 3, type: 'child' },
        { x: -1.5, z: 1, type: 'elderly' },
        { x: 1.5, z: 1, type: 'human_male' }
    ];
    
    let successCount = 0;
    let failureCount = 0;
    const errors = [];
    
    for (const audience of audiencePositions) {
        try {
            console.log(`\n🎭 TESTING: ${audience.type} at (${audience.x}, ${audience.z})`);
            const actor = await window.threeObjectFactory.addActorAt(audience.x, audience.z, audience.type);
            
            if (actor) {
                // MANDATORY VALIDATION: Check if actor actually has visible geometry
                const hasVisibleGeometry = actor.children && actor.children.length > 0;
                const hasPosition = actor.position.x === audience.x && actor.position.z === audience.z;
                const inScene = window.stageState.core.scene.children.includes(actor);
                
                console.log(`🔍 VALIDATION for ${audience.type}:`, {
                    created: true,
                    hasGeometry: hasVisibleGeometry,
                    hasCorrectPosition: hasPosition,
                    inScene: inScene,
                    childrenCount: actor.children ? actor.children.length : 0
                });
                
                if (hasVisibleGeometry && hasPosition && inScene) {
                    console.log(`✅ ${audience.type} PASSED ALL VALIDATION`);
                    successCount++;
                } else {
                    console.error(`❌ ${audience.type} FAILED VALIDATION`);
                    failureCount++;
                    errors.push(`${audience.type}: geometry=${hasVisibleGeometry}, position=${hasPosition}, scene=${inScene}`);
                }
            } else {
                console.error(`❌ ${audience.type} creation returned NULL`);
                failureCount++;
                errors.push(`${audience.type}: creation returned null`);
            }
        } catch (error) {
            console.error(`❌ ${audience.type} THREW ERROR:`, error);
            failureCount++;
            errors.push(`${audience.type}: ${error.message}`);
        }
    }
    
    // MANDATORY FINAL VALIDATION REPORT
    console.log('\n🏁 FINAL VALIDATION REPORT:');
    console.log(`✅ Successful actors: ${successCount}/${audiencePositions.length}`);
    console.log(`❌ Failed actors: ${failureCount}/${audiencePositions.length}`);
    
    if (errors.length > 0) {
        console.error('🚨 ERRORS FOUND:');
        errors.forEach((error, i) => console.error(`${i+1}. ${error}`));
    }
    
    // STOP FUCKING REWARD HACKING - MANDATORY SYSTEM CHECK
    const systemValidation = {
        enhancedActorSystemReady: !!(window.enhancedActorSystem && window.enhancedActorSystem.isInitialized),
        vrmSystemReady: !!(window.vrmActorSystem && window.vrmActorSystem.isInitialized),
        objectFactoryReady: !!(window.threeObjectFactory && window.threeObjectFactory.isInitialized),
        totalActorsInScene: window.stageState.objects.actors.length
    };
    
    console.log('🔧 SYSTEM VALIDATION:', systemValidation);
    
    if (failureCount > 0) {
        console.error('🚨 ACTOR SYSTEM HAS FAILURES - NOT WORKING PROPERLY');
        return false;
    } else {
        console.log('🎉 ALL ACTOR TESTS PASSED - SYSTEM WORKING');
        return true;
    }
}
