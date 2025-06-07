/**
 * TextureManager.js - Texture and Material Management System for Theater Stage
 * 
 * Handles all texture and material operations in the 3D Theater Stage:
 * - Procedural texture generation (brick, wood, sky, etc.)
 * - Custom texture loading from user uploads
 * - Texture application to scenery panels with scaling
 * - Material caching and reuse for performance
 * - Texture memory management and disposal
 * - Default texture library with seamless tiling
 * - UV mapping and texture coordinate management
 * - Integration with ResourceManager for material sharing
 */

class StageTextureManager {
    constructor() {
        this.isInitialized = false;
        this.textures = new Map();
        this.customTextures = new Map();
        this.loader = null;
        this.defaultTextures = {};
        
        // Texture configuration
        this.textureConfig = {
            defaultSize: 256,
            maxSize: 2048,
            supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            defaultWrapMode: THREE.RepeatWrapping,
            defaultFilterMode: THREE.LinearFilter,
            generateMipmaps: true
        };
        
        // Default texture library definitions
        this.textureLibrary = {
            brick: {
                name: 'Brick Wall',
                category: 'architectural',
                baseColor: '#8B4513',
                pattern: 'brick',
                seamless: true
            },
            wood: {
                name: 'Wood Planks', 
                category: 'architectural',
                baseColor: '#DEB887',
                pattern: 'wood',
                seamless: true
            },
            sky: {
                name: 'Sky Gradient',
                category: 'environment',
                baseColor: '#87CEEB',
                pattern: 'gradient',
                seamless: false
            },
            forest: {
                name: 'Forest Scene',
                category: 'environment', 
                baseColor: '#228B22',
                pattern: 'forest',
                seamless: false
            },
            castle: {
                name: 'Castle Wall',
                category: 'architectural',
                baseColor: '#696969',
                pattern: 'stone',
                seamless: true
            },
            city: {
                name: 'City Skyline',
                category: 'environment',
                baseColor: '#4682B4',
                pattern: 'cityscape',
                seamless: false
            },
            fabric: {
                name: 'Theater Curtain',
                category: 'textile',
                baseColor: '#8B0000',
                pattern: 'fabric',
                seamless: true
            },
            marble: {
                name: 'Marble Surface',
                category: 'architectural',
                baseColor: '#F5F5DC',
                pattern: 'marble',
                seamless: true
            }
        };
        
        console.log('TextureManager: Initialized');
    }

    /**
     * Initialize the texture manager
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('TextureManager already initialized');
            return;
        }

        console.log('TextureManager: Initializing texture and material system...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Set up local references
            this.stageState = window.stageState;
            this.resourceManager = window.resourceManager;
            
            // Create texture loader
            this.loader = new THREE.TextureLoader();
            
            // Generate default texture library
            this.createDefaultTextures();
            
            this.isInitialized = true;
            console.log('TextureManager: Initialization complete');
            
        } catch (error) {
            console.error('TextureManager: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (typeof THREE === 'undefined') {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.stageState) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.resourceManager) {
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('TextureManager dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create library of default procedural textures
     */
    createDefaultTextures() {
        const canvas = document.createElement('canvas');
        canvas.width = this.textureConfig.defaultSize;
        canvas.height = this.textureConfig.defaultSize;
        const ctx = canvas.getContext('2d');
        
        const textures = {};
        
        // Create brick texture
        textures.brick = this.createBrickTexture(ctx, canvas);
        
        // Create wood texture
        textures.wood = this.createWoodTexture(ctx, canvas);
        
        // Create sky texture
        textures.sky = this.createSkyTexture(ctx, canvas);
        
        // Create forest texture
        textures.forest = this.createForestTexture(ctx, canvas);
        
        // Create castle texture
        textures.castle = this.createCastleTexture(ctx, canvas);
        
        // Create city texture
        textures.city = this.createCityTexture(ctx, canvas);
        
        // Create fabric texture
        textures.fabric = this.createFabricTexture(ctx, canvas);
        
        // Create marble texture
        textures.marble = this.createMarbleTexture(ctx, canvas);
        
        this.defaultTextures = textures;
        console.log('TextureManager: Default texture library created with', Object.keys(textures).length, 'textures');
    }

