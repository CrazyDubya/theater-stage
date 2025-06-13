/**
 * MusicComposerAgent.js - AI-Powered Original Score Creation
 * 
 * The Music Composer Agent uses Ollama LLM to create original musical scores
 * specifically tailored for theatrical productions. Works alongside the Music Director
 * to develop themes, motifs, and musical landscapes that enhance storytelling.
 * 
 * Features:
 * - AI-driven original composition and score creation
 * - Thematic development and musical motif design
 * - Character themes and leitmotif creation
 * - Orchestration and arrangement planning
 * - Real-time musical adaptation for scene changes
 * - Integration with Music Director and production team
 */

class MusicComposerAgent extends BaseAgent {
    constructor(config = {}) {
        super('music-composer', {
            name: 'Music Composer',
            role: 'music-composer',
            priority: 75, // High priority for musical creativity
            maxActionsPerSecond: 4,
            personality: config.personality || 'creative',
            ...config
        });
        
        // Music Composer specific properties
        this.ollamaInterface = null;
        this.compositionStyle = config.style || 'cinematic';
        this.creativityLevel = config.creativity || 0.9;
        
        // Musical composition capabilities
        this.compositionCapabilities = {
            originalComposition: {
                themeCreation: true,
                motifDevelopment: true,
                harmonyDesign: true,
                rhythmPatterns: true,
                melodicLines: true
            },
            orchestration: {
                instrumentSelection: true,
                voiceArrangement: true,
                textureDesign: true,
                dynamicPlanning: true,
                colorPalette: true
            },
            musicalStorytelling: {
                characterThemes: true,
                emotionalMapping: true,
                narrativeSupport: true,
                tensionBuilding: true,
                climaxDesign: true
            },
            technicalSkills: {
                formStructure: true,
                counterpoint: true,
                modulation: true,
                development: true,
                variation: true
            },
            collaboration: {
                directorIntegration: true,
                lyricistCoordination: true,
                performerSupport: true,
                productionAlignment: true,
                technicalTeamwork: true
            }
        };
        
        // Current composition project
        this.compositionProject = {
            production: null,
            musicalConcept: null,
            thematicMaterial: new Map(),
            characterThemes: new Map(),
            sceneMusic: new Map(),
            orchestrationPlan: new Map(),
            status: 'idle'
        };
        
        // Musical elements and theory
        this.musicalElements = {
            scales: {
                major: { mood: 'bright, happy, stable', usage: 'joyful scenes, triumph' },
                minor: { mood: 'sad, mysterious, dramatic', usage: 'tragedy, conflict' },
                dorian: { mood: 'contemplative, folk-like', usage: 'reflection, tradition' },
                mixolydian: { mood: 'modal, open, modern', usage: 'contemporary, freedom' },
                pentatonic: { mood: 'simple, universal', usage: 'timeless, elemental' },
                chromatic: { mood: 'tense, uncertain', usage: 'confusion, transformation' }
            },
            rhythms: {
                waltz: { pattern: '3/4', character: 'elegant, flowing', usage: 'dance, romance' },
                march: { pattern: '4/4', character: 'strong, determined', usage: 'procession, power' },
                irregular: { pattern: 'mixed', character: 'unsettled, complex', usage: 'tension, modernity' },
                ostinato: { pattern: 'repetitive', character: 'driving, hypnotic', usage: 'building energy' }
            },
            harmonies: {
                consonant: { quality: 'stable, resolved', emotion: 'peace, satisfaction' },
                dissonant: { quality: 'unstable, tense', emotion: 'conflict, uncertainty' },
                suspended: { quality: 'anticipatory', emotion: 'longing, expectation' },
                augmented: { quality: 'mysterious, exotic', emotion: 'otherworldly, strange' },
                diminished: { quality: 'dark, ominous', emotion: 'fear, foreboding' }
            }
        };
        
        // Instrumentation and orchestration
        this.instrumentalPalette = {
            strings: {
                violin: { range: 'high', character: 'lyrical, expressive', role: 'melody, harmony' },
                viola: { range: 'mid', character: 'warm, rich', role: 'harmony, countermelody' },
                cello: { range: 'low-mid', character: 'deep, emotional', role: 'bass, melody' },
                bass: { range: 'low', character: 'foundational', role: 'bass, rhythm' }
            },
            winds: {
                flute: { range: 'high', character: 'light, airy', role: 'melody, color' },
                oboe: { range: 'mid-high', character: 'nasal, pastoral', role: 'melody, solos' },
                clarinet: { range: 'wide', character: 'versatile, smooth', role: 'melody, harmony' },
                bassoon: { range: 'low', character: 'comical, serious', role: 'bass, character' }
            },
            brass: {
                trumpet: { range: 'high', character: 'bright, heroic', role: 'melody, fanfare' },
                horn: { range: 'mid', character: 'noble, warm', role: 'harmony, calls' },
                trombone: { range: 'low-mid', character: 'majestic, powerful', role: 'harmony, bass' },
                tuba: { range: 'low', character: 'deep, foundational', role: 'bass, support' }
            },
            percussion: {
                timpani: { role: 'rhythmic foundation, dramatic accents' },
                snare: { role: 'military character, tension' },
                cymbals: { role: 'climactic moments, crashes' },
                xylophone: { role: 'lightness, magical effects' }
            },
            piano: { range: 'full', character: 'versatile, complete', role: 'accompaniment, solo' },
            voice: { range: 'varied', character: 'human, expressive', role: 'melody, text' }
        };
        
        // Compositional forms and structures
        this.musicalForms = {
            throughComposed: {
                description: 'Continuous development without repetition',
                usage: 'Complex narratives, stream of consciousness',
                advantages: 'Maximum flexibility, unlimited development'
            },
            aaba: {
                description: 'Verse-chorus structure with bridge',
                usage: 'Song forms, accessible melodies',
                advantages: 'Memorable, balanced, familiar'
            },
            rondo: {
                description: 'Recurring theme with contrasting episodes',
                usage: 'Character returns, cyclical narratives',
                advantages: 'Unity with variety, clear structure'
            },
            variations: {
                description: 'Theme with successive modifications',
                usage: 'Character development, transformation scenes',
                advantages: 'Development potential, structural unity'
            },
            leitmotif: {
                description: 'Character or concept themes woven throughout',
                usage: 'Character identification, narrative connection',
                advantages: 'Psychological depth, musical unity'
            }
        };
        
        // Character archetypes and musical representations
        this.characterMusicalArchetypes = {
            hero: {
                melody: 'ascending, strong intervals',
                harmony: 'major, consonant',
                rhythm: 'steady, determined',
                instrumentation: 'brass, strings'
            },
            villain: {
                melody: 'angular, chromatic',
                harmony: 'minor, dissonant',
                rhythm: 'irregular, threatening',
                instrumentation: 'low brass, percussion'
            },
            lover: {
                melody: 'lyrical, flowing',
                harmony: 'rich, warm',
                rhythm: 'flexible, expressive',
                instrumentation: 'strings, woodwinds'
            },
            comic: {
                melody: 'quirky, unexpected',
                harmony: 'surprising, playful',
                rhythm: 'bouncy, irregular',
                instrumentation: 'woodwinds, percussion'
            },
            wise: {
                melody: 'simple, profound',
                harmony: 'modal, ancient',
                rhythm: 'measured, timeless',
                instrumentation: 'solo instruments, choir'
            }
        };
        
        // Emotional musical mapping
        this.emotionalMusicalMapping = {
            joy: { key: 'major', tempo: 'allegro', dynamics: 'forte', texture: 'full' },
            sadness: { key: 'minor', tempo: 'adagio', dynamics: 'piano', texture: 'sparse' },
            anger: { key: 'minor', tempo: 'presto', dynamics: 'fortissimo', texture: 'thick' },
            fear: { key: 'diminished', tempo: 'variable', dynamics: 'crescendo', texture: 'unstable' },
            love: { key: 'major/minor', tempo: 'andante', dynamics: 'mezzo', texture: 'warm' },
            mystery: { key: 'modal', tempo: 'moderato', dynamics: 'pianissimo', texture: 'thin' },
            triumph: { key: 'major', tempo: 'maestoso', dynamics: 'fortissimo', texture: 'grand' }
        };
        
        // Composition tracking and development
        this.compositionTracking = {
            thematicDevelopment: new Map(),
            motivicWork: new Map(),
            orchestrationProgress: new Map(),
            revisionHistory: []
        };
        
        // Integration with production system
        this.musicDirector = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        console.log('🎼 Music Composer Agent: Ready to create original musical landscapes');
    }

