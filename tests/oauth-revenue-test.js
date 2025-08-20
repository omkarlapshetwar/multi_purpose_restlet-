/**
 * OAuth Revenue Test
 * Uses proper NetSuite OAuth library to test revenue elements
 */

const NetSuiteOAuth = require('../src/lib/netsuite-oauth');

async function testRevenueWithOAuth() {
    console.log('🔐 OAuth Revenue Element Test');
    console.log('==============================');
    console.log('🌐 Using proper NetSuite OAuth library');
    console.log('');
    
    const oauth = new NetSuiteOAuth();
    
    // Test 1: Basic revenue plan query
    console.log('📋 Test 1: Basic Revenue Plan Query');
    try {
        const response = await oauth.callRestlet({
            recordType: 'revenueplan',
            filters: [],
            pageSize: 5,
            debug: true
        });
        
        console.log('✅ Revenue plan query successful');
        console.log('📊 Response:', JSON.stringify(response, null, 2));
        
    } catch (error) {
        console.log('❌ Revenue plan query failed');
        console.log('🔍 Error:', error.message);
        if (error.response) {
            console.log('📄 Response Status:', error.response.status);
            console.log('📄 Response Data:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(50));
    
    // Test 2: Revenue plans by date range
    console.log('📋 Test 2: Revenue Plans by Date Range (2024)');
    try {
        const response = await oauth.callRestlet({
            recordType: 'revenueplan',
            filters: [
                {
                    field_name: 'startdate',
                    operator: 'date_range',
                    startdate: '01-01-2024',
                    enddate: '31-12-2024'
                }
            ],
            fields: ['id', 'transaction', 'revenueplan', 'startdate', 'enddate', 'amount', 'status'],
            pageSize: 5,
            debug: true
        });
        
        console.log('✅ Revenue plan date range query successful');
        console.log('📊 Response:', JSON.stringify(response, null, 2));
        
    } catch (error) {
        console.log('❌ Revenue plan date range query failed');
        console.log('🔍 Error:', error.message);
        if (error.response) {
            console.log('📄 Response Status:', error.response.status);
            console.log('📄 Response Data:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(50));
    
    // Test 3: Revenue plans by amount
    console.log('📋 Test 3: Revenue Plans with Amount > 100');
    try {
        const response = await oauth.callRestlet({
            recordType: 'revenueplan',
            filters: [
                {
                    field_name: 'amount',
                    operator: 'greater_than',
                    value: 100
                }
            ],
            fields: ['id', 'transaction', 'revenueplan', 'amount', 'startdate', 'enddate'],
            pageSize: 5,
            debug: true
        });
        
        console.log('✅ Revenue plan amount query successful');
        console.log('📊 Response:', JSON.stringify(response, null, 2));
        
    } catch (error) {
        console.log('❌ Revenue plan amount query failed');
        console.log('🔍 Error:', error.message);
        if (error.response) {
            console.log('📄 Response Status:', error.response.status);
        console.log('📄 Response Data:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(50));
    
    // Test 4: Revenue recognition schedule
    console.log('📋 Test 4: Revenue Recognition Schedule');
    try {
        const response = await oauth.callRestlet({
            recordType: 'revenuerecognitionschedule',
            filters: [
                {
                    field_name: 'startdate',
                    operator: 'date_range',
                    startdate: '01-01-2024',
                    enddate: '31-12-2024'
                }
            ],
            fields: ['id', 'transaction', 'revenueplan', 'startdate', 'enddate', 'amount', 'recognized'],
            pageSize: 5,
            debug: true
        });
        
        console.log('✅ Revenue recognition schedule query successful');
        console.log('📊 Response:', JSON.stringify(response, null, 2));
        
    } catch (error) {
        console.log('❌ Revenue recognition schedule query failed');
        console.log('🔍 Error:', error.message);
        if (error.response) {
            console.log('📄 Response Status:', error.response.status);
            console.log('📄 Response Data:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(50));
    
    // Test 5: Complex revenue plan filter
    console.log('📋 Test 5: Complex Revenue Plan Filter');
    try {
        const response = await oauth.callRestlet({
            recordType: 'revenueplan',
            filters: [
                {
                    field_name: 'startdate',
                    operator: 'date_range',
                    startdate: '01-01-2024',
                    enddate: '31-12-2024'
                },
                {
                    field_name: 'amount',
                    operator: 'greater_than_or_equal',
                    value: 500
                },
                {
                    field_name: 'status',
                    operator: 'not_equals',
                    value: 'Cancelled'
                }
            ],
            fields: ['id', 'transaction', 'revenueplan', 'startdate', 'enddate', 'amount', 'status'],
            pageSize: 5,
            debug: true
        });
        
        console.log('✅ Complex revenue plan query successful');
        console.log('📊 Response:', JSON.stringify(response, null, 2));
        
    } catch (error) {
        console.log('❌ Complex revenue plan query failed');
        console.log('🔍 Error:', error.message);
        if (error.response) {
            console.log('📄 Response Status:', error.response.status);
            console.log('📄 Response Data:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 OAuth revenue test completed');
}

// Run the OAuth test
testRevenueWithOAuth().catch(console.error);
