/**
 * StageManagerAgent.js - Live Performance Coordination and Control
 * 
 * The Stage Manager Agent serves as the central command hub during live performances,
 * coordinating all technical and artistic elements in real-time. Uses Ollama LLM for
 * intelligent decision-making during unexpected situations and performance adaptation.
 * 
 * Features:
 * - Real-time performance coordination and control
 * - Cue calling and technical timing management
 * - Emergency response and problem resolution
 * - AI-powered decision making for unexpected situations
 * - Communication hub for all departments during performance
 * - Performance flow optimization and quality assurance
 */

class StageManagerAgent extends BaseAgent {
    constructor(config = {}) {
        super('stage-manager', {
            name: 'Stage Manager',
            role: 'stage-manager',
            priority: 95, // Very high priority for live performance
            maxActionsPerSecond: 15, // High rate for real-time coordination
            personality: config.personality || 'authoritative',
            ...config
        });
        
        // Stage Manager specific properties
        this.ollamaInterface = null;
        this.managementStyle = config.managementStyle || 'collaborative';
        this.creativityLevel = config.creativity || 0.6; // Lower for reliability
        
        // Performance control capabilities
        this.performanceCapabilities = {
            cueManagement: {
                lighting: true,
                sound: true,
                music: true,
                effects: true,
                automation: true
            },
            communication: {
                headsetSystem: true,
                departmentCoordination: true,
                emergencyAlerts: true,
                statusUpdates: true,
                performerCueing: true
            },
            problemSolving: {
                technicalIssues: true,
                performerSupport: true,
                emergencyResponse: true,
                adaptationDecisions: true,
                qualityControl: true
            },
            coordination: {
                preShowChecks: true,
                showCalling: true,
                intervalManagement: true,
                postShowTasks: true,
                reportGeneration: true
            }
        };
        
        // Current performance state
        this.performanceState = {
            status: 'idle', // idle, preshow, performance, interval, postshow
            currentCue: null,
            nextCue: null,
            act: 1,
            scene: 1,
            startTime: null,
            elapsedTime: 0,
            pausedTime: 0,
            performanceQuality: 0.8
        };
        
        // Cue management system
        this.cueSystem = {
            lightingCues: new Map(),
            soundCues: new Map(),
            musicCues: new Map(),
            effectsCues: new Map(),
            performerCues: new Map(),
            masterCueList: [],
            currentCueIndex: 0,
            standbyQueue: []
        };
        
        // Department status tracking
        this.departmentStatus = {
            lighting: { status: 'standby', ready: false, lastUpdate: null },
            sound: { status: 'standby', ready: false, lastUpdate: null },
            music: { status: 'standby', ready: false, lastUpdate: null },
            performers: { status: 'standby', ready: false, lastUpdate: null },
            technical: { status: 'standby', ready: false, lastUpdate: null }
        };
        
        // Communication and coordination
        this.communicationLog = [];
        this.priorityMessages = [];
        this.departmentCheckIns = new Map();
        
        // Problem tracking and resolution
        this.activeProblems = [];
        this.resolvedProblems = [];
        this.emergencyProtocols = {
            medical: { procedure: 'stop_show_call_medical', responsible: 'stage-manager' },
            fire: { procedure: 'evacuate_building', responsible: 'stage-manager' },
            technical: { procedure: 'assess_and_adapt', responsible: 'stage-manager' },
            performer: { procedure: 'provide_support_continue', responsible: 'stage-manager' }
        };
        
        // Performance quality monitoring
        this.qualityMetrics = {
            timing: { precision: 0.9, consistency: 0.85 },
            coordination: { departments: 0.9, performers: 0.8 },
            adaptation: { responsiveness: 0.8, effectiveness: 0.7 },
            communication: { clarity: 0.9, timeliness: 0.85 }
        };
        
        // Integration with production system
        this.allDepartments = new Map();
        this.currentProduction = null;
        
        console.log('🎬 Stage Manager Agent: Ready to coordinate live performance excellence');
    }

