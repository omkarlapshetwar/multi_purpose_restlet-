/**
 * 🧪 NetSuite RESTlet Filter Examples Reference
 * ==============================================
 * 
 * This file contains all the filter examples from our test suites.
 * Copy any JSON example and paste it into Postman or your API testing tool.
 * 
 * 📋 HOW TO USE:
 * 1. Copy the JSON from any example below
 * 2. Paste it as the request body in Postman
 * 3. Set method to POST
 * 4. Set URL to your RESTlet endpoint
 * 5. Add OAuth 1.0a authentication
 * 
 */

// ===============================================
// 🏥 BASIC CONNECTION TESTS
// ===============================================

/**
 * 1. Basic Connection Test (Minimal Customer Query)
 * Purpose: Test basic connectivity and authentication
 */
const basicConnection = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F"
  },
  "pageSize": 3
};

/**
 * 2. Health Check Query  
 * Purpose: Quick health check with minimal data
 */
const healthCheck = {
  "recordType": "customer",
  "filters": {},
  "pageSize": 1
};

/**
 * 3. Chart of Accounts Query
 * Purpose: Test account records (should exist in most NetSuite instances)
 */
const chartOfAccounts = {
  "recordType": "account",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["id", "acctname", "accttype"],
  "pageSize": 5
};

// ===============================================
// 👥 ENTITY TESTS (Customers, Employees, Vendors)
// ===============================================

/**
 * 4. Active Customers Only
 * Purpose: Get all active customer records
 */
const activeCustomers = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["id", "entityid", "companyname", "email", "isinactive"],
  "pageSize": 5
};

/**
 * 5. Customers with Email Addresses
 * Purpose: Find customers that have email addresses (not empty)
 */
const customersWithEmail = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F",
    "email": {
      "operator": "!=",
      "value": ""
    }
  },
  "fields": ["id", "entityid", "companyname", "email"],
  "pageSize": 3
};

/**
 * 6. Individual Customers (Boolean Filter)
 * Purpose: Find customers marked as individuals (not companies)
 */
const individualCustomers = {
  "recordType": "customer",
  "filters": {
    "isinactive": false,
    "isperson": true
  },
  "fields": ["id", "entityid", "firstname", "lastname", "isperson"],
  "pageSize": 3
};

/**
 * 7. Pattern Matching (LIKE operator)
 * Purpose: Find customers with "1" in their entity ID
 */
const patternMatching = {
  "recordType": "customer",
  "filters": {
    "entityid": {
      "operator": "LIKE",
      "value": "%1%"
    },
    "isinactive": "F"
  },
  "fields": ["id", "entityid", "companyname"],
  "pageSize": 3
};

/**
 * 8. Active Employees
 * Purpose: Get all active employee records
 */
const activeEmployees = {
  "recordType": "employee",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["id", "entityid", "firstname", "lastname", "email", "title"],
  "pageSize": 5
};

/**
 * 9. Employees with Phone Numbers
 * Purpose: Find employees that have phone numbers
 */
const employeesWithPhone = {
  "recordType": "employee",
  "filters": {
    "isinactive": "F",
    "phone": {
      "operator": "!=",
      "value": ""
    }
  },
  "fields": ["id", "entityid", "firstname", "lastname", "phone", "title"],
  "pageSize": 3
};

/**
 * 10. Active Vendors
 * Purpose: Get all active vendor records
 */
const activeVendors = {
  "recordType": "vendor",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["id", "entityid", "companyname", "email"],
  "pageSize": 3
};

/**
 * 11. Date Range Filter (Customer Creation Date)
 * Purpose: Find customers created between specific dates
 */
const customerDateRange = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F",
    "datecreated_startdate": "01-01-2020",
    "datecreated_enddate": "31-12-2024"
  },
  "fields": ["id", "entityid", "companyname", "datecreated"],
  "pageSize": 5
};

// ===============================================
// 💼 TRANSACTION TESTS
// ===============================================

/**
 * 12. All Transaction Fields (Wildcard)
 * Purpose: Get all fields for transactions in date range
 */
const allTransactionFields = {
  "recordType": "transaction",
  "filters": {
    "trandate_startdate": "01-01-2024",
    "trandate_enddate": "31-12-2024"
  },
  "fields": [],  // Empty array = all fields (tra.*)
  "pageSize": 2
};

