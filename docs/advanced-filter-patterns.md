# Advanced Filter Patterns Documentation

## Overview

This document provides comprehensive examples of advanced filter patterns that work with our multi-purpose restlet. All patterns use the standardized filter structure with `field_name`, `operator`, and `value` properties.

## ✅ Verified Compatibility

Our restlet fully supports all the filter patterns shown in the reference document. The following operators are implemented and tested:

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
- `date_range` - Field is within date range (uses startdate/enddate)
- `date_equals` - Field equals specific date
- `date_before` - Field is before specific date
- `date_after` - Field is after specific date

### Boolean Operators
- `is_true` - Boolean field is true (equals 'T')
- `is_false` - Boolean field is false (equals 'F')

## 📅 Date Range Filters (Generic)

### 1. Transaction Date Range (Improved)
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
  "fields": [],
  "pageSize": 10
}
```

### 2. Customer Creation Date Range (Same Pattern)
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "datecreated",
      "operator": "date_range",
      "startdate": "01-01-2023",
      "enddate": "31-12-2023"
    },
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    }
  ],
  "fields": ["id", "entityid", "companyname", "datecreated"],
  "pageSize": 5
}
```

### 3. Employee Hire Date Range (Same Pattern)
```javascript
{
  "recordType": "employee",
  "filters": [
    {
      "field_name": "hiredate",
      "operator": "date_range",
      "startdate": "01-01-2022",
      "enddate": "31-12-2024"
    },
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    }
  ],
  "fields": ["id", "entityid", "firstname", "lastname", "hiredate"],
  "pageSize": 5
}
```

## 🔍 Generic Comparison Operators

### 4. Numeric Range Filter (Generic)
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "id",
      "operator": "greater_than",
      "value": "1000"
    },
    {
      "field_name": "id",
      "operator": "less_than",
      "value": "5000"
    }
  ],
  "pageSize": 5
}
```

### 5. String Pattern Matching (Generic)
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "entityid",
      "operator": "contains",
      "value": "ABC"
    },
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    }
  ],
  "fields": ["id", "entityid", "companyname"],
  "pageSize": 5
}
```

## 🔄 NULL/NOT NULL Filters (Generic)

### 6. Generic NULL Check - Any Field
```javascript
{
  "recordType": "customer",
  "filters": [
    {
      "field_name": "email",
      "operator": "is_not_null"
    },
    {
      "field_name": "phone",
      "operator": "is_null"
    },
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    }
  ],
  "fields": ["id", "entityid", "email", "phone"],
  "pageSize": 5
}
```

## 📋 Array/IN Filters (Generic)

### 7. Multiple Values Filter (Generic)
```javascript
{
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "type",
      "operator": "in",
      "values": ["SalesOrd", "CustInvc", "CustPymt"]
    },
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "31-12-2024"
    }
  ],
  "fields": ["id", "tranid", "type", "trandate"],
  "pageSize": 10
}
```

### 8. Status Filter with Multiple Values
```javascript
{
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "type",
      "operator": "equals",
      "value": "SalesOrd"
    },
    {
      "field_name": "status",
      "operator": "in",
      "values": ["A", "B", "C"]  // Pending Approval, etc.
    }
  ],
  "fields": ["id", "tranid", "status", "trandate"],
  "pageSize": 5
}
```

## 🔧 Complex Combined Filters

### 9. Complex Business Logic (Multiple Conditions)
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
      "field_name": "isperson",
      "operator": "equals",
      "value": "F"  // Companies only
    },
    {
      "field_name": "email",
      "operator": "is_not_null"
    },
    {
      "field_name": "datecreated",
      "operator": "date_range",
      "startdate": "01-01-2020",
      "enddate": "31-12-2024"
    },
    {
      "field_name": "companyname",
      "operator": "contains",
      "value": "Corp"
    }
  ],
  "fields": ["id", "entityid", "companyname", "email", "datecreated"],
  "pageSize": 10
}
```

## 🚀 Quick Examples (New Pattern)

### Simple Active Customers
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
  "pageSize": 5
}
```

### Sales Orders from Date Range
```javascript
{
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "type",
      "operator": "equals",
      "value": "SalesOrd"
    },
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "31-12-2024"
    }
  ],
  "pageSize": 10
}
```

### Employees with Contact Info
```javascript
{
  "recordType": "employee",
  "filters": [
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    },
    {
      "field_name": "email",
      "operator": "is_not_null"
    }
  ],
  "fields": ["id", "entityid", "firstname", "lastname", "email", "title"],
  "pageSize": 5
}
```

## 🔄 Additional Advanced Patterns

### 10. Vendor with Multiple Contact Methods
```javascript
{
  "recordType": "vendor",
  "filters": [
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    },
    {
      "field_name": "email",
      "operator": "is_not_null"
    },
    {
      "field_name": "phone",
      "operator": "is_not_null"
    }
  ],
  "fields": ["id", "entityid", "companyname", "email", "phone"],
  "pageSize": 5
}
```

### 11. High-Value Transactions
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
      "field_name": "amount",
      "operator": "greater_than",
      "value": 1000
    },
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "31-12-2024"
    }
  ],
  "fields": ["id", "tranid", "type", "amount", "trandate"],
  "pageSize": 10
}
```

### 12. Recent Customer Activity
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
    },
    {
      "field_name": "companyname",
      "operator": "starts_with",
      "value": "A"
    }
  ],
  "fields": ["id", "entityid", "companyname", "datecreated"],
  "pageSize": 10
}
```

