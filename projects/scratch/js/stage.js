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
            panel.position.x = panel.userData.isBackdrop ? -30 : 30;
        });
    }

    // Deserialize actors
    deserializeActors(actorData) {
        if (!actorData) return;
        
        actorData.forEach(data => {
            // Extract ID number for proper ordering
            const idNum = parseInt(data.id.split('_')[1]);
            if (idNum >= nextActorId) nextActorId = idNum + 1;
            
            // Create actor at position
            const actor = window.threeObjectFactory.addActorAt(data.position.x, data.position.z, data.actorType || selectedActorType);
            
            if (!actor) continue; // Skip if actor creation failed
            
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
            // Extract ID number for proper ordering
            const idNum = parseInt(data.id.split('_')[1]);
            if (idNum >= nextPropId) nextPropId = idNum + 1;
            
            // Set the prop type and create it
            selectedPropType = data.type;
            const prop = window.threeObjectFactory.addPropAt(data.position.x, data.position.z, data.type);
            
            if (!prop) continue; // Skip if prop creation failed
            
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
const sceneSerializer = new SceneSerializer();

// Helper function to update curtain positions immediately
function updateCurtainPositions() {
    // Use StageBuilder module for curtain updates
    window.threeStageBuilder.updateCurtainPositions();
}

async function init() {
    console.log('Initializing 3D Theater Stage...');
    
    try {
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
        
        // Set up UI
        setupUI();

        // Set up additional event handlers (SceneManager handles resize)
        window.addEventListener('click', onStageClick, false);
        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('keydown', onKeyDown, false);
        
        console.log('3D Theater Stage initialization complete!');
        
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

function onStageClick(event) {
    if (!placementMode) return;
    
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycaster to find where clicked
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
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

function onMouseMove(event) {
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

// addControls() function now handled by SceneManager

function onKeyDown(event) {
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

// onWindowResize() function now handled by SceneManager

function setupUI() {
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
        padding: 0;
        border-radius: 5px;
        color: white;
        font-family: Arial, sans-serif;
        transition: transform 0.3s ease;
        width: 300px;
        max-height: calc(100vh - 80px);
        overflow: hidden;
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

// Legacy helper functions - now using UIFactory
const createLabel = (text) => UIFactory.createLabel(text);
const createButton = (text, onClick) => UIFactory.createButton(text, onClick);
const createSpacer = () => UIFactory.createSpacer();

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
        { value: 'forest', label: 'Forest Scene' },
        { value: 'castle', label: 'Castle Wall' },
        { value: 'city', label: 'City Skyline' },
        { value: 'stars', label: 'Starry Night' }
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
        commandManager.undo();
        updateUndoRedoButtons();
    }, { small: true });
    
    const redoButton = UIFactory.createButton('Redo', () => {
        commandManager.redo();
        updateUndoRedoButtons();
    }, { small: true });
    
    // Make these buttons globally accessible for updates
    window.updateUndoRedoButtons = () => {
        undoButton.disabled = !commandManager.canUndo();
        redoButton.disabled = !commandManager.canRedo();
    };
    
    // Initial state
    updateUndoRedoButtons();
    
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
            const texture = await textureManager.loadCustomTexture(file);
            const panelIndex = selectedSceneryPanel || 0;
            
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
                moveSceneryPanel(panelIndex, 1.0); // Move to full position
                
                // For immediate visibility, also set the panel position directly
                panel.position.x = 0; // Center position for full visibility
                panel.userData.currentPosition = 1.0;
                panel.userData.targetPosition = 1.0;
                panel.userData.moving = false;
            }
            
            const success = textureManager.applyTextureToPanel(panelIndex, texture);
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
    const panelIndex = selectedSceneryPanel || 0;
    
    if (textureType === 'none') {
        // Remove texture and restore original color
        const panel = sceneryPanels[panelIndex];
        if (panel && panel.children[0]) {
            const mesh = panel.children[0];
            mesh.material.map = null;
            // Restore original colors: blue for backdrop (0), green for midstage (1)
            mesh.material.color.setHex(panelIndex === 0 ? 0x4169e1 : 0x228b22);
            mesh.material.needsUpdate = true;
        }
        return;
    }
    
    const texture = textureManager.getDefaultTexture(textureType);
    if (texture) {
        textureManager.applyTextureToPanel(panelIndex, texture);
        console.log(`Applied ${textureType} texture to panel ${panelIndex}`);
    }
}

function adjustTextureScale(panelIndex, scale) {
    const panel = sceneryPanels[panelIndex];
    if (panel && panel.children[0] && panel.children[0].material.map) {
        panel.children[0].material.map.repeat.set(scale, scale);
        panel.children[0].material.needsUpdate = true;
    }
}

async function initializeAudio() {
    const success = await audioManager.init();
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

// Object creation moved to ObjectFactory module
    // Basic shapes
    cube: {
        name: 'Cube',
        category: 'basic',
        create: () => resourceManager.getGeometry('box', { width: 1, height: 1, depth: 1 }),
        color: 0x808080,
        y: 0.5
    },
    sphere: {
        name: 'Sphere',
        category: 'basic',
        create: () => resourceManager.getGeometry('sphere', { radius: 0.5, widthSegments: 16, heightSegments: 16 }),
        color: 0x808080,
        y: 0.5
    },
    cylinder: {
        name: 'Cylinder',
        category: 'basic',
        create: () => resourceManager.getGeometry('cylinder', { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 16 }),
        color: 0x808080,
        y: 0.5
    },
    // Modern furniture
    modernChair: {
        name: 'Modern Chair',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            // Seat with curved edges
            const seat = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.15, 1.2),
                new THREE.MeshPhongMaterial({ color: 0x2C3E50 })
            );
            seat.position.y = 0.5;
            group.add(seat);
            // Modern angled back
            const back = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 1.2, 0.1),
                new THREE.MeshPhongMaterial({ color: 0x34495E })
            );
            back.position.set(0, 1.1, -0.55);
            back.rotation.x = -0.1;
            group.add(back);
            // Chrome legs
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, shininess: 100 });
            const legGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5);
            const positions = [[-0.5, 0.25, -0.5], [0.5, 0.25, -0.5], [-0.5, 0.25, 0.5], [0.5, 0.25, 0.5]];
            positions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(...pos);
                group.add(leg);
            });
            return group;
        },
        y: 0
    },
    sofa: {
        name: 'Sofa',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            // Main body
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.8, 1.5),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            body.position.y = 0.4;
            group.add(body);
            // Back cushions
            const backCushion = new THREE.Mesh(
                new THREE.BoxGeometry(3, 1, 0.3),
                new THREE.MeshPhongMaterial({ color: 0xA0522D })
            );
            backCushion.position.set(0, 0.9, -0.6);
            group.add(backCushion);
            // Arm rests
            for (let x of [-1.35, 1.35]) {
                const armRest = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.6, 1.5),
                    new THREE.MeshPhongMaterial({ color: 0x8B4513 })
                );
                armRest.position.set(x, 0.7, 0);
                group.add(armRest);
            }
            // Seat cushions
            for (let x of [-0.8, 0, 0.8]) {
                const cushion = new THREE.Mesh(
                    new THREE.BoxGeometry(0.9, 0.2, 1.2),
                    new THREE.MeshPhongMaterial({ color: 0xDEB887 })
                );
                cushion.position.set(x, 0.5, 0.1);
                group.add(cushion);
            }
            return group;
        },
        y: 0
    },
    diningTable: {
        name: 'Dining Table',
        category: 'furniture',
        create: () => {
            const group = new THREE.Group();
            // Elegant table top
            const top = new THREE.Mesh(
                new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32),
                new THREE.MeshPhongMaterial({ color: 0x8B4513, shininess: 50 })
            );
            top.position.y = 1;
            group.add(top);
            // Ornate central pedestal
            const pedestal = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.5, 0.8, 8),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            pedestal.position.y = 0.5;
            group.add(pedestal);
            // Base
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 0.8, 0.1, 8),
                new THREE.MeshPhongMaterial({ color: 0x654321 })
            );
            base.position.y = 0.05;
            group.add(base);
            return group;
        },
        y: 0
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
        y: 0
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
        y: 0
    },
    // Performance/Stage props
    microphone: {
        name: 'Microphone',
        category: 'performance',
        create: () => {
            const group = new THREE.Group();
            // Stand
            const stand = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
                new THREE.MeshPhongMaterial({ color: 0x333333 })
            );
            stand.position.y = 0.05;
            group.add(stand);
            // Pole
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.03, 0.03, 1.5, 8),
                new THREE.MeshPhongMaterial({ color: 0x444444 })
            );
            pole.position.y = 0.75;
            group.add(pole);
            // Mic
            const mic = new THREE.Mesh(
                new THREE.CapsuleGeometry(0.08, 0.2, 4, 8),
                new THREE.MeshPhongMaterial({ color: 0x222222 })
            );
            mic.position.y = 1.6;
            group.add(mic);
            // Grille
            const grille = new THREE.Mesh(
                new THREE.SphereGeometry(0.09, 8, 8),
                new THREE.MeshPhongMaterial({ color: 0x888888 })
            );
            grille.position.y = 1.7;
            group.add(grille);
            return group;
        },
        y: 0
    },
    piano: {
        name: 'Grand Piano',
        category: 'performance',
        create: () => {
            const group = new THREE.Group();
            // Body
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(2.5, 1, 4),
                new THREE.MeshPhongMaterial({ color: 0x1a1a1a, shininess: 80 })
            );
            body.position.y = 0.5;
            group.add(body);
            // Lid
            const lid = new THREE.Mesh(
                new THREE.BoxGeometry(2.4, 0.1, 3.9),
                new THREE.MeshPhongMaterial({ color: 0x000000, shininess: 100 })
            );
            lid.position.set(0, 1.05, 0);
            lid.rotation.x = -0.3;
            group.add(lid);
            // Keys
            const keys = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 0.05, 0.8),
                new THREE.MeshPhongMaterial({ color: 0xFFFFF0 })
            );
            keys.position.set(0, 0.85, 1.5);
            group.add(keys);
            // Legs
            const legGeometry = new THREE.CylinderGeometry(0.05, 0.08, 0.5, 8);
            const legMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
            const legPositions = [[-1, 0.25, -1.5], [1, 0.25, -1.5], [0, 0.25, 1.5]];
            legPositions.forEach(pos => {
                const leg = new THREE.Mesh(legGeometry, legMaterial);
                leg.position.set(...pos);
                group.add(leg);
            });
            return group;
        },
        y: 0
    },
    spotlight: {
        name: 'Spotlight',
        category: 'performance',
        create: () => {
            const group = new THREE.Group();
            // Base
            const base = new THREE.Mesh(
                new THREE.CylinderGeometry(0.3, 0.4, 0.2, 8),
                new THREE.MeshPhongMaterial({ color: 0x333333 })
            );
            base.position.y = 0.1;
            group.add(base);
            // Pole
            const pole = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 2, 8),
                new THREE.MeshPhongMaterial({ color: 0x444444 })
            );
            pole.position.y = 1;
            group.add(pole);
            // Light housing
            const housing = new THREE.Mesh(
                new THREE.ConeGeometry(0.3, 0.5, 8),
                new THREE.MeshPhongMaterial({ color: 0x222222 })
            );
            housing.position.set(0, 2.2, 0);
            housing.rotation.x = Math.PI;
            group.add(housing);
            // Lens
            const lens = new THREE.Mesh(
                new THREE.CylinderGeometry(0.25, 0.25, 0.05, 16),
                new THREE.MeshPhongMaterial({ color: 0xFFFFAA, transparent: true, opacity: 0.8 })
            );
            lens.position.y = 1.95;
            group.add(lens);
            return group;
        },
        y: 0
    },
    // Environment/Set pieces
    tree: {
        name: 'Tree',
        category: 'environment',
        create: () => {
            const group = new THREE.Group();
            // Trunk
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            trunk.position.y = 1;
            group.add(trunk);
            // Foliage layers
            const foliageColors = [0x228B22, 0x32CD32, 0x90EE90];
            for (let i = 0; i < 3; i++) {
                const foliage = new THREE.Mesh(
                    new THREE.ConeGeometry(1 - i * 0.2, 1.2, 8),
                    new THREE.MeshPhongMaterial({ color: foliageColors[i] })
                );
                foliage.position.y = 2 + i * 0.6;
                group.add(foliage);
            }
            return group;
        },
        y: 0
    },
    fountain: {
        name: 'Fountain',
        category: 'environment',
        create: () => {
            const group = new THREE.Group();
            // Base pool
            const pool = new THREE.Mesh(
                new THREE.CylinderGeometry(1.5, 1.5, 0.3, 16),
                new THREE.MeshPhongMaterial({ color: 0x696969 })
            );
            pool.position.y = 0.15;
            group.add(pool);
            // Water
            const water = new THREE.Mesh(
                new THREE.CylinderGeometry(1.4, 1.4, 0.05, 16),
                new THREE.MeshPhongMaterial({ color: 0x4169E1, transparent: true, opacity: 0.7 })
            );
            water.position.y = 0.32;
            group.add(water);
            // Central column
            const column = new THREE.Mesh(
                new THREE.CylinderGeometry(0.2, 0.3, 1, 8),
                new THREE.MeshPhongMaterial({ color: 0x696969 })
            );
            column.position.y = 0.8;
            group.add(column);
            // Top bowl
            const bowl = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.4, 0.2, 16),
                new THREE.MeshPhongMaterial({ color: 0x696969 })
            );
            bowl.position.y = 1.4;
            group.add(bowl);
            return group;
        },
        y: 0
    },
    // Storage/containers
    bookshelf: {
        name: 'Bookshelf',
        category: 'storage',
        create: () => {
            const group = new THREE.Group();
            // Frame
            const frame = new THREE.Mesh(
                new THREE.BoxGeometry(2, 3, 0.4),
                new THREE.MeshPhongMaterial({ color: 0x8B4513 })
            );
            frame.position.y = 1.5;
            group.add(frame);
            // Shelves
            for (let i = 0; i < 4; i++) {
                const shelf = new THREE.Mesh(
                    new THREE.BoxGeometry(1.9, 0.05, 0.35),
                    new THREE.MeshPhongMaterial({ color: 0x654321 })
                );
                shelf.position.y = 0.3 + i * 0.7;
                group.add(shelf);
            }
            // Books
            const bookColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
            for (let shelf = 0; shelf < 4; shelf++) {
                for (let book = 0; book < 8; book++) {
                    const bookMesh = new THREE.Mesh(
                        new THREE.BoxGeometry(0.2, 0.6, 0.03),
                        new THREE.MeshPhongMaterial({ color: bookColors[book % bookColors.length] })
                    );
                    bookMesh.position.set(-0.8 + book * 0.22, 0.6 + shelf * 0.7, 0.15);
                    group.add(bookMesh);
                }
            }
            return group;
        },
        y: 0
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
        y: 0
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
        y: 0
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
        y: 0
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
        y: 0
    }
};

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
        draggable: true,
        originalY: propDef.y,
        hidden: false
    };
    
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