/**
 * 13. Sales Orders Only
 * Purpose: Get only sales order transactions
 */
const salesOrdersOnly = {
  "recordType": "transaction",
  "filters": {
    "type": "SalesOrd"
  },
  "fields": ["id", "tranid", "type", "trandate", "status"],
  "pageSize": 3
};

/**
 * 14. Multiple Transaction Types (Array Filter)
 * Purpose: Get multiple transaction types in one query
 */
const multipleTransactionTypes = {
  "recordType": "transaction",
  "filters": {
    "type": ["SalesOrd", "CustInvc"]
  },
  "fields": ["id", "tranid", "type", "trandate"],
  "pageSize": 5
};

/**
 * 15. Customer Invoices
 * Purpose: Get only customer invoice transactions
 */
const customerInvoices = {
  "recordType": "transaction",
  "filters": {
    "type": "CustInvc"
  },
  "fields": ["id", "tranid", "type", "trandate", "status"],
  "pageSize": 3
};

/**
 * 16. Recent Transactions (Current Year)
 * Purpose: Get transactions from current year
 */
const recentTransactions = {
  "recordType": "transaction",
  "filters": {
    "trandate_startdate": "01-01-2025",
    "trandate_enddate": "31-12-2025"
  },
  "fields": ["id", "tranid", "trandate", "type"],
  "pageSize": 5
};

/**
 * 17. Transaction Status Filter
 * Purpose: Get transactions with specific status
 */
const transactionByStatus = {
  "recordType": "transaction",
  "filters": {
    "type": "SalesOrd",
    "status": "A"  // Pending Approval
  },
  "fields": ["id", "tranid", "type", "status", "trandate"],
  "pageSize": 3
};

// ===============================================
// 📦 ITEM TESTS
// ===============================================

/**
 * 18. Active Items
 * Purpose: Get all active item records
 */
const activeItems = {
  "recordType": "item",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["id", "itemid", "displayname", "itemtype"],
  "pageSize": 5
};

/**
 * 19. Inventory Items Only
 * Purpose: Get only inventory type items
 */
const inventoryItems = {
  "recordType": "item",
  "filters": {
    "isinactive": "F",
    "itemtype": "InvtPart"
  },
  "fields": ["id", "itemid", "displayname", "itemtype", "quantityavailable"],
  "pageSize": 3
};

// ===============================================
// 🔍 ADVANCED FILTERS & EDGE CASES
// ===============================================

/**
 * 20. Pagination Test
 * Purpose: Test pagination functionality
 */
const paginationTest = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["id", "entityid", "companyname"],
  "pageSize": 10,
  "usePagination": true
};

/**
 * 21. Empty Filters (No Filter)
 * Purpose: Get all records of a type (use with caution)
 */
const noFilters = {
  "recordType": "customer",
  "filters": {},
  "pageSize": 3
};

/**
 * 22. Complex Boolean Combinations
 * Purpose: Multiple boolean conditions
 */
const complexBoolean = {
  "recordType": "customer",
  "filters": {
    "isinactive": false,
    "isperson": false,  // Companies only
    "email": {
      "operator": "!=",
      "value": ""
    }
  },
  "fields": ["id", "entityid", "companyname", "email", "isperson"],
  "pageSize": 5
};

/**
 * 23. Numeric Range Filter
 * Purpose: Filter by numeric values
 */
const numericRange = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F",
    "id": {
      "operator": ">",
      "value": "1000"
    }
  },
  "fields": ["id", "entityid", "companyname"],
  "pageSize": 5
};

/**
 * 24. Large Page Size Test
 * Purpose: Test system limits
 */
const largePageSize = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F"
  },
  "pageSize": 100
};

/**
 * 25. Single Array Value
 * Purpose: Array filter with only one value
 */
const singleArrayValue = {
  "recordType": "transaction",
  "filters": {
    "type": ["SalesOrd"]  // Array with single value
  },
  "pageSize": 3
};

// ===============================================
// 🎯 SPECIFIC FIELD SELECTION EXAMPLES
// ===============================================

