// Stage Geometry Module - Stage elements, platforms, curtains, scenery, trap doors

import { scene } from './stage-core.js';

export let stage;
export let curtainLeft, curtainRight, curtainTop;
export let curtainState = 'closed';
export let stageMarkers = [];
export let moveablePlatforms = [];
export let rotatingStage = null;
export let trapDoors = [];
export let sceneryPanels = [];

export function createStage() {
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

export function createStageMarkers() {
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

export function createMoveablePlatforms() {
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

export function createRotatingStage() {
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

export function createTrapDoors() {
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

export function createSceneryPanels() {
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

export function updateCurtainPositions() {
    if (curtainState === 'open') {
        curtainLeft.position.x = -10;
        curtainRight.position.x = 10;
    } else {
        curtainLeft.position.x = -2;
        curtainRight.position.x = 2;
    }
}

export function moveSceneryPanel(index, position) {
    if (index < sceneryPanels.length) {
        const panel = sceneryPanels[index];
        panel.userData.targetPosition = position;
        panel.userData.moving = true;
    }
}
