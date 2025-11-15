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

// Performance optimization variables
let benchmarkMode = false;
let performanceStats = {
    fps: 0,
    frameTime: 0,
    visibleObjects: 0,
    totalObjects: 0,
    drawCalls: 0,
    triangles: 0
};
let lastFrameTime = performance.now();
let frameCount = 0;
let fpsUpdateTime = 0;

// Object pooling
let propPool = new Map(); // type -> array of unused meshes
let maxPoolSize = 50;

// Physics sleep states
let sleepingObjects = new Set(); // objects that are static and don't need physics updates
let sleepThreshold = 0.01; // velocity threshold for sleep
let sleepTimer = new Map(); // object -> frames since last movement

// LOD system
let lodEnabled = true;
let lodDistances = {
    high: 15,
    medium: 30,
    low: 50
};

// Shared materials for texture atlasing
let sharedMaterials = new Map();

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
    
    // Enable frustum culling
    renderer.sortObjects = true;

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
    initializeSharedMaterials();
    initializeObjectPool();

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('click', onStageClick, false);
    window.addEventListener('mousemove', onMouseMove, false);
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
    
    // Raycaster to find where clicked on stage
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Check intersection with stage
    const intersects = raycaster.intersectObject(stage);
    if (intersects.length > 0) {
        const point = intersects[0].point;
        
        if (placementMode === 'prop') {
            addPropAt(point.x, point.z);
        } else if (placementMode === 'actor') {
            addActorAt(point.x, point.z);
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

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupUI() {
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
    `;

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
    rotateButton.textContent = 'Rotate Stage';
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
    
    // Performance controls section
    const perfLabel = document.createElement('div');
    perfLabel.innerHTML = '<strong>Performance</strong>';
    perfLabel.style.cssText = 'margin-top: 10px; margin-bottom: 5px;';
    uiContainer.appendChild(perfLabel);
    
    const benchmarkButton = document.createElement('button');
    benchmarkButton.textContent = 'Toggle Benchmark';
    benchmarkButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    benchmarkButton.addEventListener('click', toggleBenchmarkMode);
    uiContainer.appendChild(benchmarkButton);
    uiContainer.appendChild(document.createElement('br'));
    
    const lodButton = document.createElement('button');
    lodButton.textContent = 'Toggle LOD';
    lodButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer;';
    lodButton.addEventListener('click', toggleLOD);
    uiContainer.appendChild(lodButton);
    uiContainer.appendChild(document.createElement('br'));
    
    const testSceneButton = document.createElement('button');
    testSceneButton.textContent = 'Create Test Scene (60 objects)';
    testSceneButton.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer; background: #228B22; color: white;';
    testSceneButton.addEventListener('click', createLargeTestScene);
    uiContainer.appendChild(testSceneButton);

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
    
    // Try to get prop from pool first
    let propObject = getPooledProp(selectedPropType);
    
    if (propObject) {
        // Reuse pooled object
        propObject.position.set(x, propDef.y, z);
        propObject.visible = true;
        propObject.userData.hidden = false;
        scene.add(propObject);
    } else {
        // Create new prop
        const result = propDef.create();
        
        if (result instanceof THREE.Group) {
            propObject = result;
        } else {
            // Single geometry - wrap in mesh with shared material
            const color = propDef.color || 0x808080;
            const material = getSharedMaterial(color);
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
            velocity: { x: 0, y: 0, z: 0 }
        };
        
        scene.add(propObject);
    }
    
    props.push(propObject);
    
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
    
    scene.add(actorGroup);
    actors.push(actorGroup);
    
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

function checkPropSceneryCollision(prop, newX, newZ) {
    // Check collision with each scenery panel
    for (let panel of sceneryPanels) {
        if (panel.userData.currentPosition > 0) { // Panel is on stage
            const panelX = panel.position.x;
            const panelZ = panel.position.z;
            const bounds = panel.userData.panelBounds;
            
            // Check if prop would collide with panel
            const propRadius = 0.5; // Approximate prop radius
            if (Math.abs(newZ - panelZ) < propRadius && 
                newX + propRadius > panelX + bounds.minX && 
                newX - propRadius < panelX + bounds.maxX) {
                
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

// ============ Performance Optimization Functions ============

function initializeSharedMaterials() {
    // Create shared materials for common colors/properties to reduce draw calls
    const commonColors = [
        0x808080, 0x8B4513, 0x654321, 0xD2691E, 
        0x444444, 0x228B22, 0xFFFFE0, 0x4169e1, 0xffdbac
    ];
    
    commonColors.forEach(color => {
        if (!sharedMaterials.has(color)) {
            sharedMaterials.set(color, new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 30
            }));
        }
    });
}

function getSharedMaterial(color) {
    if (!sharedMaterials.has(color)) {
        sharedMaterials.set(color, new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 30
        }));
    }
    return sharedMaterials.get(color);
}

function initializeObjectPool() {
    // Initialize pools for common prop types
    Object.keys(PROP_CATALOG).forEach(propType => {
        propPool.set(propType, []);
    });
}

function getPooledProp(propType) {
    const pool = propPool.get(propType);
    if (pool && pool.length > 0) {
        return pool.pop();
    }
    return null;
}

function returnPropToPool(prop) {
    const propType = prop.userData.propType;
    const pool = propPool.get(propType);
    
    if (pool && pool.length < maxPoolSize) {
        // Reset prop state
        prop.visible = false;
        prop.position.set(0, -100, 0); // Move out of view
        prop.userData.hidden = true;
        scene.remove(prop);
        pool.push(prop);
        return true;
    }
    return false;
}

function updateLOD(object) {
    if (!lodEnabled || !camera) return;
    
    const distance = camera.position.distanceTo(object.position);
    
    // Adjust detail level based on distance
    if (distance > lodDistances.low) {
        // Far: minimal detail
        object.visible = false;
    } else if (distance > lodDistances.medium) {
        // Medium: reduce shadows and detail
        object.visible = true;
        object.castShadow = false;
        object.receiveShadow = false;
    } else if (distance > lodDistances.high) {
        // Close: enable shadows but simplified
        object.visible = true;
        object.castShadow = true;
        object.receiveShadow = false;
    } else {
        // Very close: full detail
        object.visible = true;
        object.castShadow = true;
        object.receiveShadow = true;
    }
}

function updatePhysicsSleep(object) {
    // Check if object has moved recently
    const velocity = object.userData.velocity || { x: 0, y: 0, z: 0 };
    const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    
    if (speed < sleepThreshold) {
        // Object is nearly still
        if (!sleepTimer.has(object)) {
            sleepTimer.set(object, 0);
        }
        
        const frames = sleepTimer.get(object) + 1;
        sleepTimer.set(object, frames);
        
        // Put to sleep after 60 frames (~1 second) of no movement
        if (frames > 60) {
            sleepingObjects.add(object);
        }
    } else {
        // Object is moving, wake it up
        sleepTimer.delete(object);
        sleepingObjects.delete(object);
    }
    
    // Update velocity for next frame (simplified)
    if (object.userData.lastPosition) {
        object.userData.velocity = {
            x: object.position.x - object.userData.lastPosition.x,
            y: object.position.y - object.userData.lastPosition.y,
            z: object.position.z - object.userData.lastPosition.z
        };
    }
    object.userData.lastPosition = object.position.clone();
}

function wakeObject(object) {
    sleepingObjects.delete(object);
    sleepTimer.delete(object);
}

function updatePerformanceStats() {
    const now = performance.now();
    frameCount++;
    
    // Update FPS every second
    if (now - fpsUpdateTime >= 1000) {
        performanceStats.fps = Math.round(frameCount * 1000 / (now - fpsUpdateTime));
        frameCount = 0;
        fpsUpdateTime = now;
    }
    
    // Frame time
    performanceStats.frameTime = (now - lastFrameTime).toFixed(2);
    lastFrameTime = now;
    
    // Object counts
    performanceStats.totalObjects = props.length + actors.length;
    performanceStats.visibleObjects = props.filter(p => p.visible).length + 
                                       actors.filter(a => a.visible).length;
    
    // Render info (approximation)
    performanceStats.drawCalls = scene.children.length;
    
    // Update benchmark display
    if (benchmarkMode) {
        updateBenchmarkDisplay();
    }
}

function updateBenchmarkDisplay() {
    const displayDiv = document.getElementById('benchmark-display');
    if (displayDiv) {
        displayDiv.innerHTML = `
            <strong>Performance Stats</strong><br>
            FPS: ${performanceStats.fps}<br>
            Frame Time: ${performanceStats.frameTime}ms<br>
            Visible Objects: ${performanceStats.visibleObjects}/${performanceStats.totalObjects}<br>
            Sleeping Objects: ${sleepingObjects.size}<br>
            Draw Calls: ~${performanceStats.drawCalls}
        `;
    }
}

function toggleBenchmarkMode() {
    benchmarkMode = !benchmarkMode;
    
    let displayDiv = document.getElementById('benchmark-display');
    
    if (benchmarkMode) {
        if (!displayDiv) {
            displayDiv = document.createElement('div');
            displayDiv.id = 'benchmark-display';
            displayDiv.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0,0,0,0.8);
                color: #0f0;
                padding: 15px;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                min-width: 200px;
                z-index: 1000;
            `;
            document.body.appendChild(displayDiv);
        }
        displayDiv.style.display = 'block';
        fpsUpdateTime = performance.now();
        frameCount = 0;
    } else if (displayDiv) {
        displayDiv.style.display = 'none';
    }
}

