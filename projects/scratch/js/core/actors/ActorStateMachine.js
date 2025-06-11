/**
 * ActorStateMachine.js - Advanced State Management for Theatrical Actors
 * 
 * Implements a robust state machine system for actor behaviors with:
 * - Event-driven state transitions
 * - State validation and error handling
 * - Conditional transitions based on environment
 * - Performance optimization for multiple actors
 * - Integration with existing actor behavioral layer
 */

// Actor state definitions
const ACTOR_STATES = {
    IDLE: 'idle',                    // Standing still, subtle animations
    WALKING: 'walking',              // Moving to target position
    POSITIONING: 'positioning',      // Finding optimal position/orientation
    BLOCKED: 'blocked',              // Cannot reach target, waiting or recalculating
    PERFORMING: 'performing',        // Executing scripted performance
    INTERACTING: 'interacting',      // Engaging with props or other actors
    EXITING: 'exiting',             // Moving off-stage
    WAITING: 'waiting',             // Waiting for cue or other actors
    ERROR: 'error'                  // Error state for debugging
};

// State transition events
const STATE_EVENTS = {
    MOVE_TO: 'moveTo',              // Command to move to position
    ARRIVED: 'arrived',             // Reached target destination
    PATH_BLOCKED: 'pathBlocked',    // Obstacle encountered
    PATH_CLEAR: 'pathClear',        // Obstacle removed
    START_PERFORMANCE: 'startPerformance',  // Begin scripted action
    END_PERFORMANCE: 'endPerformance',      // Complete scripted action
    INTERACT_WITH: 'interactWith',  // Start interaction
    STOP_INTERACTION: 'stopInteraction',   // End interaction
    EXIT_STAGE: 'exitStage',        // Command to leave stage
    WAIT_FOR_CUE: 'waitForCue',     // Wait for external trigger
    CUE_RECEIVED: 'cueReceived',    // External trigger received
    RESET: 'reset',                 // Return to idle state
    ERROR_OCCURRED: 'errorOccurred' // Handle error condition
};

class ActorStateMachine {
    constructor(actorId) {
        this.actorId = actorId;
        this.currentState = ACTOR_STATES.IDLE;
        this.previousState = null;
        this.stateHistory = [];
        this.stateStartTime = performance.now();
        this.stateDuration = 0;
        
        // Event queue for managing state transitions
        this.eventQueue = [];
        this.isProcessingEvent = false;
        
        // State-specific data
        this.stateData = new Map();
        
        // Performance tracking
        this.transitionCount = 0;
        this.lastTransitionTime = 0;
        
        // Define valid state transitions
        this.defineStateTransitions();
        
        console.log(`🎭 ActorStateMachine created for actor ${actorId}`);
    }
    
