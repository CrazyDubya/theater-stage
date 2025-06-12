/**
 * ContextualDirector.js - Intelligent Performance State Analysis & Optimization
 * 
 * Advanced AI director that continuously analyzes performance state and suggests improvements.
 * Understands theatrical principles, audience psychology, and dramatic structure.
 * 
 * Features:
 * - Real-time performance state analysis
 * - Intelligent improvement suggestions
 * - Audience engagement optimization
 * - Dynamic pacing adjustment
 * - Visual composition analysis
 * - Dramatic timing optimization
 */

class ContextualDirector {
    constructor(ollamaInterface, theaterAPI) {
        this.ollamaInterface = ollamaInterface;
        this.theaterAPI = theaterAPI;
        this.isInitialized = false;
        
        // Performance analysis state
        this.performanceState = {
            currentAnalysis: null,
            lastAnalysisTime: 0,
            analysisHistory: [],
            improvementsSuggested: 0,
            improvementsImplemented: 0
        };
        
        // Analysis modules
        this.analysisModules = {
            visualComposition: new VisualCompositionAnalyzer(),
            pacingAnalyzer: new PerformancePacingAnalyzer(),
            audienceEngagement: new AudienceEngagementPredictor(),
            dramaticStructure: new DramaticStructureAnalyzer(),
            characterDynamics: new CharacterDynamicsAnalyzer()
        };
        
        // Performance metrics tracking
        this.metrics = {
            analysisCount: 0,
            avgAnalysisTime: 0,
            suggestionAccuracy: 0,
            performanceImprovement: 0,
            audienceEngagementTrend: []
        };
        
        // Analysis frequency and timing
        this.analysisConfig = {
            intervalMs: 15000, // Analyze every 15 seconds
            minInterval: 5000,  // Minimum 5 seconds between analyses
            triggerEvents: [
                'actor:moved',
                'lighting:changed', 
                'formation:completed',
                'audience:input'
            ]
        };
        
        console.log('🎭 ContextualDirector: Intelligent performance analysis system ready');
    }

    /**
     * Initialize contextual director with AI analysis capabilities
     */
    async initialize() {
        if (this.isInitialized) return true;

        try {
            if (!this.ollamaInterface || !this.ollamaInterface.isConnected) {
                throw new Error('OllamaInterface required and must be connected');
            }

            if (!this.theaterAPI) {
                throw new Error('TheaterAPI required for state analysis');
            }

            // Initialize analysis modules
            await this.initializeAnalysisModules();
            
            // Test analysis capabilities
            await this.testAnalysisCapabilities();
            
            // Start continuous analysis loop
            this.startContinuousAnalysis();
            
            this.isInitialized = true;
            console.log('🎭 ContextualDirector: Initialized with AI performance analysis');
            return true;

        } catch (error) {
            console.error('🎭 ContextualDirector initialization failed:', error);
            return false;
        }
    }

    /**
     * Initialize all analysis modules
     */
    async initializeAnalysisModules() {
        for (const [name, module] of Object.entries(this.analysisModules)) {
            if (module.initialize) {
                await module.initialize();
                console.log(`🎭 Analysis module initialized: ${name}`);
            }
        }
    }

    /**
     * Test basic analysis capabilities
     */
    async testAnalysisCapabilities() {
        try {
            // Get current state for testing
            const testState = await this.theaterAPI.get('/api/state');
            
            // Run a quick analysis
            const testAnalysis = await this.analyzePerformanceState(testState.data, { 
                testMode: true,
                maxTokens: 200 
            });
            
            console.log('🎭 Contextual analysis test successful');
            return testAnalysis;

        } catch (error) {
            console.error('🎭 Analysis test failed:', error);
            throw error;
        }
    }

