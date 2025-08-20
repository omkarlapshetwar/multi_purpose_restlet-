/**
 * Quick Revenue Test
 * Single test to show NetSuite response quickly
 */

const NetSuiteOAuth = require('../src/lib/netsuite-oauth');

async function quickRevenueTest() {
    console.log('⚡ Quick Revenue Element Test');
    console.log('==============================');
    console.log('🌐 Testing single revenue plan query');
    console.log('');
    
    const oauth = new NetSuiteOAuth();
    
    // Single test: Basic revenue plan query
    console.log('📋 Test: Basic Revenue Plan Query (Minimal)');
    try {
        const response = await oauth.callRestlet({
            recordType: 'revenueplan',
            filters: [],
            pageSize: 2, // Small page size for quick response
            debug: true
        });
        
        console.log('✅ Revenue plan query completed');
        console.log('📊 Response Summary:');
        console.log(`   Success: ${response.success}`);
        console.log(`   Error: ${response.error || 'None'}`);
        console.log(`   Record Type: ${response.recordType}`);
        
        if (response.debug && response.debug.errorDetails) {
            console.log('🔍 Error Details:');
            console.log(`   Type: ${response.debug.errorDetails.type}`);
            console.log(`   Name: ${response.debug.errorDetails.name}`);
            console.log(`   Message: ${response.debug.errorDetails.message}`);
        }
        
    } catch (error) {
        console.log('❌ Revenue plan query failed');
        console.log('🔍 Error:', error.message);
        if (error.response) {
            console.log('📄 Response Status:', error.response.status);
            console.log('📄 Response Data:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Quick test completed');
}

// Run the quick test
quickRevenueTest().catch(console.error);
