/**
 * RehearsalPianistAgent.js - AI-Powered Musical Rehearsal Support
 * 
 * The Rehearsal Pianist Agent uses Ollama LLM to provide comprehensive
 * musical support during rehearsals, including accompaniment, coaching,
 * and musical direction assistance for theatrical productions.
 * 
 * Features:
 * - AI-driven musical accompaniment and support
 * - Rehearsal planning and tempo management
 * - Vocal coaching assistance and musical guidance
 * - Score preparation and musical analysis
 * - Integration with music direction and performance
 * - Adaptive accompaniment for varying skill levels
 */

class RehearsalPianistAgent extends BaseAgent {
    constructor(config = {}) {
        super('rehearsal-pianist', {
            name: 'Rehearsal Pianist',
            role: 'rehearsal-pianist',
            priority: 60, // Important for rehearsal support
            maxActionsPerSecond: 4,
            personality: config.personality || 'supportive',
            ...config
        });
        
        // Rehearsal Pianist specific properties
        this.ollamaInterface = null;
        this.accompanimentApproach = config.approach || 'adaptive-supportive';
        this.creativityLevel = config.creativity || 0.70;
        
        // Rehearsal pianist capabilities
        this.pianistCapabilities = {
            accompaniment: {
                scoreReading: true,
                sightReading: true,
                transposition: true,
                tempoAdaptation: true,
                styleAdaptation: true
            },
            coaching: {
                vocalSupport: true,
                rhythmicGuidance: true,
                pitchCorrection: true,
                musicalInterpretation: true,
                confidenceBuilding: true
            },
            rehearsalSupport: {
                sectionWork: true,
                repetitionManagement: true,
                cueGiving: true,
                tempoControl: true,
                transitionSupport: true
            },
            musicalDirection: {
                scorePreparation: true,
                musicalAnalysis: true,
                phrasingGuidance: true,
                harmonySupport: true,
                arrangementAdaptation: true
            },
            collaboration: {
                directorSupport: true,
                performerGuidance: true,
                musicDirectorAlignment: true,
                coachingAssistance: true,
                rehearsalPlanning: true
            },
            adaptation: {
                skillLevelAdaptation: true,
                learningSupport: true,
                paceAdjustment: true,
                difficultyScaling: true,
                individualSupport: true
            }
        };
        
        // Current rehearsal project
        this.rehearsalProject = {
            production: null,
            rehearsalPlan: null,
            scorePreparation: new Map(),
            sessionNotes: new Map(),
            performerProgress: new Map(),
            musicalChallenges: new Map(),
            status: 'idle'
        };
        
        // Musical styles and repertoire knowledge
        this.musicalStyles = {
            classical_styles: {
                baroque: {
                    characteristics: 'Ornamental, contrapuntal, precise articulation, terrace dynamics',
                    techniques: 'Figured bass, ornamentation, historically informed practice',
                    repertoire: 'Bach, Handel, Vivaldi, Purcell',
                    accompaniment_style: 'Clear articulation, supportive bass lines, ornamented realizations'
                },
                classical: {
                    characteristics: 'Balanced phrases, clear form, elegant expression, dynamic contrast',
                    techniques: 'Classical phrasing, period style, appropriate ornamentation',
                    repertoire: 'Mozart, Haydn, early Beethoven',
                    accompaniment_style: 'Elegant support, clear phrasing, balanced textures'
                },
                romantic: {
                    characteristics: 'Expressive freedom, rubato, rich harmonies, emotional depth',
                    techniques: 'Flexible tempo, expressive phrasing, pedaling techniques',
                    repertoire: 'Schubert, Schumann, Brahms, late Beethoven',
                    accompaniment_style: 'Expressive support, flexible timing, rich harmonies'
                }
            },
            theater_styles: {
                golden_age_musical: {
                    characteristics: 'Sophisticated harmony, complex lyrics, character-driven songs',
                    techniques: 'Broadway phrasing, character support, dramatic accompaniment',
                    repertoire: 'Rodgers & Hammerstein, Lerner & Loewe, Irving Berlin',
                    accompaniment_style: 'Character-driven, dramatic support, sophisticated harmony'
                },
                contemporary_musical: {
                    characteristics: 'Pop influences, rock elements, contemporary harmonies',
                    techniques: 'Modern rhythms, contemporary styles, flexible arrangements',
                    repertoire: 'Sondheim, Lloyd Webber, contemporary composers',
                    accompaniment_style: 'Modern sensibility, rhythmic drive, contemporary harmonies'
                },
                cabaret_revue: {
                    characteristics: 'Intimate style, sophisticated interpretation, personal connection',
                    techniques: 'Intimate accompaniment, interpretive freedom, collaborative approach',
                    repertoire: 'American Songbook, cabaret standards, contemporary cabaret',
                    accompaniment_style: 'Intimate support, interpretive collaboration, sophisticated style'
                }
            },
            opera_operetta: {
                grand_opera: {
                    characteristics: 'Dramatic scope, orchestral thinking, vocal support',
                    techniques: 'Orchestral reduction, dramatic accompaniment, vocal support',
                    repertoire: 'Verdi, Puccini, Wagner, Mozart',
                    accompaniment_style: 'Orchestral thinking, dramatic support, vocal line emphasis'
                },
                comic_opera: {
                    characteristics: 'Light texture, comedic timing, ensemble coordination',
                    techniques: 'Light touch, comedic timing, ensemble support',
                    repertoire: 'Gilbert & Sullivan, Offenbach, Mozart buffa',
                    accompaniment_style: 'Light and supportive, comedic timing, ensemble coordination'
                }
            }
        };
        
        // Rehearsal techniques and methodologies
        this.rehearsalTechniques = {
            score_preparation: {
                analysis: {
                    harmonic_analysis: 'Understanding chord progressions, harmonic rhythm, key relationships',
                    formal_analysis: 'Song structure, phrase relationships, dramatic function',
                    vocal_analysis: 'Range requirements, tessitura, difficulty assessment',
                    pianistic_analysis: 'Technical challenges, fingering, pedaling, arrangement issues'
                },
                reduction_skills: {
                    orchestral_reduction: 'Condensing orchestral scores for piano, maintaining essential elements',
                    voice_leading: 'Preserving important melodic lines, harmonic progressions',
                    texture_management: 'Balancing accompaniment with vocal lines, clarity maintenance',
                    idiomatic_writing: 'Piano-friendly arrangements, technical feasibility'
                },
                preparation_strategies: {
                    practice_planning: 'Systematic preparation, difficult passage identification',
                    marking_scores: 'Cues, tempo changes, dynamic markings, performance notes',
                    flexibility_preparation: 'Alternative versions, transposition options, cut possibilities',
                    collaboration_notes: 'Director preferences, performer needs, coaching points'
                }
            },
            accompaniment_techniques: {
                supportive_playing: {
                    vocal_support: 'Following natural vocal phrasing, breathing support',
                    rhythmic_stability: 'Steady tempo, clear beat, rhythmic security',
                    harmonic_foundation: 'Clear harmonic progressions, bass line support',
                    dynamic_sensitivity: 'Appropriate volume levels, dynamic support'
                },
                adaptive_skills: {
                    tempo_flexibility: 'Following natural speech rhythms, dramatic pacing',
                    transposition: 'Key changes for vocal comfort, range accommodation',
                    simplification: 'Reducing complexity for learning stages, skill levels',
                    enhancement: 'Adding support where needed, filling orchestral gaps'
                },
                collaborative_techniques: {
                    non_verbal_communication: 'Visual cues, breathing coordination, eye contact',
                    listening_skills: 'Responsive playing, adjustment to vocal needs',
                    leadership_balance: 'Providing stability while allowing interpretation',
                    emergency_skills: 'Recovery from mistakes, memory lapses, unexpected changes'
                }
            },
            coaching_support: {
                musical_guidance: {
                    pitch_accuracy: 'Helping singers find correct pitches, interval training',
                    rhythm_support: 'Clarifying complex rhythms, subdivision assistance',
                    phrasing_guidance: 'Musical line development, breath management',
                    style_coaching: 'Period style, genre characteristics, performance practice'
                },
                learning_assistance: {
                    note_learning: 'Systematic approach to pitch and rhythm accuracy',
                    memorization_support: 'Musical memory techniques, performance security',
                    confidence_building: 'Supportive environment, gradual complexity increase',
                    problem_solving: 'Identifying and addressing specific challenges'
                }
            }
        };
        
        // Rehearsal planning and management
        this.rehearsalManagement = {
            session_planning: {
                preparation_checklist: {
                    score_review: 'Analyzing material to be covered, identifying challenges',
                    performer_assessment: 'Understanding individual needs, skill levels',
                    goal_setting: 'Clear objectives for each session, measurable outcomes',
                    material_organization: 'Efficient order of work, transition planning'
                },
                time_management: {
                    efficient_pacing: 'Balancing thoroughness with progress, time allocation',
                    break_planning: 'Appropriate rest periods, energy management',
                    priority_setting: 'Most important work first, emergency preparation',
                    flexibility_maintenance: 'Adaptation to changing needs, unexpected issues'
                }
            },
            progress_tracking: {
                individual_monitoring: {
                    skill_assessment: 'Regular evaluation of progress, challenge identification',
                    need_identification: 'Specific support requirements, learning styles',
                    goal_adjustment: 'Modifying objectives based on progress, realistic expectations',
                    support_planning: 'Targeted assistance, specialized coaching'
                },
                session_documentation: {
                    notes_taking: 'Recording progress, challenges, successes',
                    communication: 'Sharing information with directors, coaches',
                    follow_up_planning: 'Next session preparation, continued support',
                    pattern_recognition: 'Identifying recurring issues, systematic solutions'
                }
            }
        };
        
        // Performance preparation and support
        self.performancePreparation = {
            technical_preparation: {
                score_mastery: {
                    memorization: 'Secure knowledge of all material, backup strategies',
                    flexibility: 'Adaptation to conductor changes, performer variations',
                    emergency_skills: 'Recovery techniques, improvisation abilities',
                    performance_optimization: 'Peak performance preparation, stress management'
                },
                equipment_preparation: {
                    instrument_setup: 'Piano preparation, bench adjustment, music organization',
                    lighting_coordination: 'Adequate music reading light, page turning logistics',
                    communication_systems: 'Clear sight lines, audio monitoring if needed',
                    backup_planning: 'Alternative arrangements, emergency procedures'
                }
            },
            performance_support: {
                real_time_adaptation: {
                    tempo_following: 'Responsive to conductor, dramatic needs',
                    dynamic_adjustment: 'Balance with voices, acoustic adaptation',
                    emergency_response: 'Quick recovery, problem solving',
                    artistic_collaboration: 'Supporting interpretive choices, dramatic needs'
                },
                post_performance: {
                    evaluation: 'Performance assessment, improvement identification',
                    feedback_integration: 'Learning from experience, adjustment planning',
                    maintenance_planning: 'Continued preparation, skill development',
                    collaboration_review: 'Team effectiveness, communication improvement'
                }
            }
        };
        
        // Integration with production system
        this.musicDirector = null;
        this.voiceCoach = null;
        this.choreographer = null;
        this.currentProduction = null;
        
        console.log('🎹 Rehearsal Pianist Agent: Ready for musical rehearsal support and collaborative accompaniment');
    }

