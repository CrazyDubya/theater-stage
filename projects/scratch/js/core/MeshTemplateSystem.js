/**
 * Base Mesh Template System for Procedural Character Generation
 * 
 * This system provides the foundation for converting character specifications
 * into actual 3D geometry. It manages template meshes and handles the
 * procedural deformation needed to create diverse characters.
 * 
 * Features:
 * - Template mesh management and loading
 * - Procedural vertex deformation algorithms
 * - Demographic-specific mesh variations
 * - UV coordinate management and adjustment
 * - Performance optimization for real-time generation
 * 
 * Author: Enhanced Procedural Actor Generation System
 * Version: 1.0.0
 */

class MeshTemplateSystem {
    constructor() {
        /**
         * Cache of loaded template meshes
         * Key: template identifier, Value: Three.js geometry
         */
        this.templateCache = new Map();
        
        /**
         * Demographic template configurations
         * Defines which templates to use for different character types
         */
        this.demographicTemplates = {
            male: {
                adult: 'male_adult_base',
                young: 'male_young_base',
                elderly: 'male_elderly_base',
                child: 'male_child_base'
            },
            female: {
                adult: 'female_adult_base',
                young: 'female_young_base', 
                elderly: 'female_elderly_base',
                child: 'female_child_base'
            },
            'non-binary': {
                adult: 'neutral_adult_base',
                young: 'neutral_young_base',
                elderly: 'neutral_elderly_base',
                child: 'neutral_child_base'
            }
        };
        
        /**
         * Vertex group definitions for targeted deformation
         * Maps anatomical regions to vertex indices for precise control
         */
        this.vertexGroups = {
            head: {
                face: [],
                skull: [],
                jaw: [],
                nose: [],
                eyes: [],
                mouth: []
            },
            body: {
                torso: [],
                chest: [],
                waist: [],
                shoulders: [],
                hips: []
            },
            limbs: {
                arms: [],
                legs: [],
                hands: [],
                feet: []
            }
        };
        
        /**
         * Deformation algorithms for different body parts
         */
        this.deformationMethods = {
            proportional: this.applyProportionalScaling.bind(this),
            facial: this.applyFacialDeformation.bind(this),
            muscular: this.applyMuscleDefinition.bind(this),
            age: this.applyAgeDeformation.bind(this),
            ethnicity: this.applyEthnicityFeatures.bind(this)
        };
        
        /**
         * Performance monitoring
         */
        this.stats = {
            templatesLoaded: 0,
            meshesGenerated: 0,
            averageDeformationTime: 0,
            totalDeformationTime: 0
        };
        
        console.log('🧱 MeshTemplateSystem initialized');
    }
    
    /**
     * Initialize the template system with base meshes
     */
    async initialize() {
        console.log('🔧 Initializing mesh template system...');
        
        try {
            // Load base template meshes
            await this.loadBaseTemplates();
            
            // Generate vertex groups for deformation targeting
            this.generateVertexGroups();
            
            console.log('✅ MeshTemplateSystem initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ MeshTemplateSystem initialization failed:', error);
            // Create fallback procedural meshes
            this.createFallbackTemplates();
            console.log('⚠️ Using procedural fallback templates');
            return true;
        }
    }
    
    /**
     * Load base template meshes from external sources or create procedurally
     */
    async loadBaseTemplates() {
        console.log('📦 Loading base template meshes...');
        
        // For now, create procedural base templates
        // In production, these would be loaded from external files
        await this.createProceduralTemplates();
        
        console.log(`✅ Loaded ${this.templateCache.size} template meshes`);
        this.stats.templatesLoaded = this.templateCache.size;
    }
    
    /**
     * Create procedural base templates using Three.js geometry
     * This generates anatomically reasonable human-like base meshes
     */
    async createProceduralTemplates() {
        const templates = [
            'male_adult_base', 'female_adult_base', 'neutral_adult_base',
            'male_young_base', 'female_young_base', 'neutral_young_base',
            'male_elderly_base', 'female_elderly_base', 'neutral_elderly_base',
            'male_child_base', 'female_child_base', 'neutral_child_base'
        ];
        
        for (const templateId of templates) {
            const geometry = this.createBaseHumanoidGeometry(templateId);
            this.templateCache.set(templateId, geometry);
        }
    }
    
