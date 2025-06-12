/**
 * LiveScriptGenerator.js - Stanford-Inspired Live Script System
 * 
 * Advanced AI system for real-time theater script generation based on Stanford's LLM live-scripts research.
 * Generates contextual, audience-responsive performance scripts that adapt in real-time.
 * 
 * Features:
 * - Real-time script generation from audience input
 * - Contextual narrative adaptation
 * - Multi-act performance structuring
 * - Character development and continuity
 * - Dynamic scene pacing
 */

class LiveScriptGenerator {
    constructor(ollamaInterface) {
        this.ollamaInterface = ollamaInterface;
        this.isInitialized = false;
        
        // Script generation state
        this.currentScript = {
            title: 'Untitled Performance',
            genre: 'mixed',
            acts: [],
            currentAct: 0,
            currentScene: 0,
            characters: new Map(),
            narrativeThreads: [],
            performanceDuration: 0
        };
        
        // Narrative continuity tracking
        this.narrativeContext = {
            establishedFacts: [],
            characterRelationships: new Map(),
            plotPoints: [],
            emotionalArc: 'neutral',
            themes: [],
            conflicts: []
        };
        
        // Performance pacing
        this.pacingManager = {
            targetDuration: 300000, // 5 minutes default
            currentTension: 0.5,
            lastClimaxTime: 0,
            sceneTransitions: [],
            audienceEngagement: 0.5
        };
        
        // Script templates based on genres
        this.scriptTemplates = this.initializeScriptTemplates();
        
        console.log('🎬 LiveScriptGenerator: Stanford-inspired script system ready');
    }

    /**
     * Initialize with script generation capabilities
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            if (!this.ollamaInterface || !this.ollamaInterface.isConnected) {
                throw new Error('OllamaInterface required and must be connected');
            }

            // Test script generation capabilities
            await this.testScriptGeneration();
            
            this.isInitialized = true;
            console.log('🎬 LiveScriptGenerator: Initialized with AI script generation');
            return true;

        } catch (error) {
            console.error('🎬 LiveScriptGenerator initialization failed:', error);
            return false;
        }
    }

    /**
     * Test basic script generation capabilities
     */
    async testScriptGeneration() {
        const testPrompt = `
        Generate a simple 30-second theater scene with 2 characters.
        Theme: Friendship
        Setting: Park bench
        
        Provide:
        1. Character names and brief descriptions
        2. Opening dialogue (2-3 lines each)
        3. Basic staging directions
        4. Emotional tone
        `;

        const response = await this.ollamaInterface.generatePerformance(testPrompt, {
            temperature: 0.7,
            max_tokens: 300
        });

        console.log('🎬 Script generation test successful');
        return response;
    }

