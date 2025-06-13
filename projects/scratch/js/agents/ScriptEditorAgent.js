/**
 * ScriptEditorAgent.js - Advanced Script Refinement and Quality Assurance
 * 
 * The Script Editor Agent works closely with the AI Playwright to refine, polish,
 * and ensure the quality of theatrical scripts. Provides professional editing
 * services including dialogue enhancement, structure analysis, character consistency,
 * and dramatic pacing optimization.
 * 
 * Features:
 * - Professional script editing and refinement
 * - Dialogue polishing and character voice consistency
 * - Dramatic structure analysis and optimization
 * - Pacing and rhythm enhancement
 * - Format standardization and style guide compliance
 * - Collaborative editing with AI Playwright and Creative Director
 */

class ScriptEditorAgent extends BaseAgent {
    constructor(config = {}) {
        super('script-editor', {
            name: 'Script Editor',
            role: 'script-editor',
            priority: 70, // Medium priority creative support role
            maxActionsPerSecond: 4,
            personality: config.personality || 'meticulous',
            ...config
        });
        
        // Script Editor specific properties
        this.editingStyle = config.editingStyle || 'collaborative';
        this.qualityStandards = config.qualityStandards || 'professional';
        this.specialization = config.specialization || 'general';
        
        // Editing capabilities and focus areas
        this.editingCapabilities = {
            dialogue: {
                naturalness: true,
                characterVoice: true,
                subtext: true,
                speechPatterns: true
            },
            structure: {
                plotDevelopment: true,
                pacing: true,
                transitions: true,
                climaxBuilding: true
            },
            character: {
                consistency: true,
                development: true,
                motivation: true,
                relationships: true
            },
            technical: {
                formatting: true,
                stageDirections: true,
                clarity: true,
                readability: true
            }
        };
        
        // Quality metrics and standards
        this.qualityMetrics = {
            dialogue: {
                naturalness: 0,
                characterDistinction: 0,
                emotionalDepth: 0,
                clarity: 0
            },
            structure: {
                pacing: 0,
                plotCoherence: 0,
                dramaticTension: 0,
                resolution: 0
            },
            technical: {
                formatting: 0,
                readability: 0,
                stageDirections: 0,
                consistency: 0
            },
            overall: 0
        };
        
        // Current editing session
        this.currentEditingSession = {
            script: null,
            version: 1,
            startTime: null,
            changes: [],
            notes: [],
            status: 'idle'
        };
        
        // Editing history and version control
        this.editingHistory = [];
        this.versionHistory = new Map();
        this.changeTracking = {
            additions: 0,
            deletions: 0,
            modifications: 0,
            suggestions: 0
        };
        
        // Style guides and formatting standards
        this.styleGuides = {
            standard: {
                characterNames: 'UPPERCASE',
                stageDirections: '(parentheses)',
                sceneTitles: 'Scene X',
                spacing: 'double',
                margins: 'standard'
            },
            modern: {
                characterNames: 'Bold',
                stageDirections: 'italics',
                sceneTitles: 'SCENE X',
                spacing: 'single',
                margins: 'wide'
            },
            minimalist: {
                characterNames: 'capitalize',
                stageDirections: 'minimal',
                sceneTitles: 'simple',
                spacing: 'compact',
                margins: 'narrow'
            }
        };
        
        // Collaborative editing
        this.collaborationMode = config.collaboration || 'active';
        this.aiPlaywright = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        
        // Editing tools and analysis
        this.analysisTools = {
            readabilityIndex: true,
            characterConsistency: true,
            paceAnalysis: true,
            dialogueRhythm: true,
            emotionalTracking: true
        };
        
        console.log('✏️ Script Editor Agent: Ready to refine and perfect theatrical scripts');
    }

