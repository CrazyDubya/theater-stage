/**
 * UIControls.js - Basic UI Control Creation System
 * 
 * Handles creation of fundamental UI controls:
 * - Buttons, labels, spacers
 * - Toggle buttons and sliders
 * - Selectors for props, actors, cameras
 * - Audio controls and utility functions
 */

class UIControls {
    constructor(uiFactory, stageState) {
        this.uiFactory = uiFactory;
        this.stageState = stageState;
        console.log('UIControls: Initialized');
    }

    /**
     * Create a standard button
     */
    createButton(text, onClick, className = '') {
        return this.uiFactory.createElement('button', {
            textContent: text,
            className: `stage-button ${className}`,
            onclick: onClick
        });
    }

    /**
     * Create a label element
     */
    createLabel(text, className = '') {
        return this.uiFactory.createElement('label', {
            textContent: text,
            className: `stage-label ${className}`
        });
    }

    /**
     * Create a spacer element
     */
    createSpacer(height = '10px') {
        return this.uiFactory.createElement('div', {
            style: `height: ${height}; width: 100%;`
        });
    }

    /**
     * Create toggle button with state management
     */
    createToggleButton(text, initialState, onChange, options = {}) {
        const button = this.uiFactory.createElement('button', {
            textContent: text,
            className: `stage-button toggle-button ${initialState ? 'active' : ''} ${options.className || ''}`
        });

        let isActive = initialState;

        button.onclick = () => {
            isActive = !isActive;
            button.classList.toggle('active', isActive);
            button.textContent = options.activeText && isActive ? options.activeText : text;
            
            if (onChange) {
                onChange(isActive);
            }
        };

        // Allow external state updates
        button.setActive = (active) => {
            isActive = active;
            button.classList.toggle('active', isActive);
            button.textContent = options.activeText && isActive ? options.activeText : text;
        };

        return button;
    }

    /**
     * Create a slider control
     */
    createSlider(min, max, value, step, onChange, options = {}) {
        const container = this.uiFactory.createElement('div', {
            className: 'slider-container'
        });

        if (options.label) {
            const label = this.createLabel(options.label);
            container.appendChild(label);
        }

        const slider = this.uiFactory.createElement('input', {
            type: 'range',
            min: min,
            max: max,
            value: value,
            step: step,
            className: 'stage-slider'
        });

        const valueDisplay = this.uiFactory.createElement('span', {
            textContent: value,
            className: 'slider-value'
        });

        slider.oninput = () => {
            const newValue = parseFloat(slider.value);
            valueDisplay.textContent = options.formatter ? options.formatter(newValue) : newValue;
            if (onChange) {
                onChange(newValue);
            }
        };

        container.appendChild(slider);
        container.appendChild(valueDisplay);

        return { container, slider, valueDisplay };
    }

    /**
     * Create prop type selector
     */
    createPropSelector(onPropChange) {
        const selector = this.uiFactory.createElement('select', {
            className: 'stage-select'
        });

        const propTypes = [
            'cube', 'sphere', 'cylinder', 'chair', 'table', 
            'crate', 'barrel', 'plant', 'lamp'
        ];

        propTypes.forEach(type => {
            const option = this.uiFactory.createElement('option', {
                value: type,
                textContent: type.charAt(0).toUpperCase() + type.slice(1)
            });
            selector.appendChild(option);
        });

        selector.onchange = () => {
            if (onPropChange) {
                onPropChange(selector.value);
            }
        };

        return selector;
    }

    /**
     * Create actor type selector
     */
    createActorSelector(onActorChange) {
        const selector = this.uiFactory.createElement('select', {
            className: 'stage-select'
        });

        const actorTypes = [
            'human_male', 'human_female', 'child', 'elderly'
        ];

        actorTypes.forEach(type => {
            const option = this.uiFactory.createElement('option', {
                value: type,
                textContent: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            });
            selector.appendChild(option);
        });

        selector.onchange = () => {
            if (onActorChange) {
                onActorChange(selector.value);
            }
        };

        return selector;
    }

