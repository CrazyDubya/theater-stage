# Theater Stage Implementation Plan

## Development Priority Order & Technical Plan

### 🎯 Phase 1: Core Foundation (Issues 1, 3, 4, 10)

#### **Priority 1: Save/Load Functionality (#1)**
*Estimated Complexity: Medium | Timeline: 1-2 weeks*

**Why First**: Foundation for all other work - users need to save their creations

**Technical Requirements:**
- JSON serialization system for all stage objects
- File I/O with browser File API
- State management and validation
- Version compatibility handling

**Implementation Plan:**
```javascript
// Core serialization structure
{
  "version": "1.0",
  "timestamp": "2025-06-03T02:00:00Z",
  "stage": {
    "actors": [{ "id": "actor_1", "position": {x,y,z}, "rotation": {x,y,z} }],
    "props": [{ "id": "prop_1", "type": "chair", "position": {x,y,z} }],
    "lighting": { "preset": "default", "customSettings": {} },
    "camera": { "position": {x,y,z}, "target": {x,y,z} },
    "stageElements": {
      "platforms": [{ "index": 0, "height": 3.25 }],
      "curtains": "open",
      "rotatingStage": { "visible": false, "rotating": false },
      "trapDoors": [{ "index": 0, "open": false }],
      "scenery": [{ "index": 0, "position": 0.5 }]
    }
  }
}
```

**Tasks:**
- [ ] Create `SceneSerializer` class
- [ ] Add save/load UI buttons
- [ ] Implement `exportScene()` and `importScene()` functions
- [ ] Add scene naming and description
- [ ] Handle file validation and error cases
- [ ] Add auto-save functionality

---

#### **Priority 2: Texture/Image Support for Scenery (#3)**
*Estimated Complexity: Medium | Timeline: 1-2 weeks*

**Why Second**: Major visual improvement that makes scenes compelling

**Technical Requirements:**
- Image upload and file handling
- Three.js texture management
- Material updates for scenery panels
- Texture scaling and positioning controls

**Implementation Plan:**
```javascript
// Texture management system
class TextureManager {
  loadTexture(file) // FileReader + Three.TextureLoader
  applyToPanel(panelIndex, texture, options)
  updateTextureSettings(scale, offset, repeat)
}

// UI Controls
- File input for image upload
- Texture library with defaults
- Scale/position sliders
- Preview system
```

**Tasks:**
- [ ] Create texture upload UI
- [ ] Implement TextureManager class
- [ ] Add texture application to scenery panels
- [ ] Create default texture library
- [ ] Add texture scaling/positioning controls
- [ ] Update save/load to include textures (base64 or references)

---

#### **Priority 3: Collision Detection Improvements (#4)**
*Estimated Complexity: High | Timeline: 2-3 weeks*

**Why Third**: Foundation for realistic interactions before adding more features

**Technical Requirements:**
- Improved collision shapes (beyond bounding boxes)
- Smooth collision response
- Performance optimization for many objects
- Debug visualization mode

**Implementation Plan:**
```javascript
// Enhanced collision system
class CollisionManager {
  // More precise collision shapes
  createCollisionShape(object) // Box, Sphere, Mesh-based
  
  // Smooth responses
  handleCollision(obj1, obj2) // Sliding, bouncing
  
  // Spatial partitioning
  updateSpatialGrid()
  queryNearbyObjects(position, radius)
  
  // Debug visualization
  showCollisionBounds(enabled)
}
```

**Tasks:**
- [ ] Implement spatial partitioning system
- [ ] Create more accurate collision shapes
- [ ] Add smooth collision response (sliding along walls)
- [ ] Implement debug visualization mode
- [ ] Performance optimization with object culling
- [ ] Add collision layers (actors/props/scenery)

---

#### **Priority 4: Undo/Redo System (#10)**
*Estimated Complexity: Medium-High | Timeline: 2 weeks*

**Why Fourth**: Critical UX improvement before adding more complex features

**Technical Requirements:**
- Command pattern implementation
- Action history management
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Memory management for large histories

**Implementation Plan:**
```javascript
// Command pattern
class Command {
  execute()
  undo()
  canMerge(otherCommand) // For continuous actions
}

class CommandManager {
  executeCommand(command)
  undo()
  redo()
  clear()
  
  // Specific commands
  PlaceObjectCommand
  MoveObjectCommand
  DeleteObjectCommand
  ChangePropertyCommand
  StageElementCommand
}
```

