/**
 * Texture Generation Pipeline for Procedural Fabric Systems
 * 
 * This system converts neural cloth specifications into actual Three.js textures
 * using our GLSL noise library and fabric shaders. It handles the complete
 * pipeline from cloth parameters to PBR-ready texture maps.
 * 
 * Features:
 * - Automatic fabric type detection and parameter mapping
 * - PBR texture generation (albedo, normal, roughness, metallic)
 * - Real-time preview and parameter adjustment
 * - Texture caching and optimization
 * - Multiple output formats and resolutions
 * 
 * Author: Enhanced Procedural Actor Generation System
 * Version: 1.0.0
 */

window.TextureGenerator = class TextureGenerator {
    constructor(shaderManager) {
        /**
         * Reference to the shader management system
         * @type {ShaderManager}
         */
        this.shaderManager = shaderManager;
        
        /**
         * Three.js renderer for off-screen texture generation
         * @type {THREE.WebGLRenderer}
         */
        this.offscreenRenderer = null;
        
        /**
         * Render targets for different texture types
         * @type {Object<string, THREE.WebGLRenderTarget>}
         */
        this.renderTargets = {};
        
        /**
         * Cache for generated textures
         * Key: texture specification hash, Value: texture data
         * @type {Map}
         */
        this.textureCache = new Map();
        
        /**
         * Fabric type mapping from neural cloth system
         * Maps neural cloth fabric names to shader fabric type indices
         * @type {Object}
         */
        this.fabricTypeMap = {
            'cotton': 0,
            'silk': 1,
            'wool': 2,
            'denim': 3,
            'leather': 4,
            'chiffon': 5,
            'polyester': 6
        };
        
        /**
         * Supported texture resolutions for different use cases
         * @type {Object}
         */
        this.resolutionPresets = {
            low: 256,
            medium: 512,
            high: 1024,
            ultra: 2048
        };
        
        /**
         * Performance monitoring
         * @type {Object}
         */
        this.stats = {
            texturesGenerated: 0,
            cacheHits: 0,
            cacheMisses: 0,
            totalGenerationTime: 0,
            averageGenerationTime: 0
        };
        
        // Initialize the system
        this.initialize();
    }
    
    /**
     * Initialize the texture generation system
     * Sets up renderer, render targets, and base materials
     */
    async initialize() {
        console.log('🎨 Initializing TextureGenerator...');
        
        try {
            // Create off-screen renderer for texture generation
            this.createOffscreenRenderer();
            
            // Set up render targets for different texture types
            this.createRenderTargets();
            
            // Load and compile fabric shaders
            await this.loadFabricShaders();
            
            console.log('✅ TextureGenerator initialized successfully');
        } catch (error) {
            console.error('❌ TextureGenerator initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Create off-screen WebGL renderer for texture generation
     */
    createOffscreenRenderer() {
        const canvas = document.createElement('canvas');
        
        this.offscreenRenderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: false,
            preserveDrawingBuffer: true,
            powerPreference: 'high-performance'
        });
        
        this.offscreenRenderer.setSize(1024, 1024); // Default resolution
        this.offscreenRenderer.outputEncoding = THREE.sRGBEncoding;
        
        console.log('🖥️ Off-screen renderer created');
    }
    
    /**
     * Create render targets for different texture map types
     */
    createRenderTargets() {
        const defaultSize = 1024;
        
        // Albedo (base color) render target
        this.renderTargets.albedo = new THREE.WebGLRenderTarget(defaultSize, defaultSize, {
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
            encoding: THREE.sRGBEncoding,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter
        });
        
        // Normal map render target
        this.renderTargets.normal = new THREE.WebGLRenderTarget(defaultSize, defaultSize, {
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType,
            encoding: THREE.LinearEncoding,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter
        });
        
        // Roughness map render target
        this.renderTargets.roughness = new THREE.WebGLRenderTarget(defaultSize, defaultSize, {
            format: THREE.RedFormat,
            type: THREE.UnsignedByteType,
            encoding: THREE.LinearEncoding,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter
        });
        
        // Metallic map render target (rarely used for fabrics, but included for completeness)
        this.renderTargets.metallic = new THREE.WebGLRenderTarget(defaultSize, defaultSize, {
            format: THREE.RedFormat,
            type: THREE.UnsignedByteType,
            encoding: THREE.LinearEncoding,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter,
            magFilter: THREE.LinearFilter
        });
        
        console.log('🎯 Render targets created');
    }
    
    /**
     * Load and compile fabric shaders
     */
    async loadFabricShaders() {
        try {
            // Try to load vertex shader
            let vertexShader;
            try {
                vertexShader = await this.shaderManager.loadShaderSource('./js/shaders/fabric-base.vert');
            } catch (error) {
                console.log('🔧 Using fallback vertex shader');
                vertexShader = this.createFallbackVertexShader();
            }
            
            // Try to load fragment shader  
            let fragmentShader;
            try {
                fragmentShader = await this.shaderManager.loadShaderSource('./js/shaders/fabric-base.frag');
            } catch (error) {
                console.log('🔧 Using fallback fragment shader');
                fragmentShader = this.createFallbackFragmentShader();
            }
            
            // Create base fabric material template
            this.baseFabricMaterial = this.shaderManager.createShaderMaterial({
                name: 'fabric_base',
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: this.createBaseFabricUniforms(),
                options: {
                    side: THREE.DoubleSide,
                    transparent: true
                }
            });
            
            console.log('🧵 Fabric shaders loaded and compiled');
        } catch (error) {
            console.error('❌ Failed to load fabric shaders:', error);
            throw error;
        }
    }
    
    /**
     * Create base uniform definitions for fabric shaders
     * 
     * @returns {Object} - Uniform definitions
     */
    createBaseFabricUniforms() {
        return {
            // Fabric type and base properties
            fabricType: { type: 'i', value: 0 },
            baseColor: { type: 'v3', value: new THREE.Vector3(1, 1, 1) },
            roughness: { type: 'f', value: 0.7 },
            metallic: { type: 'f', value: 0.0 },
            
            // Neural cloth properties
            stiffness: { type: 'f', value: 0.6 },
            drape: { type: 'f', value: 0.7 },
            weight: { type: 'f', value: 0.5 },
            
            // Pattern control
            patternScale: { type: 'f', value: 1.0 },
            patternStrength: { type: 'f', value: 1.0 },
            weaveFrequency: { type: 'v2', value: new THREE.Vector2(32, 32) },
            noiseScale: { type: 'f', value: 10.0 },
            noiseOctaves: { type: 'i', value: 4 },
            
            // UV and transformation
            uvScale: { type: 'v2', value: new THREE.Vector2(1, 1) },
            uvOffset: { type: 'v2', value: new THREE.Vector2(0, 0) },
            fabricScale: { type: 'f', value: 1.0 },
            
            // Animation and variation
            time: { type: 'f', value: 0.0 },
            animationSpeed: { type: 'f', value: 1.0 },
            colorVariation: { type: 'f', value: 0.1 },
            wearAmount: { type: 'f', value: 0.0 }
        };
    }
    
    /**
     * Generate fabric textures from neural cloth data
     * 
     * @param {Object} neuralClothData - Data from neural cloth system
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} - Generated texture maps
     */
    async generateFabricTextures(neuralClothData, options = {}) {
        const startTime = performance.now();
        
        // Extract parameters from neural cloth data
        const fabricParams = this.extractFabricParameters(neuralClothData);
        
        // Create cache key for this configuration
        const cacheKey = this.generateCacheKey(fabricParams, options);
        
        // Check cache first
        if (this.textureCache.has(cacheKey)) {
            this.stats.cacheHits++;
            console.log(`🔄 Using cached textures for: ${fabricParams.fabricName}`);
            return this.textureCache.get(cacheKey);
        }
        
        this.stats.cacheMisses++;
        
        try {
            console.log(`🎨 Generating textures for: ${fabricParams.fabricName}`);
            
            // Set up render resolution
            const resolution = this.resolutionPresets[options.quality || 'medium'];
            this.setRenderResolution(resolution);
            
            // Create material with fabric parameters
            const material = this.createFabricMaterial(fabricParams, options);
            
            // Generate all texture maps
            const textures = await this.renderTextureSet(material, options);
            
            // Cache the results
            this.textureCache.set(cacheKey, textures);
            
            // Update statistics
            const generationTime = performance.now() - startTime;
            this.updateStats(generationTime);
            
            console.log(`✅ Textures generated in ${generationTime.toFixed(2)}ms`);
            
            return textures;
            
        } catch (error) {
            console.error('❌ Texture generation failed:', error);
            throw error;
        }
    }
    
    /**
     * Extract and normalize fabric parameters from neural cloth data
     * 
     * @param {Object} neuralClothData - Neural cloth system output
     * @returns {Object} - Normalized fabric parameters
     */
    extractFabricParameters(neuralClothData) {
        const fabricName = neuralClothData.fabric || 'cotton';
        const properties = neuralClothData.properties || {};
        
        return {
            fabricName: fabricName,
            fabricType: this.fabricTypeMap[fabricName] || 0,
            
            // Physical properties from neural cloth
            stiffness: this.clamp(properties.stiffness || 0.6, 0.0, 1.0),
            drape: this.clamp(properties.drape || 0.7, 0.0, 1.0),
            weight: properties.weight === 'light' ? 0.3 : 
                   properties.weight === 'heavy' ? 0.8 : 0.5,
            
            // Visual properties
            baseColor: this.parseColor(neuralClothData.color || '#ffffff'),
            roughness: this.calculateRoughness(fabricName, properties),
            metallic: 0.0, // Fabrics are generally non-metallic
            
            // Pattern properties
            patternScale: this.calculatePatternScale(fabricName, properties),
            weaveFrequency: this.calculateWeaveFrequency(fabricName),
            
            // Additional properties
            stretch: this.clamp(properties.stretch || 0.1, 0.0, 1.0),
            constraintPoints: neuralClothData.constraintPoints || []
        };
    }
    
    /**
     * Calculate fabric-specific roughness from properties
     * 
     * @param {string} fabricName - Name of fabric type
     * @param {Object} properties - Fabric properties
     * @returns {number} - Roughness value [0-1]
     */
    calculateRoughness(fabricName, properties) {
        const baseRoughness = {
            cotton: 0.7,
            silk: 0.2,
            wool: 0.9,
            denim: 0.8,
            leather: 0.6,
            chiffon: 0.5,
            polyester: 0.4
        };
        
        let roughness = baseRoughness[fabricName] || 0.7;
        
        // Modify based on stiffness and drape
        if (properties.stiffness !== undefined) {
            roughness *= (0.8 + properties.stiffness * 0.4);
        }
        
        return this.clamp(roughness, 0.1, 1.0);
    }
    
    /**
     * Calculate pattern scale based on fabric type and properties
     * 
     * @param {string} fabricName - Name of fabric type
     * @param {Object} properties - Fabric properties
     * @returns {number} - Pattern scale multiplier
     */
    calculatePatternScale(fabricName, properties) {
        const baseScale = {
            cotton: 1.0,
            silk: 1.5,
            wool: 0.7,
            denim: 0.8,
            leather: 0.4,
            chiffon: 2.0,
            polyester: 1.2
        };
        
        let scale = baseScale[fabricName] || 1.0;
        
        // Adjust based on weight
        if (properties.weight === 'light') scale *= 1.3;
        if (properties.weight === 'heavy') scale *= 0.8;
        
        return scale;
    }
    
    /**
     * Calculate weave frequency for fabric patterns
     * 
     * @param {string} fabricName - Name of fabric type
     * @returns {THREE.Vector2} - Weave frequency (warp, weft)
     */
    calculateWeaveFrequency(fabricName) {
        const frequencies = {
            cotton: new THREE.Vector2(32, 32),
            silk: new THREE.Vector2(64, 64),
            wool: new THREE.Vector2(16, 16),
            denim: new THREE.Vector2(24, 24),
            leather: new THREE.Vector2(8, 8),
            chiffon: new THREE.Vector2(128, 128),
            polyester: new THREE.Vector2(48, 48)
        };
        
        return frequencies[fabricName] || new THREE.Vector2(32, 32);
    }
    
    /**
     * Create fabric material with specific parameters
     * 
     * @param {Object} fabricParams - Fabric parameters
     * @param {Object} options - Generation options
     * @returns {THREE.ShaderMaterial} - Configured fabric material
     */
    createFabricMaterial(fabricParams, options) {
        // Clone the base material
        const material = this.baseFabricMaterial.clone();
        
        // Update uniforms with fabric parameters
        this.shaderManager.updateUniforms(material, {
            fabricType: fabricParams.fabricType,
            baseColor: fabricParams.baseColor,
            roughness: fabricParams.roughness,
            metallic: fabricParams.metallic,
            stiffness: fabricParams.stiffness,
            drape: fabricParams.drape,
            weight: fabricParams.weight,
            patternScale: fabricParams.patternScale,
            weaveFrequency: fabricParams.weaveFrequency,
            colorVariation: options.colorVariation || 0.1,
            wearAmount: options.wearAmount || 0.0
        });
        
        return material;
    }
    
    /**
     * Render a complete set of texture maps
     * 
     * @param {THREE.ShaderMaterial} material - Fabric material
     * @param {Object} options - Render options
     * @returns {Promise<Object>} - Texture map set
     */
    async renderTextureSet(material, options) {
        // Create full-screen quad for rendering
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        const scene = new THREE.Scene();
        scene.add(mesh);
        
        // Orthographic camera for texture rendering
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;
        
        const textures = {};
        
        try {
            // Try to render albedo map using shaders
            this.offscreenRenderer.setRenderTarget(this.renderTargets.albedo);
            this.offscreenRenderer.render(scene, camera);
            
            // Check if rendering worked
            const pixels = new Uint8Array(4);
            this.offscreenRenderer.readRenderTargetPixels(this.renderTargets.albedo, 0, 0, 1, 1, pixels);
            
            if (pixels[0] === 0 && pixels[1] === 0 && pixels[2] === 0) {
                // Shader rendering failed, use fallback
                console.log('🔧 Shader rendering failed, using canvas-based fallback');
                throw new Error('Shader rendering produced black output');
            }
            
            textures.albedo = this.renderTargets.albedo.texture.clone();
            
        } catch (error) {
            console.log('🎨 Using canvas-based texture generation');
            // Extract fabric parameters from material uniforms
            const fabricParams = {
                fabricType: material.uniforms.fabricType.value,
                baseColor: material.uniforms.baseColor.value
            };
            textures.albedo = this.generateSimpleAlbedoTexture(fabricParams);
        }
        
        // Generate other maps
        textures.normal = this.generateNormalMap(textures.albedo);
        textures.roughness = this.generateRoughnessMap(material.uniforms.roughness.value);
        textures.metallic = this.generateMetallicMap(material.uniforms.metallic.value);
        
        // Reset render target
        this.offscreenRenderer.setRenderTarget(null);
        
        // Cleanup
        geometry.dispose();
        
        return textures;
    }
    
    /**
     * Generate normal map from albedo texture (placeholder implementation)
     * 
     * @param {THREE.Texture} albedoTexture - Source albedo texture
     * @returns {THREE.Texture} - Generated normal map
     */
    generateNormalMap(albedoTexture) {
        // This is a simplified implementation
        // In production, you'd want to generate this from the shader
        const canvas = document.createElement('canvas');
        const size = 512;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#8080ff'; // Neutral normal (0.5, 0.5, 1.0 in normal space)
        ctx.fillRect(0, 0, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.LinearEncoding;
        
        return texture;
    }
    
    /**
     * Generate a simple colored texture as albedo (fallback method)
     * 
     * @param {Object} fabricParams - Fabric parameters
     * @returns {THREE.Texture} - Generated albedo texture
     */
    generateSimpleAlbedoTexture(fabricParams) {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        
        // Convert baseColor Vector3 to hex
        const baseColor = fabricParams.baseColor;
        const r = Math.floor(baseColor.x * 255);
        const g = Math.floor(baseColor.y * 255);
        const b = Math.floor(baseColor.z * 255);
        
        // Fill with base color
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, size, size);
        
        // Add simple pattern based on fabric type
        ctx.fillStyle = `rgba(${Math.floor(r * 0.8)}, ${Math.floor(g * 0.8)}, ${Math.floor(b * 0.8)}, 0.3)`;
        
        if (fabricParams.fabricType === 0 || fabricParams.fabricType === 3) { // Cotton or Denim
            // Weave pattern
            for (let x = 0; x < size; x += 16) {
                for (let y = 0; y < size; y += 16) {
                    if ((Math.floor(x/16) + Math.floor(y/16)) % 2 === 0) {
                        ctx.fillRect(x, y, 16, 16);
                    }
                }
            }
        } else if (fabricParams.fabricType === 2) { // Wool
            // Fuzzy pattern
            for (let i = 0; i < 2000; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const pixelSize = Math.random() * 3 + 1;
                ctx.fillRect(x, y, pixelSize, pixelSize);
            }
        } else if (fabricParams.fabricType === 4) { // Leather
            // Grain pattern
            for (let i = 0; i < 1000; i++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                const radius = Math.random() * 2 + 1;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
        
        return texture;
    }

    /**
     * Generate roughness map with uniform value
     * 
     * @param {number} roughnessValue - Uniform roughness value
     * @returns {THREE.Texture} - Generated roughness map
     */
    generateRoughnessMap(roughnessValue) {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        const grayValue = Math.floor(roughnessValue * 255);
        ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        ctx.fillRect(0, 0, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.LinearEncoding;
        
        return texture;
    }
    
    /**
     * Generate metallic map with uniform value
     * 
     * @param {number} metallicValue - Uniform metallic value
     * @returns {THREE.Texture} - Generated metallic map
     */
    generateMetallicMap(metallicValue) {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        const grayValue = Math.floor(metallicValue * 255);
        ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
        ctx.fillRect(0, 0, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.LinearEncoding;
        
        return texture;
    }
    
    /**
     * Set render resolution for texture generation
     * 
     * @param {number} resolution - Target resolution (width and height)
     */
    setRenderResolution(resolution) {
        this.offscreenRenderer.setSize(resolution, resolution);
        
        for (const [name, target] of Object.entries(this.renderTargets)) {
            target.setSize(resolution, resolution);
        }
    }
    
    /**
     * Generate cache key for texture configuration
     * 
     * @param {Object} fabricParams - Fabric parameters
     * @param {Object} options - Generation options
     * @returns {string} - Cache key
     */
    generateCacheKey(fabricParams, options) {
        const keyData = {
            fabricType: fabricParams.fabricType,
            stiffness: Math.round(fabricParams.stiffness * 100),
            drape: Math.round(fabricParams.drape * 100),
            weight: Math.round(fabricParams.weight * 100),
            quality: options.quality || 'medium',
            colorVariation: Math.round((options.colorVariation || 0.1) * 100),
            wearAmount: Math.round((options.wearAmount || 0.0) * 100)
        };
        
        return `fabric_${JSON.stringify(keyData)}`;
    }
    
    /**
     * Update performance statistics
     * 
     * @param {number} generationTime - Time taken for generation
     */
    updateStats(generationTime) {
        this.stats.texturesGenerated++;
        this.stats.totalGenerationTime += generationTime;
        this.stats.averageGenerationTime = this.stats.totalGenerationTime / this.stats.texturesGenerated;
    }
    
    /**
     * Parse color string to THREE.Vector3
     * 
     * @param {string} colorString - Color in hex format
     * @returns {THREE.Vector3} - RGB color vector
     */
    parseColor(colorString) {
        const color = new THREE.Color(colorString);
        return new THREE.Vector3(color.r, color.g, color.b);
    }
    
    /**
     * Clamp value to range
     * 
     * @param {number} value - Input value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Clamped value
     */
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
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
     * Clear texture cache
     */
    clearCache() {
        for (const textures of this.textureCache.values()) {
            for (const texture of Object.values(textures)) {
                texture.dispose();
            }
        }
        this.textureCache.clear();
        console.log('🧹 Texture cache cleared');
    }
    
    /**
     * Create fallback vertex shader when external file isn't available
     */
    createFallbackVertexShader() {
        return `
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 uv;
            
            uniform mat4 modelMatrix;
            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform mat3 normalMatrix;
            uniform vec2 uvScale;
            uniform vec2 uvOffset;
            uniform float fabricScale;
            uniform float time;
            
            varying vec2 vUv;
            varying vec2 vFabricUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vTime;
            
            void main() {
                vUv = uv * uvScale + uvOffset;
                vFabricUv = uv * fabricScale;
                vNormal = normalize(normalMatrix * normal);
                
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                vTime = time;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
    }

    /**
     * Create fallback fragment shader when external file isn't available
     */
    createFallbackFragmentShader() {
        return `
            #include <noise_library>
            
            precision highp float;
            
            varying vec2 vUv;
            varying vec2 vFabricUv;
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            varying float vTime;
            
            uniform int fabricType;
            uniform vec3 baseColor;
            uniform float roughness;
            uniform float stiffness;
            uniform float drape;
            uniform float patternScale;
            uniform vec2 weaveFrequency;
            uniform float noiseScale;
            uniform int noiseOctaves;
            
            void main() {
                vec2 uv = vFabricUv * patternScale;
                
                // Generate basic noise pattern
                float noise = gradientNoise2D(uv * 10.0);
                noise = (noise + 1.0) * 0.5;
                
                // Basic weave pattern
                float warp = sin(uv.x * weaveFrequency.x) > 0.0 ? 1.0 : 0.0;
                float weft = sin(uv.y * weaveFrequency.y) > 0.0 ? 1.0 : 0.0;
                float weave = mix(weft, 1.0 - weft, warp);
                
                // Combine patterns
                float pattern = mix(weave, noise, 0.3);
                pattern = mix(0.7, pattern, stiffness);
                
                // Apply fabric-specific modifications
                vec3 finalColor = baseColor;
                if (fabricType == 1) { // Silk - smoother
                    pattern = mix(0.8, pattern, 0.3);
                } else if (fabricType == 2) { // Wool - rougher
                    pattern = mix(0.5, pattern, 0.8);
                } else if (fabricType == 3) { // Denim - diagonal
                    float diagonal = sin((uv.x + uv.y) * 20.0) * 0.5 + 0.5;
                    pattern = mix(pattern, diagonal, 0.4);
                }
                
                finalColor = mix(finalColor * 0.8, finalColor * 1.2, pattern);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        console.log('🧹 Disposing TextureGenerator...');
        
        // Clear cache
        this.clearCache();
        
        // Dispose render targets
        for (const target of Object.values(this.renderTargets)) {
            target.dispose();
        }
        
        // Dispose renderer
        if (this.offscreenRenderer) {
            this.offscreenRenderer.dispose();
        }
        
        // Dispose base material
        if (this.baseFabricMaterial) {
            this.baseFabricMaterial.dispose();
        }
        
        console.log('✅ TextureGenerator disposed');
    }
}