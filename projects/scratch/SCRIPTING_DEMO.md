# AI Actor Scripting System - Demo Scenarios

This document provides step-by-step demonstrations of the AI Actor Scripting System.

## Demo 1: Single Actor Simple Walk

**Objective**: Demonstrate basic movement and turning

**Setup**:
1. Open the application
2. Click "Toggle Curtains" to open
3. Click "Toggle Markers" to show stage positions
4. Click "Place Actor" then click on center stage
5. Verify actor_1 appears on stage

**Script**: Load `example-scripts/simple-walk.json`

**Expected Behavior**:
- Actor walks from current position to Downstage Center (DSC) at normal speed
- Actor turns to face the audience
- Actor pauses for 2 seconds
- Actor performs a gesture for 1 second
- Actor walks to Upstage Center (USC) at slow speed
- Actor turns to face the audience again

**Duration**: ~10-15 seconds

---

## Demo 2: Two Actor Choreography

**Objective**: Demonstrate multi-actor coordination

**Setup**:
1. Open the application with curtains open and markers visible
2. Place two actors on opposite sides of the stage
3. Note their IDs should be actor_1 and actor_2

**Script**: Load `example-scripts/two-actor-scene.json`

**Expected Behavior**:

**Actor 1**:
- Walks to Stage Left (SL) at normal speed
- Turns to face right
- Waits 1 second
- Walks to Stage Right (SR) at normal speed
- Turns to face left
- Waits 1 second
- Walks to Center (C) at fast speed
- Turns to face audience

**Actor 2** (delayed start):
- Waits 2 seconds (while actor 1 is moving)
- Walks to Downstage Left (DSL) at slow speed
- Turns to face audience
- Performs gesture for 1.5 seconds
- Walks to Downstage Right (DSR) at normal speed
- Turns to face stage left

**Duration**: ~20-25 seconds

---

## Demo 3: Prop Interaction

**Objective**: Demonstrate actor-prop positioning

**Setup**:
1. Open application with curtains open
2. Select "Chair" from prop dropdown
3. Click "Place Prop" and place a chair at stage right
4. Note the prop ID (should be prop_1)
5. Click "Place Actor" and place actor at stage left

**Script**: Load `example-scripts/prop-interaction.json`

**Expected Behavior**:
- Actor walks to the chair (prop_1) at normal speed
- Actor turns to face audience
- Actor performs "sit" action for 2 seconds
- Actor performs "stand" action for 1 second
- Actor walks to center stage at slow speed

**Duration**: ~12-15 seconds

---

## Demo 4: Speed Variations

**Objective**: Demonstrate all speed settings

**Setup**:
1. Open application with curtains open and markers visible
2. Place one actor at center stage

**Script**: Load `example-scripts/speed-demo.json`

**Expected Behavior**:
- Actor runs to Downstage Left (DSL) - very fast
- Actor runs to Downstage Right (DSR) - very fast
- Actor runs to Upstage Right (USR) - very fast
- Actor runs to Upstage Left (USL) - very fast
- Actor walks slowly to Center (C) - very slow
- Actor turns to face audience
- Actor performs gesture for 2 seconds

**Duration**: ~15-20 seconds

**Observation**: Notice the dramatic speed difference between "run" and "slow"

---

## Advanced Demo: Custom Script

**Objective**: Create a custom performance

**Custom Script Example** - Save as `my-performance.json`:

```json
{
  "actor_1": [
    {"action": "walk_to", "position": "USL", "speed": "fast"},
    {"action": "turn", "direction": "audience"},
    {"action": "gesture", "duration": 2},
    {"action": "walk_to", "position": {"x": 0, "z": -2}, "speed": "slow"},
    {"action": "turn", "direction": "stage-right"},
    {"action": "wait", "duration": 1},
    {"action": "walk_to", "position": "DSC", "speed": "run"},
    {"action": "turn", "direction": "audience"},
    {"action": "gesture", "duration": 3}
  ],
  "actor_2": [
    {"action": "wait", "duration": 5},
    {"action": "walk_to", "position": "SR", "speed": "normal"},
    {"action": "turn", "direction": "left"},
    {"action": "wait", "duration": 2},
    {"action": "walk_to", "position": "C", "speed": "slow"},
    {"action": "turn", "direction": "audience"}
  ]
}
```

**Expected Behavior**:
- Actor 1 starts immediately with fast movement
- Actor 2 waits 5 seconds before starting
- Both actors converge toward center from different paths
- Different speeds create dramatic effect
- Coordinated timing between actors

---

## Troubleshooting Common Issues

### Issue: Actor doesn't appear
**Solution**: Ensure you placed an actor before loading the script

### Issue: Script loads but nothing happens
**Solution**: 
- Check browser console for errors
- Verify actor IDs in script match actors in scene
- Ensure script file is valid JSON

### Issue: Actor stops moving mid-script
**Solution**:
- Check for collision with props or scenery
- Verify position references (stage markers or props) are valid
- Check console for pathfinding errors

### Issue: Multiple actors collide
**Solution**:
- Add wait actions to stagger movements
- Use different paths for different actors
- Adjust positions to avoid overlap

---

## Performance Tips

1. **Start Simple**: Begin with single-actor, few-action scripts
2. **Test Incrementally**: Add one action at a time
3. **Use Console**: Monitor console.log output for debugging
4. **Timing Matters**: Use wait actions to coordinate actors
5. **Speed Variation**: Mix speeds for dramatic effect
6. **Save Scenes**: Use Save Scene to preserve your stage setup

---

## Next Steps

1. Try each demo in sequence
2. Modify example scripts to experiment
3. Create your own multi-actor choreography
4. Combine with props, platforms, and scenery
5. Use different camera angles to view performances
6. Save successful scenes for later playback

---

## Technical Notes

### Coordinate System
- X-axis: Stage left (-) to stage right (+)
- Z-axis: Upstage (-) to downstage (+)
- Y-axis: Height (handled automatically for movement)

### Speed Values
- Slow: 1.0 units/second
- Normal: 2.0 units/second
- Fast: 3.5 units/second
- Run: 5.0 units/second

### Rotation Directions
- Audience/Front: 0 radians (facing +Z)
- Upstage/Back: π radians (facing -Z)
- Stage-Left/Left: π/2 radians (facing -X)
- Stage-Right/Right: -π/2 radians (facing +X)
