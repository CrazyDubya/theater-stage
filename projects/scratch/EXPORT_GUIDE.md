# 3D Export Feature Documentation

## Overview

The Theater-Stage application now supports exporting scenes to standard 3D file formats, allowing you to use your stage designs in other 3D software applications like Blender, Unity, Unreal Engine, and more.

## Supported Formats

### GLTF/GLB (Recommended)
- **GLTF** (.gltf): JSON-based format with embedded or external assets
- **GLB** (.glb): Binary format with embedded assets (single file)
- **Best for**: Modern 3D applications, game engines, web applications
- **Includes**: Geometry, materials, textures, scene hierarchy

### OBJ
- **OBJ** (.obj): Widely supported polygon mesh format
- **MTL** (.mtl): Companion material file
- **Best for**: Traditional 3D modeling software (Blender, Maya, 3ds Max)
- **Includes**: Geometry, materials (via MTL file)

### FBX (Future)
- Planned for future releases
- Popular format for animation and game development

## How to Export

### Step 1: Set Up Your Scene
1. Open the Theater-Stage application in your browser
2. Create your stage scene with props, actors, and stage elements
3. Adjust lighting, camera, and all visual elements as desired

### Step 2: Choose Export Format

#### Export to GLB (Binary GLTF)
1. Click the **"Export GLB"** button in the control panel
2. Enter a name for your export file
3. Click OK
4. The `.glb` file will be downloaded to your computer

**Advantages of GLB:**
- Single file with everything embedded
- Smaller file size
- Easy to share and import
- Best for game engines and modern 3D software

#### Export to GLTF (JSON)
1. Click the **"Export GLTF"** button in the control panel
2. Enter a name for your export file
3. Click OK
4. The `.gltf` file will be downloaded to your computer

**Advantages of GLTF:**
- Human-readable JSON format
- Easier to debug and modify
- Can reference external assets

#### Export to OBJ
1. Click the **"Export OBJ"** button in the control panel
2. Enter a name for your export file
3. Click OK
4. Two files will be downloaded:
   - `.obj` file (geometry)
   - `.mtl` file (materials)

**Advantages of OBJ:**
- Universally supported format
- Simple and reliable
- Great for static scenes
- Compatible with older software

### Step 3: Export Animation Frames (Advanced)
For creating animations or time-lapse sequences:

1. Click the **"Export Animation"** button
2. Enter the number of frames to export (e.g., 30)
3. Choose the export format (gltf, glb, or obj)
4. Optionally enable rotating stage animation
5. Multiple files will be downloaded, one for each frame
6. Use these in video editing or 3D animation software

## What Gets Exported

### Scene Elements Included
- ✅ Main stage with textures
- ✅ Props (all visible props)
- ✅ Actors (humanoid figures)
- ✅ Moveable platforms
- ✅ Rotating stage
- ✅ Trap doors
- ✅ Curtains
- ✅ Scenery panels with textures

### Material Properties
- Base colors
- Opacity/transparency
- Metalness (for GLTF/GLB)
- Roughness (for GLTF/GLB)
- Textures (embedded in GLTF/GLB)

### Transformations
- Position (X, Y, Z coordinates)
- Rotation (in all three axes)
- Scale (if modified)

### Scene Hierarchy
Exported objects are organized in groups:
- `stage` - The main stage
- `props` - All prop objects
- `actors` - All actor figures
- `platforms` - Moveable platforms
- `rotating_stage` - Center rotating platform
- `trap_doors` - Trap door elements
- `curtains` - Stage curtains
- `scenery` - Backdrop and scenery panels

## Using Exported Files

### In Blender
1. Open Blender
2. Go to File → Import
3. Select "glTF 2.0 (.glb/.gltf)" or "Wavefront (.obj)"
4. Navigate to your exported file
5. Click Import
6. Your scene will appear in the 3D viewport

### In Unity
1. Open your Unity project
2. Drag and drop the `.glb` file into the Assets folder
3. The scene will be imported automatically
4. Drag the imported asset into your scene

### In Unreal Engine
1. Open your Unreal project
2. Go to File → Import into Level
3. Select your `.glb` or `.obj` file
4. Adjust import settings as needed
5. Click Import

