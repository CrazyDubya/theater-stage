/**
 * AudioEngineerAgent.js - AI-Powered Audio Engineering and Technical Support
 * 
 * The Audio Engineer Agent uses Ollama LLM to manage all technical aspects
 * of audio production, from recording and mixing to live sound reinforcement
 * and troubleshooting. Provides expert-level audio engineering support.
 * 
 * Features:
 * - AI-driven audio system design and optimization
 * - Recording, mixing, and mastering workflows
 * - Live sound engineering and monitoring
 * - Audio equipment management and troubleshooting
 * - Acoustic analysis and room optimization
 * - Digital audio workstation (DAW) coordination
 */

class AudioEngineerAgent extends BaseAgent {
    constructor(config = {}) {
        super('audio-engineer', {
            name: 'Audio Engineer',
            role: 'audio-engineer',
            priority: 75, // High priority for technical audio support
            maxActionsPerSecond: 8,
            personality: config.personality || 'technical',
            ...config
        });
        
        // Audio Engineer specific properties
        this.ollamaInterface = null;
        this.engineeringApproach = config.approach || 'precision-focused';
        this.creativityLevel = config.creativity || 0.65;
        
        // Audio engineering capabilities
        this.audioCapabilities = {
            systemDesign: {
                acousticAnalysis: true,
                speakerPlacement: true,
                microphoneSelection: true,
                signalFlow: true,
                roomOptimization: true
            },
            recording: {
                multitrackRecording: true,
                microphoneTechniques: true,
                levelOptimization: true,
                noiseCancellation: true,
                qualityControl: true
            },
            mixing: {
                balanceMixing: true,
                equalization: true,
                compression: true,
                effects: true,
                spatialAudio: true
            },
            liveSound: {
                reinforcement: true,
                monitoring: true,
                feedbackElimination: true,
                realTimeAdjustment: true,
                emergencyResponse: true
            },
            technicalSupport: {
                equipmentMaintenance: true,
                troubleshooting: true,
                systemCalibration: true,
                signalAnalysis: true,
                performanceOptimization: true
            },
            postProduction: {
                mastering: true,
                restoration: true,
                formatConversion: true,
                archiving: true,
                distributionPrep: true
            }
        };
        
        // Current audio project
        this.audioProject = {
            production: null,
            audioDesign: null,
            recordings: new Map(),
            mixes: new Map(),
            systemSetup: new Map(),
            technicalSpecs: new Map(),
            status: 'idle'
        };
        
        // Audio equipment and systems
        this.audioSystems = {
            recording_equipment: {
                microphones: {
                    dynamic: {
                        shure_sm58: 'Vocal microphone, stage performance, feedback rejection',
                        shure_sm57: 'Instrument microphone, versatile, durable',
                        electro_voice_re20: 'Broadcast quality, deep voice, low handling noise'
                    },
                    condenser: {
                        neumann_u87: 'Studio standard, vocal recording, warm tone',
                        akg_c414: 'Versatile, multiple patterns, instrument recording',
                        rode_nt1a: 'Low noise, vocal recording, budget friendly'
                    },
                    ribbon: {
                        royer_r121: 'Vintage tone, guitar amps, smooth highs',
                        coles_4038: 'Classic sound, vocals, room ambience'
                    },
                    specialty: {
                        countryman_di: 'Direct injection, instruments, clean signal',
                        dpa_4099: 'Instrument clip-on, natural sound, low profile'
                    }
                },
                preamps_interfaces: {
                    focusrite_scarlett: 'USB interface, home recording, portable',
                    universal_audio_apollo: 'Professional interface, DSP processing, low latency',
                    ssl_alpha_link: 'Analog conversion, mix bus processing, professional grade',
                    neve_1073: 'Classic preamp, vintage tone, musical EQ'
                },
                monitoring: {
                    yamaha_ns10: 'Reference monitors, mix translation, industry standard',
                    genelec_8040: 'Active monitors, accurate response, near field',
                    avantone_mixcubes: 'Small speakers, mono reference, real world check',
                    sony_mdr7506: 'Headphones, accurate, comfortable, industry standard'
                }
            },
            live_sound_equipment: {
                mixing_consoles: {
                    yamaha_ql5: 'Digital console, scene recall, comprehensive routing',
                    soundcraft_vi3000: 'Live mixing, intuitive interface, reliable',
                    behringer_x32: 'Affordable digital, full features, expandable',
                    analog_ssl_aws: 'Analog warmth, tactile control, premium sound'
                },
                amplification: {
                    crown_xti: 'Power amplifiers, DSP processing, network control',
                    qsc_plx: 'Lightweight, efficient, reliable amplification',
                    lab_gruppen: 'Professional grade, high power, low distortion'
                },
                speakers: {
                    meyer_sound: 'Self-powered, touring grade, excellent dispersion',
                    jbl_srx: 'Portable PA, versatile, good value',
                    l_acoustics: 'Line array, large venues, precise control',
                    electro_voice: 'Classic designs, reliable, various sizes'
                },
                wireless: {
                    shure_axient: 'Digital wireless, frequency coordination, reliable',
                    sennheiser_ew: 'Affordable wireless, good range, easy setup',
                    audio_technica: 'Diverse options, reliable, budget conscious'
                }
            },
            signal_processing: {
                equalizers: {
                    graphic_eq: '31-band, feedback control, room tuning',
                    parametric_eq: 'Surgical EQ, precise control, problem solving',
                    dynamic_eq: 'Frequency-dependent, automatic adjustment'
                },
                dynamics: {
                    compressors: 'Level control, punch enhancement, consistency',
                    limiters: 'Peak protection, distortion prevention',
                    gates: 'Noise elimination, attack enhancement, cleanup'
                },
                effects: {
                    reverb: 'Space simulation, ambience, depth',
                    delay: 'Echo effects, rhythmic enhancement, space creation',
                    chorus: 'Thickening, stereo width, movement',
                    distortion: 'Character addition, saturation, edge'
                }
            },
            measurement_tools: {
                analyzers: {
                    real_time_analyzer: 'Frequency response, room analysis, feedback identification',
                    spectrum_analyzer: 'Signal analysis, harmonic content, noise measurement',
                    phase_analyzer: 'Timing analysis, alignment verification, coherence check'
                },
                meters: {
                    vu_meters: 'Average level, musical response, mix balance',
                    peak_meters: 'Instantaneous peaks, overload prevention',
                    correlation_meters: 'Stereo compatibility, phase relationship'
                },
                generators: {
                    tone_generator: 'Test signals, system alignment, troubleshooting',
                    noise_generator: 'Pink noise, white noise, measurement signals',
                    sweep_generator: 'Frequency response, impulse response, acoustic measurement'
                }
            }
        };
        
        // Recording and mixing methodologies
        this.audioMethodologies = {
            recording_techniques: {
                close_miking: {
                    description: 'Microphone placed close to source for direct sound capture',
                    advantages: 'Isolation, control, consistent level, reduced bleed',
                    considerations: 'May sound unnatural, proximity effect, limited ambience',
                    applications: 'Vocals, instruments, controlled environments'
                },
                ambient_miking: {
                    description: 'Microphones placed to capture room acoustics and natural sound',
                    advantages: 'Natural sound, spatial information, acoustic enhancement',
                    considerations: 'Room noise, less control, potential feedback',
                    applications: 'Orchestra, choir, acoustic instruments, live performance'
                },
                stereo_techniques: {
                    xy_technique: 'Coincident pair, good mono compatibility, focused image',
                    ab_technique: 'Spaced pair, wide stereo image, natural spaciousness',
                    ms_technique: 'Mid-side, adjustable width, excellent mono compatibility',
                    ortf_technique: 'Near-coincident, realistic imaging, good balance'
                }
            },
            mixing_philosophies: {
                naturalistic: {
                    description: 'Maintain natural sound relationships and spatial positioning',
                    approach: 'Minimal processing, preserve source character, acoustic enhancement',
                    applications: 'Classical music, acoustic performances, documentary style'
                },
                creative: {
                    description: 'Use processing as artistic tool to enhance creative vision',
                    approach: 'Effects as instruments, sonic landscapes, artistic expression',
                    applications: 'Contemporary music, theatrical soundscapes, experimental work'
                },
                commercial: {
                    description: 'Optimize for impact, clarity, and wide audience appeal',
                    approach: 'Controlled dynamics, enhanced clarity, competitive loudness',
                    applications: 'Popular music, broadcast, mass market productions'
                }
            },
            live_mixing_strategies: {
                gain_structure: {
                    importance: 'Foundation of good sound, signal-to-noise optimization',
                    approach: 'Proper input levels, headroom management, clean signal path',
                    monitoring: 'Meter readings, listening tests, system calibration'
                },
                feedback_control: {
                    prevention: 'Microphone placement, EQ notching, gain control',
                    identification: 'Frequency analysis, ring out process, systematic approach',
                    elimination: 'Quick response, minimal disruption, problem solving'
                },
                monitor_mixing: {
                    approach: 'Individual needs, clear communication, musical balance',
                    techniques: 'Wedge placement, IEM mixing, ambient control',
                    troubleshooting: 'Feedback issues, level requests, equipment problems'
                }
            }
        };
        
        // Acoustic analysis and room optimization
        this.acousticFramework = {
            room_analysis: {
                frequency_response: {
                    measurement: 'Pink noise, swept sine, impulse response analysis',
                    interpretation: 'Resonances, nulls, overall balance, problem areas',
                    correction: 'EQ adjustment, physical treatment, speaker placement'
                },
                reverberation_time: {
                    measurement: 'RT60, early decay time, clarity measurements',
                    interpretation: 'Speech intelligibility, musical balance, acoustic character',
                    optimization: 'Absorption, diffusion, room treatment, timing adjustments'
                },
                sound_isolation: {
                    assessment: 'Noise floor, external interference, internal leakage',
                    improvement: 'Sealing, barriers, isolation techniques, scheduling'
                }
            },
            speaker_placement: {
                coverage_optimization: {
                    analysis: 'Dispersion patterns, overlap zones, even coverage',
                    adjustment: 'Angle optimization, height adjustment, spacing calculation',
                    verification: 'Walking tests, measurement confirmation, level checking'
                },
                delay_alignment: {
                    timing: 'Physical distances, electronic delay, phase alignment',
                    measurement: 'Time-of-flight, correlation analysis, listening tests',
                    correction: 'Digital delay, physical positioning, crossover timing'
                }
            }
        };
        
        // Quality control and standards
        this.qualityStandards = {
            technical_specifications: {
                dynamic_range: 'Minimum 90dB for professional applications',
                frequency_response: '+/-3dB from 20Hz to 20kHz for full-range systems',
                distortion: 'Less than 0.1% THD+N for critical listening',
                noise_floor: 'Below -60dB relative to program material'
            },
            monitoring_standards: {
                reference_level: '85dB SPL for mixing, calibrated monitoring environment',
                stereo_imaging: 'Proper left/right balance, phase coherence, center image',
                translation: 'Multiple speaker systems, various listening environments',
                fatigue_prevention: 'Regular breaks, level management, ear protection'
            },
            safety_protocols: {
                hearing_protection: 'Mandatory above 85dB, voluntary for extended exposure',
                equipment_safety: 'Proper grounding, power distribution, load management',
                emergency_procedures: 'Quick mute, emergency stops, backup systems'
            }
        };
        
        // Integration with production system
        this.soundDesigner = null;
        this.musicDirector = null;
        this.technicalDirector = null;
        this.currentProduction = null;
        
        console.log('🎚️ Audio Engineer Agent: Ready for precision audio engineering and technical excellence');
    }

