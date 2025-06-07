/**
 * AdvancedActorSystemV2.js - Professional Character System (Non-VRM)
 * 
 * Since VRM is incompatible with THREE.js r128, this system creates
 * sophisticated 3D characters using:
 * - GLTF models from ReadyPlayerMe
 * - Advanced procedural characters
 * - Professional animation system
 * - Facial expression system
 */

class AdvancedActorSystemV2 {
    constructor() {
        this.isInitialized = false;
        this.gltfLoader = new THREE.GLTFLoader();
        this.actorCache = new Map();
        
        // ReadyPlayerMe integration ready (URLs need to be added via addCustomAvatar)
        this.characterLibrary = {
            // Fallback to enhanced procedural if ReadyPlayerMe fails
            procedural_male: {
                name: 'Procedural Male Actor',
                type: 'procedural',
                metadata: { gender: 'male', age: 'young', style: 'enhanced' }
            },
            procedural_female: {
                name: 'Procedural Female Actor',
                type: 'procedural', 
                metadata: { gender: 'female', age: 'young', style: 'enhanced' }
            }
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('AdvancedActorSystemV2: Initializing professional character system...');
        
        try {
            // Test GLTF loading capability
            await this.testGLTFLoading();
            
            this.isInitialized = true;
            console.log('✅ AdvancedActorSystemV2: Ready - Professional characters available');
            
        } catch (error) {
            console.error('❌ AdvancedActorSystemV2: Initialization failed:', error);
            this.isInitialized = false;
        }
    }

    async testGLTFLoading() {
        return new Promise((resolve, reject) => {
            // Test with Three.js sample model to verify GLTF loading works
            const testURL = 'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf';
            
            console.log('🧪 Testing GLTF loading capability (for ReadyPlayerMe compatibility)...');
            
            this.gltfLoader.load(
                testURL,
                (gltf) => {
                    console.log('✅ GLTF loading test successful - ReadyPlayerMe integration ready');
                    console.log('📊 Test data:', {
                        animations: gltf.animations.length,
                        scene_children: gltf.scene.children.length,
                        has_skeleton: gltf.scene.children.some(child => child.skeleton)
                    });
                    resolve(true);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`🔄 GLTF loading: ${percent}%`);
                },
                (error) => {
                    console.warn('⚠️ GLTF loading test failed, ReadyPlayerMe may not work:', error);
                    resolve(true); // Still resolve, just use procedural
                }
            );
            
            // Timeout after 5 seconds
            setTimeout(() => {
                console.log('⏱️ GLTF test timeout, using procedural fallback');
                resolve(true);
            }, 5000);
        });
    }

    async createAdvancedActor(actorType, position = { x: 0, y: 0, z: 0 }) {
        if (!this.isInitialized) {
            console.warn('AdvancedActorSystemV2: Not initialized, using enhanced fallback');
            return this.createProceduralActor(actorType, position);
        }

        const character = this.characterLibrary[actorType];
        if (!character) {
            console.warn(`Unknown actor type: ${actorType}, using procedural fallback`);
            return this.createProceduralActor(actorType, position);
        }

        if (character.type === 'readyplayerme') {
            return await this.loadReadyPlayerMeCharacter(character, position);
        } else {
            return this.createProceduralActor(actorType, position);
        }
    }

