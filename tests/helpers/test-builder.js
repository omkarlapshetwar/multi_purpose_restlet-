const colors = require('colors');
const config = require('../../src/config/netsuite-config');

/**
 * Test Builder Helper
 * Creates standardized test cases for NetSuite RESTlet testing
 */
class TestBuilder {
    constructor() {
        this.testConfig = config.getTestConfig();
    }

    /**
     * Create a standardized test case
     * @param {string} recordType - NetSuite record type
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Test options
     * @returns {Object} Test case object
     */
    createTest(recordType, filters = {}, options = {}) {
        const {
            fields = null,
            pageSize = this.testConfig.defaultPageSize,
            pageIndex = 0,
            usePagination = false,
            debug = this.testConfig.enableDebugLogs,
            timeout = this.testConfig.timeout,
            expectedMinRecords = 0,
            expectedMaxRecords = null,
            shouldSucceed = true,
            description = null
        } = options;

        return {
            recordType: recordType,
            filters: filters,
            fields: fields,
            pageSize: pageSize,
            pageIndex: pageIndex,
            usePagination: usePagination,
            debug: debug,
            // Test metadata
            testMetadata: {
                timeout: timeout,
                expectedMinRecords: expectedMinRecords,
                expectedMaxRecords: expectedMaxRecords,
                shouldSucceed: shouldSucceed,
                description: description || `${recordType} test with ${Object.keys(filters).length} filters`,
                created: new Date().toISOString()
            }
        };
    }

    /**
     * Create a customer test case
     * @param {Object} filters - Customer filters
     * @param {Object} options - Test options
     * @returns {Object} Customer test case
     */
    createCustomerTest(filters = {}, options = {}) {
        const defaultFilters = {
            isinactive: 'F',
            ...filters
        };

        const defaultOptions = {
            fields: ['id', 'entityid', 'companyname', 'email', 'isinactive'],
            expectedMinRecords: 1,
            description: 'Customer records test',
            ...options
        };

        return this.createTest('customer', defaultFilters, defaultOptions);
    }

    /**
     * Create an employee test case
     * @param {Object} filters - Employee filters
     * @param {Object} options - Test options
     * @returns {Object} Employee test case
     */
    createEmployeeTest(filters = {}, options = {}) {
        const defaultFilters = {
            isinactive: 'F',
            ...filters
        };

        const defaultOptions = {
            fields: ['id', 'entityid', 'firstname', 'lastname', 'email', 'title'],
            expectedMinRecords: 1,
            description: 'Employee records test',
            ...options
        };

        return this.createTest('employee', defaultFilters, defaultOptions);
    }

    /**
     * Create a vendor test case
     * @param {Object} filters - Vendor filters
     * @param {Object} options - Test options
     * @returns {Object} Vendor test case
     */
    createVendorTest(filters = {}, options = {}) {
        const defaultFilters = {
            isinactive: 'F',
            ...filters
        };

        const defaultOptions = {
            fields: ['id', 'entityid', 'companyname', 'email'],
            expectedMinRecords: 0,
            description: 'Vendor records test',
            ...options
        };

        return this.createTest('vendor', defaultFilters, defaultOptions);
    }

    /**
     * Create a transaction test case
     * @param {Object} filters - Transaction filters
     * @param {Object} options - Test options
     * @returns {Object} Transaction test case
     */
    createTransactionTest(filters = {}, options = {}) {
        const defaultOptions = {
            fields: ['id', 'tranid', 'trandate', 'type', 'status'],
            expectedMinRecords: 0,
            description: 'Transaction records test',
            ...options
        };

        return this.createTest('transaction', filters, defaultOptions);
    }

    /**
     * Create an item test case
     * @param {Object} filters - Item filters
     * @param {Object} options - Test options
     * @returns {Object} Item test case
     */
    createItemTest(filters = {}, options = {}) {
        const defaultFilters = {
            isinactive: 'F',
            ...filters
        };

        const defaultOptions = {
            fields: ['id', 'itemid', 'displayname', 'itemtype'],
            expectedMinRecords: 0,
            description: 'Item records test',
            ...options
        };

        return this.createTest('item', defaultFilters, defaultOptions);
    }

