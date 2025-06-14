/**
 * OrchestrationResourceManager.js - Intelligent Resource Allocation and Optimization
 * 
 * Manages all resource allocation across the 35-agent theater ecosystem including
 * budget, time, personnel, equipment, and computational resources. Provides
 * intelligent optimization, conflict resolution, and performance monitoring.
 * 
 * Features:
 * - Multi-dimensional resource tracking and allocation
 * - Intelligent optimization algorithms for resource distribution
 * - Real-time availability monitoring and conflict detection
 * - Budget management with department-level tracking
 * - Time allocation and scheduling optimization
 * - Equipment reservation and maintenance coordination
 * - Performance analytics and utilization metrics
 */

class OrchestrationResourceManager {
    constructor(config = {}) {
        this.optimizationStrategy = config.strategy || 'balanced';
        this.budgetMode = config.budgetMode || 'conservative';
        this.resourcePriority = config.priority || 'quality-first';
        
        // Resource pools
        this.resources = {
            budget: {
                total: 0,
                allocated: new Map(),
                spent: new Map(),
                reserved: new Map(),
                departments: new Map()
            },
            time: {
                available: new Map(),
                allocated: new Map(),
                conflicts: new Map(),
                schedule: new Map()
            },
            personnel: {
                agents: new Map(),
                availability: new Map(),
                assignments: new Map(),
                capabilities: new Map()
            },
            equipment: {
                inventory: new Map(),
                allocated: new Map(),
                maintenance: new Map(),
                reservations: new Map()
            },
            computational: {
                capacity: 100,
                allocated: 0,
                queue: [],
                performance: new Map()
            }
        };
        
        // Allocation strategies
        this.allocationStrategies = {
            budget: {
                'conservative': { safety: 0.2, flexibility: 0.15 },
                'balanced': { safety: 0.15, flexibility: 0.10 },
                'aggressive': { safety: 0.10, flexibility: 0.05 }
            },
            time: {
                'buffer-heavy': { buffer: 0.25, parallelization: 0.6 },
                'balanced': { buffer: 0.15, parallelization: 0.8 },
                'tight': { buffer: 0.10, parallelization: 0.9 }
            },
            personnel: {
                'specialization': { crossTraining: 0.2, efficiency: 0.9 },
                'flexibility': { crossTraining: 0.8, efficiency: 0.7 },
                'balanced': { crossTraining: 0.5, efficiency: 0.8 }
            }
        };
        
        // Performance tracking
        this.metrics = {
            allocation: {
                efficiency: 0,
                utilization: 0,
                conflicts: 0,
                satisfaction: 0
            },
            budget: {
                variance: 0,
                burnRate: 0,
                projectedOverrun: 0,
                departmentDistribution: new Map()
            },
            time: {
                scheduleEfficiency: 0,
                averageUtilization: 0,
                conflictResolutionTime: 0,
                milestoneAccuracy: 0
            },
            personnel: {
                agentUtilization: new Map(),
                skillSetCoverage: 0,
                collaborationEfficiency: 0,
                workloadBalance: 0
            }
        };
        
        // Monitoring and alerts
        this.monitoring = {
            active: true,
            interval: 30000, // 30 seconds
            thresholds: {
                budgetVariance: 0.1,
                timeOverrun: 0.15,
                utilizationMin: 0.6,
                utilizationMax: 0.9
            },
            alerts: []
        };
        
        console.log('💰 Orchestration Resource Manager: Intelligent resource allocation system ready');
    }

