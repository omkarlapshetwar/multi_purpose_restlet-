/**
 * Test suite for GL Details RESTlet (v3.0)
 * Using uniform filter format (same as multi-purpose-restlet3)
 * 
 * IMPORTANT: Before running these tests, update the GL account numbers and names
 * with valid values from YOUR NetSuite instance. The example values may not exist
 * in your system.
 * 
 * To find valid accounts:
 * 1. Go to Lists → Accounting → Accounts in NetSuite
 * 2. Or see: docs/finding-your-gl-accounts.md
 * 3. Replace placeholder values below with your actual account numbers/names
 */

const https = require('https');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const config = require('../src/config/netsuite-config');

// ============================================================================
// CONFIGURATION: Update these values with accounts from YOUR NetSuite instance
// ============================================================================
const TEST_CONFIG = {
    // Replace with a valid GL account number from your system
    glNumber: '315400',  // UPDATE THIS
    
    // Replace with a valid GL account name (or partial name)
    glName: 'Other Income',  // UPDATE THIS
    
    // Replace with a valid period name from your system
    period: 'Apr 2025',  // UPDATE THIS
    
    // Replace with a valid subsidiary ID (or remove if single-subsidiary)
    subsidiaryId: '2',  // UPDATE THIS
    
    // Date range for testing (adjust to your needs)
    startDate: '2025-04-01',  // UPDATE THIS
    endDate: '2025-04-30'  // UPDATE THIS
};

// OAuth 1.0 setup
const oauth = OAuth({
    consumer: {
        key: config.consumerKey,
        secret: config.consumerSecret
    },
    signature_method: 'HMAC-SHA256',
    hash_function(base_string, key) {
        return crypto
            .createHmac('sha256', key)
            .update(base_string)
            .digest('base64');
    }
});

const token = {
    key: config.tokenId,
    secret: config.tokenSecret
};

/**
 * Make RESTlet request with OAuth
 */
function makeRequest(method, requestData) {
    return new Promise((resolve, reject) => {
        const url = config.restletUrl;
        const request_data = {
            url: url,
            method: method
        };

        const authHeader = oauth.toHeader(oauth.authorize(request_data, token));
        authHeader['Content-Type'] = 'application/json';
        authHeader['Authorization'] = authHeader['Authorization'].replace('OAuth ', 'OAuth ') + `, realm="${config.realm}"`;

        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: authHeader
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON response: ' + data));
                }
            });
        });

        req.on('error', reject);

        if (method === 'POST' && requestData) {
            req.write(JSON.stringify(requestData));
        }

        req.end();
    });
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('='.repeat(80));
    console.log('GL DETAILS RESTLET TESTS (v3.0 - Uniform Filter Format)');
    console.log('='.repeat(80));
    console.log();

    const tests = [
        testGetInfo,
        testByGLNumberAndPeriod,
        testByGLNameAndPeriod,
        testByGLNumberAndDateRange,
        testByGLNameAndDateRange,
        testGLNameContains,
        testGLNameExactMatch,
        testGLNameStartsWith,
        testGLNameEndsWith,
        testMultipleSubsidiaries,
        testSummaryOnly,
        testWithSymbolicOperators,
        testLegacyFormatCompatibility
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            await test();
            passed++;
            console.log('✓ PASSED\n');
        } catch (error) {
            failed++;
            console.log(`✗ FAILED: ${error.message}\n`);
        }
    }

    console.log('='.repeat(80));
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(80));
}

/**
 * Test 1: GET request for API info
 */
async function testGetInfo() {
    console.log('Test 1: GET request for API info');
    console.log('-'.repeat(80));
    
    const result = await makeRequest('GET');
    console.log(JSON.stringify(result, null, 2));
    
    if (!result.name || result.version !== '3.0') {
        throw new Error('Expected version 3.0');
    }
}

/**
 * Test 2: Search by GL Number and Period (Uniform Format)
 */
async function testByGLNumberAndPeriod() {
    console.log('Test 2: Search by GL Number and Period (Uniform Format)');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glNumber', operator: '=', value: TEST_CONFIG.glNumber },
            { field: 'period', operator: '=', value: TEST_CONFIG.period },
            { field: 'subsidiary', operator: '=', value: TEST_CONFIG.subsidiaryId }
        ],
        includeDetails: true,
        topTransactionsLimit: 5
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 3: Search by GL Name and Period
 */
async function testByGLNameAndPeriod() {
    console.log('Test 3: Search by GL Name and Period');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glName', operator: 'contains', value: TEST_CONFIG.glName },
            { field: 'period', operator: '=', value: TEST_CONFIG.period }
        ],
        includeDetails: true
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccount: result.glAccount,
        transactionCount: result.summary?.transactionCount,
        netAmount: result.summary?.netAmount
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 4: Search by GL Number with Custom Date Range
 */
