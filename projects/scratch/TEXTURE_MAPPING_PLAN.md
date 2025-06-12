# Texture Mapping System Design Plan
## Phase 1: Foundation Research and Architecture

### Current State Analysis
- Enhanced procedural generation creates character specifications with neural cloth data
- Need to convert data specifications into actual 3D textures
- Current system produces fabric properties (stiffness, drape, weight) but no visual textures

### Core Requirements
1. **Procedural Texture Generation** - Convert neural cloth properties to visual textures
2. **UV Mapping Pipeline** - Create efficient unwrapping for generated characters
3. **Material System** - Handle different fabric types and surface properties
4. **Real-time Preview** - Show textures as they're generated
5. **Export Compatibility** - Support standard formats (PNG, JPG, EXR for PBR)

## Phase 2: Shader-Based Texture Generation Engine (Updated from Research)

### Three.js Procedural Material Implementation
- **GLSL Shader Approach**: Use shader-based procedural materials for memory efficiency and performance
- **Noise Algorithm Foundation**: Implement core noise functions for fabric patterns
  - **Worley Noise**: For cellular patterns in woven fabrics
  - **Turbulence FBM**: For natural organic textures and irregularities
  - **Stepped Noise**: For regular weave patterns with controlled repetition

### Fabric-to-Shader Translation (Research-Based)
- **Cotton**: Worley noise with medium turbulence, woven grid overlay
- **Silk**: High-frequency smooth noise with specular enhancement
- **Wool**: Multi-octave FBM for fibrous surface, higher roughness values
- **Denim**: Stepped diagonal pattern with color variation noise
- **Leather**: Organic grain using mixed Worley and FBM patterns
- **Chiffon**: High-frequency fine mesh pattern with transparency
- **Polyester**: Minimal noise, synthetic uniformity with subtle variation

### Shader-Based Implementation Strategy
1. **Fragment Shader Core**: Build base noise functions library
2. **Material Combination System**: Layer different noise types for complex fabrics
3. **Dynamic Property Mapping**: Real-time adjustment of shader uniforms based on neural cloth data
   - Stiffness → Pattern precision and regularity
   - Drape → Noise amplitude and distortion
   - Weight → Texture depth and surface detail density
4. **Color Integration**: Procedural color mixing in shader space
5. **Performance Optimization**: Use texture atlases and LOD system for different viewing distances

## Phase 3: UV Unwrapping Strategy (Revised from Research Limitations)

### Research Finding: Limited Three.js UV Automation
- **Three.js Limitation**: Programmatic UV unwrapping remains challenging in pure JavaScript
- **Current State**: Built-in geometries have pre-computed UVs, but custom mesh UV generation is limited
- **External Tool Dependency**: Complex UV unwrapping still requires external software integration

### Hybrid Approach for UV Generation
- **Template-Based UVs**: Pre-compute UV layouts for standard human topology
- **Parametric Adjustment**: Modify existing UV coordinates based on procedural character variations
- **Cylindrical/Planar Projection**: Use simple automatic projections for basic garment pieces
- **Manual Template Library**: Create UV templates for common clothing types

### Simplified UV Strategy
- **Body UV Templates**: Pre-made UV layouts for head, torso, limbs with good topology
- **Garment Projection**: Use Three.js built-in projection methods where possible
  - Cylindrical projection for sleeves and legs
  - Planar projection for flat garment panels
  - Spherical projection for rounded surfaces
- **Seam Management**: Design around predictable seam locations to minimize UV complexity

## Phase 4: PBR Material System

### Physically Based Rendering Support
- **Albedo Maps**: Base color/diffuse textures
- **Normal Maps**: Surface detail and fabric weave bumps
- **Roughness Maps**: Surface smoothness variation per fabric type
- **Metallic Maps**: Handle accessories and fabric treatments
- **Opacity Maps**: For transparent fabrics like chiffon

### Procedural Map Generation
- Generate all PBR maps simultaneously from fabric properties
- Ensure consistency between different map types
- Support for subsurface scattering on organic materials

## Phase 5: Integration Architecture

### Data Flow Design
```
Neural Cloth Properties → Fabric Analyzer → Pattern Generator → UV Mapper → PBR Creator → Export Pipeline
```

### Output Formats
- **Texture Files**: PNG/JPG for standard, EXR for HDR
- **Material Definitions**: JSON with PBR property values
- **UV Layout**: Standard UV coordinates for mesh binding
- **Metadata**: Fabric type, generation parameters, quality settings

## Technical Challenges to Address

### Performance Optimization
- Texture generation can be computationally expensive
- Need efficient caching of common patterns
- Progressive quality options (low/medium/high detail)

### Memory Management
- Large texture files for high-quality characters
- Streaming/LOD system for different viewing distances
- Compression strategies for web deployment

### Quality Consistency
- Ensuring realistic fabric appearance across all generated types
- Maintaining consistent lighting/material response
- Balancing detail vs. performance

## Implementation Timeline

### Phase 1 (Foundation): 2-3 weeks
- Research and prototype fabric pattern generation
- Design core texture generation architecture
- Create basic UV unwrapping system

### Phase 2 (Core Features): 4-5 weeks
- Implement all fabric types with basic textures
- Build automated UV mapping pipeline
- Create PBR material generation system

### Phase 3 (Polish & Integration): 2-3 weeks
- Optimize performance and quality
- Integrate with existing procedural generation
- Testing and refinement

## Success Metrics
- Generate realistic fabric textures for all 7 supported materials
- Automated UV unwrapping with <5% visible distortion
- Sub-2 second texture generation time for standard quality
- Seamless integration with enhanced character generation CLI

## Research Areas Requiring Further Investigation
1. **Advanced Fabric Simulation**: Research physically accurate fabric rendering
2. **Pattern Variety**: Explore more complex weave patterns and fabric treatments
3. **Aging/Weathering**: Implement realistic wear and usage patterns
4. **Cultural Patterns**: Add ethnic/cultural textile patterns for diverse characters
5. **Performance Benchmarks**: Test on various hardware configurations

---
*Next Steps: Conduct targeted web research on specific implementation techniques and revise this plan based on findings.*