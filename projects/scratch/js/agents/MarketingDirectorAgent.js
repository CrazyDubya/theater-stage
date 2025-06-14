/**
 * MarketingDirectorAgent.js - AI-Powered Audience Engagement and Promotion
 * 
 * The Marketing Director Agent uses Ollama LLM to develop comprehensive marketing
 * strategies that build audiences, engage communities, and promote theatrical
 * productions effectively while respecting artistic integrity.
 * 
 * Features:
 * - AI-driven marketing strategy development
 * - Audience analysis and segmentation
 * - Multi-channel campaign coordination
 * - Community engagement and outreach
 * - Brand development and messaging
 * - Performance analytics and optimization
 */

class MarketingDirectorAgent extends BaseAgent {
    constructor(config = {}) {
        super('marketing-director', {
            name: 'Marketing Director',
            role: 'marketing-director',
            priority: 80, // High priority for audience development
            maxActionsPerSecond: 6,
            personality: config.personality || 'strategic',
            ...config
        });
        
        // Marketing Director specific properties
        this.ollamaInterface = null;
        this.marketingApproach = config.approach || 'audience-first';
        this.creativityLevel = config.creativity || 0.85;
        
        // Marketing capabilities
        this.marketingCapabilities = {
            strategyDevelopment: {
                audienceAnalysis: true,
                marketResearch: true,
                competitorAnalysis: true,
                brandPositioning: true,
                messagingStrategy: true
            },
            campaignManagement: {
                multiChannelCampaigns: true,
                contentCreation: true,
                mediaPlanning: true,
                budgetOptimization: true,
                timelineCoordination: true
            },
            digitalMarketing: {
                socialMediaManagement: true,
                emailMarketing: true,
                websiteOptimization: true,
                onlineAdvertising: true,
                influencerOutreach: true
            },
            traditionalMarketing: {
                printAdvertising: true,
                radioPromotion: true,
                publicRelations: true,
                partnershipDevelopment: true,
                eventMarketing: true
            },
            communityEngagement: {
                communityOutreach: true,
                educationalPrograms: true,
                accessibilityInitiatives: true,
                culturalPartnerships: true,
                volunteerPrograms: true
            },
            analyticsOptimization: {
                performanceTracking: true,
                roiAnalysis: true,
                audienceBehaviorAnalysis: true,
                campaignOptimization: true,
                reportingDashboards: true
            }
        };
        
        // Current marketing project
        this.marketingProject = {
            production: null,
            marketingStrategy: null,
            audienceProfiles: new Map(),
            campaigns: new Map(),
            contentLibrary: new Map(),
            performanceMetrics: new Map(),
            status: 'idle'
        };
        
        // Audience segmentation and analysis
        this.audienceSegmentation = {
            demographic_segments: {
                age_groups: {
                    young_adults: {
                        range: '18-34',
                        characteristics: 'Digital-native, social media active, experience-seeking',
                        preferences: 'Contemporary themes, accessible pricing, social sharing',
                        channels: 'Instagram, TikTok, Snapchat, streaming platforms'
                    },
                    middle_aged: {
                        range: '35-54',
                        characteristics: 'Established careers, family responsibilities, cultural sophistication',
                        preferences: 'Quality productions, convenience, educational value',
                        channels: 'Facebook, email, traditional media, professional networks'
                    },
                    seniors: {
                        range: '55+',
                        characteristics: 'Cultural appreciation, disposable income, loyalty',
                        preferences: 'Classic works, matinee performances, group discounts',
                        channels: 'Print media, radio, direct mail, word of mouth'
                    }
                },
                psychographic_segments: {
                    cultural_enthusiasts: {
                        characteristics: 'High arts engagement, frequent attendance, informed critics',
                        motivations: 'Artistic excellence, intellectual stimulation, cultural status',
                        approach: 'Quality emphasis, artist credentials, critical acclaim'
                    },
                    entertainment_seekers: {
                        characteristics: 'Occasional attendance, broad entertainment preferences',
                        motivations: 'Fun, escape, social activity, value for money',
                        approach: 'Accessible messaging, entertainment value, social aspects'
                    },
                    community_supporters: {
                        characteristics: 'Local pride, community involvement, relationship-driven',
                        motivations: 'Supporting local arts, community connection, shared experience',
                        approach: 'Community impact, local relevance, collective benefit'
                    }
                }
            },
            behavioral_segments: {
                attendance_patterns: {
                    subscribers: 'Regular season ticket holders, high lifetime value',
                    frequent_attendees: 'Multiple shows per year, responsive to recommendations',
                    occasional_attendees: 'Special occasions, event-driven attendance',
                    first_timers: 'New to theater, need education and encouragement'
                },
                engagement_levels: {
                    advocates: 'Active promoters, word-of-mouth influencers',
                    engaged: 'Interested followers, responsive to communications',
                    passive: 'Aware but inactive, need activation strategies',
                    unaware: 'No theater awareness, require introduction campaigns'
                }
            }
        };
        
        // Marketing channels and strategies
        this.marketingChannels = {
            digital_channels: {
                social_media: {
                    platforms: {
                        facebook: {
                            strengths: 'Event promotion, community building, demographic targeting',
                            content_types: 'Behind-scenes content, event pages, community discussions',
                            audience: 'Broad demographics, particularly 35+ age groups'
                        },
                        instagram: {
                            strengths: 'Visual storytelling, behind-scenes content, influencer partnerships',
                            content_types: 'Photos, stories, reels, IGTV videos',
                            audience: 'Younger demographics, visually-oriented users'
                        },
                        twitter: {
                            strengths: 'Real-time updates, industry networking, media relations',
                            content_types: 'News, reviews, live-tweeting, industry conversations',
                            audience: 'Media, industry professionals, engaged theater community'
                        },
                        tiktok: {
                            strengths: 'Viral content, younger audience, creative promotion',
                            content_types: 'Short videos, challenges, behind-scenes snippets',
                            audience: 'Gen Z and younger millennials'
                        }
                    }
                },
                email_marketing: {
                    newsletters: 'Regular updates, season announcements, exclusive content',
                    automated_sequences: 'Welcome series, abandoned cart recovery, post-show follow-up',
                    segmentation: 'Behavior-based, preference-based, demographic targeting',
                    personalization: 'Individual recommendations, customized content'
                },
                website_optimization: {
                    user_experience: 'Intuitive navigation, mobile responsiveness, fast loading',
                    conversion_optimization: 'Streamlined ticket purchasing, clear calls-to-action',
                    content_strategy: 'SEO optimization, valuable content, regular updates',
                    analytics: 'User behavior tracking, conversion funnel analysis'
                }
            },
            traditional_channels: {
                print_media: {
                    newspapers: 'Arts sections, event listings, feature articles',
                    magazines: 'Lifestyle publications, arts journals, community magazines',
                    programs: 'Show programs, season brochures, educational materials',
                    posters: 'Strategic placement, visual impact, brand consistency'
                },
                broadcast_media: {
                    radio: 'Arts programming, interview opportunities, PSA announcements',
                    television: 'Local news features, arts programming, commercial spots',
                    podcasts: 'Arts-focused podcasts, interview opportunities'
                },
                public_relations: {
                    media_relations: 'Press releases, media kits, journalist relationships',
                    influencer_outreach: 'Arts bloggers, community leaders, cultural influencers',
                    awards_submissions: 'Industry recognition, credibility building'
                }
            },
            community_outreach: {
                partnerships: {
                    cultural_institutions: 'Museums, libraries, other theaters, art centers',
                    educational_institutions: 'Schools, universities, continuing education programs',
                    community_organizations: 'Service clubs, professional associations, interest groups',
                    businesses: 'Corporate partnerships, sponsor relationships, cross-promotion'
                },
                events: {
                    educational_workshops: 'Pre-show talks, masterclasses, community education',
                    fundraising_events: 'Galas, benefit performances, donor cultivation',
                    community_festivals: 'Arts festivals, cultural celebrations, public events',
                    accessibility_programs: 'Sensory-friendly performances, audio description, sign language'
                }
            }
        };
        
        // Content strategy and creation
        this.contentStrategy = {
            content_types: {
                behind_the_scenes: {
                    rehearsal_footage: 'Process documentation, artist interviews, creative insights',
                    production_diaries: 'Director blogs, cast journals, creative team updates',
                    technical_showcases: 'Set building, costume creation, technical innovation'
                },
                educational_content: {
                    production_guides: 'Historical context, thematic analysis, artistic interpretation',
                    artist_spotlights: 'Actor interviews, designer features, creative team profiles',
                    theater_education: 'How theater works, industry insights, skill development'
                },
                promotional_content: {
                    trailers: 'Show highlights, mood pieces, excitement generation',
                    testimonials: 'Audience reviews, industry endorsements, critical acclaim',
                    event_announcements: 'Show openings, special events, milestone celebrations'
                }
            },
            content_calendar: {
                pre_production: 'Anticipation building, season announcements, early bird campaigns',
                rehearsal_period: 'Behind-scenes content, artist features, process documentation',
                opening_approach: 'Excitement building, final preparations, opening night focus',
                run_period: 'Performance highlights, audience reactions, review sharing',
                post_show: 'Celebration, thank you, next season teasers'
            }
        };
        
        // Budget management and ROI tracking
        this.budgetFramework = {
            budget_allocation: {
                digital_marketing: 0.40, // Modern audience reach
                traditional_marketing: 0.25, // Established audience maintenance
                community_outreach: 0.20, // Long-term audience development
                content_creation: 0.10, // Supporting materials
                analytics_tools: 0.05  // Performance measurement
            },
            roi_metrics: {
                ticket_sales: 'Direct revenue attribution to marketing channels',
                audience_growth: 'New audience acquisition and retention rates',
                engagement_metrics: 'Social media engagement, email open rates, website traffic',
                brand_awareness: 'Audience surveys, social media mentions, media coverage',
                lifetime_value: 'Long-term audience relationship development'
            }
        };
        
        // Campaign planning and execution
        this.campaignFramework = {
            campaign_phases: {
                awareness: {
                    objectives: 'Introduce production, build anticipation, expand reach',
                    tactics: 'Broad advertising, social media campaigns, PR outreach',
                    timeline: '8-12 weeks before opening',
                    metrics: 'Reach, impressions, brand awareness'
                },
                consideration: {
                    objectives: 'Provide detailed information, build interest, address objections',
                    tactics: 'Content marketing, educational materials, targeted advertising',
                    timeline: '4-8 weeks before opening',
                    metrics: 'Engagement, website visits, inquiry volume'
                },
                conversion: {
                    objectives: 'Drive ticket sales, create urgency, facilitate purchase',
                    tactics: 'Sales promotions, retargeting, direct response marketing',
                    timeline: '0-4 weeks before opening',
                    metrics: 'Conversion rates, ticket sales, revenue'
                },
                retention: {
                    objectives: 'Maintain relationships, encourage future attendance, build loyalty',
                    tactics: 'Post-show engagement, season subscription offers, community building',
                    timeline: 'After show opening',
                    metrics: 'Retention rates, repeat attendance, subscription renewals'
                }
            }
        };
        
        // Performance tracking and analytics
        this.analyticsFramework = {
            key_performance_indicators: {
                audience_metrics: {
                    total_attendance: 'Overall audience size and capacity utilization',
                    new_vs_returning: 'Audience acquisition vs retention balance',
                    demographic_breakdown: 'Age, location, and other demographic analysis',
                    satisfaction_scores: 'Post-show surveys and feedback analysis'
                },
                marketing_metrics: {
                    campaign_reach: 'Total audience exposure across all channels',
                    engagement_rates: 'Social media, email, and content engagement',
                    conversion_funnel: 'Awareness to ticket purchase progression',
                    cost_per_acquisition: 'Marketing spend per new audience member'
                },
                financial_metrics: {
                    revenue_attribution: 'Sales attributed to specific marketing channels',
                    return_on_investment: 'Marketing spend vs revenue generated',
                    lifetime_value: 'Long-term audience relationship value',
                    budget_efficiency: 'Cost-effective channel identification'
                }
            }
        };
        
        // Integration with production system
        this.executiveProducer = null;
        this.creativeDirector = null;
        this.technicalDirector = null;
        this.currentProduction = null;
        
        console.log('📈 Marketing Director Agent: Ready to build audiences and engage communities');
    }

