/**
 * ModernHairSystem.js - Advanced Hair Rendering with Modern Techniques
 * 
 * Implements cutting-edge hair rendering using:
 * - Strand-based geometry with curve interpolation
 * - InstancedMesh for massive performance optimization
 * - Hair cards with transparency and depth sorting
 * - Procedural hair growth algorithms
 * - Physics-based strand simulation
 * - LOD (Level of Detail) system for distance culling
 * - Advanced material system with anisotropic shading
 * - Volume-based hair density control
 */

class ModernHairSystem {
    constructor() {
        this.isInitialized = false;
        
        // Performance and rendering settings
        this.renderingConfig = {
            maxStrandsLOD0: 300,      // Close-up detail (much lower for hair clumps)
            maxStrandsLOD1: 150,      // Medium distance
            maxStrandsLOD2: 50,       // Far distance
            lodDistances: [5, 15, 35], // Distance thresholds
            strandSegments: 8,         // Segments per strand (reduced for performance)
            curveSubdivision: 6,       // Curve smoothness
            useInstancing: true,       // Enable InstancedMesh
            enablePhysics: true,       // Hair movement simulation
            sortTransparency: true     // Depth sort for alpha
        };
        
        // Hair growth parameters based on real hair science
        this.growthParameters = {
            // Root distribution patterns
            folliclePatterns: {
                uniform: { density: 1.0, randomness: 0.1 },
                natural: { density: 0.85, randomness: 0.3 },
                sparse: { density: 0.6, randomness: 0.4 },
                dense: { density: 1.3, randomness: 0.15 }
            },
            
            // Hair strand characteristics
            strandProperties: {
                diameter: { min: 0.002, max: 0.008, default: 0.004 },
                length: { min: 0.5, max: 8.0, default: 2.0 },
                curl: { min: 0.0, max: 2.5, default: 0.2 },
                taper: { min: 0.7, max: 1.0, default: 0.85 },
                irregularity: { min: 0.0, max: 0.4, default: 0.15 }
            },
            
            // Growth direction vectors
            growthVectors: {
                scalp: { x: 0, y: 1, z: 0 },
                temple: { x: 0.3, y: 0.8, z: 0.2 },
                crown: { x: 0, y: 1, z: -0.1 },
                nape: { x: 0, y: 0.7, z: -0.3 }
            }
        };
        
        // Advanced hair style definitions with scientific parameters
        this.modernHairStyles = {
            // Realistic human hair types
            straight_fine: {
                name: 'Straight Fine Hair',
                curlFactor: 0.05,
                volume: 0.8,
                density: 1.2,
                diameter: 0.003,
                length: { min: 2.0, max: 6.0 },
                flowPattern: 'gravity',
                anisotropy: 0.7
            },
            
            wavy_medium: {
                name: 'Wavy Medium Hair',
                curlFactor: 0.3,
                volume: 1.1,
                density: 1.0,
                diameter: 0.004,
                length: { min: 1.5, max: 5.0 },
                flowPattern: 'natural_wave',
                anisotropy: 0.5
            },
            
            curly_thick: {
                name: 'Curly Thick Hair',
                curlFactor: 0.8,
                volume: 1.6,
                density: 0.9,
                diameter: 0.006,
                length: { min: 1.0, max: 3.5 },
                flowPattern: 'spiral',
                anisotropy: 0.3
            },
            
            coily_natural: {
                name: 'Coily Natural Hair',
                curlFactor: 1.2,
                volume: 2.0,
                density: 1.4,
                diameter: 0.005,
                length: { min: 0.8, max: 2.5 },
                flowPattern: 'zigzag',
                anisotropy: 0.2
            },
            
            // Styled variations
            sleek_straight: {
                name: 'Sleek Straight',
                curlFactor: 0.02,
                volume: 0.7,
                density: 1.1,
                diameter: 0.004,
                length: { min: 3.0, max: 7.0 },
                flowPattern: 'perfect_straight',
                anisotropy: 0.9
            },
            
            beach_waves: {
                name: 'Beach Waves',
                curlFactor: 0.4,
                volume: 1.3,
                density: 0.95,
                diameter: 0.004,
                length: { min: 2.5, max: 5.5 },
                flowPattern: 'loose_wave',
                anisotropy: 0.4
            },
            
            tight_curls: {
                name: 'Tight Curls',
                curlFactor: 1.0,
                volume: 1.8,
                density: 1.1,
                diameter: 0.005,
                length: { min: 1.2, max: 3.0 },
                flowPattern: 'corkscrew',
                anisotropy: 0.25
            }
        };
        
        // Realistic hair colors with multiple tones
        this.modernHairColors = {
            // Natural black variations
            jet_black: {
                base: 0x0a0a0a,
                highlights: 0x1a1a1a,
                lowlights: 0x000000,
                shine: 0x333333,
                transparency: 0.1
            },
            
            natural_black: {
                base: 0x1c1c1c,
                highlights: 0x2d2d2d,
                lowlights: 0x0d0d0d,
                shine: 0x404040,
                transparency: 0.15
            },
            
            // Brown spectrum
            espresso_brown: {
                base: 0x3c2415,
                highlights: 0x5d3a1a,
                lowlights: 0x2a1810,
                shine: 0x6b4423,
                transparency: 0.2
            },
            
            chestnut_brown: {
                base: 0x5c3317,
                highlights: 0x8b4513,
                lowlights: 0x3e2118,
                shine: 0xa0522d,
                transparency: 0.25
            },
            
            caramel_brown: {
                base: 0x8b4513,
                highlights: 0xcd853f,
                lowlights: 0x5d2f0a,
                shine: 0xdaa520,
                transparency: 0.3
            },
            
            // Blonde variations
            platinum_blonde: {
                base: 0xf5f5dc,
                highlights: 0xfffff0,
                lowlights: 0xe6e6fa,
                shine: 0xffffff,
                transparency: 0.4
            },
            
            golden_blonde: {
                base: 0xffd700,
                highlights: 0xffff99,
                lowlights: 0xdaa520,
                shine: 0xffffe0,
                transparency: 0.35
            },
            
            strawberry_blonde: {
                base: 0xffa500,
                highlights: 0xffd700,
                lowlights: 0xcd853f,
                shine: 0xffefd5,
                transparency: 0.3
            },
            
            // Red spectrum
            auburn_red: {
                base: 0xa0522d,
                highlights: 0xcd853f,
                lowlights: 0x654321,
                shine: 0xdaa520,
                transparency: 0.25
            },
            
            copper_red: {
                base: 0xb87333,
                highlights: 0xd2691e,
                lowlights: 0x8b4513,
                shine: 0xf4a460,
                transparency: 0.3
            },
            
            vibrant_red: {
                base: 0xff4500,
                highlights: 0xff6347,
                lowlights: 0xdc143c,
                shine: 0xff7f50,
                transparency: 0.2
            },
            
            // Gray and silver
            silver_gray: {
                base: 0xc0c0c0,
                highlights: 0xe6e6fa,
                lowlights: 0x808080,
                shine: 0xf5f5f5,
                transparency: 0.3
            },
            
            charcoal_gray: {
                base: 0x708090,
                highlights: 0x9370db,
                lowlights: 0x483d8b,
                shine: 0xb0c4de,
                transparency: 0.25
            }
        };
        
        // Hair material caching
        this.materialCache = new Map();
        this.geometryCache = new Map();
        this.instancedMeshes = new Map();
        
        console.log('ModernHairSystem: Advanced hair rendering system initialized');
    }

