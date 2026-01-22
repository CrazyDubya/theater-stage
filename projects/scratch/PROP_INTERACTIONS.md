# Advanced Prop Interaction System

## Overview

The Advanced Prop Interaction System allows actors to interact with props in realistic ways beyond simple collision detection. This system enables pick up/put down, carrying, sitting, throwing, and state changes for various prop types.

## Features

### 1. Pick Up/Put Down Props
Actors can pick up grabbable props and carry them, then put them down at a new location.

**Requirements:**
- Prop must have `interactions.grabbable: true`
- Actor must be within 2 units of the prop
- Actor cannot already be holding another prop

**Examples:**
- Cube, Sphere, Cylinder (basic shapes)
- Crate, Barrel (stage props)
- Potted Plant (decorative)

### 2. Carry Props While Moving
When an actor holds a prop, it automatically follows the actor's position at chest height (y + 1.5) and slightly in front (z - 0.8).

**Behavior:**
- Held props skip normal physics (platforms, rotation, etc.)
- Props are positioned relative to actor in real-time
- Other physics resume when prop is released

### 3. Sit On Furniture
Actors can sit on furniture props that are marked as sittable.

**Requirements:**
- Prop must have `interactions.sittable: true`
- Actor must be within 2 units of the furniture
- No other actor can be sitting on the same furniture

**Examples:**
- Chair (seat height: 0.5)

**Behavior:**
- Actor position moves to furniture location
- Actor y-position set to seat height
- Actor remains seated until standing up

### 4. Throw/Catch Mechanics
Actors can throw props with physics simulation including gravity, collision, and bounce.

**Requirements:**
- Prop must have `interactions.throwable: true`
- Actor must be holding the prop
- Prop must be grabbable

**Examples:**
- Cube, Sphere, Cylinder (basic shapes)

**Physics:**
- Initial upward velocity: 2 units/frame
- Horizontal velocity: configurable (default 5)
- Gravity: -9.8 units/frame²
- Bounce friction: 0.3 (loses 70% velocity on impact)
- Stops when velocity < 0.1

### 5. Open/Close Prop Doors
Door props can be opened and closed with visual rotation animation.

**Requirements:**
- Prop type must be 'door'
- Prop must have `interactions.openable: true`

**Behavior:**
- Closed: Door panel at rotation y = 0
- Open: Door panel rotates 90° (y = π/2)
- Position adjusts for pivot point

### 6. Prop State Changes
Props with toggleable states can be switched between modes (on/off, etc.)

**Examples:**
- Lamp: toggles between 'off' and 'on'
  - Off: Normal shade color (0xFFFFE0)
  - On: Bright yellow (0xFFFF99) with emissive glow

**Requirements:**
- Prop must have `interactions.toggleable: true` or `interactions.openable: true`
- States defined in `interactions.states` array

## Prop Catalog Interactions

### Basic Shapes
```javascript
cube, sphere, cylinder: {
    interactions: {
        grabbable: true,
        throwable: true
    }
}
```

### Furniture
```javascript
chair: {
    interactions: {
        sittable: true,
        seatHeight: 0.5
    }
}

door: {
    interactions: {
        openable: true,
        states: ['closed', 'open']
    }
}
```

### Stage Props
```javascript
box, barrel: {
    interactions: {
        grabbable: true,
        throwable: false  // Too heavy to throw
    }
}
```

### Decorative
```javascript
plant: {
    interactions: {
        grabbable: true,
        throwable: false
    }
}

lamp: {
    interactions: {
        toggleable: true,
        states: ['off', 'on']
    }
}
```

## Usage Guide

### UI Controls

1. **Select Actor** - Click to enter selection mode, then click an actor
2. **Select Prop** - Click to enter selection mode, then click a prop
3. **Pick Up** - Selected actor picks up selected prop (if nearby and grabbable)
4. **Put Down** - Selected actor releases held prop
5. **Throw** - Selected actor throws held prop forward (if throwable)
6. **Sit** - Selected actor sits on selected furniture (if nearby and sittable)
7. **Stand Up** - Selected actor stands up from furniture
8. **Toggle Prop State** - Toggle selected prop's state (lamp on/off, door open/close)

