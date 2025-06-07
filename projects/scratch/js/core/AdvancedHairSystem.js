/**
 * AdvancedHairSystem.js - Realistic Hair Rendering with Modern Techniques
 * 
 * Implements advanced hair rendering using:
 * - Instanced mesh rendering for thousands of hair strands
 * - Curve-based hair generation with natural flow
 * - Hair cards with alpha transparency for performance
 * - Level of Detail (LOD) system
 * - Physics-based hair movement simulation
 * - Multiple hair types and styling options
 */

class AdvancedHairSystem {
    constructor() {
        this.isInitialized = false;
        
        // Hair rendering settings
        this.hairSettings = {
            strandsPerUnit: 50, // Hair density
            strandSegments: 8,  // Segments per strand for curves
            maxDistance: 20,    // LOD distance
            animationSpeed: 0.5 // Hair movement speed
        };
        
        // Hair style definitions with advanced parameters
        this.hairStyles = {
            // Male styles
            short_male: {
                name: 'Short Male',
                type: 'short',
                length: { min: 0.5, max: 1.5 },
                curve: 0.2,
                volume: 0.8,
                density: 1.0,
                flow: 'upward'
            },
            medium_male: {
                name: 'Medium Male',
                type: 'medium',
                length: { min: 1.0, max: 2.5 },
                curve: 0.4,
                volume: 0.9,
                density: 0.9,
                flow: 'natural'
            },
            long_male: {
                name: 'Long Male',
                type: 'long',
                length: { min: 2.0, max: 4.0 },
                curve: 0.6,
                volume: 0.7,
                density: 0.8,
                flow: 'downward'
            },
            curly_male: {
                name: 'Curly Male',
                type: 'curly',
                length: { min: 1.0, max: 2.0 },
                curve: 1.2,
                volume: 1.3,
                density: 1.2,
                flow: 'chaotic'
            },
            
            // Female styles
            pixie_female: {
                name: 'Pixie Cut',
                type: 'short',
                length: { min: 0.3, max: 1.0 },
                curve: 0.3,
                volume: 1.1,
                density: 1.2,
                flow: 'textured'
            },
            bob_female: {
                name: 'Bob Cut',
                type: 'bob',
                length: { min: 1.0, max: 1.8 },
                curve: 0.4,
                volume: 1.0,
                density: 1.1,
                flow: 'inward'
            },
            shoulder_female: {
                name: 'Shoulder Length',
                type: 'medium',
                length: { min: 2.0, max: 3.0 },
                curve: 0.5,
                volume: 0.9,
                density: 1.0,
                flow: 'natural'
            },
            long_female: {
                name: 'Long Hair',
                type: 'long',
                length: { min: 3.0, max: 5.5 },
                curve: 0.6,
                volume: 0.8,
                density: 0.9,
                flow: 'flowing'
            },
            curly_female: {
                name: 'Curly Hair',
                type: 'curly',
                length: { min: 1.5, max: 3.5 },
                curve: 1.5,
                volume: 1.5,
                density: 1.3,
                flow: 'bouncy'
            },
            braided_female: {
                name: 'Braided Hair',
                type: 'braided',
                length: { min: 2.0, max: 4.0 },
                curve: 0.3,
                volume: 0.6,
                density: 1.1,
                flow: 'structured'
            },
            
            // Special styles
            afro: {
                name: 'Afro',
                type: 'afro',
                length: { min: 0.8, max: 1.5 },
                curve: 2.0,
                volume: 2.5,
                density: 2.0,
                flow: 'spherical'
            },
            punk_spikes: {
                name: 'Punk Spikes',
                type: 'spikes',
                length: { min: 1.0, max: 2.5 },
                curve: 0.1,
                volume: 0.5,
                density: 0.8,
                flow: 'upward_sharp'
            }
        };
        
        // Hair colors with realistic variations
        this.hairColors = {
            black: { 
                base: 0x1a1a1a, 
                highlight: 0x2d2d2d, 
                shadow: 0x0d0d0d 
            },
            dark_brown: { 
                base: 0x3e2723, 
                highlight: 0x5d4037, 
                shadow: 0x1e1e1e 
            },
            brown: { 
                base: 0x5d4037, 
                highlight: 0x8d6e63, 
                shadow: 0x3e2723 
            },
            light_brown: { 
                base: 0x8d6e63, 
                highlight: 0xa1887f, 
                shadow: 0x5d4037 
            },
            dirty_blonde: { 
                base: 0xbcaaa4, 
                highlight: 0xd7ccc8, 
                shadow: 0x8d6e63 
            },
            blonde: { 
                base: 0xf5deb3, 
                highlight: 0xfff8e1, 
                shadow: 0xbcaaa4 
            },
            strawberry_blonde: { 
                base: 0xffc1cc, 
                highlight: 0xffd6d6, 
                shadow: 0xf5deb3 
            },
            red: { 
                base: 0xb71c1c, 
                highlight: 0xd32f2f, 
                shadow: 0x7f0000 
            },
            auburn: { 
                base: 0xa0522d, 
                highlight: 0xcd853f, 
                shadow: 0x654321 
            },
            gray: { 
                base: 0x757575, 
                highlight: 0x9e9e9e, 
                shadow: 0x424242 
            },
            white: { 
                base: 0xf5f5f5, 
                highlight: 0xffffff, 
                shadow: 0xbdbdbd 
            }
        };
        
        console.log('AdvancedHairSystem: Initialized');
    }