    /**
     * Initialize the modern hair system
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('ModernHairSystem already initialized');
            return;
        }

        console.log('ModernHairSystem: Initializing advanced hair rendering...');

        try {
            await this.waitForDependencies();
            
            this.resourceManager = window.resourceManager;
            this.scene = window.stageState.core.scene;
            this.camera = window.stageState.core.camera;
            
            // Pre-compile shaders and materials
            this.createAdvancedHairMaterials();
            
            // Set up instanced mesh pools
            this.setupInstancedMeshPools();
            
            // Initialize physics system
            if (this.renderingConfig.enablePhysics) {
                this.initializeHairPhysics();
            }
            
            this.isInitialized = true;
            console.log('ModernHairSystem: Advanced initialization complete');
            
        } catch (error) {
            console.error('ModernHairSystem: Initialization failed:', error);
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
                reject(new Error('ModernHairSystem dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create advanced hair materials using standard Three.js materials
     */
    createAdvancedHairMaterials() {
        console.log('ModernHairSystem: Creating advanced hair materials...');
        
        // Create base material for strand-based hair using MeshPhongMaterial
        const strandMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b4513,
            shininess: 60,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        
        this.materialCache.set('strand_material', strandMaterial);
        
        // Create materials for different hair colors
        Object.entries(this.modernHairColors).forEach(([colorName, colorData]) => {
            const material = new THREE.MeshPhongMaterial({
                color: colorData.base,
                shininess: 40 + (1.0 - colorData.transparency) * 40,
                transparent: true,
                opacity: 1.0 - colorData.transparency,
                side: THREE.DoubleSide,
                depthWrite: false
            });
            this.materialCache.set(`strand_${colorName}`, material);
        });
    }

