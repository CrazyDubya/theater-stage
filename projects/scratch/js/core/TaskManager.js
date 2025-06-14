/**
 * TaskManager.js - Intelligent Task Distribution and Progress Tracking
 * 
 * Manages the entire task lifecycle from creation to completion across
 * the 35-agent ecosystem. Handles dependencies, priority, resource allocation,
 * and intelligent assignment based on agent capabilities and availability.
 */

class TaskManager {
    constructor() {
        this.tasks = new Map();
        this.taskQueues = {
            creative: [],
            technical: [],
            performance: [],
            support: [],
            management: []
        };
        
        this.dependencyGraph = new Map();
        this.completionCallbacks = new Map();
        this.taskAssignments = new Map();
        
        // Task execution metrics
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageDuration: 0,
            successRate: 0
        };
        
        console.log('🎯 Task Manager: Intelligent task distribution system ready');
    }

    /**
     * Create a new task with dependencies and requirements
     */
    createTask(taskDefinition) {
        const task = {
            id: taskDefinition.id || this.generateTaskId(),
            name: taskDefinition.name,
            description: taskDefinition.description,
            type: taskDefinition.type || 'general',
            priority: taskDefinition.priority || 'medium',
            
            // Assignment and execution
            requiredRoles: taskDefinition.requiredRoles || [],
            assignedAgents: [],
            maxConcurrency: taskDefinition.maxConcurrency || 1,
            
            // Dependencies and deliverables
            dependencies: taskDefinition.dependencies || [],
            deliverables: taskDefinition.deliverables || [],
            qualityGates: taskDefinition.qualityGates || [],
            
            // Timeline
            estimatedDuration: taskDefinition.estimatedDuration,
            deadline: taskDefinition.deadline,
            createdAt: new Date(),
            startedAt: null,
            completedAt: null,
            
            // Status and progress
            status: 'pending', // pending, assigned, in_progress, completed, failed, blocked
            progress: 0,
            blockers: [],
            
            // Results
            deliveredAssets: new Map(),
            qualityResults: new Map(),
            feedback: [],
            
            // Metadata
            metadata: taskDefinition.metadata || {}
        };
        
        // Store task
        this.tasks.set(task.id, task);
        this.metrics.totalTasks++;
        
        // Add to dependency graph
        this.addToDependencyGraph(task);
        
        // Queue for assignment
        this.queueTask(task);
        
        console.log(`📝 Task created: ${task.name} (${task.id})`);
        
        return task;
    }

    /**
     * Add task to appropriate queue based on type
     */
    queueTask(task) {
        const queueType = this.determineQueueType(task);
        
        // Insert with priority consideration
        this.insertByPriority(this.taskQueues[queueType], task);
        
        // Attempt immediate assignment if dependencies are met
        if (this.areDependenciesMet(task)) {
            this.processTaskQueue(queueType);
        }
    }

    /**
     * Determine which queue a task belongs to
     */
    determineQueueType(task) {
        const roleMapping = {
            'creative': ['executive-producer', 'creative-director', 'ai-playwright', 'script-editor', 'music-director', 'music-composer'],
            'technical': ['technical-director', 'audio-engineer', 'video-director', 'lighting-designer', 'sound-designer'],
            'performance': ['stage-manager', 'choreographer', 'voice-coach', 'method-acting-coach', 'dance-captain'],
            'support': ['dramaturge', 'makeup-artist', 'props-master', 'wardrobe-supervisor', 'child-wrangler'],
            'management': ['casting-director', 'marketing-director', 'house-manager', 'understudies-coordinator', 'audience-development']
        };
        
        // Check if any required roles match queue categories
        for (const [queueType, roles] of Object.entries(roleMapping)) {
            if (task.requiredRoles.some(role => roles.includes(role))) {
                return queueType;
            }
        }
        
        return 'support'; // Default queue
    }

    /**
     * Insert task into queue based on priority
     */
    insertByPriority(queue, task) {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const taskPriority = priorityOrder[task.priority] || 2;
        
        let insertIndex = queue.length;
        for (let i = 0; i < queue.length; i++) {
            const queueTaskPriority = priorityOrder[queue[i].priority] || 2;
            if (taskPriority < queueTaskPriority) {
                insertIndex = i;
                break;
            }
        }
        
        queue.splice(insertIndex, 0, task);
    }

    /**
     * Process tasks in a specific queue
     */
    async processTaskQueue(queueType) {
        const queue = this.taskQueues[queueType];
        
        while (queue.length > 0) {
            const task = queue[0];
            
            // Check if dependencies are met
            if (!this.areDependenciesMet(task)) {
                break; // Wait for dependencies
            }
            
            // Attempt to assign task
            const assigned = await this.attemptTaskAssignment(task);
            
            if (assigned) {
                // Remove from queue
                queue.shift();
                
                // Start task execution
                await this.startTaskExecution(task);
            } else {
                // Can't assign right now, leave in queue
                break;
            }
        }
    }

    /**
     * Check if all task dependencies are satisfied
     */
    areDependenciesMet(task) {
        return task.dependencies.every(depId => {
            const depTask = this.tasks.get(depId);
            return depTask && depTask.status === 'completed';
        });
    }

    /**
     * Attempt to assign agents to a task
     */
    async attemptTaskAssignment(task) {
        // Get agent manager
        const agentManager = window.theaterAgentManager;
        if (!agentManager) return false;
        
        const assignedAgents = [];
        
        // Find available agents for each required role
        for (const roleId of task.requiredRoles) {
            const agent = agentManager.getAgentByRole(roleId);
            
            if (agent && this.isAgentAvailable(agent)) {
                assignedAgents.push(agent);
            }
        }
        
        // Check if we have enough agents
        if (assignedAgents.length >= task.requiredRoles.length) {
            // Assign agents to task
            task.assignedAgents = assignedAgents.map(agent => agent.id);
            task.status = 'assigned';
            
            // Track assignments
            this.taskAssignments.set(task.id, assignedAgents);
            
            // Reserve agents
            assignedAgents.forEach(agent => {
                agent.currentTask = task.id;
            });
            
            console.log(`✅ Task assigned: ${task.name} to ${assignedAgents.length} agents`);
            
            return true;
        }
        
        return false;
    }

    /**
     * Check if an agent is available for assignment
     */
    isAgentAvailable(agent) {
        return agent.state.status === 'ready' && !agent.currentTask;
    }

    /**
     * Start execution of an assigned task
     */
    async startTaskExecution(task) {
        try {
            task.status = 'in_progress';
            task.startedAt = new Date();
            
            // Get assigned agents
            const assignedAgents = this.taskAssignments.get(task.id);
            
            // Create collaboration space
            const collaborationSpace = await this.createCollaborationSpace(task, assignedAgents);
            
            // Notify agents of task start
            await this.notifyAgentsOfTaskStart(task, assignedAgents);
            
            // Set up progress monitoring
            this.monitorTaskProgress(task);
            
            // Publish task started event
            window.theaterEventBus?.publish('task:started', {
                taskId: task.id,
                task: task,
                assignedAgents: assignedAgents.map(agent => agent.id)
            });
            
            console.log(`🚀 Task execution started: ${task.name}`);
            
        } catch (error) {
            console.error(`❌ Failed to start task execution: ${task.name}`, error);
            await this.handleTaskFailure(task, error);
        }
    }

    /**
     * Create collaboration space for task execution
     */
    async createCollaborationSpace(task, agents) {
        const collaborationSpace = {
            taskId: task.id,
            participants: agents.map(agent => agent.id),
            sharedResources: new Map(),
            communicationChannel: `task-${task.id}`,
            progressTracking: new Map(),
            deliverables: new Map(),
            createdAt: new Date()
        };
        
        // Subscribe agents to collaboration channel
        agents.forEach(agent => {
            if (window.theaterEventBus) {
                // Create dedicated communication channel for this task
                window.theaterEventBus.subscribe(`task:${task.id}:*`, (data) => {
                    // Route task-specific messages to agent
                    agent.handleTaskMessage?.(data);
                });
            }
        });
        
        return collaborationSpace;
    }

    /**
     * Notify agents that task execution is starting
     */
    async notifyAgentsOfTaskStart(task, agents) {
        const taskStartNotification = {
            taskId: task.id,
            task: task,
            collaborators: agents.map(agent => ({ id: agent.id, role: agent.config.role })),
            expectedDeliverables: task.deliverables,
            deadline: task.deadline,
            resources: task.metadata.resources || {}
        };
        
        // Send notification to each agent
        for (const agent of agents) {
            try {
                // Use agent's task handling method if available
                if (agent.handleTaskAssignment) {
                    await agent.handleTaskAssignment(taskStartNotification);
                }
                
                // Publish agent-specific event
                window.theaterEventBus?.publish(`agent:${agent.id}:task-assigned`, taskStartNotification);
                
            } catch (error) {
                console.error(`⚠️ Failed to notify agent ${agent.id} of task ${task.id}:`, error);
            }
        }
    }

    /**
     * Monitor task progress and handle updates
     */
    monitorTaskProgress(task) {
        const progressMonitor = setInterval(async () => {
            try {
                // Collect progress from assigned agents
                await this.collectTaskProgress(task);
                
                // Check for completion
                if (this.isTaskComplete(task)) {
                    clearInterval(progressMonitor);
                    await this.handleTaskCompletion(task);
                }
                
                // Check for failure
                if (this.isTaskFailed(task)) {
                    clearInterval(progressMonitor);
                    await this.handleTaskFailure(task);
                }
                
                // Check for blocking issues
                if (this.isTaskBlocked(task)) {
                    await this.handleTaskBlocked(task);
                }
                
            } catch (error) {
                console.error(`⚠️ Error monitoring task progress for ${task.id}:`, error);
            }
        }, 10000); // Check every 10 seconds
        
        // Store monitor reference for cleanup
        task.progressMonitor = progressMonitor;
    }

    /**
     * Collect progress updates from assigned agents
     */
    async collectTaskProgress(task) {
        const assignedAgents = this.taskAssignments.get(task.id);
        if (!assignedAgents) return;
        
        let totalProgress = 0;
        let progressReports = 0;
        
        for (const agent of assignedAgents) {
            try {
                // Request progress update from agent
                const progress = agent.getTaskProgress?.(task.id);
                if (typeof progress === 'number') {
                    totalProgress += progress;
                    progressReports++;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to get progress from agent ${agent.id}:`, error);
            }
        }
        
        // Update task progress
        if (progressReports > 0) {
            task.progress = Math.round(totalProgress / progressReports);
            
            // Publish progress update
            window.theaterEventBus?.publish('task:progress', {
                taskId: task.id,
                progress: task.progress,
                timestamp: new Date()
            });
        }
    }

    /**
     * Check if task is complete
     */
    isTaskComplete(task) {
        // Check if all deliverables are provided
        const allDeliverablesProvided = task.deliverables.every(deliverable => 
            task.deliveredAssets.has(deliverable)
        );
        
        // Check if all quality gates are passed
        const allQualityGatesPassed = task.qualityGates.every(gate => 
            task.qualityResults.get(gate) === 'passed'
        );
        
        return allDeliverablesProvided && allQualityGatesPassed;
    }

    /**
     * Handle task completion
     */
    async handleTaskCompletion(task) {
        task.status = 'completed';
        task.completedAt = new Date();
        task.progress = 100;
        
        // Clear progress monitor
        if (task.progressMonitor) {
            clearInterval(task.progressMonitor);
        }
        
        // Release assigned agents
        const assignedAgents = this.taskAssignments.get(task.id);
        if (assignedAgents) {
            assignedAgents.forEach(agent => {
                agent.currentTask = null;
            });
        }
        
        // Update metrics
        this.metrics.completedTasks++;
        this.updateMetrics();
        
        // Execute completion callbacks
        const callbacks = this.completionCallbacks.get(task.id) || [];
        for (const callback of callbacks) {
            try {
                await callback(task);
            } catch (error) {
                console.error(`⚠️ Completion callback failed for task ${task.id}:`, error);
            }
        }
        
        // Trigger dependent tasks
        await this.triggerDependentTasks(task.id);
        
        // Publish completion event
        window.theaterEventBus?.publish('task:completed', {
            taskId: task.id,
            task: task,
            deliverables: Array.from(task.deliveredAssets.keys()),
            duration: task.completedAt - task.startedAt
        });
        
        console.log(`✅ Task completed: ${task.name} (Duration: ${this.formatDuration(task.completedAt - task.startedAt)})`);
    }

    /**
     * Trigger tasks that depend on the completed task
     */
    async triggerDependentTasks(completedTaskId) {
        const dependentTasks = this.dependencyGraph.get(completedTaskId) || [];
        
        for (const dependentTaskId of dependentTasks) {
            const dependentTask = this.tasks.get(dependentTaskId);
            
            if (dependentTask && dependentTask.status === 'pending') {
                // Check if all dependencies are now met
                if (this.areDependenciesMet(dependentTask)) {
                    // Attempt to assign and start the task
                    const queueType = this.determineQueueType(dependentTask);
                    await this.processTaskQueue(queueType);
                }
            }
        }
    }

    /**
     * Add task to dependency graph
     */
    addToDependencyGraph(task) {
        // Add entry for this task
        if (!this.dependencyGraph.has(task.id)) {
            this.dependencyGraph.set(task.id, []);
        }
        
        // Add this task as dependent on its dependencies
        task.dependencies.forEach(depId => {
            if (!this.dependencyGraph.has(depId)) {
                this.dependencyGraph.set(depId, []);
            }
            this.dependencyGraph.get(depId).push(task.id);
        });
    }

    /**
     * Update performance metrics
     */
    updateMetrics() {
        const completedTasks = Array.from(this.tasks.values()).filter(task => task.status === 'completed');
        
        if (completedTasks.length > 0) {
            const totalDuration = completedTasks.reduce((sum, task) => 
                sum + (task.completedAt - task.startedAt), 0
            );
            
            this.metrics.averageDuration = Math.round(totalDuration / completedTasks.length);
            this.metrics.successRate = Math.round((this.metrics.completedTasks / this.metrics.totalTasks) * 100);
        }
    }

    /**
     * Generate task ID
     */
    generateTaskId() {
        return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Format duration for display
     */
    formatDuration(milliseconds) {
        const seconds = Math.round(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * Get task manager status
     */
    getStatus() {
        return {
            tasks: {
                total: this.metrics.totalTasks,
                completed: this.metrics.completedTasks,
                failed: this.metrics.failedTasks,
                active: Array.from(this.tasks.values()).filter(task => 
                    ['assigned', 'in_progress'].includes(task.status)
                ).length,
                pending: Array.from(this.tasks.values()).filter(task => 
                    task.status === 'pending'
                ).length
            },
            queues: {
                creative: this.taskQueues.creative.length,
                technical: this.taskQueues.technical.length,
                performance: this.taskQueues.performance.length,
                support: this.taskQueues.support.length,
                management: this.taskQueues.management.length
            },
            performance: {
                averageDuration: this.metrics.averageDuration,
                successRate: this.metrics.successRate
            }
        };
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.TaskManager = TaskManager;
    console.log('🎯 Task Manager loaded - Ready for intelligent task distribution and progress tracking');
}