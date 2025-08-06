const TestBuilder = require('../helpers/test-builder');

/**
 * Transaction Test Suite
 * Tests transaction-specific functionality including field mapping and filtering
 * Updated to use new filter structure: { field_name, operator, value }
 */
class TransactionTestSuite {
    constructor() {
        this.builder = new TestBuilder();
        this.tests = this.defineTests();
    }

    /**
     * Define all tests in this suite
     * @returns {Array} Array of test cases
     */
    defineTests() {
        return [
            // Test 1: Empty fields (uses tra.* - CONFIRMED WORKING)
            this.builder.createTransactionTest({
                trandate_startdate: '01-01-2024',
                trandate_enddate: '31-12-2024'
            }, {
                fields: [], // Empty fields array
                pageSize: 3,
                description: 'Transaction - Empty Fields Array (Wildcard)',
                expectedMinRecords: 0
            }),

            // Test 2: Sales Orders only with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'equals',
                        value: 'SalesOrd'
                    }
                ],
                fields: [], // Use wildcard
                pageSize: 3,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Sales Orders Only (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 3: Multiple transaction types with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc']
                    }
                ],
                fields: [], // Use wildcard
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Multiple Types (Array Filter - New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 4: Customer Invoices with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'equals',
                        value: 'CustInvc'
                    }
                ],
                fields: [], // Use wildcard
                pageSize: 3,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Customer Invoices (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 5: Date range test (2025) with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2025',
                        enddate: '31-12-2025'
                    }
                ],
                fields: ['id', 'tranid', 'trandate', 'type'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Date Range Test 2025 (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 6: Safe custom fields (CONFIRMED WORKING)
            this.builder.createTransactionTest({
                type: 'SalesOrd'
            }, {
                fields: ['id', 'tranid', 'type', 'trandate'],
                pageSize: 3,
                description: 'Transaction - Safe Custom Fields',
                expectedMinRecords: 0
            }),

            // Test 7: Transaction with amount filter using new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc']
                    },
                    {
                        field_name: 'amount',
                        operator: 'greater_than_or_equal',
                        value: 100
                    }
                ],
                fields: ['id', 'tranid', 'trandate', 'amount'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Amount Filter (>= 100) (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 8: Transaction status filter with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'equals',
                        value: 'SalesOrd'
                    },
                    {
                        field_name: 'status',
                        operator: 'not_equals',
                        value: 'Cancelled'
                    }
                ],
                fields: ['id', 'tranid', 'type', 'status'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Status Filter (Not Cancelled) (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 9: Entity filter (customer transactions) with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc']
                    },
                    {
                        field_name: 'entity',
                        operator: 'greater_than',
                        value: 0
                    }
                ],
                fields: ['id', 'tranid', 'entity', 'type'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Entity Filter (Customer Transactions) (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 10: Complex date and type filter with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc', 'CashSale']
                    },
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-06-2024',
                        enddate: '31-12-2024'
                    }
                ],
                fields: ['id', 'tranid', 'trandate', 'type'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Complex Date & Type Filter (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 11: Recent transactions (current year) with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    },
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc']
                    }
                ],
                fields: ['id', 'tranid', 'trandate', 'type'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Recent Transactions 2024 (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 12: Memo field search (LIKE operator) with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'equals',
                        value: 'SalesOrd'
                    },
                    {
                        field_name: 'memo',
                        operator: 'contains',
                        value: 'test'
                    }
                ],
                fields: ['id', 'tranid', 'memo', 'type'],
                pageSize: 3,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Memo Search (Contains) (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Test 13: Amount range filter with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc']
                    },
                    {
                        field_name: 'amount',
                        operator: 'greater_than',
                        value: 0
                    },
                    {
                        field_name: 'amount',
                        operator: 'less_than_or_equal',
                        value: 10000
                    }
                ],
                fields: ['id', 'tranid', 'amount', 'type'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Transaction - Amount Range Filter (0 < amount <= 10000) (New Structure)',
                    created: new Date().toISOString()
                }
            }
        ];
    }

    /**
     * Get all tests for this suite
     * @returns {Array} Test cases
     */
    getTests() {
        return this.tests;
    }

    /**
     * Get suite information
     * @returns {Object} Suite metadata
     */
    getSuiteInfo() {
        return {
            name: 'Transaction Tests',
            description: 'Transaction-specific tests including field mapping, filtering, and business logic with new filter structure',
            testCount: this.tests.length,
            categories: [
                'Transaction Types',
                'Date Filtering', 
                'Amount Filtering',
                'Status Filtering',
                'Field Mapping',
                'Complex Queries',
                'New Filter Structure',
                'Range Filters'
            ]
        };
    }
}

module.exports = TransactionTestSuite; 