    /**
     * Comprehensive performance state analysis
     */
    async analyzePerformanceState(currentState = null, options = {}) {
        const startTime = Date.now();
        
        try {
            // Get current state if not provided
            if (!currentState) {
                const stateResponse = await this.theaterAPI.get('/api/state');
                currentState = stateResponse.data;
            }

            console.log('🎭 Analyzing performance state...');

            // Run modular analysis
            const moduleAnalyses = await this.runModularAnalysis(currentState);
            
            // Generate comprehensive AI analysis
            const aiAnalysis = await this.generateAIAnalysis(currentState, moduleAnalyses, options);
            
            // Compile complete analysis
            const completeAnalysis = {
                timestamp: Date.now(),
                currentState: currentState,
                moduleAnalyses: moduleAnalyses,
                aiInsights: aiAnalysis,
                suggestions: await this.generateImprovementSuggestions(currentState, moduleAnalyses, aiAnalysis),
                metrics: this.calculatePerformanceMetrics(currentState, moduleAnalyses),
                analysisTime: Date.now() - startTime
            };

            // Update tracking
            this.updateAnalysisTracking(completeAnalysis);
            
            console.log(`🎭 Performance analysis completed in ${completeAnalysis.analysisTime}ms`);
            return completeAnalysis;

        } catch (error) {
            console.error('🎭 Performance analysis failed:', error);
            return null;
        }
    }

    /**
     * Run all analysis modules on current state
     */
    async runModularAnalysis(currentState) {
        const analyses = {};
        
        try {
            // Visual composition analysis
            analyses.visualComposition = this.analysisModules.visualComposition.analyze(currentState);
            
            // Pacing analysis
            analyses.pacing = this.analysisModules.pacingAnalyzer.analyze(currentState);
            
            // Audience engagement prediction
            analyses.audienceEngagement = this.analysisModules.audienceEngagement.predict(currentState);
            
            // Dramatic structure analysis
            analyses.dramaticStructure = this.analysisModules.dramaticStructure.analyze(currentState);
            
            // Character dynamics analysis
            analyses.characterDynamics = this.analysisModules.characterDynamics.analyze(currentState);
            
            return analyses;

        } catch (error) {
            console.error('🎭 Modular analysis failed:', error);
            return {};
        }
    }

    /**
     * Generate AI-powered analysis of performance state
     */
    async generateAIAnalysis(currentState, moduleAnalyses, options = {}) {
        const analysisPrompt = this.buildAnalysisPrompt(currentState, moduleAnalyses, options);
        
        try {
            const aiResponse = await this.ollamaInterface.generatePerformance(analysisPrompt, {
                temperature: 0.6, // Balanced creativity for analysis
                max_tokens: options.maxTokens || 500,
                stream: false // We want complete analysis
            });

            return {
                content: aiResponse.content || '',
                insights: this.extractInsights(aiResponse.content),
                recommendations: this.extractRecommendations(aiResponse.content),
                urgency: this.assessUrgency(aiResponse.content),
                confidence: this.assessConfidence(aiResponse.content)
            };

        } catch (error) {
            console.error('🎭 AI analysis generation failed:', error);
            return { content: '', insights: [], recommendations: [], urgency: 'low', confidence: 0.5 };
        }
    }

    /**
     * Build comprehensive analysis prompt for AI
     */
    buildAnalysisPrompt(currentState, moduleAnalyses, options) {
        const actors = currentState.actors || [];
        const stage = currentState.stage || {};
        
        return `
**THEATER PERFORMANCE ANALYSIS**

**CURRENT PERFORMANCE STATE**:
- Actors on stage: ${actors.length}
- Stage lighting: ${stage.lighting || 'normal'}
- Camera view: ${stage.camera || 'audience'}
- Curtains: ${stage.curtains || 'open'}

**ACTOR POSITIONS**:
${actors.map(actor => `- ${actor.id}: (${actor.position.x.toFixed(1)}, ${actor.position.z.toFixed(1)})`).join('\n')}

**AUTOMATED ANALYSIS RESULTS**:
- Visual Composition: ${moduleAnalyses.visualComposition?.score || 0}/10 (${moduleAnalyses.visualComposition?.description || 'No data'})
- Pacing Quality: ${moduleAnalyses.pacing?.score || 0}/10 (${moduleAnalyses.pacing?.description || 'No data'})
- Predicted Engagement: ${Math.round((moduleAnalyses.audienceEngagement?.score || 0.5) * 100)}%
- Dramatic Structure: ${moduleAnalyses.dramaticStructure?.phase || 'Unknown'} phase
- Character Dynamics: ${moduleAnalyses.characterDynamics?.quality || 'undefined'}

**ANALYSIS REQUEST**:
As an expert theater director and performance analyst, provide a comprehensive evaluation:

1. **VISUAL ASSESSMENT**: 
   - Are actors positioned for maximum dramatic impact?
   - Does the stage composition create visual interest?
   - Is there good use of stage space and levels?

2. **DRAMATIC EFFECTIVENESS**:
   - Does the current arrangement support storytelling?
   - Are character relationships clear through positioning?
   - Is there appropriate focus and hierarchy?

3. **AUDIENCE EXPERIENCE**:
   - What would a typical audience member notice first?
   - Are there any confusing or distracting elements?
   - How engaging is the current tableau?

4. **IMPROVEMENT OPPORTUNITIES**:
   - What specific changes would enhance the performance?
   - Which elements need immediate attention?
   - What creative possibilities are being missed?

5. **OVERALL PERFORMANCE HEALTH**:
   - Rate the current performance quality (1-10)
   - Identify the strongest and weakest elements
   - Assess momentum and energy levels

Provide specific, actionable insights that would help improve this performance.
Focus on practical improvements that can be implemented immediately.
${options.testMode ? 'Keep response concise for testing.' : 'Be thorough and detailed.'}
`;
    }

