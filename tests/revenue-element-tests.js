/**
 * Revenue Element Tests
 * Tests revenue plan and revenue recognition schedule filters
 */

const config = require('../src/config/netsuite-config');
const TestBuilder = require('./helpers/test-builder');

class RevenueElementTestSuite {
    constructor() {
        this.builder = new TestBuilder();
        this.skipConnection = process.argv.includes('--no-conn');
    }

    defineTests() {
        return [
            // Basic Revenue Plan Tests
            {
                recordType: 'revenueplan',
                filters: [],
                fields: ['id', 'transaction', 'revenueplan', 'startdate', 'enddate', 'amount'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: true,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Basic Revenue Plan Query - All Records',
                    created: new Date().toISOString()
                }
            },

            // Revenue Plans by Date Range
            {
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
                pageIndex: 0,
                usePagination: false,
                debug: true,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Revenue Plans by Date Range (2024)',
                    created: new Date().toISOString()
                }
            },

            // Revenue Plans by Amount
            {
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
                pageIndex: 0,
                usePagination: false,
                debug: true,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Revenue Plans with Amount > 100',
                    created: new Date().toISOString()
                }
            },

            // Revenue Plans by Status
            {
                recordType: 'revenueplan',
                filters: [
                    {
                        field_name: 'status',
                        operator: 'equals',
                        value: 'Active'
                    }
                ],
                fields: ['id', 'transaction', 'revenueplan', 'status', 'amount', 'startdate'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: true,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Revenue Plans with Active Status',
                    created: new Date().toISOString()
                }
            },

            // Revenue Recognition Schedule
            {
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
                pageIndex: 0,
                usePagination: false,
                debug: true,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Revenue Recognition Schedule by Date Range',
                    created: new Date().toISOString()
                }
            },

            // Complex Revenue Plan Filter
            {
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
                pageIndex: 0,
                usePagination: false,
                debug: true,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Complex Revenue Plan Filter - Date + Amount + Status',
                    created: new Date().toISOString()
                }
            },

            // High Value Revenue Plans
            {
                recordType: 'revenueplan',
                filters: [
                    {
                        field_name: 'amount',
                        operator: 'greater_than',
                        value: 1000
                    },
                    {
                        field_name: 'status',
                        operator: 'equals',
                        value: 'Active'
                    }
                ],
                fields: ['id', 'transaction', 'revenueplan', 'amount', 'startdate', 'enddate', 'status'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: true,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'High Value Active Revenue Plans',
                    created: new Date().toISOString()
                }
            }
        ];
    }

    async runTests() {
        console.log('🧪 Revenue Element Test Suite');
        console.log('=====================================');
        
        if (this.skipConnection) {
            console.log('🔌 Running in NO-CONNECTION mode - validating filter structure only');
            console.log('📋 No actual NetSuite API calls will be made');
            console.log('');
        }
        
        const tests = this.defineTests();
        let passed = 0;
        let failed = 0;
        let total = tests.length;

        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            console.log(`\n📋 Test ${i + 1}/${total}: ${test.testMetadata.description}`);
            console.log(`🎯 Record Type: ${test.recordType}`);
            console.log(`🔍 Filters: ${JSON.stringify(test.filters)}`);
            
            try {
                const result = await this.runSingleTest(test);
                if (result.success) {
                    console.log(`✅ PASSED: ${result.message}`);
                    passed++;
                } else {
                    console.log(`❌ FAILED: ${result.message}`);
                    failed++;
                }
            } catch (error) {
                console.log(`💥 ERROR: ${error.message}`);
                failed++;
            }
        }

        console.log('\n📊 Test Results Summary');
        console.log('========================');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total: ${total}`);
        console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    }

    async runSingleTest(test) {
        // If skipping connection, just validate the filter structure
        if (this.skipConnection) {
            return this.validateFilterStructure(test);
        }

        try {
            const response = await this.makeRequest(test);
            
            if (response.success) {
                const recordCount = response.data?.length || 0;
                const minRecords = test.testMetadata.expectedMinRecords;
                
                if (recordCount >= minRecords) {
                    return {
                        success: true,
                        message: `Found ${recordCount} records (expected ≥${minRecords})`
                    };
                } else {
                    return {
                        success: false,
                        message: `Found ${recordCount} records but expected ≥${minRecords}`
                    };
                }
            } else {
                return {
                    success: false,
                    message: `Request failed: ${response.error || 'Unknown error'}`
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Test execution error: ${error.message}`
            };
        }
    }

    validateFilterStructure(test) {
        // Validate filter structure without making actual requests
        const filters = test.filters;
        let validationErrors = [];

        // Check if filters array exists and is valid
        if (!Array.isArray(filters)) {
            validationErrors.push('Filters must be an array');
        }

        // Validate each filter object
        if (Array.isArray(filters)) {
            filters.forEach((filter, index) => {
                if (!filter.field_name) {
                    validationErrors.push(`Filter ${index + 1}: Missing field_name`);
                }
                if (!filter.operator) {
                    validationErrors.push(`Filter ${index + 1}: Missing operator`);
                }
                if (filter.operator === 'date_range' && (!filter.startdate || !filter.enddate)) {
                    validationErrors.push(`Filter ${index + 1}: date_range requires startdate and enddate`);
                }
                if (filter.operator === 'in' && !Array.isArray(filter.values)) {
                    validationErrors.push(`Filter ${index + 1}: 'in' operator requires values array`);
                }
                if (['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal', 'contains', 'starts_with', 'ends_with', 'not_contains'].includes(filter.operator) && filter.value === undefined) {
                    validationErrors.push(`Filter ${index + 1}: Operator '${filter.operator}' requires a value`);
                }
            });
        }

        if (validationErrors.length > 0) {
            return {
                success: false,
                message: `Filter validation failed: ${validationErrors.join(', ')}`
            };
        }

        return {
            success: true,
            message: 'Filter structure is valid (no connection test)'
        };
    }

    async makeRequest(test) {
        const url = config.restlet.url;
        
        const requestData = {
            recordType: test.recordType,
            filters: test.filters,
            fields: test.fields,
            pageSize: test.pageSize,
            pageIndex: test.pageIndex,
            usePagination: test.usePagination,
            debug: test.debug
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `OAuth realm="${config.oauth.realm}",oauth_consumer_key="${config.oauth.consumerKey}",oauth_token="${config.oauth.accessToken}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${Math.floor(Date.now() / 1000)}",oauth_nonce="${Math.random().toString(36).substring(2)}",oauth_version="1.0"`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new RevenueElementTestSuite();
    testSuite.runTests().catch(console.error);
}

module.exports = RevenueElementTestSuite;
