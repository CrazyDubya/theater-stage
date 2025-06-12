/**
 * UILighting.js - Lighting and Camera Control System
 * 
 * Handles all lighting-related UI controls:
 * - Lighting preset selection
 * - Backdrop and scenery controls
 * - Camera view management
 * - Scene visual effects
 */

class UILighting {
    constructor(uiControls, stageState) {
        this.uiControls = uiControls;
        this.stageState = stageState;
        this.commandManager = null; // Will be set when available
        console.log('UILighting: Initialized');
    }

    /**
     * Set command manager for undo/redo functionality
     */
    setCommandManager(commandManager) {
        this.commandManager = commandManager;
    }

    /**
     * Create lighting preset selector
     */
    createLightingSelector(onLightingChange) {
        const container = this.uiControls.uiFactory.createElement('div', {
            className: 'lighting-controls'
        });

        const label = this.uiControls.createLabel('Lighting Preset:');
        container.appendChild(label);

        const selector = this.uiControls.uiFactory.createElement('select', {
            className: 'stage-select lighting-select'
        });

        const presets = [
            { value: 'normal', label: 'Default' },
            { value: 'day', label: 'Bright Day' },
            { value: 'night', label: 'Evening' },
            { value: 'sunset', label: 'Sunset' },
            { value: 'dramatic', label: 'Dramatic' }
        ];

        presets.forEach(preset => {
            const option = this.uiControls.uiFactory.createElement('option', {
                value: preset.value,
                textContent: preset.label
            });
            selector.appendChild(option);
        });

        selector.onchange = () => {
            const newPreset = selector.value;
            this.stageState.currentLightingPreset = newPreset;
            
            if (onLightingChange) {
                onLightingChange(newPreset);
            }

            // Create command for undo/redo if available
            if (this.commandManager && window.LightingChangeCommand) {
                const command = new window.LightingChangeCommand(newPreset);
                this.commandManager.executeCommand(command);
            }
        };

        container.appendChild(selector);

        // Add intensity controls
        const intensitySlider = this.uiControls.createSlider(0.1, 2.0, 1.0, 0.1, 
            (value) => {
                if (window.applyLightingIntensity) {
                    window.applyLightingIntensity(value);
                }
            }, 
            {
                label: 'Intensity:',
                formatter: (value) => `${Math.round(value * 100)}%`
            }
        );

        container.appendChild(intensitySlider.container);

        return container;
    }

    /**
     * Create backdrop selector
     */
    createBackdropSelector(onBackdropChange) {
        const container = this.uiControls.uiFactory.createElement('div', {
            className: 'backdrop-controls'
        });

        const label = this.uiControls.createLabel('Backdrop:');
        container.appendChild(label);

        const selector = this.uiControls.createPanelSelector((position) => {
            this.stageState.backdropPosition = position;
            if (onBackdropChange) {
                onBackdropChange(position);
            }
            this.moveSceneryWithUndo('backdrop', position);
        });

        container.appendChild(selector);

        return container;
    }

    /**
     * Create midstage selector
     */
    createMidstageSelector(onMidstageChange) {
        const container = this.uiControls.uiFactory.createElement('div', {
            className: 'midstage-controls'
        });

        const label = this.uiControls.createLabel('Midstage:');
        container.appendChild(label);

        const selector = this.uiControls.createPanelSelector((position) => {
            this.stageState.midstagePosition = position;
            if (onMidstageChange) {
                onMidstageChange(position);
            }
            this.moveSceneryWithUndo('midstage', position);
        });

        container.appendChild(selector);

        return container;
    }

    /**
     * Create camera control panel
     */
    createCameraControls(onCameraChange) {
        const container = this.uiControls.uiFactory.createElement('div', {
            className: 'camera-controls'
        });

        const label = this.uiControls.createLabel('Camera View:');
        container.appendChild(label);

        const cameraSelector = this.uiControls.createCameraSelector((preset) => {
            if (onCameraChange) {
                onCameraChange(preset);
            }
        });

        container.appendChild(cameraSelector);

        // Add camera animation controls
        const animationToggle = this.uiControls.createToggleButton(
            'Camera Animation', 
            true, 
            (enabled) => {
                this.stageState.cameraAnimationEnabled = enabled;
                if (window.toggleCameraAnimation) {
                    window.toggleCameraAnimation(enabled);
                }
            }
        );

        container.appendChild(animationToggle);

        return container;
    }

