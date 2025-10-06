# GL Details RESTlet - Quick Start Guide

## Before You Begin

⚠️ **IMPORTANT:** The examples in documentation use placeholder values that may not exist in your NetSuite instance.

### Step 1: Find a Valid GL Account

Try this simple request first to discover accounts in your system:

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" }
  ],
  "includeDetails": false
}
```

**Common account names to try:**
- `"Revenue"`
- `"Income"`
- `"Cash"`
- `"Sales"`

This will return the GL account number you can use in future requests.

---

## Step 2: Simple Test Request

Once you have a valid account from Step 1, make a focused request:

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-12-31" }
  ],
  "includeDetails": true,
  "topTransactionsLimit": 10
}
```

**This returns data for GL 315300 across ALL subsidiaries.**

Replace `315300` with your actual account number from Step 1.

---

## Step 3: Understanding the Response

### Success Response:
```json
{
  "success": true,
  "glAccount": {
    "id": "123",
    "number": "4000",
    "name": "Sales Revenue",
    "type": "Income"
  },
  "summary": {
    "totalDebit": 0,
    "totalCredit": 50000,
    "netAmount": 50000,
    "transactionCount": 25
  },
  "transactionTypes": [...],
  "topTransactions": [...]
}
```

### Error Response:
```json
{
  "success": false,
  "error": "GL Account with number \"315300\" not found or inactive"
}
```

**If you get an error**, see troubleshooting below ⬇️

---

## Common Errors & Quick Fixes

### ❌ "GL Account not found or inactive"

**Fix:** The account doesn't exist in your system.

✅ **Solution:** Use Step 1 above to find valid accounts, or check NetSuite UI:
- Go to **Lists** → **Accounting** → **Accounts**

---

### ❌ "Period not found"

**Fix:** Period name doesn't match NetSuite format.

✅ **Solution:** Use date range instead:
```json
{ "field": "trandate", "operator": ">=", "value": "2025-04-01" },
{ "field": "trandate", "operator": "<=", "value": "2025-04-30" }
```

---

### ❌ "Either glNumber or glName is required"

**Fix:** Missing GL account filter.

✅ **Solution:** Add one of these:
```json
{ "field": "glNumber", "operator": "=", "value": "4000" }
// OR
{ "field": "glName", "operator": "contains", "value": "Revenue" }
```

---

## Request Templates

### Template 1: By GL Name (Safest - Works Without Knowing Account Numbers)

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-12-31" }
  ],
  "includeDetails": false
}
```

**Use this when:** You don't know account numbers

---

### Template 2: By GL Number with Period

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "4000" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true,
  "topTransactionsLimit": 10
}
```

**Use this when:** You know the exact account number and period name

---

### Template 3: By GL Number with Date Range

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "4000" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ],
  "includeDetails": true
}
```

**Use this when:** You want precise date control

---

### Template 4: Summary Only (Fast - No Details)

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": false
}
```

**Use this when:** You only need totals, not transaction details

---

### Template 5: All Subsidiaries vs Specific Subsidiary

**Option A: All Subsidiaries (NO subsidiary filter - Default)**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```
**Returns:** Data from ALL subsidiaries combined

**Option B: Specific Subsidiary Only (WITH subsidiary filter)**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },
    { "field": "subsidiary", "operator": "=", "value": "2" }
  ]
}
```
**Returns:** Data from subsidiary 2 ONLY

**Use this when:** You need to isolate data by subsidiary

---

## Filter Fields Reference

| Field | Required? | What It Does | Example |
|-------|-----------|--------------|---------|
| `glNumber` | ✅ (or glName) | Exact GL account number | `"315300"`, `"4000"` |
| `glName` | ✅ (or glNumber) | GL account name (partial or exact) | `"Revenue"`, `"Cash"` |
| `period` | ✅ (or trandate) | NetSuite period name | `"Apr 2025"` |
| `trandate` | ✅ (or period) | Transaction date | `"2025-04-01"` |
| `subsidiary` | ❌ OPTIONAL | Subsidiary ID (omit for ALL) | `"1"`, `"2"` |

### ⚠️ Important: Subsidiary is OPTIONAL

**By default (no subsidiary filter):** Returns data across ALL subsidiaries  
**With subsidiary filter:** Returns data for ONLY that subsidiary

---

## Operators Reference

| Symbol | Name | Example |
|--------|------|---------|
| `=` | equals | `{ "operator": "=", "value": "4000" }` |
| `!=` | not equals | `{ "operator": "!=", "value": "4000" }` |
| `>` | greater than | `{ "operator": ">", "value": "2025-01-01" }` |
| `<` | less than | `{ "operator": "<", "value": "2025-12-31" }` |
| `>=` | greater or equal | `{ "operator": ">=", "value": "2025-01-01" }` |
| `<=` | less or equal | `{ "operator": "<=", "value": "2025-12-31" }` |
| `contains` | partial match | `{ "operator": "contains", "value": "Revenue" }` |
| `starts_with` | starts with | `{ "operator": "starts_with", "value": "Sales" }` |
| `ends_with` | ends with | `{ "operator": "ends_with", "value": "Income" }` |

---

## Testing Your Setup

### Method 1: Using curl

```bash
curl -X GET https://YOUR_RESTLET_URL
```

This returns API info and confirms the RESTlet is accessible.

### Method 2: Using Test Suite

```bash
# Update test config first (see tests/gl-details-tests.js)
node tests/gl-details-tests.js
```

---

## Configuration

### Update Test Config

Edit `tests/gl-details-tests.js`:

```javascript
const TEST_CONFIG = {
    glNumber: '4000',         // ← Your account number
    glName: 'Sales Revenue',   // ← Your account name
    period: 'Apr 2025',        // ← Your period name
    subsidiaryId: '1',         // ← Your subsidiary
    startDate: '2025-04-01',
    endDate: '2025-04-30'
};
```

---

## Next Steps

1. ✅ Find valid GL accounts using Step 1
2. ✅ Test with Template 1 (by GL name)
3. ✅ Note the account numbers from response
4. ✅ Use Template 2 or 3 with specific account numbers
5. ✅ Update test config with your values
6. ✅ Run test suite

---

## Need More Help?

### Documentation:
- **Troubleshooting:** `docs/troubleshooting-gl-restlet.md`
- **Finding Accounts:** `docs/finding-your-gl-accounts.md`
- **GL Name Filters:** `docs/gl-name-filter-examples.md`
- **Full Reference:** `docs/gl-details-quick-reference.md`

### Quick Links:
- All examples: `docs/gl-name-copy-paste-examples.json`
- Migration guide: `docs/gl-details-uniform-filter-migration.md`
- Main README: `README-GL-NAME-FILTERS.md`

---

## Summary

1. **Start with GL name search** to discover accounts
2. **Use date ranges** to avoid period name issues
3. **Test with `includeDetails: false`** for faster responses
4. **Update test config** with your actual values
5. **Check troubleshooting guide** if errors occur

---

**Version:** 3.0  
**Last Updated:** October 6, 2025