// Actor types with different appearances and characteristics
const ACTOR_TYPES = {
    human_male: {
        name: 'Male Actor',
        category: 'human',
        bodyColor: 0x4169e1,
        skinColor: 0xffdbac,
        height: 1.8,
        build: 'normal'
    },
    human_female: {
        name: 'Female Actor',
        category: 'human',
        bodyColor: 0xdc143c,
        skinColor: 0xffe4c4,
        height: 1.65,
        build: 'slender'
    },
    child: {
        name: 'Child Actor',
        category: 'human',
        bodyColor: 0x32cd32,
        skinColor: 0xffefd5,
        height: 1.2,
        build: 'small'
    },
    elderly: {
        name: 'Elderly Actor',
        category: 'human',
        bodyColor: 0x8b4513,
        skinColor: 0xf5deb3,
        height: 1.7,
        build: 'stocky'
    },
    robot: {
        name: 'Robot Actor',
        category: 'artificial',
        bodyColor: 0x708090,
        skinColor: 0xc0c0c0,
        height: 1.9,
        build: 'mechanical'
    },
    alien: {
        name: 'Alien Actor',
        category: 'fantasy',
        bodyColor: 0x9370db,
        skinColor: 0x98fb98,
        height: 2.1,
        build: 'tall'
    }
};