### In Three.js Web Applications
```javascript
// Load GLB file
const loader = new THREE.GLTFLoader();
loader.load('theater-scene.glb', function(gltf) {
    scene.add(gltf.scene);
});
```

### In Other 3D Software
Most modern 3D applications support GLTF/GLB or OBJ formats through:
- Native import
- Plugin/extension
- File → Import menu

## Technical Details

### File Formats

#### GLTF 2.0
- JSON-based format
- Supports PBR materials
- Efficient binary buffers
- Widely adopted standard

#### GLB
- Binary container for GLTF
- All assets in one file
- Smaller than GLTF
- Better for distribution

#### OBJ
- Text-based format
- Vertices, normals, UVs
- Companion MTL file for materials
- Very widely supported

### Coordinate System
- Y-axis is up
- Right-handed coordinate system
- Units are arbitrary (typically meters)

### Material System
The exporter uses PBR (Physically Based Rendering) materials for GLTF/GLB:
- Base color from Three.js material color
- Metallic factor (default: 0.0)
- Roughness factor (default: 1.0)
- Alpha/opacity support

For OBJ exports:
- Ambient color (Ka)
- Diffuse color (Kd)
- Specular color (Ks)
- Specular exponent (Ns)
- Opacity (d)

### Export Options
The exporter includes these default settings:
- `onlyVisible: true` - Only exports visible objects
- `embedImages: true` - Embeds textures in GLTF/GLB
- `maxTextureSize: 4096` - Maximum texture resolution
- `trs: false` - Uses matrix transforms

## Troubleshooting

### Export Button Not Working
- Ensure you have objects in your scene
- Check browser console for errors
- Try refreshing the page

### Exported File Has Missing Objects
- Make sure objects are visible before exporting
- Hidden objects are not included in exports
- Check if objects are outside the stage bounds

### Materials Look Different
- Different 3D software interprets materials differently
- Adjust material properties in the target software
- PBR materials work best in modern renderers

### File Size is Large
- Use GLB instead of GLTF for smaller files
- Reduce texture sizes before exporting
- Remove unnecessary props/objects

### Animation Export Takes Long Time
- Reduce the number of frames
- Export to GLB (faster than GLTF or OBJ)
- Close other applications to free up memory

## Best Practices

### Before Exporting
1. Clean up your scene (remove test objects)
2. Name your objects appropriately
3. Check visibility of all elements
4. Test different camera angles
5. Optimize lighting settings

### For Best Results
- Use GLB for single-file portability
- Use GLTF for maximum compatibility
- Use OBJ for traditional 3D software
- Name your exports descriptively
- Keep backups of your scenes (use Save Scene)

### For Animation
- Plan your animation sequence
- Use consistent frame rates
- Test with fewer frames first
- Organize exported frames in folders
- Consider file size vs. quality tradeoffs

## Future Enhancements

### Planned Features
- FBX export support
- Animation timeline export
- Custom material export
- Texture optimization options
- Batch export improvements
- Export presets

### Experimental
- USDZ export (iOS/AR)
- Draco compression
- KTX2 textures
- Morph targets

## API Reference

For developers who want to use the export functionality programmatically:

### SceneExporter Class

```javascript
// Create exporter instance
const exporter = new SceneExporter();

// Initialize exporters (loads libraries)
await exporter.initializeExporters();

// Export to GLB
await exporter.exportGLTF('my-scene', true);

// Export to GLTF
await exporter.exportGLTF('my-scene', false);

// Export to OBJ
await exporter.exportOBJ('my-scene');

// Batch export animation frames
await exporter.exportAnimationFrames(30, updateCallback, 'glb');
```

### Helper Functions

```javascript
// Export with UI prompts
exportSceneGLB();    // Exports as GLB with user prompts
exportSceneGLTF();   // Exports as GLTF with user prompts
exportSceneOBJ();    // Exports as OBJ/MTL with user prompts
exportAnimationFrames(); // Batch export with user prompts
```

## License

The export functionality is part of the Theater-Stage project and follows the same MIT license.

## Support

For issues or questions:
- Check the browser console for error messages
- Open an issue on GitHub
- Refer to Three.js documentation for format details

## Credits

- Three.js GLTFExporter: Based on Three.js examples
- Three.js OBJExporter: Based on Three.js examples
- GLTF 2.0 Specification: Khronos Group
- Theater-Stage: Original application
