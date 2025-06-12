// Simple test to debug deformation issues
console.log('🔧 Testing deformation logic...');

// Test the problematic conditional logic
function testControls() {
    const facial = {
        faceWidth: 1.0,
        faceHeight: 1.0,
        jawline: 0.5,
        cheekbones: 0.3,
        eyeSize: 1.0
    };
    
    const proportions = {
        arms: 1.0,
        shoulders: 1.0,
        hips: 1.0
    };
    
    const muscle = {
        definition: 0.5
    };
    
    console.log('📊 Testing facial controls:');
    console.log('faceWidth (1.0):', !!facial.faceWidth, '- should be true');
    console.log('jawline (0.5):', !!facial.jawline, '- should be true');
    console.log('cheekbones (0.3):', !!facial.cheekbones, '- should be true');
    console.log('jawline !== undefined:', facial.jawline !== undefined, '- should be true');
    console.log('cheekbones !== undefined:', facial.cheekbones !== undefined, '- should be true');
    
    console.log('\n📊 Testing body controls:');
    console.log('arms (1.0):', !!proportions.arms && proportions.arms !== 1.0, '- should be false');
    console.log('arms !== undefined && !== 1.0:', proportions.arms !== undefined && proportions.arms !== 1.0, '- should be false');
    
    console.log('\n📊 Testing muscle controls:');
    console.log('muscle.definition (0.5):', !!muscle.definition, '- should be true');
    console.log('muscle.definition !== undefined:', muscle.definition !== undefined, '- should be true');
    
    // Test when sliders are at 0
    const testZero = {
        jawline: 0,
        cheekbones: 0,
        muscle: { definition: 0 }
    };
    
    console.log('\n📊 Testing zero values:');
    console.log('jawline (0):', !!testZero.jawline, '- should be false');
    console.log('jawline !== undefined:', testZero.jawline !== undefined, '- should be true');
    console.log('muscle.definition (0):', !!testZero.muscle.definition, '- should be false');
    console.log('muscle.definition !== undefined:', testZero.muscle.definition !== undefined, '- should be true');
}

testControls();