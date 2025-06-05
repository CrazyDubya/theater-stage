/**
 * ModuleLoader.js - ES6 Module System Bootstrap
 * 
 * Handles loading all modules and setting up the global state for the
 * 3D Theater Stage application. Provides backward compatibility with
 * the existing script-tag system while preparing for full ES6 modules.
 */

class ModuleLoader {
    constructor() {
        this.modules = {};
        this.loadPromises = [];
    }

    /**
     * Load a module dynamically and make it available globally
     */
    async loadModule(name, path) {
        try {
            console.log(`Loading module: ${name} from ${path}`);
            
            // For now, we'll use script tags for compatibility
            // Later can be converted to ES6 import() when browser support is ready
            const module = await this.loadScript(path);
            this.modules[name] = module;
            
            console.log(`Module ${name} loaded successfully`);
            return module;
        } catch (error) {
            console.error(`Failed to load module ${name}:`, error);
            throw error;
        }
    }

    /**
     * Load a script file dynamically
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = src;
            script.onload = () => resolve(window);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Initialize the module system in the correct order
     */
    async initializeModules() {
        console.log('Initializing module system...');
        
        try {
            // Phase 1: Core foundation modules
            await this.loadModule('StateManager', './js/core/StateManager.js');
            await this.loadModule('UIFactory', './js/ui/UIFactory.js');
            
            // Phase 2: Will add more modules as we extract them
            // await this.loadModule('SceneManager', './js/core/SceneManager.js');
            // await this.loadModule('RenderLoop', './js/core/RenderLoop.js');
            
            console.log('All modules loaded successfully!');
            
            // Set up global references for compatibility
            this.setupGlobalReferences();
            
            return true;
        } catch (error) {
            console.error('Module initialization failed:', error);
            return false;
        }
    }

    /**
     * Set up global references for backward compatibility
     */
    setupGlobalReferences() {
        // Make StateManager available globally
        if (window.stageState) {
            // Create global variable aliases for smooth transition
            window.globalState = window.stageState;
            
            // Legacy global variable getters (for gradual migration)
            Object.defineProperty(window, 'scene', {
                get: () => window.stageState.scene,
                set: (value) => window.stageState.scene = value
            });
            
            Object.defineProperty(window, 'camera', {
                get: () => window.stageState.camera,
                set: (value) => window.stageState.camera = value
            });
            
            Object.defineProperty(window, 'renderer', {
                get: () => window.stageState.renderer,
                set: (value) => window.stageState.renderer = value
            });
            
            Object.defineProperty(window, 'props', {
                get: () => window.stageState.props,
                set: (value) => window.stageState.objects.props = value
            });
            
            Object.defineProperty(window, 'actors', {
                get: () => window.stageState.actors,
                set: (value) => window.stageState.objects.actors = value
            });
            
            console.log('Global state references established');
        }
    }

    /**
     * Get a loaded module by name
     */
    getModule(name) {
        return this.modules[name];
    }

    /**
     * Check if all required modules are loaded
     */
    isReady() {
        const requiredModules = ['StateManager', 'UIFactory'];
        return requiredModules.every(name => this.modules[name]);
    }
}

// Create global module loader instance
const moduleLoader = new ModuleLoader();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        moduleLoader.initializeModules();
    });
} else {
    // DOM already loaded
    moduleLoader.initializeModules();
}

// Make available globally
window.moduleLoader = moduleLoader;

export default moduleLoader;