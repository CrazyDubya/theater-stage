/**
 * SceneManager.js - Three.js Scene Setup and Core Rendering Management
 * 
 * Handles the initialization and management of Three.js core objects:
 * scene, camera, renderer, and controls. Provides methods for scene
 * configuration and event handling setup.
 */

class ThreeSceneManager {
    constructor() {
        this.isInitialized = false;
        this.sceneConfig = {
            background: 0x001122,
            fog: { color: 0x001122, near: 10, far: 100 },
            camera: {
                fov: 75,
                near: 0.1,
                far: 1000,
                position: { x: 0, y: 5, z: 20 },
                target: { x: 0, y: 0, z: 0 }
            },
            renderer: {
                antialias: true,
                shadowMapEnabled: true,
                shadowMapType: THREE.PCFSoftShadowMap
            },
            controls: {
                enableDamping: true,
                dampingFactor: 0.05,
                screenSpacePanning: false,
                minDistance: 5,
                maxDistance: 50,
                maxPolarAngle: Math.PI / 2
            }
        };
    }

    /**
     * Initialize the Three.js scene with all core components
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('SceneManager already initialized');
            return;
        }

        console.log('SceneManager: Initializing Three.js scene...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Create core Three.js objects
            this.createScene();
            this.createCamera();
            this.createRenderer();
            this.createControls();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            this.isInitialized = true;
            console.log('SceneManager: Initialization complete');
            
            return {
                scene: window.stageState.scene,
                camera: window.stageState.camera,
                renderer: window.stageState.renderer,
                controls: window.stageState.controls
            };
            
        } catch (error) {
            console.error('SceneManager: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Wait for required dependencies (StateManager, THREE.js)
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
                
                resolve();
            };
            
            checkDependencies();
            
            // Timeout after 10 seconds
            setTimeout(() => {
                reject(new Error('Dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create and configure the Three.js scene
     */
    createScene() {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(this.sceneConfig.background);
        scene.fog = new THREE.Fog(
            this.sceneConfig.fog.color,
            this.sceneConfig.fog.near,
            this.sceneConfig.fog.far
        );
        
        // Store in state
        window.stageState.core.scene = scene;
        
        console.log('SceneManager: Scene created');
    }

    /**
     * Create and configure the camera
     */
    createCamera() {
        const camera = new THREE.PerspectiveCamera(
            this.sceneConfig.camera.fov,
            window.innerWidth / window.innerHeight,
            this.sceneConfig.camera.near,
            this.sceneConfig.camera.far
        );
        
        camera.position.set(
            this.sceneConfig.camera.position.x,
            this.sceneConfig.camera.position.y,
            this.sceneConfig.camera.position.z
        );
        
        camera.lookAt(
            this.sceneConfig.camera.target.x,
            this.sceneConfig.camera.target.y,
            this.sceneConfig.camera.target.z
        );
        
        // Store in state
        window.stageState.core.camera = camera;
        
        console.log('SceneManager: Camera created');
    }

    /**
     * Create and configure the renderer
     */
    createRenderer() {
        const renderer = new THREE.WebGLRenderer({
            antialias: this.sceneConfig.renderer.antialias
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = this.sceneConfig.renderer.shadowMapEnabled;
        renderer.shadowMap.type = this.sceneConfig.renderer.shadowMapType;
        
        // Add to DOM
        document.body.appendChild(renderer.domElement);
        
        // Store in state
        window.stageState.core.renderer = renderer;
        
        console.log('SceneManager: Renderer created and added to DOM');
    }

    /**
     * Create and configure the orbit controls
     */
    createControls() {
        if (!THREE.OrbitControls) {
            console.error('OrbitControls not available');
            return;
        }
        
        const controls = new THREE.OrbitControls(
            window.stageState.core.camera,
            window.stageState.core.renderer.domElement
        );
        
        controls.enableDamping = this.sceneConfig.controls.enableDamping;
        controls.dampingFactor = this.sceneConfig.controls.dampingFactor;
        controls.screenSpacePanning = this.sceneConfig.controls.screenSpacePanning;
        controls.minDistance = this.sceneConfig.controls.minDistance;
        controls.maxDistance = this.sceneConfig.controls.maxDistance;
        controls.maxPolarAngle = this.sceneConfig.controls.maxPolarAngle;
        
        // Store in state
        window.stageState.core.controls = controls;
        
        console.log('SceneManager: Controls created');
    }

    /**
     * Set up event handlers for window resize and interactions
     */
    setupEventHandlers() {
        // Window resize handler
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        
        console.log('SceneManager: Event handlers set up');
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        const camera = window.stageState.core.camera;
        const renderer = window.stageState.core.renderer;
        
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * Update scene configuration
     */
    updateConfig(newConfig) {
        this.sceneConfig = { ...this.sceneConfig, ...newConfig };
        console.log('SceneManager: Configuration updated');
    }

    /**
     * Get current scene objects
     */
    getSceneObjects() {
        return {
            scene: window.stageState.core.scene,
            camera: window.stageState.core.camera,
            renderer: window.stageState.core.renderer,
            controls: window.stageState.core.controls
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        if (window.stageState.core.renderer) {
            window.stageState.core.renderer.dispose();
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.onWindowResize.bind(this), false);
        
        this.isInitialized = false;
        console.log('SceneManager: Disposed');
    }

    /**
     * Get initialization status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            hasScene: !!window.stageState?.core?.scene,
            hasCamera: !!window.stageState?.core?.camera,
            hasRenderer: !!window.stageState?.core?.renderer,
            hasControls: !!window.stageState?.core?.controls
        };
    }
}

// Create global instance
const threeSceneManager = new ThreeSceneManager();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.threeSceneManager = threeSceneManager;
    console.log('SceneManager loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { threeSceneManager, ThreeSceneManager };
}