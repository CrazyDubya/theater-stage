/**
 * Base Vertex Shader for Procedural Fabric Materials
 * 
 * This vertex shader handles standard transformations and passes
 * necessary data to the fragment shader for fabric generation.
 * 
 * Features:
 * - Standard model-view-projection transformations
 * - UV coordinate processing with scaling options
 * - Normal and tangent space calculations for bump mapping
 * - World position calculation for 3D noise sampling
 * - Vertex color support for additional variation
 * 
 * Author: Enhanced Procedural Actor Generation System
 * Version: 1.0.0
 */

// Standard Three.js attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec4 tangent;
attribute vec3 color;

// Three.js standard uniforms
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

// Custom uniforms for fabric generation
uniform vec2 uvScale;
uniform vec2 uvOffset;
uniform float fabricScale;
uniform float time;

// Varying outputs to fragment shader
varying vec2 vUv;
varying vec2 vFabricUv;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vVertexColor;
varying float vTime;

/**
 * Calculate tangent space vectors for normal mapping
 * This creates a local coordinate system for detailed surface normals
 */
void calculateTangentSpace() {
    // Transform normal to view space
    vNormal = normalize(normalMatrix * normal);
    
    // Calculate tangent vector
    vec3 transformedTangent = normalize(normalMatrix * tangent.xyz);
    
    // Calculate bitangent using cross product and tangent handedness
    vec3 transformedBitangent = normalize(cross(vNormal, transformedTangent) * tangent.w);
    
    vTangent = transformedTangent;
    vBitangent = transformedBitangent;
}

/**
 * Process UV coordinates for fabric generation
 * Handles scaling, offset, and creates fabric-specific UV coordinates
 */
void processUVCoordinates() {
    // Standard UV coordinates with user-defined scaling and offset
    vUv = uv * uvScale + uvOffset;
    
    // Fabric-specific UV coordinates for pattern generation
    // These are scaled differently to create appropriate fabric detail
    vFabricUv = uv * fabricScale;
    
    // Optional: Add subtle UV distortion based on vertex position for realism
    vec2 worldUV = (modelMatrix * vec4(position, 1.0)).xy * 0.01;
    vFabricUv += sin(worldUV * 10.0) * 0.002; // Subtle distortion
}

void main() {
    // Calculate world position for 3D noise sampling
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    // Calculate view position for lighting calculations
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = viewPosition.xyz;
    
    // Process UV coordinates
    processUVCoordinates();
    
    // Calculate tangent space for normal mapping
    calculateTangentSpace();
    
    // Pass through vertex color for additional variation
    vVertexColor = color;
    
    // Pass through time for animated effects
    vTime = time;
    
    // Standard projection transformation
    gl_Position = projectionMatrix * viewPosition;
}