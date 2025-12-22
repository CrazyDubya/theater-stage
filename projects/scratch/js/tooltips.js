/**
 * Tooltip System for Theater-Stage
 * Provides helpful hints for all UI controls
 */

class TooltipSystem {
    constructor() {
        this.tooltip = null;
        this.activeElement = null;
        this.showDelay = 500; // ms before tooltip appears
        this.hideDelay = 100; // ms after mouse leaves
        this.showTimer = null;
        this.hideTimer = null;

        // Tooltip content database
        this.tooltips = {
            // Menu toggle
            'menu-toggle': 'Open/close the control menu',

            // Lighting controls
            'lighting-preset': 'Choose from 5 lighting moods: Default, Day, Night, Sunset, or Dramatic',
            'spotlight-intensity': 'Adjust the brightness of stage spotlights',
            'footlight-toggle': 'Turn footlights (blue stage-front lights) on/off',

            // Prop controls
            'prop-select': 'Choose a prop type from the catalog (furniture, shapes, decorations)',
            'place-prop': 'Click to enter prop placement mode, then click on stage to place',
            'remove-prop': 'Delete the currently selected prop from the stage',

            // Actor controls
            'place-actor': 'Click to enter actor placement mode, then click on stage to place a humanoid figure',
            'remove-actor': 'Delete the currently selected actor from the stage',
            'toggle-markers': 'Show/hide stage position markers (USL, USC, USR, etc.)',

            // Stage element controls
            'toggle-curtains': 'Open or close the stage curtains',
            'move-platforms': 'Raise or lower the moveable platforms',
            'rotate-stage': 'Start/stop the rotating center stage platform',
            'toggle-trapdoors': 'Open or close the trap doors',
            'show-rotating': 'Show or hide the rotating stage platform',
            'show-trapdoors': 'Show or hide the trap door elements',

            // Scenery controls
            'backdrop-select': 'Choose a backdrop texture for scenery panels',
            'upload-texture': 'Upload your own image or video as a custom texture',

            // Camera controls
            'camera-preset': 'Jump to a preset camera angle (audience, overhead, stage left/right)',
            'camera-zoom': 'Adjust how close the camera is to the stage',
            'reset-camera': 'Return camera to default position and angle',

            // Save/Load controls
            'save-scene': 'Export your current stage setup as a JSON file',
            'load-scene': 'Import a previously saved scene from a JSON file',
            'load-preset': 'Load one of the pre-made scene templates',

            // Prop interaction controls
            'select-actor-interact': 'Choose which actor will perform the interaction',
            'select-prop-interact': 'Choose which prop to interact with',
            'pickup-prop': 'Make the actor pick up and hold the selected prop',
            'putdown-prop': 'Make the actor put down the prop they are holding',
            'throw-prop': 'Make the actor throw the prop they are holding',
            'sit-prop': 'Make the actor sit on the selected furniture',
            'stand-prop': 'Make the actor stand up from furniture',
            'toggle-state-prop': 'Toggle the prop state (e.g., turn lamp on/off, open/close door)',

            // Undo/Redo
            'undo-button': 'Undo the last action (Ctrl+Z)',
            'redo-button': 'Redo the last undone action (Ctrl+Y)',

            // Collision controls
            'toggle-collision-debug': 'Show/hide collision boundaries for debugging',
            'collision-enabled': 'Enable/disable collision detection system',

            // Grid and measurement
            'toggle-grid': 'Show/hide the stage grid for precise positioning',
            'toggle-measurement': 'Show/hide measurement tools and ruler',

            // Collaboration
            'collaboration-toggle': 'Join or leave a multi-user collaboration session',
            'chat-input': 'Send a message to other users in the collaboration session',
            'chat-send': 'Send your chat message'
        };
    }

    init() {
        this.createTooltipElement();
        this.attachGlobalListeners();
        this.scanForTooltips();

        // Re-scan periodically for dynamically added elements
        setInterval(() => this.scanForTooltips(), 2000);
    }

    createTooltipElement() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'global-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #2d3436 0%, #1a1a2e 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-family: Arial, sans-serif;
            pointer-events: none;
            z-index: 100000;
            opacity: 0;
            transition: opacity 0.2s ease;
            max-width: 250px;
            line-height: 1.4;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(68, 170, 255, 0.3);
        `;
        document.body.appendChild(this.tooltip);
    }

    attachGlobalListeners() {
        // Use event delegation for efficiency
        document.addEventListener('mouseover', (e) => this.handleMouseOver(e), true);
        document.addEventListener('mouseout', (e) => this.handleMouseOut(e), true);
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), true);
    }

    scanForTooltips() {
        // Add data-tooltip attributes to elements based on IDs
        Object.keys(this.tooltips).forEach(id => {
            const element = document.getElementById(id);
            if (element && !element.hasAttribute('data-tooltip')) {
                element.setAttribute('data-tooltip', this.tooltips[id]);
            }
        });

        // Also scan for elements that already have data-tooltip
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            if (!element.hasAttribute('data-tooltip-initialized')) {
                element.setAttribute('data-tooltip-initialized', 'true');
            }
        });
    }

    handleMouseOver(e) {
        const element = e.target.closest('[data-tooltip]');
        if (!element) return;

        clearTimeout(this.hideTimer);

        this.activeElement = element;
        const tooltipText = element.getAttribute('data-tooltip');

        if (!tooltipText) return;

        // Show tooltip after delay
        this.showTimer = setTimeout(() => {
            if (this.activeElement === element) {
                this.showTooltip(tooltipText);
            }
        }, this.showDelay);
    }

    handleMouseOut(e) {
        const element = e.target.closest('[data-tooltip]');
        if (!element || element !== this.activeElement) return;

        clearTimeout(this.showTimer);

        // Hide tooltip after delay
        this.hideTimer = setTimeout(() => {
            this.hideTooltip();
            this.activeElement = null;
        }, this.hideDelay);
    }

    handleMouseMove(e) {
        if (this.tooltip.style.opacity === '1') {
            this.positionTooltip(e.clientX, e.clientY);
        }
    }

    showTooltip(text) {
        this.tooltip.textContent = text;
        this.tooltip.style.opacity = '1';
    }

    hideTooltip() {
        this.tooltip.style.opacity = '0';
    }

    positionTooltip(x, y) {
        // Position tooltip near cursor
        const offset = 15;
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let left = x + offset;
        let top = y + offset;

        // Keep tooltip within viewport
        if (left + tooltipRect.width > window.innerWidth) {
            left = x - tooltipRect.width - offset;
        }
        if (top + tooltipRect.height > window.innerHeight) {
            top = y - tooltipRect.height - offset;
        }

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;
    }

    // Public method to add tooltip to any element
    addTooltip(element, text) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        if (element) {
            element.setAttribute('data-tooltip', text);
        }
    }

    // Public method to add tooltips in batch
    addTooltips(tooltipMap) {
        Object.entries(tooltipMap).forEach(([selector, text]) => {
            this.addTooltip(selector, text);
        });
    }
}

// Global instance
const tooltipSystem = new TooltipSystem();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tooltipSystem.init());
} else {
    tooltipSystem.init();
}

// Helper function to add tooltip to dynamically created elements
window.addTooltip = (element, text) => {
    tooltipSystem.addTooltip(element, text);
};

// Expose for programmatic access
window.tooltipSystem = tooltipSystem;
