const TestBuilder = require('../helpers/test-builder');

/**
 * Edge Case Test Suite
 * Tests boundary conditions, error scenarios, and edge cases
 */
class EdgeCaseTestSuite {
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
            // Empty and null value tests
            this.builder.createEdgeCaseTest('customer', 'empty_filters'),
            this.builder.createEdgeCaseTest('employee', 'empty_filters'),
            this.builder.createEdgeCaseTest('transaction', 'empty_filters'),

            // Large page size test
            this.builder.createEdgeCaseTest('customer', 'large_page_size'),

            // Boolean edge cases
            this.builder.createBooleanFilterTest('customer', {
                isinactive: false
            }, {}, {
                pageSize: 5,
                description: 'Edge Case - Boolean False Filter',
                expectedMinRecords: 0
            }),

            this.builder.createBooleanFilterTest('employee', {
                isinactive: true
            }, {}, {
                pageSize: 3,
                description: 'Edge Case - Boolean True Filter (Inactive)',
                expectedMinRecords: 0
            }),

            // Array with single value
            this.builder.createArrayFilterTest('transaction', 'type', ['SalesOrd'], {}, {
                pageSize: 3,
                description: 'Edge Case - Array with Single Value',
                expectedMinRecords: 0
            }),

            // Empty array filter (should be ignored)
            this.builder.createTest('customer', {
                isinactive: 'F',
                subsidiary: []
            }, {
                pageSize: 3,
                description: 'Edge Case - Empty Array Filter',
                expectedMinRecords: 0
            }),

            // Very specific date range (single day)
            this.builder.createDateRangeTest('transaction', 'trandate', '01-01-2024', '01-01-2024'),

            // Future date range (should return no results)
            this.builder.createDateRangeTest('transaction', 'trandate', '01-01-2030', '31-12-2030'),

            // Multiple date ranges
            this.builder.createTest('transaction', {
                trandate_startdate: '01-01-2024',
                trandate_enddate: '31-12-2024',
                createddate_startdate: '01-06-2024',
                createddate_enddate: '30-06-2024'
            }, {
                pageSize: 5,
                description: 'Edge Case - Multiple Date Ranges',
                expectedMinRecords: 0
            }),

            // Special characters in LIKE search
            this.builder.createCustomOperatorTest('customer', 'companyname', 'LIKE', '%&%', {
                isinactive: 'F'
            }, {
                pageSize: 3,
                description: 'Edge Case - Special Characters in LIKE',
                expectedMinRecords: 0
            }),

            // NOT LIKE operator
            this.builder.createTest('customer', {
                companyname: {
                    operator: 'NOT LIKE',
                    value: '%test%'
                },
                isinactive: 'F'
            }, {
                pageSize: 5,
                description: 'Edge Case - NOT LIKE Operator',
                expectedMinRecords: 0
            }),

            // Zero values
            this.builder.createCustomOperatorTest('transaction', 'amount', '=', 0, {}, {
                pageSize: 3,
                description: 'Edge Case - Zero Amount Filter',
                expectedMinRecords: 0
            }),

            // Negative values
            this.builder.createCustomOperatorTest('transaction', 'amount', '<', 0, {}, {
                pageSize: 3,
                description: 'Edge Case - Negative Amount Filter',
                expectedMinRecords: 0
            }),

            // Very high ID values
            this.builder.createCustomOperatorTest('customer', 'id', '>', 999999, {}, {
                pageSize: 3,
                description: 'Edge Case - Very High ID Values',
                expectedMinRecords: 0
            }),

            // Invalid operator (should be handled gracefully)
            this.builder.createTest('customer', {
                isinactive: 'F',
                id: {
                    operator: 'INVALID_OP',
                    value: 1
                }
            }, {
                pageSize: 3,
                description: 'Edge Case - Invalid Operator',
                shouldSucceed: true, // Should ignore invalid operator
                expectedMinRecords: 0
            }),

            // Very long string values
            this.builder.createCustomOperatorTest('customer', 'companyname', 'LIKE', 
                '%' + 'a'.repeat(100) + '%', 
                { isinactive: 'F' }, {
                pageSize: 3,
                description: 'Edge Case - Very Long String in LIKE',
                expectedMinRecords: 0
            }),

            // Multiple complex conditions
            this.builder.createTest('transaction', {
                type: ['SalesOrd', 'CustInvc', 'CashSale'],
                trandate_startdate: '01-01-2024',
                trandate_enddate: '31-12-2024',
                amount: {
                    operator: '>=',
                    value: 0.01
                },
                status: {
                    operator: '!=',
                    value: 'Cancelled'
                },
                entity: {
                    operator: '>',
                    value: 0
                }
            }, {
                pageSize: 10,
                description: 'Edge Case - Multiple Complex Conditions',
                expectedMinRecords: 0
            }),

            // Revenue plan with no filters
            this.builder.createRevenuePlanTest({}, {
                pageSize: 5,
                description: 'Edge Case - Revenue Plan No Filters',
                expectedMinRecords: 0
            }),

            // Revenue plan with future dates
            this.builder.createRevenuePlanTest({
                startdate: '01-01-2030',
                enddate: '31-12-2030'
            }, {
                pageSize: 3,
                description: 'Edge Case - Revenue Plan Future Dates',
                expectedMinRecords: 0
            }),

            // Items with edge case filters
            this.builder.createItemTest({
                isinactive: 'F',
                quantityavailable: {
                    operator: '<',
                    value: 0
                }
            }, {
                pageSize: 3,
                description: 'Edge Case - Items with Negative Quantity',
                expectedMinRecords: 0
            }),

            // Pagination edge cases
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 1, 0), // Very small page
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 1000, 0), // Very large page

            // Custom record type (if exists)
            this.builder.createTest('customrecord_nonexistent', {}, {
                pageSize: 3,
                description: 'Edge Case - Non-existent Custom Record',
                shouldSucceed: false, // This should fail
                expectedMinRecords: 0
            }),

            // Field selection edge cases
            this.builder.createCustomerTest({}, {
                fields: ['nonexistent_field', 'id'],
                pageSize: 3,
                description: 'Edge Case - Non-existent Field Selection',
                shouldSucceed: true, // Should succeed but may not return the non-existent field
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
            name: 'Edge Case Tests',
            description: 'Boundary conditions, error scenarios, and edge case testing',
            testCount: this.tests.length,
            categories: [
                'Empty/Null Values',
                'Boolean Edge Cases',
                'Array Edge Cases',
                'Date Edge Cases',
                'String Edge Cases',
                'Numeric Edge Cases',
                'Invalid Operators',
                'Complex Conditions',
                'Pagination Edge Cases',
                'Field Selection Edge Cases',
                'Non-existent Records'
            ]
        };
    }
}

module.exports = EdgeCaseTestSuite; 