    /**
     * Generate specific improvement suggestions based on analysis
     */
    async generateImprovementSuggestions(currentState, moduleAnalyses, aiAnalysis) {
        const suggestions = [];
        
        try {
            // Visual composition improvements
            if (moduleAnalyses.visualComposition?.score < 6) {
                suggestions.push(...this.generateVisualImprovements(currentState, moduleAnalyses.visualComposition));
            }
            
            // Pacing improvements
            if (moduleAnalyses.pacing?.score < 6) {
                suggestions.push(...this.generatePacingImprovements(currentState, moduleAnalyses.pacing));
            }
            
            // Engagement improvements
            if (moduleAnalyses.audienceEngagement?.score < 0.6) {
                suggestions.push(...this.generateEngagementImprovements(currentState, moduleAnalyses.audienceEngagement));
            }
            
            // AI-suggested improvements
            if (aiAnalysis.recommendations?.length > 0) {
                suggestions.push(...aiAnalysis.recommendations.map(rec => ({
                    type: 'ai_recommendation',
                    priority: this.assessRecommendationPriority(rec),
                    description: rec,
                    implementation: 'ai_directed'
                })));
            }
            
            return suggestions.sort((a, b) => b.priority - a.priority);

        } catch (error) {
            console.error('🎭 Improvement suggestion generation failed:', error);
            return [];
        }
    }

    /**
     * Generate visual composition improvements
     */
    generateVisualImprovements(currentState, visualAnalysis) {
        const improvements = [];
        const actors = currentState.actors || [];
        
        if (actors.length === 0) {
            improvements.push({
                type: 'visual_composition',
                priority: 8,
                description: 'Add actors to create visual interest',
                implementation: 'create_actors'
            });
        } else if (this.areActorsClumped(actors)) {
            improvements.push({
                type: 'visual_composition',
                priority: 7,
                description: 'Spread actors for better visual balance',
                implementation: 'formation_change'
            });
        } else if (this.areActorsScattered(actors)) {
            improvements.push({
                type: 'visual_composition',
                priority: 6,
                description: 'Create more focused groupings',
                implementation: 'formation_change'
            });
        }
        
        return improvements;
    }

    /**
     * Generate pacing improvements
     */
    generatePacingImprovements(currentState, pacingAnalysis) {
        const improvements = [];
        
        if (pacingAnalysis?.energy === 'low') {
            improvements.push({
                type: 'pacing',
                priority: 7,
                description: 'Increase energy with dynamic movement or lighting change',
                implementation: 'energy_boost'
            });
        } else if (pacingAnalysis?.energy === 'static') {
            improvements.push({
                type: 'pacing', 
                priority: 6,
                description: 'Add movement or formation change to break stasis',
                implementation: 'movement_injection'
            });
        }
        
        return improvements;
    }

    /**
     * Generate audience engagement improvements
     */
    generateEngagementImprovements(currentState, engagementAnalysis) {
        const improvements = [];
        
        if (engagementAnalysis?.factors?.includes('monotonous_lighting')) {
            improvements.push({
                type: 'engagement',
                priority: 6,
                description: 'Change lighting to create mood variation',
                implementation: 'lighting_change'
            });
        }
        
        if (engagementAnalysis?.factors?.includes('static_camera')) {
            improvements.push({
                type: 'engagement',
                priority: 5,
                description: 'Adjust camera angle for fresh perspective',
                implementation: 'camera_change'
            });
        }
        
        return improvements;
    }