    /**
     * Generate vertex groups for deformation targeting
     */
    generateVertexGroups() {
        console.log('🎯 Generating vertex groups for deformation targeting...');
        
        // For now, just initialize empty groups
        // In a full implementation, this would analyze mesh topology
        this.vertexGroups = {
            head: {
                face: [],
                skull: [],
                jaw: [],
                nose: [],
                eyes: [],
                mouth: []
            },
            body: {
                torso: [],
                chest: [],
                waist: [],
                shoulders: [],
                hips: []
            },
            limbs: {
                arms: [],
                legs: [],
                hands: [],
                feet: []
            }
        };
        
        console.log('✅ Vertex groups generated');
    }
    
    /**
     * Create a base humanoid geometry using procedural generation
     * 
     * @param {string} templateId - Template identifier
     * @returns {THREE.BufferGeometry} - Generated base geometry
     */
    createBaseHumanoidGeometry(templateId) {
        // Parse template properties - format: "gender_ageGroup_base"
        const parts = templateId.split('_');
        const gender = parts[0] || 'non-binary';
        const ageGroup = parts[1] || 'adult';
        
        // Create combined geometry from primitive parts
        const headGeometry = this.createHeadGeometry(gender, ageGroup);
        const torsoGeometry = this.createTorsoGeometry(gender, ageGroup);
        const limbGeometries = this.createLimbGeometries(gender, ageGroup);
        
        // Combine all parts into single geometry
        const combinedGeometry = this.combineGeometries([
            headGeometry,
            torsoGeometry,
            ...limbGeometries
        ]);
        
        // Apply base demographic adjustments
        this.applyBaseDemographicAdjustments(combinedGeometry, gender, ageGroup);
        
        // Generate UV coordinates
        this.generateUVCoordinates(combinedGeometry);
        
        // Compute normals and tangents
        combinedGeometry.computeVertexNormals();
        combinedGeometry.computeTangents();
        
        return combinedGeometry;
    }
    
    /**
     * Create head geometry with proper topology for facial animation
     * 
     * @param {string} gender - Character gender
     * @param {string} ageGroup - Character age group
     * @returns {THREE.BufferGeometry} - Head geometry
     */
    createHeadGeometry(gender, ageGroup) {
        // Base head proportions
        let width = 1.0;
        let height = 1.2;
        let depth = 1.0;
        
        // Adjust for age
        if (ageGroup === 'child') {
            width *= 0.85;
            height *= 0.9;
            depth *= 0.85;
        } else if (ageGroup === 'elderly') {
            width *= 1.05;
            height *= 0.95;
        }
        
        // Adjust for gender
        if (gender === 'male') {
            width *= 1.1;
            height *= 1.05;
            depth *= 1.1;
        } else if (gender === 'female') {
            width *= 0.95;
            height *= 0.98;
            depth *= 0.95;
        }
        
        // Create sphere-based head with proper vertex distribution
        const geometry = new THREE.SphereGeometry(0.5, 32, 24);
        
        // Scale to proper proportions
        geometry.scale(width, height, depth);
        
        // Position head
        geometry.translate(0, 1.6, 0);
        
        return geometry;
    }
    
    /**
     * Create torso geometry with proper proportions
     * 
     * @param {string} gender - Character gender
     * @param {string} ageGroup - Character age group
     * @returns {THREE.BufferGeometry} - Torso geometry
     */
    createTorsoGeometry(gender, ageGroup) {
        // Base torso dimensions
        let width = 1.0;
        let height = 1.2;
        let depth = 0.6;
        
        // Age adjustments
        if (ageGroup === 'child') {
            width *= 0.7;
            height *= 0.8;
            depth *= 0.8;
        } else if (ageGroup === 'elderly') {
            width *= 1.1;
            depth *= 1.1;
        }
        
        // Gender adjustments
        if (gender === 'male') {
            width *= 1.2;
            depth *= 1.1;
        } else if (gender === 'female') {
            width *= 0.9;
            depth *= 0.9;
        }
        
        // Create box-based torso
        const geometry = new THREE.BoxGeometry(width, height, depth, 8, 12, 4);
        
        // Position torso
        geometry.translate(0, 0.6, 0);
        
        // Add organic shaping
        this.organicShaping(geometry, 'torso');
        
        return geometry;
    }
    
