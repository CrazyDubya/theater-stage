/**
 * RealAIPlaywrightAgent.js - AI-Powered Script Generation with Ollama
 * 
 * Enhanced version of AI Playwright Agent that actually generates scripts
 * using Ollama LLM integration. Creates real theatrical scripts with proper
 * formatting, character development, and dramatic structure.
 */

class RealAIPlaywrightAgent extends AIPlaywrightAgent {
    constructor(config = {}) {
        super(config);
        
        // Real Ollama connector
        this.ollama = null;
        
        // Script generation state
        this.generationState = {
            isGenerating: false,
            currentTask: null,
            progress: 0,
            generatedContent: []
        };
        
        // System prompts for different tasks
        this.systemPrompts = {
            playwright: `You are an expert AI playwright specializing in theatrical productions. You create compelling scripts with rich characters, engaging dialogue, and strong dramatic structure. You understand stage limitations and write with live performance in mind. Format all scripts in proper theatrical format with character names in CAPS, stage directions in italics/parentheses, and clear scene breaks.`,
            
            character_developer: `You are a character development specialist. You create complex, three-dimensional characters with clear motivations, backstories, and distinctive voices. Each character should have unique speech patterns, goals, and emotional arcs.`,
            
            dialogue_writer: `You are a master of theatrical dialogue. You write natural, speakable lines that reveal character, advance plot, and engage audiences. Your dialogue is sharp, purposeful, and emotionally resonant.`,
            
            structure_analyst: `You are a dramatic structure expert. You understand three-act structure, rising action, climax, and resolution. You ensure proper pacing, scene transitions, and dramatic tension throughout the script.`
        };
        
        console.log('🎭 RealAIPlaywrightAgent: Enhanced with Ollama integration');
    }

    /**
     * Initialize with Ollama connector
     */
    async initialize() {
        await super.initialize();
        
        // Connect to Ollama
        if (window.OllamaConnector) {
            this.ollama = new OllamaConnector({
                model: 'llama3.1',
                temperature: this.creativityLevel,
                maxTokens: 8192 // Longer for script generation
            });
            
            // Test connection
            const connectionTest = await this.ollama.testConnection();
            if (connectionTest.success) {
                console.log('✅ RealAIPlaywrightAgent: Connected to Ollama');
                
                // Set system prompt
                this.ollama.setAgentSystemPrompt(this.id, this.systemPrompts.playwright);
            } else {
                console.warn('⚠️ RealAIPlaywrightAgent: Ollama connection failed, using simulation mode');
            }
        }
    }

    /**
     * Handle real production task execution
     */
    async onRealProductionTask(data) {
        if (data.task === 'concept_creation' || data.task === 'first_draft') {
            console.log(`🎭 RealAIPlaywrightAgent: Starting ${data.task}`);
            
            if (data.task === 'concept_creation') {
                await this.generateScriptConcept();
            } else if (data.task === 'first_draft') {
                await this.generateFirstDraft();
            }
        }
    }

    /**
     * Generate script concept
     */
    async generateScriptConcept() {
        if (!this.ollama || !this.ollama.state.isConnected) {
            return this.simulateScriptConcept();
        }
        
        this.generationState.isGenerating = true;
        this.generationState.currentTask = 'concept';
        
        try {
            const production = this.currentProduction;
            
            // Generate concept
            const conceptPrompt = `
Create a detailed script concept for a theatrical production titled "${production.title}".
Genre: ${production.type || 'drama'}
Target audience: General theater-goers
Performance venue: Medium-sized theater (500-800 seats)

Please provide:
1. LOGLINE (one sentence that captures the essence)
2. SYNOPSIS (2-3 paragraphs outlining the story)
3. MAIN CHARACTERS (3-5 characters with brief descriptions)
4. CENTRAL THEMES (2-3 major themes to explore)
5. DRAMATIC STRUCTURE (brief outline of acts and major plot points)
6. UNIQUE ELEMENTS (what makes this production special)

Focus on creating something emotionally engaging and theatrically compelling.
`;

            console.log('🎭 Generating script concept...');
            const response = await this.ollama.generateCompletion(this.id, conceptPrompt);
            
            // Parse and save concept
            const concept = {
                timestamp: new Date(),
                content: response.content,
                production: production.title
            };
            
            this.generationState.generatedContent.push(concept);
            
            // Save to production manager
            if (window.realProductionManager) {
                await window.realProductionManager.saveDeliverable(
                    'scripts',
                    'concept.md',
                    response.content,
                    { type: 'concept', agent: this.id }
                );
            }
            
            // Emit completion
            this.eventBus.publish('playwright:concept-complete', {
                agent: this.id,
                concept: concept
            });
            
            console.log('✅ Script concept generated');
            
        } catch (error) {
            console.error('❌ Concept generation failed:', error);
        } finally {
            this.generationState.isGenerating = false;
        }
    }

