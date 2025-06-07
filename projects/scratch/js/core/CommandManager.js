/**
 * CommandManager.js - Command Pattern Implementation for Undo/Redo Functionality
 * 
 * Provides a robust undo/redo system for the 3D Theater Stage application.
 * Tracks all user actions as reversible commands and maintains command history.
 * 
 * Supported commands:
 * - Object placement/removal (props and actors)
 * - Object movement and transformation
 * - Scenery panel positioning
 * - Lighting changes
 * - Stage element modifications
 * - Texture applications
 */

class StageCommandManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = 50; // Limit memory usage
        
        // Track command types for statistics
        this.commandStats = {
            executed: 0,
            undone: 0,
            redone: 0
        };
        
        console.log('CommandManager: Initialized');
    }

    /**
     * Execute a new command and add it to history
     */
    async executeCommand(command) {
        try {
            // Execute the command
            await command.execute();
            
            // Remove any commands after current index (they're now invalidated)
            this.history = this.history.slice(0, this.currentIndex + 1);
            
            // Add new command to history
            this.history.push(command);
            this.currentIndex++;
            
            // Limit history size
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
                this.currentIndex--;
            }
            
            this.commandStats.executed++;
            this.updateUIButtons();
            
            console.log(`Command executed: ${command.constructor.name}`, command.getDescription());
            
        } catch (error) {
            console.error('Failed to execute command:', error);
            throw error;
        }
    }

    /**
     * Undo the last command
     */
    undo() {
        if (!this.canUndo()) {
            console.log('Nothing to undo');
            return false;
        }

        try {
            const command = this.history[this.currentIndex];
            command.undo();
            this.currentIndex--;
            
            this.commandStats.undone++;
            this.updateUIButtons();
            
            console.log(`Command undone: ${command.constructor.name}`, command.getDescription());
            return true;
            
        } catch (error) {
            console.error('Failed to undo command:', error);
            return false;
        }
    }

    /**
     * Redo the next command
     */
    redo() {
        if (!this.canRedo()) {
            console.log('Nothing to redo');
            return false;
        }

        try {
            this.currentIndex++;
            const command = this.history[this.currentIndex];
            command.execute();
            
            this.commandStats.redone++;
            this.updateUIButtons();
            
            console.log(`Command redone: ${command.constructor.name}`, command.getDescription());
            return true;
            
        } catch (error) {
            console.error('Failed to redo command:', error);
            this.currentIndex--;
            return false;
        }
    }

    /**
     * Check if undo is possible
     */
    canUndo() {
        return this.currentIndex >= 0;
    }

    /**
     * Check if redo is possible
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Clear command history
     */
    clearHistory() {
        this.history = [];
        this.currentIndex = -1;
        this.updateUIButtons();
        console.log('Command history cleared');
    }

    /**
     * Get command history information
     */
    getHistoryInfo() {
        return {
            totalCommands: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            stats: { ...this.commandStats }
        };
    }

    /**
     * Update UI button states
     */
    updateUIButtons() {
        if (window.stageUIManager && typeof window.stageUIManager.updateUndoRedoButtons === 'function') {
            window.stageUIManager.updateUndoRedoButtons();
        }
    }

    /**
     * Get recent command descriptions for debugging
     */
    getRecentCommands(count = 5) {
        const start = Math.max(0, this.currentIndex - count + 1);
        const end = this.currentIndex + 1;
        return this.history.slice(start, end).map((cmd, index) => ({
            index: start + index,
            name: cmd.constructor.name,
            description: cmd.getDescription(),
            current: start + index === this.currentIndex
        }));
    }
}

/**
 * Base Command class - all commands should extend this
 */
class Command {
    constructor() {
        this.timestamp = Date.now();
    }

    execute() {
        throw new Error('Command must implement execute() method');
    }

    undo() {
        throw new Error('Command must implement undo() method');
    }

    getDescription() {
        return 'Generic command';
    }
}

/**
 * Add Object Command - for placing props and actors
 */
class AddObjectCommand extends Command {
    constructor(objectType, objectData, position) {
        super();
        this.objectType = objectType; // 'prop' or 'actor'
        this.objectData = objectData; // type, id, etc.
        this.position = { ...position };
        this.createdObject = null;
    }

    async execute() {
        if (this.objectType === 'prop') {
            this.createdObject = window.threeObjectFactory.addPropAt(
                this.position.x, 
                this.position.z, 
                this.objectData.type
            );
        } else if (this.objectType === 'actor') {
            this.createdObject = await window.threeObjectFactory.addActorAt(
                this.position.x, 
                this.position.z, 
                this.objectData.type
            );
        }

        if (!this.createdObject) {
            throw new Error(`Failed to create ${this.objectType}`);
        }

        // Store the actual ID for undo
        this.objectId = this.createdObject.userData.id;
    }

