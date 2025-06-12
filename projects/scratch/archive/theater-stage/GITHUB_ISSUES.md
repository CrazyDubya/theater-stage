# GitHub Issues for 3D Theater Stage

Copy and paste these issues into GitHub Issues for the theater-stage project.

---

## Issue 1: Add Save/Load Functionality for Scenes

**Type:** Enhancement  
**Priority:** High  
**Labels:** enhancement, feature-request

### Description
Implement the ability to save and load complete stage configurations including:
- Actor positions and IDs
- Prop positions, types, and IDs  
- Stage element states (platforms, curtains, trap doors, etc.)
- Lighting and camera settings
- Scenery panel positions

### Acceptance Criteria
- [ ] Add "Save Scene" button that exports to JSON
- [ ] Add "Load Scene" button that imports from JSON
- [ ] Preserve all object IDs and relationships
- [ ] Handle version compatibility
- [ ] Add scene naming/description

---

## Issue 2: Implement AI Actor Movement and Scripting System

**Type:** Feature  
**Priority:** High  
**Labels:** enhancement, ai-actors, core-feature

### Description
Create a scripting system for AI actors to perform movements and actions on stage.

### Requirements
- Movement commands (walk to position, turn, face direction)
- Path finding around obstacles and scenery
- Speed controls (walk, run, slow)
- Action triggers (sit, stand, gesture)
- Timing/sequencing system
- Script format (JSON or custom DSL)

### Example Script
```json
{
  "actor_1": [
    {"action": "walk_to", "position": "DSC", "speed": "normal"},
    {"action": "turn", "direction": "audience"},
    {"action": "wait", "duration": 2},
    {"action": "walk_to", "position": "prop_5"}
  ]
}
```

---

## Issue 3: Add Texture/Image Support for Scenery Panels

**Type:** Enhancement  
**Priority:** Medium  
**Labels:** enhancement, visuals

### Description
Allow scenery panels to display custom images or textures instead of just solid colors.

### Features Needed
- [ ] Image upload interface
- [ ] Texture mapping to panels
- [ ] Support for common formats (JPG, PNG, WebP)
- [ ] Texture scaling/positioning controls
- [ ] Default texture library
- [ ] Video texture support (stretch goal)

---

## Issue 4: Improve Collision Detection System

**Type:** Bug/Enhancement  
**Priority:** Medium  
**Labels:** bug, physics, enhancement

### Description
Current collision detection is basic bounding-box based. Improve precision and performance.

### Improvements
- [ ] More accurate collision shapes for complex props
- [ ] Smooth collision response (sliding along walls)
- [ ] Better performance with many objects
- [ ] Debug visualization mode
- [ ] Collision layers (actors vs props vs scenery)

---

## Issue 5: Add Sound System Integration

**Type:** Feature  
**Priority:** Medium  
**Labels:** enhancement, audio, feature-request

### Description
Implement 3D positional audio system for the theater.

### Features
- [ ] Background music/ambience
- [ ] Sound effect triggers
- [ ] 3D positional audio (sounds from specific locations)
- [ ] Actor voice playback
- [ ] Volume controls by category
- [ ] Audio cue system tied to scripts

---

## Issue 6: Create Advanced Prop Interaction System

**Type:** Feature  
**Priority:** Medium  
**Labels:** enhancement, physics, interaction

### Description
Allow actors to interact with props beyond collision.

### Interactions
- [ ] Pick up/put down props
- [ ] Carry props while moving
- [ ] Sit on furniture props
- [ ] Open/close prop doors
- [ ] Prop state changes (on/off for lamps)
- [ ] Throw/catch mechanics

---

## Issue 7: Multi-User Collaboration Support

**Type:** Feature  
**Priority:** Low  
**Labels:** enhancement, multiplayer, feature-request

### Description
Enable multiple users to work on the same stage simultaneously.

### Requirements
- [ ] WebSocket or WebRTC connection
- [ ] Synchronized object positions
- [ ] User cursors/avatars
- [ ] Conflict resolution
- [ ] Chat/communication system
- [ ] Permission levels (director, actor, viewer)

---

## Issue 8: Export Scenes to Standard 3D Formats

**Type:** Feature  
**Priority:** Low  
**Labels:** enhancement, export, integration

### Description
Allow exporting stage scenes to standard 3D formats for use in other software.

### Formats
- [ ] GLTF/GLB export
- [ ] OBJ export
- [ ] FBX export (if possible)
- [ ] Include materials and textures
- [ ] Animation export for moving elements
- [ ] Batch export for animation frames

---

## Issue 9: Add Stage Preset Templates

**Type:** Enhancement  
**Priority:** Low  
**Labels:** enhancement, ux

### Description
Provide preset stage configurations for common scenarios.

### Templates
- [ ] Empty stage
- [ ] Living room scene
- [ ] Outdoor park
- [ ] Office setting
- [ ] Restaurant/cafe
- [ ] Classical theater setup

---

## Issue 10: Implement Undo/Redo System

**Type:** Enhancement  
**Priority:** Medium  
**Labels:** enhancement, ux

### Description
Add undo/redo functionality for all stage modifications.

### Scope
- [ ] Object placement/deletion
- [ ] Object movement
- [ ] Property changes
- [ ] Stage element state changes
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- [ ] Visual undo history

---

## Issue 11: Add Measurement and Grid Tools

**Type:** Enhancement  
**Priority:** Low  
**Labels:** enhancement, tools

### Description
Provide tools for precise positioning and measurement.

### Features
- [ ] Toggle grid overlay on stage
- [ ] Snap-to-grid option
- [ ] Ruler/measurement tool
- [ ] Distance between objects
- [ ] Angle measurements
- [ ] Coordinate display

---

## Issue 12: Performance Optimization for Large Scenes

**Type:** Enhancement  
**Priority:** Medium  
**Labels:** performance, optimization

### Description
Optimize rendering and physics for scenes with many actors/props.

### Optimizations
- [ ] Level-of-detail (LOD) system
- [ ] Frustum culling improvements
- [ ] Object pooling
- [ ] Texture atlasing
- [ ] Physics sleep states
- [ ] Benchmark mode