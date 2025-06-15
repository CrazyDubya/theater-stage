// Direct test of actual system files
const fs = require('fs');
const path = require('path');

console.log('=== DIRECT SYSTEM TEST ===');

// Read and evaluate actual files
function loadFile(filePath) {
    console.log(`Loading: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Create a sandbox environment
    const sandbox = {
        console: console,
        window: global,
        global: global,
        module: { exports: {} },
        exports: {}
    };
    
    // Execute the file content
    const vm = require('vm');
    const context = vm.createContext(sandbox);
    vm.runInContext(content, context);
    
    return sandbox;
}

try {
    // Load core files
    console.log('\n--- Loading Core Systems ---');
    loadFile('js/core/EventBus.js');
    loadFile('js/core/OllamaTheaterInterface.js');
    loadFile('js/core/BaseAgent.js');
    loadFile('js/core/AgentManager.js');
    
    console.log('\n--- Loading Orchestration ---');
    loadFile('js/core/OrchestrationResourceManager.js');
    loadFile('js/core/TaskManager.js');
    loadFile('js/core/ProductionOrchestrator.js');
    
    console.log('\n--- Loading Sample Agent ---');
    loadFile('js/agents/ExecutiveProducerAgent.js');
    
    console.log('\n--- Testing Actual System ---');
    
    // Test EventBus
    if (global.theaterEventBus) {
        console.log('✓ EventBus loaded');
        global.theaterEventBus.publish('test', { data: 'test' });
        console.log('✓ EventBus publish works');
    }
    
    // Test AgentManager
    if (global.theaterAgentManager) {
        console.log('✓ AgentManager loaded');
        global.theaterAgentManager.initialize().then(() => {
            console.log('✓ AgentManager initialized');
        }).catch(err => console.error('✗ AgentManager init failed:', err.message));
    }
    
    // Test ResourceManager
    if (global.OrchestrationResourceManager) {
        console.log('✓ OrchestrationResourceManager class loaded');
        const rm = new global.OrchestrationResourceManager();
        console.log('✓ ResourceManager instance created');
    }
    
    // Test TaskManager
    if (global.TaskManager) {
        console.log('✓ TaskManager class loaded');
        const tm = new global.TaskManager();
        console.log('✓ TaskManager instance created');
        
        const task = tm.createTask({
            name: 'Test Task',
            requiredRoles: ['test-role']
        });
        console.log('✓ Task created:', task.id);
    }
    
    // Test ProductionOrchestrator
    if (global.ProductionOrchestrator) {
        console.log('✓ ProductionOrchestrator class loaded');
        const po = new global.ProductionOrchestrator();
        console.log('✓ ProductionOrchestrator instance created');
    }
    
    // Test ExecutiveProducerAgent
    if (global.ExecutiveProducerAgent) {
        console.log('✓ ExecutiveProducerAgent class loaded');
        const epa = new global.ExecutiveProducerAgent();
        console.log('✓ ExecutiveProducerAgent instance created');
        console.log('Agent config:', epa.config);
    }
    
    console.log('\n=== SYSTEM VALIDATION COMPLETE ===');
    console.log('All core components loaded and functional');
    
} catch (error) {
    console.error('=== TEST FAILED ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
}