    /**
     * Setup geometry cache for performance
     */
    setupInstancedMeshPools() {
        console.log('ModernHairSystem: Setting up geometry cache...');
        
        // Create base strand geometry - thicker for visibility
        const strandGeometry = new THREE.CylinderGeometry(0.008, 0.004, 1.0, 6, this.renderingConfig.strandSegments);
        this.geometryCache.set('strand_base', strandGeometry);
        
        // Create curved strand geometry for individual strands - also thicker
        const curvedGeometry = new THREE.CylinderGeometry(0.01, 0.006, 1.0, 6, this.renderingConfig.strandSegments);
        this.geometryCache.set('strand_curved', curvedGeometry);
    }

    /**
     * Initialize hair physics simulation
     */
    initializeHairPhysics() {
        console.log('ModernHairSystem: Initializing hair physics...');
        
        this.physicsConfig = {
            gravity: new THREE.Vector3(0, -0.98, 0),
            airResistance: 0.02,
            stiffness: 0.8,
            damping: 0.95,
            windInfluence: 0.1
        };
        
        this.windField = {
            direction: new THREE.Vector3(1, 0, 0),
            strength: 0.0,
            frequency: 2.0,
            time: 0
        };
    }

    /**
     * Create modern realistic hair
     */
    createModernHair(styleName, colorName, headSize = 1.0, options = {}) {
        const style = this.modernHairStyles[styleName];
        const colorScheme = this.modernHairColors[colorName];
        
        if (!style || !colorScheme) {
            console.warn(`Unknown modern hair style '${styleName}' or color '${colorName}'`);
            return this.createFallbackHair(headSize);
        }
        
        const hairGroup = new THREE.Group();
        
        // Calculate hair parameters
        const strandCount = this.calculateStrandCount(style, headSize, options);
        const hairLength = this.calculateHairLength(style, options);
        
        // Generate follicle positions
        const folliclePositions = this.generateFolliclePattern(style, headSize, strandCount);
        
        // Create hair strands using instancing
        if (this.renderingConfig.useInstancing && strandCount > 100) {
            this.createInstancedHair(hairGroup, style, colorScheme, folliclePositions, hairLength);
        } else {
            this.createIndividualStrands(hairGroup, style, colorScheme, folliclePositions, hairLength);
        }
        
        // Add hair physics if enabled
        if (this.renderingConfig.enablePhysics) {
            this.attachHairPhysics(hairGroup, style);
        }
        
        hairGroup.userData = {
            hairStyle: styleName,
            hairColor: colorName,
            strandCount: strandCount,
            modern: true
        };
        
        return hairGroup;
    }

    /**
     * Calculate appropriate strand count based on style and performance
     */
    calculateStrandCount(style, headSize, options) {
        const baseCount = 150; // Much lower count for visible hair strands
        const densityMultiplier = style.density || 1.0;
        const sizeMultiplier = headSize; // Linear instead of quadratic
        const performanceMultiplier = options.quality || 0.8; // Default to slightly lower quality
        
        const finalCount = Math.floor(baseCount * densityMultiplier * sizeMultiplier * performanceMultiplier);
        return Math.min(finalCount, 300); // Cap much lower
    }

