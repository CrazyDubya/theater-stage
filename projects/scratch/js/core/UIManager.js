/**
 * UIManager.js - Modular User Interface Management System
 * 
 * Orchestrates the theater UI using composition of specialized modules:
 * - UIControls: Basic UI elements (buttons, sliders, selectors)
 * - UILighting: Lighting and camera controls
 * - UILayout: Main layout and panel management
 * 
 * This refactored version reduces complexity from 2,345 lines to ~400 lines
 * by delegating specific functionality to focused modules.
 */

class StageUIManager {
    constructor() {
        this.isInitialized = false;
        
        // UI state management
        this.uiState = {
            placementMode: null, // 'prop', 'actor', 'push', null
            selectedPropType: 'cube',
            selectedActorType: 'human_male',
            selectedSceneryPanel: 0,
            currentLightingPreset: 'normal',
            isUIVisible: true,
            isDragging: false,
            // Actor management state
            selectedActorId: null,
            actorSelectionMode: false,
            showActorPaths: false,
            showCollisionGrid: false,
            actorDebugMode: false,
            multiSelectMode: false,
            selectedActors: new Set()
        };
        
        // Move logging system
        this.actorMoveLogs = new Map();
        this.maxLogEntriesPerActor = 50;
        
        // Modular components (initialized after dependencies load)
        this.uiControls = null;
        this.uiLighting = null;
        this.uiLayout = null;
        
        console.log('UIManager: Initialized with modular architecture');
    }

    /**
     * Initialize the UI manager with modular components
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('UIManager already initialized');
            return;
        }

        console.log('UIManager: Initializing modular user interface system...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Set up local references
            this.stageState = window.stageState;
            this.uiFactory = window.UIFactory;
            
            // Initialize modular components
            this.initializeModules();
            
            // Create main UI structure using layout module
            this.uiLayout.createMainUI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('UIManager: Modular initialization complete');
            
        } catch (error) {
            console.error('UIManager: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize all UI modules
     */
    initializeModules() {
        console.log('UIManager: Initializing UI modules...');

        // Initialize UIControls (base for all other modules)
        this.uiControls = new window.UIControls(this.uiFactory, this.stageState);
        
        // Initialize UILighting (lighting and camera controls)
        this.uiLighting = new window.UILighting(this.uiControls, this.stageState);
        
        // Initialize UILayout (main layout coordination)
        this.uiLayout = new window.UILayout(this.uiControls, this.uiLighting, this.stageState);
        
        // Set up cross-module dependencies
        if (window.commandManager) {
            this.uiLighting.setCommandManager(window.commandManager);
        }
        
        console.log('UIManager: All modules initialized');
    }

