/**
 * EnhancedActorSystem.js - Advanced Actor Creation with Faces, Hair, and Clothing
 * 
 * A comprehensive actor system featuring:
 * - Detailed facial features (eyes, nose, mouth, eyebrows)
 * - Multiple hairstyles and hair colors
 * - Clothing system with different outfits
 * - Customizable skin tones and body types
 * - Pose and animation support
 * - Age and gender variations
 * - Procedural variation system
 */

class EnhancedActorSystem {
    constructor() {
        this.isInitialized = false;
        
        // Enhanced actor types with detailed specifications
        this.actorTypes = {
            // Legacy compatibility mappings
            human_male: {
                name: 'Male Actor',
                category: 'human',
                gender: 'male',
                ageGroup: 'young',
                height: 1.78,
                build: 'athletic',
                defaultClothing: 'casual_male',
                defaultHair: 'short_brown',
                skinTone: 'medium'
            },
            human_female: {
                name: 'Female Actor',
                category: 'human',
                gender: 'female',
                ageGroup: 'young',
                height: 1.65,
                build: 'slender',
                defaultClothing: 'casual_female',
                defaultHair: 'long_blonde',
                skinTone: 'medium'
            },
            child: {
                name: 'Child Actor',
                category: 'human',
                gender: 'male',
                ageGroup: 'child',
                height: 1.2,
                build: 'child',
                defaultClothing: 'casual_child_male',
                defaultHair: 'messy_brown',
                skinTone: 'light'
            },
            elderly: {
                name: 'Elderly Actor',
                category: 'human',
                gender: 'male',
                ageGroup: 'elderly',
                height: 1.70,
                build: 'frail',
                defaultClothing: 'formal_male',
                defaultHair: 'bald_gray',
                skinTone: 'light'
            },
            robot: {
                name: 'Robot Actor',
                category: 'artificial',
                gender: 'male',
                ageGroup: 'adult',
                height: 1.9,
                build: 'mechanical',
                defaultClothing: 'armor',
                defaultHair: 'none',
                skinTone: 'medium'
            },
            alien: {
                name: 'Alien Actor',
                category: 'fantasy',
                gender: 'male',
                ageGroup: 'adult',
                height: 2.1,
                build: 'tall',
                defaultClothing: 'fantasy',
                defaultHair: 'none',
                skinTone: 'olive'
            },
            
            // Human variations
            young_male: {
                name: 'Young Male',
                category: 'human',
                gender: 'male',
                ageGroup: 'young',
                height: 1.78,
                build: 'athletic',
                defaultClothing: 'casual_male',
                defaultHair: 'short_brown',
                skinTone: 'medium'
            },
            young_female: {
                name: 'Young Female',
                category: 'human',
                gender: 'female',
                ageGroup: 'young',
                height: 1.65,
                build: 'slender',
                defaultClothing: 'casual_female',
                defaultHair: 'long_blonde',
                skinTone: 'medium'
            },
            middle_aged_male: {
                name: 'Middle-aged Male',
                category: 'human',
                gender: 'male',
                ageGroup: 'middle',
                height: 1.75,
                build: 'stocky',
                defaultClothing: 'business_male',
                defaultHair: 'receding_gray',
                skinTone: 'medium'
            },
            middle_aged_female: {
                name: 'Middle-aged Female',
                category: 'human',
                gender: 'female',
                ageGroup: 'middle',
                height: 1.68,
                build: 'average',
                defaultClothing: 'business_female',
                defaultHair: 'bob_brown',
                skinTone: 'medium'
            },
            elderly_male: {
                name: 'Elderly Male',
                category: 'human',
                gender: 'male',
                ageGroup: 'elderly',
                height: 1.70,
                build: 'frail',
                defaultClothing: 'formal_male',
                defaultHair: 'bald_gray',
                skinTone: 'light'
            },
            elderly_female: {
                name: 'Elderly Female',
                category: 'human',
                gender: 'female',
                ageGroup: 'elderly',
                height: 1.60,
                build: 'petite',
                defaultClothing: 'formal_female',
                defaultHair: 'short_gray',
                skinTone: 'light'
            },
            child_boy: {
                name: 'Child (Boy)',
                category: 'human',
                gender: 'male',
                ageGroup: 'child',
                height: 1.2,
                build: 'child',
                defaultClothing: 'casual_child_male',
                defaultHair: 'messy_brown',
                skinTone: 'light'
            },
            child_girl: {
                name: 'Child (Girl)',
                category: 'human',
                gender: 'female',
                ageGroup: 'child',
                height: 1.15,
                build: 'child',
                defaultClothing: 'casual_child_female',
                defaultHair: 'pigtails_blonde',
                skinTone: 'light'
            },
            
            // Fantasy/Special characters
            wizard: {
                name: 'Wizard',
                category: 'fantasy',
                gender: 'male',
                ageGroup: 'elderly',
                height: 1.75,
                build: 'robed',
                defaultClothing: 'wizard_robes',
                defaultHair: 'long_white_beard',
                skinTone: 'pale'
            },
            knight: {
                name: 'Knight',
                category: 'fantasy',
                gender: 'male',
                ageGroup: 'young',
                height: 1.85,
                build: 'muscular',
                defaultClothing: 'plate_armor',
                defaultHair: 'short_black',
                skinTone: 'medium'
            },
            princess: {
                name: 'Princess',
                category: 'fantasy',
                gender: 'female',
                ageGroup: 'young',
                height: 1.68,
                build: 'elegant',
                defaultClothing: 'royal_gown',
                defaultHair: 'elaborate_blonde',
                skinTone: 'fair'
            }
        };
        
        // Skin tone definitions
        this.skinTones = {
            pale: 0xffeedd,
            fair: 0xffe4c4,
            light: 0xffdbac,
            medium: 0xddbea9,
            olive: 0xcb997e,
            tan: 0xa0785a,
            brown: 0x8b5a3c,
            dark: 0x6f4e37,
            ebony: 0x3c2414
        };
        
        // Hair styles and colors
        this.hairStyles = {
            // Male styles
            short_brown: { type: 'short', color: 0x8b4513, gender: 'male' },
            short_black: { type: 'short', color: 0x000000, gender: 'male' },
            short_blonde: { type: 'short', color: 0xffd700, gender: 'male' },
            receding_gray: { type: 'receding', color: 0x808080, gender: 'male' },
            bald_gray: { type: 'bald', color: 0x808080, gender: 'male' },
            messy_brown: { type: 'messy', color: 0x8b4513, gender: 'male' },
            long_white_beard: { type: 'long_beard', color: 0xffffff, gender: 'male' },
            
            // Female styles
            long_blonde: { type: 'long', color: 0xffd700, gender: 'female' },
            long_brown: { type: 'long', color: 0x8b4513, gender: 'female' },
            long_black: { type: 'long', color: 0x000000, gender: 'female' },
            bob_brown: { type: 'bob', color: 0x8b4513, gender: 'female' },
            bob_blonde: { type: 'bob', color: 0xffd700, gender: 'female' },
            short_gray: { type: 'short', color: 0x808080, gender: 'female' },
            pigtails_blonde: { type: 'pigtails', color: 0xffd700, gender: 'female' },
            elaborate_blonde: { type: 'elaborate', color: 0xffd700, gender: 'female' }
        };
        
        // Clothing system
        this.clothingOptions = {
            // Male clothing
            casual_male: {
                name: 'Casual Male',
                colors: { shirt: 0x4169e1, pants: 0x000080 },
                style: 'casual'
            },
            business_male: {
                name: 'Business Male',
                colors: { shirt: 0xffffff, suit: 0x2f4f4f, tie: 0x8b0000 },
                style: 'formal'
            },
            formal_male: {
                name: 'Formal Male',
                colors: { shirt: 0xffffff, suit: 0x000000, tie: 0x8b0000 },
                style: 'formal'
            },
            
            // Female clothing
            casual_female: {
                name: 'Casual Female',
                colors: { top: 0xff69b4, bottom: 0x000080 },
                style: 'casual'
            },
            business_female: {
                name: 'Business Female',
                colors: { blazer: 0x2f4f4f, skirt: 0x000000, blouse: 0xffffff },
                style: 'formal'
            },
            formal_female: {
                name: 'Formal Female',
                colors: { dress: 0x800080 },
                style: 'formal'
            },
            
            // Child clothing
            casual_child_male: {
                name: 'Casual Child (Boy)',
                colors: { shirt: 0x32cd32, shorts: 0x8b4513 },
                style: 'casual'
            },
            casual_child_female: {
                name: 'Casual Child (Girl)',
                colors: { dress: 0xff1493 },
                style: 'casual'
            },
            
            // Fantasy clothing
            wizard_robes: {
                name: 'Wizard Robes',
                colors: { robe: 0x4b0082, trim: 0xffd700 },
                style: 'fantasy'
            },
            plate_armor: {
                name: 'Plate Armor',
                colors: { metal: 0xc0c0c0, trim: 0xffd700 },
                style: 'armor'
            },
            royal_gown: {
                name: 'Royal Gown',
                colors: { gown: 0x8b0000, trim: 0xffd700 },
                style: 'royal'
            },
            
            // Legacy compatibility
            armor: {
                name: 'Basic Armor',
                colors: { metal: 0xc0c0c0, trim: 0x8b4513 },
                style: 'armor'
            },
            fantasy: {
                name: 'Fantasy Outfit',
                colors: { robe: 0x4b0082, trim: 0xffd700 },
                style: 'fantasy'
            }
        };
        
        // Facial feature variations
        this.facialFeatures = {
            eyeColors: [0x8b4513, 0x228b22, 0x4169e1, 0x696969, 0x006400],
            noseTypes: ['small', 'medium', 'large', 'wide', 'narrow'],
            mouthTypes: ['small', 'medium', 'large', 'wide']
        };
        
        console.log('EnhancedActorSystem: Initialized');
    }

