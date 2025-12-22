# Theater-Stage API Documentation

**Version:** 2.0
**Last Updated:** 2025-11-23

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Systems API](#core-systems-api)
4. [Advanced Features API](#advanced-features-api)
5. [Integration Patterns](#integration-patterns)
6. [Event System](#event-system)
7. [Data Formats](#data-formats)
8. [Developer Setup](#developer-setup)
9. [TypeScript Definitions](#typescript-definitions)
10. [Examples & Recipes](#examples--recipes)

---

## Overview

Theater-Stage provides a comprehensive JavaScript API for programmatic control of 3D theater scenes. All major systems are accessible via the global `window` object.

### Global API Objects

```javascript
window.scene           // THREE.Scene instance
window.camera          // THREE.PerspectiveCamera
window.renderer        // THREE.WebGLRenderer
window.stage           // THREE.Group (current stage)
window.actors          // Array of actor objects
window.props           // Array of prop objects
window.selectedObjects // Array of currently selected objects

// System managers
window.tutorialSystem       // TutorialSystem instance
window.tooltipSystem        // TooltipSystem instance
window.uiEnhancer          // UIEnhancer instance
window.animationTimeline   // AnimationTimeline instance
window.soundSystem         // SoundSystem instance
window.stageTypeManager    // StageTypeManager instance
window.errorHandler        // ErrorHandler instance
```

---

## Architecture

### System Initialization Order

```
1. Three.js core (scene, camera, renderer)
2. ErrorHandler (global error catching)
3. TooltipSystem (UI tooltips)
4. UIEnhancer (UI improvements)
5. CollaborationManager (multi-user support)
6. Stage initialization (stage.js)
7. ExpandedPropLibrary (prop definitions)
8. AnimationTimeline (choreography system)
9. SoundSystem (audio management)
10. StageTypeManager (stage configurations)
11. SaveLoadManager (persistence)
12. TutorialSystem (onboarding)
```

### Module Dependencies

```
ErrorHandler → (no dependencies, loads first)
TooltipSystem → DOM
UIEnhancer → DOM, tooltipSystem
AnimationTimeline → scene, actors, props
SoundSystem → Web Audio API
StageTypeManager → scene, stage, THREE
TutorialSystem → all systems (loads last)
```

---

## Core Systems API

### 1. ErrorHandler

**Location:** `js/error-handler.js`
**Global Instance:** `window.errorHandler`

#### Methods

```javascript
// Log messages
errorHandler.log(message, data = null)
errorHandler.warn(message, data = null)
errorHandler.error(message, error = null)
errorHandler.info(message, data = null)

// Wrap functions for safe execution
const safeFunction = errorHandler.safe(myFunction, context);

// Clear logs
errorHandler.clearLogs()

// Export logs as JSON
const logsData = errorHandler.exportLogs()

// Get log statistics
const stats = errorHandler.getStats()
// Returns: { total: 42, error: 5, warn: 10, info: 27 }
```

#### Configuration

```javascript
errorHandler.maxLogs = 1000;           // Maximum stored logs
errorHandler.enableNotifications = true; // Show UI notifications
errorHandler.enableConsole = true;     // Allow console output
errorHandler.notificationDuration = 5000; // Auto-hide delay (ms)
```

#### Example: Safe Function Wrapper

```javascript
// Wrap a function to catch errors
function riskyOperation(data) {
    // Might throw errors
    return processData(data);
}

const safeOperation = errorHandler.safe(riskyOperation);

// Call it - errors are caught and logged
const result = safeOperation(myData);
if (result === null) {
    console.log('Operation failed, check error logs');
}
```

---

### 2. TutorialSystem

**Location:** `js/tutorial.js`
**Global Instance:** `window.tutorialSystem`

#### Methods

```javascript
// Tutorial control
tutorialSystem.start()                  // Start from beginning
tutorialSystem.next()                   // Advance to next step
tutorialSystem.previous()               // Go to previous step
tutorialSystem.skip()                   // End tutorial
tutorialSystem.goToStep(stepIndex)      // Jump to specific step

// State management
tutorialSystem.isCompleted()            // Returns boolean
tutorialSystem.reset()                  // Reset completion status
```

#### Properties

```javascript
tutorialSystem.currentStep              // Current step index (0-based)
tutorialSystem.steps                    // Array of tutorial step objects
```

#### Tutorial Step Object

```javascript
{
    title: "Step Title",
    content: "HTML content for the step",
    target: "#element-id",              // CSS selector or null
    position: 'bottom',                 // 'top', 'bottom', 'left', 'right', 'center'
    actions: ['Previous', 'Next']       // Button labels
}
```

#### Example: Custom Tutorial

```javascript
// Create custom tutorial steps
const customTutorial = new TutorialSystem();
customTutorial.steps = [
    {
        title: "Welcome",
        content: "This is a custom tutorial",
        target: null,
        position: 'center',
        actions: ['Start']
    },
    {
        title: "Camera Controls",
        content: "Use mouse to rotate the view",
        target: '#canvas-container',
        position: 'center',
        actions: ['Previous', 'Next']
    }
];

customTutorial.start();
```

---

### 3. TooltipSystem

**Location:** `js/tooltips.js`
**Global Instance:** `window.tooltipSystem`

#### Methods

```javascript
// Add/remove tooltips
tooltipSystem.addTooltip(elementId, text)
tooltipSystem.removeTooltip(elementId)

// Show/hide programmatically
tooltipSystem.showTooltip(text, x, y)
tooltipSystem.hideTooltip()

// Enable/disable system
tooltipSystem.enable()
tooltipSystem.disable()
```

#### Configuration

```javascript
tooltipSystem.enabled = true;           // Master enable/disable
tooltipSystem.showDelay = 500;          // Delay before showing (ms)
```

#### Example: Dynamic Tooltips

```javascript
// Add tooltip to dynamically created element
const button = document.createElement('button');
button.id = 'my-custom-button';
button.textContent = 'Custom Action';
document.body.appendChild(button);

tooltipSystem.addTooltip('my-custom-button', 'Click to perform custom action');

// Show tooltip at specific position
tooltipSystem.showTooltip('Custom message', mouseX, mouseY);
```

---

### 4. UIEnhancer

**Location:** `js/ui-enhancements.js`
**Global Instance:** `window.uiEnhancer`

#### Methods

```javascript
// Re-apply enhancements (after DOM changes)
uiEnhancer.enhanceButtons()
uiEnhancer.addCollapsibleSections()
uiEnhancer.addIconsToButtons()
uiEnhancer.improveColorPickers()
```

#### Example: Enhance New UI Elements

```javascript
// After adding new buttons to DOM
const newButton = document.createElement('button');
newButton.textContent = 'Add Actor';
document.querySelector('#controls').appendChild(newButton);

// Re-apply enhancements
uiEnhancer.enhanceButtons();
```

---

## Advanced Features API

### 5. AnimationTimeline

**Location:** `js/animation-timeline.js`
**Global Instance:** `window.animationTimeline`

#### Methods

```javascript
// Playback control
animationTimeline.play()                // Start playback
animationTimeline.pause()               // Pause playback
animationTimeline.stop()                // Stop and reset
animationTimeline.seek(time)            // Jump to specific time (seconds)

// Recording
animationTimeline.recordKeyframe()      // Record current object state
animationTimeline.deleteKeyframe(id)    // Remove keyframe by ID
animationTimeline.clearAllKeyframes()   // Clear all keyframes

// UI control
animationTimeline.show()                // Show timeline panel
animationTimeline.hide()                // Hide timeline panel
animationTimeline.toggle()              // Toggle visibility

// Export/Import
const data = animationTimeline.exportTimeline()
animationTimeline.importTimeline(data)
```

#### Properties

```javascript
animationTimeline.currentTime           // Current playhead position (seconds)
animationTimeline.duration              // Total timeline duration (seconds)
animationTimeline.isPlaying             // Boolean: is playback active
animationTimeline.keyframes             // Array of keyframe objects
```

#### Keyframe Object

```javascript
{
    id: "kf_1234567890_0.123",          // Unique identifier
    objectId: "actor_1",                 // Actor/prop ID
    time: 2.5,                           // Time in seconds
    property: "transform",               // Always "transform"
    value: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 }
    }
}
```

#### Example: Programmatic Animation

```javascript
// Create animation sequence programmatically
const timeline = window.animationTimeline;

// Clear existing keyframes
timeline.clearAllKeyframes();

// Get actor
const actor = window.actors[0];

// Set initial position at t=0
actor.position.set(-5, 0, 0);
timeline.currentTime = 0;
window.selectedObjects = [actor];
timeline.recordKeyframe();

// Move actor and record at t=2
actor.position.set(5, 0, 0);
timeline.currentTime = 2;
timeline.recordKeyframe();

// Rotate actor at t=4
actor.rotation.y = Math.PI;
timeline.currentTime = 4;
timeline.recordKeyframe();

// Play the animation
timeline.stop();
timeline.play();
```

---

### 6. SoundSystem

**Location:** `js/sound-system.js`
**Global Instance:** `window.soundSystem`

#### Methods

```javascript
// Sound management
soundSystem.addSound(id, name, category, audioElement)
soundSystem.removeSound(id)
soundSystem.playSound(id, options = {})
soundSystem.stopSound(id)
soundSystem.stopAllSounds()

// Cue management
soundSystem.addCue(time, soundId, action, options)
soundSystem.removeCue(id)
soundSystem.clearAllCues()

// Volume control
soundSystem.setMasterVolume(volume)     // 0.0 to 1.0
soundSystem.setSoundVolume(id, volume)  // 0.0 to 1.0

// UI control
soundSystem.show()
soundSystem.hide()
soundSystem.toggle()

// Export/Import
const data = soundSystem.exportSounds()
soundSystem.importSounds(data)
```

#### Properties

```javascript
soundSystem.sounds                      // Map<id, soundObject>
soundSystem.cues                        // Array of cue objects
soundSystem.masterVolume                // 0.0 to 1.0
soundSystem.categories                  // Available categories
```

#### Sound Object

```javascript
{
    id: "sound_1234567890",
    name: "Background Music",
    category: "music",                   // music, sfx, ambient, voice
    audio: HTMLAudioElement,
    volume: 0.8,
    duration: 120.5
}
```

#### Cue Object

```javascript
{
    id: "cue_1234567890_0.123",
    time: 5.5,                           // Trigger time (seconds)
    soundId: "sound_1234567890",
    action: "play",                      // "play" or "stop"
    options: {
        loop: false,
        fadeIn: 1.0,                     // Fade duration (seconds)
        volume: 0.8
    }
}
```

#### Example: Programmatic Sound Control

```javascript
// Load sound from URL
const audio = new Audio('path/to/music.mp3');
audio.addEventListener('loadedmetadata', () => {
    soundSystem.addSound('bgm1', 'Background Music', 'music', audio);

    // Create cues
    soundSystem.addCue(0, 'bgm1', 'play', { loop: true, volume: 0.5 });
    soundSystem.addCue(30, 'bgm1', 'stop', { fadeOut: 2.0 });
});

// Play immediately
soundSystem.playSound('bgm1', { volume: 0.7, loop: true });

// Stop all sounds
soundSystem.stopAllSounds();
```

---

### 7. StageTypeManager

**Location:** `js/stage-types.js`
**Global Instance:** `window.stageTypeManager`

#### Methods

```javascript
// Stage type management
stageTypeManager.changeStageType(type)  // 'proscenium', 'thrust', 'arena', 'blackbox'
stageTypeManager.show()                 // Show stage type panel
stageTypeManager.hide()                 // Hide panel
stageTypeManager.toggle()               // Toggle panel

// Export/Import
const data = stageTypeManager.exportStageType()
stageTypeManager.importStageType(data)
```

#### Properties

```javascript
stageTypeManager.currentType            // Current stage type string
stageTypeManager.stageTypes             // Available stage type definitions
```

#### Stage Type Definition

```javascript
{
    name: 'Proscenium',
    description: 'Traditional theater with audience on one side',
    create: Function                     // Returns THREE.Group
}
```

#### Example: Change Stage Type

```javascript
// Change to arena configuration
stageTypeManager.changeStageType('arena');

// Get current type
console.log(stageTypeManager.currentType); // 'arena'

// Check available types
Object.keys(stageTypeManager.stageTypes);
// ['proscenium', 'thrust', 'arena', 'blackbox']
```

---

## Integration Patterns

### Pattern 1: Actor Creation with Animation

```javascript
// Create actor
addActorAt(0, 0, 0);
const actor = window.actors[window.actors.length - 1];
actor.userData.id = 'hero';

// Record movement animation
const timeline = window.animationTimeline;
timeline.clearAllKeyframes();
window.selectedObjects = [actor];

// Walk across stage
const positions = [
    { time: 0, x: -5, z: 0 },
    { time: 2, x: 0, z: 0 },
    { time: 4, x: 5, z: 0 }
];

positions.forEach(pos => {
    actor.position.set(pos.x, 0, pos.z);
    timeline.currentTime = pos.time;
    timeline.recordKeyframe();
});

timeline.play();
```

### Pattern 2: Complete Scene Setup

```javascript
// Setup function for a complete scene
function setupCourtScene() {
    // Clear existing
    window.actors.forEach(a => window.scene.remove(a));
    window.props.forEach(p => window.scene.remove(p));
    window.actors = [];
    window.props = [];

    // Change stage type
    window.stageTypeManager.changeStageType('proscenium');

    // Add furniture
    addPropAt(0, 0, -3, 'desk');
    addPropAt(-2, 0, 0, 'armchair');
    addPropAt(2, 0, 0, 'armchair');

    // Add actors
    addActorAt(0, 0, -2);
    addActorAt(-2, 0, 1);
    addActorAt(2, 0, 1);

    // Set lighting
    applyLightingPreset('dramatic');

    // Add background music
    const audio = new Audio('courtroom-ambient.mp3');
    audio.addEventListener('loadedmetadata', () => {
        window.soundSystem.addSound('ambient1', 'Court Ambience', 'ambient', audio);
        window.soundSystem.playSound('ambient1', { loop: true, volume: 0.3 });
    });
}

setupCourtScene();
```

### Pattern 3: Error-Safe Operations

```javascript
// Wrap operations that might fail
const safeAddActor = window.errorHandler.safe(function(x, y, z, color) {
    addActorAt(x, y, z);
    const actor = window.actors[window.actors.length - 1];
    actor.material.color.setHex(color);
    return actor;
});

// Use it
const actor = safeAddActor(0, 0, 0, 0xff0000);
if (actor) {
    console.log('Actor created successfully');
} else {
    console.log('Failed to create actor, check error logs');
}
```

### Pattern 4: Save/Load with All Systems

```javascript
// Complete save function
function saveCompleteScene() {
    const sceneData = {
        version: '2.0',
        stage: saveScene(),                           // Base scene data
        animation: window.animationTimeline.exportTimeline(),
        sounds: window.soundSystem.exportSounds(),
        stageType: window.stageTypeManager.exportStageType()
    };

    const json = JSON.stringify(sceneData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'complete-scene.json';
    a.click();
}

// Complete load function
function loadCompleteScene(jsonData) {
    const data = JSON.parse(jsonData);

    // Load base scene
    loadScene(data.stage);

    // Load animation
    if (data.animation) {
        window.animationTimeline.importTimeline(data.animation);
    }

    // Load sounds
    if (data.sounds) {
        window.soundSystem.importSounds(data.sounds);
    }

    // Load stage type
    if (data.stageType) {
        window.stageTypeManager.importStageType(data.stageType);
    }
}
```

---

## Event System

### Custom Events

Theater-Stage uses the browser's native event system. Listen for these events:

```javascript
// Animation events
document.addEventListener('timeline:play', (e) => {
    console.log('Animation started');
});

document.addEventListener('timeline:pause', (e) => {
    console.log('Animation paused');
});

document.addEventListener('timeline:keyframe:added', (e) => {
    console.log('Keyframe added:', e.detail);
});

// Sound events
document.addEventListener('sound:play', (e) => {
    console.log('Sound playing:', e.detail.id);
});

document.addEventListener('sound:stop', (e) => {
    console.log('Sound stopped:', e.detail.id);
});

// Stage events
document.addEventListener('stage:type:changed', (e) => {
    console.log('Stage type changed to:', e.detail.type);
});

// Error events
document.addEventListener('error:logged', (e) => {
    console.log('Error logged:', e.detail);
});
```

### Dispatching Custom Events

```javascript
// Create custom event
const event = new CustomEvent('myapp:action', {
    detail: { data: 'value' }
});

document.dispatchEvent(event);
```

---

## Data Formats

### Scene Save Format

```json
{
  "version": "1.0",
  "name": "My Scene",
  "description": "Scene description",
  "stage": {
    "actors": [
      {
        "position": { "x": 0, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 1, "y": 1, "z": 1 },
        "color": "#ff0000",
        "name": "Actor 1",
        "holding": null
      }
    ],
    "props": [
      {
        "type": "chair",
        "position": { "x": 2, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 1, "y": 1, "z": 1 }
      }
    ],
    "lighting": {
      "preset": "dramatic"
    },
    "camera": {
      "position": { "x": 0, "y": 10, "z": 20 },
      "target": { "x": 0, "y": 0, "z": 0 }
    },
    "stageElements": {
      "curtainOpen": true,
      "platformHeight": 0,
      "trapdoorOpen": false
    }
  }
}
```

### Animation Timeline Format

```json
{
  "version": "1.0",
  "duration": 10,
  "keyframes": [
    {
      "id": "kf_1234567890_0.123",
      "objectId": "actor_0",
      "time": 2.5,
      "property": "transform",
      "value": {
        "position": { "x": 0, "y": 0, "z": 0 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 1, "y": 1, "z": 1 }
      }
    }
  ]
}
```

### Sound System Format

```json
{
  "version": "1.0",
  "masterVolume": 0.8,
  "sounds": [
    {
      "id": "sound_1234567890",
      "name": "Background Music",
      "category": "music",
      "src": "data:audio/mp3;base64,...",
      "volume": 0.5
    }
  ],
  "cues": [
    {
      "id": "cue_1234567890_0.123",
      "time": 5.5,
      "soundId": "sound_1234567890",
      "action": "play",
      "options": {
        "loop": false,
        "volume": 0.8
      }
    }
  ]
}
```

---

## Developer Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic HTTP server (for local development)
- Text editor or IDE

### Local Development

```bash
# Clone repository
git clone https://github.com/CrazyDubya/theater-stage.git
cd theater-stage

# Navigate to project
cd projects/scratch

# Start local server (choose one)
python -m http.server 8000        # Python 3
python -m SimpleHTTPServer 8000   # Python 2
npx http-server                   # Node.js

# Open browser
open http://localhost:8000
```

### Project Structure

```
theater-stage/
├── projects/scratch/
│   ├── index.html                   # Main HTML file
│   ├── css/
│   │   └── ui-improvements.css      # UI styles
│   ├── js/
│   │   ├── stage.js                 # Core 3D stage (legacy)
│   │   ├── error-handler.js         # Error handling
│   │   ├── tooltips.js              # Tooltip system
│   │   ├── ui-enhancements.js       # UI improvements
│   │   ├── tutorial.js              # Onboarding
│   │   ├── expanded-prop-library.js # 50+ props
│   │   ├── animation-timeline.js    # Animation system
│   │   ├── sound-system.js          # Audio system
│   │   ├── stage-types.js           # Stage configurations
│   │   ├── collaboration.js         # Multi-user support
│   │   ├── stage-save-load.js       # Save/load functionality
│   │   └── collaboration-integration.js
│   └── presets/
│       └── *.json                   # Scene presets
└── docs/
    ├── user-guide.md                # End-user documentation
    ├── api-documentation.md         # This file
    ├── curriculum-guide.md          # Educational materials
    └── modularization-plan.md       # Refactoring roadmap
```

### Adding New Features

1. **Create new module file**
   ```javascript
   // js/my-feature.js
   class MyFeature {
       constructor() {
           this.init();
       }

       init() {
           // Setup code
       }
   }

   // Global instance
   window.myFeature = new MyFeature();
   ```

2. **Add to index.html**
   ```html
   <script src="js/my-feature.js"></script>
   ```

3. **Document in this file**

---

## TypeScript Definitions

### Type Definitions (Optional)

For TypeScript projects, use these type definitions:

```typescript
// theater-stage.d.ts

interface Vector3 {
    x: number;
    y: number;
    z: number;
}

interface Actor {
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    material: THREE.Material;
    userData: {
        id: string;
        name?: string;
        holding?: Prop | null;
    };
}

interface Prop {
    type: string;
    position: Vector3;
    rotation: Vector3;
    scale: Vector3;
    userData: {
        id: string;
        interactions?: {
            pickupable?: boolean;
            throwable?: boolean;
            sittable?: boolean;
            toggleable?: boolean;
        };
    };
}

interface Keyframe {
    id: string;
    objectId: string;
    time: number;
    property: 'transform';
    value: {
        position: Vector3;
        rotation: Vector3;
        scale: Vector3;
    };
}

interface SoundCue {
    id: string;
    time: number;
    soundId: string;
    action: 'play' | 'stop';
    options?: {
        loop?: boolean;
        volume?: number;
        fadeIn?: number;
        fadeOut?: number;
    };
}

interface AnimationTimeline {
    currentTime: number;
    duration: number;
    isPlaying: boolean;
    keyframes: Keyframe[];

    play(): void;
    pause(): void;
    stop(): void;
    seek(time: number): void;
    recordKeyframe(): void;
    deleteKeyframe(id: string): void;
    clearAllKeyframes(): void;
    exportTimeline(): object;
    importTimeline(data: object): void;
}

interface SoundSystem {
    masterVolume: number;
    sounds: Map<string, any>;
    cues: SoundCue[];

    addSound(id: string, name: string, category: string, audio: HTMLAudioElement): void;
    removeSound(id: string): void;
    playSound(id: string, options?: object): void;
    stopSound(id: string): void;
    stopAllSounds(): void;
    setMasterVolume(volume: number): void;
    setSoundVolume(id: string, volume: number): void;
    addCue(time: number, soundId: string, action: string, options?: object): void;
    removeCue(id: string): void;
    exportSounds(): object;
    importSounds(data: object): void;
}

interface StageTypeManager {
    currentType: 'proscenium' | 'thrust' | 'arena' | 'blackbox';

    changeStageType(type: string): void;
    exportStageType(): object;
    importStageType(data: object): void;
}

interface ErrorHandler {
    maxLogs: number;
    enableNotifications: boolean;
    enableConsole: boolean;

    log(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, error?: Error): void;
    info(message: string, data?: any): void;
    safe<T extends Function>(fn: T, context?: any): T;
    clearLogs(): void;
    exportLogs(): object;
    getStats(): { total: number; error: number; warn: number; info: number };
}

// Global window augmentation
declare global {
    interface Window {
        scene: THREE.Scene;
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        stage: THREE.Group;
        actors: Actor[];
        props: Prop[];
        selectedObjects: (Actor | Prop)[];

        animationTimeline: AnimationTimeline;
        soundSystem: SoundSystem;
        stageTypeManager: StageTypeManager;
        errorHandler: ErrorHandler;

        // Legacy functions
        addActorAt(x: number, y: number, z: number): void;
        addPropAt(x: number, y: number, z: number, type: string): void;
        applyLightingPreset(preset: string): void;
        saveScene(): object;
        loadScene(data: object): void;
    }
}
```

---

## Examples & Recipes

### Recipe 1: Automated Stage Direction

```javascript
// Create a function to automate stage directions
async function performStageDirection(script) {
    for (const direction of script) {
        switch (direction.type) {
            case 'enter':
                addActorAt(direction.x, direction.y, direction.z);
                break;

            case 'move':
                const actor = window.actors.find(a => a.userData.name === direction.actor);
                if (actor) {
                    actor.position.set(direction.x, direction.y, direction.z);
                }
                break;

            case 'speak':
                window.soundSystem.playSound(direction.soundId);
                break;

            case 'lighting':
                applyLightingPreset(direction.preset);
                break;

            case 'wait':
                await new Promise(resolve => setTimeout(resolve, direction.duration * 1000));
                break;
        }
    }
}

// Use it
const script = [
    { type: 'lighting', preset: 'dramatic' },
    { type: 'enter', x: -5, y: 0, z: 0, name: 'Hero' },
    { type: 'wait', duration: 1 },
    { type: 'move', actor: 'Hero', x: 0, y: 0, z: 0 },
    { type: 'speak', soundId: 'dialogue_1' }
];

performStageDirection(script);
```

### Recipe 2: Camera Choreography

```javascript
// Animate camera movements
function animateCamera(path, duration) {
    const startPos = window.camera.position.clone();
    const startTime = Date.now();

    function updateCamera() {
        const elapsed = (Date.now() - startTime) / 1000;
        const t = Math.min(elapsed / duration, 1);

        // Interpolate along path
        const index = Math.floor(t * (path.length - 1));
        const nextIndex = Math.min(index + 1, path.length - 1);
        const localT = (t * (path.length - 1)) - index;

        const current = path[index];
        const next = path[nextIndex];

        window.camera.position.x = current.x + (next.x - current.x) * localT;
        window.camera.position.y = current.y + (next.y - current.y) * localT;
        window.camera.position.z = current.z + (next.z - current.z) * localT;

        if (t < 1) {
            requestAnimationFrame(updateCamera);
        }
    }

    updateCamera();
}

// Use it
const cameraPath = [
    { x: 0, y: 10, z: 20 },
    { x: 10, y: 15, z: 10 },
    { x: 0, y: 20, z: 0 }
];

animateCamera(cameraPath, 5);
```

### Recipe 3: Interactive Audience View

```javascript
// Let users switch to audience perspective
function setAudienceView(section) {
    const views = {
        center: { x: 0, y: 5, z: 25 },
        left: { x: -15, y: 5, z: 20 },
        right: { x: 15, y: 5, z: 20 },
        balcony: { x: 0, y: 15, z: 30 }
    };

    const view = views[section];
    if (view) {
        window.camera.position.set(view.x, view.y, view.z);
        window.camera.lookAt(0, 0, 0);
    }
}

// Add UI buttons
const sections = ['center', 'left', 'right', 'balcony'];
sections.forEach(section => {
    const button = document.createElement('button');
    button.textContent = `${section} view`;
    button.onclick = () => setAudienceView(section);
    document.querySelector('#view-controls').appendChild(button);
});
```

### Recipe 4: Real-time Collaboration Hook

```javascript
// Sync animation playback across users
if (window.collaborationManager) {
    // Send playback state
    window.animationTimeline.onPlaybackChange = (isPlaying, currentTime) => {
        window.collaborationManager.sendMessage({
            type: 'animation',
            action: isPlaying ? 'play' : 'pause',
            time: currentTime
        });
    };

    // Receive playback state
    window.collaborationManager.onMessage = (data) => {
        if (data.type === 'animation') {
            if (data.action === 'play') {
                window.animationTimeline.seek(data.time);
                window.animationTimeline.play();
            } else {
                window.animationTimeline.pause();
            }
        }
    };
}
```

### Recipe 5: Export Animation as Data

```javascript
// Export animation as keyframe data for external tools
function exportAnimationData() {
    const data = {
        fps: 30,
        duration: window.animationTimeline.duration,
        objects: {}
    };

    // Group keyframes by object
    window.animationTimeline.keyframes.forEach(kf => {
        if (!data.objects[kf.objectId]) {
            data.objects[kf.objectId] = {
                type: 'actor', // or 'prop'
                keyframes: []
            };
        }

        data.objects[kf.objectId].keyframes.push({
            frame: Math.round(kf.time * 30), // Convert to frames
            transform: kf.value
        });
    });

    return data;
}

// Convert to CSV format
function exportToCSV() {
    const data = exportAnimationData();
    let csv = 'Object,Frame,PosX,PosY,PosZ,RotX,RotY,RotZ\n';

    for (const [objId, obj] of Object.entries(data.objects)) {
        obj.keyframes.forEach(kf => {
            csv += `${objId},${kf.frame},`;
            csv += `${kf.transform.position.x},${kf.transform.position.y},${kf.transform.position.z},`;
            csv += `${kf.transform.rotation.x},${kf.transform.rotation.y},${kf.transform.rotation.z}\n`;
        });
    }

    return csv;
}
```

### Recipe 6: Custom Prop Creator

```javascript
// Function to create custom props programmatically
function createCustomProp(config) {
    const group = new THREE.Group();

    // Parse config and create geometry
    config.parts.forEach(part => {
        let geometry;

        switch (part.shape) {
            case 'box':
                geometry = new THREE.BoxGeometry(...part.size);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(...part.size);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(...part.size);
                break;
        }

        const material = new THREE.MeshPhongMaterial({ color: part.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...part.position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        group.add(mesh);
    });

    return group;
}

// Register custom prop
const customPropConfig = {
    parts: [
        { shape: 'box', size: [1, 0.1, 1], color: 0x8B4513, position: [0, 0.5, 0] },
        { shape: 'cylinder', size: [0.05, 0.05, 0.5], color: 0x654321, position: [0.4, 0.25, 0.4] },
        { shape: 'cylinder', size: [0.05, 0.05, 0.5], color: 0x654321, position: [-0.4, 0.25, 0.4] },
        { shape: 'cylinder', size: [0.05, 0.05, 0.5], color: 0x654321, position: [0.4, 0.25, -0.4] },
        { shape: 'cylinder', size: [0.05, 0.05, 0.5], color: 0x654321, position: [-0.4, 0.25, -0.4] }
    ]
};

// Add to catalog
PROP_CATALOG.custom_table = {
    name: 'Custom Table',
    category: 'furniture',
    create: () => createCustomProp(customPropConfig),
    y: 0,
    interactions: { pickupable: false }
};
```

---

## Best Practices

### Performance

1. **Limit Active Animations**
   - Don't animate too many objects simultaneously
   - Use `requestAnimationFrame` for smooth rendering

2. **Audio Management**
   - Preload audio files
   - Stop unused sounds
   - Use appropriate formats (MP3 for music, OGG for effects)

3. **Memory Management**
   - Remove unused actors/props from scene
   - Clear keyframes when not needed
   - Dispose of Three.js geometries/materials

### Error Handling

1. **Always Use Safe Wrappers**
   ```javascript
   const safeFunction = errorHandler.safe(riskyOperation);
   ```

2. **Validate User Input**
   ```javascript
   function setVolume(value) {
       if (typeof value !== 'number' || value < 0 || value > 1) {
           errorHandler.warn('Invalid volume value');
           return;
       }
       soundSystem.setMasterVolume(value);
   }
   ```

3. **Check Object Existence**
   ```javascript
   if (window.actors && window.actors.length > 0) {
       // Safe to access actors
   }
   ```

### Code Organization

1. **Use Modules for New Features**
2. **Document Public APIs**
3. **Follow Naming Conventions**
   - Classes: `PascalCase`
   - Functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`

---

## API Version History

### Version 2.0 (Current)
- Added Animation Timeline API
- Added Sound System API
- Added Stage Type Manager API
- Added Error Handler API
- Added Tutorial System API
- Added Tooltip System API
- Added UI Enhancer API
- Expanded Prop Library (50+ props)

### Version 1.0
- Basic stage management
- Actor/prop placement
- Save/load functionality
- Collaboration support
- Lighting presets
- Camera controls

---

## Support & Contributing

### Getting Help

- Check the [User Guide](user-guide.md) for basic usage
- Review [Curriculum Guide](curriculum-guide.md) for educational use
- See [Modularization Plan](modularization-plan.md) for architecture

### Reporting Issues

Include in bug reports:
1. Browser and version
2. Steps to reproduce
3. Error logs (from Error Handler panel)
4. Expected vs actual behavior

### Contributing

See the [Modularization Plan](modularization-plan.md) for areas needing improvement.

---

**Last Updated:** 2025-11-23
**API Version:** 2.0
**Theater-Stage Version:** 2.0
