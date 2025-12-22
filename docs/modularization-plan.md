# Stage.js Modularization Plan

## Current State

**File:** `projects/scratch/js/stage.js`
**Size:** ~3,258 lines
**Status:** Monolithic structure with all functionality in one file

## Challenges

1. **Legacy Global Variables**: Heavy use of `let` and `var` at file scope
2. **Interdependencies**: Functions rely on shared global state
3. **Three.js Integration**: Direct manipulation of scene objects
4. **Breaking Changes Risk**: High risk of breaking existing functionality

## Strategy: Gradual Refactoring

Instead of a complete rewrite, we'll use a **hybrid approach** that maintains backward compatibility while improving code organization.

---

## Phase 1: Extract Utilities (✅ Implemented)

### Modules Created:
- `error-handler.js` - Error handling and logging
- `tooltips.js` - UI tooltip system
- `ui-enhancements.js` - UI improvements
- `expanded-prop-library.js` - Prop definitions
- `animation-timeline.js` - Animation system
- `sound-system.js` - Audio management
- `stage-types.js` - Stage configurations

### Benefits:
- Reduced main file complexity
- Isolated concerns
- Easier testing and maintenance

---

## Phase 2: Create Helper Modules (Recommended Next Steps)

### 2.1 Physics Module
**File:** `js/modules/physics.js`
**Purpose:** Extract collision detection and physics calculations
**Functions to move:**
- `checkCollision()`
- `checkAllCollisions()`
- `updatePropRelationships()`
- `updatePlatformPhysics()`

### 2.2 Camera Module
**File:** `js/modules/camera.js`
**Purpose:** Camera management and presets
**Functions to move:**
- `setCameraPreset()`
- `updateCamera()`
- Camera initialization

### 2.3 Lighting Module
**File:** `js/modules/lighting.js`
**Purpose:** Lighting presets and management
**Functions to move:**
- `applyLightingPreset()`
- `createLights()`
- Spotlight management

### 2.4 Actor Module
**File:** `js/modules/actor.js`
**Purpose:** Actor creation and management
**Functions to move:**
- `addActorAt()`
- `createActor()`
- Actor animation/movement

### 2.5 Prop Module
**File:** `js/modules/prop.js`
**Purpose:** Prop interaction system
**Functions to move:**
- `addPropAt()`
- `pickUpProp()`
- `throwProp()`
- `sitOnProp()`
- `togglePropState()`

---

## Phase 3: Service Layer Pattern

Create a **central service manager** that coordinates between modules:

```javascript
class StageManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Services
        this.physicsService = new PhysicsService(this);
        this.actorService = new ActorService(this);
        this.propService = new PropService(this);
        this.lightingService = new LightingService(this);
        this.cameraService = new CameraService(this);
    }

    init() {
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupEventListeners();
        this.animate();
    }
}
```

---

## Phase 4: State Management

Implement a **centralized state store**:

```javascript
class StateManager {
    constructor() {
        this.state = {
            actors: [],
            props: [],
            lights: [],
            stageElements: {},
            ui: {},
            settings: {}
        };

        this.subscribers = new Map();
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }

    setState(key, value) {
        this.state[key] = value;
        this.notify(key);
    }

    notify(key) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(cb => cb(this.state[key]));
        }
    }
}
```

---

## Implementation Roadmap

### ✅ Completed
- [x] Error handling system
- [x] UI enhancements extracted
- [x] Prop library extracted
- [x] Advanced features modularized (timeline, sound, stage types)

### 🔄 In Progress
- [ ] Create utility modules (physics, camera, lighting)
- [ ] Document API interfaces

### 📋 Future Work
- [ ] Service layer implementation
- [ ] State management system
- [ ] Full refactor of stage.js
- [ ] TypeScript migration (optional)

---

## File Structure (Proposed)

```
js/
├── stage.js (legacy, gradually deprecate)
├── main.js (new entry point)
├── error-handler.js ✓
├── modules/
│   ├── core/
│   │   ├── stage-manager.js
│   │   ├── state-manager.js
│   │   └── event-bus.js
│   ├── services/
│   │   ├── physics-service.js
│   │   ├── actor-service.js
│   │   ├── prop-service.js
│   │   ├── lighting-service.js
│   │   └── camera-service.js
│   └── utils/
│       ├── math-utils.js
│       ├── geometry-utils.js
│       └── validation.js
├── systems/
│   ├── animation-timeline.js ✓
│   ├── sound-system.js ✓
│   ├── stage-types.js ✓
│   └── collaboration.js ✓
└── ui/
    ├── tooltips.js ✓
    ├── ui-enhancements.js ✓
    └── tutorial.js ✓
```

