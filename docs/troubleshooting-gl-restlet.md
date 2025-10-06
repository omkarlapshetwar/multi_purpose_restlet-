# GL Details RESTlet - Troubleshooting Guide

## Common Errors and Solutions

---

## Error: "GL Account with number \"XXXXX\" not found or inactive"

### Example Error:
```json
{
  "success": false,
  "error": "GL Account with number \"315300\" not found or inactive",
  "timestamp": "2025-10-06T19:30:46.280Z"
}
```

### Causes:
1. **Account doesn't exist** in your NetSuite instance
2. **Account is inactive** in NetSuite
3. **Wrong account number format** (missing/extra digits, leading zeros)
4. **Restricted access** to the account

### Solutions:

#### ✅ Solution 1: Verify Account Exists (Recommended)
Go to NetSuite UI:
- **Lists** → **Accounting** → **Accounts**
- Search for the account number
- Check if it's marked as "Inactive"

#### ✅ Solution 2: Search by Name Instead
Use GL name filter which is more flexible:
```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

#### ✅ Solution 3: Use Common Account Names
Try these universal searches that should work in most NetSuite instances:

```json
// Find any revenue account
{ "field": "glName", "operator": "contains", "value": "Revenue" }

// Find any income account
{ "field": "glName", "operator": "contains", "value": "Income" }

// Find cash accounts
{ "field": "glName", "operator": "contains", "value": "Cash" }
```

#### ✅ Solution 4: Check for Leading Zeros
Some NetSuite instances use leading zeros:
- Try: `"0315300"` instead of `"315300"`
- Or try: `"315300"` instead of `"0315300"`

#### ✅ Solution 5: Discover Valid Accounts
See: **docs/finding-your-gl-accounts.md** for detailed instructions

---

## Error: "Period \"XXXXX\" not found"

### Example Error:
```json
{
  "success": false,
  "error": "Period \"Apr 2025\" not found",
  "timestamp": "2025-10-06T19:30:46.280Z"
}
```

### Causes:
1. **Period name format** doesn't match NetSuite
2. **Period doesn't exist** (future period not created yet)
3. **Typo** in period name

### Solutions:

#### ✅ Solution 1: Check Period Name Format in NetSuite
Go to:
- **Lists** → **Accounting** → **Accounting Periods**
- Note the exact format: "Apr 2025", "April 2025", "2025-04", "04/2025", etc.

Common formats:
- `"Apr 2025"` (3-letter month)
- `"April 2025"` (full month name)
- `"2025-04"` (ISO format)
- `"Q1 2025"` (quarterly)

#### ✅ Solution 2: Use Date Range Instead
Bypass period name issues by using explicit dates:
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ]
}
```

#### ✅ Solution 3: Use Current/Recent Period
Test with a period you know exists (current or previous month).

---

## Error: "Either glNumber or glName is required"

### Example Error:
```json
{
  "success": false,
  "error": "Either glNumber or glName is required",
  "timestamp": "2025-10-06T19:30:46.280Z"
}
```

### Cause:
Missing GL account filter in the request.

### Solution:
Add at least one GL filter:

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" }
    // OR
    // { "field": "glName", "operator": "contains", "value": "Revenue" }
  ],
  "includeDetails": true
}
```

---

## Error: "Either period OR date range is required"

### Example Error:
```json
{
  "success": false,
  "error": "Either period OR date range (startDate and endDate) is required",
  "timestamp": "2025-10-06T19:30:46.280Z"
}
```

### Cause:
Missing date filter (neither period nor date range specified).

### Solution:
Add either a period OR date range:

**Option 1: Use Period**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}
```

**Option 2: Use Date Range**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ]
}
```

---

## Error: "Cannot specify both period and date range"

### Cause:
You've specified BOTH period AND date range filters.

### Solution:
Choose ONE:

❌ **Don't do this:**
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },  // ← Both
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },  // ← specified
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ]
}
```

✅ **Do this (pick one):**
```json
// Option A: Use period only
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ]
}

// OR Option B: Use date range only
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ]
}
```

