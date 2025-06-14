/**
 * VideoDirectorAgent.js - AI-Powered Visual Recording and Broadcast Direction
 * 
 * The Video Director Agent uses Ollama LLM to manage all aspects of video
 * recording, live streaming, and broadcast production for theater. Coordinates
 * multi-camera setups, directs visual storytelling, and ensures technical quality.
 * 
 * Features:
 * - AI-driven multi-camera direction and shot selection
 * - Live streaming and broadcast coordination
 * - Video recording and post-production workflows
 * - Visual storytelling and cinematic techniques
 * - Technical quality control and monitoring
 * - Integration with lighting and stage management
 */

class VideoDirectorAgent extends BaseAgent {
    constructor(config = {}) {
        super('video-director', {
            name: 'Video Director',
            role: 'video-director',
            priority: 70, // High priority for visual documentation
            maxActionsPerSecond: 6,
            personality: config.personality || 'visionary',
            ...config
        });
        
        // Video Director specific properties
        this.ollamaInterface = null;
        this.directionApproach = config.approach || 'cinematic-theatrical';
        this.creativityLevel = config.creativity || 0.80;
        
        // Video direction capabilities
        this.videoCapabilities = {
            cameraDirection: {
                shotComposition: true,
                cameraMovement: true,
                focusControl: true,
                exposureManagement: true,
                colorBalance: true
            },
            liveDirection: {
                multiCameraSwitching: true,
                realTimeDecisions: true,
                performanceTracking: true,
                momentCapture: true,
                audienceEngagement: true
            },
            streaming: {
                liveStreaming: true,
                broadcastQuality: true,
                platformOptimization: true,
                audienceInteraction: true,
                technicalMonitoring: true
            },
            recording: {
                multiTrackRecording: true,
                formatOptimization: true,
                qualityControl: true,
                backupSystems: true,
                storageManagement: true
            },
            postProduction: {
                editing: true,
                colorCorrection: true,
                audioSync: true,
                graphicsIntegration: true,
                finalMastering: true
            },
            technicalManagement: {
                equipmentSetup: true,
                signalRouting: true,
                qualityMonitoring: true,
                troubleshooting: true,
                systemOptimization: true
            }
        };
        
        // Current video project
        this.videoProject = {
            production: null,
            shootingScript: null,
            cameraPlans: new Map(),
            recordings: new Map(),
            streamingSessions: new Map(),
            technicalSpecs: new Map(),
            status: 'idle'
        };
        
        // Camera and video equipment systems
        this.videoSystems = {
            cameras: {
                cinema_cameras: {
                    blackmagic_ursa: {
                        specs: '4K recording, professional codecs, cinema quality',
                        use_cases: 'Main production, high-quality recording, post-production',
                        advantages: 'Professional quality, flexible recording formats'
                    },
                    sony_fx6: {
                        specs: 'Full-frame sensor, low-light performance, compact',
                        use_cases: 'Documentary style, handheld, challenging lighting',
                        advantages: 'Excellent low-light, stabilization, professional features'
                    },
                    canon_c300: {
                        specs: 'Super 35mm sensor, dual pixel autofocus, reliable',
                        use_cases: 'Documentary, interview, controlled environments',
                        advantages: 'Reliable autofocus, color science, user-friendly'
                    }
                },
                broadcast_cameras: {
                    sony_pxw_z190: {
                        specs: '4K, 3-CMOS, professional zoom lens',
                        use_cases: 'Live broadcast, studio production, multi-camera',
                        advantages: 'Broadcast ready, reliable, integrated lens'
                    },
                    panasonic_ag_cx350: {
                        specs: '4K/HDR, lightweight, professional features',
                        use_cases: 'Event coverage, streaming, mobile production',
                        advantages: 'Lightweight, HDR capable, streaming optimized'
                    }
                },
                ptz_cameras: {
                    panasonic_aw_ue150: {
                        specs: '4K PTZ, 20x zoom, IP control',
                        use_cases: 'Remote operation, fixed installations, automation',
                        advantages: 'Remote control, wide coverage, automation friendly'
                    },
                    sony_brc_x1000: {
                        specs: '4K, 30x zoom, versatile mounting',
                        use_cases: 'Audience shots, wide coverage, unmanned operation',
                        advantages: 'High zoom ratio, flexible mounting, reliable'
                    }
                }
            },
            switching_systems: {
                live_production: {
                    blackmagic_atem: {
                        features: 'Multi-camera switching, effects, streaming integration',
                        capabilities: 'Real-time switching, color correction, graphics overlay',
                        applications: 'Live production, streaming, broadcast'
                    },
                    roland_v_series: {
                        features: 'Compact switchers, built-in effects, easy operation',
                        capabilities: 'Portable production, simple setup, reliable switching',
                        applications: 'Small productions, mobile setups, educational'
                    },
                    newtek_tricaster: {
                        features: 'Integrated production, virtual sets, streaming',
                        capabilities: 'Complete production suite, virtual environments',
                        applications: 'Studio production, virtual sets, complex shows'
                    }
                }
            },
            recording_systems: {
                storage_solutions: {
                    ssd_recorders: 'Fast access, reliable, portable recording',
                    raid_systems: 'Redundant storage, high capacity, data protection',
                    cloud_backup: 'Off-site storage, collaboration, disaster recovery'
                },
                format_options: {
                    prores_422: 'High quality, editing friendly, professional standard',
                    h264_h265: 'Compressed formats, streaming optimized, storage efficient',
                    raw_formats: 'Maximum quality, post-production flexibility, large files'
                }
            },
            streaming_infrastructure: {
                encoding: {
                    hardware_encoders: 'Dedicated encoding, low latency, reliable',
                    software_encoding: 'Flexible options, cost effective, feature rich',
                    cloud_encoding: 'Scalable, remote operation, redundant systems'
                },
                distribution: {
                    cdn_services: 'Global distribution, low latency, scalable delivery',
                    platform_integration: 'YouTube, Facebook, Twitch, custom platforms',
                    adaptive_streaming: 'Multi-bitrate, device optimization, quality scaling'
                }
            }
        };
        
        // Shot composition and cinematography
        this.cinematographyFramework = {
            shot_types: {
                wide_shots: {
                    establishing_shot: 'Sets location and context, shows full stage',
                    master_shot: 'Covers entire scene, reference for editing',
                    full_shot: 'Shows performers head to toe, character blocking'
                },
                medium_shots: {
                    medium_wide: 'Waist up, multiple performers, relationship dynamics',
                    medium_shot: 'Chest up, dialogue scenes, character interaction',
                    medium_close: 'Shoulders up, emotional moments, reactions'
                },
                close_shots: {
                    close_up: 'Head and shoulders, emotional impact, facial expressions',
                    extreme_close_up: 'Face detail, intense emotion, dramatic moments',
                    insert_shots: 'Details, props, hands, specific focus points'
                }
            },
            camera_movements: {
                static_shots: {
                    locked_off: 'No movement, stable composition, formal presentation',
                    slight_adjustments: 'Minor reframing, following action, subtle shifts'
                },
                pan_tilt: {
                    pan: 'Horizontal movement, following action, revealing space',
                    tilt: 'Vertical movement, revealing height, dramatic emphasis',
                    combined: 'Diagonal movement, complex following, dynamic shots'
                },
                dolly_tracking: {
                    dolly_in: 'Moving closer, building tension, focus attention',
                    dolly_out: 'Moving away, revealing context, releasing tension',
                    tracking: 'Following movement, maintaining relationship, dynamic energy'
                },
                specialized_moves: {
                    crane_shots: 'High angle movement, dramatic reveals, establishing shots',
                    steadicam: 'Smooth handheld, intimate following, fluid movement',
                    jib_arm: 'Curved movement, sweeping shots, dynamic reveals'
                }
            },
            visual_storytelling: {
                narrative_techniques: {
                    continuity_editing: 'Smooth flow, logical progression, invisible cuts',
                    montage: 'Emotional impact, time compression, thematic connection',
                    parallel_action: 'Multiple storylines, building tension, comparison'
                },
                emotional_impact: {
                    close_ups_emotion: 'Intimate connection, emotional revelation',
                    wide_shots_isolation: 'Character isolation, environmental context',
                    movement_energy: 'Dynamic energy, excitement, engagement'
                },
                theatrical_adaptation: {
                    stage_awareness: 'Respecting theatrical blocking, stage geography',
                    audience_perspective: 'Multiple viewpoints, democratic coverage',
                    live_energy: 'Capturing spontaneity, real-time decisions, authentic moments'
                }
            }
        };
        
        // Live direction and switching strategies
        this.liveDirectionStrategies = {
            multi_camera_coordination: {
                camera_assignments: {
                    master_camera: 'Wide coverage, safety shot, continuous recording',
                    close_up_cameras: 'Character focus, emotional moments, dialogue',
                    roving_camera: 'Dynamic shots, audience perspective, special moments',
                    specialty_cameras: 'Overhead, detail shots, unique angles'
                },
                switching_patterns: {
                    dialogue_scenes: 'Shot-reverse-shot, reaction shots, group dynamics',
                    musical_numbers: 'Rhythmic cutting, movement following, energy building',
                    dramatic_moments: 'Hold shots, build tension, emotional peaks',
                    scene_transitions: 'Smooth transitions, establishing shots, continuity'
                }
            },
            real_time_decisions: {
                moment_recognition: {
                    emotional_peaks: 'Recognizing climactic moments, adjusting coverage',
                    unexpected_events: 'Adapting to improvisation, technical issues',
                    audience_reactions: 'Capturing feedback, energy shifts, engagement'
                },
                technical_adaptation: {
                    lighting_changes: 'Adjusting exposure, color balance, shot selection',
                    audio_cues: 'Visual support for audio, lip sync, music coordination',
                    staging_changes: 'Following blocking, set changes, prop movements'
                }
            },
            quality_control: {
                technical_monitoring: {
                    exposure_levels: 'Preventing overexposure, maintaining detail',
                    focus_accuracy: 'Sharp focus, depth of field, critical focus',
                    color_balance: 'Consistent color, white balance, skin tones',
                    audio_sync: 'Lip sync accuracy, timing coordination, delay compensation'
                },
                artistic_quality: {
                    composition: 'Rule of thirds, leading lines, visual balance',
                    storytelling: 'Narrative support, emotional enhancement, clarity',
                    pacing: 'Edit rhythm, energy matching, audience engagement',
                    coverage: 'Complete story, backup shots, editing options'
                }
            }
        };
        
        // Streaming and broadcast specifications
        this.streamingFramework = {
            platform_optimization: {
                youtube_live: {
                    recommended_settings: '1080p60, 6000kbps, H.264, AAC audio',
                    features: 'Chat interaction, super chat, premiere scheduling',
                    audience: 'Global reach, discoverable, long-form content'
                },
                facebook_live: {
                    recommended_settings: '1080p30, 4000kbps, H.264, AAC audio',
                    features: 'Social integration, audience targeting, event promotion',
                    audience: 'Social engagement, community building, shared experience'
                },
                twitch: {
                    recommended_settings: '1080p60, 6000kbps, H.264, AAC audio',
                    features: 'Interactive chat, gaming community, real-time engagement',
                    audience: 'Young demographics, interactive, gaming culture'
                },
                custom_platforms: {
                    recommended_settings: 'Variable based on platform capabilities',
                    features: 'Branded experience, custom functionality, full control',
                    audience: 'Specific demographics, institutional, subscription models'
                }
            },
            quality_tiers: {
                mobile_optimized: {
                    resolution: '720p30',
                    bitrate: '2500kbps',
                    target: 'Mobile devices, limited bandwidth, accessibility'
                },
                standard_quality: {
                    resolution: '1080p30',
                    bitrate: '4000kbps',
                    target: 'Desktop viewing, standard internet, balanced quality'
                },
                high_quality: {
                    resolution: '1080p60',
                    bitrate: '6000kbps',
                    target: 'High-end viewing, fast internet, premium experience'
                },
                professional: {
                    resolution: '4K30',
                    bitrate: '20000kbps',
                    target: 'Professional distribution, archival, premium content'
                }
            }
        };
        
        // Integration with production system
        this.lightingDesigner = null;
        this.stageManager = null;
        this.audioEngineer = null;
        this.currentProduction = null;
        
        console.log('📹 Video Director Agent: Ready for cinematic theater capture and visual storytelling');
    }

