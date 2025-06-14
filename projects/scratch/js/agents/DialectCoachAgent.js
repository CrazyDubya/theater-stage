/**
 * DialectCoachAgent.js - AI-Powered Accent and Language Training
 * 
 * The Dialect Coach Agent uses Ollama LLM to provide expert accent and dialect
 * coaching for theatrical performances. Ensures authentic language representation
 * while maintaining clarity and dramatic effectiveness.
 * 
 * Features:
 * - AI-driven dialect analysis and coaching
 * - Phonetic transcription and pronunciation guidance
 * - Regional accent expertise and cultural sensitivity
 * - Real-time feedback and correction techniques
 * - Integration with character development and voice work
 * - Audio analysis and accent consistency monitoring
 */

class DialectCoachAgent extends BaseAgent {
    constructor(config = {}) {
        super('dialect-coach', {
            name: 'Dialect Coach',
            role: 'dialect-coach',
            priority: 70, // High priority for vocal authenticity
            maxActionsPerSecond: 5,
            personality: config.personality || 'patient',
            ...config
        });
        
        // Dialect Coach specific properties
        this.ollamaInterface = null;
        this.coachingApproach = config.approach || 'authentic-accessible';
        this.creativityLevel = config.creativity || 0.7;
        
        // Dialect coaching capabilities
        this.dialectCapabilities = {
            dialectExpertise: {
                britishVarieties: true,
                americanRegional: true,
                internationalAccents: true,
                historicalDialects: true,
                constructedLanguages: true
            },
            coachingTechniques: {
                phoneticTranscription: true,
                oralPostureTraining: true,
                intonationPatterns: true,
                rhythmAndStress: true,
                soundSubstitution: true
            },
            analysisSkills: {
                accentIdentification: true,
                consistencyMonitoring: true,
                authenticityAssessment: true,
                clarityEvaluation: true,
                characterIntegration: true
            },
            culturalCompetence: {
                linguisticSensitivity: true,
                culturalContext: true,
                stereotypeAvoidance: true,
                respectfulRepresentation: true,
                dialectVariation: true
            },
            technicalSkills: {
                ipaTranscription: true,
                audioAnalysis: true,
                accentReduction: true,
                accentAcquisition: true,
                voiceModification: true
            }
        };
        
        // Current dialect project
        this.dialectProject = {
            production: null,
            dialectConcept: null,
            characterDialects: new Map(),
            pronunciationGuides: new Map(),
            trainingPlans: new Map(),
            progressTracking: new Map(),
            status: 'idle'
        };
        
        // Dialect database and phonetic systems
        this.dialectDatabase = {
            british: {
                rp: {
                    name: 'Received Pronunciation',
                    characteristics: ['Non-rhotic', 'Long vowels', 'Precise consonants'],
                    keyFeatures: {
                        vowels: { bath: 'ɑː', strut: 'ʌ', lot: 'ɒ' },
                        consonants: { r_dropping: true, clear_l: true },
                        intonation: 'Rising terminals, wider pitch range'
                    }
                },
                cockney: {
                    name: 'London Cockney',
                    characteristics: ['Glottal stops', 'H-dropping', 'TH-fronting'],
                    keyFeatures: {
                        vowels: { face: 'ʌɪ', price: 'ɑɪ', mouth: 'æː' },
                        consonants: { t_glottaling: true, h_dropping: true },
                        intonation: 'Distinctive rhythm, rising intonation'
                    }
                },
                scottish: {
                    name: 'Scottish English',
                    characteristics: ['Rhotic', 'Distinctive vowels', 'Rolled R'],
                    keyFeatures: {
                        vowels: { face: 'e', goat: 'o', foot_strut_merger: true },
                        consonants: { rhotic_r: true, dark_l: true },
                        intonation: 'Different stress patterns, musical quality'
                    }
                }
            },
            american: {
                general: {
                    name: 'General American',
                    characteristics: ['Rhotic', 'Flapped T', 'Vowel mergers'],
                    keyFeatures: {
                        vowels: { cot_caught_merger: 'varies', mary_marry_merry: 'merged' },
                        consonants: { flap_t: true, rhotic_r: true },
                        intonation: 'Falling terminals, narrower pitch range'
                    }
                },
                southern: {
                    name: 'Southern American',
                    characteristics: ['Drawl', 'Monophthongization', 'PIN-PEN merger'],
                    keyFeatures: {
                        vowels: { price: 'aː', pin_pen_merger: true, drawl: true },
                        consonants: { r_weakening: true, ing_to_in: true },
                        intonation: 'Slower tempo, distinctive melody'
                    }
                },
                newYork: {
                    name: 'New York City',
                    characteristics: ['Non-rhotic', 'Raised vowels', 'TH-stopping'],
                    keyFeatures: {
                        vowels: { coffee: 'ɔə', bird: 'ɜɪ', raised_æ: true },
                        consonants: { r_dropping: true, th_stopping: 'varies' },
                        intonation: 'Fast tempo, emphatic stress'
                    }
                }
            },
            international: {
                irish: {
                    name: 'Irish English',
                    characteristics: ['Rhotic', 'Dental consonants', 'Unique vowels'],
                    keyFeatures: {
                        vowels: { choice: 'ʌɪ', nurse: 'ʊr', distinctive_o: true },
                        consonants: { dental_t_d: true, clear_l: true },
                        intonation: 'Musical quality, rising patterns'
                    }
                },
                australian: {
                    name: 'Australian English',
                    characteristics: ['Non-rhotic', 'Vowel shifts', 'Rising intonation'],
                    keyFeatures: {
                        vowels: { face: 'æɪ', price: 'ɑɪ', fleece: 'əi' },
                        consonants: { flap_t: true, dark_l: true },
                        intonation: 'High rising terminal, distinctive rhythm'
                    }
                }
            }
        };
        
        // Phonetic training exercises
        this.trainingExercises = {
            vowel_exercises: {
                placement: {
                    description: 'Tongue and lip position for specific vowels',
                    exercises: ['Mirror work', 'Minimal pairs', 'Sustained vowels'],
                    progression: 'Isolation → Words → Phrases → Connected speech'
                },
                length: {
                    description: 'Distinguishing long and short vowels',
                    exercises: ['Contrast drills', 'Timed holds', 'Rhythmic patterns'],
                    progression: 'Awareness → Production → Consistency'
                }
            },
            consonant_exercises: {
                articulation: {
                    description: 'Precise consonant production',
                    exercises: ['Tongue twisters', 'Slow motion', 'Tactile feedback'],
                    progression: 'Position → Movement → Speed'
                },
                substitution: {
                    description: 'Replacing native sounds with target sounds',
                    exercises: ['Contrast pairs', 'Word lists', 'Sentence drills'],
                    progression: 'Recognition → Guided practice → Spontaneous use'
                }
            },
            prosody_exercises: {
                intonation: {
                    description: 'Melody patterns of the dialect',
                    exercises: ['Pitch glides', 'Question patterns', 'Emotional range'],
                    progression: 'Imitation → Controlled → Natural'
                },
                rhythm: {
                    description: 'Stress-timed vs syllable-timed patterns',
                    exercises: ['Clapping patterns', 'Weak form drills', 'Tempo work'],
                    progression: 'Pattern recognition → Application → Fluency'
                }
            }
        };
        
        // Cultural and linguistic considerations
        this.culturalConsiderations = {
            authenticity_vs_clarity: {
                principle: 'Balance accurate representation with audience comprehension',
                strategies: ['Core feature selection', 'Gradient approach', 'Context consideration'],
                warnings: ['Avoid caricature', 'Respect variation', 'Consider character depth']
            },
            stereotype_avoidance: {
                principle: 'Represent dialects respectfully without harmful stereotypes',
                strategies: ['Research real speakers', 'Avoid exaggeration', 'Include variation'],
                consultation: ['Native speakers', 'Cultural advisors', 'Linguistic experts']
            },
            code_switching: {
                principle: 'Characters may adjust dialect based on context',
                applications: ['Social situations', 'Emotional states', 'Power dynamics'],
                techniques: ['Partial shifts', 'Register changes', 'Feature selection']
            }
        };
        
        // Progress tracking and assessment
        this.assessmentCriteria = {
            accuracy: {
                weight: 0.30,
                metrics: ['Phonetic precision', 'Feature consistency', 'Native-likeness'],
                evaluation: 'Recording analysis, native speaker assessment'
            },
            consistency: {
                weight: 0.25,
                metrics: ['Throughout performance', 'Under stress', 'Across scenes'],
                evaluation: 'Performance monitoring, deviation tracking'
            },
            clarity: {
                weight: 0.25,
                metrics: ['Audience comprehension', 'Articulation', 'Projection'],
                evaluation: 'Audience feedback, clarity tests'
            },
            character_integration: {
                weight: 0.20,
                metrics: ['Natural delivery', 'Emotional range', 'Character truth'],
                evaluation: 'Director feedback, performance quality'
            }
        };
        
        // Teaching methodologies
        this.teachingMethods = {
            imitation_based: {
                description: 'Learning through mimicry and repetition',
                techniques: ['Call and response', 'Shadowing', 'Recording comparison'],
                best_for: 'Quick acquisition, performance preparation'
            },
            analytical_approach: {
                description: 'Understanding phonetic principles and rules',
                techniques: ['IPA study', 'Rule learning', 'Feature analysis'],
                best_for: 'Long-term retention, multiple dialects'
            },
            immersive_method: {
                description: 'Surrounding with authentic dialect samples',
                techniques: ['Media consumption', 'Conversation practice', 'Environmental exposure'],
                best_for: 'Natural acquisition, cultural understanding'
            },
            physical_approach: {
                description: 'Focus on oral posture and physicality',
                techniques: ['Mouth shapes', 'Tongue positions', 'Breath patterns'],
                best_for: 'Kinesthetic learners, difficult sounds'
            }
        };
        
        // Resource library
        this.resourceLibrary = {
            audioSamples: new Map(),
            transcriptions: new Map(),
            exerciseLibrary: new Map(),
            referenceRecordings: new Map()
        };
        
        // Integration with production system
        this.voiceCoach = null;
        this.creativeDirector = null;
        this.dramaturge = null;
        this.currentProduction = null;
        
        console.log('🗣️ Dialect Coach Agent: Ready to guide authentic vocal transformations');
    }