    /**
     * Initialize Audio Engineer with system integration
     */
    async onInitialize() {
        try {
            console.log('🎚️ Audio Engineer: Initializing audio engineering systems...');
            
            // Connect to Ollama interface for AI audio engineering
            if (!window.ollamaTheaterInterface) {
                throw new Error('OllamaTheaterInterface not available. AI audio engineering requires LLM assistance.');
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
            
            // Configure AI for audio engineering
            this.ollamaInterface.updatePerformanceContext({
                role: 'audio_engineer',
                engineering_approach: this.engineeringApproach,
                creativity_mode: 'technical_precision',
                specialization: 'audio_systems_optimization'
            });
            
            // Connect to related agents
            if (window.soundDesignerAgent) {
                this.soundDesigner = window.soundDesignerAgent;
                console.log('🎚️ Audio Engineer: Connected to Sound Designer');
            }
            
            if (window.musicDirectorAgent) {
                this.musicDirector = window.musicDirectorAgent;
                console.log('🎚️ Audio Engineer: Connected to Music Director');
            }
            
            if (window.technicalDirectorAgent) {
                this.technicalDirector = window.technicalDirectorAgent;
                console.log('🎚️ Audio Engineer: Connected to Technical Director');
            }
            
            // Subscribe to production events
            this.subscribeToProductionEvents();
            
            // Initialize audio systems
            await this.initializeAudioSystems();
            
            // Test audio engineering capabilities
            await this.testAudioCapabilities();
            
            console.log('🎚️ Audio Engineer: Ready for precision audio engineering!')
            
        } catch (error) {
            console.error('🎚️ Audio Engineer: Initialization failed:', error);
            
            if (error.message.includes('Ollama')) {
                console.error(`
🔧 OLLAMA SETUP REQUIRED FOR AI AUDIO ENGINEERING:
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
     * Subscribe to production events for audio engineering
     */
    subscribeToProductionEvents() {
        if (window.theaterEventBus) {
            window.theaterEventBus.subscribe('production:started', (data) => this.onProductionStarted(data));
            window.theaterEventBus.subscribe('audio:recording-request', (data) => this.onRecordingRequest(data));
            window.theaterEventBus.subscribe('audio:mixing-request', (data) => this.onMixingRequest(data));
            window.theaterEventBus.subscribe('audio:system-check', (data) => this.onSystemCheck(data));
            window.theaterEventBus.subscribe('sound:design-complete', (data) => this.onSoundDesignComplete(data));
            window.theaterEventBus.subscribe('technical:equipment-issue', (data) => this.onEquipmentIssue(data));
            
            console.log('🎚️ Audio Engineer: Subscribed to audio engineering events');
        }
    }

    /**
     * Initialize audio systems
     */
    async initializeAudioSystems() {
        console.log('🎚️ Audio Engineer: Initializing audio systems...');
        
        // Initialize recording systems
        this.initializeRecordingSystems();
        
        // Initialize mixing systems
        this.initializeMixingSystems();
        
        // Initialize live sound systems
        this.initializeLiveSoundSystems();
        
        // Initialize measurement tools
        this.initializeMeasurementTools();
        
        console.log('✅ Audio Engineer: Audio systems initialized');
    }

    /**
     * Initialize recording systems
     */
    initializeRecordingSystems() {
        this.recordingSystems = {
            microphoneSelection: (source, environment) => this.selectOptimalMicrophone(source, environment),
            gainStructure: (signal) => this.optimizeGainStructure(signal),
            recordingSetup: (session) => this.designRecordingSetup(session),
            qualityMonitoring: (recording) => this.monitorRecordingQuality(recording)
        };
        
        console.log('🎚️ Audio Engineer: Recording systems initialized');
    }

    /**
     * Initialize mixing systems
     */
    initializeMixingSystems() {
        this.mixingSystems = {
            mixBalance: (tracks) => this.createMixBalance(tracks),
            equalization: (frequency, correction) => this.applyEqualization(frequency, correction),
            dynamics: (signal, compression) => this.applyDynamicsProcessing(signal, compression),
            spatialAudio: (sources, space) => this.createSpatialMix(sources, space)
        };
        
        console.log('🎚️ Audio Engineer: Mixing systems initialized');
    }

    /**
     * Initialize live sound systems
     */
    initializeLiveSoundSystems() {
        this.liveSoundSystems = {
            systemDesign: (venue, requirements) => this.designLiveSystem(venue, requirements),
            feedbackControl: (system) => this.implementFeedbackControl(system),
            monitorMixing: (performers, needs) => this.createMonitorMixes(performers, needs),
            realTimeAdjustment: (performance) => this.adjustForPerformance(performance)
        };
        
        console.log('🎚️ Audio Engineer: Live sound systems initialized');
    }

    /**
     * Initialize measurement tools
     */
    initializeMeasurementTools() {
        this.measurementTools = {
            frequencyAnalysis: new Map(),
            levelMonitoring: new Map(),
            phaseAnalysis: new Map(),
            acousticMeasurement: new Map()
        };
        
        console.log('🎚️ Audio Engineer: Measurement tools initialized');
    }

    /**
     * Test audio engineering capabilities
     */
    async testAudioCapabilities() {
        try {
            const testPrompt = `
            As an audio engineer, design a comprehensive audio system and workflow.
            
            Audio engineering scenario:
            - Venue: 400-seat theater with challenging acoustics
            - Production: Musical theater with live orchestra and vocals
            - Requirements: Recording, live sound, and broadcast feed
            - Challenges: Feedback control, mix clarity, acoustic treatment
            - Budget: Professional equipment, optimal performance priority
            
            Provide:
            1. Complete audio system design and equipment specification
            2. Recording setup and microphone selection strategy
            3. Live sound reinforcement and monitor mixing approach
            4. Acoustic analysis and room optimization recommendations
            5. Signal flow and gain structure optimization
            6. Quality control and measurement protocols
            7. Troubleshooting procedures and backup systems
            8. Integration with lighting and technical systems
            
            Format as comprehensive audio engineering plan.
            `;
            
            const response = await this.ollamaInterface.generatePerformance(testPrompt, {
                temperature: this.creativityLevel,
                max_tokens: 800
            });
            
            console.log('🎚️ Audio Engineer: Audio engineering capabilities verified ✓');
            return response;
            
        } catch (error) {
            console.error('🎚️ Audio Engineer: Audio capability test failed:', error);
            throw new Error(`Audio engineering test failed: ${error.message}`);
        }
    }

    /**
     * Handle new production start
     */
    async onProductionStarted(data) {
        console.log('🎚️ Audio Engineer: New production started -', data.production.title);
        
        this.currentProduction = data.production;
        
        // Initialize audio project
        await this.initializeAudioProject(data.production);
        
        // Develop audio engineering plan
        await this.developAudioEngineeringPlan(data.production);
    }

    /**
     * Initialize audio project
     */
    async initializeAudioProject(production) {
        console.log('🎚️ Audio Engineer: Initializing audio project...');
        
        this.audioProject = {
            production: production,
            audioDesign: null,
            recordings: new Map(),
            mixes: new Map(),
            systemSetup: new Map(),
            technicalSpecs: new Map(),
            status: 'planning',
            createdAt: new Date()
        };
        
        console.log('✅ Audio Engineer: Audio project initialized');
    }

    /**
     * Develop audio engineering plan for production
     */
    async developAudioEngineeringPlan(production) {
        try {
            console.log('🎚️ Audio Engineer: Developing audio engineering plan...');
            
            if (this.ollamaInterface && this.ollamaInterface.isConnected) {
                const planPrompt = `
                Develop a comprehensive audio engineering plan for a ${production.type} production titled "${production.title}".
                
                Consider:
                1. Audio system architecture and equipment requirements
                2. Recording strategy and microphone selection
                3. Live sound reinforcement and monitoring
                4. Acoustic optimization and room treatment
                5. Signal flow and gain structure design
                6. Quality control and measurement protocols
                7. Integration with musical and sound design elements
                8. Troubleshooting procedures and redundancy planning
                9. Safety protocols and hearing protection
                10. Budget optimization and equipment selection
                
                Provide a detailed audio engineering plan that ensures technical excellence, creative support, and reliable performance.
                `;
                
                const response = await this.ollamaInterface.generatePerformance(planPrompt, {
                    temperature: this.creativityLevel,
                    max_tokens: 1200,
                    timeout: 35000
                });
                
                if (response && response.content) {
                    this.audioProject.audioDesign = response.content;
                    this.audioProject.status = 'plan_complete';
                    
                    console.log('✅ Audio Engineer: Audio engineering plan developed');
                    
                    // Extract technical specifications
                    await this.extractTechnicalSpecs(response.content);
                    
                    // Begin system setup planning
                    await this.beginSystemSetupPlanning(production, response.content);
                    
                    // Share plan with production team
                    window.theaterEventBus?.publish('audio:engineering-plan-complete', {
                        production: production,
                        plan: response.content,
                        audioEngineer: this.config.name
                    });
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Audio Engineer: Plan development failed:', error.message);
            this.audioProject.status = 'plan_error';
        }
    }

    /**
     * Handle recording requests
     */
    async onRecordingRequest(data) {
        console.log('🎚️ Audio Engineer: Recording requested -', data.recordingType);
        
        await this.setupRecordingSession(data.source, data.requirements, data.deadline);
    }

    /**
     * Handle mixing requests
     */
    async onMixingRequest(data) {
        console.log('🎚️ Audio Engineer: Mixing requested -', data.mixType);
        
        await this.createMixSession(data.tracks, data.specifications, data.deliverables);
    }

    /**
     * Handle system checks
     */
    async onSystemCheck(data) {
        console.log('🎚️ Audio Engineer: System check requested');
        
        await this.performSystemCheck(data.systems, data.diagnostics);
    }

    /**
     * Extract technical specifications from plan
     */
    async extractTechnicalSpecs(plan) {
        // Simplified extraction - would use AI parsing in practice
        return {
            equipment: 'Professional mixing console, studio monitors, wireless systems',
            recording: 'Multi-track capability, high-quality preamps, monitoring',
            liveSound: 'Main PA, monitor wedges, wireless microphones',
            measurement: 'Real-time analyzer, SPL meters, signal generators'
        };
    }

    /**
     * Get audio engineer status
     */
    getAudioEngineerStatus() {
        return {
            currentProject: {
                active: !!this.audioProject.production,
                title: this.audioProject.production?.title,
                status: this.audioProject.status,
                planComplete: !!this.audioProject.audioDesign,
                recordingsActive: this.audioProject.recordings.size
            },
            audio: {
                recordings: this.audioProject.recordings.size,
                mixes: this.audioProject.mixes.size,
                systemSetups: this.audioProject.systemSetup.size,
                technicalSpecs: this.audioProject.technicalSpecs.size
            },
            capabilities: this.audioCapabilities,
            systems: {
                recordingEquipment: Object.keys(this.audioSystems.recording_equipment).length,
                liveSoundEquipment: Object.keys(this.audioSystems.live_sound_equipment).length,
                signalProcessing: Object.keys(this.audioSystems.signal_processing).length,
                measurementTools: Object.keys(this.audioSystems.measurement_tools).length
            }
        };
    }

    /**
     * Cleanup when stopping
     */
    async onStop() {
        console.log('🎚️ Audio Engineer: Concluding audio engineering session...');
        
        // Finalize audio project
        if (this.audioProject.status !== 'idle') {
            this.audioProject.status = 'completed';
            this.audioProject.completedAt = new Date();
        }
        
        // Generate audio engineering summary
        if (this.currentProduction) {
            const audioSummary = this.generateAudioSummary();
            console.log('🎚️ Audio Engineer: Audio engineering summary generated');
        }
        
        console.log('🎚️ Audio Engineer: Precision audio engineering concluded');
    }

    /**
     * Generate audio engineering summary
     */
    generateAudioSummary() {
        return {
            production: this.currentProduction?.title,
            completedAt: new Date(),
            engineering: {
                planDeveloped: !!this.audioProject.audioDesign,
                recordingsCompleted: this.audioProject.recordings.size,
                mixesCreated: this.audioProject.mixes.size,
                systemsConfigured: this.audioProject.systemSetup.size
            },
            technical: {
                qualityStandards: this.calculateQualityMetrics(),
                systemPerformance: this.calculateSystemPerformance(),
                troubleshootingEvents: this.calculateTroubleshootingMetrics()
            },
            collaboration: {
                soundDesignerIntegration: !!this.soundDesigner,
                musicDirectorCoordination: !!this.musicDirector,
                technicalDirectorAlignment: !!this.technicalDirector
            }
        };
    }

    /**
     * Calculate quality metrics
     */
    calculateQualityMetrics() {
        return Array.from(this.audioProject.recordings.values())
            .filter(recording => recording.qualityPassed).length;
    }

    /**
     * Calculate system performance
     */
    calculateSystemPerformance() {
        return Array.from(this.audioProject.systemSetup.values())
            .reduce((total, system) => total + (system.performance || 0), 0);
    }

    /**
     * Calculate troubleshooting metrics
     */
    calculateTroubleshootingMetrics() {
        return Array.from(this.audioProject.technicalSpecs.values())
            .filter(spec => spec.troubleshootingRequired).length;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioEngineerAgent;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.AudioEngineerAgent = AudioEngineerAgent;
    console.log('🎚️ Audio Engineer Agent loaded - Ready for precision audio engineering and technical excellence');
}