    /**
     * Initialize Stage Manager with system integration
     */
    async onInitialize() {
        try {
            console.log('🎬 Stage Manager: Initializing performance coordination systems...');
            
            // Connect to Ollama interface for intelligent decision making
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI decision making requires LLM assistance.');
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
            
            // Configure AI for stage management
            this.ollamaInterface.updatePerformanceContext({
                role: 'stage_manager',
                management_style: this.managementStyle,
                creativity_mode: 'problem_solving',
                specialization: 'live_performance_coordination'
            });
            
            // Connect to all available agents
            await this.connectToAllDepartments();
            
            // Subscribe to performance events
            this.subscribeToPerformanceEvents();
            
            // Initialize cue system
            await this.initializeCueSystem();
            
            // Test coordination capabilities
            await this.testCoordinationCapabilities();
            
            console.log('🎬 Stage Manager: Ready for live performance coordination!')
            
        } catch (error) {
            console.error('🎬 Stage Manager: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI STAGE MANAGEMENT:
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
     * Connect to all available departments
     */
    async connectToAllDepartments() {
        console.log('🎬 Stage Manager: Connecting to all departments...');
        
        // Map of agents to connect to
        const agentConnections = [
            { key: 'lighting', agent: window.lightingDesignerAgent, name: 'Lighting Designer' },
            { key: 'sound', agent: window.soundDesignerAgent, name: 'Sound Designer' },
            { key: 'music', agent: window.musicDirectorAgent, name: 'Music Director' },
            { key: 'creative', agent: window.aiDirectorAgent, name: 'Creative Director' },
            { key: 'technical', agent: window.technicalDirectorAgent, name: 'Technical Director' },
            { key: 'assistant', agent: window.assistantDirectorAgent, name: 'Assistant Director' }
        ];
        
        let connectedCount = 0;
        for (const connection of agentConnections) {
            if (connection.agent && connection.agent.isActive) {
                this.allDepartments.set(connection.key, {
                    agent: connection.agent,
                    name: connection.name,
                    status: 'connected',
                    lastContact: new Date()
                });
                connectedCount++;
                console.log(`✅ Connected to ${connection.name}`);
            } else {
                console.log(`⚠️ ${connection.name} not available`);
            }
        }
        
        console.log(`🎬 Stage Manager: Connected to ${connectedCount} departments`);
    }

    /**
     * Subscribe to performance events
     */
    subscribeToPerformanceEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('performance:start-requested', (data) => this.onPerformanceStartRequested(data));
            window.theaterEventBus.subscribe('performance:cue-ready', (data) => this.onCueReady(data));
            window.theaterEventBus.subscribe('performance:problem-reported', (data) => this.onProblemReported(data));
            window.theaterEventBus.subscribe('performance:emergency', (data) => this.onEmergency(data));
            window.theaterEventBus.subscribe('performance:quality-issue', (data) => this.onQualityIssue(data));
            window.theaterEventBus.subscribe('stage:ready-check', (data) => this.onReadyCheck(data));
            
            console.log('🎬 Stage Manager: Subscribed to performance coordination events');
        }
    }

    /**
     * Initialize cue system
     */
    async initializeCueSystem() {
        console.log('🎬 Stage Manager: Initializing cue management system...');
        
        // Collect cues from all departments
        await this.collectDepartmentCues();
        
        // Build master cue list
        this.buildMasterCueList();
        
        // Prepare standby queue
        this.prepareStandbyQueue();
        
        console.log('✅ Stage Manager: Cue system initialized');
    }

    /**
     * Test coordination capabilities
     */
    async testCoordinationCapabilities() {
        try {
            const testPrompt = `
            As a stage manager, handle this live performance situation:
            
            Situation:
            - Mid-performance, Act 2 Scene 1
            - Lighting cue 47 has just executed
            - Sound cue 23 is standing by for 30 seconds
            - Lead actor seems to have forgotten their line
            - Audience is noticing the pause
            
            Provide immediate coordination response:
            1. What's your immediate action priority?
            2. How do you support the performer without breaking immersion?
            3. What departments need to be alerted?
            4. How do you maintain performance flow?
            5. What contingency measures should be ready?
            
            Format as urgent stage management decisions.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 500
            });
            
            console.log('🎬 Stage Manager: Coordination capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎬 Stage Manager: Coordination capability test failed:', error);
            throw new Error(`Stage management test failed: ${error.message}`);
        }
    }

    /**
     * Handle performance start requests
     */
    async onPerformanceStartRequested(data) {
        console.log('🎬 Stage Manager: Performance start requested');
        
        // Perform pre-show checks
        const readyCheck = await this.performPreShowChecks();
        
        if (readyCheck.allReady) {
            await this.initiatePerformanceStart();
        } else {
            await this.handlePreShowIssues(readyCheck.issues);
        }
    }

    /**
     * Perform comprehensive pre-show checks
     */
    async performPreShowChecks() {
        console.log('🎬 Stage Manager: Performing pre-show checks...');
        
        const checks = {
            allReady: true,
            issues: [],
            departmentStatus: {}
        };
        
        // Check each department
        for (const [dept, info] of this.allDepartments.entries()) {
            try {
                const status = await this.checkDepartmentReadiness(dept, info);
                checks.departmentStatus[dept] = status;
                
                if (!status.ready) {
                    checks.allReady = false;
                    checks.issues.push({
                        department: dept,
                        issue: status.issue || 'Not ready',
                        severity: status.severity || 'medium'
                    });
                }
            } catch (error) {
                checks.allReady = false;
                checks.issues.push({
                    department: dept,
                    issue: `Check failed: ${error.message}`,
                    severity: 'high'
                });
            }
        }
        
        console.log(`🎬 Stage Manager: Pre-show checks complete - ${checks.allReady ? 'READY' : 'ISSUES FOUND'}`);
        return checks;
    }

    /**
     * Check individual department readiness
     */
    async checkDepartmentReadiness(department, departmentInfo) {
        // Simulate department readiness check
        const readiness = {
            ready: Math.random() > 0.1, // 90% chance of being ready
            issue: null,
            severity: 'low'
        };
        
        if (!readiness.ready) {
            const issues = {
                lighting: 'Cue 1 programming incomplete',
                sound: 'Microphone 2 not responding',
                music: 'Playback system connectivity issue',
                technical: 'Safety check pending'
            };
            
            readiness.issue = issues[department] || 'General readiness issue';
            readiness.severity = department === 'technical' ? 'high' : 'medium';
        }
        
        this.departmentStatus[department] = {
            status: readiness.ready ? 'ready' : 'not_ready',
            ready: readiness.ready,
            lastUpdate: new Date(),
            issue: readiness.issue
        };
        
        return readiness;
    }

    /**
     * Initiate performance start
     */
    async initiatePerformanceStart() {
        console.log('🎬 Stage Manager: Initiating performance start...');
        
        this.performanceState.status = 'preshow';
        this.performanceState.startTime = new Date();
        
        // Final countdown sequence
        await this.executeCountdownSequence();
        
        // Start performance
        this.performanceState.status = 'performance';
        this.performanceState.currentCue = this.cueSystem.masterCueList[0];
        this.performanceState.nextCue = this.cueSystem.masterCueList[1];
        
        // Execute opening cue
        await this.executeCue(this.performanceState.currentCue);
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Notify all departments
        window.theaterEventBus?.publish('performance:started', {
            startTime: this.performanceState.startTime,
            stageManager: this.config.name
        });
        
        console.log('🎬 Stage Manager: Performance started successfully');
    }

    /**
     * Execute countdown sequence
     */
    async executeCountdownSequence() {
        const countdownSteps = [
            { time: 300000, message: '5 minutes to curtain' },
            { time: 120000, message: '2 minutes to curtain' },
            { time: 60000, message: '1 minute to curtain' },
            { time: 30000, message: '30 seconds to curtain' },
            { time: 10000, message: '10 seconds to curtain' }
        ];
        
        for (const step of countdownSteps) {
            await this.broadcastMessage(step.message, 'info');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate time
        }
        
        await this.broadcastMessage('Curtain going up', 'cue');
    }

    /**
     * Execute a specific cue
     */
    async executeCue(cue) {
        if (!cue) return;
        
        console.log(`🎬 Stage Manager: Executing cue ${cue.number} - ${cue.description}`);
        
        try {
            // Send cue to appropriate department
            const department = this.allDepartments.get(cue.department);
            if (department && department.agent) {
                window.theaterEventBus?.publish(`${cue.department}:cue-execute`, {
                    cue: cue,
                    timestamp: new Date(),
                    stageManager: this.config.name
                });
            }
            
            // Update cue system
            this.cueSystem.currentCueIndex++;
            this.performanceState.currentCue = cue;
            this.performanceState.nextCue = this.cueSystem.masterCueList[this.cueSystem.currentCueIndex];
            
            // Log execution
            this.logCueExecution(cue);
            
        } catch (error) {
            console.error(`🎬 Stage Manager: Cue execution failed for ${cue.number}:`, error);
            await this.handleCueFailure(cue, error);
        }
    }

    /**
     * Handle cue ready notifications
     */
    async onCueReady(data) {
        console.log(`🎬 Stage Manager: Cue ready from ${data.department} - ${data.cueNumber}`);
        
        // Add to standby queue
        this.cueSystem.standbyQueue.push({
            department: data.department,
            cueNumber: data.cueNumber,
            readyTime: new Date()
        });
        
        // Check if this is the next expected cue
        if (this.isNextExpectedCue(data)) {
            await this.executeCue(data.cue);
        }
    }

    /**
     * Handle problem reports
     */
    async onProblemReported(data) {
        console.log(`🎬 Stage Manager: Problem reported - ${data.problem.type}`);
        
        const problem = {
            id: `problem_${Date.now()}`,
            type: data.problem.type,
            description: data.problem.description,
            department: data.department,
            severity: data.problem.severity || 'medium',
            reportedAt: new Date(),
            status: 'active'
        };
        
        this.activeProblems.push(problem);
        
        // Use AI to determine response
        await this.generateProblemResponse(problem);
    }

    /**
     * Generate AI-powered problem response
     */
    async generateProblemResponse(problem) {
        try {
            console.log('🎬 Stage Manager: Generating AI response to problem...');
            
            const responsePrompt = `
            Handle this live performance problem immediately:
            
            Problem Details:
            - Type: ${problem.type}
            - Description: ${problem.description}
            - Department: ${problem.department}
            - Severity: ${problem.severity}
            - Performance Status: ${this.performanceState.status}
            - Current Cue: ${this.performanceState.currentCue?.number || 'None'}
            
            Available Resources:
            - Connected departments: ${Array.from(this.allDepartments.keys()).join(', ')}
            - Emergency protocols: ${Object.keys(this.emergencyProtocols).join(', ')}
            
            Provide immediate response plan:
            1. What's the immediate action to take?
            2. Which departments need to be involved?
            3. How do we maintain performance continuity?
            4. What contingency measures should be activated?
            5. How do we communicate with performers and audience?
            
            Keep responses practical and actionable for live performance.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(responsePrompt, {
                temperature: this.creativityLevel,
                max_tokens: 600,
                timeout: 8000 // Quick response needed
            });
            
            if (response && response.content) {
                await this.implementProblemResponse(problem, response.content);
                
                problem.response = response.content;
                problem.responseTime = new Date();
                
                console.log('✅ Stage Manager: AI problem response implemented');
            }
            
        } catch (error) {
            console.error('🎬 Stage Manager: AI problem response failed:', error);
            // Fall back to standard protocols
            await this.implementStandardProblemResponse(problem);
        }
    }

    /**
     * Handle emergency situations
     */
    async onEmergency(data) {
        console.error(`🚨 Stage Manager: EMERGENCY - ${data.emergency.type}`);
        
        const emergency = {
            type: data.emergency.type,
            description: data.emergency.description,
            location: data.emergency.location,
            severity: data.emergency.severity || 'critical',
            reportedAt: new Date()
        };
        
        // Implement emergency protocol
        const protocol = this.emergencyProtocols[emergency.type];
        if (protocol) {
            await this.executeEmergencyProtocol(protocol, emergency);
        } else {
            await this.handleUnknownEmergency(emergency);
        }
    }

    /**
     * Execute emergency protocol
     */
    async executeEmergencyProtocol(protocol, emergency) {
        console.log(`🚨 Stage Manager: Executing ${protocol.procedure} protocol`);
        
        switch (protocol.procedure) {
            case 'stop_show_call_medical':
                await this.stopShow('Medical emergency');
                await this.alertMedicalServices(emergency);
                break;
                
            case 'evacuate_building':
                await this.stopShow('Fire emergency');
                await this.initiateEvacuation(emergency);
                break;
                
            case 'assess_and_adapt':
                await this.assessTechnicalProblem(emergency);
                break;
                
            case 'provide_support_continue':
                await this.supportPerformerContinue(emergency);
                break;
        }
        
        // Log emergency response
        this.logEmergencyResponse(emergency, protocol);
    }

    /**
     * Stop show for emergency
     */
    async stopShow(reason) {
        console.log(`🎬 Stage Manager: STOPPING SHOW - ${reason}`);
        
        this.performanceState.status = 'stopped';
        this.performanceState.pausedTime = new Date();
        
        // Notify all departments immediately
        window.theaterEventBus?.publish('performance:stop-show', {
            reason: reason,
            timestamp: new Date(),
            stageManager: this.config.name
        });
        
        // Broadcast to audience if appropriate
        await this.broadcastMessage(`Ladies and gentlemen, we need to pause the performance briefly. Please remain in your seats.`, 'emergency');
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        console.log('🎬 Stage Manager: Starting performance monitoring...');
        
        // Monitor performance every 5 seconds
        this.performanceMonitor = setInterval(async () => {
            if (this.performanceState.status === 'performance') {
                await this.monitorPerformanceQuality();
                await this.updatePerformanceMetrics();
                await this.checkForIssues();
            }
        }, 5000);
    }

    /**
     * Monitor performance quality
     */
    async monitorPerformanceQuality() {
        // Update elapsed time
        if (this.performanceState.startTime) {
            this.performanceState.elapsedTime = Date.now() - this.performanceState.startTime.getTime();
        }
        
        // Check department status
        let overallQuality = 0;
        let activeCount = 0;
        
        for (const [dept, status] of Object.entries(this.departmentStatus)) {
            if (status.ready) {
                overallQuality += 0.8; // Base quality for ready departments
                activeCount++;
            }
        }
        
        this.performanceState.performanceQuality = activeCount > 0 ? overallQuality / activeCount : 0.5;
    }

    /**
     * Broadcast message to all departments
     */
    async broadcastMessage(message, priority = 'normal') {
        const broadcastMessage = {
            message: message,
            priority: priority,
            timestamp: new Date(),
            sender: 'stage-manager'
        };
        
        this.communicationLog.push(broadcastMessage);
        
        if (priority === 'emergency' || priority === 'urgent') {
            this.priorityMessages.push(broadcastMessage);
        }
        
        // Send to all departments
        window.theaterEventBus?.publish('stage:broadcast', broadcastMessage);
        
        console.log(`📢 Stage Manager: Broadcasting ${priority} message - ${message}`);
    }

    /**
     * Build master cue list from all departments
     */
    buildMasterCueList() {
        const allCues = [];
        
        // Collect cues from all departments
        for (const [dept, cueMap] of Object.entries(this.cueSystem)) {
            if (cueMap instanceof Map) {
                for (const [cueNum, cue] of cueMap.entries()) {
                    allCues.push({
                        number: cueNum,
                        department: dept,
                        description: cue.description || `${dept} cue ${cueNum}`,
                        timing: cue.timing || 0,
                        ...cue
                    });
                }
            }
        }
        
        // Sort by timing
        this.cueSystem.masterCueList = allCues.sort((a, b) => a.timing - b.timing);
        
        console.log(`🎬 Stage Manager: Master cue list built with ${this.cueSystem.masterCueList.length} cues`);
    }

    /**
     * Get stage management status
     */
    getStageManagementStatus() {
        return {
            performance: {
                status: this.performanceState.status,
                currentCue: this.performanceState.currentCue?.number,
                nextCue: this.performanceState.nextCue?.number,
                elapsedTime: this.performanceState.elapsedTime,
                quality: this.performanceState.performanceQuality,
                act: this.performanceState.act,
                scene: this.performanceState.scene
            },
            departments: {
                connected: this.allDepartments.size,
                ready: Object.values(this.departmentStatus).filter(d => d.ready).length,
                status: this.departmentStatus
            },
            cueSystem: {
                totalCues: this.cueSystem.masterCueList.length,
                currentIndex: this.cueSystem.currentCueIndex,
                standbyQueue: this.cueSystem.standbyQueue.length
            },
            problems: {
                active: this.activeProblems.length,
                resolved: this.resolvedProblems.length
            },
            communication: {
                messagesLogged: this.communicationLog.length,
                priorityMessages: this.priorityMessages.length
            },
            capabilities: this.performanceCapabilities
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎬 Stage Manager: Concluding stage management session...');
        
        // Stop performance monitoring
        if (this.performanceMonitor) {
            clearInterval(this.performanceMonitor);
        }
        
        // Update performance state
        if (this.performanceState.status === 'performance') {
            this.performanceState.status = 'completed';
        }
        
        // Generate performance report
        if (this.currentProduction) {
            const performanceReport = this.generatePerformanceReport();
            console.log('📊 Stage Manager: Performance report generated');
        }
        
        console.log('🎬 Stage Manager: Stage management concluded');
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            performance: {
                duration: this.performanceState.elapsedTime,
                averageQuality: this.performanceState.performanceQuality,
                cuesExecuted: this.cueSystem.currentCueIndex,
                problemsEncountered: this.activeProblems.length + this.resolvedProblems.length
            },
            coordination: {
                departmentsManaged: this.allDepartments.size,
                communicationsLogged: this.communicationLog.length,
                emergencyResponsesHandled: this.resolvedProblems.filter(p => p.severity === 'critical').length
            },
            quality: {
                overall: this.performanceState.performanceQuality,
                timing: this.qualityMetrics.timing,
                coordination: this.qualityMetrics.coordination,
                adaptation: this.qualityMetrics.adaptation
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StageManagerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.StageManagerAgent = StageManagerAgent;
    console.log('🎬 Stage Manager Agent loaded - Ready for live performance coordination');
}