async function testByGLNumberAndDateRange() {
    console.log('Test 4: Search by GL Number with Custom Date Range');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glNumber', operator: '=', value: '315700' },
            { field: 'trandate', operator: '>=', value: '2025-04-01' },
            { field: 'trandate', operator: '<=', value: '2025-06-30' }
        ],
        includeDetails: true,
        topTransactionsLimit: 10
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccount: result.glAccount,
        dateRange: result.dateRange,
        transactionCount: result.summary?.transactionCount
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 5: Search by GL Name with Date Range (Q1 2025)
 */
async function testByGLNameAndDateRange() {
    console.log('Test 5: Search by GL Name with Date Range (Q1 2025)');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glName', operator: 'contains', value: 'Subscription Revenue' },
            { field: 'trandate', operator: '>=', value: '2025-01-01' },
            { field: 'trandate', operator: '<=', value: '2025-03-31' }
        ],
        topTransactionsLimit: 20
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccount: result.glAccount,
        transactionCount: result.summary?.transactionCount,
        topTransactionsCount: result.topTransactions?.length
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 6: GL Name Contains (Partial Match)
 */
async function testGLNameContains() {
    console.log('Test 6: GL Name Contains (Partial Match)');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glName', operator: 'contains', value: 'Revenue' },
            { field: 'period', operator: '=', value: 'Apr 2025' }
        ],
        includeDetails: true
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccount: result.glAccount,
        matchedName: result.glAccount?.name,
        containsRevenue: result.glAccount?.name?.includes('Revenue')
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 7: GL Name Exact Match
 */
async function testGLNameExactMatch() {
    console.log('Test 7: GL Name Exact Match');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glName', operator: '=', value: 'Other Income' },
            { field: 'period', operator: '=', value: 'Apr 2025' }
        ],
        includeDetails: false
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccountName: result.glAccount?.name,
        exactMatch: result.glAccount?.name === 'Other Income'
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 8: GL Name Starts With
 */
async function testGLNameStartsWith() {
    console.log('Test 8: GL Name Starts With');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glName', operator: 'starts_with', value: 'Subscription' },
            { field: 'period', operator: '=', value: 'Apr 2025' }
        ],
        includeDetails: false
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccountName: result.glAccount?.name,
        startsWithSubscription: result.glAccount?.name?.startsWith('Subscription')
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 9: GL Name Ends With
 */
async function testGLNameEndsWith() {
    console.log('Test 9: GL Name Ends With');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glName', operator: 'ends_with', value: 'Income' },
            { field: 'period', operator: '=', value: 'Apr 2025' }
        ],
        includeDetails: false
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccountName: result.glAccount?.name,
        endsWithIncome: result.glAccount?.name?.endsWith('Income')
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 10: Multiple Subsidiary Support
 */
async function testMultipleSubsidiaries() {
    console.log('Test 10: Filter by Multiple Subsidiaries (using "in" operator)');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glNumber', operator: '=', value: '315400' },
            { field: 'period', operator: '=', value: 'Apr 2025' },
            { field: 'subsidiary', operator: 'in', values: ['1', '2', '3'] }
        ],
        includeDetails: false
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        transactionCount: result.summary?.transactionCount,
        currencyBreakdown: result.currencyBreakdown
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 11: Summary Only (No Details)
 */
async function testSummaryOnly() {
    console.log('Test 11: Get Summary Only (includeDetails: false)');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glNumber', operator: '=', value: '550415' },
            { field: 'period', operator: '=', value: 'Apr 2025' }
        ],
        includeDetails: false
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        hasSummary: !!result.summary,
        hasTopTransactions: !!result.topTransactions,
        hasTransactionDetails: !!result.transactionDetails
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
    
    if (result.topTransactions || result.transactionDetails) {
        console.log('Warning: Details included despite includeDetails: false');
    }
}

/**
 * Test 12: Using Symbolic Operators
 */
async function testWithSymbolicOperators() {
    console.log('Test 12: Using Symbolic Operators (>=, <=)');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: [
            { field: 'glNumber', operator: '=', value: '315300' },
            { field: 'trandate', operator: '>=', value: '2024-01-01' },
            { field: 'trandate', operator: '<=', value: '2024-12-31' }
        ],
        includeDetails: true,
        topTransactionsLimit: 5
    };
    
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccount: result.glAccount,
        dateRange: result.dateRange,
        transactionCount: result.summary?.transactionCount,
        netAmount: result.summary?.netAmount
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

/**
 * Test 13: Legacy Format Compatibility (Optional)
 */
async function testLegacyFormatCompatibility() {
    console.log('Test 13: Legacy Format Compatibility (Object-based filters)');
    console.log('-'.repeat(80));
    
    const requestBody = {
        filters: {
            glNumber: '315400',
            period: 'Apr 2025',
            subsidiary: '2'
        },
        includeDetails: false
    };
    
    console.log('Request (legacy format):', JSON.stringify(requestBody, null, 2));
    
    const result = await makeRequest('POST', requestBody);
    console.log('Response Summary:', {
        success: result.success,
        glAccount: result.glAccount,
        transactionCount: result.summary?.transactionCount
    });
    
    if (!result.success) {
        throw new Error(result.error || 'Request failed');
    }
}

// Run tests if executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests, makeRequest };

