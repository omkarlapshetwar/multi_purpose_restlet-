const TestBuilder = require('../helpers/test-builder');

/**
 * Basic Test Suite
 * Tests fundamental connectivity and basic functionality
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
                pageSize: 3
            }),

            // Test 2: Health check with minimal customer query
            this.builder.createCustomerTest({}, {
                pageSize: 3,
                description: 'Health Check - Customer Query',
                expectedMinRecords: 0
            }),

            // Test 3: Simple account query (should exist in most NetSuite instances)
            this.builder.createTest('account', {
                isinactive: 'F'
            }, {
                fields: ['id', 'acctname', 'accttype'],
                pageSize: 5,
                description: 'Basic Chart of Accounts Query',
                expectedMinRecords: 1
            }),

            // Test 4: Employee query (basic entity test)
            this.builder.createEmployeeTest({}, {
                pageSize: 3,
                description: 'Basic Employee Query',
                expectedMinRecords: 0
            }),

            // Test 5: Pagination test with customers
            this.builder.createPaginationTest('customer', { isinactive: 'F' }, 5, 0),

            // Test 6: Field selection test
            this.builder.createCustomerTest({}, {
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 3,
                description: 'Field Selection Test - Customer',
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
            name: 'Basic Tests',
            description: 'Fundamental connectivity and basic functionality tests',
            testCount: this.tests.length,
            categories: ['Connection', 'Health Check', 'Field Selection', 'Pagination']
        };
    }
}

module.exports = BasicTestSuite; 