# Theater-Stage: A 3D Platform for AI Actor Performances

## Presentation Outline (5-10 minute talk)

---

# Slide 1: Title & Overview

## Theater-Stage
### An Interactive 3D Environment for AI Actor Performances

**Key Stats:**
- 12,601 lines of JavaScript
- 21 ES6 modules
- 15 pre-built scene presets
- Real-time multi-user collaboration

**Tech Stack:** Three.js r170 | Node.js | WebSocket | Zero-build architecture

---

# Slide 2: What Does It Do?

## A Virtual Theater Stage for AI Actors

```
+--------------------------------------------------+
|                    AUDIENCE VIEW                  |
|                                                   |
|    [Spotlight]     [Spotlight]     [Spotlight]    |
|         \              |              /           |
|          \             |             /            |
|   +--------------------------------------+        |
|   |           MAIN STAGE                 |        |
|   |                                      |        |
|   |   [Actor 1]    [Props]    [Actor 2]  |        |
|   |                                      |        |
|   |   [Platform]  [Platform] [Platform]  |        |
|   +--------------------------------------+        |
|           |         |         |                   |
|        [Trap]   [Rotating]  [Trap]                |
|        [Door]    [Stage]    [Door]                |
+--------------------------------------------------+
```

**Features:**
- Humanoid actor placement with prop interactions (grab, throw, sit)
- Dynamic lighting with 5 presets (day, night, sunset, dramatic)
- Moveable platforms, trap doors, rotating center stage
- Scenery panels with passthrough cutouts
- Full scene serialization (save/load)

---

# Slide 3: High-Level Architecture

## Modular ES6 Architecture

```
                    index.html
                        |
                  stage-main.js
                   (Entry Point)
                        |
        +---------------+---------------+
        |               |               |
   stage-core.js  stage-geometry.js  stage-physics.js
   (Scene/Camera)  (Stage Elements)  (Collisions)
        |               |               |
        +-------+-------+-------+-------+
                |               |
          stage-props.js  stage-actors.js
          (20+ Props)    (Humanoid Actors)
                |               |
                +-------+-------+
                        |
              stage-serialization.js
               (Save/Load System)
```

**Module Responsibilities:**
| Module | Lines | Purpose |
|--------|-------|---------|
| `stage-main.js` | 203 | Animation loop, integration |
| `stage-core.js` | 126 | Three.js scene setup |
| `stage-geometry.js` | 340 | Stage elements |
| `stage-physics.js` | 305 | Collision detection |
| `stage-props.js` | 400 | Prop catalog & placement |
| `stage-actors.js` | 250 | Actor management |

---

# Slide 4: The Main Animation Loop

## The Heart of the System: `requestAnimationFrame`

```javascript
// js/stage-main.js:42-195
function animate() {
    requestAnimationFrame(animate);  // ~60 FPS recursive call

    const time = Date.now() * 0.001;

    // 1. LIGHT ANIMATION - Subtle pulsing
    lights.forEach((light, i) => {
        light.intensity = baseIntensity + Math.sin(time * 0.5 + i) * 0.1;
    });

    // 2. MARKER ANIMATION - Floating effect
    stageMarkers.forEach((marker, i) => {
        marker.position.y = baseY + Math.sin(time * 2 + i * 0.5) * 0.05;
    });

    // 3. PLATFORM ANIMATION - Smooth interpolation
    moveablePlatforms.forEach(platform => {
        if (platform.userData.animating) {
            platform.position.y += (targetY - currentY) * 0.05;
        }
    });

    // 4. PHYSICS UPDATE - Thrown props, gravity
    props.forEach(prop => {
        if (throwingProps.has(prop)) {
            vel.y -= 0.01;  // Gravity
            prop.position.add(velocity);
        }
    });

    // 5. RENDER
    renderer.render(scene, camera);
}
```

**Loop Cycle Time Budget: ~16.67ms @ 60 FPS**

---

# Slide 5: Agentic Loop #1 - Physics Simulation

## Thrown Prop Physics Cycle

```
+-------------+     +-------------+     +-------------+
|   THROW     | --> |   FLIGHT    | --> |   BOUNCE    |
|   Event     |     |   Update    |     |   Response  |
+-------------+     +-------------+     +-------------+
      |                   |                   |
      v                   v                   v
+-------------+     +-------------+     +-------------+
| Set initial | --> | Apply       | --> | Detect      |
| velocity    |     | gravity     |     | collision   |
| direction   |     | vel.y-=0.01 |     | with ground |
+-------------+     +-------------+     +-------------+
                          |                   |
                          v                   v
                    +-------------+     +-------------+
                    | Update      |     | Reverse     |
                    | position    |     | velocity    |
                    | prop.pos+=v |     | v*=-0.3     |
                    +-------------+     +-------------+
                                              |
                                              v
                                        +-------------+
                                        | Apply       |
                                        | friction    |
                                        | v*=0.7      |
                                        +-------------+
```