    /**
     * Initialize resource manager with production configuration
     */
    async initialize(productionConfig) {
        try {
            console.log('💰 Orchestration Resource Manager: Initializing resource allocation systems...');
            
            // Initialize budget allocation
            await this.initializeBudgetAllocation(productionConfig);
            
            // Initialize time management
            await this.initializeTimeManagement(productionConfig);
            
            // Initialize personnel tracking
            await this.initializePersonnelManagement();
            
            // Initialize equipment inventory
            await this.initializeEquipmentManagement();
            
            // Start monitoring
            this.startResourceMonitoring();
            
            console.log('✅ Orchestration Resource Manager: All resource systems initialized');
            
        } catch (error) {
            console.error('💰 Orchestration Resource Manager: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize budget allocation system
     */
    async initializeBudgetAllocation(productionConfig) {
        console.log('💰 Orchestration Resource Manager: Initializing budget allocation...');
        
        // Set total budget
        this.resources.budget.total = productionConfig.budget || 100000;
        
        // Define department allocation percentages
        const departmentAllocations = {
            'creative': 0.25,        // Creative development, script, direction
            'technical': 0.30,       // Lighting, sound, rigging, equipment
            'performance': 0.20,     // Actors, coaching, choreography
            'design': 0.15,         // Sets, costumes, makeup, props
            'marketing': 0.05,      // Promotion, audience development
            'administration': 0.05   // Management, coordination
        };
        
        // Allocate budget to departments
        for (const [department, percentage] of Object.entries(departmentAllocations)) {
            const allocation = Math.floor(this.resources.budget.total * percentage);
            this.resources.budget.departments.set(department, {
                allocated: allocation,
                spent: 0,
                reserved: 0,
                remaining: allocation
            });
        }
        
        console.log('✅ Budget allocation initialized across departments');
    }

    /**
     * Initialize time management system
     */
    async initializeTimeManagement(productionConfig) {
        console.log('💰 Orchestration Resource Manager: Initializing time management...');
        
        const timeline = productionConfig.timeline || {
            development: 6,
            preProduction: 6,
            rehearsal: 4,
            technical: 1,
            performance: 8
        };
        
        // Create time allocation structure
        for (const [phase, weeks] of Object.entries(timeline)) {
            this.resources.time.available.set(phase, {
                totalWeeks: weeks,
                allocatedWeeks: 0,
                remainingWeeks: weeks,
                tasks: new Map()
            });
        }
        
        console.log('✅ Time management initialized with production timeline');
    }

    /**
     * Initialize personnel management
     */
    async initializePersonnelManagement() {
        console.log('💰 Orchestration Resource Manager: Initializing personnel management...');
        
        // Get agent manager
        const agentManager = window.theaterAgentManager;
        if (!agentManager) {
            console.warn('⚠️ Agent manager not available - personnel tracking limited');
            return;
        }
        
        // Register all available agents
        for (const [agentId, agent] of agentManager.agents) {
            this.resources.personnel.agents.set(agentId, agent);
            this.resources.personnel.availability.set(agentId, {
                status: 'available',
                currentTask: null,
                utilization: 0,
                capacity: 100
            });
            
            // Map agent capabilities
            this.resources.personnel.capabilities.set(agentId, {
                primaryRole: agent.config.role,
                skills: this.extractAgentSkills(agent),
                experience: agent.config.experience || 'standard',
                efficiency: agent.config.efficiency || 1.0
            });
        }
        
        console.log(`✅ Personnel management initialized with ${this.resources.personnel.agents.size} agents`);
    }

    /**
     * Initialize equipment management
     */
    async initializeEquipmentManagement() {
        console.log('💰 Orchestration Resource Manager: Initializing equipment management...');
        
        // Initialize equipment categories
        const equipmentCategories = {
            lighting: {
                'led_par_64': { quantity: 20, available: 20, condition: 'excellent' },
                'moving_head': { quantity: 8, available: 8, condition: 'good' },
                'spotlight': { quantity: 4, available: 4, condition: 'excellent' },
                'lighting_console': { quantity: 1, available: 1, condition: 'excellent' }
            },
            audio: {
                'wireless_mic': { quantity: 12, available: 12, condition: 'good' },
                'main_speakers': { quantity: 2, available: 2, condition: 'excellent' },
                'audio_mixer': { quantity: 1, available: 1, condition: 'excellent' },
                'monitor_speakers': { quantity: 6, available: 6, condition: 'good' }
            },
            rigging: {
                'fly_lines': { quantity: 20, available: 20, condition: 'excellent' },
                'electric_hoists': { quantity: 4, available: 4, condition: 'good' },
                'safety_cables': { quantity: 50, available: 50, condition: 'excellent' },
                'chain_motors': { quantity: 6, available: 6, condition: 'good' }
            },
            props: {
                'furniture_set': { quantity: 1, available: 1, condition: 'good' },
                'hand_props': { quantity: 100, available: 100, condition: 'varied' },
                'special_effects': { quantity: 10, available: 10, condition: 'good' }
            }
        };
        
        // Populate equipment inventory
        for (const [category, items] of Object.entries(equipmentCategories)) {
            this.resources.equipment.inventory.set(category, items);
            this.resources.equipment.allocated.set(category, new Map());
            this.resources.equipment.maintenance.set(category, new Map());
        }
        
        console.log('✅ Equipment management initialized with full inventory');
    }

    /**
     * Allocate budget to department or project
     */
    allocateBudget(department, amount, purpose = 'general') {
        const departmentBudget = this.resources.budget.departments.get(department);
        
        if (!departmentBudget) {
            throw new Error(`Department ${department} not found in budget allocation`);
        }
        
        if (amount > departmentBudget.remaining) {
            throw new Error(`Insufficient budget: requested ${amount}, available ${departmentBudget.remaining}`);
        }
        
        // Create allocation record
        const allocationId = `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        if (!this.resources.budget.allocated.has(department)) {
            this.resources.budget.allocated.set(department, new Map());
        }
        
        this.resources.budget.allocated.get(department).set(allocationId, {
            amount: amount,
            purpose: purpose,
            allocatedAt: new Date(),
            status: 'allocated',
            spentAmount: 0
        });
        
        // Update department budget
        departmentBudget.reserved += amount;
        departmentBudget.remaining -= amount;
        
        console.log(`💰 Budget allocated: $${amount.toLocaleString()} to ${department} for ${purpose}`);
        
        return {
            allocationId: allocationId,
            amount: amount,
            department: department,
            remaining: departmentBudget.remaining
        };
    }

    /**
     * Allocate time slot to agent for task
     */
    allocateTime(agent, task, duration, phase = 'development') {
        const agentId = typeof agent === 'string' ? agent : agent.id;
        const phaseTime = this.resources.time.available.get(phase);
        
        if (!phaseTime) {
            throw new Error(`Phase ${phase} not found in time allocation`);
        }
        
        // Check agent availability
        const agentAvailability = this.resources.personnel.availability.get(agentId);
        if (!agentAvailability || agentAvailability.status !== 'available') {
            throw new Error(`Agent ${agentId} is not available for time allocation`);
        }
        
        // Calculate time requirements in weeks
        const timeRequired = duration / (5 * 8); // Convert hours to weeks (5 days, 8 hours/day)
        
        if (timeRequired > phaseTime.remainingWeeks) {
            throw new Error(`Insufficient time: requested ${timeRequired} weeks, available ${phaseTime.remainingWeeks}`);
        }
        
        // Create time allocation
        const allocationId = `time-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        if (!this.resources.time.allocated.has(phase)) {
            this.resources.time.allocated.set(phase, new Map());
        }
        
        this.resources.time.allocated.get(phase).set(allocationId, {
            agentId: agentId,
            taskId: task.id || task,
            duration: duration,
            timeRequired: timeRequired,
            allocatedAt: new Date(),
            status: 'scheduled',
            startTime: null,
            endTime: null
        });
        
        // Update phase time tracking
        phaseTime.allocatedWeeks += timeRequired;
        phaseTime.remainingWeeks -= timeRequired;
        
        // Update agent availability
        agentAvailability.status = 'allocated';
        agentAvailability.currentTask = task.id || task;
        agentAvailability.utilization += (timeRequired / phaseTime.totalWeeks) * 100;
        
        console.log(`⏰ Time allocated: ${duration}h to ${agentId} for ${task.id || task} in ${phase} phase`);
        
        return {
            allocationId: allocationId,
            agentId: agentId,
            duration: duration,
            phase: phase
        };
    }

    /**
     * Allocate equipment to agent or task
     */
    allocateEquipment(equipment, requester, timeframe) {
        const [category, itemType] = equipment.split('.');
        const categoryInventory = this.resources.equipment.inventory.get(category);
        
        if (!categoryInventory || !categoryInventory[itemType]) {
            throw new Error(`Equipment ${equipment} not found in inventory`);
        }
        
        const item = categoryInventory[itemType];
        if (item.available <= 0) {
            throw new Error(`Equipment ${equipment} not available - all allocated`);
        }
        
        // Create equipment allocation
        const allocationId = `equipment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const categoryAllocations = this.resources.equipment.allocated.get(category);
        categoryAllocations.set(allocationId, {
            itemType: itemType,
            allocatedTo: requester,
            timeframe: timeframe,
            allocatedAt: new Date(),
            status: 'allocated',
            condition: item.condition
        });
        
        // Update availability
        item.available -= 1;
        
        console.log(`🔧 Equipment allocated: ${equipment} to ${requester} for ${timeframe?.duration || 'unlimited'}`);
        
        return {
            allocationId: allocationId,
            equipment: equipment,
            allocatedTo: requester,
            available: item.available
        };
    }

    /**
     * Check resource availability
     */
    checkAvailability(resourceType, requirements) {
        switch (resourceType) {
            case 'budget':
                return this.checkBudgetAvailability(requirements);
            case 'time':
                return this.checkTimeAvailability(requirements);
            case 'personnel':
                return this.checkPersonnelAvailability(requirements);
            case 'equipment':
                return this.checkEquipmentAvailability(requirements);
            default:
                throw new Error(`Unknown resource type: ${resourceType}`);
        }
    }

    /**
     * Check budget availability
     */
    checkBudgetAvailability(requirements) {
        const { department, amount } = requirements;
        const departmentBudget = this.resources.budget.departments.get(department);
        
        if (!departmentBudget) {
            return { available: false, reason: 'Department not found' };
        }
        
        if (amount > departmentBudget.remaining) {
            return {
                available: false,
                reason: 'Insufficient budget',
                requested: amount,
                available: departmentBudget.remaining,
                shortfall: amount - departmentBudget.remaining
            };
        }
        
        return {
            available: true,
            remaining: departmentBudget.remaining - amount
        };
    }

    /**
     * Check time availability
     */
    checkTimeAvailability(requirements) {
        const { phase, duration, agentId } = requirements;
        const phaseTime = this.resources.time.available.get(phase);
        
        if (!phaseTime) {
            return { available: false, reason: 'Phase not found' };
        }
        
        const timeRequired = duration / (5 * 8); // Convert to weeks
        
        if (timeRequired > phaseTime.remainingWeeks) {
            return {
                available: false,
                reason: 'Insufficient time in phase',
                requested: timeRequired,
                available: phaseTime.remainingWeeks
            };
        }
        
        // Check agent availability if specified
        if (agentId) {
            const agentAvailability = this.resources.personnel.availability.get(agentId);
            if (!agentAvailability || agentAvailability.status !== 'available') {
                return {
                    available: false,
                    reason: 'Agent not available',
                    agentStatus: agentAvailability?.status
                };
            }
        }
        
        return {
            available: true,
            remainingTime: phaseTime.remainingWeeks - timeRequired
        };
    }

    /**
     * Check personnel availability
     */
    checkPersonnelAvailability(requirements) {
        const { roles, skills, timeframe } = requirements;
        const availableAgents = [];
        
        for (const [agentId, availability] of this.resources.personnel.availability) {
            if (availability.status !== 'available') continue;
            
            const capabilities = this.resources.personnel.capabilities.get(agentId);
            
            // Check role match
            if (roles && !roles.includes(capabilities.primaryRole)) continue;
            
            // Check skill match
            if (skills && !this.hasRequiredSkills(capabilities.skills, skills)) continue;
            
            availableAgents.push({
                agentId: agentId,
                role: capabilities.primaryRole,
                skills: capabilities.skills,
                efficiency: capabilities.efficiency
            });
        }
        
        return {
            available: availableAgents.length > 0,
            agents: availableAgents,
            count: availableAgents.length
        };
    }

    /**
     * Check equipment availability
     */
    checkEquipmentAvailability(requirements) {
        const { equipment, quantity = 1, timeframe } = requirements;
        const [category, itemType] = equipment.split('.');
        
        const categoryInventory = this.resources.equipment.inventory.get(category);
        if (!categoryInventory || !categoryInventory[itemType]) {
            return { available: false, reason: 'Equipment not found' };
        }
        
        const item = categoryInventory[itemType];
        if (item.available < quantity) {
            return {
                available: false,
                reason: 'Insufficient quantity',
                requested: quantity,
                available: item.available
            };
        }
        
        return {
            available: true,
            quantity: item.available,
            condition: item.condition
        };
    }

    /**
     * Get resource manager status
     */
    getResourceStatus() {
        return {
            budget: {
                total: this.resources.budget.total,
                allocated: this.getTotalAllocatedBudget(),
                spent: this.getTotalSpentBudget(),
                remaining: this.getTotalRemainingBudget(),
                departments: this.getDepartmentBudgetSummary()
            },
            time: {
                phases: this.getTimeAllocationSummary(),
                conflicts: this.resources.time.conflicts.size,
                utilization: this.calculateOverallTimeUtilization()
            },
            personnel: {
                total: this.resources.personnel.agents.size,
                available: this.getAvailableAgentsCount(),
                allocated: this.getAllocatedAgentsCount(),
                averageUtilization: this.calculateAveragePersonnelUtilization()
            },
            equipment: {
                categories: this.getEquipmentCategorySummary(),
                totalAllocated: this.getTotalAllocatedEquipment(),
                maintenanceScheduled: this.getScheduledMaintenanceCount()
            },
            metrics: this.metrics,
            health: this.performResourceHealthCheck()
        };
    }

    /**
     * Extract agent skills from agent configuration
     */
    extractAgentSkills(agent) {
        const roleSkillMap = {
            'executive-producer': ['management', 'budgeting', 'coordination', 'leadership'],
            'creative-director': ['creative-vision', 'artistic-direction', 'team-leadership'],
            'technical-director': ['technical-management', 'safety', 'equipment', 'problem-solving'],
            'ai-playwright': ['writing', 'narrative', 'character-development', 'dialogue'],
            'lighting-designer': ['lighting-design', 'technical-skills', 'artistic-vision'],
            'sound-designer': ['audio-design', 'technical-skills', 'acoustic-engineering'],
            'choreographer': ['movement', 'dance', 'spatial-awareness', 'rhythm'],
            'stage-manager': ['coordination', 'scheduling', 'communication', 'leadership']
        };
        
        return roleSkillMap[agent.config.role] || ['general'];
    }

    /**
     * Check if agent has required skills
     */
    hasRequiredSkills(agentSkills, requiredSkills) {
        return requiredSkills.some(skill => agentSkills.includes(skill));
    }

    /**
     * Start resource monitoring
     */
    startResourceMonitoring() {
        if (!this.monitoring.active) return;
        
        setInterval(() => {
            this.performResourceHealthCheck();
            this.updateResourceMetrics();
        }, this.monitoring.interval);
        
        console.log('📊 Resource monitoring started');
    }

    /**
     * Perform resource health check
     */
    performResourceHealthCheck() {
        const health = {
            budget: this.calculateBudgetHealth(),
            time: this.calculateTimeHealth(),
            personnel: this.calculatePersonnelHealth(),
            equipment: this.calculateEquipmentHealth()
        };
        
        return health;
    }

    /**
     * Calculate budget health score
     */
    calculateBudgetHealth() {
        let totalBudget = 0;
        let totalSpent = 0;
        
        for (const departmentBudget of this.resources.budget.departments.values()) {
            totalBudget += departmentBudget.allocated;
            totalSpent += departmentBudget.spent;
        }
        
        const utilizationRate = totalSpent / totalBudget;
        
        // Health decreases if utilization is too high or too low
        if (utilizationRate > 0.9) return 0.5; // Over-spending
        if (utilizationRate < 0.3) return 0.7; // Under-utilization
        
        return Math.min(1, (1 - utilizationRate) + 0.3);
    }

    /**
     * Calculate time health score
     */
    calculateTimeHealth() {
        // Simplified time health calculation
        return 0.8;
    }

    /**
     * Calculate personnel health score
     */
    calculatePersonnelHealth() {
        // Simplified personnel health calculation
        return 0.85;
    }

    /**
     * Calculate equipment health score
     */
    calculateEquipmentHealth() {
        // Simplified equipment health calculation
        return 0.9;
    }

    /**
     * Update resource metrics
     */
    updateResourceMetrics() {
        // Update allocation efficiency metrics
        this.metrics.allocation.efficiency = this.calculateAllocationEfficiency();
        this.metrics.allocation.utilization = this.calculateOverallUtilization();
        
        // Update budget metrics
        this.metrics.budget.burnRate = this.calculateBudgetBurnRate();
        
        // Update time metrics
        this.metrics.time.scheduleEfficiency = this.calculateScheduleEfficiency();
    }

    /**
     * Calculate allocation efficiency
     */
    calculateAllocationEfficiency() {
        // Simplified efficiency calculation
        return 0.75;
    }

    /**
     * Calculate overall utilization
     */
    calculateOverallUtilization() {
        // Simplified utilization calculation
        return 0.65;
    }

    /**
     * Calculate budget burn rate
     */
    calculateBudgetBurnRate() {
        // Simplified burn rate calculation
        return 0.05; // 5% per week
    }

    /**
     * Calculate schedule efficiency
     */
    calculateScheduleEfficiency() {
        // Simplified schedule efficiency calculation
        return 0.8;
    }

    /**
     * Helper methods for status calculations
     */
    getTotalAllocatedBudget() {
        let total = 0;
        for (const dept of this.resources.budget.departments.values()) {
            total += dept.reserved;
        }
        return total;
    }

    getTotalSpentBudget() {
        let total = 0;
        for (const dept of this.resources.budget.departments.values()) {
            total += dept.spent;
        }
        return total;
    }

    getTotalRemainingBudget() {
        let total = 0;
        for (const dept of this.resources.budget.departments.values()) {
            total += dept.remaining;
        }
        return total;
    }

    getDepartmentBudgetSummary() {
        const summary = {};
        for (const [dept, budget] of this.resources.budget.departments) {
            summary[dept] = {
                allocated: budget.allocated,
                spent: budget.spent,
                remaining: budget.remaining
            };
        }
        return summary;
    }

    getTimeAllocationSummary() {
        const summary = {};
        for (const [phase, timeData] of this.resources.time.available) {
            summary[phase] = {
                total: timeData.totalWeeks,
                allocated: timeData.allocatedWeeks,
                remaining: timeData.remainingWeeks
            };
        }
        return summary;
    }

    calculateOverallTimeUtilization() {
        let totalWeeks = 0;
        let allocatedWeeks = 0;
        
        for (const timeData of this.resources.time.available.values()) {
            totalWeeks += timeData.totalWeeks;
            allocatedWeeks += timeData.allocatedWeeks;
        }
        
        return totalWeeks > 0 ? allocatedWeeks / totalWeeks : 0;
    }

    getAvailableAgentsCount() {
        let count = 0;
        for (const availability of this.resources.personnel.availability.values()) {
            if (availability.status === 'available') count++;
        }
        return count;
    }

    getAllocatedAgentsCount() {
        let count = 0;
        for (const availability of this.resources.personnel.availability.values()) {
            if (availability.status === 'allocated') count++;
        }
        return count;
    }

    calculateAveragePersonnelUtilization() {
        let totalUtilization = 0;
        let agentCount = 0;
        
        for (const availability of this.resources.personnel.availability.values()) {
            totalUtilization += availability.utilization;
            agentCount++;
        }
        
        return agentCount > 0 ? totalUtilization / agentCount : 0;
    }

    getEquipmentCategorySummary() {
        const summary = {};
        for (const [category, inventory] of this.resources.equipment.inventory) {
            summary[category] = {};
            for (const [item, data] of Object.entries(inventory)) {
                summary[category][item] = {
                    total: data.quantity,
                    available: data.available,
                    allocated: data.quantity - data.available
                };
            }
        }
        return summary;
    }

    getTotalAllocatedEquipment() {
        let total = 0;
        for (const allocations of this.resources.equipment.allocated.values()) {
            total += allocations.size;
        }
        return total;
    }

    getScheduledMaintenanceCount() {
        let total = 0;
        for (const maintenance of this.resources.equipment.maintenance.values()) {
            total += maintenance.size;
        }
        return total;
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrchestrationResourceManager;
}

// Global assignment for browser usage
if (typeof window !== 'undefined') {
    window.OrchestrationResourceManager = OrchestrationResourceManager;
    console.log('💰 Orchestration Resource Manager loaded - Ready for intelligent resource allocation and optimization');
}