    /**
     * Implement suggested improvements via AI direction
     */
    async implementSuggestions(suggestions, options = {}) {
        const maxSuggestions = options.maxSuggestions || 3;
        const implementationResults = [];
        
        try {
            // Select top suggestions to implement
            const topSuggestions = suggestions.slice(0, maxSuggestions);
            
            for (const suggestion of topSuggestions) {
                const result = await this.implementSuggestion(suggestion);
                implementationResults.push(result);
                
                // Brief pause between implementations
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log(`🎭 Implemented ${implementationResults.filter(r => r.success).length}/${topSuggestions.length} suggestions`);
            return implementationResults;

        } catch (error) {
            console.error('🎭 Suggestion implementation failed:', error);
            return implementationResults;
        }
    }

    /**
     * Implement a specific suggestion
     */
    async implementSuggestion(suggestion) {
        try {
            console.log(`🎭 Implementing: ${suggestion.description}`);
            
            const implementationPrompt = `
            IMPLEMENT PERFORMANCE IMPROVEMENT:
            
            Suggestion: ${suggestion.description}
            Type: ${suggestion.type}
            Priority: ${suggestion.priority}/10
            
            Use function calls to implement this improvement immediately.
            Be specific and decisive in your actions.
            `;
            
            const result = await this.ollamaInterface.generatePerformance(implementationPrompt, {
                stream: true,
                temperature: 0.7,
                max_tokens: 200
            });
            
            this.performanceState.improvementsImplemented++;
            
            return {
                success: true,
                suggestion: suggestion,
                result: result,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error(`🎭 Failed to implement suggestion: ${suggestion.description}`, error);
            return {
                success: false,
                suggestion: suggestion,
                error: error.message,
                timestamp: Date.now()
            };
        }
    }

    /**
     * Start continuous performance analysis
     */
    startContinuousAnalysis() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
        
        this.analysisInterval = setInterval(async () => {
            try {
                await this.runScheduledAnalysis();
            } catch (error) {
                console.error('🎭 Scheduled analysis failed:', error);
            }
        }, this.analysisConfig.intervalMs);
        
        console.log(`🎭 Started continuous analysis (${this.analysisConfig.intervalMs / 1000}s intervals)`);
    }

    /**
     * Run scheduled analysis with optimization suggestions
     */
    async runScheduledAnalysis() {
        const now = Date.now();
        
        // Check minimum interval
        if (now - this.performanceState.lastAnalysisTime < this.analysisConfig.minInterval) {
            return;
        }
        
        try {
            // Analyze current performance
            const analysis = await this.analyzePerformanceState();
            
            if (analysis && analysis.suggestions.length > 0) {
                // Implement high-priority suggestions automatically
                const urgentSuggestions = analysis.suggestions.filter(s => s.priority >= 8);
                
                if (urgentSuggestions.length > 0) {
                    console.log(`🎭 Implementing ${urgentSuggestions.length} urgent improvements`);
                    await this.implementSuggestions(urgentSuggestions, { maxSuggestions: 2 });
                }
            }
            
            this.performanceState.lastAnalysisTime = now;

        } catch (error) {
            console.error('🎭 Scheduled analysis error:', error);
        }
    }

    /**
     * Handle performance events for contextual analysis
     */
    async handlePerformanceEvent(event, data) {
        if (!this.analysisConfig.triggerEvents.includes(event)) {
            return;
        }
        
        try {
            console.log(`🎭 Event-triggered analysis: ${event}`);
            
            // Quick analysis focused on the event
            const eventAnalysis = await this.analyzePerformanceState(null, {
                eventContext: { event, data },
                maxTokens: 300
            });
            
            if (eventAnalysis?.suggestions?.length > 0) {
                // Implement most relevant suggestion
                const relevantSuggestion = eventAnalysis.suggestions[0];
                await this.implementSuggestion(relevantSuggestion);
            }

        } catch (error) {
            console.error(`🎭 Event analysis failed for ${event}:`, error);
        }
    }

    /**
     * Stop continuous analysis
     */
    stopContinuousAnalysis() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
            this.analysisInterval = null;
            console.log('🎭 Stopped continuous analysis');
        }
    }

    /**
     * Utility methods for analysis
     */
    areActorsClumped(actors) {
        if (actors.length < 2) return false;
        
        const distances = [];
        for (let i = 0; i < actors.length - 1; i++) {
            for (let j = i + 1; j < actors.length; j++) {
                const dist = Math.sqrt(
                    (actors[i].position.x - actors[j].position.x) ** 2 +
                    (actors[i].position.z - actors[j].position.z) ** 2
                );
                distances.push(dist);
            }
        }
        
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        return avgDistance < 2; // Too close together
    }

    areActorsScattered(actors) {
        if (actors.length < 2) return false;
        
        const distances = [];
        for (let i = 0; i < actors.length - 1; i++) {
            for (let j = i + 1; j < actors.length; j++) {
                const dist = Math.sqrt(
                    (actors[i].position.x - actors[j].position.x) ** 2 +
                    (actors[i].position.z - actors[j].position.z) ** 2
                );
                distances.push(dist);
            }
        }
        
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        return avgDistance > 8; // Too spread out
    }

    extractInsights(content) {
        // Simple insight extraction - could be enhanced with NLP
        const insights = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            if (line.includes('insight:') || line.includes('observation:')) {
                insights.push(line.replace(/^.*insight:\s*|^.*observation:\s*/i, '').trim());
            }
        }
        
        return insights;
    }

    extractRecommendations(content) {
        const recommendations = [];
        const lines = content.split('\n');
        
        for (const line of lines) {
            if (line.includes('recommend') || line.includes('suggest') || line.includes('should')) {
                recommendations.push(line.trim());
            }
        }
        
        return recommendations;
    }

    assessUrgency(content) {
        const urgentWords = ['urgent', 'immediate', 'critical', 'important'];
        const lowerContent = content.toLowerCase();
        
        for (const word of urgentWords) {
            if (lowerContent.includes(word)) {
                return 'high';
            }
        }
        
        return 'medium';
    }

    assessConfidence(content) {
        const highConfidenceWords = ['clearly', 'definitely', 'obviously', 'certainly'];
        const lowConfidenceWords = ['might', 'could', 'perhaps', 'possibly'];
        
        const lowerContent = content.toLowerCase();
        
        let confidence = 0.5;
        for (const word of highConfidenceWords) {
            if (lowerContent.includes(word)) confidence += 0.1;
        }
        for (const word of lowConfidenceWords) {
            if (lowerContent.includes(word)) confidence -= 0.1;
        }
        
        return Math.max(0, Math.min(1, confidence));
    }

    assessRecommendationPriority(recommendation) {
        const highPriorityWords = ['critical', 'urgent', 'immediately', 'essential'];
        const mediumPriorityWords = ['should', 'recommend', 'important', 'better'];
        
        const lowerRec = recommendation.toLowerCase();
        
        for (const word of highPriorityWords) {
            if (lowerRec.includes(word)) return 9;
        }
        for (const word of mediumPriorityWords) {
            if (lowerRec.includes(word)) return 6;
        }
        
        return 4;
    }

    calculatePerformanceMetrics(currentState, moduleAnalyses) {
        return {
            overallScore: this.calculateOverallScore(moduleAnalyses),
            visualScore: moduleAnalyses.visualComposition?.score || 5,
            pacingScore: moduleAnalyses.pacing?.score || 5,
            engagementScore: (moduleAnalyses.audienceEngagement?.score || 0.5) * 10,
            dramaticScore: moduleAnalyses.dramaticStructure?.score || 5,
            characterScore: moduleAnalyses.characterDynamics?.score || 5
        };
    }

    calculateOverallScore(moduleAnalyses) {
        const scores = [
            moduleAnalyses.visualComposition?.score || 5,
            moduleAnalyses.pacing?.score || 5,
            (moduleAnalyses.audienceEngagement?.score || 0.5) * 10,
            moduleAnalyses.dramaticStructure?.score || 5,
            moduleAnalyses.characterDynamics?.score || 5
        ];
        
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }

    updateAnalysisTracking(analysis) {
        this.performanceState.currentAnalysis = analysis;
        this.performanceState.analysisHistory.push({
            timestamp: analysis.timestamp,
            overallScore: analysis.metrics.overallScore,
            suggestionsCount: analysis.suggestions.length,
            analysisTime: analysis.analysisTime
        });
        
        // Keep only recent history
        if (this.performanceState.analysisHistory.length > 50) {
            this.performanceState.analysisHistory = this.performanceState.analysisHistory.slice(-30);
        }
        
        // Update metrics
        this.metrics.analysisCount++;
        this.metrics.avgAnalysisTime = (this.metrics.avgAnalysisTime * (this.metrics.analysisCount - 1) + analysis.analysisTime) / this.metrics.analysisCount;
        
        this.performanceState.improvementsSuggested += analysis.suggestions.length;
    }

    /**
     * Get contextual director statistics
     */
    getDirectorStats() {
        return {
            isInitialized: this.isInitialized,
            analysisCount: this.metrics.analysisCount,
            avgAnalysisTime: Math.round(this.metrics.avgAnalysisTime),
            improvementsSuggested: this.performanceState.improvementsSuggested,
            improvementsImplemented: this.performanceState.improvementsImplemented,
            implementationRate: this.performanceState.improvementsSuggested > 0 ? 
                (this.performanceState.improvementsImplemented / this.performanceState.improvementsSuggested) * 100 : 0,
            lastAnalysis: this.performanceState.currentAnalysis ? {
                timestamp: this.performanceState.currentAnalysis.timestamp,
                overallScore: this.performanceState.currentAnalysis.metrics.overallScore,
                suggestionCount: this.performanceState.currentAnalysis.suggestions.length
            } : null,
            continuousAnalysis: !!this.analysisInterval
        };
    }
}