function createDetailedActor(actorType) {
    const type = ACTOR_TYPES[actorType];
    const group = new THREE.Group();
    const scale = type.height / 1.8; // Scale based on height
    
    // Body proportions based on build
    let bodyRadius, bodyHeight;
    switch(type.build) {
        case 'slender':
            bodyRadius = [0.35, 0.4];
            bodyHeight = 1.8;
            break;
        case 'small':
            bodyRadius = [0.3, 0.35];
            bodyHeight = 1.4;
            break;
        case 'stocky':
            bodyRadius = [0.45, 0.5];
            bodyHeight = 1.6;
            break;
        case 'mechanical':
            bodyRadius = [0.4, 0.4]; // Cylindrical
            bodyHeight = 1.8;
            break;
        case 'tall':
            bodyRadius = [0.3, 0.45];
            bodyHeight = 2.2;
            break;
        default: // normal
            bodyRadius = [0.4, 0.5];
            bodyHeight = 1.8;
    }
    
    // Create body
    const bodyGeometry = resourceManager.getGeometry('cylinder', {
        radiusTop: bodyRadius[0],
        radiusBottom: bodyRadius[1], 
        height: bodyHeight * scale,
        radialSegments: 8
    });
    const bodyMaterial = resourceManager.getMaterial('phong', { 
        color: type.bodyColor,
        shininess: type.build === 'mechanical' ? 80 : 10
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = (bodyHeight * scale) / 2;
    group.add(body);
    
    // Create head
    const headSize = type.build === 'small' ? 0.25 : type.build === 'tall' ? 0.4 : 0.35;
    let headGeometry;
    if (type.build === 'mechanical') {
        headGeometry = resourceManager.getGeometry('box', {
            width: headSize * 2,
            height: headSize * 2,
            depth: headSize * 2
        });
    } else if (type.category === 'fantasy') {
        headGeometry = resourceManager.getGeometry('cone', {
            radius: headSize,
            height: headSize * 1.5,
            radialSegments: 8
        });
    } else {
        headGeometry = resourceManager.getGeometry('sphere', {
            radius: headSize * scale,
            widthSegments: 16,
            heightSegments: 16
        });
    }
    
    const headMaterial = resourceManager.getMaterial('phong', { 
        color: type.skinColor,
        shininess: type.build === 'mechanical' ? 60 : 5
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = bodyHeight * scale + headSize * scale;
    group.add(head);
    
    // Create eyes (unless robot)
    if (type.build !== 'mechanical') {
        const eyeGeometry = resourceManager.getGeometry('sphere', {
            radius: 0.04 * scale,
            widthSegments: 8,
            heightSegments: 8
        });
        const eyeMaterial = resourceManager.getMaterial('basic', { 
            color: type.category === 'fantasy' ? 0xff0000 : 0x000000 
        });
        
        const eyeY = bodyHeight * scale + headSize * scale;
        const eyeZ = headSize * scale * 0.8;
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08 * scale, eyeY, eyeZ);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08 * scale, eyeY, eyeZ);
        group.add(rightEye);
    } else {
        // Robot eyes (glowing rectangles)
        const eyeGeometry = resourceManager.getGeometry('box', {
            width: 0.1 * scale,
            height: 0.05 * scale,
            depth: 0.02
        });
        const eyeMaterial = resourceManager.getMaterial('basic', { 
            color: 0x00ffff,
            emissive: 0x004444
        });
        
        const eyeY = bodyHeight * scale + headSize * scale;
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1 * scale, eyeY, headSize * scale);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1 * scale, eyeY, headSize * scale);
        group.add(rightEye);
    }
    
    // Create arms
    const armGeometry = resourceManager.getGeometry('cylinder', {
        radiusTop: 0.08 * scale,
        radiusBottom: 0.08 * scale,
        height: 1.2 * scale,
        radialSegments: 6
    });
    const armMaterial = resourceManager.getMaterial('phong', { 
        color: type.bodyColor,
        shininess: type.build === 'mechanical' ? 80 : 10
    });
    
    const armY = bodyHeight * scale * 0.7;
    const armX = bodyRadius[1] * scale + 0.1 * scale;
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-armX, armY, 0);
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(armX, armY, 0);
    group.add(rightArm);
    
    // Create legs
    const legGeometry = resourceManager.getGeometry('cylinder', {
        radiusTop: 0.1 * scale,
        radiusBottom: 0.12 * scale,
        height: 1.4 * scale,
        radialSegments: 6
    });
    const legMaterial = resourceManager.getMaterial('phong', { 
        color: type.bodyColor,
        shininess: type.build === 'mechanical' ? 80 : 10
    });
    
    const legX = bodyRadius[0] * scale * 0.6;
    const legY = 0.7 * scale;
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-legX, legY, 0);
    group.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(legX, legY, 0);
    group.add(rightLeg);
    
    // Add special features based on type
    if (type.category === 'fantasy') {
        // Add antenna for alien
        const antennaGeometry = resourceManager.getGeometry('cylinder', {
            radiusTop: 0.02,
            radiusBottom: 0.02,
            height: 0.3,
            radialSegments: 4
        });
        const antennaMaterial = resourceManager.getMaterial('phong', { color: type.skinColor });
        const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna.position.y = bodyHeight * scale + headSize * scale * 1.5;
        group.add(antenna);
        
        const antennaTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0x444400 })
        );
        antennaTop.position.y = bodyHeight * scale + headSize * scale * 1.5 + 0.15;
        group.add(antennaTop);
    }
    
    if (type.build === 'mechanical') {
        // Add mechanical details
        const chestPanel = new THREE.Mesh(
            new THREE.BoxGeometry(0.3 * scale, 0.2 * scale, 0.05),
            new THREE.MeshPhongMaterial({ color: 0x444444 })
        );
        chestPanel.position.set(0, bodyHeight * scale * 0.8, bodyRadius[1] * scale);
        group.add(chestPanel);
    }
    
    return group;
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
    
    if (checkAllCollisions(actorGroup, x, z)) {
        // Position occupied, try to find nearby free spot
        actors.pop(); // Remove from list
        
        let placed = false;
        const offsets = [
            {x: 1, z: 0}, {x: -1, z: 0}, {x: 0, z: 1}, {x: 0, z: -1},
            {x: 1, z: 1}, {x: -1, z: 1}, {x: 1, z: -1}, {x: -1, z: -1}
        ];
        
        for (let offset of offsets) {
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

function toggleMarkers() {
    stageMarkers.forEach(marker => {
        marker.visible = !marker.visible;
    });
}

function setCameraPreset(preset) {
    const duration = 1000; // 1 second transition
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
        case 'close-up':
            endPos = new THREE.Vector3(0, 3, 10);
            endTarget = new THREE.Vector3(0, 1, 0);
            break;
    }
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        
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

function rotateCenter() {
    if (rotatingStage && rotatingStage.visible) {
        const userData = rotatingStage.userData;
        userData.rotating = !userData.rotating;
        console.log(`Rotating stage is now ${userData.rotating ? 'rotating' : 'stopped'}`);
    } else {
        alert('Please show the rotating stage first using "Show/Hide Rotating Stage" button');
    }
}

function toggleTrapDoors() {
    trapDoors.forEach(trapDoor => {
        if (trapDoor.visible) {
            const userData = trapDoor.userData;
            userData.open = !userData.open;
            userData.targetRotation = userData.open ? Math.PI / 2 : 0;
        }
    });
}

function toggleRotatingStageVisibility() {
    if (rotatingStage) {
        rotatingStage.visible = !rotatingStage.visible;
        if (!rotatingStage.visible) {
            rotatingStage.userData.rotating = false;
        }
    }
}

function toggleTrapDoorsVisibility() {
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

function updatePropRelationships(prop) {
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

function updateAllPropRelationships() {
    // Update props
    props.forEach(prop => {
        if (!prop.userData.hidden) {
            updatePropRelationships(prop);
        }
    });
    
    // Update actors (they use same physics)
    actors.forEach(actor => {
        if (!actor.userData.hidden) {
            updatePropRelationships(actor);
        }
    });
}

function moveSceneryPanel(index, position) {
    if (index < sceneryPanels.length) {
        const panel = sceneryPanels[index];
        panel.userData.targetPosition = position;
        panel.userData.moving = true;
    }
}

// Physics properties for objects
const OBJECT_PHYSICS = {
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

// Velocity tracking for momentum (now managed by StateManager)

// Texture management system
class TextureManager {
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
            console.log('Starting to load texture file:', file.name, 'type:', file.type, 'size:', file.size);
            
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('FileReader loaded, data URL length:', e.target.result.length);
                
                const texture = this.loader.load(
                    e.target.result, 
                    (loadedTexture) => {
                        // Texture loaded successfully
                        loadedTexture.wrapS = loadedTexture.wrapT = THREE.RepeatWrapping;
                        loadedTexture.needsUpdate = true;
                        console.log('Texture loaded successfully:', {
                            texture: loadedTexture,
                            image: loadedTexture.image,
                            width: loadedTexture.image?.width,
                            height: loadedTexture.image?.height
                        });
                        resolve(loadedTexture);
                    },
                    (progress) => {
                        console.log('Texture loading progress:', progress);
                    },
                    (error) => {
                        console.error('Texture loading error:', error);
                        reject(new Error('Failed to load texture: ' + error.message));
                    }
                );
            };
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(new Error('Failed to read file: ' + error));
            };
            reader.readAsDataURL(file);
        });
    }
    
    applyTextureToPanel(panelIndex, texture, scale = { x: 1, y: 1 }) {
        if (panelIndex >= sceneryPanels.length) {
            console.error('Invalid panel index:', panelIndex);
            return false;
        }
        
        const panel = sceneryPanels[panelIndex];
        if (!panel || !panel.children[0]) {
            console.error('Panel or mesh not found:', panelIndex);
            return false;
        }
        
        const mesh = panel.children[0]; // Main panel mesh
        console.log('Applying texture to panel', panelIndex, 'mesh:', mesh, 'texture:', texture);
        
        // Clone texture to avoid sharing references
        const clonedTexture = texture.clone();
        clonedTexture.repeat.set(scale.x, scale.y);
        clonedTexture.wrapS = THREE.RepeatWrapping;
        clonedTexture.wrapT = THREE.RepeatWrapping;
        clonedTexture.needsUpdate = true;
        
        // Apply to material and set color to white so texture shows properly
        mesh.material.map = clonedTexture;
        mesh.material.color.setHex(0xffffff); // Set to white so texture isn't tinted
        mesh.material.transparent = true;
        mesh.material.opacity = 1.0; // Make fully opaque to see texture clearly
        mesh.material.needsUpdate = true;
        
        // Force immediate render update
        if (renderer) {
            renderer.render(scene, camera);
        }
        
        console.log('Texture applied to material:', mesh.material);
        return true;
    }
    
    getDefaultTexture(name) {
        return this.defaultTextures[name];
    }
}

