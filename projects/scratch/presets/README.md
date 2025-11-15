# Stage Preset Templates

This directory contains preset stage configurations for common theatrical scenarios. These templates can be loaded through the UI to quickly set up your stage with predefined actors, props, lighting, and stage elements.

## Available Presets

### 1. Empty Stage (`empty-stage.json`)
A clean, empty stage with default lighting and no props or actors. Perfect for starting from scratch.

**Features:**
- Default lighting
- All platforms at base level
- Curtains closed
- Stage markers visible

### 2. Living Room Scene (`living-room.json`)
A cozy living room setup with furniture and warm lighting.

**Features:**
- 2 actors positioned in chairs
- Chairs and table arrangement
- Decorative plants and lamps
- Sunset lighting for warm ambiance
- Backdrop scenery panel at 50%

### 3. Outdoor Park (`outdoor-park.json`)
An outdoor park setting with natural elements and day lighting.

**Features:**
- 2 actors facing each other
- Plants positioned around the stage
- Barrels for decoration
- Bright day lighting
- Open curtains

### 4. Office Setting (`office-setting.json`)
A professional office environment with workstations.

**Features:**
- 3 actors at different positions
- Multiple desk and chair workstations
- Storage crate and decorative plant
- Default lighting
- Backdrop scenery panel at 50%

### 5. Restaurant/Cafe (`restaurant-cafe.json`)
A dining establishment with multiple table arrangements.

**Features:**
- 3 actors (guests and staff)
- Multiple dining tables with chairs
- Decorative plants and ambient lamp
- Warm sunset lighting
- Backdrop scenery panel at 50%

### 6. Classical Theater (`classical-theater.json`)
A traditional theater setup with dramatic staging.

**Features:**
- 3 actors in classic blocking positions
- Minimal props (chairs and stage lamps)
- Dramatic lighting
- Rotating stage visible
- Trap doors visible
- Full backdrop and 50% midstage scenery panels
- Stage markers visible for blocking

## Usage

1. Open the 3D Theater Stage application
2. Navigate to the "Preset Templates" section in the control panel
3. Select a preset from the dropdown menu
4. Click "Load Preset"
5. Confirm to clear the current scene and load the template

## File Format

All preset files follow the Scene Serializer format version 1.0, which includes:
- Scene metadata (name, description, timestamp)
- Actors with positions and rotations
- Props with types and placement
- Lighting presets
- Camera position
- Stage element states (platforms, curtains, scenery, etc.)

## Creating Custom Presets

You can create your own preset templates by:
1. Setting up your stage as desired
2. Using the "Save Scene" button to export
3. Moving the JSON file to this `presets` directory
4. Adding an entry in the UI dropdown (in `stage.js`)
