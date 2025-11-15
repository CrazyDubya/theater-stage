/**
 * 3D Scene Export Module
 * 
 * This module provides functionality to export stage scenes to standard 3D formats:
 * - GLTF/GLB (GL Transmission Format)
 * - OBJ (Wavefront OBJ)
 * 
 * Exports include geometry, materials, textures, and optionally animations.
 */

class SceneExporter {
    constructor() {
        this.version = '1.0';
        this.exporters = {};
    }

    /**
     * Initialize exporters (loads Three.js exporter libraries)
     */
    async initializeExporters() {
        // Check if exporters are already loaded
        if (typeof THREE.GLTFExporter !== 'undefined' && 
            typeof THREE.OBJExporter !== 'undefined') {
            console.log('3D exporters already loaded');
            return true;
        }

        try {
            // Dynamically load exporters
            await this.loadExporters();
            console.log('3D exporters initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize 3D exporters:', error);
            return false;
        }
    }

    /**
     * Load exporter scripts dynamically
     */
    async loadExporters() {
        return new Promise((resolve, reject) => {
            let loadedCount = 0;
            const totalExporters = 2;
            let errors = [];

            const checkComplete = () => {
                loadedCount++;
                if (loadedCount === totalExporters) {
                    if (errors.length > 0) {
                        reject(new Error('Failed to load exporters: ' + errors.join(', ')));
                    } else {
                        resolve();
                    }
                }
            };

            const tryLoadScript = (urls, exporterName) => {
                let currentIndex = 0;
                
                const attemptLoad = () => {
                    if (currentIndex >= urls.length) {
                        errors.push(`${exporterName} from all sources`);
                        checkComplete();
                        return;
                    }
                    
                    const script = document.createElement('script');
                    script.src = urls[currentIndex];
                    
                    script.onload = () => {
                        console.log(`Loaded ${exporterName} from ${urls[currentIndex]}`);
                        checkComplete();
                    };
                    
                    script.onerror = () => {
                        console.warn(`Failed to load ${exporterName} from ${urls[currentIndex]}`);
                        currentIndex++;
                        attemptLoad();
                    };
                    
                    document.head.appendChild(script);
                };
                
                attemptLoad();
            };

            // Try multiple sources for GLTFExporter
            tryLoadScript([
                'lib/GLTFExporter.js',
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/exporters/GLTFExporter.js',
                'https://threejs.org/examples/js/exporters/GLTFExporter.js'
            ], 'GLTFExporter');

            // Try multiple sources for OBJExporter
            tryLoadScript([
                'lib/OBJExporter.js',
                'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/exporters/OBJExporter.js',
                'https://threejs.org/examples/js/exporters/OBJExporter.js'
            ], 'OBJExporter');
        });
    }

    /**
     * Export scene to GLTF format
     * @param {string} sceneName - Name for the exported file
     * @param {boolean} binary - If true, exports as GLB (binary), otherwise GLTF (JSON)
     * @param {Object} options - Additional export options
     */
    async exportGLTF(sceneName = 'theater-scene', binary = false, options = {}) {
        try {
            // Ensure exporters are loaded
            if (typeof THREE.GLTFExporter === 'undefined') {
                await this.initializeExporters();
            }

            if (typeof THREE.GLTFExporter === 'undefined') {
                throw new Error('GLTFExporter not available');
            }

            console.log(`Exporting scene to ${binary ? 'GLB' : 'GLTF'}...`);

            const exporter = new THREE.GLTFExporter();

            // Configure export options
            const exportOptions = {
                binary: binary,
                trs: false, // Use matrix instead of TRS for transforms
                onlyVisible: true, // Only export visible objects
                truncateDrawRange: true,
                embedImages: true, // Embed images in the GLTF/GLB
                maxTextureSize: 4096,
                ...options
            };

            // Get all objects to export (stage, props, actors, etc.)
            const exportGroup = this.prepareSceneForExport();

            return new Promise((resolve, reject) => {
                exporter.parse(
                    exportGroup,
                    (result) => {
                        try {
                            if (binary) {
                                // GLB (binary) format
                                const blob = new Blob([result], { type: 'application/octet-stream' });
                                this.downloadFile(blob, `${sceneName}.glb`);
                            } else {
                                // GLTF (JSON) format
                                const output = JSON.stringify(result, null, 2);
                                const blob = new Blob([output], { type: 'application/json' });
                                this.downloadFile(blob, `${sceneName}.gltf`);
                            }
                            console.log(`${binary ? 'GLB' : 'GLTF'} export completed successfully`);
                            resolve(true);
                        } catch (error) {
                            reject(error);
                        }
                    },
                    (error) => {
                        console.error('GLTF export error:', error);
                        reject(error);
                    },
                    exportOptions
                );
            });
        } catch (error) {
            console.error('Failed to export GLTF:', error);
            throw error;
        }
    }