// Analysis module classes
class VisualCompositionAnalyzer {
    analyze(state) {
        const actors = state.actors || [];
        if (actors.length === 0) {
            return { score: 3, description: 'No actors for composition analysis' };
        }
        
        // Calculate composition metrics
        const balance = this.calculateBalance(actors);
        const spacing = this.calculateSpacing(actors);
        const focus = this.calculateFocus(actors);
        
        const score = (balance + spacing + focus) / 3;
        
        return {
            score: Math.round(score),
            description: this.getCompositionDescription(score),
            balance,
            spacing,
            focus
        };
    }
    
    calculateBalance(actors) {
        // Check left/right balance
        const leftActors = actors.filter(a => a.position.x < 0).length;
        const rightActors = actors.filter(a => a.position.x > 0).length;
        const centerActors = actors.filter(a => Math.abs(a.position.x) < 1).length;
        
        const totalActors = actors.length;
        const balance = 1 - Math.abs(leftActors - rightActors) / totalActors;
        
        return balance * 10;
    }
    
    calculateSpacing(actors) {
        if (actors.length < 2) return 8;
        
        const distances = [];
        for (let i = 0; i < actors.length - 1; i++) {
            for (let j = i + 1; j < actors.length; j++) {
                const dist = Math.sqrt(
                    (actors[i].position.x - actors[j].position.x) ** 2 +
                    (actors[i].position.z - actors[j].position.z) ** 2
                );
                distances.push(dist);
            }
        }
        
        const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
        
        // Ideal distance is around 3-4 units
        const idealDistance = 3.5;
        const spacingScore = 10 - Math.abs(avgDistance - idealDistance) * 2;
        
        return Math.max(1, Math.min(10, spacingScore));
    }
    