### 13. Employee Department Filter
```javascript
{
  "recordType": "employee",
  "filters": [
    {
      "field_name": "isinactive",
      "operator": "equals",
      "value": "F"
    },
    {
      "field_name": "department",
      "operator": "in",
      "values": ["Sales", "Marketing", "Support"]
    }
  ],
  "fields": ["id", "entityid", "firstname", "lastname", "department", "title"],
  "pageSize": 10
}
```

### 14. Transaction Status Exclusions
```javascript
{
  "recordType": "transaction",
  "filters": [
    {
      "field_name": "type",
      "operator": "equals",
      "value": "SalesOrd"
    },
    {
      "field_name": "status",
      "operator": "not_in",
      "values": ["Cancelled", "Void"]
    },
    {
      "field_name": "trandate",
      "operator": "date_range",
      "startdate": "01-01-2024",
      "enddate": "31-12-2024"
    }
  ],
  "fields": ["id", "tranid", "type", "status", "trandate"],
  "pageSize": 10
}
```

### 15. Complex Customer Segmentation
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
      "field_name": "isperson",
      "operator": "equals",
      "value": "T"
    },
    {
      "field_name": "email",
      "operator": "is_not_null"
    },
    {
      "field_name": "phone",
      "operator": "is_not_null"
    },
    {
      "field_name": "datecreated",
      "operator": "date_range",
      "startdate": "01-01-2023",
      "enddate": "31-12-2024"
    }
  ],
  "fields": ["id", "entityid", "firstname", "lastname", "email", "phone", "datecreated"],
  "pageSize": 10
}
```

## 🎯 Benefits of New Design

### ADVANTAGES:

1. **REUSABLE**: Same filter structure for all record types
2. **CONSISTENT**: Standardized operator names across all fields
3. **MAINTAINABLE**: Add new operators without changing API structure
4. **READABLE**: Clear separation of field_name, operator, and value
5. **EXTENSIBLE**: Easy to add complex logic like AND/OR grouping
6. **TYPE-SAFE**: Operators can be validated per field type
7. **GENERIC**: Works with any field on any record type

## 📊 Standardized Operators

### SUPPORTED OPERATORS:

**Comparison:**
- `equals`
- `not_equals`
- `greater_than`
- `less_than`
- `greater_than_or_equal`
- `less_than_or_equal`

**String:**
- `contains` (LIKE %value%)
- `starts_with` (LIKE value%)
- `ends_with` (LIKE %value)
- `not_contains` (NOT LIKE %value%)

**Array:**
- `in` (multiple values)
- `not_in` (exclude multiple values)

**NULL:**
- `is_null`
- `is_not_null`

**Date:**
- `date_range` (uses startdate/enddate)
- `date_equals`
- `date_before`
- `date_after`

**Boolean:**
- `is_true`
- `is_false`

## 🧪 Testing

All these patterns are thoroughly tested with the advanced filter test suite:

```bash
npm run test:advanced-filters
```

This test suite includes 15 comprehensive tests covering all the patterns shown above.

## 🔧 Implementation Details

### Date Format Support
Our restlet supports multiple date formats:
- `DD-MM-YYYY` (e.g., "01-01-2024")
- `MM/DD/YYYY` (e.g., "01/01/2024")
- `YYYY-MM-DD` (e.g., "2024-01-01")

All dates are automatically converted to the NetSuite-compatible format.

### Field Validation
The restlet validates field names against the NetSuite schema and provides helpful error messages for invalid fields.

### Operator Mapping
Each operator is mapped to the appropriate SQL operator for optimal query performance.

### Error Handling
The restlet gracefully handles:
- Invalid operators (ignored with warning)
- Non-existent fields (ignored)
- Invalid date formats (converted where possible)
- Empty filter arrays (returns all records)

## 📈 Performance Considerations

1. **Indexed Fields**: Use indexed fields for better performance
2. **Date Ranges**: Keep date ranges reasonable to avoid timeouts
3. **Page Size**: Use appropriate page sizes (recommended: 50-100)
4. **Field Selection**: Only request needed fields to reduce data transfer
5. **Complex Filters**: Break down very complex filters into multiple requests if needed

## 🚀 Usage Examples

### API Call Example
```javascript
const response = await fetch('/restlet', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    recordType: 'customer',
    filters: [
      {
        field_name: 'isinactive',
        operator: 'equals',
        value: 'F'
      },
      {
        field_name: 'companyname',
        operator: 'contains',
        value: 'Corp'
      }
    ],
    fields: ['id', 'entityid', 'companyname'],
    pageSize: 10
  })
});
```

### Response Format
```javascript
{
  "success": true,
  "data": [...],
  "recordCount": 10,
  "recordType": "customer",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "2.0.0",
  "pagination": {
    "pageSize": 10,
    "pageIndex": 0,
    "totalRecords": 100,
    "totalPages": 10,
    "hasMore": true
  }
}
```

All these advanced filter patterns are fully supported and tested with our multi-purpose restlet, providing a powerful and flexible query interface for NetSuite data. 