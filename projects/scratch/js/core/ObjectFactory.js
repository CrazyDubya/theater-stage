/**
 * ObjectFactory.js - Prop and Actor Creation System for 3D Theater Stage
 * 
 * Handles the creation and management of all interactive objects:
 * - Comprehensive prop catalog (furniture, stage elements, decorative items)
 * - Detailed actor system with different types and characteristics
 * - Collision-aware placement system with automatic positioning
 * - Resource management integration for geometry/material reuse
 * - ID generation and userData management
 * - Relationship tracking for physics interactions
 */

class ThreeObjectFactory {
    constructor() {
        this.isInitialized = false;
        
        // Prop catalog with detailed creation functions
        this.propCatalog = {
            // Basic shapes
            cube: {
                name: 'Cube',
                category: 'basic',
                create: () => this.resourceManager.getGeometry('box', { width: 1, height: 1, depth: 1 }),
                color: 0x808080,
                y: 0.5
            },
            sphere: {
                name: 'Sphere',
                category: 'basic',
                create: () => this.resourceManager.getGeometry('sphere', { radius: 0.5, widthSegments: 16, heightSegments: 16 }),
                color: 0x808080,
                y: 0.5
            },
            cylinder: {
                name: 'Cylinder',
                category: 'basic',
                create: () => this.resourceManager.getGeometry('cylinder', { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 16 }),
                color: 0x808080,
                y: 0.5
            },
            
            // Modern furniture
            modernChair: {
                name: 'Modern Chair',
                category: 'furniture',
                create: () => this.createModernChair(),
                y: 0
            },
            sofa: {
                name: 'Sofa',
                category: 'furniture',
                create: () => this.createSofa(),
                y: 0
            },
            diningTable: {
                name: 'Dining Table',
                category: 'furniture',
                create: () => this.createDiningTable(),
                y: 0
            },
            
            // Traditional furniture
            chair: {
                name: 'Chair',
                category: 'furniture',
                create: () => this.createChair(),
                y: 0
            },
            table: {
                name: 'Table',
                category: 'furniture',
                create: () => this.createTable(),
                y: 0
            },
            
            // Stage equipment
            microphone: {
                name: 'Microphone',
                category: 'stage',
                create: () => this.createMicrophone(),
                y: 0
            },
            piano: {
                name: 'Piano',
                category: 'stage',
                create: () => this.createPiano(),
                y: 0
            },
            spotlight: {
                name: 'Spotlight',
                category: 'stage',
                create: () => this.createSpotlight(),
                y: 0
            },
            
            // Decorative items
            tree: {
                name: 'Tree',
                category: 'decorative',
                create: () => this.createTree(),
                y: 0
            },
            fountain: {
                name: 'Fountain',
                category: 'decorative',
                create: () => this.createFountain(),
                y: 0
            },
            bookshelf: {
                name: 'Bookshelf',
                category: 'decorative',
                create: () => this.createBookshelf(),
                y: 0
            },
            
            // Containers and storage
            barrel: {
                name: 'Barrel',
                category: 'storage',
                create: () => this.createBarrel(),
                y: 0
            },
            box: {
                name: 'Box',
                category: 'storage',
                create: () => this.createBox(),
                y: 0.25
            },
            
            // Lighting
            plant: {
                name: 'Plant',
                category: 'decorative',
                create: () => this.createPlant(),
                y: 0
            },
            lamp: {
                name: 'Lamp',
                category: 'lighting',
                create: () => this.createLamp(),
                y: 0
            }
        };
        
        // Legacy actor types (kept for compatibility)
        this.legacyActorTypes = {
            human_male: {
                name: 'Male Actor (Legacy)',
                category: 'human',
                bodyColor: 0x4169e1,
                skinColor: 0xffdbac,
                height: 1.8,
                build: 'normal'
            },
            human_female: {
                name: 'Female Actor (Legacy)',
                category: 'human',
                bodyColor: 0xdc143c,
                skinColor: 0xffe4c4,
                height: 1.65,
                build: 'slender'
            },
            child: {
                name: 'Child Actor (Legacy)',
                category: 'human',
                bodyColor: 0x32cd32,
                skinColor: 0xffefd5,
                height: 1.2,
                build: 'small'
            },
            elderly: {
                name: 'Elderly Actor (Legacy)',
                category: 'human',
                bodyColor: 0x8b4513,
                skinColor: 0xf5deb3,
                height: 1.7,
                build: 'stocky'
            },
            robot: {
                name: 'Robot Actor (Legacy)',
                category: 'artificial',
                bodyColor: 0x708090,
                skinColor: 0xc0c0c0,
                height: 1.9,
                build: 'mechanical'
            },
            alien: {
                name: 'Alien Actor (Legacy)',
                category: 'fantasy',
                bodyColor: 0x9370db,
                skinColor: 0x98fb98,
                height: 2.1,
                build: 'tall'
            }
        };
        
        // Placement configuration
        this.placementConfig = {
            maxPlacementAttempts: 8,
            placementRadius: 1.5,
            collisionOffsets: [
                {x: 1, z: 0}, {x: -1, z: 0}, {x: 0, z: 1}, {x: 0, z: -1},
                {x: 1, z: 1}, {x: -1, z: 1}, {x: 1, z: -1}, {x: -1, z: -1}
            ]
        };
    }

