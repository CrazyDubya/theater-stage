/**
 * VoiceCoachAgent.js - AI-Powered Vocal Training and Direction
 * 
 * The Voice Coach Agent uses Ollama LLM to provide vocal training, diction coaching,
 * and voice direction for theatrical performances. Enhances performer vocal skills
 * and ensures vocal health while supporting character development through voice.
 * 
 * Features:
 * - AI-driven vocal training and coaching
 * - Diction and articulation guidance
 * - Character voice development
 * - Vocal health monitoring and protection
 * - Dialect and accent coaching
 * - Real-time vocal feedback during rehearsals
 */

class VoiceCoachAgent extends BaseAgent {
    constructor(config = {}) {
        super('voice-coach', {
            name: 'Voice Coach',
            role: 'voice-coach',
            priority: 75, // High priority for vocal health
            maxActionsPerSecond: 6,
            personality: config.personality || 'supportive',
            ...config
        });
        
        // Voice Coach specific properties
        this.ollamaInterface = null;
        this.coachingStyle = config.coachingStyle || 'holistic';
        this.creativityLevel = config.creativity || 0.75;
        
        // Vocal coaching capabilities
        this.vocalCapabilities = {
            technicalTraining: {
                breathSupport: true,
                projection: true,
                resonance: true,
                articulation: true,
                intonation: true
            },
            characterDevelopment: {
                voiceCharacterization: true,
                emotionalExpression: true,
                ageProgression: true,
                personalityVoicing: true,
                relationshipDynamics: true
            },
            dialectCoaching: {
                accentTraining: true,
                dialectConsistency: true,
                culturalAuthenticity: true,
                periodAccuracy: true,
                regionSpecific: true
            },
            vocalHealth: {
                warmUpRoutines: true,
                coolDownExercises: true,
                strainPrevention: true,
                enduranceBuilding: true,
                recoveryGuidance: true
            },
            performanceSupport: {
                realTimeFeedback: true,
                rehearsalGuidance: true,
                performanceReadiness: true,
                confidenceBuilding: true,
                technicalCorrection: true
            }
        };
        
        // Current coaching project
        this.coachingProject = {
            production: null,
            vocalistProfiles: new Map(),
            trainingPrograms: new Map(),
            dialectRequirements: new Map(),
            vocalHealthPlans: new Map(),
            characterVoices: new Map(),
            status: 'idle'
        };
        
        // Vocal technique library
        this.vocalTechniques = {
            breathing: {
                diaphragmatic: {
                    description: 'Deep belly breathing for support',
                    exercise: 'Lie flat, hand on chest/stomach, breathe deeply',
                    benefit: 'Foundation for all vocal work'
                },
                costal: {
                    description: 'Rib expansion breathing',
                    exercise: 'Hands on ribs, expand outward while breathing',
                    benefit: 'Increased lung capacity and control'
                },
                intercostal: {
                    description: 'Between-rib breathing',
                    exercise: 'Controlled breathing with rib isolation',
                    benefit: 'Advanced breath control'
                }
            },
            resonance: {
                chest: {
                    placement: 'Lower resonators',
                    character: 'Deep, authoritative, mature',
                    technique: 'Lower pitch, feel vibrations in chest'
                },
                head: {
                    placement: 'Upper resonators',
                    character: 'Light, youthful, ethereal',
                    technique: 'Higher pitch, feel vibrations in head'
                },
                mixed: {
                    placement: 'Balanced resonance',
                    character: 'Natural, versatile, healthy',
                    technique: 'Balanced coordination of resonators'
                }
            },
            articulation: {
                consonants: {
                    plosives: ['p', 'b', 't', 'd', 'k', 'g'],
                    fricatives: ['f', 'v', 's', 'z', 'sh', 'zh'],
                    nasals: ['m', 'n', 'ng'],
                    liquids: ['l', 'r']
                },
                vowels: {
                    pure: ['a', 'e', 'i', 'o', 'u'],
                    diphthongs: ['ai', 'au', 'oi', 'ou'],
                    modified: ['ä', 'ö', 'ü']
                }
            }
        };
        
        // Dialect and accent database
        this.dialectDatabase = {
            british: {
                rp: { characteristics: ['Non-rhotic', 'Crisp consonants', 'Precise vowels'], difficulty: 'medium' },
                cockney: { characteristics: ['Dropped h\'s', 'Glottal stops', 'Rhyming slang'], difficulty: 'hard' },
                scottish: { characteristics: ['Rolled r\'s', 'Distinctive vowels', 'Rhythm patterns'], difficulty: 'medium' }
            },
            american: {
                southern: { characteristics: ['Vowel drawl', 'Dropped g\'s', 'Monophthongs'], difficulty: 'medium' },
                new_york: { characteristics: ['Non-rhotic', 'Tense vowels', 'Fast pace'], difficulty: 'medium' },
                midwest: { characteristics: ['Rhotic', 'Clear vowels', 'Standard timing'], difficulty: 'easy' }
            },
            european: {
                french: { characteristics: ['Nasal vowels', 'Uvular r\'s', 'Liaison'], difficulty: 'hard' },
                german: { characteristics: ['Guttural sounds', 'Precise consonants', 'Strong rhythm'], difficulty: 'medium' },
                italian: { characteristics: ['Pure vowels', 'Rolled r\'s', 'Musical intonation'], difficulty: 'medium' }
            }
        };
        
        // Character voice archetypes
        this.voiceArchetypes = {
            authority: {
                pitch: 'lower',
                pace: 'measured',
                volume: 'projected',
                resonance: 'chest',
                characteristics: ['confident', 'decisive', 'controlled']
            },
            innocent: {
                pitch: 'higher',
                pace: 'variable',
                volume: 'moderate',
                resonance: 'head',
                characteristics: ['curious', 'open', 'vulnerable']
            },
            villain: {
                pitch: 'variable',
                pace: 'calculated',
                volume: 'controlled',
                resonance: 'mixed',
                characteristics: ['manipulative', 'smooth', 'threatening']
            },
            comic: {
                pitch: 'exaggerated',
                pace: 'fast',
                volume: 'animated',
                resonance: 'mixed',
                characteristics: ['energetic', 'expressive', 'timing-focused']
            }
        };
        
        // Vocal health monitoring
        this.vocalHealthTracking = {
            performerAssessments: new Map(),
            strainIndicators: new Map(),
            recoveryPlans: new Map(),
            preventiveRoutines: new Map()
        };
        
        // Performance tracking
        this.performanceTracking = {
            rehearsalFeedback: [],
            progressAssessments: new Map(),
            characterVoiceReadiness: new Map(),
            dialectAccuracy: new Map(),
            vocalEndurance: new Map()
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.assistantDirector = null;
        this.currentProduction = null;
        
        console.log('🎤 Voice Coach Agent: Ready to elevate vocal performance and health');
    }

    /**
     * Initialize Voice Coach with system integration
     */
    async onInitialize() {
        try {
            console.log('🎤 Voice Coach: Initializing vocal training systems...');
            
            // Connect to Ollama interface for AI coaching
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI vocal coaching requires LLM assistance.');
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
            
            // Configure AI for vocal coaching
            this.ollamaInterface.updatePerformanceContext({
                role: 'voice_coach',
                coaching_style: this.coachingStyle,
                creativity_mode: 'vocal_training',
                specialization: 'theatrical_voice'
            });
            
            // Connect to related agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎤 Voice Coach: Connected to Creative Director');
            }
            
            if (window.assistantDirectorAgent) {
                this.assistantDirector = window.assistantDirectorAgent;
                console.log('🎤 Voice Coach: Connected to Assistant Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize vocal training systems
            await this.initializeVocalTrainingSystems();
            
            // Test coaching capabilities
            await this.testVocalCoachingCapabilities();
            
            console.log('🎤 Voice Coach: Ready to guide exceptional vocal performances!')
            
        } catch (error) {
            console.error('🎤 Voice Coach: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI VOCAL COACHING:
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
     * Subscribe to production events for vocal coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('script:character-profiles', (data) => this.onCharacterProfilesReceived(data));
            window.theaterEventBus.subscribe('rehearsal:vocal-needs', (data) => this.onVocalNeedsIdentified(data));
            window.theaterEventBus.subscribe('performance:vocal-strain', (data) => this.onVocalStrainDetected(data));
            window.theaterEventBus.subscribe('voice:dialect-request', (data) => this.onDialectRequested(data));
            window.theaterEventBus.subscribe('voice:character-development', (data) => this.onCharacterVoiceNeeded(data));
            
            console.log('🎤 Voice Coach: Subscribed to vocal coordination events');
        }
    }

    /**
     * Initialize vocal training systems
     */
    async initializeVocalTrainingSystems() {
        console.log('🎤 Voice Coach: Initializing vocal training systems...');
        
        // Initialize warm-up routines
        this.initializeWarmUpRoutines();
        
        // Initialize assessment criteria
        this.initializeAssessmentCriteria();
        
        // Initialize health monitoring
        this.initializeHealthMonitoring();
        
        console.log('✅ Voice Coach: Vocal training systems initialized');
    }

    /**
     * Initialize vocal warm-up routines
     */
    initializeWarmUpRoutines() {
        this.warmUpRoutines = {
            basic: {
                duration: 10,
                exercises: [
                    'Deep breathing (3 minutes)',
                    'Lip trills (2 minutes)',
                    'Tongue twisters (2 minutes)',
                    'Scale work (3 minutes)'
                ]
            },
            intermediate: {
                duration: 15,
                exercises: [
                    'Breathing exercises (4 minutes)',
                    'Resonance work (3 minutes)',
                    'Articulation drills (3 minutes)',
                    'Range extension (5 minutes)'
                ]
            },
            advanced: {
                duration: 20,
                exercises: [
                    'Technical breathing (5 minutes)',
                    'Advanced resonance (4 minutes)',
                    'Complex articulation (4 minutes)',
                    'Character voice work (7 minutes)'
                ]
            }
        };
        
        console.log('🎤 Voice Coach: Warm-up routines initialized');
    }

    /**
     * Initialize assessment criteria
     */
    initializeAssessmentCriteria() {
        this.assessmentCriteria = {
            technical: {
                breathSupport: { weight: 0.25, scale: [1, 10] },
                projection: { weight: 0.20, scale: [1, 10] },
                articulation: { weight: 0.20, scale: [1, 10] },
                resonance: { weight: 0.20, scale: [1, 10] },
                intonation: { weight: 0.15, scale: [1, 10] }
            },
            artistic: {
                characterization: { weight: 0.30, scale: [1, 10] },
                emotionalRange: { weight: 0.25, scale: [1, 10] },
                interpretation: { weight: 0.25, scale: [1, 10] },
                authenticity: { weight: 0.20, scale: [1, 10] }
            },
            health: {
                endurance: { weight: 0.40, scale: [1, 10] },
                strain: { weight: 0.30, scale: [1, 10] },
                recovery: { weight: 0.30, scale: [1, 10] }
            }
        };
        
        console.log('🎤 Voice Coach: Assessment criteria initialized');
    }

    /**
     * Initialize health monitoring
     */
    initializeHealthMonitoring() {
        this.healthIndicators = {
            warning_signs: [
                'hoarseness',
                'vocal_fatigue',
                'throat_pain',
                'loss_of_range',
                'breathiness'
            ],
            prevention_strategies: [
                'proper_hydration',
                'breath_support',
                'vocal_rest',
                'warm_up_cool_down',
                'technique_correction'
            ]
        };
        
        console.log('🎤 Voice Coach: Health monitoring initialized');
    }

    /**
     * Test vocal coaching capabilities
     */
    async testVocalCoachingCapabilities() {
        try {
            const testPrompt = `
            As a voice coach, provide vocal guidance for a theatrical performer.
            
            Performer profile:
            - Role: Leading character in a dramatic play
            - Voice challenges: Needs stronger projection and clearer articulation
            - Character requirements: Authoritative figure with emotional range
            - Current issues: Slight breathiness, inconsistent volume
            
            Provide:
            1. Specific breathing exercises for stronger support
            2. Projection techniques for this character type
            3. Articulation exercises for clarity
            4. Character voice development suggestions
            5. Vocal health considerations for this role
            6. Rehearsal strategies for voice integration
            
            Format as practical coaching guidance.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 700
            });
            
            console.log('🎤 Voice Coach: Coaching capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎤 Voice Coach: Coaching capability test failed:', error);
            throw new Error(`Voice coaching test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎤 Voice Coach: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize coaching project
        await this.initializeCoachingProject(data.production);
        
        // Develop vocal approach for production
        await this.developVocalApproach(data.production);
    }

    /**
     * Initialize coaching project
     */
    async initializeCoachingProject(production) {
        console.log('🎤 Voice Coach: Initializing coaching project...');
        
        this.coachingProject = {
            production: production,
            vocalistProfiles: new Map(),
            trainingPrograms: new Map(),
            dialectRequirements: new Map(),
            vocalHealthPlans: new Map(),
            characterVoices: new Map(),
            status: 'assessment_phase',
            createdAt: new Date()
        };
        
        // Analyze production vocal requirements
        await this.analyzeProductionVocalRequirements(production);
        
        console.log('✅ Voice Coach: Coaching project initialized');
    }

    /**
     * Develop vocal approach for production
     */
    async developVocalApproach(production) {
        try {
            console.log('🎤 Voice Coach: Developing vocal approach...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const approachPrompt = `
                Develop a comprehensive vocal coaching approach for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall vocal style and requirements for this production type
                2. Character voice development strategies
                3. Technical training priorities for the cast
                4. Dialect and accent requirements if applicable
                5. Vocal health considerations for the rehearsal/performance period
                6. Integration with directing and character development
                7. Specific exercises and training regimens
                8. Performance readiness assessment criteria
                9. Adaptation strategies for different vocal abilities
                10. Emergency vocal health protocols
                
                Provide a detailed vocal coaching plan that will elevate the entire production's vocal quality and ensure performer health.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(approachPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.coachingProject.vocalApproach = response.content;
                    this.coachingProject.status = 'approach_complete';
                    
                    console.log('✅ Voice Coach: Vocal approach developed');
                    
                    // Extract training elements from approach
                    await this.extractTrainingElements(response.content);
                    
                    // Share approach with production team
                    window.theaterEventBus?.publish('voice:approach-complete', {
                        production: production,
                        approach: response.content,
                        voiceCoach: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Voice Coach: Approach development failed:', error.message);
            this.coachingProject.status = 'approach_error';
        }
    }

    /**
     * Handle character profiles from script
     */
    async onCharacterProfilesReceived(data) {
        console.log('🎤 Voice Coach: Received character profiles from script');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.developCharacterVoices(data.characters);
        }
    }

    /**
     * Develop character voices for specific characters
     */
    async developCharacterVoices(characters) {
        console.log('🎤 Voice Coach: Developing character voices...');
        
        for (const character of characters) {
            await this.developIndividualCharacterVoice(character);
        }
    }

    /**
     * Develop voice for individual character
     */
    async developIndividualCharacterVoice(character) {
        try {
            console.log(`🎤 Voice Coach: Developing voice for ${character.name}...`);
            
            const voicePrompt = `
            Develop a comprehensive character voice profile for this character:
            
            Character: ${character.name}
            Description: ${character.description || 'No description provided'}
            Personality: ${character.personality || 'To be determined'}
            Role: ${character.role || 'Supporting'}
            Age: ${character.age || 'Adult'}
            Background: ${character.background || 'General'}
            
            Production Context:
            Type: ${this.currentProduction.type}
            Vocal Approach: ${this.coachingProject.vocalApproach || 'To be developed'}
            
            Provide detailed character voice development:
            1. Overall voice concept and personality expression
            2. Specific vocal characteristics (pitch, pace, volume, resonance)
            3. Speech patterns and rhythm preferences
            4. Emotional vocal range and expression techniques
            5. Dialect or accent requirements if applicable
            6. Character-specific articulation or pronunciation
            7. Vocal gestures and mannerisms
            8. Voice evolution throughout character arc
            9. Training exercises for this specific voice
            10. Performance notes and cues for consistency
            
            Ensure the voice serves both character authenticity and performer vocal health.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(voicePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const characterVoice = {
                    character: character,
                    voiceProfile: response.content,
                    vocalCharacteristics: await this.extractVocalCharacteristics(response.content),
                    trainingExercises: await this.extractTrainingExercises(response.content),
                    developedAt: new Date(),
                    status: 'developed'
                };
                
                this.coachingProject.characterVoices.set(character.name, characterVoice);
                
                console.log(`✅ Voice Coach: Character voice developed for ${character.name}`);
                
                // Create training program for this character
                if (character.performer) {
                    await this.createCharacterTrainingProgram(character, characterVoice);
                }
                
                // Notify production team
                window.theaterEventBus?.publish('voice:character-voice-ready', {
                    character: character,
                    voiceProfile: characterVoice,
                    voiceCoach: this.config.name
                });
                
                return characterVoice;
            }
            
        } catch (error) {
            console.error(`🎤 Voice Coach: Character voice development failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Handle vocal needs identified during rehearsal
     */
    async onVocalNeedsIdentified(data) {
        console.log('🎤 Voice Coach: Vocal needs identified -', data.need);
        
        await this.addressVocalNeed(data.need, data.performer, data.urgency || 'normal');
    }

    /**
     * Address specific vocal need
     */
    async addressVocalNeed(need, performer, urgency) {
        try {
            console.log(`🎤 Voice Coach: Addressing ${need} for ${performer} (${urgency})...`);
            
            const needPrompt = `
            Address this specific vocal need for a theatrical performer:
            
            Vocal Need: ${need}
            Performer: ${performer}
            Urgency: ${urgency}
            
            Current Context:
            - Production: ${this.currentProduction?.title}
            - Vocal Approach: ${this.coachingProject.vocalApproach}
            - Available coaching time: ${urgency === 'urgent' ? 'Limited' : 'Adequate'}
            
            Provide immediate vocal coaching response:
            1. What's the specific vocal issue or requirement?
            2. What immediate exercises can address this need?
            3. What technique adjustments are recommended?
            4. How can this be integrated into current rehearsal process?
            5. What are the vocal health considerations?
            6. What follow-up coaching is needed?
            
            Keep solutions practical and safe for immediate implementation.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(needPrompt, {
                temperature: 0.7,
                max_tokens: 500,
                timeout: urgency === 'urgent' ? 8000 : 20000
            });
            
            if (response && response.content) {
                const vocalGuidance = {
                    need: need,
                    performer: performer,
                    urgency: urgency,
                    guidance: response.content,
                    providedAt: new Date()
                };
                
                this.performanceTracking.rehearsalFeedback.push(vocalGuidance);
                
                console.log('✅ Voice Coach: Vocal need addressed');
                
                // Implement guidance if urgent
                if (urgency === 'urgent') {
                    await this.implementUrgentVocalGuidance(vocalGuidance);
                }
                
                return vocalGuidance;
            }
            
        } catch (error) {
            console.error(`🎤 Voice Coach: Vocal need addressing failed for ${need}:`, error);
            return null;
        }
    }

    /**
     * Handle vocal strain detection
     */
    async onVocalStrainDetected(data) {
        console.log('🎤 Voice Coach: Vocal strain detected -', data.performer);
        
        await this.handleVocalStrain(data.performer, data.strainLevel, data.symptoms);
    }

    /**
     * Handle vocal strain
     */
    async handleVocalStrain(performer, strainLevel, symptoms) {
        console.log(`🎤 Voice Coach: Handling ${strainLevel} vocal strain for ${performer}...`);
        
        const strainResponse = {
            mild: 'Recommend vocal rest and hydration',
            moderate: 'Implement modified vocal routine and monitoring',
            severe: 'Immediate vocal rest and possible medical consultation'
        };
        
        const response = strainResponse[strainLevel] || strainResponse.mild;
        
        // Log strain incident
        this.vocalHealthTracking.strainIndicators.set(performer, {
            level: strainLevel,
            symptoms: symptoms,
            response: response,
            timestamp: new Date()
        });
        
        // Create recovery plan
        await this.createRecoveryPlan(performer, strainLevel);
        
        // Notify relevant parties
        window.theaterEventBus?.publish('voice:strain-handled', {
            performer: performer,
            strainLevel: strainLevel,
            response: response,
            voiceCoach: this.config.name
        });
    }

    /**
     * Handle dialect requests
     */
    async onDialectRequested(data) {
        console.log('🎤 Voice Coach: Dialect requested -', data.dialect);
        
        await this.provideDialectCoaching(data.dialect, data.performer, data.timeline);
    }

    /**
     * Provide dialect coaching
     */
    async provideDialectCoaching(dialect, performer, timeline) {
        try {
            console.log(`🎤 Voice Coach: Providing ${dialect} coaching for ${performer}...`);
            
            const dialectInfo = this.getDialectInformation(dialect);
            
            const dialectPrompt = `
            Provide comprehensive dialect coaching for a theatrical performer:
            
            Dialect: ${dialect}
            Performer: ${performer}
            Timeline: ${timeline}
            
            Dialect Information:
            ${JSON.stringify(dialectInfo)}
            
            Provide detailed dialect coaching plan:
            1. Key characteristics of this dialect to master
            2. Step-by-step learning progression
            3. Specific exercises for this dialect
            4. Common mistakes to avoid
            5. Practice materials and resources
            6. Timeline for proficiency development
            7. Consistency maintenance strategies
            8. Integration with character development
            
            Ensure the dialect serves the character authentically while being achievable for the performer.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(dialectPrompt, {
                temperature: 0.75,
                max_tokens: 800,
                timeout: 30000
            });
            
            if (response && response.content) {
                const dialectCoaching = {
                    dialect: dialect,
                    performer: performer,
                    timeline: timeline,
                    coachingPlan: response.content,
                    dialectInfo: dialectInfo,
                    createdAt: new Date()
                };
                
                this.coachingProject.dialectRequirements.set(`${performer}_${dialect}`, dialectCoaching);
                
                console.log(`✅ Voice Coach: ${dialect} coaching plan created for ${performer}`);
                
                return dialectCoaching;
            }
            
        } catch (error) {
            console.error(`🎤 Voice Coach: Dialect coaching failed for ${dialect}:`, error);
            return null;
        }
    }

    /**
     * Get dialect information from database
     */
    getDialectInformation(dialect) {
        const category = Object.keys(this.dialectDatabase).find(cat => 
            this.dialectDatabase[cat][dialect]);
        
        if (category) {
            return this.dialectDatabase[category][dialect];
        }
        
        return {
            characteristics: ['To be researched'],
            difficulty: 'medium'
        };
    }

    /**
     * Extract vocal characteristics from voice profile
     */
    async extractVocalCharacteristics(voiceProfile) {
        // Simplified extraction - would use AI parsing in practice
        return {
            pitch: 'medium',
            pace: 'moderate',
            volume: 'projected',
            resonance: 'mixed',
            articulation: 'clear'
        };
    }

    /**
     * Extract training exercises from voice profile
     */
    async extractTrainingExercises(voiceProfile) {
        // Simplified extraction - would parse actual exercises
        return [
            'Character-specific breathing exercises',
            'Resonance work for character placement',
            'Articulation drills for clarity',
            'Emotional range exploration'
        ];
    }

    /**
     * Create character-specific training program
     */
    async createCharacterTrainingProgram(character, characterVoice) {
        const trainingProgram = {
            character: character.name,
            performer: character.performer,
            voiceProfile: characterVoice,
            sessions: this.calculateTrainingSessionPlan(),
            exercises: characterVoice.trainingExercises,
            assessmentSchedule: this.createAssessmentSchedule(),
            status: 'planned'
        };
        
        this.coachingProject.trainingPrograms.set(character.performer, trainingProgram);
        
        console.log(`📅 Voice Coach: Training program created for ${character.performer}`);
    }

    /**
     * Calculate training session plan
     */
    calculateTrainingSessionPlan() {
        return [
            { week: 1, focus: 'Foundation and assessment', sessions: 3 },
            { week: 2, focus: 'Character voice development', sessions: 3 },
            { week: 3, focus: 'Integration and refinement', sessions: 2 },
            { week: 4, focus: 'Performance readiness', sessions: 2 }
        ];
    }

    /**
     * Create assessment schedule
     */
    createAssessmentSchedule() {
        return [
            { week: 1, type: 'initial_assessment', criteria: ['technical', 'range', 'health'] },
            { week: 2, type: 'character_development', criteria: ['characterization', 'consistency'] },
            { week: 3, type: 'integration_check', criteria: ['performance_ready', 'health'] },
            { week: 4, type: 'final_assessment', criteria: ['all_criteria'] }
        ];
    }

    /**
     * Get voice coaching status
     */
    getVoiceCoachingStatus() {
        return {
            currentProject: {
                active: !!this.coachingProject.production,
                title: this.coachingProject.production?.title,
                status: this.coachingProject.status,
                approachComplete: !!this.coachingProject.vocalApproach,
                characterVoicesReady: this.coachingProject.characterVoices.size
            },
            coaching: {
                vocalistProfiles: this.coachingProject.vocalistProfiles.size,
                trainingPrograms: this.coachingProject.trainingPrograms.size,
                dialectRequirements: this.coachingProject.dialectRequirements.size,
                characterVoices: this.coachingProject.characterVoices.size
            },
            health: {
                performersMonitored: this.vocalHealthTracking.performerAssessments.size,
                strainIncidents: this.vocalHealthTracking.strainIndicators.size,
                recoveryPlans: this.vocalHealthTracking.recoveryPlans.size
            },
            capabilities: this.vocalCapabilities,
            techniques: {
                breathingTechniques: Object.keys(this.vocalTechniques.breathing).length,
                resonancePlacements: Object.keys(this.vocalTechniques.resonance).length,
                dialectsAvailable: Object.keys(this.dialectDatabase).reduce((total, cat) => 
                    total + Object.keys(this.dialectDatabase[cat]).length, 0)
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎤 Voice Coach: Concluding vocal coaching session...');
        
        // Finalize coaching project
        if (this.coachingProject.status !== 'idle') {
            this.coachingProject.status = 'completed';
            this.coachingProject.completedAt = new Date();
        }
        
        // Generate vocal coaching summary
        if (this.currentProduction) {
            const coachingSummary = this.generateCoachingSummary();
            console.log('🎤 Voice Coach: Coaching summary generated');
        }
        
        console.log('🎤 Voice Coach: Vocal coaching concluded');
    }

    /**
     * Generate coaching summary
     */
    generateCoachingSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            coaching: {
                approachDeveloped: !!this.coachingProject.vocalApproach,
                characterVoicesCreated: this.coachingProject.characterVoices.size,
                trainingProgramsImplemented: this.coachingProject.trainingPrograms.size,
                dialectCoachingProvided: this.coachingProject.dialectRequirements.size
            },
            health: {
                performersSupported: this.vocalHealthTracking.performerAssessments.size,
                strainIncidentsHandled: this.vocalHealthTracking.strainIndicators.size,
                healthPlansCreated: this.vocalHealthTracking.recoveryPlans.size
            },
            performance: {
                rehearsalFeedbackSessions: this.performanceTracking.rehearsalFeedback.length,
                readinessAssessments: this.performanceTracking.progressAssessments.size,
                characterVoiceReadiness: this.performanceTracking.characterVoiceReadiness.size
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceCoachAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.VoiceCoachAgent = VoiceCoachAgent;
    console.log('🎤 Voice Coach Agent loaded - Ready for exceptional vocal guidance');
}