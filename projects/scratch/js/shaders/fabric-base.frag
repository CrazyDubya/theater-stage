/**
 * Base Fragment Shader for Procedural Fabric Materials
 * 
 * This shader generates realistic fabric textures using procedural techniques.
 * It supports all 7 fabric types with physically-based rendering output.
 * 
 * Supported Fabric Types:
 * 0 - Cotton (woven pattern with medium roughness)
 * 1 - Silk (smooth with high specular reflection)  
 * 2 - Wool (fibrous texture with higher roughness)
 * 3 - Denim (diagonal weave pattern)
 * 4 - Leather (organic grain patterns)
 * 5 - Chiffon (fine mesh, semi-transparent)
 * 6 - Polyester (synthetic smooth finish)
 * 
 * Author: Enhanced Procedural Actor Generation System
 * Version: 1.0.0
 */

#include <noise_library>

precision highp float;

// Input from vertex shader
varying vec2 vUv;
varying vec2 vFabricUv;
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vWorldPosition;
varying vec3 vViewPosition;
varying vec3 vVertexColor;
varying float vTime;

// Material properties from neural cloth system
uniform int fabricType;
uniform vec3 baseColor;
uniform float roughness;
uniform float metallic;
uniform float stiffness;
uniform float drape;
uniform float weight;

// Pattern control uniforms
uniform float patternScale;
uniform float patternStrength;
uniform vec2 weaveFrequency;
uniform float noiseScale;
uniform int noiseOctaves;

// Animation and variation
uniform float time;
uniform float animationSpeed;
uniform float colorVariation;
uniform float wearAmount;

// Output for PBR rendering
#ifdef USE_PBR
    // Modern Three.js PBR outputs
    layout(location = 0) out vec4 gAlbedo;
    layout(location = 1) out vec4 gNormal;
    layout(location = 2) out vec4 gRoughness;
    layout(location = 3) out vec4 gMetallic;
#else
    // Fallback for older Three.js versions
    // Will output combined result to gl_FragColor
#endif

/**
 * Fabric Type Definitions
 * Each fabric has specific characteristics that affect appearance
 */
struct FabricParams {
    float weaveStrength;     // How pronounced the weave pattern is
    float fiberDetail;       // Amount of fine fiber detail
    float specularLevel;     // Specular reflection strength
    float roughnessBase;     // Base roughness value
    float normalStrength;    // Normal map intensity
    vec2 patternFreq;        // Primary pattern frequency
    vec3 colorTint;          // Fabric-specific color adjustment
};

/**
 * Get fabric-specific parameters based on fabric type
 * 
 * @param type - Fabric type index (0-6)
 * @return - FabricParams struct with type-specific values
 */
FabricParams getFabricParams(int type) {
    FabricParams params;
    
    if (type == 0) { // Cotton
        params.weaveStrength = 0.6;
        params.fiberDetail = 0.4;
        params.specularLevel = 0.3;
        params.roughnessBase = 0.7;
        params.normalStrength = 0.5;
        params.patternFreq = vec2(32.0, 32.0);
        params.colorTint = vec3(1.0, 0.98, 0.95);
        
    } else if (type == 1) { // Silk
        params.weaveStrength = 0.2;
        params.fiberDetail = 0.1;
        params.specularLevel = 0.8;
        params.roughnessBase = 0.2;
        params.normalStrength = 0.2;
        params.patternFreq = vec2(64.0, 64.0);
        params.colorTint = vec3(1.0, 1.0, 1.0);
        
    } else if (type == 2) { // Wool
        params.weaveStrength = 0.4;
        params.fiberDetail = 0.8;
        params.specularLevel = 0.2;
        params.roughnessBase = 0.9;
        params.normalStrength = 0.7;
        params.patternFreq = vec2(16.0, 16.0);
        params.colorTint = vec3(0.98, 0.97, 0.95);
        
    } else if (type == 3) { // Denim
        params.weaveStrength = 0.8;
        params.fiberDetail = 0.5;
        params.specularLevel = 0.3;
        params.roughnessBase = 0.8;
        params.normalStrength = 0.6;
        params.patternFreq = vec2(24.0, 24.0);
        params.colorTint = vec3(0.95, 0.95, 1.0);
        
    } else if (type == 4) { // Leather
        params.weaveStrength = 0.0;
        params.fiberDetail = 0.3;
        params.specularLevel = 0.5;
        params.roughnessBase = 0.6;
        params.normalStrength = 0.8;
        params.patternFreq = vec2(8.0, 8.0);
        params.colorTint = vec3(1.0, 0.95, 0.9);
        
    } else if (type == 5) { // Chiffon
        params.weaveStrength = 0.3;
        params.fiberDetail = 0.2;
        params.specularLevel = 0.4;
        params.roughnessBase = 0.5;
        params.normalStrength = 0.3;
        params.patternFreq = vec2(128.0, 128.0);
        params.colorTint = vec3(1.0, 1.0, 1.0);
        
    } else { // Polyester (default)
        params.weaveStrength = 0.3;
        params.fiberDetail = 0.1;
        params.specularLevel = 0.6;
        params.roughnessBase = 0.4;
        params.normalStrength = 0.3;
        params.patternFreq = vec2(48.0, 48.0);
        params.colorTint = vec3(1.0, 1.0, 1.0);
    }
    
    return params;
}

