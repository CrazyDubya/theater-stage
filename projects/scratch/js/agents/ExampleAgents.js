/**
 * ExampleAgents.js - Example Agent Implementations
 * 
 * Demonstrates various types of agents that can control the 3D theater stage:
 * - DirectorAgent: Manages overall show coordination
 * - ChoreographerAgent: Controls actor movements and formations
 * - LightingAgent: Manages lighting and ambiance
 * - AudienceAgent: Simulates audience reactions and interactions
 */

/**
 * DirectorAgent - Orchestrates the entire theater performance
 */
class DirectorAgent extends BaseAgent {
    constructor() {
        super('director', {
            name: 'Theater Director',
            role: 'director',
            priority: 10,
            maxActionsPerSecond: 5
        });
        
        this.currentScene = null;
        this.sceneSchedule = [];
        this.performanceState = 'idle'; // idle, preparing, performing, intermission
        this.sceneStartTime = 0;
    }

    async onInitialize() {
        console.log('🎭 Director Agent: Taking control of the theater');
        
        // Create a simple performance schedule
        this.sceneSchedule = [
            {
                name: 'Opening',
                duration: 30000, // 30 seconds
                lighting: 'dramatic',
                camera: 'audience',
                curtains: 'closed'
            },
            {
                name: 'Act 1',
                duration: 60000, // 1 minute
                lighting: 'normal',
                camera: 'stage',
                curtains: 'open'
            },
            {
                name: 'Intermission',
                duration: 20000, // 20 seconds
                lighting: 'evening',
                camera: 'overhead',
                curtains: 'closed'
            },
            {
                name: 'Finale',
                duration: 45000, // 45 seconds
                lighting: 'concert',
                camera: 'close',
                curtains: 'open'
            }
        ];
        
        // Start the show after a brief delay
        setTimeout(() => {
            this.startPerformance();
        }, 5000);
    }

    async startPerformance() {
        console.log('🎭 Director: Starting performance!');
        this.performanceState = 'performing';
        this.currentScene = 0;
        this.executeScene(this.sceneSchedule[0]);
    }

    executeScene(scene) {
        console.log(`🎭 Director: Starting scene "${scene.name}"`);
        this.sceneStartTime = Date.now();
        
        // Set scene environment
        this.setLighting(scene.lighting);
        this.setCamera(scene.camera);
        
        if (scene.curtains === 'open') {
            this.toggleCurtains();
        }
        
        // Trigger scene-specific actions
        this.triggerSceneActions(scene);
    }

    triggerSceneActions(scene) {
        switch (scene.name) {
            case 'Opening':
                // Prepare actors backstage
                this.queueAction('GET', '/api/actors', null, {
                    onComplete: (actors) => {
                        actors.forEach(actor => {
                            this.moveActor(actor.id, -12 + Math.random() * 4, Math.random() * 4);
                        });
                    }
                });
                break;
                
            case 'Act 1':
                // Move actors to stage positions
                this.queueAction('GET', '/api/actors', null, {
                    onComplete: (actors) => {
                        actors.forEach((actor, index) => {
                            const markerIndex = index % 18; // Use first 18 markers
                            this.moveActorToMarker(actor.id, markerIndex);
                        });
                    }
                });
                break;
                
            case 'Finale':
                // Gather all actors center stage
                this.queueAction('GET', '/api/actors', null, {
                    onComplete: (actors) => {
                        actors.forEach(actor => {
                            this.moveActor(actor.id, Math.random() * 6 - 3, Math.random() * 2 - 1);
                        });
                    }
                });
                break;
        }
    }

