/**
 * UIManager.js - User Interface Management System for Theater Stage
 * 
 * Manages all user interface operations in the 3D Theater Stage:
 * - Main UI panel creation and management (Objects, Stage, Scenery, Controls)
 * - Specialized control creation (selectors, sliders, buttons)
 * - Event handling and user interaction management
 * - UI state synchronization with stage state
 * - Notification system for user feedback
 * - Placement mode management for interactive object creation
 * - Integration with all core modules for comprehensive control
 * - Responsive layout and dynamic content updates
 */

class StageUIManager {
    constructor() {
        this.isInitialized = false;
        this.uiContainer = null;
        this.tabContainer = null;
        this.panels = new Map();
        this.activeTab = 'objects';
        
        // UI state management
        this.uiState = {
            placementMode: null, // 'prop', 'actor', 'push', null
            selectedPropType: 'cube',
            selectedActorType: 'human_male',
            selectedSceneryPanel: 0,
            currentLightingPreset: 'normal',
            isUIVisible: true,
            isDragging: false
        };
        
        // Tab configuration
        this.tabConfig = {
            objects: { label: 'Objects', icon: '🎭' },
            stage: { label: 'Stage', icon: '🎪' },
            scenery: { label: 'Scenery', icon: '🖼️' },
            controls: { label: 'Controls', icon: '⚙️' }
        };
        
        console.log('UIManager: Initialized');
    }

