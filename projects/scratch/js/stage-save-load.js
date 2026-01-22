/**
 * Save/Load Scene Helper Functions
 * 
 * These functions provide file I/O wrappers for the SceneSerializer class.
 * They handle user interaction, file downloads, and file uploads with proper
 * error handling and user feedback.
 */

/**
 * Save the current scene to a JSON file
 * Prompts user for scene name and description, then downloads the file
 */
function saveScene() {
    try {
        // Prompt for scene name
        const sceneName = prompt('Enter a name for this scene:', 'My Theater Scene');
        
        // User cancelled
        if (sceneName === null) {
            console.log('Scene save cancelled by user');
            return;
        }
        
        // Use a default if empty
        const finalSceneName = sceneName.trim() || 'Untitled Scene';
        
        // Prompt for scene description (optional)
        const sceneDescription = prompt(
            'Enter a description for this scene (optional):',
            'A theatrical scene with props, actors, and stage elements'
        );
        
        const finalDescription = sceneDescription || '';
        
        // Export scene using the SceneSerializer
        console.log('Exporting scene:', finalSceneName);
        const jsonData = sceneSerializer.exportScene(finalSceneName, finalDescription);
        
        // Create a blob with the JSON data
        const blob = new Blob([jsonData], { type: 'application/json' });
        
        // Create a temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        
        // Generate filename from scene name (sanitize for filesystem)
        const sanitizedName = finalSceneName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        downloadLink.download = `${sanitizedName}-scene.json`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the blob URL
        URL.revokeObjectURL(downloadLink.href);
        
        console.log(`Scene "${finalSceneName}" saved successfully`);
        alert(`Scene "${finalSceneName}" has been saved successfully! The file will be downloaded to your device.`);
        
    } catch (error) {
        console.error('Failed to save scene:', error);
        alert(`Failed to save scene: ${error.message}\n\nPlease check the console for more details.`);
    }
}

/**
 * Load a scene from a JSON file
 * Opens a file picker, reads the JSON, and imports the scene
 */
function loadScene() {
    try {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json,application/json';
        
        // Handle file selection
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            
            // No file selected
            if (!file) {
                console.log('No file selected');
                return;
            }
            
            try {
                console.log('Loading scene from file:', file.name);
                
                // Read the file contents
                const fileReader = new FileReader();
                
                fileReader.onload = (e) => {
                    try {
                        const jsonData = e.target.result;
                        
                        // Validate that it's valid JSON
                        try {
                            JSON.parse(jsonData);
                        } catch (parseError) {
                            throw new Error('Invalid JSON file. Please select a valid scene file.');
                        }
                        
                        // Confirm before clearing current scene
                        const confirmLoad = confirm(
                            `This will clear the current scene and load "${file.name}".\n\nDo you want to continue?`
                        );
                        
                        if (!confirmLoad) {
                            console.log('Scene load cancelled by user');
                            return;
                        }
                        
                        // Import the scene using the SceneSerializer
                        const result = sceneSerializer.importScene(jsonData);
                        
                        if (result.success) {
                            console.log('Scene loaded successfully:', result.name);
                            alert(
                                `Scene loaded successfully!\n\n` +
                                `Name: ${result.name}\n` +
                                `Description: ${result.description || 'No description'}\n\n` +
                                `The scene has been restored to your stage.`
                            );
                        } else {
                            throw new Error(result.error || 'Unknown error during scene import');
                        }
                        
                    } catch (error) {
                        console.error('Failed to process scene file:', error);
                        alert(
                            `Failed to load scene: ${error.message}\n\n` +
                            `Please ensure you selected a valid scene file and try again.\n` +
                            `Check the console for more details.`
                        );
                    }
                };
                
                fileReader.onerror = (error) => {
                    console.error('File read error:', error);
                    alert(
                        `Failed to read file: ${error.message}\n\n` +
                        `Please try again or select a different file.`
                    );
                };
                
                // Read the file as text
                fileReader.readAsText(file);
                
            } catch (error) {
                console.error('Failed to load scene:', error);
                alert(
                    `Failed to load scene: ${error.message}\n\n` +
                    `Please check the console for more details.`
                );
            }
        };
        
        // Handle file picker cancellation
        fileInput.oncancel = () => {
            console.log('File picker cancelled by user');
        };
        
        // Trigger the file picker
        fileInput.click();
        
    } catch (error) {
        console.error('Failed to open file picker:', error);
        alert(
            `Failed to open file picker: ${error.message}\n\n` +
            `Your browser may not support this feature. Please try a different browser.`
        );
    }
}

/**
 * Load a preset template from the presets directory
 * @param {string} presetName - The preset filename (without .json extension)
 */
async function loadPreset(presetName) {
    try {
        console.log('Loading preset:', presetName);
        
        // Fetch the preset JSON file from the presets directory
        const response = await fetch(`presets/${presetName}.json`);
        
        if (!response.ok) {
            throw new Error(`Failed to load preset: ${response.statusText}`);
        }
        
        const jsonData = await response.text();
        
        // Validate JSON
        try {
            JSON.parse(jsonData);
        } catch (parseError) {
            throw new Error('Invalid preset file format');
        }
        
        // Import the scene using the SceneSerializer
        const result = sceneSerializer.importScene(jsonData);
        
        if (result.success) {
            console.log('Preset loaded successfully:', result.name);
            alert(
                `Preset loaded successfully!\n\n` +
                `Template: ${result.name}\n` +
                `Description: ${result.description || 'No description'}`
            );
        } else {
            throw new Error(result.error || 'Unknown error during preset import');
        }
        
    } catch (error) {
        console.error('Failed to load preset:', error);
        alert(
            `Failed to load preset: ${error.message}\n\n` +
            `Please check the console for more details.`
        );
    }
}
