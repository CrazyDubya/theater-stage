# 3D AI Theater Platform

A sophisticated AI-powered 3D theater environment built with Three.js, featuring autonomous AI directors, neural cloth physics, advanced procedural character generation, and comprehensive theatrical simulation capabilities.

**📊 Codebase:** 68,886 lines of code across 40+ modules  
**🤖 AI Integration:** Ollama local LLM with autonomous theater direction  
**🎭 Actor Systems:** Multi-tier architecture with neural enhancement  
**🧪 Physics:** Neural cloth simulation with 7 fabric types  

## 🎯 Core Systems

### 🤖 AI Director System
- **Autonomous Theater Direction**: AI analyzes scenes and directs performances
- **Ollama Integration**: Local LLM with function calling for theater control
- **Contextual Analysis**: Real-time scene understanding and adaptation
- **Error Recovery**: Exponential backoff with comprehensive error handling
- **Agent Architecture**: Modular AI agent system with action queues

### 🎭 Advanced Actor Generation
**Multi-Tier Actor Architecture:**
- **Primitive System**: Pure THREE.js geometry with guaranteed compatibility
- **Enhanced System**: Advanced multi-part anatomy with facial features
- **Advanced System**: ReadyPlayerMe integration with GLTF models
- **Procedural Generation**: 10,000+ lines of sophisticated character creation

**Neural Enhancement Features:**
- **AI Facial Correlation**: Anthropometric accuracy with demographic validation
- **Neural Cloth Physics**: Real-time fabric simulation with material properties
- **Quality Scaling**: Basic/Standard/High modes for performance optimization

### 🧪 Physics & Simulation
- **Neural Cloth System**: Physics-embedded deep learning framework
- **7 Fabric Materials**: Cotton, silk, wool, denim, leather, chiffon, polyester
- **6 Garment Topologies**: Shirt, pants, dress, jacket, skirt, robe
- **Spring-Mass Physics**: Structural, shear, and bending constraints
- **Collision Detection**: Advanced stage and prop interaction

### 🎬 Theater Infrastructure
- **Stage Elements**: Platforms, curtains, trap doors, rotating center stage
- **Lighting System**: 5 presets with dynamic spotlights and ambient control
- **Camera System**: Multiple presets with smooth transitions
- **Prop System**: Comprehensive catalog with physics integration
- **Scene Management**: State persistence and animation loops

## 🚀 Quick Start

### Basic Usage
```bash
# Start local server
python3 -m http.server 8000
# or
npm start

# Navigate to http://localhost:8000
```

### CLI Tools
```bash
# Generate procedural actors
node cli/generate-actors.js --enhanced --cloth-physics --facial-ai

# Run integration tests
node cli/verify-integration.cjs
```

### AI Director Setup
1. Install [Ollama](https://ollama.ai/)
2. Run: `ollama pull llama2` (or preferred model)
3. Start theater: AI Director auto-activates

## 🏗️ Architecture

### Modular Core Systems (40+ modules)
```
js/
├── core/                      # Core theater systems
│   ├── StateManager.js        # Centralized state management
│   ├── SceneManager.js         # Three.js scene orchestration
│   ├── PhysicsEngine.js        # Collision detection & physics
│   ├── AudioSystem.js          # 3D positional audio
│   ├── TextureManager.js       # Advanced texture loading
│   └── ...
├── agents/                    # AI Director system
│   ├── AIDirectorAgent.js      # Autonomous theater direction
│   ├── AgentInterface.js       # Agent communication layer
│   └── ExampleAgents.js        # Sample AI behaviors
├── actors/                    # Character definitions
└── shaders/                   # Custom GLSL shaders
```

### AI Director Flow
```
Ollama LLM → AgentInterface → TheaterAPI → Core Systems
    ↓              ↓              ↓            ↓
Context Analysis → Actions → HTTP Calls → Theater Updates
```

### Actor Generation Pipeline
```
ProceduralActorGenerator
    ├── AIFacialCorrelationEngine (demographic accuracy)
    ├── NeuralClothSystem (physics simulation)
    └── Multi-tier fallback (Primitive→Enhanced→Advanced)
```

## 🎮 Advanced Controls

### AI Director Commands
- **Autonomous Mode**: AI analyzes and directs scenes every 15-30 seconds
- **Manual Override**: Direct control via theater API
- **Error Recovery**: Automatic backoff with exponential delays

### Enhanced Actor Generation
- **Quality Modes**: `--quality basic|standard|high`
- **Enhanced Presets**: `enhanced_crowd`, `high_fashion`, `character_study`
- **Real-time Physics**: Neural cloth simulation with fabric properties

### Performance Controls
- **LOD System**: Distance-based quality scaling
- **Caching**: Texture and model caching for optimization
- **Memory Management**: Automatic cleanup and resource pooling

## 📊 Technical Specifications

- **Codebase**: 68,886 lines across JavaScript, HTML, GLSL
- **Modules**: 40+ specialized systems
- **AI Integration**: Ollama with function calling
- **Physics**: Neural cloth with 7 material types
- **Character Generation**: 10,000+ lines procedural system
- **Testing**: Comprehensive browser-based test suite

## 🧪 Testing & Development

### Test Suites
- `test/enhanced-generation-test.html` - Neural enhancement validation
- `demo/ai-director-demo.html` - AI Director system testing
- `preview/actor-viewer.html` - 3D character preview

### Development Tools
- Real-time metrics and performance monitoring
- Quality comparison tools (enhanced vs basic)
- Session logging for debugging

## 📚 Documentation

- `docs/PHASE_4A_COMPLETION_REPORT.md` - AI Director implementation
- `docs/PHASE_4B_COMPLETION_REPORT.md` - Enhanced generation systems
- `COMPREHENSIVE_IMPLEMENTATION_ROADMAP.md` - Future development plans

## ⚡ Performance Notes

**Optimization Status**: Requires analysis for 68k+ line codebase
- Neural systems may benefit from WASM compilation
- Cloth physics suitable for worker thread optimization
- AI Director could use request batching

## 🔧 Dependencies

- **Three.js** r128 - 3D graphics engine
- **Ollama** - Local LLM for AI Director
- **Node.js** - CLI tools and testing
- **Modern Browser** - WebGL2, ES6+ support

## 📝 License

MIT - Open source theater platform for AI research and development