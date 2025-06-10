# Phase 3A Week 1: Actor Foundation System - Detailed Task Breakdown

## Week 1 Overview
**Goal**: Create basic actor system that integrates with existing theater stage architecture
**Duration**: 5-7 days of development  
**Success Metrics**: 5 actors moving between stage positions with collision avoidance

## Current System Integration Points

### Existing Architecture (from Phase 2)
- ✅ **StateManager.js**: Centralized state management
- ✅ **ObjectFactory.js**: Prop creation system (1,153 lines)
- ✅ **PhysicsEngine.js**: Collision detection (620 lines)
- ✅ **UIManager.js**: 4-panel interface (800 lines)
- ✅ **SceneManager.js**: Three.js scene setup (237 lines)

### Integration Strategy
- **Extend ObjectFactory** → Create ActorFactory as new module
- **Hook into PhysicsEngine** → Add actor collision detection
- **Extend UIManager** → Add actor controls to Objects panel
- **Use StateManager** → Persist actor configurations

## Task 1: Core Actor Class Architecture (Day 1)
**Estimated Time**: 4-6 hours
**File**: `js/core/actors/ActorFactory.js`

### Subtasks:
1. **Create base Actor class** (1 hour)
   ```javascript
   class TheatricalActor {
       constructor(id, position, actorType) {
           this.id = id;
           this.position = position;
           this.actorType = actorType; // 'basic', 'performer', 'dancer'
           this.mesh = null;
           this.state = 'idle';
           this.targetPosition = null;
           this.movementSpeed = 1.0;
       }
   }
   ```

2. **Create ActorFactory class** (2 hours)
   - Extend existing ObjectFactory patterns
   - Actor creation methods
   - Actor management (add/remove/update)
   - Integration with existing scene

3. **Basic actor mesh generation** (2 hours)
   - Simple humanoid representation (cylinder + sphere)
   - Different colors for actor identification
   - Proper scaling and positioning

4. **Integration with StateManager** (1 hour)
   - Add actors array to global state
   - Actor persistence methods
   - State synchronization

### Deliverable:
- [ ] ActorFactory.js creates and manages basic actor objects
- [ ] Actors appear as simple humanoid figures on stage
- [ ] Actors are saved/loaded with stage configuration

## Task 2: Basic State Machine (Day 2)
**Estimated Time**: 3-4 hours
**File**: `js/core/actors/ActorStateMachine.js`

### Subtasks:
1. **Define actor states** (1 hour)
   ```javascript
   const ACTOR_STATES = {
       IDLE: 'idle',           // Standing still
       WALKING: 'walking',     // Moving to target
       POSITIONING: 'positioning', // Finding optimal position
       BLOCKED: 'blocked'      // Cannot reach target
   };
   ```

2. **Create StateMachine class** (2 hours)
   - State transition logic
   - Event-driven state changes
   - State validation and error handling

3. **Basic state behaviors** (1 hour)
   - Idle: subtle animation/rotation
   - Walking: movement toward target
   - Blocked: stop and recalculate

### Deliverable:
- [ ] Actors have visible state changes
- [ ] State transitions work properly
- [ ] Debug info shows current actor states

## Task 3: Simple Movement System (Day 3)
**Estimated Time**: 4-5 hours
**File**: `js/core/actors/ActorMovement.js`

### Subtasks:
1. **Basic pathfinding** (2 hours)
   - Direct line movement (no obstacles yet)
   - Speed control and interpolation
   - Target arrival detection

2. **Stage position integration** (1 hour)
   - Use existing stage coordinate system
   - Snap to stage markers when close
   - Respect stage boundaries

3. **Movement animation** (2 hours)
   - Smooth interpolation between positions
   - Rotation to face movement direction
   - Basic walking animation (bob/sway)

### Deliverable:
- [ ] Actors move smoothly between clicked positions
- [ ] Movement respects stage boundaries
- [ ] Visual feedback shows movement paths