    /**
     * Create a revenue plan test case
     * @param {Object} filters - Revenue plan filters
     * @param {Object} options - Test options
     * @returns {Object} Revenue plan test case
     */
    createRevenuePlanTest(filters = {}, options = {}) {
        const defaultOptions = {
            fields: null, // Use default revenue plan fields
            expectedMinRecords: 0,
            description: 'Revenue plan test with statistics',
            ...options
        };

        return this.createTest('revenueplan', filters, defaultOptions);
    }

    /**
     * Create a pagination test case
     * @param {string} recordType - Record type
     * @param {Object} filters - Filters
     * @param {number} pageSize - Page size
     * @param {number} pageIndex - Page index
     * @returns {Object} Pagination test case
     */
    createPaginationTest(recordType, filters = {}, pageSize = 10, pageIndex = 0) {
        return this.createTest(recordType, filters, {
            usePagination: true,
            pageSize: pageSize,
            pageIndex: pageIndex,
            description: `Pagination test for ${recordType} (page ${pageIndex + 1}, size ${pageSize})`
        });
    }

    /**
     * Create a date range test case
     * @param {string} recordType - Record type
     * @param {string} dateField - Date field name
     * @param {string} startDate - Start date (DD-MM-YYYY)
     * @param {string} endDate - End date (DD-MM-YYYY)
     * @param {Object} additionalFilters - Additional filters
     * @returns {Object} Date range test case
     */
    createDateRangeTest(recordType, dateField, startDate, endDate, additionalFilters = {}) {
        const filters = {
            [`${dateField}_startdate`]: startDate,
            [`${dateField}_enddate`]: endDate,
            ...additionalFilters
        };

        return this.createTest(recordType, filters, {
            description: `Date range test for ${recordType} (${dateField}: ${startDate} to ${endDate})`
        });
    }

    /**
     * Create an array filter test case
     * @param {string} recordType - Record type
     * @param {string} fieldName - Field to filter on
     * @param {Array} values - Array of values
     * @param {Object} additionalFilters - Additional filters
     * @returns {Object} Array filter test case
     */
    createArrayFilterTest(recordType, fieldName, values, additionalFilters = {}) {
        const filters = {
            [fieldName]: values,
            ...additionalFilters
        };

        return this.createTest(recordType, filters, {
            description: `Array filter test for ${recordType} (${fieldName} IN [${values.join(', ')}])`
        });
    }

    /**
     * Create a custom operator test case
     * @param {string} recordType - Record type
     * @param {string} fieldName - Field name
     * @param {string} operator - Operator (>=, <=, LIKE, etc.)
     * @param {*} value - Value to compare
     * @param {Object} additionalFilters - Additional filters
     * @returns {Object} Custom operator test case
     */
    createCustomOperatorTest(recordType, fieldName, operator, value, additionalFilters = {}) {
        const filters = {
            [fieldName]: {
                operator: operator,
                value: value
            },
            ...additionalFilters
        };

        return this.createTest(recordType, filters, {
            description: `Custom operator test for ${recordType} (${fieldName} ${operator} ${value})`
        });
    }

    /**
     * Create a boolean filter test case
     * @param {string} recordType - Record type
     * @param {Object} booleanFilters - Boolean filters (field: true/false)
     * @param {Object} additionalFilters - Additional filters
     * @returns {Object} Boolean filter test case
     */
    createBooleanFilterTest(recordType, booleanFilters, additionalFilters = {}) {
        const filters = {
            ...booleanFilters,
            ...additionalFilters
        };

        const booleanFields = Object.keys(booleanFilters).join(', ');
        return this.createTest(recordType, filters, {
            description: `Boolean filter test for ${recordType} (${booleanFields})`
        });
    }

    /**
     * Create an edge case test (empty filters, null values, etc.)
     * @param {string} recordType - Record type
     * @param {string} edgeCaseType - Type of edge case
     * @returns {Object} Edge case test
     */
    createEdgeCaseTest(recordType, edgeCaseType) {
        let filters = {};
        let options = {
            shouldSucceed: true,
            description: `Edge case test: ${edgeCaseType} for ${recordType}`
        };

        switch (edgeCaseType) {
            case 'empty_filters':
                filters = {};
                break;
            case 'null_values':
                filters = { id: null, entityid: null };
                options.shouldSucceed = true; // Should filter out nulls
                break;
            case 'empty_strings':
                filters = { entityid: '', companyname: '' };
                options.shouldSucceed = true; // Should filter out empty strings
                break;
            case 'large_page_size':
                filters = { isinactive: 'F' };
                options.pageSize = 1000;
                break;
            default:
                throw new Error(`Unknown edge case type: ${edgeCaseType}`);
        }

        return this.createTest(recordType, filters, options);
    }

