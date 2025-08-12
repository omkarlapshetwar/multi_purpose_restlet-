const TestBuilder = require('../helpers/test-builder');

/**
 * New Filter Test Suite
 * Tests all the new filter operators supported by the multi-purpose restlet
 * This suite specifically tests the new filter structure: { field_name, operator, value }
 */
class NewFilterTestSuite {
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
            // Comparison Operators Tests
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
                    description: 'New Filter - Equals Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'not_equals',
                        value: 'T'
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
                    description: 'New Filter - Not Equals Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'id',
                        operator: 'greater_than',
                        value: 0
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
                    shouldSucceed: true,
                    description: 'New Filter - Greater Than Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'id',
                        operator: 'less_than',
                        value: 999999
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
                    shouldSucceed: true,
                    description: 'New Filter - Less Than Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'id',
                        operator: 'greater_than_or_equal',
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
                    shouldSucceed: true,
                    description: 'New Filter - Greater Than or Equal Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'id',
                        operator: 'less_than_or_equal',
                        value: 999999
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
                    shouldSucceed: true,
                    description: 'New Filter - Less Than or Equal Operator',
                    created: new Date().toISOString()
                }
            },

            // String Operators Tests
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'companyname',
                        operator: 'contains',
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
                    description: 'New Filter - Contains Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'companyname',
                        operator: 'starts_with',
                        value: 'Test'
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
                    description: 'New Filter - Starts With Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'email',
                        operator: 'ends_with',
                        value: '.com'
                    }
                ],
                fields: ['id', 'entityid', 'email'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Ends With Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'companyname',
                        operator: 'not_contains',
                        value: 'invalid'
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
                    description: 'New Filter - Not Contains Operator',
                    created: new Date().toISOString()
                }
            },

            // Array Operators Tests
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc', 'CashSale']
                    }
                ],
                fields: ['id', 'tranid', 'type'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - In Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'not_in',
                        values: ['VendBill', 'VendCred']
                    }
                ],
                fields: ['id', 'tranid', 'type'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Not In Operator',
                    created: new Date().toISOString()
                }
            },

            // NULL Operators Tests
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
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Is Null Operator',
                    created: new Date().toISOString()
                }
            },

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
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Is Not Null Operator',
                    created: new Date().toISOString()
                }
            },

            // Date Operators Tests
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    }
                ],
                fields: ['id', 'tranid', 'trandate'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Date Range Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_equals',
                        value: '01-01-2024'
                    }
                ],
                fields: ['id', 'tranid', 'trandate'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Date Equals Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_before',
                        value: '31-12-2024'
                    }
                ],
                fields: ['id', 'tranid', 'trandate'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Date Before Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'trandate',
                        operator: 'date_after',
                        value: '01-01-2020'
                    }
                ],
                fields: ['id', 'tranid', 'trandate'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Date After Operator',
                    created: new Date().toISOString()
                }
            },

            // Boolean Operators Tests
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'is_true',
                        value: true
                    }
                ],
                fields: ['id', 'entityid', 'isinactive'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Is True Operator',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'is_false',
                        value: false
                    }
                ],
                fields: ['id', 'entityid', 'isinactive'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Is False Operator',
                    created: new Date().toISOString()
                }
            },

            // Complex Multi-Filter Tests
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc']
                    },
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    },
                    {
                        field_name: 'amount',
                        operator: 'greater_than',
                        value: 0
                    },
                    {
                        field_name: 'status',
                        operator: 'not_equals',
                        value: 'Cancelled'
                    }
                ],
                fields: ['id', 'tranid', 'type', 'trandate', 'amount', 'status'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Complex Multi-Filter Test',
                    created: new Date().toISOString()
                }
            },

            // Mixed Data Type Tests
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
                        value: 'test'
                    },
                    {
                        field_name: 'id',
                        operator: 'greater_than',
                        value: 0
                    },
                    {
                        field_name: 'email',
                        operator: 'is_not_null',
                        value: null
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'email', 'isinactive'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter - Mixed Data Type Test',
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
            name: 'New Filter Tests',
            description: 'Comprehensive tests for all new filter operators supported by the multi-purpose restlet',
            testCount: this.tests.length,
            categories: [
                'Comparison Operators',
                'String Operators',
                'Array Operators',
                'NULL Operators',
                'Date Operators',
                'Boolean Operators',
                'Complex Filters',
                'Mixed Data Types'
            ]
        };
    }
}

module.exports = NewFilterTestSuite; 