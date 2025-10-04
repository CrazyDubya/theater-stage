# Save/Load Scene - Quick Reference Guide

## What's New? 🎭

The theater-stage application now supports **saving and loading scenes**! You can preserve your entire stage setup including actors, props, lighting, camera angles, and all stage elements.

## How to Use

### 💾 Saving Your Scene

1. **Set up your stage** with actors, props, lighting, curtains, platforms, etc.
2. Click the **"Save Scene"** button in the left menu
3. Enter a **name** for your scene (e.g., "Opening Act" or "Final Scene")
4. Optionally add a **description** (e.g., "Hero confronts villain center stage")
5. Click **OK** - your scene will download as a JSON file

**Example:**
```
Name: "Opening Act"
Description: "Two actors, spotlight, curtains open"
Downloaded as: "opening-act-scene.json"
```

### 📂 Loading a Saved Scene

1. Click the **"Load Scene"** button in the left menu
2. Select a previously saved `.json` scene file from your device
3. **Confirm** that you want to replace the current scene
4. Your scene will be restored exactly as it was saved!

**⚠️ Warning:** Loading a scene will clear your current stage setup. Make sure to save first if you want to keep it!

## What Gets Saved?

✅ **Actors** - positions, rotations, visibility  
✅ **Props** - all prop types with positions and properties  
✅ **Lighting** - current lighting preset  
✅ **Camera** - position and target view  
✅ **Stage Elements:**
- Platform heights and visibility
- Curtain state (open/closed)
- Rotating stage state and rotation
- Trap door positions and states
- Scenery panel positions and textures
- Stage marker visibility

## Features

### Smart Filename Generation
Scene names are automatically converted to safe filenames:
- "My Amazing Scene" → `my-amazing-scene.json`
- "Act 1 - Scene 2" → `act-1-scene-2.json`

### Error Protection
- **JSON validation** - Won't load invalid files
- **Confirmation prompts** - Prevents accidental overwrites
- **Clear error messages** - Tells you exactly what went wrong
- **Cancel anytime** - Can exit at any prompt without changes

### User Feedback
- ✅ **Success alerts** - Confirms save/load operations
- ❌ **Error alerts** - Explains what went wrong and how to fix it
- 📝 **Console logs** - Technical details for debugging

## Tips & Tricks

### 🎯 Best Practices
1. **Save frequently** while working on complex scenes
2. **Use descriptive names** - "hero-entrance" vs "scene1"
3. **Add descriptions** - helps identify scenes later
4. **Organize your files** - create folders for different projects

### 🔧 Troubleshooting

**"Failed to load scene: Invalid JSON file"**
- Make sure you selected a scene file, not another type of file
- The file may be corrupted - try saving the scene again

**"Scene loaded but textures are missing"**
- Custom uploaded textures aren't saved in the JSON file
- Default textures (brick, wood, sky) are restored automatically
- You'll need to re-upload custom images after loading

**File picker doesn't open**
- Your browser may not support this feature
- Try using Chrome, Firefox, Safari, or Edge
- Check if browser has file access permissions

## File Format

Scenes are saved as human-readable JSON:

```json
{
  "version": "1.0",
  "timestamp": "2025-10-04T20:45:00.000Z",
  "name": "Opening Act",
  "description": "Two actors, spotlight, curtains open",
  "stage": {
    "actors": [...],
    "props": [...],
    "lighting": {...},
    "camera": {...},
    "stageElements": {...}
  }
}
```

You can even edit scene files in a text editor if you're comfortable with JSON!

## Keyboard Shortcuts

While there are no keyboard shortcuts for save/load specifically, you can use:
- **Ctrl+Z** - Undo (but note: loading a scene can't be undone)
- **Ctrl+Y** - Redo

## Browser Support

Works in all modern browsers:
- ✅ Chrome 20+
- ✅ Firefox 13+
- ✅ Safari 6+
- ✅ Edge (all versions)

## Example Workflow

### Creating a Multi-Scene Production

1. **Scene 1 - Setup:**
   - Place actors at stage left and right
   - Close curtains
   - Set night lighting
   - **Save as:** `scene-1-before-curtain.json`

2. **Scene 2 - Action:**
   - Open curtains
   - Move actors to center
   - Change to dramatic lighting
   - Add props
   - **Save as:** `scene-2-main-action.json`

3. **Scene 3 - Finale:**
   - Load `scene-2-main-action.json`
   - Adjust actor positions
   - Add more props
   - Set sunset lighting
   - **Save as:** `scene-3-finale.json`

Now you can quickly jump between scenes by loading the appropriate file!

## Need Help?

- Check the console (F12) for technical error details
- See `SAVE_LOAD_IMPLEMENTATION.md` for technical documentation
- Scene files are standard JSON - can be inspected/edited manually

## Happy Scene Building! 🎬
