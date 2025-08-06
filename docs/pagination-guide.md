# Pagination Guide

## Overview

Our multi-purpose restlet supports comprehensive pagination to handle large datasets efficiently. This guide explains how pagination works and how to use it correctly.

## ⚠️ Important: The `usePagination` Flag

**The most common issue with pagination is forgetting to set `usePagination: true`.**

### Without `usePagination: true`
```javascript
{
  "recordType": "transaction",
  "filters": [...],
  "pageSize": 10
  // Result: Returns ALL records (e.g., 238 records), ignores pageSize
}
```

### With `usePagination: true`
```javascript
{
  "recordType": "transaction",
  "filters": [...],
  "pageSize": 10,
  "usePagination": true  // ← This is required!
  // Result: Returns only 10 records from the first page
}
```

## 📊 Pagination Parameters

### Required Parameters
- `usePagination: true` - **Must be set to enable pagination**

### Optional Parameters
- `pageSize` - Number of records per page (default: 5000, max: 5000)
- `pageIndex` - Which page to return (0-based, default: 0)

## 🔍 How Pagination Works

### Internal Logic
```javascript
if (usePagination) {
    // Return only the specified page
    const targetPage = pagedData.fetch({ index: pageIndex });
    results = targetPage.data.asMappedResults();
} else {
    // Return ALL pages concatenated
    pagedData.pageRanges.forEach(pageRange => {
        const onePage = pagedData.fetch({ index: pageRange.index });
        results = results.concat(onePage.data.asMappedResults());
    });
}
```

## 📋 Response Format

### Without Pagination (usePagination: false)
```javascript
{
  "success": true,
  "data": [...], // ALL records
  "recordCount": 238,
  "recordType": "transaction"
}
```

### With Pagination (usePagination: true)
```javascript
{
  "success": true,
  "data": [...], // Only pageSize records
  "recordCount": 10,
  "recordType": "transaction",
  "pagination": {
    "pageSize": 10,
    "pageIndex": 0,
    "totalRecords": 238,
    "totalPages": 24,
    "hasMore": true
  }
}
```

## 🧪 Examples

### Example 1: First Page (10 records)
```javascript
{
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
  "pageIndex": 0
}
```

### Example 2: Second Page (10 records)
```javascript
{
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
  "pageIndex": 1  // ← Second page
}
```

### Example 3: Large Page Size
```javascript
{
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
}
```

### Example 4: Customer Pagination
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    }
  ],
  "fields": ["id", "entityid", "companyname"],
  "pageSize": 25,
  "usePagination": true,
  "pageIndex": 2  // ← Third page
}
```

## 🔄 Pagination Metadata

When `usePagination: true`, the response includes pagination metadata:

### `pagination` Object
- `pageSize` - Number of records per page
- `pageIndex` - Current page (0-based)
- `totalRecords` - Total number of records available
- `totalPages` - Total number of pages
- `hasMore` - Whether there are more pages available

### Example Response
```javascript
{
  "success": true,
  "data": [...], // 10 records
  "recordCount": 10,
  "recordType": "transaction",
  "pagination": {
    "pageSize": 10,
    "pageIndex": 0,
    "totalRecords": 238,
    "totalPages": 24,        // Math.ceil(238/10)
    "hasMore": true          // More pages available
  }
}
```

## 🚀 Best Practices

### 1. Always Set `usePagination: true`
```javascript
// ✅ Correct
{
  "pageSize": 10,
  "usePagination": true
}

// ❌ Incorrect - will return ALL records
{
  "pageSize": 10
}
```

### 2. Choose Appropriate Page Sizes
```javascript
// ✅ Good for small datasets
"pageSize": 10

// ✅ Good for medium datasets
"pageSize": 50

// ✅ Good for large datasets
"pageSize": 100

// ⚠️ Be careful with very large page sizes
"pageSize": 1000  // May cause timeouts
```

### 3. Handle Pagination in Your Application
```javascript
// Example: Fetch all pages
async function fetchAllPages() {
  let allRecords = [];
  let pageIndex = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch('/restlet', {
      method: 'POST',
      body: JSON.stringify({
        recordType: 'transaction',
        filters: [...],
        pageSize: 50,
        usePagination: true,
        pageIndex: pageIndex
      })
    });

    const data = await response.json();
    allRecords = allRecords.concat(data.data);
    hasMore = data.pagination.hasMore;
    pageIndex++;
  }

  return allRecords;
}
```

### 4. Use Debug Mode for Troubleshooting
```javascript
{
  "recordType": "transaction",
  "filters": [...],
  "pageSize": 10,
  "usePagination": true,
  "pageIndex": 0,
  "debug": true  // ← Add this for troubleshooting
}
```

## 🔧 Troubleshooting

### Problem: Getting all records instead of paginated results
**Solution**: Add `usePagination: true` to your request

### Problem: Page size not respected
**Solution**: Ensure `usePagination: true` is set

### Problem: Getting wrong page
**Solution**: Check that `pageIndex` is 0-based (first page = 0)

### Problem: Timeout with large datasets
**Solution**: Reduce `pageSize` or use more specific filters

## 📈 Performance Considerations

### 1. Page Size Limits
- **Maximum**: 5000 records per page
- **Recommended**: 50-100 records per page
- **Small datasets**: 10-25 records per page

### 2. Memory Usage
- Larger page sizes use more memory
- Consider your application's memory constraints

### 3. Network Performance
- Smaller page sizes = more requests but faster responses
- Larger page sizes = fewer requests but slower responses

### 4. Timeout Considerations
- Very large datasets may cause timeouts
- Use specific filters to reduce dataset size
- Consider breaking large queries into smaller chunks

## 🧪 Testing Pagination

### Test Script
```bash
# Test pagination with debug mode
curl -X POST /restlet \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "transaction",
    "filters": [
      {
        "field_name": "trandate",
        "operator": "date_range",
        "startdate": "01-01-2024",
        "enddate": "02-01-2024"
      }
    ],
    "pageSize": 10,
    "usePagination": true,
    "pageIndex": 0,
    "debug": true
  }'
```

### Expected Results
- `recordCount` should equal `pageSize` (or less for last page)
- `pagination` object should be present
- `hasMore` should be `true` if more pages exist

## ✅ Summary

**Key Points:**
1. **Always set `usePagination: true`** for paginated results
2. **Page index is 0-based** (first page = 0)
3. **Maximum page size is 5000** records
4. **Use appropriate page sizes** for your use case
5. **Handle pagination metadata** in your application

**Common Mistake:**
```javascript
// ❌ This returns ALL records
{
  "pageSize": 10
}

// ✅ This returns only 10 records
{
  "pageSize": 10,
  "usePagination": true
}
```

Pagination is fully supported and working correctly - just remember to set `usePagination: true`! 