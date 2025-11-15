// AI Actor Movement and Scripting System

/**
 * PathFinder - A* pathfinding for actor navigation
 */
class PathFinder {
    constructor() {
        this.gridSize = 0.5; // Grid cell size for pathfinding
    }

    /**
     * Find a path from start to end avoiding obstacles
     * @param {THREE.Vector3} start - Starting position
     * @param {THREE.Vector3} end - Target position
     * @param {Array} obstacles - Array of obstacle objects
     * @returns {Array} Array of waypoint positions
     */
    findPath(start, end, obstacles = []) {
        // For now, implement simple direct path with obstacle checking
        // Can be enhanced with A* algorithm if needed
        const waypoints = [];
        const direction = new THREE.Vector3().subVectors(end, start);
        const distance = direction.length();
        
        if (distance < 0.1) {
            return [end.clone()];
        }

        // Check if direct path is clear
        if (this.isPathClear(start, end, obstacles)) {
            waypoints.push(end.clone());
        } else {
            // Try waypoints around obstacles
            const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            
            // Try offset positions
            const offsets = [
                new THREE.Vector3(2, 0, 0),
                new THREE.Vector3(-2, 0, 0),
                new THREE.Vector3(0, 0, 2),
                new THREE.Vector3(0, 0, -2),
                new THREE.Vector3(2, 0, 2),
                new THREE.Vector3(-2, 0, 2),
                new THREE.Vector3(2, 0, -2),
                new THREE.Vector3(-2, 0, -2)
            ];

            for (const offset of offsets) {
                const testPoint = midPoint.clone().add(offset);
                if (this.isPathClear(start, testPoint, obstacles) && 
                    this.isPathClear(testPoint, end, obstacles)) {
                    waypoints.push(testPoint);
                    waypoints.push(end.clone());
                    break;
                }
            }

            // If no path found, just go direct
            if (waypoints.length === 0) {
                waypoints.push(end.clone());
            }
        }

        return waypoints;
    }

