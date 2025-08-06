# New Filter Structure Documentation

## Overview

The multi-purpose restlet has been updated to support a new, more flexible filter structure that provides better control over query conditions. This document explains the new filter format and how to use it.

## New Filter Structure

The new filter structure uses an array of filter objects, where each filter object has the following properties:

```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    },
    {
      "field_name": "datecreated", 
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "31-12-2024"
    }
  ],
  "fields": ["id", "entityid", "companyname"],
  "pageSize": 10
}
```

## Supported Operators

### Comparison Operators
- `equals` - Field equals value
- `not_equals` - Field does not equal value
- `greater_than` - Field is greater than value
- `less_than` - Field is less than value
- `greater_than_or_equal` - Field is greater than or equal to value
- `less_than_or_equal` - Field is less than or equal to value

### String Operators
- `contains` - Field contains substring (LIKE %value%)
- `starts_with` - Field starts with substring (LIKE value%)
- `ends_with` - Field ends with substring (LIKE %value)
- `not_contains` - Field does not contain substring (NOT LIKE %value%)

### Array Operators
- `in` - Field value is in array of values
- `not_in` - Field value is not in array of values

### NULL Operators
- `is_null` - Field is NULL
- `is_not_null` - Field is not NULL

### Date Operators
- `date_range` - Field is within date range (requires startdate and enddate)
- `date_equals` - Field equals specific date
- `date_before` - Field is before specific date
- `date_after` - Field is after specific date

### Boolean Operators
- `is_true` - Boolean field is true (equals 'T')
- `is_false` - Boolean field is false (equals 'F')

## Examples

### Basic Equals Filter
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
  "fields": ["id", "entityid", "companyname"]
}
```

### Multiple Filters
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    },
    {
      "field_name": "companyname",
      "operator": "contains",
      "value": "test"
    },
    {
      "field_name": "id",
      "operator": "greater_than",
      "value": 0
    }
  ],
  "fields": ["id", "entityid", "companyname"]
}
```

### Date Range Filter
```javascript
{
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "31-12-2024"
    }
  ],
  "fields": ["id", "tranid", "trandate"]
}
```

### Array Filter (IN Operator)
```javascript
{
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "type",
      "operator": "in",
      "values": ["SalesOrd", "CustInvc", "CashSale"]
    }
  ],
  "fields": ["id", "tranid", "type"]
}
```

### NULL Check
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "email",
      "operator": "is_not_null",
      "value": null
    }
  ],
  "fields": ["id", "entityid", "email"]
}
```

### Boolean Filter
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "isperson",
      "operator": "is_true",
      "value": true
    }
  ],
  "fields": ["id", "entityid", "isperson"]
}
```

### Complex Multi-Filter Example
```javascript
{
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "type",
      "operator": "in",
      "values": ["SalesOrd", "CustInvc"]
    },
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "31-12-2024"
    },
    {
      "field_name": "amount",
      "operator": "greater_than",
      "value": 0
    },
    {
      "field_name": "status",
      "operator": "not_equals",
      "value": "Cancelled"
    }
  ],
  "fields": ["id", "tranid", "type", "trandate", "amount", "status"],
  "pageSize": 50
}
```

## Date Format Support

The restlet supports multiple date formats:

- `DD-MM-YYYY` (e.g., "01-01-2024")
- `MM/DD/YYYY` (e.g., "01/01/2024")
- `YYYY-MM-DD` (e.g., "2024-01-01")

All dates are automatically converted to the NetSuite-compatible format.

## Field Selection

You can specify which fields to return:

```javascript
{
  "recordType": "customer",
  "filters": [...],
  "fields": ["id", "entityid", "companyname", "email"]
}
```

If no fields are specified or fields is null/empty, all fields will be returned.

## Pagination

Pagination is supported with the following options:

```javascript
{
  "recordType": "customer",
  "filters": [...],
  "fields": [...],
  "pageSize": 50,
  "pageIndex": 0,
  "usePagination": true
}
```

## Error Handling

The restlet gracefully handles:
- Invalid operators (ignored with warning)
- Non-existent fields (ignored)
- Invalid date formats (converted where possible)
- Empty filter arrays (returns all records)

## Migration from Old Format

### Old Format
```javascript
{
  "recordType": "customer",
  "isinactive": "F",
  "companyname": {
    "operator": "LIKE",
    "value": "%test%"
  }
}
```

### New Format
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    },
    {
      "field_name": "companyname",
      "operator": "contains",
      "value": "test"
    }
  ]
}
```

## Testing

The new filter structure is thoroughly tested with the `new-filters` test suite:

```bash
npm run test:new-filters
```

This test suite covers all supported operators and edge cases.

## Best Practices

1. **Use specific field names** - Always use the exact NetSuite field names
2. **Combine filters logically** - Multiple filters are combined with AND logic
3. **Use appropriate operators** - Choose the most specific operator for your needs
4. **Test with small datasets first** - Verify your filters work before running on large datasets
5. **Use pagination for large results** - Set appropriate pageSize to avoid timeouts
6. **Handle errors gracefully** - Check the response success flag and error messages

## Operator Mapping

| Old Operator | New Operator | Description |
|--------------|--------------|-------------|
| `=` | `equals` | Field equals value |
| `!=` | `not_equals` | Field does not equal value |
| `>` | `greater_than` | Field is greater than value |
| `<` | `less_than` | Field is less than value |
| `>=` | `greater_than_or_equal` | Field is greater than or equal to value |
| `<=` | `less_than_or_equal` | Field is less than or equal to value |
| `LIKE` | `contains` | Field contains substring |
| `NOT LIKE` | `not_contains` | Field does not contain substring |
| `IN` | `in` | Field value is in array |
| `NOT IN` | `not_in` | Field value is not in array |
| `IS NULL` | `is_null` | Field is NULL |
| `IS NOT NULL` | `is_not_null` | Field is not NULL |

## Response Format

The restlet returns a standardized response format:

```javascript
{
  "success": true,
  "data": [...],
  "recordCount": 10,
  "recordType": "customer",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0",
  "pagination": {
    "pageSize": 50,
    "pageIndex": 0,
    "totalRecords": 100,
    "totalPages": 2,
    "hasMore": true
  }
}
```

This new filter structure provides much more flexibility and control over your NetSuite queries while maintaining backward compatibility through the test builder's conversion functions. 