    /**
     * Initialize Script Editor with system integration
     */
    async onInitialize() {
        try {
            console.log('✏️ Script Editor: Initializing script editing systems...');
            
            // Connect to AI Playwright
            if (window.aiPlaywrightAgent) {
                this.aiPlaywright = window.aiPlaywrightAgent;
                console.log('✏️ Script Editor: Connected to AI Playwright');
            }
            
            // Connect to Creative Director
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('✏️ Script Editor: Connected to Creative Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize editing tools
            await this.initializeEditingTools();
            
            // Set up quality assurance standards
            this.setupQualityStandards();
            
            console.log('✏️ Script Editor: Ready for professional script editing!')
            
        } catch (error) {
            console.error('✏️ Script Editor: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Subscribe to production events for script editing coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('script:outline-complete', (data) => this.onScriptOutlineComplete(data));
            window.theaterEventBus.subscribe('script:scene-complete', (data) => this.onSceneComplete(data));
            window.theaterEventBus.subscribe('script:revision-requested', (data) => this.onRevisionRequested(data));
            window.theaterEventBus.subscribe('creative:vision-established', (data) => this.onArtisticVisionReceived(data));
            window.theaterEventBus.subscribe('creative:priority-focus', (data) => this.onPriorityFocus(data));
            
            console.log('✏️ Script Editor: Subscribed to script editing events');
        }
    }

    /**
     * Initialize editing tools and analysis systems
     */
    async initializeEditingTools() {
        console.log('✏️ Script Editor: Initializing editing tools...');
        
        // Initialize dialogue analysis
        this.dialogueAnalyzer = {
            patterns: new Map(),
            vocabulary: new Map(),
            speechRhythms: new Map(),
            characterVoices: new Map()
        };
        
        // Initialize structure analyzer
        this.structureAnalyzer = {
            beats: [],
            pacing: [],
            tension: [],
            transitions: []
        };
        
        // Initialize readability tools
        this.readabilityTools = {
            sentenceLength: true,
            vocabularyComplexity: true,
            dialogueClarity: true,
            stageDirectionClarity: true
        };
        
        console.log('✅ Script Editor: Editing tools initialized');
    }

    /**
     * Set up quality assurance standards
     */
    setupQualityStandards() {
        this.qualityStandards = {
            minimum_scores: {
                dialogue_naturalness: 7,
                character_consistency: 8,
                plot_coherence: 8,
                technical_formatting: 9
            },
            review_checkpoints: {
                scene_completion: true,
                act_completion: true,
                full_script: true,
                revision_cycles: true
            },
            approval_workflow: {
                self_review: true,
                peer_review: true,
                director_approval: true,
                final_polish: true
            }
        };
        
        console.log('📋 Script Editor: Quality standards established');
    }

    /**
     * Handle script outline completion
     */
    async onScriptOutlineComplete(data) {
        console.log('✏️ Script Editor: Script outline completed, beginning structural review...');
        
        if (data.production.id === this.currentProduction?.id) {
            await this.reviewScriptOutline(data.outline);
        }
    }

    /**
     * Review script outline for structure and coherence
     */
    async reviewScriptOutline(outline) {
        try {
            console.log('✏️ Script Editor: Reviewing script outline structure...');
            
            const structureReview = {
                clarity: this.assessOutlineClarity(outline),
                coherence: this.assessPlotCoherence(outline),
                pacing: this.assessOutlinePacing(outline),
                characterDevelopment: this.assessCharacterArcs(outline),
                suggestions: []
            };
            
            // Generate improvement suggestions
            structureReview.suggestions = await this.generateStructureSuggestions(structureReview);
            
            // Share feedback with AI Playwright
            if (this.aiPlaywright) {
                window.theaterEventBus?.publish('script:outline-feedback', {
                    review: structureReview,
                    editor: this.config.name,
                    timestamp: new Date()
                });
            }
            
            console.log('✅ Script Editor: Outline review completed');
            
        } catch (error) {
            console.warn('⚠️ Script Editor: Outline review failed:', error.message);
        }
    }

    /**
     * Handle scene completion for immediate editing
     */
    async onSceneComplete(data) {
        console.log(`✏️ Script Editor: Scene ${data.act}.${data.sceneNumber} completed, beginning editing...`);
        
        if (data.production.id === this.currentProduction?.id) {
            await this.editScene(data.scene);
        }
    }

    /**
     * Edit and refine a completed scene
     */
    async editScene(scene) {
        try {
            console.log(`✏️ Script Editor: Editing scene ${scene.act}.${scene.scene}...`);
            
            // Start editing session
            this.currentEditingSession = {
                script: scene,
                version: 1,
                startTime: new Date(),
                changes: [],
                notes: [],
                status: 'editing'
            };
            
            // Perform comprehensive scene analysis
            const sceneAnalysis = await this.analyzeScene(scene);
            
            // Generate specific edits
            const edits = await this.generateSceneEdits(scene, sceneAnalysis);
            
            // Apply edits and create revised version
            const revisedScene = await this.applyEdits(scene, edits);
            
            // Quality check the revised scene
            const qualityCheck = await this.performQualityCheck(revisedScene);
            
            // Finalize editing session
            this.currentEditingSession.status = 'completed';
            this.currentEditingSession.changes = edits;
            
            // Publish edited scene
            window.theaterEventBus?.publish('script:scene-edited', {
                originalScene: scene,
                editedScene: revisedScene,
                edits: edits,
                qualityScore: qualityCheck,
                editor: this.config.name
            });
            
            console.log(`✅ Script Editor: Scene ${scene.act}.${scene.scene} editing completed`);
            
        } catch (error) {
            console.error(`✏️ Script Editor: Scene editing failed for ${scene.act}.${scene.scene}:`, error);
            this.currentEditingSession.status = 'error';
        }
    }

    /**
     * Analyze scene content for editing opportunities
     */
    async analyzeScene(scene) {
        console.log('✏️ Script Editor: Analyzing scene content...');
        
        const analysis = {
            dialogue: await this.analyzeDialogue(scene.content),
            structure: await this.analyzeSceneStructure(scene.content),
            pacing: await this.analyzePacing(scene.content),
            characters: await this.analyzeCharacterPresence(scene.content),
            stageDirections: await this.analyzeStageDirections(scene.content),
            overall: 0
        };
        
        // Calculate overall quality score
        analysis.overall = this.calculateOverallQuality(analysis);
        
        return analysis;
    }

    /**
     * Analyze dialogue quality and naturalness
     */
    async analyzeDialogue(content) {
        // Extract dialogue from script content
        const dialogueLines = this.extractDialogue(content);
        
        const dialogueAnalysis = {
            naturalness: this.assessDialogueNaturalness(dialogueLines),
            characterVoices: this.assessCharacterVoices(dialogueLines),
            subtext: this.assessSubtext(dialogueLines),
            clarity: this.assessDialogueClarity(dialogueLines),
            rhythm: this.assessDialogueRhythm(dialogueLines)
        };
        
        return dialogueAnalysis;
    }

    /**
     * Generate specific edits for scene improvement
     */
    async generateSceneEdits(scene, analysis) {
        console.log('✏️ Script Editor: Generating scene improvements...');
        
        const edits = [];
        
        // Dialogue improvements
        if (analysis.dialogue.naturalness < 7) {
            edits.push({
                type: 'dialogue_improvement',
                priority: 'high',
                description: 'Enhance dialogue naturalness',
                suggestions: this.generateDialogueImprovements(analysis.dialogue)
            });
        }
        
        // Structure improvements
        if (analysis.structure.coherence < 7) {
            edits.push({
                type: 'structure_improvement',
                priority: 'medium',
                description: 'Improve scene structure',
                suggestions: this.generateStructureImprovements(analysis.structure)
            });
        }
        
        // Pacing improvements
        if (analysis.pacing.flow < 7) {
            edits.push({
                type: 'pacing_improvement',
                priority: 'medium',
                description: 'Enhance scene pacing',
                suggestions: this.generatePacingImprovements(analysis.pacing)
            });
        }
        
        // Character consistency
        if (analysis.characters.consistency < 8) {
            edits.push({
                type: 'character_consistency',
                priority: 'high',
                description: 'Improve character consistency',
                suggestions: this.generateCharacterImprovements(analysis.characters)
            });
        }
        
        return edits;
    }

    /**
     * Apply edits to create revised scene
     */
    async applyEdits(scene, edits) {
        console.log('✏️ Script Editor: Applying edits to scene...');
        
        let revisedContent = scene.content;
        const appliedChanges = [];
        
        for (const edit of edits) {
            try {
                const change = await this.applySpecificEdit(revisedContent, edit);
                if (change.success) {
                    revisedContent = change.newContent;
                    appliedChanges.push({
                        edit: edit,
                        change: change,
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Script Editor: Failed to apply edit: ${edit.description}`, error);
            }
        }
        
        const revisedScene = {
            ...scene,
            content: revisedContent,
            version: scene.version ? scene.version + 1 : 2,
            editedBy: this.config.name,
            editedAt: new Date(),
            changes: appliedChanges,
            status: 'edited'
        };
        
        return revisedScene;
    }

    /**
     * Perform quality check on edited content
     */
    async performQualityCheck(scene) {
        console.log('✏️ Script Editor: Performing quality check...');
        
        const qualityCheck = {
            dialogue: {
                naturalness: this.checkDialogueNaturalness(scene.content),
                clarity: this.checkDialogueClarity(scene.content),
                characterVoice: this.checkCharacterVoice(scene.content)
            },
            structure: {
                coherence: this.checkStructuralCoherence(scene.content),
                pacing: this.checkPacing(scene.content),
                transitions: this.checkTransitions(scene.content)
            },
            technical: {
                formatting: this.checkFormatting(scene.content),
                stageDirections: this.checkStageDirections(scene.content),
                readability: this.checkReadability(scene.content)
            },
            overall: 0
        };
        
        // Calculate overall quality score
        qualityCheck.overall = this.calculateOverallQuality(qualityCheck);
        
        return qualityCheck;
    }

    /**
     * Handle revision requests from Creative Director
     */
    async onRevisionRequested(data) {
        console.log('✏️ Script Editor: Revision requested -', data.type);
        
        if (data.script && data.revisionNotes) {
            await this.performTargetedRevision(data.script, data.revisionNotes);
        }
    }

    /**
     * Perform targeted revision based on specific notes
     */
    async performTargetedRevision(script, revisionNotes) {
        try {
            console.log('✏️ Script Editor: Performing targeted revision...');
            
            const revisionPlan = this.createRevisionPlan(revisionNotes);
            const revisedScript = await this.executeRevisionPlan(script, revisionPlan);
            
            // Validate revision against notes
            const validation = await this.validateRevision(revisedScript, revisionNotes);
            
            window.theaterEventBus?.publish('script:revision-complete', {
                originalScript: script,
                revisedScript: revisedScript,
                revisionNotes: revisionNotes,
                validation: validation,
                editor: this.config.name
            });
            
            console.log('✅ Script Editor: Targeted revision completed');
            
        } catch (error) {
            console.error('✏️ Script Editor: Targeted revision failed:', error);
        }
    }

    /**
     * Handle artistic vision updates
     */
    async onArtisticVisionReceived(data) {
        console.log('✏️ Script Editor: Artistic vision received, adjusting editing standards...');
        
        if (this.currentProduction && data.production.id === this.currentProduction.id) {
            await this.alignEditingWithVision(data.vision);
        }
    }

    /**
     * Align editing approach with artistic vision
     */
    async alignEditingWithVision(vision) {
        // Analyze vision for editing implications
        const visionAnalysis = this.analyzeVisionForEditing(vision);
        
        // Adjust editing standards
        this.adjustEditingStandards(visionAnalysis);
        
        // Update style preferences
        this.updateStylePreferences(visionAnalysis);
        
        console.log('✅ Script Editor: Editing approach aligned with artistic vision');
    }

    /**
     * Extract dialogue from script content
     */
    extractDialogue(content) {
        // Simple extraction - in practice, this would be more sophisticated
        const lines = content.split('\n');
        const dialogueLines = [];
        
        for (const line of lines) {
            // Look for character names followed by dialogue
            if (line.match(/^[A-Z\s]+:/)) {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    dialogueLines.push({
                        character: parts[0].trim(),
                        dialogue: parts.slice(1).join(':').trim()
                    });
                }
            }
        }
        
        return dialogueLines;
    }

    /**
     * Assess dialogue naturalness
     */
    assessDialogueNaturalness(dialogueLines) {
        // Simplified assessment - would use more sophisticated analysis
        let score = 8; // Start with good baseline
        
        for (const line of dialogueLines) {
            // Check for overly formal language
            if (line.dialogue.includes('shall') || line.dialogue.includes('whom')) {
                score -= 0.5;
            }
            
            // Check for contractions (more natural)
            if (line.dialogue.includes("'ll") || line.dialogue.includes("'re")) {
                score += 0.2;
            }
            
            // Check sentence length (shorter is often more natural)
            const sentences = line.dialogue.split(/[.!?]/);
            const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
            if (avgLength > 50) {
                score -= 0.3;
            }
        }
        
        return Math.max(0, Math.min(10, score));
    }

    /**
     * Get script editing status and metrics
     */
    getEditingStatus() {
        return {
            currentSession: {
                active: this.currentEditingSession.status !== 'idle',
                script: this.currentEditingSession.script?.title || null,
                status: this.currentEditingSession.status,
                changes: this.currentEditingSession.changes.length,
                startTime: this.currentEditingSession.startTime
            },
            qualityMetrics: this.qualityMetrics,
            editingHistory: {
                totalSessions: this.editingHistory.length,
                totalChanges: this.changeTracking.additions + this.changeTracking.modifications,
                averageQuality: this.calculateAverageQuality()
            },
            capabilities: this.editingCapabilities,
            collaboration: {
                mode: this.collaborationMode,
                aiPlaywrightConnected: !!this.aiPlaywright,
                creativeDirectorConnected: !!this.creativeDirector
            }
        };
    }

    /**
     * Calculate average quality across all edited scripts
     */
    calculateAverageQuality() {
        if (this.editingHistory.length === 0) return 0;
        
        const totalQuality = this.editingHistory.reduce((sum, session) => {
            return sum + (session.finalQuality || 0);
        }, 0);
        
        return totalQuality / this.editingHistory.length;
    }

    /**
     * Handle creative brief from production team
     */
    async onCreativeBrief(brief) {
        console.log('✏️ Script Editor: Received creative brief for script editing');
        
        this.currentProduction = brief.production;
        
        // Prepare editing approach based on brief
        await this.prepareEditingApproach(brief);
    }

    /**
     * Prepare editing approach based on production brief
     */
    async prepareEditingApproach(brief) {
        const editingApproach = {
            genre: brief.production.type,
            style: this.determineEditingStyle(brief),
            priorities: this.identifyEditingPriorities(brief),
            standards: this.adjustQualityStandards(brief)
        };
        
        this.currentEditingApproach = editingApproach;
        console.log('✅ Script Editor: Editing approach prepared');
    }

    /**
     * Calculate overall quality from component scores
     */
    calculateOverallQuality(analysis) {
        const weights = {
            dialogue: 0.3,
            structure: 0.25,
            pacing: 0.2,
            characters: 0.15,
            technical: 0.1
        };
        
        let totalScore = 0;
        let totalWeight = 0;
        
        for (const [component, weight] of Object.entries(weights)) {
            if (analysis[component] && typeof analysis[component] === 'object') {
                const componentAvg = Object.values(analysis[component])
                    .filter(val => typeof val === 'number')
                    .reduce((sum, val, _, arr) => sum + val / arr.length, 0);
                
                totalScore += componentAvg * weight;
                totalWeight += weight;
            }
        }
        
        return totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('✏️ Script Editor: Concluding script editing session...');
        
        // Finalize current editing session
        if (this.currentEditingSession.status === 'editing') {
            this.currentEditingSession.status = 'interrupted';
            this.editingHistory.push({
                ...this.currentEditingSession,
                endTime: new Date()
            });
        }
        
        // Generate editing summary
        if (this.currentProduction) {
            const editingSummary = this.generateEditingSummary();
            console.log('📊 Script Editor: Editing summary generated');
        }
        
        console.log('✏️ Script Editor: Script editing concluded');
    }

    /**
     * Generate editing summary
     */
    generateEditingSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            editing: {
                sessionsCompleted: this.editingHistory.length,
                totalChanges: Object.values(this.changeTracking).reduce((a, b) => a + b, 0),
                averageQuality: this.calculateAverageQuality(),
                improvementAreas: this.identifyMainImprovementAreas()
            },
            collaboration: {
                playwrightInteractions: this.countPlaywrightInteractions(),
                directorFeedback: this.countDirectorFeedback(),
                revisionCycles: this.countRevisionCycles()
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScriptEditorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.ScriptEditorAgent = ScriptEditorAgent;
    console.log('✏️ Script Editor Agent loaded - Ready for professional script editing');
}