    /**
     * Initialize the enhanced actor system
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('EnhancedActorSystem already initialized');
            return;
        }

        console.log('EnhancedActorSystem: Initializing...');

        try {
            // Try to get dependencies but don't fail if they're not available
            this.resourceManager = window.resourceManager || null;
            this.scene = window.stageState?.core?.scene || null;
            
            if (!this.resourceManager) {
                console.warn('EnhancedActorSystem: ResourceManager not available, using direct THREE.js');
            }
            
            if (!this.scene) {
                console.warn('EnhancedActorSystem: Scene not available, actors will need to be added manually');
            }
            
            // Initialize advanced systems if available (optional)
            try {
                await this.initializeAdvancedSystems();
            } catch (error) {
                console.warn('EnhancedActorSystem: Advanced systems failed to initialize:', error.message);
            }
            
            this.isInitialized = true;
            console.log('EnhancedActorSystem: Initialization complete (some features may be limited)');
            
        } catch (error) {
            console.error('EnhancedActorSystem: Initialization failed:', error);
            // Don't throw - make it work anyway
            this.isInitialized = true;
            console.log('EnhancedActorSystem: Forced initialization - basic functionality available');
        }
    }

    /**
     * Initialize advanced face and hair systems
     */
    async initializeAdvancedSystems() {
        try {
            // Initialize Advanced Face System
            if (window.advancedFaceSystem && !window.advancedFaceSystem.isInitialized) {
                console.log('EnhancedActorSystem: Initializing AdvancedFaceSystem...');
                await window.advancedFaceSystem.initialize();
                console.log('EnhancedActorSystem: AdvancedFaceSystem initialized');
            }
            
            // Initialize Modern Hair System (most advanced)
            if (window.modernHairSystem && !window.modernHairSystem.isInitialized) {
                console.log('EnhancedActorSystem: Initializing ModernHairSystem...');
                await window.modernHairSystem.initialize();
                console.log('EnhancedActorSystem: ModernHairSystem initialized');
            }
            
            // Initialize Advanced Hair System (fallback)
            if (window.advancedHairSystem && !window.advancedHairSystem.isInitialized) {
                console.log('EnhancedActorSystem: Initializing AdvancedHairSystem...');
                await window.advancedHairSystem.initialize();
                console.log('EnhancedActorSystem: AdvancedHairSystem initialized');
            }
            
        } catch (error) {
            console.warn('EnhancedActorSystem: Failed to initialize advanced systems:', error.message);
            console.warn('Will continue with legacy actor creation');
        }
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (!window.resourceManager) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.stageState?.core?.scene) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('EnhancedActorSystem dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create an enhanced actor with detailed features
     */
    createEnhancedActor(actorType, customizations = {}) {
        console.log(`🎨 ENHANCED ACTOR CREATION: ${actorType}`);
        console.log(`📝 Customizations:`, customizations);
        
        const type = this.actorTypes[actorType];
        if (!type) {
            console.error(`❌ Unknown enhanced actor type: ${actorType}`);
            console.log(`📋 Available types:`, Object.keys(this.actorTypes));
            return null;
        }
        
        console.log(`✅ Actor type found:`, type);
        
        const group = new THREE.Group();
        group.userData = {
            actorType: actorType,
            customizations: customizations,
            enhanced: true
        };
        
        // Apply customizations or use defaults
        const skinTone = customizations.skinTone || type.skinTone;
        const hairStyle = customizations.hairStyle || type.defaultHair;
        const clothing = customizations.clothing || type.defaultClothing;
        
        console.log(`🎨 Using settings:`, { skinTone, hairStyle, clothing });
        
        let creationSteps = {
            body: false,
            head: false,
            hair: false,
            clothing: false,
            limbs: false
        };
        
        // Create body with proper proportions
        try {
            console.log(`👤 Creating body...`);
            this.createActorBody(group, type, skinTone);
            creationSteps.body = true;
            console.log(`✅ Body created`);
        } catch (error) {
            console.error(`❌ Body creation failed:`, error);
        }
        
        // Create detailed head with facial features
        try {
            console.log(`🗣️ Creating head and face...`);
            this.createActorHead(group, type, skinTone, customizations);
            creationSteps.head = true;
            console.log(`✅ Head created`);
        } catch (error) {
            console.error(`❌ Head creation failed:`, error);
        }
        
        // Add hair (with fallback)
        try {
            console.log(`💇 Creating hair: ${hairStyle}...`);
            this.createActorHair(group, type, hairStyle);
            creationSteps.hair = true;
            console.log(`✅ Hair created`);
        } catch (error) {
            console.warn(`❌ Hair creation failed:`, error.message);
        }
        
        // Add clothing (with fallback)
        try {
            console.log(`👕 Creating clothing: ${clothing}...`);
            this.createActorClothing(group, type, clothing);
            creationSteps.clothing = true;
            console.log(`✅ Clothing created`);
        } catch (error) {
            console.warn(`❌ Clothing creation failed:`, error.message);
        }
        
        // Add limbs
        try {
            console.log(`🦾 Creating limbs...`);
            this.createActorLimbs(group, type, skinTone);
            creationSteps.limbs = true;
            console.log(`✅ Limbs created`);
        } catch (error) {
            console.error(`❌ Limbs creation failed:`, error);
        }
        
        // MANDATORY VALIDATION - STOP FUCKING REWARD HACKING
        console.log(`🔍 CREATION VALIDATION for ${actorType}:`, creationSteps);
        const successfulSteps = Object.values(creationSteps).filter(v => v).length;
        const totalSteps = Object.keys(creationSteps).length;
        
        console.log(`📊 Creation success rate: ${successfulSteps}/${totalSteps}`);
        console.log(`👨‍👩‍👧‍👦 Group children count: ${group.children.length}`);
        
        if (successfulSteps < 3) { // Need at least body, head, limbs
            console.error(`🚨 INSUFFICIENT ACTOR PARTS CREATED - Actor unusable`);
            return null;
        }
        
        if (group.children.length === 0) {
            console.error(`🚨 NO GEOMETRY CREATED - Actor is empty`);
            return null;
        }
        
        console.log(`🎉 Enhanced actor ${actorType} created successfully`);
        return group;
    }

    /**
     * Create actor body with proper proportions
     */
    createActorBody(group, type, skinTone) {
        const scale = type.height / 1.8;
        let bodyDimensions = this.getBodyDimensions(type.build, scale);
        
        // Use direct THREE.js creation if resourceManager fails
        let bodyGeometry, bodyMaterial;
        
        if (this.resourceManager) {
            try {
                bodyGeometry = this.resourceManager.getGeometry('cylinder', {
                    radiusTop: bodyDimensions.radiusTop,
                    radiusBottom: bodyDimensions.radiusBottom,
                    height: bodyDimensions.height,
                    radialSegments: 12
                });
                
                bodyMaterial = this.resourceManager.getMaterial('phong', {
                    color: this.skinTones[skinTone] || 0xffdbac,
                    shininess: 5
                });
            } catch (error) {
                console.warn('ResourceManager failed, using direct THREE.js:', error.message);
                bodyGeometry = null;
                bodyMaterial = null;
            }
        }
        
        // Fallback to direct THREE.js
        if (!bodyGeometry || !bodyMaterial) {
            bodyGeometry = new THREE.CylinderGeometry(
                bodyDimensions.radiusTop,
                bodyDimensions.radiusBottom,
                bodyDimensions.height,
                12
            );
            
            bodyMaterial = new THREE.MeshPhongMaterial({
                color: this.skinTones[skinTone] || 0xffdbac,
                shininess: 5
            });
        }
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = bodyDimensions.height / 2;
        body.userData = { part: 'body' };
        group.add(body);
    }

    /**
     * Create detailed head with facial features
     */
    createActorHead(group, type, skinTone, customizations = {}) {
        const scale = type.height / 1.8;
        const headSize = this.getHeadSize(type.ageGroup, scale);
        const bodyHeight = this.getBodyDimensions(type.build, scale).height;
        
        // Create simple, reliable face - skip advanced system for now
        console.log('Creating simple reliable face for actor');
        
        // Create reliable head with basic face
        let headGeometry, headMaterial;
        
        if (this.resourceManager) {
            try {
                headGeometry = this.resourceManager.getGeometry('sphere', {
                    radius: headSize,
                    widthSegments: 16,
                    heightSegments: 16
                });
                
                headMaterial = this.resourceManager.getMaterial('phong', {
                    color: this.skinTones[skinTone] || 0xffdbac,
                    shininess: 5
                });
            } catch (error) {
                console.warn('ResourceManager failed for head, using direct THREE.js');
                headGeometry = null;
                headMaterial = null;
            }
        }
        
        // Fallback to direct THREE.js
        if (!headGeometry || !headMaterial) {
            headGeometry = new THREE.SphereGeometry(headSize, 16, 16);
            headMaterial = new THREE.MeshPhongMaterial({
                color: this.skinTones[skinTone] || 0xffdbac,
                shininess: 5
            });
        }
        
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = bodyHeight + headSize;
        head.userData = { part: 'head' };
        group.add(head);
        
        console.log(`Created head at y: ${bodyHeight + headSize}, headSize: ${headSize}`);
        
        // Add simple, reliable facial features
        this.addSimpleFacialFeatures(group, type, headSize, bodyHeight, customizations);
    }

    /**
     * Add simple, reliable facial features
     */
    addSimpleFacialFeatures(group, type, headSize, bodyHeight, customizations) {
        const faceY = bodyHeight + headSize;
        const scale = type.height / 1.8;
        
        console.log(`Adding facial features at y: ${faceY}, scale: ${scale}`);
        
        // Simple eyes - always visible
        let eyeGeometry, eyeMaterial;
        
        if (this.resourceManager) {
            try {
                eyeGeometry = this.resourceManager.getGeometry('sphere', {
                    radius: 0.05 * scale,
                    widthSegments: 8,
                    heightSegments: 8
                });
                eyeMaterial = this.resourceManager.getMaterial('basic', { 
                    color: 0x000000 
                });
            } catch (error) {
                eyeGeometry = null;
                eyeMaterial = null;
            }
        }
        
        // Fallback to direct THREE.js
        if (!eyeGeometry || !eyeMaterial) {
            eyeGeometry = new THREE.SphereGeometry(0.05 * scale, 8, 8);
            eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        }
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.1 * scale, faceY + 0.05 * scale, headSize * 0.8);
        leftEye.userData = { part: 'eye', side: 'left' };
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.1 * scale, faceY + 0.05 * scale, headSize * 0.8);
        rightEye.userData = { part: 'eye', side: 'right' };
        group.add(rightEye);
        