    /**
     * Initialize Music Composer with system integration
     */
    async onInitialize() {
        try {
            console.log('🎼 Music Composer: Initializing composition systems...');
            
            // Connect to Ollama interface for AI composition
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI composition requires LLM assistance.');
            }
            
            this.ollamaInterface = window.ollamaTheaterInterface;
            
            if (!this.ollamaInterface.isInitialized) {
                const initSuccess = await window.ollamaTheaterInterface.initialize();
                if (!initSuccess) {
                    throw new Error('Failed to initialize Ollama interface');
                }
                this.ollamaInterface = window.ollamaTheaterInterface;
            }
            
            if (!this.ollamaInterface.isConnected) {
                throw new Error('Cannot connect to Ollama. Please ensure Ollama is running: `ollama serve`');
            }
            
            // Configure AI for musical composition
            this.ollamaInterface.updatePerformanceContext({
                role: 'music_composer',
                composition_style: this.compositionStyle,
                creativity_mode: 'musical_composition',
                specialization: 'theatrical_scoring'
            });
            
            // Connect to related agents
            if (window.musicDirectorAgent) {
                this.musicDirector = window.musicDirectorAgent;
                console.log('🎼 Music Composer: Connected to Music Director');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎼 Music Composer: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize composition tools
            await this.initializeCompositionTools();
            
            // Test composition capabilities
            await this.testCompositionCapabilities();
            
            console.log('🎼 Music Composer: Ready to create compelling original scores!')
            
        } catch (error) {
            console.error('🎼 Music Composer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI COMPOSITION:
1. Install Ollama: https://ollama.ai
2. Start Ollama: ollama serve
3. Install a model: ollama pull llama3.1
4. Refresh this page

Current error: ${error.message}
                `);
            }
            
            throw error;
        }
    }

    /**
     * Subscribe to production events for composition
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('script:character-profiles', (data) => this.onCharacterProfilesReceived(data));
            window.theaterEventBus.subscribe('music:composition-request', (data) => this.onCompositionRequested(data));
            window.theaterEventBus.subscribe('music:theme-needed', (data) => this.onThemeNeeded(data));
            window.theaterEventBus.subscribe('scene:music-requirements', (data) => this.onSceneMusicRequirements(data));
            
            console.log('🎼 Music Composer: Subscribed to composition events');
        }
    }

    /**
     * Initialize composition tools
     */
    async initializeCompositionTools() {
        console.log('🎼 Music Composer: Initializing composition tools...');
        
        // Initialize musical analysis tools
        this.initializeMusicalAnalysisTools();
        
        // Initialize thematic development tools
        this.initializeThematicTools();
        
        // Initialize orchestration planner
        this.initializeOrchestrationPlanner();
        
        console.log('✅ Music Composer: Composition tools initialized');
    }

    /**
     * Initialize musical analysis tools
     */
    initializeMusicalAnalysisTools() {
        this.analysisTools = {
            keyAnalyzer: (emotion, character) => this.analyzeOptimalKey(emotion, character),
            rhythmSelector: (scene, tempo) => this.selectRhythmPattern(scene, tempo),
            harmonicPlanner: (progression, tension) => this.planHarmonicStructure(progression, tension),
            motivicDeveloper: (theme, variations) => this.developMotifs(theme, variations)
        };
        
        console.log('🎼 Music Composer: Musical analysis tools ready');
    }

    /**
     * Initialize thematic development tools
     */
    initializeThematicTools() {
        this.thematicTools = {
            characterThemeGenerator: (character) => this.generateCharacterTheme(character),
            emotionalMapper: (scene) => this.mapSceneEmotions(scene),
            motivicVariation: (motif) => this.createMotivcVariations(motif),
            leitmotifWeaver: (themes) => this.weaveLeitmotifs(themes)
        };
        
        console.log('🎼 Music Composer: Thematic development tools ready');
    }

    /**
     * Initialize orchestration planner
     */
    initializeOrchestrationPlanner() {
        this.orchestrationPlanner = {
            instrumentSelector: (mood, budget) => this.selectInstrumentation(mood, budget),
            textureDesigner: (scene, dynamics) => this.designTexture(scene, dynamics),
            colorPalette: (production) => this.createColorPalette(production),
            arrangementOptimizer: (score) => this.optimizeArrangement(score)
        };
        
        console.log('🎼 Music Composer: Orchestration planner ready');
    }

    /**
     * Test composition capabilities
     */
    async testCompositionCapabilities() {
        try {
            const testPrompt = `
            As a music composer, create an original theme for a theatrical character.
            
            Character details:
            - Character: A conflicted queen torn between duty and love
            - Personality: Noble but passionate, strong yet vulnerable
            - Story arc: From certainty to doubt to tragic resolution
            - Musical style: Romantic period, orchestral
            
            Provide:
            1. Main theme concept and musical description
            2. Key signature and tempo recommendations
            3. Melodic structure and intervallic content
            4. Harmonic progression suggestions
            5. Instrumentation and orchestration ideas
            6. Motivic development possibilities
            7. Integration with other character themes
            8. Emotional journey mapping through the score
            
            Format as detailed composition notes with musical reasoning.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🎼 Music Composer: Composition capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎼 Music Composer: Composition capability test failed:', error);
            throw new Error(`Composition test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎼 Music Composer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize composition project
        await this.initializeCompositionProject(data.production);
        
        // Develop musical concept
        await this.developMusicalConcept(data.production);
    }

    /**
     * Initialize composition project
     */
    async initializeCompositionProject(production) {
        console.log('🎼 Music Composer: Initializing composition project...');
        
        this.compositionProject = {
            production: production,
            musicalConcept: null,
            thematicMaterial: new Map(),
            characterThemes: new Map(),
            sceneMusic: new Map(),
            orchestrationPlan: new Map(),
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Analyze production musical needs
        await this.analyzeProductionMusicalNeeds(production);
        
        console.log('✅ Music Composer: Composition project initialized');
    }

    /**
     * Develop musical concept for production
     */
    async developMusicalConcept(production) {
        try {
            console.log('🎼 Music Composer: Developing musical concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive musical concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall musical style and period appropriateness
                2. Instrumental palette and orchestration approach
                3. Thematic material and leitmotif system
                4. Emotional journey and musical arc
                5. Character musical identities and themes
                6. Scene-specific musical requirements
                7. Integration with existing production elements
                8. Practical considerations for performance
                9. Budget and resource constraints
                10. Collaborative opportunities with other departments
                
                Provide a detailed musical concept that will serve as the foundation for all original composition work in this production.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.compositionProject.musicalConcept = response.content;
                    this.compositionProject.status = 'concept_complete';
                    
                    console.log('✅ Music Composer: Musical concept developed');
                    
                    // Extract musical elements from concept
                    await this.extractMusicalElements(response.content);
                    
                    // Begin thematic material development
                    await this.beginThematicDevelopment(production, response.content);
                    
                    // Share concept with production team
                    window.theaterEventBus?.publish('music:concept-complete', {
                        production: production,
                        concept: response.content,
                        composer: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Music Composer: Concept development failed:', error.message);
            this.compositionProject.status = 'concept_error';
        }
    }

    /**
     * Handle artistic vision from Creative Director
     */
    async onArtisticVisionReceived(data) {
        console.log('🎼 Music Composer: Received artistic vision from Creative Director');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.alignMusicWithVision(data.vision);
        }
    }

    /**
     * Align musical concept with artistic vision
     */
    async alignMusicWithVision(artisticVision) {
        try {
            console.log('🎼 Music Composer: Aligning music with artistic vision...');
            
            const alignmentPrompt = `
            Align the musical composition approach with this artistic vision:
            
            Artistic Vision:
            ${artisticVision}
            
            Current Musical Concept:
            ${this.compositionProject.musicalConcept || 'To be developed'}
            
            Provide specific musical alignments:
            1. How should the musical style support this vision?
            2. What compositional techniques enhance the artistic goals?
            3. How can orchestration choices reinforce the vision?
            4. What thematic development serves the artistic approach?
            5. How should character music align with the vision?
            6. What musical opportunities does this vision create?
            
            Suggest concrete compositional changes to perfectly embody the artistic vision.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(alignmentPrompt, {
                temperature: 0.8,
                max_tokens: 700
            });
            
            if (response && response.content) {
                this.compositionProject.visionAlignment = response.content;
                
                console.log('✅ Music Composer: Music aligned with artistic vision');
                
                // Update musical elements based on alignment
                await this.updateMusicalElements(response.content);
            }
            
        } catch (error) {
            console.warn('⚠️ Music Composer: Vision alignment failed:', error.message);
        }
    }

    /**
     * Handle character profiles for theme creation
     */
    async onCharacterProfilesReceived(data) {
        console.log('🎼 Music Composer: Received character profiles from script');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.createCharacterThemes(data.characters);
        }
    }

    /**
     * Create musical themes for characters
     */
    async createCharacterThemes(characters) {
        console.log('🎼 Music Composer: Creating character themes...');
        
        for (const character of characters) {
            await this.composeCharacterTheme(character);
        }
    }

    /**
     * Compose theme for individual character
     */
    async composeCharacterTheme(character) {
        try {
            console.log(`🎼 Music Composer: Composing theme for ${character.name}...`);
            
            const themePrompt = `
            Compose an original musical theme for this character:
            
            Character: ${character.name}
            Description: ${character.description || 'No description provided'}
            Personality: ${character.personality || 'To be determined'}
            Role: ${character.role || 'Supporting'}
            Character Arc: ${character.arc || 'Static character'}
            
            Musical Context:
            Production: ${this.currentProduction.title}
            Musical Concept: ${this.compositionProject.musicalConcept}
            Composition Style: ${this.compositionStyle}
            
            Create detailed character theme:
            1. Main melodic line and intervallic structure
            2. Harmonic foundation and chord progressions
            3. Rhythmic character and metrical structure
            4. Key signature and tonal center
            5. Tempo and dynamic markings
            6. Instrumentation and orchestration
            7. Motivic elements for development
            8. Emotional associations and character psychology
            9. Variations for different emotional states
            10. Integration possibilities with other themes
            
            Provide musical description that could guide actual composition.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(themePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const characterTheme = {
                    character: character,
                    themeDescription: response.content,
                    musicalElements: await this.extractThemeElements(response.content),
                    variations: await this.generateThemeVariations(response.content),
                    composedAt: new Date(),
                    status: 'composed'
                };
                
                this.compositionProject.characterThemes.set(character.name, characterTheme);
                
                console.log(`✅ Music Composer: Theme composed for ${character.name}`);
                
                // Notify production team
                window.theaterEventBus?.publish('music:character-theme-ready', {
                    character: character,
                    theme: characterTheme,
                    composer: this.config.name
                });
                
                return characterTheme;
            }
            
        } catch (error) {
            console.error(`🎼 Music Composer: Character theme composition failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Handle composition requests
     */
    async onCompositionRequested(data) {
        console.log('🎼 Music Composer: Composition requested -', data.type);
        
        await this.createComposition(data.type, data.requirements, data.deadline);
    }

    /**
     * Create specific composition
     */
    async createComposition(type, requirements, deadline) {
        try {
            console.log(`🎼 Music Composer: Creating ${type} composition...`);
            
            const compositionPrompt = `
            Create an original ${type} composition for theatrical use:
            
            Composition Type: ${type}
            Requirements: ${JSON.stringify(requirements)}
            Deadline: ${deadline}
            
            Musical Context:
            - Production: ${this.currentProduction?.title}
            - Musical Concept: ${this.compositionProject.musicalConcept}
            - Available Themes: ${Array.from(this.compositionProject.characterThemes.keys()).join(', ')}
            
            Provide detailed composition:
            1. Overall structure and form
            2. Thematic material and development
            3. Harmonic language and progressions
            4. Rhythmic elements and meter
            5. Orchestration and instrumentation
            6. Dynamic and expressive markings
            7. Integration with existing musical material
            8. Performance considerations
            9. Timing and duration estimates
            10. Conductor notes and interpretive guidance
            
            Create composition description suitable for musical realization.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(compositionPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800,
                timeout: 30000
            });
            
            if (response && response.content) {
                const composition = {
                    type: type,
                    requirements: requirements,
                    deadline: deadline,
                    composition: response.content,
                    orchestration: await this.planOrchestration(response.content),
                    composedAt: new Date()
                };
                
                this.compositionProject.sceneMusic.set(`${type}_${Date.now()}`, composition);
                
                console.log(`✅ Music Composer: ${type} composition complete`);
                
                return composition;
            }
            
        } catch (error) {
            console.error(`🎼 Music Composer: Composition creation failed for ${type}:`, error);
            return null;
        }
    }

    /**
     * Handle theme requests
     */
    async onThemeNeeded(data) {
        console.log('🎼 Music Composer: Theme needed -', data.themeType);
        
        await this.composeThematicMaterial(data.themeType, data.purpose, data.musicalStyle);
    }

    /**
     * Handle scene music requirements
     */
    async onSceneMusicRequirements(data) {
        console.log('🎼 Music Composer: Scene music requirements received');
        
        await this.composeSceneMusic(data.scene, data.requirements, data.duration);
    }

    /**
     * Compose scene-specific music
     */
    async composeSceneMusic(scene, requirements, duration) {
        try {
            console.log(`🎼 Music Composer: Composing music for scene...`);
            
            const scenePrompt = `
            Compose original music for this specific scene:
            
            Scene: ${scene}
            Requirements: ${JSON.stringify(requirements)}
            Duration: ${duration}
            
            Available Musical Material:
            - Character Themes: ${Array.from(this.compositionProject.characterThemes.keys()).join(', ')}
            - Musical Concept: ${this.compositionProject.musicalConcept}
            
            Create scene-specific composition:
            1. Musical approach for this scene's emotional content
            2. Theme integration and development
            3. Structural planning for the scene duration
            4. Orchestration suited to the scene's needs
            5. Dynamic and tempo considerations
            6. Transition planning into and out of scene
            7. Practical performance considerations
            8. Integration with dialogue and action
            
            Provide composition that serves the scene's dramatic needs.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(scenePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 700,
                timeout: 30000
            });
            
            if (response && response.content) {
                const sceneMusic = {
                    scene: scene,
                    requirements: requirements,
                    duration: duration,
                    composition: response.content,
                    integrationNotes: await this.generateIntegrationNotes(response.content),
                    composedAt: new Date()
                };
                
                this.compositionProject.sceneMusic.set(scene, sceneMusic);
                
                console.log(`✅ Music Composer: Scene music composed`);
                
                return sceneMusic;
            }
            
        } catch (error) {
            console.error(`🎼 Music Composer: Scene music composition failed:`, error);
            return null;
        }
    }

    /**
     * Extract musical elements from concept
     */
    async extractMusicalElements(concept) {
        // Simplified extraction - would use AI parsing in practice
        return {
            style: this.compositionStyle,
            keySignature: 'To be determined',
            orchestration: 'Full orchestra',
            tempo: 'Variable by scene'
        };
    }

    /**
     * Extract theme elements from description
     */
    async extractThemeElements(themeDescription) {
        // Simplified extraction - would parse actual musical elements
        return {
            melodicInterval: 'Fourth and fifth intervals',
            harmonicBasis: 'Tonal with modal inflections',
            rhythmicCharacter: 'Flowing eighth notes',
            keyCenter: 'D minor'
        };
    }

    /**
     * Generate theme variations
     */
    async generateThemeVariations(themeDescription) {
        // Simplified generation - would create actual variations
        return [
            'Heroic variation in major mode',
            'Tragic variation with slower tempo',
            'Mysterious variation with altered harmony',
            'Triumphant variation with fuller orchestration'
        ];
    }

    /**
     * Plan orchestration for composition
     */
    async planOrchestration(composition) {
        // Simplified orchestration planning
        return {
            instruments: ['strings', 'winds', 'brass', 'percussion'],
            texture: 'Varied by dramatic need',
            dynamics: 'Piano to fortissimo',
            colors: 'Warm strings, bright brass, mysterious winds'
        };
    }

    /**
     * Get composition status
     */
    getCompositionStatus() {
        return {
            currentProject: {
                active: !!this.compositionProject.production,
                title: this.compositionProject.production?.title,
                status: this.compositionProject.status,
                conceptComplete: !!this.compositionProject.musicalConcept,
                characterThemesReady: this.compositionProject.characterThemes.size
            },
            composition: {
                thematicMaterial: this.compositionProject.thematicMaterial.size,
                characterThemes: this.compositionProject.characterThemes.size,
                sceneMusic: this.compositionProject.sceneMusic.size,
                orchestrationPlans: this.compositionProject.orchestrationPlan.size
            },
            capabilities: this.compositionCapabilities,
            musical: {
                scales: Object.keys(this.musicalElements.scales).length,
                rhythms: Object.keys(this.musicalElements.rhythms).length,
                harmonies: Object.keys(this.musicalElements.harmonies).length,
                instruments: Object.keys(this.instrumentalPalette).reduce((total, section) => 
                    total + Object.keys(this.instrumentalPalette[section]).length, 0)
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎼 Music Composer: Concluding composition session...');
        
        // Finalize composition project
        if (this.compositionProject.status !== 'idle') {
            this.compositionProject.status = 'completed';
            this.compositionProject.completedAt = new Date();
        }
        
        // Generate composition summary
        if (this.currentProduction) {
            const compositionSummary = this.generateCompositionSummary();
            console.log('🎼 Music Composer: Composition summary generated');
        }
        
        console.log('🎼 Music Composer: Original composition work concluded');
    }

    /**
     * Generate composition summary
     */
    generateCompositionSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            composition: {
                conceptDeveloped: !!this.compositionProject.musicalConcept,
                characterThemesCreated: this.compositionProject.characterThemes.size,
                sceneMusicComposed: this.compositionProject.sceneMusic.size,
                thematicMaterialDeveloped: this.compositionProject.thematicMaterial.size
            },
            collaboration: {
                visionAlignment: !!this.compositionProject.visionAlignment,
                musicDirectorCoordination: !!this.musicDirector,
                creativeDirectorIntegration: !!this.creativeDirector
            },
            technical: {
                orchestrationPlans: this.compositionProject.orchestrationPlan.size,
                musicalStyle: this.compositionStyle,
                integrationNotes: this.calculateIntegrationNotes()
            }
        };
    }

    /**
     * Calculate integration notes
     */
    calculateIntegrationNotes() {
        return Array.from(this.compositionProject.sceneMusic.values())
            .filter(music => music.integrationNotes).length;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicComposerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.MusicComposerAgent = MusicComposerAgent;
    console.log('🎼 Music Composer Agent loaded - Ready for original score creation');
}