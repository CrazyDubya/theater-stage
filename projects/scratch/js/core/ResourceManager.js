/**
 * ResourceManager.js - Memory-efficient Resource Management for 3D Theater Stage
 * 
 * Manages geometry, material, and texture reuse to optimize memory usage
 * and improve performance for complex theater scenes.
 */

class ResourceManager {
    constructor() {
        this.geometries = new Map();
        this.materials = new Map();
        this.textures = new Map();
        this.disposedObjects = new Set();
        
        console.log('ResourceManager: Initialized');
    }
    
    /**
     * Get or create geometry with caching for memory efficiency
     */
    getGeometry(type, params = {}) {
        const key = `${type}_${JSON.stringify(params)}`;
        if (!this.geometries.has(key)) {
            this.geometries.set(key, this.createGeometry(type, params));
        }
        return this.geometries.get(key);
    }
    
    /**
     * Create geometry based on type and parameters
     */
    createGeometry(type, params) {
        switch (type) {
            case 'box':
                return new THREE.BoxGeometry(
                    params.width || 1, 
                    params.height || 1, 
                    params.depth || 1,
                    params.widthSegments || 1,
                    params.heightSegments || 1,
                    params.depthSegments || 1
                );
            case 'sphere':
                return new THREE.SphereGeometry(
                    params.radius || 0.5, 
                    params.widthSegments || 16, 
                    params.heightSegments || 16,
                    params.phiStart || 0,
                    params.phiLength || Math.PI * 2,
                    params.thetaStart || 0,
                    params.thetaLength || Math.PI
                );
            case 'cylinder':
                return new THREE.CylinderGeometry(
                    params.radiusTop !== undefined ? params.radiusTop : 1,
                    params.radiusBottom !== undefined ? params.radiusBottom : 1,
                    params.height || 1,
                    params.radialSegments || 16,
                    params.heightSegments || 1,
                    params.openEnded || false,
                    params.thetaStart || 0,
                    params.thetaLength || Math.PI * 2
                );
            case 'plane':
                return new THREE.PlaneGeometry(
                    params.width || 1,
                    params.height || 1,
                    params.widthSegments || 1,
                    params.heightSegments || 1
                );
            case 'circle':
                return new THREE.CircleGeometry(
                    params.radius || 0.5,
                    params.segments || 16,
                    params.thetaStart || 0,
                    params.thetaLength || Math.PI * 2
                );
            case 'ring':
                return new THREE.RingGeometry(
                    params.innerRadius || 0.2,
                    params.outerRadius || 0.5,
                    params.thetaSegments || 16,
                    params.phiSegments || 1,
                    params.thetaStart || 0,
                    params.thetaLength || Math.PI * 2
                );
            case 'cone':
                return new THREE.ConeGeometry(
                    params.radius || 0.5,
                    params.height || 1,
                    params.radialSegments || 16,
                    params.heightSegments || 1,
                    params.openEnded || false,
                    params.thetaStart || 0,
                    params.thetaLength || Math.PI * 2
                );
            case 'capsule':
                return new THREE.CapsuleGeometry(
                    params.radius || 0.5,
                    params.length || 1,
                    params.capSegments || 8,
                    params.radialSegments || 16
                );
            default:
                console.warn(`ResourceManager: Unknown geometry type '${type}', using box`);
                return new THREE.BoxGeometry(1, 1, 1);
        }
    }
    
    /**
     * Get or create material with caching for memory efficiency
     */
    getMaterial(type, params = {}) {
        const key = `${type}_${JSON.stringify(params)}`;
        if (!this.materials.has(key)) {
            this.materials.set(key, this.createMaterial(type, params));
        }
        return this.materials.get(key);
    }
    
    /**
     * Create material based on type and parameters
     */
    createMaterial(type, params) {
        switch (type) {
            case 'phong':
                return new THREE.MeshPhongMaterial(params);
            case 'basic':
                return new THREE.MeshBasicMaterial(params);
            case 'lambert':
                return new THREE.MeshLambertMaterial(params);
            case 'standard':
                return new THREE.MeshStandardMaterial(params);
            case 'physical':
                return new THREE.MeshPhysicalMaterial(params);
            case 'matcap':
                return new THREE.MeshMatcapMaterial(params);
            case 'toon':
                return new THREE.MeshToonMaterial(params);
            case 'normal':
                return new THREE.MeshNormalMaterial(params);
            case 'depth':
                return new THREE.MeshDepthMaterial(params);
            case 'distance':
                return new THREE.MeshDistanceMaterial(params);
            case 'line':
                return new THREE.LineBasicMaterial(params);
            case 'line-dashed':
                return new THREE.LineDashedMaterial(params);
            case 'points':
                return new THREE.PointsMaterial(params);
            case 'sprite':
                return new THREE.SpriteMaterial(params);
            case 'shader':
                return new THREE.ShaderMaterial(params);
            case 'raw-shader':
                return new THREE.RawShaderMaterial(params);
            default:
                console.warn(`ResourceManager: Unknown material type '${type}', using phong`);
                return new THREE.MeshPhongMaterial(params);
        }
    }
    