/**
 * Generate cotton fabric pattern
 * Creates a classic over-under weave with fiber detail
 * 
 * @param uv - UV coordinates
 * @param params - Fabric parameters
 * @return - vec4(albedo.rgb, normal_strength)
 */
vec4 generateCottonPattern(vec2 uv, FabricParams params) {
    // Base weave pattern
    vec2 weaveUV = uv * params.patternFreq;
    float weave = wovenPattern(weaveUV, params.patternFreq.x, params.patternFreq.y, vTime * 0.1);
    
    // Add fiber detail using FBM
    float fiberNoise = fbm2D(uv * noiseScale * 2.0, noiseOctaves, 2.0, 0.5);
    
    // Combine patterns
    float pattern = mix(weave, fiberNoise, params.fiberDetail);
    pattern = mix(0.5, pattern, params.weaveStrength);
    
    // Color variation
    vec3 color = baseColor * params.colorTint;
    color = mix(color, color * 0.9, pattern * 0.3);
    
    return vec4(color, pattern);
}

/**
 * Generate silk fabric pattern
 * Creates smooth surface with subtle fiber alignment
 * 
 * @param uv - UV coordinates
 * @param params - Fabric parameters
 * @return - vec4(albedo.rgb, normal_strength)
 */
vec4 generateSilkPattern(vec2 uv, FabricParams params) {
    // Very fine weave pattern
    vec2 weaveUV = uv * params.patternFreq;
    float weave = wovenPattern(weaveUV, params.patternFreq.x, params.patternFreq.y, 0.0);
    
    // Subtle fiber alignment using directional noise
    float alignment = gradientNoise2D(uv * noiseScale * 0.5 + vec2(vTime * 0.05, 0.0));
    
    // Very subtle surface variation
    float surface = mix(0.5, weave, params.weaveStrength * 0.5);
    surface = mix(surface, alignment, params.fiberDetail);
    
    // Maintain silk's characteristic smoothness
    vec3 color = baseColor * params.colorTint;
    color = mix(color, color * 1.1, surface * 0.1); // Very subtle variation
    
    return vec4(color, surface * 0.5); // Reduced normal strength
}

/**
 * Generate wool fabric pattern
 * Creates fibrous, fuzzy texture with irregular surface
 * 
 * @param uv - UV coordinates  
 * @param params - Fabric parameters
 * @return - vec4(albedo.rgb, normal_strength)
 */
vec4 generateWoolPattern(vec2 uv, FabricParams params) {
    // Loose weave pattern
    vec2 weaveUV = uv * params.patternFreq;
    float weave = wovenPattern(weaveUV, params.patternFreq.x * 0.8, params.patternFreq.y * 0.8, vTime * 0.2);
    
    // Heavy fiber detail using turbulence
    float fiberNoise = turbulenceFBM(uv * noiseScale * 1.5, noiseOctaves + 1, 2.0, 0.6);
    
    // Add fuzzy surface using multiple noise scales
    float fuzz = fbm2D(uv * noiseScale * 4.0, 3, 2.0, 0.5);
    
    // Combine for wool-like appearance
    float pattern = mix(weave, fiberNoise, params.fiberDetail);
    pattern = mix(pattern, fuzz, 0.3); // Add fuzziness
    pattern = mix(0.4, pattern, params.weaveStrength);
    
    // Wool color tends to be more muted
    vec3 color = baseColor * params.colorTint;
    color = mix(color, color * 0.8, pattern * 0.4);
    
    return vec4(color, pattern);
}

/**
 * Generate denim fabric pattern
 * Creates diagonal twill weave characteristic of denim
 * 
 * @param uv - UV coordinates
 * @param params - Fabric parameters  
 * @return - vec4(albedo.rgb, normal_strength)
 */