    /**
     * Export scene to OBJ format
     * @param {string} sceneName - Name for the exported file
     */
    async exportOBJ(sceneName = 'theater-scene') {
        try {
            // Ensure exporters are loaded
            if (typeof THREE.OBJExporter === 'undefined') {
                await this.initializeExporters();
            }

            if (typeof THREE.OBJExporter === 'undefined') {
                throw new Error('OBJExporter not available');
            }

            console.log('Exporting scene to OBJ...');

            const exporter = new THREE.OBJExporter();

            // Get all objects to export
            const exportGroup = this.prepareSceneForExport();

            // Parse the scene
            const result = exporter.parse(exportGroup);

            // Create and download OBJ file
            const blob = new Blob([result], { type: 'text/plain' });
            this.downloadFile(blob, `${sceneName}.obj`);

            // Also create a basic MTL file for materials
            const mtlContent = this.generateMTL(exportGroup);
            const mtlBlob = new Blob([mtlContent], { type: 'text/plain' });
            this.downloadFile(mtlBlob, `${sceneName}.mtl`);

            console.log('OBJ export completed successfully');
            return true;
        } catch (error) {
            console.error('Failed to export OBJ:', error);
            throw error;
        }
    }

    /**
     * Prepare the scene for export by creating a group with all exportable objects
     */
    prepareSceneForExport() {
        const exportGroup = new THREE.Group();
        exportGroup.name = 'theater-stage-scene';

        // Clone and add stage
        if (stage) {
            const stageClone = stage.clone();
            stageClone.name = 'stage';
            exportGroup.add(stageClone);
        }

        // Add props
        if (props && props.length > 0) {
            const propsGroup = new THREE.Group();
            propsGroup.name = 'props';
            props.forEach((prop, index) => {
                if (prop.visible) {
                    const propClone = prop.clone();
                    propClone.name = prop.userData.name || `prop_${index}`;
                    propsGroup.add(propClone);
                }
            });
            exportGroup.add(propsGroup);
        }

        // Add actors
        if (actors && actors.length > 0) {
            const actorsGroup = new THREE.Group();
            actorsGroup.name = 'actors';
            actors.forEach((actor, index) => {
                if (actor.visible) {
                    const actorClone = actor.clone();
                    actorClone.name = actor.userData.name || `actor_${index}`;
                    actorsGroup.add(actorClone);
                }
            });
            exportGroup.add(actorsGroup);
        }

        // Add stage elements (platforms, curtains, etc.)
        if (moveablePlatforms && moveablePlatforms.length > 0) {
            const platformsGroup = new THREE.Group();
            platformsGroup.name = 'platforms';
            moveablePlatforms.forEach((platform, index) => {
                if (platform.visible) {
                    const platformClone = platform.clone();
                    platformClone.name = `platform_${index}`;
                    platformsGroup.add(platformClone);
                }
            });
            exportGroup.add(platformsGroup);
        }

        // Add rotating stage
        if (rotatingStage && rotatingStage.visible) {
            const rotatingStageClone = rotatingStage.clone();
            rotatingStageClone.name = 'rotating_stage';
            exportGroup.add(rotatingStageClone);
        }

        // Add trap doors
        if (trapDoors && trapDoors.length > 0) {
            const trapDoorsGroup = new THREE.Group();
            trapDoorsGroup.name = 'trap_doors';
            trapDoors.forEach((trapDoor, index) => {
                if (trapDoor.visible) {
                    const trapDoorClone = trapDoor.clone();
                    trapDoorClone.name = `trap_door_${index}`;
                    trapDoorsGroup.add(trapDoorClone);
                }
            });
            exportGroup.add(trapDoorsGroup);
        }

        // Add curtains
        if (curtainLeft && curtainRight && curtainTop) {
            const curtainsGroup = new THREE.Group();
            curtainsGroup.name = 'curtains';
            curtainsGroup.add(curtainLeft.clone());
            curtainsGroup.add(curtainRight.clone());
            curtainsGroup.add(curtainTop.clone());
            exportGroup.add(curtainsGroup);
        }

        // Add scenery panels
        if (sceneryPanels && sceneryPanels.length > 0) {
            const sceneryGroup = new THREE.Group();
            sceneryGroup.name = 'scenery';
            sceneryPanels.forEach((panel, index) => {
                const panelClone = panel.clone();
                panelClone.name = `scenery_panel_${index}`;
                sceneryGroup.add(panelClone);
            });
            exportGroup.add(sceneryGroup);
        }

        return exportGroup;
    }