    /**
     * Create camera preset selector
     */
    createCameraSelector(onCameraChange) {
        const selector = this.uiFactory.createElement('select', {
            className: 'stage-select'
        });

        const cameraPresets = [
            'audience', 'overhead', 'stage_left', 'stage_right', 'close_up'
        ];

        cameraPresets.forEach(preset => {
            const option = this.uiFactory.createElement('option', {
                value: preset,
                textContent: preset.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            });
            selector.appendChild(option);
        });

        selector.onchange = () => {
            if (onCameraChange) {
                onCameraChange(selector.value);
            }
        };

        return selector;
    }

    /**
     * Create panel position selector
     */
    createPanelSelector(onPanelChange) {
        const selector = this.uiFactory.createElement('select', {
            className: 'stage-select'
        });

        const positions = ['Off', '1/4', '1/2', '3/4', 'Full'];

        positions.forEach((pos, index) => {
            const option = this.uiFactory.createElement('option', {
                value: index,
                textContent: pos
            });
            selector.appendChild(option);
        });

        selector.onchange = () => {
            if (onPanelChange) {
                onPanelChange(parseInt(selector.value));
            }
        };

        return selector;
    }

    /**
     * Create texture selector
     */
    createDefaultTextureSelector(onTextureChange) {
        const selector = this.uiFactory.createElement('select', {
            className: 'stage-select'
        });

        const textures = [
            'wood', 'marble', 'concrete', 'grass', 'stone', 'metal'
        ];

        textures.forEach(texture => {
            const option = this.uiFactory.createElement('option', {
                value: texture,
                textContent: texture.charAt(0).toUpperCase() + texture.slice(1)
            });
            selector.appendChild(option);
        });

        selector.onchange = () => {
            if (onTextureChange) {
                onTextureChange(selector.value);
            }
        };

        return selector;
    }

    /**
     * Create scale slider control
     */
    createScaleSlider(onScaleChange) {
        const sliderData = this.createSlider(0.1, 3.0, 1.0, 0.1, onScaleChange, {
            label: 'Scale:',
            formatter: (value) => `${value.toFixed(1)}x`
        });

        return sliderData.container;
    }

    /**
     * Create undo/redo button pair
     */
    createUndoRedoButtons(onUndo, onRedo) {
        const container = this.uiFactory.createElement('div', {
            className: 'undo-redo-container'
        });

        const undoButton = this.createButton('↶ Undo', onUndo, 'undo-button');
        const redoButton = this.createButton('↷ Redo', onRedo, 'redo-button');

        container.appendChild(undoButton);
        container.appendChild(redoButton);

        return { container, undoButton, redoButton };
    }

    /**
     * Create audio control panel
     */
    createAudioControls(onVolumeChange, onMute) {
        const container = this.uiFactory.createElement('div', {
            className: 'audio-controls'
        });

        const muteButton = this.createToggleButton('🔊', false, onMute, {
            activeText: '🔇'
        });

        const volumeSlider = this.createSlider(0, 1, 0.7, 0.1, onVolumeChange, {
            label: 'Volume:',
            formatter: (value) => `${Math.round(value * 100)}%`
        });

        container.appendChild(muteButton);
        container.appendChild(volumeSlider.container);

        return { container, muteButton, volumeSlider };
    }

    /**
     * Create a group container for related controls
     */
    createControlGroup(title, controls) {
        const group = this.uiFactory.createElement('div', {
            className: 'control-group'
        });

        if (title) {
            const titleElement = this.createLabel(title, 'group-title');
            group.appendChild(titleElement);
        }

        controls.forEach(control => {
            if (control) {
                group.appendChild(control);
            }
        });

        return group;
    }

    /**
     * Create a horizontal button group
     */
    createButtonGroup(buttons) {
        const group = this.uiFactory.createElement('div', {
            className: 'button-group horizontal'
        });

        buttons.forEach(buttonConfig => {
            const button = this.createButton(
                buttonConfig.text,
                buttonConfig.onClick,
                buttonConfig.className || ''
            );
            group.appendChild(button);
        });

        return group;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIControls;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.UIControls = UIControls;
}