---

## Error: "Unsupported operator: XXXXX"

### Example Error:
```json
{
  "success": false,
  "error": "Unsupported operator: eq",
  "timestamp": "2025-10-06T19:30:46.280Z"
}
```

### Cause:
Invalid operator in filter.

### Solution:
Use valid operators:

**Symbolic:**
- `=`, `!=`, `>`, `<`, `>=`, `<=`

**Named:**
- `equals`, `not_equals`
- `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`
- `contains`, `starts_with`, `ends_with`, `not_contains`
- `in`, `not_in`
- `is_null`, `is_not_null`

✅ **Correct:**
```json
{ "field": "glNumber", "operator": "=", "value": "315400" }
{ "field": "glNumber", "operator": "equals", "value": "315400" }
```

❌ **Incorrect:**
```json
{ "field": "glNumber", "operator": "eq", "value": "315400" }  // ← Not supported
```

---

## No Results / Empty Response

### Symptom:
```json
{
  "success": true,
  "summary": {
    "totalDebit": 0,
    "totalCredit": 0,
    "netAmount": 0,
    "transactionCount": 0
  },
  "transactionTypes": [],
  "topTransactions": []
}
```

### Possible Causes:
1. **No transactions** exist for that GL account in the specified period
2. **Subsidiary filter** is too restrictive
3. **Date range** doesn't match transaction dates
4. **Account has no activity** in the period

### Solutions:

#### ✅ Check if Account Has Activity
Use a broader date range:
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "trandate", "operator": ">=", "value": "2024-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-12-31" }
  ]
}
```

#### ✅ Remove Subsidiary Filter
Test without subsidiary restriction first.

#### ✅ Try Different Account
Test with an account you know has activity (like a revenue or cash account).

---

## Authentication Errors

### Error: 401 Unauthorized

### Causes:
1. Invalid OAuth credentials
2. Token expired
3. Incorrect realm
4. Incorrect RESTlet URL

### Solutions:

#### ✅ Verify OAuth Credentials
Check `src/config/netsuite-config.js`:
- `consumerKey`
- `consumerSecret`
- `tokenId`
- `tokenSecret`
- `realm` (account ID)

#### ✅ Regenerate Token
In NetSuite:
- **Setup** → **Users/Roles** → **Access Tokens**
- Generate new token
- Update config file

---

## Response Too Large

### Symptom:
Slow response or timeout with large result sets.

### Solution:
Use `includeDetails: false` for summary only:

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315400" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": false  // ← No transaction details
}
```

Or limit transaction count:
```json
{
  "topTransactionsLimit": 10  // ← Return only top 10
}
```

---

## Testing Your Fix

### Quick Validation Request

Use this simple request to test:

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

This should work if:
- You have any revenue account
- The account has 2025 activity
- Broad enough to catch results

---

## Still Having Issues?

### Diagnostic Checklist:

- [ ] Verified GL account exists in NetSuite UI
- [ ] Checked account is active (not inactive)
- [ ] Confirmed period name format matches NetSuite
- [ ] Tried using date range instead of period
- [ ] Tested with GL name search (contains)
- [ ] Removed subsidiary filter for testing
- [ ] Verified OAuth credentials are correct
- [ ] Checked RESTlet URL is correct
- [ ] Tested with a broader date range
- [ ] Tried `includeDetails: false` to reduce payload

### Debug Mode

Get more information by checking the NetSuite script logs:
- **Customization** → **Scripting** → **Script Deployments**
- Find your RESTlet deployment
- Click "View" → "Execution Log"

---

## Reference Documents

- **Finding GL Accounts:** `docs/finding-your-gl-accounts.md`
- **GL Name Filters:** `docs/gl-name-filter-examples.md`
- **Migration Guide:** `docs/gl-details-uniform-filter-migration.md`
- **Quick Reference:** `docs/gl-details-quick-reference.md`

---

**Last Updated:** October 6, 2025