    /**
     * Generate first draft of script
     */
    async generateFirstDraft() {
        if (!this.ollama || !this.ollama.state.isConnected) {
            return this.simulateFirstDraft();
        }
        
        this.generationState.isGenerating = true;
        this.generationState.currentTask = 'first_draft';
        
        try {
            const production = this.currentProduction;
            
            // Get previous concept if available
            const concept = this.generationState.generatedContent.find(c => c.production === production.title);
            
            // Generate Act 1
            console.log('🎭 Generating Act 1...');
            const act1Prompt = `
Based on the concept for "${production.title}", write Act 1 of the theatrical script.

${concept ? `Previous concept:\n${concept.content}\n\n` : ''}

Write Act 1 with:
- Opening scene that establishes world and tone
- Introduction of main characters
- Inciting incident that launches the story
- Rising tension leading to act break

Format:
- Character names in CAPS
- Stage directions in (parentheses)
- Scene headers like: ACT 1, SCENE 1 - [LOCATION]
- Dialogue should be natural and character-specific

Target length: 20-30 minutes of stage time (about 20-25 pages)
`;

            const act1Response = await this.ollama.generateCompletion(this.id, act1Prompt);
            
            // Save Act 1
            const act1 = {
                timestamp: new Date(),
                act: 1,
                content: act1Response.content
            };
            
            this.generationState.generatedContent.push(act1);
            
            // Generate Act 2
            console.log('🎭 Generating Act 2...');
            const act2Prompt = `
Continue the script for "${production.title}". Write Act 2.

Previous content establishes the story. Now develop:
- Escalating conflicts and complications
- Character development and revelations
- Building toward climactic moment
- Subplots that interweave with main story

Maintain consistent character voices and dramatic momentum.
Target length: 30-40 minutes of stage time.
`;

            const act2Response = await this.ollama.generateCompletion(this.id, act2Prompt);
            
            const act2 = {
                timestamp: new Date(),
                act: 2,
                content: act2Response.content
            };
            
            this.generationState.generatedContent.push(act2);
            
            // Generate Act 3
            console.log('🎭 Generating Act 3...');
            const act3Prompt = `
Write the final act (Act 3) of "${production.title}".

Provide:
- Climactic confrontation/revelation
- Resolution of main conflict
- Character transformations completed
- Satisfying conclusion that resonates with themes
- Epilogue or denouement if appropriate

Keep it powerful and theatrically effective.
Target length: 15-20 minutes of stage time.
`;

            const act3Response = await this.ollama.generateCompletion(this.id, act3Prompt);
            
            const act3 = {
                timestamp: new Date(),
                act: 3,
                content: act3Response.content
            };
            
            this.generationState.generatedContent.push(act3);
            
            // Combine into full script
            const fullScript = `
${production.title.toUpperCase()}
A Play in Three Acts

Generated by AI Playwright Agent
Date: ${new Date().toLocaleDateString()}

---

${act1.content}

---

${act2.content}

---

${act3.content}

---

END OF PLAY
`;
            
            // Save complete first draft
            if (window.realProductionManager) {
                await window.realProductionManager.saveDeliverable(
                    'scripts',
                    'first-draft.fountain',
                    fullScript,
                    { type: 'first_draft', agent: this.id, acts: 3 }
                );
            }
            
            // Emit completion
            this.eventBus.publish('playwright:first-draft-complete', {
                agent: this.id,
                script: {
                    title: production.title,
                    acts: 3,
                    length: fullScript.length
                }
            });
            
            console.log('✅ First draft complete!');
            
        } catch (error) {
            console.error('❌ First draft generation failed:', error);
        } finally {
            this.generationState.isGenerating = false;
        }
    }

