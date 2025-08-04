const TestBuilder = require('../helpers/test-builder');

/**
 * Transaction Test Suite
 * Tests transaction-specific functionality including field mapping and filtering
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

            // Test 2: Sales Orders only
            this.builder.createTransactionTest({
                type: 'SalesOrd'
            }, {
                fields: [], // Use wildcard
                pageSize: 3,
                description: 'Transaction - Sales Orders Only',
                expectedMinRecords: 0
            }),

            // Test 3: Multiple transaction types
            this.builder.createArrayFilterTest('transaction', 'type', ['SalesOrd', 'CustInvc'], {}, {
                fields: [], // Use wildcard
                pageSize: 5,
                description: 'Transaction - Multiple Types (Array Filter)',
                expectedMinRecords: 0
            }),

            // Test 4: Customer Invoices
            this.builder.createTransactionTest({
                type: 'CustInvc'
            }, {
                fields: [], // Use wildcard
                pageSize: 3,
                description: 'Transaction - Customer Invoices',
                expectedMinRecords: 0
            }),

            // Test 5: Date range test (2025)
            this.builder.createDateRangeTest('transaction', 'trandate', '01-01-2025', '31-12-2025'),

            // Test 6: Safe custom fields (CONFIRMED WORKING)
            this.builder.createTransactionTest({
                type: 'SalesOrd'
            }, {
                fields: ['id', 'tranid', 'type', 'trandate'],
                pageSize: 3,
                description: 'Transaction - Safe Custom Fields',
                expectedMinRecords: 0
            }),

            // Test 7: Transaction with amount filter (using custom operator)
            this.builder.createCustomOperatorTest('transaction', 'amount', '>=', 100, {
                type: ['SalesOrd', 'CustInvc']
            }, {
                fields: ['id', 'tranid', 'trandate', 'amount'],
                description: 'Transaction - Amount Filter (>= 100)',
                expectedMinRecords: 0
            }),

            // Test 8: Transaction status filter
            this.builder.createTransactionTest({
                type: 'SalesOrd',
                status: {
                    operator: '!=',
                    value: 'Cancelled'
                }
            }, {
                fields: ['id', 'tranid', 'type', 'status'],
                pageSize: 5,
                description: 'Transaction - Status Filter (Not Cancelled)',
                expectedMinRecords: 0
            }),

            // Test 9: Entity filter (customer transactions)
            this.builder.createTransactionTest({
                type: ['SalesOrd', 'CustInvc'],
                entity: {
                    operator: '>',
                    value: 0
                }
            }, {
                fields: ['id', 'tranid', 'entity', 'type'],
                pageSize: 5,
                description: 'Transaction - Entity Filter (Customer Transactions)',
                expectedMinRecords: 0
            }),

            // Test 10: Complex date and type filter
            this.builder.createTransactionTest({
                type: ['SalesOrd', 'CustInvc', 'CashSale'],
                trandate_startdate: '01-06-2024',
                trandate_enddate: '31-12-2024'
            }, {
                fields: ['id', 'tranid', 'trandate', 'type'],
                pageSize: 10,
                description: 'Transaction - Complex Date & Type Filter',
                expectedMinRecords: 0
            }),

            // Test 11: Recent transactions (current year)
            this.builder.createDateRangeTest('transaction', 'trandate', '01-01-2024', '31-12-2024', {
                type: ['SalesOrd', 'CustInvc']
            }),

            // Test 12: Memo field search (LIKE operator)
            this.builder.createCustomOperatorTest('transaction', 'memo', 'LIKE', '%test%', {
                type: 'SalesOrd'
            }, {
                fields: ['id', 'tranid', 'memo', 'type'],
                pageSize: 3,
                description: 'Transaction - Memo Search (LIKE)',
                expectedMinRecords: 0
            })
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
            description: 'Transaction-specific tests including field mapping, filtering, and business logic',
            testCount: this.tests.length,
            categories: [
                'Transaction Types',
                'Date Filtering', 
                'Amount Filtering',
                'Status Filtering',
                'Field Mapping',
                'Complex Queries'
            ]
        };
    }
}

module.exports = TransactionTestSuite; 