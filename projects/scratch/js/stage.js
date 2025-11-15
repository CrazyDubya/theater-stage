let scene, camera, renderer, controls;
let stage, lights = [];
let stageMarkers = [];
let props = [];
let actors = [];
let currentLightingPreset = 'default';
let moveablePlatforms = [];
let rotatingStage = null;
let trapDoors = [];
let curtainLeft, curtainRight, curtainTop;
let curtainState = 'closed';
let sceneryPanels = [];
let placementMode = null; // 'prop' or 'actor'
let placementMarker = null;
let selectedPropType = 'cube'; // default prop type
let nextActorId = 1;
let nextPropId = 1;

// Physics tracking
let propPlatformRelations = new Map(); // prop -> platform
let propRotatingStageRelations = new Set(); // props on rotating stage
let propTrapDoorRelations = new Map(); // prop -> trapdoor

// Sound System
let soundSystem = null;

// Sound System for 3D positional audio
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.listener = null;
        this.sounds = {
            background: [],
            effects: [],
            voices: []
        };
        this.volumes = {
            master: 1.0,
            background: 0.5,
            effects: 0.7,
            voices: 0.8
        };
        this.initialized = false;
        this.audioCues = []; // Array of scheduled audio cues
    }

    // Initialize the audio context (requires user gesture)
    initialize() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.listener = this.audioContext.listener;
            
            // Set listener to camera position initially
            if (camera) {
                this.updateListenerPosition(camera.position);
            }
            
            this.initialized = true;
            console.log('Sound system initialized');
        } catch (error) {
            console.error('Failed to initialize sound system:', error);
        }
    }

    // Update listener position (call this when camera moves)
    updateListenerPosition(position, forward = null, up = null) {
        if (!this.initialized || !this.listener) return;
        
        this.listener.positionX.value = position.x;
        this.listener.positionY.value = position.y;
        this.listener.positionZ.value = position.z;
        
        if (forward && up) {
            this.listener.forwardX.value = forward.x;
            this.listener.forwardY.value = forward.y;
            this.listener.forwardZ.value = forward.z;
            this.listener.upX.value = up.x;
            this.listener.upY.value = up.y;
            this.listener.upZ.value = up.z;
        }
    }

    // Load audio file and create a sound source
    async loadSound(url, category = 'effects', loop = false) {
        if (!this.initialized) {
            console.warn('Sound system not initialized');
            return null;
        }

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            const sound = {
                buffer: audioBuffer,
                category: category,
                loop: loop,
                source: null,
                gainNode: null,
                pannerNode: null,
                isPlaying: false,
                url: url
            };
            
            this.sounds[category].push(sound);
            return sound;
        } catch (error) {
            console.error('Failed to load sound:', url, error);
            return null;
        }
    }

    // Play a sound at a specific 3D position
    playSound(sound, position = null, volume = 1.0) {
        if (!this.initialized || !sound || !sound.buffer) return null;

        // Stop existing source if playing
        if (sound.isPlaying && sound.source) {
            sound.source.stop();
        }

        // Create new source
        const source = this.audioContext.createBufferSource();
        source.buffer = sound.buffer;
        source.loop = sound.loop;

        // Create gain node for volume control
        const gainNode = this.audioContext.createGain();
        const categoryVolume = this.volumes[sound.category] || 1.0;
        gainNode.gain.value = volume * categoryVolume * this.volumes.master;

        // Create panner for 3D audio if position is provided
        let pannerNode = null;
        if (position) {
            pannerNode = this.audioContext.createPanner();
            pannerNode.panningModel = 'HRTF';
            pannerNode.distanceModel = 'inverse';
            pannerNode.refDistance = 1;
            pannerNode.maxDistance = 100;
            pannerNode.rolloffFactor = 1;
            pannerNode.coneInnerAngle = 360;
            pannerNode.coneOuterAngle = 0;
            pannerNode.coneOuterGain = 0;
            
            pannerNode.positionX.value = position.x;
            pannerNode.positionY.value = position.y;
            pannerNode.positionZ.value = position.z;
            
            // Connect: source -> panner -> gain -> destination
            source.connect(pannerNode);
            pannerNode.connect(gainNode);
        } else {
            // Connect: source -> gain -> destination
            source.connect(gainNode);
        }
        
        gainNode.connect(this.audioContext.destination);

        // Store references
        sound.source = source;
        sound.gainNode = gainNode;
        sound.pannerNode = pannerNode;
        sound.isPlaying = true;

        // Handle sound end
        source.onended = () => {
            sound.isPlaying = false;
            sound.source = null;
        };

        source.start(0);
        return sound;
    }

    // Stop a sound
    stopSound(sound) {
        if (sound && sound.isPlaying && sound.source) {
            sound.source.stop();
            sound.isPlaying = false;
        }
    }

    // Play background music/ambience
    playBackground(url, volume = 0.5) {
        this.loadSound(url, 'background', true).then(sound => {
            if (sound) {
                this.playSound(sound, null, volume);
            }
        });
    }

    // Play sound effect at a position
    playSoundEffect(url, position, volume = 1.0) {
        this.loadSound(url, 'effects', false).then(sound => {
            if (sound) {
                this.playSound(sound, position, volume);
            }
        });
    }

    // Play actor voice at actor's position
    playActorVoice(url, actorPosition, volume = 1.0) {
        this.loadSound(url, 'voices', false).then(sound => {
            if (sound) {
                this.playSound(sound, actorPosition, volume);
            }
        });
    }

    // Set volume for a category
    setVolume(category, value) {
        this.volumes[category] = Math.max(0, Math.min(1, value));
        
        // Update all playing sounds in this category
        this.sounds[category].forEach(sound => {
            if (sound.isPlaying && sound.gainNode) {
                const categoryVolume = this.volumes[sound.category] || 1.0;
                sound.gainNode.gain.value = categoryVolume * this.volumes.master;
            }
        });
    }

    // Schedule an audio cue
    scheduleAudioCue(time, callback) {
        this.audioCues.push({
            time: time,
            callback: callback,
            triggered: false
        });
    }

    // Update audio cues (call in animation loop)
    updateAudioCues(currentTime) {
        this.audioCues.forEach(cue => {
            if (!cue.triggered && currentTime >= cue.time) {
                cue.callback();
                cue.triggered = true;
            }
        });
        
        // Remove triggered cues
        this.audioCues = this.audioCues.filter(cue => !cue.triggered);
    }

    // Update panner position for a sound (for moving sources)
    updateSoundPosition(sound, position) {
        if (sound && sound.pannerNode && sound.isPlaying) {
            sound.pannerNode.positionX.value = position.x;
            sound.pannerNode.positionY.value = position.y;
            sound.pannerNode.positionZ.value = position.z;
        }
    }

    // Stop all sounds in a category
    stopCategory(category) {
        this.sounds[category].forEach(sound => {
            this.stopSound(sound);
        });
    }

    // Stop all sounds
    stopAll() {
        Object.keys(this.sounds).forEach(category => {
            this.stopCategory(category);
        });
    }

    // Get all sounds in a category
    getSounds(category) {
        return this.sounds[category];
    }

    // Suspend audio context (for pausing)
    suspend() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
    }

    // Resume audio context
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
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
                    } : null,
                    textureOffset: mesh.material.map ? {
                        x: mesh.material.map.offset.x,
                        y: mesh.material.map.offset.y
                    } : null
                };
                
                // If using a default texture, save its type
                if (mesh.material.map) {
                    const texture = mesh.material.map;
                    const defaultTypes = ['brick', 'wood', 'sky', 'stone', 'metal', 'curtain', 'grass'];
                    for (const type of defaultTypes) {
                        if (texture === textureManager.getDefaultTexture(type)) {
                            textureInfo.defaultTexture = type;
                            break;
                        }
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
        actors = [];
        nextActorId = 1;
        
        // Remove all props
        props.forEach(prop => scene.remove(prop));
        props = [];
        nextPropId = 1;
        
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
            // Extract ID number for proper ordering
            const idNum = parseInt(data.id.split('_')[1]);
            if (idNum >= nextPropId) nextPropId = idNum + 1;
            
            // Set the prop type and create it
            selectedPropType = data.type;
            addPropAt(data.position.x, data.position.z);
            
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
                            
                            // Restore texture offset
                            if (sceneryData.textureOffset) {
                                const panel = sceneryPanels[sceneryData.index];
                                const mesh = panel.children[0];
                                if (mesh.material.map) {
                                    mesh.material.map.offset.set(
                                        sceneryData.textureOffset.x,
                                        sceneryData.textureOffset.y
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
    if (curtainState === 'open') {
        curtainLeft.position.x = -10;
        curtainRight.position.x = 10;
    } else {
        curtainLeft.position.x = -2;
        curtainRight.position.x = 2;
    }
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122);
    scene.fog = new THREE.Fog(0x001122, 10, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 20);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    createStage();
    createLighting();
    createStageMarkers();
    createMoveablePlatforms();
    createRotatingStage();
    createTrapDoors();
    createSceneryPanels();
    updateCurtains();
    createPlacementMarker();
    addControls();
    setupUI();

    // Initialize sound system
    soundSystem = new SoundSystem();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onStageClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('keydown', onKeyDown, false);
    
    // Initialize sound system on first user interaction
    const initAudio = () => {
        if (!soundSystem.initialized) {
            soundSystem.initialize();
            document.removeEventListener('click', initAudio);
            document.removeEventListener('keydown', initAudio);
        }
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
}

function createStage() {
    const stageGeometry = new THREE.BoxGeometry(20, 1, 15);
    const stageMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        shininess: 30
    });
    stage = new THREE.Mesh(stageGeometry, stageMaterial);
    stage.position.y = -0.5;
    stage.receiveShadow = true;
    scene.add(stage);

    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x202020,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1;
    floor.receiveShadow = true;
    scene.add(floor);

    const backWallGeometry = new THREE.PlaneGeometry(20, 15);
    const backWallMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a2e,
        side: THREE.DoubleSide
    });
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.z = -7.5;
    backWall.position.y = 6.5;
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Create curtain group for proper layering
    const curtainGroup = new THREE.Group();
    
    // Curtain material with rich theater red and velvet-like appearance
    const curtainMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x660000,
        side: THREE.DoubleSide,
        shininess: 30
    });
    
    // Create curtain with pleats (multiple panels for depth)
    function createCurtainSide(isLeft) {
        const curtainSide = new THREE.Group();
        
        // Main curtain panel
        const mainGeometry = new THREE.PlaneGeometry(18, 25);
        const main = new THREE.Mesh(mainGeometry, curtainMaterial);
        main.position.z = 0;
        curtainSide.add(main);
        
        // Add depth with secondary panel
        const depthGeometry = new THREE.PlaneGeometry(18, 25);
        const depth = new THREE.Mesh(depthGeometry, curtainMaterial);
        depth.position.z = -0.5;
        curtainSide.add(depth);
        
        // Add vertical pleats
        for (let i = 0; i < 6; i++) {
            const pleatGeometry = new THREE.PlaneGeometry(0.5, 25);
            const pleat = new THREE.Mesh(pleatGeometry, curtainMaterial);
            pleat.position.x = -8 + i * 3;
            pleat.position.z = Math.sin(i * 0.5) * 0.3;
            pleat.rotation.y = Math.PI / 8;
            curtainSide.add(pleat);
        }
        
        return curtainSide;
    }
    
    // Left curtain (opens to left) - start closed
    curtainLeft = createCurtainSide(true);
    curtainLeft.position.set(-2, 12, 8);
    curtainGroup.add(curtainLeft);
    
    // Right curtain (opens to right) - start closed
    curtainRight = createCurtainSide(false);
    curtainRight.position.set(2, 12, 8);
    curtainGroup.add(curtainRight);

    // Valance (top decorative curtain with scalloped edge)
    const valanceGroup = new THREE.Group();
    const valanceGeometry = new THREE.PlaneGeometry(40, 8);
    const valance = new THREE.Mesh(valanceGeometry, curtainMaterial);
    valance.position.y = 0;
    valanceGroup.add(valance);
    
    // Add decorative fringe
    for (let i = 0; i < 20; i++) {
        const fringeGeometry = new THREE.CylinderGeometry(0.1, 0.2, 1, 8);
        const fringe = new THREE.Mesh(fringeGeometry, curtainMaterial);
        fringe.position.x = -19 + i * 2;
        fringe.position.y = -4;
        valanceGroup.add(fringe);
    }
    
    curtainTop = valanceGroup;
    curtainTop.position.set(0, 20, 8);
    curtainGroup.add(curtainTop);
    
    scene.add(curtainGroup);
}

