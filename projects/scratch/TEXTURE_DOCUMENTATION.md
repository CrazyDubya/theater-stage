# Texture System Documentation

## Overview

The 3D Theater Stage application now includes comprehensive texture support for scenery panels, allowing you to customize the appearance of backdrops and midstage panels with images, procedural textures, or even videos.

## Features

### 1. Default Texture Library

Seven high-quality procedural textures are included:

- **Brick Wall** - Classic staggered brick pattern with mortar
- **Wood Planks** - Horizontal wood grain for rustic looks
- **Sky Gradient** - Blue sky with clouds for outdoor scenes
- **Stone Wall** - Random stone blocks for castle/dungeon settings
- **Metal** - Brushed metal surface for industrial scenes
- **Red Curtain** - Theater-style velvet curtain with pleats
- **Grass** - Natural grass texture for outdoor settings

All textures are generated at 512x512 resolution with repeating patterns.

### 2. Custom Image Upload

Upload your own images in any format:
- JPG/JPEG
- PNG
- WebP
- GIF (static)
- Any format supported by the browser's Image API

### 3. Video Texture Support

Upload video files for animated backdrops:
- MP4
- WebM
- OGG
- Any format supported by HTML5 video

Videos automatically loop and play muted for seamless backgrounds.

### 4. Texture Controls

#### Scale Control
- Adjust texture tiling from 0.1x to 5x
- Creates seamless patterns at any scale
- Affects both X and Y dimensions equally

#### Offset Controls
- **Offset X**: Adjust horizontal position (0-1)
- **Offset Y**: Adjust vertical position (0-1)
- Fine-tune texture alignment on panels

### 5. Clear Texture
Remove textures and return panels to their original solid colors.

## Usage Guide

### Applying a Default Texture

1. Open the control menu (☰ button)
2. Scroll to "Scenery Textures" section
3. Select a panel from the dropdown (Backdrop or Midstage)
4. Move the panel onto stage using scenery position controls
5. Choose a texture from "Select Default Texture..." dropdown
6. Texture applies immediately

### Uploading a Custom Image

1. Select your target panel
2. Click "Upload Image" button
3. Choose an image file from your computer
4. Wait for upload confirmation
5. Adjust scale and offset as needed

### Uploading a Video

1. Select your target panel
2. Click "Upload Video" button
3. Choose a video file from your computer
4. Wait for the video to load
5. Video will play automatically in a loop

### Adjusting Texture Properties

- **Scale Slider**: Drag to change texture size
  - Lower values = larger texture (less tiling)
  - Higher values = smaller texture (more tiling)
  
- **Offset X Slider**: Drag to move texture horizontally
  - 0 = left edge aligned
  - 0.5 = centered
  - 1 = right edge aligned
  
- **Offset Y Slider**: Drag to move texture vertically
  - 0 = bottom edge aligned
  - 0.5 = centered
  - 1 = top edge aligned

### Removing a Texture

1. Select the panel with texture
2. Click "Clear Texture" button
3. Panel returns to solid color

## Scene Persistence

Texture settings are saved with scenes:

### Saved Properties
- Default texture type (for built-in textures)
- Texture scale values
- Texture offset values
- Panel position

### Not Saved
- Custom uploaded images (file data not persisted)
- Video textures (file references not persisted)

**Note**: When loading a scene, you'll need to re-upload custom images and videos.

## Technical Details

### TextureManager Class

The `TextureManager` class handles all texture operations:

```javascript
// Get a default texture
const texture = textureManager.getDefaultTexture('brick');

// Load custom texture from file
const file = event.target.files[0];
const customTexture = await textureManager.loadCustomTexture(file);

// Apply texture to panel
textureManager.applyTextureToPanel(
    panelIndex,     // 0 for backdrop, 1 for midstage
    texture,        // texture object
    { x: 2, y: 2 }, // scale (optional, default 1,1)
    { x: 0, y: 0 }  // offset (optional, default 0,0)
);

// Remove texture from panel
textureManager.removeTextureFromPanel(panelIndex);

// Create video texture
const videoElement = document.createElement('video');
videoElement.src = videoURL;
const videoTexture = textureManager.loadVideoTexture(videoElement);
```

### Texture Properties

Three.js texture properties used:

- `texture.repeat`: Controls tiling (scale)
- `texture.offset`: Controls position
- `texture.wrapS`: Horizontal wrapping (RepeatWrapping)
- `texture.wrapT`: Vertical wrapping (RepeatWrapping)

### Panel System

The application has two scenery panels:

1. **Backdrop Panel** (index 0)
   - Positioned at back of stage (z = -7.3)
   - 24 units wide × 15 units tall
   - No cutout

2. **Midstage Panel** (index 1)
   - Positioned at center (z = 0)
   - 20 units wide × 15 units tall
   - Has 6×8 unit passthrough cutout

Both panels can slide on/off stage and support full texture customization.

## Best Practices

### Image Files
- Use power-of-two dimensions (256, 512, 1024, 2048) for best performance
- JPEG for photos, PNG for graphics with transparency
- Keep file sizes under 5MB for smooth loading

### Video Files
- Use compressed formats (H.264, VP9)
- Keep resolution reasonable (720p or 1080p max)
- Shorter loops work better (10-30 seconds)
- Muted audio is enforced automatically

### Texture Scale
- Start with scale 1.0 and adjust
- Scale < 1 stretches the texture (may look pixelated)
- Scale > 1 creates repeating patterns
- Different textures look best at different scales

### Performance
- Video textures use more GPU memory
- Multiple videos may impact performance
- Consider using static images for less powerful devices
- Default textures are most efficient (procedurally generated)

## Troubleshooting

### Texture doesn't appear
- Ensure the panel is moved onto stage (position > 0)
- Check browser console for errors
- Verify file format is supported

### Video doesn't play
- Check if browser supports the video format
- Try converting to MP4 with H.264 codec
- Ensure file isn't corrupted

### Poor performance
- Reduce texture resolution
- Use fewer video textures simultaneously
- Lower texture scale values
- Use default textures instead of custom files

### Texture looks stretched
- Adjust scale slider
- Check image aspect ratio matches panel (5:4 ratio)
- Use offset sliders to reposition

## Future Enhancements

Potential features for future versions:

- Texture rotation control
- Separate X/Y scale controls
- Texture blending modes
- Normal maps for 3D effect
- Texture animation controls
- Texture gallery/library management
- Thumbnail previews
- Drag-and-drop upload
- Texture presets (e.g., "Brick Wall Night", "Wood Day")

## Credits

Texture system implemented for Issue #3: "Add Texture/Image Support for Scenery Panels"

All procedural textures are generated using HTML5 Canvas API.
Three.js handles texture mapping and rendering.
