/**
 * StateManager.js - Centralized state management for the 3D Theater Stage
 * 
 * Replaces all global variables with a single, well-organized state object
 * that provides controlled access to the application state.
 */

class StageState {
    constructor() {
        // Core Three.js objects
        this.core = {
            scene: null,
            camera: null,
            renderer: null,
            controls: null
        };
        
        // Stage physical elements
        this.stage = {
            stage: null,
            lights: [],
            stageMarkers: [],
            curtains: {
                left: null,
                right: null,
                top: null,
                state: 'closed'
            },
            moveablePlatforms: [],
            rotatingStage: null,
            trapDoors: [],
            sceneryPanels: []
        };
        
        // Objects on stage
        this.objects = {
            props: [],
            actors: [],
            nextActorId: 1,
            nextPropId: 1
        };
        
        // UI state and interaction
        this.ui = {
            placementMode: null, // 'prop', 'actor', 'push', null
            placementMarker: null,
            selectedPropType: 'cube',
            selectedActorType: 'human_male',
            selectedSceneryPanel: 0,
            currentLightingPreset: 'normal'
        };
        
        // Physics and relationships
        this.physics = {
            propPlatformRelations: new Map(),
            propRotatingStageRelations: new Set(),
            propTrapDoorRelations: new Map(),
            objectVelocities: new Map()
        };
        
        // Performance monitoring
        this.performance = {
            frameCount: 0,
            lastFrameTime: 0,
            animationTime: 0,
            stats: {
                frameTime: 0,
                collisionChecks: 0,
                activeObjects: 0,
                lastFPSUpdate: 0,
                fps: 0,
                memoryStats: {}
            }
        };
        
        // System managers
        this.managers = {
            command: null,
            scene: null,
            texture: null,
            audio: null,
            resource: null
        };
    }
    
    // Getters for common state access
    get scene() { return this.core.scene; }
    get camera() { return this.core.camera; }
    get renderer() { return this.core.renderer; }
    get controls() { return this.core.controls; }
    
    get props() { return this.objects.props; }
    get actors() { return this.objects.actors; }
    get lights() { return this.stage.lights; }
    get stageMarkers() { return this.stage.stageMarkers; }
    get moveablePlatforms() { return this.stage.moveablePlatforms; }
    get trapDoors() { return this.stage.trapDoors; }
    get sceneryPanels() { return this.stage.sceneryPanels; }
    
    get placementMode() { return this.ui.placementMode; }
    get selectedPropType() { return this.ui.selectedPropType; }
    get selectedActorType() { return this.ui.selectedActorType; }
    get curtainState() { return this.stage.curtains.state; }
    
    // Setters for controlled state updates
    set scene(value) { this.core.scene = value; }
    set camera(value) { this.core.camera = value; }
    set renderer(value) { this.core.renderer = value; }
    set controls(value) { this.core.controls = value; }
    
    set placementMode(value) { this.ui.placementMode = value; }
    set selectedPropType(value) { this.ui.selectedPropType = value; }
    set selectedActorType(value) { this.ui.selectedActorType = value; }
    set curtainState(value) { this.stage.curtains.state = value; }
    
    // Utility methods for state management
    addProp(prop) {
        this.objects.props.push(prop);
    }
    
    removeProp(prop) {
        const index = this.objects.props.indexOf(prop);
        if (index > -1) {
            this.objects.props.splice(index, 1);
        }
    }
    
    addActor(actor) {
        this.objects.actors.push(actor);
    }
    
    removeActor(actor) {
        const index = this.objects.actors.indexOf(actor);
        if (index > -1) {
            this.objects.actors.splice(index, 1);
        }
    }
    
    getNextActorId() {
        return this.objects.nextActorId++;
    }
    
    getNextPropId() {
        return this.objects.nextPropId++;
    }
    
    clearObjects() {
        this.objects.props = [];
        this.objects.actors = [];
        this.objects.nextActorId = 1;
        this.objects.nextPropId = 1;
        
        // Clear physics relationships
        this.physics.propPlatformRelations.clear();
        this.physics.propRotatingStageRelations.clear();
        this.physics.propTrapDoorRelations.clear();
        this.physics.objectVelocities.clear();
    }
    
    resetToDefaults() {
        // Reset stage elements to default states
        this.stage.curtains.state = 'closed';
        this.ui.currentLightingPreset = 'normal';
        this.ui.placementMode = null;
        this.ui.selectedSceneryPanel = 0;
        
        // Reset platform positions
        this.stage.moveablePlatforms.forEach(platform => {
            platform.position.y = 0.1;
            platform.userData.targetY = 0.1;
            platform.userData.moving = false;
        });
        
        // Reset scenery panels
        this.stage.sceneryPanels.forEach((panel, index) => {
            panel.userData.currentPosition = 0;
            panel.userData.targetPosition = 0;
            panel.position.x = panel.userData.isBackdrop ? -30 : 30;
        });
    }
    
    // Debug helper
    getStateSnapshot() {
        return {
            propsCount: this.objects.props.length,
            actorsCount: this.objects.actors.length,
            lightsCount: this.stage.lights.length,
            curtainState: this.stage.curtains.state,
            placementMode: this.ui.placementMode,
            selectedPropType: this.ui.selectedPropType,
            selectedActorType: this.ui.selectedActorType,
            fps: this.performance.stats.fps,
            frameTime: this.performance.stats.frameTime
        };
    }
}

// Create and export global state instance
const stageState = new StageState();

// For browser compatibility - make available on window immediately
if (typeof window !== 'undefined') {
    window.stageState = stageState;
    window.StageState = StageState;
    console.log('StateManager loaded - stageState available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stageState, StageState };
}