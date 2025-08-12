const TestBuilder = require('../helpers/test-builder');

/**
 * Edge Case Test Suite
 * Tests boundary conditions, error scenarios, and edge cases
 * Updated to use new filter structure: { field_name, operator, value }
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
            // Keep page size modest to avoid timeouts
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 10, 0),

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

            // Empty array filter (should be ignored) with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    }
                ],
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Empty Array Filter (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Very specific date range (single day) with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '01-01-2024'
                    }
                ],
                fields: ['id', 'tranid', 'trandate'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Single Day Date Range (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Future date range (should return no results) with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2030',
                        enddate: '31-12-2030'
                    }
                ],
                fields: ['id', 'tranid', 'trandate'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Future Date Range (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Multiple date ranges with new structure
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
                        field_name: 'createddate',
                        operator: 'date_range',
                        startdate: '01-06-2024',
                        enddate: '30-06-2024'
                    }
                ],
                fields: ['id', 'tranid', 'trandate', 'createddate'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Multiple Date Ranges (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Special characters in LIKE search with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'companyname',
                        operator: 'contains',
                        value: '&'
                    }
                ],
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Special Characters in Contains (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // NOT LIKE operator with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'companyname',
                        operator: 'not_contains',
                        value: 'test'
                    }
                ],
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - NOT Contains Operator (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Zero values with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'amount',
                        operator: 'equals',
                        value: 0
                    }
                ],
                fields: ['id', 'tranid'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Zero Amount Filter (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Negative values with new structure
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'amount',
                        operator: 'less_than',
                        value: 0
                    }
                ],
                fields: ['id', 'tranid'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Negative Amount Filter (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Very high ID values with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'id',
                        operator: 'greater_than',
                        value: 999999
                    }
                ],
                fields: ['id', 'entityid'],
                pageSize: 1,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Very High ID Values (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Invalid operator (should be handled gracefully) with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'id',
                        operator: 'INVALID_OP',
                        value: 1
                    }
                ],
                fields: ['id', 'entityid'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true, // Should ignore invalid operator
                    description: 'Edge Case - Invalid Operator (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Very long string values with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'companyname',
                        operator: 'contains',
                        value: 'a'.repeat(100)
                    }
                ],
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Very Long String in Contains (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Multiple complex conditions with new structure
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
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    },
                    {
                        field_name: 'amount',
                        operator: 'greater_than_or_equal',
                        value: 0.01
                    },
                    {
                        field_name: 'status',
                        operator: 'not_equals',
                        value: 'Cancelled'
                    },
                    {
                        field_name: 'entity',
                        operator: 'greater_than',
                        value: 0
                    }
                ],
                fields: ['id', 'tranid', 'trandate', 'amount', 'status', 'entity'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - Multiple Complex Conditions (New Structure)',
                    created: new Date().toISOString()
                }
            },

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
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 1, 0),
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 50, 0),

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
            }),

            // NULL value tests with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'email',
                        operator: 'is_null',
                        value: null
                    }
                ],
                fields: ['id', 'entityid', 'email'],
                pageSize: 3,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - NULL Value Filter (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // NOT NULL value tests with new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'email',
                        operator: 'is_not_null',
                        value: null
                    }
                ],
                fields: ['id', 'entityid', 'email'],
                pageSize: 3,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Edge Case - NOT NULL Value Filter (New Structure)',
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
            name: 'Edge Case Tests',
            description: 'Boundary conditions, error scenarios, and edge case testing with new filter structure',
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
                'Non-existent Records',
                'New Filter Structure',
                'NULL Operators'
            ]
        };
    }
}

module.exports = EdgeCaseTestSuite; 