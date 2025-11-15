# AI Actor Movement and Scripting System - Quick Start Guide

## Overview

The AI Actor Movement and Scripting System allows you to create choreographed performances by scripting actor movements and actions using JSON files.

## Getting Started

### 1. Setup the Stage

1. Open the application in a web browser
2. Open the curtains using the "Toggle Curtains" button
3. Toggle stage markers ON to see position references
4. Place one or more actors on stage using the "Place Actor" button

### 2. Load a Script

1. Click the **"Load Script"** button in the Actor Scripts section
2. Select one of the example scripts from the `example-scripts/` folder
3. The script will automatically start executing

### 3. Watch the Performance

- Actors will move according to the script
- Different speeds will be visible (slow, normal, fast, run)
- Actors will turn to face different directions
- Actions like gestures will be performed

### 4. Control Execution

- Click **"Stop Script"** to halt all actor movements immediately
- Load a new script to run a different performance

## Script Format

Scripts are JSON files with this structure:

```json
{
  "actor_1": [
    {
      "action": "walk_to",
      "position": "DSC",
      "speed": "normal"
    },
    {
      "action": "turn",
      "direction": "audience"
    },
    {
      "action": "wait",
      "duration": 2
    }
  ]
}
```

### Key Components

- **Actor ID**: Must match an actor's ID in the scene (e.g., "actor_1", "actor_2")
- **Actions**: Array of sequential actions to perform
- **Action Types**: walk_to, turn, face, wait, gesture, sit, stand

## Available Actions

### Movement Actions

#### walk_to
```json
{
  "action": "walk_to",
  "position": "C",           // Stage marker, prop ID, or coordinates
  "speed": "normal"           // slow, normal, fast, or run
}
```

**Position Options:**
- Stage markers: "USL", "USC", "USR", "SL", "C", "SR", "DSL", "DSC", "DSR"
- Props: "prop_1", "prop_2", etc.
- Coordinates: `{"x": 0, "z": 0}`

**Speed Options:**
- `"slow"` - 1.0 units/second (leisurely walk)
- `"normal"` - 2.0 units/second (standard walk)
- `"fast"` - 3.5 units/second (brisk walk)
- `"run"` - 5.0 units/second (running)

#### turn / face
```json
{
  "action": "turn",
  "direction": "audience"     // audience, upstage, stage-left, stage-right
}
```

**Direction Options:**
- `"audience"` or `"front"` - Face the audience
- `"upstage"` or `"back"` - Face upstage
- `"stage-left"` or `"left"` - Face stage left
- `"stage-right"` or `"right"` - Face stage right

### Timing Actions

#### wait
```json
{
  "action": "wait",
  "duration": 2               // Duration in seconds
}
```

### Animation Actions

#### gesture
```json
{
  "action": "gesture",
  "duration": 1               // Duration in seconds
}
```

#### sit / stand
```json
{
  "action": "sit",
  "duration": 2
}
```

## Example Scenarios

### Single Actor Introduction
```json
{
  "actor_1": [
    {"action": "walk_to", "position": "DSC", "speed": "normal"},
    {"action": "turn", "direction": "audience"},
    {"action": "gesture", "duration": 2},
    {"action": "wait", "duration": 1}
  ]
}
```

### Two Actors Meeting
```json
{
  "actor_1": [
    {"action": "walk_to", "position": "SL", "speed": "normal"},
    {"action": "wait", "duration": 3},
    {"action": "walk_to", "position": "C", "speed": "slow"}
  ],
  "actor_2": [
    {"action": "wait", "duration": 1},
    {"action": "walk_to", "position": "SR", "speed": "normal"},
    {"action": "wait", "duration": 1},
    {"action": "walk_to", "position": "C", "speed": "slow"}
  ]
}
```

### Actor with Props
```json
{
  "actor_1": [
    {"action": "walk_to", "position": "prop_1", "speed": "normal"},
    {"action": "turn", "direction": "audience"},
    {"action": "sit", "duration": 2},
    {"action": "stand", "duration": 1},
    {"action": "walk_to", "position": "DSC", "speed": "normal"}
  ]
}
```

## Stage Position Reference

```
Upstage (Back)
USL -------- USC -------- USR
 |            |            |
 |            |            |
SL ---------- C ---------- SR
 |            |            |
 |            |            |
DSL -------- DSC -------- DSR
Downstage (Front - Audience)
```

## Pathfinding

The system includes automatic pathfinding:
- Actors navigate around props and scenery
- Multiple waypoint paths are calculated when obstacles block direct routes
- Collision detection prevents actors from overlapping

## Tips for Creating Scripts

1. **Start Simple**: Begin with a single actor and a few actions
2. **Use Wait Actions**: Create pauses for dramatic effect
3. **Test Incrementally**: Add actions one at a time and test
4. **Match Actor IDs**: Ensure actor IDs in script match those in the scene
5. **Use Stage Markers**: Leverage standard positions for consistent blocking
6. **Vary Speeds**: Use different speeds to convey emotion and urgency
7. **Coordinate Timing**: Use `wait` to synchronize multiple actors

## Troubleshooting

### Script won't load
- Check JSON syntax (use a JSON validator)
- Ensure actor IDs match actors in the scene
- Verify all required fields are present

### Actor doesn't move
- Check that the actor ID exists in the scene
- Verify position strings are valid stage markers
- Ensure the script has started (check console for messages)

### Actors collide
- Pathfinding tries to avoid obstacles but isn't perfect
- Adjust positions or add waypoints
- Use `wait` actions to stagger movements

### Script stops unexpectedly
- Check browser console for errors
- Verify all action parameters are valid
- Ensure position references (props) exist

## Advanced Usage

### Custom Positions
Use exact coordinates for precise positioning:
```json
{
  "action": "walk_to",
  "position": {"x": 3.5, "z": -2.0},
  "speed": "normal"
}
```

### Complex Choreography
Combine multiple action types:
```json
{
  "actor_1": [
    {"action": "walk_to", "position": "USL", "speed": "run"},
    {"action": "turn", "direction": "audience"},
    {"action": "gesture", "duration": 1},
    {"action": "walk_to", "position": "DSR", "speed": "slow"},
    {"action": "turn", "direction": "stage-left"},
    {"action": "wait", "duration": 2}
  ]
}
```

## Next Steps

1. Try the included example scripts
2. Modify an example to learn the format
3. Create your own custom script
4. Experiment with multiple actors
5. Combine with props and scenery for complete scenes

## Support

For issues or questions:
- Check the example scripts in `example-scripts/`
- Review the README.md in the `example-scripts/` folder
- Check browser console for error messages
