/**
 * DramaturgeAgent.js - AI-Powered Research and Context Expertise
 * 
 * The Dramaturge Agent uses Ollama LLM to provide comprehensive research, historical
 * context, and cultural expertise for theatrical productions. Ensures authenticity,
 * provides background information, and supports creative decisions with research.
 * 
 * Features:
 * - AI-driven research and fact-checking
 * - Historical and cultural context analysis
 * - Script analysis and interpretation support
 * - Audience education and program notes
 * - Real-time research assistance during development
 * - Integration with creative and production teams
 */

class DramaturgeAgent extends BaseAgent {
    constructor(config = {}) {
        super('dramaturge', {
            name: 'Dramaturge',
            role: 'dramaturge',
            priority: 70, // High priority for research accuracy
            maxActionsPerSecond: 5,
            personality: config.personality || 'scholarly',
            ...config
        });
        
        // Dramaturge specific properties
        this.ollamaInterface = null;
        this.researchFocus = config.researchFocus || 'comprehensive';
        this.creativityLevel = config.creativity || 0.75;
        
        // Research and analysis capabilities
        this.dramaturgyCapabilities = {
            historicalResearch: {
                periodAccuracy: true,
                culturalContext: true,
                socialConditions: true,
                politicalClimate: true,
                artisticMovements: true
            },
            textualAnalysis: {
                themeIdentification: true,
                symbolismAnalysis: true,
                structuralAnalysis: true,
                languageAnalysis: true,
                subtextExploration: true
            },
            culturalExpertise: {
                ethnicTraditions: true,
                religiousContext: true,
                classStructures: true,
                genderRoles: true,
                regionalDifferences: true
            },
            productionSupport: {
                conceptDevelopment: true,
                designResearch: true,
                castingInsights: true,
                directorSupport: true,
                educationMaterials: true
            },
            audienceEngagement: {
                programNotes: true,
                talkBacks: true,
                educationalContent: true,
                contextualFraming: true,
                accessibility: true
            }
        };
        
        // Current research project
        this.researchProject = {
            production: null,
            researchPlan: null,
            historicalContext: new Map(),
            culturalAnalysis: new Map(),
            textualInsights: new Map(),
            factChecking: new Map(),
            audienceMaterials: new Map(),
            status: 'idle'
        };
        
        // Research database and sources
        this.researchDatabase = {
            historicalPeriods: new Map(),
            culturalTraditions: new Map(),
            literaryMovements: new Map(),
            socialStructures: new Map(),
            politicalSystems: new Map(),
            artisticStyles: new Map()
        };
        
        // Knowledge domains and expertise areas
        this.expertiseDomains = {
            theater_history: {
                ancient: 'Greek, Roman, and early theatrical traditions',
                medieval: 'Mystery plays, morality plays, liturgical drama',
                renaissance: 'Elizabethan, Spanish Golden Age, Commedia dell\'arte',
                neoclassical: '17th-18th century European theater',
                modern: '19th-20th century theatrical movements',
                contemporary: 'Current theatrical trends and practices'
            },
            cultural_studies: {
                anthropology: 'Cultural practices and belief systems',
                sociology: 'Social structures and dynamics',
                psychology: 'Human behavior and motivation',
                philosophy: 'Ethical and existential frameworks',
                religion: 'Spiritual traditions and practices',
                politics: 'Power structures and governance'
            },
            literary_analysis: {
                narrative_structure: 'Plot, character, and story construction',
                dramatic_theory: 'Aristotelian and modern dramatic principles',
                genre_studies: 'Tragedy, comedy, melodrama, etc.',
                textual_criticism: 'Manuscript analysis and interpretation',
                comparative_literature: 'Cross-cultural literary analysis',
                adaptation_studies: 'Source material to stage transformation'
            }
        };
        
        // Research methodologies
        this.researchMethodologies = {
            primary_sources: {
                documents: 'Historical documents, letters, diaries',
                artifacts: 'Physical objects and archaeological evidence',
                interviews: 'Oral history and expert consultation',
                archives: 'Institutional and personal collections'
            },
            secondary_sources: {
                scholarship: 'Academic books and journal articles',
                criticism: 'Literary and theatrical criticism',
                reviews: 'Contemporary and historical reviews',
                commentary: 'Expert analysis and interpretation'
            },
            digital_resources: {
                databases: 'Academic and cultural databases',
                digital_archives: 'Online manuscript and document collections',
                multimedia: 'Audio, video, and image resources',
                virtual_museums: 'Digital cultural institutions'
            }
        };
        
        // Analysis frameworks
        this.analysisFrameworks = {
            historical_context: {
                when: 'Time period and chronological placement',
                where: 'Geographic and cultural location',
                who: 'Key figures and social groups',
                what: 'Events and circumstances',
                why: 'Motivations and causations',
                impact: 'Effects and consequences'
            },
            cultural_analysis: {
                values: 'Belief systems and moral frameworks',
                practices: 'Customs, rituals, and traditions',
                structures: 'Social hierarchies and institutions',
                symbols: 'Cultural meanings and representations',
                conflicts: 'Tensions and contradictions',
                evolution: 'Changes and developments over time'
            },
            textual_interpretation: {
                surface_meaning: 'Literal content and obvious themes',
                subtext: 'Hidden meanings and implications',
                metaphor: 'Symbolic and figurative language',
                irony: 'Contradictions and paradoxes',
                resonance: 'Contemporary relevance and universality',
                adaptation: 'Creative interpretation possibilities'
            }
        };
        
        // Fact-checking and verification
        this.factCheckingTracking = {
            verificationRequests: new Map(),
            researchQueries: new Map(),
            sourceVerification: new Map(),
            accuracyAssessments: new Map()
        };
        
        // Audience education materials
        this.educationMaterials = {
            programNotes: new Map(),
            studyGuides: new Map(),
            contextualEssays: new Map(),
            recommendedReading: new Map(),
            discussionQuestions: new Map()
        };
        
        // Production team integration
        this.productionIntegration = {
            researchRequests: [],
            consultationSessions: [],
            factCheckingTasks: [],
            contextualGuidance: []
        };
        
        // Integration with production system
        this.creativeDirector = null;
        this.aiPlaywright = null;
        this.currentProduction = null;
        
        console.log('📚 Dramaturge Agent: Ready to provide scholarly insight and cultural context');
    }

