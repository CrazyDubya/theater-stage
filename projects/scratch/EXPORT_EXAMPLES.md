# 3D Export Examples

This file contains examples of how to use the 3D export functionality.

## Quick Start Examples

### Example 1: Simple Scene Export

```javascript
// 1. Create a scene with some props
// (Use the UI to place a few props and actors on the stage)

// 2. Export as GLB (recommended for most uses)
exportSceneGLB();
// Follow the prompt to name your file (e.g., "my-theater-scene")
// File "my-theater-scene.glb" will be downloaded
```

### Example 2: Export to Multiple Formats

```javascript
// Export the same scene to all formats for maximum compatibility

// GLB (binary, single file)
exportSceneGLB();  // Enter name: "scene-v1"

// GLTF (JSON, easier to edit)
exportSceneGLTF(); // Enter name: "scene-v1"

// OBJ (universal compatibility)
exportSceneOBJ();  // Enter name: "scene-v1"

// You'll now have:
// - scene-v1.glb
// - scene-v1.gltf
// - scene-v1.obj
// - scene-v1.mtl
```

### Example 3: Animated Rotating Stage

```javascript
// 1. Show the rotating stage (if hidden)
toggleRotatingStageVisibility();

// 2. Place some props on the rotating stage
// (Use "Place Prop" and click on the rotating stage)

// 3. Export animation frames
exportAnimationFrames();
// Enter frame count: 30
// Choose format: glb
// Animate rotation: OK (Yes)

// Result: 30 GLB files showing the rotation
// Files: theater-scene-frame-0000.glb through theater-scene-frame-0029.glb
```

### Example 4: Programmatic Export

```javascript
// Initialize the exporter
await sceneExporter.initializeExporters();

// Export current scene as GLB
await sceneExporter.exportGLTF('custom-scene', true);

// Export as GLTF with custom options
await sceneExporter.exportGLTF('custom-scene', false, {
    embedImages: true,
    maxTextureSize: 2048
});

// Export as OBJ
await sceneExporter.exportOBJ('custom-scene');
```

### Example 5: Time-Lapse Animation

```javascript
// Create a time-lapse of curtains opening
// 1. Close curtains
toggleCurtains(); // Make sure they're closed

// 2. Start animation export with custom update callback
await sceneExporter.exportAnimationFrames(
    20, // 20 frames
    (frameIndex) => {
        // Gradually open curtains
        const progress = frameIndex / 20;
        // Update curtain positions based on progress
        // (This is a simplified example)
    },
    'glb'
);
```

## Use Cases

### Use Case 1: Sharing Stage Design with Director

**Scenario**: You've designed a stage layout and want to share it with the director for approval.

**Steps**:
1. Design your stage layout in the Theater-Stage application
2. Adjust lighting to your preference
3. Click "Export GLB"
4. Name it: "act1-scene2-proposal"
5. Email the GLB file to the director
6. Director can view it in any 3D viewer or import into their preferred software

**Why GLB**: Single file, easy to share, opens in most 3D software.

### Use Case 2: Creating Assets for Game Development

**Scenario**: You're creating theater environments for a game using Unity or Unreal.

**Steps**:
1. Design multiple stage configurations
2. Export each as GLB
3. Import GLB files directly into Unity/Unreal
4. Use them as prefabs or level assets

**Benefits**: 
- Materials are preserved
- Hierarchy is maintained
- Single file per configuration

### Use Case 3: 3D Printing Stage Models

**Scenario**: You want to 3D print a miniature stage model.

**Steps**:
1. Design your stage
2. Export as OBJ (better for 3D printing software)
3. Import OBJ into your 3D printing slicer (Cura, PrusaSlicer, etc.)
4. Scale and prepare for printing

**Why OBJ**: Most compatible with 3D printing software.

### Use Case 4: Creating Marketing Materials

**Scenario**: Need to create promotional images or videos of the stage.

**Steps**:
1. Design your stage
2. Export as GLB
3. Import into Blender
4. Set up professional lighting and camera angles
5. Render high-quality images or animations

**Benefits**: Full control in professional software while starting from Theater-Stage design.

### Use Case 5: Archiving Designs

**Scenario**: Keep a library of stage designs for future reference.

**Steps**:
1. For each design:
   - Save as JSON (using "Save Scene") for editable backup
   - Export as GLB for 3D viewing/reuse
2. Organize in folders by production or season
3. Can reopen and modify anytime

**Structure**:
```
/stage-designs/
  /2024-spring/
    romeo-juliet.json
    romeo-juliet.glb
  /2024-summer/
    midsummer.json
    midsummer.glb
```

