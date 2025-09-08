/**
 * Restlet 3rd Iteration Test Suite
 * Scenarios provided by user using uniform filter structure
 */

class RestletThirdIterationTestSuite {
    constructor() {
        this.tests = this.defineTests();
    }

    defineTests() {
        return [
            // 1) revenueplan: start date range, min amount, status != On Hold
            {
                recordType: 'revenueplan',
                fields: ['id','recordnumber','revrecstartdate','revrecenddate','amount','statusfordisplay','revenueplantype'],
                filters: [
                    { field_name: 'revrecstartdate', operator: 'greater_than_or_equal', value: '01-01-2025' },
                    { field_name: 'revrecstartdate', operator: 'less_than_or_equal', value: '31-05-2025' },
                    { field_name: 'amount',          operator: 'greater_than_or_equal', value: 500 },
                    { field_name: 'statusfordisplay',operator: 'not_equals', value: 'On Hold' }
                ],
                orderBy: 'revrecstartdate',
                pageSize: 10,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'R3 - Revenue Plan by start date range, min amount, not On Hold',
                    created: new Date().toISOString()
                }
            },

            // 2) revenueplan: end date before 01-01-2025 and remainingdeferredbalance > 0
            {
                recordType: 'revenueplan',
                fields: ['id','recordnumber','revrecenddate','remainingdeferredbalance','statusfordisplay'],
                filters: [
                    { field_name: 'revrecenddate',            operator: 'less_than', value: '01-01-2025' },
                    { field_name: 'remainingdeferredbalance', operator: 'greater_than', value: 0 }
                ],
                orderBy: 'revrecenddate',
                pageSize: 10,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'R3 - Revenue Plan by end date before 2025 and positive deferred balance',
                    created: new Date().toISOString()
                }
            },

            // 3) revenueplanplannedrevenue with header filters on revenueplan.revrecstartdate and isrecognized = F
            {
                recordType: 'revenueplanplannedrevenue',
                fields: ['id','revenueplan','plannedperiod','plannedrevenuetype','amount','isrecognized'],
                filters: [
                    // header filters
                    { field_name: 'revrecstartdate',  operator: 'greater_than_or_equal', value: '01-01-2024' },
                    { field_name: 'revrecstartdate',  operator: 'less_than_or_equal',    value: '31-12-2024' },
                    // line filter
                    { field_name: 'isrecognized',     operator: 'equals', value: 'F' }
                ],
                orderBy: 'revenueplan',
                pageSize: 10,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'R3 - Planned Revenue for plans starting in 2024 and not recognized',
                    created: new Date().toISOString()
                }
            },

            // 4) revenueelement: start date 2024 range, min allocationamount, status != Cancelled
            {
                recordType: 'revenueelement',
                fields: ['id','recordnumber','revrecstartdate','revrecenddate','allocationamount','salesamount','revenueplanstatus','entity','item'],
                filters: [
                    { field_name: 'revrecstartdate',   operator: 'greater_than_or_equal', value: '01-01-2024' },
                    { field_name: 'revrecstartdate',   operator: 'less_than_or_equal',    value: '31-12-2024' },
                    { field_name: 'allocationamount',  operator: 'greater_than_or_equal', value: 1000 },
                    { field_name: 'revenueplanstatus', operator: 'not_equals', value: 'Cancelled' }
                ],
                orderBy: 'revrecstartdate',
                pageSize: 10,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'R3 - Revenue Elements in 2024 with min allocation and active status',
                    created: new Date().toISOString()
                }
            },

            // 5) revenueelement: forecast window and delivered = F
            {
                recordType: 'revenueelement',
                fields: ['id','recordnumber','forecaststartdate','forecastenddate','delivered','revrecstartdate','revrecenddate'],
                filters: [
                    { field_name: 'forecaststartdate', operator: 'greater_than_or_equal', value: '01-08-2025' },
                    { field_name: 'forecastenddate',   operator: 'less_than_or_equal',    value: '30-09-2025' },
                    { field_name: 'delivered',         operator: 'equals',                value: 'F' }
                ],
                orderBy: 'forecaststartdate',
                pageSize: 10,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'R3 - Revenue Elements forecasted Aug–Sep 2025 and not delivered',
                    created: new Date().toISOString()
                }
            },

            // 6) transaction: invoices in Q1 2025, DESC
            {
                recordType: 'transaction',
                fields: ['id','tranid','trandate','entity','status','subsidiary','currency'],
                filters: [
                    { field_name: 'type',     operator: 'equals',                 value: 'CustInvc' },
                    { field_name: 'trandate', operator: 'greater_than_or_equal',  value: '01-01-2025' },
                    { field_name: 'trandate', operator: 'less_than_or_equal',     value: '31-03-2025' }
                ],
                orderBy: 'trandate',
                orderDir: 'DESC',
                pageSize: 50,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'R3 - Invoices in Q1 2025 ordered desc by date',
                    created: new Date().toISOString()
                }
            },

            // 7) transaction: types IN [SalesOrd, CustInvc] with date range
            {
                recordType: 'transaction',
                fields: ['id','type','tranid','trandate','entity','status'],
                filters: [
                    { field_name: 'type',     operator: 'in', values: ['SalesOrd','CustInvc'] },
                    { field_name: 'trandate', operator: 'greater_than_or_equal', value: '07-06-2025' },
                    { field_name: 'trandate', operator: 'less_than_or_equal',    value: '05-09-2025' }
                ],
                orderBy: 'trandate',
                orderDir: 'DESC',
                pageSize: 100,
                usePagination: true,
                debug: false,
                testMetadata: {
                    timeout: 30000,
                    expectedMinRecords: 0,
                    expectedMaxRecords: null,
                    shouldSucceed: true,
                    description: 'R3 - Sales Orders and Invoices between 07-06-2025 and 05-09-2025',
                    created: new Date().toISOString()
                }
            }
        ];
    }

    getTests() {
        return this.tests;
    }

    getSuiteInfo() {
        return {
            name: 'Restlet 3rd Iteration Tests',
            description: 'User-provided scenarios targeting multi-purpose-restlet3',
            testCount: this.tests.length
        };
    }
}

module.exports = RestletThirdIterationTestSuite;


