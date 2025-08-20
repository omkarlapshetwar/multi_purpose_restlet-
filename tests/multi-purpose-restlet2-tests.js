/**
 * Multi-Purpose Restlet 2 Test Suite
 * Tests the advanced restlet with ARM support and line table handling
 */

const NetSuiteOAuth = require('../src/lib/netsuite-oauth');

class MultiPurposeRestlet2TestSuite {
    constructor() {
        this.oauth = new NetSuiteOAuth();
        this.skipConnection = process.argv.includes('--no-conn');
    }

    defineTests() {
        return [
            // Test 1: Transaction with multiple filters
            {
                name: 'Transaction with Type, Date Range, and Amount',
                recordType: 'transaction',
                filters: [
                    { "field_name": "type", "operator": "equals", "value": "CustInvc" },
                    { "field_name": "trandate", "operator": "date_range", "startdate": "01-07-2025", "enddate": "31-07-2025" },
                    { "field_name": "total", "operator": "greater_than_or_equal", "value": 1000 }
                ],
                fields: ["id", "tranid", "entity", "trandate", "total"],
                orderBy: "trandate",
                orderDir: "DESC",
                pageSize: 25,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Customer Invoice transactions from July 2025 with total >= 1000',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            },

            // Test 2: Revenue Element with arrangement filter
            {
                name: 'Revenue Element by Revenue Arrangement',
                recordType: 'revenueelement',
                filters: [
                    { "field_name": "revenuearrangement", "operator": "equals", "value": 2680155 }
                ],
                fields: ["id", "recordnumber", "revenuearrangement", "item", "entity", "allocationamount", "salesamount", "revrecstartdate", "revrecenddate", "revenueplanstatus"],
                orderBy: "id",
                orderDir: "DESC",
                pageSize: 10,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Revenue elements for specific revenue arrangement',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            },

            // Test 3: Transaction Line with transaction IDs
            {
                name: 'Transaction Lines by Transaction IDs',
                recordType: 'transactionline',
                filters: [
                    { "field_name": "transaction", "operator": "in", "values": [2639907, 2639908, 2640007] }
                ],
                fields: [
                    "transaction",
                    "linesequencenumber",
                    "item",
                    "quantity",
                    "rate",
                    "amount",
                    "location",
                    "department",
                    "class"
                ],
                orderBy: "transaction",
                orderDir: "DESC",
                pageSize: 1000,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Transaction lines for specific transaction IDs',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            },

            // Test 4: Revenue Plan Planned Revenue with type and date
            {
                name: 'Revenue Plan Planned Revenue by Type and Date',
                recordType: 'revenueplanplannedrevenue',
                filters: [
                    { "field_name": "revenueplantype", "operator": "equals", "value": "ACTUAL" },
                    { "field_name": "revrecstartdate", "operator": "date_range", "startdate": "01-10-2021", "enddate": "31-10-2021" }
                ],
                fields: ["revenueplan", "plannedperiod", "postingperiod", "amount", "isrecognized", "journal"],
                orderBy: "revenueplan",
                orderDir: "ASC",
                pageSize: 100,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Actual revenue plan planned revenue for October 2021',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            },

            // Test 5: Customer with basic filter
            {
                name: 'Active Customers',
                recordType: 'customer',
                filters: [
                    { "field_name": "isinactive", "operator": "equals", "value": "F" }
                ],
                fields: ["id", "entityid", "companyname", "email"],
                pageSize: 5,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Active customers with basic fields',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            },

            // Test 6: Item with inventory filter
            {
                name: 'Inventory Items',
                recordType: 'inventoryitem',
                filters: [
                    { "field_name": "isinactive", "operator": "equals", "value": "F" },
                    { "field_name": "itemtype", "operator": "equals", "value": "InvtPart" }
                ],
                fields: ["id", "itemid", "displayname", "itemtype", "quantityavailable"],
                pageSize: 10,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Active inventory items',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            },

            // Test 7: Complex transaction filter
            {
                name: 'Complex Transaction Filter',
                recordType: 'transaction',
                filters: [
                    { "field_name": "type", "operator": "in", "values": ["SalesOrd", "CustInvc", "CashSale"] },
                    { "field_name": "trandate", "operator": "date_range", "startdate": "01-01-2025", "enddate": "31-12-2025" },
                    { "field_name": "total", "operator": "greater_than", "value": 500 },
                    { "field_name": "entity", "operator": "is_not_null" }
                ],
                fields: ["id", "tranid", "type", "trandate", "total", "entity", "status"],
                orderBy: "total",
                orderDir: "DESC",
                pageSize: 50,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Sales transactions from 2025 with total > 500 and entity',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            },

            // Test 8: Revenue Element with date range
            {
                name: 'Revenue Element by Date Range',
                recordType: 'revenueelement',
                filters: [
                    { "field_name": "revrecstartdate", "operator": "date_range", "startdate": "01-01-2025", "enddate": "31-12-2025" },
                    { "field_name": "salesamount", "operator": "greater_than", "value": 1000 }
                ],
                fields: ["id", "recordnumber", "revenuearrangement", "salesamount", "revrecstartdate", "revrecenddate"],
                orderBy: "salesamount",
                orderDir: "DESC",
                pageSize: 20,
                usePagination: true,
                debug: true,
                testMetadata: {
                    description: 'Revenue elements starting in 2025 with sales amount > 1000',
                    expectedMinRecords: 0,
                    shouldSucceed: true
                }
            }
        ];
    }

    async runTests() {
        console.log('🧪 Multi-Purpose Restlet 2 Test Suite');
        console.log('=====================================');
        console.log('🌐 Testing advanced restlet with ARM support');
        console.log('🔧 Features: Line tables, header filters, advanced operators');
        
        if (this.skipConnection) {
            console.log('🔌 Running in NO-CONNECTION mode - validating filter structure only');
            console.log('📋 No actual NetSuite API calls will be made');
        }
        
        console.log('');
        
        const tests = this.defineTests();
        let passed = 0;
        let failed = 0;
        let total = tests.length;

        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            console.log(`\n📋 Test ${i + 1}/${total}: ${test.name}`);
            console.log(`🎯 Record Type: ${test.recordType}`);
            console.log(`🔍 Filters: ${JSON.stringify(test.filters)}`);
            console.log(`📊 Fields: ${test.fields ? test.fields.length : 'All'} fields`);
            console.log(`📄 Page Size: ${test.pageSize}`);
            
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
            const response = await this.oauth.callRestlet({
                recordType: test.recordType,
                filters: test.filters,
                fields: test.fields,
                orderBy: test.orderBy,
                orderDir: test.orderDir,
                pageSize: test.pageSize,
                usePagination: test.usePagination,
                debug: test.debug
            });
            
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

        // Validate additional fields
        if (test.orderBy && typeof test.orderBy !== 'string') {
            validationErrors.push('orderBy must be a string');
        }
        if (test.orderDir && !['ASC', 'DESC'].includes(test.orderDir.toUpperCase())) {
            validationErrors.push('orderDir must be ASC or DESC');
        }
        if (test.pageSize && (typeof test.pageSize !== 'number' || test.pageSize <= 0)) {
            validationErrors.push('pageSize must be a positive number');
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
}

// Run tests if this file is executed directly
if (require.main === module) {
    const testSuite = new MultiPurposeRestlet2TestSuite();
    testSuite.runTests().catch(console.error);
}

module.exports = MultiPurposeRestlet2TestSuite;
