/**
 * CastingDirectorAgent.js - AI-Powered Performer Selection and Matching
 * 
 * The Casting Director Agent uses Ollama LLM to manage the casting process,
 * matching performers with roles based on artistic fit, practical considerations,
 * and production requirements. Ensures inclusive and effective casting decisions.
 * 
 * Features:
 * - AI-driven role analysis and performer matching
 * - Audition planning and evaluation
 * - Diversity and inclusion considerations
 * - Ensemble chemistry assessment
 * - Availability and logistics coordination
 * - Alternative casting and understudy planning
 */

class CastingDirectorAgent extends BaseAgent {
    constructor(config = {}) {
        super('casting-director', {
            name: 'Casting Director',
            role: 'casting-director',
            priority: 85, // Very high priority for production planning
            maxActionsPerSecond: 4,
            personality: config.personality || 'discerning',
            ...config
        });
        
        // Casting Director specific properties
        this.ollamaInterface = null;
        this.castingApproach = config.approach || 'holistic-inclusive';
        this.creativityLevel = config.creativity || 0.75;
        
        // Casting capabilities
        this.castingCapabilities = {
            roleAnalysis: {
                characterBreakdown: true,
                performanceRequirements: true,
                physicalDemands: true,
                vocalRequirements: true,
                experienceNeeds: true
            },
            performerAssessment: {
                skillEvaluation: true,
                typeAssessment: true,
                experienceReview: true,
                availabilityCheck: true,
                personalityFit: true
            },
            matchingExpertise: {
                artisticFit: true,
                chemistryAssessment: true,
                ensembleBalance: true,
                practicalConsiderations: true,
                alternativeCasting: true
            },
            inclusionFocus: {
                diversityCasting: true,
                accessibilityPlanning: true,
                equityConsiderations: true,
                biasAwareness: true,
                representationGoals: true
            },
            auditionManagement: {
                processDesign: true,
                materialsPreparation: true,
                sessionCoordination: true,
                evaluationSystems: true,
                feedbackProvision: true
            }
        };
        
        // Current casting project
        this.castingProject = {
            production: null,
            castingConcept: null,
            roleBreakdowns: new Map(),
            performerPool: new Map(),
            auditionPlan: new Map(),
            castingDecisions: new Map(),
            status: 'idle'
        };
        
        // Role analysis frameworks
        this.roleAnalysisFramework = {
            character_requirements: {
                age_range: {
                    consideration: 'Actual vs. playing age, age progression needs',
                    flexibility: 'How much variation is acceptable',
                    priority: 'Essential vs. preferred'
                },
                physical_type: {
                    consideration: 'Height, build, distinctive features',
                    inclusivity: 'Avoid unnecessary restrictions',
                    adaptation: 'How role can adapt to performer'
                },
                vocal_demands: {
                    singing: 'Range, style, technical requirements',
                    speaking: 'Accent, projection, vocal characterization',
                    endurance: 'Vocal stamina needs'
                },
                movement_skills: {
                    dance: 'Technical requirements vs. movement quality',
                    stage_combat: 'Fight choreography needs',
                    physicality: 'Character-specific movement demands'
                }
            },
            artistic_requirements: {
                acting_style: {
                    approach: 'Method, classical, contemporary styles',
                    experience: 'Genre familiarity, training background',
                    range: 'Emotional depth, comedy/drama versatility'
                },
                character_depth: {
                    complexity: 'Psychological demands, character arc',
                    transformation: 'Physical/emotional journey requirements',
                    relationships: 'Chemistry needs with other characters'
                },
                presence: {
                    stage_presence: 'Command, charisma, authenticity',
                    vulnerability: 'Ability to be open and truthful',
                    power: 'Authority, leadership, dominance needs'
                }
            },
            practical_considerations: {
                availability: {
                    schedule: 'Rehearsal and performance availability',
                    commitment: 'Length of engagement, conflicts',
                    flexibility: 'Willingness to adjust for production needs'
                },
                experience_level: {
                    professional: 'Industry experience, training background',
                    collaboration: 'Ability to work in ensemble',
                    development: 'Coachability, growth potential'
                },
                logistics: {
                    location: 'Geographic considerations, travel',
                    compensation: 'Budget alignment, negotiation needs',
                    special_needs: 'Accessibility, accommodation requirements'
                }
            }
        };
        
        // Performer evaluation criteria
        this.performerEvaluation = {
            artistic_assessment: {
                technique: {
                    voice: 'Projection, clarity, range, control',
                    movement: 'Coordination, expressiveness, physical skills',
                    acting: 'Truth, spontaneity, character creation',
                    presence: 'Confidence, magnetism, stage command'
                },
                interpretation: {
                    understanding: 'Character comprehension, script analysis',
                    creativity: 'Original choices, artistic risk-taking',
                    adaptability: 'Direction response, adjustment ability',
                    authenticity: 'Truthfulness, genuine expression'
                },
                collaboration: {
                    ensemble_work: 'Generosity, listening, support',
                    direction: 'Openness, responsiveness, professionalism',
                    preparation: 'Homework quality, commitment level',
                    attitude: 'Positivity, work ethic, problem-solving'
                }
            },
            practical_assessment: {
                reliability: {
                    punctuality: 'Timeliness, preparation consistency',
                    communication: 'Responsiveness, clarity, honesty',
                    professionalism: 'Boundary respect, collaboration skills',
                    stamina: 'Energy maintenance, commitment sustaining'
                },
                development: {
                    coachability: 'Feedback reception, adjustment ability',
                    growth_potential: 'Learning capacity, improvement trajectory',
                    experience: 'Background relevance, skill transferability',
                    training: 'Formal education, continued learning'
                }
            }
        };
        
        // Casting methodologies and approaches
        this.castingMethodologies = {
            traditional_casting: {
                description: 'Type-based casting matching performer characteristics to role requirements',
                advantages: 'Clear fit, audience expectation alignment, reduced preparation time',
                considerations: 'May limit diversity, can reinforce stereotypes',
                best_for: 'Commercial productions, type-driven roles, tight timelines'
            },
            non_traditional_casting: {
                description: 'Casting based on talent and interpretation rather than type',
                advantages: 'Increased diversity, fresh perspectives, expanded opportunities',
                considerations: 'May require concept adjustment, audience education',
                best_for: 'Artistic productions, reimagined classics, inclusive initiatives'
            },
            color_conscious_casting: {
                description: 'Intentional consideration of race/ethnicity in casting decisions',
                advantages: 'Authentic representation, cultural specificity, meaningful inclusion',
                considerations: 'Requires cultural competence, community engagement',
                best_for: 'Culture-specific works, historical accuracy, representation goals'
            },
            color_blind_casting: {
                description: 'Casting without regard to race/ethnicity, focusing on talent',
                advantages: 'Merit-based selection, opportunity expansion, prejudice reduction',
                considerations: 'May ignore important cultural contexts, representation impacts',
                best_for: 'Universal themes, talent showcases, barrier breaking'
            },
            inclusive_casting: {
                description: 'Proactive inclusion of underrepresented groups and accessibility needs',
                advantages: 'Authentic representation, community building, barrier removal',
                considerations: 'Requires intentional effort, resource allocation, ongoing commitment',
                best_for: 'Community engagement, social impact, artistic innovation'
            }
        };
        
        // Audition design and management
        this.auditionFramework = {
            audition_types: {
                initial_auditions: {
                    purpose: 'First impression, basic fit assessment',
                    format: 'Prepared material, cold reading, brief interview',
                    duration: '5-10 minutes per performer',
                    evaluation: 'Basic suitability, callback potential'
                },
                callbacks: {
                    purpose: 'Deeper exploration, chemistry testing, final selection',
                    format: 'Scene work, improvisation, chemistry reads',
                    duration: '15-30 minutes per performer',
                    evaluation: 'Role fit, ensemble chemistry, final decisions'
                },
                chemistry_reads: {
                    purpose: 'Relationship compatibility testing',
                    format: 'Scene work with potential co-stars',
                    participants: 'Multiple performer combinations',
                    evaluation: 'Interaction quality, believability, dynamic'
                }
            },
            evaluation_methods: {
                scoring_systems: {
                    numerical: 'Quantitative ratings for comparison',
                    qualitative: 'Narrative feedback and observations',
                    ranking: 'Preference ordering among candidates',
                    consensus: 'Team discussion and agreement'
                },
                criteria_weighting: {
                    artistic_fit: 'Role interpretation and character embodiment',
                    technical_skills: 'Voice, movement, acting technique',
                    ensemble_chemistry: 'Collaboration and relationship potential',
                    practical_factors: 'Availability, experience, professionalism'
                }
            }
        };
        
        // Diversity, equity, and inclusion considerations
        this.inclusionFramework = {
            representation_goals: {
                cultural_authenticity: 'Appropriate cultural representation when relevant',
                demographic_diversity: 'Age, race, gender, ability representation',
                perspective_variety: 'Different backgrounds, experiences, viewpoints',
                community_reflection: 'Local demographics and audience representation'
            },
            barrier_removal: {
                accessibility: 'Physical, cognitive, sensory accommodation needs',
                economic: 'Financial barriers to participation',
                geographic: 'Location and transportation considerations',
                experiential: 'Training, education, networking access differences'
            },
            bias_mitigation: {
                unconscious_bias: 'Awareness and counteraction of implicit preferences',
                systemic_barriers: 'Recognition and addressing of structural inequities',
                evaluation_equity: 'Fair and consistent assessment methods',
                opportunity_access: 'Equal audition and consideration chances'
            }
        };
        
        // Casting tracking and management
        this.castingTracking = {
            submissionManagement: new Map(),
            auditionScheduling: new Map(),
            evaluationRecords: new Map(),
            decisionDocumentation: new Map()
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.executiveProducer = null;
        this.aiPlaywright = null;
        this.currentProduction = null;
        
        console.log('🎭 Casting Director Agent: Ready to discover and match talent with artistic vision');
    }

    /**
     * Initialize Casting Director with system integration
     */
    async onInitialize() {
        try {
            console.log('🎭 Casting Director: Initializing casting management systems...');
            
            // Connect to Ollama interface for AI casting decisions
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI casting requires LLM assistance.');
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
            
            // Configure AI for casting decisions
            this.ollamaInterface.updatePerformanceContext({
                role: 'casting_director',
                casting_approach: this.castingApproach,
                creativity_mode: 'talent_matching',
                specialization: 'performer_role_alignment'
            });
            
            // Connect to related agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🎭 Casting Director: Connected to Creative Director');
            }
            
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('🎭 Casting Director: Connected to Executive Producer');
            }
            
            if (window.aiPlaywrightAgent) {
                this.aiPlaywright = window.aiPlaywrightAgent;
                console.log('🎭 Casting Director: Connected to AI Playwright');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize casting systems
            await this.initializeCastingSystems();
            
            // Test casting capabilities
            await this.testCastingCapabilities();
            
            console.log('🎭 Casting Director: Ready to discover and match talent!')
            
        } catch (error) {
            console.error('🎭 Casting Director: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI CASTING:
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
     * Subscribe to production events for casting
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('script:character-breakdown', (data) => this.onCharacterBreakdown(data));
            window.theaterEventBus.subscribe('casting:audition-request', (data) => this.onAuditionRequest(data));
            window.theaterEventBus.subscribe('casting:performer-submission', (data) => this.onPerformerSubmission(data));
            window.theaterEventBus.subscribe('casting:chemistry-test', (data) => this.onChemistryTest(data));
            window.theaterEventBus.subscribe('creative:casting-consultation', (data) => this.onCastingConsultation(data));
            
            console.log('🎭 Casting Director: Subscribed to casting events');
        }
    }

    /**
     * Initialize casting systems
     */
    async initializeCastingSystems() {
        console.log('🎭 Casting Director: Initializing casting systems...');
        
        // Initialize role analysis tools
        this.initializeRoleAnalysisTools();
        
        // Initialize performer assessment tools
        this.initializePerformerAssessmentTools();
        
        // Initialize matching algorithms
        this.initializeMatchingAlgorithms();
        
        console.log('✅ Casting Director: Casting systems initialized');
    }

    /**
     * Initialize role analysis tools
     */
    initializeRoleAnalysisTools() {
        this.roleAnalysisTools = {
            characterBreakdown: (character, script) => this.analyzeCharacterRequirements(character, script),
            skillRequirements: (role) => this.extractSkillRequirements(role),
            castingChallenges: (role) => this.identifyCastingChallenges(role),
            inclusionOpportunities: (role) => this.assessInclusionOpportunities(role)
        };
        
        console.log('🎭 Casting Director: Role analysis tools initialized');
    }

    /**
     * Initialize performer assessment tools
     */
    initializePerformerAssessmentTools() {
        this.performerTools = {
            skillEvaluator: (performer, criteria) => this.evaluatePerformerSkills(performer, criteria),
            typeAssessment: (performer) => this.assessPerformerType(performer),
            potentialMatcher: (performer, roles) => this.matchPerformerToRoles(performer, roles),
            chemistryPredictor: (performers) => this.predictEnsembleChemistry(performers)
        };
        
        console.log('🎭 Casting Director: Performer assessment tools initialized');
    }

    /**
     * Initialize matching algorithms
     */
    initializeMatchingAlgorithms() {
        this.matchingAlgorithms = {
            artisticFit: (performer, role) => this.calculateArtisticFit(performer, role),
            practicalFit: (performer, role) => this.calculatePracticalFit(performer, role),
            ensembleBalance: (cast) => this.assessEnsembleBalance(cast),
            diversityMetrics: (cast) => this.calculateDiversityMetrics(cast)
        };
        
        console.log('🎭 Casting Director: Matching algorithms initialized');
    }

    /**
     * Test casting capabilities
     */
    async testCastingCapabilities() {
        try {
            const testPrompt = `
            As a casting director, analyze casting requirements and provide recommendations.
            
            Casting scenario:
            - Production: Contemporary adaptation of a classical play
            - Role: Lead character - complex, demanding role requiring vocal and physical skills
            - Considerations: Need strong stage presence, emotional range, ensemble chemistry
            - Constraints: Limited budget, 6-week rehearsal period
            - Goals: Inclusive casting while maintaining artistic excellence
            
            Provide:
            1. Detailed role breakdown and requirements analysis
            2. Performer profile and ideal qualifications
            3. Audition process design and evaluation criteria
            4. Diversity and inclusion considerations
            5. Alternative casting approaches and backup plans
            6. Timeline and logistics for casting process
            7. Integration with creative team vision
            8. Risk assessment and mitigation strategies
            
            Format as comprehensive casting strategy.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🎭 Casting Director: Casting capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎭 Casting Director: Casting capability test failed:', error);
            throw new Error(`Casting test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎭 Casting Director: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize casting project
        await this.initializeCastingProject(data.production);
        
        // Develop casting strategy
        await this.developCastingStrategy(data.production);
    }

    /**
     * Initialize casting project
     */
    async initializeCastingProject(production) {
        console.log('🎭 Casting Director: Initializing casting project...');
        
        this.castingProject = {
            production: production,
            castingConcept: null,
            roleBreakdowns: new Map(),
            performerPool: new Map(),
            auditionPlan: new Map(),
            castingDecisions: new Map(),
            status: 'strategy_development',
            createdAt: new Date()
        };
        
        console.log('✅ Casting Director: Casting project initialized');
    }

    /**
     * Develop casting strategy for production
     */
    async developCastingStrategy(production) {
        try {
            console.log('🎭 Casting Director: Developing casting strategy...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const strategyPrompt = `
                Develop a comprehensive casting strategy for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Overall casting approach and philosophy
                2. Diversity, equity, and inclusion goals
                3. Artistic vision alignment and character requirements
                4. Practical considerations (budget, timeline, location)
                5. Audition process design and evaluation methods
                6. Ensemble chemistry and relationship dynamics
                7. Alternative casting and understudy planning
                8. Community engagement and outreach strategies
                9. Risk assessment and contingency planning
                10. Integration with creative team vision and goals
                
                Provide a detailed casting strategy that balances artistic excellence with inclusive practices and practical realities.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(strategyPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.castingProject.castingConcept = response.content;
                    this.castingProject.status = 'strategy_complete';
                    
                    console.log('✅ Casting Director: Casting strategy developed');
                    
                    // Extract casting priorities from strategy
                    await this.extractCastingPriorities(response.content);
                    
                    // Begin role breakdown development
                    await this.beginRoleBreakdownDevelopment(production, response.content);
                    
                    // Share strategy with production team
                    window.theaterEventBus?.publish('casting:strategy-complete', {
                        production: production,
                        strategy: response.content,
                        castingDirector: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Casting Director: Strategy development failed:', error.message);
            this.castingProject.status = 'strategy_error';
        }
    }

    /**
     * Handle character breakdown from script
     */
    async onCharacterBreakdown(data) {
        console.log('🎭 Casting Director: Character breakdown received');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.processCharacterBreakdown(data.characters);
        }
    }

    /**
     * Process character breakdown for casting
     */
    async processCharacterBreakdown(characters) {
        console.log('🎭 Casting Director: Processing character breakdown...');
        
        for (const character of characters) {
            await this.createRoleBreakdown(character);
        }
    }

    /**
     * Create detailed role breakdown
     */
    async createRoleBreakdown(character) {
        try {
            console.log(`🎭 Casting Director: Creating role breakdown for ${character.name}...`);
            
            const breakdownPrompt = `
            Create a detailed casting breakdown for this character:
            
            Character: ${character.name}
            Description: ${character.description || 'Character details to be determined'}
            Role Type: ${character.roleType || 'Not specified'}
            Story Function: ${character.storyFunction || 'To be analyzed'}
            
            Production Context:
            - Production: ${this.currentProduction?.title}
            - Casting Strategy: ${this.castingProject.castingConcept}
            - Approach: ${this.castingApproach}
            
            Provide comprehensive role breakdown:
            1. Character requirements and essential qualities
            2. Acting skills and experience needs
            3. Physical and vocal requirements
            4. Age range and physical type considerations
            5. Diversity and inclusion opportunities
            6. Ensemble chemistry and relationship needs
            7. Audition material and evaluation criteria
            8. Alternative casting possibilities
            9. Special considerations and challenges
            10. Understudy and coverage requirements
            
            Format as detailed casting breakdown for audition postings and evaluation.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(breakdownPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 45000
            });
            
            if (response && response.content) {
                const roleBreakdown = {
                    character: character,
                    breakdown: response.content,
                    requirements: await this.extractRequirements(response.content),
                    evaluationCriteria: await this.extractEvaluationCriteria(response.content),
                    inclusionOpportunities: await this.extractInclusionOpportunities(response.content),
                    createdAt: new Date(),
                    status: 'complete'
                };
                
                this.castingProject.roleBreakdowns.set(character.name, roleBreakdown);
                
                console.log(`✅ Casting Director: Role breakdown complete for ${character.name}`);
                
                // Share breakdown with team
                window.theaterEventBus?.publish('casting:role-breakdown-ready', {
                    character: character,
                    breakdown: roleBreakdown,
                    castingDirector: this.config.name
                });
                
                return roleBreakdown;
            }
            
        } catch (error) {
            console.error(`🎭 Casting Director: Role breakdown failed for ${character.name}:`, error);
            return null;
        }
    }

    /**
     * Extract casting priorities from strategy
     */
    async extractCastingPriorities(strategy) {
        // Simplified extraction - would use AI parsing in practice
        return {
            diversity: 'High priority for inclusive representation',
            experience: 'Balance of seasoned and emerging talent',
            chemistry: 'Strong ensemble relationships essential',
            logistics: 'Practical considerations important'
        };
    }

    /**
     * Extract requirements from breakdown
     */
    async extractRequirements(breakdown) {
        // Simplified extraction - would parse specific requirements
        return {
            essential: ['Acting ability', 'Character fit', 'Availability'],
            preferred: ['Experience', 'Training', 'Special skills'],
            physical: ['Age range', 'Movement ability'],
            vocal: ['Projection', 'Character voice']
        };
    }

    /**
     * Get casting director status
     */
    getCastingDirectorStatus() {
        return {
            currentProject: {
                active: !!this.castingProject.production,
                title: this.castingProject.production?.title,
                status: this.castingProject.status,
                strategyComplete: !!this.castingProject.castingConcept,
                roleBreakdownsComplete: this.castingProject.roleBreakdowns.size
            },
            casting: {
                roleBreakdowns: this.castingProject.roleBreakdowns.size,
                performerPool: this.castingProject.performerPool.size,
                auditionPlans: this.castingProject.auditionPlan.size,
                castingDecisions: this.castingProject.castingDecisions.size
            },
            capabilities: this.castingCapabilities,
            methodology: {
                analysisFramework: Object.keys(this.roleAnalysisFramework).length,
                evaluationCriteria: Object.keys(this.performerEvaluation).length,
                castingMethodologies: Object.keys(this.castingMethodologies).length,
                inclusionFramework: Object.keys(this.inclusionFramework).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎭 Casting Director: Concluding casting session...');
        
        // Finalize casting project
        if (this.castingProject.status !== 'idle') {
            this.castingProject.status = 'completed';
            this.castingProject.completedAt = new Date();
        }
        
        // Generate casting summary
        if (this.currentProduction) {
            const castingSummary = this.generateCastingSummary();
            console.log('🎭 Casting Director: Casting summary generated');
        }
        
        console.log('🎭 Casting Director: Talent discovery and matching concluded');
    }

    /**
     * Generate casting summary
     */
    generateCastingSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            casting: {
                strategyDeveloped: !!this.castingProject.castingConcept,
                roleBreakdownsCreated: this.castingProject.roleBreakdowns.size,
                performersEvaluated: this.castingProject.performerPool.size,
                castingDecisionsMade: this.castingProject.castingDecisions.size
            },
            process: {
                auditionPlansCompleted: this.castingProject.auditionPlan.size,
                inclusionGoalsAddressed: this.calculateInclusionMetrics(),
                ensembleChemistryAssessed: this.calculateChemistryAssessments()
            },
            collaboration: {
                creativeDirectorAlignment: !!this.creativeDirector,
                executiveProducerCoordination: !!this.executiveProducer,
                playwrightConsultation: !!this.aiPlaywright
            }
        };
    }

    /**
     * Calculate inclusion metrics
     */
    calculateInclusionMetrics() {
        return Array.from(this.castingProject.roleBreakdowns.values())
            .filter(breakdown => breakdown.inclusionOpportunities).length;
    }

    /**
     * Calculate chemistry assessments
     */
    calculateChemistryAssessments() {
        return Array.from(this.castingProject.castingDecisions.values())
            .filter(decision => decision.chemistryTested).length;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CastingDirectorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.CastingDirectorAgent = CastingDirectorAgent;
    console.log('🎭 Casting Director Agent loaded - Ready to discover and match talent with artistic vision');
}