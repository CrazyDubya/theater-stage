/**
 * AssistantDirectorAgent.js - Production Coordination and Scheduling Management
 * 
 * The Assistant Director Agent serves as the primary coordinator between all departments,
 * managing schedules, rehearsal coordination, communication flow, and day-to-day production
 * logistics. Works closely with Creative Director and Executive Producer to ensure
 * smooth production operations.
 * 
 * Features:
 * - Rehearsal scheduling and coordination
 * - Inter-department communication management
 * - Production timeline tracking and adjustment
 * - Conflict resolution and problem solving
 * - Real-time production status monitoring
 * - Emergency coordination and response
 */

class AssistantDirectorAgent extends BaseAgent {
    constructor(config = {}) {
        super('assistant-director', {
            name: 'Assistant Director',
            role: 'assistant-director',
            priority: 75, // Medium-high priority coordination role
            maxActionsPerSecond: 8,
            personality: config.personality || 'organized',
            ...config
        });
        
        // Assistant Director specific properties
        this.coordinationStyle = config.coordinationStyle || 'collaborative';
        this.communicationMode = config.communicationMode || 'proactive';
        this.schedulingApproach = config.schedulingApproach || 'adaptive';
        
        // Scheduling and coordination
        this.masterSchedule = {
            rehearsals: new Map(),
            meetings: new Map(),
            deadlines: new Map(),
            conflicts: []
        };
        
        // Department coordination
        this.departmentStatus = new Map([
            ['creative', { status: 'idle', lastUpdate: null, currentTask: null }],
            ['script', { status: 'idle', lastUpdate: null, currentTask: null }],
            ['technical', { status: 'idle', lastUpdate: null, currentTask: null }],
            ['design', { status: 'idle', lastUpdate: null, currentTask: null }],
            ['performance', { status: 'idle', lastUpdate: null, currentTask: null }]
        ]);
        
        // Communication management
        this.communicationLog = [];
        this.pendingMessages = new Map();
        this.communicationPriorities = {
            emergency: 1,
            urgent: 2,
            important: 3,
            routine: 4,
            informational: 5
        };
        
        // Rehearsal management
        this.rehearsalTypes = {
            table_read: { duration: 180, participants: ['cast', 'creative'], setup: 'minimal' },
            blocking: { duration: 240, participants: ['cast', 'creative', 'stage_manager'], setup: 'stage_marks' },
            run_through: { duration: 300, participants: ['cast', 'creative'], setup: 'full_set' },
            technical: { duration: 480, participants: ['all'], setup: 'full_production' },
            dress: { duration: 360, participants: ['all'], setup: 'performance_ready' }
        };
        
        // Current rehearsal tracking
        this.currentRehearsal = {
            type: null,
            startTime: null,
            participants: [],
            agenda: [],
            notes: [],
            issues: [],
            status: 'idle'
        };
        
        // Production timeline management
        this.productionTimeline = {
            milestones: new Map(),
            deadlines: new Map(),
            dependencies: new Map(),
            criticalPath: [],
            bufferTime: new Map()
        };
        
        // Conflict resolution
        this.conflictResolution = {
            activeConflicts: [],
            resolutionHistory: [],
            escalationThresholds: {
                creative: 3,
                technical: 2,
                scheduling: 1
            }
        };
        
        // Integration with production system
        this.executiveProducer = null;
        this.creativeDirector = null;
        this.technicalDirector = null;
        this.currentProduction = null;
        
        // Real-time monitoring
        this.monitoringActive = false;
        this.statusUpdateInterval = 30000; // 30 seconds
        this.lastStatusUpdate = null;
        
        console.log('📋 Assistant Director Agent: Ready to coordinate production and manage schedules');
    }

