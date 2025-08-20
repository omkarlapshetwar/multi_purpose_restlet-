/**
 * Debug Revenue Test
 * Shows full error responses from NetSuite to debug HTTP 400 issues
 */

const config = require('../src/config/netsuite-config');

async function debugRevenueElements() {
    console.log('🔍 Debug Revenue Element Test');
    console.log('==============================');
    console.log('🌐 Testing with live NetSuite connection');
    console.log(`🔗 URL: ${config.restlet.url}`);
    console.log(`🌍 Realm: ${config.oauth.realm}`);
    console.log('');
    
    // Test 1: Basic revenue plan query with full error capture
    console.log('📋 Test 1: Basic Revenue Plan Query (with error details)');
    try {
        const response = await fetch(config.restlet.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `OAuth realm="${config.oauth.realm}",oauth_consumer_key="${config.oauth.consumerKey}",oauth_token="${config.oauth.accessToken}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${Math.floor(Date.now() / 1000)}",oauth_nonce="${Math.random().toString(36).substring(2)}",oauth_version="1.0"`
            },
            body: JSON.stringify({
                recordType: 'revenueplan',
                filters: [],
                pageSize: 5,
                debug: true
            })
        });

        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        console.log(`📋 Response Headers:`, Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log(`📄 Full Response Body:`, responseText);
        
        if (response.ok) {
            console.log('✅ Revenue plan query successful');
        } else {
            console.log('❌ Revenue plan query failed');
            console.log('🔍 Error Details:', responseText);
        }
    } catch (error) {
        console.log(`💥 Network Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    
    // Test 2: Try with a known working record type (customer) for comparison
    console.log('📋 Test 2: Customer Query (for comparison)');
    try {
        const response = await fetch(config.restlet.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `OAuth realm="${config.oauth.realm}",oauth_consumer_key="${config.oauth.consumerKey}",oauth_token="${config.oauth.accessToken}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${Math.floor(Date.now() / 1000)}",oauth_nonce="${Math.random().toString(36).substring(2)}",oauth_version="1.0"`
            },
            body: JSON.stringify({
                recordType: 'customer',
                filters: { isinactive: 'F' },
                pageSize: 1,
                debug: true
            })
        });

        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`📄 Response Body:`, responseText);
        
        if (response.ok) {
            console.log('✅ Customer query successful - restlet is working');
        } else {
            console.log('❌ Customer query also failed');
        }
    } catch (error) {
        console.log(`💥 Network Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    
    // Test 3: Try with transaction record type
    console.log('📋 Test 3: Transaction Query (another comparison)');
    try {
        const response = await fetch(config.restlet.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `OAuth realm="${config.oauth.realm}",oauth_consumer_key="${config.oauth.consumerKey}",oauth_token="${config.oauth.accessToken}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${Math.floor(Date.now() / 1000)}",oauth_nonce="${Math.random().toString(36).substring(2)}",oauth_version="1.0"`
            },
            body: JSON.stringify({
                recordType: 'transaction',
                filters: { type: 'SalesOrd' },
                pageSize: 1,
                debug: true
            })
        });

        console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`📄 Response Body:`, responseText);
        
        if (response.ok) {
            console.log('✅ Transaction query successful');
        } else {
            console.log('❌ Transaction query failed');
        }
    } catch (error) {
        console.log(`💥 Network Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Debug test completed');
}

// Run the debug test
debugRevenueElements().catch(console.error);
