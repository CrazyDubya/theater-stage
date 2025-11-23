/**
 * UI Enhancement Module
 * Applies modern styling and organization to the theater-stage interface
 */

class UIEnhancer {
    constructor() {
        this.initialized = false;
        this.collapsibleSections = new Map();
    }

    init() {
        if (this.initialized) return;

        // Wait for UI to be created
        setTimeout(() => {
            this.enhanceMenuToggle();
            this.enhanceButtons();
            this.addIconClasses();
            this.makeMenuCollapsible();
            this.enhanceInfoBox();
            this.initialized = true;
            console.log('UI Enhancements applied');
        }, 500);
    }

    enhanceMenuToggle() {
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.setAttribute('data-tooltip', 'Open/close control menu');
        }
    }

    enhanceButtons() {
        // Find all buttons and categorize them
        const buttons = document.querySelectorAll('button');

        buttons.forEach(button => {
            const text = button.textContent.toLowerCase();
            const id = button.id || '';

            // Add appropriate classes based on button function
            if (text.includes('place') || text.includes('add') || id.includes('place') || id.includes('add')) {
                button.classList.add('primary');
            } else if (text.includes('save') || text.includes('pickup') || text.includes('sit')) {
                // Success/action buttons (handled by CSS)
            } else if (text.includes('remove') || text.includes('delete') || text.includes('throw')) {
                // Danger buttons (handled by CSS)
            } else if (text.includes('toggle') || text.includes('show') || text.includes('hide')) {
                button.classList.add('secondary');
            }

            // Ensure minimum padding for better UX
            if (!button.style.cssText.includes('padding')) {
                button.style.padding = '8px 16px';
            }
        });
    }

    addIconClasses() {
        // Add icon classes to specific buttons by matching text content
        const iconMappings = [
            { pattern: /light|spotlight|footlight/i, class: 'icon-light' },
            { pattern: /camera/i, class: 'icon-camera' },
            { pattern: /prop/i, class: 'icon-prop' },
            { pattern: /actor/i, class: 'icon-actor' },
            { pattern: /save/i, class: 'icon-save' },
            { pattern: /load/i, class: 'icon-load' },
            { pattern: /undo/i, class: 'icon-undo' },
            { pattern: /redo/i, class: 'icon-redo' },
            { pattern: /curtain/i, class: 'icon-curtain' },
            { pattern: /platform/i, class: 'icon-platform' },
            { pattern: /rotate|rotation/i, class: 'icon-rotate' },
            { pattern: /trap.*door/i, class: 'icon-trapdoor' },
            { pattern: /texture|upload/i, class: 'icon-texture' },
            { pattern: /measure/i, class: 'icon-measure' },
            { pattern: /grid/i, class: 'icon-grid' },
            { pattern: /help|tutorial/i, class: 'icon-help' },
            { pattern: /setting/i, class: 'icon-settings' }
        ];

        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            const text = button.textContent;
            for (const { pattern, class: className } of iconMappings) {
                if (pattern.test(text)) {
                    button.classList.add('icon-button', className);
                    break;
                }
            }
        });
    }

    makeMenuCollapsible() {
        const uiContainer = document.getElementById('ui-container');
        if (!uiContainer) return;

        // Organize controls into logical sections
        const sections = this.organizeIntoSections();

        // Clear and rebuild UI with collapsible sections
        if (sections.length > 0) {
            this.rebuildUIWithSections(uiContainer, sections);
        }
    }

    organizeIntoSections() {
        // Define logical groupings (this is a basic implementation)
        // In a real scenario, you'd want to parse the existing DOM structure
        return [
            {
                title: '💡 Lighting & Atmosphere',
                id: 'lightingSection',
                expanded: true,
                controls: ['lighting', 'spotlight', 'footlight']
            },
            {
                title: '📷 Camera & View',
                id: 'cameraSection',
                expanded: true,
                controls: ['camera']
            },
            {
                title: '🧍 Actors & Props',
                id: 'actorsPropsSection',
                expanded: true,
                controls: ['actor', 'prop']
            },
            {
                title: '🎭 Stage Elements',
                id: 'stageSection',
                expanded: false,
                controls: ['curtain', 'platform', 'rotate', 'trap']
            },
            {
                title: '🖼️ Scenery & Textures',
                id: 'scenerySection',
                expanded: false,
                controls: ['scenery', 'texture', 'backdrop']
            },
            {
                title: '💾 Save & Load',
                id: 'saveLoadSection',
                expanded: false,
                controls: ['save', 'load']
            },
            {
                title: '🎮 Interactions',
                id: 'interactionSection',
                expanded: false,
                controls: ['interaction', 'pickup', 'throw', 'sit']
            },
            {
                title: '↶ Undo & Redo',
                id: 'undoRedoSection',
                expanded: false,
                controls: ['undo', 'redo']
            }
        ];
    }

    rebuildUIWithSections(container, sections) {
        // Note: This is a simplified version that adds section styling
        // The actual DOM restructuring would be complex and might break functionality
        // Instead, we'll add visual separators and headers

        // For now, just add some visual improvements without restructuring
        const allElements = Array.from(container.children);

        // Add dividers between major sections
        this.addVisualDividers(container);
    }

    addVisualDividers(container) {
        // Add subtle dividers between groups of controls
        const strongElements = container.querySelectorAll('strong');

        strongElements.forEach((strong, index) => {
            if (index > 0) {
                const divider = document.createElement('div');
                divider.className = 'control-divider';
                strong.parentElement.insertBefore(divider, strong.parentElement);
            }
        });
    }

    enhanceInfoBox() {
        const infoBox = document.getElementById('info');
        if (infoBox) {
            infoBox.classList.add('slide-in');
        }
    }

    // Helper function to create collapsible section
    createCollapsibleSection(title, id, expanded = true) {
        const section = document.createElement('div');
        section.className = 'control-section';
        section.id = id;

        const header = document.createElement('h3');
        header.textContent = title;
        if (expanded) {
            header.classList.add('expanded');
        }

        const content = document.createElement('div');
        content.className = 'control-content';
        if (expanded) {
            content.classList.add('expanded');
        }

        header.addEventListener('click', () => {
            const isExpanded = header.classList.toggle('expanded');
            content.classList.toggle('expanded');

            // Store state
            this.collapsibleSections.set(id, isExpanded);
            localStorage.setItem(`section-${id}`, isExpanded ? 'true' : 'false');
        });

        // Restore state from localStorage
        const savedState = localStorage.getItem(`section-${id}`);
        if (savedState !== null) {
            const shouldExpand = savedState === 'true';
            if (shouldExpand !== expanded) {
                header.click();
            }
        }

        section.appendChild(header);
        section.appendChild(content);

        return { section, content };
    }

    // Add button group helper
    createButtonGroup(buttons) {
        const group = document.createElement('div');
        group.className = 'button-group';
        buttons.forEach(button => group.appendChild(button));
        return group;
    }

    // Add status indicator
    createStatusIndicator(active = false) {
        const indicator = document.createElement('span');
        indicator.className = `status-indicator ${active ? 'status-active' : 'status-inactive'}`;
        return indicator;
    }
}

// Global instance
const uiEnhancer = new UIEnhancer();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => uiEnhancer.init());
} else {
    uiEnhancer.init();
}

// Expose for programmatic access
window.uiEnhancer = uiEnhancer;

// Helper to create button groups (useful for setupUI function in stage.js)
window.createButtonGroup = (...buttons) => {
    return uiEnhancer.createButtonGroup(buttons);
};

// Helper to create status indicators
window.createStatusIndicator = (active) => {
    return uiEnhancer.createStatusIndicator(active);
};