    /**
     * Create brick wall texture
     */
    createBrickTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Base brick color
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, size, size);
        
        // Draw brick pattern
        const brickWidth = size / 8;
        const brickHeight = size / 16;
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        
        // Horizontal mortar lines
        for (let y = 0; y < size; y += brickHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }
        
        // Vertical mortar lines (offset every other row)
        for (let row = 0; row < size / brickHeight; row++) {
            const y = row * brickHeight;
            const offset = (row % 2) * (brickWidth / 2);
            
            for (let x = offset; x < size + brickWidth; x += brickWidth) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + brickHeight);
                ctx.stroke();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = this.textureConfig.defaultWrapMode;
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Create wood plank texture
     */
    createWoodTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Base wood color
        ctx.fillStyle = '#DEB887';
        ctx.fillRect(0, 0, size, size);
        
        // Add wood grain
        const plankHeight = size / 6;
        
        for (let y = 0; y < size; y += plankHeight) {
            // Plank boundaries
            ctx.strokeStyle = '#CD853F';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
            
            // Wood grain lines
            ctx.strokeStyle = '#D2B48C';
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < 8; i++) {
                const grainY = y + (i / 8) * plankHeight;
                const wave = Math.sin(i * 0.8) * 4;
                
                ctx.beginPath();
                ctx.moveTo(0, grainY + wave);
                
                for (let x = 0; x < size; x += 4) {
                    const waveY = grainY + Math.sin(x * 0.05 + i) * 2 + wave;
                    ctx.lineTo(x, waveY);
                }
                
                ctx.stroke();
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = this.textureConfig.defaultWrapMode;
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Create sky gradient texture
     */
    createSkyTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Create sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#87CEEB'); // Sky blue
        gradient.addColorStop(0.6, '#B0E0E6'); // Powder blue
        gradient.addColorStop(1, '#F0F8FF'); // Alice blue
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Add simple clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let i = 0; i < 6; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size * 0.7;
            const radius = 20 + Math.random() * 30;
            
            ctx.beginPath();
            ctx.ellipse(x, y, radius, radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Create forest scene texture
     */
    createForestTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Sky background
        const gradient = ctx.createLinearGradient(0, 0, 0, size * 0.4);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#90EE90');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size * 0.4);
        
        // Ground
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, size * 0.4, size, size * 0.6);
        
        // Trees
        ctx.fillStyle = '#8B4513'; // Brown trunks
        
        for (let i = 0; i < 8; i++) {
            const x = (i / 8) * size + Math.random() * 20;
            const trunkWidth = 8 + Math.random() * 8;
            const trunkHeight = 60 + Math.random() * 40;
            
            ctx.fillRect(x - trunkWidth/2, size * 0.4, trunkWidth, trunkHeight);
            
            // Foliage
            ctx.fillStyle = i % 2 ? '#228B22' : '#32CD32';
            ctx.beginPath();
            ctx.ellipse(x, size * 0.4, 25 + Math.random() * 15, 35 + Math.random() * 15, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#8B4513'; // Reset for next trunk
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Create castle wall texture
     */
    createCastleTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Base stone color
        ctx.fillStyle = '#696969';
        ctx.fillRect(0, 0, size, size);
        
        // Stone blocks
        const blockWidth = size / 6;
        const blockHeight = size / 8;
        
        ctx.strokeStyle = '#556B2F';
        ctx.lineWidth = 2;
        
        for (let row = 0; row < size / blockHeight; row++) {
            for (let col = 0; col < size / blockWidth; col++) {
                const x = col * blockWidth;
                const y = row * blockHeight;
                
                // Add some randomness to stone placement
                const offsetX = (Math.random() - 0.5) * 4;
                const offsetY = (Math.random() - 0.5) * 4;
                
                ctx.strokeRect(x + offsetX, y + offsetY, blockWidth, blockHeight);
                
                // Add stone texture
                ctx.fillStyle = `rgba(${105 + Math.random() * 20}, ${105 + Math.random() * 20}, ${105 + Math.random() * 20}, 0.3)`;
                ctx.fillRect(x + offsetX + 2, y + offsetY + 2, blockWidth - 4, blockHeight - 4);
            }
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = this.textureConfig.defaultWrapMode;
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Create city skyline texture
     */
    createCityTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Sky with sunset gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, size);
        gradient.addColorStop(0, '#FF6B35');
        gradient.addColorStop(0.3, '#F7931E');
        gradient.addColorStop(0.7, '#4682B4');
        gradient.addColorStop(1, '#191970');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        
        // Buildings silhouettes
        ctx.fillStyle = '#1C1C1C';
        
        const buildingCount = 12;
        for (let i = 0; i < buildingCount; i++) {
            const x = (i / buildingCount) * size;
            const width = size / buildingCount + Math.random() * 20;
            const height = size * 0.3 + Math.random() * size * 0.5;
            
            ctx.fillRect(x, size - height, width, height);
            
            // Windows
            ctx.fillStyle = '#FFFF99';
            const windowSize = 3;
            const windowSpacing = 8;
            
            for (let wy = size - height + 10; wy < size - 10; wy += windowSpacing) {
                for (let wx = x + 5; wx < x + width - 5; wx += windowSpacing) {
                    if (Math.random() > 0.3) { // Not all windows are lit
                        ctx.fillRect(wx, wy, windowSize, windowSize);
                    }
                }
            }
            
            ctx.fillStyle = '#1C1C1C'; // Reset for next building
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Create fabric curtain texture
     */
    createFabricTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Base fabric color
        ctx.fillStyle = '#8B0000';
        ctx.fillRect(0, 0, size, size);
        
        // Fabric weave pattern
        const weaveSize = 4;
        
        for (let x = 0; x < size; x += weaveSize * 2) {
            for (let y = 0; y < size; y += weaveSize * 2) {
                // Horizontal threads
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(x, y, weaveSize * 2, weaveSize);
                
                // Vertical threads
                ctx.fillStyle = '#CD853F';
                ctx.fillRect(x + weaveSize, y, weaveSize, weaveSize * 2);
            }
        }
        
        // Add fabric fold shadows
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < size; i += 32) {
            ctx.fillRect(i, 0, 8, size);
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = this.textureConfig.defaultWrapMode;
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Create marble surface texture
     */
    createMarbleTexture(ctx, canvas) {
        const size = canvas.width;
        
        // Base marble color
        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(0, 0, size, size);
        
        // Marble veins
        ctx.strokeStyle = 'rgba(169, 169, 169, 0.5)';
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * size, Math.random() * size);
            
            const points = 8 + Math.random() * 8;
            for (let j = 0; j < points; j++) {
                const x = Math.random() * size;
                const y = Math.random() * size;
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        }
        
        // Secondary veining
        ctx.strokeStyle = 'rgba(105, 105, 105, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 15; i++) {
            ctx.beginPath();
            const startX = Math.random() * size;
            const startY = Math.random() * size;
            ctx.moveTo(startX, startY);
            
            const endX = startX + (Math.random() - 0.5) * size * 0.3;
            const endY = startY + (Math.random() - 0.5) * size * 0.3;
            ctx.quadraticCurveTo(
                startX + (Math.random() - 0.5) * 50,
                startY + (Math.random() - 0.5) * 50,
                endX, endY
            );
            ctx.stroke();
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = texture.wrapT = this.textureConfig.defaultWrapMode;
        texture.generateMipmaps = this.textureConfig.generateMipmaps;
        return texture;
    }

    /**
     * Load custom texture from file
     */
    loadCustomTexture(file) {
        return new Promise((resolve, reject) => {
            console.log('TextureManager: Loading custom texture:', file.name, 'type:', file.type, 'size:', file.size);
            
            // Validate file type
            if (!this.textureConfig.supportedFormats.includes(file.type)) {
                reject(new Error(`Unsupported file format: ${file.type}`));
                return;
            }
            
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                reject(new Error('File too large. Maximum size is 10MB'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                console.log('TextureManager: File loaded, creating texture...');
                
                const texture = this.loader.load(
                    e.target.result,
                    (loadedTexture) => {
                        // Configure texture
                        loadedTexture.wrapS = loadedTexture.wrapT = this.textureConfig.defaultWrapMode;
                        loadedTexture.generateMipmaps = this.textureConfig.generateMipmaps;
                        loadedTexture.needsUpdate = true;
                        
                        // Validate texture dimensions
                        if (loadedTexture.image.width > this.textureConfig.maxSize || 
                            loadedTexture.image.height > this.textureConfig.maxSize) {
                            console.warn('TextureManager: Large texture detected:', 
                                loadedTexture.image.width, 'x', loadedTexture.image.height);
                        }
                        
                        // Store in custom textures
                        const textureId = Date.now() + '_' + file.name;
                        this.customTextures.set(textureId, {
                            texture: loadedTexture,
                            filename: file.name,
                            size: file.size,
                            dimensions: {
                                width: loadedTexture.image.width,
                                height: loadedTexture.image.height
                            }
                        });
                        
                        console.log('TextureManager: Texture loaded successfully:', {
                            id: textureId,
                            dimensions: `${loadedTexture.image.width}x${loadedTexture.image.height}`,
                            filename: file.name
                        });
                        
                        resolve(loadedTexture);
                    },
                    (progress) => {
                        console.log('TextureManager: Loading progress:', progress);
                    },
                    (error) => {
                        console.error('TextureManager: Texture loading error:', error);
                        reject(new Error('Failed to load texture: ' + error.message));
                    }
                );
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Apply texture to scenery panel
     */
    applyTextureToPanel(panelIndex, texture, scale = { x: 1, y: 1 }) {
        if (!this.isInitialized) {
            console.warn('TextureManager: Not initialized');
            return false;
        }
        
        const sceneryPanels = this.stageState.sceneryPanels;
        
        if (panelIndex >= sceneryPanels.length || panelIndex < 0) {
            console.error('TextureManager: Invalid panel index:', panelIndex);
            return false;
        }
        
        const panel = sceneryPanels[panelIndex];
        if (!panel || !panel.children[0]) {
            console.error('TextureManager: Panel or mesh not found at index:', panelIndex);
            return false;
        }
        
        const mesh = panel.children[0];
        console.log('TextureManager: Applying texture to panel', panelIndex);
        
        // Clone texture to avoid sharing references
        const clonedTexture = texture.clone();
        clonedTexture.repeat.set(scale.x, scale.y);
        clonedTexture.wrapS = this.textureConfig.defaultWrapMode;
        clonedTexture.wrapT = this.textureConfig.defaultWrapMode;
        clonedTexture.needsUpdate = true;
        
        // Apply to material
        mesh.material.map = clonedTexture;
        mesh.material.color.setHex(0xffffff); // Set to white so texture shows properly
        mesh.material.transparent = true;
        mesh.material.opacity = 1.0;
        mesh.material.needsUpdate = true;
        
        console.log('TextureManager: Texture applied successfully to panel', panelIndex);
        return true;
    }

    /**
     * Remove texture from panel (restore original color)
     */
    removeTextureFromPanel(panelIndex) {
        if (!this.isInitialized) {
            console.warn('TextureManager: Not initialized');
            return false;
        }
        
        const sceneryPanels = this.stageState.sceneryPanels;
        
        if (panelIndex >= sceneryPanels.length || panelIndex < 0) {
            console.error('TextureManager: Invalid panel index:', panelIndex);
            return false;
        }
        
        const panel = sceneryPanels[panelIndex];
        if (!panel || !panel.children[0]) {
            console.error('TextureManager: Panel or mesh not found at index:', panelIndex);
            return false;
        }
        
        const mesh = panel.children[0];
        
        // Remove texture and restore original color
        mesh.material.map = null;
        // Restore original colors: blue for backdrop (0), green for midstage (1)
        mesh.material.color.setHex(panelIndex === 0 ? 0x4169e1 : 0x228b22);
        mesh.material.needsUpdate = true;
        
        console.log('TextureManager: Texture removed from panel', panelIndex);
        return true;
    }

    /**
     * Adjust texture scale on panel
     */
    adjustTextureScale(panelIndex, scale) {
        if (!this.isInitialized) {
            console.warn('TextureManager: Not initialized');
            return false;
        }
        
        const sceneryPanels = this.stageState.sceneryPanels;
        
        if (panelIndex >= sceneryPanels.length || panelIndex < 0) {
            console.error('TextureManager: Invalid panel index:', panelIndex);
            return false;
        }
        
        const panel = sceneryPanels[panelIndex];
        if (!panel || !panel.children[0] || !panel.children[0].material.map) {
            console.warn('TextureManager: No texture found on panel', panelIndex);
            return false;
        }
        
        panel.children[0].material.map.repeat.set(scale, scale);
        panel.children[0].material.needsUpdate = true;
        
        console.log('TextureManager: Texture scale adjusted to', scale, 'on panel', panelIndex);
        return true;
    }

    /**
     * Get default texture by name
     */
    getDefaultTexture(name) {
        return this.defaultTextures[name] || null;
    }

    /**
     * Get texture library information
     */
    getTextureLibrary() {
        return this.textureLibrary;
    }

    /**
     * Get all available texture names
     */
    getAvailableTextures() {
        return Object.keys(this.defaultTextures);
    }

    /**
     * Get custom textures
     */
    getCustomTextures() {
        return Array.from(this.customTextures.entries()).map(([id, data]) => ({
            id,
            filename: data.filename,
            size: data.size,
            dimensions: data.dimensions
        }));
    }

    /**
     * Clear all custom textures
     */
    clearCustomTextures() {
        // Dispose of custom textures
        this.customTextures.forEach((data, id) => {
            data.texture.dispose();
        });
        
        this.customTextures.clear();
        console.log('TextureManager: All custom textures cleared');
    }

    /**
     * Get texture usage statistics
     */
    getTextureStats() {
        const sceneryPanels = this.stageState?.sceneryPanels || [];
        let texturedPanels = 0;
        
        sceneryPanels.forEach(panel => {
            if (panel.children[0]?.material?.map) {
                texturedPanels++;
            }
        });
        
        return {
            defaultTextures: Object.keys(this.defaultTextures).length,
            customTextures: this.customTextures.size,
            texturedPanels: texturedPanels,
            totalPanels: sceneryPanels.length,
            supportedFormats: this.textureConfig.supportedFormats,
            maxTextureSize: this.textureConfig.maxSize
        };
    }

    /**
     * Update texture configuration
     */
    updateConfig(newConfig) {
        this.textureConfig = { ...this.textureConfig, ...newConfig };
        console.log('TextureManager: Configuration updated', this.textureConfig);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            defaultTextures: Object.keys(this.defaultTextures).length,
            customTextures: this.customTextures.size,
            textureLibrary: Object.keys(this.textureLibrary).length,
            loaderReady: !!this.loader
        };
    }

    /**
     * Clean up texture resources
     */
    dispose() {
        // Dispose default textures
        Object.values(this.defaultTextures).forEach(texture => {
            texture.dispose();
        });
        
        // Dispose custom textures
        this.clearCustomTextures();
        
        // Clear references
        this.defaultTextures = {};
        this.textures.clear();
        this.loader = null;
        this.isInitialized = false;
        
        console.log('TextureManager: Disposed');
    }
}

// Create global instance
const stageTextureManager = new StageTextureManager();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.stageTextureManager = stageTextureManager;
    window.textureManager = stageTextureManager; // Legacy compatibility
    console.log('TextureManager loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stageTextureManager, StageTextureManager };
}