    /**
     * Create fog and atmosphere controls
     */
    createAtmosphereControls() {
        const container = this.uiControls.uiFactory.createElement('div', {
            className: 'atmosphere-controls'
        });

        const label = this.uiControls.createLabel('Atmosphere:');
        container.appendChild(label);

        // Fog controls
        const fogToggle = this.uiControls.createToggleButton(
            'Fog Effect',
            false,
            (enabled) => {
                if (window.toggleFog) {
                    window.toggleFog(enabled);
                }
            }
        );
        container.appendChild(fogToggle);

        const fogDensity = this.uiControls.createSlider(0, 0.01, 0.002, 0.001,
            (value) => {
                if (window.setFogDensity) {
                    window.setFogDensity(value);
                }
            },
            {
                label: 'Fog Density:',
                formatter: (value) => (value * 1000).toFixed(1)
            }
        );
        container.appendChild(fogDensity.container);

        return container;
    }

    /**
     * Create shadow controls
     */
    createShadowControls() {
        const container = this.uiControls.uiFactory.createElement('div', {
            className: 'shadow-controls'
        });

        const label = this.uiControls.createLabel('Shadows:');
        container.appendChild(label);

        const shadowToggle = this.uiControls.createToggleButton(
            'Cast Shadows',
            true,
            (enabled) => {
                if (window.toggleShadows) {
                    window.toggleShadows(enabled);
                }
            }
        );
        container.appendChild(shadowToggle);

        const shadowQuality = this.uiControls.uiFactory.createElement('select', {
            className: 'stage-select'
        });

        ['Low', 'Medium', 'High'].forEach(quality => {
            const option = this.uiControls.uiFactory.createElement('option', {
                value: quality.toLowerCase(),
                textContent: quality
            });
            shadowQuality.appendChild(option);
        });

        shadowQuality.onchange = () => {
            if (window.setShadowQuality) {
                window.setShadowQuality(shadowQuality.value);
            }
        };

        const qualityLabel = this.uiControls.createLabel('Quality:');
        container.appendChild(qualityLabel);
        container.appendChild(shadowQuality);

        return container;
    }

    /**
     * Move scenery with undo support
     */
    moveSceneryWithUndo(type, position) {
        if (this.commandManager && window.SceneryPositionCommand) {
            const command = new window.SceneryPositionCommand(type, position);
            this.commandManager.executeCommand(command);
        } else {
            // Fallback to direct execution
            if (type === 'backdrop' && window.moveBackdrop) {
                window.moveBackdrop(position);
            } else if (type === 'midstage' && window.moveMidstage) {
                window.moveMidstage(position);
            }
        }
    }

    /**
     * Create complete lighting panel
     */
    createLightingPanel(callbacks = {}) {
        const panel = this.uiControls.uiFactory.createElement('div', {
            className: 'lighting-panel'
        });

        // Lighting presets
        const lightingControls = this.createLightingSelector(callbacks.onLightingChange);
        panel.appendChild(lightingControls);

        panel.appendChild(this.uiControls.createSpacer());

        // Camera controls
        const cameraControls = this.createCameraControls(callbacks.onCameraChange);
        panel.appendChild(cameraControls);

        panel.appendChild(this.uiControls.createSpacer());

        // Atmosphere controls
        const atmosphereControls = this.createAtmosphereControls();
        panel.appendChild(atmosphereControls);

        panel.appendChild(this.uiControls.createSpacer());

        // Shadow controls
        const shadowControls = this.createShadowControls();
        panel.appendChild(shadowControls);

        return panel;
    }

    /**
     * Create scenery control panel
     */
    createSceneryPanel(callbacks = {}) {
        const panel = this.uiControls.uiFactory.createElement('div', {
            className: 'scenery-panel'
        });

        // Backdrop controls
        const backdropControls = this.createBackdropSelector(callbacks.onBackdropChange);
        panel.appendChild(backdropControls);

        panel.appendChild(this.uiControls.createSpacer());

        // Midstage controls
        const midstageControls = this.createMidstageSelector(callbacks.onMidstageChange);
        panel.appendChild(midstageControls);

        panel.appendChild(this.uiControls.createSpacer());

        // Texture controls
        const textureSelector = this.uiControls.createDefaultTextureSelector(callbacks.onTextureChange);
        const textureLabel = this.uiControls.createLabel('Default Texture:');
        
        const textureContainer = this.uiControls.uiFactory.createElement('div', {
            className: 'texture-controls'
        });
        textureContainer.appendChild(textureLabel);
        textureContainer.appendChild(textureSelector);
        
        panel.appendChild(textureContainer);

        return panel;
    }

    /**
     * Update lighting UI state
     */
    updateLightingState(preset) {
        this.stageState.currentLightingPreset = preset;
        // Update UI elements if needed
    }

    /**
     * Reset all lighting to defaults
     */
    resetLighting() {
        if (window.applyLightingPreset) {
            window.applyLightingPreset('normal');
        }
        this.updateLightingState('normal');
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UILighting;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.UILighting = UILighting;
}