const textureManager = new TextureManager();

// Command pattern for undo/redo system
class Command {
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

class PlaceObjectCommand extends Command {
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
            this.objectRef = window.threeObjectFactory.addPropAt(this.position.x, this.position.z, this.objectData.propType);
            selectedPropType = oldPropType;
        } else if (this.objectType === 'actor') {
            this.objectRef = window.threeObjectFactory.addActorAt(this.position.x, this.position.z);
        }
    }
    
    undo() {
        if (!this.objectRef) return;
        
        // Remove from scene and properly dispose
        removeObjectProperly(this.objectRef);
    }
}

class MoveObjectCommand extends Command {
    constructor(object, newPosition, oldPosition) {
        super();
        this.object = object;
        this.newPosition = newPosition;
        this.oldPosition = oldPosition;
    }
    
    execute() {
        this.object.position.set(this.newPosition.x, this.newPosition.y, this.newPosition.z);
    }
    
    undo() {
        this.object.position.set(this.oldPosition.x, this.oldPosition.y, this.oldPosition.z);
    }
    
    canMerge(otherCommand) {
        return otherCommand instanceof MoveObjectCommand && 
               otherCommand.object === this.object;
    }
}

class StageElementCommand extends Command {
    constructor(elementType, elementData, newState, oldState) {
        super();
        this.elementType = elementType;
        this.elementData = elementData;
        this.newState = newState;
        this.oldState = oldState;
    }
    
