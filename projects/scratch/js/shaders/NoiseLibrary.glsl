/**
 * Comprehensive GLSL Noise Library for Procedural Texture Generation
 * 
 * This library implements mathematically accurate noise functions for fabric simulation.
 * Each function is optimized for GPU execution while maintaining quality.
 * 
 * Functions included:
 * - Hash functions for deterministic randomization
 * - Worley (Cellular) noise for woven patterns
 * - Fractional Brownian Motion (FBM) for organic textures
 * - Stepped noise for regular fabric weaves
 * - Gradient noise (Perlin-style) for smooth variations
 * 
 * Author: Enhanced Procedural Actor Generation System
 * Version: 1.0.0
 */

#ifndef NOISE_LIBRARY_GLSL
#define NOISE_LIBRARY_GLSL

// =============================================================================
// HASH FUNCTIONS - Foundation for all noise generation
// =============================================================================

/**
 * Single-value hash function
 * Converts a single float input to a pseudo-random float in [0,1]
 * Uses a mathematically proven hash for good distribution
 */
float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

/**
 * Two-input hash function  
 * Converts vec2 input to pseudo-random float in [0,1]
 * Essential for 2D noise generation
 */
float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

/**
 * Two-input to two-output hash
 * Converts vec2 input to pseudo-random vec2 with components in [0,1]
 * Used for vector field generation and displacement
 */
vec2 hash22(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx + p3.yz) * p3.zy);
}

/**
 * Three-input hash function
 * Converts vec3 input to pseudo-random float in [0,1]
 * Required for 3D noise applications
 */
float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

/**
 * Three-input to three-output hash
 * Converts vec3 input to pseudo-random vec3 with components in [0,1]
 * Used for 3D vector field generation
 */
vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yzx + 33.33);
    return fract((p.xxy + p.yzz) * p.zyx);
}

// =============================================================================
// GRADIENT NOISE (PERLIN-STYLE) - Smooth organic patterns
// =============================================================================

/**
 * 2D Gradient Noise implementation
 * Produces smooth, organic-looking noise patterns
 * Essential for natural fabric variations and base patterns
 * 
 * @param p - 2D coordinate to sample
 * @return - Noise value in range [-1, 1]
 */
float gradientNoise2D(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    // Quintic interpolation for smoother results
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    
    // Generate gradient vectors at grid corners using hash function
    vec2 ga = hash22(i + vec2(0.0, 0.0)) * 2.0 - 1.0;
    vec2 gb = hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0;
    vec2 gc = hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0;
    vec2 gd = hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0;
    
    // Calculate dot products with distance vectors
    float va = dot(ga, f - vec2(0.0, 0.0));
    float vb = dot(gb, f - vec2(1.0, 0.0));
    float vc = dot(gc, f - vec2(0.0, 1.0));
    float vd = dot(gd, f - vec2(1.0, 1.0));
    
    // Bilinear interpolation
    return mix(mix(va, vb, u.x), mix(vc, vd, u.x), u.y);
}

/**
 * 3D Gradient Noise implementation
 * Extended version for 3D applications and layered effects
 * 
 * @param p - 3D coordinate to sample
 * @return - Noise value in range [-1, 1]
 */
float gradientNoise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    
    // Quintic interpolation
    vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    
    // Generate 8 corner gradients
    vec3 g000 = hash33(i + vec3(0, 0, 0)) * 2.0 - 1.0;
    vec3 g100 = hash33(i + vec3(1, 0, 0)) * 2.0 - 1.0;
    vec3 g010 = hash33(i + vec3(0, 1, 0)) * 2.0 - 1.0;
    vec3 g110 = hash33(i + vec3(1, 1, 0)) * 2.0 - 1.0;
    vec3 g001 = hash33(i + vec3(0, 0, 1)) * 2.0 - 1.0;
    vec3 g101 = hash33(i + vec3(1, 0, 1)) * 2.0 - 1.0;
    vec3 g011 = hash33(i + vec3(0, 1, 1)) * 2.0 - 1.0;
    vec3 g111 = hash33(i + vec3(1, 1, 1)) * 2.0 - 1.0;
    
    // Calculate dot products
    float v000 = dot(g000, f - vec3(0, 0, 0));
    float v100 = dot(g100, f - vec3(1, 0, 0));
    float v010 = dot(g010, f - vec3(0, 1, 0));
    float v110 = dot(g110, f - vec3(1, 1, 0));
    float v001 = dot(g001, f - vec3(0, 0, 1));
    float v101 = dot(g101, f - vec3(1, 0, 1));
    float v011 = dot(g011, f - vec3(0, 1, 1));
    float v111 = dot(g111, f - vec3(1, 1, 1));
    
    // Trilinear interpolation
    return mix(
        mix(mix(v000, v100, u.x), mix(v010, v110, u.x), u.y),
        mix(mix(v001, v101, u.x), mix(v011, v111, u.x), u.y),
        u.z
    );
}