    /**
     * Initialize the UI manager
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('UIManager already initialized');
            return;
        }

        console.log('UIManager: Initializing user interface system...');

        try {
            // Wait for dependencies
            await this.waitForDependencies();
            
            // Set up local references
            this.stageState = window.stageState;
            this.uiFactory = window.UIFactory;
            
            // Create main UI structure
            this.createMainUI();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('UIManager: Initialization complete');
            
        } catch (error) {
            console.error('UIManager: Initialization failed:', error);
            throw error;
        }
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
                
                if (!window.threeObjectFactory) {
                    console.log('UIManager waiting for: window.threeObjectFactory');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                if (!window.threeObjectFactory.isInitialized) {
                    console.log('UIManager waiting for: ObjectFactory to be initialized');
                    setTimeout(checkDependencies, 50);
                    return;
                }
                
                console.log('UIManager: All dependencies satisfied!');
                resolve();
            };
            
            checkDependencies();
            
            setTimeout(() => {
                reject(new Error('UIManager dependencies not available after 10 seconds'));
            }, 10000);
        });
    }

    /**
     * Create the main UI structure
     */
    createMainUI() {
        // Create toggle button for menu
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Menu';
        toggleButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 1001;
            padding: 10px 15px;
            background: rgba(0,0,0,0.8);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        
        toggleButton.addEventListener('click', () => this.toggleUI());
        document.body.appendChild(toggleButton);
        
        // Create main UI container
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 60px;
            width: 300px;
            max-height: 90vh;
            background: rgba(40, 44, 52, 0.95);
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            overflow: hidden;
            transition: transform 0.3s ease;
        `;
        
        // Create tab container
        this.createTabContainer();
        
        // Create panels
        this.createPanels();
        
        // Assemble UI
        this.uiContainer.appendChild(this.tabContainer);
        this.panels.forEach(panel => {
            this.uiContainer.appendChild(panel.element);
        });
        
        document.body.appendChild(this.uiContainer);
        
        // Show initial panel
        this.showPanel('objects');
    }

    /**
     * Create tab navigation container
     */
    createTabContainer() {
        this.tabContainer = document.createElement('div');
        this.tabContainer.style.cssText = `
            display: flex;
            background: rgba(50, 54, 62, 0.9);
            border-bottom: 1px solid rgba(255,255,255,0.1);
        `;
        
        Object.entries(this.tabConfig).forEach(([tabId, config]) => {
            const tab = document.createElement('button');
            tab.innerHTML = `${config.icon} ${config.label}`;
            tab.style.cssText = `
                flex: 1;
                padding: 12px 8px;
                background: none;
                border: none;
                color: rgba(255,255,255,0.7);
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s ease;
            `;
            
            tab.addEventListener('click', () => this.showPanel(tabId));
            tab.addEventListener('mouseenter', () => {
                if (this.activeTab !== tabId) {
                    tab.style.background = 'rgba(255,255,255,0.1)';
                }
            });
            tab.addEventListener('mouseleave', () => {
                if (this.activeTab !== tabId) {
                    tab.style.background = 'none';
                }
            });
            
            this.tabContainer.appendChild(tab);
        });
    }

    /**
     * Create all UI panels
     */
    createPanels() {
        this.panels.set('objects', {
            element: this.createObjectsPanel(),
            tab: this.tabContainer.children[0]
        });
        
        this.panels.set('stage', {
            element: this.createStagePanel(),
            tab: this.tabContainer.children[1]
        });
        
        this.panels.set('scenery', {
            element: this.createSceneryPanel(),
            tab: this.tabContainer.children[2]
        });
        
        this.panels.set('controls', {
            element: this.createControlsPanel(),
            tab: this.tabContainer.children[3]
        });
    }

    /**
     * Create Objects panel (Props and Actors)
     */
    createObjectsPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 15px;
            color: white;
            display: none;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        // Props section
        const propsLabel = this.uiFactory.createLabel('Props');
        const propSelector = this.createPropSelector();
        const placePropButton = this.uiFactory.createButton('Place Prop', () => {
            this.setPlacementMode('prop');
            this.showNotification('Click on stage to place prop', 'info');
        });
        
        // Actors section
        const actorsLabel = this.uiFactory.createLabel('Actors');
        const actorSelector = this.createActorSelector();
        const placeActorButton = this.uiFactory.createButton('Place Actor', () => {
            this.setPlacementMode('actor');
            this.showNotification('Click on stage to place actor', 'info');
        });
        
        // Cancel button
        const cancelButton = this.uiFactory.createButton('Cancel Placement', () => {
            this.setPlacementMode(null);
            this.showNotification('Placement mode cancelled', 'info');
        }, { style: 'secondary' });
        
        // Assemble panel
        panel.appendChild(propsLabel);
        panel.appendChild(propSelector);
        panel.appendChild(placePropButton);
        panel.appendChild(this.createSpacer());
        panel.appendChild(actorsLabel);
        panel.appendChild(actorSelector);
        panel.appendChild(placeActorButton);
        panel.appendChild(this.createSpacer());
        panel.appendChild(cancelButton);
        
        return panel;
    }

    /**
     * Create Stage panel (Lighting, Camera, Effects)
     */
    createStagePanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 15px;
            color: white;
            display: none;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        // Lighting section
        const lightingLabel = this.createLabel('Lighting');
        const lightingSelect = this.createLightingSelector();
        
        // Camera section
        const cameraLabel = this.createLabel('Camera View');
        const cameraSelect = this.createCameraSelector();
        
        // Stage elements section
        const elementsLabel = this.createLabel('Stage Elements');
        const markerToggle = this.createButton('Toggle Markers', () => window.toggleMarkers?.());
        const curtainButton = this.createButton('Toggle Curtains', () => window.toggleCurtains?.());
        const platformButton = this.createButton('Move Platforms', () => window.movePlatforms?.());
        
        // Special effects
        const effectsLabel = this.createLabel('Special Effects');
        const showRotatingButton = this.createButton('Show/Hide Rotating Stage', () => window.toggleRotatingStageVisibility?.());
        const rotateButton = this.createButton('Start/Stop Rotation', () => window.rotateCenter?.());
        const showTrapDoorsButton = this.createButton('Show/Hide Trap Doors', () => window.toggleTrapDoorsVisibility?.());
        const trapButton = this.createButton('Toggle Trap Doors', () => window.toggleTrapDoors?.());
        
        // Assemble panel
        panel.appendChild(lightingLabel);
        panel.appendChild(lightingSelect);
        panel.appendChild(this.createSpacer());
        panel.appendChild(cameraLabel);
        panel.appendChild(cameraSelect);
        panel.appendChild(this.createSpacer());
        panel.appendChild(elementsLabel);
        panel.appendChild(markerToggle);
        panel.appendChild(curtainButton);
        panel.appendChild(platformButton);
        panel.appendChild(this.createSpacer());
        panel.appendChild(effectsLabel);
        panel.appendChild(showRotatingButton);
        panel.appendChild(rotateButton);
        panel.appendChild(showTrapDoorsButton);
        panel.appendChild(trapButton);
        
        return panel;
    }

    /**
     * Create Scenery panel (Textures and Positioning)
     */
    createSceneryPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 15px;
            color: white;
            display: none;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        // Scenery position
        const positionLabel = this.createLabel('Scenery Position');
        const backdropSelect = this.createBackdropSelector();
        const midstageSelect = this.createMidstageSelector();
        
        // Texture controls
        const textureLabel = this.createLabel('Textures');
        const panelSelect = this.createPanelSelector();
        const defaultTextureSelect = this.createDefaultTextureSelector();
        const uploadButton = this.createButton('Upload Image', () => window.handleTextureUpload?.());
        
        // Texture scale
        const scaleLabel = this.createLabel('Texture Scale');
        const scaleSlider = this.createScaleSlider();
        
        // Assemble panel
        panel.appendChild(positionLabel);
        panel.appendChild(backdropSelect);
        panel.appendChild(midstageSelect);
        panel.appendChild(this.createSpacer());
        panel.appendChild(textureLabel);
        panel.appendChild(panelSelect);
        panel.appendChild(defaultTextureSelect);
        panel.appendChild(uploadButton);
        panel.appendChild(this.createSpacer());
        panel.appendChild(scaleLabel);
        panel.appendChild(scaleSlider);
        
        return panel;
    }

    /**
     * Create Controls panel (Save/Load, Physics, Audio)
     */
    createControlsPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            padding: 15px;
            color: white;
            display: none;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        // Save/Load section
        const saveLoadLabel = this.createLabel('Save/Load Scene');
        const saveButton = this.createButton('Save Scene', () => window.saveScene?.());
        const loadButton = this.createButton('Load Scene', () => window.loadScene?.());
        const exportButton = this.createButton('Export to File', () => window.sceneManager?.exportToFile());
        
        // Undo/Redo section
        const undoRedoLabel = this.createLabel('Undo/Redo');
        const { undoButton, redoButton } = this.createUndoRedoButtons();
        
        // Physics section
        const physicsLabel = this.createLabel('Physics Test');
        const pushButton = this.createButton('Push Mode', () => {
            this.setPlacementMode('push');
            this.showNotification('Click on objects to push them', 'info');
        });
        
        // Audio section
        const audioLabel = this.createLabel('Audio System');
        const { audioInitButton, volumeControls } = this.createAudioControls();
        
        // Assemble panel
        panel.appendChild(saveLoadLabel);
        const saveLoadDiv = document.createElement('div');
        saveLoadDiv.style.cssText = 'display: flex; gap: 5px; margin: 5px 0;';
        saveLoadDiv.appendChild(saveButton);
        saveLoadDiv.appendChild(loadButton);
        panel.appendChild(saveLoadDiv);
        panel.appendChild(exportButton);
        
        panel.appendChild(this.createSpacer());
        panel.appendChild(undoRedoLabel);
        const undoRedoDiv = document.createElement('div');
        undoRedoDiv.style.cssText = 'display: flex; gap: 5px; margin: 5px 0;';
        undoRedoDiv.appendChild(undoButton);
        undoRedoDiv.appendChild(redoButton);
        panel.appendChild(undoRedoDiv);
        
        panel.appendChild(this.createSpacer());
        panel.appendChild(physicsLabel);
        panel.appendChild(pushButton);
        
        panel.appendChild(this.createSpacer());
        panel.appendChild(audioLabel);
        panel.appendChild(audioInitButton);
        panel.appendChild(volumeControls);
        
        return panel;
    }

    /**
     * Create prop selector dropdown
     */
    createPropSelector() {
        // Group props by category using ObjectFactory
        const categories = {};
        const propCatalog = window.threeObjectFactory.getPropCatalog();
        Object.entries(propCatalog).forEach(([key, prop]) => {
            if (!categories[prop.category]) {
                categories[prop.category] = [];
            }
            categories[prop.category].push({ value: key, label: prop.name });
        });
        
        return this.uiFactory.createSelect(
            categories,
            (event) => {
                const value = event.target.value;
                this.uiState.selectedPropType = value;
                if (this.stageState.ui) {
                    this.stageState.ui.selectedPropType = value;
                }
            },
            { grouped: true, defaultValue: this.uiState.selectedPropType }
        );
    }

    /**
     * Create actor selector dropdown
     */
    createActorSelector() {
        const actorTypes = window.threeObjectFactory.getActorTypes();
        const actors = Object.entries(actorTypes).map(([key, actor]) => ({
            value: key,
            label: actor.name
        }));
        
        return this.uiFactory.createSelect(
            actors,
            (event) => {
                const value = event.target.value;
                this.uiState.selectedActorType = value;
                if (this.stageState.ui) {
                    this.stageState.ui.selectedActorType = value;
                }
            },
            { defaultValue: this.uiState.selectedActorType }
        );
    }

    /**
     * Create lighting selector
     */
    createLightingSelector() {
        const presets = [
            { value: 'normal', label: 'Normal (Bright)' },
            { value: 'dramatic', label: 'Dramatic (Dim Sides)' },
            { value: 'evening', label: 'Evening (Warm)' },
            { value: 'concert', label: 'Concert (Cool)' },
            { value: 'spotlight', label: 'Spotlight Focus' }
        ];
        
        return this.uiFactory.createSelect(
            presets,
            (event) => {
                const value = event.target.value;
                const oldPreset = this.uiState.currentLightingPreset;
                
                if (oldPreset === value) return;
                
                // Use command pattern for undo/redo support
                if (window.stageCommandManager && window.LightingChangeCommand) {
                    const command = new window.LightingChangeCommand(oldPreset, value);
                    
                    try {
                        window.stageCommandManager.executeCommand(command);
                        this.uiState.currentLightingPreset = value;
                        if (this.stageState.ui) {
                            this.stageState.ui.currentLightingPreset = value;
                        }
                        this.showNotification(`Lighting changed to ${value}`, 'success');
                    } catch (error) {
                        console.error('Failed to change lighting:', error);
                        this.showNotification('Failed to change lighting', 'error');
                        // Revert selection
                        event.target.value = oldPreset;
                    }
                } else {
                    // Fallback to direct change
                    this.uiState.currentLightingPreset = value;
                    if (this.stageState.stage) {
                        this.stageState.stage.currentLightingPreset = value;
                    }
                    if (window.threeStageBuilder) {
                        window.threeStageBuilder.applyLightingPreset(value);
                    }
                    this.showNotification(`Lighting changed (no undo support)`, 'info');
                }
            },
            { defaultValue: this.uiState.currentLightingPreset }
        );
    }

    /**
     * Create camera selector
     */
    createCameraSelector() {
        const select = document.createElement('select');
        select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
        
        const presets = [
            { value: 'audience', label: 'Audience View' },
            { value: 'stage', label: 'On Stage' },
            { value: 'above', label: 'Above Stage' },
            { value: 'side', label: 'Side View' },
            { value: 'close', label: 'Close Up' }
        ];
        
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.value;
            option.textContent = preset.label;
            select.appendChild(option);
        });
        
        select.addEventListener('change', () => {
            window.setCameraView?.(select.value);
        });
        
        return select;
    }

    /**
     * Create backdrop position selector
     */
    createBackdropSelector() {
        const label = document.createElement('div');
        label.innerHTML = '<strong>Backdrop Position:</strong>';
        label.style.cssText = 'margin-bottom: 5px;';
        
        const container = document.createElement('div');
        container.style.cssText = 'display: flex; gap: 5px; margin-bottom: 10px;';
        
        const positions = [0, 0.25, 0.5, 0.75, 1];
        positions.forEach(pos => {
            const btn = this.createButton(pos === 0 ? 'Hide' : `${pos * 100}%`, () => {
                this.moveSceneryWithUndo(0, pos);
            }, { small: true });
            container.appendChild(btn);
        });
        
        const wrapper = document.createElement('div');
        wrapper.appendChild(label);
        wrapper.appendChild(container);
        return wrapper;
    }

    /**
     * Create midstage position selector
     */
    createMidstageSelector() {
        const label = document.createElement('div');
        label.innerHTML = '<strong>Midstage Position:</strong>';
        label.style.cssText = 'margin-bottom: 5px;';
        
        const container = document.createElement('div');
        container.style.cssText = 'display: flex; gap: 5px; margin-bottom: 10px;';
        
        const positions = [0, 0.25, 0.5, 0.75, 1];
        positions.forEach(pos => {
            const btn = this.createButton(pos === 0 ? 'Hide' : `${pos * 100}%`, () => {
                this.moveSceneryWithUndo(1, pos);
            }, { small: true });
            container.appendChild(btn);
        });
        
        const wrapper = document.createElement('div');
        wrapper.appendChild(label);
        wrapper.appendChild(container);
        return wrapper;
    }

    /**
     * Create panel selector for textures
     */
    createPanelSelector() {
        const select = document.createElement('select');
        select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
        
        const option1 = document.createElement('option');
        option1.value = '0';
        option1.textContent = 'Backdrop';
        select.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = '1';
        option2.textContent = 'Midstage';
        select.appendChild(option2);
        
        select.addEventListener('change', () => {
            this.uiState.selectedSceneryPanel = parseInt(select.value);
            window.selectedSceneryPanel = this.uiState.selectedSceneryPanel;
        });
        
        return select;
    }

    /**
     * Create default texture selector
     */
    createDefaultTextureSelector() {
        const select = document.createElement('select');
        select.style.cssText = 'width: 100%; margin: 5px 0; padding: 5px;';
        
        const textures = [
            { value: 'none', label: 'None (Color Only)' },
            { value: 'brick', label: 'Brick Wall' },
            { value: 'wood', label: 'Wood Planks' },
            { value: 'sky', label: 'Sky Gradient' },
            { value: 'forest', label: 'Forest Scene' },
            { value: 'castle', label: 'Castle Wall' },
            { value: 'city', label: 'City Skyline' },
            { value: 'fabric', label: 'Theater Curtain' },
            { value: 'marble', label: 'Marble Surface' }
        ];
        
        textures.forEach(texture => {
            const option = document.createElement('option');
            option.value = texture.value;
            option.textContent = texture.label;
            select.appendChild(option);
        });
        
        select.addEventListener('change', () => {
            window.applyDefaultTexture?.(select.value);
        });
        
        return select;
    }

    /**
     * Create texture scale slider
     */
    createScaleSlider() {
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0.1';
        slider.max = '3';
        slider.step = '0.1';
        slider.value = '1';
        slider.style.cssText = 'width: 100%; margin: 5px 0;';
        
        slider.addEventListener('input', () => {
            if (this.uiState.selectedSceneryPanel !== null) {
                window.adjustTextureScale?.(this.uiState.selectedSceneryPanel, parseFloat(slider.value));
            }
        });
        
        return slider;
    }

    /**
     * Create undo/redo buttons
     */
    createUndoRedoButtons() {
        const undoButton = this.uiFactory.createButton('Undo', () => {
            if (window.stageCommandManager) {
                const success = window.stageCommandManager.undo();
                if (success) {
                    this.showNotification('Action undone', 'success');
                } else {
                    this.showNotification('Nothing to undo', 'info');
                }
            }
        }, { small: true });
        
        const redoButton = this.uiFactory.createButton('Redo', () => {
            if (window.stageCommandManager) {
                const success = window.stageCommandManager.redo();
                if (success) {
                    this.showNotification('Action redone', 'success');
                } else {
                    this.showNotification('Nothing to redo', 'info');
                }
            }
        }, { small: true });
        
        // Store references for updating button states
        this.undoButton = undoButton;
        this.redoButton = redoButton;
        
        // Update initial state
        this.updateUndoRedoButtons();
        
        return { undoButton, redoButton };
    }

    /**
     * Create audio controls
     */
    createAudioControls() {
        const audioInitButton = this.uiFactory.createButton('Initialize Audio', () => {
            window.initializeAudio?.();
        });
        
        const volumeControls = document.createElement('div');
        volumeControls.innerHTML = `
            <div style="margin: 5px 0;">
                <label>Master Volume:</label>
                <input type="range" min="0" max="1" step="0.1" value="1" style="width: 100%;" 
                       onchange="window.audioManager?.setMasterVolume(this.value)">
            </div>
            <div style="margin: 5px 0;">
                <label>Effects Volume:</label>
                <input type="range" min="0" max="1" step="0.1" value="0.8" style="width: 100%;" 
                       onchange="window.audioManager?.setCategoryVolume('effects', this.value)">
            </div>
        `;
        
        return { audioInitButton, volumeControls };
    }

    /**
     * Legacy helper functions for compatibility
     */
    createLabel(text) {
        return this.uiFactory.createLabel(text);
    }

    createButton(text, onClick, options = {}) {
        return this.uiFactory.createButton(text, onClick, options);
    }

    createSpacer() {
        return this.uiFactory.createSpacer();
    }

    /**
     * Show specific panel
     */
    showPanel(panelId) {
        // Hide all panels
        this.panels.forEach((panel, id) => {
            panel.element.style.display = 'none';
            panel.tab.style.background = 'none';
            panel.tab.style.color = 'rgba(255,255,255,0.7)';
        });
        
        // Show selected panel
        if (this.panels.has(panelId)) {
            const panel = this.panels.get(panelId);
            panel.element.style.display = 'block';
            panel.tab.style.background = 'rgba(255,255,255,0.2)';
            panel.tab.style.color = 'white';
            this.activeTab = panelId;
        }
    }

    /**
     * Toggle UI visibility
     */
    toggleUI() {
        this.uiState.isUIVisible = !this.uiState.isUIVisible;
        this.uiContainer.style.transform = this.uiState.isUIVisible ? 'translateX(0)' : 'translateX(100%)';
    }

    /**
     * Set placement mode
     */
    setPlacementMode(mode) {
        this.uiState.placementMode = mode;
        if (this.stageState.ui) {
            this.stageState.ui.placementMode = mode;
        }
        window.placementMode = mode; // Legacy compatibility
        
        // Update cursor based on mode
        document.body.style.cursor = mode ? 'crosshair' : 'default';
    }

    /**
     * Move scenery with undo support
     */
    moveSceneryWithUndo(panelIndex, newPosition) {
        if (!window.stageState?.stage?.sceneryPanels?.[panelIndex]) {
            console.error('Invalid scenery panel index:', panelIndex);
            return;
        }
        
        const panel = window.stageState.stage.sceneryPanels[panelIndex];
        const oldPosition = panel.userData.currentPosition;
        
        if (oldPosition === newPosition) {
            console.log('Panel already at target position');
            return;
        }
        
        // Use command pattern for undo/redo support
        if (window.stageCommandManager && window.SceneryPositionCommand) {
            const command = new window.SceneryPositionCommand(panelIndex, oldPosition, newPosition);
            
            try {
                window.stageCommandManager.executeCommand(command);
                this.showNotification(`${panelIndex === 0 ? 'Backdrop' : 'Midstage'} moved to ${newPosition * 100}%`, 'success');
            } catch (error) {
                console.error('Failed to move scenery:', error);
                this.showNotification('Failed to move scenery', 'error');
            }
        } else {
            // Fallback to direct movement
            window.moveSceneryToPosition?.(panelIndex, newPosition);
            this.showNotification(`${panelIndex === 0 ? 'Backdrop' : 'Midstage'} moved (no undo support)`, 'info');
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        const notification = this.uiFactory.createNotification(message, type);
        notification.style.top = '70px'; // Adjust for our UI
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * Update undo/redo button states
     */
    updateUndoRedoButtons() {
        if (!this.undoButton || !this.redoButton || !window.stageCommandManager) return;
        
        const canUndo = window.stageCommandManager.canUndo();
        const canRedo = window.stageCommandManager.canRedo();
        
        // Update button states
        this.undoButton.disabled = !canUndo;
        this.redoButton.disabled = !canRedo;
        
        // Update button styling based on state
        this.undoButton.style.opacity = canUndo ? '1' : '0.5';
        this.redoButton.style.opacity = canRedo ? '1' : '0.5';
        
        // Update button titles with current state info
        const historyInfo = window.stageCommandManager.getHistoryInfo();
        this.undoButton.title = canUndo ? 
            `Undo (${historyInfo.currentIndex + 1} actions available)` : 
            'Nothing to undo';
        this.redoButton.title = canRedo ? 
            `Redo (${historyInfo.totalCommands - historyInfo.currentIndex - 1} actions available)` : 
            'Nothing to redo';
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Handle escape key to cancel placement
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.uiState.placementMode) {
                this.setPlacementMode(null);
                this.showNotification('Placement cancelled', 'info');
            }
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Adjust UI positioning if needed
        const maxHeight = window.innerHeight * 0.9;
        this.uiContainer.style.maxHeight = `${maxHeight}px`;
    }

    /**
     * Update UI state from external changes
     */
    updateUIState(newState) {
        Object.assign(this.uiState, newState);
        
        // Sync with global state
        if (this.stageState.ui) {
            Object.assign(this.stageState.ui, this.uiState);
        }
    }

    /**
     * Get current UI state
     */
    getUIState() {
        return { ...this.uiState };
    }

    /**
     * Get UI performance statistics
     */
    getUIStats() {
        return {
            isInitialized: this.isInitialized,
            activeTab: this.activeTab,
            isVisible: this.uiState.isUIVisible,
            placementMode: this.uiState.placementMode,
            panelCount: this.panels.size,
            tabCount: Object.keys(this.tabConfig).length
        };
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            activeTab: this.activeTab,
            panelsCreated: this.panels.size,
            uiVisible: this.uiState.isUIVisible,
            placementMode: this.uiState.placementMode
        };
    }

    /**
     * Clean up UI resources
     */
    dispose() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        // Remove UI elements
        if (this.uiContainer && this.uiContainer.parentNode) {
            this.uiContainer.parentNode.removeChild(this.uiContainer);
        }
        
        // Clear references
        this.panels.clear();
        this.uiContainer = null;
        this.tabContainer = null;
        this.isInitialized = false;
        
        console.log('UIManager: Disposed');
    }
}

// Create global instance
const stageUIManager = new StageUIManager();

// For browser compatibility
if (typeof window !== 'undefined') {
    window.stageUIManager = stageUIManager;
    console.log('UIManager loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { stageUIManager, StageUIManager };
}