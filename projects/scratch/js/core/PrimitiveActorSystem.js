/**
 * PrimitiveActorSystem.js - Professional Humanoid Characters from THREE.js Primitives
 * 
 * COMPLETELY SEPARATE from VRM and other systems.
 * Creates sophisticated human characters using only BoxGeometry and SphereGeometry.
 * Based on THREE.js r128 primitive shape tutorials.
 */

class PrimitiveActorSystem {
    constructor() {
        this.isInitialized = false;
        
        // Actor type definitions with specific proportions
        this.actorTypes = {
            human_male: {
                name: 'Male Actor',
                height: 1.8,
                build: 'athletic',
                skinColor: 0xFFDBB3,
                clothingColor: 0x4A90E2,
                hairColor: 0x8B4513
            },
            human_female: {
                name: 'Female Actor',
                height: 1.65,
                build: 'slender',
                skinColor: 0xFFE4C4,
                clothingColor: 0xE74C3C,
                hairColor: 0xFFD700
            },
            young_male: {
                name: 'Young Male',
                height: 1.75,
                build: 'slim',
                skinColor: 0xFFDBB3,
                clothingColor: 0x27AE60,
                hairColor: 0x654321
            },
            young_female: {
                name: 'Young Female',
                height: 1.60,
                build: 'petite',
                skinColor: 0xFFE4C4,
                clothingColor: 0x9B59B6,
                hairColor: 0x8B4513
            },
            child: {
                name: 'Child',
                height: 1.2,
                build: 'child',
                skinColor: 0xFFF0DC,
                clothingColor: 0xF39C12,
                hairColor: 0xFFD700
            },
            elderly_male: {
                name: 'Elderly Male',
                height: 1.70,
                build: 'stocky',
                skinColor: 0xF5DEB3,
                clothingColor: 0x34495E,
                hairColor: 0xC0C0C0
            },
            elderly_female: {
                name: 'Elderly Female',
                height: 1.55,
                build: 'frail',
                skinColor: 0xF5DEB3,
                clothingColor: 0x8E44AD,
                hairColor: 0xD3D3D3
            }
        };
        
        console.log('PrimitiveActorSystem: Initialized with pure THREE.js primitives');
    }

    async initialize() {
        if (this.isInitialized) return;
        
        console.log('PrimitiveActorSystem: Initializing primitive-based character system...');
        
        // No dependencies needed - pure THREE.js primitives
        this.isInitialized = true;
        console.log('✅ PrimitiveActorSystem: Ready - Primitive characters available');
    }

    createPrimitiveActor(actorType) {
        console.log(`🎨 Creating primitive actor: ${actorType}`);
        
        const type = this.actorTypes[actorType];
        if (!type) {
            console.error(`❌ Unknown primitive actor type: ${actorType}`);
            return null;
        }

        const group = new THREE.Group();
        const scale = type.height / 1.8; // Normalize to base height

        // Build proportions based on actor type
        const proportions = this.getProportions(type.build, scale);
        
        // Create body parts
        const torso = this.createTorso(proportions, type.clothingColor);
        const head = this.createHead(proportions, type.skinColor);
        const leftArm = this.createArm(proportions, type.skinColor, 'left');
        const rightArm = this.createArm(proportions, type.skinColor, 'right');
        const leftLeg = this.createLeg(proportions, type.clothingColor, 'left');
        const rightLeg = this.createLeg(proportions, type.clothingColor, 'right');
        const hair = this.createHair(proportions, type.hairColor);
        
        // Create facial features
        const eyes = this.createEyes(proportions);
        const nose = this.createNose(proportions, type.skinColor);
        const mouth = this.createMouth(proportions);
        
        // Assemble character
        group.add(torso);
        group.add(head);
        group.add(leftArm);
        group.add(rightArm);
        group.add(leftLeg);
        group.add(rightLeg);
        group.add(hair);
        group.add(eyes.left);
        group.add(eyes.right);
        group.add(nose);
        group.add(mouth);
        
        // Enable shadows for all parts
        group.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Set metadata
        group.userData = {
            type: 'actor',
            actorType: actorType,
            enhanced: true,
            source: 'primitive',
            name: `${type.name} (Primitive)`,
            id: `primitive_actor_${Date.now()}`
        };
        
        console.log(`✅ Primitive actor created: ${type.name}`);
        return group;
    }