    /**
     * Initialize Marketing Director with system integration
     */
    async onInitialize() {
        try {
            console.log('📈 Marketing Director: Initializing marketing and audience development systems...');
            
            // Connect to Ollama interface for AI marketing strategy
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI marketing requires LLM assistance.');
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
            
            // Configure AI for marketing strategy
            this.ollamaInterface.updatePerformanceContext({
                role: 'marketing_director',
                marketing_approach: this.marketingApproach,
                creativity_mode: 'audience_engagement',
                specialization: 'theater_marketing'
            });
            
            // Connect to related agents
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('📈 Marketing Director: Connected to Executive Producer');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('📈 Marketing Director: Connected to Creative Director');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('📈 Marketing Director: Connected to Technical Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize marketing systems
            await this.initializeMarketingSystems();
            
            // Test marketing capabilities
            await this.testMarketingCapabilities();
            
            console.log('📈 Marketing Director: Ready to build audiences and engage communities!')
            
        } catch (error) {
            console.error('📈 Marketing Director: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI MARKETING:
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
     * Subscribe to production events for marketing
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('production:milestone', (data) => this.onProductionMilestone(data));
            window.theaterEventBus.subscribe('marketing:campaign-request', (data) => this.onCampaignRequest(data));
            window.theaterEventBus.subscribe('marketing:content-needed', (data) => this.onContentNeeded(data));
            window.theaterEventBus.subscribe('audience:feedback-received', (data) => this.onAudienceFeedback(data));
            window.theaterEventBus.subscribe('box-office:sales-update', (data) => this.onSalesUpdate(data));
            
            console.log('📈 Marketing Director: Subscribed to marketing and audience events');
        }
    }

    /**
     * Initialize marketing systems
     */
    async initializeMarketingSystems() {
        console.log('📈 Marketing Director: Initializing marketing systems...');
        
        // Initialize audience analysis tools
        this.initializeAudienceAnalysisTools();
        
        // Initialize campaign management tools
        this.initializeCampaignManagementTools();
        
        // Initialize content creation tools
        this.initializeContentCreationTools();
        
        // Initialize analytics tracking
        this.initializeAnalyticsTracking();
        
        console.log('✅ Marketing Director: Marketing systems initialized');
    }

    /**
     * Initialize audience analysis tools
     */
    initializeAudienceAnalysisTools() {
        this.audienceTools = {
            segmentAnalyzer: (demographics, behavior) => this.analyzeAudienceSegments(demographics, behavior),
            personaGenerator: (segment) => this.generateAudiencePersona(segment),
            preferenceMatcher: (audience, production) => this.matchAudiencePreferences(audience, production),
            behaviorPredictor: (history) => this.predictAudienceBehavior(history)
        };
        
        console.log('📈 Marketing Director: Audience analysis tools initialized');
    }

    /**
     * Initialize campaign management tools
     */
    initializeCampaignManagementTools() {
        this.campaignTools = {
            strategyPlanner: (production, audience) => this.planCampaignStrategy(production, audience),
            channelOptimizer: (budget, audience) => this.optimizeChannelMix(budget, audience),
            contentCalendar: (timeline, milestones) => this.createContentCalendar(timeline, milestones),
            performanceTracker: (campaign) => this.trackCampaignPerformance(campaign)
        };
        
        console.log('📈 Marketing Director: Campaign management tools initialized');
    }

    /**
     * Initialize content creation tools
     */
    initializeContentCreationTools() {
        this.contentTools = {
            messageGenerator: (audience, production) => this.generateMarketingMessages(audience, production),
            visualPlanner: (brand, production) => this.planVisualContent(brand, production),
            copyWriter: (platform, audience) => this.createMarketingCopy(platform, audience),
            assetManager: () => this.manageMarketingAssets()
        };
        
        console.log('📈 Marketing Director: Content creation tools initialized');
    }

    /**
     * Initialize analytics tracking
     */
    initializeAnalyticsTracking() {
        this.analyticsTools = {
            performanceMonitor: new Map(),
            roiCalculator: new Map(),
            audienceTracker: new Map(),
            campaignAnalyzer: new Map()
        };
        
        console.log('📈 Marketing Director: Analytics tracking initialized');
    }

    /**
     * Test marketing capabilities
     */
    async testMarketingCapabilities() {
        try {
            const testPrompt = `
            As a marketing director, develop a comprehensive marketing strategy for a theatrical production.
            
            Marketing scenario:
            - Production: Contemporary adaptation of a classic play
            - Venue: 300-seat theater in mid-size city
            - Budget: Moderate marketing budget ($15,000)
            - Timeline: 10 weeks from announcement to opening
            - Goal: 85% capacity, new audience development, community engagement
            
            Provide:
            1. Audience analysis and target segmentation
            2. Marketing strategy and positioning approach
            3. Multi-channel campaign plan and timeline
            4. Content strategy and key messaging
            5. Budget allocation and channel optimization
            6. Community engagement and partnership opportunities
            7. Performance metrics and success measurements
            8. Risk mitigation and contingency planning
            
            Format as comprehensive marketing strategy document.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('📈 Marketing Director: Marketing capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('📈 Marketing Director: Marketing capability test failed:', error);
            throw new Error(`Marketing test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('📈 Marketing Director: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize marketing project
        await this.initializeMarketingProject(data.production);
        
        // Develop marketing strategy
        await this.developMarketingStrategy(data.production);
    }

    /**
     * Initialize marketing project
     */
    async initializeMarketingProject(production) {
        console.log('📈 Marketing Director: Initializing marketing project...');
        
        this.marketingProject = {
            production: production,
            marketingStrategy: null,
            audienceProfiles: new Map(),
            campaigns: new Map(),
            contentLibrary: new Map(),
            performanceMetrics: new Map(),
            status: 'strategy_development',
            createdAt: new Date()
        };
        
        // Set up budget tracking
        await this.setupMarketingBudget(production);
        
        console.log('✅ Marketing Director: Marketing project initialized');
    }

    /**
     * Develop marketing strategy for production
     */
    async developMarketingStrategy(production) {
        try {
            console.log('📈 Marketing Director: Developing marketing strategy...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const strategyPrompt = `
                Develop a comprehensive marketing strategy for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Target audience identification and segmentation
                2. Market positioning and competitive differentiation
                3. Brand messaging and value proposition
                4. Multi-channel marketing approach and channel selection
                5. Content strategy and creative direction
                6. Community engagement and partnership opportunities
                7. Budget allocation and resource optimization
                8. Timeline and campaign phasing
                9. Performance measurement and success metrics
                10. Risk assessment and contingency planning
                
                Provide a detailed marketing strategy that builds audiences, engages communities, and drives attendance while respecting artistic integrity.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(strategyPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.marketingProject.marketingStrategy = response.content;
                    this.marketingProject.status = 'strategy_complete';
                    
                    console.log('✅ Marketing Director: Marketing strategy developed');
                    
                    // Extract audience segments from strategy
                    await this.extractAudienceSegments(response.content);
                    
                    // Begin campaign planning
                    await this.beginCampaignPlanning(production, response.content);
                    
                    // Share strategy with production team
                    window.theaterEventBus?.publish('marketing:strategy-complete', {
                        production: production,
                        strategy: response.content,
                        marketingDirector: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Marketing Director: Strategy development failed:', error.message);
            this.marketingProject.status = 'strategy_error';
        }
    }

    /**
     * Handle production milestones
     */
    async onProductionMilestone(data) {
        console.log('📈 Marketing Director: Production milestone reached -', data.milestone);
        
        if (data.production.id === this.currentProduction?.id) {
            await this.adjustMarketingForMilestone(data.milestone, data.details);
        }
    }

    /**
     * Handle campaign requests
     */
    async onCampaignRequest(data) {
        console.log('📈 Marketing Director: Campaign requested -', data.campaignType);
        
        await this.createMarketingCampaign(data.campaignType, data.objectives, data.timeline);
    }

    /**
     * Handle content creation requests
     */
    async onContentNeeded(data) {
        console.log('📈 Marketing Director: Content needed -', data.contentType);
        
        await this.createMarketingContent(data.contentType, data.platform, data.deadline);
    }

    /**
     * Handle audience feedback
     */
    async onAudienceFeedback(data) {
        console.log('📈 Marketing Director: Audience feedback received');
        
        await this.analyzeAudienceFeedback(data.feedback, data.source, data.sentiment);
    }

    /**
     * Handle sales updates
     */
    async onSalesUpdate(data) {
        console.log('📈 Marketing Director: Sales update received');
        
        await this.analyzeSalesPerformance(data.sales, data.trends, data.projections);
    }

    /**
     * Extract audience segments from strategy
     */
    async extractAudienceSegments(strategy) {
        // Simplified extraction - would use AI parsing in practice
        return {
            primary: 'Cultural enthusiasts and regular theatergoers',
            secondary: 'Community supporters and entertainment seekers',
            emerging: 'Young adults and first-time attendees'
        };
    }

    /**
     * Setup marketing budget tracking
     */
    async setupMarketingBudget(production) {
        const totalBudget = production.budget?.marketing || 15000;
        
        this.marketingBudget = {
            total: totalBudget,
            allocated: totalBudget * 0.8, // Reserve 20% for opportunities
            spent: 0,
            distribution: {
                digital: totalBudget * this.budgetFramework.budget_allocation.digital_marketing,
                traditional: totalBudget * this.budgetFramework.budget_allocation.traditional_marketing,
                community: totalBudget * this.budgetFramework.budget_allocation.community_outreach,
                content: totalBudget * this.budgetFramework.budget_allocation.content_creation,
                analytics: totalBudget * this.budgetFramework.budget_allocation.analytics_tools
            }
        };
        
        console.log('💰 Marketing Director: Budget tracking initialized');
    }

    /**
     * Get marketing director status
     */
    getMarketingDirectorStatus() {
        return {
            currentProject: {
                active: !!this.marketingProject.production,
                title: this.marketingProject.production?.title,
                status: this.marketingProject.status,
                strategyComplete: !!this.marketingProject.marketingStrategy,
                campaignsActive: this.marketingProject.campaigns.size
            },
            marketing: {
                audienceProfiles: this.marketingProject.audienceProfiles.size,
                campaigns: this.marketingProject.campaigns.size,
                contentAssets: this.marketingProject.contentLibrary.size,
                performanceMetrics: this.marketingProject.performanceMetrics.size
            },
            budget: {
                total: this.marketingBudget?.total || 0,
                spent: this.marketingBudget?.spent || 0,
                remaining: this.calculateRemainingBudget(),
                utilization: this.calculateBudgetUtilization()
            },
            capabilities: this.marketingCapabilities,
            channels: {
                digitalChannels: Object.keys(this.marketingChannels.digital_channels).length,
                traditionalChannels: Object.keys(this.marketingChannels.traditional_channels).length,
                outreachPrograms: Object.keys(this.marketingChannels.community_outreach).length
            }
        };
    }

    /**
     * Calculate remaining budget
     */
    calculateRemainingBudget() {
        if (!this.marketingBudget) return 0;
        return this.marketingBudget.total - this.marketingBudget.spent;
    }

    /**
     * Calculate budget utilization
     */
    calculateBudgetUtilization() {
        if (!this.marketingBudget || this.marketingBudget.total === 0) return 0;
        return (this.marketingBudget.spent / this.marketingBudget.total) * 100;
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('📈 Marketing Director: Concluding marketing session...');
        
        // Finalize marketing project
        if (this.marketingProject.status !== 'idle') {
            this.marketingProject.status = 'completed';
            this.marketingProject.completedAt = new Date();
        }
        
        // Generate marketing summary
        if (this.currentProduction) {
            const marketingSummary = this.generateMarketingSummary();
            console.log('📈 Marketing Director: Marketing summary generated');
        }
        
        console.log('📈 Marketing Director: Audience engagement and promotion concluded');
    }

    /**
     * Generate marketing summary
     */
    generateMarketingSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            strategy: {
                strategyDeveloped: !!this.marketingProject.marketingStrategy,
                audienceProfilesCreated: this.marketingProject.audienceProfiles.size,
                campaignsExecuted: this.marketingProject.campaigns.size,
                contentAssetsProduced: this.marketingProject.contentLibrary.size
            },
            performance: {
                budgetUtilization: this.calculateBudgetUtilization(),
                campaignReach: this.calculateCampaignReach(),
                audienceEngagement: this.calculateAudienceEngagement(),
                conversionRates: this.calculateConversionRates()
            },
            collaboration: {
                executiveProducerAlignment: !!this.executiveProducer,
                creativeDirectorIntegration: !!this.creativeDirector,
                technicalDirectorCoordination: !!this.technicalDirector
            }
        };
    }

    /**
     * Calculate campaign reach
     */
    calculateCampaignReach() {
        return Array.from(this.marketingProject.campaigns.values())
            .reduce((total, campaign) => total + (campaign.reach || 0), 0);
    }

    /**
     * Calculate audience engagement
     */
    calculateAudienceEngagement() {
        const metrics = Array.from(this.marketingProject.performanceMetrics.values());
        return metrics.length > 0 
            ? metrics.reduce((sum, metric) => sum + (metric.engagement || 0), 0) / metrics.length
            : 0;
    }

    /**
     * Calculate conversion rates
     */
    calculateConversionRates() {
        const campaigns = Array.from(this.marketingProject.campaigns.values());
        return campaigns.length > 0
            ? campaigns.reduce((sum, campaign) => sum + (campaign.conversionRate || 0), 0) / campaigns.length
            : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketingDirectorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.MarketingDirectorAgent = MarketingDirectorAgent;
    console.log('📈 Marketing Director Agent loaded - Ready to build audiences and engage communities');
}