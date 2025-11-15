# 3D Theater Stage for AI Actors

An interactive 3D theater stage environment built with Three.js, designed for AI actor performances and theatrical simulations.

## Features

### 🎭 Stage Elements
- **Main Stage**: 20x15 unit performance area with wooden texture
- **Curtains**: Front-of-stage curtains that open/close with smooth animation
- **Stage Markers**: 9 position markers (USL, USC, USR, SL, C, SR, DSL, DSC, DSR) for blocking
- **Moveable Platforms**: 4 platforms that can elevate 3 units
- **Rotating Center Stage**: Optional circular platform with continuous rotation
- **Trap Doors**: 4 optional trap doors that make props/actors disappear
- **Scenery Panels**: Sliding backdrop and midstage panels with passthrough cutout

### 🎬 Lighting System
- **Presets**: Default, Day, Night, Sunset, and Dramatic lighting modes
- **Dynamic Spotlights**: 3 main spots with animated intensity
- **Footlights**: Blue stage-front lighting
- **Ambient Lighting**: Adjustable atmosphere

### 🎮 Interactive Controls
- **Camera Presets**: Audience, Overhead, Stage Left/Right, Close-up views
- **Prop Placement**: Click-to-place system with visual marker
- **Actor Placement**: Add humanoid figures to the stage
- **UI Controls**: Comprehensive control panel for all stage features

### 🎯 Prop Catalog
- **Basic**: Cube, Sphere, Cylinder
- **Furniture**: Chair, Table
- **Stage Props**: Crate, Barrel
- **Decorative**: Potted Plant, Stage Lamp

### ⚙️ Physics System
- Props and actors elevate with platforms
- Rotating stage carries objects in circular motion
- Trap doors make objects disappear
- Collision detection with scenery panels
- Passthrough detection for midstage cutout

## Getting Started

1. Open `index.html` in a modern web browser
2. Or run a local server:
   ```bash
   python3 -m http.server 8000
   ```
3. Navigate to http://localhost:8000

## Controls

### Mouse Controls
- **Left Click + Drag**: Rotate camera
- **Right Click + Drag**: Pan camera
- **Scroll**: Zoom in/out
- **Click on Stage**: Place props/actors (when in placement mode)

### UI Controls
- **Lighting**: Select from 5 preset lighting modes
- **Camera**: Quick-switch between camera angles
- **Prop Type**: Choose from catalog before placing
- **Place Prop/Actor**: Enter placement mode
- **Toggle Markers**: Show/hide stage position markers
- **Toggle Curtains**: Open/close main curtains
- **Move Platforms**: Raise/lower the 4 platforms
- **Rotate Stage**: Start/stop center stage rotation
- **Toggle Trap Doors**: Open/close trap doors
- **Show/Hide Elements**: Toggle optional stage elements
- **Scenery Panels**: Slide panels to various positions (Off, 1/4, 1/2, 3/4, Full)
- **Toggle Benchmark**: Show/hide performance statistics overlay
- **Toggle LOD**: Enable/disable level-of-detail optimizations
- **Create Test Scene**: Generate 60+ objects for performance testing

## Architecture

### File Structure
```
├── index.html          # Main HTML file
├── js/
│   └── stage.js       # Main JavaScript file with all logic
└── README.md          # This file
```

### Key Components
- **Scene Management**: Three.js scene, camera, renderer setup
- **Object Management**: Arrays for props, actors, platforms, etc.
- **Physics System**: Relationship tracking between objects and stage elements
- **Animation Loop**: Continuous updates for movements and effects
- **Event Handlers**: Mouse/keyboard input processing

### ID System
- **Actors**: Unique IDs like `actor_1`, `actor_2`
- **Props**: Unique IDs like `prop_1`, `prop_2`
- Persistent throughout session for tracking and scripting

## Performance Features

The stage includes several performance optimizations for handling large scenes with many objects:

### Level of Detail (LOD)
- Automatically adjusts object detail based on camera distance
- Far objects (>50 units): Hidden
- Medium distance (30-50 units): Visible, no shadows
- Close distance (15-30 units): Visible with cast shadows only
- Very close (<15 units): Full detail with all shadows
- Toggle LOD on/off with the "Toggle LOD" button

### Object Pooling
- Reuses prop objects instead of creating new ones
- Reduces garbage collection overhead
- Pool size limited to 50 objects per type

### Physics Sleep States
- Static objects enter "sleep" mode after 1 second of no movement
- Sleeping objects skip physics calculations
- Objects automatically wake when moved or affected by stage elements

### Shared Materials
- Common colors and materials are shared between objects
- Reduces draw calls and memory usage
- Automatically applied to new props

### Benchmark Mode
- Toggle benchmark display with "Toggle Benchmark" button
- Shows real-time performance statistics:
  - FPS (Frames Per Second)
  - Frame time in milliseconds
  - Visible vs total object counts
  - Number of sleeping objects
  - Approximate draw calls

### Test Scene Creation
- "Create Test Scene" button adds 60+ objects for performance testing
- Mix of actors and various prop types
- Useful for demonstrating performance optimizations

## Known Issues
- Props/actors may hover slightly when on elevated platforms
- Collision detection is simplified (bounding box based)
- No save/load functionality yet

## Future Enhancements
- Save/load scenes
- AI actor movement scripting
- Advanced prop interactions
- Sound system integration
- Multi-user collaboration
- Export to standard 3D formats

## Dependencies
- Three.js r128
- OrbitControls.js

## License
MIT

## Contributing
Contributions welcome! Please submit issues and pull requests.