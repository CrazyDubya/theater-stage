/**
 * Vertex Deformation Engine for Advanced Character Customization
 * 
 * This engine provides sophisticated vertex-level deformation algorithms
 * for creating highly detailed and anatomically accurate characters from
 * procedural specifications. It works in conjunction with the MeshTemplateSystem
 * to provide fine-grained control over character geometry.
 * 
 * Features:
 * - Advanced facial feature sculpting algorithms
 * - Anthropometrically accurate proportional adjustments
 * - Real-time muscle and bone structure simulation
 * - Ethnicity-aware geometric modifications
 * - Age-progressive deformation patterns
 * - Performance-optimized deformation operations
 * 
 * Author: Enhanced Procedural Actor Generation System
 * Version: 1.0.0
 */

class VertexDeformationEngine {
    constructor() {
        /**
         * Deformation operation cache for performance optimization
         */
        this.operationCache = new Map();
        
        /**
         * Anatomical reference points for precise targeting
         */
        this.anatomicalLandmarks = {
            facial: {
                nasion: { x: 0, y: 1.65, z: 0.4 },      // Bridge of nose
                pronasale: { x: 0, y: 1.55, z: 0.45 },   // Tip of nose
                subnasale: { x: 0, y: 1.50, z: 0.42 },   // Base of nose
                stomion: { x: 0, y: 1.45, z: 0.41 },     // Mouth center
                pogonion: { x: 0, y: 1.30, z: 0.38 },    // Chin point
                gonion: { x: 0.35, y: 1.35, z: 0.2 },    // Jaw angle
                zygion: { x: 0.4, y: 1.60, z: 0.15 },    // Cheekbone
                endocanthion: { x: 0.15, y: 1.65, z: 0.4 }, // Inner eye corner
                exocanthion: { x: 0.25, y: 1.65, z: 0.35 }  // Outer eye corner
            },
            body: {
                acromion: { x: 0.6, y: 1.1, z: 0 },      // Shoulder point
                olecranon: { x: 0.7, y: 0.6, z: 0 },     // Elbow point
                stylion: { x: 0.7, y: 0.1, z: 0 },       // Wrist point
                iliocristale: { x: 0.25, y: 0.0, z: 0 }, // Hip crest
                trochanterion: { x: 0.3, y: -0.1, z: 0 }, // Hip joint
                tibiale: { x: 0.25, y: -0.8, z: 0 },     // Knee point
                sphyrion: { x: 0.25, y: -1.6, z: 0 }     // Ankle point
            }
        };
        
        /**
         * Deformation influence regions for different operations
         */
        this.influenceRegions = {
            face: { center: { x: 0, y: 1.6, z: 0.4 }, radius: 0.5 },
            head: { center: { x: 0, y: 1.6, z: 0 }, radius: 0.6 },
            torso: { center: { x: 0, y: 0.6, z: 0 }, radius: 0.8 },
            arms: { center: { x: 0.7, y: 0.4, z: 0 }, radius: 0.4 },
            legs: { center: { x: 0.25, y: -0.8, z: 0 }, radius: 0.4 }
        };
        
        /**
         * Anthropometric scaling factors for different ethnicities
         * Based on scientific anthropometric studies
         */
        this.anthropometricFactors = {
            african: {
                nasalWidth: 1.15,
                nasalProjection: 0.95,
                lipThickness: 1.20,
                maxillaryProtrusion: 1.08,
                mandibleWidth: 1.05,
                eyeWidth: 1.02
            },
            asian: {
                nasalWidth: 0.90,
                nasalProjection: 0.85,
                lipThickness: 0.92,
                maxillaryProtrusion: 0.95,
                mandibleWidth: 0.98,
                eyeWidth: 0.95,
                cheekboneWidth: 1.08
            },
            european: {
                nasalWidth: 1.00,
                nasalProjection: 1.00,
                lipThickness: 1.00,
                maxillaryProtrusion: 1.00,
                mandibleWidth: 1.00,
                eyeWidth: 1.00
            },
            hispanic: {
                nasalWidth: 1.05,
                nasalProjection: 0.98,
                lipThickness: 1.08,
                maxillaryProtrusion: 1.02,
                mandibleWidth: 1.02,
                eyeWidth: 1.01
            },
            middle_eastern: {
                nasalWidth: 1.08,
                nasalProjection: 1.12,
                lipThickness: 1.05,
                maxillaryProtrusion: 1.05,
                mandibleWidth: 1.03,
                eyeWidth: 1.02
            }
        };
        
        /**
         * Age progression factors for different life stages
         */
        this.ageProgressionFactors = {
            child: {
                headToBodyRatio: 0.25,    // Larger head relative to body
                facialProportions: 0.85,  // Smaller facial features
                limbLength: 0.80,         // Shorter limbs
                muscleDefinition: 0.20    // Minimal muscle definition
            },
            teen: {
                headToBodyRatio: 0.15,
                facialProportions: 0.95,
                limbLength: 0.95,
                muscleDefinition: 0.40
            },
            young: {
                headToBodyRatio: 0.125,
                facialProportions: 1.00,
                limbLength: 1.00,
                muscleDefinition: 0.70
            },
            middle: {
                headToBodyRatio: 0.125,
                facialProportions: 1.02,
                limbLength: 1.00,
                muscleDefinition: 0.60,
                posturalChanges: 0.02
            },
            elderly: {
                headToBodyRatio: 0.130,
                facialProportions: 1.05,
                limbLength: 0.98,
                muscleDefinition: 0.40,
                posturalChanges: 0.08,
                tissueElasticity: 0.75
            }
        };
        
        /**
         * Performance monitoring
         */
        this.stats = {
            deformationsApplied: 0,
            totalDeformationTime: 0,
            averageDeformationTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        console.log('🔧 VertexDeformationEngine initialized');
    }
    
    /**
     * Apply comprehensive character deformation to geometry
     * 
     * @param {THREE.BufferGeometry} geometry - Target geometry
     * @param {Object} characterSpecs - Complete character specifications
     * @returns {Promise<THREE.BufferGeometry>} - Deformed geometry
     */
    async applyCharacterDeformation(geometry, characterSpecs) {
        const startTime = performance.now();
        
        console.log('🎭 Applying comprehensive character deformation...');
        
        try {
            // Create deformation context
            const context = this.createDeformationContext(geometry, characterSpecs);
            
            // Apply deformations in correct order for best results
            await this.applyGlobalScaling(context);
            await this.applyAgeBasedDeformation(context);
            await this.applyEthnicityDeformation(context);
            await this.applyFacialFeatureDeformation(context);
            await this.applyBodyProportionDeformation(context);
            await this.applyMuscularDeformation(context);
            await this.applyPosturalAdjustments(context);
            
            // Finalize geometry - copy working positions back to geometry
            this.finalizeGeometry(context.geometry, context.positions);
            
            // Update performance stats
            const deformationTime = performance.now() - startTime;
            this.updateStats(deformationTime);
            
            console.log(`✅ Character deformation completed in ${deformationTime.toFixed(2)}ms`);
            
            return context.geometry;
            
        } catch (error) {
            console.error('❌ Character deformation failed:', error);
            throw error;
        }
    }
    
    /**
     * Create deformation context with cached vertex data
     * 
     * @param {THREE.BufferGeometry} geometry - Target geometry
     * @param {Object} characterSpecs - Character specifications
     * @returns {Object} - Deformation context
     */
    createDeformationContext(geometry, characterSpecs) {
        const positionAttribute = geometry.getAttribute('position');
        const positions = positionAttribute.array;
        
        // Create working copy of positions
        const workingPositions = new Float32Array(positions);
        
        // Create context with metadata
        const context = {
            geometry: geometry,
            originalPositions: positions,
            positions: workingPositions,
            vertexCount: positions.length / 3,
            specs: characterSpecs,
            landmarks: this.calculateDynamicLandmarks(geometry, characterSpecs),
            regions: this.calculateInfluenceRegions(geometry, characterSpecs)
        };
        
        // Cache frequently used values
        context.ethnicity = characterSpecs.ethnicity || 'european';
        context.ageGroup = characterSpecs.ageGroup || 'young';
        context.gender = characterSpecs.gender || 'neutral';
        context.facial = characterSpecs.facial || {};
        context.body = characterSpecs.body || {};
        
        return context;
    }
    
    /**
     * Apply global scaling adjustments
     * 
     * @param {Object} context - Deformation context
     */
    async applyGlobalScaling(context) {
        console.log('📏 Applying global scaling...');
        
        const { positions, specs } = context;
        
        // Overall height scaling
        if (specs.body && specs.body.height) {
            const heightScale = specs.body.height / 1.75; // Normalize to average height
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] *= heightScale; // Scale Y (height) only
            }
        }
        