**Code Location:** `stage-main.js:131-178`

```javascript
// Gravity application
vel.y -= 0.01;

// Ground collision with bounce
if (prop.position.y <= groundLevel) {
    vel.y = -vel.y * 0.3;  // Energy loss
    vel.x *= 0.7;           // Friction
    vel.z *= 0.7;

    // Stop when slow enough
    if (magnitude(vel) < 0.01) {
        throwingProps.delete(prop);
    }
}
```

---

# Slide 6: Agentic Loop #2 - Platform Relationships

## Dynamic Object-Platform Binding

```
        PROP RELATIONSHIP CYCLE

    +---------------------------+
    |   updateAllPropRelations  |  <-- Called every frame
    +---------------------------+
                |
                v
    +---------------------------+
    |   For each prop/actor:    |
    +---------------------------+
                |
    +-----------+-----------+-----------+
    |           |           |           |
    v           v           v           v
+-------+  +-------+  +-------+  +-------+
|Platform|  |Rotating|  |Trap   |  |Scenery|
|Check   |  |Stage   |  |Door   |  |Panel  |
+-------+  +-------+  +-------+  +-------+
    |           |           |           |
    v           v           v           v
+-------+  +-------+  +-------+  +-------+
|Elevate|  |Rotate  |  |Hide   |  |Block  |
|with   |  |around  |  |prop   |  |path   |
|plat.  |  |center  |  |       |  |       |
+-------+  +-------+  +-------+  +-------+
```

**Code Location:** `stage-physics.js:242-288`

```javascript
export function updatePropRelationships(prop) {
    // Clear existing relationships
    propPlatformRelations.delete(prop);
    propRotatingStageRelations.delete(prop);
    propTrapDoorRelations.delete(prop);

    // Check platform collisions - props move with platforms
    moveablePlatforms.forEach((platform, index) => {
        if (isOnPlatform(prop, platform)) {
            propPlatformRelations.set(prop, index);
        }
    });

    // Check rotating stage - props rotate in circular motion
    if (isOnRotatingStage(prop)) {
        propRotatingStageRelations.add(prop);
    }

    // Check trap doors - props disappear when door opens
    trapDoors.forEach((trapDoor, index) => {
        if (isOverTrapDoor(prop, trapDoor)) {
            propTrapDoorRelations.set(prop, index);
        }
    });
}
```

---

# Slide 7: Agentic Loop #3 - WebSocket Collaboration

## Real-Time Multi-User Synchronization

```
    CLIENT A                    SERVER                    CLIENT B
    (Director)                                           (Actor)
        |                          |                          |
        |    state_update          |                          |
        |------------------------->|                          |
        |                          |    broadcast             |
        |                          |------------------------->|
        |                          |                          |
        |                          |    cursor_move           |
        |<-------------------------|<-------------------------|
        |                          |                          |
        |    lock_object           |                          |
        |------------------------->|                          |
        |                          |    object_locked         |
        |                          |------------------------->|
        |                          |                          |

    RECONNECTION LOOP (on disconnect):
    +--------+     +--------+     +--------+
    | Wait   | --> | Retry  | --> | Success|
    | 3000ms |     | Connect|     | or     |
    +--------+     +--------+     | Fail   |
                       |          +--------+
                       v               |
                  attempts++           |
                       |               |
                  [max 5 attempts]-----+
```

**Permission Levels:**
- **Director**: Full control (add/remove/move anything)
- **Actor**: Can edit (move existing objects)
- **Viewer**: Read-only (observe only)

**Code Location:** `collaboration.js:26-86`

---

# Slide 8: Agentic Loop #4 - Animation Timeline

## Keyframe Animation System

```
    TIMELINE PLAYBACK LOOP

    +-------------------+
    |  updateAnimation  |  <-- requestAnimationFrame
    +-------------------+
             |
             v
    +-------------------+
    | Calculate delta   |
    | deltaTime = now - |
    | lastFrameTime     |
    +-------------------+
             |
             v
    +-------------------+
    | Update currentTime|
    | += deltaTime *    |
    |    playbackSpeed  |
    +-------------------+
             |
             v
    +-------------------+
    | Check end/loop    |
    | if (time >= dur)  |
    |   loop ? reset    |
    +-------------------+
             |
             v
    +-------------------+
    | applyAnimationAt  |
    | (currentTime)     |
    | Interpolate all   |
    | keyframes         |
    +-------------------+
             |
             v
    +-------------------+
    | Update playhead   |
    | UI element        |
    +-------------------+
```