    getProportions(build, scale) {
        const base = {
            // Head
            headSize: 0.15 * scale,
            headY: 1.5 * scale,
            
            // Torso
            torsoWidth: 0.4 * scale,
            torsoHeight: 0.8 * scale,
            torsoDepth: 0.2 * scale,
            torsoY: 0.9 * scale,
            
            // Arms
            armWidth: 0.08 * scale,
            armHeight: 0.6 * scale,
            armDepth: 0.08 * scale,
            armY: 1.1 * scale,
            armSpacing: 0.3 * scale,
            
            // Legs
            legWidth: 0.12 * scale,
            legHeight: 0.8 * scale,
            legDepth: 0.12 * scale,
            legY: 0.4 * scale,
            legSpacing: 0.15 * scale
        };
        
        // Adjust based on build type
        switch (build) {
            case 'slender':
                base.torsoWidth *= 0.8;
                base.armWidth *= 0.9;
                base.legWidth *= 0.9;
                break;
            case 'athletic':
                base.torsoWidth *= 1.1;
                base.armWidth *= 1.2;
                base.legWidth *= 1.1;
                break;
            case 'stocky':
                base.torsoWidth *= 1.3;
                base.torsoHeight *= 0.9;
                base.armWidth *= 1.1;
                base.legWidth *= 1.2;
                break;
            case 'child':
                base.headSize *= 1.2; // Children have proportionally larger heads
                base.torsoHeight *= 0.8;
                base.armHeight *= 0.8;
                base.legHeight *= 0.7;
                break;
            case 'frail':
                base.torsoWidth *= 0.7;
                base.armWidth *= 0.8;
                base.legWidth *= 0.8;
                break;
        }
        
        return base;
    }

    createTorso(props, color) {
        const geometry = new THREE.BoxGeometry(props.torsoWidth, props.torsoHeight, props.torsoDepth);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 30
        });
        const torso = new THREE.Mesh(geometry, material);
        torso.position.y = props.torsoY;
        return torso;
    }

    createHead(props, skinColor) {
        const geometry = new THREE.SphereGeometry(props.headSize, 16, 16);
        const material = new THREE.MeshPhongMaterial({ 
            color: skinColor,
            shininess: 20
        });
        const head = new THREE.Mesh(geometry, material);
        head.position.y = props.headY;
        return head;
    }

    createArm(props, skinColor, side) {
        const geometry = new THREE.BoxGeometry(props.armWidth, props.armHeight, props.armDepth);
        const material = new THREE.MeshPhongMaterial({ 
            color: skinColor,
            shininess: 20
        });
        const arm = new THREE.Mesh(geometry, material);
        arm.position.y = props.armY;
        arm.position.x = side === 'left' ? -(props.armSpacing + props.torsoWidth/2) : (props.armSpacing + props.torsoWidth/2);
        return arm;
    }

    createLeg(props, color, side) {
        const geometry = new THREE.BoxGeometry(props.legWidth, props.legHeight, props.legDepth);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 30
        });
        const leg = new THREE.Mesh(geometry, material);
        leg.position.y = props.legY;
        leg.position.x = side === 'left' ? -props.legSpacing : props.legSpacing;
        return leg;
    }

    createHair(props, hairColor) {
        const geometry = new THREE.SphereGeometry(props.headSize * 1.1, 12, 12);
        const material = new THREE.MeshPhongMaterial({ 
            color: hairColor,
            shininess: 10
        });
        const hair = new THREE.Mesh(geometry, material);
        hair.position.y = props.headY + props.headSize * 0.3;
        hair.scale.y = 0.8; // Flatten slightly
        return hair;
    }

    createEyes(props) {
        const geometry = new THREE.SphereGeometry(props.headSize * 0.15, 8, 8);
        const material = new THREE.MeshPhongMaterial({ color: 0x000000 });
        
        const leftEye = new THREE.Mesh(geometry, material);
        leftEye.position.set(-props.headSize * 0.4, props.headY + props.headSize * 0.2, props.headSize * 0.8);
        
        const rightEye = new THREE.Mesh(geometry, material);
        rightEye.position.set(props.headSize * 0.4, props.headY + props.headSize * 0.2, props.headSize * 0.8);
        
        return { left: leftEye, right: rightEye };
    }

    createNose(props, skinColor) {
        const geometry = new THREE.BoxGeometry(
            props.headSize * 0.2, 
            props.headSize * 0.3, 
            props.headSize * 0.1
        );
        const material = new THREE.MeshPhongMaterial({ 
            color: skinColor,
            shininess: 20
        });
        const nose = new THREE.Mesh(geometry, material);
        nose.position.set(0, props.headY, props.headSize * 0.9);
        return nose;
    }

    createMouth(props) {
        const geometry = new THREE.BoxGeometry(
            props.headSize * 0.4, 
            props.headSize * 0.1, 
            props.headSize * 0.05
        );
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x8B0000,
            shininess: 30
        });
        const mouth = new THREE.Mesh(geometry, material);
        mouth.position.set(0, props.headY - props.headSize * 0.4, props.headSize * 0.85);
        return mouth;
    }

    getActorTypes() {
        return this.actorTypes;
    }

    dispose() {
        this.isInitialized = false;
    }
}

// Create global instance
const primitiveActorSystem = new PrimitiveActorSystem();

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.primitiveActorSystem = primitiveActorSystem;
    console.log('PrimitiveActorSystem loaded - Primitive characters ready');
}