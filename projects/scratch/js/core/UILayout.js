/**
 * UILayout.js - Main UI Layout and Panel Management
 * 
 * Handles the core UI structure:
 * - Main UI container and tab system
 * - Panel creation and navigation
 * - UI visibility and state management
 * - Layout coordination and integration
 */

class UILayout {
    constructor(uiControls, uiLighting, stageState) {
        this.uiControls = uiControls;
        this.uiLighting = uiLighting;
        this.stageState = stageState;
        
        this.uiContainer = null;
        this.tabContainer = null;
        this.panels = new Map();
        this.activeTab = 'objects';
        
        // Tab configuration
        this.tabConfig = {
            objects: { label: 'Objects', icon: '🎭' },
            stage: { label: 'Stage', icon: '🎪' },
            scenery: { label: 'Scenery', icon: '🖼️' },
            controls: { label: 'Controls', icon: '⚙️' }
        };
        
        console.log('UILayout: Initialized');
    }

    /**
     * Create the main UI structure
     */
    createMainUI() {
        console.log('UILayout: Creating main UI structure...');

        // Create main UI container
        this.uiContainer = this.uiControls.uiFactory.createElement('div', {
            id: 'stage-ui',
            className: 'stage-ui-container'
        });

        // Create header
        const header = this.createHeader();
        this.uiContainer.appendChild(header);

        // Create tab container
        this.createTabContainer();
        this.uiContainer.appendChild(this.tabContainer);

        // Create all panels
        this.createPanels();

        // Add to DOM
        document.body.appendChild(this.uiContainer);

        // Show default panel
        this.showPanel('objects');

        console.log('UILayout: Main UI structure created');
    }

    /**
     * Create header with title and main controls
     */
    createHeader() {
        const header = this.uiControls.uiFactory.createElement('div', {
            className: 'ui-header'
        });

        const title = this.uiControls.uiFactory.createElement('h2', {
            textContent: '3D Theater Stage',
            className: 'ui-title'
        });

        const toggleButton = this.uiControls.createButton('Hide UI', () => {
            this.toggleUI();
        }, 'ui-toggle');

        header.appendChild(title);
        header.appendChild(toggleButton);

        return header;
    }

    /**
     * Create the tab navigation container
     */
    createTabContainer() {
        this.tabContainer = this.uiControls.uiFactory.createElement('div', {
            className: 'tab-container'
        });

        const tabNav = this.uiControls.uiFactory.createElement('div', {
            className: 'tab-nav'
        });

        // Create tab buttons
        Object.entries(this.tabConfig).forEach(([key, config]) => {
            const tabButton = this.uiControls.uiFactory.createElement('button', {
                className: `tab-button ${key === this.activeTab ? 'active' : ''}`,
                textContent: `${config.icon} ${config.label}`,
                onclick: () => this.showPanel(key)
            });

            tabButton.dataset.tab = key;
            tabNav.appendChild(tabButton);
        });

        this.tabContainer.appendChild(tabNav);

        // Create content area
        const contentArea = this.uiControls.uiFactory.createElement('div', {
            className: 'tab-content'
        });

        this.tabContainer.appendChild(contentArea);
    }

    /**
     * Create all UI panels
     */
    createPanels() {
        const contentArea = this.tabContainer.querySelector('.tab-content');

        // Objects panel
        const objectsPanel = this.createObjectsPanel();
        this.panels.set('objects', objectsPanel);
        contentArea.appendChild(objectsPanel);

        // Stage panel
        const stagePanel = this.createStagePanel();
        this.panels.set('stage', stagePanel);
        contentArea.appendChild(stagePanel);

        // Scenery panel
        const sceneryPanel = this.createSceneryPanel();
        this.panels.set('scenery', sceneryPanel);
        contentArea.appendChild(sceneryPanel);

        // Controls panel
        const controlsPanel = this.createControlsPanel();
        this.panels.set('controls', controlsPanel);
        contentArea.appendChild(controlsPanel);
    }