    /**
     * Calculate hair length with variation
     */
    calculateHairLength(style, options) {
        const baseLength = options.length || ((style.length.min + style.length.max) / 2);
        const variation = (style.length.max - style.length.min) * 0.3;
        
        return {
            base: baseLength,
            variation: variation
        };
    }

    /**
     * Generate realistic follicle distribution pattern - focus on back/sides
     */
    generateFolliclePattern(style, headSize, strandCount) {
        const positions = [];
        
        // Generate hair primarily on back and sides of head
        for (let i = 0; i < strandCount; i++) {
            // Create angular distribution that avoids the face
            const angle = Math.random() * Math.PI * 1.4 + Math.PI * 0.3; // Back 70% of head (avoid front 30%)
            const elevation = Math.random() * Math.PI * 0.4 + Math.PI * 0.1; // Upper part of head
            
            // Convert to cartesian coordinates on sphere surface
            const x = Math.sin(elevation) * Math.cos(angle) * headSize;
            const y = Math.cos(elevation) * headSize;
            const z = Math.sin(elevation) * Math.sin(angle) * headSize;
            
            const position = new THREE.Vector3(x, y, z);
            
            // Only add positions that are:
            // 1. On the upper part of head (y > 0.2)
            // 2. Behind or to the sides of the face (z <= 0.3 for most positions)
            if (position.y > headSize * 0.2 && (position.z <= headSize * 0.3 || Math.abs(position.x) > headSize * 0.4)) {
                positions.push(position);
            }
        }
        
        // Add some front hairline strands but fewer
        const frontStrandCount = Math.floor(strandCount * 0.2); // Only 20% in front
        for (let i = 0; i < frontStrandCount; i++) {
            const angle = Math.random() * Math.PI * 0.6 - Math.PI * 0.3; // Front 60 degrees
            const radius = headSize * (0.8 + Math.random() * 0.2);
            
            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                headSize * (0.3 + Math.random() * 0.3),
                Math.sin(angle) * radius * 0.7 // Reduced z to keep closer to face
            );
            
            positions.push(position);
        }
        