// =============================================================================
// WORLEY (CELLULAR) NOISE - For woven fabric patterns
// =============================================================================

/**
 * Worley noise implementation for cellular patterns
 * Generates cell-like structures perfect for woven fabric simulation
 * Returns both distance to nearest cell and cell ID for advanced effects
 * 
 * @param p - 2D coordinate to sample
 * @param jitter - Amount of cell center randomization (0.0-1.0)
 * @return - vec2(distance to nearest cell, cell ID)
 */
vec2 worleyNoise2D(vec2 p, float jitter) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float minDist = 1.0;
    float cellID = 0.0;
    
    // Check 3x3 grid of cells around current position
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cellPos = neighbor + i;
            
            // Generate random point within this cell
            vec2 randomPoint = hash22(cellPos);
            randomPoint = neighbor + jitter * randomPoint + (1.0 - jitter) * 0.5;
            
            // Calculate distance to this cell center
            vec2 diff = randomPoint - f;
            float dist = length(diff);
            
            // Track minimum distance and corresponding cell
            if(dist < minDist) {
                minDist = dist;
                cellID = hash21(cellPos);
            }
        }
    }
    
    return vec2(minDist, cellID);
}

/**
 * Advanced Worley noise with secondary distance
 * Returns distance to both nearest and second-nearest cells
 * Useful for creating fabric weave intersections
 * 
 * @param p - 2D coordinate to sample  
 * @param jitter - Cell randomization amount
 * @return - vec3(nearest dist, second nearest dist, cell ID)
 */
vec3 worleyNoise2DAdvanced(vec2 p, float jitter) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float minDist1 = 1.0;
    float minDist2 = 1.0;
    float cellID = 0.0;
    
    // Check 3x3 grid of cells
    for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cellPos = neighbor + i;
            
            vec2 randomPoint = hash22(cellPos);
            randomPoint = neighbor + jitter * randomPoint + (1.0 - jitter) * 0.5;
            
            vec2 diff = randomPoint - f;
            float dist = length(diff);
            
            // Track two nearest distances
            if(dist < minDist1) {
                minDist2 = minDist1;
                minDist1 = dist;
                cellID = hash21(cellPos);
            } else if(dist < minDist2) {
                minDist2 = dist;
            }
        }
    }
    
    return vec3(minDist1, minDist2, cellID);
}

// =============================================================================
// FRACTIONAL BROWNIAN MOTION (FBM) - Multi-octave organic noise
// =============================================================================

/**
 * Fractional Brownian Motion using gradient noise
 * Combines multiple octaves of noise for complex organic patterns
 * Essential for realistic fabric surface irregularities
 * 
 * @param p - 2D coordinate to sample
 * @param octaves - Number of noise octaves to combine
 * @param lacunarity - Frequency scaling between octaves (typically 2.0)
 * @param gain - Amplitude scaling between octaves (typically 0.5)
 * @return - Noise value in range [-1, 1]
 */
float fbm2D(vec2 p, int octaves, float lacunarity, float gain) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxValue = 0.0;
    
    for(int i = 0; i < octaves; i++) {
        value += amplitude * gradientNoise2D(p * frequency);
        maxValue += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }
    
    return value / maxValue;
}

/**
 * Turbulence FBM - Absolute value version for more chaotic patterns
 * Creates more dramatic variations suitable for rough fabric textures
 * 
 * @param p - 2D coordinate to sample
 * @param octaves - Number of noise octaves
 * @param lacunarity - Frequency scaling
 * @param gain - Amplitude scaling
 * @return - Noise value in range [0, 1]
 */
float turbulenceFBM(vec2 p, int octaves, float lacunarity, float gain) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxValue = 0.0;
    
    for(int i = 0; i < octaves; i++) {
        value += amplitude * abs(gradientNoise2D(p * frequency));
        maxValue += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }
    
    return value / maxValue;
}

