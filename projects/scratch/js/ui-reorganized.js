// This is a temporary file to show the new UI organization
// The actual implementation will replace the setupUI function in stage.js

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
    
    // === OBJECTS TAB ===
    const objectsPanel = document.createElement('div');
    objectsPanel.style.display = 'block';
    
    // Props section
    const propsLabel = document.createElement('div');
    propsLabel.innerHTML = '<strong>Props</strong>';
    propsLabel.style.cssText = 'margin-bottom: 5px;';
    
    // Prop selector (existing)
    // Actor type selector (existing)
    // Place buttons (existing)
    
    objectsPanel.appendChild(propsLabel);
    // Add prop controls here
    
    // === STAGE TAB ===
    const stagePanel = document.createElement('div');
    stagePanel.style.display = 'none';
    
    // Lighting controls
    // Camera controls
    // Stage elements (curtains, platforms, etc.)
    // Stage markers toggle
    
    // === SCENERY TAB ===
    const sceneryPanel = document.createElement('div');
    sceneryPanel.style.display = 'none';
    
    // Scenery position controls
    // Texture controls
    // Scale controls
    
    // === CONTROLS TAB ===
    const controlsPanel = document.createElement('div');
    controlsPanel.style.display = 'none';
    
    // Save/Load
    // Undo/Redo
    // Physics test
    // Audio controls
    
    tabPanels.objects = objectsPanel;
    tabPanels.stage = stagePanel;
    tabPanels.scenery = sceneryPanel;
    tabPanels.controls = controlsPanel;
    
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