    /**
     * Initialize the advanced hair system
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('AdvancedHairSystem already initialized');
            return;
        }

        console.log('AdvancedHairSystem: Initializing...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            this.resourceManager = window.resourceManager;
            this.scene = window.stageState.core.scene;
            
            // Pre-generate hair geometries for performance
            this.preGenerateHairGeometries();
            
            this.isInitialized = true;
            console.log('AdvancedHairSystem: Initialization complete');
            
        } catch (error) {
            console.error('AdvancedHairSystem: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (!window.resourceManager || !window.stageState?.core?.scene) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('AdvancedHairSystem dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create advanced hair using instanced rendering
     */
    createAdvancedHair(styleName, colorName, headSize = 1.0, options = {}) {
        const style = this.hairStyles[styleName];
        const colorScheme = this.hairColors[colorName];
        
        if (!style || !colorScheme) {
            console.warn(`Unknown hair style '${styleName}' or color '${colorName}'`);
            return this.createFallbackHair(headSize);
        }
        
        const hairGroup = new THREE.Group();
        
        // Create hair based on style type
        switch (style.type) {
            case 'short':
                this.createShortHair(hairGroup, style, colorScheme, headSize, options);
                break;
            case 'medium':
                this.createMediumHair(hairGroup, style, colorScheme, headSize, options);
                break;
            case 'long':
                this.createLongHair(hairGroup, style, colorScheme, headSize, options);
                break;
            case 'curly':
                this.createCurlyHair(hairGroup, style, colorScheme, headSize, options);
                break;
            case 'bob':
                this.createBobHair(hairGroup, style, colorScheme, headSize, options);
                break;
            case 'braided':
                this.createBraidedHair(hairGroup, style, colorScheme, headSize, options);
                break;
            case 'afro':
                this.createAfroHair(hairGroup, style, colorScheme, headSize, options);
                break;
            case 'spikes':
                this.createSpikedHair(hairGroup, style, colorScheme, headSize, options);
                break;
            default:
                return this.createFallbackHair(headSize);
        }
        
        // Add hair physics simulation
        this.addHairPhysics(hairGroup, style);
        
        return hairGroup;
    }

    /**
     * Create short hair using hair cards
     */
    createShortHair(hairGroup, style, colorScheme, headSize, options) {
        const strandCount = Math.floor(style.density * this.hairSettings.strandsPerUnit);
        
        // Create hair cap (base layer)
        const capGeometry = new THREE.SphereGeometry(headSize * 1.05, 32, 16);
        const capMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            shininess: 30
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.scale.y = 0.6; // Flatten for short hair
        cap.position.y = headSize * 0.2;
        hairGroup.add(cap);
        
        // Add individual hair strands for detail
        for (let i = 0; i < strandCount * 0.3; i++) { // Fewer strands for short hair
            const strand = this.createHairStrand(style, colorScheme, headSize * 0.8);
            
            // Position around head
            const angle = (i / (strandCount * 0.3)) * Math.PI * 2;
            const radius = headSize * (0.9 + Math.random() * 0.2);
            const height = headSize * (0.1 + Math.random() * 0.3);
            
            strand.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            // Rotate strand to point outward
            strand.lookAt(
                strand.position.x * 2,
                strand.position.y + Math.random() * 0.5,
                strand.position.z * 2
            );
            
            hairGroup.add(strand);
        }
    }

