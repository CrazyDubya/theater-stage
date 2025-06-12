// Replacement for setupUI function with tabbed interface

function setupUI() {
    // Create toggle button for menu
    const toggleButton = document.createElement('button');
    toggleButton.id = 'menu-toggle';
    toggleButton.textContent = '☰';
    toggleButton.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 20px;
        z-index: 1000;
    `;
    
    const uiContainer = document.createElement('div');
    uiContainer.id = 'ui-container';
    uiContainer.style.cssText = `
        position: absolute;
        top: 60px;
        left: 10px;
        background: rgba(0,0,0,0.7);
        padding: 0;
        border-radius: 5px;
        color: white;
        font-family: Arial, sans-serif;
        transition: transform 0.3s ease;
        width: 300px;
        max-height: calc(100vh - 80px);
        overflow: hidden;
    `;
    
    let menuVisible = true;
    toggleButton.addEventListener('click', () => {
        menuVisible = !menuVisible;
        if (menuVisible) {
            uiContainer.style.transform = 'translateX(0)';
            toggleButton.textContent = '☰';
        } else {
            uiContainer.style.transform = 'translateX(-350px)';
            toggleButton.textContent = '→';
        }
    });
    
    // Create tab system
    const tabContainer = document.createElement('div');
    tabContainer.style.cssText = `
        display: flex;
        background: rgba(0,0,0,0.8);
        border-radius: 5px 5px 0 0;
    `;
    
    const tabs = {
        objects: { label: 'Objects', icon: '🎭' },
        stage: { label: 'Stage', icon: '🎪' },
        scenery: { label: 'Scenery', icon: '🖼️' },
        controls: { label: 'Controls', icon: '⚙️' }
    };
    
    const tabButtons = {};
    const tabPanels = {};
    let activeTab = 'objects';
    
    // Create tab buttons
    Object.entries(tabs).forEach(([key, tab]) => {
        const button = document.createElement('button');
        button.textContent = tab.icon + ' ' + tab.label;
        button.style.cssText = `
            flex: 1;
            padding: 10px;
            border: none;
            background: ${key === activeTab ? 'rgba(255,255,255,0.1)' : 'transparent'};
            color: white;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.3s;
        `;
        
        button.addEventListener('click', () => {
            Object.keys(tabButtons).forEach(k => {
                tabButtons[k].style.background = k === key ? 'rgba(255,255,255,0.1)' : 'transparent';
                tabPanels[k].style.display = k === key ? 'block' : 'none';
            });
            activeTab = key;
        });
        
        tabButtons[key] = button;
        tabContainer.appendChild(button);
    });
    
    // Create content container
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
        padding: 15px;
        max-height: calc(100vh - 140px);
        overflow-y: auto;
    `;
    
    // Create all tab panels
    const objectsPanel = createObjectsPanel();
    const stagePanel = createStagePanel();
    const sceneryPanel = createSceneryPanel();
    const controlsPanel = createControlsPanel();
    
    tabPanels.objects = objectsPanel;
    tabPanels.stage = stagePanel;
    tabPanels.scenery = sceneryPanel;
    tabPanels.controls = controlsPanel;
    
    // Initially hide all but objects panel
    objectsPanel.style.display = 'block';
    stagePanel.style.display = 'none';
    sceneryPanel.style.display = 'none';
    controlsPanel.style.display = 'none';
    
    // Add panels to content container
    contentContainer.appendChild(objectsPanel);
    contentContainer.appendChild(stagePanel);
    contentContainer.appendChild(sceneryPanel);
    contentContainer.appendChild(controlsPanel);
    
    // Assemble UI
    uiContainer.appendChild(tabContainer);
    uiContainer.appendChild(contentContainer);
    
    document.body.appendChild(toggleButton);
    document.body.appendChild(uiContainer);
}

function createObjectsPanel() {
    const panel = document.createElement('div');
    
    // Props section
    const propsLabel = createLabel('Props');
    const propSelect = createPropSelector();
    const propButton = createButton('Place Prop', () => {
        placementMode = 'prop';
        placementMarker.visible = true;
    });
    
    // Actors section
    const actorsLabel = createLabel('Actors');
    const actorSelect = createActorSelector();
    const actorButton = createButton('Place Actor', () => {
        placementMode = 'actor';
        placementMarker.visible = true;
    });
    
    // Assemble panel
    panel.appendChild(propsLabel);
    panel.appendChild(propSelect);
    panel.appendChild(propButton);
    panel.appendChild(createSpacer());
    panel.appendChild(actorsLabel);
    panel.appendChild(actorSelect);
    panel.appendChild(actorButton);
    
    return panel;
}