    /**
     * Generate MTL (material) file for OBJ export
     */
    generateMTL(group) {
        const materials = new Set();
        const mtlLines = ['# Material file for theater-stage export', ''];

        // Traverse the group and collect unique materials
        group.traverse((object) => {
            if (object.material) {
                const material = object.material;
                const materialName = material.name || `material_${materials.size}`;
                
                if (!materials.has(materialName)) {
                    materials.add(materialName);
                    
                    // Write material definition
                    mtlLines.push(`newmtl ${materialName}`);
                    
                    // Ambient color
                    mtlLines.push(`Ka ${material.color ? material.color.r : 0.2} ${material.color ? material.color.g : 0.2} ${material.color ? material.color.b : 0.2}`);
                    
                    // Diffuse color
                    mtlLines.push(`Kd ${material.color ? material.color.r : 0.8} ${material.color ? material.color.g : 0.8} ${material.color ? material.color.b : 0.8}`);
                    
                    // Specular color
                    mtlLines.push(`Ks 0.5 0.5 0.5`);
                    
                    // Specular exponent
                    mtlLines.push(`Ns 10.0`);
                    
                    // Opacity
                    mtlLines.push(`d ${material.opacity !== undefined ? material.opacity : 1.0}`);
                    
                    // Illumination model (2 = color on and ambient on)
                    mtlLines.push(`illum 2`);
                    
                    mtlLines.push('');
                }
            }
        });

        return mtlLines.join('\n');
    }

    /**
     * Download a file to the user's computer
     */
    downloadFile(blob, filename) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