    /**
     * Initialize Assistant Director with system integration
     */
    async onInitialize() {
        try {
            console.log('📋 Assistant Director: Initializing production coordination systems...');
            
            // Connect to key production agents
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('📋 Assistant Director: Connected to Executive Producer');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('📋 Assistant Director: Connected to Creative Director');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('📋 Assistant Director: Connected to Technical Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize scheduling system
            await this.initializeSchedulingSystem();
            
            // Start real-time monitoring
            this.startRealTimeMonitoring();
            
            // Initialize communication channels
            this.initializeCommunicationChannels();
            
            console.log('📋 Assistant Director: Ready for production coordination!')
            
        } catch (error) {
            console.error('📋 Assistant Director: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Subscribe to production events for coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('production:phase-change', (data) => this.onPhaseChange(data));
            window.theaterEventBus.subscribe('production:milestone', (data) => this.onMilestone(data));
            window.theaterEventBus.subscribe('scheduling:conflict', (data) => this.onSchedulingConflict(data));
            window.theaterEventBus.subscribe('department:status-update', (data) => this.onDepartmentUpdate(data));
            window.theaterEventBus.subscribe('emergency:response-needed', (data) => this.onEmergencyResponse(data));
            
            console.log('📋 Assistant Director: Subscribed to production events');
        }
    }

    /**
     * Initialize scheduling system
     */
    async initializeSchedulingSystem() {
        console.log('📋 Assistant Director: Initializing scheduling system...');
        
        // Create default scheduling templates
        this.schedulingTemplates = {
            'development': {
                duration: 4, // weeks
                keyActivities: [
                    { name: 'Script Development', duration: 3, department: 'script' },
                    { name: 'Character Analysis', duration: 2, department: 'creative' },
                    { name: 'Concept Meetings', duration: 1, department: 'all' }
                ]
            },
            'preProduction': {
                duration: 4,
                keyActivities: [
                    { name: 'Design Development', duration: 3, department: 'design' },
                    { name: 'Technical Planning', duration: 2, department: 'technical' },
                    { name: 'Casting Process', duration: 2, department: 'performance' }
                ]
            },
            'rehearsal': {
                duration: 4,
                keyActivities: [
                    { name: 'Table Reads', duration: 1, department: 'creative' },
                    { name: 'Blocking Rehearsals', duration: 2, department: 'performance' },
                    { name: 'Technical Rehearsals', duration: 1, department: 'technical' }
                ]
            }
        };
        
        // Initialize default time slots
        this.timeSlots = {
            morning: { start: '09:00', end: '12:00', type: 'meetings' },
            afternoon: { start: '13:00', end: '17:00', type: 'rehearsals' },
            evening: { start: '18:00', end: '22:00', type: 'performances' }
        };
        
        console.log('✅ Assistant Director: Scheduling system initialized');
    }

    /**
     * Start real-time monitoring
     */
    startRealTimeMonitoring() {
        this.monitoringActive = true;
        
        // Set up regular status updates
        setInterval(() => {
            if (this.monitoringActive) {
                this.performStatusUpdate();
            }
        }, this.statusUpdateInterval);
        
        console.log('📊 Assistant Director: Real-time monitoring started');
    }

    /**
     * Initialize communication channels
     */
    initializeCommunicationChannels() {
        // Set up communication protocols
        this.communicationProtocols = {
            daily_standup: {
                frequency: 'daily',
                duration: 15,
                participants: ['all_departments'],
                agenda: ['yesterday_progress', 'today_plans', 'blockers']
            },
            weekly_production: {
                frequency: 'weekly',
                duration: 60,
                participants: ['department_heads'],
                agenda: ['timeline_review', 'resource_allocation', 'upcoming_milestones']
            },
            emergency_response: {
                frequency: 'as_needed',
                duration: 30,
                participants: ['key_personnel'],
                agenda: ['situation_assessment', 'immediate_actions', 'communication_plan']
            }
        };
        
        console.log('📞 Assistant Director: Communication channels initialized');
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('📋 Assistant Director: New production coordination started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Create master production schedule
        await this.createMasterSchedule(data.production);
        
        // Initialize department coordination
        this.initializeDepartmentCoordination();
        
        // Schedule initial production meetings
        await this.scheduleInitialMeetings();
        
        // Set up milestone tracking
        this.setupMilestoneTracking(data.production);
    }

    /**
     * Create master production schedule
     */
    async createMasterSchedule(production) {
        console.log('📋 Assistant Director: Creating master production schedule...');
        
        const template = production.template;
        const startDate = new Date(production.startDate);
        let currentDate = new Date(startDate);
        
        // Schedule each phase
        for (const [phaseName, phaseWeeks] of Object.entries(template.phases)) {
            const phaseTemplate = this.schedulingTemplates[phaseName];
            
            if (phaseTemplate) {
                // Schedule phase activities
                for (const activity of phaseTemplate.keyActivities) {
                    const activityEnd = new Date(currentDate);
                    activityEnd.setDate(activityEnd.getDate() + (activity.duration * 7));
                    
                    this.masterSchedule.deadlines.set(`${phaseName}_${activity.name}`, {
                        name: activity.name,
                        phase: phaseName,
                        department: activity.department,
                        startDate: new Date(currentDate),
                        endDate: activityEnd,
                        status: 'scheduled'
                    });
                }
            }
            
            // Move to next phase
            currentDate.setDate(currentDate.getDate() + (phaseWeeks * 7));
        }
        
        console.log('✅ Assistant Director: Master schedule created');
    }

    /**
     * Initialize department coordination
     */
    initializeDepartmentCoordination() {
        console.log('📋 Assistant Director: Initializing department coordination...');
        
        // Update department status tracking
        for (const [dept, status] of this.departmentStatus.entries()) {
            status.lastUpdate = new Date();
            status.status = 'ready';
            status.currentTask = 'awaiting_assignment';
        }
        
        // Set up inter-department communication
        this.interDepartmentComm = {
            creative_script: { frequency: 'daily', lastContact: null },
            creative_technical: { frequency: 'weekly', lastContact: null },
            technical_design: { frequency: 'bi_weekly', lastContact: null },
            script_performance: { frequency: 'weekly', lastContact: null }
        };
        
        console.log('✅ Assistant Director: Department coordination initialized');
    }

    /**
     * Schedule initial production meetings
     */
    async scheduleInitialMeetings() {
        console.log('📋 Assistant Director: Scheduling initial production meetings...');
        
        const meetings = [
            {
                name: 'Production Kickoff',
                type: 'all_hands',
                duration: 120,
                participants: ['all_departments'],
                agenda: ['production_overview', 'timeline_review', 'role_assignments'],
                priority: 'urgent',
                scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
            },
            {
                name: 'Creative Vision Meeting',
                type: 'creative',
                duration: 90,
                participants: ['creative', 'script'],
                agenda: ['artistic_vision', 'script_direction', 'character_development'],
                priority: 'important',
                scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // Day after tomorrow
            },
            {
                name: 'Technical Planning Session',
                type: 'technical',
                duration: 120,
                participants: ['technical', 'design'],
                agenda: ['technical_requirements', 'safety_protocols', 'equipment_planning'],
                priority: 'important',
                scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days out
            }
        ];
        
        for (const meeting of meetings) {
            this.masterSchedule.meetings.set(meeting.name, meeting);
            
            // Notify participants
            this.sendMeetingInvitations(meeting);
        }
        
        console.log('📅 Assistant Director: Initial meetings scheduled');
    }

    /**
     * Handle production phase changes
     */
    async onPhaseChange(data) {
        console.log(`📋 Assistant Director: Coordinating phase transition - ${data.previousPhase} → ${data.newPhase}`);
        
        // Update master schedule for new phase
        await this.adjustScheduleForPhase(data.newPhase);
        
        // Coordinate department transitions
        await this.coordinateDepartmentTransitions(data);
        
        // Schedule phase-specific activities
        await this.schedulePhaseActivities(data.newPhase);
        
        // Update communication protocols
        this.updateCommunicationForPhase(data.newPhase);
    }

    /**
     * Adjust schedule for new phase
     */
    async adjustScheduleForPhase(newPhase) {
        console.log(`📋 Assistant Director: Adjusting schedule for ${newPhase} phase...`);
        
        switch (newPhase) {
            case 'development':
                await this.scheduleDevelopmentActivities();
                break;
            case 'preProduction':
                await this.schedulePreProductionActivities();
                break;
            case 'rehearsal':
                await this.scheduleRehearsalActivities();
                break;
            case 'technical':
                await this.scheduleTechnicalActivities();
                break;
            case 'performance':
                await this.schedulePerformanceActivities();
                break;
        }
    }

    /**
     * Schedule rehearsal activities
     */
    async scheduleRehearsalActivities() {
        console.log('📋 Assistant Director: Scheduling rehearsal activities...');
        
        const rehearsalSchedule = [
            {
                type: 'table_read',
                date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                duration: this.rehearsalTypes.table_read.duration,
                participants: this.rehearsalTypes.table_read.participants
            },
            {
                type: 'blocking',
                date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                duration: this.rehearsalTypes.blocking.duration,
                participants: this.rehearsalTypes.blocking.participants
            },
            {
                type: 'run_through',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                duration: this.rehearsalTypes.run_through.duration,
                participants: this.rehearsalTypes.run_through.participants
            }
        ];
        
        for (const rehearsal of rehearsalSchedule) {
            this.masterSchedule.rehearsals.set(`${rehearsal.type}_${rehearsal.date.toISOString()}`, {
                ...rehearsal,
                status: 'scheduled',
                notes: [],
                conflicts: []
            });
        }
        
        console.log('✅ Assistant Director: Rehearsal activities scheduled');
    }

    /**
     * Perform regular status update
     */
    performStatusUpdate() {
        if (!this.currentProduction) return;
        
        // Collect status from all departments
        const statusUpdate = {
            timestamp: new Date(),
            production: this.currentProduction.title,
            departments: Object.fromEntries(this.departmentStatus),
            schedule: {
                onTrack: this.assessScheduleStatus(),
                nextMilestone: this.getNextMilestone(),
                conflicts: this.masterSchedule.conflicts.length
            },
            communication: {
                pendingMessages: this.pendingMessages.size,
                lastUpdate: this.lastStatusUpdate
            }
        };
        
        // Check for issues requiring attention
        const issues = this.identifyStatusIssues(statusUpdate);
        
        if (issues.length > 0) {
            this.handleStatusIssues(issues);
        }
        
        this.lastStatusUpdate = new Date();
        
        // Publish status update
        window.theaterEventBus?.publish('coordination:status-update', {
            status: statusUpdate,
            issues: issues,
            assistantDirector: this.config.name
        });
    }

    /**
     * Handle scheduling conflicts
     */
    async onSchedulingConflict(data) {
        console.log('📋 Assistant Director: Scheduling conflict detected -', data.conflict);
        
        const conflict = {
            id: `conflict_${Date.now()}`,
            type: data.type,
            description: data.conflict,
            parties: data.parties,
            severity: data.severity || 'medium',
            detectedAt: new Date(),
            status: 'active'
        };
        
        this.masterSchedule.conflicts.push(conflict);
        
        // Attempt automatic resolution
        const resolution = await this.attemptConflictResolution(conflict);
        
        if (resolution.success) {
            console.log('✅ Assistant Director: Conflict automatically resolved');
            conflict.status = 'resolved';
            conflict.resolution = resolution;
        } else {
            console.warn('⚠️ Assistant Director: Conflict requires manual intervention');
            await this.escalateConflict(conflict);
        }
    }

    /**
     * Attempt conflict resolution
     */
    async attemptConflictResolution(conflict) {
        console.log('📋 Assistant Director: Attempting conflict resolution...');
        
        switch (conflict.type) {
            case 'double_booking':
                return await this.resolveDoubleBooking(conflict);
            case 'resource_conflict':
                return await this.resolveResourceConflict(conflict);
            case 'timeline_conflict':
                return await this.resolveTimelineConflict(conflict);
            default:
                return { success: false, reason: 'Unknown conflict type' };
        }
    }

    /**
     * Resolve double booking conflict
     */
    async resolveDoubleBooking(conflict) {
        // Find alternative time slots
        const alternatives = this.findAlternativeTimeSlots(conflict.parties);
        
        if (alternatives.length > 0) {
            // Propose rescheduling to least critical party
            const leastCritical = this.identifyLeastCriticalParty(conflict.parties);
            
            return {
                success: true,
                method: 'reschedule',
                action: `Rescheduled ${leastCritical} to ${alternatives[0]}`,
                newTime: alternatives[0]
            };
        }
        
        return { success: false, reason: 'No alternative time slots available' };
    }

    /**
     * Handle department status updates
     */
    onDepartmentUpdate(data) {
        const dept = data.department;
        
        if (this.departmentStatus.has(dept)) {
            this.departmentStatus.set(dept, {
                status: data.status,
                lastUpdate: new Date(),
                currentTask: data.currentTask || null,
                progress: data.progress || null,
                issues: data.issues || []
            });
            
            console.log(`📋 Assistant Director: ${dept} department status updated - ${data.status}`);
            
            // Check if this update affects schedule
            this.checkScheduleImpact(dept, data);
        }
    }

    /**
     * Handle emergency response coordination
     */
    async onEmergencyResponse(data) {
        console.log('🚨 Assistant Director: Emergency response coordination activated');
        
        const emergency = {
            id: `emergency_${Date.now()}`,
            type: data.type,
            severity: data.severity,
            description: data.description,
            reportedAt: new Date(),
            status: 'active'
        };
        
        // Immediate coordination actions
        await this.coordinateEmergencyResponse(emergency);
        
        // Notify all relevant parties
        this.notifyEmergencyContacts(emergency);
        
        // Document response
        this.documentEmergencyResponse(emergency);
    }

    /**
     * Coordinate emergency response
     */
    async coordinateEmergencyResponse(emergency) {
        console.log('🚨 Assistant Director: Coordinating emergency response...');
        
        switch (emergency.type) {
            case 'safety':
                await this.coordinateSafetyEmergency(emergency);
                break;
            case 'technical':
                await this.coordinateTechnicalEmergency(emergency);
                break;
            case 'medical':
                await this.coordinateMedicalEmergency(emergency);
                break;
            case 'security':
                await this.coordinateSecurityEmergency(emergency);
                break;
        }
    }

    /**
     * Send meeting invitations
     */
    sendMeetingInvitations(meeting) {
        for (const participant of meeting.participants) {
            const invitation = {
                type: 'meeting_invitation',
                meeting: meeting.name,
                date: meeting.scheduledDate,
                duration: meeting.duration,
                agenda: meeting.agenda,
                priority: meeting.priority,
                sentAt: new Date()
            };
            
            this.pendingMessages.set(`${participant}_${meeting.name}`, invitation);
            
            // Notify participant
            window.theaterEventBus?.publish('communication:meeting-invitation', {
                recipient: participant,
                invitation: invitation,
                assistantDirector: this.config.name
            });
        }
    }

    /**
     * Get next milestone
     */
    getNextMilestone() {
        const now = new Date();
        let nextMilestone = null;
        let shortestTime = Infinity;
        
        for (const [name, deadline] of this.masterSchedule.deadlines.entries()) {
            if (deadline.endDate > now) {
                const timeToDeadline = deadline.endDate - now;
                if (timeToDeadline < shortestTime) {
                    shortestTime = timeToDeadline;
                    nextMilestone = { name, deadline, timeRemaining: timeToDeadline };
                }
            }
        }
        
        return nextMilestone;
    }

    /**
     * Assess schedule status
     */
    assessScheduleStatus() {
        const completedTasks = Array.from(this.masterSchedule.deadlines.values())
            .filter(task => task.status === 'completed').length;
        
        const totalTasks = this.masterSchedule.deadlines.size;
        const conflictCount = this.masterSchedule.conflicts.filter(c => c.status === 'active').length;
        
        return {
            completion: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
            onTrack: conflictCount === 0,
            conflicts: conflictCount
        };
    }

    /**
     * Get coordination status and metrics
     */
    getCoordinationStatus() {
        return {
            currentProduction: {
                active: !!this.currentProduction,
                title: this.currentProduction?.title,
                phase: this.currentProduction?.status
            },
            schedule: {
                meetings: this.masterSchedule.meetings.size,
                rehearsals: this.masterSchedule.rehearsals.size,
                deadlines: this.masterSchedule.deadlines.size,
                conflicts: this.masterSchedule.conflicts.filter(c => c.status === 'active').length,
                nextMilestone: this.getNextMilestone()
            },
            departments: Object.fromEntries(this.departmentStatus),
            communication: {
                pendingMessages: this.pendingMessages.size,
                lastUpdate: this.lastStatusUpdate,
                protocolsActive: Object.keys(this.communicationProtocols).length
            },
            monitoring: {
                active: this.monitoringActive,
                updateInterval: this.statusUpdateInterval,
                lastCheck: this.lastStatusUpdate
            }
        };
    }

    /**
     * Handle creative brief from production team
     */
    async onCreativeBrief(brief) {
        console.log('📋 Assistant Director: Received creative brief for coordination');
        
        this.currentProduction = brief.production;
        
        // Create coordination plan based on brief
        await this.createCoordinationPlan(brief);
        
        // Schedule creative coordination meetings
        await this.scheduleCreativeCoordination(brief);
    }

    /**
     * Create coordination plan
     */
    async createCoordinationPlan(brief) {
        const coordinationPlan = {
            production: brief.production,
            phases: this.identifyCoordinationPhases(brief),
            keyMeetings: this.identifyKeyMeetings(brief),
            communicationFlow: this.designCommunicationFlow(brief),
            riskFactors: this.identifyCoordinationRisks(brief)
        };
        
        this.currentProduction.coordinationPlan = coordinationPlan;
        console.log('✅ Assistant Director: Coordination plan created');
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('📋 Assistant Director: Concluding production coordination...');
        
        // Stop monitoring
        this.monitoringActive = false;
        
        // Generate final coordination report
        if (this.currentProduction) {
            const finalReport = this.generateFinalCoordinationReport();
            console.log('📊 Assistant Director: Final coordination report generated');
        }
        
        // Clear pending communications
        this.pendingMessages.clear();
        
        console.log('📋 Assistant Director: Production coordination concluded');
    }

    /**
     * Generate final coordination report
     */
    generateFinalCoordinationReport() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            coordination: {
                meetingsHeld: Array.from(this.masterSchedule.meetings.values())
                    .filter(m => m.status === 'completed').length,
                rehearsalsCompleted: Array.from(this.masterSchedule.rehearsals.values())
                    .filter(r => r.status === 'completed').length,
                conflictsResolved: this.masterSchedule.conflicts
                    .filter(c => c.status === 'resolved').length,
                communicationsSent: this.communicationLog.length
            },
            efficiency: {
                scheduleAdherence: this.assessScheduleStatus().completion,
                conflictResolutionRate: this.calculateConflictResolutionRate(),
                communicationEffectiveness: this.assessCommunicationEffectiveness()
            },
            recommendations: this.generateFutureRecommendations()
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssistantDirectorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.AssistantDirectorAgent = AssistantDirectorAgent;
    console.log('📋 Assistant Director Agent loaded - Ready for production coordination');
}