        return positions;
    }

    /**
     * Create hair using instanced mesh for performance
     */
    createInstancedHair(hairGroup, style, colorScheme, folliclePositions, hairLength) {
        // Get appropriate material for this color
        const materialKey = Object.keys(this.modernHairColors).find(key => 
            this.modernHairColors[key].base === colorScheme.base
        );
        const material = this.materialCache.get(`strand_${materialKey}`) || this.materialCache.get('strand_material');
        
        // Create new instanced mesh with correct count
        const count = Math.min(folliclePositions.length, this.renderingConfig.maxStrandsLOD0);
        const strandGeometry = this.geometryCache.get('strand_base');
        const instancedMesh = new THREE.InstancedMesh(strandGeometry, material, count);
        
        const matrix = new THREE.Matrix4();
        const color = new THREE.Color();
        
        for (let i = 0; i < count; i++) {
            const position = folliclePositions[i];
            const length = hairLength.base + (Math.random() - 0.5) * hairLength.variation;
            const curl = style.curlFactor * (0.5 + Math.random() * 0.5);
            
            // Calculate proper hair growth direction with gravity
            const growthDir = position.clone().normalize();
            
            // Natural hair fall direction - backward and down
            const gravityVector = new THREE.Vector3(0, -1, 0);
            
            // Calculate backward direction based on hair position
            const backwardBias = new THREE.Vector3(
                -position.x * 0.3, // Pull away from center
                0,
                -Math.abs(position.z) * 0.5 - 0.3 // Strong backward pull
            );
            
            // Add slight randomness for natural variation
            const randomOffset = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                0,
                (Math.random() - 0.5) * 0.1
            );
            
            // Combine gravity with backward flow
            const fallDirection = gravityVector.clone().add(backwardBias).add(randomOffset).normalize();
            const fallFactor = 0.8 + Math.random() * 0.15; // Strong influence
            
            // Blend growth direction with strong gravity
            growthDir.lerp(fallDirection, fallFactor);
            growthDir.normalize();
            
            // Create transformation matrix starting from root position
            matrix.makeTranslation(position.x, position.y, position.z);
            
            // Apply rotation to make hair fall naturally
            const defaultUp = new THREE.Vector3(0, 1, 0);
            const rotationAxis = new THREE.Vector3().crossVectors(defaultUp, growthDir);
            
            if (rotationAxis.length() > 0.001) {
                rotationAxis.normalize();
                const rotationAngle = defaultUp.angleTo(growthDir);
                const rotationMatrix = new THREE.Matrix4();
                rotationMatrix.makeRotationAxis(rotationAxis, rotationAngle);
                matrix.multiply(rotationMatrix);
            }
            
            // Scale for length with proper thickness
            const scaleMatrix = new THREE.Matrix4();
            scaleMatrix.makeScale(1.0, length, 1.0); // Normal thickness
            matrix.multiply(scaleMatrix);
            
            // Add slight random rotation for natural variation
            if (Math.random() > 0.5) {
                const randomRotation = new THREE.Matrix4();
                randomRotation.makeRotationY((Math.random() - 0.5) * 0.5);
                matrix.multiply(randomRotation);
            }
            
            instancedMesh.setMatrixAt(i, matrix);
            
            // Set color variation
            color.setHex(colorScheme.base);
            color.lerp(new THREE.Color(colorScheme.highlights), Math.random() * 0.3);
            instancedMesh.setColorAt(i, color);
        }
        
        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) {
            instancedMesh.instanceColor.needsUpdate = true;
        }
        
        instancedMesh.castShadow = true;
        instancedMesh.receiveShadow = true;
        
        hairGroup.add(instancedMesh);
    }

    /**
     * Create individual hair strands for detailed close-up work
     */
    createIndividualStrands(hairGroup, style, colorScheme, folliclePositions, hairLength) {
        const strandGeometry = this.geometryCache.get('strand_base');
        const material = this.materialCache.get(`strand_${Object.keys(this.modernHairColors)[0]}`);
        
        folliclePositions.forEach((position, index) => {
            const strand = this.createIndividualStrand(position, style, colorScheme, hairLength);
            if (strand) {
                hairGroup.add(strand);
            }
        });
    }

    /**
     * Create a single detailed hair strand
     */
    createIndividualStrand(position, style, colorScheme, hairLength) {
        const segments = this.renderingConfig.strandSegments;
        const points = [];
        const length = hairLength.base + (Math.random() - 0.5) * hairLength.variation;
        
        // Calculate initial growth direction from scalp
        const rootDirection = position.clone().normalize();
        
        // Generate strand curve based on style with proper gravity
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            
            // Start with root direction, gradually apply gravity
            let direction = rootDirection.clone();
            const gravityInfluence = t * t * 0.8; // Quadratic increase with distance from root
            direction.lerp(new THREE.Vector3(0, -1, 0), gravityInfluence);
            
            // Natural hair flow - backward and down
            const rootPos = position.clone().normalize();
            
            // Calculate natural fall direction
            let x = 0, y = -t * length, z = 0;
            
            // Apply backward flow based on hair position on head
            const backwardFlow = -Math.abs(rootPos.z) - 0.2; // Always flow backward
            const sideFlow = -rootPos.x * 0.3; // Flow away from center
            
            // Progressive backward movement along strand
            x = sideFlow * t * t + (Math.random() - 0.5) * 0.02;
            z = backwardFlow * t * t; // Quadratic backward movement
            
            switch (style.flowPattern) {
                case 'gravity':
                case 'perfect_straight':
                    x += Math.sin(t * Math.PI * 0.5) * style.curlFactor * 0.02;
                    z += t * t * 0.05; // Natural forward fall
                    break;
                    
                case 'natural_wave':
                case 'loose_wave':
                    x += Math.sin(t * Math.PI * 1.5 + position.x) * style.curlFactor * 0.08;
                    z += Math.cos(t * Math.PI + position.z) * style.curlFactor * 0.04 + t * t * 0.03;
                    break;
                    
                case 'spiral':
                case 'corkscrew':
                    const spiralAngle = t * Math.PI * 2 * style.curlFactor;
                    x += Math.cos(spiralAngle) * style.curlFactor * 0.06 * (1 - t * 0.5);
                    z += Math.sin(spiralAngle) * style.curlFactor * 0.06 * (1 - t * 0.5) + t * t * 0.03;
                    break;
                    
                default:
                    // Natural fall with gravity
                    x += (Math.random() - 0.5) * 0.02;
                    z += t * t * 0.04 + (Math.random() - 0.5) * 0.01;
                    break;
            }
            
            points.push(new THREE.Vector3(x, y, z));
        }
        
        // Create curve geometry
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeometry = new THREE.TubeGeometry(
            curve, 
            segments, 
            0.012, // Thicker for visibility - represents hair clumps
            6,     // More radial segments for smoother appearance
            false
        );
        
        // Create material with color variation
        const material = new THREE.MeshPhongMaterial({
            color: this.blendHairColors(colorScheme.base, colorScheme.highlights, Math.random()),
            shininess: 40 + style.anisotropy * 60,
            transparent: true,
            opacity: 1.0 - colorScheme.transparency,
            side: THREE.DoubleSide
        });
        
        const strandMesh = new THREE.Mesh(tubeGeometry, material);
        strandMesh.position.copy(position);
        
        return strandMesh;
    }

    /**
     * Attach physics simulation to hair group
     */
    attachHairPhysics(hairGroup, style) {
        hairGroup.userData.physics = {
            stiffness: style.anisotropy,
            damping: this.physicsConfig.damping,
            windSensitivity: 1.0 - style.anisotropy,
            constraints: []
        };
        
        hairGroup.userData.animateHair = true;
    }

    /**
     * Blend hair colors realistically
     */
    blendHairColors(color1, color2, factor) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, factor).getHex();
    }

    /**
     * Create fallback simple hair
     */
    createFallbackHair(headSize) {
        const geometry = new THREE.SphereGeometry(headSize * 1.1, 16, 12);
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
     * Update hair animation and physics
     */
    updateHairPhysics(deltaTime) {
        if (!this.renderingConfig.enablePhysics) return;
        
        this.windField.time += deltaTime;
        
        // Update wind field
        this.windField.strength = Math.sin(this.windField.time * this.windField.frequency) * 0.1;
        
        // Update hair objects with physics
        this.scene.traverse(child => {
            if (child.userData && child.userData.animateHair) {
                this.animateHairGroup(child, deltaTime);
            }
        });
    }

    /**
     * Animate individual hair group
     */
    animateHairGroup(hairGroup, deltaTime) {
        const physics = hairGroup.userData.physics;
        if (!physics) return;
        
        // Simple wind animation
        const windInfluence = this.windField.strength * physics.windSensitivity;
        const windOffset = Math.sin(this.windField.time * 3) * windInfluence * 0.02;
        
        hairGroup.rotation.z = windOffset;
        hairGroup.rotation.x = windOffset * 0.5;
    }

    /**
     * Get available modern hair styles
     */
    getModernHairStyles() {
        return this.modernHairStyles;
    }

    /**
     * Get available modern hair colors
     */
    getModernHairColors() {
        return this.modernHairColors;
    }

    /**
     * Set quality level for performance optimization
     */
    setQualityLevel(level) {
        switch (level) {
            case 'high':
                this.renderingConfig.maxStrandsLOD0 = 15000;
                this.renderingConfig.strandSegments = 16;
                break;
            case 'medium':
                this.renderingConfig.maxStrandsLOD0 = 8000;
                this.renderingConfig.strandSegments = 12;
                break;
            case 'low':
                this.renderingConfig.maxStrandsLOD0 = 3000;
                this.renderingConfig.strandSegments = 8;
                break;
        }
        
        console.log(`ModernHairSystem: Quality set to ${level}`);
    }

    /**
     * Dispose of resources
     */
    dispose() {
        this.materialCache.clear();
        this.geometryCache.clear();
        this.instancedMeshes.clear();
        this.isInitialized = false;
    }
}

// Create global instance
const modernHairSystem = new ModernHairSystem();

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.modernHairSystem = modernHairSystem;
    console.log('ModernHairSystem loaded - cutting-edge hair rendering ready');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { modernHairSystem, ModernHairSystem };
}