    /**
     * Create limb geometries (arms and legs)
     * 
     * @param {string} gender - Character gender
     * @param {string} ageGroup - Character age group
     * @returns {Array<THREE.BufferGeometry>} - Array of limb geometries
     */
    createLimbGeometries(gender, ageGroup) {
        const limbs = [];
        
        // Base limb proportions
        let armLength = 1.4;
        let legLength = 1.8;
        let limbThickness = 0.15;
        
        // Age adjustments
        if (ageGroup === 'child') {
            armLength *= 0.7;
            legLength *= 0.7;
            limbThickness *= 0.8;
        } else if (ageGroup === 'elderly') {
            limbThickness *= 0.9;
        }
        
        // Gender adjustments
        if (gender === 'male') {
            limbThickness *= 1.2;
        } else if (gender === 'female') {
            limbThickness *= 0.9;
        }
        
        // Create arms
        const leftArm = this.createLimbGeometry(armLength, limbThickness, 'arm');
        leftArm.translate(-0.7, 0.9, 0);
        limbs.push(leftArm);
        
        const rightArm = leftArm.clone();
        rightArm.translate(1.4, 0, 0);
        limbs.push(rightArm);
        
        // Create legs
        const leftLeg = this.createLimbGeometry(legLength, limbThickness * 1.3, 'leg');
        leftLeg.translate(-0.3, -0.9, 0);
        limbs.push(leftLeg);
        
        const rightLeg = leftLeg.clone();
        rightLeg.translate(0.6, 0, 0);
        limbs.push(rightLeg);
        
        return limbs;
    }
    
    /**
     * Create individual limb geometry
     * 
     * @param {number} length - Limb length
     * @param {number} thickness - Limb thickness
     * @param {string} type - Limb type ('arm' or 'leg')
     * @returns {THREE.BufferGeometry} - Limb geometry
     */
    createLimbGeometry(length, thickness, type) {
        // Create cylinder-based limb with proper segmentation
        const segments = Math.max(8, Math.floor(length * 6));
        const geometry = new THREE.CylinderGeometry(
            thickness * 0.7, // Top radius (smaller)
            thickness,       // Bottom radius (larger)
            length,         // Height
            12,             // Radial segments
            segments        // Height segments
        );
        
        // Position vertically
        geometry.translate(0, -length * 0.5, 0);
        
        // Add organic shaping
        this.organicShaping(geometry, type);
        
        return geometry;
    }
    
    /**
     * Apply organic shaping to make geometry less geometric
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {string} partType - Type of body part
     */
    organicShaping(geometry, partType) {
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        
        // Apply subtle noise-based deformation
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Calculate noise value
            const noiseScale = 0.1;
            const noise = this.simpleNoise3D(x * 5, y * 5, z * 5) * noiseScale;
            
            // Apply deformation based on part type
            if (partType === 'torso') {
                // Subtle waist narrowing
                const waistFactor = Math.max(0, 1 - Math.abs(y) * 0.3);
                positions[i] *= (1 + noise * waistFactor);
                positions[i + 2] *= (1 + noise * waistFactor);
            } else if (partType === 'arm' || partType === 'leg') {
                // Muscle-like bulging
                const muscleFactor = Math.sin(y * Math.PI * 0.5) * 0.5 + 0.5;
                const radius = Math.sqrt(x * x + z * z);
                const newRadius = radius * (1 + noise * muscleFactor);
                if (radius > 0) {
                    positions[i] = (x / radius) * newRadius;
                    positions[i + 2] = (z / radius) * newRadius;
                }
            }
        }
        