function createLighting() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const spotLight1 = new THREE.SpotLight(0xffffff, 1);
    spotLight1.position.set(-10, 15, 10);
    spotLight1.target.position.set(-5, 0, 0);
    spotLight1.angle = Math.PI / 6;
    spotLight1.penumbra = 0.3;
    spotLight1.castShadow = true;
    spotLight1.shadow.mapSize.width = 1024;
    spotLight1.shadow.mapSize.height = 1024;
    scene.add(spotLight1);
    scene.add(spotLight1.target);

    const spotLight2 = new THREE.SpotLight(0xffffff, 1);
    spotLight2.position.set(10, 15, 10);
    spotLight2.target.position.set(5, 0, 0);
    spotLight2.angle = Math.PI / 6;
    spotLight2.penumbra = 0.3;
    spotLight2.castShadow = true;
    spotLight2.shadow.mapSize.width = 1024;
    spotLight2.shadow.mapSize.height = 1024;
    scene.add(spotLight2);
    scene.add(spotLight2.target);

    const centerSpotLight = new THREE.SpotLight(0xffd700, 0.8);
    centerSpotLight.position.set(0, 15, 10);
    centerSpotLight.target.position.set(0, 0, 0);
    centerSpotLight.angle = Math.PI / 4;
    centerSpotLight.penumbra = 0.5;
    centerSpotLight.castShadow = true;
    scene.add(centerSpotLight);
    scene.add(centerSpotLight.target);

    const footLight1 = new THREE.PointLight(0x4169e1, 0.5, 10);
    footLight1.position.set(-8, 0.5, 7);
    scene.add(footLight1);

    const footLight2 = new THREE.PointLight(0x4169e1, 0.5, 10);
    footLight2.position.set(0, 0.5, 7);
    scene.add(footLight2);

    const footLight3 = new THREE.PointLight(0x4169e1, 0.5, 10);
    footLight3.position.set(8, 0.5, 7);
    scene.add(footLight3);

    lights.push(spotLight1, spotLight2, centerSpotLight);
}