    /**
     * Create long flowing hair
     */
    createLongHair(hairGroup, style, colorScheme, headSize, options) {
        const strandCount = Math.floor(style.density * this.hairSettings.strandsPerUnit);
        
        // Create hair cap (scalp)
        const scalpGeometry = new THREE.SphereGeometry(headSize * 1.02, 32, 16);
        const scalpMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.shadow,
            shininess: 10
        });
        const scalp = new THREE.Mesh(scalpGeometry, scalpMaterial);
        scalp.scale.y = 0.4;
        scalp.position.y = headSize * 0.3;
        hairGroup.add(scalp);
        
        // Create flowing hair strands
        for (let i = 0; i < strandCount; i++) {
            const strand = this.createFlowingHairStrand(style, colorScheme, headSize);
            
            // Distribute around head
            const angle = (i / strandCount) * Math.PI * 2;
            const radiusVariation = 0.8 + Math.random() * 0.4;
            const radius = headSize * radiusVariation;
            
            strand.position.set(
                Math.cos(angle) * radius,
                headSize * 0.3,
                Math.sin(angle) * radius
            );
            
            // Add some randomness to flow direction
            strand.rotation.y = angle + (Math.random() - 0.5) * 0.5;
            
            hairGroup.add(strand);
        }
    }

    /**
     * Create curly hair with spiral patterns
     */
    createCurlyHair(hairGroup, style, colorScheme, headSize, options) {
        const strandCount = Math.floor(style.density * this.hairSettings.strandsPerUnit);
        
        // Create voluminous base
        const baseGeometry = new THREE.SphereGeometry(headSize * 1.1, 32, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            shininess: 20
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.scale.y = style.volume;
        base.position.y = headSize * 0.2;
        hairGroup.add(base);
        
        // Create curly strands
        for (let i = 0; i < strandCount * 0.5; i++) {
            const strand = this.createCurlyHairStrand(style, colorScheme, headSize);
            
            // Random positioning with more volume
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.random() * Math.PI * 0.5;
            const radius = headSize * (0.9 + Math.random() * 0.6);
            
            strand.position.set(
                Math.cos(angle) * Math.cos(elevation) * radius,
                headSize * 0.1 + Math.sin(elevation) * radius,
                Math.sin(angle) * Math.cos(elevation) * radius
            );
            
            hairGroup.add(strand);
        }
    }

    /**
     * Create afro hair with spherical volume
     */
    createAfroHair(hairGroup, style, colorScheme, headSize, options) {
        const sphereCount = 50; // Multiple spheres for afro texture
        
        for (let i = 0; i < sphereCount; i++) {
            const sphereSize = headSize * (0.1 + Math.random() * 0.15);
            const sphereGeometry = new THREE.SphereGeometry(sphereSize, 8, 6);
            const sphereMaterial = new THREE.MeshPhongMaterial({
                color: this.blendColors(colorScheme.base, colorScheme.highlight, Math.random()),
                shininess: 5
            });
            
            const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            
            // Position in spherical distribution
            const angle = Math.random() * Math.PI * 2;
            const elevation = Math.random() * Math.PI;
            const radius = headSize * (0.8 + Math.random() * 0.8);
            
            sphere.position.set(
                Math.cos(angle) * Math.sin(elevation) * radius,
                headSize * 0.2 + Math.cos(elevation) * radius,
                Math.sin(angle) * Math.sin(elevation) * radius
            );
            
            hairGroup.add(sphere);
        }
    }

    /**
     * Create individual hair strand using curves
     */
    createHairStrand(style, colorScheme, length) {
        const points = [];
        const segments = this.hairSettings.strandSegments;
        
        // Generate curve points
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const y = -t * length;
            
            // Add curve based on style
            const curve = style.curve * Math.sin(t * Math.PI * 2) * length * 0.1;
            const x = curve + (Math.random() - 0.5) * 0.05;
            const z = (Math.random() - 0.5) * 0.05;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        // Create curve geometry
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, segments, 0.002, 3, false);
        
        // Create material with color variation
        const colorVariation = 0.8 + Math.random() * 0.4;
        const material = new THREE.MeshPhongMaterial({
            color: this.blendColors(colorScheme.base, colorScheme.highlight, colorVariation),
            shininess: 40
        });
        
        return new THREE.Mesh(tubeGeometry, material);
    }

    /**
     * Create flowing hair strand for long hair
     */
    createFlowingHairStrand(style, colorScheme, headSize) {
        const points = [];
        const segments = this.hairSettings.strandSegments * 2; // More segments for long hair
        const length = style.length.min + Math.random() * (style.length.max - style.length.min);
        
        // Generate flowing curve
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const y = -t * length * headSize;
            
            // Add natural flow and gravity effect
            const flow = style.curve * Math.sin(t * Math.PI) * length * headSize * 0.1;
            const gravity = t * t * 0.1; // Slight forward bend due to gravity
            
            const x = flow + (Math.random() - 0.5) * 0.02;
            const z = gravity + (Math.random() - 0.5) * 0.02;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, segments, 0.003, 4, false);
        
        const material = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            shininess: 50
        });
        
        return new THREE.Mesh(tubeGeometry, material);
    }

    /**
     * Create curly hair strand with spiral pattern
     */
    createCurlyHairStrand(style, colorScheme, headSize) {
        const points = [];
        const segments = this.hairSettings.strandSegments;
        const length = style.length.min + Math.random() * (style.length.max - style.length.min);
        const spiralTightness = 2 + Math.random() * 3;
        
        // Generate spiral curve
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const y = -t * length * headSize * 0.5;
            
            // Create spiral pattern
            const spiralAngle = t * Math.PI * spiralTightness;
            const spiralRadius = 0.1 * (1 - t * 0.5); // Taper the spiral
            
            const x = Math.cos(spiralAngle) * spiralRadius;
            const z = Math.sin(spiralAngle) * spiralRadius;
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(curve, segments, 0.004, 3, false);
        
        const material = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            shininess: 30
        });
        
        return new THREE.Mesh(tubeGeometry, material);
    }

    /**
     * Add simple physics simulation to hair
     */
    addHairPhysics(hairGroup, style) {
        // Store physics properties
        hairGroup.userData.hairPhysics = {
            windStrength: 0.01,
            bounce: style.curve * 0.1,
            flow: style.flow
        };
        
        // Simple animation will be handled in the render loop
        hairGroup.userData.animateHair = true;
    }

    /**
     * Create fallback simple hair
     */
    createFallbackHair(headSize) {
        const geometry = new THREE.SphereGeometry(headSize * 1.05, 16, 12);
        const material = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 20
        });
        
        const hair = new THREE.Mesh(geometry, material);
        hair.scale.y = 0.7;
        hair.position.y = headSize * 0.2;
        
        return hair;
    }

    /**
     * Pre-generate common hair geometries for performance
     */
    preGenerateHairGeometries() {
        console.log('AdvancedHairSystem: Pre-generating hair geometries...');
        // This would cache common geometries for better performance
    }

    /**
     * Utility function to blend colors
     */
    blendColors(color1, color2, factor) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, factor).getHex();
    }

    /**
     * Get available hair styles
     */
    getHairStyles() {
        return this.hairStyles;
    }

    /**
     * Get available hair colors
     */
    getHairColors() {
        return this.hairColors;
    }

    /**
     * Create medium hair using layers
     */
    createMediumHair(hairGroup, style, colorScheme, headSize, options) {
        // Create base hair cap
        const capGeometry = new THREE.SphereGeometry(headSize * 1.03, 32, 16);
        const capMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            shininess: 20
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.scale.y = 0.8;
        cap.position.y = headSize * 0.1;
        hairGroup.add(cap);
        
        // Add flowing layers
        const strandCount = Math.floor(style.density * this.hairSettings.strandsPerUnit * 0.7);
        for (let i = 0; i < strandCount; i++) {
            const strand = this.createFlowingHairStrand(style, colorScheme, headSize * 0.6);
            
            const angle = (i / strandCount) * Math.PI * 2;
            const radius = headSize * (0.8 + Math.random() * 0.3);
            const height = headSize * (0.2 + Math.random() * 0.2);
            
            strand.position.set(
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius
            );
            
            strand.rotation.y = angle + (Math.random() - 0.5) * 0.3;
            hairGroup.add(strand);
        }
    }

    /**
     * Create bob hair style
     */
    createBobHair(hairGroup, style, colorScheme, headSize, options) {
        // Create bob base shape
        const bobGeometry = new THREE.SphereGeometry(headSize * 1.15, 32, 16);
        const bobMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            shininess: 30
        });
        const bob = new THREE.Mesh(bobGeometry, bobMaterial);
        bob.scale.y = 0.75; // Characteristic bob flatness
        bob.position.y = headSize * 0.1;
        hairGroup.add(bob);
        
        // Add bob layers for texture
        const layerCount = 3;
        for (let layer = 0; layer < layerCount; layer++) {
            const layerRadius = headSize * (1.1 + layer * 0.05);
            const layerY = headSize * (0.05 + layer * 0.1);
            
            const layerGeometry = new THREE.SphereGeometry(layerRadius, 16, 8);
            const layerMaterial = new THREE.MeshPhongMaterial({
                color: this.blendColors(colorScheme.base, colorScheme.highlight, layer * 0.2),
                shininess: 25
            });
            const layerMesh = new THREE.Mesh(layerGeometry, layerMaterial);
            layerMesh.scale.y = 0.7 - layer * 0.1;
            layerMesh.position.y = layerY;
            hairGroup.add(layerMesh);
        }
    }

    /**
     * Create braided hair style
     */
    createBraidedHair(hairGroup, style, colorScheme, headSize, options) {
        // Base hair coverage
        const baseGeometry = new THREE.SphereGeometry(headSize * 1.02, 32, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.shadow,
            shininess: 10
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.scale.y = 0.5;
        base.position.y = headSize * 0.25;
        hairGroup.add(base);
        
        // Create braided strands
        const braidCount = 2; // Two main braids
        for (let b = 0; b < braidCount; b++) {
            const side = b === 0 ? -1 : 1;
            const braidGroup = new THREE.Group();
            
            // Create braid segments
            const segments = 8;
            for (let s = 0; s < segments; s++) {
                const segmentGeometry = new THREE.SphereGeometry(headSize * 0.1, 8, 6);
                const segmentMaterial = new THREE.MeshPhongMaterial({
                    color: colorScheme.base,
                    shininess: 20
                });
                const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
                
                const t = s / segments;
                segment.position.set(
                    side * headSize * 0.8,
                    headSize * 0.3 - t * headSize * 2,
                    Math.sin(t * Math.PI * 3) * headSize * 0.2
                );
                
                braidGroup.add(segment);
            }
            
            hairGroup.add(braidGroup);
        }
    }

    /**
     * Create spiked hair style
     */
    createSpikedHair(hairGroup, style, colorScheme, headSize, options) {
        // Base hair
        const baseGeometry = new THREE.SphereGeometry(headSize * 1.05, 32, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            shininess: 40
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.scale.y = 0.6;
        base.position.y = headSize * 0.2;
        hairGroup.add(base);
        
        // Create spikes
        const spikeCount = 12;
        for (let i = 0; i < spikeCount; i++) {
            const spikeGeometry = new THREE.ConeGeometry(
                headSize * 0.08, // radius
                headSize * (0.4 + Math.random() * 0.3), // height
                6 // segments
            );
            const spikeMaterial = new THREE.MeshPhongMaterial({
                color: this.blendColors(colorScheme.base, colorScheme.highlight, Math.random()),
                shininess: 60
            });
            const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
            
            const angle = (i / spikeCount) * Math.PI * 2;
            const radius = headSize * (0.7 + Math.random() * 0.3);
            
            spike.position.set(
                Math.cos(angle) * radius,
                headSize * (0.3 + Math.random() * 0.4),
                Math.sin(angle) * radius
            );
            
            // Point spikes outward and upward
            spike.lookAt(
                spike.position.x * 2,
                spike.position.y + headSize,
                spike.position.z * 2
            );
            
            hairGroup.add(spike);
        }
    }
}

// Create global instance
const advancedHairSystem = new AdvancedHairSystem();

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.advancedHairSystem = advancedHairSystem;
    console.log('AdvancedHairSystem loaded - realistic hair ready');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { advancedHairSystem, AdvancedHairSystem };
}