    execute() {
        this.applyState(this.newState);
    }
    
    undo() {
        this.applyState(this.oldState);
    }
    
    applyState(state) {
        switch(this.elementType) {
            case 'curtains':
                curtainState = state;
                // Don't call updateCurtainPositions here - let the animation handle it
                break;
            case 'platform':
                const platform = moveablePlatforms[this.elementData.index];
                if (platform) {
                    platform.position.y = state.height;
                    platform.userData.targetY = state.height;
                }
                break;
            case 'rotatingStage':
                rotatingStage.visible = state.visible;
                rotatingStage.userData.rotating = state.rotating;
                break;
            case 'scenery':
                moveSceneryPanel(this.elementData.index, state.position);
                break;
        }
    }
}

class CommandManager {
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

const commandManager = new CommandManager();

// Audio management system for 3D positional sound
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.listener = null;
        this.sounds = new Map();
        this.audioBuffers = new Map();
        this.masterVolume = 1.0;
        this.categories = {
            background: { volume: 0.5, sounds: new Set() },
            effects: { volume: 0.8, sounds: new Set() },
            voices: { volume: 1.0, sounds: new Set() },
            ambient: { volume: 0.3, sounds: new Set() }
        };
        this.initialized = false;
    }
    
    async init() {
        try {
            // Create audio context (requires user interaction)
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.listener = this.audioContext.listener;
            
            // Create default sounds
            this.createDefaultSounds();
            
            this.initialized = true;
            console.log('Audio system initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }
    
    createDefaultSounds() {
        // Create simple sound effects using oscillators
        this.defaultSounds = {
            footstep: this.createFootstepSound(),
            thud: this.createThudSound(),
            whoosh: this.createWhooshSound(),
            ambient: this.createAmbientSound()
        };
    }
    
    createFootstepSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.1);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
            
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.15);
            
            return gain;
        };
    }
    
    createThudSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(60, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 0.3);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(150, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.3);
            
            return gain;
        };
    }
    
    createWhooshSound() {
        return () => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
            osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(400, this.audioContext.currentTime);
            filter.Q.setValueAtTime(5, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            osc.connect(filter);
            filter.connect(gain);
            
            osc.start(this.audioContext.currentTime);
            osc.stop(this.audioContext.currentTime + 0.5);
            
            return gain;
        };
    }
    
    createAmbientSound() {
        return () => {
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            // Create multiple oscillators for rich ambient sound
            for (let i = 0; i < 3; i++) {
                const osc = this.audioContext.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(100 + i * 50 + Math.random() * 20, this.audioContext.currentTime);
                
                const oscGain = this.audioContext.createGain();
                oscGain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
                
                osc.connect(oscGain);
                oscGain.connect(filter);
                
                osc.start(this.audioContext.currentTime);
                osc.stop(this.audioContext.currentTime + 2);
            }
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, this.audioContext.currentTime);
            filter.connect(gain);
            
            gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.5);
            gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 1.5);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
            
            return gain;
        };
    }
    
    createPositionalSound(soundName, position, category = 'effects') {
        if (!this.initialized || !this.defaultSounds[soundName]) return null;
        
        const panner = this.audioContext.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'inverse';
        panner.refDistance = 1;
        panner.maxDistance = 100;
        panner.rolloffFactor = 1;
        panner.coneInnerAngle = 360;
        panner.coneOuterAngle = 0;
        panner.coneOuterGain = 0;
        
        // Set 3D position
        panner.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
        panner.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
        panner.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
        
        // Create sound source
        const soundSource = this.defaultSounds[soundName]();
        
        // Create category volume control
        const categoryGain = this.audioContext.createGain();
        categoryGain.gain.setValueAtTime(this.categories[category].volume * this.masterVolume, this.audioContext.currentTime);
        
        // Connect: source -> panner -> category volume -> destination
        soundSource.connect(panner);
        panner.connect(categoryGain);
        categoryGain.connect(this.audioContext.destination);
        
        // Track the sound
        const soundId = Date.now() + Math.random();
        this.categories[category].sounds.add(soundId);
        
        // Clean up after sound ends
        setTimeout(() => {
            this.categories[category].sounds.delete(soundId);
        }, 3000);
        
        return { soundId, panner, categoryGain };
    }
    
    updateListenerPosition(camera) {
        if (!this.initialized) return;
        
        // Update listener position to match camera
        this.listener.positionX.setValueAtTime(camera.position.x, this.audioContext.currentTime);
        this.listener.positionY.setValueAtTime(camera.position.y, this.audioContext.currentTime);
        this.listener.positionZ.setValueAtTime(camera.position.z, this.audioContext.currentTime);
        
        // Update listener orientation
        const forward = new THREE.Vector3(0, 0, -1);
        const up = new THREE.Vector3(0, 1, 0);
        forward.applyQuaternion(camera.quaternion);
        up.applyQuaternion(camera.quaternion);
        
        this.listener.forwardX.setValueAtTime(forward.x, this.audioContext.currentTime);
        this.listener.forwardY.setValueAtTime(forward.y, this.audioContext.currentTime);
        this.listener.forwardZ.setValueAtTime(forward.z, this.audioContext.currentTime);
        this.listener.upX.setValueAtTime(up.x, this.audioContext.currentTime);
        this.listener.upY.setValueAtTime(up.y, this.audioContext.currentTime);
        this.listener.upZ.setValueAtTime(up.z, this.audioContext.currentTime);
    }
    
    setCategoryVolume(category, volume) {
        if (this.categories[category]) {
            this.categories[category].volume = Math.max(0, Math.min(1, volume));
        }
    }
    
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
    
    playCollisionSound(object1, object2, velocity) {
        if (!this.initialized) return;
        
        const position = object1.position;
        let soundName = 'thud';
        
        // Choose sound based on object types and velocity
        if (velocity < 0.1) {
            return; // Too quiet
        } else if (velocity < 0.5) {
            soundName = 'footstep';
        } else {
            soundName = 'thud';
        }
        
        this.createPositionalSound(soundName, position, 'effects');
    }
    
    playMovementSound(object, velocity) {
        if (!this.initialized || velocity < 0.05) return;
        
        const position = object.position;
        this.createPositionalSound('whoosh', position, 'effects');
    }
}

