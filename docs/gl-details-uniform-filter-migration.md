# GL Details RESTlet - Uniform Filter Format Migration Guide

## Overview

The GL Details RESTlet (v3.0) has been updated to use the same **uniform filter format** as `multi-purpose-restlet3.js`. This provides consistency across all RESTlets and allows for more flexible and powerful filtering.

## What Changed?

### Old Format (v2.0)
```json
{
  "glNumber": "315400",
  "period": "Apr 2025",
  "subsidiaryId": "2",
  "includeDetails": true,
  "topTransactionsLimit": 10
}
```

### New Format (v3.0)
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },
    { "field": "subsidiary", "operator": "=", "value": "2" }
  ],
  "includeDetails": true,
  "topTransactionsLimit": 10
}
```

## Benefits

1. **Consistency**: Same filter format across all RESTlets
2. **Flexibility**: Support for multiple operators (`=`, `!=`, `>`, `<`, `>=`, `<=`, `contains`, `in`, etc.)
3. **Extensibility**: Easy to add new filter fields
4. **Power**: Use multiple operators on the same field or combine complex conditions

## Supported Filter Fields

| Field | Description | Example Operators |
|-------|-------------|-------------------|
| `glNumber` | GL account number (exact match) | `=`, `!=` |
| `glName` | GL account name | `=`, `contains`, `starts_with` |
| `period` | Accounting period name | `=` |
| `trandate` | Transaction date (for date ranges) | `>=`, `<=`, `>`, `<` |
| `subsidiary` | Subsidiary ID | `=`, `in` |

## Supported Operators

### Symbolic Operators
- `=` - Equals
- `!=` - Not equals
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal to
- `<=` - Less than or equal to

### Named Operators
- `equals`, `not_equals`
- `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`
- `contains`, `starts_with`, `ends_with`, `not_contains`
- `in`, `not_in`
- `is_null`, `is_not_null`
- `is_true`, `is_false`

## Migration Examples

### Example 1: GL Number with Period

**Old:**
```json
{
  "glNumber": "315400",
  "period": "Apr 2025",
  "subsidiaryId": "2"
}
```

**New:**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },
    { "field": "subsidiary", "operator": "=", "value": "2" }
  ]
}
```

### Example 2: GL Name with Period

**Old:**
```json
{
  "glName": "Other Income",
  "period": "Jul 2025"
}
```

**New:**
```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Other Income" },
    { "field": "period", "operator": "=", "value": "Jul 2025" }
  ]
}
```

### Example 3: GL Number with Date Range

**Old:**
```json
{
  "glNumber": "315700",
  "startDate": "2025-04-01",
  "endDate": "2025-06-30"
}
```

**New:**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315700" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-06-30" }
  ]
}
```

### Example 4: GL Name with Date Range

**Old:**
```json
{
  "glName": "Subscription Revenue",
  "startDate": "2025-01-01",
  "endDate": "2025-03-31"
}
```

**New:**
```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Subscription Revenue" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-03-31" }
  ]
}
```

## New Capabilities

### Multiple Subsidiaries (using "in" operator)

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },
    { "field": "subsidiary", "operator": "in", "values": ["1", "2", "3"] }
  ]
}
```

### Partial GL Name Match (using "contains")

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

### Exact GL Name Match

```json
{
  "filters": [
    { "field": "glName", "operator": "=", "value": "Other Income" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

### GL Name Starting With

```json
{
  "filters": [
    { "field": "glName", "operator": "starts_with", "value": "Other" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

## Response Format

The response format remains **unchanged**:

```json
{
  "success": true,
  "timestamp": "2025-10-06T10:30:00.000Z",
  "request": {
    "glNumber": "315400",
    "glName": "Other Income",
    "mode": "period",
    "period": "Apr 2025",
    "dateRange": null,
    "subsidiaryId": "2",
    "includeDetails": true
  },
  "glAccount": {
    "id": "123",
    "number": "315400",
    "name": "Other Income",
    "type": "Income",
    "fullName": "Income : Other Income"
  },
  "dateRange": {
    "mode": "period",
    "periodId": "45",
    "periodName": "Apr 2025",
    "startDate": "2025-04-01",
    "endDate": "2025-04-30"
  },
  "summary": {
    "totalDebit": 0,
    "totalCredit": 50000,
    "netAmount": 50000,
    "transactionCount": 25
  },
  "transactionTypes": [...],
  "currencyBreakdown": [...],
  "debitCreditAnalysis": {...},
  "topTransactions": [...],
  "transactionDetails": [...]
}
```

## Backward Compatibility

The RESTlet maintains **legacy format support** for a smooth transition:

```json
{
  "filters": {
    "glNumber": "315400",
    "period": "Apr 2025",
    "subsidiary": "2"
  }
}
```

This will be automatically converted to the new uniform format internally.

## Date Formats

All date formats are supported and automatically normalized:
- `YYYY-MM-DD` (e.g., `2025-04-01`)
- `DD-MM-YYYY` (e.g., `01-04-2025`)
- `MM/DD/YYYY` (e.g., `04/01/2025`)

## Testing

Run the test suite to verify the new format:

```bash
node tests/gl-details-tests.js
```

## Additional Options

These options remain **unchanged**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeDetails` | Boolean | `true` | Include detailed transaction list |
| `topTransactionsLimit` | Number | `10` | Number of top transactions to return |

## Summary

The uniform filter format provides:
- ✅ Consistency with multi-purpose-restlet3
- ✅ More powerful filtering capabilities
- ✅ Support for multiple operators
- ✅ Backward compatibility with legacy format
- ✅ Same response structure
- ✅ All existing features preserved

## Questions or Issues?

If you encounter any issues during migration, please:
1. Check the filter syntax carefully
2. Verify operator names (symbolic or named)
3. Ensure field names are correct
4. Review the examples in this guide
5. Run the test suite for reference implementations