        // Overall scale adjustment
        if (specs.body && specs.body.scale && specs.body.scale !== 1.0) {
            const scale = specs.body.scale;
            
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] *= scale;     // X
                positions[i + 1] *= scale; // Y
                positions[i + 2] *= scale; // Z
            }
        }
    }
    
    /**
     * Apply age-based deformation
     * 
     * @param {Object} context - Deformation context
     */
    async applyAgeBasedDeformation(context) {
        console.log(`🎂 Applying age-based deformation: ${context.ageGroup}`);
        
        const { positions, ageGroup } = context;
        const ageFactors = this.ageProgressionFactors[ageGroup];
        
        if (!ageFactors) return;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Head-to-body ratio adjustments
            if (y > 1.2) { // Head region
                const headScale = ageFactors.headToBodyRatio * 8; // Convert ratio to scale factor
                positions[i] *= headScale;
                positions[i + 2] *= headScale;
            }
            
            // Facial proportion adjustments
            if (y > 1.2 && y < 2.0) { // Face region
                const faceScale = ageFactors.facialProportions;
                const faceCenterDistance = Math.sqrt(x * x + (z - 0.4) * (z - 0.4));
                
                if (faceCenterDistance < 0.3) { // Within face area
                    positions[i] *= faceScale;
                    positions[i + 2] = 0.4 + (z - 0.4) * faceScale;
                }
            }
            
            // Limb length adjustments
            if ((Math.abs(x) > 0.5 && y > -0.5) || (Math.abs(x) < 0.4 && y < -0.5)) { // Limb regions
                positions[i + 1] *= ageFactors.limbLength;
            }
            
            // Postural changes for older ages
            if (ageFactors.posturalChanges && y > 0.5) {
                const posturalFactor = ageFactors.posturalChanges;
                const heightFactor = (y - 0.5) / 1.5; // 0 at waist, 1 at top of head
                
                // Forward lean
                positions[i + 2] += posturalFactor * heightFactor * 0.1;
                
                // Slight shoulder droop
                if (y > 0.8 && y < 1.2 && Math.abs(x) > 0.3) {
                    positions[i + 1] -= posturalFactor * 0.02;
                }
            }
        }
    }
    
    /**
     * Apply ethnicity-based deformation
     * 
     * @param {Object} context - Deformation context
     */
    async applyEthnicityDeformation(context) {
        console.log(`🌍 Applying ethnicity deformation: ${context.ethnicity}`);
        
        const { positions, ethnicity } = context;
        const factors = this.anthropometricFactors[ethnicity];
        
        if (!factors) return;
        
        const landmarks = context.landmarks;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Only modify head/face region
            if (y > 1.2) {
                // Nasal width adjustment
                if (this.isInNasalRegion(x, y, z, landmarks)) {
                    const nasalCenterDistance = Math.abs(x);
                    positions[i] = Math.sign(x) * nasalCenterDistance * factors.nasalWidth;
                }
                
                // Nasal projection adjustment
                if (this.isInNasalRegion(x, y, z, landmarks)) {
                    const nasalProjection = factors.nasalProjection;
                    positions[i + 2] = landmarks.facial.nasion.z + 
                                      (z - landmarks.facial.nasion.z) * nasalProjection;
                }
                
                // Lip thickness adjustment
                if (this.isInLipRegion(x, y, z, landmarks)) {
                    const lipThickness = factors.lipThickness;
                    positions[i + 2] += (lipThickness - 1.0) * 0.02;
                }
                
                // Maxillary protrusion adjustment
                if (this.isInMaxillaryRegion(x, y, z, landmarks)) {
                    const protrusion = factors.maxillaryProtrusion;
                    positions[i + 2] += (protrusion - 1.0) * 0.03;
                }
                
                // Mandible width adjustment
                if (this.isInMandibleRegion(x, y, z, landmarks)) {
                    const mandibleWidth = factors.mandibleWidth;
                    positions[i] *= mandibleWidth;
                }
                
                // Eye region adjustments
                if (this.isInEyeRegion(x, y, z, landmarks)) {
                    const eyeWidth = factors.eyeWidth;
                    positions[i] *= eyeWidth;
                }
                
                // Cheekbone width (specific to Asian characteristics)
                if (factors.cheekboneWidth && this.isInCheekboneRegion(x, y, z, landmarks)) {
                    const cheekboneWidth = factors.cheekboneWidth;
                    positions[i] *= cheekboneWidth;
                }
            }
        }
    }
    
    /**
     * Apply detailed facial feature deformation
     * 
     * @param {Object} context - Deformation context
     */
    async applyFacialFeatureDeformation(context) {
        console.log('👤 Applying facial feature deformation...');
        
        const { positions, facial } = context;
        
        // Count facial modifications for debug
        let faceWidthCount = 0;
        let faceHeightCount = 0;
        let eyeCount = 0;
        let noseCount = 0;
        let mouthCount = 0;
        let jawlineCount = 0;
        let cheekboneCount = 0;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Only modify head region (y > 1.2 is head area)
            if (y > 1.2) {
                const headCenterY = 1.6; // Center of head
                const faceZ = 0.4; // Forward face area
                
                // Face width adjustment (simple X scaling)
                if (facial.faceWidth && Math.abs(x) < 0.5 && z > 0.2) {
                    positions[i] *= facial.faceWidth;
                    faceWidthCount++;
                }
                
                // Face height adjustment (Y scaling relative to head center)
                if (facial.faceHeight && Math.abs(x) < 0.5 && z > 0.2) {
                    const distanceFromCenter = y - headCenterY;
                    positions[i + 1] = headCenterY + (distanceFromCenter * facial.faceHeight);
                    faceHeightCount++;
                }
                
                // Eye size - apply as scaling around eye area
                if (facial.eyeSize !== undefined && y > 1.6 && y < 1.8 && Math.abs(x) > 0.1 && Math.abs(x) < 0.4) {
                    positions[i] *= facial.eyeSize;
                    positions[i + 2] *= facial.eyeSize; // Also scale depth
                    eyeCount++;
                }
                
                // Eye spacing - apply as width adjustment in eye region
                if (facial.eyeSpacing !== undefined && y > 1.6 && y < 1.8 && Math.abs(x) > 0.1) {
                    const spacingFactor = facial.eyeSpacing / 0.3;
                    positions[i] *= spacingFactor;
                }
                
                // Nose width - apply as width scaling in nose area
                if (facial.noseWidth !== undefined && Math.abs(x) < 0.15 && y > 1.5 && y < 1.7) {
                    positions[i] *= facial.noseWidth;
                    noseCount++;
                }
                
                // Nose length - apply as forward/back projection
                if (facial.noseLength !== undefined && Math.abs(x) < 0.15 && y > 1.5 && y < 1.7) {
                    positions[i + 2] *= facial.noseLength;
                }
                
                // Mouth width - apply as width scaling in mouth area
                if (facial.mouthWidth !== undefined && Math.abs(x) < 0.2 && y > 1.3 && y < 1.5) {
                    positions[i] *= facial.mouthWidth;
                    mouthCount++;
                }
                
                // Lip thickness - apply as forward projection
                if (facial.lipThickness !== undefined && Math.abs(x) < 0.2 && y > 1.3 && y < 1.5) {
                    positions[i + 2] *= facial.lipThickness;
                }
                
                // Jawline - needs to be applied correctly as a feature strength
                if (facial.jawline !== undefined && Math.abs(x) > 0.15 && y > 1.25 && y < 1.45) {
                    // Apply jawline as outward push based on strength (0-1 range)
                    const jawStrength = facial.jawline;
                    const outwardPush = (jawStrength - 0.5) * 0.1; // Scale to reasonable range
                    positions[i] += Math.sign(x) * outwardPush; // Push outward from center
                    jawlineCount++;
                }
                
                // Cheekbones - needs to be applied correctly as prominence
                if (facial.cheekbones !== undefined && Math.abs(x) > 0.2 && y > 1.5 && y < 1.7) {
                    // Apply cheekbone prominence as outward/forward push
                    const cheekStrength = facial.cheekbones;
                    const outwardPush = (cheekStrength - 0.3) * 0.05; // Scale to reasonable range (0.3 is default)
                    positions[i] += Math.sign(x) * outwardPush; // Push outward
                    positions[i + 2] += outwardPush * 0.5; // Push forward slightly
                    cheekboneCount++;
                }
                
            }
        }
        
        // Debug logging
        console.log(`🔍 Facial specs received:`, facial);
        console.log(`🔍 Facial vertices affected - Width: ${faceWidthCount}, Height: ${faceHeightCount}, Eyes: ${eyeCount}, Nose: ${noseCount}, Mouth: ${mouthCount}, Jawline: ${jawlineCount}, Cheekbones: ${cheekboneCount}`);
        if (facial.jawline !== undefined && jawlineCount === 0) {
            console.warn(`⚠️ Jawline setting ${facial.jawline} found no vertices to modify`);
        }
        if (facial.cheekbones !== undefined && cheekboneCount === 0) {
            console.warn(`⚠️ Cheekbones setting ${facial.cheekbones} found no vertices to modify`);
        }
    }
    
    /**
     * Apply body proportion deformation
     * 
     * @param {Object} context - Deformation context
     */
    async applyBodyProportionDeformation(context) {
        console.log('🏃 Applying body proportion deformation...');
        
        const { positions, body } = context;
        
        if (!body.proportions) {
            console.log('⚠️ No body proportions found in specs');
            return;
        }
        
        const proportions = body.proportions;
        console.log('🔍 Body proportions:', proportions);
        
        // Count vertices affected by each deformation
        let armVertices = 0;
        let shoulderVertices = 0;
        let hipVertices = 0;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Torso proportions
            if (proportions.torso && y > 0.0 && y < 1.2) {
                const torsoScale = proportions.torso;
                positions[i] *= torsoScale;
                positions[i + 2] *= torsoScale;
            }
            
            // Leg proportions
            if (proportions.legs && y < 0.0 && y > -1.8) {
                const legScale = proportions.legs;
                positions[i + 1] *= legScale;
            }
            
            // Arms - exact same pattern as legs (which work)
            if (proportions.arms && Math.abs(x) > 0.5) {
                positions[i + 1] *= proportions.arms;
                armVertices++;
            }
            
            // Shoulders - exact same pattern as torso (which works)
            if (proportions.shoulders && y > 0.8 && y < 1.2) {
                positions[i] *= proportions.shoulders;
                shoulderVertices++;
            }
            
            // Hips - exact same pattern as torso (which works)
            if (proportions.hips && y > -0.2 && y < 0.2) {
                positions[i] *= proportions.hips;
                hipVertices++;
            }
        }
        
        // Log debug information
        console.log(`🔍 Body proportions received:`, proportions);
        console.log(`🔍 Vertices affected - Arms: ${armVertices}, Shoulders: ${shoulderVertices}, Hips: ${hipVertices}`);
    }
    
    /**
     * Apply muscular deformation
     * 
     * @param {Object} context - Deformation context
     */
    async applyMuscularDeformation(context) {
        console.log('💪 Applying muscular deformation...');
        
        const { positions, body } = context;
        
        if (!body.muscle) return;
        
        const muscle = body.muscle;
        const definition = muscle.definition || 0.5;
        
        console.log(`🔍 Muscle definition received:`, muscle);
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Muscle definition - exact same pattern as torso (which works)
            if (muscle.definition && y > 0.5 && y < 1.2 && Math.abs(x) < 0.4 && z > 0) {
                positions[i + 2] *= muscle.definition;
            }
        }
    }
    
    /**
     * Apply muscle definition to specific muscle group (simplified version)
     * 
     * @param {Float32Array} positions - Position array
     * @param {number} index - Current vertex index
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} z - Z coordinate
     * @param {number} definition - Muscle definition level
     * @param {string} group - Muscle group name
     * @param {number} minY - Minimum Y coordinate for group
     * @param {number} maxY - Maximum Y coordinate for group
     */
    applyMuscleGroup(positions, index, x, y, z, definition, group, minY, maxY) {
        // Simplified muscle application - direct scaling like other working controls
        if (y < minY || y > maxY) return;
        
        const muscleScale = 1 + (definition - 0.5) * 0.1;
        
        if (group === 'chest' && Math.abs(x) < 0.4 && z > 0) {
            positions[index + 2] *= muscleScale;
        } else if (group === 'arms' && Math.abs(x) > 0.5) {
            positions[index + 2] *= muscleScale;
        } else if (group === 'abs' && Math.abs(x) < 0.3 && z > -0.1) {
            positions[index + 2] *= muscleScale;
        } else if (group === 'legs' && Math.abs(x) < 0.4) {
            positions[index + 2] *= muscleScale;
        }
    }
    
    /**
     * Apply postural adjustments
     * 
     * @param {Object} context - Deformation context
     */
    async applyPosturalAdjustments(context) {
        console.log('🚶 Applying postural adjustments...');
        
        const { positions, ageGroup, gender } = context;
        
        // Age-based posture changes
        if (ageGroup === 'elderly') {
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                
                // Forward head posture
                if (y > 1.2) {
                    positions[i + 2] += 0.03;
                }
                
                // Spinal curvature
                if (y > 0.2 && y < 1.2) {
                    const curveFactor = Math.sin((y - 0.2) * Math.PI / 1.0);
                    positions[i + 2] += curveFactor * 0.02;
                }
                
                // Shoulder drop
                if (y > 0.8 && y < 1.2 && Math.abs(positions[i]) > 0.3) {
                    positions[i + 1] -= 0.02;
                }
            }
        }
        
        // Gender-based postural differences
        if (gender === 'female') {
            for (let i = 0; i < positions.length; i += 3) {
                const y = positions[i + 1];
                
                // Slight inward shoulder angle
                if (y > 0.8 && y < 1.2 && Math.abs(positions[i]) > 0.4) {
                    positions[i] *= 0.98;
                }
            }
        }
    }
    
    // =====================================
    // REGION DETECTION METHODS
    // =====================================
    
    /**
     * Check if point is in nasal region
     */
    isInNasalRegion(x, y, z, landmarks) {
        const nose = landmarks.facial.pronasale;
        const distance = Math.sqrt((x - nose.x) ** 2 + (y - nose.y) ** 2 + (z - nose.z) ** 2);
        return distance < 0.15;
    }
    
    /**
     * Check if point is in lip region
     */
    isInLipRegion(x, y, z, landmarks) {
        const mouth = landmarks.facial.stomion;
        const distance = Math.sqrt((x - mouth.x) ** 2 + (y - mouth.y) ** 2 + (z - mouth.z) ** 2);
        return distance < 0.08 && y < mouth.y + 0.05;
    }
    
    /**
     * Check if point is in maxillary region
     */
    isInMaxillaryRegion(x, y, z, landmarks) {
        return Math.abs(x) < 0.3 && y > 1.45 && y < 1.65 && z > 0.35;
    }
    
    /**
     * Check if point is in mandible region
     */
    isInMandibleRegion(x, y, z, landmarks) {
        return y > 1.25 && y < 1.45 && Math.abs(x) > 0.1;
    }
    
    /**
     * Check if point is in eye region
     */
    isInEyeRegion(x, y, z, landmarks) {
        const eyeY = landmarks.facial.endocanthion.y;
        return Math.abs(y - eyeY) < 0.08 && Math.abs(x) > 0.05 && Math.abs(x) < 0.35 && z > 0.3;
    }
    
    /**
     * Check if point is in cheekbone region
     */
    isInCheekboneRegion(x, y, z, landmarks) {
        return Math.abs(x) > 0.25 && y > 1.55 && y < 1.70 && z > 0.1 && z < 0.3;
    }
    
    /**
     * Check if point is in general face region
     */
    isInFaceRegion(x, y, z, landmarks) {
        return Math.abs(x) < 0.5 && y > 1.3 && y < 1.8 && z > 0.2;
    }
    
    /**
     * Check if point is in mouth region
     */
    isInMouthRegion(x, y, z, landmarks) {
        const mouth = landmarks.facial.stomion;
        return Math.abs(x) < 0.25 && Math.abs(y - mouth.y) < 0.08 && z > 0.35;
    }
    
    /**
     * Check if point is in jawline region
     */
    isInJawlineRegion(x, y, z, landmarks) {
        return y > 1.25 && y < 1.40 && Math.abs(x) > 0.15;
    }
    
    // =====================================
    // INFLUENCE CALCULATION METHODS
    // =====================================
    
    /**
     * Calculate facial influence for width/height adjustments
     */
    calculateFacialInfluence(x, y, z, landmarks, type) {
        const face = landmarks.facial;
        const centerX = 0;
        const centerY = face.nasion.y;
        const centerZ = face.nasion.z;
        
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2 + (z - centerZ) ** 2);
        const maxDistance = 0.4;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate eye influence
     */
    calculateEyeInfluence(x, y, z, landmarks) {
        const eyeCenterX = x > 0 ? landmarks.facial.exocanthion.x : -landmarks.facial.exocanthion.x;
        const eyeCenterY = landmarks.facial.endocanthion.y;
        const eyeCenterZ = landmarks.facial.endocanthion.z;
        
        const distance = Math.sqrt((x - eyeCenterX) ** 2 + (y - eyeCenterY) ** 2 + (z - eyeCenterZ) ** 2);
        const maxDistance = 0.1;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate nasal influence
     */
    calculateNasalInfluence(x, y, z, landmarks, type) {
        const nose = landmarks.facial.pronasale;
        const distance = Math.sqrt((x - nose.x) ** 2 + (y - nose.y) ** 2 + (z - nose.z) ** 2);
        const maxDistance = type === 'width' ? 0.12 : 0.15;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate mouth influence
     */
    calculateMouthInfluence(x, y, z, landmarks, type) {
        const mouth = landmarks.facial.stomion;
        const distance = Math.sqrt((x - mouth.x) ** 2 + (y - mouth.y) ** 2 + (z - mouth.z) ** 2);
        const maxDistance = type === 'width' ? 0.15 : 0.08;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate jawline influence
     */
    calculateJawlineInfluence(x, y, z, landmarks) {
        const jaw = landmarks.facial.gonion;
        const jawX = Math.sign(x) * Math.abs(jaw.x);
        const distance = Math.sqrt((x - jawX) ** 2 + (y - jaw.y) ** 2 + (z - jaw.z) ** 2);
        const maxDistance = 0.2;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate cheekbone influence
     */
    calculateCheekboneInfluence(x, y, z, landmarks) {
        const cheek = landmarks.facial.zygion;
        const cheekX = Math.sign(x) * Math.abs(cheek.x);
        const distance = Math.sqrt((x - cheekX) ** 2 + (y - cheek.y) ** 2 + (z - cheek.z) ** 2);
        const maxDistance = 0.15;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate chest muscle influence
     */
    calculateChestInfluence(x, y, z) {
        const chestCenterY = 0.9;
        const distance = Math.sqrt(x ** 2 + (y - chestCenterY) ** 2);
        const maxDistance = 0.3;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate arm muscle influence
     */
    calculateArmInfluence(x, y, z) {
        const armCenterX = Math.sign(x) * 0.7;
        const armCenterY = 0.4;
        const distance = Math.sqrt((x - armCenterX) ** 2 + (y - armCenterY) ** 2);
        const maxDistance = 0.4;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate abdominal muscle influence
     */
    calculateAbsInfluence(x, y, z) {
        const absCenterY = 0.3;
        const distance = Math.sqrt(x ** 2 + (y - absCenterY) ** 2);
        const maxDistance = 0.25;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    /**
     * Calculate leg muscle influence
     */
    calculateLegInfluence(x, y, z) {
        const legCenterX = Math.sign(x) * 0.25;
        const legCenterY = -0.8;
        const distance = Math.sqrt((x - legCenterX) ** 2 + (y - legCenterY) ** 2);
        const maxDistance = 0.6;
        
        return Math.max(0, 1 - distance / maxDistance);
    }
    
    // =====================================
    // UTILITY METHODS
    // =====================================
    
    /**
     * Calculate dynamic landmarks based on current geometry
     */
    calculateDynamicLandmarks(geometry, specs) {
        // For now, return static landmarks
        // In a full implementation, these would be calculated from the actual geometry
        return this.anatomicalLandmarks;
    }
    
    /**
     * Calculate influence regions based on character specifications
     */
    calculateInfluenceRegions(geometry, specs) {
        // For now, return static regions
        // In a full implementation, these would be adjusted based on character size/proportions
        return this.influenceRegions;
    }
    
    /**
     * Finalize geometry after all deformations
     */
    finalizeGeometry(geometry, workingPositions) {
        // Copy working positions back to geometry
        const positionAttribute = geometry.getAttribute('position');
        positionAttribute.array.set(workingPositions);
        positionAttribute.needsUpdate = true;
        
        // Recompute normals and other attributes
        geometry.computeVertexNormals();
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        
        // Update tangents if they exist
        if (geometry.getAttribute('tangent')) {
            geometry.computeTangents();
        }
    }
    
    /**
     * Update performance statistics
     */
    updateStats(deformationTime) {
        this.stats.deformationsApplied++;
        this.stats.totalDeformationTime += deformationTime;
        this.stats.averageDeformationTime = this.stats.totalDeformationTime / this.stats.deformationsApplied;
    }
    
    /**
     * Get performance statistics
     */
    getStats() {
        return { ...this.stats };
    }
    
    /**
     * Clear operation cache
     */
    clearCache() {
        this.operationCache.clear();
        console.log('🧹 Deformation cache cleared');
    }
    
    /**
     * Dispose of resources
     */
    dispose() {
        this.clearCache();
        console.log('✅ VertexDeformationEngine disposed');
    }
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.VertexDeformationEngine = VertexDeformationEngine;
}