const audioManager = new AudioManager();
window.audioManager = audioManager;

// Get bounding box for an object (prop or actor)
function getObjectBounds(obj) {
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
            default:
                bounds = { width: 1, depth: 1, height: 1 };
        }
    }
    
    return bounds;
}

// Get mass of an object
function getObjectMass(obj) {
    if (obj.userData.type === 'actor') {
        return OBJECT_PHYSICS.actor.mass;
    } else if (obj.userData.propType && OBJECT_PHYSICS[obj.userData.propType]) {
        return OBJECT_PHYSICS[obj.userData.propType].mass;
    }
    return 10; // Default mass
}

// Get friction coefficient
function getObjectFriction(obj) {
    if (obj.userData.type === 'actor') {
        return OBJECT_PHYSICS.actor.friction;
    } else if (obj.userData.propType && OBJECT_PHYSICS[obj.userData.propType]) {
        return OBJECT_PHYSICS[obj.userData.propType].friction;
    }
    return 0.7; // Default friction
}

// Check collision between two objects
function checkObjectCollision(obj1, pos1, obj2) {
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
function handleCollisionResponse(obj1, obj2, velocity1) {
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
function checkAllCollisions(movingObj, newX, newZ, velocity = 0) {
    const testPos = { x: newX, y: movingObj.position.y, z: newZ };
    let collisionHandled = false;
    
    // Performance optimization: Early distance check to reduce collision calculations
    const maxCheckDistance = 5; // Only check objects within 5 units
    
    // Check collision with nearby props only
    for (let prop of props) {
        if (prop === movingObj) continue; // Skip self
        
        // Early distance check - skip distant objects
        const dx = prop.position.x - testPos.x;
        const dz = prop.position.z - testPos.z;
        const distanceSquared = dx * dx + dz * dz;
        
        if (distanceSquared > maxCheckDistance * maxCheckDistance) {
            continue; // Skip distant objects
        }
        
        performanceStats.collisionChecks++;
        
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
                
                // Play collision sound
                audioManager.playCollisionSound(movingObj, prop, velocity);
                
                collisionHandled = true;
                return !response.obj1Moves; // Can move if momentum allows
            }
            return true; // Static collision
        }
    }
    
    // Check collision with all actors
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
                
                // Play collision sound
                audioManager.playCollisionSound(movingObj, actor, velocity);
                
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

// Make physics functions available globally for RenderLoop
window.updatePropRelationships = updatePropRelationships;
window.checkAllCollisions = checkAllCollisions;
window.getObjectFriction = getObjectFriction;

function checkPropSceneryCollision(prop, newX, newZ) {
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

// Performance optimization: Cache timing and reduce expensive operations (now managed by StateManager)

// Animation loop function moved to RenderLoop module

// Animation functions moved to RenderLoop module

// Enhanced Save/Load System with Browser Storage and Smart Features
class SceneManager {
    constructor() {
        this.storageKey = 'theater-stage-scenes';
        this.autoSaveKey = 'theater-stage-autosave';
        this.currentSceneName = null;
        this.autoSaveInterval = null;
        this.setupAutoSave();
    }
    
    // Get all saved scenes from localStorage
    getSavedScenes() {
        try {
            const scenes = localStorage.getItem(this.storageKey);
            return scenes ? JSON.parse(scenes) : {};
        } catch (error) {
            console.error('Error reading saved scenes:', error);
            return {};
        }
    }
    
    // Save scene to localStorage with metadata
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
                data: sceneSerializer.exportScene(name, description),
                timestamp: new Date().toISOString(),
                thumbnail: this.generateThumbnail(),
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
            
            console.log(`Scene "${name}" saved successfully!`);
            this.showNotification(`Scene "${name}" saved!`, 'success');
            return true;
        } catch (error) {
            console.error('Error saving scene:', error);
            this.showNotification('Failed to save scene', 'error');
            return false;
        }
    }
    
    // Auto-save current scene
    autoSave() {
        if (props.length === 0 && actors.length === 0) return; // Don't auto-save empty scenes
        
        try {
            const autoSaveData = {
                data: sceneSerializer.exportScene('AutoSave', 'Automatically saved scene'),
                timestamp: new Date().toISOString(),
                stats: {
                    props: props.length,
                    actors: actors.length,
                    lightingPreset: currentLightingPreset
                }
            };
            
            localStorage.setItem(this.autoSaveKey, JSON.stringify(autoSaveData));
            console.log('Auto-saved scene');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }
    
    // Setup auto-save every 30 seconds
    setupAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000); // 30 seconds
    }
    
    // Generate scene thumbnail (simplified)
    generateThumbnail() {
        return {
            cameraPosition: {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            },
            objectCount: props.length + actors.length,
            lighting: currentLightingPreset
        };
    }
    
    // Show a nice notification
    showNotification(message, type = 'info') {
        const notification = UIFactory.createNotification(message, type);
        notification.style.top = '70px'; // Adjust for our UI
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Create a smart load dialog
    showLoadDialog() {
        const savedScenes = this.getSavedScenes();
        const autoSave = this.getAutoSave();
        
        if (Object.keys(savedScenes).length === 0 && !autoSave) {
            this.showNotification('No saved scenes found', 'info');
            this.loadFromFile(); // Fallback to file upload
            return;
        }
        
        // Create load dialog
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        `;
        
        content.innerHTML = `
            <h2 style="margin-top: 0; color: #333;">Load Scene</h2>
            <div id="scene-list"></div>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button id="load-from-file" style="padding: 10px 20px; cursor: pointer;">Load from File</button>
                <button id="cancel-load" style="padding: 10px 20px; cursor: pointer; background: #ccc;">Cancel</button>
            </div>
        `;
        
        const sceneList = content.querySelector('#scene-list');
        
        // Add auto-save option
        if (autoSave) {
            this.createSceneItem(sceneList, 'AutoSave', autoSave, true);
        }
        
        // Add saved scenes
        Object.entries(savedScenes).forEach(([name, sceneData]) => {
            this.createSceneItem(sceneList, name, sceneData, false);
        });
        
        // Event listeners
        content.querySelector('#load-from-file').addEventListener('click', () => {
            document.body.removeChild(dialog);
            this.loadFromFile();
        });
        
        content.querySelector('#cancel-load').addEventListener('click', () => {
            document.body.removeChild(dialog);
        });
        
        dialog.appendChild(content);
        document.body.appendChild(dialog);
    }
    
    // Create a scene item in the load dialog
    createSceneItem(container, name, sceneData, isAutoSave) {
        const item = document.createElement('div');
        item.style.cssText = `
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin: 10px 0;
            cursor: pointer;
            transition: background 0.2s;
            ${isAutoSave ? 'background: #f0f8ff;' : ''}
        `;
        
        const date = new Date(sceneData.timestamp).toLocaleString();
        const stats = sceneData.stats || {};
        
        item.innerHTML = `
            <div style="font-weight: bold; color: #333;">${name} ${isAutoSave ? '(Auto-saved)' : ''}</div>
            <div style="color: #666; font-size: 14px; margin: 5px 0;">${sceneData.description || 'No description'}</div>
            <div style="color: #999; font-size: 12px;">
                ${date} • ${stats.props || 0} props, ${stats.actors || 0} actors • ${stats.lightingPreset || 'default'} lighting
            </div>
        `;
        
        item.addEventListener('mouseover', () => {
            item.style.background = isAutoSave ? '#e6f3ff' : '#f5f5f5';
        });
        
        item.addEventListener('mouseout', () => {
            item.style.background = isAutoSave ? '#f0f8ff' : 'white';
        });
        
        item.addEventListener('click', () => {
            this.loadScene(sceneData.data);
            this.currentSceneName = isAutoSave ? null : name;
            document.body.removeChild(item.closest('.dialog-overlay') || item.closest('div[style*="position: fixed"]'));
        });
        
        container.appendChild(item);
    }
    
    // Get auto-save data
    getAutoSave() {
        try {
            const autoSave = localStorage.getItem(this.autoSaveKey);
            return autoSave ? JSON.parse(autoSave) : null;
        } catch (error) {
            console.error('Error reading auto-save:', error);
            return null;
        }
    }
    
    // Load scene from data
    loadScene(sceneJson) {
        try {
            const result = sceneSerializer.importScene(sceneJson);
            if (result.success) {
                console.log(`Scene loaded: ${result.name}`);
                this.showNotification(`Scene "${result.name}" loaded!`, 'success');
                return true;
            } else {
                this.showNotification(`Failed to load scene: ${result.error}`, 'error');
                return false;
            }
        } catch (error) {
            console.error('Load error:', error);
            this.showNotification('Error loading scene', 'error');
            return false;
        }
    }
    
    // Fallback to file upload
    loadFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.loadScene(e.target.result);
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Export scene to file (for sharing)
    exportToFile(name = null) {
        if (!name) name = this.currentSceneName || 'My Scene';
        
        const sceneJson = sceneSerializer.exportScene(name, '');
        const blob = new Blob([sceneJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name.replace(/\s+/g, '_')}_scene.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Scene exported to file!', 'success');
    }
    
    // Delete saved scene
    deleteScene(name) {
        if (confirm(`Are you sure you want to delete "${name}"?`)) {
            const savedScenes = this.getSavedScenes();
            delete savedScenes[name];
            localStorage.setItem(this.storageKey, JSON.stringify(savedScenes));
            this.showNotification(`Scene "${name}" deleted`, 'info');
        }
    }
    
    // Quick save (Ctrl+S)
    quickSave() {
        if (this.currentSceneName) {
            this.saveScene(this.currentSceneName);
        } else {
            this.saveScene();
        }
    }
}

// Memory Management System
class ResourceManager {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
        this.textures = new Map();
        this.eventListeners = new WeakMap();
        this.disposedObjects = new Set();
    }
    
    // Reuse geometries instead of creating new ones
    getGeometry(type, params = {}) {
        const key = `${type}_${JSON.stringify(params)}`;
        if (!this.geometries.has(key)) {
            this.geometries.set(key, this.createGeometry(type, params));
            console.log(`Created new geometry: ${key}`);
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
    
    // Reuse materials instead of creating new ones
    getMaterial(type, params = {}) {
        const key = `${type}_${JSON.stringify(params)}`;
        if (!this.materials.has(key)) {
            this.materials.set(key, this.createMaterial(type, params));
            console.log(`Created new material: ${key}`);
        }
        return this.materials.get(key);
    }
    
    // Create material based on type
    createMaterial(type, params) {
        switch (type) {
            case 'phong':
                return new THREE.MeshPhongMaterial({
                    color: params.color || 0x808080,
                    shininess: params.shininess || 30,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1
                });
            case 'basic':
                return new THREE.MeshBasicMaterial({
                    color: params.color || 0x808080,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1
                });
            case 'lambert':
                return new THREE.MeshLambertMaterial({
                    color: params.color || 0x808080,
                    transparent: params.transparent || false,
                    opacity: params.opacity || 1
                });
            default:
                return new THREE.MeshPhongMaterial({ color: params.color || 0x808080 });
        }
    }
    
    // Proper cleanup when objects are removed
    disposeObject(object) {
        if (this.disposedObjects.has(object)) {
            console.warn('Object already disposed:', object);
            return;
        }
        
        // Mark as disposed to prevent double disposal
        this.disposedObjects.add(object);
        
        // Remove from scene
        if (object.parent) {
            object.parent.remove(object);
        }
        
        // Dispose geometry if it's not shared
        if (object.geometry && !this.isSharedGeometry(object.geometry)) {
            object.geometry.dispose();
        }
        
        // Dispose materials if they're not shared
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => {
                    if (!this.isSharedMaterial(mat)) {
                        this.disposeMaterial(mat);
                    }
                });
            } else if (!this.isSharedMaterial(object.material)) {
                this.disposeMaterial(object.material);
            }
        }
        
        // Recursively dispose children
        if (object.children && object.children.length > 0) {
            const children = [...object.children]; // Copy array to avoid modification during iteration
            children.forEach(child => this.disposeObject(child));
        }
        
        console.log('Disposed object:', object.type || 'Unknown');
    }
    
    // Check if geometry is shared (managed by this system)
    isSharedGeometry(geometry) {
        for (let managedGeometry of this.geometries.values()) {
            if (managedGeometry === geometry) {
                return true;
            }
        }
        return false;
    }
    
    // Check if material is shared (managed by this system)
    isSharedMaterial(material) {
        for (let managedMaterial of this.materials.values()) {
            if (managedMaterial === material) {
                return true;
            }
        }
        return false;
    }
    
    // Dispose material and its textures
    disposeMaterial(material) {
        if (material.map) material.map.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.envMap) material.envMap.dispose();
        material.dispose();
    }
    
    // Event listener management
    addEventListenerManaged(element, event, handler) {
        element.addEventListener(event, handler);
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, []);
        }
        this.eventListeners.get(element).push({event, handler});
    }
    
    // Remove specific event listener
    removeEventListenerManaged(element, event, handler) {
        if (this.eventListeners.has(element)) {
            const listeners = this.eventListeners.get(element);
            const index = listeners.findIndex(l => l.event === event && l.handler === handler);
            if (index !== -1) {
                listeners.splice(index, 1);
                element.removeEventListener(event, handler);
            }
        }
    }
    
    // Clean up all managed resources
    cleanup() {
        console.log('Starting resource cleanup...');
        
        // Dispose geometries
        this.geometries.forEach((geo, key) => {
            console.log(`Disposing geometry: ${key}`);
            geo.dispose();
        });
        this.geometries.clear();
        
        // Dispose materials
        this.materials.forEach((mat, key) => {
            console.log(`Disposing material: ${key}`);
            this.disposeMaterial(mat);
        });
        this.materials.clear();
        
        // Dispose textures
        this.textures.forEach((tex, key) => {
            console.log(`Disposing texture: ${key}`);
            tex.dispose();
        });
        this.textures.clear();
        
        // Remove event listeners
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({event, handler}) => {
                element.removeEventListener(event, handler);
            });
        });
        
        this.disposedObjects.clear();
        
        console.log('Resource cleanup complete');
    }
    
    // Get memory usage statistics
    getMemoryStats() {
        return {
            geometries: this.geometries.size,
            materials: this.materials.size,
            textures: this.textures.size,
            managedEventListeners: 'WeakMap (cannot count)',
            disposedObjects: this.disposedObjects.size
        };
    }
}

// UIFactory is now loaded from js/ui/UIFactory.js

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

// Create global resource manager
const resourceManager = new ResourceManager();
window.resourceManager = resourceManager;

// Create global scene manager
const sceneManager = new SceneManager();

// Updated save/load functions
function saveScene() {
    sceneManager.saveScene();
}

function loadScene() {
    sceneManager.showLoadDialog();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 's':
                event.preventDefault();
                sceneManager.quickSave();
                break;
            case 'o':
                event.preventDefault();
                sceneManager.showLoadDialog();
                break;
        }
    }
});

// Debug function to test texture upload
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

init();
// Start the animation loop using RenderLoop module
window.stageRenderLoop.start();