### Workflow Example

```
1. Click "Place Actor" and click stage to place actor
2. Click "Prop Type" dropdown and select "Cube"
3. Click "Place Prop" and click stage to place cube
4. Click "Select Actor" then click the actor
5. Click "Select Prop" then click the cube
6. Click "Pick Up" - actor picks up cube
7. Move actor around - cube follows
8. Click "Throw" - actor throws cube with physics
```

### Console Commands

The interaction functions are available globally and can be called from the browser console:

```javascript
// Pick up a prop
pickUpProp(actors[0], props[0]);

// Put down held prop
putDownProp(actors[0]);

// Throw prop forward with force 5
throwProp(actors[0], new THREE.Vector3(0, 0, -1), 5);

// Sit on furniture
sitOnProp(actors[0], props[1]);

// Stand up
standUpFromProp(actors[0]);

// Toggle lamp
togglePropState(props[2]);

// Toggle door
toggleDoorState(props[3]);
```

## Implementation Details

### Data Structures

```javascript
// Tracking maps
let actorHeldProps = new Map();     // actor -> prop being held
let actorSittingOn = new Map();     // actor -> furniture prop
let propStates = new Map();         // prop -> {currentState: 'on'}
let throwingProps = new Map();      // prop -> {velocity, thrownBy, gravity}
```

### Animation Loop Integration

The interaction system integrates into the main animation loop:

1. **Held Props**: Update position relative to actor
2. **Thrown Props**: Apply gravity and collision physics
3. **Sitting Actors**: Maintain seated position
4. **Prop States**: Apply visual changes based on state

### Physics Interaction

The interaction system works alongside existing physics:
- Held/thrown props skip platform elevation
- Thrown props respect collision boundaries
- Props return to normal physics when released
- State changes persist through physics updates

## Extension Guide

### Adding New Interactable Props

1. Define prop in `PROP_CATALOG` with interaction properties:
```javascript
myProp: {
    name: 'My Prop',
    category: 'custom',
    create: () => { /* geometry */ },
    y: 0,
    interactions: {
        grabbable: true,
        throwable: true,
        // or sittable, toggleable, openable
    }
}
```

2. For stateful props, initialize state in `addPropAt()`:
```javascript
if (propDef.interactions.toggleable) {
    propStates.set(propObject, {
        currentState: propDef.interactions.states[0]
    });
}
```

3. For custom state changes, extend `togglePropState()`:
```javascript
if (prop.userData.propType === 'myProp') {
    // Apply visual changes
    prop.traverse(child => {
        if (state.currentState === 'on') {
            // Turn on logic
        }
    });
}
```

### Adding New Interaction Types

1. Create tracking data structure
2. Implement interaction function with validation
3. Add physics/animation logic in `animate()` loop
4. Add UI controls in `setupUI()`
5. Update click handler for selection if needed

## Testing

Run the test script to validate interaction logic:

```bash
node /tmp/test_interactions.js
```

Tests cover:
- ✓ Pick up prop
- ✓ Put down prop
- ✓ Throw prop with physics
- ✓ Sit on chair
- ✓ Stand up
- ✓ Toggle lamp state
- ✓ Toggle door state

## Compatibility

- Maintains backward compatibility with all existing stage features
- Works with platforms, rotating stage, trap doors, and scenery panels
- Props resume normal physics when released or not in special state
- No breaking changes to existing prop placement or physics systems

## Future Enhancements

Potential additions to the interaction system:
- Multi-hand carrying (large props require two actors)
- Prop stacking (place props on top of other props)
- Prop attachment points (specific grab locations)
- Animated throwing (wind-up, release animations)
- Catch mechanics (auto-catch thrown props nearby)
- Prop combination (use one prop on another)
- Actor inventory system (carry multiple small items)
- Context-sensitive interactions (different actions per prop type)