    /**
     * Generate real-time script from audience input - Stanford-inspired approach
     */
    async generateRealTimeScript(audienceInput, currentState, options = {}) {
        try {
            const context = await this.buildNarrativeContext(currentState);
            const scriptPrompt = this.buildScriptPrompt(audienceInput, context, options);
            
            console.log(`🎬 Generating real-time script from: "${audienceInput}"`);
            
            const scriptResponse = await this.ollamaInterface.generatePerformance(scriptPrompt, {
                stream: true,
                temperature: options.creativity || 0.8,
                max_tokens: 600,
                currentState: currentState
            });

            // Update narrative continuity
            await this.updateNarrativeContext(audienceInput, scriptResponse);
            
            return {
                success: true,
                script: scriptResponse,
                context: context,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('🎬 Real-time script generation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Build comprehensive narrative context for script generation
     */
    async buildNarrativeContext(currentState) {
        const actors = currentState.actors || [];
        const performance = this.currentScript;
        
        // Analyze current performance state
        const context = {
            // Character information
            characters: this.analyzeCharacters(actors),
            
            // Scene context
            currentLocation: this.determineLocation(currentState.stage),
            timeOfDay: this.determineTimeOfDay(currentState.stage?.lighting),
            atmosphere: this.analyzeAtmosphere(currentState),
            
            // Narrative state
            storyProgress: this.calculateStoryProgress(),
            emotionalTension: this.pacingManager.currentTension,
            establishedFacts: this.narrativeContext.establishedFacts,
            activeConflicts: this.narrativeContext.conflicts,
            
            // Performance metrics
            duration: Date.now() - (performance.startTime || Date.now()),
            sceneCount: performance.acts.reduce((total, act) => total + act.scenes.length, 0),
            audienceEngagement: this.pacingManager.audienceEngagement
        };

        return context;
    }

    /**
     * Build comprehensive script generation prompt
     */
    buildScriptPrompt(audienceInput, context, options) {
        const genre = options.genre || this.currentScript.genre;
        const template = this.scriptTemplates[genre] || this.scriptTemplates.mixed;
        
        return `
**LIVE THEATER SCRIPT GENERATION**

**AUDIENCE INPUT**: "${audienceInput}"

**CURRENT CONTEXT**:
- Characters on stage: ${JSON.stringify(context.characters)}
- Setting: ${context.currentLocation} (${context.timeOfDay})
- Atmosphere: ${context.atmosphere}
- Story progress: ${Math.round(context.storyProgress * 100)}%
- Emotional tension: ${Math.round(context.emotionalTension * 100)}%
- Performance duration: ${Math.round(context.duration / 1000)}s

**ESTABLISHED NARRATIVE**:
- Known facts: ${context.establishedFacts.join(', ') || 'None yet'}
- Active conflicts: ${context.activeConflicts.join(', ') || 'None yet'}

**SCRIPT GENERATION REQUIREMENTS**:

1. **AUDIENCE INTEGRATION**: Incorporate the audience input "${audienceInput}" naturally into the ongoing narrative

2. **CHARACTER CONTINUITY**: Maintain established character personalities and relationships

3. **NARRATIVE COHERENCE**: Build on existing story elements and conflicts

4. **SCENE STRUCTURE** (Generate 2-3 minutes of content):
   - Opening moment (respond to audience input)
   - Development (explore implications, develop conflict)
   - Transition (set up next story beat)

5. **STAGING DIRECTIONS**: Use function calls to direct:
   - Actor movements and formations
   - Lighting changes to support mood
   - Camera angles for dramatic impact

6. **DIALOGUE & ACTION**: Create compelling character interactions that:
   - Feel natural and spontaneous
   - Advance the plot meaningfully
   - Surprise while maintaining logic
   - Build emotional connection

**GENRE TEMPLATE**: ${template.description}
**TONE**: ${template.tone}
**PACING**: ${template.pacing}

Generate a complete scene script with:
- Character dialogue and actions
- Staging directions via function calls
- Emotional beats and dramatic moments
- Natural integration of audience suggestion

Make this feel like a living, breathing story that responds to the audience while maintaining artistic integrity.
`;
    }

    /**
     * Generate complete performance from high-level concept
     */
    async generateFullPerformance(concept, duration = 300000, options = {}) {
        try {
            console.log(`🎬 Generating full performance: "${concept}"`);
            
            const performancePrompt = this.buildFullPerformancePrompt(concept, duration, options);
            
            // Generate performance structure first
            const structureResponse = await this.ollamaInterface.generatePerformance(performancePrompt, {
                temperature: 0.7,
                max_tokens: 800
            });

            // Initialize new script
            this.currentScript = {
                title: concept,
                genre: options.genre || 'mixed',
                acts: [],
                currentAct: 0,
                currentScene: 0,
                characters: new Map(),
                narrativeThreads: [],
                startTime: Date.now(),
                targetDuration: duration
            };

            // Reset narrative context for new performance
            this.narrativeContext = {
                establishedFacts: [],
                characterRelationships: new Map(),
                plotPoints: [],
                emotionalArc: 'rising',
                themes: [concept],
                conflicts: []
            };

            console.log('🎬 Full performance structure generated');
            return structureResponse;

        } catch (error) {
            console.error('🎬 Full performance generation failed:', error);
            throw error;
        }
    }

    /**
     * Build prompt for full performance generation
     */
    buildFullPerformancePrompt(concept, duration, options) {
        const durationMinutes = Math.round(duration / 60000);
        
        return `
**FULL PERFORMANCE GENERATION**

**CONCEPT**: "${concept}"
**DURATION**: ${durationMinutes} minutes
**STYLE**: ${options.style || 'adaptive'}
**AUDIENCE**: ${options.audience || 'general'}

Create a complete theater performance structure including:

**ACT I - SETUP (30% of time - ${Math.round(durationMinutes * 0.3)} minutes)**:
- Establish setting, mood, and main characters
- Introduce central concept/conflict
- Create compelling opening that hooks audience
- Set visual and emotional tone

**ACT II - DEVELOPMENT (40% of time - ${Math.round(durationMinutes * 0.4)} minutes)**:
- Explore the concept through character interactions
- Escalate dramatic tension
- Introduce complications and obstacles
- Build towards emotional climax

**ACT III - RESOLUTION (30% of time - ${Math.round(durationMinutes * 0.3)} minutes)**:
- Reach dramatic/emotional peak
- Resolve central conflicts
- Provide satisfying conclusion
- Create memorable final moments

**PERFORMANCE ELEMENTS TO INCLUDE**:

1. **CHARACTER CREATION**: Generate 3-5 distinct characters with:
   - Clear motivations and personalities
   - Interesting relationships and conflicts
   - Specific traits that serve the concept

2. **STAGING CONCEPTS**: Plan visual compositions including:
   - Opening tableau that establishes mood
   - Key formation changes during emotional beats
   - Dramatic lighting shifts to support story
   - Camera movements for maximum impact

3. **THEMATIC INTEGRATION**: Weave the concept throughout via:
   - Character actions and dialogue
   - Visual metaphors in staging
   - Symbolic use of space and movement
   - Emotional journey that explores the theme

**IMMEDIATE ACTIONS** (Generate opening sequence only):
Use function calls to create the opening 2-3 minutes:
- Set appropriate lighting for the concept
- Create or position characters
- Establish opening formation/composition
- Set camera angle for maximum impact

Focus on creating an opening that immediately establishes the world and draws the audience into "${concept}".
Be bold, creative, and specific. This should be unforgettable theater.
`;
    }

    /**
     * Adapt script based on performance events and audience reaction
     */
    async adaptToPerformanceEvent(event, eventData, options = {}) {
        try {
            const adaptationPrompt = this.buildAdaptationPrompt(event, eventData, options);
            
            const adaptation = await this.ollamaInterface.generatePerformance(adaptationPrompt, {
                stream: true,
                temperature: 0.9, // Higher creativity for adaptation
                max_tokens: 400
            });

            // Update pacing based on adaptation
            this.updatePacing(event, eventData);
            
            console.log(`🎬 Script adapted to event: ${event}`);
            return adaptation;

        } catch (error) {
            console.error('🎬 Script adaptation failed:', error);
            return null;
        }
    }

    /**
     * Build adaptation prompt for performance events
     */
    buildAdaptationPrompt(event, eventData, options) {
        const context = this.narrativeContext;
        const pacing = this.pacingManager;
        
        return `
**LIVE PERFORMANCE ADAPTATION**

**EVENT**: ${event}
**EVENT DATA**: ${JSON.stringify(eventData)}
**CURRENT TENSION**: ${Math.round(pacing.currentTension * 100)}%
**AUDIENCE ENGAGEMENT**: ${Math.round(pacing.audienceEngagement * 100)}%

**STORY CONTEXT**:
- Active themes: ${context.themes.join(', ')}
- Current conflicts: ${context.conflicts.join(', ')}
- Established facts: ${context.establishedFacts.slice(-5).join(', ')}

As an expert theater director, adapt the ongoing performance to this event:

1. **IMMEDIATE RESPONSE**: How should the characters/story react to this change?

2. **NARRATIVE INTEGRATION**: How can this event advance or complicate the story?

3. **DRAMATIC OPPORTUNITY**: What creative possibilities does this create?

4. **AUDIENCE ENGAGEMENT**: How can this surprise and delight the audience?

5. **PACING ADJUSTMENT**: Should this:
   - Increase tension and energy?
   - Provide a moment of calm/reflection?
   - Accelerate towards climax?
   - Introduce new conflict?

Generate specific, immediate actions using function calls.
Turn this moment into compelling theater that feels both spontaneous and purposeful.
The audience should feel like they're witnessing something magical and unrehearsed.
`;
    }

    /**
     * Analyze current characters and their dramatic potential
     */
    analyzeCharacters(actors) {
        return actors.map(actor => ({
            id: actor.id,
            position: actor.position,
            type: actor.type || 'generic',
            // Infer character traits from position and context
            role: this.inferCharacterRole(actor),
            energy: this.calculateActorEnergy(actor),
            relationships: this.findNearbyActors(actor, actors)
        }));
    }

    /**
     * Infer character role based on stage position and context
     */
    inferCharacterRole(actor) {
        const x = actor.position.x;
        const z = actor.position.z;
        
        // Center stage suggests protagonist
        if (Math.abs(x) < 2 && Math.abs(z) < 2) return 'protagonist';
        
        // Upstage suggests authority/wisdom
        if (z > 4) return 'authority';
        
        // Downstage suggests narrator/chorus
        if (z < -4) return 'narrator';
        
        // Stage left/right suggests supporting characters
        if (Math.abs(x) > 5) return 'supporting';
        
        return 'ensemble';
    }

    /**
     * Calculate actor's dramatic energy based on recent activity
     */
    calculateActorEnergy(actor) {
        // Base energy on position (center = high energy)
        const centerDistance = Math.sqrt(actor.position.x ** 2 + actor.position.z ** 2);
        return Math.max(0.1, 1 - (centerDistance / 10));
    }

    /**
     * Find nearby actors for relationship analysis
     */
    findNearbyActors(actor, allActors) {
        return allActors
            .filter(other => other.id !== actor.id)
            .map(other => {
                const distance = Math.sqrt(
                    (actor.position.x - other.position.x) ** 2 + 
                    (actor.position.z - other.position.z) ** 2
                );
                return { id: other.id, distance, relationship: this.inferRelationship(distance) };
            })
            .filter(rel => rel.distance < 5) // Only nearby actors
            .sort((a, b) => a.distance - b.distance);
    }

    /**
     * Infer relationship type based on distance
     */
    inferRelationship(distance) {
        if (distance < 1.5) return 'intimate';
        if (distance < 3) return 'conversational';
        if (distance < 5) return 'aware';
        return 'distant';
    }

    /**
     * Update narrative context based on new developments
     */
    async updateNarrativeContext(input, response) {
        // Extract new facts from the interaction
        const newFacts = this.extractFactsFromInput(input);
        this.narrativeContext.establishedFacts.push(...newFacts);
        
        // Keep only recent facts to avoid overflow
        if (this.narrativeContext.establishedFacts.length > 20) {
            this.narrativeContext.establishedFacts = this.narrativeContext.establishedFacts.slice(-15);
        }
        
        // Update emotional arc
        this.updateEmotionalArc(input, response);
        
        console.log('🎬 Narrative context updated');
    }

    /**
     * Extract actionable facts from audience input
     */
    extractFactsFromInput(input) {
        const facts = [];
        
        // Simple fact extraction (could be enhanced with NLP)
        if (input.toLowerCase().includes('storm') || input.toLowerCase().includes('rain')) {
            facts.push('weather_change_storm');
        }
        if (input.toLowerCase().includes('love') || input.toLowerCase().includes('romance')) {
            facts.push('romantic_element_introduced');
        }
        if (input.toLowerCase().includes('conflict') || input.toLowerCase().includes('fight')) {
            facts.push('conflict_escalated');
        }
        
        return facts;
    }

    /**
     * Update emotional arc based on story developments
     */
    updateEmotionalArc(input, response) {
        // Analyze emotional content and adjust arc
        const emotionalWords = {
            dramatic: ['conflict', 'tension', 'dramatic', 'intense', 'struggle'],
            romantic: ['love', 'romance', 'heart', 'passion', 'tender'],
            comedic: ['funny', 'laugh', 'joke', 'silly', 'humor'],
            mysterious: ['mystery', 'secret', 'hidden', 'unknown', 'strange']
        };
        
        for (const [emotion, words] of Object.entries(emotionalWords)) {
            if (words.some(word => input.toLowerCase().includes(word))) {
                this.narrativeContext.emotionalArc = emotion;
                break;
            }
        }
    }

    /**
     * Update performance pacing based on events
     */
    updatePacing(event, eventData) {
        const pacing = this.pacingManager;
        
        switch (event) {
            case 'actor:created':
                pacing.currentTension += 0.1;
                break;
            case 'lighting:changed':
                pacing.currentTension += 0.05;
                break;
            case 'audience:input':
                pacing.audienceEngagement += 0.15;
                break;
        }
        
        // Keep values in bounds
        pacing.currentTension = Math.max(0, Math.min(1, pacing.currentTension));
        pacing.audienceEngagement = Math.max(0, Math.min(1, pacing.audienceEngagement));
        
        // Decay engagement over time
        setTimeout(() => {
            pacing.audienceEngagement *= 0.95;
        }, 30000);
    }

    /**
     * Calculate story progress based on performance duration
     */
    calculateStoryProgress() {
        if (!this.currentScript.startTime) return 0;
        
        const elapsed = Date.now() - this.currentScript.startTime;
        const target = this.currentScript.targetDuration || 300000;
        
        return Math.min(1, elapsed / target);
    }

    /**
     * Initialize script templates for different genres
     */
    initializeScriptTemplates() {
        return {
            dramatic: {
                description: 'Focus on emotional intensity, character conflict, and meaningful dialogue',
                tone: 'serious, contemplative, emotionally rich',
                pacing: 'deliberate, building tension, powerful climaxes'
            },
            comedic: {
                description: 'Emphasize timing, physical humor, wit, and audience delight',
                tone: 'light-hearted, playful, energetic',
                pacing: 'quick, punchy, surprising'
            },
            romantic: {
                description: 'Explore relationships, emotional connection, and intimate moments',
                tone: 'tender, passionate, hopeful',
                pacing: 'gentle builds, emotional peaks, satisfying resolutions'
            },
            mystery: {
                description: 'Build suspense, reveal clues, maintain intrigue',
                tone: 'mysterious, intriguing, atmospheric',
                pacing: 'steady building, surprising reveals, satisfying solutions'
            },
            experimental: {
                description: 'Push boundaries, break conventions, surprise expectations',
                tone: 'avant-garde, unpredictable, thought-provoking',
                pacing: 'varied, unconventional, artistically bold'
            },
            mixed: {
                description: 'Blend genres adaptively based on audience input and performance flow',
                tone: 'adaptive, responsive, engaging',
                pacing: 'flexible, audience-responsive, dynamically adjusted'
            }
        };
    }

    /**
     * Determine location based on stage elements
     */
    determineLocation(stage) {
        if (!stage) return 'theater stage';
        
        // Analyze lighting and props to infer location
        const lighting = stage.lighting || 'normal';
        
        switch (lighting) {
            case 'evening': return 'outdoor evening setting';
            case 'dramatic': return 'intimate indoor space';
            case 'concert': return 'performance venue';
            case 'spotlight': return 'featured performance area';
            default: return 'versatile theater space';
        }
    }

    /**
     * Determine time of day based on lighting
     */
    determineTimeOfDay(lighting) {
        switch (lighting) {
            case 'evening': return 'evening';
            case 'dramatic': return 'night';
            case 'concert': return 'prime time';
            case 'spotlight': return 'spotlight moment';
            default: return 'daytime';
        }
    }

    /**
     * Analyze overall atmosphere from current state
     */
    analyzeAtmosphere(currentState) {
        const actors = currentState.actors || [];
        const lighting = currentState.stage?.lighting || 'normal';
        
        // Base atmosphere on actor density and lighting
        const density = actors.length;
        
        if (density === 0) return 'empty, anticipatory';
        if (density === 1) return 'intimate, personal';
        if (density <= 3) return 'focused, conversational';
        if (density <= 6) return 'dynamic, social';
        return 'ensemble, energetic';
    }

    /**
     * Get current script state and statistics
     */
    getScriptStats() {
        return {
            isInitialized: this.isInitialized,
            currentScript: { ...this.currentScript },
            narrativeContext: { ...this.narrativeContext },
            pacing: { ...this.pacingManager },
            storyProgress: this.calculateStoryProgress(),
            generatedScenes: this.currentScript.acts.reduce((total, act) => total + act.scenes?.length || 0, 0),
            activeFacts: this.narrativeContext.establishedFacts.length,
            emotionalArc: this.narrativeContext.emotionalArc,
            audienceEngagement: this.pacingManager.audienceEngagement
        };
    }

    /**
     * Reset script for new performance
     */
    resetScript() {
        this.currentScript = {
            title: 'Untitled Performance',
            genre: 'mixed',
            acts: [],
            currentAct: 0,
            currentScene: 0,
            characters: new Map(),
            narrativeThreads: [],
            performanceDuration: 0
        };

        this.narrativeContext = {
            establishedFacts: [],
            characterRelationships: new Map(),
            plotPoints: [],
            emotionalArc: 'neutral',
            themes: [],
            conflicts: []
        };

        this.pacingManager.currentTension = 0.5;
        this.pacingManager.audienceEngagement = 0.5;
        
        console.log('🎬 Script reset for new performance');
    }
}

// Export for use in theater system
if (typeof window !== 'undefined') {
    window.LiveScriptGenerator = LiveScriptGenerator;
    console.log('🎬 LiveScriptGenerator loaded - Stanford-inspired script system available');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LiveScriptGenerator };
}