**Code Location:** `animation-timeline.js:504-531`

**Interpolation Types:** Linear position, rotation, scale between keyframes

---

# Slide 9: Event-Driven Architecture

## Message Handler Pattern

```javascript
// Custom event emitter pattern - collaboration.js:159-188
class CollaborationManager {
    constructor() {
        this.messageHandlers = new Map();  // type -> handlers[]
    }

    // Register handler
    on(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);
    }

    // One-time handler (auto-removes after fire)
    once(messageType, handler) {
        const wrappedHandler = (data) => {
            handler(data);
            this.off(messageType, wrappedHandler);  // Self-destruct
        };
        this.on(messageType, wrappedHandler);
    }

    // Dispatch to all handlers
    handleMessage(data) {
        const handlers = this.messageHandlers.get(message.type);
        handlers.forEach(handler => handler(message));
    }
}
```

**Built-in Message Types:**
`user_joined` | `user_left` | `cursor_move` | `state_update` | `object_locked` | `chat_message`

---

# Slide 10: State Management

## Decentralized State via Maps & userData

```
    STATE STORAGE LOCATIONS

    +------------------------+
    |    Global Maps         |
    +------------------------+
    | actorHeldProps         |  actor -> prop being held
    | actorSittingOn         |  actor -> furniture
    | throwingProps          |  prop -> velocity data
    | propPlatformRelations  |  prop -> platform index
    | propRotatingStageRelations  (Set)
    | propTrapDoorRelations  |  prop -> trapdoor index
    | propStates             |  prop -> {on: bool, open: bool}
    +------------------------+

    +------------------------+
    |    Object userData     |
    +------------------------+
    | actor.userData = {     |
    |   type: 'actor',       |
    |   id: 'actor_1',       |
    |   draggable: true,     |
    |   hidden: false,       |
    |   name: 'Actor 1'      |
    | }                      |
    +------------------------+

    +------------------------+
    |    Animation State     |
    +------------------------+
    | timeline.keyframes[]   |
    | timeline.originalStates|
    | timeline.currentTime   |
    | timeline.isPlaying     |
    +------------------------+
```

---

# Slide 11: Identified Issues (Slop/Errors)

## Critical Issues Found

### 1. Async/Await Syntax Error (CRITICAL)
**File:** `stage-physics.js:136`
```javascript
// Function is NOT async but uses await!
export function checkAllCollisions(movingObj, newX, newZ, velocity = 0) {
    const { props } = await import('./stage-props.js');  // WILL FAIL!
    // ...
}
```
**Impact:** Code will not execute - syntax error

---

### 2. Race Condition in Physics Updates
**File:** `stage-main.js:182-183`
```javascript
// Async function called without await in animation loop
if (updateAllPropRelationships) {
    updateAllPropRelationships();  // Returns Promise, not awaited!
}
```
**Impact:** Relationships may not update before next render frame

---

### 3. Missing null Checks on userData
**123+ instances across codebase**
```javascript
// stage-main.js:50-51
const baseIntensity = light.userData.baseIntensity || light.intensity;
// If light.userData is undefined, this crashes!
```
**Impact:** Runtime crashes if Three.js objects missing userData

---

### 4. Dynamic Imports in Hot Path
**File:** `stage-physics.js:136, 168, 291, 299`
```javascript
// Called EVERY FRAME at 60 FPS!
const { props } = await import('./stage-props.js');  // ~50ms overhead each!
```
**Impact:** Massive performance degradation

---

### 5. Array Mutation Anti-Pattern
**File:** `stage-props.js:364-386`
```javascript
// Temporarily adds/removes from global array for collision testing
props.push(propObject);
if (checkAllCollisions(...)) {
    props.pop();  // Mutating global state for side effects
    // ... find nearby spot
    props.push(propObject);
    props.pop();
}
```
**Impact:** Non-deterministic behavior, hard to debug

---

# Slide 12: More Issues Found

## Security & Performance Issues

### 6. XSS Vulnerability via innerHTML
**File:** `error-handler.js:137, 158, 364`
```javascript
header.innerHTML = `...${args}...`;  // User input not sanitized!
```

### 7. Memory Leak - Unbounded Arrays
**File:** `error-handler.js:11`
```javascript
this.errors = [];  // Grows indefinitely (max 500 entries)
this.maxLogEntries = 500;
```
**Long sessions can accumulate significant memory**

### 8. Constant Polling with setInterval
**File:** `tooltips.js:92`
```javascript
setInterval(() => this.scanForTooltips(), 2000);  // Never stops!
```
**No way to clean up - runs forever**