---

## Migration Strategy

### Step 1: Create Parallel Modules
- New modules coexist with stage.js
- No breaking changes to existing code
- Gradual feature migration

### Step 2: Facade Pattern
```javascript
// stage.js becomes a facade
window.addActor = (...args) => stageManager.actorService.add(...args);
window.addProp = (...args) => stageManager.propService.add(...args);
```

### Step 3: Deprecation Notices
```javascript
console.warn('addActor is deprecated. Use stageManager.actorService.add() instead');
```

### Step 4: Full Migration
- Remove stage.js
- Update all references
- Test thoroughly

---

## Best Practices

### 1. **Single Responsibility**
Each module should have one clear purpose.

### 2. **Dependency Injection**
Pass dependencies explicitly:
```javascript
class ActorService {
    constructor(scene, physicsService) {
        this.scene = scene;
        this.physics = physicsService;
    }
}
```

### 3. **Event-Driven Communication**
Use event bus for loose coupling:
```javascript
eventBus.emit('actor:created', actor);
eventBus.on('actor:created', (actor) => { /* handle */ });
```

### 4. **Consistent API**
All services follow the same pattern:
```javascript
class Service {
    create(options) { }
    update(id, options) { }
    delete(id) { }
    get(id) { }
    getAll() { }
}
```

### 5. **Type Safety (Future)**
Consider TypeScript for better developer experience:
```typescript
interface Actor {
    id: string;
    position: Vector3;
    rotation: Euler;
    // ...
}
```

---

## Performance Considerations

### 1. **Lazy Loading**
Load modules only when needed:
```javascript
const loadPhysics = () => import('./modules/physics-service.js');
```

### 2. **Memoization**
Cache expensive calculations:
```javascript
const memoizedCollisionCheck = memoize(checkCollision);
```

### 3. **Object Pooling**
Reuse objects to reduce GC pressure:
```javascript
const propPool = new ObjectPool(() => createProp());
```

---

## Testing Strategy

### Unit Tests
```javascript
describe('ActorService', () => {
    it('should create actor at position', () => {
        const actor = actorService.create({ x: 0, y: 0, z: 0 });
        expect(actor.position.x).toBe(0);
    });
});
```

### Integration Tests
```javascript
describe('Stage Integration', () => {
    it('should handle actor-prop interaction', () => {
        const actor = actorService.create();
        const prop = propService.create();
        actorService.pickUp(actor, prop);
        expect(actor.holding).toBe(prop);
    });
});
```

---

## Backward Compatibility

### Maintain Global API
```javascript
// Legacy support
window.actors = stateManager.state.actors;
window.props = stateManager.state.props;
window.addActor = stageManager.actorService.create.bind(stageManager.actorService);
```

### Deprecation Warnings
```javascript
Object.defineProperty(window, 'actors', {
    get() {
        console.warn('Direct access to window.actors is deprecated');
        return stateManager.state.actors;
    }
});
```

---

## Documentation Requirements

For each module:
1. **Purpose** - What does it do?
2. **API** - Public methods and properties
3. **Dependencies** - What does it need?
4. **Events** - What events does it emit/listen to?
5. **Examples** - Usage examples

---

## Timeline Estimate

- **Phase 2 (Helpers):** 2-3 weeks
- **Phase 3 (Services):** 3-4 weeks
- **Phase 4 (State):** 2-3 weeks
- **Testing & Migration:** 2-3 weeks

**Total:** 9-13 weeks for complete refactor

---

## Conclusion

The current codebase works well but would benefit from modularization for:
- **Maintainability** - Easier to understand and modify
- **Testability** - Isolated units for testing
- **Scalability** - Add features without bloating main file
- **Collaboration** - Multiple developers can work on different modules

However, a full refactor should be **gradual and careful** to avoid breaking existing functionality. The hybrid approach outlined here provides a path forward without requiring a complete rewrite.

---

## Next Steps

1. ✅ Complete Phase 1 (utilities extracted)
2. 🔄 Create documentation for existing modules
3. 📋 Plan Phase 2 implementation
4. 📋 Set up testing framework
5. 📋 Begin gradual migration

**Status:** Foundation complete, ready for systematic modularization when time permits.
