const TestBuilder = require('../helpers/test-builder');

/**
 * Entity Test Suite
 * Tests entity records (customers, employees, vendors, etc.)
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
                pageSize: 5,
                description: 'Entity - Active Customers',
                expectedMinRecords: 0
            }),

            this.builder.createCustomerTest({
                email: {
                    operator: '!=',
                    value: ''
                }
            }, {
                fields: ['id', 'entityid', 'companyname', 'email'],
                pageSize: 3,
                description: 'Entity - Customers with Email Addresses',
                expectedMinRecords: 0
            }),

            this.builder.createBooleanFilterTest('customer', {
                isinactive: false,
                isperson: true
            }, {}, {
                fields: ['id', 'entityid', 'firstname', 'lastname', 'isperson'],
                pageSize: 3,
                description: 'Entity - Individual Customers (Boolean)',
                expectedMinRecords: 0
            }),

            this.builder.createCustomOperatorTest('customer', 'entityid', 'LIKE', '%1%', {
                isinactive: 'F'
            }, {
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 3,
                description: 'Entity - Customers with "1" in Entity ID',
                expectedMinRecords: 0
            }),

            this.builder.createDateRangeTest('customer', 'datecreated', '01-01-2020', '31-12-2024', {
                isinactive: 'F'
            }),

            // Employee Tests
            this.builder.createEmployeeTest({}, {
                pageSize: 5,
                description: 'Entity - Active Employees',
                expectedMinRecords: 0
            }),

            this.builder.createEmployeeTest({
                phone: {
                    operator: '!=',
                    value: ''
                }
            }, {
                fields: ['id', 'entityid', 'firstname', 'lastname', 'phone', 'title'],
                pageSize: 3,
                description: 'Entity - Employees with Phone Numbers',
                expectedMinRecords: 0
            }),

            this.builder.createBooleanFilterTest('employee', {
                isinactive: false,
                issalesrep: true
            }, {}, {
                fields: ['id', 'entityid', 'firstname', 'lastname', 'issalesrep'],
                pageSize: 3,
                description: 'Entity - Sales Rep Employees (Boolean)',
                expectedMinRecords: 0
            }),

            this.builder.createEmployeeTest({}, {
                fields: ['entityid', 'email', 'title'],
                pageSize: 5,
                description: 'Entity - Employee Specific Fields',
                expectedMinRecords: 0
            }),

            // Vendor Tests
            this.builder.createVendorTest({}, {
                pageSize: 3,
                description: 'Entity - Active Vendors',
                expectedMinRecords: 0
            }),

            this.builder.createVendorTest({
                email: {
                    operator: '!=',
                    value: ''
                }
            }, {
                fields: ['id', 'entityid', 'companyname', 'email'],
                pageSize: 3,
                description: 'Entity - Vendors with Email',
                expectedMinRecords: 0
            }),

            // Contact Tests
            this.builder.createTest('contact', {
                isinactive: 'F'
            }, {
                fields: ['id', 'entityid', 'firstname', 'lastname', 'email'],
                pageSize: 3,
                description: 'Entity - Active Contacts',
                expectedMinRecords: 0
            }),

            // Partner Tests (if applicable)
            this.builder.createTest('partner', {
                isinactive: 'F'
            }, {
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 3,
                description: 'Entity - Active Partners',
                expectedMinRecords: 0
            }),

            // Entity Group Test
            this.builder.createTest('entitygroup', {
                isinactive: 'F'
            }, {
                fields: ['id', 'groupname', 'grouptype'],
                pageSize: 3,
                description: 'Entity - Entity Groups',
                expectedMinRecords: 0
            }),

            // Mixed Entity Test - Pagination
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 10, 0),

            // Large page size test
            this.builder.createCustomerTest({
                isinactive: 'F'
            }, {
                pageSize: 100,
                usePagination: true,
                description: 'Entity - Large Page Size Test',
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
            name: 'Entity Tests',
            description: 'Tests for entity records including customers, employees, vendors, contacts, and partners',
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
                'Pagination'
            ]
        };
    }
}

module.exports = EntityTestSuite; 