    onUpdate(deltaTime) {
        if (this.performanceState === 'performing' && this.currentScene !== null) {
            const elapsed = Date.now() - this.sceneStartTime;
            const currentSceneData = this.sceneSchedule[this.currentScene];
            
            if (elapsed >= currentSceneData.duration) {
                // Move to next scene
                this.currentScene++;
                
                if (this.currentScene >= this.sceneSchedule.length) {
                    // Performance complete
                    console.log('🎭 Director: Performance complete!');
                    this.performanceState = 'idle';
                    this.currentScene = null;
                } else {
                    // Start next scene
                    this.executeScene(this.sceneSchedule[this.currentScene]);
                }
            }
        }
    }

    onEvent(event, data, timestamp) {
        switch (event) {
            case 'actor:created':
                console.log(`🎭 Director: New actor ${data.id} joined the cast`);
                break;
            case 'lighting:changed':
                console.log(`🎭 Director: Lighting changed to ${data.preset}`);
                break;
        }
    }
}

/**
 * ChoreographerAgent - Controls actor movements and formations
 */
class ChoreographerAgent extends BaseAgent {
    constructor() {
        super('choreographer', {
            name: 'Movement Choreographer',
            role: 'choreographer',
            priority: 8,
            maxActionsPerSecond: 15
        });
        
        this.formations = {
            line: this.createLineFormation.bind(this),
            circle: this.createCircleFormation.bind(this),
            triangle: this.createTriangleFormation.bind(this),
            scatter: this.createScatterFormation.bind(this)
        };
        
        this.currentFormation = null;
        this.formationTimer = 0;
        this.formationInterval = 15000; // Change formation every 15 seconds
    }

    async onInitialize() {
        console.log('💃 Choreographer Agent: Ready to create beautiful movements');
        
        // Start with a line formation
        setTimeout(() => {
            this.executeFormation('line');
        }, 3000);
    }

    async executeFormation(formationType) {
        console.log(`💃 Choreographer: Creating ${formationType} formation`);
        
        try {
            const actors = await this.getActors();
            if (actors.length === 0) return;
            
            const positions = this.formations[formationType](actors.length);
            
            actors.forEach((actor, index) => {
                if (positions[index]) {
                    this.moveActor(actor.id, positions[index].x, positions[index].z, {
                        onComplete: () => {
                            console.log(`💃 Actor ${actor.id} reached formation position`);
                        }
                    });
                }
            });
            
            this.currentFormation = formationType;
            this.formationTimer = Date.now();
            
        } catch (error) {
            console.error('💃 Choreographer: Formation failed:', error);
        }
    }

    createLineFormation(actorCount) {
        const positions = [];
        const spacing = Math.min(2, 16 / actorCount); // Adjust spacing based on actor count
        const startX = -(actorCount - 1) * spacing / 2;
        
        for (let i = 0; i < actorCount; i++) {
            positions.push({
                x: startX + i * spacing,
                z: 0
            });
        }
        
        return positions;
    }

    createCircleFormation(actorCount) {
        const positions = [];
        const radius = Math.max(3, actorCount * 0.5);
        
        for (let i = 0; i < actorCount; i++) {
            const angle = (i / actorCount) * Math.PI * 2;
            positions.push({
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius
            });
        }
        
        return positions;
    }

    createTriangleFormation(actorCount) {
        const positions = [];
        const rows = Math.ceil(Math.sqrt(actorCount));
        let actorIndex = 0;
        
        for (let row = 0; row < rows && actorIndex < actorCount; row++) {
            const actorsInRow = Math.min(row + 1, actorCount - actorIndex);
            const rowSpacing = actorsInRow > 1 ? 4 / (actorsInRow - 1) : 0;
            const startX = -rowSpacing * (actorsInRow - 1) / 2;
            
            for (let col = 0; col < actorsInRow; col++) {
                positions.push({
                    x: startX + col * rowSpacing,
                    z: row * 2 - 2
                });
                actorIndex++;
            }
        }
        
        return positions;
    }

    createScatterFormation(actorCount) {
        const positions = [];
        
        for (let i = 0; i < actorCount; i++) {
            positions.push({
                x: (Math.random() - 0.5) * 16, // Stage width
                z: (Math.random() - 0.5) * 12  // Stage depth
            });
        }
        
        return positions;
    }