/**
 * Ridge noise - Inverted absolute noise for fabric thread patterns
 * Creates ridge-like structures perfect for thread simulation
 * 
 * @param p - 2D coordinate to sample
 * @param octaves - Number of noise octaves
 * @param lacunarity - Frequency scaling
 * @param gain - Amplitude scaling  
 * @return - Noise value in range [0, 1]
 */
float ridgeNoise2D(vec2 p, int octaves, float lacunarity, float gain) {
    float value = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxValue = 0.0;
    
    for(int i = 0; i < octaves; i++) {
        float n = abs(gradientNoise2D(p * frequency));
        n = 1.0 - n; // Invert to create ridges
        n = n * n;   // Square to sharpen ridges
        value += amplitude * n;
        maxValue += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }
    
    return value / maxValue;
}

// =============================================================================
// STEPPED NOISE - For regular fabric weave patterns
// =============================================================================

/**
 * Stepped noise for regular fabric weave patterns
 * Creates quantized noise values for regular grid-like structures
 * 
 * @param p - 2D coordinate to sample
 * @param steps - Number of discrete steps (typically 2-8)
 * @param gridSize - Size of each pattern repeat
 * @return - Stepped value in range [0, 1]
 */
float steppedNoise2D(vec2 p, float steps, float gridSize) {
    vec2 scaledP = p * gridSize;
    float noise = gradientNoise2D(scaledP);
    
    // Convert to range [0, 1]
    noise = (noise + 1.0) * 0.5;
    
    // Quantize to discrete steps
    noise = floor(noise * steps) / (steps - 1.0);
    
    return noise;
}

/**
 * Woven pattern generator
 * Creates classic over-under weave patterns for fabric simulation
 * 
 * @param p - 2D coordinate to sample
 * @param warpFreq - Frequency of warp threads (vertical)
 * @param weftFreq - Frequency of weft threads (horizontal)
 * @param offset - Phase offset for pattern variation
 * @return - Weave pattern value in range [0, 1]
 */
float wovenPattern(vec2 p, float warpFreq, float weftFreq, float offset) {
    // Calculate thread positions
    float warp = sin(p.x * warpFreq + offset) > 0.0 ? 1.0 : 0.0;
    float weft = sin(p.y * weftFreq + offset) > 0.0 ? 1.0 : 0.0;
    
    // Simple over-under weave logic
    float weave = mix(weft, 1.0 - weft, warp);
    
    // Add subtle randomization to avoid perfect regularity
    float randomization = hash21(floor(p * vec2(warpFreq, weftFreq))) * 0.1;
    
    return clamp(weave + randomization, 0.0, 1.0);
}

// =============================================================================
// UTILITY FUNCTIONS - Helper functions for fabric generation
// =============================================================================

/**
 * Smooth step function with customizable edge positions
 * More flexible than built-in smoothstep
 * 
 * @param edge0 - Lower edge position
 * @param edge1 - Upper edge position  
 * @param x - Input value
 * @return - Smoothly interpolated value [0, 1]
 */
float smootherstep(float edge0, float edge1, float x) {
    x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

/**
 * Remap function - Linear remapping of value ranges
 * Essential for converting noise ranges to usable values
 * 
 * @param value - Input value
 * @param oldMin - Minimum of input range
 * @param oldMax - Maximum of input range
 * @param newMin - Minimum of output range
 * @param newMax - Maximum of output range
 * @return - Remapped value
 */
float remap(float value, float oldMin, float oldMax, float newMin, float newMax) {
    return newMin + (value - oldMin) * (newMax - newMin) / (oldMax - oldMin);
}

/**
 * Bias function - Non-linear value remapping
 * Useful for adjusting noise contrast and character
 * 
 * @param value - Input value [0, 1]
 * @param bias - Bias amount (0.5 = no change, <0.5 = darker, >0.5 = brighter)
 * @return - Biased value [0, 1]
 */
float bias(float value, float bias) {
    return (value / ((1.0 / bias - 2.0) * (1.0 - value) + 1.0));
}

/**
 * Gain function - S-curve contrast adjustment
 * Enhances contrast around middle values
 * 
 * @param value - Input value [0, 1]
 * @param gain - Gain amount (0.5 = no change, <0.5 = less contrast, >0.5 = more contrast)
 * @return - Contrast-adjusted value [0, 1]
 */
float gain(float value, float gain) {
    if(value < 0.5) {
        return bias(value * 2.0, gain) * 0.5;
    } else {
        return bias(value * 2.0 - 1.0, 1.0 - gain) * 0.5 + 0.5;
    }
}

#endif // NOISE_LIBRARY_GLSL