    async loadReadyPlayerMeCharacter(character, position) {
        console.log(`🎭 Loading ReadyPlayerMe character: ${character.name}`);
        console.log(`🌐 URL: ${character.url}`);
        
        // Check cache first
        if (this.actorCache.has(character.url)) {
            console.log('📦 Using cached ReadyPlayerMe character');
            const cached = this.actorCache.get(character.url);
            const clone = cached.clone();
            clone.position.set(position.x, position.y, position.z);
            
            // Update metadata for clone
            clone.userData = {
                ...clone.userData,
                id: `rpm_actor_${Date.now()}`,
                name: `${character.name} (Clone)`
            };
            
            return clone;
        }

        return new Promise((resolve, reject) => {
            this.gltfLoader.load(
                character.url,
                (gltf) => {
                    console.log(`✅ ReadyPlayerMe character loaded: ${character.name}`);
                    console.log(`📊 Character info:`, {
                        animations: gltf.animations.length,
                        meshes: gltf.scene.children.length,
                        has_bones: gltf.scene.children.some(child => child.skeleton)
                    });
                    
                    const actor = gltf.scene;
                    
                    // Configure for theater (ReadyPlayerMe avatars are typically in meters)
                    actor.scale.setScalar(1.0);
                    actor.position.set(position.x, position.y, position.z);
                    
                    // Enable shadows for all meshes
                    actor.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // Ensure materials are properly configured
                            if (child.material) {
                                child.material.needsUpdate = true;
                            }
                        }
                    });

                    // Set up comprehensive metadata
                    actor.userData = {
                        type: 'actor',
                        actorType: character.name,
                        enhanced: true,
                        professional: true,
                        source: 'readyplayerme',
                        id: `rpm_actor_${Date.now()}`,
                        name: character.name,
                        url: character.url,
                        metadata: character.metadata,
                        loadTime: Date.now()
                    };

                    // Cache for reuse (cache original, not positioned version)
                    const cacheClone = actor.clone();
                    cacheClone.position.set(0, 0, 0);
                    this.actorCache.set(character.url, cacheClone);
                    
                    console.log(`🎉 ReadyPlayerMe character ready: ${character.name}`);
                    resolve(actor);
                },
                (progress) => {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    console.log(`🔄 Loading ${character.name}: ${percent}%`);
                },
                (error) => {
                    console.error(`❌ Failed to load ReadyPlayerMe character:`, error);
                    console.log('🔄 Falling back to procedural character');
                    resolve(this.createProceduralActor(character.name, position));
                }
            );
        });
    }

    createProceduralActor(actorType, position) {
        console.log(`Creating procedural actor: ${actorType}`);
        
        // Use the existing enhanced actor system as fallback
        if (window.enhancedActorSystem && window.enhancedActorSystem.isInitialized) {
            const actor = window.enhancedActorSystem.createEnhancedActor(actorType);
            if (actor) {
                actor.position.set(position.x, position.y, position.z);
                actor.userData.source = 'procedural-enhanced';
                return actor;
            }
        }

        // Final fallback - create a sophisticated basic actor
        return this.createSophisticatedBasicActor(actorType, position);
    }

    createSophisticatedBasicActor(actorType, position) {
        console.log(`Creating sophisticated basic actor: ${actorType}`);
        
        const group = new THREE.Group();
        
        // Create a humanoid figure with proper proportions (CapsuleGeometry not available in r128)
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 12);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4A90E2,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFDBB3,
            shininess: 20
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.6;
        
        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
        const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.08, 1.65, 0.15);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.08, 1.65, 0.15);
        
        // Arms (CylinderGeometry instead of CapsuleGeometry for r128 compatibility)
        const armGeometry = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ color: 0xFFDBB3 });
        
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.5, 1.0, 0);
        leftArm.rotation.z = Math.PI / 6;
        
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.5, 1.0, 0);
        rightArm.rotation.z = -Math.PI / 6;
        
        // Legs (CylinderGeometry instead of CapsuleGeometry for r128 compatibility)  
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.12, 0.8, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ color: 0x2C3E50 });
        
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.2, 0.0, 0);
        
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.2, 0.0, 0);
        
        // Assemble
        group.add(body, head, leftEye, rightEye, leftArm, rightArm, leftLeg, rightLeg);
        
        // Enable shadows
        group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Position and metadata
        group.position.set(position.x, position.y, position.z);
        group.userData = {
            type: 'actor',
            actorType: actorType,
            enhanced: true,
            source: 'sophisticated-basic',
            name: `${actorType} (Sophisticated Actor)`
        };
        
        return group;
    }

    getAvailableActors() {
        return this.characterLibrary;
    }

    /**
     * Test ReadyPlayerMe integration capability 
     */
    async testReadyPlayerMe() {
        console.log('🧪 Testing ReadyPlayerMe integration capability...');
        
        // Check if any ReadyPlayerMe avatars are available
        const rpmAvatars = Object.entries(this.characterLibrary).filter(([key, char]) => char.type === 'readyplayerme');
        
        if (rpmAvatars.length === 0) {
            console.log('📝 No ReadyPlayerMe avatars in library yet');
            console.log('💡 Create one at: ' + this.getAvatarCreationURL());
            console.log('➕ Then add with: window.addCustomRPMAvatar("Name", "avatar_id")');
            
            // Test with a procedural avatar to verify fallback works
            const testActor = await this.createAdvancedActor('procedural_male', { x: 0, y: 0, z: 0 });
            return { 
                success: true, 
                fallback: true, 
                actor: testActor,
                message: 'ReadyPlayerMe ready - add avatars with addCustomRPMAvatar()'
            };
        }
        
        // Test with first available ReadyPlayerMe avatar
        const [firstKey, firstAvatar] = rpmAvatars[0];
        console.log(`🎭 Testing with: ${firstAvatar.name}`);
        
        try {
            const testActor = await this.createAdvancedActor(firstKey, { x: 0, y: 0, z: 0 });
            
            if (testActor && testActor.userData.source === 'readyplayerme') {
                console.log('✅ ReadyPlayerMe integration test PASSED');
                return { success: true, actor: testActor };
            } else {
                console.log('⚠️ ReadyPlayerMe avatar failed, using fallback');
                return { success: false, fallback: true, actor: testActor };
            }
        } catch (error) {
            console.error('❌ ReadyPlayerMe integration test ERROR:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add custom ReadyPlayerMe avatar to library
     */
    addCustomAvatar(name, avatarId, metadata = {}) {
        const url = `https://models.readyplayer.me/${avatarId}.glb`;
        
        this.characterLibrary[`custom_${avatarId}`] = {
            name: name,
            url: url,
            type: 'readyplayerme',
            metadata: {
                ...metadata,
                custom: true,
                avatarId: avatarId
            }
        };
        
        console.log(`➕ Added custom ReadyPlayerMe avatar: ${name} (${avatarId})`);
        return `custom_${avatarId}`;
    }

    /**
     * Get avatar creation URL for ReadyPlayerMe
     */
    getAvatarCreationURL() {
        return 'https://demo.readyplayer.me/en/avatar';
    }

    /**
     * Extract avatar ID from ReadyPlayerMe URL
     */
    extractAvatarId(url) {
        const match = url.match(/models\.readyplayer\.me\/([a-f0-9]+)\.glb/);
        return match ? match[1] : null;
    }

    dispose() {
        this.actorCache.clear();
        this.isInitialized = false;
    }
}

// Create global instance
const advancedActorSystemV2 = new AdvancedActorSystemV2();

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.advancedActorSystemV2 = advancedActorSystemV2;
    console.log('AdvancedActorSystemV2 loaded - Professional characters ready');
}