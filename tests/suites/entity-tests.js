const TestBuilder = require('../helpers/test-builder');

/**
 * Entity Test Suite
 * Tests entity records (customers, employees, vendors, etc.)
 * Updated to use new filter structure: { field_name, operator, value }
 */
class EntityTestSuite {
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
            // Customer Tests
            this.builder.createCustomerTest({}, {
                pageSize: 1,
                usePagination: true,
                description: 'Entity - Active Customers',
                expectedMinRecords: 0
            }),

            // Customer with email filter using new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'email',
                        operator: 'not_equals',
                        value: ''
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'email'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Entity - Customers with Email Addresses (New Structure)',
                    created: new Date().toISOString()
                }
            },

            this.builder.createBooleanFilterTest('customer', {
                isinactive: false,
                isperson: true
            }, {}, {
                fields: ['id', 'entityid', 'firstname', 'lastname', 'isperson'],
                pageSize: 1,
                description: 'Entity - Individual Customers (Boolean)',
                expectedMinRecords: 0
            }),

            // Customer with LIKE operator using new structure
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'entityid',
                        operator: 'contains',
                        value: '1'
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
                    description: 'Entity - Customers with "1" in Entity ID (New Structure)',
                    created: new Date().toISOString()
                }
            },

            this.builder.createDateRangeTest('customer', 'datecreated', '01-06-2024', '30-06-2024', {
                isinactive: 'F'
            }),

            // Employee Tests
            this.builder.createEmployeeTest({}, {
                pageSize: 1,
                usePagination: true,
                description: 'Entity - Active Employees',
                expectedMinRecords: 0
            }),

            // Employee with phone filter using new structure
            {
                recordType: 'employee',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'phone',
                        operator: 'not_equals',
                        value: ''
                    }
                ],
                fields: ['id', 'entityid', 'firstname', 'lastname', 'phone', 'title'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Entity - Employees with Phone Numbers (New Structure)',
                    created: new Date().toISOString()
                }
            },

            this.builder.createBooleanFilterTest('employee', {
                isinactive: false,
                issalesrep: true
            }, {}, {
                fields: ['id', 'entityid', 'firstname', 'lastname', 'issalesrep'],
                pageSize: 1,
                description: 'Entity - Sales Rep Employees (Boolean)',
                expectedMinRecords: 0
            }),

            this.builder.createEmployeeTest({}, {
                fields: ['entityid', 'email', 'title'],
                pageSize: 1,
                description: 'Entity - Employee Specific Fields',
                expectedMinRecords: 0
            }),

            // Vendor Tests
            this.builder.createVendorTest({}, {
                pageSize: 1,
                usePagination: true,
                description: 'Entity - Active Vendors',
                expectedMinRecords: 0
            }),

            // Vendor with email filter using new structure
            {
                recordType: 'vendor',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'email',
                        operator: 'not_equals',
                        value: ''
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'email'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Entity - Vendors with Email (New Structure)',
                    created: new Date().toISOString()
                }
            },

            // Contact Tests
            this.builder.createTest('contact', {
                isinactive: 'F'
            }, {
                fields: ['id', 'entityid', 'firstname', 'lastname', 'email'],
                pageSize: 1,
                description: 'Entity - Active Contacts',
                expectedMinRecords: 0
            }),

            // Partner Tests (if applicable)
            this.builder.createTest('partner', {
                isinactive: 'F'
            }, {
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 1,
                description: 'Entity - Active Partners',
                expectedMinRecords: 0
            }),

            // Entity Group Test
            this.builder.createTest('entitygroup', {
                isinactive: 'F'
            }, {
                fields: ['id', 'groupname', 'grouptype'],
                pageSize: 1,
                description: 'Entity - Entity Groups',
                expectedMinRecords: 0
            }),

            // Mixed Entity Test - Pagination
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 2, 0),

            // Large page size test
            this.builder.createCustomerTest({
                isinactive: 'F'
            }, {
                pageSize: 10,
                usePagination: true,
                description: 'Entity - Large Page Size Test',
                expectedMinRecords: 0
            }),

            // New structure tests for different operators
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
                    description: 'Entity - Customers with Company Name Starting with "Test"',
                    created: new Date().toISOString()
                }
            },

            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'email',
                        operator: 'ends_with',
                        value: '.com'
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'email'],
                pageSize: 1,
                usePagination: true,
                pageIndex: 0,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Entity - Customers with Email Ending in ".com"',
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
            name: 'Entity Tests',
            description: 'Tests for entity records including customers, employees, vendors, contacts, and partners with new filter structure',
            testCount: this.tests.length,
            categories: [
                'Customer Records',
                'Employee Records',
                'Vendor Records',
                'Contact Records',
                'Partner Records',
                'Entity Groups',
                'Boolean Filters',
                'Email Filters',
                'Date Filters',
                'Pagination',
                'New Filter Structure',
                'String Operators'
            ]
        };
    }
}

module.exports = EntityTestSuite; 