    /**
     * Batch export for animation frames
     * Exports the current scene state for each frame
     * @param {number} frameCount - Number of frames to export
     * @param {Function} updateCallback - Function to call between frames to update the scene
     */
    async exportAnimationFrames(frameCount = 30, updateCallback, format = 'gltf') {
        try {
            console.log(`Starting batch export of ${frameCount} frames...`);
            
            for (let i = 0; i < frameCount; i++) {
                // Update scene if callback provided
                if (updateCallback && typeof updateCallback === 'function') {
                    updateCallback(i);
                }

                // Export current frame
                const frameName = `theater-scene-frame-${String(i).padStart(4, '0')}`;
                
                if (format === 'glb') {
                    await this.exportGLTF(frameName, true);
                } else if (format === 'obj') {
                    await this.exportOBJ(frameName);
                } else {
                    await this.exportGLTF(frameName, false);
                }

                // Small delay between exports
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log('Batch export completed successfully');
            return true;
        } catch (error) {
            console.error('Failed to export animation frames:', error);
            throw error;
        }
    }
}

// Create global instance
const sceneExporter = new SceneExporter();

/**
 * UI Helper Functions for 3D Export
 */

/**
 * Export scene to GLB (binary GLTF)
 */
async function exportSceneGLB() {
    try {
        const sceneName = prompt('Enter a name for the GLB export:', 'theater-scene');
        if (!sceneName) {
            console.log('Export cancelled by user');
            return;
        }

        // Initialize exporters if needed
        if (!await sceneExporter.initializeExporters()) {
            alert('Failed to load 3D export libraries. Please try again.');
            return;
        }

        // Export to GLB
        await sceneExporter.exportGLTF(sceneName, true);
        alert(`Scene exported successfully as ${sceneName}.glb!\n\nThe file has been downloaded to your device.`);
    } catch (error) {
        console.error('GLB export failed:', error);
        alert(`Failed to export GLB: ${error.message}`);
    }
}

/**
 * Export scene to GLTF (JSON format)
 */
async function exportSceneGLTF() {
    try {
        const sceneName = prompt('Enter a name for the GLTF export:', 'theater-scene');
        if (!sceneName) {
            console.log('Export cancelled by user');
            return;
        }

        // Initialize exporters if needed
        if (!await sceneExporter.initializeExporters()) {
            alert('Failed to load 3D export libraries. Please try again.');
            return;
        }

        // Export to GLTF
        await sceneExporter.exportGLTF(sceneName, false);
        alert(`Scene exported successfully as ${sceneName}.gltf!\n\nThe file has been downloaded to your device.`);
    } catch (error) {
        console.error('GLTF export failed:', error);
        alert(`Failed to export GLTF: ${error.message}`);
    }
}

/**
 * Export scene to OBJ
 */
async function exportSceneOBJ() {
    try {
        const sceneName = prompt('Enter a name for the OBJ export:', 'theater-scene');
        if (!sceneName) {
            console.log('Export cancelled by user');
            return;
        }

        // Initialize exporters if needed
        if (!await sceneExporter.initializeExporters()) {
            alert('Failed to load 3D export libraries. Please try again.');
            return;
        }

        // Export to OBJ
        await sceneExporter.exportOBJ(sceneName);
        alert(`Scene exported successfully as ${sceneName}.obj and ${sceneName}.mtl!\n\nThe files have been downloaded to your device.`);
    } catch (error) {
        console.error('OBJ export failed:', error);
        alert(`Failed to export OBJ: ${error.message}`);
    }
}

/**
 * Export animation frames
 */
async function exportAnimationFrames() {
    try {
        const frameCount = parseInt(prompt('How many frames would you like to export?', '30'));
        if (isNaN(frameCount) || frameCount <= 0) {
            console.log('Export cancelled - invalid frame count');
            return;
        }

        const format = prompt('Export format? (gltf, glb, or obj)', 'glb');
        if (!format || !['gltf', 'glb', 'obj'].includes(format.toLowerCase())) {
            alert('Invalid format. Please choose gltf, glb, or obj');
            return;
        }

        // Initialize exporters if needed
        if (!await sceneExporter.initializeExporters()) {
            alert('Failed to load 3D export libraries. Please try again.');
            return;
        }

        // Ask if user wants to animate rotating stage
        const animateRotation = confirm('Animate rotating stage? (OK = Yes, Cancel = No)');

        // Define update callback for animation
        const updateCallback = animateRotation ? (frameIndex) => {
            // Rotate the stage slightly each frame
            if (rotatingStage) {
                rotatingStage.rotation.y = (frameIndex / frameCount) * Math.PI * 2;
            }
        } : null;

        alert(`Starting export of ${frameCount} frames. This may take a while...`);

        // Export frames
        await sceneExporter.exportAnimationFrames(frameCount, updateCallback, format.toLowerCase());
        
        alert(`Successfully exported ${frameCount} frames as ${format.toUpperCase()}!\n\nThe files have been downloaded to your device.`);
    } catch (error) {
        console.error('Animation export failed:', error);
        alert(`Failed to export animation frames: ${error.message}`);
    }
}
