/**
 * StageBuilder.js - Physical Stage Construction Module for 3D Theater Stage
 * 
 * Handles the creation of all physical stage elements including:
 * - Main stage platform, floor, and walls
 * - Lighting system (spots, footlights, ambient)
 * - Stage markers for positioning reference
 * - Moveable platforms with elevation controls
 * - Rotating center stage
 * - Trap doors with animation
 * - Scenery panels (backdrop and midstage)
 * - Curtain system with realistic pleats and animations
 */

class ThreeStageBuilder {
    constructor() {
        this.isInitialized = false;
        
        // Stage configuration
        this.stageConfig = {
            dimensions: {
                width: 20,
                height: 1,
                depth: 15
            },
            floor: {
                size: 100,
                color: 0x202020
            },
            walls: {
                backWall: {
                    width: 20,
                    height: 15,
                    color: 0x1a1a2e
                }
            },
            curtains: {
                material: {
                    color: 0x660000,
                    shininess: 30
                },
                dimensions: {
                    width: 18,
                    height: 25
                }
            }
        };
        
        // Lighting presets
        this.lightingPresets = {
            normal: {
                ambient: { color: 0x404040, intensity: 0.5 },
                spots: [
                    { color: 0xffffff, intensity: 1, position: [-10, 15, 10], target: [-5, 0, 0] },
                    { color: 0xffffff, intensity: 1, position: [10, 15, 10], target: [5, 0, 0] },
                    { color: 0xffd700, intensity: 0.8, position: [0, 15, 10], target: [0, 0, 0] }
                ],
                footLights: [
                    { color: 0x4169e1, intensity: 0.5, position: [-8, 0.5, 7] },
                    { color: 0x4169e1, intensity: 0.5, position: [0, 0.5, 7] },
                    { color: 0x4169e1, intensity: 0.5, position: [8, 0.5, 7] }
                ]
            }
        };
        
        // Stage markers configuration
        this.stageMarkers = [
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
        
        // Platform configurations
        this.platformConfigs = [
            { x: -9, z: -6.5, width: 2, depth: 1.5 },  // Far back left
            { x: 9, z: -6.5, width: 2, depth: 1.5 },   // Far back right
            { x: -8, z: 5, width: 3, depth: 2 },       // Front left
            { x: 8, z: 5, width: 3, depth: 2 }         // Front right
        ];
        
        // Trap door positions
        this.trapDoorPositions = [
            { x: -7, z: 0 },   // Left side middle
            { x: 7, z: 0 },    // Right side middle
            { x: 0, z: 6 },    // Front center
            { x: 0, z: -6 }    // Back center
        ];
        
        // Scenery panel configurations
        this.sceneryPanelConfigs = [
            { 
                name: 'backdrop',
                width: 24,
                height: 15,
                defaultZ: -7.3,
                hasPassthrough: false,
                color: 0x4169e1
            },
            { 
                name: 'midstage',
                width: 20,
                height: 15,
                defaultZ: 0,
                hasPassthrough: true,
                passthroughWidth: 6,
                passthroughHeight: 8,
                passthroughY: 2,
                color: 0x228b22
            }
        ];
    }

    /**
     * Initialize all stage elements
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('StageBuilder already initialized');
            return;
        }

        console.log('StageBuilder: Building theater stage...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Build all stage elements
            this.createMainStage();
            this.createLighting();
            this.createStageMarkers();
            this.createMoveablePlatforms();
            this.createRotatingStage();
            this.createTrapDoors();
            this.createSceneryPanels();
            
            this.isInitialized = true;
            console.log('StageBuilder: Stage construction complete');
            
        } catch (error) {
            console.error('StageBuilder: Construction failed:', error);
            throw error;
        }
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (typeof THREE === 'undefined') {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.stageState?.core?.scene) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.resourceManager) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('StageBuilder dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create main stage platform, floor, and walls
     */
    createMainStage() {
        const scene = window.stageState.core.scene;
        const resourceManager = window.resourceManager;
        
        // Main stage platform
        const stageGeometry = resourceManager.getGeometry('box', {
            width: this.stageConfig.dimensions.width,
            height: this.stageConfig.dimensions.height,
            depth: this.stageConfig.dimensions.depth
        });
        const stageMaterial = resourceManager.getMaterial('phong', { 
            color: 0x8B4513,
            shininess: 30
        });
        const stage = new THREE.Mesh(stageGeometry, stageMaterial);
        stage.position.y = -0.5;
        stage.receiveShadow = true;
        scene.add(stage);
        
        // Store in state
        window.stageState.stage.stage = stage;

        // Theater floor
        const floorGeometry = resourceManager.getGeometry('plane', {
            width: this.stageConfig.floor.size,
            height: this.stageConfig.floor.size
        });
        const floorMaterial = resourceManager.getMaterial('phong', { 
            color: this.stageConfig.floor.color,
            side: THREE.DoubleSide
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        floor.receiveShadow = true;
        scene.add(floor);

        // Back wall
        const backWallGeometry = resourceManager.getGeometry('plane', {
            width: this.stageConfig.walls.backWall.width,
            height: this.stageConfig.walls.backWall.height
        });
        const backWallMaterial = resourceManager.getMaterial('phong', { 
            color: this.stageConfig.walls.backWall.color,
            side: THREE.DoubleSide
        });
        const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
        backWall.position.z = -7.5;
        backWall.position.y = 6.5;
        backWall.receiveShadow = true;
        scene.add(backWall);

        // Create curtain system
        this.createCurtainSystem();
        
        console.log('StageBuilder: Main stage, floor, and walls created');
    }

    /**
     * Create elaborate curtain system with pleats and animations
     */
    createCurtainSystem() {
        const scene = window.stageState.core.scene;
        const resourceManager = window.resourceManager;
        
        const curtainGroup = new THREE.Group();
        
        // Curtain material with rich theater red and velvet-like appearance
        const curtainMaterial = resourceManager.getMaterial('phong', { 
            color: this.stageConfig.curtains.material.color,
            side: THREE.DoubleSide,
            shininess: this.stageConfig.curtains.material.shininess
        });
        
        // Create curtain side with pleats
        const createCurtainSide = (isLeft) => {
            const curtainSide = new THREE.Group();
            
            // Main curtain panel
            const mainGeometry = resourceManager.getGeometry('plane', {
                width: this.stageConfig.curtains.dimensions.width,
                height: this.stageConfig.curtains.dimensions.height
            });
            const main = new THREE.Mesh(mainGeometry, curtainMaterial);
            main.position.z = 0;
            curtainSide.add(main);
            
            // Add depth with secondary panel
            const depthGeometry = resourceManager.getGeometry('plane', {
                width: this.stageConfig.curtains.dimensions.width,
                height: this.stageConfig.curtains.dimensions.height
            });
            const depth = new THREE.Mesh(depthGeometry, curtainMaterial);
            depth.position.z = -0.5;
            curtainSide.add(depth);
            
            // Add vertical pleats for realism
            for (let i = 0; i < 6; i++) {
                const pleatGeometry = resourceManager.getGeometry('plane', {
                    width: 0.5,
                    height: this.stageConfig.curtains.dimensions.height
                });
                const pleat = new THREE.Mesh(pleatGeometry, curtainMaterial);
                pleat.position.x = -8 + i * 3;
                pleat.position.z = Math.sin(i * 0.5) * 0.3;
                pleat.rotation.y = Math.PI / 8;
                curtainSide.add(pleat);
            }
            
            return curtainSide;
        };
        
        // Left curtain (opens to left) - start closed
        const curtainLeft = createCurtainSide(true);
        curtainLeft.position.set(-2, 12, 8);
        curtainGroup.add(curtainLeft);
        
        // Right curtain (opens to right) - start closed
        const curtainRight = createCurtainSide(false);
        curtainRight.position.set(2, 12, 8);
        curtainGroup.add(curtainRight);

        // Valance (top decorative curtain with scalloped edge)
        const valanceGroup = new THREE.Group();
        const valanceGeometry = resourceManager.getGeometry('plane', {
            width: 40,
            height: 8
        });
        const valance = new THREE.Mesh(valanceGeometry, curtainMaterial);
        valance.position.y = 0;
        valanceGroup.add(valance);
        
        // Add decorative fringe
        for (let i = 0; i < 20; i++) {
            const fringeGeometry = resourceManager.getGeometry('cylinder', {
                radiusTop: 0.1,
                radiusBottom: 0.2,
                height: 1,
                radialSegments: 8
            });
            const fringe = new THREE.Mesh(fringeGeometry, curtainMaterial);
            fringe.position.x = -19 + i * 2;
            fringe.position.y = -4;
            valanceGroup.add(fringe);
        }
        
        const curtainTop = valanceGroup;
        curtainTop.position.set(0, 20, 8);
        curtainGroup.add(curtainTop);
        
        scene.add(curtainGroup);
        
        // Store curtain references in state
        window.stageState.stage.curtains.left = curtainLeft;
        window.stageState.stage.curtains.right = curtainRight;
        window.stageState.stage.curtains.top = curtainTop;
        
        console.log('StageBuilder: Curtain system created');
    }

    /**
     * Create comprehensive lighting system
     */
    createLighting() {
        const scene = window.stageState.core.scene;
        const lights = window.stageState.stage.lights;
        const preset = this.lightingPresets.normal;
        
        // Ambient lighting
        const ambientLight = new THREE.AmbientLight(
            preset.ambient.color, 
            preset.ambient.intensity
        );
        scene.add(ambientLight);

        // Create spotlight system
        preset.spots.forEach((spotConfig, index) => {
            const spotLight = new THREE.SpotLight(spotConfig.color, spotConfig.intensity);
            spotLight.position.set(...spotConfig.position);
            spotLight.target.position.set(...spotConfig.target);
            spotLight.angle = Math.PI / 6;
            spotLight.penumbra = 0.3;
            spotLight.castShadow = true;
            spotLight.shadow.mapSize.width = 1024;
            spotLight.shadow.mapSize.height = 1024;
            
            scene.add(spotLight);
            scene.add(spotLight.target);
            lights.push(spotLight);
        });

        // Create foot lighting system
        preset.footLights.forEach((footConfig, index) => {
            const footLight = new THREE.PointLight(
                footConfig.color, 
                footConfig.intensity, 
                10
            );
            footLight.position.set(...footConfig.position);
            scene.add(footLight);
        });
        
        console.log('StageBuilder: Lighting system created');
    }

    /**
     * Create stage position markers
     */
    createStageMarkers() {
        const scene = window.stageState.core.scene;
        const stageMarkers = window.stageState.stage.stageMarkers;
        const resourceManager = window.resourceManager;

        this.stageMarkers.forEach(pos => {
            const markerGroup = new THREE.Group();
            
            // Main marker
            const markerGeometry = resourceManager.getGeometry('cylinder', {
                radiusTop: 0.3,
                radiusBottom: 0.3,
                height: 0.1,
                radialSegments: 16
            });
            const markerMaterial = resourceManager.getMaterial('phong', { 
                color: 0x00ff00,
                emissive: 0x00ff00,
                emissiveIntensity: 0.3
            });
            const marker = new THREE.Mesh(markerGeometry, markerMaterial);
            marker.position.set(0, 0.05, 0);
            markerGroup.add(marker);
            
            // Glow effect
            const glowGeometry = new THREE.RingGeometry(0.3, 0.5, 16);
            const glowMaterial = resourceManager.getMaterial('basic', { 
                color: 0x00ff00,
                transparent: true,
                opacity: 0.5
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
        
        console.log('StageBuilder: Stage markers created');
    }

    /**
     * Create moveable platforms with elevation controls
     */
    createMoveablePlatforms() {
        const scene = window.stageState.core.scene;
        const platforms = window.stageState.stage.moveablePlatforms;
        const resourceManager = window.resourceManager;

        this.platformConfigs.forEach((pos, index) => {
            const platformGroup = new THREE.Group();
            
            const geometry = resourceManager.getGeometry('box', {
                width: pos.width,
                height: 0.5,
                depth: pos.depth
            });
            const material = resourceManager.getMaterial('phong', { 
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
            platforms.push(platformGroup);
        });
        
        console.log('StageBuilder: Moveable platforms created');
    }

    /**
     * Create rotating center stage
     */
    createRotatingStage() {
        const scene = window.stageState.core.scene;
        const resourceManager = window.resourceManager;
        
        const rotatingGroup = new THREE.Group();
        
        // Main rotating platform
        const geometry = resourceManager.getGeometry('cylinder', {
            radiusTop: 5,
            radiusBottom: 5,
            height: 1,
            radialSegments: 32
        });
        const material = resourceManager.getMaterial('phong', { 
            color: 0x8B4513,
            shininess: 30
        });
        const centerStage = new THREE.Mesh(geometry, material);
        centerStage.position.y = -0.5;
        centerStage.castShadow = true;
        centerStage.receiveShadow = true;
        rotatingGroup.add(centerStage);
        
        // Stage marking line
        const lineGeometry = new THREE.RingGeometry(4.8, 5, 32);
        const lineMaterial = resourceManager.getMaterial('basic', { 
            color: 0x000000
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
        window.stageState.stage.rotatingStage = rotatingGroup;
        
        console.log('StageBuilder: Rotating stage created');
    }

    /**
     * Create trap doors with animation capability
     */
    createTrapDoors() {
        const scene = window.stageState.core.scene;
        const trapDoors = window.stageState.stage.trapDoors;
        const resourceManager = window.resourceManager;

        this.trapDoorPositions.forEach((pos, index) => {
            const trapDoorGroup = new THREE.Group();
            
            // Door panel
            const geometry = resourceManager.getGeometry('box', {
                width: 2,
                height: 0.1,
                depth: 2
            });
            const material = resourceManager.getMaterial('phong', { 
                color: 0x654321,
                shininess: 30
            });
            const door = new THREE.Mesh(geometry, material);
            door.castShadow = true;
            door.receiveShadow = true;
            trapDoorGroup.add(door);
            
            // Door frame
            const frameGeometry = resourceManager.getGeometry('box', {
                width: 2.2,
                height: 0.05,
                depth: 2.2
            });
            const frameMaterial = resourceManager.getMaterial('phong', { 
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
        
        console.log('StageBuilder: Trap doors created');
    }

    /**
     * Create scenery panels (backdrop and midstage)
     */
    createSceneryPanels() {
        const scene = window.stageState.core.scene;
        const sceneryPanels = window.stageState.stage.sceneryPanels;
        const resourceManager = window.resourceManager;

        this.sceneryPanelConfigs.forEach((data, index) => {
            const panelGroup = new THREE.Group();
            
            if (data.hasPassthrough) {
                // Create panel with passthrough opening
                this.createPanelWithPassthrough(panelGroup, data, resourceManager);
            } else {
                // Create solid panel
                this.createSolidPanel(panelGroup, data, resourceManager);
            }
            
            // Position panel based on type - start at hidden positions
            const startX = data.name === 'backdrop' ? -25 : 25;
            panelGroup.position.set(startX, data.height / 2, data.defaultZ);
            panelGroup.userData = {
                type: 'sceneryPanel',
                name: data.name,
                isBackdrop: data.name === 'backdrop',
                currentPosition: 0,
                targetPosition: 0,
                moving: false,
                hasPassthrough: data.hasPassthrough || false
            };
            
            scene.add(panelGroup);
            sceneryPanels.push(panelGroup);
        });
        
        console.log('StageBuilder: Scenery panels created');
    }

    /**
     * Create solid scenery panel
     */
    createSolidPanel(panelGroup, data, resourceManager) {
        const geometry = resourceManager.getGeometry('plane', {
            width: data.width,
            height: data.height
        });
        const material = resourceManager.getMaterial('phong', {
            color: data.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const panel = new THREE.Mesh(geometry, material);
        panel.userData = { isMainPanel: true };
        panelGroup.add(panel);
    }

    /**
     * Create scenery panel with passthrough opening
     */
    createPanelWithPassthrough(panelGroup, data, resourceManager) {
        // Create the panel using Shape geometry for the cutout
        const shape = new THREE.Shape();
        
        // Outer rectangle
        shape.moveTo(-data.width/2, -data.height/2);
        shape.lineTo(data.width/2, -data.height/2);
        shape.lineTo(data.width/2, data.height/2);
        shape.lineTo(-data.width/2, data.height/2);
        shape.lineTo(-data.width/2, -data.height/2);
        
        // Inner rectangle (hole)
        const hole = new THREE.Path();
        const holeX = data.passthroughWidth / 2;
        const holeY = data.passthroughHeight / 2;
        const holeYOffset = data.passthroughY - data.height/2;
        
        hole.moveTo(-holeX, holeYOffset - holeY);
        hole.lineTo(holeX, holeYOffset - holeY);
        hole.lineTo(holeX, holeYOffset + holeY);
        hole.lineTo(-holeX, holeYOffset + holeY);
        hole.lineTo(-holeX, holeYOffset - holeY);
        
        shape.holes.push(hole);
        
        const geometry = new THREE.ShapeGeometry(shape);
        const material = resourceManager.getMaterial('phong', {
            color: data.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const panel = new THREE.Mesh(geometry, material);
        panel.userData = { isMainPanel: true };
        panelGroup.add(panel);
    }

    /**
     * Update curtain positions for open/close animation
     */
    updateCurtainPositions() {
        const curtainState = window.stageState.stage.curtains.state;
        const curtainLeft = window.stageState.stage.curtains.left;
        const curtainRight = window.stageState.stage.curtains.right;
        const curtainTop = window.stageState.stage.curtains.top;
        
        if (!curtainLeft || !curtainRight || !curtainTop) return;
        
        // Set target positions based on state
        let leftTarget, rightTarget, topTarget;
        
        if (curtainState === 'open') {
            // Pull curtains to the sides and raise front curtain
            leftTarget = -25;
            rightTarget = 25;
            topTarget = 25; // Raise the front curtain
        } else {
            // Close curtains and lower front curtain
            leftTarget = -2;
            rightTarget = 2;
            topTarget = 20; // Lower the front curtain
        }
        
        // Store target positions for animation
        curtainLeft.userData = curtainLeft.userData || {};
        curtainRight.userData = curtainRight.userData || {};
        curtainTop.userData = curtainTop.userData || {};
        
        curtainLeft.userData.targetX = leftTarget;
        curtainRight.userData.targetX = rightTarget;
        curtainTop.userData.targetY = topTarget;
        
        curtainLeft.userData.animating = true;
        curtainRight.userData.animating = true;
        curtainTop.userData.animating = true;
    }

    /**
     * Toggle curtain state
     */
    toggleCurtains() {
        const currentState = window.stageState.stage.curtains.state;
        const newState = currentState === 'closed' ? 'open' : 'closed';
        window.stageState.stage.curtains.state = newState;
        this.updateCurtainPositions();
        console.log(`Curtains ${newState}`);
    }

    /**
     * Apply lighting preset
     */
    applyLightingPreset(preset) {
        const scene = window.stageState.core.scene;
        const lights = window.stageState.stage.lights;
        
        if (!scene || !lights) return;
        
        // Update state
        window.stageState.ui.currentLightingPreset = preset;
        
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
        
        console.log(`Applied lighting preset: ${preset}`);
    }

    /**
     * Get stage statistics
     */
    getStageStats() {
        return {
            isInitialized: this.isInitialized,
            elements: {
                lights: window.stageState.stage.lights.length,
                stageMarkers: window.stageState.stage.stageMarkers.length,
                moveablePlatforms: window.stageState.stage.moveablePlatforms.length,
                trapDoors: window.stageState.stage.trapDoors.length,
                sceneryPanels: window.stageState.stage.sceneryPanels.length
            },
            curtainState: window.stageState.stage.curtains.state,
            rotatingStage: {
                visible: window.stageState.stage.rotatingStage?.visible || false,
                rotating: window.stageState.stage.rotatingStage?.userData?.rotating || false
            }
        };
    }

    /**
     * Clean up all stage elements
     */
    dispose() {
        console.log('StageBuilder: Disposing stage elements');
        
        // This would be handled by the ResourceManager in the main application
        // The stage elements are part of the scene and will be cleaned up there
        
        this.isInitialized = false;
        console.log('StageBuilder: Disposed');
    }
}

// Create global instance
const threeStageBuilder = new ThreeStageBuilder();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.threeStageBuilder = threeStageBuilder;
    console.log('StageBuilder loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { threeStageBuilder, ThreeStageBuilder };
}