    /**
     * Validate test result against expectations
     * @param {Object} testCase - Test case with metadata
     * @param {Object} result - API response
     * @returns {Object} Validation result
     */
    validateTestResult(testCase, result) {
        const metadata = testCase.testMetadata;
        const validation = {
            passed: true,
            errors: [],
            warnings: [],
            summary: {}
        };

        // Check if test should have succeeded
        if (metadata.shouldSucceed && !result.success) {
            validation.passed = false;
            validation.errors.push(`Test should have succeeded but failed: ${result.error}`);
        } else if (!metadata.shouldSucceed && result.success) {
            validation.passed = false;
            validation.errors.push('Test should have failed but succeeded');
        }

        // Check record count expectations
        if (result.success && result.recordCount !== undefined) {
            if (metadata.expectedMinRecords !== null && result.recordCount < metadata.expectedMinRecords) {
                validation.warnings.push(`Expected at least ${metadata.expectedMinRecords} records, got ${result.recordCount}`);
            }
            
            if (metadata.expectedMaxRecords !== null && result.recordCount > metadata.expectedMaxRecords) {
                validation.warnings.push(`Expected at most ${metadata.expectedMaxRecords} records, got ${result.recordCount}`);
            }
        }

        // Check pagination if used
        if (testCase.usePagination && result.success && result.pagination) {
            if (result.pagination.pageSize !== testCase.pageSize) {
                validation.warnings.push(`Page size mismatch: expected ${testCase.pageSize}, got ${result.pagination.pageSize}`);
            }
            
            if (result.pagination.pageIndex !== testCase.pageIndex) {
                validation.warnings.push(`Page index mismatch: expected ${testCase.pageIndex}, got ${result.pagination.pageIndex}`);
            }
        }

        validation.summary = {
            testName: metadata.description,
            recordType: testCase.recordType,
            recordCount: result.recordCount || 0,
            success: result.success,
            hasWarnings: validation.warnings.length > 0,
            hasErrors: validation.errors.length > 0
        };

        return validation;
    }

    /**
     * Print test result summary
     * @param {Object} testCase - Test case
     * @param {Object} result - API response
     * @param {Object} validation - Validation result
     */
    printTestSummary(testCase, result, validation) {
        const metadata = testCase.testMetadata;
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📊 ${colors.bold('TEST SUMMARY')}: ${colors.cyan(metadata.description)}`);
        console.log(`${'='.repeat(60)}`);
        
        // Test status
        if (validation.passed && validation.errors.length === 0) {
            console.log(`✅ ${colors.green('PASSED')} ${validation.warnings.length > 0 ? colors.yellow('(with warnings)') : ''}`);
        } else {
            console.log(`❌ ${colors.red('FAILED')}`);
        }
        
        // Basic info
        console.log(`📋 Record Type: ${colors.cyan(testCase.recordType)}`);
        console.log(`🔢 Records Returned: ${colors.yellow(result.recordCount || 0)}`);
        console.log(`⚡ Success: ${result.success ? colors.green('Yes') : colors.red('No')}`);
        
        // Pagination info
        if (testCase.usePagination && result.pagination) {
            console.log(`📄 Pagination: Page ${result.pagination.pageIndex + 1}/${result.pagination.totalPages} (${result.pagination.totalRecords} total)`);
        }
        
        // Errors
        if (validation.errors.length > 0) {
            console.log(`\n❌ ${colors.red('ERRORS')}:`);
            validation.errors.forEach(error => {
                console.log(`   • ${colors.red(error)}`);
            });
        }
        
        // Warnings
        if (validation.warnings.length > 0) {
            console.log(`\n⚠️  ${colors.yellow('WARNINGS')}:`);
            validation.warnings.forEach(warning => {
                console.log(`   • ${colors.yellow(warning)}`);
            });
        }
        
        // Error details if failed
        if (!result.success && result.error) {
            console.log(`\n💥 ${colors.red('ERROR DETAILS')}:`);
            console.log(`   ${colors.red(result.error)}`);
        }
        
        console.log(`${'='.repeat(60)}\n`);
    }
}

module.exports = TestBuilder; 