# GL Name Filter Examples

This guide shows various ways to filter by GL account name in the GL Details RESTlet (v3.0).

---

## 1. Partial Match (Contains) - Most Common

Find all GL accounts that **contain** the text "Revenue" anywhere in the name.

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" }
  ],
  "includeDetails": true
}
```

**Matches:**
- "Product Revenue"
- "Service Revenue"
- "Subscription Revenue"
- "Other Revenue"

---

## 2. Exact Match (Equals)

Find GL account with **exact** name match.

```json
{
  "filters": [
    { "field": "glName", "operator": "=", "value": "Other Income" }
  ],
  "includeDetails": true
}
```

**Matches:**
- "Other Income" ✓

**Does NOT match:**
- "Other Income - Foreign Exchange"
- "Miscellaneous Other Income"

---

## 3. Starts With

Find GL accounts where the name **starts with** specific text.

```json
{
  "filters": [
    { "field": "glName", "operator": "starts_with", "value": "Subscription" }
  ],
  "includeDetails": true
}
```

**Matches:**
- "Subscription Revenue"
- "Subscription Fees"
- "Subscription Renewal"

**Does NOT match:**
- "Product Subscription Revenue"
- "Annual Subscription"

---

## 4. Ends With

Find GL accounts where the name **ends with** specific text.

```json
{
  "filters": [
    { "field": "glName", "operator": "ends_with", "value": "Income" }
  ],
  "includeDetails": true
}
```

**Matches:**
- "Other Income"
- "Interest Income"
- "Rental Income"

**Does NOT match:**
- "Income Tax Expense"
- "Income from Operations"

---

## 5. GL Name with Period Filter

Combine GL name search with accounting period.

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true
}
```

---

## 6. GL Name with Date Range

Combine GL name search with custom date range.

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

## 7. GL Name with Subsidiary Filter

Search by GL name for specific subsidiary.

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

## 8. Multiple GL Names (OR Logic) - Using Separate Requests

To search for multiple GL names, make separate requests:

**Request 1:**
```json
{
  "filters": [
    { "field": "glName", "operator": "=", "value": "Product Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

**Request 2:**
```json
{
  "filters": [
    { "field": "glName", "operator": "=", "value": "Service Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

---

## 9. Case Sensitivity Note

**Important:** The `glName` filter is **case-sensitive** in NetSuite.

✅ **Correct:**
```json
{ "field": "glName", "operator": "contains", "value": "Revenue" }
```

❌ **May not match if case differs:**
```json
{ "field": "glName", "operator": "contains", "value": "REVENUE" }
```

**Tip:** Use the exact case as it appears in NetSuite, or use partial lowercase if your GL names follow a consistent pattern.

---

## 10. Complete Real-World Example

Search for all "Subscription Revenue" accounts in Q1 2025 for subsidiary 2, return top 20 transactions.

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Subscription" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-03-31" },
    { "field": "subsidiary", "operator": "=", "value": "2" }
  ],
  "includeDetails": true,
  "topTransactionsLimit": 20
}
```

---

## Comparison: GL Number vs GL Name

### Use GL Number When:
- You know the exact account number (e.g., "315400")
- You need precise, guaranteed results
- You're building automated processes

```json
{ "field": "glNumber", "operator": "=", "value": "315400" }
```

### Use GL Name When:
- You're exploring or doing ad-hoc analysis
- You want to search across multiple similar accounts
- You know the account name but not the number
- You want partial matches

```json
{ "field": "glName", "operator": "contains", "value": "Revenue" }
```

---

## Testing GL Name Filters

You can test these filters using the provided test file:

```bash
node tests/gl-details-tests.js
```

Or create a custom test:

```javascript
const requestBody = {
  filters: [
    { field: 'glName', operator: 'contains', value: 'Your GL Name Here' },
    { field: 'period', operator: '=', value: 'Apr 2025' }
  ],
  includeDetails: true
};
```

---

## Quick Reference Table

| Operator | Use Case | Example Value | Matches |
|----------|----------|---------------|---------|
| `=` | Exact match | "Other Income" | "Other Income" only |
| `contains` | Partial match | "Revenue" | Any account with "Revenue" |
| `starts_with` | Prefix match | "Subscription" | "Subscription Revenue", "Subscription Fees" |
| `ends_with` | Suffix match | "Income" | "Other Income", "Interest Income" |

---

## Common GL Name Patterns

```json
// Revenue accounts
{ "field": "glName", "operator": "contains", "value": "Revenue" }

// Income accounts
{ "field": "glName", "operator": "contains", "value": "Income" }

// Expense accounts
{ "field": "glName", "operator": "contains", "value": "Expense" }

// Cost of goods sold
{ "field": "glName", "operator": "contains", "value": "COGS" }

// Accounts payable
{ "field": "glName", "operator": "contains", "value": "Payable" }

// Accounts receivable
{ "field": "glName", "operator": "contains", "value": "Receivable" }
```

---

## Troubleshooting

### No Results Found?

1. **Check case sensitivity** - Ensure capitalization matches NetSuite
2. **Try broader search** - Use "contains" instead of exact match
3. **Verify account exists** - Check in NetSuite UI
4. **Check for spaces** - "Other Income" vs "OtherIncome"
5. **Try partial name** - Use "Income" instead of "Other Income"

### Too Many Results?

1. **Use exact match** - Change to `operator: "="`
2. **Add more filters** - Include period or subsidiary
3. **Be more specific** - "Subscription Revenue" instead of "Revenue"

---

**Last Updated:** October 6, 2025  
**RESTlet Version:** 3.0

