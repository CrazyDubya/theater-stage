# Save/Load Scene Implementation

## Overview
This document describes the implementation of the `saveScene()` and `loadScene()` helper functions for the theater-stage project. These functions provide file I/O wrapper functionality around the existing `SceneSerializer` class.

## Files Modified/Created

### 1. `js/stage-save-load.js` (NEW)
Contains the implementation of two main functions:

#### `saveScene()`
**Purpose:** Export the current scene to a JSON file and download it to the user's device.

**Workflow:**
1. Prompts user for scene name (with default: "My Theater Scene")
2. Prompts user for scene description (optional)
3. Calls `sceneSerializer.exportScene(sceneName, description)` to serialize the scene
4. Creates a Blob with the JSON data
5. Generates a sanitized filename from the scene name
6. Creates a temporary download link and triggers the download
7. Shows success message via alert
8. Includes comprehensive error handling with user-friendly messages

**Error Handling:**
- Try-catch blocks for all operations
- User-friendly alert messages on failure
- Console logging for debugging
- Graceful handling of user cancellation

#### `loadScene()`
**Purpose:** Load a scene from a JSON file selected by the user.

**Workflow:**
1. Creates a file input element with `.json` file filter
2. Waits for user to select a file
3. Reads the file using FileReader API
4. Validates the JSON format
5. Prompts user for confirmation (warns about clearing current scene)
6. Calls `sceneSerializer.importScene(jsonData)` to restore the scene
7. Shows success message with scene name and description
8. Includes comprehensive error handling with user-friendly messages

**Error Handling:**
- Validates JSON before importing
- Confirms with user before clearing current scene
- Try-catch blocks for file reading and parsing
- Detailed error messages on failure
- Handles file picker cancellation gracefully

### 2. `index.html` (MODIFIED)
Added script tag to include the new `stage-save-load.js` file:
```html
<script src="js/stage-save-load.js"></script>
```

## Integration with Existing Code

The functions integrate seamlessly with the existing codebase:

1. **SceneSerializer Class** - Already exists in `stage.js` and handles all serialization logic
2. **UI Buttons** - Already created in `stage.js` `setupUI()` function:
   - "Save Scene" button calls `saveScene()`
   - "Load Scene" button calls `loadScene()`
3. **No modifications needed to stage.js** - Functions are defined globally and accessible to the UI buttons

## Usage

### Saving a Scene
1. Set up your stage with actors, props, lighting, etc.
2. Click the "Save Scene" button in the UI
3. Enter a name for your scene (or press OK for default)
4. Enter a description (optional)
5. The scene will be downloaded as a `.json` file to your device

### Loading a Scene
1. Click the "Load Scene" button in the UI
2. Select a previously saved `.json` scene file
3. Confirm that you want to clear the current scene
4. The scene will be restored with all actors, props, stage elements, lighting, and camera position

## Scene File Format

The saved JSON file includes:
```json
{
  "version": "1.0",
  "timestamp": "2025-10-04T20:45:00.000Z",
  "name": "My Theater Scene",
  "description": "A theatrical scene with props, actors, and stage elements",
  "stage": {
    "actors": [...],
    "props": [...],
    "lighting": {...},
    "camera": {...},
    "stageElements": {
      "platforms": [...],
      "curtains": "closed",
      "rotatingStage": {...},
      "trapDoors": [...],
      "scenery": [...],
      "markers": {...}
    }
  }
}
```

## Features

### User Experience
- **Intuitive prompts** - Clear instructions for scene name and description
- **Confirmation dialogs** - Prevents accidental data loss
- **Success/error messages** - Clear feedback on all operations
- **Sanitized filenames** - Automatic conversion of scene names to filesystem-safe filenames

### Error Handling
- **JSON validation** - Ensures file format is correct before importing
- **Try-catch blocks** - Comprehensive error catching at all levels
- **User-friendly messages** - Non-technical error descriptions with actionable advice
- **Console logging** - Detailed technical information for debugging

### File Operations
- **Blob API** - Efficient in-memory file creation
- **FileReader API** - Asynchronous file reading
- **URL.createObjectURL** - Temporary download URLs with cleanup
- **File type filtering** - Restricts file picker to JSON files only

## Testing Recommendations

1. **Save functionality:**
   - Save a complex scene with multiple actors and props
   - Verify filename sanitization works correctly
   - Test cancellation at each prompt
   - Test with empty/whitespace scene names

2. **Load functionality:**
   - Load a previously saved scene
   - Test with invalid JSON files
   - Test file picker cancellation
   - Verify all scene elements are restored correctly

3. **Error handling:**
   - Test with corrupted JSON files
   - Test with JSON files from wrong schema
   - Test browser compatibility for File API support

## Browser Compatibility

The implementation uses modern browser APIs:
- **Blob API** - Widely supported in all modern browsers
- **FileReader API** - Supported in all modern browsers
- **URL.createObjectURL** - Supported in all modern browsers
- **File input element** - Universal support

Minimum browser versions:
- Chrome 20+
- Firefox 13+
- Safari 6+
- Edge (all versions)

## Future Enhancements

Potential improvements:
1. **Auto-save** - Periodic automatic scene saving to localStorage
2. **Scene thumbnails** - Generate preview images when saving
3. **Scene library** - Built-in browser for previously saved scenes
4. **Cloud storage** - Integration with cloud storage services
5. **Version control** - Track and manage scene versions
6. **Export formats** - Support for other formats (e.g., glTF, FBX)
7. **Import validation** - More comprehensive scene file validation
8. **Undo/redo integration** - Add load operation to command history

## Notes

- The functions are designed to be non-invasive and don't modify the existing `stage.js` file
- All serialization logic remains in the `SceneSerializer` class
- The implementation follows the existing code style and patterns
- Error messages are user-friendly while technical details are logged to console