vec4 generateDenimPattern(vec2 uv, FabricParams params) {
    // Diagonal twill weave
    vec2 weaveUV = uv * params.patternFreq;
    
    // Create diagonal pattern by offsetting weft based on warp position
    float diagonalOffset = floor(weaveUV.x) * 0.25;
    float warp = sin((weaveUV.x + vTime * 0.1) * 6.28) > 0.0 ? 1.0 : 0.0;
    float weft = sin((weaveUV.y + diagonalOffset) * 6.28) > 0.0 ? 1.0 : 0.0;
    
    float twill = mix(weft, 1.0 - weft, warp);
    
    // Add thread texture
    float threadNoise = ridgeNoise2D(uv * noiseScale * 3.0, 4, 2.0, 0.5);
    
    // Combine patterns
    float pattern = mix(twill, threadNoise, params.fiberDetail);
    pattern = mix(0.3, pattern, params.weaveStrength);
    
    // Denim has characteristic blue color variation
    vec3 color = baseColor * params.colorTint;
    color = mix(color, color * vec3(0.8, 0.9, 1.2), pattern * 0.3);
    
    return vec4(color, pattern);
}

/**
 * Generate leather pattern
 * Creates organic grain patterns typical of leather
 * 
 * @param uv - UV coordinates
 * @param params - Fabric parameters
 * @return - vec4(albedo.rgb, normal_strength)
 */
vec4 generateLeatherPattern(vec2 uv, FabricParams params) {
    // Large-scale grain pattern using Worley noise
    vec2 worley = worleyNoise2D(uv * params.patternFreq * 0.5, 0.8);
    float grainPattern = 1.0 - worley.x;
    
    // Fine surface texture
    float surfaceTexture = fbm2D(uv * noiseScale * 2.0, noiseOctaves, 2.0, 0.5);
    
    // Pore-like details using small-scale Worley noise
    float pores = 1.0 - worleyNoise2D(uv * params.patternFreq * 2.0, 0.6).x;
    pores = smootherstep(0.3, 0.7, pores);
    
    // Combine patterns
    float pattern = grainPattern;
    pattern = mix(pattern, surfaceTexture, params.fiberDetail);
    pattern = mix(pattern, pattern * pores, 0.3);
    
    // Leather color variation
    vec3 color = baseColor * params.colorTint;
    color = mix(color, color * 0.7, pattern * 0.5);
    
    return vec4(color, pattern);
}

/**
 * Generate chiffon pattern
 * Creates fine mesh-like structure with transparency
 * 
 * @param uv - UV coordinates
 * @param params - Fabric parameters
 * @return - vec4(albedo.rgb, normal_strength)
 */
vec4 generateChiffonPattern(vec2 uv, FabricParams params) {
    // Very fine mesh pattern
    vec2 meshUV = uv * params.patternFreq;
    
    // Create mesh using grid pattern
    vec2 grid = abs(fract(meshUV) - 0.5);
    float mesh = smootherstep(0.35, 0.5, max(grid.x, grid.y));
    
    // Add fine fiber detail
    float fiberNoise = gradientNoise2D(uv * noiseScale * 4.0);
    
    // Combine for delicate appearance
    float pattern = mix(mesh, fiberNoise, params.fiberDetail);
    pattern = mix(0.6, pattern, params.weaveStrength);
    
    // Chiffon maintains base color with subtle variation
    vec3 color = baseColor * params.colorTint;
    color = mix(color, color * 1.05, pattern * 0.2);
    
    return vec4(color, pattern * 0.5); // Delicate normal strength
}

/**
 * Generate polyester pattern
 * Creates synthetic smooth finish with minimal variation
 * 
 * @param uv - UV coordinates
 * @param params - Fabric parameters
 * @return - vec4(albedo.rgb, normal_strength)
 */
vec4 generatePolyesterPattern(vec2 uv, FabricParams params) {
    // Regular weave pattern
    vec2 weaveUV = uv * params.patternFreq;
    float weave = wovenPattern(weaveUV, params.patternFreq.x, params.patternFreq.y, 0.0);
    
    // Minimal surface variation
    float surface = gradientNoise2D(uv * noiseScale);
    
    // Very regular, synthetic appearance
    float pattern = mix(weave, surface, params.fiberDetail * 0.5);
    pattern = mix(0.5, pattern, params.weaveStrength * 0.7);
    
    // Clean, synthetic color
    vec3 color = baseColor * params.colorTint;
    color = mix(color, color * 0.95, pattern * 0.1);
    
    return vec4(color, pattern * 0.6);
}

/**
 * Calculate surface normal from pattern data
 * 
 * @param uv - UV coordinates
 * @param pattern - Pattern intensity
 * @param strength - Normal map strength
 * @return - Surface normal in tangent space
 */