## Advanced Techniques

### Technique 1: Batch Export with Variations

```javascript
// Export multiple lighting configurations
const lightingPresets = ['default', 'day', 'night', 'sunset', 'dramatic'];

for (const preset of lightingPresets) {
    // Apply lighting preset
    applyLightingPreset(preset);
    
    // Wait a moment for changes to apply
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Export with preset name
    await sceneExporter.exportGLTF(`scene-${preset}`, true);
}
```

### Technique 2: Selective Export

```javascript
// Only export specific elements
// Temporarily hide what you don't want to export
const originalVisibility = {
    actors: actors.map(a => a.visible),
    props: props.map(p => p.visible)
};

// Hide actors, keep only props and stage
actors.forEach(actor => actor.visible = false);

// Export
await sceneExporter.exportGLTF('stage-and-props-only', true);

// Restore visibility
actors.forEach((actor, i) => actor.visible = originalVisibility.actors[i]);
```

### Technique 3: Export with Metadata

```javascript
// Add scene metadata before export
const metadata = {
    production: "Romeo and Juliet",
    act: 2,
    scene: 1,
    date: new Date().toISOString(),
    designer: "John Doe"
};

// Add as comment in export filename
const filename = `${metadata.production}-Act${metadata.act}-Scene${metadata.scene}`;
await sceneExporter.exportGLTF(filename, true);
```

## Troubleshooting Examples

### Problem: File Size Too Large

```javascript
// Solution: Reduce texture sizes before export
// (If you've uploaded custom textures, consider using lower resolution versions)

// Or export to OBJ which doesn't embed textures
exportSceneOBJ();
```

### Problem: Materials Look Wrong in Target Software

```javascript
// Try different export formats
// GLB/GLTF uses PBR materials (modern)
exportSceneGLB();

// OBJ uses traditional materials (widely compatible)
exportSceneOBJ();

// In target software, you may need to adjust material settings
```

### Problem: Export Takes Too Long

```javascript
// For animation exports, reduce frame count
exportAnimationFrames();
// Enter: 10 frames instead of 30

// Or use simpler format
// GLB is faster than GLTF, OBJ is slowest
```

## Integration Examples

### Example: Three.js Web Application

```javascript
// In your Three.js app
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('theater-scene.glb', function(gltf) {
    scene.add(gltf.scene);
    
    // Access specific elements
    const stage = gltf.scene.getObjectByName('stage');
    const props = gltf.scene.getObjectByName('props');
});
```

### Example: Blender Python Script

```python
import bpy

# Import GLB file
bpy.ops.import_scene.gltf(filepath='/path/to/theater-scene.glb')

# Access imported objects
for obj in bpy.context.selected_objects:
    print(f"Imported: {obj.name}")
    
# Render
bpy.ops.render.render(write_still=True)
```

### Example: Unity C# Script

```csharp
using UnityEngine;

public class StageLoader : MonoBehaviour
{
    void Start()
    {
        // GLB files can be placed in Assets folder
        // Unity will automatically import them
        
        // Find the imported model
        GameObject stage = GameObject.Find("theater-scene");
        
        // Manipulate as needed
        stage.transform.position = Vector3.zero;
    }
}
```

## Tips and Best Practices

1. **Always test exports** - Import your exports into target software to verify
2. **Use GLB for sharing** - Single file is easier to manage
3. **Use GLTF for debugging** - JSON format is easier to inspect
4. **Use OBJ for compatibility** - When target software doesn't support GLTF
5. **Keep originals** - Always save as JSON first using "Save Scene"
6. **Name consistently** - Use descriptive names with dates/versions
7. **Batch intelligently** - Export multiple formats only when needed
8. **Test frame counts** - Start with 5-10 frames for animation, then increase
9. **Organize files** - Create folder structure for different productions
10. **Document settings** - Keep notes about lighting, camera positions used

## Resources

- [GLTF 2.0 Specification](https://www.khronos.org/gltf/)
- [Wavefront OBJ Format](https://en.wikipedia.org/wiki/Wavefront_.obj_file)
- [Three.js Documentation](https://threejs.org/docs/)
- [Blender GLB Import](https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html)

## Getting Help

If you encounter issues:
1. Check browser console for error messages
2. Try a different export format
3. Verify objects are visible before exporting
4. Ensure exporters loaded correctly (check console)
5. Try with a simpler scene first
6. Refer to EXPORT_GUIDE.md for detailed documentation
