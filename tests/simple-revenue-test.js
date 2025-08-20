/**
 * Simple Revenue Test
 * Basic test to debug revenue element functionality
 */

const config = require('../src/config/netsuite-config');

async function testRevenueElements() {
    console.log('🧪 Simple Revenue Element Test');
    console.log('================================');
    
    // Test 1: Basic revenue plan query
    console.log('\n📋 Test 1: Basic Revenue Plan Query');
    try {
        const response = await fetch(config.restlet.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `OAuth realm="${config.oauth.realm}",oauth_consumer_key="${config.oauth.consumerKey}",oauth_token="${config.oauth.accessToken}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${Math.floor(Date.now() / 1000)}",oauth_nonce="${Math.random().toString(36).substring(2)}",oauth_version="1.0"`
            },
            body: JSON.stringify({
                recordType: 'revenueplan',
                filters: {},
                pageSize: 5,
                debug: true
            })
        });

        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log(`Response: ${data}`);
        
        if (response.ok) {
            console.log('✅ Revenue plan query successful');
        } else {
            console.log('❌ Revenue plan query failed');
        }
    } catch (error) {
        console.log(`💥 Error: ${error.message}`);
    }

    // Test 2: Basic customer query (to verify restlet works)
    console.log('\n📋 Test 2: Basic Customer Query (Verification)');
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

        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log(`Response: ${data}`);
        
        if (response.ok) {
            console.log('✅ Customer query successful');
        } else {
            console.log('❌ Customer query failed');
        }
    } catch (error) {
        console.log(`💥 Error: ${error.message}`);
    }

    // Test 3: Try with transaction record type
    console.log('\n📋 Test 3: Transaction Query (Alternative)');
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

        console.log(`Status: ${response.status}`);
        const data = await response.text();
        console.log(`Response: ${data}`);
        
        if (response.ok) {
            console.log('✅ Transaction query successful');
        } else {
            console.log('❌ Transaction query failed');
        }
    } catch (error) {
        console.log(`💥 Error: ${error.message}`);
    }
}

// Run the test
testRevenueElements().catch(console.error);