vec3 calculateSurfaceNormal(vec2 uv, float pattern, float strength) {
    // Calculate pattern derivatives for normal mapping
    float eps = 0.001;
    float patternX = pattern;
    float patternY = pattern;
    
    // Sample neighboring pixels (approximate derivatives)
    if (fabricType == 0) {
        vec4 resultX = generateCottonPattern(uv + vec2(eps, 0.0), getFabricParams(fabricType));
        vec4 resultY = generateCottonPattern(uv + vec2(0.0, eps), getFabricParams(fabricType));
        patternX = resultX.a;
        patternY = resultY.a;
    }
    // Add similar calculations for other fabric types as needed
    
    // Calculate normal from derivatives
    float dx = (patternX - pattern) / eps;
    float dy = (patternY - pattern) / eps;
    
    vec3 normal = normalize(vec3(-dx * strength, -dy * strength, 1.0));
    return normal;
}

/**
 * Apply wear and aging effects to fabric
 * 
 * @param color - Base fabric color
 * @param uv - UV coordinates
 * @param wear - Wear amount (0-1)
 * @return - Aged color
 */
vec3 applyWearEffects(vec3 color, vec2 uv, float wear) {
    if (wear <= 0.0) return color;
    
    // Generate wear pattern using noise
    float wearPattern = fbm2D(uv * 4.0, 4, 2.0, 0.5);
    wearPattern = gain(wearPattern, 0.7); // Enhance contrast
    
    // Apply color fading
    vec3 fadedColor = color * 0.8;
    color = mix(color, fadedColor, wear * wearPattern);
    
    // Add subtle dirt accumulation in crevices
    float dirt = turbulenceFBM(uv * 8.0, 3, 2.0, 0.5);
    vec3 dirtColor = color * 0.6;
    color = mix(color, dirtColor, wear * dirt * 0.3);
    
    return color;
}

void main() {
    // Get fabric-specific parameters
    FabricParams params = getFabricParams(fabricType);
    
    // Adjust parameters based on neural cloth properties
    params.weaveStrength *= mix(0.5, 1.5, stiffness);
    params.fiberDetail *= mix(0.8, 1.2, 1.0 - drape);
    params.roughnessBase = mix(params.roughnessBase, roughness, 0.5);
    
    // Generate fabric pattern based on type
    vec4 fabricResult;
    
    if (fabricType == 0) {
        fabricResult = generateCottonPattern(vFabricUv, params);
    } else if (fabricType == 1) {
        fabricResult = generateSilkPattern(vFabricUv, params);
    } else if (fabricType == 2) {
        fabricResult = generateWoolPattern(vFabricUv, params);
    } else if (fabricType == 3) {
        fabricResult = generateDenimPattern(vFabricUv, params);
    } else if (fabricType == 4) {
        fabricResult = generateLeatherPattern(vFabricUv, params);
    } else if (fabricType == 5) {
        fabricResult = generateChiffonPattern(vFabricUv, params);
    } else {
        fabricResult = generatePolyesterPattern(vFabricUv, params);
    }
    
    // Extract color and pattern strength
    vec3 finalColor = fabricResult.rgb;
    float patternStrength = fabricResult.a;
    
    // Apply wear effects if enabled
    finalColor = applyWearEffects(finalColor, vFabricUv, wearAmount);
    
    // Add color variation based on vertex colors or noise
    vec3 colorVar = hash33(vWorldPosition * 0.1) * 2.0 - 1.0;
    finalColor = mix(finalColor, finalColor * (1.0 + colorVar * 0.1), colorVariation);
    
    // Calculate surface normal
    vec3 surfaceNormal = calculateSurfaceNormal(vFabricUv, patternStrength, params.normalStrength);
    
    // Transform normal to world space
    mat3 tbn = mat3(normalize(vTangent), normalize(vBitangent), normalize(vNormal));
    vec3 worldNormal = normalize(tbn * surfaceNormal);
    
    // Calculate final material properties
    float finalRoughness = mix(params.roughnessBase, roughness, 0.7);
    finalRoughness = mix(finalRoughness, finalRoughness * 1.2, patternStrength * 0.3);
    
    float finalMetallic = metallic;
    float finalSpecular = params.specularLevel;
    
    // Handle transparency for chiffon
    float alpha = 1.0;
    if (fabricType == 5) { // Chiffon
        alpha = mix(0.6, 1.0, patternStrength);
    }
    
    #ifdef USE_PBR
        // Output to multiple render targets for PBR
        gAlbedo = vec4(finalColor, alpha);
        gNormal = vec4(worldNormal * 0.5 + 0.5, 1.0);
        gRoughness = vec4(finalRoughness, 0.0, 0.0, 1.0);
        gMetallic = vec4(finalMetallic, finalSpecular, 0.0, 1.0);
    #else
        // Simple output for basic rendering
        gl_FragColor = vec4(finalColor, alpha);
    #endif
}