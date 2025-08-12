const TestBuilder = require('../helpers/test-builder');

/**
 * Basic Test Suite
 * Tests fundamental connectivity and basic functionality
 * Updated to use new filter structure: { field_name, operator, value }
 */
class BasicTestSuite {
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
            // Test 1: Basic connection with customer query
            this.builder.createCustomerTest({}, {
                description: 'Basic Connection Test (Customer Query)',
                expectedMinRecords: 0,
                pageSize: 1,
                usePagination: true
            }),

            // Test 2: Health check with minimal customer query
            this.builder.createCustomerTest({}, {
                pageSize: 1,
                usePagination: true,
                description: 'Health Check - Customer Query',
                expectedMinRecords: 0
            }),

            // Test 3: Simple account query (should exist in most NetSuite instances)
            this.builder.createTest('account', {
                isinactive: 'F'
            }, {
                fields: ['id', 'acctname', 'accttype'],
                pageSize: 1,
                usePagination: true,
                description: 'Basic Chart of Accounts Query',
                expectedMinRecords: 1
            }),

            // Test 4: Employee query (basic entity test)
            this.builder.createEmployeeTest({}, {
                pageSize: 1,
                usePagination: true,
                description: 'Basic Employee Query',
                expectedMinRecords: 0
            }),

            // Test 5: Pagination test with customers
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 2, 0),

            // Test 6: Field selection test
            this.builder.createCustomerTest({}, {
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 1,
                usePagination: true,
                description: 'Field Selection Test - Customer',
                expectedMinRecords: 0
            }),

            // Test 7: New filter structure test
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
                pageIndex: 0,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 15000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'New Filter Structure Test - Customer',
                    created: new Date().toISOString()
                }
            },

            // Test 8: Multiple filters test
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'isperson',
                        operator: 'is_false',
                        value: false
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'isperson'],
                pageSize: 1,
                pageIndex: 0,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 15000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Multiple Filters Test - Customer',
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
            name: 'Basic Tests',
            description: 'Fundamental connectivity and basic functionality tests with new filter structure',
            testCount: this.tests.length,
            categories: ['Connection', 'Health Check', 'Field Selection', 'Pagination', 'New Filter Structure']
        };
    }
}

module.exports = BasicTestSuite; 