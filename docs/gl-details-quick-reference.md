# GL Details RESTlet - Quick Reference Card

## Basic Request Structure

```json
{
  "filters": [
    { "field": "fieldName", "operator": "=", "value": "value" }
  ],
  "includeDetails": true,
  "topTransactionsLimit": 10
}
```

## Filter Fields

| Field | Purpose | Common Operators |
|-------|---------|------------------|
| `glNumber` | GL account number | `=`, `!=` |
| `glName` | GL account name | `=`, `contains`, `starts_with` |
| `period` | Accounting period | `=` |
| `trandate` | Transaction date | `>=`, `<=`, `>`, `<` |
| `subsidiary` | Subsidiary ID | `=`, `in` |

## Operators Quick Reference

| Symbol | Named | Purpose |
|--------|-------|---------|
| `=` | `equals` | Equal to |
| `!=` | `not_equals` | Not equal to |
| `>` | `greater_than` | Greater than |
| `<` | `less_than` | Less than |
| `>=` | `greater_than_or_equal` | Greater or equal |
| `<=` | `less_than_or_equal` | Less or equal |
| | `contains` | String contains |
| | `starts_with` | String starts with |
| | `ends_with` | String ends with |
| | `in` | Value in array |
| | `not_in` | Value not in array |

## Common Use Cases

### 1. GL Number + Period
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

### 2. GL Number + Date Range
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ]
}
```

### 3. GL Name (Partial Match) + Period
```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

### 4. GL Number + Multiple Subsidiaries
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },
    { "field": "subsidiary", "operator": "in", "values": ["1", "2", "3"] }
  ]
}
```

### 5. GL Number + Subsidiary + Date Range
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "subsidiary", "operator": "=", "value": "2" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-12-31" }
  ]
}
```

### 6. Summary Only (No Details)
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": false
}
```

### 7. Top 20 Transactions
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "topTransactionsLimit": 20
}
```

## Date Formats

All formats automatically converted to `YYYY-MM-DD`:
- `2025-04-01` ✓
- `01-04-2025` ✓
- `04/01/2025` ✓

## Response Structure

```json
{
  "success": true,
  "timestamp": "ISO-8601",
  "glAccount": { /* GL account details */ },
  "dateRange": { /* Date/period info */ },
  "summary": {
    "totalDebit": 0,
    "totalCredit": 50000,
    "netAmount": 50000,
    "transactionCount": 25
  },
  "transactionTypes": [ /* Type breakdown */ ],
  "currencyBreakdown": [ /* Currency breakdown */ ],
  "debitCreditAnalysis": { /* Debit/credit stats */ },
  "topTransactions": [ /* Top N transactions */ ],
  "transactionDetails": [ /* All transactions (if includeDetails=true) */ ]
}
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeDetails` | Boolean | `true` | Include full transaction details |
| `topTransactionsLimit` | Number | `10` | Number of top transactions |

## Error Response

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "ISO-8601"
}
```

## Common Errors

| Error | Solution |
|-------|----------|
| "Either glNumber or glName is required" | Add at least one GL filter |
| "Either period OR date range is required" | Add period or trandate filters |
| "GL Account not found" | Check GL number/name exists |
| "Period not found" | Check period name is correct |
| "Unsupported operator" | Use valid operator from list above |

## Testing

```bash
# Run test suite
node tests/gl-details-tests.js

# Test specific endpoint
curl -X GET https://your-restlet-url
```

## GET Request (API Info)

```bash
curl -X GET https://your-restlet-url
```

Returns version, supported operators, and usage examples.

## Version

**Current Version:** 3.0  
**Format:** Uniform Filter Format (compatible with multi-purpose-restlet3)

---

**Last Updated:** October 6, 2025