    calculateFocus(actors) {
        // Center stage focus is generally stronger
        const centerMass = this.calculateCenterOfMass(actors);
        const distanceFromCenter = Math.sqrt(centerMass.x ** 2 + centerMass.z ** 2);
        
        const focusScore = 10 - (distanceFromCenter / 5) * 10;
        return Math.max(1, Math.min(10, focusScore));
    }
    
    calculateCenterOfMass(actors) {
        const totalX = actors.reduce((sum, actor) => sum + actor.position.x, 0);
        const totalZ = actors.reduce((sum, actor) => sum + actor.position.z, 0);
        
        return {
            x: totalX / actors.length,
            z: totalZ / actors.length
        };
    }
    
    getCompositionDescription(score) {
        if (score >= 8) return 'Excellent visual composition';
        if (score >= 6) return 'Good visual balance';
        if (score >= 4) return 'Adequate composition';
        return 'Composition needs improvement';
    }
}

class PerformancePacingAnalyzer {
    analyze(state) {
        // Analyze movement, energy, and timing
        const actors = state.actors || [];
        const lighting = state.stage?.lighting || 'normal';
        
        let energyLevel = this.calculateEnergyLevel(actors, lighting);
        let movementVariety = this.calculateMovementVariety(actors);
        
        const score = (energyLevel + movementVariety) / 2;
        
        return {
            score: Math.round(score),
            description: this.getPacingDescription(score),
            energy: this.getEnergyDescription(energyLevel),
            variety: movementVariety
        };
    }
    