function createStageMarkers() {
    const markerPositions = [
        { x: -8, z: -3, label: 'USL' },  // Upstage Left
        { x: 0, z: -3, label: 'USC' },   // Upstage Center
        { x: 8, z: -3, label: 'USR' },   // Upstage Right
        { x: -8, z: 0, label: 'SL' },    // Stage Left
        { x: 0, z: 0, label: 'C' },      // Center
        { x: 8, z: 0, label: 'SR' },     // Stage Right
        { x: -8, z: 3, label: 'DSL' },   // Downstage Left
        { x: 0, z: 3, label: 'DSC' },    // Downstage Center
        { x: 8, z: 3, label: 'DSR' }     // Downstage Right
    ];

    markerPositions.forEach(pos => {
        const markerGroup = new THREE.Group();
        
        const markerGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
        const markerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x00ff00,
            emissiveIntensity: 0.3
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(0, 0.05, 0);
        markerGroup.add(marker);
        
        const glowGeometry = new THREE.RingGeometry(0.3, 0.5, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = 0.1;
        markerGroup.add(glow);
        
        markerGroup.position.set(pos.x, 0, pos.z);
        markerGroup.userData = { label: pos.label, type: 'marker' };
        
        scene.add(markerGroup);
        stageMarkers.push(markerGroup);
    });
}

function createMoveablePlatforms() {
    const platformPositions = [
        { x: -9, z: -6.5, width: 2, depth: 1.5 },  // Far back left (moved further out)
        { x: 9, z: -6.5, width: 2, depth: 1.5 },   // Far back right (moved further out)
        { x: -8, z: 5, width: 3, depth: 2 },       // Front left
        { x: 8, z: 5, width: 3, depth: 2 }         // Front right
    ];

    platformPositions.forEach((pos, index) => {
        const platformGroup = new THREE.Group();
        
        const geometry = new THREE.BoxGeometry(pos.width, 0.5, pos.depth);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x654321,
            shininess: 30
        });
        const platform = new THREE.Mesh(geometry, material);
        platform.castShadow = true;
        platform.receiveShadow = true;
        platformGroup.add(platform);
        
        platformGroup.position.set(pos.x, 0.25, pos.z);
        platformGroup.userData = { 
            type: 'platform',
            index: index,
            baseY: 0.25,
            moving: false,
            targetY: 0.25
        };
        
        scene.add(platformGroup);
        moveablePlatforms.push(platformGroup);
    });
}

function createRotatingStage() {
    const rotatingGroup = new THREE.Group();
    
    const geometry = new THREE.CylinderGeometry(5, 5, 1, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x8B4513,
        shininess: 30
    });
    const centerStage = new THREE.Mesh(geometry, material);
    centerStage.position.y = -0.5;
    centerStage.castShadow = true;
    centerStage.receiveShadow = true;
    rotatingGroup.add(centerStage);
    
    const lineGeometry = new THREE.RingGeometry(4.8, 5, 32);
    const lineMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x000000,
        side: THREE.DoubleSide
    });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.y = 0.01;
    rotatingGroup.add(line);
    
    rotatingGroup.position.set(0, 0, 0);
    rotatingGroup.userData = { 
        type: 'rotatingStage',
        rotating: false,
        rotationSpeed: 0.01
    };
    rotatingGroup.visible = false; // Hidden by default
    
    scene.add(rotatingGroup);
    rotatingStage = rotatingGroup;
}

function createTrapDoors() {
    const trapDoorPositions = [
        { x: -7, z: 0 },   // Left side middle
        { x: 7, z: 0 },    // Right side middle
        { x: 0, z: 6 },    // Front center
        { x: 0, z: -6 }    // Back center
    ];

    trapDoorPositions.forEach((pos, index) => {
        const trapDoorGroup = new THREE.Group();
        
        const geometry = new THREE.BoxGeometry(2, 0.1, 2);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x654321,
            shininess: 30
        });
        const door = new THREE.Mesh(geometry, material);
        door.castShadow = true;
        door.receiveShadow = true;
        trapDoorGroup.add(door);
        
        const frameGeometry = new THREE.BoxGeometry(2.2, 0.05, 2.2);
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.y = -0.025;
        trapDoorGroup.add(frame);
        
        trapDoorGroup.position.set(pos.x, 0.05, pos.z);
        trapDoorGroup.userData = { 
            type: 'trapDoor',
            index: index,
            open: false,
            targetRotation: 0
        };
        trapDoorGroup.visible = false; // Hidden by default
        
        scene.add(trapDoorGroup);
        trapDoors.push(trapDoorGroup);
    });
}

function createSceneryPanels() {
    // Create two scenery panels - backdrop and midstage
    const panelData = [
        { 
            name: 'backdrop',
            width: 24,
            height: 15,
            defaultZ: -7.3,  // Just in front of back wall
            hasPassthrough: false
        },
        { 
            name: 'midstage',
            width: 20,
            height: 15,
            defaultZ: 0,     // Center of stage
            hasPassthrough: true,
            passthroughWidth: 6,
            passthroughHeight: 8,
            passthroughY: 2
        }
    ];

    panelData.forEach((data, index) => {
        const panelGroup = new THREE.Group();
        
        // Main panel geometry
        const geometry = new THREE.PlaneGeometry(data.width, data.height);
        
        // Default material (can be changed later)
        const material = new THREE.MeshPhongMaterial({
            color: index === 0 ? 0x4169e1 : 0x228b22,  // Blue for backdrop, green for midstage
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        
        const panel = new THREE.Mesh(geometry, material);
        panel.position.y = data.height / 2 - 0.5;
        panel.castShadow = true;
        panel.receiveShadow = true;
        panelGroup.add(panel);
        
        // Add passthrough cutout for midstage panel
        if (data.hasPassthrough) {
            const cutoutGeometry = new THREE.PlaneGeometry(
                data.passthroughWidth, 
                data.passthroughHeight
            );
            const cutoutMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                opacity: 0,
                transparent: true
            });
            const cutout = new THREE.Mesh(cutoutGeometry, cutoutMaterial);
            cutout.position.y = data.passthroughY;
            panelGroup.add(cutout);
            
            // Visual frame around cutout
            const frameThickness = 0.2;
            const frameMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            
            // Frame pieces
            const frameTop = new THREE.Mesh(
                new THREE.BoxGeometry(data.passthroughWidth + frameThickness*2, frameThickness, 0.1),
                frameMaterial
            );
            frameTop.position.y = data.passthroughY + data.passthroughHeight/2;
            panelGroup.add(frameTop);
            
            const frameBottom = new THREE.Mesh(
                new THREE.BoxGeometry(data.passthroughWidth + frameThickness*2, frameThickness, 0.1),
                frameMaterial
            );
            frameBottom.position.y = data.passthroughY - data.passthroughHeight/2;
            panelGroup.add(frameBottom);
            
            const frameLeft = new THREE.Mesh(
                new THREE.BoxGeometry(frameThickness, data.passthroughHeight, 0.1),
                frameMaterial
            );
            frameLeft.position.x = -data.passthroughWidth/2;
            frameLeft.position.y = data.passthroughY;
            panelGroup.add(frameLeft);
            
            const frameRight = new THREE.Mesh(
                new THREE.BoxGeometry(frameThickness, data.passthroughHeight, 0.1),
                frameMaterial
            );
            frameRight.position.x = data.passthroughWidth/2;
            frameRight.position.y = data.passthroughY;
            panelGroup.add(frameRight);
        }
        
        // Position and properties
        const isBackdrop = index === 0;
        panelGroup.position.x = isBackdrop ? -30 : 30; // Backdrop from left, midstage from right
        panelGroup.position.z = data.defaultZ;
        panelGroup.userData = {
            type: 'scenery',
            name: data.name,
            currentPosition: 0, // 0 = off, 0.25 = 1/4, 0.5 = 1/2, 0.75 = 3/4, 1 = full
            targetPosition: 0,
            moving: false,
            isBackdrop: isBackdrop,
            hasPassthrough: data.hasPassthrough,
            passthroughBounds: data.hasPassthrough ? {
                minX: -data.passthroughWidth/2,
                maxX: data.passthroughWidth/2,
                minY: data.passthroughY - data.passthroughHeight/2,
                maxY: data.passthroughY + data.passthroughHeight/2
            } : null,
            panelBounds: {
                minX: -data.width/2,
                maxX: data.width/2,
                minY: -0.5,
                maxY: data.height - 0.5
            }
        };
        
        scene.add(panelGroup);
        sceneryPanels.push(panelGroup);
    });
}

function updateCurtains() {
    // Curtains are already created in createStage
}

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

function addControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
}

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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

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
    Object.entries(categories).forEach(([category, props]) => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);
        props.forEach(prop => {
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
        <option value="stone">Stone Wall</option>
        <option value="metal">Metal</option>
        <option value="curtain">Red Curtain</option>
        <option value="grass">Grass</option>
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
    
    const uploadVideoButton = document.createElement('button');
    uploadVideoButton.textContent = 'Upload Video';
    uploadVideoButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    uploadVideoButton.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        
        input.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            try {
                const video = document.createElement('video');
                video.src = URL.createObjectURL(file);
                video.crossOrigin = 'anonymous';
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                
                video.addEventListener('loadeddata', () => {
                    video.play();
                    const texture = textureManager.loadVideoTexture(video);
                    const panelIndex = parseInt(panelSelect.value);
                    textureManager.applyTextureToPanel(panelIndex, texture);
                    console.log(`Applied video texture to panel ${panelIndex}`);
                    alert('Video texture applied successfully!');
                });
                
                video.addEventListener('error', (e) => {
                    console.error('Video loading failed:', e);
                    alert('Failed to load video: ' + (e.message || 'Unknown error'));
                });
            } catch (error) {
                console.error('Video texture failed:', error);
                alert('Failed to load video texture: ' + error.message);
            }
        };
        
        input.click();
    });
    
    const clearTextureButton = document.createElement('button');
    clearTextureButton.textContent = 'Clear Texture';
    clearTextureButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    clearTextureButton.addEventListener('click', () => {
        const panelIndex = parseInt(panelSelect.value);
        textureManager.removeTextureFromPanel(panelIndex);
        console.log(`Cleared texture from panel ${panelIndex}`);
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
    
    const textureOffsetLabel = document.createElement('div');
    textureOffsetLabel.textContent = 'Texture Offset X:';
    textureOffsetLabel.style.cssText = 'margin-top: 5px; font-size: 12px;';
    
    const offsetXSlider = document.createElement('input');
    offsetXSlider.type = 'range';
    offsetXSlider.min = '0';
    offsetXSlider.max = '1';
    offsetXSlider.step = '0.01';
    offsetXSlider.value = '0';
    offsetXSlider.style.cssText = 'margin: 5px 0; width: 150px;';
    offsetXSlider.addEventListener('input', (e) => {
        const offset = parseFloat(e.target.value);
        const panelIndex = parseInt(panelSelect.value);
        const panel = sceneryPanels[panelIndex];
        if (panel && panel.children[0].material.map) {
            panel.children[0].material.map.offset.x = offset;
        }
    });
    
    const textureOffsetYLabel = document.createElement('div');
    textureOffsetYLabel.textContent = 'Texture Offset Y:';
    textureOffsetYLabel.style.cssText = 'margin-top: 5px; font-size: 12px;';
    
    const offsetYSlider = document.createElement('input');
    offsetYSlider.type = 'range';
    offsetYSlider.min = '0';
    offsetYSlider.max = '1';
    offsetYSlider.step = '0.01';
    offsetYSlider.value = '0';
    offsetYSlider.style.cssText = 'margin: 5px 0; width: 150px;';
    offsetYSlider.addEventListener('input', (e) => {
        const offset = parseFloat(e.target.value);
        const panelIndex = parseInt(panelSelect.value);
        const panel = sceneryPanels[panelIndex];
        if (panel && panel.children[0].material.map) {
            panel.children[0].material.map.offset.y = offset;
        }
    });

    // Save/Load controls
    const saveLoadLabel = document.createElement('div');
    saveLoadLabel.innerHTML = '<strong>Save/Load Scene</strong>';
    saveLoadLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Scene';
    saveButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    saveButton.addEventListener('click', saveScene);
    
    const loadButton = document.createElement('button');
    loadButton.textContent = 'Load Scene';
    loadButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    loadButton.addEventListener('click', loadScene);
    
    // Physics test button
    const physicsLabel = document.createElement('div');
    physicsLabel.innerHTML = '<strong>Physics & Debug</strong>';
    physicsLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const pushButton = document.createElement('button');
    pushButton.textContent = 'Push Mode';
    pushButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    pushButton.addEventListener('click', () => {
        placementMode = 'push';
        placementMarker.visible = true;
        alert('Click on an object to push it! Lighter objects move more.');
    });
    
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug Collisions: OFF';
    debugButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    debugButton.addEventListener('click', () => {
        toggleDebugVisualization();
        debugButton.textContent = `Debug Collisions: ${debugVisualizationEnabled ? 'ON' : 'OFF'}`;
    });
    
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
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(uploadVideoButton);
    uiContainer.appendChild(document.createElement('br'));
    uiContainer.appendChild(clearTextureButton);
    uiContainer.appendChild(textureScaleLabel);
    uiContainer.appendChild(scaleSlider);
    uiContainer.appendChild(textureOffsetLabel);
    uiContainer.appendChild(offsetXSlider);
    uiContainer.appendChild(textureOffsetYLabel);
    uiContainer.appendChild(offsetYSlider);
    uiContainer.appendChild(saveLoadLabel);
    uiContainer.appendChild(saveButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(loadButton);
    uiContainer.appendChild(physicsLabel);
    uiContainer.appendChild(pushButton);
    uiContainer.appendChild(debugButton);
    uiContainer.appendChild(undoRedoLabel);
    uiContainer.appendChild(undoButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(redoButton);
    
    // Audio controls
    const audioLabel = document.createElement('div');
    audioLabel.innerHTML = '<strong>Audio System</strong>';
    audioLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    
    const audioStatusDiv = document.createElement('div');
    audioStatusDiv.style.cssText = 'font-size: 11px; color: #aaa; margin-bottom: 5px;';
    audioStatusDiv.textContent = 'Status: Not initialized';
    
    // Master volume
    const masterVolumeLabel = document.createElement('div');
    masterVolumeLabel.textContent = 'Master Volume:';
    masterVolumeLabel.style.cssText = 'margin-top: 5px; font-size: 12px;';
    
    const masterVolumeSlider = document.createElement('input');
    masterVolumeSlider.type = 'range';
    masterVolumeSlider.min = '0';
    masterVolumeSlider.max = '1';
    masterVolumeSlider.step = '0.1';
    masterVolumeSlider.value = '1';
    masterVolumeSlider.style.cssText = 'margin: 5px 0; width: 150px;';
    masterVolumeSlider.addEventListener('input', (e) => {
        if (soundSystem && soundSystem.initialized) {
            soundSystem.setVolume('master', parseFloat(e.target.value));
        }
    });
    
    // Background volume
    const bgVolumeLabel = document.createElement('div');
    bgVolumeLabel.textContent = 'Background:';
    bgVolumeLabel.style.cssText = 'margin-top: 5px; font-size: 12px;';
    
    const bgVolumeSlider = document.createElement('input');
    bgVolumeSlider.type = 'range';
    bgVolumeSlider.min = '0';
    bgVolumeSlider.max = '1';
    bgVolumeSlider.step = '0.1';
    bgVolumeSlider.value = '0.5';
    bgVolumeSlider.style.cssText = 'margin: 5px 0; width: 150px;';
    bgVolumeSlider.addEventListener('input', (e) => {
        if (soundSystem && soundSystem.initialized) {
            soundSystem.setVolume('background', parseFloat(e.target.value));
        }
    });
    
    // Effects volume
    const effectsVolumeLabel = document.createElement('div');
    effectsVolumeLabel.textContent = 'Effects:';
    effectsVolumeLabel.style.cssText = 'margin-top: 5px; font-size: 12px;';
    
    const effectsVolumeSlider = document.createElement('input');
    effectsVolumeSlider.type = 'range';
    effectsVolumeSlider.min = '0';
    effectsVolumeSlider.max = '1';
    effectsVolumeSlider.step = '0.1';
    effectsVolumeSlider.value = '0.7';
    effectsVolumeSlider.style.cssText = 'margin: 5px 0; width: 150px;';
    effectsVolumeSlider.addEventListener('input', (e) => {
        if (soundSystem && soundSystem.initialized) {
            soundSystem.setVolume('effects', parseFloat(e.target.value));
        }
    });
    
    // Voices volume
    const voicesVolumeLabel = document.createElement('div');
    voicesVolumeLabel.textContent = 'Voices:';
    voicesVolumeLabel.style.cssText = 'margin-top: 5px; font-size: 12px;';
    
    const voicesVolumeSlider = document.createElement('input');
    voicesVolumeSlider.type = 'range';
    voicesVolumeSlider.min = '0';
    voicesVolumeSlider.max = '1';
    voicesVolumeSlider.step = '0.1';
    voicesVolumeSlider.value = '0.8';
    voicesVolumeSlider.style.cssText = 'margin: 5px 0; width: 150px;';
    voicesVolumeSlider.addEventListener('input', (e) => {
        if (soundSystem && soundSystem.initialized) {
            soundSystem.setVolume('voices', parseFloat(e.target.value));
        }
    });
    
    // Pause/Resume button
    const pauseResumeButton = document.createElement('button');
    pauseResumeButton.textContent = 'Pause Audio';
    pauseResumeButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    let audioPaused = false;
    pauseResumeButton.addEventListener('click', () => {
        if (soundSystem && soundSystem.initialized) {
            if (audioPaused) {
                soundSystem.resume();
                pauseResumeButton.textContent = 'Pause Audio';
                audioPaused = false;
            } else {
                soundSystem.suspend();
                pauseResumeButton.textContent = 'Resume Audio';
                audioPaused = true;
            }
        }
    });
    
    // Stop all button
    const stopAllButton = document.createElement('button');
    stopAllButton.textContent = 'Stop All';
    stopAllButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    stopAllButton.addEventListener('click', () => {
        if (soundSystem && soundSystem.initialized) {
            soundSystem.stopAll();
        }
    });
    
    // Update audio status when initialized
    const updateAudioStatus = () => {
        if (soundSystem && soundSystem.initialized) {
            audioStatusDiv.textContent = 'Status: Active';
            audioStatusDiv.style.color = '#0f0';
        }
    };
    
    // Check for initialization periodically
    const statusInterval = setInterval(() => {
        if (soundSystem && soundSystem.initialized) {
            updateAudioStatus();
            clearInterval(statusInterval);
        }
    }, 500);
    
    uiContainer.appendChild(audioLabel);
    uiContainer.appendChild(audioStatusDiv);
    uiContainer.appendChild(masterVolumeLabel);
    uiContainer.appendChild(masterVolumeSlider);
    uiContainer.appendChild(bgVolumeLabel);
    uiContainer.appendChild(bgVolumeSlider);
    uiContainer.appendChild(effectsVolumeLabel);
    uiContainer.appendChild(effectsVolumeSlider);
    uiContainer.appendChild(voicesVolumeLabel);
    uiContainer.appendChild(voicesVolumeSlider);
    uiContainer.appendChild(pauseResumeButton);
    uiContainer.appendChild(document.createTextNode(' '));
    uiContainer.appendChild(stopAllButton);

    document.body.appendChild(toggleButton);
    document.body.appendChild(uiContainer);
}

function applyLightingPreset(preset) {
    currentLightingPreset = preset;
    
    switch(preset) {
        case 'day':
            scene.background = new THREE.Color(0x87CEEB);
            scene.fog = new THREE.Fog(0x87CEEB, 20, 100);
            lights.forEach(light => light.intensity = 0.6);
            break;
        case 'night':
            scene.background = new THREE.Color(0x000033);
            scene.fog = new THREE.Fog(0x000033, 10, 80);
            lights.forEach(light => light.intensity = 1.2);
            break;
        case 'sunset':
            scene.background = new THREE.Color(0xFF6B35);
            scene.fog = new THREE.Fog(0xFF6B35, 15, 90);
            lights[0].color.setHex(0xFFB700);
            lights[1].color.setHex(0xFFB700);
            break;
        case 'dramatic':
            scene.background = new THREE.Color(0x000000);
            scene.fog = new THREE.Fog(0x000000, 5, 50);
            lights.forEach((light, i) => {
                light.intensity = i === 2 ? 1.5 : 0.3;
            });
            break;
        default:
            scene.background = new THREE.Color(0x001122);
            scene.fog = new THREE.Fog(0x001122, 10, 100);
            lights.forEach(light => {
                light.intensity = 1;
                light.color.setHex(0xffffff);
            });
    }
}

// Prop catalog definitions
const PROP_CATALOG = {
    // Basic shapes
    cube: {
        name: 'Cube',
        category: 'basic',
        create: () => new THREE.BoxGeometry(1, 1, 1),
        color: 0x808080,
        y: 0.5
    },
    sphere: {
        name: 'Sphere',
        category: 'basic',
        create: () => new THREE.SphereGeometry(0.5, 16, 16),
        color: 0x808080,
        y: 0.5
    },
    cylinder: {
        name: 'Cylinder',
        category: 'basic',
        create: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
        color: 0x808080,
        y: 0.5
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

function addActorAt(x, z) {
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
    barrel: { mass: 50, friction: 0.6 }, // Heavy but can roll
    box: { mass: 20, friction: 0.8 },   // Medium weight
    plant: { mass: 5, friction: 0.7 },  // Light
    lamp: { mass: 3, friction: 0.9 },   // Very light
    cube: { mass: 10, friction: 0.7 },  // Default
    sphere: { mass: 8, friction: 0.4 }, // Low friction (rolls)
    cylinder: { mass: 12, friction: 0.6 }
};

// Velocity tracking for momentum
let objectVelocities = new Map();

// Collision Detection Enhancements

// Collision layers for filtering
const COLLISION_LAYERS = {
    NONE: 0,
    ACTORS: 1 << 0,      // 1
    PROPS: 1 << 1,       // 2
    SCENERY: 1 << 2,     // 4
    STAGE: 1 << 3,       // 8
    ALL: 0xFF            // All layers
};

// Collision shape types
const COLLISION_SHAPES = {
    BOX: 'box',
    SPHERE: 'sphere',
    CAPSULE: 'capsule'
};

// Spatial hash grid for performance optimization
class SpatialHashGrid {
    constructor(cellSize = 5) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }
    
    _hash(x, z) {
        const cellX = Math.floor(x / this.cellSize);
        const cellZ = Math.floor(z / this.cellSize);
        return `${cellX},${cellZ}`;
    }
    
    clear() {
        this.grid.clear();
    }
    
    insert(obj) {
        const pos = obj.position;
        const bounds = getObjectBounds(obj);
        const radius = Math.max(bounds.width, bounds.depth) / 2;
        
        // Insert into all cells the object overlaps
        const minX = pos.x - radius;
        const maxX = pos.x + radius;
        const minZ = pos.z - radius;
        const maxZ = pos.z + radius;
        
        const minCellX = Math.floor(minX / this.cellSize);
        const maxCellX = Math.floor(maxX / this.cellSize);
        const minCellZ = Math.floor(minZ / this.cellSize);
        const maxCellZ = Math.floor(maxZ / this.cellSize);
        
        for (let cx = minCellX; cx <= maxCellX; cx++) {
            for (let cz = minCellZ; cz <= maxCellZ; cz++) {
                const key = `${cx},${cz}`;
                if (!this.grid.has(key)) {
                    this.grid.set(key, []);
                }
                this.grid.get(key).push(obj);
            }
        }
    }
    
    query(x, z, radius) {
        const minX = x - radius;
        const maxX = x + radius;
        const minZ = z - radius;
        const maxZ = z + radius;
        
        const minCellX = Math.floor(minX / this.cellSize);
        const maxCellX = Math.floor(maxX / this.cellSize);
        const minCellZ = Math.floor(minZ / this.cellSize);
        const maxCellZ = Math.floor(maxZ / this.cellSize);
        
        const objects = new Set();
        for (let cx = minCellX; cx <= maxCellX; cx++) {
            for (let cz = minCellZ; cz <= maxCellZ; cz++) {
                const key = `${cx},${cz}`;
                const cell = this.grid.get(key);
                if (cell) {
                    cell.forEach(obj => objects.add(obj));
                }
            }
        }
        
        return Array.from(objects);
    }
}

// Create spatial hash grid instance
let spatialGrid = new SpatialHashGrid(5);

// Debug visualization state
let debugVisualizationEnabled = false;
let debugVisualizationHelpers = [];

// Texture management system
class TextureManager {
    constructor() {
        this.textures = new Map();
        this.loader = new THREE.TextureLoader();
        this.defaultTextures = this.createDefaultTextures();
    }
    
    createDefaultTextures() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        const textures = {};
        
        // Create brick texture
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#654321';
        ctx.strokeStyle = '#5A3A1A';
        ctx.lineWidth = 2;
        for (let y = 0; y < 512; y += 64) {
            for (let x = 0; x < 512; x += 128) {
                const offset = (y / 64) % 2 * 64;
                ctx.fillRect(x + offset, y, 120, 60);
                ctx.strokeRect(x + offset, y, 120, 60);
            }
        }
        textures.brick = new THREE.CanvasTexture(canvas);
        textures.brick.wrapS = textures.brick.wrapT = THREE.RepeatWrapping;
        
        // Create wood texture
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, 0, 512, 512);
        ctx.fillStyle = '#CD853F';
        for (let y = 0; y < 512; y += 32) {
            ctx.fillRect(0, y, 512, 16);
            // Add wood grain detail
            ctx.strokeStyle = '#8B6914';
            ctx.lineWidth = 1;
            for (let x = 0; x < 512; x += 20) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 10, y + 16);
                ctx.stroke();
            }
        }
        textures.wood = new THREE.CanvasTexture(canvas);
        textures.wood.wrapS = textures.wood.wrapT = THREE.RepeatWrapping;
        
        // Create sky texture
        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#B0E0E6');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);
        // Add clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            ctx.beginPath();
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
            ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            ctx.fill();
        }
        textures.sky = new THREE.CanvasTexture(canvas);
        
        // Create stone texture
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, ${100 + Math.random() * 100}, 0.8)`;
            const size = 20 + Math.random() * 80;
            ctx.fillRect(Math.random() * 512, Math.random() * 512, size, size);
        }
        textures.stone = new THREE.CanvasTexture(canvas);
        textures.stone.wrapS = textures.stone.wrapT = THREE.RepeatWrapping;
        
        // Create metal texture
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, 512, 512);
        for (let y = 0; y < 512; y += 2) {
            const brightness = 180 + Math.sin(y * 0.1) * 40;
            ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
            ctx.fillRect(0, y, 512, 1);
        }
        textures.metal = new THREE.CanvasTexture(canvas);
        textures.metal.wrapS = textures.metal.wrapT = THREE.RepeatWrapping;
        
        // Create curtain texture
        const curtainGradient = ctx.createLinearGradient(0, 0, 512, 0);
        curtainGradient.addColorStop(0, '#660000');
        curtainGradient.addColorStop(0.1, '#8B0000');
        curtainGradient.addColorStop(0.2, '#660000');
        curtainGradient.addColorStop(0.3, '#8B0000');
        curtainGradient.addColorStop(0.4, '#660000');
        curtainGradient.addColorStop(0.5, '#8B0000');
        curtainGradient.addColorStop(0.6, '#660000');
        curtainGradient.addColorStop(0.7, '#8B0000');
        curtainGradient.addColorStop(0.8, '#660000');
        curtainGradient.addColorStop(0.9, '#8B0000');
        curtainGradient.addColorStop(1, '#660000');
        ctx.fillStyle = curtainGradient;
        ctx.fillRect(0, 0, 512, 512);
        textures.curtain = new THREE.CanvasTexture(canvas);
        textures.curtain.wrapS = textures.curtain.wrapT = THREE.RepeatWrapping;
        
        // Create grass texture
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 5000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const greenShade = 100 + Math.random() * 100;
            ctx.strokeStyle = `rgb(${Math.random() * 50}, ${greenShade}, ${Math.random() * 50})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.random() * 4 - 2, y - Math.random() * 8);
            ctx.stroke();
        }
        textures.grass = new THREE.CanvasTexture(canvas);
        textures.grass.wrapS = textures.grass.wrapT = THREE.RepeatWrapping;
        
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
    
    applyTextureToPanel(panelIndex, texture, scale = { x: 1, y: 1 }, offset = { x: 0, y: 0 }) {
        if (panelIndex >= sceneryPanels.length) return false;
        
        const panel = sceneryPanels[panelIndex];
        const mesh = panel.children[0]; // Main panel mesh
        
        // Clone texture to avoid sharing references
        const clonedTexture = texture.clone();
        clonedTexture.repeat.set(scale.x, scale.y);
        clonedTexture.offset.set(offset.x, offset.y);
        
        // Apply to material
        mesh.material.map = clonedTexture;
        mesh.material.needsUpdate = true;
        
        return true;
    }
    
    removeTextureFromPanel(panelIndex) {
        if (panelIndex >= sceneryPanels.length) return false;
        
        const panel = sceneryPanels[panelIndex];
        const mesh = panel.children[0];
        
        // Remove texture and revert to solid color
        if (mesh.material.map) {
            mesh.material.map.dispose();
            mesh.material.map = null;
            mesh.material.needsUpdate = true;
        }
        
        return true;
    }
    
    loadVideoTexture(videoElement) {
        const texture = new THREE.VideoTexture(videoElement);
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
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

// Get bounding box for an object (prop or actor)
function getObjectBounds(obj) {
    // Default bounds based on object type
    let bounds = { width: 1, depth: 1, height: 1, shape: COLLISION_SHAPES.BOX };
    
    if (obj.userData.type === 'actor') {
        bounds = { width: 1, depth: 1, height: 2.5, shape: COLLISION_SHAPES.CAPSULE };
    } else if (obj.userData.propType) {
        // Specific bounds for different prop types
        switch (obj.userData.propType) {
            case 'table':
                bounds = { width: 2, depth: 1.5, height: 1, shape: COLLISION_SHAPES.BOX };
                break;
            case 'chair':
                bounds = { width: 1, depth: 1, height: 1.5, shape: COLLISION_SHAPES.BOX };
                break;
            case 'barrel':
                bounds = { width: 1, depth: 1, height: 1.2, shape: COLLISION_SHAPES.SPHERE };
                break;
            case 'box':
                bounds = { width: 1.2, depth: 1.2, height: 1.2, shape: COLLISION_SHAPES.BOX };
                break;
            case 'plant':
                bounds = { width: 0.8, depth: 0.8, height: 1.2, shape: COLLISION_SHAPES.SPHERE };
                break;
            case 'lamp':
                bounds = { width: 0.8, depth: 0.8, height: 1.5, shape: COLLISION_SHAPES.CAPSULE };
                break;
            case 'sphere':
                bounds = { width: 1, depth: 1, height: 1, shape: COLLISION_SHAPES.SPHERE };
                break;
            case 'cylinder':
                bounds = { width: 1, depth: 1, height: 1.5, shape: COLLISION_SHAPES.CAPSULE };
                break;
            default:
                bounds = { width: 1, depth: 1, height: 1, shape: COLLISION_SHAPES.BOX };
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

// Get collision layer for an object
function getObjectCollisionLayer(obj) {
    if (obj.userData.type === 'actor') {
        return COLLISION_LAYERS.ACTORS;
    } else if (obj.userData.propType) {
        return COLLISION_LAYERS.PROPS;
    } else if (obj.userData.sceneryType) {
        return COLLISION_LAYERS.SCENERY;
    }
    return COLLISION_LAYERS.ALL;
}

// Check if two layers can collide
function canLayersCollide(layer1, layer2) {
    return (layer1 & layer2) !== 0;
}

// Improved collision detection with shape support
function checkShapeCollision(bounds1, pos1, bounds2, pos2) {
    const shape1 = bounds1.shape || COLLISION_SHAPES.BOX;
    const shape2 = bounds2.shape || COLLISION_SHAPES.BOX;
    
    // Sphere-Sphere collision
    if (shape1 === COLLISION_SHAPES.SPHERE && shape2 === COLLISION_SHAPES.SPHERE) {
        const radius1 = Math.max(bounds1.width, bounds1.depth) / 2;
        const radius2 = Math.max(bounds2.width, bounds2.depth) / 2;
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        const dy = pos1.y - pos2.y;
        const distSq = dx * dx + dz * dz + dy * dy;
        const radiusSum = radius1 + radius2;
        return distSq < radiusSum * radiusSum;
    }
    
    // Capsule-Capsule (simplified to cylinder check on XZ plane)
    if (shape1 === COLLISION_SHAPES.CAPSULE && shape2 === COLLISION_SHAPES.CAPSULE) {
        const radius1 = Math.max(bounds1.width, bounds1.depth) / 2;
        const radius2 = Math.max(bounds2.width, bounds2.depth) / 2;
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        const distSq = dx * dx + dz * dz;
        const radiusSum = radius1 + radius2;
        
        // Check Y overlap
        const yOverlap = Math.abs(pos1.y - pos2.y) < (bounds1.height + bounds2.height) / 2;
        return distSq < radiusSum * radiusSum && yOverlap;
    }
    
    // Sphere-Box collision (treat sphere as if testing against expanded box)
    if ((shape1 === COLLISION_SHAPES.SPHERE && shape2 === COLLISION_SHAPES.BOX) ||
        (shape1 === COLLISION_SHAPES.BOX && shape2 === COLLISION_SHAPES.SPHERE)) {
        const spherePos = shape1 === COLLISION_SHAPES.SPHERE ? pos1 : pos2;
        const boxPos = shape1 === COLLISION_SHAPES.BOX ? pos1 : pos2;
        const sphereBounds = shape1 === COLLISION_SHAPES.SPHERE ? bounds1 : bounds2;
        const boxBounds = shape1 === COLLISION_SHAPES.BOX ? bounds1 : bounds2;
        
        const radius = Math.max(sphereBounds.width, sphereBounds.depth) / 2;
        
        // Closest point on box to sphere center
        const closestX = Math.max(boxPos.x - boxBounds.width/2, 
                                   Math.min(spherePos.x, boxPos.x + boxBounds.width/2));
        const closestZ = Math.max(boxPos.z - boxBounds.depth/2,
                                   Math.min(spherePos.z, boxPos.z + boxBounds.depth/2));
        const closestY = Math.max(boxPos.y - boxBounds.height/2,
                                   Math.min(spherePos.y, boxPos.y + boxBounds.height/2));
        
        const dx = spherePos.x - closestX;
        const dz = spherePos.z - closestZ;
        const dy = spherePos.y - closestY;
        const distSq = dx * dx + dz * dz + dy * dy;
        
        return distSq < radius * radius;
    }
    
    // Box-Box collision (AABB)
    const xOverlap = Math.abs(pos1.x - pos2.x) < (bounds1.width + bounds2.width) / 2;
    const zOverlap = Math.abs(pos1.z - pos2.z) < (bounds1.depth + bounds2.depth) / 2;
    const yOverlap = Math.abs(pos1.y - pos2.y) < (bounds1.height + bounds2.height) / 2;
    
    return xOverlap && zOverlap && yOverlap;
}

// Check collision between two objects
function checkObjectCollision(obj1, pos1, obj2) {
    if (obj1 === obj2 || obj2.userData.hidden) return false;
    
    // Check collision layers
    const layer1 = getObjectCollisionLayer(obj1);
    const layer2 = getObjectCollisionLayer(obj2);
    if (!canLayersCollide(layer1, layer2)) {
        return false;
    }
    
    const bounds1 = getObjectBounds(obj1);
    const bounds2 = getObjectBounds(obj2);
    const pos2 = obj2.position;
    
    // Use improved shape-based collision detection
    return checkShapeCollision(bounds1, pos1, bounds2, pos2);
}

// Calculate sliding vector along collision surface
function calculateSlidingVector(velocity, collisionNormal) {
    // Project velocity onto collision normal
    const dot = velocity.x * collisionNormal.x + velocity.z * collisionNormal.z;
    
    // Subtract normal component to get sliding vector
    return {
        x: velocity.x - dot * collisionNormal.x,
        z: velocity.z - dot * collisionNormal.z
    };
}

// Get collision normal between two objects
function getCollisionNormal(obj1Pos, obj2Pos) {
    const dx = obj1Pos.x - obj2Pos.x;
    const dz = obj1Pos.z - obj2Pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist < 0.001) {
        return { x: 1, z: 0 }; // Default normal if objects are at same position
    }
    
    return {
        x: dx / dist,
        z: dz / dist
    };
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

// Check if object can move to new position with sliding support
function checkAllCollisions(movingObj, newX, newZ, velocity = 0, velocityVector = null) {
    const testPos = { x: newX, y: movingObj.position.y, z: newZ };
    let collisionHandled = false;
    
    // Use spatial grid for better performance with many objects
    const bounds = getObjectBounds(movingObj);
    const queryRadius = Math.max(bounds.width, bounds.depth) + 3; // Extra margin for nearby objects
    const nearbyObjects = spatialGrid.query(newX, newZ, queryRadius);
    
    // Check collision with nearby props
    for (let prop of nearbyObjects) {
        if (props.includes(prop) && checkObjectCollision(movingObj, testPos, prop)) {
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
    
    // Check collision with nearby actors
    for (let actor of nearbyObjects) {
        if (actors.includes(actor) && checkObjectCollision(movingObj, testPos, actor)) {
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

// Attempt to move with sliding along obstacles
function tryMoveWithSliding(obj, targetX, targetZ, velocity = 0) {
    const currentX = obj.position.x;
    const currentZ = obj.position.z;
    
    // Try direct movement first
    if (!checkAllCollisions(obj, targetX, targetZ, velocity)) {
        return { x: targetX, z: targetZ, moved: true };
    }
    
    // If direct movement blocked, try sliding along X axis
    if (!checkAllCollisions(obj, targetX, currentZ, velocity)) {
        return { x: targetX, z: currentZ, moved: true };
    }
    
    // Try sliding along Z axis
    if (!checkAllCollisions(obj, currentX, targetZ, velocity)) {
        return { x: currentX, z: targetZ, moved: true };
    }
    
    // No movement possible
    return { x: currentX, z: currentZ, moved: false };
}

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

// Debug visualization functions
function updateDebugVisualization() {
    // Clear existing debug helpers
    clearDebugVisualization();
    
    if (!debugVisualizationEnabled) {
        return;
    }
    
    // Create debug helpers for all props
    props.forEach(prop => {
        if (!prop.userData.hidden) {
            const helper = createCollisionDebugHelper(prop);
            if (helper) {
                scene.add(helper);
                debugVisualizationHelpers.push(helper);
            }
        }
    });
    
    // Create debug helpers for all actors
    actors.forEach(actor => {
        if (!actor.userData.hidden) {
            const helper = createCollisionDebugHelper(actor);
            if (helper) {
                scene.add(helper);
                debugVisualizationHelpers.push(helper);
            }
        }
    });
}

function createCollisionDebugHelper(obj) {
    const bounds = getObjectBounds(obj);
    const pos = obj.position;
    let geometry;
    
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.5
    });
    
    switch (bounds.shape) {
        case COLLISION_SHAPES.BOX:
            geometry = new THREE.BoxGeometry(bounds.width, bounds.height, bounds.depth);
            break;
        case COLLISION_SHAPES.SPHERE:
            const radius = Math.max(bounds.width, bounds.depth, bounds.height) / 2;
            geometry = new THREE.SphereGeometry(radius, 16, 16);
            break;
        case COLLISION_SHAPES.CAPSULE:
            // Approximate capsule with cylinder
            const capRadius = Math.max(bounds.width, bounds.depth) / 2;
            geometry = new THREE.CylinderGeometry(capRadius, capRadius, bounds.height, 16);
            break;
        default:
            geometry = new THREE.BoxGeometry(bounds.width, bounds.height, bounds.depth);
    }
    
    const helper = new THREE.Mesh(geometry, material);
    helper.position.copy(pos);
    helper.rotation.copy(obj.rotation);
    
    // Store reference to original object for updating
    helper.userData.trackedObject = obj;
    
    return helper;
}

function clearDebugVisualization() {
    debugVisualizationHelpers.forEach(helper => {
        scene.remove(helper);
        if (helper.geometry) helper.geometry.dispose();
        if (helper.material) helper.material.dispose();
    });
    debugVisualizationHelpers = [];
}

function toggleDebugVisualization() {
    debugVisualizationEnabled = !debugVisualizationEnabled;
    updateDebugVisualization();
    console.log('Debug visualization:', debugVisualizationEnabled ? 'ON' : 'OFF');
}

// Update spatial grid with all objects
function updateSpatialGrid() {
    spatialGrid.clear();
    
    props.forEach(prop => {
        if (!prop.userData.hidden) {
            spatialGrid.insert(prop);
        }
    });
    
    actors.forEach(actor => {
        if (!actor.userData.hidden) {
            spatialGrid.insert(actor);
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update spatial grid for efficient collision detection
    updateSpatialGrid();
    
    if (currentLightingPreset === 'default' || currentLightingPreset === 'dramatic') {
        lights.forEach((light, index) => {
            light.intensity = 0.8 + Math.sin(Date.now() * 0.001 + index) * 0.2;
        });
    }
    
    stageMarkers.forEach((marker, i) => {
        if (marker.visible) {
            marker.children[1].material.opacity = 0.3 + Math.sin(Date.now() * 0.003 + i) * 0.2;
        }
    });
    
    // Animate platforms
    moveablePlatforms.forEach(platform => {
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
    
    // Animate rotating stage
    if (rotatingStage && rotatingStage.userData.rotating && rotatingStage.visible) {
        rotatingStage.rotation.y += rotatingStage.userData.rotationSpeed;
    }
    
    // Animate scenery panels
    sceneryPanels.forEach(panel => {
        const userData = panel.userData;
        if (userData.moving) {
            let targetX;
            
            if (userData.isBackdrop) {
                // Backdrop slides from left (-30 to 0)
                // Positions: off=-30, 1/4=-18, 1/2=-10, 3/4=-5, full=0
                const positions = {
                    0: -30,
                    0.25: -18,
                    0.5: -10,
                    0.75: -5,
                    1: 0
                };
                targetX = positions[userData.targetPosition];
            } else {
                // Midstage slides from right (30 to 0)
                // Positions: off=30, 1/4=18, 1/2=10, 3/4=5, full=0
                const positions = {
                    0: 30,
                    0.25: 18,
                    0.5: 10,
                    0.75: 5,
                    1: 0
                };
                targetX = positions[userData.targetPosition];
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
    
    // Animate trap doors
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

    // Update prop relationships periodically
    if (Date.now() % 100 < 16) { // Every ~100ms
        updateAllPropRelationships();
    }

    // Apply physics to props and actors
    const allObjects = [...props, ...actors];
    allObjects.forEach(prop => {
        // Check if prop should be hidden by trap door first
        if (propTrapDoorRelations.has(prop)) {
            const trapDoor = propTrapDoorRelations.get(prop);
            if (trapDoor.userData.open && trapDoor.visible) {
                prop.visible = false;
                prop.userData.hidden = true;
                return; // Skip other physics if hidden
            }
        }
        
        // Restore hidden props if conditions change
        if (prop.userData.hidden) {
            const stillOverTrapDoor = propTrapDoorRelations.has(prop) && 
                                     propTrapDoorRelations.get(prop).userData.open;
            if (!stillOverTrapDoor) {
                prop.visible = true;
                prop.userData.hidden = false;
            } else {
                return; // Still hidden, skip other physics
            }
        }
        
        // Platform physics - elevation
        let baseY = prop.userData.originalY;
        if (propPlatformRelations.has(prop)) {
            const platform = propPlatformRelations.get(prop);
            // Platform is 0.5 units tall, positioned at y=0.25, so top is at 0.5
            baseY = platform.position.y + 0.25 + prop.userData.originalY;
        }
        
        // Apply elevation smoothly
        const yDiff = baseY - prop.position.y;
        if (Math.abs(yDiff) > 0.01) {
            prop.position.y += yDiff * 0.1;
        }
        
        // Apply velocity if object has momentum
        if (objectVelocities.has(prop)) {
            const vel = objectVelocities.get(prop);
            if (Math.abs(vel.x) > 0.001 || Math.abs(vel.z) > 0.001) {
                const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
                const newX = prop.position.x + vel.x;
                const newZ = prop.position.z + vel.z;
                
                if (!checkAllCollisions(prop, newX, newZ, speed)) {
                    prop.position.x = newX;
                    prop.position.z = newZ;
                    
                    // Apply friction to slow down
                    const friction = getObjectFriction(prop);
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
        
        // Rotating stage physics - rotation (works even on platforms)
        if (propRotatingStageRelations.has(prop) && 
            rotatingStage.userData.rotating && 
            rotatingStage.visible) {
            const stageCenter = rotatingStage.position;
            const angle = rotatingStage.userData.rotationSpeed;
            
            // Calculate new position after rotation
            const dx = prop.position.x - stageCenter.x;
            const dz = prop.position.z - stageCenter.z;
            const radius = Math.sqrt(dx*dx + dz*dz);
            
            const newX = stageCenter.x + (dx * Math.cos(angle) - dz * Math.sin(angle));
            const newZ = stageCenter.z + (dx * Math.sin(angle) + dz * Math.cos(angle));
            
            // Calculate velocity from rotation
            const rotationalVelocity = radius * angle;
            
            // Check for collision with all objects before moving
            if (!checkAllCollisions(prop, newX, newZ, rotationalVelocity)) {
                prop.position.x = newX;
                prop.position.z = newZ;
                
                // Also rotate the prop itself
                prop.rotation.y += angle;
            } else {
                // Stop rotating stage if collision detected
                rotatingStage.userData.rotating = false;
                console.log('Rotation stopped due to collision');
            }
        }
    });
    
    // Update debug visualization helpers to follow objects
    if (debugVisualizationEnabled) {
        debugVisualizationHelpers.forEach(helper => {
            const trackedObj = helper.userData.trackedObject;
            if (trackedObj) {
                helper.position.copy(trackedObj.position);
                helper.rotation.copy(trackedObj.rotation);
            }
        });
    }
    
    if (controls) {
        controls.update();
    }
    
    // Update sound system listener position with camera
    if (soundSystem && soundSystem.initialized) {
        soundSystem.updateListenerPosition(camera.position);
        
        // Update audio cues based on current time
        const currentTime = Date.now() / 1000; // Convert to seconds
        soundSystem.updateAudioCues(currentTime);
    }
    
    renderer.render(scene, camera);
}

// Save/Load functions
function saveScene() {
    const sceneName = prompt('Enter a name for this scene:', 'My Scene');
    if (!sceneName) return;
    
    const sceneDescription = prompt('Enter a description (optional):', '');
    
    // Export the scene
    const sceneJson = sceneSerializer.exportScene(sceneName, sceneDescription);
    
    // Create a download link
    const blob = new Blob([sceneJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sceneName.replace(/\s+/g, '_')}_scene.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Scene saved successfully!');
}

function loadScene() {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = sceneSerializer.importScene(e.target.result);
                if (result.success) {
                    console.log(`Scene loaded: ${result.name}`);
                    if (result.description) {
                        console.log(`Description: ${result.description}`);
                    }
                    alert(`Scene "${result.name}" loaded successfully!`);
                } else {
                    alert(`Failed to load scene: ${result.error}`);
                }
            } catch (error) {
                alert(`Error loading scene: ${error.message}`);
                console.error('Load error:', error);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

init();
animate();