    /**
     * Initialize the ObjectFactory
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('ObjectFactory already initialized');
            return;
        }

        console.log('ObjectFactory: Initializing object creation system...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Set up local references
            this.scene = window.stageState.core.scene;
            this.stageState = window.stageState;
            this.resourceManager = window.resourceManager;
            
            this.isInitialized = true;
            console.log('ObjectFactory: Initialization complete');
            
        } catch (error) {
            console.error('ObjectFactory: Initialization failed:', error);
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
                    console.log('ObjectFactory waiting for: THREE');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.stageState?.core?.scene) {
                    console.log('ObjectFactory waiting for: window.stageState.core.scene', {
                        stageState: !!window.stageState,
                        core: !!window.stageState?.core,
                        scene: !!window.stageState?.core?.scene
                    });
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.resourceManager) {
                    console.log('ObjectFactory waiting for: window.resourceManager');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.checkAllCollisions) {
                    console.log('ObjectFactory waiting for: window.checkAllCollisions');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.updatePropRelationships) {
                    console.log('ObjectFactory waiting for: window.updatePropRelationships');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                console.log('ObjectFactory: All dependencies satisfied!');
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('ObjectFactory dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create a prop at specified position with collision detection
     */
    addPropAt(x, z, propType = null) {
        const selectedType = propType || this.stageState.ui.selectedPropType;
        const propDef = this.propCatalog[selectedType];
        
        if (!propDef) {
            console.error(`Unknown prop type: ${selectedType}`);
            return null;
        }
        
        let propObject;
        const result = propDef.create();
        
        if (result instanceof THREE.Group) {
            propObject = result;
        } else {
            // Single geometry - wrap in mesh using ResourceManager
            const material = this.resourceManager.getMaterial('phong', {
                color: propDef.color || new THREE.Color(Math.random(), Math.random(), Math.random())
            });
            propObject = new THREE.Mesh(result, material);
        }
        
        propObject.position.set(x, propDef.y, z);
        propObject.castShadow = true;
        propObject.receiveShadow = true;
        
        const propId = this.stageState.getNextPropId();
        propObject.userData = { 
            type: 'prop',
            propType: selectedType,
            id: `prop_${propId}`,
            name: `${propDef.name} (prop_${propId})`,
            draggable: true,
            originalY: propDef.y,
            hidden: false
        };
        
        // Try to place prop with collision detection
        if (this.findValidPlacement(propObject, x, z, 'prop')) {
            this.scene.add(propObject);
            this.stageState.addProp(propObject);
            
            // Check initial relationships
            if (window.updatePropRelationships) {
                window.updatePropRelationships(propObject);
            }
            
            console.log(`Prop ${propObject.userData.name} placed at (${propObject.position.x.toFixed(2)}, ${propObject.position.z.toFixed(2)})`);
            return propObject;
        } else {
            console.log('Could not find free space for prop');
            return null;
        }
    }