/**
 * 26. Minimal Fields (Performance)
 * Purpose: Get only specific fields for better performance
 */
const minimalFields = {
  "recordType": "employee",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["entityid", "email", "title"],  // Only these 3 fields
  "pageSize": 5
};

/**
 * 27. ID Only Query
 * Purpose: Get just IDs for bulk operations
 */
const idOnly = {
  "recordType": "customer",
  "filters": {
    "isinactive": "F"
  },
  "fields": ["id"],
  "pageSize": 10
};

// ===============================================
// 📝 OPERATOR EXAMPLES
// ===============================================

/**
 * Available Operators:
 * 
 * = (default)     - Equals
 * !=              - Not equals  
 * >               - Greater than
 * <               - Less than
 * >=              - Greater than or equal
 * <=              - Less than or equal
 * LIKE            - Pattern matching with %
 * NOT LIKE        - Negative pattern matching
 * IS NULL         - Field is null
 * IS NOT NULL     - Field is not null
 * 
 * Date Operators:
 * _startdate      - Date range start
 * _enddate        - Date range end
 * 
 * Array Values:
 * ["val1", "val2"] - IN operator (multiple values)
 */

/**
 * 28. All Operator Examples
 */
const operatorExamples = {
  "recordType": "customer",
  "filters": {
    // Basic operators
    "isinactive": "F",                    // Equals (default)
    "entityid": {
      "operator": "!=",                   // Not equals
      "value": "CUSTOMER1"
    },
    
    // Numeric operators  
    "id": {
      "operator": ">",                    // Greater than
      "value": "1000"
    },
    
    // Pattern matching
    "companyname": {
      "operator": "LIKE",                 // Pattern matching
      "value": "%Corp%"
    },
    
    // Date range
    "datecreated_startdate": "01-01-2023", // Date range start
    "datecreated_enddate": "31-12-2023",   // Date range end
    
    // Array (IN operator)
    "category": ["A", "B", "C"]           // Multiple values
  },
  "pageSize": 5
};

// ===============================================
// 🚀 QUICK COPY-PASTE EXAMPLES
// ===============================================

/**
 * QUICK EXAMPLES FOR POSTMAN:
 * Just copy one of these complete examples below
 */

// Example 1: Get 5 active customers
const quickExample1 = {
  "recordType": "customer",
  "filters": { "isinactive": "F" },
  "pageSize": 5
};

// Example 2: Get sales orders from 2024
const quickExample2 = {
  "recordType": "transaction",
  "filters": {
    "type": "SalesOrd",
    "trandate_startdate": "01-01-2024",
    "trandate_enddate": "31-12-2024"
  },
  "pageSize": 10
};

// Example 3: Get employees with email
const quickExample3 = {
  "recordType": "employee",
  "filters": {
    "isinactive": "F",
    "email": { "operator": "!=", "value": "" }
  },
  "fields": ["id", "entityid", "email", "title"],
  "pageSize": 5
};

/**
 * 🔧 POSTMAN SETUP INSTRUCTIONS:
 * 
 * 1. Method: POST
 * 2. URL: https://[account].restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=[script_id]&deploy=[deploy_id]
 * 3. Headers: Content-Type: application/json
 * 4. Auth: OAuth 1.0a with your NetSuite credentials
 * 5. Body: Copy any JSON example above
 * 
 * Replace placeholders:
 * [account] = Your NetSuite account ID
 * [script_id] = Your RESTlet script ID  
 * [deploy_id] = Your RESTlet deployment ID
 */

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        basicConnection,
        healthCheck,
        chartOfAccounts,
        activeCustomers,
        customersWithEmail,
        individualCustomers,
        patternMatching,
        activeEmployees,
        employeesWithPhone,
        activeVendors,
        customerDateRange,
        allTransactionFields,
        salesOrdersOnly,
        multipleTransactionTypes,
        customerInvoices,
        recentTransactions,
        transactionByStatus,
        activeItems,
        inventoryItems,
        paginationTest,
        noFilters,
        complexBoolean,
        numericRange,
        largePageSize,
        singleArrayValue,
        minimalFields,
        idOnly,
        operatorExamples,
        quickExample1,
        quickExample2,
        quickExample3
    };
} 