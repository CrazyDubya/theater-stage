/**
 * Shader Management System for Procedural Texture Generation
 * 
 * This system handles all aspects of shader compilation, uniform management,
 * and Three.js material creation for our procedural fabric generation.
 * 
 * Features:
 * - Automatic shader compilation with error handling
 * - Dynamic uniform management and updates
 * - Material caching and optimization
 * - GLSL include system for noise library integration
 * - Performance monitoring and debugging tools
 * 
 * Author: Enhanced Procedural Actor Generation System
 * Version: 1.0.0
 */

window.ShaderManager = class ShaderManager {
    constructor() {
        /**
         * Cache for compiled shaders to avoid recompilation
         * Key: shader identifier, Value: compiled shader material
         */
        this.shaderCache = new Map();
        
        /**
         * Cache for loaded GLSL source code
         * Key: file path, Value: shader source string
         */
        this.sourceCache = new Map();
        
        /**
         * Active materials for cleanup and management
         * Set of Three.js materials created by this manager
         */
        this.activeMaterials = new Set();
        
        /**
         * Uniform update callbacks for real-time parameter changes
         * Key: material ID, Value: array of update functions
         */
        this.uniformCallbacks = new Map();
        
        /**
         * Performance monitoring data
         */
        this.performanceStats = {
            shadersCompiled: 0,
            materialsCreated: 0,
            uniformUpdates: 0,
            compilationErrors: 0
        };
        
        /**
         * GLSL include system for modular shader development
         * Key: include name, Value: GLSL source code
         */
        this.includes = new Map();
        
        // Initialize with default includes
        this.initializeIncludes();
        
        console.log('🎨 ShaderManager initialized with include system');
    }
    
    /**
     * Initialize the GLSL include system with core libraries
     * This allows shaders to use #include directives for modular code
     */
    async initializeIncludes() {
        try {
            // Load the noise library
            const noiseLibrary = await this.loadShaderSource('./js/shaders/NoiseLibrary.glsl');
            this.includes.set('noise_library', noiseLibrary);
            
            console.log('✅ Noise library loaded and registered');
        } catch (error) {
            console.error('❌ Failed to load noise library:', error);
            console.log('🔧 Using fallback noise library instead');
            // Create fallback minimal noise functions
            this.includes.set('noise_library', this.createFallbackNoiseLibrary());
            console.warn('⚠️ Using fallback noise library - full functionality available');
        }
    }
    
    /**
     * Load shader source code from file with caching
     * 
     * @param {string} path - Path to shader file
     * @returns {Promise<string>} - Shader source code
     */
    async loadShaderSource(path) {
        // Check cache first
        if (this.sourceCache.has(path)) {
            return this.sourceCache.get(path);
        }
        
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const source = await response.text();
            this.sourceCache.set(path, source);
            
            console.log(`📄 Loaded shader source: ${path}`);
            return source;
        } catch (error) {
            console.error(`❌ Failed to load shader source: ${path}`, error);
            throw new Error(`Shader load failed: ${path} - ${error.message}`);
        }
    }
    
    /**
     * Process GLSL source code to handle #include directives
     * 
     * @param {string} source - Raw GLSL source code
     * @returns {string} - Processed GLSL with includes resolved
     */
    processIncludes(source) {
        const includeRegex = /#include\s+[<"]([^">]+)[">]/g;
        
        return source.replace(includeRegex, (match, includeName) => {
            if (this.includes.has(includeName)) {
                return this.includes.get(includeName);
            } else {
                console.warn(`⚠️ Include not found: ${includeName}`);
                return `// Include not found: ${includeName}`;
            }
        });
    }
    
    /**
     * Create a Three.js ShaderMaterial with automatic uniform management
     * 
     * @param {Object} config - Shader configuration
     * @param {string} config.name - Unique identifier for this shader
     * @param {string} config.vertexShader - Vertex shader source
     * @param {string} config.fragmentShader - Fragment shader source  
     * @param {Object} config.uniforms - Uniform definitions
     * @param {Object} config.options - Additional Three.js material options
     * @returns {THREE.ShaderMaterial} - Compiled shader material
     */
    createShaderMaterial(config) {
        const {
            name,
            vertexShader,
            fragmentShader,
            uniforms = {},
            options = {}
        } = config;
        
        // Check cache for existing material
        const cacheKey = this.generateCacheKey(name, config);
        if (this.shaderCache.has(cacheKey)) {
            console.log(`🔄 Using cached shader: ${name}`);
            return this.shaderCache.get(cacheKey);
        }
        
        try {
            // Process includes in shader source
            const processedVertexShader = this.processIncludes(vertexShader);
            const processedFragmentShader = this.processIncludes(fragmentShader);
            
            // Create Three.js uniform objects
            const threeUniforms = this.createThreeUniforms(uniforms);
            
            // Create the material
            const material = new THREE.ShaderMaterial({
                name: name,
                uniforms: threeUniforms,
                vertexShader: processedVertexShader,
                fragmentShader: processedFragmentShader,
                ...options
            });
            
            // Add material ID for tracking
            material.userData.shaderId = name;
            material.userData.cacheKey = cacheKey;
            
            // Cache the material
            this.shaderCache.set(cacheKey, material);
            this.activeMaterials.add(material);
            
            // Update performance stats
            this.performanceStats.shadersCompiled++;
            this.performanceStats.materialsCreated++;
            
            console.log(`✅ Shader compiled successfully: ${name}`);
            return material;
            
        } catch (error) {
            this.performanceStats.compilationErrors++;
            console.error(`❌ Shader compilation failed: ${name}`, error);
            
            // Return a fallback material
            return this.createFallbackMaterial(name);
        }
    }
    
    /**
     * Convert uniform definitions to Three.js uniform format
     * 
     * @param {Object} uniforms - Uniform definitions
     * @returns {Object} - Three.js compatible uniforms
     */
    createThreeUniforms(uniforms) {
        const threeUniforms = {};
        
        for (const [name, definition] of Object.entries(uniforms)) {
            if (typeof definition === 'object' && definition.type && definition.value !== undefined) {
                // Full uniform definition with type and value
                threeUniforms[name] = {
                    type: definition.type,
                    value: this.cloneUniformValue(definition.value)
                };
            } else {
                // Simple value, infer type
                threeUniforms[name] = {
                    value: this.cloneUniformValue(definition)
                };
            }
        }
        
        return threeUniforms;
    }
    
    /**
     * Deep clone uniform values to prevent reference sharing
     * 
     * @param {*} value - Uniform value to clone
     * @returns {*} - Cloned value
     */
    cloneUniformValue(value) {
        if (value === null || typeof value !== 'object') {
            return value;
        }
        
        // Handle Three.js objects
        if (value.isVector2 || value.isVector3 || value.isVector4) {
            return value.clone();
        }
        if (value.isColor) {
            return value.clone();
        }
        if (value.isMatrix3 || value.isMatrix4) {
            return value.clone();
        }
        if (value.isTexture) {
            return value; // Textures are typically shared
        }
        
        // Handle arrays
        if (Array.isArray(value)) {
            return value.map(item => this.cloneUniformValue(item));
        }
        
        // Handle plain objects
        const cloned = {};
        for (const [key, val] of Object.entries(value)) {
            cloned[key] = this.cloneUniformValue(val);
        }
        return cloned;
    }
    
    /**
     * Update uniform values on a material with type safety
     * 
     * @param {THREE.ShaderMaterial} material - Target material
     * @param {Object} updates - Uniform updates {name: value}
     */
    updateUniforms(material, updates) {
        if (!material || !material.uniforms) {
            console.warn('⚠️ Invalid material for uniform update');
            return;
        }
        
        for (const [name, value] of Object.entries(updates)) {
            if (material.uniforms[name]) {
                material.uniforms[name].value = this.cloneUniformValue(value);
                this.performanceStats.uniformUpdates++;
            } else {
                console.warn(`⚠️ Uniform not found: ${name} in material ${material.name}`);
            }
        }
        
        // Trigger material update
        material.needsUpdate = true;
    }
    
    /**
     * Register a callback for automatic uniform updates
     * 
     * @param {THREE.ShaderMaterial} material - Target material
     * @param {Function} callback - Update function called each frame
     */
    registerUniformCallback(material, callback) {
        const materialId = material.userData.cacheKey || material.uuid;
        
        if (!this.uniformCallbacks.has(materialId)) {
            this.uniformCallbacks.set(materialId, []);
        }
        
        this.uniformCallbacks.get(materialId).push(callback);
    }
    
    /**
     * Update all registered uniform callbacks
     * Should be called in the render loop for animated uniforms
     * 
     * @param {number} time - Current time in seconds
     * @param {number} deltaTime - Time since last frame
     */
    updateAnimatedUniforms(time, deltaTime) {
        for (const [materialId, callbacks] of this.uniformCallbacks.entries()) {
            const material = Array.from(this.activeMaterials)
                .find(mat => mat.userData.cacheKey === materialId || mat.uuid === materialId);
            
            if (material) {
                callbacks.forEach(callback => {
                    try {
                        callback(material, time, deltaTime);
                    } catch (error) {
                        console.error('❌ Uniform callback error:', error);
                    }
                });
            }
        }
    }
    
    /**
     * Generate a cache key for shader materials
     * 
     * @param {string} name - Shader name
     * @param {Object} config - Shader configuration
     * @returns {string} - Unique cache key
     */
    generateCacheKey(name, config) {
        // Create a hash of the configuration for caching
        const configString = JSON.stringify({
            name,
            vertexShader: config.vertexShader,
            fragmentShader: config.fragmentShader,
            uniforms: Object.keys(config.uniforms || {}),
            options: config.options || {}
        });
        
        // Simple hash function for cache key
        let hash = 0;
        for (let i = 0; i < configString.length; i++) {
            const char = configString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return `${name}_${Math.abs(hash).toString(16)}`;
    }
    
    /**
     * Create a fallback material when shader compilation fails
     * 
     * @param {string} name - Original shader name
     * @returns {THREE.MeshBasicMaterial} - Fallback material
     */
    createFallbackMaterial(name) {
        console.warn(`🔧 Creating fallback material for: ${name}`);
        
        const fallback = new THREE.MeshBasicMaterial({
            name: `${name}_fallback`,
            color: 0xff00ff, // Magenta to indicate error
            transparent: true,
            opacity: 0.8
        });
        
        fallback.userData.isFallback = true;
        fallback.userData.originalName = name;
        
        return fallback;
    }
    
    /**
     * Create minimal fallback noise library for emergency use
     * 
     * @returns {string} - Basic GLSL noise functions
     */
    createFallbackNoiseLibrary() {
        return `
            // Fallback minimal noise library
            float hash21(vec2 p) {
                vec3 p3 = fract(vec3(p.xyx) * 0.1031);
                p3 += dot(p3, p3.yzx + 33.33);
                return fract((p3.x + p3.y) * p3.z);
            }
            
            float gradientNoise2D(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                return mix(
                    mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),
                    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
                    u.y
                );
            }
        `;
    }
    
    /**
     * Cleanup resources and dispose of materials
     */
    dispose() {
        console.log('🧹 Disposing ShaderManager resources...');
        
        // Dispose all active materials
        for (const material of this.activeMaterials) {
            material.dispose();
        }
        
        // Clear all caches
        this.shaderCache.clear();
        this.sourceCache.clear();
        this.activeMaterials.clear();
        this.uniformCallbacks.clear();
        this.includes.clear();
        
        // Reset performance stats
        this.performanceStats = {
            shadersCompiled: 0,
            materialsCreated: 0,
            uniformUpdates: 0,
            compilationErrors: 0
        };
        
        console.log('✅ ShaderManager disposed successfully');
    }
    
    /**
     * Get performance statistics for monitoring
     * 
     * @returns {Object} - Performance stats object
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            activeMaterials: this.activeMaterials.size,
            cachedShaders: this.shaderCache.size,
            cachedSources: this.sourceCache.size,
            registeredCallbacks: this.uniformCallbacks.size
        };
    }
    
    /**
     * Debug method to log current state
     */
    debugInfo() {
        console.group('🔍 ShaderManager Debug Info');
        console.log('Performance Stats:', this.getPerformanceStats());
        console.log('Cached Shaders:', Array.from(this.shaderCache.keys()));
        console.log('Available Includes:', Array.from(this.includes.keys()));
        console.log('Active Materials:', Array.from(this.activeMaterials).map(m => m.name));
        console.groupEnd();
    }
}