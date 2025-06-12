/**
 * Debug Integration Script - Phase 3A Week 1 Day 6-7
 * 
 * Automated checks for common integration issues
 */

const integrationChecks = {
    
    // Check 1: Dependency Loading Order
    checkDependencyOrder() {
        console.log('🔍 Checking dependency loading order...');
        
        const requiredSystems = [
            'window.stageState',
            'window.threeSceneManager', 
            'window.threeObjectFactory',
            'window.ACTOR_STATES',
            'window.ActorStateMachine',
            'window.ActorMovement',
            'window.ActorCollisionAvoidance',
            'window.theatricalActorFactory',
            'window.UIFactory',
            'window.stageUIManager'
        ];
        
        const missing = [];
        const available = [];
        
        requiredSystems.forEach(system => {
            const parts = system.split('.');
            let obj = window;
            let found = true;
            
            for (let part of parts.slice(1)) {
                if (obj && obj[part]) {
                    obj = obj[part];
                } else {
                    found = false;
                    break;
                }
            }
            
            if (found) {
                available.push(system);
            } else {
                missing.push(system);
            }
        });
        
        console.log(`✅ Available systems (${available.length}/${requiredSystems.length}):`);
        available.forEach(system => console.log(`   ✓ ${system}`));
        
        if (missing.length > 0) {
            console.log(`❌ Missing systems (${missing.length}):`);
            missing.forEach(system => console.log(`   ✗ ${system}`));
            return false;
        }
        
        return true;
    },
    
    // Check 2: Actor Factory Integration
    checkActorFactoryIntegration() {
        console.log('🔍 Checking ActorFactory integration...');
        
        if (!window.theatricalActorFactory) {
            console.log('❌ TheatricalActorFactory not found');
            return false;
        }
        
        // Check if it's hooked into ObjectFactory
        if (!window.threeObjectFactory) {
            console.log('❌ ObjectFactory not found');
            return false;
        }
        
        // Check if addActorAt method is overridden
        const originalMethod = window.threeObjectFactory.addActorAt;
        if (typeof originalMethod === 'function') {
            console.log('✅ ObjectFactory.addActorAt method exists');
            
            // Check if it's the enhanced version (by checking function length or toString)
            const methodString = originalMethod.toString();
            if (methodString.includes('Behavioral layer intercepting')) {
                console.log('✅ ActorFactory hook detected in ObjectFactory');
                return true;
            } else {
                console.log('⚠️ ActorFactory may not be properly hooked into ObjectFactory');
                return false;
            }
        } else {
            console.log('❌ ObjectFactory.addActorAt method not found');
            return false;
        }
    },
    
    // Check 3: UI Manager Actor Controls
    checkUIManagerActorControls() {
        console.log('🔍 Checking UIManager actor controls...');
        
        if (!window.stageUIManager) {
            console.log('❌ UIManager not found');
            return false;
        }
        
        const uiState = window.stageUIManager.uiState;
        const requiredUIState = [
            'selectedActorId',
            'actorSelectionMode', 
            'showActorPaths',
            'showCollisionGrid',
            'actorDebugMode',
            'multiSelectMode',
            'selectedActors'
        ];
        
        const missingUIState = requiredUIState.filter(prop => !(prop in uiState));
        
        if (missingUIState.length > 0) {
            console.log(`❌ Missing UI state properties: ${missingUIState.join(', ')}`);
            return false;
        }
        
        console.log('✅ All required UI state properties present');
        
        // Check if actor management methods exist
        const requiredMethods = [
            'clearAllActors',
            'selectActor',
            'updateActorSelection',
            'moveSelectedActorsTo',
            'adjustSelectedActorsPersonality'
        ];
        
        const missingMethods = requiredMethods.filter(method => 
            typeof window.stageUIManager[method] !== 'function'
        );
        
        if (missingMethods.length > 0) {
            console.log(`❌ Missing UI methods: ${missingMethods.join(', ')}`);
            return false;
        }
        
        console.log('✅ All required UI methods present');
        return true;
    },
    
    // Check 4: State Machine Integration
    checkStateMachineIntegration() {
        console.log('🔍 Checking State Machine integration...');
        
        if (!window.ACTOR_STATES || !window.STATE_EVENTS) {
            console.log('❌ Actor states/events not defined globally');
            return false;
        }
        
        console.log(`✅ Actor states defined: ${Object.keys(window.ACTOR_STATES).length} states`);
        console.log(`✅ State events defined: ${Object.keys(window.STATE_EVENTS).length} events`);
        
        // Check state machine class
        if (!window.ActorStateMachine) {
            console.log('❌ ActorStateMachine class not found');
            return false;
        }
        
        try {
            const testStateMachine = new window.ActorStateMachine('test');
            if (testStateMachine.currentState === 'idle') {
                console.log('✅ State machine creates with correct initial state');
                return true;
            } else {
                console.log(`❌ State machine has incorrect initial state: ${testStateMachine.currentState}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Error creating state machine: ${error.message}`);
            return false;
        }
    },
    
    // Check 5: Movement System Integration  
    checkMovementSystemIntegration() {
        console.log('🔍 Checking Movement System integration...');
        
        if (!window.ActorMovement) {
            console.log('❌ ActorMovement class not found');
            return false;
        }
        
        try {
            const testMovement = new window.ActorMovement('test');
            
            // Check pathfinding grid
            if (testMovement.pathfindingGrid && testMovement.pathfindingGrid.cells) {
                console.log(`✅ Pathfinding grid initialized: ${testMovement.pathfindingGrid.cellsX}x${testMovement.pathfindingGrid.cellsZ}`);
            } else {
                console.log('❌ Pathfinding grid not properly initialized');
                return false;
            }
            
            // Check required methods
            const requiredMethods = ['setTarget', 'updateMovement', 'findPath', 'stop'];
            const missingMethods = requiredMethods.filter(method => 
                typeof testMovement[method] !== 'function'
            );
            
            if (missingMethods.length > 0) {
                console.log(`❌ Missing movement methods: ${missingMethods.join(', ')}`);
                return false;
            }
            
            console.log('✅ All movement system methods present');
            return true;
            
        } catch (error) {
            console.log(`❌ Error creating movement system: ${error.message}`);
            return false;
        }
    },
    
    // Check 6: Collision Avoidance Integration
    checkCollisionAvoidanceIntegration() {
        console.log('🔍 Checking Collision Avoidance integration...');
        
        if (!window.ActorCollisionAvoidance) {
            console.log('❌ ActorCollisionAvoidance class not found');
            return false;
        }
        
        try {
            const testAvoidance = new window.ActorCollisionAvoidance('test');
            
            // Check avoidance parameters
            if (testAvoidance.personalSpace > 0 && testAvoidance.obstacleAvoidanceRadius > 0) {
                console.log(`✅ Collision avoidance parameters set: personal space=${testAvoidance.personalSpace}, obstacle radius=${testAvoidance.obstacleAvoidanceRadius}`);
            } else {
                console.log('❌ Invalid collision avoidance parameters');
                return false;
            }
            
            // Check required methods
            const requiredMethods = ['update', 'isCurrentlyAvoiding', 'getAvoidanceDebugInfo'];
            const missingMethods = requiredMethods.filter(method => 
                typeof testAvoidance[method] !== 'function'
            );
            
            if (missingMethods.length > 0) {
                console.log(`❌ Missing avoidance methods: ${missingMethods.join(', ')}`);
                return false;
            }
            
            console.log('✅ All collision avoidance methods present');
            return true;
            
        } catch (error) {
            console.log(`❌ Error creating collision avoidance: ${error.message}`);
            return false;
        }
    },
    
    // Check 7: Overall Integration
    async checkOverallIntegration() {
        console.log('🔍 Checking overall system integration...');
        
        // Try to initialize systems in correct order
        try {
            if (window.threeSceneManager && !window.threeSceneManager.isInitialized) {
                await window.threeSceneManager.initialize();
                console.log('✅ SceneManager initialized');
            }
            
            if (window.threeStageBuilder && !window.threeStageBuilder.isInitialized) {
                await window.threeStageBuilder.initialize();
                console.log('✅ StageBuilder initialized');
            }
            
            if (window.threeObjectFactory && !window.threeObjectFactory.isInitialized) {
                await window.threeObjectFactory.initialize();
                console.log('✅ ObjectFactory initialized');
            }
            
            if (window.theatricalActorFactory && !window.theatricalActorFactory.isInitialized) {
                await window.theatricalActorFactory.initialize();
                console.log('✅ ActorFactory initialized');
            }
            
            if (window.stageUIManager && !window.stageUIManager.isInitialized) {
                await window.stageUIManager.initialize();
                console.log('✅ UIManager initialized');
            }
            
            console.log('✅ All systems initialized successfully');
            return true;
            
        } catch (error) {
            console.log(`❌ System initialization error: ${error.message}`);
            return false;
        }
    },
    
    // Run all checks
    async runAllChecks() {
        console.log('🧪 Starting Phase 3A Week 1 Integration Diagnostic...\n');
        
        const checks = [
            { name: 'Dependency Order', fn: this.checkDependencyOrder },
            { name: 'Actor Factory Integration', fn: this.checkActorFactoryIntegration },
            { name: 'UI Manager Actor Controls', fn: this.checkUIManagerActorControls },
            { name: 'State Machine Integration', fn: this.checkStateMachineIntegration },
            { name: 'Movement System Integration', fn: this.checkMovementSystemIntegration },
            { name: 'Collision Avoidance Integration', fn: this.checkCollisionAvoidanceIntegration },
            { name: 'Overall Integration', fn: this.checkOverallIntegration }
        ];
        
        const results = [];
        
        for (const check of checks) {
            console.log(`\n--- ${check.name} ---`);
            try {
                const result = await check.fn.call(this);
                results.push({ name: check.name, passed: result });
                console.log(`${result ? '✅' : '❌'} ${check.name}: ${result ? 'PASSED' : 'FAILED'}`);
            } catch (error) {
                console.log(`❌ ${check.name}: ERROR - ${error.message}`);
                results.push({ name: check.name, passed: false, error: error.message });
            }
        }
        
        // Summary
        console.log('\n🏁 Integration Diagnostic Summary:');
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        const successRate = (passed / total * 100).toFixed(1);
        
        console.log(`   Results: ${passed}/${total} checks passed (${successRate}%)`);
        
        if (successRate >= 85) {
            console.log('✅ Integration is in good shape! Ready for performance testing.');
        } else if (successRate >= 70) {
            console.log('⚠️ Some integration issues detected, but core functionality should work.');
        } else {
            console.log('❌ Significant integration issues detected. Manual debugging required.');
        }
        
        console.log('\n📋 Failed checks:');
        results.filter(r => !r.passed).forEach(result => {
            console.log(`   ❌ ${result.name}${result.error ? ': ' + result.error : ''}`);
        });
        
        return { passed, total, successRate, results };
    }
};

// Auto-run if in browser context
if (typeof window !== 'undefined') {
    window.integrationChecks = integrationChecks;
    console.log('🔧 Integration diagnostic tools loaded. Run integrationChecks.runAllChecks()');
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = integrationChecks;
}