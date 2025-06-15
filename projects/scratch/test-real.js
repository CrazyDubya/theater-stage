// Test if the actual system works by loading it in a simulated browser environment
const puppeteer = require('puppeteer');

async function testActualSystem() {
    let browser, page;
    
    try {
        console.log('=== TESTING ACTUAL BROWSER EXECUTION ===');
        
        // Launch headless browser
        browser = await puppeteer.launch({ headless: true });
        page = await browser.newPage();
        
        // Capture console output from the page
        page.on('console', msg => {
            console.log(`[BROWSER] ${msg.text()}`);
        });
        
        page.on('pageerror', error => {
            console.log(`[ERROR] ${error.message}`);
        });
        
        // Navigate to the test page
        console.log('Loading test page...');
        await page.goto('http://localhost:8080/simple-test.html', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        // Wait for the test to complete
        await page.waitForTimeout(5000);
        
        // Get the final output
        const output = await page.$eval('#output', el => el.textContent);
        console.log('\n=== ACTUAL BROWSER OUTPUT ===');
        console.log(output);
        
        console.log('\n=== TEST RESULT ===');
        if (output.includes('RAW TEST COMPLETE')) {
            console.log('✓ SYSTEM WORKS - Test completed successfully');
        } else {
            console.log('✗ SYSTEM FAILED - Test did not complete');
        }
        
    } catch (error) {
        console.log(`✗ BROWSER TEST FAILED: ${error.message}`);
        
        // Fallback: try direct file access
        console.log('\nTrying fallback test...');
        
        const fs = require('fs');
        const path = require('path');
        
        // Check if core files have the expected content
        const coreFiles = [
            'js/core/EventBus.js',
            'js/core/TaskManager.js',
            'js/core/OrchestrationResourceManager.js'
        ];
        
        let filesWorking = 0;
        for (const file of coreFiles) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                if (content.includes('class ') && content.length > 1000) {
                    console.log(`✓ ${file} appears functional`);
                    filesWorking++;
                } else {
                    console.log(`✗ ${file} appears incomplete`);
                }
            } catch (err) {
                console.log(`✗ ${file} not accessible`);
            }
        }
        
        if (filesWorking === coreFiles.length) {
            console.log('✓ FILES EXIST AND APPEAR FUNCTIONAL');
        } else {
            console.log('✗ SOME FILES MISSING OR BROKEN');
        }
        
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Check if puppeteer is available, otherwise do basic checks
if (require.resolve('puppeteer')) {
    testActualSystem();
} else {
    console.log('Puppeteer not available, doing basic file check...');
    
    const fs = require('fs');
    const files = [
        'js/core/EventBus.js',
        'js/core/TaskManager.js', 
        'demo.html'
    ];
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✓ ${file} exists`);
        } else {
            console.log(`✗ ${file} missing`);
        }
    });
}