    onUpdate(deltaTime) {
        // Change formation periodically
        if (this.currentFormation && Date.now() - this.formationTimer > this.formationInterval) {
            const formations = Object.keys(this.formations);
            let nextFormation;
            
            do {
                nextFormation = formations[Math.floor(Math.random() * formations.length)];
            } while (nextFormation === this.currentFormation);
            
            this.executeFormation(nextFormation);
        }
    }

    onEvent(event, data, timestamp) {
        if (event === 'actor:created') {
            // When new actors are added, update the formation
            if (this.currentFormation) {
                setTimeout(() => {
                    this.executeFormation(this.currentFormation);
                }, 2000);
            }
        }
    }
}

/**
 * LightingAgent - Manages lighting and ambiance
 */
class LightingAgent extends BaseAgent {
    constructor() {
        super('lighting', {
            name: 'Lighting Designer',
            role: 'lighting',
            priority: 6,
            maxActionsPerSecond: 3
        });
        
        this.lightingSequence = ['normal', 'dramatic', 'evening', 'concert', 'spotlight'];
        this.currentLightingIndex = 0;
        this.lastLightingChange = 0;
        this.lightingInterval = 20000; // Change lighting every 20 seconds
        this.moodBasedLighting = true;
    }

    async onInitialize() {
        console.log('💡 Lighting Agent: Setting the perfect ambiance');
        
        // Start with normal lighting
        this.setLighting('normal');
    }

    onUpdate(deltaTime) {
        if (this.moodBasedLighting && Date.now() - this.lastLightingChange > this.lightingInterval) {
            this.cycleLighting();
        }
    }

    cycleLighting() {
        this.currentLightingIndex = (this.currentLightingIndex + 1) % this.lightingSequence.length;
        const newLighting = this.lightingSequence[this.currentLightingIndex];
        
        console.log(`💡 Lighting: Transitioning to ${newLighting}`);
        this.setLighting(newLighting);
        this.lastLightingChange = Date.now();
    }

    onEvent(event, data, timestamp) {
        switch (event) {
            case 'actors:update':
                // Adjust lighting based on actor activity
                if (data && data.length > 0) {
                    const movingActors = data.filter(actor => actor.isMoving).length;
                    const totalActors = data.length;
                    const activityRatio = movingActors / totalActors;
                    
                    if (activityRatio > 0.7) {
                        // High activity - use dynamic lighting
                        if (this.stateCache.get('lighting:changed')?.data?.preset !== 'concert') {
                            this.setLighting('concert');
                        }
                    } else if (activityRatio < 0.2) {
                        // Low activity - use calm lighting
                        if (this.stateCache.get('lighting:changed')?.data?.preset !== 'evening') {
                            this.setLighting('evening');
                        }
                    }
                }
                break;
        }
    }
}

/**
 * AudienceAgent - Simulates audience reactions and interactions
 */
class AudienceAgent extends BaseAgent {
    constructor() {
        super('audience', {
            name: 'Virtual Audience',
            role: 'audience',
            priority: 3,
            maxActionsPerSecond: 2
        });
        
        this.reactions = ['applause', 'cheer', 'gasp', 'laugh', 'whisper'];
        this.lastReaction = 0;
        this.reactionThreshold = 8000; // React every 8 seconds on average
        this.engagement = 0.5; // 0-1 engagement level
    }

    async onInitialize() {
        console.log('👏 Audience Agent: The show must go on!');
        
        // Subscribe to performance events
        window.theaterAPI.subscribe(this.agentId, [
            'actor:moved',
            'lighting:changed',
            'curtains:changed'
        ]);
    }

    onUpdate(deltaTime) {
        // Generate random audience reactions
        if (Date.now() - this.lastReaction > this.reactionThreshold * (1 / this.engagement)) {
            this.generateReaction();
        }
    }