    calculateEnergyLevel(actors, lighting) {
        let energy = 5; // Base energy
        
        // Lighting affects energy
        switch (lighting) {
            case 'dramatic': energy += 2; break;
            case 'concert': energy += 3; break;
            case 'spotlight': energy += 1; break;
            case 'evening': energy -= 1; break;
        }
        
        // Number of actors affects energy
        if (actors.length === 0) energy = 2;
        else if (actors.length > 5) energy += 1;
        
        return Math.max(1, Math.min(10, energy));
    }
    
    calculateMovementVariety(actors) {
        // For now, assume variety based on actor spread
        if (actors.length === 0) return 3;
        
        const positions = actors.map(a => ({ x: a.position.x, z: a.position.z }));
        const variance = this.calculatePositionalVariance(positions);
        
        return Math.max(1, Math.min(10, variance * 2));
    }
    
    calculatePositionalVariance(positions) {
        if (positions.length < 2) return 3;
        
        const meanX = positions.reduce((sum, p) => sum + p.x, 0) / positions.length;
        const meanZ = positions.reduce((sum, p) => sum + p.z, 0) / positions.length;
        
        const variance = positions.reduce((sum, p) => {
            return sum + ((p.x - meanX) ** 2 + (p.z - meanZ) ** 2);
        }, 0) / positions.length;
        
        return Math.sqrt(variance);
    }
    
    getPacingDescription(score) {
        if (score >= 8) return 'Dynamic and engaging pacing';
        if (score >= 6) return 'Good pacing variety';
        if (score >= 4) return 'Adequate pacing';
        return 'Pacing needs improvement';
    }
    
    getEnergyDescription(energy) {
        if (energy >= 8) return 'high';
        if (energy >= 6) return 'medium';
        if (energy >= 4) return 'moderate';
        if (energy >= 2) return 'low';
        return 'static';
    }
}

class AudienceEngagementPredictor {
    predict(state) {
        const actors = state.actors || [];
        const lighting = state.stage?.lighting || 'normal';
        
        let engagement = 0.5; // Base engagement
        
        // Factors that increase engagement
        if (actors.length > 0) engagement += 0.1;
        if (actors.length >= 3) engagement += 0.1;
        if (lighting !== 'normal') engagement += 0.1;
        
        // Factors that decrease engagement
        if (actors.length === 0) engagement = 0.2;
        if (this.areActorsStatic(actors)) engagement -= 0.15;
        
        return {
            score: Math.max(0.1, Math.min(1, engagement)),
            factors: this.getEngagementFactors(state),
            prediction: this.getEngagementPrediction(engagement)
        };
    }
    
    areActorsStatic(actors) {
        // Simple heuristic - if all actors are in default positions
        return actors.every(actor => 
            Math.abs(actor.position.x) < 1 && Math.abs(actor.position.z) < 1
        );
    }
    
    getEngagementFactors(state) {
        const factors = [];
        
        if ((state.actors || []).length === 0) factors.push('no_actors');
        if (state.stage?.lighting === 'normal') factors.push('monotonous_lighting');
        if (state.stage?.camera === 'audience') factors.push('static_camera');
        
        return factors;
    }
    
    getEngagementPrediction(engagement) {
        if (engagement >= 0.8) return 'highly_engaging';
        if (engagement >= 0.6) return 'engaging';
        if (engagement >= 0.4) return 'moderately_engaging';
        return 'needs_improvement';
    }
}

class DramaticStructureAnalyzer {
    analyze(state) {
        // Analyze current phase of dramatic structure
        const actors = state.actors || [];
        const complexity = this.calculateComplexity(state);
        
        return {
            phase: this.determinePhase(complexity, actors.length),
            score: Math.min(10, complexity * 2),
            complexity: complexity,
            recommendation: this.getPhaseRecommendation(complexity)
        };
    }
    
