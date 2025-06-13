/**
 * TechnicalDirectorAgent.js - Safety, Logistics, and Technical Production Management
 * 
 * The Technical Director Agent oversees all technical aspects of theater production,
 * ensuring safety protocols, managing technical resources, coordinating equipment,
 * and maintaining production standards across all technical departments.
 * 
 * Features:
 * - Safety protocol enforcement and monitoring
 * - Technical resource management and allocation
 * - Equipment coordination and maintenance tracking
 * - Risk assessment and mitigation strategies
 * - Technical standards compliance
 * - Integration with all production departments
 */

class TechnicalDirectorAgent extends BaseAgent {
    constructor(config = {}) {
        super('technical-director', {
            name: 'Technical Director',
            role: 'technical-director',
            priority: 85, // High priority for safety oversight
            maxActionsPerSecond: 5,
            personality: config.personality || 'methodical',
            ...config
        });
        
        // Technical Director specific properties
        this.safetyLevel = config.safetyLevel || 'strict';
        this.technicalExpertise = config.expertise || 'comprehensive';
        this.riskTolerance = config.riskTolerance || 'low';
        
        // Safety management
        this.safetyProtocols = {
            stage: {
                maxActorsOnStage: 15,
                clearanceZones: ['trap_doors', 'fly_system', 'lighting_positions'],
                emergencyExits: ['stage_left', 'stage_right', 'upstage_center'],
                hazardAreas: ['electrical_panels', 'rigging_points', 'loading_dock']
            },
            equipment: {
                lighting: { maxLoad: 2000, inspection: 'weekly', backup: true },
                audio: { maxDecibels: 85, monitoring: 'continuous', backup: true },
                rigging: { maxWeight: 500, inspection: 'daily', certification: 'required' },
                props: { fireRetardant: true, inspection: 'before_show', storage: 'secure' }
            },
            personnel: {
                requiredTraining: ['safety_basics', 'emergency_procedures', 'equipment_operation'],
                supervision: 'always_present',
                communication: 'headset_system',
                emergencyRoles: new Map()
            }
        };
        
        // Technical resource management
        this.technicalResources = {
            lighting: {
                available: new Set(),
                allocated: new Map(),
                maintenance: new Map(),
                capacity: { channels: 200, power: 5000 }
            },
            audio: {
                available: new Set(),
                allocated: new Map(),
                maintenance: new Map(),
                capacity: { channels: 32, power: 2000 }
            },
            rigging: {
                available: new Set(),
                allocated: new Map(),
                maintenance: new Map(),
                capacity: { points: 20, maxWeight: 500 }
            },
            props: {
                inventory: new Map(),
                location: new Map(),
                condition: new Map(),
                availability: new Map()
            }
        };
        
        // Risk management
        this.riskAssessment = {
            currentRisks: [],
            mitigationStrategies: new Map(),
            riskHistory: [],
            alertThresholds: {
                high: 8,
                medium: 5,
                low: 3
            }
        };
        
        // Technical standards and compliance
        this.technicalStandards = {
            lighting: {
                colorTemperature: { min: 2700, max: 6500 },
                brightness: { min: 50, max: 1000 },
                focusAccuracy: 0.95,
                responseTime: 500
            },
            audio: {
                frequencyResponse: { min: 20, max: 20000 },
                distortion: { max: 0.1 },
                latency: { max: 20 },
                coverage: { uniformity: 0.9 }
            },
            stage: {
                levelTolerance: 2, // mm
                surfaceQuality: 'smooth',
                clearances: { min: 2000 }, // mm
                accessibility: 'ADA_compliant'
            }
        };
        
        // Integration with production system
        this.executiveProducer = null;
        this.creativeDirector = null;
        this.currentProduction = null;
        this.productionPhase = 'idle';
        
        // Technical coordination
        this.technicalMeetings = [];
        this.maintenanceSchedule = new Map();
        this.techRehearsal = {
            scheduled: false,
            completed: false,
            issues: [],
            sign_offs: new Map()
        };
        
        // Monitoring and alerts
        this.monitoringSystems = {
            safety: { active: true, interval: 5000 },
            equipment: { active: true, interval: 10000 },
            performance: { active: true, interval: 1000 }
        };
        
        console.log('🔧 Technical Director Agent: Ready to ensure safe and effective technical production');
    }