    /**
     * Initialize Rehearsal Pianist with system integration
     */
    async onInitialize() {
        try {
            console.log('🎹 Rehearsal Pianist: Initializing rehearsal support systems...');
            
            // Connect to Ollama interface for AI musical support
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI rehearsal support requires LLM assistance.');
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
            
            // Configure AI for rehearsal support
            this.ollamaInterface.updatePerformanceContext({
                role: 'rehearsal_pianist',
                accompaniment_approach: this.accompanimentApproach,
                creativity_mode: 'musical_support',
                specialization: 'collaborative_accompaniment'
            });
            
            // Connect to related agents
            if (window.musicDirectorAgent) {
                this.musicDirector = window.musicDirectorAgent;
                console.log('🎹 Rehearsal Pianist: Connected to Music Director');
            }
            
            if (window.voiceCoachAgent) {
                this.voiceCoach = window.voiceCoachAgent;
                console.log('🎹 Rehearsal Pianist: Connected to Voice Coach');
            }
            
            if (window.choreographerAgent) {
                this.choreographer = window.choreographerAgent;
                console.log('🎹 Rehearsal Pianist: Connected to Choreographer');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize rehearsal systems
            await this.initializeRehearsalSystems();
            
            // Test rehearsal pianist capabilities
            await this.testRehearsalCapabilities();
            
            console.log('🎹 Rehearsal Pianist: Ready for musical rehearsal support!')
            
        } catch (error) {
            console.error('🎹 Rehearsal Pianist: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI REHEARSAL SUPPORT:
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
     * Subscribe to production events for rehearsal support
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('rehearsal:session-request', (data) => this.onRehearsalRequest(data));
            window.theaterEventBus.subscribe('music:score-update', (data) => this.onScoreUpdate(data));
            window.theaterEventBus.subscribe('vocal:coaching-session', (data) => this.onVocalSession(data));
            window.theaterEventBus.subscribe('rehearsal:tempo-change', (data) => this.onTempoChange(data));
            window.theaterEventBus.subscribe('performance:preparation', (data) => this.onPerformancePrep(data));
            
            console.log('🎹 Rehearsal Pianist: Subscribed to rehearsal support events');
        }
    }

    /**
     * Initialize rehearsal systems
     */
    async initializeRehearsalSystems() {
        console.log('🎹 Rehearsal Pianist: Initializing rehearsal systems...');
        
        // Initialize accompaniment systems
        this.initializeAccompanimentSystems();
        
        // Initialize coaching support
        this.initializeCoachingSupport();
        
        // Initialize score preparation
        this.initializeScorePreparation();
        
        // Initialize session management
        this.initializeSessionManagement();
        
        console.log('✅ Rehearsal Pianist: Rehearsal systems initialized');
    }

    /**
     * Initialize accompaniment systems
     */
    initializeAccompanimentSystems() {
        this.accompanimentSystems = {
            scoreReading: (score, style) => this.analyzeScore(score, style),
            tempoManagement: (piece, performers) => this.manageTempoFlexibility(piece, performers),
            harmonySupport: (progression, voices) => this.provideHarmonicSupport(progression, voices),
            styleAdaptation: (genre, requirements) => this.adaptAccompanimentStyle(genre, requirements)
        };
        
        console.log('🎹 Rehearsal Pianist: Accompaniment systems initialized');
    }

    /**
     * Initialize coaching support
     */
    initializeCoachingSupport() {
        this.coachingSupport = {
            pitchGuidance: (performer, accuracy) => this.providePitchGuidance(performer, accuracy),
            rhythmSupport: (complexity, performer) => this.supportRhythmLearning(complexity, performer),
            phrasingSuggestions: (musical_line, interpretation) => this.suggestPhrasing(musical_line, interpretation),
            confidenceBuilding: (performer, challenges) => this.buildMusicalConfidence(performer, challenges)
        };
        
        console.log('🎹 Rehearsal Pianist: Coaching support initialized');
    }

    /**
     * Initialize score preparation
     */
    initializeScorePreparation() {
        this.scorePreparation = {
            analysisTools: new Map(),
            reductionTechniques: new Map(),
            preparationNotes: new Map(),
            flexibilityOptions: new Map()
        };
        
        console.log('🎹 Rehearsal Pianist: Score preparation initialized');
    }

    /**
     * Initialize session management
     */
    initializeSessionManagement() {
        this.sessionManagement = {
            planningTools: new Map(),
            progressTracking: new Map(),
            noteManagement: new Map(),
            collaborationTracking: new Map()
        };
        
        console.log('🎹 Rehearsal Pianist: Session management initialized');
    }

    /**
     * Test rehearsal pianist capabilities
     */
    async testRehearsalCapabilities() {
        try {
            const testPrompt = `
            As a rehearsal pianist, develop a comprehensive musical support plan for a theater production.
            
            Rehearsal pianist scenario:
            - Production: Musical theater with complex score and varying performer skill levels
            - Challenges: Difficult vocal lines, complex rhythms, ensemble coordination
            - Requirements: Accompaniment, vocal coaching support, flexible rehearsal management
            - Goals: Musical accuracy, performer confidence, collaborative preparation
            - Timeline: 6-week rehearsal period with increasing complexity
            
            Provide:
            1. Score preparation and analysis strategy
            2. Accompaniment techniques for different rehearsal phases
            3. Vocal coaching support and musical guidance methods
            4. Rehearsal session planning and time management
            5. Adaptation strategies for varying performer skill levels
            6. Integration with music direction and voice coaching
            7. Performance preparation and support protocols
            8. Problem-solving approaches for common musical challenges
            
            Format as comprehensive rehearsal pianist plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🎹 Rehearsal Pianist: Rehearsal capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎹 Rehearsal Pianist: Rehearsal capability test failed:', error);
            throw new Error(`Rehearsal pianist test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎹 Rehearsal Pianist: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize rehearsal project
        await this.initializeRehearsalProject(data.production);
        
        // Develop rehearsal support plan
        await this.developRehearsalSupportPlan(data.production);
    }

    /**
     * Initialize rehearsal project
     */
    async initializeRehearsalProject(production) {
        console.log('🎹 Rehearsal Pianist: Initializing rehearsal project...');
        
        this.rehearsalProject = {
            production: production,
            rehearsalPlan: null,
            scorePreparation: new Map(),
            sessionNotes: new Map(),
            performerProgress: new Map(),
            musicalChallenges: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ Rehearsal Pianist: Rehearsal project initialized');
    }

    /**
     * Develop rehearsal support plan for production
     */
    async developRehearsalSupportPlan(production) {
        try {
            console.log('🎹 Rehearsal Pianist: Developing rehearsal support plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive rehearsal support plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Score preparation and musical analysis strategies
                2. Accompaniment techniques for different rehearsal phases
                3. Vocal coaching support and musical guidance methods
                4. Rehearsal session planning and efficient time management
                5. Adaptation strategies for varying performer skill levels
                6. Integration with music direction and voice coaching teams
                7. Performance preparation and technical support protocols
                8. Problem-solving approaches for common musical challenges
                9. Collaborative techniques for ensemble and solo work
                10. Long-term musical development and performer support
                
                Provide a detailed rehearsal support plan that ensures musical accuracy, performer confidence, and collaborative excellence.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.rehearsalProject.rehearsalPlan = response.content;
                    this.rehearsalProject.status = 'plan_complete';
                    
                    console.log('✅ Rehearsal Pianist: Rehearsal support plan developed');
                    
                    // Extract musical priorities
                    await this.extractMusicalPriorities(response.content);
                    
                    // Begin score preparation
                    await this.beginScorePreparation(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('rehearsal:support-plan-complete', {
                        production: production,
                        plan: response.content,
                        rehearsalPianist: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Rehearsal Pianist: Plan development failed:', error.message);
            this.rehearsalProject.status = 'plan_error';
        }
    }

    /**
     * Handle rehearsal requests
     */
    async onRehearsalRequest(data) {
        console.log('🎹 Rehearsal Pianist: Rehearsal session requested -', data.sessionType);
        
        await this.prepareRehearsalSession(data.material, data.performers, data.objectives);
    }

    /**
     * Handle score updates
     */
    async onScoreUpdate(data) {
        console.log('🎹 Rehearsal Pianist: Score update received');
        
        await this.updateScorePreparation(data.changes, data.sections);
    }

    /**
     * Handle vocal coaching sessions
     */
    async onVocalSession(data) {
        console.log('🎹 Rehearsal Pianist: Vocal coaching session support requested');
        
        await this.supportVocalCoaching(data.performer, data.material, data.challenges);
    }

    /**
     * Extract musical priorities from plan
     */
    async extractMusicalPriorities(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            technical: 'Pitch accuracy, rhythm precision, ensemble coordination',
            artistic: 'Musical phrasing, character expression, style authenticity',
            collaborative: 'Responsive accompaniment, supportive coaching, flexible adaptation',
            preparation: 'Thorough score analysis, efficient rehearsal planning'
        };
    }

    /**
     * Get rehearsal pianist status
     */
    getRehearsalPianistStatus() {
        return {
            currentProject: {
                active: !!this.rehearsalProject.production,
                title: this.rehearsalProject.production?.title,
                status: this.rehearsalProject.status,
                planComplete: !!this.rehearsalProject.rehearsalPlan,
                sessionsCompleted: this.rehearsalProject.sessionNotes.size
            },
            musical: {
                scorePreparations: this.rehearsalProject.scorePreparation.size,
                performerProgress: this.rehearsalProject.performerProgress.size,
                musicalChallenges: this.rehearsalProject.musicalChallenges.size
            },
            capabilities: this.pianistCapabilities,
            expertise: {
                musicalStyles: Object.keys(this.musicalStyles).length,
                rehearsalTechniques: Object.keys(this.rehearsalTechniques).length,
                performancePreparation: Object.keys(self.performancePreparation || {}).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎹 Rehearsal Pianist: Concluding rehearsal support session...');
        
        // Finalize rehearsal project
        if (this.rehearsalProject.status !== 'idle') {
            this.rehearsalProject.status = 'completed';
            this.rehearsalProject.completedAt = new Date();
        }
        
        // Generate rehearsal summary
        if (this.currentProduction) {
            const rehearsalSummary = this.generateRehearsalSummary();
            console.log('🎹 Rehearsal Pianist: Rehearsal support summary generated');
        }
        
        console.log('🎹 Rehearsal Pianist: Musical rehearsal support concluded');
    }

    /**
     * Generate rehearsal summary
     */
    generateRehearsalSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            rehearsal: {
                planDeveloped: !!this.rehearsalProject.rehearsalPlan,
                scoresPrepared: this.rehearsalProject.scorePreparation.size,
                sessionsSupported: this.rehearsalProject.sessionNotes.size,
                performersCoached: this.rehearsalProject.performerProgress.size
            },
            musical: {
                challengesAddressed: this.rehearsalProject.musicalChallenges.size,
                technicalSupport: this.calculateTechnicalSupport(),
                artisticGuidance: this.calculateArtisticGuidance()
            },
            collaboration: {
                musicDirectorCoordination: !!this.musicDirector,
                voiceCoachSupport: !!this.voiceCoach,
                choreographerIntegration: !!this.choreographer
            }
        };
    }

    /**
     * Calculate technical support metrics
     */
    calculateTechnicalSupport() {
        return Array.from(this.rehearsalProject.performerProgress.values())
            .filter(progress => progress.technicalImprovement).length;
    }

    /**
     * Calculate artistic guidance metrics
     */
    calculateArtisticGuidance() {
        return Array.from(this.rehearsalProject.sessionNotes.values())
            .filter(session => session.artisticFocus).length;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RehearsalPianistAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.RehearsalPianistAgent = RehearsalPianistAgent;
    console.log('🎹 Rehearsal Pianist Agent loaded - Ready for musical rehearsal support and collaborative accompaniment');
}