function toggleLOD() {
    lodEnabled = !lodEnabled;
    
    // If disabling LOD, make all objects visible with full detail
    if (!lodEnabled) {
        const allObjects = [...props, ...actors];
        allObjects.forEach(obj => {
            obj.visible = !obj.userData.hidden;
            obj.castShadow = true;
            obj.receiveShadow = true;
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    
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
        // Skip sleeping objects for performance
        if (sleepingObjects.has(prop)) {
            return;
        }
        
        // Apply LOD based on camera distance
        if (lodEnabled) {
            updateLOD(prop);
        }
        
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
            wakeObject(prop); // Wake object when on moving platform
        }
        
        // Apply elevation smoothly
        const yDiff = baseY - prop.position.y;
        if (Math.abs(yDiff) > 0.01) {
            prop.position.y += yDiff * 0.1;
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
            
            const newX = stageCenter.x + (dx * Math.cos(angle) - dz * Math.sin(angle));
            const newZ = stageCenter.z + (dx * Math.sin(angle) + dz * Math.cos(angle));
            
            // Check for collision with scenery before moving
            if (!checkPropSceneryCollision(prop, newX, newZ)) {
                prop.position.x = newX;
                prop.position.z = newZ;
                
                // Also rotate the prop itself
                prop.rotation.y += angle;
                wakeObject(prop); // Wake object when rotating
            } else {
                // Stop rotating stage if collision detected
                rotatingStage.userData.rotating = false;
            }
        }
        
        // Update physics sleep state
        updatePhysicsSleep(prop);
    });
    
    // Update performance stats
    updatePerformanceStats();
    
    if (controls) {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

// Test function to create a large scene with many objects
function createLargeTestScene() {
    console.log('Creating large test scene with 50+ objects...');
    
    const propTypes = Object.keys(PROP_CATALOG);
    let objectCount = 0;
    
    // Create objects in a grid pattern on the stage
    for (let x = -8; x <= 8; x += 2) {
        for (let z = -5; z <= 5; z += 2) {
            if (objectCount >= 60) break;
            
            // Alternate between props and actors
            if (objectCount % 3 === 0) {
                addActorAt(x, z);
            } else {
                selectedPropType = propTypes[objectCount % propTypes.length];
                addPropAt(x, z);
            }
            objectCount++;
        }
        if (objectCount >= 60) break;
    }
    
    console.log(`Created ${objectCount} objects for performance testing`);
    console.log('Press "Toggle Benchmark" button to see performance stats');
}

// Expose test function to window for manual testing
window.createLargeTestScene = createLargeTestScene;

init();
animate();