    /**
     * Check if path between two points is clear of obstacles
     */
    isPathClear(start, end, obstacles) {
        // Simple collision check along path
        const steps = 10;
        const direction = new THREE.Vector3().subVectors(end, start);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = new THREE.Vector3().lerpVectors(start, end, t);
            
            for (const obstacle of obstacles) {
                if (this.checkCollision(point, obstacle)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Check collision between point and obstacle
     */
    checkCollision(point, obstacle) {
        if (!obstacle.userData) return false;
        
        const pos = obstacle.position;
        const radius = 1.5; // Collision radius
        
        const dx = point.x - pos.x;
        const dz = point.z - pos.z;
        const distSq = dx * dx + dz * dz;
        
        return distSq < (radius * radius);
    }
}

/**
 * ActorController - Controls smooth movement and animation of actors
 */
class ActorController {
    constructor(actor) {
        this.actor = actor;
        this.isMoving = false;
        this.targetPosition = null;
        this.moveSpeed = 2.0; // units per second
        this.rotationSpeed = 3.0; // radians per second
        this.waypoints = [];
        this.currentWaypointIndex = 0;
    }

    /**
     * Set target position for the actor to move to
     */
    setTargetPosition(position, speed = 'normal') {
        this.targetPosition = new THREE.Vector3(position.x, this.actor.position.y, position.z);
        this.isMoving = true;
        
        // Set speed based on parameter
        switch (speed.toLowerCase()) {
            case 'slow':
                this.moveSpeed = 1.0;
                break;
            case 'normal':
                this.moveSpeed = 2.0;
                break;
            case 'fast':
                this.moveSpeed = 3.5;
                break;
            case 'run':
                this.moveSpeed = 5.0;
                break;
            default:
                this.moveSpeed = 2.0;
        }
    }

    /**
     * Set waypoints for the actor to follow
     */
    setWaypoints(waypoints, speed = 'normal') {
        this.waypoints = waypoints.map(wp => new THREE.Vector3(wp.x, this.actor.position.y, wp.z));
        this.currentWaypointIndex = 0;
        
        if (this.waypoints.length > 0) {
            this.setTargetPosition(this.waypoints[0], speed);
        }
    }

    /**
     * Turn actor to face a direction
     */
    turnTo(direction, onComplete) {
        this.targetRotation = this.getRotationFromDirection(direction);
        this.onRotationComplete = onComplete;
    }

    /**
     * Get rotation angle from direction string
     */
    getRotationFromDirection(direction) {
        const directionMap = {
            'audience': 0,                // Facing forward (positive Z)
            'front': 0,
            'upstage': Math.PI,          // Facing backward (negative Z)
            'back': Math.PI,
            'stage-left': Math.PI / 2,   // Facing left (negative X)
            'left': Math.PI / 2,
            'stage-right': -Math.PI / 2, // Facing right (positive X)
            'right': -Math.PI / 2
        };
        
        return directionMap[direction.toLowerCase()] || 0;
    }

    /**
     * Update actor movement (called each frame)
     */
    update(deltaTime) {
        if (!this.isMoving && this.targetRotation === undefined) {
            return false;
        }

        let actionComplete = false;

        // Handle rotation
        if (this.targetRotation !== undefined) {
            const currentRotation = this.actor.rotation.y;
            const rotationDiff = this.targetRotation - currentRotation;
            
            // Normalize angle difference to [-PI, PI]
            let normalizedDiff = ((rotationDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
            if (normalizedDiff < -Math.PI) normalizedDiff += 2 * Math.PI;
            
            if (Math.abs(normalizedDiff) < 0.01) {
                this.actor.rotation.y = this.targetRotation;
                this.targetRotation = undefined;
                actionComplete = true;
                if (this.onRotationComplete) {
                    this.onRotationComplete();
                    this.onRotationComplete = null;
                }
            } else {
                const rotationStep = Math.sign(normalizedDiff) * Math.min(
                    Math.abs(normalizedDiff),
                    this.rotationSpeed * deltaTime
                );
                this.actor.rotation.y += rotationStep;
            }
        }

        // Handle movement
        if (this.isMoving && this.targetPosition) {
            const direction = new THREE.Vector3().subVectors(this.targetPosition, this.actor.position);
            const distance = direction.length();

            if (distance < 0.1) {
                // Reached waypoint
                this.actor.position.copy(this.targetPosition);
                this.currentWaypointIndex++;
                
                if (this.currentWaypointIndex < this.waypoints.length) {
                    // Move to next waypoint
                    this.setTargetPosition(this.waypoints[this.currentWaypointIndex]);
                } else {
                    // Completed all waypoints
                    this.isMoving = false;
                    this.waypoints = [];
                    this.currentWaypointIndex = 0;
                    actionComplete = true;
                }
            } else {
                // Move towards target
                direction.normalize();
                const moveDistance = Math.min(this.moveSpeed * deltaTime, distance);
                this.actor.position.add(direction.multiplyScalar(moveDistance));
                
                // Face movement direction
                const targetRotation = Math.atan2(direction.x, direction.z);
                this.actor.rotation.y = targetRotation;
            }
        }

        return actionComplete;
    }

    /**
     * Stop all movement
     */
    stop() {
        this.isMoving = false;
        this.targetPosition = null;
        this.waypoints = [];
        this.targetRotation = undefined;
    }
}

/**
 * ActionQueue - Manages sequential execution of actions
 */
class ActionQueue {
    constructor() {
        this.actions = [];
        this.currentAction = null;
        this.isExecuting = false;
        this.waitStartTime = 0;
        this.onComplete = null;
    }

    /**
     * Add an action to the queue
     */
    addAction(action) {
        this.actions.push(action);
    }

    /**
     * Clear all actions
     */
    clear() {
        this.actions = [];
        this.currentAction = null;
        this.isExecuting = false;
    }

    /**
     * Start executing the queue
     */
    start(onComplete) {
        this.isExecuting = true;
        this.onComplete = onComplete;
        this.executeNextAction();
    }

    /**
     * Execute the next action in queue
     */
    executeNextAction() {
        if (this.actions.length === 0) {
            this.isExecuting = false;
            if (this.onComplete) {
                this.onComplete();
            }
            return;
        }

        this.currentAction = this.actions.shift();
        
        if (this.currentAction.type === 'wait') {
            this.waitStartTime = Date.now();
        } else if (this.currentAction.execute) {
            this.currentAction.execute();
        }
    }

    /**
     * Update queue execution (called each frame)
     */
    update() {
        if (!this.isExecuting || !this.currentAction) {
            return;
        }

        if (this.currentAction.type === 'wait') {
            const elapsed = (Date.now() - this.waitStartTime) / 1000;
            if (elapsed >= this.currentAction.duration) {
                this.executeNextAction();
            }
        } else if (this.currentAction.isComplete && this.currentAction.isComplete()) {
            this.executeNextAction();
        }
    }
}

/**
 * ScriptEngine - Main scripting engine for AI actors
 */
class ScriptEngine {
    constructor() {
        this.actorControllers = new Map(); // actorId -> ActorController
        this.actorQueues = new Map();      // actorId -> ActionQueue
        this.pathFinder = new PathFinder();
        this.stagePositions = this.defineStagePositions();
        this.isRunning = false;
        this.lastUpdateTime = Date.now();
    }

    /**
     * Define standard stage positions
     */
    defineStagePositions() {
        return {
            'USL': { x: -8, z: -3 },
            'USC': { x: 0, z: -3 },
            'USR': { x: 8, z: -3 },
            'SL': { x: -8, z: 0 },
            'C': { x: 0, z: 0 },
            'SR': { x: 8, z: 0 },
            'DSL': { x: -8, z: 3 },
            'DSC': { x: 0, z: 3 },
            'DSR': { x: 8, z: 3 }
        };
    }

    /**
     * Initialize controller for an actor
     */
    initializeActor(actorId, actorObject) {
        if (!this.actorControllers.has(actorId)) {
            this.actorControllers.set(actorId, new ActorController(actorObject));
            this.actorQueues.set(actorId, new ActionQueue());
        }
    }

    /**
     * Parse and load a script
     * @param {Object} scriptJson - Script in JSON format
     * @param {Array} actorObjects - Array of actor Three.js objects
     * @param {Array} obstacles - Array of obstacle objects (props, scenery)
     */
    loadScript(scriptJson, actorObjects, obstacles = []) {
        // Clear existing scripts
        this.stopAll();

        // Initialize actors
        const actorMap = {};
        actorObjects.forEach(actor => {
            const actorId = actor.userData.id;
            actorMap[actorId] = actor;
            this.initializeActor(actorId, actor);
        });

        // Parse script for each actor
        for (const [actorId, actions] of Object.entries(scriptJson)) {
            const actor = actorMap[actorId];
            if (!actor) {
                console.warn(`Actor ${actorId} not found in scene`);
                continue;
            }

            const controller = this.actorControllers.get(actorId);
            const queue = this.actorQueues.get(actorId);

            // Process each action
            actions.forEach(actionData => {
                const action = this.createAction(actorId, actionData, controller, obstacles);
                if (action) {
                    queue.addAction(action);
                }
            });
        }

        return true;
    }

    /**
     * Create an action from action data
     */
    createAction(actorId, actionData, controller, obstacles) {
        const actionType = actionData.action;

        switch (actionType) {
            case 'walk_to':
                return this.createWalkToAction(actorId, actionData, controller, obstacles);
            
            case 'turn':
                return this.createTurnAction(actionData, controller);
            
            case 'face':
                return this.createFaceAction(actionData, controller);
            
            case 'wait':
                return {
                    type: 'wait',
                    duration: actionData.duration || 1
                };
            
            case 'gesture':
            case 'sit':
            case 'stand':
                return this.createAnimationAction(actionData);
            
            default:
                console.warn(`Unknown action type: ${actionType}`);
                return null;
        }
    }

    /**
     * Create walk_to action
     */
    createWalkToAction(actorId, actionData, controller, obstacles) {
        const position = this.resolvePosition(actionData.position);
        if (!position) {
            console.warn(`Invalid position: ${actionData.position}`);
            return null;
        }

        const speed = actionData.speed || 'normal';
        const actor = controller.actor;
        
        return {
            type: 'walk_to',
            execute: () => {
                // Find path to position
                const start = actor.position.clone();
                const end = new THREE.Vector3(position.x, actor.position.y, position.z);
                const waypoints = this.pathFinder.findPath(start, end, obstacles);
                controller.setWaypoints(waypoints, speed);
            },
            isComplete: () => !controller.isMoving
        };
    }

    /**
     * Create turn action
     */
    createTurnAction(actionData, controller) {
        const direction = actionData.direction || 'audience';
        
        return {
            type: 'turn',
            execute: () => {
                let completed = false;
                controller.turnTo(direction, () => {
                    completed = true;
                });
                this._turnCompleted = () => completed;
            },
            isComplete: () => this._turnCompleted && this._turnCompleted()
        };
    }

    /**
     * Create face action (alias for turn)
     */
    createFaceAction(actionData, controller) {
        return this.createTurnAction(actionData, controller);
    }

    /**
     * Create animation action (gesture, sit, stand)
     */
    createAnimationAction(actionData) {
        const duration = actionData.duration || 1;
        let startTime = null;
        
        return {
            type: actionData.action,
            execute: () => {
                startTime = Date.now();
                console.log(`Performing ${actionData.action}`);
            },
            isComplete: () => {
                if (!startTime) return false;
                return (Date.now() - startTime) / 1000 >= duration;
            }
        };
    }

    /**
     * Resolve position from string or object
     */
    resolvePosition(positionData) {
        if (typeof positionData === 'string') {
            // Stage position marker
            const pos = this.stagePositions[positionData.toUpperCase()];
            if (pos) {
                return { x: pos.x, z: pos.z };
            }
            
            // Prop ID (e.g., "prop_5")
            if (positionData.startsWith('prop_')) {
                // This will be handled by the script executor with actual prop objects
                return { x: 0, z: 0 }; // Placeholder
            }
            
            return null;
        } else if (positionData.x !== undefined && positionData.z !== undefined) {
            // Direct coordinates
            return { x: positionData.x, z: positionData.z };
        }
        
        return null;
    }

    /**
     * Start executing all loaded scripts
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastUpdateTime = Date.now();
        
        // Start all actor queues
        this.actorQueues.forEach(queue => {
            queue.start();
        });
        
        console.log('Script execution started');
    }

    /**
     * Stop all script execution
     */
    stopAll() {
        this.isRunning = false;
        
        this.actorQueues.forEach(queue => {
            queue.clear();
        });
        
        this.actorControllers.forEach(controller => {
            controller.stop();
        });
    }

    /**
     * Update all actors (called each frame)
     */
    update() {
        if (!this.isRunning) return;

        const currentTime = Date.now();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;

        // Update all controllers
        this.actorControllers.forEach(controller => {
            controller.update(deltaTime);
        });

        // Update all queues
        this.actorQueues.forEach(queue => {
            queue.update();
        });

        // Check if all queues are complete
        let allComplete = true;
        this.actorQueues.forEach(queue => {
            if (queue.isExecuting) {
                allComplete = false;
            }
        });

        if (allComplete && this.actorQueues.size > 0) {
            console.log('All scripts completed');
            this.isRunning = false;
        }
    }

    /**
     * Check if any scripts are running
     */
    isExecuting() {
        return this.isRunning;
    }

    /**
     * Get status of script execution
     */
    getStatus() {
        const status = {};
        this.actorQueues.forEach((queue, actorId) => {
            status[actorId] = {
                isExecuting: queue.isExecuting,
                remainingActions: queue.actions.length,
                currentAction: queue.currentAction ? queue.currentAction.type : null
            };
        });
        return status;
    }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScriptEngine, ActorController, PathFinder, ActionQueue };
}