    /**
     * Initialize Dramaturge with system integration
     */
    async onInitialize() {
        try {
            console.log('📚 Dramaturge: Initializing research and analysis systems...');
            
            // Connect to Ollama interface for AI research
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI dramaturgy requires LLM assistance.');
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
            
            // Configure AI for dramaturgy and research
            this.ollamaInterface.updatePerformanceContext({
                role: 'dramaturge',
                research_focus: this.researchFocus,
                creativity_mode: 'scholarly_analysis',
                specialization: 'cultural_research'
            });
            
            // Connect to related agents
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('📚 Dramaturge: Connected to Creative Director');
            }
            
            if (window.aiPlaywrightAgent) {
                this.aiPlaywright = window.aiPlaywrightAgent;
                console.log('📚 Dramaturge: Connected to AI Playwright');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize research systems
            await this.initializeResearchSystems();
            
            // Test dramaturgy capabilities
            await this.testDramaturgyCapabilities();
            
            console.log('📚 Dramaturge: Ready to provide expert research and cultural insight!')
            
        } catch (error) {
            console.error('📚 Dramaturge: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI DRAMATURGY:
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
     * Subscribe to production events for dramaturgy
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('script:analysis-needed', (data) => this.onScriptAnalysisNeeded(data));
            window.theaterEventBus.subscribe('research:fact-check-request', (data) => this.onFactCheckRequested(data));
            window.theaterEventBus.subscribe('research:context-needed', (data) => this.onContextNeeded(data));
            window.theaterEventBus.subscribe('education:materials-request', (data) => this.onEducationMaterialsRequested(data));
            window.theaterEventBus.subscribe('creative:research-consultation', (data) => this.onResearchConsultation(data));
            
            console.log('📚 Dramaturge: Subscribed to research and analysis events');
        }
    }

    /**
     * Initialize research systems
     */
    async initializeResearchSystems() {
        console.log('📚 Dramaturge: Initializing research systems...');
        
        // Initialize knowledge databases
        this.initializeKnowledgeDatabase();
        
        // Initialize research methodologies
        this.initializeResearchMethodologies();
        
        // Initialize analysis frameworks
        this.initializeAnalysisFrameworks();
        
        console.log('✅ Dramaturge: Research systems initialized');
    }

    /**
     * Initialize knowledge database
     */
    initializeKnowledgeDatabase() {
        // Historical periods
        this.researchDatabase.historicalPeriods.set('elizabethan', {
            period: '1558-1603',
            characteristics: ['Renaissance humanism', 'Religious reformation', 'Expansion and exploration'],
            theater: 'Public playhouses, Shakespeare, Marlowe',
            society: 'Feudal to early modern transition'
        });
        
        this.researchDatabase.historicalPeriods.set('victorian', {
            period: '1837-1901',
            characteristics: ['Industrial revolution', 'Empire expansion', 'Social reform'],
            theater: 'Melodrama, music halls, West End development',
            society: 'Strict moral codes, class consciousness'
        });
        
        // Cultural traditions
        this.researchDatabase.culturalTraditions.set('greek_classical', {
            origin: 'Ancient Greece, 5th century BCE',
            characteristics: ['Democratic ideals', 'Philosophical inquiry', 'Artistic excellence'],
            theater: 'Tragedy and comedy forms, Chorus, Unities',
            influence: 'Foundation of Western dramatic theory'
        });
        
        // Literary movements
        this.researchDatabase.literaryMovements.set('romanticism', {
            period: 'Late 18th to mid 19th century',
            characteristics: ['Emotion over reason', 'Nature worship', 'Individual expression'],
            theater: 'Gothic drama, historical plays, emotional intensity',
            key_figures: 'Byron, Hugo, Kleist'
        });
        
        console.log('📚 Dramaturge: Knowledge database initialized');
    }

    /**
     * Initialize research methodologies
     */
    initializeResearchMethodologies() {
        this.researchProcess = {
            initial_assessment: 'Identify research needs and questions',
            source_identification: 'Locate relevant primary and secondary sources',
            fact_verification: 'Cross-reference information for accuracy',
            context_analysis: 'Understand historical and cultural frameworks',
            synthesis: 'Integrate findings into coherent analysis',
            application: 'Apply research to production needs'
        };
        
        console.log('📚 Dramaturge: Research methodologies initialized');
    }

    /**
     * Initialize analysis frameworks
     */
    initializeAnalysisFrameworks() {
        this.analysisCriteria = {
            accuracy: { weight: 0.30, importance: 'Critical for authenticity' },
            relevance: { weight: 0.25, importance: 'Direct application to production' },
            depth: { weight: 0.20, importance: 'Comprehensive understanding' },
            accessibility: { weight: 0.15, importance: 'Audience comprehension' },
            creativity: { weight: 0.10, importance: 'Interpretive possibilities' }
        };
        
        console.log('📚 Dramaturge: Analysis frameworks initialized');
    }

    /**
     * Test dramaturgy capabilities
     */
    async testDramaturgyCapabilities() {
        try {
            const testPrompt = `
            As a dramaturge, provide research and context for a theatrical production.
            
            Production scenario:
            - Play: A period drama set in 1920s America
            - Themes: Social change, women's rights, prohibition
            - Research needs: Historical accuracy, cultural context, audience education
            
            Provide:
            1. Historical context for the 1920s setting
            2. Cultural analysis of women's roles during this period
            3. Social and political factors influencing the story
            4. Research insights that could inform design and performance
            5. Potential audience education topics
            6. Recommendations for maintaining historical authenticity
            
            Format as comprehensive dramaturgy research brief.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('📚 Dramaturge: Research capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('📚 Dramaturge: Research capability test failed:', error);
            throw new Error(`Dramaturgy test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('📚 Dramaturge: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize research project
        await this.initializeResearchProject(data.production);
        
        // Develop research plan
        await this.developResearchPlan(data.production);
    }

    /**
     * Initialize research project
     */
    async initializeResearchProject(production) {
        console.log('📚 Dramaturge: Initializing research project...');
        
        this.researchProject = {
            production: production,
            researchPlan: null,
            historicalContext: new Map(),
            culturalAnalysis: new Map(),
            textualInsights: new Map(),
            factChecking: new Map(),
            audienceMaterials: new Map(),
            status: 'planning_phase',
            createdAt: new Date()
        };
        
        // Identify initial research needs
        await this.identifyResearchNeeds(production);
        
        console.log('✅ Dramaturge: Research project initialized');
    }

    /**
     * Develop comprehensive research plan
     */
    async developResearchPlan(production) {
        try {
            console.log('📚 Dramaturge: Developing research plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive dramaturgy research plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Historical and cultural context requirements
                2. Textual analysis and interpretation needs
                3. Fact-checking and accuracy verification priorities
                4. Audience education and engagement opportunities
                5. Creative team support and consultation areas
                6. Design and performance research requirements
                7. Contemporary relevance and adaptation considerations
                8. Accessibility and inclusive interpretation needs
                9. Source material research and verification
                10. Community and cultural sensitivity considerations
                
                Provide a detailed research plan that will inform all aspects of the production while ensuring accuracy, depth, and audience engagement.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.researchProject.researchPlan = response.content;
                    this.researchProject.status = 'plan_complete';
                    
                    console.log('✅ Dramaturge: Research plan developed');
                    
                    // Extract research priorities from plan
                    await this.extractResearchPriorities(response.content);
                    
                    // Begin initial research
                    await this.beginInitialResearch(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('research:plan-complete', {
                        production: production,
                        plan: response.content,
                        dramaturge: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Dramaturge: Research plan development failed:', error.message);
            this.researchProject.status = 'plan_error';
        }
    }

    /**
     * Handle script analysis requests
     */
    async onScriptAnalysisNeeded(data) {
        console.log('📚 Dramaturge: Script analysis requested -', data.analysisType);
        
        await this.provideScriptAnalysis(data.script, data.analysisType, data.focus);
    }

    /**
     * Provide comprehensive script analysis
     */
    async provideScriptAnalysis(script, analysisType, focus) {
        try {
            console.log(`📚 Dramaturge: Providing ${analysisType} analysis...`);
            
            const analysisPrompt = `
            Provide ${analysisType} dramaturgy analysis for this script or script excerpt:
            
            Script/Text: ${script?.substring(0, 1000)}${script?.length > 1000 ? '...' : ''}
            Analysis Focus: ${focus || 'Comprehensive'}
            
            Production Context: ${this.currentProduction?.title}
            Research Plan: ${this.researchProject.researchPlan || 'To be developed'}
            
            Provide detailed analysis covering:
            1. Historical and cultural context of the text
            2. Thematic elements and their significance
            3. Character motivations and social dynamics
            4. Language analysis and period authenticity
            5. Symbolic and metaphorical elements
            6. Contemporary relevance and interpretation opportunities
            7. Research areas needing further investigation
            8. Recommendations for creative team consideration
            9. Potential audience education points
            10. Cultural sensitivity considerations
            
            Format as comprehensive dramaturgy analysis suitable for production team use.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 1000,
                timeout: 45000
            });
            
            if (response && response.content) {
                const scriptAnalysis = {
                    script: script,
                    analysisType: analysisType,
                    focus: focus,
                    analysis: response.content,
                    researchNeeds: await this.extractResearchNeeds(response.content),
                    contextualInsights: await this.extractContextualInsights(response.content),
                    analyzedAt: new Date()
                };
                
                this.researchProject.textualInsights.set(`${analysisType}_${Date.now()}`, scriptAnalysis);
                
                console.log(`✅ Dramaturge: ${analysisType} analysis complete`);
                
                // Notify production team
                window.theaterEventBus?.publish('research:script-analysis-ready', {
                    analysis: scriptAnalysis,
                    dramaturge: this.config.name
                });
                
                return scriptAnalysis;
            }
            
        } catch (error) {
            console.error(`📚 Dramaturge: Script analysis failed for ${analysisType}:`, error);
            return null;
        }
    }

    /**
     * Handle fact-checking requests
     */
    async onFactCheckRequested(data) {
        console.log('📚 Dramaturge: Fact-check requested -', data.claim);
        
        await this.performFactCheck(data.claim, data.context, data.priority || 'normal');
    }

    /**
     * Perform comprehensive fact-checking
     */
    async performFactCheck(claim, context, priority) {
        try {
            console.log(`📚 Dramaturge: Fact-checking claim with ${priority} priority...`);
            
            const factCheckPrompt = `
            Perform comprehensive fact-checking on this claim:
            
            Claim: ${claim}
            Context: ${context || 'General production context'}
            Priority: ${priority}
            
            Production: ${this.currentProduction?.title}
            Research Focus: ${this.researchFocus}
            
            Provide detailed fact-checking analysis:
            1. Accuracy assessment of the claim
            2. Historical evidence supporting or contradicting
            3. Sources and references for verification
            4. Cultural context and nuances
            5. Alternative interpretations or perspectives
            6. Recommendations for production use
            7. Areas requiring additional research
            8. Potential creative liberties and their justification
            
            Format as professional fact-checking report with clear accuracy rating.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(factCheckPrompt, {
                temperature: 0.6, // Lower creativity for accuracy
                max_tokens: 700,
                timeout: priority === 'urgent' ? 10000 : 25000
            });
            
            if (response && response.content) {
                const factCheck = {
                    claim: claim,
                    context: context,
                    priority: priority,
                    analysis: response.content,
                    accuracy: this.assessAccuracy(response.content),
                    checkedAt: new Date()
                };
                
                this.researchProject.factChecking.set(claim, factCheck);
                
                console.log(`✅ Dramaturge: Fact-check complete`);
                
                // Alert if urgent and inaccurate
                if (priority === 'urgent' && factCheck.accuracy < 0.7) {
                    await this.alertAccuracyIssue(factCheck);
                }
                
                return factCheck;
            }
            
        } catch (error) {
            console.error(`📚 Dramaturge: Fact-checking failed for claim:`, error);
            return null;
        }
    }

    /**
     * Handle context requests
     */
    async onContextNeeded(data) {
        console.log('📚 Dramaturge: Context research requested -', data.topic);
        
        await this.provideContextualResearch(data.topic, data.scope, data.application);
    }

    /**
     * Provide contextual research
     */
    async provideContextualResearch(topic, scope, application) {
        try {
            console.log(`📚 Dramaturge: Researching ${topic} context...`);
            
            const contextPrompt = `
            Provide comprehensive contextual research on this topic:
            
            Topic: ${topic}
            Scope: ${scope || 'Comprehensive'}
            Application: ${application || 'General production support'}
            
            Production Context: ${this.currentProduction?.title}
            Research Areas: ${Object.keys(this.expertiseDomains).join(', ')}
            
            Provide detailed contextual analysis:
            1. Historical background and development
            2. Cultural significance and variations
            3. Social and political implications
            4. Artistic and literary connections
            5. Contemporary relevance and interpretation
            6. Regional and demographic differences
            7. Evolution and changes over time
            8. Controversies or sensitive aspects
            9. Recommendations for respectful treatment
            10. Resources for further research
            
            Ensure analysis is both scholarly and practically applicable to theatrical production.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(contextPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 900,
                timeout: 35000
            });
            
            if (response && response.content) {
                const contextualResearch = {
                    topic: topic,
                    scope: scope,
                    application: application,
                    research: response.content,
                    culturalConsiderations: await this.extractCulturalConsiderations(response.content),
                    researchedAt: new Date()
                };
                
                this.researchProject.culturalAnalysis.set(topic, contextualResearch);
                
                console.log(`✅ Dramaturge: Contextual research complete for ${topic}`);
                
                return contextualResearch;
            }
            
        } catch (error) {
            console.error(`📚 Dramaturge: Contextual research failed for ${topic}:`, error);
            return null;
        }
    }

    /**
     * Handle education materials requests
     */
    async onEducationMaterialsRequested(data) {
        console.log('📚 Dramaturge: Education materials requested -', data.materialType);
        
        await this.createEducationMaterials(data.materialType, data.audience, data.focus);
    }

    /**
     * Create audience education materials
     */
    async createEducationMaterials(materialType, audience, focus) {
        try {
            console.log(`📚 Dramaturge: Creating ${materialType} for ${audience}...`);
            
            const materialsPrompt = `
            Create ${materialType} for audience education:
            
            Material Type: ${materialType}
            Target Audience: ${audience || 'General theater audience'}
            Focus Areas: ${focus || 'General production context'}
            
            Production: ${this.currentProduction?.title}
            Research Available: ${this.researchProject.culturalAnalysis.size} cultural analyses, ${this.researchProject.textualInsights.size} textual insights
            
            Create engaging educational content covering:
            1. Essential background information
            2. Historical and cultural context
            3. Themes and their significance
            4. Contemporary relevance
            5. Questions for reflection and discussion
            6. Recommended further reading/viewing
            7. Glossary of important terms
            8. Timeline of relevant events
            9. Maps or visual references if applicable
            10. Interactive elements or discussion prompts
            
            Make content accessible, engaging, and appropriate for the target audience level.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(materialsPrompt, {
                temperature: 0.7,
                max_tokens: 800,
                timeout: 30000
            });
            
            if (response && response.content) {
                const educationMaterial = {
                    materialType: materialType,
                    audience: audience,
                    focus: focus,
                    content: response.content,
                    accessibility: this.assessAccessibility(audience, response.content),
                    createdAt: new Date()
                };
                
                this.educationMaterials[materialType].set(`${audience}_${Date.now()}`, educationMaterial);
                
                console.log(`✅ Dramaturge: ${materialType} created for ${audience}`);
                
                return educationMaterial;
            }
            
        } catch (error) {
            console.error(`📚 Dramaturge: Education materials creation failed for ${materialType}:`, error);
            return null;
        }
    }

    /**
     * Handle research consultation requests
     */
    async onResearchConsultation(data) {
        console.log('📚 Dramaturge: Research consultation requested -', data.question);
        
        await this.provideResearchConsultation(data.question, data.requester, data.urgency);
    }

    /**
     * Provide research consultation
     */
    async provideResearchConsultation(question, requester, urgency) {
        const consultation = {
            question: question,
            requester: requester,
            urgency: urgency,
            response: await this.generateConsultationResponse(question),
            consultedAt: new Date()
        };
        
        this.productionIntegration.consultationSessions.push(consultation);
        
        // Notify requester
        window.theaterEventBus?.publish('research:consultation-ready', {
            consultation: consultation,
            dramaturge: this.config.name
        });
        
        return consultation;
    }

    /**
     * Extract research priorities from plan
     */
    async extractResearchPriorities(planContent) {
        // Simplified extraction - would use AI parsing in practice
        return [
            'Historical accuracy verification',
            'Cultural context development',
            'Textual analysis and interpretation',
            'Audience education preparation'
        ];
    }

    /**
     * Extract research needs from analysis
     */
    async extractResearchNeeds(analysisContent) {
        // Simplified extraction - would parse actual needs
        return [
            'Additional historical sources',
            'Cultural expert consultation',
            'Period-specific language research',
            'Social context verification'
        ];
    }

    /**
     * Assess accuracy of fact-check
     */
    assessAccuracy(factCheckContent) {
        // Simplified assessment - would use more sophisticated analysis
        if (factCheckContent.includes('accurate') || factCheckContent.includes('verified')) {
            return 0.9;
        } else if (factCheckContent.includes('partially') || factCheckContent.includes('mostly')) {
            return 0.7;
        } else if (factCheckContent.includes('inaccurate') || factCheckContent.includes('false')) {
            return 0.3;
        }
        return 0.5; // Uncertain
    }

    /**
     * Assess accessibility of materials
     */
    assessAccessibility(audience, content) {
        const accessibilityScores = {
            'general': 0.8,
            'students': 0.9,
            'scholars': 0.6,
            'children': 0.9,
            'seniors': 0.8
        };
        
        return accessibilityScores[audience] || 0.7;
    }

    /**
     * Get dramaturgy status
     */
    getDramaturgyStatus() {
        return {
            currentProject: {
                active: !!this.researchProject.production,
                title: this.researchProject.production?.title,
                status: this.researchProject.status,
                planComplete: !!this.researchProject.researchPlan,
                researchProgress: this.calculateResearchProgress()
            },
            research: {
                historicalContext: this.researchProject.historicalContext.size,
                culturalAnalysis: this.researchProject.culturalAnalysis.size,
                textualInsights: this.researchProject.textualInsights.size,
                factChecking: this.researchProject.factChecking.size
            },
            education: {
                programNotes: this.educationMaterials.programNotes.size,
                studyGuides: this.educationMaterials.studyGuides.size,
                contextualEssays: this.educationMaterials.contextualEssays.size
            },
            capabilities: this.dramaturgyCapabilities,
            expertise: {
                historicalPeriods: this.researchDatabase.historicalPeriods.size,
                culturalTraditions: this.researchDatabase.culturalTraditions.size,
                literaryMovements: this.researchDatabase.literaryMovements.size
            }
        };
    }

    /**
     * Calculate research progress
     */
    calculateResearchProgress() {
        const totalAreas = 10; // Estimated research areas
        const completedAreas = this.researchProject.historicalContext.size + 
                              this.researchProject.culturalAnalysis.size + 
                              this.researchProject.textualInsights.size;
        return Math.min((completedAreas / totalAreas) * 100, 100);
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('📚 Dramaturge: Concluding research session...');
        
        // Finalize research project
        if (this.researchProject.status !== 'idle') {
            this.researchProject.status = 'completed';
            this.researchProject.completedAt = new Date();
        }
        
        // Generate research summary
        if (this.currentProduction) {
            const researchSummary = this.generateResearchSummary();
            console.log('📚 Dramaturge: Research summary generated');
        }
        
        console.log('📚 Dramaturge: Research and analysis concluded');
    }

    /**
     * Generate research summary
     */
    generateResearchSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            research: {
                planDeveloped: !!this.researchProject.researchPlan,
                historicalContextProvided: this.researchProject.historicalContext.size,
                culturalAnalysesCompleted: this.researchProject.culturalAnalysis.size,
                textualInsightsGenerated: this.researchProject.textualInsights.size,
                factCheckingPerformed: this.researchProject.factChecking.size
            },
            education: {
                programNotesCreated: this.educationMaterials.programNotes.size,
                studyGuidesGenerated: this.educationMaterials.studyGuides.size,
                educationalContentDeveloped: this.calculateEducationalOutput()
            },
            consultation: {
                researchConsultations: this.productionIntegration.consultationSessions.length,
                factCheckingRequests: this.productionIntegration.factCheckingTasks.length,
                contextualGuidanceProvided: this.productionIntegration.contextualGuidance.length
            }
        };
    }

    /**
     * Calculate educational output
     */
    calculateEducationalOutput() {
        return Object.values(this.educationMaterials)
            .reduce((total, materialMap) => total + materialMap.size, 0);
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DramaturgeAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.DramaturgeAgent = DramaturgeAgent;
    console.log('📚 Dramaturge Agent loaded - Ready for scholarly research and cultural insight');
}