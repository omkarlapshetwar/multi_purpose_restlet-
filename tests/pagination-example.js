/**
 * Pagination Example - Demonstrates the difference between
 * usePagination: false (default) vs usePagination: true
 */

// Example 1: WITHOUT usePagination (returns ALL records)
const requestWithoutPagination = {
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "02-01-2024"
    }
  ],
  "fields": [],
  "pageSize": 10
  // usePagination defaults to false
  // Result: Returns ALL 238 records, ignores pageSize
};

// Example 2: WITH usePagination (returns only specified page)
const requestWithPagination = {
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "02-01-2024"
    }
  ],
  "fields": [],
  "pageSize": 10,
  "usePagination": true,  // ← This is the key!
  "pageIndex": 0          // ← First page (0-based)
  // Result: Returns only 10 records from page 0
};

// Example 3: Get second page
const requestSecondPage = {
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "02-01-2024"
    }
  ],
  "fields": [],
  "pageSize": 10,
  "usePagination": true,
  "pageIndex": 1          // ← Second page
  // Result: Returns records 11-20
};

// Example 4: Large page size
const requestLargePage = {
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "02-01-2024"
    }
  ],
  "fields": [],
  "pageSize": 50,
  "usePagination": true,
  "pageIndex": 0
  // Result: Returns first 50 records
};

console.log('Pagination Examples:');
console.log('1. Without usePagination:', requestWithoutPagination);
console.log('2. With usePagination (page 0):', requestWithPagination);
console.log('3. With usePagination (page 1):', requestSecondPage);
console.log('4. Large page size:', requestLargePage);

/**
 * Expected Response Format with usePagination: true
 */
const expectedResponse = {
  "success": true,
  "data": [], // Only 10 records
  "recordCount": 10,
  "recordType": "transaction",
  "pagination": {
    "pageSize": 10,
    "pageIndex": 0,
    "totalRecords": 238,    // Total records available
    "totalPages": 24,       // Math.ceil(238/10)
    "hasMore": true         // More pages available
  }
};

console.log('\nExpected Response Format:');
console.log(JSON.stringify(expectedResponse, null, 2)); 