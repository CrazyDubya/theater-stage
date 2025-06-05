/**
 * Constants.js - Application constants and configuration
 * 
 * Contains all constant definitions including prop catalogs, actor types,
 * physics properties, and other configuration data.
 */

// Physics properties for different object types
export const OBJECT_PHYSICS = {
    actor: { mass: 70, friction: 0.8 }, // ~70kg human
    table: { mass: 30, friction: 0.9 }, // Heavy, high friction
    chair: { mass: 8, friction: 0.7 },  // Lighter, can slide
    modernChair: { mass: 12, friction: 0.8 }, // Modern chair
    sofa: { mass: 80, friction: 0.95 }, // Very heavy, doesn't move easily
    loungeChair: { mass: 15, friction: 0.85 }, // Lounge chair
    bench: { mass: 25, friction: 0.9 }, // Bench
    stool: { mass: 5, friction: 0.6 },  // Light stool
    musicStand: { mass: 3, friction: 0.5 }, // Very light
    fountain: { mass: 200, friction: 1.0 }, // Extremely heavy, immovable
    mirror: { mass: 40, friction: 0.8 }, // Heavy mirror
    statue: { mass: 150, friction: 0.95 }, // Very heavy statue
    cube: { mass: 10, friction: 0.7 },
    sphere: { mass: 8, friction: 0.6 },
    cylinder: { mass: 12, friction: 0.7 },
    crate: { mass: 20, friction: 0.8 },
    barrel: { mass: 25, friction: 0.75 },
    plant: { mass: 15, friction: 0.85 },
    lamp: { mass: 8, friction: 0.7 }
};

// Default camera positions and settings
export const CAMERA_PRESETS = {
    default: { position: [0, 5, 20], target: [0, 0, 0] },
    overhead: { position: [0, 25, 0], target: [0, 0, 0] },
    side: { position: [25, 5, 0], target: [0, 0, 0] },
    audience: { position: [0, 3, 15], target: [0, 2, 0] },
    backstage: { position: [0, 5, -15], target: [0, 0, 0] },
    closeup: { position: [0, 2, 8], target: [0, 1, 0] }
};

// Lighting presets configuration
export const LIGHTING_PRESETS = {
    normal: {
        ambient: { intensity: 0.4, color: 0x404040 },
        directional: { intensity: 1.0, color: 0xffffff, position: [10, 10, 5] },
        point: { intensity: 0.8, color: 0xffffff, position: [0, 10, 0] }
    },
    dramatic: {
        ambient: { intensity: 0.1, color: 0x202020 },
        directional: { intensity: 0.8, color: 0xffffff, position: [10, 10, 5] },
        point: { intensity: 1.2, color: 0xffffff, position: [0, 15, 0] }
    },
    evening: {
        ambient: { intensity: 0.3, color: 0x4040ff },
        directional: { intensity: 0.6, color: 0xffaa66, position: [10, 10, 5] },
        point: { intensity: 0.9, color: 0xffaa66, position: [0, 8, 0] }
    },
    concert: {
        ambient: { intensity: 0.2, color: 0x000044 },
        directional: { intensity: 0.4, color: 0x6666ff, position: [10, 10, 5] },
        point: { intensity: 1.5, color: 0x6666ff, position: [0, 12, 0] }
    },
    spotlight: {
        ambient: { intensity: 0.05, color: 0x111111 },
        directional: { intensity: 0.2, color: 0xffffff, position: [10, 10, 5] },
        point: { intensity: 2.0, color: 0xffffff, position: [0, 15, 0] }
    }
};

// UI styling constants
export const UI_STYLES = {
    colors: {
        primary: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        background: '#222',
        text: '#fff',
        border: '#666'
    },
    spacing: {
        small: '5px',
        medium: '10px',
        large: '15px',
        xlarge: '20px'
    },
    zIndex: {
        menu: 1000,
        notification: 10001,
        dialog: 10000
    }
};

// Performance monitoring thresholds
export const PERFORMANCE_THRESHOLDS = {
    targetFPS: 60,
    maxFrameTime: 16, // milliseconds
    maxCollisionChecks: 100,
    maxActiveObjects: 50,
    memoryWarningThreshold: 100 // MB
};

// Application configuration
export const APP_CONFIG = {
    version: '2.0.0',
    name: '3D Theater Stage',
    maxUndoHistory: 50,
    autoSaveInterval: 30000, // 30 seconds
    maxSceneSize: 10, // MB
    supportedImageFormats: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
};

// For browser compatibility
if (typeof window !== 'undefined') {
    window.OBJECT_PHYSICS = OBJECT_PHYSICS;
    window.CAMERA_PRESETS = CAMERA_PRESETS;
    window.LIGHTING_PRESETS = LIGHTING_PRESETS;
    window.UI_STYLES = UI_STYLES;
    window.PERFORMANCE_THRESHOLDS = PERFORMANCE_THRESHOLDS;
    window.APP_CONFIG = APP_CONFIG;
}