    /**
     * Create the Objects panel
     */
    createObjectsPanel() {
        const panel = this.uiControls.uiFactory.createElement('div', {
            className: 'panel objects-panel',
            style: 'display: none;'
        });

        // Prop placement section
        const propSection = this.uiControls.uiFactory.createElement('div', {
            className: 'section prop-section'
        });

        const propLabel = this.uiControls.createLabel('Props:');
        const propSelector = this.uiControls.createPropSelector((type) => {
            this.stageState.selectedPropType = type;
        });

        const propButton = this.uiControls.createToggleButton(
            'Place Prop',
            false,
            (active) => {
                this.stageState.placementMode = active ? 'prop' : null;
                if (window.notificationManager) {
                    const message = active ? 
                        `Click on stage to place ${this.stageState.selectedPropType}` :
                        'Prop placement mode disabled';
                    window.notificationManager.show(message);
                }
            }
        );

        propSection.appendChild(propLabel);
        propSection.appendChild(propSelector);
        propSection.appendChild(propButton);

        // Actor placement section
        const actorSection = this.uiControls.uiFactory.createElement('div', {
            className: 'section actor-section'
        });

        const actorLabel = this.uiControls.createLabel('Actors:');
        const actorSelector = this.uiControls.createActorSelector((type) => {
            this.stageState.selectedActorType = type;
        });

        const actorButton = this.uiControls.createToggleButton(
            'Place Actor',
            false,
            (active) => {
                this.stageState.placementMode = active ? 'actor' : null;
                if (window.notificationManager) {
                    const message = active ? 
                        `Click on stage to place ${this.stageState.selectedActorType}` :
                        'Actor placement mode disabled';
                    window.notificationManager.show(message);
                }
            }
        );

        actorSection.appendChild(actorLabel);
        actorSection.appendChild(actorSelector);
        actorSection.appendChild(actorButton);

        // Object management section
        const managementSection = this.uiControls.uiFactory.createElement('div', {
            className: 'section management-section'
        });

        const clearButton = this.uiControls.createButton('Clear All', () => {
            if (window.clearAllObjects) {
                window.clearAllObjects();
            }
        }, 'clear-button');

        const scaleSlider = this.uiControls.createScaleSlider((scale) => {
            if (window.setDefaultScale) {
                window.setDefaultScale(scale);
            }
        });

        managementSection.appendChild(clearButton);
        managementSection.appendChild(scaleSlider);

        panel.appendChild(propSection);
        panel.appendChild(this.uiControls.createSpacer());
        panel.appendChild(actorSection);
        panel.appendChild(this.uiControls.createSpacer());
        panel.appendChild(managementSection);

        return panel;
    }

    /**
     * Create the Stage panel
     */
    createStagePanel() {
        const panel = this.uiControls.uiFactory.createElement('div', {
            className: 'panel stage-panel',
            style: 'display: none;'
        });

        // Platform controls
        const platformSection = this.uiControls.uiFactory.createElement('div', {
            className: 'section platform-section'
        });

        const platformLabel = this.uiControls.createLabel('Platforms:');
        const platformButton = this.uiControls.createToggleButton(
            'Move Platforms',
            false,
            (active) => {
                if (window.movePlatforms) {
                    window.movePlatforms(active);
                }
            }
        );

        platformSection.appendChild(platformLabel);
        platformSection.appendChild(platformButton);

        // Stage effects
        const effectsSection = this.uiControls.uiFactory.createElement('div', {
            className: 'section effects-section'
        });

        const curtainsButton = this.uiControls.createToggleButton(
            'Open Curtains',
            false,
            (active) => {
                if (window.toggleCurtains) {
                    window.toggleCurtains(active);
                }
            }
        );

        const rotateButton = this.uiControls.createToggleButton(
            'Rotate Stage',
            false,
            (active) => {
                if (window.toggleRotation) {
                    window.toggleRotation(active);
                }
            }
        );

        const trapDoorsButton = this.uiControls.createToggleButton(
            'Trap Doors',
            false,
            (active) => {
                if (window.toggleTrapDoors) {
                    window.toggleTrapDoors(active);
                }
            }
        );

        effectsSection.appendChild(curtainsButton);
        effectsSection.appendChild(rotateButton);
        effectsSection.appendChild(trapDoorsButton);

        // Markers
        const markersSection = this.uiControls.uiFactory.createElement('div', {
            className: 'section markers-section'
        });

        const markersButton = this.uiControls.createToggleButton(
            'Show Markers',
            true,
            (active) => {
                if (window.toggleMarkers) {
                    window.toggleMarkers(active);
                }
            }
        );

        markersSection.appendChild(markersButton);

        panel.appendChild(platformSection);
        panel.appendChild(this.uiControls.createSpacer());
        panel.appendChild(effectsSection);
        panel.appendChild(this.uiControls.createSpacer());
        panel.appendChild(markersSection);

        return panel;
    }