    undo() {
        if (this.createdObject) {
            // Find and remove the object
            const scene = window.stageState.core.scene;
            const objectArray = this.objectType === 'prop' ? 
                window.stageState.objects.props : 
                window.stageState.objects.actors;

            const index = objectArray.indexOf(this.createdObject);
            if (index > -1) {
                objectArray.splice(index, 1);
            }

            scene.remove(this.createdObject);
            window.resourceManager.disposeObject(this.createdObject);
            this.createdObject = null;
        }
    }

    getDescription() {
        return `Add ${this.objectType} (${this.objectData.type}) at (${this.position.x}, ${this.position.z})`;
    }
}

/**
 * Move Object Command - for moving objects
 */
class MoveObjectCommand extends Command {
    constructor(object, oldPosition, newPosition) {
        super();
        this.objectId = object.userData.id;
        this.oldPosition = { ...oldPosition };
        this.newPosition = { ...newPosition };
    }

    execute() {
        const object = this.findObjectById(this.objectId);
        if (object) {
            object.position.set(this.newPosition.x, this.newPosition.y, this.newPosition.z);
        }
    }

    undo() {
        const object = this.findObjectById(this.objectId);
        if (object) {
            object.position.set(this.oldPosition.x, this.oldPosition.y, this.oldPosition.z);
        }
    }

    findObjectById(id) {
        const allObjects = [
            ...window.stageState.objects.props,
            ...window.stageState.objects.actors
        ];
        return allObjects.find(obj => obj.userData.id === id);
    }

    getDescription() {
        return `Move object ${this.objectId} from (${this.oldPosition.x}, ${this.oldPosition.z}) to (${this.newPosition.x}, ${this.newPosition.z})`;
    }
}

/**
 * Scenery Position Command - for moving scenery panels
 */
class SceneryPositionCommand extends Command {
    constructor(panelIndex, oldPosition, newPosition) {
        super();
        this.panelIndex = panelIndex;
        this.oldPosition = oldPosition;
        this.newPosition = newPosition;
    }

    execute() {
        window.moveSceneryToPosition(this.panelIndex, this.newPosition);
    }

    undo() {
        window.moveSceneryToPosition(this.panelIndex, this.oldPosition);
    }

    getDescription() {
        const panelName = this.panelIndex === 0 ? 'backdrop' : 'midstage';
        return `Move ${panelName} from ${this.oldPosition * 100}% to ${this.newPosition * 100}%`;
    }
}

/**
 * Lighting Change Command - for lighting preset changes
 */
class LightingChangeCommand extends Command {
    constructor(oldPreset, newPreset) {
        super();
        this.oldPreset = oldPreset;
        this.newPreset = newPreset;
    }

    execute() {
        if (window.threeStageBuilder) {
            window.threeStageBuilder.applyLightingPreset(this.newPreset);
        }
    }

    undo() {
        if (window.threeStageBuilder) {
            window.threeStageBuilder.applyLightingPreset(this.oldPreset);
        }
    }

    getDescription() {
        return `Change lighting from ${this.oldPreset} to ${this.newPreset}`;
    }
}

/**
 * Texture Application Command - for applying textures to panels
 */
class TextureApplicationCommand extends Command {
    constructor(panelIndex, oldTexture, newTexture, textureType) {
        super();
        this.panelIndex = panelIndex;
        this.oldTexture = oldTexture; // null or previous texture
        this.newTexture = newTexture;
        this.textureType = textureType; // 'default' or 'custom'
    }

    execute() {
        if (this.textureType === 'default') {
            window.applyDefaultTexture(this.newTexture);
        } else {
            // Custom texture application would need to be implemented
            console.log('Custom texture redo not yet implemented');
        }
    }

    undo() {
        if (this.oldTexture) {
            if (this.textureType === 'default') {
                window.applyDefaultTexture(this.oldTexture);
            }
        } else {
            // Remove texture
            window.stageTextureManager.removeTextureFromPanel(this.panelIndex);
        }
    }

    getDescription() {
        const panelName = this.panelIndex === 0 ? 'backdrop' : 'midstage';
        return `Apply ${this.newTexture} texture to ${panelName}`;
    }
}

// Create global command manager instance
const stageCommandManager = new StageCommandManager();

// Export for browser compatibility
if (typeof window !== 'undefined') {
    window.stageCommandManager = stageCommandManager;
    window.commandManager = stageCommandManager; // Alias for compatibility
    
    // Export command classes for use elsewhere
    window.Command = Command;
    window.AddObjectCommand = AddObjectCommand;
    window.MoveObjectCommand = MoveObjectCommand;
    window.SceneryPositionCommand = SceneryPositionCommand;
    window.LightingChangeCommand = LightingChangeCommand;
    window.TextureApplicationCommand = TextureApplicationCommand;
    
    console.log('CommandManager loaded - undo/redo system ready');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        stageCommandManager, 
        StageCommandManager,
        Command,
        AddObjectCommand,
        MoveObjectCommand,
        SceneryPositionCommand,
        LightingChangeCommand,
        TextureApplicationCommand
    };
}