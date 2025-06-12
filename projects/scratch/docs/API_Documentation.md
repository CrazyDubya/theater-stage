# 3D Theater Stage API Documentation

## Overview

The Theater API provides comprehensive control over all aspects of the 3D theater stage system, enabling AI agents and external systems to control actors, stage elements, lighting, and performances through a RESTful interface.

## Quick Start

### Basic API Usage

```javascript
// Initialize the API system (automatically done on page load)
await window.theaterAPIInstance.initialize();

// Simple API calls
const actors = await window.theaterAPI.get('/api/actors');
const newActor = await window.theaterAPI.post('/api/actors', { x: 0, z: 0, type: 'human_male' });
await window.theaterAPI.put('/api/stage/lighting', { preset: 'dramatic' });
```

### Creating a Simple Agent

```javascript
class MyAgent extends BaseAgent {
    constructor() {
        super('my-agent', { name: 'My Custom Agent' });
    }
    
    async onInitialize() {
        console.log('Agent initialized!');
        // Create an actor
        await this.createActor(0, 0, 'human_female');
    }
    
    onEvent(event, data, timestamp) {
        if (event === 'actor:created') {
            console.log('New actor created:', data.id);
        }
    }
}

// Register and start the agent
const agent = new MyAgent();
await window.agentManager.registerAgent(agent);
window.agentManager.start();
```

## API Endpoints

### Actor Management

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/api/actors` | Create new actor | `{ x, z, type }` |
| GET | `/api/actors` | Get all actors | - |
| GET | `/api/actors/:id` | Get specific actor | - |
| DELETE | `/api/actors/:id` | Remove actor | - |
| PUT | `/api/actors/:id/position` | Move actor | `{ x, z }` |
| PUT | `/api/actors/:id/move-to-marker` | Move to stage marker | `{ markerIndex }` |
| POST | `/api/actors/scatter` | Scatter selected actors | - |
| POST | `/api/actors/stop-all` | Stop all actor movement | - |

### Actor Selection

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| POST | `/api/actors/select` | Select actors | `{ actorIds: [...] }` |
| DELETE | `/api/actors/select` | Clear selection | - |
| POST | `/api/actors/select-all` | Select all actors | - |

### Stage Elements

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| PUT | `/api/stage/lighting` | Set lighting preset | `{ preset }` |
| GET | `/api/stage/lighting/presets` | Get available presets | - |
| PUT | `/api/stage/camera` | Set camera view | `{ preset }` |
| PUT | `/api/stage/curtains` | Toggle curtains | - |
| PUT | `/api/stage/markers/visibility` | Toggle markers | - |
| PUT | `/api/stage/platforms` | Move platforms | - |
| PUT | `/api/stage/rotating` | Control rotating stage | `{ action }` |
| PUT | `/api/stage/trapdoors` | Control trap doors | `{ action }` |

### State & Monitoring

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/api/state` | Get complete state | - |
| GET | `/api/state/actors` | Get actor states | - |
| GET | `/api/state/stage` | Get stage state | - |
| GET | `/api/performance/stats` | Get performance metrics | - |

## Agent System

### BaseAgent Class

All agents inherit from `BaseAgent` which provides:

- **Action Queue**: Rate-limited action processing
- **Event Subscriptions**: Real-time event handling
- **State Caching**: Local state management
- **Statistics**: Performance tracking
- **Coordination**: Multi-agent communication

### Example Agents

The system includes several example agents:

#### DirectorAgent
- Orchestrates overall theater performance
- Manages scene transitions and timing
- Controls curtains and overall flow

#### ChoreographerAgent
- Creates and executes actor formations
- Manages group movements (line, circle, triangle, scatter)
- Responds to cast changes

#### LightingAgent
- Controls ambiance and mood
- Responds to actor activity levels
- Cycles through lighting presets

#### AudienceAgent
- Simulates audience reactions
- Adjusts camera views based on engagement
- Provides performance feedback

## Event System

### Real-time Events

Agents can subscribe to real-time events:

```javascript
window.theaterAPI.subscribe(agentId, [
    'actors:update',
    'actor:created',
    'actor:moved',
    'lighting:changed',
    'state:snapshot'
]);
```

### Available Events

- `actors:update` - Actor position/state updates
- `actor:created` - New actor added
- `actor:moved` - Actor position changed
- `lighting:changed` - Lighting preset changed
- `state:snapshot` - Complete state update

## Rate Limiting & Performance

### Built-in Protections

- **Rate Limiting**: 100 API calls per minute per endpoint
- **Action Queuing**: Agents queue actions to prevent overload
- **State Caching**: Reduces redundant API calls
- **Event Batching**: Efficient real-time updates

### Performance Monitoring

```javascript
// Get agent statistics
const stats = agent.getStats();
console.log(`Actions per minute: ${stats.actionsPerMinute}`);

// Get API statistics
const apiStats = window.theaterAPIInstance.getAPIStats();
console.log(`Endpoints registered: ${apiStats.endpointsRegistered}`);
```

## Advanced Features

### Batch Operations

Execute multiple API calls efficiently:

```javascript
const operations = [
    { method: 'POST', path: '/api/actors', data: { x: 0, z: 0, type: 'human_male' } },
    { method: 'PUT', path: '/api/stage/lighting', data: { preset: 'dramatic' } },
    { method: 'PUT', path: '/api/stage/camera', data: { preset: 'close' } }
];

const results = await window.theaterAPI.batch(operations);
```

### Command Pattern

Support for undo/redo operations:

```javascript
await window.theaterAPI.post('/api/commands/execute', {
    command: 'AddActorCommand',
    params: { x: 0, z: 0, type: 'human_female' }
});

// Undo the last command
await window.theaterAPI.post('/api/commands/undo');
```

## Integration Examples

### External AI Systems

```javascript
// Example: OpenAI GPT integration
class GPTDirectorAgent extends BaseAgent {
    async generatePerformance(prompt) {
        const response = await fetch('/api/openai/completions', {
            method: 'POST',
            body: JSON.stringify({
                prompt: `Create a theater performance: ${prompt}`,
                max_tokens: 500
            })
        });
        
        const performance = await response.json();
        await this.executePerformanceScript(performance.script);
    }
}
```

### WebSocket Integration

```javascript
// Example: Real-time control from external system
const ws = new WebSocket('ws://external-controller:8080');

ws.onmessage = async (event) => {
    const command = JSON.parse(event.data);
    await window.theaterAPI.call(command.method, command.path, command.data);
};
```

## Demo Pages

- **agent-demo.html** - Full agent control demonstration
- **index.html** - Main theater with API integration
- **test.html** - Basic functionality testing

## Files Structure

```
js/
├── core/
│   └── TheaterAPI.js          # Main API system
├── agents/
│   ├── AgentInterface.js      # Base agent classes
│   └── ExampleAgents.js       # Example agent implementations
└── stage.js                   # Main application
```

## Browser Compatibility

- Modern browsers with ES6+ support
- WebGL support required for 3D rendering
- Local storage for scene persistence
- No additional dependencies beyond Three.js

## Future Enhancements

- WebSocket server integration
- Database persistence
- Multi-user collaboration
- External API integrations (OpenAI, etc.)
- Performance recording/playback
- Advanced choreography scripting