function createStagePanel() {
    const panel = document.createElement('div');
    
    // Lighting section
    const lightingLabel = createLabel('Lighting');
    const lightingSelect = createLightingSelector();
    
    // Camera section
    const cameraLabel = createLabel('Camera View');
    const cameraSelect = createCameraSelector();
    
    // Stage elements section
    const elementsLabel = createLabel('Stage Elements');
    const markerToggle = createButton('Toggle Markers', toggleMarkers);
    const curtainButton = createButton('Toggle Curtains', toggleCurtains);
    const platformButton = createButton('Move Platforms', movePlatforms);
    
    // Special effects
    const effectsLabel = createLabel('Special Effects');
    const showRotatingButton = createButton('Show/Hide Rotating Stage', toggleRotatingStageVisibility);
    const rotateButton = createButton('Start/Stop Rotation', rotateCenter);
    const showTrapDoorsButton = createButton('Show/Hide Trap Doors', toggleTrapDoorsVisibility);
    const trapButton = createButton('Toggle Trap Doors', toggleTrapDoors);
    
    // Assemble panel
    panel.appendChild(lightingLabel);
    panel.appendChild(lightingSelect);
    panel.appendChild(createSpacer());
    panel.appendChild(cameraLabel);
    panel.appendChild(cameraSelect);
    panel.appendChild(createSpacer());
    panel.appendChild(elementsLabel);
    panel.appendChild(markerToggle);
    panel.appendChild(curtainButton);
    panel.appendChild(platformButton);
    panel.appendChild(createSpacer());
    panel.appendChild(effectsLabel);
    panel.appendChild(showRotatingButton);
    panel.appendChild(rotateButton);
    panel.appendChild(showTrapDoorsButton);
    panel.appendChild(trapButton);
    
    return panel;
}

function createSceneryPanel() {
    const panel = document.createElement('div');
    
    // Scenery position
    const positionLabel = createLabel('Scenery Position');
    const backdropSelect = createBackdropSelector();
    const midstageSelect = createMidstageSelector();
    
    // Texture controls
    const textureLabel = createLabel('Textures');
    const panelSelect = createPanelSelector();
    const defaultTextureSelect = createDefaultTextureSelector();
    const uploadButton = createButton('Upload Image', handleTextureUpload);
    
    // Texture scale
    const scaleLabel = createLabel('Texture Scale');
    const scaleSlider = createScaleSlider();
    
    // Assemble panel
    panel.appendChild(positionLabel);
    panel.appendChild(backdropSelect);
    panel.appendChild(midstageSelect);
    panel.appendChild(createSpacer());
    panel.appendChild(textureLabel);
    panel.appendChild(panelSelect);
    panel.appendChild(defaultTextureSelect);
    panel.appendChild(uploadButton);
    panel.appendChild(createSpacer());
    panel.appendChild(scaleLabel);
    panel.appendChild(scaleSlider);
    
    return panel;
}

function createControlsPanel() {
    const panel = document.createElement('div');
    
    // Save/Load section
    const saveLoadLabel = createLabel('Save/Load Scene');
    const saveButton = createButton('Save Scene', saveScene);
    const loadButton = createButton('Load Scene', loadScene);
    
    // Undo/Redo section
    const undoRedoLabel = createLabel('Undo/Redo');
    const { undoButton, redoButton } = createUndoRedoButtons();
    
    // Physics section
    const physicsLabel = createLabel('Physics Test');
    const pushButton = createButton('Push Mode', () => {
        placementMode = 'push';
        placementMarker.visible = true;
        alert('Click on an object to push it! Lighter objects move more.');
    });
    
    // Audio section
    const audioLabel = createLabel('Audio System');
    const { audioInitButton, volumeControls } = createAudioControls();
    
    // Assemble panel
    panel.appendChild(saveLoadLabel);
    const saveLoadDiv = document.createElement('div');
    saveLoadDiv.appendChild(saveButton);
    saveLoadDiv.appendChild(document.createTextNode(' '));
    saveLoadDiv.appendChild(loadButton);
    panel.appendChild(saveLoadDiv);
    
    panel.appendChild(createSpacer());
    panel.appendChild(undoRedoLabel);
    const undoRedoDiv = document.createElement('div');
    undoRedoDiv.appendChild(undoButton);
    undoRedoDiv.appendChild(document.createTextNode(' '));
    undoRedoDiv.appendChild(redoButton);
    panel.appendChild(undoRedoDiv);
    
    panel.appendChild(createSpacer());
    panel.appendChild(physicsLabel);
    panel.appendChild(pushButton);
    
    panel.appendChild(createSpacer());
    panel.appendChild(audioLabel);
    panel.appendChild(audioInitButton);
    panel.appendChild(volumeControls);
    
    return panel;
}

// Helper functions for creating UI elements
function createLabel(text) {
    const label = document.createElement('div');
    label.innerHTML = `<strong>${text}</strong>`;
    label.style.cssText = 'margin-bottom: 5px;';
    return label;
}

function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = 'margin: 5px 0; padding: 5px 10px; cursor: pointer; width: 100%;';
    button.addEventListener('click', onClick);
    return button;
}

function createSpacer() {
    const spacer = document.createElement('div');
    spacer.style.cssText = 'height: 10px;';
    return spacer;
}

// The rest of the create functions would be moved from the original setupUI...