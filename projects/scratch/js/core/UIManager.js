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
        
        // Actor Management section
        const actorManagementLabel = this.uiFactory.createLabel('Actor Management');
        const actorControls = this.createActorManagementControls();
        
        // Actor Selection section
        const selectionLabel = this.uiFactory.createLabel('Actor Selection');
        const actorSelectionControls = this.createActorSelectionControls();
        
        // Actor Movement section
        const movementLabel = this.uiFactory.createLabel('Actor Movement');
        const movementControls = this.createActorMovementControls();
        
        // Actor Behavior section
        const behaviorLabel = this.uiFactory.createLabel('Actor Behavior');
        const behaviorControls = this.createActorBehaviorControls();
        
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
        panel.appendChild(actorManagementLabel);
        panel.appendChild(actorControls);
        panel.appendChild(this.createSpacer());
        panel.appendChild(selectionLabel);
        panel.appendChild(actorSelectionControls);
        panel.appendChild(this.createSpacer());
        panel.appendChild(movementLabel);
        panel.appendChild(movementControls);
        panel.appendChild(this.createSpacer());
        panel.appendChild(behaviorLabel);
        panel.appendChild(behaviorControls);
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
            { value: 'close', label: 'Close Up' },
            { value: 'backstage', label: 'Backstage View' },
            { value: 'wide', label: 'Wide View (All Areas)' }
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
     * Create actor management controls
     */
    createActorManagementControls() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        // Actor count display
        const actorCountContainer = document.createElement('div');
        actorCountContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            font-size: 12px;
        `;
        
        const actorCountLabel = document.createElement('span');
        actorCountLabel.textContent = 'Total Actors:';
        
        const actorCountValue = document.createElement('span');
        actorCountValue.id = 'actorCountValue';
        actorCountValue.textContent = '0';
        actorCountValue.style.fontWeight = 'bold';
        
        actorCountContainer.appendChild(actorCountLabel);
        actorCountContainer.appendChild(actorCountValue);
        
        // Clear all actors button
        const clearAllButton = this.uiFactory.createButton('Clear All Actors', () => {
            this.clearAllActors();
        }, { style: 'danger' });
        
        // Show debug info toggle
        const debugToggle = this.createToggleButton('Debug Mode', false, (enabled) => {
            this.uiState.actorDebugMode = enabled;
            this.toggleActorDebugMode(enabled);
        });
        
        // Performance stats
        const statsButton = this.uiFactory.createButton('Show Performance Stats', () => {
            this.showActorPerformanceStats();
        });
        
        container.appendChild(actorCountContainer);
        container.appendChild(clearAllButton);
        container.appendChild(debugToggle);
        container.appendChild(statsButton);
        
        return container;
    }

    /**
     * Create actor selection controls
     */
    createActorSelectionControls() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        // Selection mode toggle
        const selectionModeToggle = this.createToggleButton('Selection Mode', false, (enabled) => {
            this.uiState.actorSelectionMode = enabled;
            this.toggleActorSelectionMode(enabled);
        });
        
        // Multi-select toggle
        const multiSelectToggle = this.createToggleButton('Multi-Select', false, (enabled) => {
            console.log(`🔄 Multi-Select toggle changed: ${enabled}`);
            this.uiState.multiSelectMode = enabled;
            if (!enabled) {
                console.log(`🚫 Multi-select disabled, clearing selection`);
                this.clearActorSelection();
            }
        });
        
        // Selected actor display
        const selectedActorContainer = document.createElement('div');
        selectedActorContainer.style.cssText = `
            padding: 8px;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
            font-size: 12px;
            min-height: 40px;
        `;
        
        const selectedActorLabel = document.createElement('div');
        selectedActorLabel.textContent = 'Selected Actor:';
        selectedActorLabel.style.marginBottom = '4px';
        
        const selectedActorValue = document.createElement('div');
        selectedActorValue.id = 'selectedActorValue';
        selectedActorValue.textContent = 'None';
        selectedActorValue.style.fontStyle = 'italic';
        
        selectedActorContainer.appendChild(selectedActorLabel);
        selectedActorContainer.appendChild(selectedActorValue);
        
        // Select all/none buttons
        const selectionButtonsContainer = document.createElement('div');
        selectionButtonsContainer.style.cssText = `
            display: flex;
            gap: 4px;
        `;
        
        const selectAllButton = this.uiFactory.createButton('Select All', () => {
            this.selectAllActors();
        }, { style: 'secondary', size: 'small' });
        
        const selectNoneButton = this.uiFactory.createButton('Clear Selection', () => {
            this.clearActorSelection();
        }, { style: 'secondary', size: 'small' });
        
        selectionButtonsContainer.appendChild(selectAllButton);
        selectionButtonsContainer.appendChild(selectNoneButton);
        
        container.appendChild(selectionModeToggle);
        container.appendChild(multiSelectToggle);
        container.appendChild(selectedActorContainer);
        container.appendChild(selectionButtonsContainer);
        
        return container;
    }

    /**
     * Create actor movement controls
     */
    createActorMovementControls() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        // Movement buttons
        const movementButtonsContainer = document.createElement('div');
        movementButtonsContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
        `;
        
        const moveToMarkerButton = this.uiFactory.createButton('Move to Marker', () => {
            this.moveSelectedActorsToRandomMarker();
        }, { size: 'small' });
        
        const moveToOriginButton = this.uiFactory.createButton('Move to Origin', () => {
            this.moveSelectedActorsTo(0, 0);
        }, { size: 'small' });
        
        const scatterButton = this.uiFactory.createButton('Scatter Actors', () => {
            this.scatterSelectedActors();
        }, { size: 'small' });
        
        const stopAllButton = this.uiFactory.createButton('Stop All', () => {
            this.stopAllActors();
        }, { size: 'small' });
        
        movementButtonsContainer.appendChild(moveToMarkerButton);
        movementButtonsContainer.appendChild(moveToOriginButton);
        movementButtonsContainer.appendChild(scatterButton);
        movementButtonsContainer.appendChild(stopAllButton);
        
        // Pathfinding visualization
        const pathVisualizationToggle = this.createToggleButton('Show Paths', false, (enabled) => {
            this.uiState.showActorPaths = enabled;
            this.togglePathVisualization(enabled);
        });
        
        // Collision grid visualization
        const gridVisualizationToggle = this.createToggleButton('Show Collision Grid', false, (enabled) => {
            this.uiState.showCollisionGrid = enabled;
            this.toggleCollisionGridVisualization(enabled);
        });
        
        container.appendChild(movementButtonsContainer);
        container.appendChild(pathVisualizationToggle);
        container.appendChild(gridVisualizationToggle);
        
        return container;
    }

    /**
     * Create actor behavior controls
     */
    createActorBehaviorControls() {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        // Behavior buttons
        const behaviorButtonsContainer = document.createElement('div');
        behaviorButtonsContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
        `;
        
        const performanceButton = this.uiFactory.createButton('Start Performance', () => {
            this.makeSelectedActorsPerform();
        }, { size: 'small' });
        
        const interactionButton = this.uiFactory.createButton('Interact', () => {
            this.makeSelectedActorsInteract();
        }, { size: 'small' });
        
        const waitButton = this.uiFactory.createButton('Wait for Cue', () => {
            this.makeSelectedActorsWait();
        }, { size: 'small' });
        
        const idleButton = this.uiFactory.createButton('Return to Idle', () => {
            this.makeSelectedActorsIdle();
        }, { size: 'small' });
        
        behaviorButtonsContainer.appendChild(performanceButton);
        behaviorButtonsContainer.appendChild(interactionButton);
        behaviorButtonsContainer.appendChild(waitButton);
        behaviorButtonsContainer.appendChild(idleButton);
        
        // Personality controls
        const personalityLabel = this.uiFactory.createLabel('Personality Adjustment');
        personalityLabel.style.fontSize = '12px';
        personalityLabel.style.marginTop = '8px';
        
        const personalityContainer = document.createElement('div');
        personalityContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 11px;
        `;
        
        // Energy slider
        const energySlider = this.createSlider('Energy', 0.5, 0, 1, 0.1, (value) => {
            this.adjustSelectedActorsPersonality('energy', value);
        });
        
        // Confidence slider
        const confidenceSlider = this.createSlider('Confidence', 0.5, 0, 1, 0.1, (value) => {
            this.adjustSelectedActorsPersonality('confidence', value);
        });
        
        // Sociability slider
        const sociabilitySlider = this.createSlider('Sociability', 0.5, 0, 1, 0.1, (value) => {
            this.adjustSelectedActorsPersonality('sociability', value);
        });
        
        personalityContainer.appendChild(energySlider);
        personalityContainer.appendChild(confidenceSlider);
        personalityContainer.appendChild(sociabilitySlider);
        
        // Additional action buttons
        const additionalActionsLabel = this.uiFactory.createLabel('Additional Actions');
        additionalActionsLabel.style.fontSize = '12px';
        additionalActionsLabel.style.marginTop = '8px';
        
        const additionalActionsContainer = document.createElement('div');
        additionalActionsContainer.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            margin-top: 4px;
        `;
        
        // Show Move Logs button
        const showMoveLogsButton = this.uiFactory.createButton('Show Move Logs', () => {
            this.showActorMoveLogs();
        }, { size: 'small' });
        
        // Backstage movement buttons
        const backstageLeftButton = this.uiFactory.createButton('Backstage Left', () => {
            this.moveSelectedActorsToBackstage('left');
        }, { size: 'small' });
        
        const backstageRightButton = this.uiFactory.createButton('Backstage Right', () => {
            this.moveSelectedActorsToBackstage('right');
        }, { size: 'small' });
        
        // Start Performance Queue button
        const performanceQueueButton = this.uiFactory.createButton('Start Performance Queue', () => {
            this.triggerPerformanceQueue();
        }, { size: 'small' });
        
        additionalActionsContainer.appendChild(showMoveLogsButton);
        additionalActionsContainer.appendChild(performanceQueueButton);
        additionalActionsContainer.appendChild(backstageLeftButton);
        additionalActionsContainer.appendChild(backstageRightButton);
        
        container.appendChild(behaviorButtonsContainer);
        container.appendChild(personalityLabel);
        container.appendChild(personalityContainer);
        container.appendChild(additionalActionsLabel);
        container.appendChild(additionalActionsContainer);
        
        return container;
    }

    /**
     * Create a toggle button
     */
    createToggleButton(label, initialState, onToggle) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px;
            background: rgba(255,255,255,0.05);
            border-radius: 4px;
        `;
        
        const labelElement = document.createElement('span');
        labelElement.textContent = label;
        labelElement.style.fontSize = '12px';
        
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = initialState;
        toggle.style.cssText = `
            transform: scale(1.2);
            cursor: pointer;
        `;
        
        toggle.addEventListener('change', (e) => {
            onToggle(e.target.checked);
        });
        
        container.appendChild(labelElement);
        container.appendChild(toggle);
        
        return container;
    }

    /**
     * Create a slider control
     */
    createSlider(label, initialValue, min, max, step, onChange) {
        const container = document.createElement('div');
        container.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 4px;
        `;
        
        const labelElement = document.createElement('span');
        labelElement.textContent = label;
        labelElement.style.fontSize = '11px';
        labelElement.style.minWidth = '70px';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = initialValue;
        slider.style.cssText = `
            flex: 1;
            margin: 0 8px;
        `;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = initialValue.toFixed(1);
        valueDisplay.style.fontSize = '11px';
        valueDisplay.style.minWidth = '30px';
        valueDisplay.style.textAlign = 'right';
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            valueDisplay.textContent = value.toFixed(1);
            onChange(value);
        });
        
        container.appendChild(labelElement);
        container.appendChild(slider);
        container.appendChild(valueDisplay);
        
        return container;
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

    // ========================================
    // Actor Management Implementation Methods
    // ========================================

    /**
     * Clear all actors from the stage
     */
    clearAllActors() {
        if (!window.theatricalActorFactory) {
            this.showNotification('Actor system not available', 'error');
            return;
        }

        const actorCount = window.theatricalActorFactory.getAllActors().length;
        
        if (actorCount === 0) {
            this.showNotification('No actors to clear', 'info');
            return;
        }

        if (confirm(`Clear all ${actorCount} actors?`)) {
            // Clear visual actors through ObjectFactory
            if (window.threeObjectFactory && window.stageState.objects.actors) {
                const actorsToRemove = [...window.stageState.objects.actors];
                actorsToRemove.forEach(actor => {
                    if (actor.userData && actor.userData.id) {
                        window.theatricalActorFactory.removeActor(actor.userData.id);
                    }
                    window.stageState.core.scene.remove(actor);
                });
                window.stageState.objects.actors = [];
            }

            this.updateActorCount();
            this.clearActorSelection();
            this.showNotification(`Cleared ${actorCount} actors`, 'success');
        }
    }

    /**
     * Toggle actor debug mode
     */
    toggleActorDebugMode(enabled) {
        this.showNotification(`Actor debug mode ${enabled ? 'enabled' : 'disabled'}`, 'info');
        
        if (enabled) {
            // Start periodic debug updates
            this.startActorDebugUpdates();
        } else {
            // Stop debug updates
            this.stopActorDebugUpdates();
        }
    }

    /**
     * Show actor performance statistics
     */
    showActorPerformanceStats() {
        if (!window.theatricalActorFactory) {
            this.showNotification('Actor system not available', 'error');
            return;
        }

        const stats = window.theatricalActorFactory.getStats();
        const debugInfo = window.theatricalActorFactory.getDebugInfo();

        let message = `Performance Stats:\n`;
        message += `• Total Actors: ${stats.totalActors}\n`;
        message += `• Active Actors: ${stats.activeActors}\n`;
        message += `• Avg Update Time: ${stats.averageUpdateTime.toFixed(2)}ms\n`;
        message += `• Memory Usage: ~${stats.memoryUsage}KB\n`;
        message += `• System Initialized: ${stats.isInitialized}`;

        alert(message);
    }

    /**
     * Toggle actor selection mode
     */
    toggleActorSelectionMode(enabled) {
        if (enabled) {
            this.showNotification('Click actors to select them', 'info');
            // Add click listeners to actors
            this.setupActorClickListeners();
        } else {
            this.showNotification('Actor selection mode disabled', 'info');
            // Remove click listeners
            this.removeActorClickListeners();
        }
    }

    /**
     * Setup click listeners for actor selection
     * Note: Actor selection is now handled by the main stage click handler using raycasting
     */
    setupActorClickListeners() {
        // Actor selection is now handled in stage.js onStageClick function
        // This method is kept for compatibility but the real work is done by raycasting
        console.log('🎯 Actor click listeners ready (using raycasting in stage.js)');
    }

    /**
     * Remove click listeners from actors
     */
    removeActorClickListeners() {
        if (!window.stageState.objects.actors) return;

        window.stageState.objects.actors.forEach(visualActor => {
            if (visualActor.userData && visualActor.userData.hasClickListener) {
                visualActor.removeEventListener('click', visualActor.userData.clickHandler);
                delete visualActor.userData.clickHandler;
                visualActor.userData.hasClickListener = false;
            }
        });
    }

    /**
     * Select an actor
     */
    selectActor(actorId) {
        console.log(`🔍 selectActor called: ${actorId}, multiSelectMode: ${this.uiState.multiSelectMode}`);
        
        if (this.uiState.multiSelectMode) {
            console.log(`🔄 Multi-select mode: currently selected:`, Array.from(this.uiState.selectedActors));
            if (this.uiState.selectedActors.has(actorId)) {
                console.log(`➖ Removing ${actorId} from selection`);
                this.uiState.selectedActors.delete(actorId);
                this.updateActorSelection(actorId, false);
            } else {
                console.log(`➕ Adding ${actorId} to selection`);
                this.uiState.selectedActors.add(actorId);
                this.updateActorSelection(actorId, true);
            }
        } else {
            console.log(`🎯 Single-select mode: replacing selection with ${actorId}`);
            // Single select mode
            this.clearActorSelection();
            this.uiState.selectedActorId = actorId;
            this.uiState.selectedActors.add(actorId);
            this.updateActorSelection(actorId, true);
        }
        
        console.log(`✅ Final selection:`, Array.from(this.uiState.selectedActors));
        this.updateSelectedActorDisplay();
        this.showNotification(`Selected actor ${actorId}`, 'info');
    }

    /**
     * Update visual selection state of an actor
     */
    updateActorSelection(actorId, selected) {
        const visualActor = this.findVisualActorById(actorId);
        if (!visualActor) return;
        
        // Helper function to set emissive on all materials
        const setEmissive = (object, color) => {
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => {
                        if (mat.emissive) mat.emissive = color;
                    });
                } else if (object.material.emissive) {
                    object.material.emissive = color;
                }
            }
            
            // Recursively apply to children
            if (object.children) {
                object.children.forEach(child => setEmissive(child, color));
            }
        };
        
        if (selected) {
            // Highlight selected actor with green glow
            setEmissive(visualActor, new THREE.Color(0x004400));
            console.log(`✨ Highlighted actor ${actorId} in green`);
        } else {
            // Remove highlight
            setEmissive(visualActor, new THREE.Color(0x000000));
            console.log(`⚪ Removed highlight from actor ${actorId}`);
        }
    }

    /**
     * Find visual actor by ID
     */
    findVisualActorById(actorId) {
        if (!window.stageState.objects.actors) return null;
        
        return window.stageState.objects.actors.find(actor => 
            actor.userData && actor.userData.id === actorId
        );
    }

    /**
     * Select all actors
     */
    selectAllActors() {
        if (!window.theatricalActorFactory) return;

        const allActors = window.theatricalActorFactory.getAllActors();
        this.clearActorSelection();
        
        allActors.forEach(actor => {
            this.uiState.selectedActors.add(actor.id);
            this.updateActorSelection(actor.id, true);
        });
        
        this.updateSelectedActorDisplay();
        this.showNotification(`Selected ${allActors.length} actors`, 'info');
    }

    /**
     * Clear actor selection
     */
    clearActorSelection() {
        this.uiState.selectedActors.forEach(actorId => {
            this.updateActorSelection(actorId, false);
        });
        
        this.uiState.selectedActors.clear();
        this.uiState.selectedActorId = null;
        this.updateSelectedActorDisplay();
    }

    /**
     * Update selected actor display
     */
    updateSelectedActorDisplay() {
        const selectedActorValueElement = document.getElementById('selectedActorValue');
        if (selectedActorValueElement) {
            if (this.uiState.selectedActors.size === 0) {
                selectedActorValueElement.textContent = 'None';
                selectedActorValueElement.style.fontStyle = 'italic';
            } else if (this.uiState.selectedActors.size === 1) {
                const actorId = Array.from(this.uiState.selectedActors)[0];
                selectedActorValueElement.textContent = actorId;
                selectedActorValueElement.style.fontStyle = 'normal';
            } else {
                selectedActorValueElement.textContent = `${this.uiState.selectedActors.size} actors`;
                selectedActorValueElement.style.fontStyle = 'normal';
            }
        }
    }

    /**
     * Move selected actors to specific marker with selection interface
     */
    moveSelectedActorsToRandomMarker() {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }

        if (!window.stageState.stage.stageMarkers || window.stageState.stage.stageMarkers.length === 0) {
            this.showNotification('No stage markers available', 'warning');
            return;
        }

        // Show marker selection interface
        this.showMarkerSelectionDialog();
    }

    /**
     * Show marker selection dialog
     */
    showMarkerSelectionDialog() {
        const markers = window.stageState.stage.stageMarkers;
        
        // Create marker selection dialog
        let options = 'Select a stage marker:\n\n';
        markers.forEach((marker, index) => {
            const label = marker.userData?.label || `Marker ${index + 1}`;
            const position = `(${marker.position.x.toFixed(1)}, ${marker.position.z.toFixed(1)})`;
            options += `${index + 1}. ${label} ${position}\n`;
        });
        
        options += '\nEnter marker number (1-' + markers.length + '):';
        
        const selection = prompt(options);
        
        if (selection === null) {
            // User cancelled
            return;
        }
        
        const markerIndex = parseInt(selection) - 1;
        
        if (isNaN(markerIndex) || markerIndex < 0 || markerIndex >= markers.length) {
            this.showNotification('Invalid marker selection', 'error');
            return;
        }
        
        // Move actors to selected marker
        this.moveSelectedActorsToSpecificMarker(markerIndex);
    }

    /**
     * Move selected actors to a specific marker
     */
    moveSelectedActorsToSpecificMarker(markerIndex) {
        const markers = window.stageState.stage.stageMarkers;
        const selectedMarker = markers[markerIndex];
        
        if (!selectedMarker) {
            console.error('Invalid marker index:', markerIndex);
            return;
        }
        
        const markerLabel = selectedMarker.userData?.label || `Marker ${markerIndex + 1}`;
        console.log(`🎯 Moving ${this.uiState.selectedActors.size} actors to ${markerLabel}`);

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                const targetX = selectedMarker.position.x;
                const targetZ = selectedMarker.position.z;
                
                // Add slight randomization to prevent actors from stacking
                const offsetX = targetX + (Math.random() - 0.5) * 0.8;
                const offsetZ = targetZ + (Math.random() - 0.5) * 0.8;
                
                console.log(`🎯 Moving ${actorId} to ${markerLabel} at (${offsetX.toFixed(2)}, ${offsetZ.toFixed(2)})`);
                actor.moveTo(offsetX, offsetZ);
                
                // Log the move
                this.logActorMove(actorId, 'move_to_marker', { 
                    x: offsetX, 
                    z: offsetZ, 
                    marker: markerLabel,
                    markerIndex: markerIndex
                });
            }
        });

        this.showNotification(`Moving ${this.uiState.selectedActors.size} actors to ${markerLabel}`, 'info');
    }

    /**
     * Move selected actors to specific position with bounds validation
     */
    moveSelectedActorsTo(x, z) {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }

        // Validate and clamp target position to stage bounds
        const stageMinX = -9, stageMaxX = 9;
        const stageMinZ = -6, stageMaxZ = 6;
        
        const clampedX = Math.max(stageMinX, Math.min(stageMaxX, x));
        const clampedZ = Math.max(stageMinZ, Math.min(stageMaxZ, z));
        
        console.log(`🎯 Moving actors to validated position (${clampedX}, ${clampedZ})`);

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                // Add some randomization to prevent all actors going to same spot
                const offsetX = clampedX + (Math.random() - 0.5) * 1.5;
                const offsetZ = clampedZ + (Math.random() - 0.5) * 1.5;
                
                // Final bounds check after offset
                const finalX = Math.max(stageMinX, Math.min(stageMaxX, offsetX));
                const finalZ = Math.max(stageMinZ, Math.min(stageMaxZ, offsetZ));
                
                console.log(`📍 Moving ${actorId} to (${finalX.toFixed(2)}, ${finalZ.toFixed(2)})`);
                actor.moveTo(finalX, finalZ);
                
                // Log the move
                this.logActorMove(actorId, 'move_to_position', { x: finalX, z: finalZ });
            }
        });

        this.showNotification(`Moving ${this.uiState.selectedActors.size} actors to (${clampedX}, ${clampedZ})`, 'info');
    }

    /**
     * Scatter selected actors randomly within valid stage bounds
     */
    scatterSelectedActors() {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }

        // Define safe scatter area within stage bounds
        const scatterMinX = -8, scatterMaxX = 8;
        const scatterMinZ = -5, scatterMaxZ = 5;
        
        console.log(`🎲 Scattering ${this.uiState.selectedActors.size} actors within bounds`);

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                // Generate random position within safe bounds
                const randomX = scatterMinX + Math.random() * (scatterMaxX - scatterMinX);
                const randomZ = scatterMinZ + Math.random() * (scatterMaxZ - scatterMinZ);
                
                console.log(`🎯 Scattering ${actorId} to (${randomX.toFixed(2)}, ${randomZ.toFixed(2)})`);
                actor.moveTo(randomX, randomZ);
                
                // Log the move
                this.logActorMove(actorId, 'scatter', { x: randomX, z: randomZ });
            }
        });

        this.showNotification(`Scattered ${this.uiState.selectedActors.size} actors`, 'info');
    }

    /**
     * Stop all actors
     */
    stopAllActors() {
        if (!window.theatricalActorFactory) return;

        const allActors = window.theatricalActorFactory.getAllActors();
        allActors.forEach(actor => {
            actor.stopMovement();
        });

        this.showNotification(`Stopped ${allActors.length} actors`, 'info');
    }

    /**
     * Toggle path visualization
     */
    togglePathVisualization(enabled) {
        this.showNotification(`Path visualization ${enabled ? 'enabled' : 'disabled'}`, 'info');
        
        if (window.theatricalActorFactory) {
            const actors = window.theatricalActorFactory.getAllActors();
            console.log(`🗺️ ${enabled ? 'Showing' : 'Hiding'} paths for ${actors.length} actors`);
            
            actors.forEach(actor => {
                if (actor.movementSystem) {
                    if (enabled) {
                        actor.movementSystem.visualizeGrid();
                        console.log(`📍 Showing pathfinding grid for ${actor.actorId}`);
                    } else {
                        // Clear existing visualization
                        actor.movementSystem.clearGridVisualization();
                        console.log(`🚫 Cleared pathfinding grid for ${actor.actorId}`);
                    }
                }
            });
            
            if (actors.length === 0) {
                this.showNotification('No actors available for path visualization', 'warning');
            }
        } else {
            this.showNotification('Actor system not ready', 'error');
        }
    }

    /**
     * Toggle collision grid visualization
     */
    toggleCollisionGridVisualization(enabled) {
        this.showNotification(`Collision grid ${enabled ? 'shown' : 'hidden'}`, 'info');
        
        if (window.theatricalActorFactory) {
            if (enabled) {
                // If actors are selected, show grids for selected actors only
                if (this.uiState.selectedActors.size > 0) {
                    console.log(`🔍 Showing collision grids for ${this.uiState.selectedActors.size} selected actors`);
                    this.uiState.selectedActors.forEach(actorId => {
                        const actor = window.theatricalActorFactory.getActor(actorId);
                        if (actor && actor.movementSystem) {
                            actor.movementSystem.visualizeGrid();
                            console.log(`🔍 Showing collision grid for ${actorId}`);
                        }
                    });
                } else {
                    // No actors selected, show grids for all actors
                    const allActors = window.theatricalActorFactory.getAllActors();
                    console.log(`🔍 No actors selected, showing collision grids for all ${allActors.length} actors`);
                    allActors.forEach(actor => {
                        if (actor.movementSystem) {
                            actor.movementSystem.visualizeGrid();
                        }
                    });
                    if (allActors.length === 0) {
                        this.showNotification('No actors available for collision grid visualization', 'warning');
                    }
                }
            } else {
                // Hide all collision grids
                const allActors = window.theatricalActorFactory.getAllActors();
                console.log(`🚫 Hiding collision grids for all ${allActors.length} actors`);
                allActors.forEach(actor => {
                    if (actor.movementSystem) {
                        actor.movementSystem.clearGridVisualization();
                    }
                });
            }
        } else {
            this.showNotification('Actor system not ready', 'error');
        }
    }

    /**
     * Make selected actors perform
     */
    makeSelectedActorsPerform() {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                actor.startPerformance('stage_performance', 5000);
                // Log the action
                this.logActorMove(actorId, 'start_performance', { 
                    type: 'stage_performance', 
                    duration: 5000 
                });
            }
        });

        this.showNotification(`${this.uiState.selectedActors.size} actors starting performance`, 'info');
    }

    /**
     * Make selected actors interact
     */
    makeSelectedActorsInteract() {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                actor.startInteraction('nearby_prop', 'examining', 3000);
            }
        });

        this.showNotification(`${this.uiState.selectedActors.size} actors interacting`, 'info');
    }

    /**
     * Make selected actors wait
     */
    makeSelectedActorsWait() {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                actor.waitForCue('director_cue', 15000);
            }
        });

        this.showNotification(`${this.uiState.selectedActors.size} actors waiting for cue`, 'info');
    }

    /**
     * Make selected actors return to idle
     */
    makeSelectedActorsIdle() {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                actor.stateMachine.triggerEvent('reset');
            }
        });

        this.showNotification(`${this.uiState.selectedActors.size} actors returning to idle`, 'info');
    }

    /**
     * Adjust personality of selected actors
     */
    adjustSelectedActorsPersonality(trait, value) {
        if (this.uiState.selectedActors.size === 0) {
            return;
        }

        this.uiState.selectedActors.forEach(actorId => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor && actor.personality) {
                actor.personality[trait] = value;
                
                // Update movement speed based on energy
                if (trait === 'energy') {
                    actor.movementSpeed = 0.5 + (value * 1.5);
                }
            }
        });

        // Only show notification occasionally to avoid spam
        if (Math.random() < 0.1) {
            this.showNotification(`Adjusted ${trait} for ${this.uiState.selectedActors.size} actors`, 'info');
        }
    }
    
    /**
     * Log actor move for tracking and debugging
     */
    logActorMove(actorId, action, details = {}) {
        if (!this.actorMoveLogs.has(actorId)) {
            this.actorMoveLogs.set(actorId, []);
        }
        
        const log = this.actorMoveLogs.get(actorId);
        const moveRecord = {
            timestamp: Date.now(),
            action: action, // 'move_to_position', 'scatter', 'move_to_marker', 'interact', 'wait_for_cue', etc.
            details: details,
            position: details.x !== undefined ? { x: details.x, z: details.z } : null
        };
        
        log.push(moveRecord);
        
        // Keep only recent entries
        if (log.length > this.maxLogEntriesPerActor) {
            log.shift();
        }
        
        console.log(`📝 Actor ${actorId} move logged: ${action}`, moveRecord);
    }
    
    /**
     * Get move log for specific actor
     */
    getActorMoveLog(actorId) {
        return this.actorMoveLogs.get(actorId) || [];
    }
    
    /**
     * Get all actor move logs
     */
    getAllActorMoveLogs() {
        const allLogs = {};
        this.actorMoveLogs.forEach((log, actorId) => {
            allLogs[actorId] = [...log]; // Return copy
        });
        return allLogs;
    }
    
    /**
     * Clear move logs for actor or all actors
     */
    clearActorMoveLogs(actorId = null) {
        if (actorId) {
            this.actorMoveLogs.delete(actorId);
            console.log(`🗑️ Cleared move logs for ${actorId}`);
        } else {
            this.actorMoveLogs.clear();
            console.log(`🗑️ Cleared all actor move logs`);
        }
    }
    
    /**
     * Show actor move logs in a formatted display
     */
    showActorMoveLogs() {
        const allLogs = this.getAllActorMoveLogs();
        
        if (Object.keys(allLogs).length === 0) {
            alert('No actor move logs available.');
            return;
        }
        
        let logDisplay = 'ACTOR MOVE LOGS:\n\n';
        
        Object.entries(allLogs).forEach(([actorId, logs]) => {
            logDisplay += `${actorId}:\n`;
            
            if (logs.length === 0) {
                logDisplay += '  No moves recorded\n';
            } else {
                logs.slice(-10).forEach((log, index) => { // Show last 10 moves
                    const time = new Date(log.timestamp).toLocaleTimeString();
                    const position = log.position ? `(${log.position.x.toFixed(1)}, ${log.position.z.toFixed(1)})` : '';
                    logDisplay += `  ${time}: ${log.action} ${position}\n`;
                });
            }
            logDisplay += '\n';
        });
        
        // Create a scrollable text area instead of alert for large logs
        const logWindow = window.open('', 'Actor Move Logs', 'width=600,height=400,scrollbars=yes');
        logWindow.document.write(`
            <html>
                <head><title>Actor Move Logs</title></head>
                <body style="font-family: monospace; padding: 20px;">
                    <h2>Actor Move Logs</h2>
                    <pre>${logDisplay}</pre>
                    <button onclick="window.close()">Close</button>
                </body>
            </html>
        `);
    }
    
    /**
     * Trigger a performance queue that coordinates multiple actors
     */
    triggerPerformanceQueue() {
        if (!window.theatricalActorFactory) {
            this.showNotification('Actor system not available', 'error');
            return;
        }
        
        const allActors = window.theatricalActorFactory.getAllActors();
        
        if (allActors.length === 0) {
            this.showNotification('No actors available for performance', 'warning');
            return;
        }
        
        console.log(`🎭 Starting coordinated performance with ${allActors.length} actors`);
        
        // Create a performance sequence
        const performanceSequence = [
            { delay: 0, action: 'scatter', description: 'Actors scatter to positions' },
            { delay: 3000, action: 'wait', description: 'Actors wait for cue' },
            { delay: 6000, action: 'move_to_center', description: 'Actors move toward center' },
            { delay: 9000, action: 'perform', description: 'Actors begin performance' },
            { delay: 14000, action: 'bow', description: 'Actors take bow' },
            { delay: 17000, action: 'exit', description: 'Actors exit stage' }
        ];
        
        // Execute the sequence
        performanceSequence.forEach((step, index) => {
            setTimeout(() => {
                console.log(`🎭 Performance Step ${index + 1}: ${step.description}`);
                this.showNotification(step.description, 'info');
                
                switch (step.action) {
                    case 'scatter':
                        allActors.forEach(actor => {
                            const randomX = (Math.random() - 0.5) * 12;
                            const randomZ = (Math.random() - 0.5) * 8;
                            actor.moveTo(randomX, randomZ);
                            this.logActorMove(actor.id, 'performance_scatter', { x: randomX, z: randomZ, sequence: 'opening' });
                        });
                        break;
                        
                    case 'wait':
                        allActors.forEach(actor => {
                            actor.waitForCue('performance_cue', 5000);
                            this.logActorMove(actor.id, 'performance_wait', { cue: 'performance_cue', sequence: 'preparation' });
                        });
                        break;
                        
                    case 'move_to_center':
                        allActors.forEach((actor, index) => {
                            const angle = (index / allActors.length) * Math.PI * 2;
                            const radius = 3;
                            const x = Math.cos(angle) * radius;
                            const z = Math.sin(angle) * radius;
                            actor.moveTo(x, z);
                            this.logActorMove(actor.id, 'performance_formation', { x, z, formation: 'circle', sequence: 'arrangement' });
                        });
                        break;
                        
                    case 'perform':
                        allActors.forEach(actor => {
                            actor.startPerformance('coordinated_performance', 5000);
                            this.logActorMove(actor.id, 'performance_start', { type: 'coordinated_performance', sequence: 'main_act' });
                        });
                        break;
                        
                    case 'bow':
                        allActors.forEach(actor => {
                            // Return to idle which will show "bow" behavior briefly
                            actor.stateMachine.triggerEvent('reset');
                            this.logActorMove(actor.id, 'performance_bow', { sequence: 'finale' });
                        });
                        break;
                        
                    case 'exit':
                        allActors.forEach((actor, index) => {
                            const exitSide = index % 2 === 0 ? 'left' : 'right';
                            const exitX = exitSide === 'left' ? -12 : 12;
                            const exitZ = -2 + (Math.random() - 0.5) * 2;
                            actor.moveTo(exitX, exitZ);
                            this.logActorMove(actor.id, 'performance_exit', { x: exitX, z: exitZ, side: exitSide, sequence: 'conclusion' });
                        });
                        break;
                }
            }, step.delay);
        });
        
        this.showNotification(`Performance queue started with ${allActors.length} actors`, 'success');
    }
    
    /**
     * Move selected actors to backstage areas
     */
    moveSelectedActorsToBackstage(side) {
        if (this.uiState.selectedActors.size === 0) {
            this.showNotification('No actors selected', 'warning');
            return;
        }
        
        // Define backstage positions
        const backstagePositions = {
            left: {
                x: -12, // Off-stage left
                z: -2,
                name: 'Backstage Left'
            },
            right: {
                x: 12, // Off-stage right
                z: -2,
                name: 'Backstage Right'
            }
        };
        
        const targetArea = backstagePositions[side];
        if (!targetArea) {
            console.error('Invalid backstage side:', side);
            return;
        }
        
        console.log(`🎭 Moving ${this.uiState.selectedActors.size} actors to ${targetArea.name}`);
        
        this.uiState.selectedActors.forEach((actorId, index) => {
            const actor = window.theatricalActorFactory.getActor(actorId);
            if (actor) {
                // Spread actors out in backstage area
                const offsetZ = targetArea.z + (index * 1.5) - (this.uiState.selectedActors.size * 0.75);
                const finalX = targetArea.x;
                const finalZ = Math.max(-8, Math.min(2, offsetZ)); // Keep within reasonable bounds
                
                console.log(`🎭 Moving ${actorId} to ${targetArea.name} at (${finalX}, ${finalZ.toFixed(2)})`);
                actor.moveTo(finalX, finalZ);
                
                // Log the move
                this.logActorMove(actorId, 'move_to_backstage', { 
                    x: finalX, 
                    z: finalZ, 
                    backstage: side,
                    area: targetArea.name 
                });
            }
        });
        
        this.showNotification(`Moving ${this.uiState.selectedActors.size} actors to ${targetArea.name}`, 'info');
    }

    /**
     * Update actor count display
     */
    updateActorCount() {
        const actorCountElement = document.getElementById('actorCountValue');
        if (actorCountElement && window.theatricalActorFactory) {
            const count = window.theatricalActorFactory.getAllActors().length;
            actorCountElement.textContent = count.toString();
        }
    }

    /**
     * Start periodic actor debug updates
     */
    startActorDebugUpdates() {
        if (this.actorDebugInterval) {
            clearInterval(this.actorDebugInterval);
        }

        this.actorDebugInterval = setInterval(() => {
            this.updateActorCount();
            // Additional debug updates can be added here
        }, 1000);
    }

    /**
     * Stop periodic actor debug updates
     */
    stopActorDebugUpdates() {
        if (this.actorDebugInterval) {
            clearInterval(this.actorDebugInterval);
            this.actorDebugInterval = null;
        }
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