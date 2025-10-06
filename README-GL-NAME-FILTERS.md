# GL Name Filters - Complete Guide

## Quick Start

The GL Details RESTlet now supports flexible GL name filtering using the uniform filter format.

### Basic GL Name Filter

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

## Operators for GL Name

| Operator | Description | Example |
|----------|-------------|---------|
| `=` or `equals` | Exact match | `"Other Income"` matches only "Other Income" |
| `contains` | Partial match | `"Revenue"` matches "Product Revenue", "Service Revenue" |
| `starts_with` | Starts with | `"Subscription"` matches "Subscription Revenue" |
| `ends_with` | Ends with | `"Income"` matches "Other Income", "Interest Income" |

## Example Requests

### 1. Find All Revenue Accounts (Most Common)

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true
}
```

**Matches:** Any account with "Revenue" in the name

---

### 2. Exact Account Name

```json
{
  "filters": [
    { "field": "glName", "operator": "=", "value": "Other Income" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true
}
```

**Matches:** Only "Other Income"

---

### 3. Find Subscription Accounts

```json
{
  "filters": [
    { "field": "glName", "operator": "starts_with", "value": "Subscription" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true
}
```

**Matches:** "Subscription Revenue", "Subscription Fees", etc.

---

### 4. Find Income Accounts

```json
{
  "filters": [
    { "field": "glName", "operator": "ends_with", "value": "Income" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true
}
```

**Matches:** "Other Income", "Interest Income", etc.

---

### 5. GL Name with Date Range

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ],
  "includeDetails": true
}
```

---

### 6. GL Name with Subsidiary

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },
    { "field": "subsidiary", "operator": "=", "value": "2" }
  ],
  "includeDetails": true
}
```

---

## Common Search Patterns

### Revenue Accounts
```json
{ "field": "glName", "operator": "contains", "value": "Revenue" }
```

### Income Accounts
```json
{ "field": "glName", "operator": "contains", "value": "Income" }
```

### Expense Accounts
```json
{ "field": "glName", "operator": "contains", "value": "Expense" }
```

### COGS Accounts
```json
{ "field": "glName", "operator": "contains", "value": "COGS" }
```

### Subscription-Related
```json
{ "field": "glName", "operator": "contains", "value": "Subscription" }
```

---

## Important Notes

### ⚠️ Case Sensitivity
GL name filters are **case-sensitive**. Use exact capitalization:
- ✅ `"Revenue"` (correct if NetSuite uses this case)
- ❌ `"REVENUE"` (may not match)

### 💡 Best Practices

1. **Use `contains` for flexibility**: Finds partial matches
2. **Use `=` for precision**: Requires exact name
3. **Test your filters**: Use the test suite to verify
4. **Check NetSuite naming**: Verify exact account names in NetSuite UI

### 🔍 Troubleshooting

**No results found?**
- Check case sensitivity (capitalization)
- Try broader search (use `contains` instead of `=`)
- Verify account exists in NetSuite
- Check for extra spaces in name

**Too many results?**
- Use exact match (`=`)
- Add more filters (period, subsidiary)
- Be more specific ("Subscription Revenue" vs "Revenue")

---

## When to Use GL Name vs GL Number

### Use GL Name When:
- ✓ You don't know the account number
- ✓ You want to search across multiple similar accounts
- ✓ You're doing exploratory analysis
- ✓ You want partial matches

### Use GL Number When:
- ✓ You know the exact account number (e.g., "315400")
- ✓ You need precise, guaranteed results
- ✓ You're building automated processes
- ✓ You want faster, more efficient queries

---

## Complete Example with All Options

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Subscription Revenue" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-03-31" },
    { "field": "subsidiary", "operator": "=", "value": "2" }
  ],
  "includeDetails": true,
  "topTransactionsLimit": 20
}
```

This searches for:
- GL accounts containing "Subscription Revenue"
- For Q1 2025 (Jan 1 - Mar 31)
- In subsidiary 2
- With full transaction details
- Showing top 20 transactions

---

## Testing

### Run All Tests
```bash
node tests/gl-details-tests.js
```

### Test Specific GL Name Filters
The test suite includes 4 GL name-specific tests:
- Test 6: GL Name Contains (Partial Match)
- Test 7: GL Name Exact Match
- Test 8: GL Name Starts With
- Test 9: GL Name Ends With

---

## Documentation Files

- **`gl-name-filter-examples.md`** - Detailed examples with explanations
- **`gl-name-copy-paste-examples.json`** - Ready-to-use JSON examples
- **`gl-details-uniform-filter-migration.md`** - Migration guide from v2.0
- **`gl-details-quick-reference.md`** - Quick reference card

---

## Response Format

The response includes the matched GL account:

```json
{
  "success": true,
  "glAccount": {
    "id": "123",
    "number": "315400",
    "name": "Subscription Revenue",  // ← Matched by name filter
    "type": "Income",
    "fullName": "Income : Subscription Revenue"
  },
  "summary": { ... },
  "transactionTypes": [ ... ],
  ...
}
```

---

## API Version

**RESTlet Version:** 3.0  
**Format:** Uniform Filter Format  
**Compatible With:** multi-purpose-restlet3.js

---

## Support

For questions or issues:
1. Review the examples in this guide
2. Check `gl-name-filter-examples.md` for detailed explanations
3. Run the test suite for working examples
4. Verify GL account names in NetSuite UI

---

**Last Updated:** October 6, 2025