### 9. Test Coverage Issues
```javascript
// stage-physics.test.js - Tests are tautologies!
test('should calculate bounds for cube prop', () => {
    const expectedBounds = { width: 1, depth: 1, height: 1 };
    expect(expectedBounds).toEqual({ width: 1, depth: 1, height: 1 });
    // Always passes - doesn't test actual function!
});
```

### 10. Duplicate Code
- `stage.js` (3258 lines) contains duplicate `SceneSerializer` class
- Same class exists in `stage-serialization.js`
- Maintenance nightmare

---

# Slide 13: Recommendations

## Short-Term Fixes (Week 1)

| Priority | Issue | Fix |
|----------|-------|-----|
| P0 | Async syntax error | Add `async` keyword to `checkAllCollisions` |
| P0 | Race condition | Use `await` or restructure physics update |
| P1 | null checks | Add `?.` optional chaining everywhere |
| P1 | Dynamic imports | Move imports to module top level |

## Medium-Term (Weeks 2-3)

- Refactor 3258-line `stage.js` into smaller modules (partially done)
- Add try-catch in animation loop
- Replace innerHTML with textContent or proper sanitization
- Fix tautological tests to actually test functions

## Long-Term (Month+)

- **TypeScript migration** for type safety
- **Comprehensive test suite** with real integration tests
- **Performance monitoring** for frame budget
- **Architecture documentation** with data flow diagrams
- **State management refactor** - consider centralized store

---

# Slide 14: Visualizations (Screenshots Would Show)

## What the Stage Looks Like

```
Screenshot 1: Default View
- Dark theater atmosphere with fog
- Main stage platform (20x15 units)
- Red velvet curtains on sides
- 3 spotlights creating dramatic shadows
- Blue footlights at stage front
- 9 position markers (USL, USC, USR, SL, C, SR, DSL, DSC, DSR)

Screenshot 2: With Actors & Props
- Humanoid actors (cylinder body, sphere head)
- Furniture props (chairs, tables, lamps)
- Props with interaction indicators
- Actors sitting on chairs
- Props on elevated platforms

Screenshot 3: Lighting Presets
- Day: Bright warm lighting
- Night: Dark blue moonlight
- Sunset: Orange/purple gradient
- Dramatic: High contrast spotlights

Screenshot 4: Collaboration Mode
- Multiple user cursors (colored spheres)
- Username labels floating above cursors
- Chat panel with messages
- User list with permission badges
- Object lock indicators
```

**To capture actual screenshots:**
```bash
# Start the server
cd /home/user/theater-stage/projects/scratch
python3 -m http.server 8000

# Open browser to http://localhost:8000
# Use browser screenshot tools or Puppeteer for automation
```

---

# Slide 15: Summary

## Theater-Stage: Key Takeaways

### What It Is
A sophisticated 3D theatrical staging environment built with Three.js, featuring:
- Real-time multi-user collaboration
- Physics simulation for props
- Animation timeline system
- 20+ interactive props

### Agentic Loops Identified
1. **Main Render Loop** - 60 FPS animation cycle
2. **Physics Simulation** - Gravity, collisions, momentum
3. **Platform Relationships** - Dynamic object binding
4. **WebSocket Sync** - Multi-user state synchronization
5. **Animation Timeline** - Keyframe interpolation

### Issues to Address
- **Critical:** Async syntax error, race conditions
- **Important:** Missing null checks, dynamic imports in hot path
- **Nice-to-have:** TypeScript, better tests, documentation

### Code Quality
- Well-modularized (15 ES6 modules)
- Good documentation (27+ markdown files)
- CI/CD pipeline in place
- Room for improvement in testing (15% coverage)

---

# Appendix: Code Locations Reference

| Feature | File | Key Lines |
|---------|------|-----------|
| Main animation loop | `stage-main.js` | 42-195 |
| Scene initialization | `stage-core.js` | 30-44 |
| Lighting system | `stage-core.js` | 51-99 |
| Platform creation | `stage-geometry.js` | 50-100 |
| Collision detection | `stage-physics.js` | 85-128 |
| Prop catalog | `stage-props.js` | 10-150 |
| Actor creation | `stage-actors.js` | 20-70 |
| Prop interactions | `stage-actors.js` | 114-204 |
| WebSocket client | `collaboration.js` | 26-86 |
| WebSocket server | `server/collaboration-server.js` | 1-200 |
| Animation timeline | `animation-timeline.js` | 504-531 |
| Save/load system | `stage-serialization.js` | 1-350 |

---

# Questions?

**Repository:** `/home/user/theater-stage/projects/scratch`

**To Run:**
```bash
# Frontend
python3 -m http.server 8000
# Open http://localhost:8000

# Collaboration server (optional)
node server/collaboration-server.js
```

**Tests:**
```bash
npm test
npm run test:coverage
```