    /**
     * Create an actor at specified position with collision detection
     */
    async addActorAt(x, z, actorType = null) {
        const selectedType = actorType || this.stageState.ui.selectedActorType;
        
        console.log(`🎭 ACTOR CREATION START: type=${selectedType}, position=(${x}, ${z})`);
        console.log(`🔍 Systems available:`, {
            vrm: !!(window.vrmActorSystem && window.vrmActorSystem.isInitialized),
            enhanced: !!(window.enhancedActorSystem && window.enhancedActorSystem.isInitialized),
            legacy: true
        });
        
        // Try VRM actor system first (highest quality)
        let actorGroup = null;
        if (window.vrmActorSystem && window.vrmActorSystem.isInitialized) {
            console.log(`🤖 Attempting VRM actor creation...`);
            // Map actor types to actual VRM models we have
            const vrmModelMap = {
                // Direct VRM matches (use actual VRM file names)
                'sample_constraint': 'sample_constraint',
                'young_female_casual': 'young_female_casual',
                'alicia_solid': 'alicia_solid',
                'fantasy_knight': 'fantasy_knight',
                'fantasy_wizard': 'fantasy_wizard',
                'child_character': 'child_character',
                'elderly_character': 'elderly_character',
                
                // Legacy to VRM mapping (use available VRM files)
                'human_male': 'young_female_casual',  // Only working VRM we have
                'human_female': 'sample_constraint',  // Working 10MB VRM
                'young_female': 'sample_constraint',
                'young_male': 'young_female_casual',
                'child': 'child_character',
                'child_girl': 'child_character',
                'elderly': 'elderly_character',
                'elderly_female': 'elderly_character',
                'knight': 'fantasy_knight',
                'wizard': 'fantasy_wizard'
            };
            
            const vrmModel = vrmModelMap[selectedType] || 'sample_constraint';
            try {
                actorGroup = await window.vrmActorSystem.createVRMActor(vrmModel, { x, y: 0.1, z });
                
                if (actorGroup) {
                    console.log(`✅ VRM actor created: ${selectedType} -> ${vrmModel}`);
                } else {
                    console.log(`❌ VRM actor creation returned null`);
                }
            } catch (error) {
                console.warn(`❌ VRM actor creation failed: ${error.message}, falling back to enhanced system`);
            }
        } else {
            console.log(`⚠️ VRM system not available, skipping to enhanced system`);
        }
        
        // Fallback to enhanced actor system (PRIMARY SYSTEM)
        if (!actorGroup) {
            console.log(`🎨 Creating enhanced actor (this should be the main path)...`);
            try {
                if (window.enhancedActorSystem && window.enhancedActorSystem.isInitialized) {
                    actorGroup = window.enhancedActorSystem.createEnhancedActor(selectedType);
                    if (actorGroup) {
                        console.log(`✅ Enhanced actor created: ${selectedType}`);
                        // CRITICAL: Make sure the actor has proper position and scale
                        actorGroup.position.set(x, 0, z);
                        actorGroup.scale.set(1, 1, 1);
                    } else {
                        console.log(`❌ Enhanced actor creation returned null`);
                    }
                } else {
                    console.log(`⚠️ Enhanced system not available, using legacy fallback`);
                    actorGroup = this.createDetailedActor(selectedType);
                    if (actorGroup) {
                        console.log(`✅ Legacy actor created: ${selectedType}`);
                    }
                }
            } catch (error) {
                console.error(`❌ Enhanced actor creation failed:`, error);
                console.log(`🔧 Trying legacy fallback...`);
                actorGroup = this.createDetailedActor(selectedType);
            }
        }
        
        
        if (!actorGroup) {
            console.error(`💥 COMPLETE FAILURE: Could not create actor of type: ${selectedType}`);
            return null;
        }
        
        // Position and properties - actors should be on stage surface, not sinking through
        actorGroup.position.set(x, 0.1, z); // Slightly above stage surface
        actorGroup.castShadow = true;
        actorGroup.receiveShadow = true;
        
        const actorId = this.stageState.getNextActorId();
        
        // Get actor name from appropriate source
        let actorName = selectedType;
        if (window.enhancedActorSystem?.isInitialized && window.enhancedActorSystem.actorTypes[selectedType]) {
            actorName = window.enhancedActorSystem.actorTypes[selectedType].name;
        } else if (this.legacyActorTypes[selectedType]) {
            actorName = this.legacyActorTypes[selectedType].name;
        }
        
        actorGroup.userData = { 
            type: 'actor',
            actorType: selectedType,
            id: `actor_${actorId}`,
            draggable: true,
            originalY: 0,
            hidden: false,
            name: `${actorName} (actor_${actorId})`
        };
        
        // Try to place actor with collision detection
        if (this.findValidPlacement(actorGroup, x, z, 'actor')) {
            this.scene.add(actorGroup);
            this.stageState.addActor(actorGroup);
            
            console.log(`Actor ${actorGroup.userData.name} placed at (${actorGroup.position.x.toFixed(2)}, ${actorGroup.position.z.toFixed(2)})`);
            return actorGroup;
        } else {
            console.log('Could not find free space for actor');
            return null;
        }
    }

