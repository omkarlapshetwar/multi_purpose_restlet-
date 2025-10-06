# Finding Your GL Accounts in NetSuite

## Overview

Before using the GL Details RESTlet, you need to identify valid GL account numbers and names from your NetSuite instance. The examples in the documentation use placeholder values that may not exist in your system.

---

## Method 1: Using NetSuite UI (Recommended)

### Step 1: Navigate to Chart of Accounts
1. Go to **Lists** → **Accounting** → **Accounts**
2. This shows your Chart of Accounts

### Step 2: Find Account Details
Look for these columns:
- **Number**: The GL account number (e.g., "4000", "1100")
- **Name**: The GL account name (e.g., "Sales Revenue", "Cash")
- **Type**: Account type (Income, Expense, Asset, etc.)
- **Inactive**: Check if account is active

### Step 3: Copy Account Information
Note down:
- ✅ Account Number (for exact matching)
- ✅ Account Name (for flexible searching)
- ✅ Full account path/hierarchy if needed

---

## Method 2: Using a Quick Test Request

### Option A: Search by Name Pattern (Easiest)

Try searching for common account names:

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": false
}
```

Common patterns to try:
- `"Revenue"` - Finds revenue accounts
- `"Income"` - Finds income accounts
- `"Cash"` - Finds cash accounts
- `"Expense"` - Finds expense accounts
- `"Payable"` - Finds accounts payable
- `"Receivable"` - Finds accounts receivable

### Option B: Use the Multi-Purpose RESTlet to List Accounts

Query the account table directly:

```json
{
  "recordType": "account",
  "fields": ["id", "number", "name", "type"],
  "filters": [
    { "field": "isinactive", "operator": "=", "value": "F" }
  ],
  "pageSize": 50
}
```

This returns a list of active accounts with their numbers and names.

---

## Method 3: SQL Query (Advanced)

If you have SuiteAnalytics access, run this query:

```sql
SELECT 
  id,
  accountnumber,
  displayname,
  accounttype,
  isinactive
FROM 
  account
WHERE 
  isinactive = 'F'
ORDER BY 
  accountnumber
```

---

## Common NetSuite GL Account Ranges

**Note:** These ranges vary by company. Your NetSuite may use different numbering.

### Typical Account Number Ranges:

| Type | Common Range | Examples |
|------|--------------|----------|
| Assets | 1000-1999 | 1000 (Cash), 1200 (A/R) |
| Liabilities | 2000-2999 | 2000 (A/P), 2100 (Credit Cards) |
| Equity | 3000-3999 | 3000 (Retained Earnings) |
| Revenue/Income | 4000-4999 | 4000 (Sales), 4100 (Service Revenue) |
| COGS | 5000-5999 | 5000 (Cost of Sales) |
| Expenses | 6000-8999 | 6000 (Salaries), 7000 (Rent) |
| Other Income/Expense | 9000-9999 | 9000 (Interest Income) |

---

## Example: Finding a Valid Account for Testing

### Step-by-Step Test

1. **Start with a broad search** (by name):
```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": false
}
```

2. **Review the response** to get the account number:
```json
{
  "success": true,
  "glAccount": {
    "id": "123",
    "number": "4000",  // ← Use this number
    "name": "Sales Revenue",
    "type": "Income"
  }
}
```

3. **Now use the exact account number**:
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "4000" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true
}
```

---

## Common Errors and Solutions

### Error: "GL Account with number \"315300\" not found or inactive"

**Causes:**
1. Account doesn't exist in your NetSuite instance
2. Account is inactive
3. Wrong account number format

**Solutions:**
✅ Use NetSuite UI to find valid account numbers
✅ Try searching by GL name instead: `{ "field": "glName", "operator": "contains", "value": "Revenue" }`
✅ Verify the account is active in NetSuite
✅ Check if your account numbers have leading zeros or different format

### Error: "Period not found"

**Solutions:**
✅ Check period name format in NetSuite (Lists → Accounting → Accounting Periods)
✅ Common formats: "Apr 2025", "April 2025", "2025-04"
✅ Or use date range instead of period

### Error: "Either glNumber or glName is required"

**Solutions:**
✅ Add at least one GL filter:
```json
{ "field": "glNumber", "operator": "=", "value": "4000" }
// OR
{ "field": "glName", "operator": "contains", "value": "Revenue" }
```

---

## Updated Examples with Your Actual Data

Once you've identified a valid account, update your request:

### Replace Placeholders:

**Before (Documentation Example):**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },  // ← Placeholder
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

**After (Your Actual Account):**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "4000" },  // ← Your account
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

---

## Pro Tips

### 1. Start with GL Name Search
GL name searches are more forgiving and help you discover accounts:
```json
{ "field": "glName", "operator": "contains", "value": "Revenue" }
```

### 2. Use Common Account Names
Try these universal terms:
- "Sales"
- "Revenue" 
- "Income"
- "Cash"
- "Bank"

### 3. Check Account Hierarchy
NetSuite may display accounts with hierarchy:
- Short name: "Product Revenue"
- Full name: "Income : Revenue : Product Revenue"

Use the short name in your search.

### 4. Verify Subsidiary Access
Ensure you have access to the subsidiary you're querying.

### 5. Test with Date Range Instead of Period
If period names are unclear, use date range:
```json
{ "field": "trandate", "operator": ">=", "value": "2025-04-01" },
{ "field": "trandate", "operator": "<=", "value": "2025-04-30" }
```

---

## Quick Discovery Script

Create a test request to discover your accounts:

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": false
}
```

The response will show you:
- Valid GL account numbers in your system
- Exact account names
- Account types
- Transaction counts

Use this information to build subsequent requests!

---

## Recommendation for Testing

### Safe Starting Points:

1. **Revenue Account** (most common):
```json
{ "field": "glName", "operator": "contains", "value": "Revenue" }
```

2. **Any Income Account**:
```json
{ "field": "glName", "operator": "contains", "value": "Income" }
```

3. **Cash Account** (usually active):
```json
{ "field": "glName", "operator": "contains", "value": "Cash" }
```

One of these should exist in any NetSuite instance!

---

## Summary Checklist

- [ ] Check NetSuite UI for valid GL account numbers
- [ ] Verify account is active (not inactive)
- [ ] Note exact account name and number
- [ ] Test with GL name search first
- [ ] Verify period name format in NetSuite
- [ ] Check subsidiary access
- [ ] Replace placeholder values in examples with your actual data

---

**Last Updated:** October 6, 2025