    /**
     * Generate character profiles
     */
    async generateCharacterProfiles() {
        if (!this.ollama || !this.ollama.state.isConnected) {
            return;
        }
        
        try {
            // Switch to character developer mode
            this.ollama.setAgentSystemPrompt(this.id, this.systemPrompts.character_developer);
            
            const prompt = `
Create detailed character profiles for the main characters in "${this.currentProduction.title}".

For each character provide:
1. NAME and age
2. PHYSICAL DESCRIPTION
3. BACKGROUND/BACKSTORY
4. PERSONALITY TRAITS
5. CORE MOTIVATION
6. CHARACTER ARC
7. SPEECH PATTERNS
8. RELATIONSHIPS with other characters

Make each character distinct and three-dimensional.
`;

            const response = await this.ollama.generateCompletion(this.id, prompt);
            
            // Save character profiles
            if (window.realProductionManager) {
                await window.realProductionManager.saveDeliverable(
                    'scripts',
                    'character-profiles.md',
                    response.content,
                    { type: 'characters', agent: this.id }
                );
            }
            
            // Switch back to playwright mode
            this.ollama.setAgentSystemPrompt(this.id, this.systemPrompts.playwright);
            
        } catch (error) {
            console.error('❌ Character profile generation failed:', error);
        }
    }

    /**
     * Simulation fallbacks
     */
    async simulateScriptConcept() {
        console.log('🎭 Simulating script concept (Ollama not connected)');
        
        const concept = `
# ${this.currentProduction.title} - Script Concept

## LOGLINE
A compelling story about human connection and the power of theater to transform lives.

## SYNOPSIS
In a small community theater, a diverse group of individuals come together to produce a play that will challenge their assumptions and change their lives forever...

## MAIN CHARACTERS
- SARAH (40s) - Director with a vision
- MICHAEL (30s) - Reluctant actor finding his voice
- ELENA (50s) - Veteran performer facing her final act

## THEMES
- The transformative power of art
- Community and belonging
- Personal growth through creative expression

## STRUCTURE
- Act 1: Assembly and conflict
- Act 2: Collaboration and crisis
- Act 3: Performance and transformation
`;

        this.generationState.generatedContent.push({
            timestamp: new Date(),
            content: concept,
            production: this.currentProduction.title
        });
        
        return concept;
    }

    async simulateFirstDraft() {
        console.log('🎭 Simulating first draft (Ollama not connected)');
        
        const draft = `
${this.currentProduction.title.toUpperCase()}

ACT 1, SCENE 1 - COMMUNITY THEATER

(Lights up on an empty stage. SARAH enters, looking around the space.)

SARAH
(To herself)
This is where the magic happens. Or where it will happen, if I can pull this off.

(MICHAEL enters hesitantly)

MICHAEL
Excuse me? I'm here for the... uh... the auditions?

SARAH
(Turning, smiling)
Yes! Welcome! I'm Sarah, the director. And you are?

MICHAEL
Michael. I've never done this before.

SARAH
Perfect. The best actors are the ones who don't know they're actors yet.

(Lights fade)

[Draft continues...]
`;

        this.generationState.generatedContent.push({
            timestamp: new Date(),
            content: draft,
            production: this.currentProduction.title,
            type: 'first_draft'
        });
        
        return draft;
    }

    /**
     * Get generation status
     */
    getGenerationStatus() {
        return {
            isGenerating: this.generationState.isGenerating,
            currentTask: this.generationState.currentTask,
            progress: this.generationState.progress,
            generatedCount: this.generationState.generatedContent.length,
            connected: this.ollama?.state.isConnected || false
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealAIPlaywrightAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.RealAIPlaywrightAgent = RealAIPlaywrightAgent;
    console.log('🎭 RealAIPlaywrightAgent loaded - Ready for AI-powered script generation');
}