        positionAttribute.needsUpdate = true;
    }
    
    /**
     * Combine multiple geometries into a single mesh
     * 
     * @param {Array<THREE.BufferGeometry>} geometries - Geometries to combine
     * @returns {THREE.BufferGeometry} - Combined geometry
     */
    combineGeometries(geometries) {
        // Use Three.js BufferGeometryUtils if available, otherwise manual combination
        if (typeof THREE.BufferGeometryUtils !== 'undefined') {
            return THREE.BufferGeometryUtils.mergeBufferGeometries(geometries);
        }
        
        // Manual combination fallback
        let totalVertices = 0;
        let totalIndices = 0;
        
        // Count total vertices and indices
        for (const geom of geometries) {
            const positions = geom.getAttribute('position');
            const indices = geom.getIndex();
            
            totalVertices += positions.count;
            if (indices) {
                totalIndices += indices.count;
            } else {
                totalIndices += positions.count;
            }
        }
        
        // Create combined arrays
        const combinedPositions = new Float32Array(totalVertices * 3);
        const combinedNormals = new Float32Array(totalVertices * 3);
        const combinedUVs = new Float32Array(totalVertices * 2);
        const combinedIndices = new Uint32Array(totalIndices);
        
        let vertexOffset = 0;
        let indexOffset = 0;
        let currentVertexIndex = 0;
        
        // Combine all geometries
        for (const geom of geometries) {
            const positions = geom.getAttribute('position');
            const normals = geom.getAttribute('normal');
            const uvs = geom.getAttribute('uv');
            const indices = geom.getIndex();
            
            // Copy positions
            combinedPositions.set(positions.array, vertexOffset * 3);
            
            // Copy normals
            if (normals) {
                combinedNormals.set(normals.array, vertexOffset * 3);
            }
            
            // Copy UVs
            if (uvs) {
                combinedUVs.set(uvs.array, vertexOffset * 2);
            }
            
            // Copy and adjust indices
            if (indices) {
                for (let i = 0; i < indices.count; i++) {
                    combinedIndices[indexOffset + i] = indices.array[i] + currentVertexIndex;
                }
                indexOffset += indices.count;
            } else {
                // Generate indices for non-indexed geometry
                for (let i = 0; i < positions.count; i++) {
                    combinedIndices[indexOffset + i] = currentVertexIndex + i;
                }
                indexOffset += positions.count;
            }
            
            vertexOffset += positions.count;
            currentVertexIndex += positions.count;
        }
        
        // Create final geometry
        const combinedGeometry = new THREE.BufferGeometry();
        combinedGeometry.setAttribute('position', new THREE.BufferAttribute(combinedPositions, 3));
        combinedGeometry.setAttribute('normal', new THREE.BufferAttribute(combinedNormals, 3));
        combinedGeometry.setAttribute('uv', new THREE.BufferAttribute(combinedUVs, 2));
        combinedGeometry.setIndex(new THREE.BufferAttribute(combinedIndices, 1));
        
        return combinedGeometry;
    }
    
    /**
     * Apply base demographic adjustments to geometry
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {string} gender - Character gender
     * @param {string} ageGroup - Character age group
     */
    applyBaseDemographicAdjustments(geometry, gender, ageGroup) {
        // This method applies overall demographic characteristics
        // More specific adjustments will be done during character generation
        
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        
        // Age-based adjustments
        if (ageGroup === 'child') {
            // Overall smaller scale with proportionally larger head
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                if (y > 1.2) { // Head region
                    positions[i] *= 1.1;     // Wider head
                    positions[i + 2] *= 1.1; // Deeper head
                } else {
                    positions[i] *= 0.8;     // Smaller body
                    positions[i + 2] *= 0.8;
                }
            }
        } else if (ageGroup === 'elderly') {
            // Slight stooping and wider midsection
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                if (y < 0.5 && y > -0.5) { // Torso region
                    positions[i] *= 1.05;     // Slightly wider
                    positions[i + 2] *= 1.05;
                }
                if (y > 1.2) { // Head region - slight forward lean
                    positions[i + 2] += 0.02;
                }
            }
        }
        
        positionAttribute.needsUpdate = true;
    }
    
    /**
     * Generate UV coordinates for the combined mesh
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to add UVs to
     */
    generateUVCoordinates(geometry) {
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        const uvs = new Float32Array(positions.length / 3 * 2);
        
        // Simple planar projection for now
        // In production, this would use proper UV unwrapping
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Map world coordinates to UV space
            const u = (x + 2) / 4; // Normalize to 0-1
            const v = (y + 2) / 4; // Normalize to 0-1
            
            const uvIndex = (i / 3) * 2;
            uvs[uvIndex] = u;
            uvs[uvIndex + 1] = v;
        }
        
        geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    }
    
    /**
     * Generate a character mesh from procedural specifications
     * 
     * @param {Object} characterSpecs - Character specifications
     * @returns {THREE.BufferGeometry} - Generated character geometry
     */
    async generateCharacterMesh(characterSpecs) {
        const startTime = performance.now();
        
        console.log('🏭 Generating character mesh...', characterSpecs);
        
        try {
            // Validate character specs
            if (!characterSpecs) {
                throw new Error('Character specifications required');
            }
            
            // Debug logging
            console.log('🔍 Character specs:', characterSpecs);
            console.log('🔍 Available templates:', Object.keys(this.templateCache));
            console.log('🔍 Demographic templates:', this.demographicTemplates);
            
            // Select appropriate base template
            const templateId = this.selectTemplate(characterSpecs);
            console.log('🔍 Selected template ID:', templateId);
            
            const baseGeometry = this.getTemplate(templateId);
            
            if (!baseGeometry) {
                console.error(`❌ Template not found: ${templateId}`);
                console.error(`Available templates: ${Array.from(this.templateCache.keys())}`);
                throw new Error(`Template not found: ${templateId}`);
            }
            
            // Clone the base geometry for modification
            const characterGeometry = baseGeometry.clone();
            
            // Apply procedural deformations
            await this.applyCharacterDeformations(characterGeometry, characterSpecs);
            
            // Update geometry properties
            characterGeometry.computeVertexNormals();
            characterGeometry.computeBoundingBox();
            characterGeometry.computeBoundingSphere();
            
            // Update statistics
            const generationTime = performance.now() - startTime;
            this.updateStats(generationTime);
            
            console.log(`✅ Character mesh generated in ${generationTime.toFixed(2)}ms`);
            
            return characterGeometry;
            
        } catch (error) {
            console.error('❌ Character mesh generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Select appropriate template based on character specifications
     * 
     * @param {Object} specs - Character specifications
     * @returns {string} - Template identifier
     */
    selectTemplate(specs) {
        const gender = specs.gender || 'non-binary';
        const ageGroup = this.mapAgeGroup(specs.ageGroup || 'adult');
        
        // Get template ID from demographic templates
        const genderTemplates = this.demographicTemplates[gender] || this.demographicTemplates['non-binary'];
        
        // Safety check
        if (!genderTemplates) {
            console.warn(`⚠️ Gender templates not found for: ${gender}, falling back to non-binary`);
            const fallbackTemplates = this.demographicTemplates['non-binary'];
            return fallbackTemplates[ageGroup] || fallbackTemplates.adult;
        }
        
        return genderTemplates[ageGroup] || genderTemplates.adult;
    }
    
    /**
     * Map age group to template categories
     * 
     * @param {string} ageGroup - Input age group
     * @returns {string} - Mapped age group
     */
    mapAgeGroup(ageGroup) {
        const ageMap = {
            'child': 'child',
            'teen': 'young',
            'young': 'young',
            'middle': 'adult',
            'elderly': 'elderly'
        };
        
        return ageMap[ageGroup] || 'adult';
    }
    
    /**
     * Get template geometry from cache
     * 
     * @param {string} templateId - Template identifier
     * @returns {THREE.BufferGeometry} - Template geometry
     */
    getTemplate(templateId) {
        return this.templateCache.get(templateId);
    }
    
    /**
     * Apply character-specific deformations to base template
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {Object} specs - Character specifications
     */
    async applyCharacterDeformations(geometry, specs) {
        // Apply deformations in order of dependency
        
        // 1. Proportional scaling (affects overall shape)
        if (specs.body && specs.body.proportions) {
            this.deformationMethods.proportional(geometry, specs.body.proportions);
        }
        
        // 2. Facial feature adjustments
        if (specs.facial) {
            this.deformationMethods.facial(geometry, specs.facial);
        }
        
        // 3. Ethnicity-specific features
        if (specs.ethnicity) {
            this.deformationMethods.ethnicity(geometry, specs.ethnicity, specs.facial);
        }
        
        // 4. Age-specific adjustments
        if (specs.ageGroup) {
            this.deformationMethods.age(geometry, specs.ageGroup);
        }
        
        // 5. Muscle definition
        if (specs.body && specs.body.muscle) {
            this.deformationMethods.muscular(geometry, specs.body.muscle);
        }
    }
    
    /**
     * Apply proportional scaling deformation
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {Object} proportions - Proportional specifications
     */
    applyProportionalScaling(geometry, proportions) {
        console.log('📏 Applying proportional scaling...');
        
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        
        // Define body regions and their Y-coordinate ranges
        const regions = {
            head: { min: 1.2, max: 2.0, scale: 1.0 },
            torso: { min: 0.0, max: 1.2, scale: proportions.torso || 1.0 },
            legs: { min: -1.8, max: 0.0, scale: proportions.legs || 1.0 },
            arms: { min: 0.2, max: 1.5, scale: proportions.arms || 1.0 }
        };
        
        // Apply scaling based on Y position
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Determine which region this vertex belongs to
            for (const [regionName, region] of Object.entries(regions)) {
                if (y >= region.min && y <= region.max) {
                    if (regionName === 'torso') {
                        // Scale torso proportionally
                        positions[i] *= region.scale;
                        positions[i + 2] *= region.scale;
                    } else if (regionName === 'legs' || regionName === 'arms') {
                        // Scale limbs
                        positions[i + 1] *= region.scale;
                    }
                    break;
                }
            }
        }
        
        positionAttribute.needsUpdate = true;
    }
    
    /**
     * Apply facial feature deformation
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {Object} facial - Facial specifications
     */
    applyFacialDeformation(geometry, facial) {
        console.log('👤 Applying facial deformation...');
        
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        
        // Define facial feature regions (head region: y > 1.2)
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Only modify head region
            if (y > 1.2) {
                // Face width adjustment
                if (facial.faceWidth && Math.abs(x) < 0.4) {
                    positions[i] *= facial.faceWidth;
                }
                
                // Face height adjustment
                if (facial.faceHeight) {
                    positions[i + 1] = 1.2 + (y - 1.2) * facial.faceHeight;
                }
                
                // Nose region (forward projection)
                if (facial.noseLength && Math.abs(x) < 0.15 && y > 1.5 && y < 1.7) {
                    positions[i + 2] += facial.noseLength * 0.1;
                }
                
                // Jawline definition
                if (facial.jawline && y < 1.4) {
                    const jawStrength = facial.jawline;
                    positions[i] *= (1 + jawStrength * 0.1);
                }
                
                // Cheekbone prominence
                if (facial.cheekbones && Math.abs(x) > 0.2 && y > 1.4 && y < 1.6) {
                    const cheekStrength = facial.cheekbones;
                    positions[i + 2] += cheekStrength * 0.05;
                }
            }
        }
        
        positionAttribute.needsUpdate = true;
    }
    
    /**
     * Apply muscle definition deformation
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {Object} muscle - Muscle specifications
     */
    applyMuscleDefinition(geometry, muscle) {
        console.log('💪 Applying muscle definition...');
        
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        
        const definition = muscle.definition || 0.5;
        const definitionFactor = definition * 0.2; // Scale factor
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Apply muscle definition to torso and limbs
            if (y < 1.2 && y > -1.8) { // Body and limbs region
                // Calculate distance from center axis for muscle bulging
                const radius = Math.sqrt(x * x + z * z);
                
                // Different muscle patterns for different body regions
                if (y > 0.5 && y < 1.2) { // Upper torso (chest/shoulders)
                    const muscleFactor = Math.sin(y * Math.PI) * definitionFactor;
                    if (radius > 0.1) {
                        const newRadius = radius * (1 + muscleFactor);
                        positions[i] = (x / radius) * newRadius;
                        positions[i + 2] = (z / radius) * newRadius;
                    }
                } else if (y < 0 && y > -1.0) { // Arms region (approximate)
                    if (Math.abs(x) > 0.5) { // Arm areas
                        const muscleFactor = Math.sin((y + 1.0) * Math.PI) * definitionFactor;
                        const distance = Math.abs(x) - 0.5;
                        positions[i + 2] += muscleFactor * distance;
                    }
                } else if (y < -0.5 && y > -1.8) { // Leg region
                    if (Math.abs(x) < 0.4) { // Leg areas
                        const muscleFactor = Math.sin((y + 1.8) * Math.PI / 1.3) * definitionFactor;
                        if (radius > 0.05) {
                            const newRadius = radius * (1 + muscleFactor);
                            positions[i] = (x / radius) * newRadius;
                            positions[i + 2] = (z / radius) * newRadius;
                        }
                    }
                }
            }
        }
        
        positionAttribute.needsUpdate = true;
    }
    
    /**
     * Apply age-based deformation
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {string} ageGroup - Age group
     */
    applyAgeDeformation(geometry, ageGroup) {
        console.log(`🎂 Applying age deformation: ${ageGroup}`);
        
        if (ageGroup === 'elderly') {
            const positionAttribute = geometry.getAttribute('position');
            const positions = positionAttribute.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                
                // Slight forward head lean
                if (y > 1.2) {
                    positions[i + 2] += 0.03;
                }
                
                // Slight torso curvature
                if (y > 0.5 && y < 1.2) {
                    const curveFactor = (y - 0.5) / 0.7;
                    positions[i + 2] += curveFactor * 0.02;
                }
            }
            
            positionAttribute.needsUpdate = true;
        }
    }
    
    /**
     * Apply ethnicity-specific features
     * 
     * @param {THREE.BufferGeometry} geometry - Geometry to modify
     * @param {string} ethnicity - Ethnicity
     * @param {Object} facial - Facial specifications for context
     */
    applyEthnicityFeatures(geometry, ethnicity, facial) {
        console.log(`🌍 Applying ethnicity features: ${ethnicity}`);
        
        // This method applies subtle adjustments based on anthropometric data
        // The actual facial features are primarily handled by the AI facial correlation system
        
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        
        // Ethnicity-based adjustments (subtle modifications)
        const adjustments = {
            african: { noseWidth: 1.1, lipProjection: 1.05 },
            asian: { faceWidth: 0.95, eyeRegion: 0.98 },
            european: { noseProjection: 1.02, faceLength: 1.01 },
            hispanic: { faceWidth: 1.02, noseWidth: 1.05 },
            middle_eastern: { noseProjection: 1.05, faceLength: 1.02 }
        };
        
        const adjustment = adjustments[ethnicity];
        if (!adjustment) return;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Only modify head region
            if (y > 1.2) {
                // Apply subtle adjustments
                if (adjustment.faceWidth && Math.abs(x) < 0.4) {
                    positions[i] *= adjustment.faceWidth;
                }
                
                if (adjustment.noseProjection && Math.abs(x) < 0.15 && y > 1.5 && y < 1.7) {
                    positions[i + 2] *= adjustment.noseProjection;
                }
                
                if (adjustment.lipProjection && Math.abs(x) < 0.2 && y > 1.4 && y < 1.5) {
                    positions[i + 2] *= adjustment.lipProjection;
                }
            }
        }
        
        positionAttribute.needsUpdate = true;
    }
    
    /**
     * Create fallback templates when external loading fails
     */
    createFallbackTemplates() {
        console.log('🔧 Creating fallback templates...');
        
        // Create a single universal template
        const fallbackGeometry = this.createBaseHumanoidGeometry('non-binary_adult_base');
        
        // Use this template for all demographic combinations
        const allTemplateIds = [];
        for (const gender of Object.keys(this.demographicTemplates)) {
            for (const age of Object.keys(this.demographicTemplates[gender])) {
                const templateId = this.demographicTemplates[gender][age];
                allTemplateIds.push(templateId);
            }
        }
        
        // Cache the same geometry for all templates
        for (const templateId of allTemplateIds) {
            this.templateCache.set(templateId, fallbackGeometry.clone());
        }
        
        this.stats.templatesLoaded = allTemplateIds.length;
    }
    
    /**
     * Simple 3D noise function for organic shaping
     * 
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @returns {number} - Noise value
     */
    simpleNoise3D(x, y, z) {
        // Simple pseudo-random noise function
        return Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5;
    }
    
    /**
     * Update performance statistics
     * 
     * @param {number} generationTime - Time taken for generation
     */
    updateStats(generationTime) {
        this.stats.meshesGenerated++;
        this.stats.totalDeformationTime += generationTime;
        this.stats.averageDeformationTime = this.stats.totalDeformationTime / this.stats.meshesGenerated;
    }
    
    /**
     * Get performance statistics
     * 
     * @returns {Object} - Performance stats
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Dispose of cached resources
     */
    dispose() {
        console.log('🧹 Disposing MeshTemplateSystem...');
        
        // Dispose all cached geometries
        for (const geometry of this.templateCache.values()) {
            geometry.dispose();
        }
        
        this.templateCache.clear();
        
        console.log('✅ MeshTemplateSystem disposed');
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.MeshTemplateSystem = MeshTemplateSystem;
}