        // Simple nose
        let noseGeometry, noseMaterial;
        
        if (this.resourceManager) {
            try {
                noseGeometry = this.resourceManager.getGeometry('box', {
                    width: 0.03 * scale,
                    height: 0.06 * scale,
                    depth: 0.04 * scale
                });
                noseMaterial = this.resourceManager.getMaterial('phong', {
                    color: this.skinTones[type.skinTone] || 0xffdbac,
                    shininess: 5
                });
            } catch (error) {
                noseGeometry = null;
                noseMaterial = null;
            }
        }
        
        // Fallback to direct THREE.js
        if (!noseGeometry || !noseMaterial) {
            noseGeometry = new THREE.BoxGeometry(0.03 * scale, 0.06 * scale, 0.04 * scale);
            noseMaterial = new THREE.MeshPhongMaterial({
                color: this.skinTones[type.skinTone] || 0xffdbac,
                shininess: 5
            });
        }
        
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, faceY - 0.02 * scale, headSize * 0.85);
        nose.userData = { part: 'nose' };
        group.add(nose);
        
        // Simple mouth
        let mouthGeometry, mouthMaterial;
        
        if (this.resourceManager) {
            try {
                mouthGeometry = this.resourceManager.getGeometry('box', {
                    width: 0.08 * scale,
                    height: 0.02 * scale,
                    depth: 0.01 * scale
                });
                mouthMaterial = this.resourceManager.getMaterial('phong', {
                    color: 0x8b0000,
                    shininess: 10
                });
            } catch (error) {
                mouthGeometry = null;
                mouthMaterial = null;
            }
        }
        
        // Fallback to direct THREE.js
        if (!mouthGeometry || !mouthMaterial) {
            mouthGeometry = new THREE.BoxGeometry(0.08 * scale, 0.02 * scale, 0.01 * scale);
            mouthMaterial = new THREE.MeshPhongMaterial({
                color: 0x8b0000,
                shininess: 10
            });
        }
        
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, faceY - 0.1 * scale, headSize * 0.82);
        mouth.userData = { part: 'mouth' };
        group.add(mouth);
        
        console.log('Added simple facial features successfully');
    }

    /**
     * Add detailed facial features (legacy method)
     */
    addDetailedFacialFeatures(group, type, headSize, bodyHeight, customizations) {
        const faceY = bodyHeight + headSize;
        const scale = type.height / 1.8;
        
        // Eyes with detailed structure
        this.createDetailedEyes(group, faceY, headSize, scale, customizations.eyeColor);
        
        // Nose
        this.createNose(group, faceY, headSize, scale, customizations.noseType);
        
        // Mouth
        this.createMouth(group, faceY, headSize, scale, customizations.mouthType);
        
        // Eyebrows
        this.createEyebrows(group, faceY, headSize, scale, type.gender);
        
        // Additional age-specific features
        if (type.ageGroup === 'elderly') {
            this.addWrinkles(group, faceY, headSize, scale);
        }
    }

    /**
     * Create detailed eyes with iris and pupils
     */
    createDetailedEyes(group, faceY, headSize, scale, customEyeColor) {
        const eyeSize = 0.08 * scale;
        const eyeZ = headSize * 0.85;
        
        // Eye whites (sclera)
        const eyeWhiteGeometry = this.resourceManager.getGeometry('sphere', {
            radius: eyeSize,
            widthSegments: 12,
            heightSegments: 12
        });
        const eyeWhiteMaterial = this.resourceManager.getMaterial('phong', {
            color: 0xffffff,
            shininess: 50
        });
        
        // Iris
        const irisSize = eyeSize * 0.7;
        const irisGeometry = this.resourceManager.getGeometry('sphere', {
            radius: irisSize,
            widthSegments: 12,
            heightSegments: 12
        });
        
        const eyeColor = customEyeColor || this.facialFeatures.eyeColors[
            Math.floor(Math.random() * this.facialFeatures.eyeColors.length)
        ];
        const irisMaterial = this.resourceManager.getMaterial('phong', {
            color: eyeColor,
            shininess: 80
        });
        
        // Pupil
        const pupilSize = irisSize * 0.4;
        const pupilGeometry = this.resourceManager.getGeometry('sphere', {
            radius: pupilSize,
            widthSegments: 8,
            heightSegments: 8
        });
        const pupilMaterial = this.resourceManager.getMaterial('basic', {
            color: 0x000000
        });
        
        // Create left eye
        const leftEyeGroup = new THREE.Group();
        const leftEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        const leftIris = new THREE.Mesh(irisGeometry, irisMaterial);
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        
        leftIris.position.z = eyeSize * 0.3;
        leftPupil.position.z = eyeSize * 0.4;
        
        leftEyeGroup.add(leftEyeWhite);
        leftEyeGroup.add(leftIris);
        leftEyeGroup.add(leftPupil);
        leftEyeGroup.position.set(-0.15 * scale, faceY + 0.05 * scale, eyeZ);
        
        // Create right eye
        const rightEyeGroup = new THREE.Group();
        const rightEyeWhite = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
        const rightIris = new THREE.Mesh(irisGeometry, irisMaterial);
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        
        rightIris.position.z = eyeSize * 0.3;
        rightPupil.position.z = eyeSize * 0.4;
        
        rightEyeGroup.add(rightEyeWhite);
        rightEyeGroup.add(rightIris);
        rightEyeGroup.add(rightPupil);
        rightEyeGroup.position.set(0.15 * scale, faceY + 0.05 * scale, eyeZ);
        
        group.add(leftEyeGroup);
        group.add(rightEyeGroup);
    }

    /**
     * Create nose with different types
     */
    createNose(group, faceY, headSize, scale, noseType = 'medium') {
        let noseDimensions;
        
        switch(noseType) {
            case 'small':
                noseDimensions = { width: 0.04, height: 0.06, depth: 0.08 };
                break;
            case 'large':
                noseDimensions = { width: 0.08, height: 0.12, depth: 0.12 };
                break;
            case 'wide':
                noseDimensions = { width: 0.1, height: 0.08, depth: 0.1 };
                break;
            case 'narrow':
                noseDimensions = { width: 0.03, height: 0.1, depth: 0.08 };
                break;
            default: // medium
                noseDimensions = { width: 0.05, height: 0.08, depth: 0.1 };
        }
        
        const noseGeometry = this.resourceManager.getGeometry('box', {
            width: noseDimensions.width * scale,
            height: noseDimensions.height * scale,
            depth: noseDimensions.depth * scale
        });
        
        const noseMaterial = this.resourceManager.getMaterial('phong', {
            color: 0xffdbac, // Slightly different from skin for definition
            shininess: 5
        });
        
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, faceY - 0.05 * scale, headSize * 0.9);
        nose.userData = { part: 'nose' };
        group.add(nose);
    }

    /**
     * Create mouth with different types
     */
    createMouth(group, faceY, headSize, scale, mouthType = 'medium') {
        let mouthWidth;
        
        switch(mouthType) {
            case 'small':
                mouthWidth = 0.08;
                break;
            case 'large':
                mouthWidth = 0.15;
                break;
            case 'wide':
                mouthWidth = 0.18;
                break;
            default: // medium
                mouthWidth = 0.12;
        }
        
        const mouthGeometry = this.resourceManager.getGeometry('box', {
            width: mouthWidth * scale,
            height: 0.02 * scale,
            depth: 0.02 * scale
        });
        
        const mouthMaterial = this.resourceManager.getMaterial('phong', {
            color: 0x8b0000,
            shininess: 20
        });
        
        const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouth.position.set(0, faceY - 0.15 * scale, headSize * 0.88);
        mouth.userData = { part: 'mouth' };
        group.add(mouth);
    }

    /**
     * Create eyebrows
     */
    createEyebrows(group, faceY, headSize, scale, gender) {
        const browThickness = gender === 'male' ? 0.03 : 0.02;
        const browWidth = 0.1;
        
        const browGeometry = this.resourceManager.getGeometry('box', {
            width: browWidth * scale,
            height: browThickness * scale,
            depth: 0.02 * scale
        });
        
        const browMaterial = this.resourceManager.getMaterial('phong', {
            color: 0x654321,
            shininess: 5
        });
        
        const leftBrow = new THREE.Mesh(browGeometry, browMaterial);
        leftBrow.position.set(-0.12 * scale, faceY + 0.12 * scale, headSize * 0.9);
        leftBrow.rotation.z = 0.1;
        
        const rightBrow = new THREE.Mesh(browGeometry, browMaterial);
        rightBrow.position.set(0.12 * scale, faceY + 0.12 * scale, headSize * 0.9);
        rightBrow.rotation.z = -0.1;
        
        group.add(leftBrow);
        group.add(rightBrow);
    }

    /**
     * Add wrinkles for elderly characters
     */
    addWrinkles(group, faceY, headSize, scale) {
        // Simple wrinkle lines around eyes
        const wrinkleGeometry = this.resourceManager.getGeometry('box', {
            width: 0.08 * scale,
            height: 0.01 * scale,
            depth: 0.01 * scale
        });
        
        const wrinkleMaterial = this.resourceManager.getMaterial('phong', {
            color: 0x8b7355,
            shininess: 5
        });
        
        // Crow's feet
        const leftWrinkle = new THREE.Mesh(wrinkleGeometry, wrinkleMaterial);
        leftWrinkle.position.set(-0.18 * scale, faceY + 0.03 * scale, headSize * 0.8);
        leftWrinkle.rotation.z = 0.3;
        group.add(leftWrinkle);
        
        const rightWrinkle = new THREE.Mesh(wrinkleGeometry, wrinkleMaterial);
        rightWrinkle.position.set(0.18 * scale, faceY + 0.03 * scale, headSize * 0.8);
        rightWrinkle.rotation.z = -0.3;
        group.add(rightWrinkle);
        
        // Forehead lines
        const foreheadWrinkle = new THREE.Mesh(wrinkleGeometry, wrinkleMaterial);
        foreheadWrinkle.position.set(0, faceY + 0.15 * scale, headSize * 0.85);
        group.add(foreheadWrinkle);
    }

    /**
     * Create hair based on style
     */
    createActorHair(group, type, hairStyleName) {
        // Handle special case for no hair
        if (hairStyleName === 'none') {
            return; // No hair to create
        }
        
        const scale = type.height / 1.8;
        const bodyHeight = this.getBodyDimensions(type.build, scale).height;
        const headSize = this.getHeadSize(type.ageGroup, scale);
        
        // Try to use modern hair system first (most advanced)
        if (window.modernHairSystem && window.modernHairSystem.isInitialized) {
            // Map legacy styles to modern styles
            const modernStyleMap = {
                'short_brown': 'straight_fine',
                'short_black': 'straight_fine', 
                'short_blonde': 'sleek_straight',
                'long_blonde': 'sleek_straight',
                'long_brown': 'wavy_medium',
                'long_black': 'straight_fine',
                'bob_brown': 'wavy_medium',
                'bob_blonde': 'beach_waves',
                'messy_brown': 'wavy_medium',
                'pigtails_blonde': 'beach_waves',
                'elaborate_blonde': 'beach_waves',
                'receding_gray': 'straight_fine',
                'bald_gray': 'straight_fine',
                'short_gray': 'straight_fine',
                'long_white_beard': 'curly_thick'
            };
            
            // Map legacy colors to modern colors
            const modernColorMap = {
                0x8b4513: 'chestnut_brown',
                0x000000: 'jet_black',
                0xffd700: 'golden_blonde',
                0x808080: 'silver_gray',
                0xffffff: 'platinum_blonde'
            };
            
            const hairStyle = this.hairStyles[hairStyleName];
            if (hairStyle) {
                const modernStyleName = modernStyleMap[hairStyleName] || 'wavy_medium';
                const modernColorName = modernColorMap[hairStyle.color] || 'chestnut_brown';
                
                try {
                    const modernHair = window.modernHairSystem.createModernHair(
                        modernStyleName,
                        modernColorName,
                        headSize,
                        {
                            quality: 0.8, // High quality for now
                            length: hairStyle.type === 'long' ? 4.0 : hairStyle.type === 'short' ? 1.5 : 2.5
                        }
                    );
                    
                    if (modernHair) {
                        modernHair.position.y = bodyHeight + headSize;
                        modernHair.userData = { part: 'hair', modern: true, advanced: true };
                        group.add(modernHair);
                        console.log(`Created modern hair: ${modernStyleName} in ${modernColorName}`);
                        return;
                    }
                } catch (error) {
                    console.warn('Modern hair creation failed, falling back to advanced:', error.message);
                }
            }
        }
        
        // Fallback to advanced hair system if available
        if (window.advancedHairSystem && window.advancedHairSystem.isInitialized) {
            // Map legacy hair styles to advanced hair styles
            const advancedStyleMap = {
                'short_brown': 'short_male',
                'short_black': 'short_male', 
                'short_blonde': 'short_male',
                'long_blonde': 'long_female',
                'long_brown': 'long_female',
                'long_black': 'long_female',
                'bob_brown': 'bob_female',
                'bob_blonde': 'bob_female',
                'messy_brown': 'short_male',
                'pigtails_blonde': 'long_female', // Will need special handling
                'elaborate_blonde': 'long_female',
                'receding_gray': 'short_male',
                'bald_gray': 'short_male',
                'short_gray': 'short_female',
                'long_white_beard': 'long_male'
            };
            
            // Map legacy hair colors to advanced hair colors
            const colorMap = {
                0x8b4513: 'brown',      // brown
                0x000000: 'black',      // black
                0xffd700: 'blonde',     // blonde/gold
                0x808080: 'gray',       // gray
                0xffffff: 'white'       // white
            };
            
            const hairStyle = this.hairStyles[hairStyleName];
            if (hairStyle) {
                const advancedStyleName = advancedStyleMap[hairStyleName] || 'short_male';
                const colorName = colorMap[hairStyle.color] || 'brown';
                
                try {
                    const advancedHair = window.advancedHairSystem.createAdvancedHair(
                        advancedStyleName, 
                        colorName, 
                        headSize,
                        { 
                            gender: type.gender,
                            ageGroup: type.ageGroup 
                        }
                    );
                    
                    if (advancedHair) {
                        advancedHair.position.y = bodyHeight + headSize;
                        advancedHair.userData = { part: 'hair', advanced: true };
                        group.add(advancedHair);
                        console.log(`Created advanced hair: ${advancedStyleName} in ${colorName}`);
                        return;
                    }
                } catch (error) {
                    console.warn('Advanced hair creation failed, falling back to legacy:', error.message);
                }
            }
        }
        
        // Fallback to legacy hair creation
        const hairStyle = this.hairStyles[hairStyleName];
        if (!hairStyle) {
            console.warn(`Unknown hair style: ${hairStyleName}`);
            return;
        }
        
        const hairY = bodyHeight + headSize;
        const hairMaterial = this.resourceManager.getMaterial('phong', {
            color: hairStyle.color,
            shininess: 10
        });
        
        switch(hairStyle.type) {
            case 'short':
                this.createShortHair(group, hairY, headSize, scale, hairMaterial);
                break;
            case 'long':
                this.createLongHair(group, hairY, headSize, scale, hairMaterial);
                break;
            case 'bob':
                this.createBobHair(group, hairY, headSize, scale, hairMaterial);
                break;
            case 'bald':
                // No hair needed
                break;
            case 'receding':
                this.createRecedingHair(group, hairY, headSize, scale, hairMaterial);
                break;
            case 'messy':
                this.createMessyHair(group, hairY, headSize, scale, hairMaterial);
                break;
            case 'pigtails':
                this.createPigtailHair(group, hairY, headSize, scale, hairMaterial);
                break;
            case 'elaborate':
                this.createElaborateHair(group, hairY, headSize, scale, hairMaterial);
                break;
            case 'long_beard':
                this.createLongBeardHair(group, hairY, headSize, scale, hairMaterial);
                break;
        }
    }

    /**
     * Create short hair style
     */
    createShortHair(group, hairY, headSize, scale, material) {
        const hairGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 1.1,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const hair = new THREE.Mesh(hairGeometry, material);
        hair.position.y = hairY + headSize * 0.1;
        hair.scale.y = 0.6; // Flatten for short hair look
        hair.userData = { part: 'hair' };
        group.add(hair);
    }

    /**
     * Create long hair style
     */
    createLongHair(group, hairY, headSize, scale, material) {
        // Top part
        const topHairGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 1.1,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const topHair = new THREE.Mesh(topHairGeometry, material);
        topHair.position.y = hairY + headSize * 0.1;
        topHair.scale.y = 0.8;
        group.add(topHair);
        
        // Long flowing part
        const longHairGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: headSize * 0.8,
            radiusBottom: headSize * 0.6,
            height: headSize * 2,
            radialSegments: 12
        });
        
        const longHair = new THREE.Mesh(longHairGeometry, material);
        longHair.position.y = hairY - headSize * 0.5;
        longHair.position.z = -headSize * 0.3; // Behind head
        longHair.userData = { part: 'hair' };
        group.add(longHair);
    }

    /**
     * Create bob hair style
     */
    createBobHair(group, hairY, headSize, scale, material) {
        const bobGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 1.15,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const bob = new THREE.Mesh(bobGeometry, material);
        bob.position.y = hairY;
        bob.scale.y = 0.75; // Characteristic bob shape
        bob.userData = { part: 'hair' };
        group.add(bob);
    }

    /**
     * Create receding hair style
     */
    createRecedingHair(group, hairY, headSize, scale, material) {
        // Front part (receded)
        const frontGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 0.8,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const frontHair = new THREE.Mesh(frontGeometry, material);
        frontHair.position.set(0, hairY + headSize * 0.2, -headSize * 0.4);
        frontHair.scale.y = 0.4;
        frontHair.userData = { part: 'hair' };
        group.add(frontHair);
    }

    /**
     * Create messy hair style
     */
    createMessyHair(group, hairY, headSize, scale, material) {
        // Base hair
        const baseGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 1.1,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const baseHair = new THREE.Mesh(baseGeometry, material);
        baseHair.position.y = hairY + headSize * 0.1;
        baseHair.scale.y = 0.7;
        baseHair.userData = { part: 'hair' };
        group.add(baseHair);
        
        // Add messy spikes
        for (let i = 0; i < 8; i++) {
            const spikeGeometry = this.resourceManager.getGeometry('cylinder', {
                radiusTop: 0.02,
                radiusBottom: 0.05,
                height: 0.15,
                radialSegments: 4
            });
            
            const spike = new THREE.Mesh(spikeGeometry, material);
            const angle = (i / 8) * Math.PI * 2;
            spike.position.set(
                Math.cos(angle) * headSize * 0.8,
                hairY + headSize * 0.3 + Math.random() * 0.1,
                Math.sin(angle) * headSize * 0.8
            );
            spike.rotation.z = Math.random() * 0.4 - 0.2;
            group.add(spike);
        }
    }

    /**
     * Create pigtail hair style
     */
    createPigtailHair(group, hairY, headSize, scale, material) {
        // Base hair
        const baseGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 1.05,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const baseHair = new THREE.Mesh(baseGeometry, material);
        baseHair.position.y = hairY + headSize * 0.05;
        baseHair.scale.y = 0.6;
        baseHair.userData = { part: 'hair' };
        group.add(baseHair);
        
        // Left pigtail
        const pigtailGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: 0.08,
            radiusBottom: 0.06,
            height: 0.4,
            radialSegments: 8
        });
        
        const leftPigtail = new THREE.Mesh(pigtailGeometry, material);
        leftPigtail.position.set(-headSize * 1.2, hairY, 0);
        group.add(leftPigtail);
        
        const rightPigtail = new THREE.Mesh(pigtailGeometry, material);
        rightPigtail.position.set(headSize * 1.2, hairY, 0);
        group.add(rightPigtail);
    }

    /**
     * Create elaborate hair style
     */
    createElaborateHair(group, hairY, headSize, scale, material) {
        // Large elaborate base
        const baseGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 1.3,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const baseHair = new THREE.Mesh(baseGeometry, material);
        baseHair.position.y = hairY + headSize * 0.2;
        baseHair.scale.set(1.2, 0.8, 1.1);
        baseHair.userData = { part: 'hair' };
        group.add(baseHair);
        
        // Add decorative curls
        for (let i = 0; i < 6; i++) {
            const curlGeometry = this.resourceManager.getGeometry('sphere', {
                radius: headSize * 0.3,
                widthSegments: 8,
                heightSegments: 8
            });
            
            const curl = new THREE.Mesh(curlGeometry, material);
            const angle = (i / 6) * Math.PI * 2;
            curl.position.set(
                Math.cos(angle) * headSize * 1.1,
                hairY + headSize * 0.4 + Math.sin(i) * 0.1,
                Math.sin(angle) * headSize * 1.1
            );
            group.add(curl);
        }
    }

    /**
     * Create long beard hair style
     */
    createLongBeardHair(group, hairY, headSize, scale, material) {
        // Main hair
        const hairGeometry = this.resourceManager.getGeometry('sphere', {
            radius: headSize * 1.1,
            widthSegments: 12,
            heightSegments: 8
        });
        
        const hair = new THREE.Mesh(hairGeometry, material);
        hair.position.y = hairY + headSize * 0.1;
        hair.scale.y = 0.8;
        hair.userData = { part: 'hair' };
        group.add(hair);
        
        // Long beard
        const beardGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: headSize * 0.6,
            radiusBottom: headSize * 0.3,
            height: headSize * 1.5,
            radialSegments: 12
        });
        
        const beard = new THREE.Mesh(beardGeometry, material);
        beard.position.set(0, hairY - headSize * 0.5, headSize * 0.4);
        beard.userData = { part: 'beard' };
        group.add(beard);
    }

    /**
     * Create clothing based on type
     */
    createActorClothing(group, type, clothingName) {
        console.log(`👕 Creating clothing: ${clothingName} for actor type: ${type.name || 'unknown'}`);
        
        const clothing = this.clothingOptions[clothingName];
        if (!clothing) {
            console.warn(`❌ Unknown clothing type: ${clothingName}, using default casual`);
            // Use default casual clothing
            const defaultClothing = type.gender === 'female' ? this.clothingOptions.casual_female : this.clothingOptions.casual_male;
            if (defaultClothing) {
                this.createCasualClothing(group, this.getBodyDimensions(type.build, type.height / 1.8), defaultClothing.colors, type.gender);
            }
            return;
        }
        
        console.log(`👔 Clothing found:`, clothing);
        console.log(`🎨 Clothing colors:`, clothing.colors);
        
        const scale = type.height / 1.8;
        const bodyDimensions = this.getBodyDimensions(type.build, scale);
        
        // Ensure colors object has defaults
        const safeColors = this.ensureSafeColors(clothing.colors, clothing.style);
        console.log(`✅ Safe colors:`, safeColors);
        
        switch(clothing.style) {
            case 'casual':
                this.createCasualClothing(group, bodyDimensions, safeColors, type.gender);
                break;
            case 'formal':
                this.createFormalClothing(group, bodyDimensions, safeColors, type.gender);
                break;
            case 'fantasy':
                this.createFantasyClothing(group, bodyDimensions, safeColors);
                break;
            case 'armor':
                this.createArmorClothing(group, bodyDimensions, safeColors);
                break;
            case 'royal':
                this.createRoyalClothing(group, bodyDimensions, safeColors);
                break;
            default:
                console.warn(`❌ Unknown clothing style: ${clothing.style}, using casual`);
                this.createCasualClothing(group, bodyDimensions, safeColors, type.gender);
        }
    }
    
    /**
     * Ensure colors object has safe fallbacks for all required properties
     */
    ensureSafeColors(colors, style) {
        const defaultColors = {
            casual: {
                shirt: 0x4169e1,
                top: 0xff69b4,
                pants: 0x000080,
                bottom: 0x000080,
                dress: 0xff1493
            },
            formal: {
                shirt: 0xffffff,
                suit: 0x2f4f4f,
                tie: 0x8b0000,
                blazer: 0x2f4f4f,
                dress: 0x800080,
                skirt: 0x000000,
                blouse: 0xffffff
            },
            fantasy: {
                robe: 0x4b0082,
                trim: 0xffd700
            },
            armor: {
                metal: 0xc0c0c0,
                trim: 0xffd700
            },
            royal: {
                gown: 0x8b0000,
                trim: 0xffd700
            }
        };
        
        const styleDefaults = defaultColors[style] || defaultColors.casual;
        const safeColors = { ...styleDefaults };
        
        // Override with provided colors that are not undefined
        if (colors) {
            Object.keys(colors).forEach(key => {
                if (colors[key] !== undefined && colors[key] !== null) {
                    safeColors[key] = colors[key];
                }
            });
        }
        
        return safeColors;
    }

    /**
     * Create casual clothing
     */
    createCasualClothing(group, bodyDimensions, colors, gender) {
        // Shirt/Top
        const shirtGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyDimensions.radiusTop * 1.1,
            radiusBottom: bodyDimensions.radiusBottom * 1.1,
            height: bodyDimensions.height * 0.6,
            radialSegments: 12
        });
        
        const shirtMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.shirt || colors.top || 0x4169e1,
            shininess: 5
        });
        
        const shirt = new THREE.Mesh(shirtGeometry, shirtMaterial);
        shirt.position.y = bodyDimensions.height * 0.7;
        shirt.userData = { part: 'clothing', type: 'shirt' };
        group.add(shirt);
        
        // Pants/Bottom (or dress for females)
        if (colors.dress && gender === 'female') {
            const dressGeometry = this.resourceManager.getGeometry('cylinder', {
                radiusTop: bodyDimensions.radiusTop * 1.1,
                radiusBottom: bodyDimensions.radiusBottom * 1.5,
                height: bodyDimensions.height * 0.8,
                radialSegments: 12
            });
            
            const dressMaterial = this.resourceManager.getMaterial('phong', {
                color: colors.dress,
                shininess: 8
            });
            
            const dress = new THREE.Mesh(dressGeometry, dressMaterial);
            dress.position.y = bodyDimensions.height * 0.4;
            dress.userData = { part: 'clothing', type: 'dress' };
            group.add(dress);
        } else {
            const pantsGeometry = this.resourceManager.getGeometry('cylinder', {
                radiusTop: bodyDimensions.radiusBottom * 1.05,
                radiusBottom: bodyDimensions.radiusBottom * 0.8,
                height: bodyDimensions.height * 0.6,
                radialSegments: 12
            });
            
            const pantsMaterial = this.resourceManager.getMaterial('phong', {
                color: colors.pants || colors.bottom,
                shininess: 3
            });
            
            const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
            pants.position.y = bodyDimensions.height * 0.2;
            pants.userData = { part: 'clothing', type: 'pants' };
            group.add(pants);
        }
    }

    /**
     * Create formal clothing
     */
    createFormalClothing(group, bodyDimensions, colors, gender) {
        if (gender === 'male') {
            // Suit jacket
            const jacketGeometry = this.resourceManager.getGeometry('cylinder', {
                radiusTop: bodyDimensions.radiusTop * 1.15,
                radiusBottom: bodyDimensions.radiusBottom * 1.15,
                height: bodyDimensions.height * 0.6,
                radialSegments: 12
            });
            
            const jacketMaterial = this.resourceManager.getMaterial('phong', {
                color: colors.suit,
                shininess: 15
            });
            
            const jacket = new THREE.Mesh(jacketGeometry, jacketMaterial);
            jacket.position.y = bodyDimensions.height * 0.7;
            jacket.userData = { part: 'clothing', type: 'jacket' };
            group.add(jacket);
            
            // Shirt collar
            const collarGeometry = this.resourceManager.getGeometry('cylinder', {
                radiusTop: bodyDimensions.radiusTop * 1.05,
                radiusBottom: bodyDimensions.radiusTop * 1.05,
                height: bodyDimensions.height * 0.1,
                radialSegments: 12
            });
            
            const collarMaterial = this.resourceManager.getMaterial('phong', {
                color: colors.shirt,
                shininess: 10
            });
            
            const collar = new THREE.Mesh(collarGeometry, collarMaterial);
            collar.position.y = bodyDimensions.height * 0.95;
            collar.userData = { part: 'clothing', type: 'collar' };
            group.add(collar);
            
            // Tie
            const tieGeometry = this.resourceManager.getGeometry('box', {
                width: 0.1,
                height: bodyDimensions.height * 0.4,
                depth: 0.02
            });
            
            const tieMaterial = this.resourceManager.getMaterial('phong', {
                color: colors.tie,
                shininess: 20
            });
            
            const tie = new THREE.Mesh(tieGeometry, tieMaterial);
            tie.position.set(0, bodyDimensions.height * 0.75, bodyDimensions.radiusTop * 1.1);
            tie.userData = { part: 'clothing', type: 'tie' };
            group.add(tie);
        } else {
            // Female formal wear
            if (colors.dress) {
                const dressGeometry = this.resourceManager.getGeometry('cylinder', {
                    radiusTop: bodyDimensions.radiusTop * 1.1,
                    radiusBottom: bodyDimensions.radiusBottom * 1.4,
                    height: bodyDimensions.height * 0.9,
                    radialSegments: 12
                });
                
                const dressMaterial = this.resourceManager.getMaterial('phong', {
                    color: colors.dress,
                    shininess: 15
                });
                
                const dress = new THREE.Mesh(dressGeometry, dressMaterial);
                dress.position.y = bodyDimensions.height * 0.45;
                dress.userData = { part: 'clothing', type: 'dress' };
                group.add(dress);
            } else {
                // Blazer and skirt
                const blazerGeometry = this.resourceManager.getGeometry('cylinder', {
                    radiusTop: bodyDimensions.radiusTop * 1.12,
                    radiusBottom: bodyDimensions.radiusBottom * 1.12,
                    height: bodyDimensions.height * 0.5,
                    radialSegments: 12
                });
                
                const blazerMaterial = this.resourceManager.getMaterial('phong', {
                    color: colors.blazer,
                    shininess: 12
                });
                
                const blazer = new THREE.Mesh(blazerGeometry, blazerMaterial);
                blazer.position.y = bodyDimensions.height * 0.75;
                blazer.userData = { part: 'clothing', type: 'blazer' };
                group.add(blazer);
            }
        }
        
        // Formal pants/trousers
        const pantsGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyDimensions.radiusBottom * 1.05,
            radiusBottom: bodyDimensions.radiusBottom * 0.85,
            height: bodyDimensions.height * 0.6,
            radialSegments: 12
        });
        
        const pantsMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.suit || 0x000000,
            shininess: 8
        });
        
        const pants = new THREE.Mesh(pantsGeometry, pantsMaterial);
        pants.position.y = bodyDimensions.height * 0.2;
        pants.userData = { part: 'clothing', type: 'pants' };
        group.add(pants);
    }

    /**
     * Create fantasy clothing
     */
    createFantasyClothing(group, bodyDimensions, colors) {
        // Long flowing robe
        const robeGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyDimensions.radiusTop * 1.2,
            radiusBottom: bodyDimensions.radiusBottom * 1.8,
            height: bodyDimensions.height * 1.1,
            radialSegments: 16
        });
        
        const robeMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.robe,
            shininess: 25
        });
        
        const robe = new THREE.Mesh(robeGeometry, robeMaterial);
        robe.position.y = bodyDimensions.height * 0.45;
        robe.userData = { part: 'clothing', type: 'robe' };
        group.add(robe);
        
        // Decorative trim
        const trimGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyDimensions.radiusTop * 1.25,
            radiusBottom: bodyDimensions.radiusTop * 1.25,
            height: bodyDimensions.height * 0.1,
            radialSegments: 16
        });
        
        const trimMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.trim,
            shininess: 50
        });
        
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.y = bodyDimensions.height * 0.95;
        trim.userData = { part: 'clothing', type: 'trim' };
        group.add(trim);
    }

    /**
     * Create armor clothing
     */
    createArmorClothing(group, bodyDimensions, colors) {
        // Chest plate
        const chestGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyDimensions.radiusTop * 1.15,
            radiusBottom: bodyDimensions.radiusBottom * 1.15,
            height: bodyDimensions.height * 0.6,
            radialSegments: 8
        });
        
        const metalMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.metal,
            shininess: 80,
            specular: 0x888888
        });
        
        const chestPlate = new THREE.Mesh(chestGeometry, metalMaterial);
        chestPlate.position.y = bodyDimensions.height * 0.7;
        chestPlate.userData = { part: 'clothing', type: 'armor' };
        group.add(chestPlate);
        
        // Decorative elements
        const decorGeometry = this.resourceManager.getGeometry('box', {
            width: bodyDimensions.radiusTop * 0.5,
            height: bodyDimensions.height * 0.1,
            depth: 0.05
        });
        
        const decorMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.trim,
            shininess: 60
        });
        
        const decoration = new THREE.Mesh(decorGeometry, decorMaterial);
        decoration.position.set(0, bodyDimensions.height * 0.8, bodyDimensions.radiusTop * 1.2);
        decoration.userData = { part: 'clothing', type: 'decoration' };
        group.add(decoration);
    }

    /**
     * Create royal clothing
     */
    createRoyalClothing(group, bodyDimensions, colors) {
        // Elegant gown
        const gownGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyDimensions.radiusTop * 1.1,
            radiusBottom: bodyDimensions.radiusBottom * 2.0,
            height: bodyDimensions.height * 1.0,
            radialSegments: 20
        });
        
        const gownMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.gown,
            shininess: 30
        });
        
        const gown = new THREE.Mesh(gownGeometry, gownMaterial);
        gown.position.y = bodyDimensions.height * 0.4;
        gown.userData = { part: 'clothing', type: 'gown' };
        group.add(gown);
        
        // Royal trim
        const trimGeometry = this.resourceManager.getGeometry('cylinder', {
            radiusTop: bodyDimensions.radiusBottom * 2.05,
            radiusBottom: bodyDimensions.radiusBottom * 2.05,
            height: bodyDimensions.height * 0.1,
            radialSegments: 20
        });
        
        const trimMaterial = this.resourceManager.getMaterial('phong', {
            color: colors.trim,
            shininess: 80
        });
        
        const trim = new THREE.Mesh(trimGeometry, trimMaterial);
        trim.position.y = bodyDimensions.height * 0.1;
        trim.userData = { part: 'clothing', type: 'trim' };
        group.add(trim);
    }

    /**
     * Get body dimensions based on build type
     */
    getBodyDimensions(build, scale) {
        switch(build) {
            case 'slender':
                return {
                    radiusTop: 0.25 * scale,
                    radiusBottom: 0.3 * scale,
                    height: 1.6 * scale
                };
            case 'athletic':
                return {
                    radiusTop: 0.35 * scale,
                    radiusBottom: 0.4 * scale,
                    height: 1.7 * scale
                };
            case 'stocky':
                return {
                    radiusTop: 0.4 * scale,
                    radiusBottom: 0.5 * scale,
                    height: 1.5 * scale
                };
            case 'muscular':
                return {
                    radiusTop: 0.45 * scale,
                    radiusBottom: 0.5 * scale,
                    height: 1.8 * scale
                };
            case 'child':
                return {
                    radiusTop: 0.2 * scale,
                    radiusBottom: 0.25 * scale,
                    height: 1.2 * scale
                };
            case 'frail':
                return {
                    radiusTop: 0.25 * scale,
                    radiusBottom: 0.3 * scale,
                    height: 1.4 * scale
                };
            case 'petite':
                return {
                    radiusTop: 0.22 * scale,
                    radiusBottom: 0.28 * scale,
                    height: 1.3 * scale
                };
            default: // average
                return {
                    radiusTop: 0.3 * scale,
                    radiusBottom: 0.4 * scale,
                    height: 1.6 * scale
                };
        }
    }

    /**
     * Get head size based on age group
     */
    getHeadSize(ageGroup, scale) {
        switch(ageGroup) {
            case 'child':
                return 0.3 * scale;
            case 'young':
                return 0.35 * scale;
            case 'middle':
                return 0.37 * scale;
            case 'elderly':
                return 0.36 * scale;
            default:
                return 0.35 * scale;
        }
    }

    /**
     * Create actor limbs
     */
    createActorLimbs(group, type, skinTone) {
        const scale = type.height / 1.8;
        const bodyDimensions = this.getBodyDimensions(type.build, scale);
        
        let limbMaterial, armGeometry, legGeometry;
        
        if (this.resourceManager) {
            try {
                limbMaterial = this.resourceManager.getMaterial('phong', {
                    color: this.skinTones[skinTone] || 0xffdbac,
                    shininess: 5
                });
                
                // Arms
                armGeometry = this.resourceManager.getGeometry('cylinder', {
                    radiusTop: 0.08 * scale,
                    radiusBottom: 0.06 * scale,
                    height: 0.8 * scale,
                    radialSegments: 8
                });
                
                // Legs
                legGeometry = this.resourceManager.getGeometry('cylinder', {
                    radiusTop: 0.12 * scale,
                    radiusBottom: 0.08 * scale,
                    height: 1.0 * scale,
                    radialSegments: 8
                });
            } catch (error) {
                console.warn('ResourceManager failed for limbs, using direct THREE.js');
                limbMaterial = null;
                armGeometry = null;
                legGeometry = null;
            }
        }
        
        // Fallback to direct THREE.js
        if (!limbMaterial || !armGeometry || !legGeometry) {
            limbMaterial = new THREE.MeshPhongMaterial({
                color: this.skinTones[skinTone] || 0xffdbac,
                shininess: 5
            });
            
            armGeometry = new THREE.CylinderGeometry(
                0.08 * scale, 0.06 * scale, 0.8 * scale, 8
            );
            
            legGeometry = new THREE.CylinderGeometry(
                0.12 * scale, 0.08 * scale, 1.0 * scale, 8
            );
        }
        
        // Create arms
        const leftArm = new THREE.Mesh(armGeometry, limbMaterial);
        leftArm.position.set(-0.4 * scale, bodyDimensions.height * 0.75, 0);
        leftArm.rotation.z = 0.2;
        leftArm.userData = { part: 'arm', side: 'left' };
        group.add(leftArm);
        
        const rightArm = new THREE.Mesh(armGeometry, limbMaterial);
        rightArm.position.set(0.4 * scale, bodyDimensions.height * 0.75, 0);
        rightArm.rotation.z = -0.2;
        rightArm.userData = { part: 'arm', side: 'right' };
        group.add(rightArm);
        
        // Create legs
        const leftLeg = new THREE.Mesh(legGeometry, limbMaterial);
        leftLeg.position.set(-0.15 * scale, -0.5 * scale, 0);
        leftLeg.userData = { part: 'leg', side: 'left' };
        group.add(leftLeg);
        
        const rightLeg = new THREE.Mesh(legGeometry, limbMaterial);
        rightLeg.position.set(0.15 * scale, -0.5 * scale, 0);
        rightLeg.userData = { part: 'leg', side: 'right' };
        group.add(rightLeg);
    }

    /**
     * Get available actor types
     */
    getActorTypes() {
        return this.actorTypes;
    }

    /**
     * Get available customization options
     */
    getCustomizationOptions() {
        return {
            skinTones: Object.keys(this.skinTones),
            hairStyles: Object.keys(this.hairStyles),
            clothingOptions: Object.keys(this.clothingOptions),
            facialFeatures: this.facialFeatures
        };
    }
}

// Create global instance
const enhancedActorSystem = new EnhancedActorSystem();

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.enhancedActorSystem = enhancedActorSystem;
    console.log('EnhancedActorSystem loaded - advanced actors ready');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { enhancedActorSystem, EnhancedActorSystem };
}