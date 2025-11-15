# Example Actor Scripts

This directory contains example scripts demonstrating the AI Actor Movement and Scripting System.

## Script Format

Scripts are JSON files with the following structure:

```json
{
  "actor_id": [
    {
      "action": "action_type",
      "parameter": "value",
      ...
    }
  ]
}
```

## Available Actions

### Movement Commands

#### `walk_to`
Move actor to a position.

**Parameters:**
- `position` (string|object): Target position
  - Stage markers: "USL", "USC", "USR", "SL", "C", "SR", "DSL", "DSC", "DSR"
  - Prop reference: "prop_1", "prop_2", etc.
  - Coordinates: `{"x": 0, "z": 0}`
- `speed` (string): Movement speed - "slow", "normal", "fast", "run"

**Example:**
```json
{
  "action": "walk_to",
  "position": "DSC",
  "speed": "normal"
}
```

#### `turn` / `face`
Turn actor to face a direction.

**Parameters:**
- `direction` (string): Direction to face
  - "audience" or "front" - Face forward (positive Z)
  - "upstage" or "back" - Face backward (negative Z)
  - "stage-left" or "left" - Face left (negative X)
  - "stage-right" or "right" - Face right (positive X)

**Example:**
```json
{
  "action": "turn",
  "direction": "audience"
}
```

### Action Commands

#### `wait`
Pause for a specified duration.

**Parameters:**
- `duration` (number): Wait time in seconds

**Example:**
```json
{
  "action": "wait",
  "duration": 2
}
```

#### `gesture`
Perform a gesture (placeholder animation).

**Parameters:**
- `duration` (number): Gesture duration in seconds (default: 1)

**Example:**
```json
{
  "action": "gesture",
  "duration": 1.5
}
```

#### `sit` / `stand`
Sitting/standing actions (placeholder animations).

**Parameters:**
- `duration` (number): Action duration in seconds (default: 1)

**Example:**
```json
{
  "action": "sit",
  "duration": 2
}
```

## Example Scripts

### 1. simple-walk.json
A single actor walks from downstage center to upstage center, pausing and gesturing.

**Usage:**
1. Place one actor on stage
2. Load this script
3. Watch the actor perform a simple routine

### 2. two-actor-scene.json
Two actors perform coordinated movements across the stage.

**Usage:**
1. Place two actors on stage
2. Ensure they have IDs "actor_1" and "actor_2"
3. Load this script
4. Watch both actors move independently

### 3. prop-interaction.json
Actor walks to a prop and performs sitting actions.

**Usage:**
1. Place one actor on stage
2. Place a prop (e.g., chair) - it will get ID "prop_1"
3. Load this script
4. Watch the actor walk to the prop

### 4. speed-demo.json
Demonstrates different movement speeds (run, walk, slow).

**Usage:**
1. Place one actor on stage
2. Load this script
3. Watch the actor move at different speeds around the stage

## Stage Position Reference

```
    USL -------- USC -------- USR
     |            |            |
     |            |            |
     SL --------- C ---------- SR
     |            |            |
     |            |            |
    DSL -------- DSC -------- DSR
    
    (Audience viewing from bottom/DSC side)
```

## Creating Custom Scripts

1. Start with one of the example scripts
2. Modify the actor IDs to match your scene
3. Add or change actions as needed
4. Save as a .json file
5. Load in the application using the "Load Script" button

## Tips

- Actions execute sequentially in the order listed
- Multiple actors can have scripts running simultaneously
- Use `wait` actions to create pauses and timing
- The pathfinding system will automatically navigate around obstacles
- Scripts stop if an actor ID is not found in the scene
- Use the "Stop Script" button to halt execution at any time
