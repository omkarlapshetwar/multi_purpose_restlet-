const TestBuilder = require('../helpers/test-builder');

/**
 * Advanced Filter Test Suite
 * Tests all advanced filter patterns from the reference document
 * This suite tests complex business logic, date ranges, and combined filters
 */
class AdvancedFilterTestSuite {
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
            // ===============================================
            // 📅 DATE RANGE FILTERS (GENERIC)
            // ===============================================

            // 1. Transaction Date Range (Improved)
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
                fields: [],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Transaction Date Range (Generic)',
                    created: new Date().toISOString()
                }
            },

            // 2. Customer Creation Date Range (Same Pattern)
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'datecreated',
                        operator: 'date_range',
                        startdate: '01-01-2023',
                        enddate: '31-12-2023'
                    },
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'datecreated'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Customer Creation Date Range',
                    created: new Date().toISOString()
                }
            },

            // 3. Employee Hire Date Range (Same Pattern)
            {
                recordType: 'employee',
                filters: [
                    {
                        field_name: 'hiredate',
                        operator: 'date_range',
                        startdate: '01-01-2022',
                        enddate: '31-12-2024'
                    },
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    }
                ],
                fields: ['id', 'entityid', 'firstname', 'lastname', 'hiredate'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Employee Hire Date Range',
                    created: new Date().toISOString()
                }
            },

            // ===============================================
            // 🔍 GENERIC COMPARISON OPERATORS
            // ===============================================

            // 4. Numeric Range Filter (Generic)
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'id',
                        operator: 'greater_than',
                        value: '1000'
                    },
                    {
                        field_name: 'id',
                        operator: 'less_than',
                        value: '5000'
                    }
                ],
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Customer ID Range (Numeric)',
                    created: new Date().toISOString()
                }
            },

            // 5. String Pattern Matching (Generic)
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'entityid',
                        operator: 'contains',
                        value: 'ABC'
                    },
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    }
                ],
                fields: ['id', 'entityid', 'companyname'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Entity ID Pattern Matching',
                    created: new Date().toISOString()
                }
            },

            // ===============================================
            // 🔄 NULL/NOT NULL FILTERS (GENERIC)
            // ===============================================

            // 6. Generic NULL Check - Any Field
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'email',
                        operator: 'is_not_null'
                    },
                    {
                        field_name: 'phone',
                        operator: 'is_null'
                    },
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    }
                ],
                fields: ['id', 'entityid', 'email', 'phone'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Generic NULL Check (Email Not Null, Phone Null)',
                    created: new Date().toISOString()
                }
            },

            // ===============================================
            // 📋 ARRAY/IN FILTERS (GENERIC)
            // ===============================================

            // 7. Multiple Values Filter (Generic)
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'in',
                        values: ['SalesOrd', 'CustInvc', 'CustPymt']
                    },
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    }
                ],
                fields: ['id', 'tranid', 'type', 'trandate'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Transaction Type Multiple Values',
                    created: new Date().toISOString()
                }
            },

            // 8. Status Filter with Multiple Values
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
                        operator: 'in',
                        values: ['A', 'B', 'C']  // Pending Approval, etc.
                    }
                ],
                fields: ['id', 'tranid', 'status', 'trandate'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Transaction Status Multiple Values',
                    created: new Date().toISOString()
                }
            },

            // ===============================================
            // 🔧 COMPLEX COMBINED FILTERS
            // ===============================================

            // 9. Complex Business Logic (Multiple Conditions)
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
                        operator: 'equals',
                        value: 'F'  // Companies only
                    },
                    {
                        field_name: 'email',
                        operator: 'is_not_null'
                    },
                    {
                        field_name: 'datecreated',
                        operator: 'date_range',
                        startdate: '01-01-2020',
                        enddate: '31-12-2024'
                    },
                    {
                        field_name: 'companyname',
                        operator: 'contains',
                        value: 'Corp'
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'email', 'datecreated'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Complex Business Logic (Companies with Email)',
                    created: new Date().toISOString()
                }
            },

            // ===============================================
            // 🚀 QUICK EXAMPLES (NEW PATTERN)
            // ===============================================

            // Simple active customers
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
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Simple Active Customers (New Pattern)',
                    created: new Date().toISOString()
                }
            },

            // Sales orders from date range
            {
                recordType: 'transaction',
                filters: [
                    {
                        field_name: 'type',
                        operator: 'equals',
                        value: 'SalesOrd'
                    },
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    }
                ],
                fields: ['id', 'tranid', 'type', 'trandate'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Sales Orders from Date Range (New Pattern)',
                    created: new Date().toISOString()
                }
            },

            // Employees with contact info
            {
                recordType: 'employee',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'email',
                        operator: 'is_not_null'
                    }
                ],
                fields: ['id', 'entityid', 'firstname', 'lastname', 'email', 'title'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Employees with Contact Info (New Pattern)',
                    created: new Date().toISOString()
                }
            },

            // ===============================================
            // 🔄 ADDITIONAL ADVANCED PATTERNS
            // ===============================================

            // 10. Vendor with Multiple Contact Methods
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
                        operator: 'is_not_null'
                    },
                    {
                        field_name: 'phone',
                        operator: 'is_not_null'
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'email', 'phone'],
                pageSize: 5,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Vendors with Multiple Contact Methods',
                    created: new Date().toISOString()
                }
            },

            // 11. Transactions in Narrow Date Window (optimize for smaller dataset)
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
                        startdate: '01-06-2024',
                        enddate: '30-06-2024'
                    }
                ],
                fields: ['id', 'tranid', 'type', 'trandate'],
                pageSize: 1,
                pageIndex: 0,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Transactions (June 2024, limited)',
                    created: new Date().toISOString()
                }
            },

            // 12. Recent Customer Activity
            {
                recordType: 'customer',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'datecreated',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    },
                    {
                        field_name: 'companyname',
                        operator: 'starts_with',
                        value: 'A'
                    }
                ],
                fields: ['id', 'entityid', 'companyname', 'datecreated'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Recent Customer Activity (Companies Starting with A)',
                    created: new Date().toISOString()
                }
            },

            // 13. Employee Department Filter (optimized to avoid name-based IN and reduce dataset)
            {
                recordType: 'employee',
                filters: [
                    {
                        field_name: 'isinactive',
                        operator: 'equals',
                        value: 'F'
                    },
                    {
                        field_name: 'department',
                        operator: 'is_not_null'
                    }
                ],
                fields: ['id', 'entityid', 'firstname', 'lastname', 'department', 'title'],
                pageSize: 1,
                pageIndex: 0,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Employee Department Present',
                    created: new Date().toISOString()
                }
            },

            // 14. Transaction Status Exclusions
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
                        operator: 'not_in',
                        values: ['Cancelled', 'Void']
                    },
                    {
                        field_name: 'trandate',
                        operator: 'date_range',
                        startdate: '01-01-2024',
                        enddate: '31-12-2024'
                    }
                ],
                fields: ['id', 'tranid', 'type', 'status', 'trandate'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Transaction Status Exclusions (Not Cancelled/Void)',
                    created: new Date().toISOString()
                }
            },

            // 15. Complex Customer Segmentation
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
                        operator: 'equals',
                        value: 'T'
                    },
                    {
                        field_name: 'email',
                        operator: 'is_not_null'
                    },
                    {
                        field_name: 'phone',
                        operator: 'is_not_null'
                    },
                    {
                        field_name: 'datecreated',
                        operator: 'date_range',
                        startdate: '01-01-2023',
                        enddate: '31-12-2024'
                    }
                ],
                fields: ['id', 'entityid', 'firstname', 'lastname', 'email', 'phone', 'datecreated'],
                pageSize: 10,
                pageIndex: 0,
                usePagination: false,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'Advanced Filter - Complex Customer Segmentation (Individuals with Contact Info)',
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
            name: 'Advanced Filter Tests',
            description: 'Comprehensive tests for advanced filter patterns including date ranges, complex combinations, and business logic filters',
            testCount: this.tests.length,
            categories: [
                'Date Range Filters',
                'Generic Comparison Operators',
                'NULL/NOT NULL Filters',
                'Array/IN Filters',
                'Complex Combined Filters',
                'Business Logic Filters',
                'Customer Segmentation',
                'Transaction Analysis',
                'Employee Filtering',
                'Vendor Management'
            ]
        };
    }
}

module.exports = AdvancedFilterTestSuite; 