    /**
     * Initialize Technical Director with system integration
     */
    async onInitialize() {
        try {
            console.log('🔧 Technical Director: Initializing technical production systems...');
            
            // Connect to executive producer and creative director
            if (window.executiveProducerAgent) {
                this.executiveProducer = window.executiveProducerAgent;
                console.log('🔧 Technical Director: Connected to Executive Producer');
            }
            
            if (window.aiDirectorAgent) {
                this.creativeDirector = window.aiDirectorAgent;
                console.log('🔧 Technical Director: Connected to Creative Director');
            }
            
            // Connect to theater systems
            if (window.stageState) {
                this.stageState = window.stageState;
                console.log('🔧 Technical Director: Connected to stage state management');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize safety monitoring
            await this.initializeSafetyMonitoring();
            
            // Initialize technical systems
            await this.initializeTechnicalSystems();
            
            // Perform initial safety assessment
            await this.performSafetyAssessment();
            
            console.log('🔧 Technical Director: Ready for safe technical production management!')
            
        } catch (error) {
            console.error('🔧 Technical Director: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Subscribe to production events for technical coordination
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('production:phase-change', (data) => this.onPhaseChange(data));
            window.theaterEventBus.subscribe('technical:equipment-needed', (data) => this.onEquipmentRequest(data));
            window.theaterEventBus.subscribe('safety:alert', (data) => this.onSafetyAlert(data));
            window.theaterEventBus.subscribe('performance:started', (data) => this.onPerformanceStarted(data));
            
            console.log('🔧 Technical Director: Subscribed to production events');
        }
    }

    /**
     * Initialize safety monitoring systems
     */
    async initializeSafetyMonitoring() {
        console.log('🔧 Technical Director: Initializing safety monitoring...');
        
        // Set up safety monitoring intervals
        if (this.monitoringSystems.safety.active) {
            setInterval(() => {
                this.performSafetyCheck();
            }, this.monitoringSystems.safety.interval);
        }
        
        // Initialize emergency procedures
        this.emergencyProcedures = {
            fire: {
                steps: ['evacuate_stage', 'alert_authorities', 'account_for_personnel', 'secure_equipment'],
                contacts: ['fire_department', 'building_security', 'executive_producer'],
                equipment: ['fire_extinguishers', 'emergency_lighting', 'evacuation_routes']
            },
            medical: {
                steps: ['assess_situation', 'provide_first_aid', 'call_medical', 'clear_area'],
                contacts: ['emergency_medical', 'on_site_medic', 'venue_management'],
                equipment: ['first_aid_kit', 'aed', 'emergency_contacts']
            },
            technical: {
                steps: ['isolate_problem', 'ensure_safety', 'assess_damage', 'implement_backup'],
                contacts: ['technical_crew', 'equipment_vendors', 'venue_technical'],
                equipment: ['backup_systems', 'emergency_lighting', 'communication_system']
            }
        };
        
        console.log('✅ Technical Director: Safety monitoring initialized');
    }

    /**
     * Initialize technical systems inventory
     */
    async initializeTechnicalSystems() {
        console.log('🔧 Technical Director: Initializing technical systems inventory...');
        
        // Initialize lighting systems
        this.technicalResources.lighting.available = new Set([
            'led_par_64', 'led_strip_light', 'moving_head', 'spotlight', 'flood_light',
            'color_changer', 'strobe_light', 'laser_projector', 'fog_machine', 'haze_machine'
        ]);
        
        // Initialize audio systems
        this.technicalResources.audio.available = new Set([
            'main_speakers', 'monitor_speakers', 'wireless_mic', 'wired_mic', 'di_box',
            'audio_mixer', 'amplifier', 'equalizer', 'compressor', 'reverb_unit'
        ]);
        
        // Initialize rigging systems
        this.technicalResources.rigging.available = new Set([
            'fly_lines', 'battens', 'electric_hoists', 'manual_hoists', 'chain_motors',
            'safety_cables', 'shackles', 'clamps', 'pulleys', 'wire_rope'
        ]);
        
        // Initialize prop categories
        this.technicalResources.props.inventory = new Map([
            ['furniture', new Set(['chairs', 'tables', 'benches', 'platforms'])],
            ['set_pieces', new Set(['flats', 'columns', 'arches', 'stairs'])],
            ['hand_props', new Set(['books', 'weapons', 'tools', 'decorative'])],
            ['special_effects', new Set(['pyrotechnics', 'smoke', 'projections', 'automation'])]
        ]);
        
        console.log('✅ Technical Director: Technical systems inventory initialized');
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🔧 Technical Director: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        this.productionPhase = data.phase;
        
        // Perform production-specific technical assessment
        await this.assessProductionTechnicalNeeds(data.production);
        
        // Create technical timeline
        await this.createTechnicalTimeline(data.production);
        
        // Schedule technical meetings
        this.scheduleTechnicalMeetings();
    }

    /**
     * Handle production phase changes
     */
    async onPhaseChange(data) {
        console.log(`🔧 Technical Director: Phase transition - ${data.previousPhase} → ${data.newPhase}`);
        
        this.productionPhase = data.newPhase;
        
        // Adjust technical focus based on phase
        switch (data.newPhase) {
            case 'design':
                await this.focusOnDesignTechnical();
                break;
            case 'technical':
                await this.focusOnTechnicalRehearsal();
                break;
            case 'rehearsal':
                await this.focusOnRehearsalSupport();
                break;
            case 'performance':
                await this.focusOnPerformanceExecution();
                break;
        }
    }

    /**
     * Assess production technical needs
     */
    async assessProductionTechnicalNeeds(production) {
        console.log('🔧 Technical Director: Assessing technical requirements...');
        
        const assessment = {
            lighting: {
                complexity: this.assessLightingComplexity(production),
                specialRequirements: this.identifySpecialLightingNeeds(production),
                resourcesNeeded: this.calculateLightingResources(production)
            },
            audio: {
                complexity: this.assessAudioComplexity(production),
                specialRequirements: this.identifySpecialAudioNeeds(production),
                resourcesNeeded: this.calculateAudioResources(production)
            },
            rigging: {
                complexity: this.assessRiggingComplexity(production),
                specialRequirements: this.identifySpecialRiggingNeeds(production),
                resourcesNeeded: this.calculateRiggingResources(production)
            },
            safety: {
                riskLevel: this.assessProductionRiskLevel(production),
                specialPrecautions: this.identifySpecialSafetyNeeds(production),
                trainingRequired: this.identifyRequiredTraining(production)
            }
        };
        
        // Store assessment for reference
        this.currentProduction.technicalAssessment = assessment;
        
        console.log('✅ Technical Director: Technical assessment completed');
        return assessment;
    }

    /**
     * Create technical timeline for production
     */
    async createTechnicalTimeline(production) {
        console.log('🔧 Technical Director: Creating technical timeline...');
        
        const timeline = new Map();
        const template = production.template;
        
        // Design phase timeline
        if (template.phases.design) {
            timeline.set('design_kickoff', {
                phase: 'design',
                week: 1,
                activities: ['technical_design_meeting', 'equipment_specification', 'safety_review'],
                deliverables: ['technical_drawings', 'equipment_list', 'safety_plan'],
                responsible: 'technical-director'
            });
        }
        
        // Technical rehearsal timeline
        if (template.phases.technical) {
            timeline.set('tech_rehearsal', {
                phase: 'technical',
                week: template.phases.design + 1,
                activities: ['load_in', 'focus_session', 'sound_check', 'cue_to_cue'],
                deliverables: ['technical_setup', 'cue_sheet', 'safety_check'],
                responsible: 'technical-director'
            });
        }
        
        // Performance timeline
        timeline.set('performance_support', {
            phase: 'performance',
            week: Object.values(template.phases).reduce((a, b) => a + b, 0),
            activities: ['pre_show_check', 'performance_monitoring', 'post_show_notes'],
            deliverables: ['show_report', 'equipment_status', 'issue_log'],
            responsible: 'technical-director'
        });
        
        this.technicalTimeline = timeline;
        console.log('✅ Technical Director: Technical timeline created');
    }

    /**
     * Schedule technical meetings
     */
    scheduleTechnicalMeetings() {
        const meetings = [
            {
                name: 'Production Technical Meeting',
                attendees: ['technical-director', 'creative-director', 'executive-producer'],
                agenda: ['technical_requirements', 'safety_protocols', 'timeline_review'],
                frequency: 'weekly'
            },
            {
                name: 'Lighting Design Review',
                attendees: ['technical-director', 'lighting-designer', 'creative-director'],
                agenda: ['lighting_plot', 'equipment_needs', 'focus_schedule'],
                frequency: 'phase_based'
            },
            {
                name: 'Technical Rehearsal Planning',
                attendees: ['technical-director', 'assistant-director', 'department-heads'],
                agenda: ['rehearsal_schedule', 'crew_assignments', 'emergency_procedures'],
                frequency: 'pre_technical'
            }
        ];
        
        this.technicalMeetings = meetings;
        console.log('📅 Technical Director: Technical meetings scheduled');
    }

    /**
     * Perform routine safety check
     */
    performSafetyCheck() {
        if (!this.isActive) return;
        
        const issues = [];
        
        // Check stage safety
        if (this.stageState?.actors) {
            const actorCount = this.stageState.actors.length;
            if (actorCount > this.safetyProtocols.stage.maxActorsOnStage) {
                issues.push({
                    type: 'safety',
                    severity: 'high',
                    message: `Too many actors on stage: ${actorCount}/${this.safetyProtocols.stage.maxActorsOnStage}`,
                    action: 'Reduce actor count immediately'
                });
            }
        }
        
        // Check equipment status
        this.checkEquipmentSafety(issues);
        
        // Check environmental conditions
        this.checkEnvironmentalSafety(issues);
        
        // Process any issues found
        if (issues.length > 0) {
            this.handleSafetyIssues(issues);
        }
    }

    /**
     * Check equipment safety status
     */
    checkEquipmentSafety(issues) {
        // Check lighting equipment
        const lightingLoad = this.calculateCurrentLightingLoad();
        if (lightingLoad > this.safetyProtocols.equipment.lighting.maxLoad) {
            issues.push({
                type: 'equipment',
                severity: 'high',
                category: 'lighting',
                message: `Lighting load exceeded: ${lightingLoad}W/${this.safetyProtocols.equipment.lighting.maxLoad}W`,
                action: 'Reduce lighting load immediately'
            });
        }
        
        // Check audio levels
        const audioLevel = this.getCurrentAudioLevel();
        if (audioLevel > this.safetyProtocols.equipment.audio.maxDecibels) {
            issues.push({
                type: 'equipment',
                severity: 'medium',
                category: 'audio',
                message: `Audio level too high: ${audioLevel}dB/${this.safetyProtocols.equipment.audio.maxDecibels}dB`,
                action: 'Reduce audio levels'
            });
        }
    }

    /**
     * Check environmental safety conditions
     */
    checkEnvironmentalSafety(issues) {
        // Check temperature
        const temperature = this.getEnvironmentalCondition('temperature');
        if (temperature && (temperature < 18 || temperature > 24)) {
            issues.push({
                type: 'environment',
                severity: 'low',
                message: `Temperature outside comfort range: ${temperature}°C`,
                action: 'Adjust HVAC settings'
            });
        }
        
        // Check emergency exit access
        const emergencyExitsBlocked = this.checkEmergencyExitAccess();
        if (emergencyExitsBlocked.length > 0) {
            issues.push({
                type: 'safety',
                severity: 'critical',
                message: `Emergency exits blocked: ${emergencyExitsBlocked.join(', ')}`,
                action: 'Clear emergency exits immediately'
            });
        }
    }

    /**
     * Handle safety issues
     */
    handleSafetyIssues(issues) {
        for (const issue of issues) {
            console.warn(`⚠️ Technical Director: ${issue.severity.toUpperCase()} - ${issue.message}`);
            
            // Take immediate action for critical issues
            if (issue.severity === 'critical') {
                this.handleCriticalSafetyIssue(issue);
            }
            
            // Log issue for tracking
            this.riskAssessment.currentRisks.push({
                ...issue,
                timestamp: new Date(),
                status: 'identified'
            });
            
            // Notify relevant parties
            window.theaterEventBus?.publish('safety:alert', {
                issue: issue,
                technicalDirector: this.config.name,
                timestamp: new Date()
            });
        }
    }

    /**
     * Handle critical safety issue
     */
    handleCriticalSafetyIssue(issue) {
        console.error(`🚨 CRITICAL SAFETY ISSUE: ${issue.message}`);
        
        // Automatic responses for critical issues
        switch (issue.type) {
            case 'safety':
                if (issue.message.includes('emergency exits')) {
                    this.initiateEmergencyProcedure('evacuation');
                }
                break;
            case 'equipment':
                if (issue.category === 'lighting' && issue.message.includes('load exceeded')) {
                    this.emergencyLightingShutdown();
                }
                break;
        }
    }

    /**
     * Focus on design phase technical work
     */
    async focusOnDesignTechnical() {
        console.log('🔧 Technical Director: Focusing on design phase technical requirements...');
        
        // Review technical designs
        await this.reviewTechnicalDesigns();
        
        // Specify equipment requirements
        await this.specifyEquipmentRequirements();
        
        // Plan technical installation
        await this.planTechnicalInstallation();
    }

    /**
     * Focus on technical rehearsal
     */
    async focusOnTechnicalRehearsal() {
        console.log('🔧 Technical Director: Preparing for technical rehearsal...');
        
        // Schedule load-in
        this.scheduleLoadIn();
        
        // Prepare crew assignments
        this.prepareCrewAssignments();
        
        // Create technical checklist
        this.createTechnicalChecklist();
        
        // Begin technical rehearsal phase
        this.techRehearsal.scheduled = true;
    }

    /**
     * Focus on performance execution
     */
    async focusOnPerformanceExecution() {
        console.log('🔧 Technical Director: Entering performance execution mode...');
        
        // Increase monitoring frequency
        this.monitoringSystems.performance.interval = 500;
        
        // Ensure all backup systems are ready
        await this.verifyBackupSystems();
        
        // Brief crew on show procedures
        this.briefCrewOnShowProcedures();
    }

    /**
     * Handle equipment requests
     */
    async onEquipmentRequest(data) {
        console.log('🔧 Technical Director: Equipment request received -', data.equipment);
        
        const availability = this.checkEquipmentAvailability(data.equipment, data.timeframe);
        
        if (availability.available) {
            await this.allocateEquipment(data.equipment, data.requester, data.timeframe);
            
            window.theaterEventBus?.publish('technical:equipment-allocated', {
                equipment: data.equipment,
                allocatedTo: data.requester,
                timeframe: data.timeframe,
                technicalDirector: this.config.name
            });
        } else {
            await this.handleEquipmentConflict(data, availability);
        }
    }

    /**
     * Calculate current lighting load
     */
    calculateCurrentLightingLoad() {
        // Simulate lighting load calculation
        return Math.floor(Math.random() * 2500); // Mock value
    }

    /**
     * Get current audio level
     */
    getCurrentAudioLevel() {
        // Simulate audio level monitoring
        return Math.floor(Math.random() * 100); // Mock value
    }

    /**
     * Get environmental condition
     */
    getEnvironmentalCondition(type) {
        // Simulate environmental monitoring
        switch (type) {
            case 'temperature':
                return 20 + Math.random() * 8; // 20-28°C range
            case 'humidity':
                return 40 + Math.random() * 20; // 40-60% range
            default:
                return null;
        }
    }

    /**
     * Check emergency exit access
     */
    checkEmergencyExitAccess() {
        // Simulate emergency exit monitoring
        const exits = ['stage_left', 'stage_right', 'upstage_center'];
        const blocked = [];
        
        // Random simulation of blocked exits
        if (Math.random() < 0.05) { // 5% chance of blocked exit
            blocked.push(exits[Math.floor(Math.random() * exits.length)]);
        }
        
        return blocked;
    }

    /**
     * Get technical director status and metrics
     */
    getTechnicalStatus() {
        return {
            currentProduction: {
                active: !!this.currentProduction,
                title: this.currentProduction?.title,
                phase: this.productionPhase
            },
            safety: {
                level: this.safetyLevel,
                currentRisks: this.riskAssessment.currentRisks.length,
                lastCheck: this.lastSafetyCheck,
                monitoring: this.monitoringSystems.safety.active
            },
            technical: {
                resourcesAvailable: {
                    lighting: this.technicalResources.lighting.available.size,
                    audio: this.technicalResources.audio.available.size,
                    rigging: this.technicalResources.rigging.available.size
                },
                resourcesAllocated: {
                    lighting: this.technicalResources.lighting.allocated.size,
                    audio: this.technicalResources.audio.allocated.size,
                    rigging: this.technicalResources.rigging.allocated.size
                }
            },
            techRehearsal: {
                scheduled: this.techRehearsal.scheduled,
                completed: this.techRehearsal.completed,
                issues: this.techRehearsal.issues.length
            },
            meetings: {
                scheduled: this.technicalMeetings.length,
                nextMeeting: this.getNextTechnicalMeeting()
            }
        };
    }

    /**
     * Handle creative brief from production team
     */
    async onCreativeBrief(brief) {
        console.log('🔧 Technical Director: Received creative brief');
        
        this.currentProduction = brief.production;
        
        // Assess technical requirements based on creative brief
        await this.assessProductionTechnicalNeeds(brief.production);
        
        // Create technical implementation plan
        await this.createTechnicalImplementationPlan(brief);
        
        // Respond to creative director with technical considerations
        if (brief.creativeDirector) {
            window.theaterEventBus?.publish('technical:brief-response', {
                production: brief.production,
                technicalConsiderations: this.currentProduction.technicalAssessment,
                recommendations: this.generateTechnicalRecommendations(),
                technicalDirector: this.config.name
            });
        }
    }

    /**
     * Generate technical recommendations
     */
    generateTechnicalRecommendations() {
        return {
            safety: 'Maintain clear emergency exits and monitor actor count',
            lighting: 'Consider LED fixtures for energy efficiency and heat reduction',
            audio: 'Use wireless systems sparingly to avoid interference',
            rigging: 'Schedule regular safety inspections for all hanging elements',
            timeline: 'Allow adequate time for technical rehearsal and troubleshooting'
        };
    }

    /**
     * Emergency lighting shutdown
     */
    emergencyLightingShutdown() {
        console.error('🚨 Technical Director: Emergency lighting shutdown initiated');
        
        // Implement emergency lighting reduction
        // This would interface with actual lighting control systems
        
        window.theaterEventBus?.publish('technical:emergency-shutdown', {
            system: 'lighting',
            reason: 'Overload protection',
            technicalDirector: this.config.name
        });
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🔧 Technical Director: Concluding technical production management...');
        
        // Clear monitoring intervals
        if (this.safetyMonitoringInterval) {
            clearInterval(this.safetyMonitoringInterval);
        }
        
        // Generate final technical report
        if (this.currentProduction) {
            const finalReport = this.generateFinalTechnicalReport();
            console.log('📝 Technical Director: Final technical report generated');
        }
        
        console.log('🔧 Technical Director: Technical systems secured');
    }

    /**
     * Generate final technical report
     */
    generateFinalTechnicalReport() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            safetyRecord: {
                incidents: this.riskAssessment.riskHistory.length,
                risksIdentified: this.riskAssessment.currentRisks.length,
                mitigationsImplemented: this.riskAssessment.mitigationStrategies.size
            },
            technicalSummary: {
                equipmentUsed: this.getTechnicalEquipmentSummary(),
                issuesResolved: this.getTechnicalIssuesSummary(),
                recommendations: this.generateFutureRecommendations()
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechnicalDirectorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.TechnicalDirectorAgent = TechnicalDirectorAgent;
    console.log('🔧 Technical Director Agent loaded - Ready for safe technical production');
}