# Theater-Stage User Guide

**Version 2.0** | Updated January 2025

Welcome to Theater-Stage, a professional 3D theater simulation platform for education, production planning, and creative exploration.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Basic Controls](#basic-controls)
4. [Working with Actors](#working-with-actors)
5. [Working with Props](#working-with-props)
6. [Stage Management](#stage-management)
7. [Lighting & Atmosphere](#lighting--atmosphere)
8. [Animation Timeline](#animation-timeline)
9. [Sound System](#sound-system)
10. [Stage Types](#stage-types)
11. [Collaboration](#collaboration)
12. [Saving & Loading](#saving--loading)
13. [Keyboard Shortcuts](#keyboard-shortcuts)
14. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Time Setup

1. **Open Theater-Stage** in a modern web browser (Chrome, Firefox, Edge, Safari)
2. **Take the Tutorial** - On first launch, an interactive tutorial will guide you through the basics
3. **Explore a Preset** - Load one of the 14 pre-made scenes from the menu

### System Requirements

- **Browser**: Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Hardware**:
  - 4GB RAM minimum
  - WebGL-compatible graphics card
  - Mouse with scroll wheel recommended
- **Internet**: Required for initial load, optional afterwards

### Quick Start

1. **Navigate the 3D space**:
   - **Rotate**: Left-click and drag
   - **Zoom**: Scroll wheel
   - **Pan**: Right-click and drag

2. **Add your first actor**: Click "Place Actor" in the menu, then click on the stage

3. **Add a prop**: Select a prop type, click "Place Prop", then click on the stage

4. **Save your work**: Click "Save Scene" in the menu

---

## Interface Overview

### Main Components

```
┌─────────────────────────────────────────────────┐
│  ☰ Menu          3D Stage           Collab ⚙️  │
│  ┌──────┐    ┌──────────────┐    ┌──────────┐  │
│  │      │    │              │    │  Users   │  │
│  │ Ctrl │    │   Stage      │    │  Chat    │  │
│  │ Menu │    │   View       │    │          │  │
│  │      │    │              │    │          │  │
│  └──────┘    └──────────────┘    └──────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │     Animation Timeline (Shift+A)         │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Control Menu (☰)

Click the hamburger icon (☰) in the top-left to access:
- Help & Tutorial
- Lighting & Camera
- Actors & Props
- Stage Elements
- Save/Load
- Undo/Redo

**Tip**: Hover over any control for a helpful tooltip!

---

## Basic Controls

### 3D Navigation

| Action | Mouse | Touchpad |
|--------|-------|----------|
| **Rotate Camera** | Left-click + drag | One finger drag |
| **Zoom In/Out** | Scroll up/down | Two-finger pinch |
| **Pan Camera** | Right-click + drag | Two-finger drag |

### Camera Presets

Quick camera angles for common views:

1. **Audience View** - Front view as audience sees it
2. **Overhead** - Bird's eye view for blocking
3. **Stage Left** - Side view from left
4. **Stage Right** - Side view from right
5. **Close-up** - Zoomed in for detail work

**Shortcut**: Use number keys `1-4` for camera presets

### Stage Positions

Theater uses standard stage directions from the **actor's perspective**:

```
        Upstage (away from audience)
              ↑
   USL       USC       USR
    ┌─────────┼─────────┐
    │                   │
SL  │   SL    C    SR   │  SR
    │                   │
    └─────────┼─────────┘
   DSL       DSC       DSR
              ↓
      Downstage (toward audience)
```

- **US** = Upstage (back)
- **DS** = Downstage (front)
- **L** = Stage Left (actor's left)
- **R** = Stage Right (actor's right)
- **C** = Center

---

## Working with Actors

### Adding Actors

1. Open the control menu (☰)
2. Click **"Place Actor"**
3. Click anywhere on the stage to place
4. The actor appears as a simple humanoid figure

### Moving Actors

**Option 1: Drag and Drop**
- Click and drag an actor to move them
- Actor snaps to stage surface

**Option 2: Animation Timeline**
- Use the timeline to create smooth movements
- Record keyframes for complex choreography

### Actor Interactions

Actors can interact with props:

1. **Select Actor**: Click "Select Actor" then click on an actor
2. **Select Prop**: Click "Select Prop" then click on a prop
3. **Choose Action**:
   - **Pick Up** - Actor holds the prop
   - **Put Down** - Actor releases held prop
   - **Throw** - Actor throws held prop forward
   - **Sit** - Actor sits on furniture
   - **Stand Up** - Actor stands from sitting

### Naming Actors

Actors are automatically named:
- `actor_1`, `actor_2`, etc.

**Tip**: Keep track of which actor is which by their position on stage!

---

## Working with Props

### Prop Categories

Theater-Stage includes **50+ props** organized by category:

#### 1. Basic Shapes
Simple geometric shapes for abstract scenes:
- Cube, Sphere, Cylinder, Cone, Pyramid, Torus

#### 2. Furniture
Common furniture items:
- Wooden Chair, Armchair, Bench, Stool
- Table, Round Table, Desk
- Bookshelf, Sofa, Coffee Table

#### 3. Stage Props
Theatrical and storage items:
- Wooden Crate, Barrel, Chest, Suitcase
- Storage Trunk, Ladder

#### 4. Decorative
Ambiance and decoration:
- Potted Plant, Fern, Vase
- Floor Lamp, Table Lamp, Candelabra
- Picture Frame, Mirror, Area Rug, Curtain

#### 5. Special/Theatrical
Unique theatrical elements:
- Throne, Speaker Podium, Fountain
- Altar, Statue, Door, Window

#### 6. Kitchen/Restaurant
Food service settings:
- Kitchen Stove, Refrigerator, Counter, Sink

#### 7. Medical/Hospital
Medical drama props:
- Hospital Bed, IV Stand, Medical Cart

### Adding Props

1. Open control menu
2. Select prop type from dropdown
3. Click **"Place Prop"**
4. Click on stage to place

### Prop Interactions

Many props have special behaviors:

- **Chairs/Furniture**: Actors can sit on them
- **Lamps**: Can be toggled on/off
- **Doors**: Can be opened/closed
- **Crates/Boxes**: Can be picked up and moved
- **Small Objects**: Can be thrown

### Moving Props

- Click and drag props to reposition
- Props respect collision detection
- Props automatically find nearby free space if placement is blocked

---

## Stage Management

### Stage Elements

#### Curtains
- **Toggle Curtains**: Open/close the main stage curtains
- Classic red theater curtains
- Animated open/close sequence

#### Platforms
- **Move Platforms**: Raise/lower the four moveable platforms
- Each platform elevates 3 units
- Perfect for creating levels on stage

#### Rotating Stage
- **Start/Stop Rotation**: Activate the center rotating platform
- Continuous slow rotation
- Props and actors move with platform

#### Trap Doors
- **Toggle Trap Doors**: Open/close the four trap doors
- Used for dramatic entrances/exits
- Props can fall through when open

#### Scenery Panels
- **Backdrop**: Rear scenery panel
- **Midstage**: Middle scenery panel
- Adjust position: Off, 1/4, 1/2, 3/4, Full

#### Stage Markers
- **Toggle Markers**: Show/hide position markers (USL, USC, etc.)
- Helpful for learning stage directions
- Turn off for clean presentations

---

## Lighting & Atmosphere

### Lighting Presets

Five professional lighting moods:

1. **Default** - Neutral rehearsal lighting
   - Even illumination
   - Good for blocking work

2. **Day** - Bright, cheerful atmosphere
   - Warm tones
   - Blue sky backdrop
   - Perfect for comedies and daytime scenes

3. **Night** - Dark, mysterious mood
   - Low ambient light
   - Deep blue backdrop
   - Great for dramatic scenes

4. **Sunset** - Warm, romantic feel
   - Orange/red tones
   - Nostalgic atmosphere
   - Ideal for emotional scenes

5. **Dramatic** - High contrast theatrical lighting
   - Strong spotlights
   - Dark shadows
   - Maximum theatrical effect

### Spotlight Control

- **Intensity Slider**: Adjust brightness of spotlights
- **Footlights**: Toggle blue stage-front lights on/off
- Multiple spotlights create professional stage look

**Tip**: Combine lighting with stage type for maximum effect!

---

## Animation Timeline

**Access**: Press `Shift+A` or click Animation Timeline button

### What is the Timeline?

The Animation Timeline lets you choreograph movements by recording **keyframes** - specific positions at specific times. The system automatically creates smooth motion between keyframes.

### Basic Workflow

1. **Open Timeline** (`Shift+A`)
2. **Select an actor or prop** (click on it)
3. **Move playhead** to desired time (click on timeline)
4. **Position actor/prop** where you want it
5. **Click Record** (⏺️) to save keyframe
6. **Repeat** for multiple positions
7. **Click Play** (▶️) to watch the animation

### Timeline Controls

| Button | Function |
|--------|----------|
| ▶️ / ⏸️ | Play / Pause animation |
| ⏹️ | Stop and reset to beginning |
| ⏺️ | Record keyframe at current time |
| 🗑️ | Delete selected keyframe |

### Playback Settings

- **Speed**: Adjust playback (0.25x to 2x)
- **Loop**: Enable continuous playback
- **Duration**: Set total timeline length (10-600 seconds)

### Tips for Great Animations

1. **Start Simple**: Begin with one actor, few keyframes
2. **Use Even Spacing**: Space keyframes evenly for smooth motion
3. **Preview Often**: Play back frequently to check movement
4. **Layer Complexity**: Add more actors after mastering one
5. **Save Your Work**: Export timeline with scene save

### Example Use Cases

- **Blocking rehearsal**: Show actor movements for a scene
- **Choreography**: Plan dance or fight sequences
- **Scene transitions**: Demonstrate set changes
- **Presentations**: Create animated demonstrations

---

## Sound System

**Access**: Press `Shift+S` or click Sound System button

### Overview

The Sound System manages audio for your production, including music, sound effects, and cues synchronized with the animation timeline.

### Sound Library

#### Adding Sounds

**Method 1: Upload Custom Audio**
1. Click **Upload** tab
2. Click **Choose File**
3. Select MP3, WAV, or OGG file
4. Enter name and category
5. Sound appears in library

**Method 2: Use Default Sounds**
- Several placeholder sounds included
- Replace with your own files

#### Sound Categories

Organize sounds into:
- **Background Music**: Continuous music tracks
- **Sound Effects**: Short sounds (door knocks, applause, etc.)
- **Ambient**: Environmental sounds (rain, city, etc.)
- **Voice/Dialogue**: Recorded speech or narration

### Playing Sounds

From the **Sound Library** tab:
- Click **▶️ Play** to test a sound
- Click **⏹️ Stop** to stop playback
- Click **🗑️ Delete** to remove

### Master Volume

- **Master Volume Slider**: Controls overall audio level
- Affects all sounds simultaneously
- Range: 0% to 100%

### Cue List

Create a timeline of audio triggers:

1. Switch to **Cue List** tab
2. Click **+ Add Cue**
3. Set time (syncs with animation timeline)
4. Choose sound to play
5. Set action (Play/Stop/Pause)

**Tip**: Cues automatically trigger during animation playback!

### Example Workflow

1. Upload background music
2. Upload sound effects (door, phone ring, etc.)
3. Create cues at specific times
4. Play animation - sounds trigger automatically
5. Adjust timing as needed

---

## Stage Types

**Access**: Press `Shift+T` or click Stage Types button

Theater-Stage supports **four different stage configurations** to match various theatrical formats.

### 1. Proscenium (Default)

Traditional theater with arch and pillars.

**Characteristics**:
- Audience on one side
- Proscenium arch frames the stage
- Red pillars and decorative arch
- Most common theater type

**Best For**:
- Traditional plays
- Classic theater education
- Formal productions

### 2. Thrust Stage

Stage extending into audience on three sides.

**Characteristics**:
- Pentagonal platform shape
- Audience wraps around three sides
- Backstage area upstage
- Side railings mark audience areas

**Best For**:
- Shakespeare (Globe Theatre style)
- Interactive performances
- Intimate productions

### 3. Arena (Theater in the Round)

Central circular stage with 360° audience.

**Characteristics**:
- Circular stage platform
- Audience on all four sides
- Entry aisles at corners
- No "front" or "back"

**Best For**:
- Experimental theater
- Boxing/wrestling matches
- Circus performances
- 360° choreography

### 4. Black Box

Flexible experimental space.

**Characteristics**:
- Large square floor (25x25 units)
- Black walls on three sides
- Grid floor for precise placement
- Moveable riser platforms
- Overhead lighting grid

**Best For**:
- Experimental theater
- Workshop productions
- Flexible configurations
- Student projects

### Changing Stage Types

1. Press `Shift+T` to open Stage Types panel
2. Click desired stage type
3. Confirm change (⚠️ clears current stage)
4. Stage rebuilds automatically

**Warning**: Changing stage type removes all actors and props! Save your work first.

---

## Collaboration

**Access**: Click "Join Collaboration" button (top-right)

### Real-Time Collaboration

Work together with others in the same virtual space!

### Joining a Session

1. Click **Join Collaboration**
2. Enter your name
3. Enter Room ID (share with collaborators)
4. Choose your role:
   - **Director**: Full control (add/remove/move everything)
   - **Actor**: Can edit (move actors and props)
   - **Viewer**: Read-only (watch only)
5. Click **Connect**

### Collaboration Features

#### Active Users
- See who's online
- Color-coded indicators
- Permission levels displayed
- "You" highlighted in blue

#### Object Locking
- When someone selects an object, it locks for others
- Prevents conflicts
- Visual indicators show who's editing what

#### Chat System
- Text chat with all participants
- Timestamps on messages
- Color-coded usernames
- Real-time updates

#### Synchronized Actions
- All actions update in real-time
- Position changes
- Object additions/removals
- Lighting and camera changes (Director only)

### Best Practices

1. **Communicate**: Use chat to coordinate
2. **Respect Roles**: Directors lead, actors assist, viewers observe
3. **Share Room ID**: Keep it private or share publicly
4. **Save Often**: Each user should save their own copy

### Collaboration Server

Requires a WebSocket server (included in project):
- Run `node server/collaboration-server.js`
- Default port: 3000
- Configure in collaboration settings

---

## Saving & Loading

### Saving Your Work

**Method 1: Quick Save**
1. Press `Ctrl+S` (Windows/Linux) or `Cmd+S` (Mac)
2. Or click "Save Scene" in menu

**What Gets Saved**:
- ✅ All actor positions and rotations
- ✅ All props and their states
- ✅ Lighting settings
- ✅ Camera position
- ✅ Stage element states (curtains, platforms, etc.)
- ✅ Animation timeline keyframes
- ✅ Sound cues
- ✅ Stage type

**File Format**: JSON (human-readable text)

**File Naming**: `scene-name-TIMESTAMP.json`

### Loading Saved Scenes

1. Click **"Load Scene"** in menu
2. Choose file from your computer
3. Scene loads completely
4. Previous scene is cleared

### Loading Preset Templates

Pre-made scenes for quick start:

**Educational Presets** (14 total):
1. Empty Stage
2. Classical Theater
3. Living Room
4. Office Setting
5. Outdoor Park
6. Restaurant/Cafe
7. Shakespeare Scene
8. Courtroom Drama
9. Hospital Emergency
10. School Classroom
11. Musical Theater
12. Detective Office
13. Family Dinner
14. Greek Amphitheater

**To Load Preset**:
1. Click "Load Preset" in menu
2. Select from list
3. Scene loads instantly

### Export Options

- **Scene Data**: JSON file with all information
- **Animation Timeline**: Included in scene data
- **Sound Cues**: Included (but not audio files themselves)
- **Screenshots**: Use browser screenshot tools

**Tip**: Save multiple versions (v1, v2, v3) to track progress!

---

## Keyboard Shortcuts

### Navigation
| Shortcut | Action |
|----------|--------|
| **Mouse Drag** | Rotate camera |
| **Scroll Wheel** | Zoom in/out |
| **Right-Click Drag** | Pan camera |

### View Presets
| Shortcut | View |
|----------|------|
| **1** | Audience View |
| **2** | Overhead View |
| **3** | Stage Left View |
| **4** | Stage Right View |

### Lighting
| Shortcut | Action |
|----------|--------|
| **L** | Cycle lighting presets |
| **Shift+L** | Toggle spotlights |

### Actions
| Shortcut | Action |
|----------|--------|
| **Ctrl+Z** | Undo last action |
| **Ctrl+Y** | Redo undone action |
| **Ctrl+S** | Save scene |
| **Delete** | Remove selected object |

### System Panels
| Shortcut | Panel |
|----------|-------|
| **H** or **?** | Show keyboard shortcuts help |
| **Shift+A** | Toggle Animation Timeline |
| **Shift+S** | Toggle Sound System |
| **Shift+T** | Toggle Stage Types |
| **Shift+E** | Toggle Error Console (debug) |
| **Esc** | Close dialogs / Cancel action |

### Tips
- Memorize `Shift+A` (Animation), `Shift+S` (Sound), `Shift+T` (Types)
- Use `Ctrl+Z` frequently - undo is your friend!
- `H` for help anytime you forget shortcuts

---

## Troubleshooting

### Common Issues

#### Issue: Scene appears black or empty
**Solutions**:
- Reload the page (F5)
- Check lighting preset (try "Day" or "Default")
- Ensure WebGL is supported in your browser
- Update graphics drivers

#### Issue: Cannot move camera
**Solutions**:
- Make sure you're clicking on empty space (not on objects)
- Try different mouse buttons (left for rotate, right for pan)
- Reset camera using Camera Presets

#### Issue: Props/Actors won't place
**Solutions**:
- Ensure placement mode is active (marker should be visible)
- Click directly on the brown stage surface
- Check for collision with existing objects
- Try placing in a different location

#### Issue: Animation doesn't play
**Solutions**:
- Ensure you've recorded at least 2 keyframes
- Check timeline duration is long enough
- Verify playhead is at start
- Select correct objects in timeline tracks

#### Issue: Sounds don't play
**Solutions**:
- Check master volume (not muted)
- Verify browser allows audio playback
- Try playing sound directly (not via cue)
- Check file format (MP3, WAV, OGG supported)

#### Issue: Collaboration won't connect
**Solutions**:
- Verify collaboration server is running
- Check firewall settings
- Ensure Room ID is correct
- Try different browser
- Use single-user mode if server unavailable

### Performance Issues

**If the application is slow or laggy**:

1. **Reduce Scene Complexity**
   - Fewer props (under 30 recommended)
   - Fewer actors (under 15 recommended)
   - Simpler stage type

2. **Optimize Graphics**
   - Close other browser tabs
   - Close other applications
   - Update graphics drivers
   - Try a different browser (Chrome usually fastest)

3. **Hardware Check**
   - Ensure 4GB+ RAM available
   - Check GPU supports WebGL 2.0
   - Monitor CPU usage (should stay under 80%)

### Browser Compatibility

**Recommended Browsers**:
- ✅ Chrome 90+ (Best performance)
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+ (macOS/iOS)

**Known Issues**:
- ⚠️ Internet Explorer: Not supported
- ⚠️ Safari < 14: Limited WebGL support
- ⚠️ Mobile browsers: View-only recommended

### Getting Help

**Built-in Resources**:
1. Press `H` or `?` for keyboard shortcuts
2. Hover over buttons for tooltips
3. Take the tutorial (Help & Tutorial section)
4. Press `Shift+E` to view error console

**External Resources**:
- User Guide: (this document)
- Curriculum Guide: For educators
- API Documentation: For developers
- GitHub Issues: Report bugs

### Error Console

For advanced troubleshooting, press `Shift+E` to open the Error Console:

- **Errors Tab**: Critical issues
- **Warnings Tab**: Non-critical alerts
- **All Logs Tab**: Complete activity log
- **Export**: Download logs for bug reports

---

## Tips & Best Practices

### For Theater Teachers

1. **Start with Presets**: Use pre-made scenes for quick lessons
2. **Focus on Fundamentals**: Use stage markers to teach positions
3. **Save Student Work**: Have students save their blocking plans
4. **Use Animation**: Demonstrate complex movements visually
5. **Collaborate**: Work with students in real-time

### For Students

1. **Take the Tutorial**: Don't skip the onboarding!
2. **Experiment**: Try different lighting and stage types
3. **Use Keyboard Shortcuts**: Speed up your workflow
4. **Save Versions**: Keep v1, v2, v3 as you iterate
5. **Ask Questions**: Check tooltips and this guide

### For Directors

1. **Plan Before Building**: Sketch on paper first
2. **Use Camera Presets**: Check sightlines from all angles
3. **Test Lighting**: Try all 5 presets for your scene
4. **Animate Transitions**: Show scene changes clearly
5. **Export Often**: Save multiple versions

### For Designers

1. **Explore Stage Types**: Different spaces create different feels
2. **Layer Props**: Build depth with foreground/background
3. **Light Creatively**: Lighting changes everything
4. **Use Color**: Choose props that create visual contrast
5. **Think 3D**: Not just front view - consider all angles

---

## Glossary

**Blocking**: The planned movement and positioning of actors on stage

**Downstage**: The area of the stage closest to the audience

**Keyframe**: A recorded position at a specific time in animation

**Proscenium**: Traditional theater style with arch framing the stage

**Stage Left**: Actor's left when facing the audience (audience's right)

**Stage Right**: Actor's right when facing the audience (audience's left)

**Thrust Stage**: Stage that extends into the audience on three sides

**Upstage**: The area of the stage farthest from the audience

**USL/USC/USR**: Upstage Left/Center/Right

**DSL/DSC/DSR**: Downstage Left/Center/Right

---

## Appendix: File Formats

### Scene File Structure (JSON)

```json
{
  "version": "1.0",
  "timestamp": "2025-01-19T00:00:00.000Z",
  "name": "My Scene",
  "description": "Description here",
  "stage": {
    "actors": [...],
    "props": [...],
    "lighting": {...},
    "camera": {...},
    "stageElements": {...}
  }
}
```

### Supported Audio Formats

- **MP3**: Most compatible, good compression
- **WAV**: Uncompressed, best quality, large files
- **OGG**: Good compression, open source

### Export Options

- **Scene**: `.json` file (all data)
- **Logs**: `.json` file (debugging)
- **Screenshots**: Use browser tools (Ctrl+Shift+S in Firefox)

---

## Updates & Changelog

**Version 2.0** (January 2025)
- ✨ Animation Timeline added
- ✨ Sound System added
- ✨ Multiple Stage Types (4 total)
- ✨ Error Handling system
- ✨ 50+ prop library (37 new props)
- ✨ 8 new educational presets
- ✨ Interactive tutorial system
- ✨ Comprehensive tooltips
- ✨ Modern UI redesign
- 📦 Three.js updated to r170
- 📚 Complete documentation

**Version 1.0** (Previous)
- Basic 3D stage
- Actors and props
- Lighting presets
- Collaboration system
- Save/load functionality

---

## Credits

**Theater-Stage Platform**
- Built with Three.js r170
- WebGL for 3D rendering
- Web Audio API for sound
- WebSocket for collaboration

**Educational Standards**
- National Core Arts Standards aligned
- Common Core ELA integrated
- K-12 theater curriculum compatible

---

## License & Usage

Theater-Stage is designed for educational and non-commercial use.

**Allowed Uses**:
- ✅ Educational institutions (K-12, universities)
- ✅ Theater education and training
- ✅ Production planning and pre-visualization
- ✅ Student projects and portfolios

**Support**: See project repository for updates and community support.

---

**End of User Guide**

For developer documentation, see `API-Documentation.md`
For educators, see `curriculum-guide.md`
For technical details, see `modularization-plan.md`

*Last updated: January 2025*
