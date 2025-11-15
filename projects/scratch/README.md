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

### 🔊 Sound System
- **3D Positional Audio**: Sounds originate from specific locations on stage using Web Audio API
- **Background Music/Ambience**: Looping background audio support
- **Sound Effects**: Trigger sound effects at specific positions
- **Actor Voice Playback**: Positional audio for actor voices
- **Volume Controls**: Separate volume controls for master, background, effects, and voices
- **Audio Cue System**: Schedule audio events to be triggered at specific times
- **Pause/Resume**: Global audio control
- **Dynamic Listener**: Audio listener position updates with camera movement

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
- **Audio System**: Initialize and control the sound system
  - **Master Volume**: Overall volume control
  - **Background Volume**: Volume for background music/ambience
  - **Effects Volume**: Volume for sound effects
  - **Voices Volume**: Volume for actor voice playback
  - **Pause/Resume**: Suspend or resume all audio playback
  - **Stop All**: Stop all currently playing sounds

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
- **Sound System**: Web Audio API-based 3D positional audio with volume controls
- **Animation Loop**: Continuous updates for movements and effects
- **Event Handlers**: Mouse/keyboard input processing

### ID System
- **Actors**: Unique IDs like `actor_1`, `actor_2`
- **Props**: Unique IDs like `prop_1`, `prop_2`
- Persistent throughout session for tracking and scripting

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