    /**
     * Get or create texture with caching
     */
    getTexture(url, params = {}) {
        if (!this.textures.has(url)) {
            const loader = new THREE.TextureLoader();
            const texture = loader.load(url);
            
            // Apply parameters
            if (params.wrapS) texture.wrapS = params.wrapS;
            if (params.wrapT) texture.wrapT = params.wrapT;
            if (params.repeat) texture.repeat.set(params.repeat.x || 1, params.repeat.y || 1);
            if (params.offset) texture.offset.set(params.offset.x || 0, params.offset.y || 0);
            if (params.center) texture.center.set(params.center.x || 0.5, params.center.y || 0.5);
            if (params.rotation) texture.rotation = params.rotation;
            if (params.magFilter) texture.magFilter = params.magFilter;
            if (params.minFilter) texture.minFilter = params.minFilter;
            if (params.flipY !== undefined) texture.flipY = params.flipY;
            
            this.textures.set(url, texture);
        }
        return this.textures.get(url);
    }
    
    /**
     * Dispose object and its resources properly
     */
    disposeObject(object) {
        if (!object || this.disposedObjects.has(object)) return;
        
        // Dispose geometry
        if (object.geometry) {
            object.geometry.dispose();
        }
        
        // Dispose materials
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(mat => this.disposeMaterial(mat));
            } else {
                this.disposeMaterial(object.material);
            }
        }
        
        // Recursively dispose children
        if (object.children && object.children.length > 0) {
            // Create a copy to avoid issues with array modification during iteration
            const children = [...object.children];
            children.forEach(child => this.disposeObject(child));
        }
        
        // Remove from parent if it has one
        if (object.parent) {
            object.parent.remove(object);
        }
        
        // Mark as disposed
        this.disposedObjects.add(object);
    }
    
    /**
     * Dispose a material and its textures
     */
    disposeMaterial(material) {
        if (!material) return;
        
        // Dispose textures used by the material
        Object.keys(material).forEach(key => {
            const value = material[key];
            if (value && value.isTexture) {
                value.dispose();
            }
        });
        
        // Dispose the material itself
        material.dispose();
    }
    
    /**
     * Add managed event listener for automatic cleanup
     */
    addEventListenerManaged(element, event, handler) {
        element.addEventListener(event, handler);
        
        // Store for cleanup (could be expanded to track these)
        if (!element._managedListeners) {
            element._managedListeners = new Map();
        }
        element._managedListeners.set(event, handler);
    }
    
    /**
     * Remove managed event listeners
     */
    removeEventListenersManaged(element) {
        if (element._managedListeners) {
            element._managedListeners.forEach((handler, event) => {
                element.removeEventListener(event, handler);
            });
            element._managedListeners.clear();
        }
    }
    
    /**
     * Get memory usage statistics
     */
    getMemoryStats() {
        return {
            geometries: this.geometries.size,
            materials: this.materials.size,
            textures: this.textures.size,
            disposedObjects: this.disposedObjects.size,
            estimatedMemoryKB: (this.geometries.size * 10) + (this.materials.size * 5) + (this.textures.size * 100)
        };
    }
    
    /**
     * Clear all cached resources (use carefully)
     */
    clearCache() {
        // Dispose all cached geometries
        this.geometries.forEach(geometry => geometry.dispose());
        this.geometries.clear();
        
        // Dispose all cached materials
        this.materials.forEach(material => this.disposeMaterial(material));
        this.materials.clear();
        
        // Dispose all cached textures
        this.textures.forEach(texture => texture.dispose());
        this.textures.clear();
        
        this.disposedObjects.clear();
        
        console.log('ResourceManager: Cache cleared');
    }
    
    /**
     * Get current status
     */
    getStatus() {
        const stats = this.getMemoryStats();
        return {
            initialized: true,
            ...stats,
            cacheHitRatio: {
                geometries: 'N/A', // Would need hit tracking
                materials: 'N/A',
                textures: 'N/A'
            }
        };
    }
}

// Create global instance and export
const resourceManager = new ResourceManager();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.resourceManager = resourceManager;
    window.ResourceManager = ResourceManager;
    console.log('ResourceManager loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { resourceManager, ResourceManager };
}