    /**
     * Define valid state transitions and their conditions
     */
    defineStateTransitions() {
        this.transitions = new Map([
            // FROM IDLE
            [ACTOR_STATES.IDLE, new Map([
                [STATE_EVENTS.MOVE_TO, ACTOR_STATES.WALKING],
                [STATE_EVENTS.START_PERFORMANCE, ACTOR_STATES.PERFORMING],
                [STATE_EVENTS.INTERACT_WITH, ACTOR_STATES.INTERACTING],
                [STATE_EVENTS.WAIT_FOR_CUE, ACTOR_STATES.WAITING],
                [STATE_EVENTS.EXIT_STAGE, ACTOR_STATES.EXITING],
                [STATE_EVENTS.ARRIVED, ACTOR_STATES.IDLE], // Allow redundant arrival events
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM WALKING
            [ACTOR_STATES.WALKING, new Map([
                [STATE_EVENTS.ARRIVED, ACTOR_STATES.IDLE],
                [STATE_EVENTS.PATH_BLOCKED, ACTOR_STATES.BLOCKED],
                [STATE_EVENTS.MOVE_TO, ACTOR_STATES.WALKING], // Allow new movement commands while walking
                [STATE_EVENTS.START_PERFORMANCE, ACTOR_STATES.PERFORMING],
                [STATE_EVENTS.WAIT_FOR_CUE, ACTOR_STATES.WAITING],
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM POSITIONING
            [ACTOR_STATES.POSITIONING, new Map([
                [STATE_EVENTS.ARRIVED, ACTOR_STATES.IDLE],
                [STATE_EVENTS.PATH_BLOCKED, ACTOR_STATES.BLOCKED],
                [STATE_EVENTS.MOVE_TO, ACTOR_STATES.WALKING],
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM BLOCKED
            [ACTOR_STATES.BLOCKED, new Map([
                [STATE_EVENTS.PATH_CLEAR, ACTOR_STATES.WALKING],
                [STATE_EVENTS.MOVE_TO, ACTOR_STATES.WALKING],  // New destination
                [STATE_EVENTS.RESET, ACTOR_STATES.IDLE],
                [STATE_EVENTS.WAIT_FOR_CUE, ACTOR_STATES.WAITING],
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM PERFORMING
            [ACTOR_STATES.PERFORMING, new Map([
                [STATE_EVENTS.END_PERFORMANCE, ACTOR_STATES.IDLE],
                [STATE_EVENTS.MOVE_TO, ACTOR_STATES.WALKING],  // Performance interrupted
                [STATE_EVENTS.INTERACT_WITH, ACTOR_STATES.INTERACTING],
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM INTERACTING
            [ACTOR_STATES.INTERACTING, new Map([
                [STATE_EVENTS.STOP_INTERACTION, ACTOR_STATES.IDLE],
                [STATE_EVENTS.MOVE_TO, ACTOR_STATES.WALKING],
                [STATE_EVENTS.START_PERFORMANCE, ACTOR_STATES.PERFORMING],
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM WAITING
            [ACTOR_STATES.WAITING, new Map([
                [STATE_EVENTS.CUE_RECEIVED, ACTOR_STATES.IDLE],
                [STATE_EVENTS.MOVE_TO, ACTOR_STATES.WALKING],
                [STATE_EVENTS.START_PERFORMANCE, ACTOR_STATES.PERFORMING],
                [STATE_EVENTS.RESET, ACTOR_STATES.IDLE],
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM EXITING
            [ACTOR_STATES.EXITING, new Map([
                [STATE_EVENTS.ARRIVED, ACTOR_STATES.IDLE],  // Reached exit point
                [STATE_EVENTS.PATH_BLOCKED, ACTOR_STATES.BLOCKED],
                [STATE_EVENTS.RESET, ACTOR_STATES.IDLE],
                [STATE_EVENTS.ERROR_OCCURRED, ACTOR_STATES.ERROR]
            ])],
            
            // FROM ERROR
            [ACTOR_STATES.ERROR, new Map([
                [STATE_EVENTS.RESET, ACTOR_STATES.IDLE]
            ])]
        ]);
    }
    
    /**
     * Trigger a state transition event
     */
    triggerEvent(event, eventData = null) {
        if (!Object.values(STATE_EVENTS).includes(event)) {
            console.warn(`🎭 Actor ${this.actorId}: Unknown event '${event}'`);
            return false;
        }
        
        // Add to event queue
        this.eventQueue.push({ event, eventData, timestamp: performance.now() });
        
        // Process queue if not already processing
        if (!this.isProcessingEvent) {
            this.processEventQueue();
        }
        
        return true;
    }
    
    /**
     * Process event queue sequentially
     */
    processEventQueue() {
        if (this.eventQueue.length === 0) {
            this.isProcessingEvent = false;
            return;
        }
        
        this.isProcessingEvent = true;
        const { event, eventData } = this.eventQueue.shift();
        
        try {
            this.handleStateTransition(event, eventData);
        } catch (error) {
            console.error(`🎭 Actor ${this.actorId}: Error processing event '${event}':`, error);
            this.handleStateTransition(STATE_EVENTS.ERROR_OCCURRED, { error });
        }
        
        // Continue processing queue
        setTimeout(() => this.processEventQueue(), 0);
    }
    
    /**
     * Handle state transition logic
     */
    handleStateTransition(event, eventData) {
        const currentTransitions = this.transitions.get(this.currentState);
        
        if (!currentTransitions || !currentTransitions.has(event)) {
            console.log(`🎭 Actor ${this.actorId}: Invalid transition from '${this.currentState}' on event '${event}'`);
            return false;
        }
        
        const newState = currentTransitions.get(event);
        
        // Check transition conditions if any
        if (!this.checkTransitionConditions(this.currentState, newState, event, eventData)) {
            console.log(`🎭 Actor ${this.actorId}: Transition conditions not met for '${this.currentState}' → '${newState}'`);
            return false;
        }
        
        // Execute transition
        this.executeStateTransition(newState, event, eventData);
        return true;
    }
    
    /**
     * Check if transition conditions are met
     */
    checkTransitionConditions(fromState, toState, event, eventData) {
        // Basic validation - can be extended with more complex conditions
        
        // Example: Don't allow movement if actor is performing critical action
        if (fromState === ACTOR_STATES.PERFORMING && event === STATE_EVENTS.MOVE_TO) {
            const performanceData = this.stateData.get(ACTOR_STATES.PERFORMING);
            if (performanceData && performanceData.critical) {
                return false; // Cannot interrupt critical performance
            }
        }
        
        // Example: Don't allow performance if actor is too far from stage
        if (toState === ACTOR_STATES.PERFORMING && eventData && eventData.requiresStage) {
            // Would check actor position relative to stage bounds
            // For now, always allow
        }
        
        return true; // Default: allow transition
    }
    
    /**
     * Execute the actual state transition
     */
    executeStateTransition(newState, event, eventData) {
        const oldState = this.currentState;
        const transitionTime = performance.now();
        
        // Update state duration
        this.stateDuration = transitionTime - this.stateStartTime;
        
        // Exit current state
        this.onStateExit(oldState, newState, eventData);
        
        // Update state
        this.previousState = oldState;
        this.currentState = newState;
        this.stateStartTime = transitionTime;
        
        // Add to history (keep last 10 transitions)
        this.stateHistory.push({
            fromState: oldState,
            toState: newState,
            event: event,
            timestamp: transitionTime,
            duration: this.stateDuration
        });
        
        if (this.stateHistory.length > 10) {
            this.stateHistory.shift();
        }
        
        // Enter new state
        this.onStateEnter(newState, oldState, eventData);
        
        // Update performance stats
        this.transitionCount++;
        this.lastTransitionTime = transitionTime;
        
        console.log(`🎭 Actor ${this.actorId}: ${oldState} → ${newState} (${event})`);
    }
    
    /**
     * Handle state exit logic
     */
    onStateExit(exitingState, enteringState, eventData) {
        switch (exitingState) {
            case ACTOR_STATES.WALKING:
                // Clean up movement data
                this.stateData.delete(ACTOR_STATES.WALKING);
                break;
                
            case ACTOR_STATES.PERFORMING:
                // Clean up performance data
                this.stateData.delete(ACTOR_STATES.PERFORMING);
                break;
                
            case ACTOR_STATES.INTERACTING:
                // Clean up interaction data
                this.stateData.delete(ACTOR_STATES.INTERACTING);
                break;
                
            case ACTOR_STATES.BLOCKED:
                // Clear blocked path data
                this.stateData.delete(ACTOR_STATES.BLOCKED);
                break;
        }
    }
    
    /**
     * Handle state entry logic
     */
    onStateEnter(enteringState, exitingState, eventData) {
        switch (enteringState) {
            case ACTOR_STATES.IDLE:
                this.initializeIdleState(eventData);
                break;
                
            case ACTOR_STATES.WALKING:
                this.initializeWalkingState(eventData);
                break;
                
            case ACTOR_STATES.POSITIONING:
                this.initializePositioningState(eventData);
                break;
                
            case ACTOR_STATES.BLOCKED:
                this.initializeBlockedState(eventData);
                break;
                
            case ACTOR_STATES.PERFORMING:
                this.initializePerformingState(eventData);
                break;
                
            case ACTOR_STATES.INTERACTING:
                this.initializeInteractingState(eventData);
                break;
                
            case ACTOR_STATES.WAITING:
                this.initializeWaitingState(eventData);
                break;
                
            case ACTOR_STATES.EXITING:
                this.initializeExitingState(eventData);
                break;
                
            case ACTOR_STATES.ERROR:
                this.initializeErrorState(eventData);
                break;
        }
    }
    
    /**
     * Initialize idle state
     */
    initializeIdleState(eventData) {
        this.stateData.set(ACTOR_STATES.IDLE, {
            startTime: performance.now(),
            idleAnimation: 'breathing', // Default idle animation
            lookDirection: eventData?.lookDirection || null
        });
    }
    
    /**
     * Initialize walking state
     */
    initializeWalkingState(eventData) {
        this.stateData.set(ACTOR_STATES.WALKING, {
            startTime: performance.now(),
            targetPosition: eventData?.targetPosition || null,
            movementSpeed: eventData?.speed || 1.0,
            pathfindingData: eventData?.pathfindingData || null
        });
    }
    
    /**
     * Initialize positioning state
     */
    initializePositioningState(eventData) {
        this.stateData.set(ACTOR_STATES.POSITIONING, {
            startTime: performance.now(),
            targetPosition: eventData?.targetPosition || null,
            targetOrientation: eventData?.targetOrientation || null,
            precision: eventData?.precision || 0.1
        });
    }
    
    /**
     * Initialize blocked state
     */
    initializeBlockedState(eventData) {
        this.stateData.set(ACTOR_STATES.BLOCKED, {
            startTime: performance.now(),
            blockageType: eventData?.blockageType || 'unknown',
            blockedBy: eventData?.blockedBy || null,
            waitTime: eventData?.waitTime || 5000, // Default 5 second wait
            retryCount: 0
        });
    }
    
    /**
     * Initialize performing state
     */
    initializePerformingState(eventData) {
        this.stateData.set(ACTOR_STATES.PERFORMING, {
            startTime: performance.now(),
            performance: eventData?.performance || 'generic',
            duration: eventData?.duration || 3000, // Default 3 seconds
            critical: eventData?.critical || false,
            props: eventData?.props || []
        });
    }
    
    /**
     * Initialize interacting state
     */
    initializeInteractingState(eventData) {
        this.stateData.set(ACTOR_STATES.INTERACTING, {
            startTime: performance.now(),
            interactionType: eventData?.interactionType || 'generic',
            target: eventData?.target || null,
            duration: eventData?.duration || 2000 // Default 2 seconds
        });
    }
    
    /**
     * Initialize waiting state
     */
    initializeWaitingState(eventData) {
        this.stateData.set(ACTOR_STATES.WAITING, {
            startTime: performance.now(),
            waitingFor: eventData?.waitingFor || 'cue',
            timeout: eventData?.timeout || 30000, // Default 30 second timeout
            condition: eventData?.condition || null
        });
    }
    
    /**
     * Initialize exiting state
     */
    initializeExitingState(eventData) {
        this.stateData.set(ACTOR_STATES.EXITING, {
            startTime: performance.now(),
            exitPoint: eventData?.exitPoint || 'default',
            speed: eventData?.speed || 1.2 // Slightly faster when exiting
        });
    }
    
    /**
     * Initialize error state
     */
    initializeErrorState(eventData) {
        this.stateData.set(ACTOR_STATES.ERROR, {
            startTime: performance.now(),
            error: eventData?.error || 'Unknown error',
            canRecover: eventData?.canRecover !== false,
            recoveryAttempts: 0
        });
        
        console.error(`🎭 Actor ${this.actorId} entered ERROR state:`, eventData?.error);
    }
    
    /**
     * Update state machine (called each frame)
     */
    update(deltaTime, actorPosition, environment) {
        const currentTime = performance.now();
        const timeInState = currentTime - this.stateStartTime;
        
        // Update state-specific logic
        switch (this.currentState) {
            case ACTOR_STATES.BLOCKED:
                this.updateBlockedState(timeInState, environment);
                break;
                
            case ACTOR_STATES.PERFORMING:
                this.updatePerformingState(timeInState);
                break;
                
            case ACTOR_STATES.INTERACTING:
                this.updateInteractingState(timeInState);
                break;
                
            case ACTOR_STATES.WAITING:
                this.updateWaitingState(timeInState, environment);
                break;
                
            case ACTOR_STATES.ERROR:
                this.updateErrorState(timeInState);
                break;
        }
    }
    
    /**
     * Update blocked state logic
     */
    updateBlockedState(timeInState, environment) {
        const blockedData = this.stateData.get(ACTOR_STATES.BLOCKED);
        if (!blockedData) return;
        
        // Check if blockage has cleared
        if (timeInState > blockedData.waitTime) {
            // Try to find alternate path or clear blockage
            if (blockedData.retryCount < 3) {
                blockedData.retryCount++;
                this.triggerEvent(STATE_EVENTS.PATH_CLEAR);
            } else {
                // Give up and return to idle
                this.triggerEvent(STATE_EVENTS.RESET);
            }
        }
    }
    
    /**
     * Update performing state logic
     */
    updatePerformingState(timeInState) {
        const performanceData = this.stateData.get(ACTOR_STATES.PERFORMING);
        if (!performanceData) return;
        
        // Check if performance is complete
        if (timeInState >= performanceData.duration) {
            this.triggerEvent(STATE_EVENTS.END_PERFORMANCE);
        }
    }
    
    /**
     * Update interacting state logic
     */
    updateInteractingState(timeInState) {
        const interactionData = this.stateData.get(ACTOR_STATES.INTERACTING);
        if (!interactionData) return;
        
        // Check if interaction is complete
        if (timeInState >= interactionData.duration) {
            this.triggerEvent(STATE_EVENTS.STOP_INTERACTION);
        }
    }
    
    /**
     * Update waiting state logic
     */
    updateWaitingState(timeInState, environment) {
        const waitingData = this.stateData.get(ACTOR_STATES.WAITING);
        if (!waitingData) return;
        
        // Check for timeout
        if (timeInState >= waitingData.timeout) {
            console.log(`🎭 Actor ${this.actorId}: Wait timeout, returning to idle`);
            this.triggerEvent(STATE_EVENTS.RESET);
        }
        
        // Check waiting condition if specified
        if (waitingData.condition && this.checkWaitingCondition(waitingData.condition, environment)) {
            this.triggerEvent(STATE_EVENTS.CUE_RECEIVED);
        }
    }
    
    /**
     * Update error state logic
     */
    updateErrorState(timeInState) {
        const errorData = this.stateData.get(ACTOR_STATES.ERROR);
        if (!errorData) return;
        
        // Attempt recovery after 5 seconds
        if (timeInState > 5000 && errorData.canRecover && errorData.recoveryAttempts < 3) {
            errorData.recoveryAttempts++;
            console.log(`🎭 Actor ${this.actorId}: Attempting error recovery (${errorData.recoveryAttempts}/3)`);
            this.triggerEvent(STATE_EVENTS.RESET);
        }
    }
    
    /**
     * Check waiting condition
     */
    checkWaitingCondition(condition, environment) {
        // Placeholder for condition checking logic
        // Could check for other actors, props, time, etc.
        return false;
    }
    
    /**
     * Get current state info
     */
    getCurrentStateInfo() {
        const currentTime = performance.now();
        const timeInState = currentTime - this.stateStartTime;
        const stateData = this.stateData.get(this.currentState);
        
        return {
            state: this.currentState,
            previousState: this.previousState,
            timeInState: timeInState,
            stateData: stateData ? { ...stateData } : null,
            transitionCount: this.transitionCount,
            eventQueueLength: this.eventQueue.length
        };
    }
    
    /**
     * Get state history
     */
    getStateHistory() {
        return [...this.stateHistory];
    }
    
    /**
     * Reset state machine to idle
     */
    reset() {
        this.eventQueue = [];
        this.isProcessingEvent = false;
        this.stateData.clear();
        this.triggerEvent(STATE_EVENTS.RESET);
    }
    
    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            actorId: this.actorId,
            currentState: this.currentState,
            previousState: this.previousState,
            timeInCurrentState: performance.now() - this.stateStartTime,
            transitionCount: this.transitionCount,
            eventQueueLength: this.eventQueue.length,
            stateDataKeys: Array.from(this.stateData.keys()),
            recentTransitions: this.stateHistory.slice(-3)
        };
    }
}

// Export state constants and class
if (typeof window !== 'undefined') {
    window.ACTOR_STATES = ACTOR_STATES;
    window.STATE_EVENTS = STATE_EVENTS;
    window.ActorStateMachine = ActorStateMachine;
    console.log('🎭 ActorStateMachine loaded - state system available globally');
}

// ES6 module export (for future use)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ACTOR_STATES, STATE_EVENTS, ActorStateMachine };
}