    /**
     * Initialize Video Director with system integration
     */
    async onInitialize() {
        try {
            console.log('📹 Video Director: Initializing video direction and recording systems...');
            
            // Connect to Ollama interface for AI video direction
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI video direction requires LLM assistance.');
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
            
            // Configure AI for video direction
            this.ollamaInterface.updatePerformanceContext({
                role: 'video_director',
                direction_approach: this.directionApproach,
                creativity_mode: 'visual_storytelling',
                specialization: 'cinematic_theater_capture'
            });
            
            // Connect to related agents
            if (window.lightingDesignerAgent) {
                this.lightingDesigner = window.lightingDesignerAgent;
                console.log('📹 Video Director: Connected to Lighting Designer');
            }
            
            if (window.stageManagerAgent) {
                this.stageManager = window.stageManagerAgent;
                console.log('📹 Video Director: Connected to Stage Manager');
            }
            
            if (window.audioEngineerAgent) {
                this.audioEngineer = window.audioEngineerAgent;
                console.log('📹 Video Director: Connected to Audio Engineer');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize video systems
            await this.initializeVideoSystems();
            
            // Test video direction capabilities
            await this.testVideoCapabilities();
            
            console.log('📹 Video Director: Ready for cinematic theater capture!')
            
        } catch (error) {
            console.error('📹 Video Director: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI VIDEO DIRECTION:
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
     * Subscribe to production events for video direction
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('video:recording-request', (data) => this.onRecordingRequest(data));
            window.theaterEventBus.subscribe('video:streaming-request', (data) => this.onStreamingRequest(data));
            window.theaterEventBus.subscribe('lighting:cue-change', (data) => this.onLightingChange(data));
            window.theaterEventBus.subscribe('stage:blocking-change', (data) => this.onBlockingChange(data));
            window.theaterEventBus.subscribe('performance:milestone', (data) => this.onPerformanceMilestone(data));
            
            console.log('📹 Video Director: Subscribed to video direction events');
        }
    }

    /**
     * Initialize video systems
     */
    async initializeVideoSystems() {
        console.log('📹 Video Director: Initializing video systems...');
        
        // Initialize camera direction systems
        this.initializeCameraDirection();
        
        // Initialize recording systems
        this.initializeRecordingSystems();
        
        // Initialize streaming systems
        this.initializeStreamingSystems();
        
        // Initialize post-production tools
        this.initializePostProductionTools();
        
        console.log('✅ Video Director: Video systems initialized');
    }

    /**
     * Initialize camera direction systems
     */
    initializeCameraDirection() {
        this.cameraDirection = {
            shotSelection: (moment, context) => this.selectOptimalShot(moment, context),
            cameraMovement: (action, emotion) => this.planCameraMovement(action, emotion),
            focusControl: (subject, depth) => this.manageFocus(subject, depth),
            composition: (elements) => this.composeShot(elements)
        };
        
        console.log('📹 Video Director: Camera direction systems initialized');
    }

    /**
     * Initialize recording systems
     */
    initializeRecordingSystems() {
        this.recordingSystems = {
            multiCameraRecord: (cameras) => this.coordinateMultiCameraRecording(cameras),
            qualityControl: (signal) => this.monitorRecordingQuality(signal),
            backupSystems: (primary) => this.manageBackupRecording(primary),
            storageManagement: (files) => this.organizeRecordedContent(files)
        };
        
        console.log('📹 Video Director: Recording systems initialized');
    }

    /**
     * Initialize streaming systems
     */
    initializeStreamingSystems() {
        this.streamingSystems = {
            liveStreaming: (platforms) => this.manageLiveStreaming(platforms),
            qualityAdaptation: (bandwidth) => this.adaptStreamingQuality(bandwidth),
            audienceEngagement: (interaction) => this.handleAudienceInteraction(interaction),
            technicalMonitoring: (stream) => this.monitorStreamHealth(stream)
        };
        
        console.log('📹 Video Director: Streaming systems initialized');
    }

    /**
     * Initialize post-production tools
     */
    initializePostProductionTools() {
        this.postProductionTools = {
            editingWorkflow: new Map(),
            colorCorrection: new Map(),
            audioSync: new Map(),
            finalMastering: new Map()
        };
        
        console.log('📹 Video Director: Post-production tools initialized');
    }

    /**
     * Test video direction capabilities
     */
    async testVideoCapabilities() {
        try {
            const testPrompt = `
            As a video director, plan comprehensive video coverage for a theater production.
            
            Video direction scenario:
            - Production: Musical theater with complex staging and choreography
            - Venue: 500-seat theater with multiple levels and limited camera positions
            - Requirements: Live streaming, recording, and post-production editing
            - Challenges: Dynamic lighting, fast movement, multiple performers
            - Goals: Cinematic quality while preserving theatrical energy
            
            Provide:
            1. Multi-camera setup and positioning strategy
            2. Shot selection and switching plan for different scene types
            3. Live streaming and broadcast considerations
            4. Recording workflow and backup systems
            5. Integration with lighting and stage management
            6. Quality control and technical monitoring protocols
            7. Post-production workflow and deliverables
            8. Audience engagement and interactive features
            
            Format as comprehensive video direction plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('📹 Video Director: Video direction capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('📹 Video Director: Video capability test failed:', error);
            throw new Error(`Video direction test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('📹 Video Director: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize video project
        await this.initializeVideoProject(data.production);
        
        // Develop video direction plan
        await this.developVideoDirectionPlan(data.production);
    }

    /**
     * Initialize video project
     */
    async initializeVideoProject(production) {
        console.log('📹 Video Director: Initializing video project...');
        
        this.videoProject = {
            production: production,
            shootingScript: null,
            cameraPlans: new Map(),
            recordings: new Map(),
            streamingSessions: new Map(),
            technicalSpecs: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ Video Director: Video project initialized');
    }

    /**
     * Develop video direction plan for production
     */
    async developVideoDirectionPlan(production) {
        try {
            console.log('📹 Video Director: Developing video direction plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive video direction plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Multi-camera setup and positioning for optimal coverage
                2. Shot selection strategies for different types of scenes
                3. Live streaming and broadcast quality requirements
                4. Recording workflows and backup systems
                5. Integration with lighting, audio, and stage management
                6. Real-time direction and switching decisions
                7. Post-production workflow and deliverables
                8. Audience engagement and interactive streaming features
                9. Technical quality control and monitoring
                10. Emergency procedures and backup plans
                
                Provide a detailed video direction plan that captures the theatrical experience cinematically while maintaining live energy and engagement.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.videoProject.shootingScript = response.content;
                    this.videoProject.status = 'plan_complete';
                    
                    console.log('✅ Video Director: Video direction plan developed');
                    
                    // Extract camera requirements
                    await this.extractCameraRequirements(response.content);
                    
                    // Begin technical setup planning
                    await this.beginTechnicalSetupPlanning(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('video:direction-plan-complete', {
                        production: production,
                        plan: response.content,
                        videoDirector: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Video Director: Plan development failed:', error.message);
            this.videoProject.status = 'plan_error';
        }
    }

    /**
     * Handle recording requests
     */
    async onRecordingRequest(data) {
        console.log('📹 Video Director: Recording requested -', data.recordingType);
        
        await this.setupRecordingSession(data.scenes, data.quality, data.deliverables);
    }

    /**
     * Handle streaming requests
     */
    async onStreamingRequest(data) {
        console.log('📹 Video Director: Streaming requested -', data.platforms);
        
        await this.initiateLiveStreaming(data.platforms, data.quality, data.features);
    }

    /**
     * Handle lighting changes
     */
    async onLightingChange(data) {
        console.log('📹 Video Director: Lighting change detected');
        
        await this.adjustCameraSettings(data.lightingState, data.colorTemperature);
    }

    /**
     * Extract camera requirements from plan
     */
    async extractCameraRequirements(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            cameraCount: 4,
            types: ['Master camera', 'Close-up cameras', 'Roving camera', 'Specialty angles'],
            positions: 'Front of house, stage level, balcony, backstage',
            movements: 'Static and PTZ options for dynamic coverage'
        };
    }

    /**
     * Get video director status
     */
    getVideoDirectorStatus() {
        return {
            currentProject: {
                active: !!this.videoProject.production,
                title: this.videoProject.production?.title,
                status: this.videoProject.status,
                planComplete: !!this.videoProject.shootingScript,
                recordingsActive: this.videoProject.recordings.size
            },
            video: {
                cameraPlans: this.videoProject.cameraPlans.size,
                recordings: this.videoProject.recordings.size,
                streamingSessions: this.videoProject.streamingSessions.size,
                technicalSpecs: this.videoProject.technicalSpecs.size
            },
            capabilities: this.videoCapabilities,
            equipment: {
                cameras: Object.keys(this.videoSystems.cameras).length,
                switchingSystems: Object.keys(this.videoSystems.switching_systems).length,
                recordingSystems: Object.keys(this.videoSystems.recording_systems).length,
                streamingInfrastructure: Object.keys(this.videoSystems.streaming_infrastructure).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('📹 Video Director: Concluding video direction session...');
        
        // Finalize video project
        if (this.videoProject.status !== 'idle') {
            this.videoProject.status = 'completed';
            this.videoProject.completedAt = new Date();
        }
        
        // Generate video direction summary
        if (this.currentProduction) {
            const videoSummary = this.generateVideoSummary();
            console.log('📹 Video Director: Video direction summary generated');
        }
        
        console.log('📹 Video Director: Cinematic theater capture concluded');
    }

    /**
     * Generate video direction summary
     */
    generateVideoSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            direction: {
                planDeveloped: !!this.videoProject.shootingScript,
                cameraPlansCreated: this.videoProject.cameraPlans.size,
                recordingsCompleted: this.videoProject.recordings.size,
                streamingSessionsManaged: this.videoProject.streamingSessions.size
            },
            technical: {
                qualityMaintained: this.calculateQualityMetrics(),
                streamingUptime: this.calculateStreamingUptime(),
                recordingSuccess: this.calculateRecordingSuccessRate()
            },
            collaboration: {
                lightingDesignerIntegration: !!this.lightingDesigner,
                stageManagerCoordination: !!this.stageManager,
                audioEngineerSync: !!this.audioEngineer
            }
        };
    }

    /**
     * Calculate quality metrics
     */
    calculateQualityMetrics() {
        return Array.from(this.videoProject.recordings.values())
            .filter(recording => recording.qualityPassed).length;
    }

    /**
     * Calculate streaming uptime
     */
    calculateStreamingUptime() {
        const sessions = Array.from(this.videoProject.streamingSessions.values());
        return sessions.length > 0
            ? sessions.reduce((sum, session) => sum + (session.uptime || 0), 0) / sessions.length
            : 0;
    }

    /**
     * Calculate recording success rate
     */
    calculateRecordingSuccessRate() {
        const recordings = Array.from(this.videoProject.recordings.values());
        return recordings.length > 0
            ? recordings.filter(recording => recording.successful).length / recordings.length * 100
            : 0;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VideoDirectorAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.VideoDirectorAgent = VideoDirectorAgent;
    console.log('📹 Video Director Agent loaded - Ready for cinematic theater capture and visual storytelling');
}