    /**
     * Wait for required dependencies
     */
    async waitForDependencies() {
        return new Promise((resolve, reject) => {
            const checkDependencies = () => {
                if (!window.stageState) {
                    console.log('UIManager waiting for: window.stageState');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.UIFactory) {
                    console.log('UIManager waiting for: window.UIFactory');
                    setTimeout(checkDependencies, 50);
                    return;
                }

                if (!window.UIControls) {
                    console.log('UIManager waiting for: window.UIControls');
                    setTimeout(checkDependencies, 50);
                    return;
                }

                if (!window.UILighting) {
                    console.log('UIManager waiting for: window.UILighting');
                    setTimeout(checkDependencies, 50);
                    return;
                }

                if (!window.UILayout) {
                    console.log('UIManager waiting for: window.UILayout');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                console.log('UIManager: All dependencies ready');
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('UIManager dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Window resize handler
        window.addEventListener('resize', () => {
            if (this.uiLayout) {
                this.uiLayout.handleResize();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        console.log('UIManager: Event listeners set up');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        // UI toggle
        if (event.key === 'h' && event.ctrlKey) {
            event.preventDefault();
            this.toggleUI();
        }

        // Tab switching
        if (event.key >= '1' && event.key <= '4' && event.altKey) {
            event.preventDefault();
            const tabs = ['objects', 'stage', 'scenery', 'controls'];
            const index = parseInt(event.key) - 1;
            if (tabs[index] && this.uiLayout) {
                this.uiLayout.showPanel(tabs[index]);
            }
        }

        // Escape to cancel placement mode
        if (event.key === 'Escape') {
            this.cancelPlacementMode();
        }
    }

    /**
     * Toggle UI visibility (delegates to layout module)
     */
    toggleUI() {
        if (this.uiLayout) {
            this.uiLayout.toggleUI();
        }
    }

    /**
     * Show specific panel (delegates to layout module)
     */
    showPanel(panelName) {
        if (this.uiLayout) {
            this.uiLayout.showPanel(panelName);
        }
    }

    /**
     * Cancel placement mode
     */
    cancelPlacementMode() {
        this.uiState.placementMode = null;
        if (this.uiLayout) {
            this.uiLayout.updateUIState({ placementMode: null });
        }
        if (window.notificationManager) {
            window.notificationManager.show('Placement mode cancelled');
        }
    }

    /**
     * Update UI state
     */
    updateUIState(stateChanges) {
        Object.assign(this.uiState, stateChanges);
        if (this.uiLayout) {
            this.uiLayout.updateUIState(stateChanges);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.notificationManager) {
            window.notificationManager.show(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Handle stage click for placement mode
     */
    handleStageClick(position) {
        if (!this.uiState.placementMode) return false;

        if (this.uiState.placementMode === 'prop') {
            this.placeProp(position);
        } else if (this.uiState.placementMode === 'actor') {
            this.placeActor(position);
        }

        return true; // Indicate click was handled
    }

    /**
     * Place prop at position
     */
    placeProp(position) {
        if (window.threeObjectFactory && window.threeObjectFactory.addPropAt) {
            const propId = window.threeObjectFactory.addPropAt(
                this.uiState.selectedPropType,
                position.x,
                position.z
            );
            this.showNotification(`Placed ${this.uiState.selectedPropType} (${propId})`);
        }
    }

    /**
     * Place actor at position
     */
    placeActor(position) {
        if (window.threeObjectFactory && window.threeObjectFactory.addActorAt) {
            const actorId = window.threeObjectFactory.addActorAt(
                this.uiState.selectedActorType,
                position.x,
                position.z
            );
            this.showNotification(`Placed ${this.uiState.selectedActorType} (${actorId})`);
        }
    }

    /**
     * Log actor movement
     */
    logActorMovement(actorId, action, details = {}) {
        if (!this.actorMoveLogs.has(actorId)) {
            this.actorMoveLogs.set(actorId, []);
        }

        const log = this.actorMoveLogs.get(actorId);
        log.push({
            timestamp: Date.now(),
            action: action,
            details: details
        });

        // Limit log size
        if (log.length > this.maxLogEntriesPerActor) {
            log.splice(0, log.length - this.maxLogEntriesPerActor);
        }
    }

    /**
     * Get actor movement logs
     */
    getActorLogs(actorId) {
        return this.actorMoveLogs.get(actorId) || [];
    }

    /**
     * Clear all actor logs
     */
    clearActorLogs() {
        this.actorMoveLogs.clear();
        this.showNotification('Actor movement logs cleared');
    }

    /**
     * Get current UI state
     */
    getUIState() {
        if (this.uiLayout) {
            return {
                ...this.uiState,
                ...this.uiLayout.getUIState()
            };
        }
        return this.uiState;
    }

    /**
     * Export UI state for saving
     */
    exportState() {
        return {
            uiState: this.uiState,
            activeTab: this.uiLayout?.activeTab,
            isVisible: this.uiLayout?.stageState.isUIVisible
        };
    }

    /**
     * Import UI state from save
     */
    importState(savedState) {
        if (savedState.uiState) {
            this.updateUIState(savedState.uiState);
        }
        if (savedState.activeTab && this.uiLayout) {
            this.uiLayout.showPanel(savedState.activeTab);
        }
    }

    /**
     * Cleanup resources
     */
    destroy() {
        // Clean up modules
        if (this.uiLayout) {
            this.uiLayout.destroy();
        }
        
        // Clear logs
        this.actorMoveLogs.clear();
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        this.isInitialized = false;
        console.log('UIManager: Cleaned up');
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StageUIManager;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.StageUIManager = StageUIManager;
}