**Tasks:**
- [ ] Implement Command base class and specific commands
- [ ] Create CommandManager with history stack
- [ ] Add keyboard shortcuts (Ctrl+Z/Y)
- [ ] Create visual undo history UI
- [ ] Implement command merging for smooth operations
- [ ] Add memory management for large histories

---

### 🎵 Phase 2: Immersion Enhancement (Issue 5)

#### **Priority 5: Sound System Integration (#5)**
*Estimated Complexity: Medium-High | Timeline: 2-3 weeks*

**Why Fifth**: Adds major immersion after core functionality is solid

**Technical Requirements:**
- Web Audio API integration
- 3D positional audio
- Audio file management
- Volume controls and mixing

**Implementation Plan:**
```javascript
// Audio system architecture
class AudioManager {
  init() // Create AudioContext
  
  // 3D positioning
  createPositionalSound(audioBuffer, position)
  updateListenerPosition(camera)
  
  // Categories
  playBackgroundMusic(file)
  playSoundEffect(file, position)
  playActorVoice(actorId, file)
  
  // Controls
  setVolume(category, level)
  mute(category)
}

// Audio cues tied to scripts
class AudioCue {
  trigger: "onActorMove" | "onTime" | "onEvent"
  sound: audioFile
  position: {x,y,z} | "followActor"
  volume: 0-1
}
```

**Tasks:**
- [ ] Set up Web Audio API context
- [ ] Implement 3D positional audio
- [ ] Create audio upload/management system
- [ ] Add volume controls by category
- [ ] Implement audio cue system
- [ ] Add audio visualization (optional)

---

### 🚀 Phase 3: Advanced Features (Issues 2, 6, 8, 12)

#### **Priority 6: AI Actor Movement and Scripting (#2)**
*Estimated Complexity: Very High | Timeline: 3-4 weeks*

**Technical Requirements:**
- Pathfinding algorithm (A*)
- Movement animation system
- Script parser and execution engine
- Action queue management

**Implementation Plan:**
```javascript
// Scripting system
class ScriptEngine {
  parseScript(json)
  executeScript(actorId, script)
  
  // Actions
  walkTo(position, speed)
  turnTo(direction)
  playAnimation(name)
  wait(duration)
  interact(propId)
}

// Pathfinding
class PathFinder {
  findPath(start, end, obstacles)
  // A* implementation with obstacle avoidance
}
```

---

#### **Priority 7: Advanced Prop Interactions (#6)**
*Estimated Complexity: High | Timeline: 2-3 weeks*

**Implementation after scripting system is in place**

---

#### **Priority 8: Performance Optimization (#12)**
*Estimated Complexity: High | Timeline: 2-3 weeks*

**Implementation when scene complexity grows**

---

#### **Priority 9: 3D Format Export (#8)**
*Estimated Complexity: Medium | Timeline: 1-2 weeks*

**Implementation for sharing/integration needs**

---

### 🎨 Phase 4: Polish & Enhancement (Issues 7, 9, 11)

#### **Priority 10: Stage Preset Templates (#9)**
*Estimated Complexity: Low-Medium | Timeline: 1 week*

#### **Priority 11: Measurement Tools (#11)**
*Estimated Complexity: Medium | Timeline: 1-2 weeks*

#### **Priority 12: Multi-User Collaboration (#7)**
*Estimated Complexity: Very High | Timeline: 4-6 weeks*

---

## 📋 Development Dependencies

**Phase 1 Dependencies:**
- Save/Load → Everything (foundational)
- Textures → Enhanced visuals
- Collision → Realistic physics 
- Undo/Redo → User experience

**Phase 2 Dependencies:**
- Sound → Immersion (independent)

**Phase 3 Dependencies:**
- Scripting → Advanced interactions
- Prop Interactions → Scripting system
- Performance → Scene complexity
- Export → Mature feature set

**Critical Path:** 1 → 4 → 2 → 6 → Everything else

## 🛠️ Technical Architecture Updates Needed

**For Phase 1:**
1. **State Management**: Centralized state store for save/load
2. **Asset Management**: Texture and file handling system  
3. **Physics Engine**: Enhanced collision detection
4. **Command System**: Undo/redo infrastructure

**For Phase 2:**
5. **Audio Engine**: Web Audio API integration

**For Phase 3:**
6. **Script Engine**: AI behavior system
7. **Animation System**: Smooth object movements
8. **Performance Systems**: LOD, culling, optimization

This plan prioritizes user value delivery while building solid technical foundations for advanced features.