    /**
     * Initialize Dialect Coach with system integration
     */
    async onInitialize() {
        try {
            console.log('🗣️ Dialect Coach: Initializing dialect training systems...');
            
            // Connect to Ollama interface for AI dialect coaching
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI dialect coaching requires LLM assistance.');
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
            
            // Configure AI for dialect coaching
            this.ollamaInterface.updatePerformanceContext({
                role: 'dialect_coach',
                coaching_approach: this.coachingApproach,
                creativity_mode: 'linguistic_precision',
                specialization: 'accent_dialect_training'
            });
            
            // Connect to related agents
            if (window.voiceCoachAgent) {
                this.voiceCoach = window.voiceCoachAgent;
                console.log('🗣️ Dialect Coach: Connected to Voice Coach');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🗣️ Dialect Coach: Connected to Creative Director');
            }
            
            if (window.dramaturgeAgent) {
                this.dramaturge = window.dramaturgeAgent;
                console.log('🗣️ Dialect Coach: Connected to Dramaturge');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize dialect systems
            await this.initializeDialectSystems();
            
            // Test dialect coaching capabilities
            await this.testDialectCoachingCapabilities();
            
            console.log('🗣️ Dialect Coach: Ready to guide authentic vocal transformations!')
            
        } catch (error) {
            console.error('🗣️ Dialect Coach: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI DIALECT COACHING:
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
     * Subscribe to production events for dialect coaching
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('casting:characters-assigned', (data) => this.onCharactersAssigned(data));
            window.theaterEventBus.subscribe('dialect:coaching-request', (data) => this.onCoachingRequested(data));
            window.theaterEventBus.subscribe('dialect:analysis-needed', (data) => this.onDialectAnalysisNeeded(data));
            window.theaterEventBus.subscribe('performance:dialect-check', (data) => this.onDialectCheck(data));
            window.theaterEventBus.subscribe('cultural:consultation-needed', (data) => this.onCulturalConsultation(data));
            
            console.log('🗣️ Dialect Coach: Subscribed to dialect coaching events');
        }
    }

    /**
     * Initialize dialect systems
     */
    async initializeDialectSystems() {
        console.log('🗣️ Dialect Coach: Initializing dialect systems...');
        
        // Initialize phonetic analysis tools
        this.initializePhoneticTools();
        
        // Initialize training systems
        this.initializeTrainingSystems();
        
        // Initialize assessment tools
        this.initializeAssessmentTools();
        
        console.log('✅ Dialect Coach: Dialect systems initialized');
    }

    /**
     * Initialize phonetic analysis tools
     */
    initializePhoneticTools() {
        this.phoneticTools = {
            transcriber: (text, dialect) => this.transcribeToIPA(text, dialect),
            analyzer: (speech, target) => this.analyzeSpeechPattern(speech, target),
            comparator: (native, attempt) => this.compareDialects(native, attempt),
            identifier: (sample) => this.identifyDialect(sample)
        };
        
        console.log('🗣️ Dialect Coach: Phonetic tools initialized');
    }

    /**
     * Initialize training systems
     */
    initializeTrainingSystems() {
        this.trainingSystems = {
            planGenerator: (performer, dialect) => this.generateTrainingPlan(performer, dialect),
            exerciseSelector: (needs, level) => this.selectExercises(needs, level),
            progressTracker: (performer) => this.trackProgress(performer),
            feedbackProvider: (performance) => this.provideFeedback(performance)
        };
        
        console.log('🗣️ Dialect Coach: Training systems initialized');
    }

    /**
     * Initialize assessment tools
     */
    initializeAssessmentTools() {
        this.assessmentTools = {
            accuracyMeter: (performance) => this.measureAccuracy(performance),
            consistencyChecker: (samples) => this.checkConsistency(samples),
            clarityEvaluator: (speech) => this.evaluateClarity(speech),
            authenticityRater: (dialect) => this.rateAuthenticity(dialect)
        };
        
        console.log('🗣️ Dialect Coach: Assessment tools initialized');
    }

    /**
     * Test dialect coaching capabilities
     */
    async testDialectCoachingCapabilities() {
        try {
            const testPrompt = `
            As a dialect coach, provide coaching for a specific dialect transformation.
            
            Coaching scenario:
            - Actor: American performer (General American accent)
            - Target dialect: British RP (Received Pronunciation)
            - Character: Upper-class British aristocrat, 1920s
            - Performance venue: Large theater (clarity important)
            - Actor experience: Intermediate dialect work
            
            Provide:
            1. Key phonetic changes required for this transformation
            2. Specific exercises for mastering difficult sounds
            3. Common pitfalls and how to avoid them
            4. Cultural context and character integration
            5. Practice schedule and milestones
            6. Resources for continued study
            7. Clarity vs authenticity balance for this production
            8. Methods for maintaining consistency throughout performance
            
            Format as comprehensive dialect coaching plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🗣️ Dialect Coach: Coaching capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🗣️ Dialect Coach: Coaching capability test failed:', error);
            throw new Error(`Dialect coaching test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🗣️ Dialect Coach: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize dialect project
        await this.initializeDialectProject(data.production);
        
        // Develop dialect concept
        await this.developDialectConcept(data.production);
    }

    /**
     * Initialize dialect project
     */
    async initializeDialectProject(production) {
        console.log('🗣️ Dialect Coach: Initializing dialect project...');
        
        this.dialectProject = {
            production: production,
            dialectConcept: null,
            characterDialects: new Map(),
            pronunciationGuides: new Map(),
            trainingPlans: new Map(),
            progressTracking: new Map(),
            status: 'concept_development',
            createdAt: new Date()
        };
        
        // Analyze production dialect requirements
        await this.analyzeDialectRequirements(production);
        
        console.log('✅ Dialect Coach: Dialect project initialized');
    }

    /**
     * Develop dialect concept for production
     */
    async developDialectConcept(production) {
        try {
            console.log('🗣️ Dialect Coach: Developing dialect concept...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const conceptPrompt = `
                Develop a comprehensive dialect concept for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall approach to dialects and accents in the production
                2. Balance between authenticity and audience clarity
                3. Character-specific dialect requirements
                4. Historical and geographical accuracy needs
                5. Cultural sensitivity and respectful representation
                6. Training timeline and performer capabilities
                7. Integration with character development
                8. Consistency maintenance strategies
                9. Audience accessibility considerations
                10. Resources and reference materials needed
                
                Provide a detailed dialect concept that serves both artistic authenticity and practical performance needs.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(conceptPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.dialectProject.dialectConcept = response.content;
                    this.dialectProject.status = 'concept_complete';
                    
                    console.log('✅ Dialect Coach: Dialect concept developed');
                    
                    // Extract dialect requirements from concept
                    await this.extractDialectRequirements(response.content);
                    
                    // Begin training plan development
                    await this.beginTrainingPlanDevelopment(production, response.content);
                    
                    // Share concept with production team
                    window.theaterEventBus?.publish('dialect:concept-complete', {
                        production: production,
                        concept: response.content,
                        dialectCoach: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Dialect Coach: Concept development failed:', error.message);
            this.dialectProject.status = 'concept_error';
        }
    }

    /**
     * Handle character assignments
     */
    async onCharactersAssigned(data) {
        console.log('🗣️ Dialect Coach: Character assignments received');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.assignCharacterDialects(data.assignments);
        }
    }

    /**
     * Assign dialects to characters
     */
    async assignCharacterDialects(assignments) {
        console.log('🗣️ Dialect Coach: Assigning character dialects...');
        
        for (const assignment of assignments) {
            await this.analyzeCharacterDialect(assignment.character, assignment.performer);
        }
    }

    /**
     * Analyze dialect needs for specific character
     */
    async analyzeCharacterDialect(character, performer) {
        try {
            console.log(`🗣️ Dialect Coach: Analyzing dialect for ${character.name}...`);
            
            const analysisPrompt = `
            Analyze dialect requirements for this character and performer:
            
            Character: ${character.name}
            Character Background: ${character.background || 'To be determined'}
            Character Origin: ${character.origin || 'Not specified'}
            Social Class: ${character.class || 'Not specified'}
            
            Performer: ${performer.name}
            Native Accent: ${performer.nativeAccent || 'To be assessed'}
            Dialect Experience: ${performer.dialectExperience || 'Unknown'}
            
            Production Context: ${this.currentProduction?.title}
            Dialect Concept: ${this.dialectProject.dialectConcept}
            
            Provide detailed dialect analysis:
            1. Specific dialect/accent requirements for this character
            2. Phonetic features to be mastered
            3. Challenges based on performer's native accent
            4. Training approach and timeline
            5. Character-specific speech patterns
            6. Code-switching considerations
            7. Clarity adaptations for audience
            8. Cultural authenticity notes
            9. Practice materials and exercises
            10. Integration with character psychology
            
            Format as actionable dialect coaching plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const dialectAnalysis = {
                    character: character,
                    performer: performer,
                    analysis: response.content,
                    dialectFeatures: await this.extractDialectFeatures(response.content),
                    trainingPlan: await this.createTrainingPlan(response.content),
                    pronunciationGuide: await this.generatePronunciationGuide(response.content),
                    analyzedAt: new Date(),
                    status: 'analyzed'
                };
                
                this.dialectProject.characterDialects.set(character.name, dialectAnalysis);
                
                console.log(`✅ Dialect Coach: Dialect analysis complete for ${character.name}`);
                
                // Share analysis with performer and team
                window.theaterEventBus?.publish('dialect:character-analysis-ready', {
                    character: character,
                    analysis: dialectAnalysis,
                    dialectCoach: this.config.name
                });
                
                return dialectAnalysis;
            }
            
        } catch (error) {
            console.error(`🗣️ Dialect Coach: Dialect analysis failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Handle coaching requests
     */
    async onCoachingRequested(data) {
        console.log('🗣️ Dialect Coach: Coaching requested -', data.coachingType);
        
        await this.provideDialectCoaching(data.coachingType, data.performer, data.specifics);
    }

    /**
     * Handle dialect analysis requests
     */
    async onDialectAnalysisNeeded(data) {
        console.log('🗣️ Dialect Coach: Dialect analysis needed -', data.sample);
        
        await this.analyzeDialectSample(data.sample, data.context, data.purpose);
    }

    /**
     * Handle performance dialect checks
     */
    async onDialectCheck(data) {
        console.log('🗣️ Dialect Coach: Performance dialect check requested');
        
        await this.checkPerformanceDialect(data.performer, data.scene, data.recording);
    }

    /**
     * Handle cultural consultation requests
     */
    async onCulturalConsultation(data) {
        console.log('🗣️ Dialect Coach: Cultural consultation requested -', data.topic);
        
        await this.provideCulturalConsultation(data.topic, data.dialect, data.context);
    }

    /**
     * Extract dialect requirements from concept
     */
    async extractDialectRequirements(concept) {
        // Simplified extraction - would use AI parsing in practice
        return {
            dialects: ['Various regional accents'],
            accuracy_level: 'Balanced with clarity',
            training_time: 'Adequate preparation period',
            resources: 'Native speaker recordings'
        };
    }

    /**
     * Extract dialect features from analysis
     */
    async extractDialectFeatures(analysis) {
        // Simplified extraction - would parse specific features
        return {
            vowels: 'Specific vowel shifts required',
            consonants: 'Consonant modifications needed',
            prosody: 'Intonation and rhythm patterns',
            vocabulary: 'Dialect-specific words'
        };
    }

    /**
     * Get dialect coach status
     */
    getDialectCoachStatus() {
        return {
            currentProject: {
                active: !!this.dialectProject.production,
                title: this.dialectProject.production?.title,
                status: this.dialectProject.status,
                conceptComplete: !!this.dialectProject.dialectConcept,
                charactersAnalyzed: this.dialectProject.characterDialects.size
            },
            coaching: {
                characterDialects: this.dialectProject.characterDialects.size,
                pronunciationGuides: this.dialectProject.pronunciationGuides.size,
                trainingPlans: this.dialectProject.trainingPlans.size,
                progressTracking: this.dialectProject.progressTracking.size
            },
            capabilities: this.dialectCapabilities,
            expertise: {
                dialectTypes: Object.keys(this.dialectDatabase).length,
                trainingMethods: Object.keys(this.teachingMethods).length,
                exerciseCategories: Object.keys(this.trainingExercises).length,
                assessmentCriteria: Object.keys(this.assessmentCriteria).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🗣️ Dialect Coach: Concluding dialect coaching session...');
        
        // Finalize dialect project
        if (this.dialectProject.status !== 'idle') {
            this.dialectProject.status = 'completed';
            this.dialectProject.completedAt = new Date();
        }
        
        // Generate coaching summary
        if (this.currentProduction) {
            const coachingSummary = this.generateCoachingSummary();
            console.log('🗣️ Dialect Coach: Coaching summary generated');
        }
        
        console.log('🗣️ Dialect Coach: Dialect coaching concluded');
    }

    /**
     * Generate coaching summary
     */
    generateCoachingSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            coaching: {
                conceptDeveloped: !!this.dialectProject.dialectConcept,
                charactersAnalyzed: this.dialectProject.characterDialects.size,
                pronunciationGuidesCreated: this.dialectProject.pronunciationGuides.size,
                trainingPlansGenerated: this.dialectProject.trainingPlans.size
            },
            progress: {
                performersTracked: this.dialectProject.progressTracking.size,
                assessmentsCompleted: this.calculateAssessments(),
                consistencyAchieved: this.calculateConsistency()
            },
            collaboration: {
                voiceCoachIntegration: !!this.voiceCoach,
                creativeDirectorAlignment: !!this.creativeDirector,
                culturalConsultation: !!this.dramaturge
            }
        };
    }

    /**
     * Calculate assessments completed
     */
    calculateAssessments() {
        return Array.from(this.dialectProject.progressTracking.values())
            .filter(progress => progress.assessed).length;
    }

    /**
     * Calculate consistency achievement
     */
    calculateConsistency() {
        const consistentPerformers = Array.from(this.dialectProject.progressTracking.values())
            .filter(progress => progress.consistency >= 0.8).length;
        const totalPerformers = this.dialectProject.progressTracking.size;
        
        return totalPerformers > 0 ? (consistentPerformers / totalPerformers) * 100 : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DialectCoachAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.DialectCoachAgent = DialectCoachAgent;
    console.log('🗣️ Dialect Coach Agent loaded - Ready for authentic vocal transformations');
}