    /**
     * Create the Scenery panel
     */
    createSceneryPanel() {
        const panel = this.uiControls.uiFactory.createElement('div', {
            className: 'panel scenery-panel',
            style: 'display: none;'
        });

        // Use lighting module for scenery controls
        const sceneryControls = this.uiLighting.createSceneryPanel({
            onBackdropChange: (position) => {
                if (window.moveBackdrop) {
                    window.moveBackdrop(position);
                }
            },
            onMidstageChange: (position) => {
                if (window.moveMidstage) {
                    window.moveMidstage(position);
                }
            },
            onTextureChange: (texture) => {
                if (window.setDefaultTexture) {
                    window.setDefaultTexture(texture);
                }
            }
        });

        panel.appendChild(sceneryControls);

        return panel;
    }

    /**
     * Create the Controls panel
     */
    createControlsPanel() {
        const panel = this.uiControls.uiFactory.createElement('div', {
            className: 'panel controls-panel',
            style: 'display: none;'
        });

        // Lighting controls from lighting module
        const lightingControls = this.uiLighting.createLightingPanel({
            onLightingChange: (preset) => {
                if (window.applyLightingPreset) {
                    window.applyLightingPreset(preset);
                }
            },
            onCameraChange: (preset) => {
                if (window.setCameraPreset) {
                    window.setCameraPreset(preset);
                }
            }
        });

        // Undo/Redo controls
        const undoRedoControls = this.uiControls.createUndoRedoButtons(
            () => {
                if (window.commandManager) {
                    window.commandManager.undo();
                }
            },
            () => {
                if (window.commandManager) {
                    window.commandManager.redo();
                }
            }
        );

        // Audio controls
        const audioControls = this.uiControls.createAudioControls(
            (volume) => {
                if (window.audioSystem) {
                    window.audioSystem.setMasterVolume(volume);
                }
            },
            (muted) => {
                if (window.audioSystem) {
                    window.audioSystem.setMuted(muted);
                }
            }
        );

        panel.appendChild(lightingControls);
        panel.appendChild(this.uiControls.createSpacer());
        panel.appendChild(undoRedoControls.container);
        panel.appendChild(this.uiControls.createSpacer());
        panel.appendChild(audioControls.container);

        return panel;
    }

    /**
     * Show a specific panel
     */
    showPanel(panelName) {
        // Hide all panels
        this.panels.forEach((panel, name) => {
            panel.style.display = name === panelName ? 'block' : 'none';
        });

        // Update tab buttons
        const tabButtons = this.tabContainer.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === panelName);
        });

        this.activeTab = panelName;
        this.stageState.activeUITab = panelName;

        console.log(`UILayout: Switched to ${panelName} panel`);
    }

    /**
     * Toggle UI visibility
     */
    toggleUI() {
        const isVisible = this.uiContainer.style.display !== 'none';
        this.uiContainer.style.display = isVisible ? 'none' : 'block';
        this.stageState.isUIVisible = !isVisible;

        // Update toggle button text
        const toggleButton = this.uiContainer.querySelector('.ui-toggle');
        if (toggleButton) {
            toggleButton.textContent = isVisible ? 'Show UI' : 'Hide UI';
        }

        console.log(`UILayout: UI ${isVisible ? 'hidden' : 'shown'}`);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Adjust UI layout for different screen sizes
        const width = window.innerWidth;
        
        if (width < 768) {
            this.uiContainer.classList.add('mobile-layout');
        } else {
            this.uiContainer.classList.remove('mobile-layout');
        }
    }

    /**
     * Update UI state from external changes
     */
    updateUIState(stateChanges) {
        Object.assign(this.stageState, stateChanges);
        
        // Update UI elements based on state changes
        if (stateChanges.placementMode !== undefined) {
            this.updatePlacementModeUI(stateChanges.placementMode);
        }
        
        if (stateChanges.currentLightingPreset !== undefined) {
            this.uiLighting.updateLightingState(stateChanges.currentLightingPreset);
        }
    }

    /**
     * Update placement mode UI feedback
     */
    updatePlacementModeUI(mode) {
        // Update button states based on placement mode
        const propButton = this.panels.get('objects')?.querySelector('.toggle-button');
        const actorButton = this.panels.get('objects')?.querySelectorAll('.toggle-button')[1];

        if (propButton) {
            propButton.setActive?.(mode === 'prop');
        }
        if (actorButton) {
            actorButton.setActive?.(mode === 'actor');
        }
    }

    /**
     * Get current UI state
     */
    getUIState() {
        return {
            activeTab: this.activeTab,
            isVisible: this.stageState.isUIVisible,
            placementMode: this.stageState.placementMode
        };
    }

    /**
     * Cleanup UI resources
     */
    destroy() {
        if (this.uiContainer && this.uiContainer.parentNode) {
            this.uiContainer.parentNode.removeChild(this.uiContainer);
        }
        this.panels.clear();
        console.log('UILayout: Cleaned up');
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UILayout;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.UILayout = UILayout;
}