    generateReaction() {
        const reaction = this.reactions[Math.floor(Math.random() * this.reactions.length)];
        console.log(`👏 Audience: *${reaction}*`);
        
        // Adjust camera based on reaction
        switch (reaction) {
            case 'applause':
                this.setCamera('audience');
                break;
            case 'gasp':
                this.setCamera('close');
                break;
            case 'cheer':
                this.setCamera('stage');
                break;
        }
        
        this.lastReaction = Date.now();
        
        // Engagement varies based on performance
        this.engagement = Math.max(0.1, Math.min(1, this.engagement + (Math.random() - 0.5) * 0.2));
    }

    onEvent(event, data, timestamp) {
        switch (event) {
            case 'lighting:changed':
                if (data.preset === 'dramatic') {
                    this.engagement += 0.1;
                    console.log('👏 Audience: Ooh, dramatic lighting!');
                }
                break;
                
            case 'actor:moved':
                // React to interesting actor movements
                if (Math.random() < 0.1) { // 10% chance to react to movements
                    this.generateReaction();
                }
                break;
        }
    }
}

/**
 * PerformanceAnalyzerAgent - Analyzes and reports on performance metrics
 */
class PerformanceAnalyzerAgent extends BaseAgent {
    constructor() {
        super('analyzer', {
            name: 'Performance Analyzer',
            role: 'analyzer',
            priority: 4,
            maxActionsPerSecond: 1
        });
        
        this.metrics = {
            totalActorMovements: 0,
            lightingChanges: 0,
            formationChanges: 0,
            averageActorSpeed: 0,
            performanceStartTime: Date.now()
        };
        
        this.reportInterval = 30000; // Report every 30 seconds
        this.lastReport = 0;
    }

    async onInitialize() {
        console.log('📊 Performance Analyzer: Monitoring show metrics');
    }

    onUpdate(deltaTime) {
        if (Date.now() - this.lastReport > this.reportInterval) {
            this.generateReport();
            this.lastReport = Date.now();
        }
    }

    generateReport() {
        const runtime = (Date.now() - this.metrics.performanceStartTime) / 1000;
        const movementsPerMinute = (this.metrics.totalActorMovements / runtime) * 60;
        
        console.log('📊 Performance Report:');
        console.log(`   Runtime: ${runtime.toFixed(1)}s`);
        console.log(`   Actor movements: ${this.metrics.totalActorMovements}`);
        console.log(`   Movements/minute: ${movementsPerMinute.toFixed(1)}`);
        console.log(`   Lighting changes: ${this.metrics.lightingChanges}`);
        console.log(`   Formation changes: ${this.metrics.formationChanges}`);
    }

    onEvent(event, data, timestamp) {
        switch (event) {
            case 'actor:moved':
                this.metrics.totalActorMovements++;
                break;
                
            case 'lighting:changed':
                this.metrics.lightingChanges++;
                break;
                
            case 'actors:update':
                if (data && data.length > 0) {
                    const movingActors = data.filter(actor => actor.isMoving);
                    // Calculate average speed (simplified)
                    this.metrics.averageActorSpeed = movingActors.length / data.length;
                }
                break;
        }
    }
}

// Export all agent classes
if (typeof window !== 'undefined') {
    window.DirectorAgent = DirectorAgent;
    window.ChoreographerAgent = ChoreographerAgent;
    window.LightingAgent = LightingAgent;
    window.AudienceAgent = AudienceAgent;
    window.PerformanceAnalyzerAgent = PerformanceAnalyzerAgent;
    
    console.log('🤖 Example agents loaded - DirectorAgent, ChoreographerAgent, LightingAgent, AudienceAgent, PerformanceAnalyzerAgent available');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DirectorAgent,
        ChoreographerAgent,
        LightingAgent,
        AudienceAgent,
        PerformanceAnalyzerAgent
    };
}