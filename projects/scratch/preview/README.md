# Actor Preview Methods

## Quick Preview Options

### 1. **Standalone 3D Viewer** ⭐ *Recommended*
```bash
open preview/actor-viewer.html
```

**Features**:
- Real-time 3D visualization of generated actors
- Interactive controls (rotate, zoom, wireframe)
- Parameter adjustment and live generation
- Load existing JSON files from CLI generation
- Actor info display with demographics
- Multiple viewing modes and lighting

**Usage**:
1. Click "Generate New Actor" for instant preview
2. Adjust parameters (gender, age, build, ethnicity) 
3. Use "Load Actor File" to view CLI-generated characters
4. Mouse controls: rotate (drag), zoom (wheel), pan (right-drag)

### 2. **CLI JSON Output** 
```bash
node cli/generate-actors.js --verbose
cat generated-actors/actor_*.json | jq .
```

**What you see**:
- Complete character data structure
- Facial feature parameters 
- Body proportions and measurements
- Clothing and style information
- Generation metadata

### 3. **Batch Preview**
```bash
# Generate multiple actors
node cli/generate-actors.js --preset crowd --count 5 --verbose

# Load each one in viewer
# Use "Load Actor File" button in viewer
```

## Viewing Generated Actors

### From CLI Generation
1. **Generate actors**: `node cli/generate-actors.js --preset business --count 3`
2. **Open viewer**: `open preview/actor-viewer.html`
3. **Load files**: Click "Load Actor File" and select any `.json` file from `generated-actors/`

### Live Generation in Viewer
1. **Open viewer**: `open preview/actor-viewer.html`
2. **Set parameters**: Choose gender, age, build, ethnicity
3. **Generate**: Click "Generate New Actor" 
4. **Iterate**: Try "Random Actor" for variety

## What You Can See

### Visual Representation
- **Body Proportions**: Height, build, scaling based on demographics
- **Facial Features**: Eye size/color, nose shape, mouth proportions  
- **Hair Styling**: Color, length, style based on parameters
- **Skin Tones**: Ethnicity-appropriate coloring
- **Clothing**: Style-appropriate garments and colors

### Technical Data
- **Demographics**: Gender, age group, ethnicity, build
- **Measurements**: Height, proportions, feature sizes
- **Algorithms**: Facial feature calculations, body scaling
- **Metadata**: Generation time, parameters, IDs

### Interactive Features
- **Rotation Control**: Auto-rotate or manual control
- **Zoom Levels**: Close-up detail or full-body view
- **Wireframe Mode**: See geometric structure
- **Camera Presets**: Reset to optimal viewing angles

## Integration Preview

### Before Theater Integration
The viewer shows exactly what the CLI generates:
- Character data structure
- Visual appearance 
- Parameter relationships
- Quality and diversity

### Theater Integration Path
```javascript
// Load CLI-generated actor
const actorData = JSON.parse(fs.readFileSync('actor_12345.json'));

// Convert to Three.js (future integration)
const actor = await proceduralActorGenerator.createThreeJSActor(actorData);

// Add to theater
scene.add(actor);
```

## Quality Assessment

### What to Look For
- **Demographic Accuracy**: Realistic feature combinations
- **Visual Coherence**: Features that work well together  
- **Ethnic Authenticity**: Appropriate characteristic distributions
- **Age Progression**: Age-appropriate proportions and features
- **Build Variations**: Realistic body type representations
- **Diversity**: Wide range of unique appearances

### Generated vs Stage Integration
- **Viewer**: Shows algorithmic output directly
- **Stage**: Will use same data with enhanced Three.js geometry
- **Compatibility**: JSON data works in both environments
- **Quality**: Preview matches final theater integration

## Quick Start Commands

```bash
# Generate and view a specific character
node cli/generate-actors.js --gender female --age young --build athletic --verbose
open preview/actor-viewer.html

# Generate diverse crowd 
node cli/generate-actors.js --preset crowd --count 10
# Then load individual files in viewer

# Generate fantasy characters
node cli/generate-actors.js --preset fantasy --count 5 --format json
# Compare in viewer vs CLI output
```

The viewer provides immediate visual feedback on the procedural generation system, showing exactly how your parameters translate to 3D characters before integration into the theater system.