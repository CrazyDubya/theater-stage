/**
 * UIFactory.js - Factory for creating standardized UI elements
 * 
 * Eliminates repetitive DOM creation patterns and provides consistent styling
 * across the entire application. Integrates with ResourceManager for proper
 * event listener cleanup.
 */

class UIFactory {
    static defaultStyles = {
        button: 'margin: 5px 0; padding: 5px 10px; cursor: pointer; width: 100%; background: #444; color: white; border: 1px solid #666; border-radius: 3px;',
        buttonSmall: 'margin: 5px 2px; padding: 5px 10px; cursor: pointer; width: 48%; background: #444; color: white; border: 1px solid #666; border-radius: 3px;',
        select: 'width: 100%; margin: 5px 0; padding: 5px; background: #333; color: white; border: 1px solid #666; border-radius: 3px;',
        label: 'margin-bottom: 5px; color: white;',
        container: 'padding: 15px; max-height: calc(100vh - 140px); overflow-y: auto;',
        dialog: 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 10000;',
        dialogContent: 'background: #222; padding: 20px; border-radius: 8px; max-width: 500px; max-height: 80vh; overflow-y: auto; color: white;'
    };
    
    static createButton(text, onClick, options = {}) {
        const button = document.createElement('button');
        button.textContent = text;
        
        const style = options.small ? this.defaultStyles.buttonSmall : this.defaultStyles.button;
        button.style.cssText = style + (options.styles || '');
        
        if (onClick) {
            button.addEventListener('click', onClick);
            // Register with ResourceManager if available
            if (typeof window !== 'undefined' && window.resourceManager) {
                window.resourceManager.addEventListenerManaged(button, 'click', onClick);
            }
        }
        
        if (options.id) button.id = options.id;
        if (options.disabled) button.disabled = true;
        
        return button;
    }
    
    static createSelect(items, onChange, options = {}) {
        const select = document.createElement('select');
        select.style.cssText = this.defaultStyles.select + (options.styles || '');
        
        // Handle grouped options or simple options
        if (options.grouped) {
            // Items is an object with category keys
            // Safety check for items
            if (!items || typeof items !== 'object') {
                console.warn('UIFactory.createSelect: grouped items is not an object:', items);
                items = {};
            }
            
            Object.entries(items).forEach(([category, categoryItems]) => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);
                
                categoryItems.forEach(item => {
                    const option = this.createOption(
                        typeof item === 'string' ? item : item.value,
                        typeof item === 'string' ? item : item.label
                    );
                    optgroup.appendChild(option);
                });
                
                select.appendChild(optgroup);
            });
        } else {
            // Simple array of options
            // Safety check for items
            if (!items || !Array.isArray(items)) {
                console.warn('UIFactory.createSelect: items is not an array:', items);
                // If it's an object, convert to array of keys
                if (typeof items === 'object') {
                    items = Object.keys(items);
                } else {
                    items = [];
                }
            }
            
            items.forEach(item => {
                const option = this.createOption(
                    typeof item === 'string' ? item : item.value,
                    typeof item === 'string' ? item : item.label
                );
                select.appendChild(option);
            });
        }
        
        if (onChange) {
            select.addEventListener('change', onChange);
            // Register with ResourceManager if available
            if (typeof window !== 'undefined' && window.resourceManager) {
                window.resourceManager.addEventListenerManaged(select, 'change', onChange);
            }
        }
        
        if (options.id) select.id = options.id;
        if (options.value) select.value = options.value;
        
        return select;
    }
    
    static createOption(value, text) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        return option;
    }
    
    static createLabel(text, options = {}) {
        const label = document.createElement('div');
        label.innerHTML = options.bold !== false ? `<strong>${text}</strong>` : text;
        label.style.cssText = this.defaultStyles.label + (options.styles || '');
        
        if (options.id) label.id = options.id;
        
        return label;
    }
    
    static createContainer(options = {}) {
        const container = document.createElement('div');
        container.style.cssText = this.defaultStyles.container + (options.styles || '');
        
        if (options.id) container.id = options.id;
        
        return container;
    }
    
    static createSpacer(height = '10px') {
        const spacer = document.createElement('div');
        spacer.style.cssText = `height: ${height};`;
        return spacer;
    }
    
    static createPanel(elements) {
        const panel = document.createElement('div');
        
        elements.forEach(element => {
            if (typeof element === 'string') {
                // Spacer with height
                panel.appendChild(this.createSpacer(element));
            } else if (element) {
                panel.appendChild(element);
            }
        });
        
        return panel;
    }
    
    static createDialog(content, options = {}) {
        const overlay = document.createElement('div');
        overlay.style.cssText = this.defaultStyles.dialog;
        
        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = this.defaultStyles.dialogContent + (options.styles || '');
        
        if (typeof content === 'string') {
            dialogContent.innerHTML = content;
        } else {
            dialogContent.appendChild(content);
        }
        
        overlay.appendChild(dialogContent);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && options.onClose) {
                options.onClose();
            }
        });
        
        return { overlay, content: dialogContent };
    }
    
    static createNotification(text, type = 'info') {
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 10001;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = text;
        
        return notification;
    }
}

// For browser compatibility - make available immediately
if (typeof window !== 'undefined') {
    window.UIFactory = UIFactory;
    console.log('UIFactory loaded - available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIFactory;
}