## Task 4: Basic Collision Avoidance (Day 4)
**Estimated Time**: 3-4 hours
**Integration with**: `PhysicsEngine.js`

### Subtasks:
1. **Extend PhysicsEngine for actors** (2 hours)
   - Add actor collision detection
   - Actor-to-actor distance checking
   - Actor-to-prop collision

2. **Simple avoidance behavior** (2 hours)
   - Stop when blocked by another actor
   - Wait for path to clear
   - Basic side-stepping around obstacles

### Deliverable:
- [ ] Actors don't walk through each other
- [ ] Actors avoid stage props
- [ ] Collision detection works at 60fps

## Task 5: UI Integration (Day 5)
**Estimated Time**: 3-4 hours
**Integration with**: `UIManager.js`

### Subtasks:
1. **Add actor controls to Objects panel** (2 hours)
   - Actor type selector
   - Add Actor button
   - Actor count display

2. **Actor selection and control** (2 hours)
   - Click to select actors
   - Move selected actor to clicked position
   - Delete selected actor

### Deliverable:
- [ ] UI panel has actor creation controls
- [ ] Click-to-place actor system works
- [ ] Actor selection and movement functional

## Task 6: Testing and Integration (Day 6-7)
**Estimated Time**: 2-3 hours

### Subtasks:
1. **Multi-actor testing** (1 hour)
   - Create 5+ actors simultaneously
   - Test collision avoidance with multiple actors
   - Performance monitoring

2. **Integration testing** (1 hour)
   - Verify existing prop system still works
   - Test save/load with actors
   - Check UI responsiveness

3. **Bug fixes and polish** (1 hour)
   - Fix any discovered issues
   - Performance optimization
   - Code cleanup

### Deliverable:
- [ ] 5+ actors moving simultaneously
- [ ] All existing features still functional
- [ ] Performance above 50fps

## File Structure for Week 1
```
js/core/actors/
├── ActorFactory.js          # Main actor creation and management
├── ActorStateMachine.js     # State system
└── ActorMovement.js         # Movement and pathfinding

// Modified existing files:
js/core/
├── StateManager.js          # Add actor state management
├── PhysicsEngine.js         # Add actor collision detection
└── UIManager.js             # Add actor UI controls
```

## Success Criteria for Week 1

### Technical Metrics
- [ ] **Performance**: 60fps with 5+ actors
- [ ] **Memory**: <50MB additional memory usage
- [ ] **Integration**: No breaking changes to existing features

### Functional Requirements
- [ ] **Actor Creation**: Users can add actors via UI
- [ ] **Actor Movement**: Click-to-move functionality
- [ ] **Collision Avoidance**: Actors don't overlap
- [ ] **State Persistence**: Actors save/load correctly
- [ ] **Visual Feedback**: Clear state and movement indication

### User Experience
- [ ] **Intuitive Controls**: Easy to understand actor placement
- [ ] **Responsive Interface**: No lag in UI interactions
- [ ] **Clear Feedback**: Users understand what actors are doing

## Troubleshooting Guide

### Common Issues & Solutions

#### **Performance Problems**
- **Issue**: Frame rate drops with multiple actors
- **Solution**: Reduce update frequency for distant actors
- **Fallback**: Limit actor count to maintain performance

#### **Integration Conflicts**
- **Issue**: New actor system breaks existing prop system
- **Solution**: Ensure actors use same coordinate system as props
- **Fallback**: Feature flag to disable actors if needed

#### **Movement Issues**
- **Issue**: Actors move erratically or get stuck
- **Solution**: Improve collision detection radius and pathfinding
- **Fallback**: Simplified direct-line movement only

## Next Week Preview
**Week 2**: Theater Staging Integration
- Professional stage position system (USL, USC, USR, etc.)
- Movement path creation tools
- Basic choreography features

---

**This document provides complete guidance for Week 1 implementation and can be used to resume work at any point during development.**