    /**
     * Find valid placement for object with collision detection
     */
    findValidPlacement(object, x, z, objectType) {
        const objects = objectType === 'prop' ? this.stageState.props : this.stageState.actors;
        
        // Check if original position is free
        objects.push(object); // Temporarily add to check collisions
        
        if (!window.checkAllCollisions(object, x, z)) {
            // Original position is free
            return true;
        }
        
        // Position occupied, try to find nearby free spot
        objects.pop(); // Remove from list
        
        for (let offset of this.placementConfig.collisionOffsets) {
            const newX = x + offset.x * this.placementConfig.placementRadius;
            const newZ = z + offset.z * this.placementConfig.placementRadius;
            
            objects.push(object); // Re-add to check
            if (!window.checkAllCollisions(object, newX, newZ)) {
                object.position.set(newX, object.position.y, newZ);
                return true;
            }
            objects.pop(); // Remove again
        }
        
        return false; // No valid placement found
    }

    /**
     * Create detailed actor based on type
     */
    createDetailedActor(actorType) {
        const type = this.legacyActorTypes[actorType];
        if (!type) {
            console.error(`Unknown legacy actor type: ${actorType}`);
            return null;
        }
        
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
        const bodyGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyRadius[0],
            radiusBottom: bodyRadius[1], 
            height: bodyHeight * scale,
            radialSegments: 8
        });
        const bodyMaterial = this.resourceManager.getMaterial('phong', { 
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
            headGeometry = this.resourceManager.getGeometry('box', {
                width: headSize * 2,
                height: headSize * 2,
                depth: headSize * 2
            });
        } else if (type.category === 'fantasy') {
            headGeometry = this.resourceManager.getGeometry('cone', {
                radius: headSize,
                height: headSize * 1.5,
                radialSegments: 8
            });
        } else {
            headGeometry = this.resourceManager.getGeometry('sphere', {
                radius: headSize * scale,
                widthSegments: 16,
                heightSegments: 16
            });
        }
        
        const headMaterial = this.resourceManager.getMaterial('phong', { 
            color: type.skinColor,
            shininess: type.build === 'mechanical' ? 60 : 5
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = bodyHeight * scale + headSize * scale;
        group.add(head);
        
        // Create eyes (unless robot)
        if (type.build !== 'mechanical') {
            this.addEyesToActor(group, type, scale, bodyHeight, headSize);
        }
        
        // Add limbs for more detailed appearance
        this.addLimbsToActor(group, type, scale, bodyHeight);
        
        return group;
    }

    /**
     * Add eyes to actor
     */
    addEyesToActor(group, type, scale, bodyHeight, headSize) {
        const eyeGeometry = this.resourceManager.getGeometry('sphere', {
            radius: 0.04 * scale,
            widthSegments: 8,
            heightSegments: 8
        });
        const eyeMaterial = this.resourceManager.getMaterial('basic', { 
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
    }

    /**
     * Add limbs to actor for more detailed appearance
     */
    addLimbsToActor(group, type, scale, bodyHeight) {
        const limbMaterial = this.resourceManager.getMaterial('phong', { 
            color: type.bodyColor,
            shininess: type.build === 'mechanical' ? 80 : 10
        });
        
        // Arms
        const armGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: 0.1,
            radiusBottom: 0.08,
            height: 0.8 * scale,
            radialSegments: 8
        });
        
        const leftArm = new THREE.Mesh(armGeometry, limbMaterial);
        leftArm.position.set(-0.5 * scale, bodyHeight * scale * 0.7, 0);
        leftArm.rotation.z = 0.3;
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, limbMaterial);
        rightArm.position.set(0.5 * scale, bodyHeight * scale * 0.7, 0);
        rightArm.rotation.z = -0.3;
        group.add(rightArm);
        
        // Legs
        const legGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: 0.12,
            radiusBottom: 0.1,
            height: 0.9 * scale,
            radialSegments: 8
        });
        
        const leftLeg = new THREE.Mesh(legGeometry, limbMaterial);
        leftLeg.position.set(-0.2 * scale, -0.45 * scale, 0);
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, limbMaterial);
        rightLeg.position.set(0.2 * scale, -0.45 * scale, 0);
        group.add(rightLeg);
    }

    // ===== PROP CREATION METHODS =====

    /**
     * Create modern chair
     */
    createModernChair() {
        const group = new THREE.Group();
        
        // Seat with curved edges
        const seat = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 1.2, height: 0.15, depth: 1.2 }),
            this.resourceManager.getMaterial('phong', { color: 0x2C3E50 })
        );
        seat.position.y = 0.5;
        group.add(seat);
        
        // Modern angled back
        const back = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 1.2, height: 1.2, depth: 0.1 }),
            this.resourceManager.getMaterial('phong', { color: 0x34495E })
        );
        back.position.set(0, 1.1, -0.55);
        back.rotation.x = -0.1;
        group.add(back);
        
        // Chrome legs
        const legMaterial = this.resourceManager.getMaterial('phong', { color: 0xC0C0C0, shininess: 100 });
        const legGeometry = this.resourceManager.getGeometry('cylinder', { radiusTop: 0.03, radiusBottom: 0.03, height: 0.5 });
        const positions = [[-0.5, 0.25, -0.5], [0.5, 0.25, -0.5], [-0.5, 0.25, 0.5], [0.5, 0.25, 0.5]];
        
        positions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            group.add(leg);
        });
        
        return group;
    }

    /**
     * Create sofa
     */
    createSofa() {
        const group = new THREE.Group();
        
        // Main body
        const body = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 3, height: 0.8, depth: 1.5 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        body.position.y = 0.4;
        group.add(body);
        
        // Back cushions
        const backCushion = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 3, height: 1, depth: 0.3 }),
            this.resourceManager.getMaterial('phong', { color: 0xA0522D })
        );
        backCushion.position.set(0, 0.9, -0.6);
        group.add(backCushion);
        
        // Arm rests
        for (let x of [-1.35, 1.35]) {
            const armRest = new THREE.Mesh(
                this.resourceManager.getGeometry('box', { width: 0.3, height: 0.6, depth: 1.5 }),
                this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
            );
            armRest.position.set(x, 0.7, 0);
            group.add(armRest);
        }
        
        // Seat cushions
        for (let x of [-0.8, 0, 0.8]) {
            const cushion = new THREE.Mesh(
                this.resourceManager.getGeometry('box', { width: 0.9, height: 0.2, depth: 1.2 }),
                this.resourceManager.getMaterial('phong', { color: 0xDEB887 })
            );
            cushion.position.set(x, 0.5, 0.1);
            group.add(cushion);
        }
        
        return group;
    }

    /**
     * Create dining table
     */
    createDiningTable() {
        const group = new THREE.Group();
        
        // Elegant table top
        const top = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 1.5, radiusBottom: 1.5, height: 0.1, radialSegments: 32 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513, shininess: 50 })
        );
        top.position.y = 1;
        group.add(top);
        
        // Ornate central pedestal
        const pedestal = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.3, radiusBottom: 0.5, height: 0.8, radialSegments: 8 }),
            this.resourceManager.getMaterial('phong', { color: 0x654321 })
        );
        pedestal.position.y = 0.5;
        group.add(pedestal);
        
        // Base
        const base = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.8, radiusBottom: 0.8, height: 0.1, radialSegments: 8 }),
            this.resourceManager.getMaterial('phong', { color: 0x654321 })
        );
        base.position.y = 0.05;
        group.add(base);
        
        return group;
    }

    /**
     * Create traditional chair
     */
    createChair() {
        const group = new THREE.Group();
        
        // Seat
        const seat = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 1, height: 0.1, depth: 1 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        seat.position.y = 0.5;
        group.add(seat);
        
        // Back
        const back = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 1, height: 1, depth: 0.1 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        back.position.set(0, 1, -0.45);
        group.add(back);
        
        // Legs
        const legGeometry = this.resourceManager.getGeometry('cylinder', { radiusTop: 0.05, radiusBottom: 0.05, height: 0.5 });
        const legMaterial = this.resourceManager.getMaterial('phong', { color: 0x654321 });
        const legPositions = [[-0.4, 0.25, -0.4], [0.4, 0.25, -0.4], [-0.4, 0.25, 0.4], [0.4, 0.25, 0.4]];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            group.add(leg);
        });
        
        return group;
    }

    /**
     * Create table
     */
    createTable() {
        const group = new THREE.Group();
        
        // Table top
        const top = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 2, height: 0.1, depth: 1 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        top.position.y = 0.8;
        group.add(top);
        
        // Legs
        const legGeometry = this.resourceManager.getGeometry('cylinder', { radiusTop: 0.05, radiusBottom: 0.05, height: 0.8 });
        const legMaterial = this.resourceManager.getMaterial('phong', { color: 0x654321 });
        const legPositions = [[-0.9, 0.4, -0.4], [0.9, 0.4, -0.4], [-0.9, 0.4, 0.4], [0.9, 0.4, 0.4]];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            group.add(leg);
        });
        
        return group;
    }

    /**
     * Create microphone
     */
    createMicrophone() {
        const group = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.3, radiusBottom: 0.3, height: 0.1 }),
            this.resourceManager.getMaterial('phong', { color: 0x000000 })
        );
        base.position.y = 0.05;
        group.add(base);
        
        // Stand
        const stand = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.02, radiusBottom: 0.02, height: 1.5 }),
            this.resourceManager.getMaterial('phong', { color: 0x333333, shininess: 80 })
        );
        stand.position.y = 0.75;
        group.add(stand);
        
        // Microphone head
        const head = new THREE.Mesh(
            this.resourceManager.getGeometry('sphere', { radius: 0.1 }),
            this.resourceManager.getMaterial('phong', { color: 0x666666, shininess: 100 })
        );
        head.position.y = 1.5;
        group.add(head);
        
        return group;
    }

    /**
     * Create piano
     */
    createPiano() {
        const group = new THREE.Group();
        
        // Piano body
        const body = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 2, height: 1, depth: 1.2 }),
            this.resourceManager.getMaterial('phong', { color: 0x000000, shininess: 100 })
        );
        body.position.y = 0.5;
        group.add(body);
        
        // Piano keys
        const keysMaterial = this.resourceManager.getMaterial('phong', { color: 0xFFFFFF, shininess: 50 });
        const keys = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 1.8, height: 0.05, depth: 0.3 }),
            keysMaterial
        );
        keys.position.set(0, 1.05, 0.3);
        group.add(keys);
        
        // Legs
        const legGeometry = this.resourceManager.getGeometry('cylinder', { radiusTop: 0.05, radiusBottom: 0.05, height: 0.5 });
        const legMaterial = this.resourceManager.getMaterial('phong', { color: 0x000000 });
        const legPositions = [[-0.8, 0.25, -0.5], [0.8, 0.25, -0.5], [-0.8, 0.25, 0.5], [0.8, 0.25, 0.5]];
        
        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, legMaterial);
            leg.position.set(...pos);
            group.add(leg);
        });
        
        return group;
    }

    /**
     * Create spotlight
     */
    createSpotlight() {
        const group = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 0.5, height: 0.2, depth: 0.5 }),
            this.resourceManager.getMaterial('phong', { color: 0x333333 })
        );
        base.position.y = 0.1;
        group.add(base);
        
        // Stand
        const stand = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.03, radiusBottom: 0.03, height: 1.5 }),
            this.resourceManager.getMaterial('phong', { color: 0x666666 })
        );
        stand.position.y = 0.75;
        group.add(stand);
        
        // Light housing
        const housing = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.2, radiusBottom: 0.15, height: 0.3 }),
            this.resourceManager.getMaterial('phong', { color: 0x000000 })
        );
        housing.position.y = 1.5;
        housing.rotation.x = -Math.PI / 4;
        group.add(housing);
        
        return group;
    }

    /**
     * Create tree
     */
    createTree() {
        const group = new THREE.Group();
        
        // Trunk
        const trunk = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.15, radiusBottom: 0.2, height: 2 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        trunk.position.y = 1;
        group.add(trunk);
        
        // Foliage
        const foliage = new THREE.Mesh(
            this.resourceManager.getGeometry('sphere', { radius: 1.2 }),
            this.resourceManager.getMaterial('phong', { color: 0x228B22 })
        );
        foliage.position.y = 2.5;
        group.add(foliage);
        
        return group;
    }

    /**
     * Create fountain
     */
    createFountain() {
        const group = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 1.5, radiusBottom: 1.5, height: 0.3 }),
            this.resourceManager.getMaterial('phong', { color: 0x708090 })
        );
        base.position.y = 0.15;
        group.add(base);
        
        // Water basin
        const basin = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 1.2, radiusBottom: 1.2, height: 0.2 }),
            this.resourceManager.getMaterial('phong', { color: 0x4682B4, transparent: true, opacity: 0.7 })
        );
        basin.position.y = 0.4;
        group.add(basin);
        
        // Central spout
        const spout = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.05, radiusBottom: 0.1, height: 0.8 }),
            this.resourceManager.getMaterial('phong', { color: 0x708090 })
        );
        spout.position.y = 0.7;
        group.add(spout);
        
        return group;
    }

    /**
     * Create bookshelf
     */
    createBookshelf() {
        const group = new THREE.Group();
        
        // Main frame
        const frame = new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 2, height: 2, depth: 0.4 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        frame.position.y = 1;
        group.add(frame);
        
        // Shelves
        const shelfMaterial = this.resourceManager.getMaterial('phong', { color: 0x654321 });
        for (let i = 0; i < 4; i++) {
            const shelf = new THREE.Mesh(
                this.resourceManager.getGeometry('box', { width: 1.9, height: 0.05, depth: 0.35 }),
                shelfMaterial
            );
            shelf.position.y = 0.2 + i * 0.4;
            group.add(shelf);
        }
        
        // Books
        const bookColors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0x96CEB4, 0xFECA57];
        for (let shelf = 0; shelf < 3; shelf++) {
            for (let book = 0; book < 8; book++) {
                const bookMesh = new THREE.Mesh(
                    this.resourceManager.getGeometry('box', { width: 0.05, height: 0.25, depth: 0.2 }),
                    this.resourceManager.getMaterial('phong', { color: bookColors[book % bookColors.length] })
                );
                bookMesh.position.set(-0.8 + book * 0.2, 0.35 + shelf * 0.4, 0.1);
                group.add(bookMesh);
            }
        }
        
        return group;
    }

    /**
     * Create barrel
     */
    createBarrel() {
        const group = new THREE.Group();
        
        // Main barrel
        const barrel = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.45, radiusBottom: 0.5, height: 1.2 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        barrel.position.y = 0.6;
        group.add(barrel);
        
        // Metal bands
        const bandMaterial = this.resourceManager.getMaterial('phong', { color: 0x666666, shininess: 80 });
        for (let i = 0; i < 3; i++) {
            const band = new THREE.Mesh(
                this.resourceManager.getGeometry('cylinder', { radiusTop: 0.52, radiusBottom: 0.52, height: 0.05 }),
                bandMaterial
            );
            band.position.y = 0.2 + i * 0.4;
            group.add(band);
        }
        
        return group;
    }

    /**
     * Create box
     */
    createBox() {
        return new THREE.Mesh(
            this.resourceManager.getGeometry('box', { width: 0.8, height: 0.5, depth: 0.6 }),
            this.resourceManager.getMaterial('phong', { color: 0xCD853F })
        );
    }

    /**
     * Create plant
     */
    createPlant() {
        const group = new THREE.Group();
        
        // Pot
        const pot = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.25, radiusBottom: 0.2, height: 0.3 }),
            this.resourceManager.getMaterial('phong', { color: 0x8B4513 })
        );
        pot.position.y = 0.15;
        group.add(pot);
        
        // Plant stem
        const stem = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.02, radiusBottom: 0.02, height: 0.8 }),
            this.resourceManager.getMaterial('phong', { color: 0x228B22 })
        );
        stem.position.y = 0.7;
        group.add(stem);
        
        // Leaves
        for (let i = 0; i < 5; i++) {
            const leaf = new THREE.Mesh(
                this.resourceManager.getGeometry('sphere', { radius: 0.15 }),
                this.resourceManager.getMaterial('phong', { color: 0x32CD32 })
            );
            const angle = (i / 5) * Math.PI * 2;
            leaf.position.set(
                Math.cos(angle) * 0.2,
                0.8 + Math.sin(i) * 0.1,
                Math.sin(angle) * 0.2
            );
            group.add(leaf);
        }
        
        return group;
    }

    /**
     * Create lamp
     */
    createLamp() {
        const group = new THREE.Group();
        
        // Base
        const base = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.2, radiusBottom: 0.2, height: 0.1 }),
            this.resourceManager.getMaterial('phong', { color: 0x666666 })
        );
        base.position.y = 0.05;
        group.add(base);
        
        // Stand
        const stand = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.02, radiusBottom: 0.02, height: 1.2 }),
            this.resourceManager.getMaterial('phong', { color: 0x333333 })
        );
        stand.position.y = 0.6;
        group.add(stand);
        
        // Lampshade
        const shade = new THREE.Mesh(
            this.resourceManager.getGeometry('cylinder', { radiusTop: 0.4, radiusBottom: 0.2, height: 0.6 }),
            this.resourceManager.getMaterial('phong', { color: 0xFFF8DC, transparent: true, opacity: 0.8 })
        );
        shade.position.y = 1.5;
        group.add(shade);
        
        return group;
    }

    /**
     * Get prop catalog for UI
     */
    getPropCatalog() {
        return this.propCatalog;
    }

    /**
     * Get actor types for UI
     */
    getActorTypes() {
        // Combine VRM actors, enhanced actor types, and legacy fallbacks
        let combinedTypes = {};
        
        // Add VRM actors if available (highest priority)
        if (window.vrmActorSystem && window.vrmActorSystem.isInitialized) {
            const vrmActors = window.vrmActorSystem.getAvailableActors();
            Object.entries(vrmActors).forEach(([key, vrm]) => {
                combinedTypes[key] = {
                    name: `🎭 ${vrm.name}`,  // VRM actors get special icon
                    category: 'vrm',
                    source: 'vrm',
                    ...vrm
                };
            });
        }
        
        // Add enhanced actor types if available
        if (window.enhancedActorSystem && window.enhancedActorSystem.isInitialized) {
            const enhancedTypes = window.enhancedActorSystem.getActorTypes();
            Object.entries(enhancedTypes).forEach(([key, actor]) => {
                // Only add if not already covered by VRM
                if (!combinedTypes[key]) {
                    combinedTypes[key] = {
                        ...actor,
                        name: `⭐ ${actor.name}`,  // Enhanced actors get star icon
                        source: 'enhanced'
                    };
                }
            });
        }
        
        // Add legacy types for fallback
        Object.entries(this.legacyActorTypes).forEach(([key, actor]) => {
            // Only add if not already covered by VRM or enhanced
            if (!combinedTypes[key]) {
                combinedTypes[key] = {
                    ...actor,
                    name: `📦 ${actor.name}`,  // Legacy actors get box icon
                    source: 'legacy'
                };
            }
        });
        
        return combinedTypes;
    }

    /**
     * Get available prop categories
     */
    getPropCategories() {
        const categories = new Set();
        Object.values(this.propCatalog).forEach(prop => {
            categories.add(prop.category);
        });
        return Array.from(categories);
    }

    /**
     * Get props by category
     */
    getPropsByCategory(category) {
        return Object.entries(this.propCatalog)
            .filter(([key, prop]) => prop.category === category)
            .map(([key, prop]) => ({ key, ...prop }));
    }

    /**
     * Get creation statistics
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            propTypes: Object.keys(this.propCatalog).length,
            actorTypes: Object.keys(this.actorTypes).length,
            categories: this.getPropCategories(),
            totalProps: this.stageState?.props?.length || 0,
            totalActors: this.stageState?.actors?.length || 0
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        console.log('ObjectFactory: Disposing');
        this.isInitialized = false;
    }
}

// Create global instance
const threeObjectFactory = new ThreeObjectFactory();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.threeObjectFactory = threeObjectFactory;
    console.log('ObjectFactory loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { threeObjectFactory, ThreeObjectFactory };
}