    calculateComplexity(state) {
        let complexity = 1;
        
        const actors = state.actors || [];
        if (actors.length > 1) complexity += 1;
        if (actors.length > 3) complexity += 1;
        if (state.stage?.lighting !== 'normal') complexity += 1;
        if (state.stage?.camera !== 'audience') complexity += 1;
        
        return complexity;
    }
    
    determinePhase(complexity, actorCount) {
        if (actorCount === 0) return 'setup';
        if (complexity <= 2) return 'exposition';
        if (complexity <= 3) return 'rising_action';
        if (complexity <= 4) return 'climax';
        return 'resolution';
    }
    
    getPhaseRecommendation(complexity) {
        if (complexity <= 2) return 'Consider adding complexity or conflict';
        if (complexity >= 4) return 'Maintain high energy and focus';
        return 'Good dramatic development';
    }
}

class CharacterDynamicsAnalyzer {
    analyze(state) {
        const actors = state.actors || [];
        
        if (actors.length === 0) {
            return { quality: 'no_characters', score: 2, relationships: [] };
        }
        
        const relationships = this.analyzeRelationships(actors);
        const dynamics = this.analyzeDynamics(relationships);
        
        return {
            quality: this.getQualityDescription(dynamics.score),
            score: dynamics.score,
            relationships: relationships,
            dynamics: dynamics
        };
    }
    
    analyzeRelationships(actors) {
        const relationships = [];
        
        for (let i = 0; i < actors.length - 1; i++) {
            for (let j = i + 1; j < actors.length; j++) {
                const distance = Math.sqrt(
                    (actors[i].position.x - actors[j].position.x) ** 2 +
                    (actors[i].position.z - actors[j].position.z) ** 2
                );
                
                relationships.push({
                    actors: [actors[i].id, actors[j].id],
                    distance: distance,
                    type: this.inferRelationshipType(distance),
                    strength: this.calculateRelationshipStrength(distance)
                });
            }
        }
        
        return relationships;
    }
    
    inferRelationshipType(distance) {
        if (distance < 1.5) return 'intimate';
        if (distance < 3) return 'conversational';
        if (distance < 5) return 'social';
        return 'distant';
    }
    
    calculateRelationshipStrength(distance) {
        return Math.max(0, 1 - (distance / 8));
    }
    
    analyzeDynamics(relationships) {
        if (relationships.length === 0) {
            return { score: 3, description: 'No character interactions' };
        }
        
        const avgStrength = relationships.reduce((sum, rel) => sum + rel.strength, 0) / relationships.length;
        const typeVariety = new Set(relationships.map(rel => rel.type)).size;
        
        const score = (avgStrength * 5 + typeVariety * 2) * 1.2;
        
        return {
            score: Math.min(10, Math.round(score)),
            avgStrength: avgStrength,
            typeVariety: typeVariety,
            description: this.getDynamicsDescription(score)
        };
    }
    
    getQualityDescription(score) {
        if (score >= 8) return 'excellent_dynamics';
        if (score >= 6) return 'good_dynamics';
        if (score >= 4) return 'adequate_dynamics';
        return 'poor_dynamics';
    }
    
    getDynamicsDescription(score) {
        if (score >= 8) return 'Rich character relationships';
        if (score >= 6) return 'Good character interactions';
        if (score >= 4) return 'Basic character dynamics';
        return 'Limited character development';
    }
}

// Export for use in theater system
if (typeof window !== 'undefined') {
    window.ContextualDirector = ContextualDirector;
    window.VisualCompositionAnalyzer = VisualCompositionAnalyzer;
    window.PerformancePacingAnalyzer = PerformancePacingAnalyzer;
    window.AudienceEngagementPredictor = AudienceEngagementPredictor;
    window.DramaticStructureAnalyzer = DramaticStructureAnalyzer;
    window.CharacterDynamicsAnalyzer = CharacterDynamicsAnalyzer;
    console.log('🎭 ContextualDirector loaded - Intelligent performance analysis available');
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        ContextualDirector,
        VisualCompositionAnalyzer,
        PerformancePacingAnalyzer,
        AudienceEngagementPredictor,
        DramaticStructureAnalyzer,
        CharacterDynamicsAnalyzer
    };
}