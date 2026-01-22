/**
 * Interactive Onboarding Tutorial System
 * Guides new users through the theater-stage platform features
 */

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.overlay = null;
        this.modal = null;
        this.highlight = null;

        this.steps = [
            {
                title: "Welcome to Theater-Stage! 🎭",
                content: "This interactive 3D theater platform helps you design stage layouts, block scenes, and collaborate in real-time. Let's take a quick tour!",
                target: null,
                position: 'center',
                actions: ['Skip Tour', 'Start Tour']
            },
            {
                title: "Camera Controls",
                content: "<strong>Navigate the 3D space:</strong><br>• <strong>Left Click + Drag:</strong> Rotate camera<br>• <strong>Scroll Wheel:</strong> Zoom in/out<br>• <strong>Right Click + Drag:</strong> Pan camera<br><br>Try it now!",
                target: '#info',
                position: 'bottom',
                actions: ['Next']
            },
            {
                title: "Control Menu",
                content: "Click the hamburger menu (☰) to access all controls. This is your main hub for stage management, lighting, props, and more.",
                target: '#menuToggle',
                position: 'right',
                highlight: true,
                actions: ['Next']
            },
            {
                title: "Adding Actors",
                content: "Actors are the humanoid figures on stage. Click 'Add Actor' to place one on stage. Actors can be positioned anywhere and interact with props.",
                target: '#actorControls',
                position: 'right',
                actions: ['Next']
            },
            {
                title: "Adding Props",
                content: "Props include furniture, set pieces, and decorative items. Select a prop type from the catalog, then click 'Add Prop' to place it on stage.",
                target: '#propControls',
                position: 'right',
                actions: ['Next']
            },
            {
                title: "Lighting Control",
                content: "Control the stage atmosphere with 5 lighting presets (Default, Day, Night, Sunset, Dramatic). Adjust spotlights and footlights for dramatic effect.",
                target: '#lightingControls',
                position: 'right',
                actions: ['Next']
            },
            {
                title: "Camera Presets",
                content: "Quickly switch between common viewpoints: Audience View, Overhead, Stage Left/Right, and Close-up. Perfect for visualizing different perspectives.",
                target: '#cameraControls',
                position: 'right',
                actions: ['Next']
            },
            {
                title: "Save & Load Scenes",
                content: "Save your work as JSON files to preserve your stage setup. Load saved scenes or use preset templates to get started quickly.",
                target: '#saveLoadControls',
                position: 'right',
                actions: ['Next']
            },
            {
                title: "Collaboration",
                content: "Work together in real-time! Click 'Join Collaboration' to connect with others. Share a room ID and collaborate as Director, Actor, or Viewer.",
                target: '#collaboration-toggle',
                position: 'left',
                highlight: true,
                actions: ['Next']
            },
            {
                title: "Keyboard Shortcuts",
                content: "Power users can press <strong>?</strong> or <strong>H</strong> to view all keyboard shortcuts. This speeds up your workflow significantly!",
                target: null,
                position: 'center',
                actions: ['Next']
            },
            {
                title: "You're Ready! 🎉",
                content: "You now know the basics of Theater-Stage! Experiment with different features, save your work, and don't hesitate to explore. Click 'Show Tutorial' in the menu anytime to review.",
                target: null,
                position: 'center',
                actions: ['Start Creating!']
            }
        ];
    }

    // Initialize tutorial system
    init() {
        // Create tutorial elements
        this.createElements();

        // Check if user has seen tutorial before
        const tutorialCompleted = localStorage.getItem('theater-stage-tutorial-completed');

        // Auto-show tutorial for new users (after a brief delay)
        if (!tutorialCompleted) {
            setTimeout(() => {
                this.start();
            }, 1000);
        }

        // Add tutorial button to menu
        this.addMenuButton();
    }

    // Create DOM elements for tutorial
    createElements() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            display: none;
        `;
        document.body.appendChild(this.overlay);

        // Highlight box
        this.highlight = document.createElement('div');
        this.highlight.id = 'tutorial-highlight';
        this.highlight.style.cssText = `
            position: fixed;
            border: 3px solid #4af;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(68, 170, 255, 0.6);
            pointer-events: none;
            z-index: 9999;
            display: none;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(this.highlight);

        // Modal
        this.modal = document.createElement('div');
        this.modal.id = 'tutorial-modal';
        this.modal.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 500px;
            z-index: 10000;
            display: none;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(68, 170, 255, 0.3);
        `;
        this.modal.innerHTML = `
            <div id="tutorial-progress" style="display: flex; gap: 5px; margin-bottom: 20px;"></div>
            <h2 id="tutorial-title" style="margin: 0 0 15px 0; color: #4af; font-size: 24px;"></h2>
            <div id="tutorial-content" style="line-height: 1.6; margin-bottom: 25px; font-size: 16px;"></div>
            <div id="tutorial-actions" style="display: flex; gap: 10px; justify-content: flex-end;"></div>
        `;
        document.body.appendChild(this.modal);

        // Close tutorial on overlay click
        this.overlay.addEventListener('click', () => {
            if (this.currentStep === 0 || this.currentStep === this.steps.length - 1) {
                this.end();
            }
        });
    }

    // Add "Show Tutorial" button to control menu
    addMenuButton() {
        // Wait for menu to be created, then add button
        const checkMenu = setInterval(() => {
            const menu = document.getElementById('controlMenu');
            if (menu) {
                clearInterval(checkMenu);

                // Create tutorial section in menu
                const tutorialSection = document.createElement('div');
                tutorialSection.innerHTML = `
                    <div class="control-section">
                        <h3 onclick="toggleSection('tutorialControls')">📚 Help & Tutorial</h3>
                        <div id="tutorialControls" class="control-content">
                            <button onclick="tutorial.start()" class="control-button">Show Tutorial</button>
                            <button onclick="tutorial.showShortcuts()" class="control-button">Keyboard Shortcuts</button>
                        </div>
                    </div>
                `;

                // Insert at the top of the menu
                const firstSection = menu.querySelector('.control-section');
                if (firstSection) {
                    menu.insertBefore(tutorialSection.firstElementChild, firstSection);
                } else {
                    menu.appendChild(tutorialSection.firstElementChild);
                }
            }
        }, 100);
    }

    // Start tutorial from beginning
    start() {
        this.currentStep = 0;
        this.isActive = true;
        this.overlay.style.display = 'block';
        this.showStep();
    }

    // End tutorial
    end() {
        this.isActive = false;
        this.overlay.style.display = 'none';
        this.modal.style.display = 'none';
        this.highlight.style.display = 'none';

        // Mark tutorial as completed
        localStorage.setItem('theater-stage-tutorial-completed', 'true');
    }

    // Show current step
    showStep() {
        const step = this.steps[this.currentStep];

        // Update modal content
        document.getElementById('tutorial-title').innerHTML = step.title;
        document.getElementById('tutorial-content').innerHTML = step.content;

        // Update progress dots
        this.updateProgress();

        // Update action buttons
        this.updateActions(step.actions);

        // Position modal
        this.positionModal(step);

        // Show/hide highlight
        if (step.highlight && step.target) {
            this.showHighlight(step.target);
        } else {
            this.highlight.style.display = 'none';
        }

        // Show modal
        this.modal.style.display = 'block';
    }

    // Update progress indicator
    updateProgress() {
        const progressContainer = document.getElementById('tutorial-progress');
        progressContainer.innerHTML = '';

        this.steps.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.style.cssText = `
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: ${index === this.currentStep ? '#4af' : 'rgba(255, 255, 255, 0.3)'};
                transition: background 0.3s ease;
            `;
            progressContainer.appendChild(dot);
        });
    }

    // Update action buttons
    updateActions(actions) {
        const actionsContainer = document.getElementById('tutorial-actions');
        actionsContainer.innerHTML = '';

        actions.forEach((actionText, index) => {
            const button = document.createElement('button');
            button.textContent = actionText;
            button.className = 'btn';
            button.style.cssText = `
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.2s ease;
            `;

            if (index === actions.length - 1) {
                // Primary button
                button.style.background = 'linear-gradient(135deg, #4af 0%, #2d9cdb 100%)';
                button.style.color = 'white';
                button.onmouseover = () => button.style.transform = 'scale(1.05)';
                button.onmouseout = () => button.style.transform = 'scale(1)';

                if (actionText === 'Start Tour') {
                    button.onclick = () => this.next();
                } else if (actionText === 'Start Creating!') {
                    button.onclick = () => this.end();
                } else {
                    button.onclick = () => this.next();
                }
            } else {
                // Secondary button
                button.style.background = 'rgba(255, 255, 255, 0.1)';
                button.style.color = 'white';
                button.style.border = '1px solid rgba(255, 255, 255, 0.3)';
                button.onmouseover = () => button.style.background = 'rgba(255, 255, 255, 0.2)';
                button.onmouseout = () => button.style.background = 'rgba(255, 255, 255, 0.1)';

                if (actionText === 'Skip Tour') {
                    button.onclick = () => this.end();
                }
            }

            actionsContainer.appendChild(button);
        });
    }

    // Position modal based on target and position hint
    positionModal(step) {
        if (!step.target || step.position === 'center') {
            // Center modal
            this.modal.style.top = '50%';
            this.modal.style.left = '50%';
            this.modal.style.transform = 'translate(-50%, -50%)';
            this.modal.style.right = 'auto';
            this.modal.style.bottom = 'auto';
            return;
        }

        const target = document.querySelector(step.target);
        if (!target) {
            // Fallback to center if target not found
            this.modal.style.top = '50%';
            this.modal.style.left = '50%';
            this.modal.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = target.getBoundingClientRect();
        this.modal.style.transform = 'none';

        switch (step.position) {
            case 'right':
                this.modal.style.left = `${rect.right + 20}px`;
                this.modal.style.top = `${rect.top}px`;
                this.modal.style.right = 'auto';
                this.modal.style.bottom = 'auto';
                break;
            case 'left':
                this.modal.style.right = `${window.innerWidth - rect.left + 20}px`;
                this.modal.style.top = `${rect.top}px`;
                this.modal.style.left = 'auto';
                this.modal.style.bottom = 'auto';
                break;
            case 'bottom':
                this.modal.style.left = `${rect.left}px`;
                this.modal.style.top = `${rect.bottom + 20}px`;
                this.modal.style.right = 'auto';
                this.modal.style.bottom = 'auto';
                break;
            case 'top':
                this.modal.style.left = `${rect.left}px`;
                this.modal.style.bottom = `${window.innerHeight - rect.top + 20}px`;
                this.modal.style.top = 'auto';
                this.modal.style.right = 'auto';
                break;
        }
    }

    // Show highlight around target element
    showHighlight(selector) {
        const target = document.querySelector(selector);
        if (!target) {
            this.highlight.style.display = 'none';
            return;
        }

        const rect = target.getBoundingClientRect();
        this.highlight.style.display = 'block';
        this.highlight.style.left = `${rect.left - 5}px`;
        this.highlight.style.top = `${rect.top - 5}px`;
        this.highlight.style.width = `${rect.width + 10}px`;
        this.highlight.style.height = `${rect.height + 10}px`;
    }

    // Move to next step
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            this.end();
        }
    }

    // Move to previous step
    previous() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep();
        }
    }

    // Show keyboard shortcuts overlay
    showShortcuts() {
        const shortcutsModal = document.createElement('div');
        shortcutsModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            max-width: 600px;
            z-index: 10001;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(68, 170, 255, 0.3);
            max-height: 80vh;
            overflow-y: auto;
        `;

        shortcutsModal.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #4af;">⌨️ Keyboard Shortcuts</h2>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; line-height: 1.8;">
                <div style="font-weight: bold; color: #4af;">Camera</div>
                <div></div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Mouse Drag</kbd></div>
                <div>Rotate camera</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Scroll</kbd></div>
                <div>Zoom in/out</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Right Click</kbd></div>
                <div>Pan camera</div>

                <div style="font-weight: bold; color: #4af; margin-top: 15px;">View Presets</div>
                <div></div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">1</kbd></div>
                <div>Audience View</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">2</kbd></div>
                <div>Overhead View</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">3</kbd></div>
                <div>Stage Left View</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">4</kbd></div>
                <div>Stage Right View</div>

                <div style="font-weight: bold; color: #4af; margin-top: 15px;">Lighting</div>
                <div></div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">L</kbd></div>
                <div>Cycle lighting presets</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Shift+L</kbd></div>
                <div>Toggle spotlights</div>

                <div style="font-weight: bold; color: #4af; margin-top: 15px;">Actions</div>
                <div></div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Ctrl+Z</kbd></div>
                <div>Undo</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Ctrl+Y</kbd></div>
                <div>Redo</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Ctrl+S</kbd></div>
                <div>Save scene</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Delete</kbd></div>
                <div>Remove selected object</div>

                <div style="font-weight: bold; color: #4af; margin-top: 15px;">Help</div>
                <div></div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">?</kbd> or <kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">H</kbd></div>
                <div>Show this shortcut list</div>
                <div><kbd style="background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 3px;">Esc</kbd></div>
                <div>Close dialogs / Cancel action</div>
            </div>
            <div style="margin-top: 25px; text-align: right;">
                <button onclick="this.parentElement.parentElement.remove(); document.getElementById('shortcuts-overlay').remove();" class="btn" style="padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; background: linear-gradient(135deg, #4af 0%, #2d9cdb 100%); color: white; font-weight: bold;">Close</button>
            </div>
        `;

        const overlay = document.createElement('div');
        overlay.id = 'shortcuts-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
        `;
        overlay.onclick = () => {
            shortcutsModal.remove();
            overlay.remove();
        };

        document.body.appendChild(overlay);
        document.body.appendChild(shortcutsModal);
    }
}

// Global instance
const tutorial = new TutorialSystem();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => tutorial.init());
} else {
    tutorial.init();
}
