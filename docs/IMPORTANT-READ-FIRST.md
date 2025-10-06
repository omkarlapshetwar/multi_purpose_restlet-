# ⚠️ IMPORTANT: Read This First

## The Issue You Encountered

You received this error:
```json
{
  "success": false,
  "error": "GL Account with number \"315300\" not found or inactive"
}
```

**This is normal!** The examples in the documentation use **placeholder account numbers** that don't exist in your specific NetSuite instance.

---

## What You Need To Do

### Option 1: Quick Test (Recommended)

Use this request to **discover accounts** in YOUR system:

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" }
  ],
  "includeDetails": false
}
```

**This will:**
- Return actual GL accounts from your NetSuite
- Show you valid account numbers
- Work without knowing specific account numbers

**Try these common names:**
- `"Revenue"`
- `"Income"`
- `"Cash"`
- `"Sales"`
- `"Expense"`

---

### Option 2: Find Accounts in NetSuite UI

1. Go to **Lists** → **Accounting** → **Accounts**
2. Find an active account
3. Note the **Number** and **Name**
4. Use these values in your requests

---

## Updated Request Format

Once you have a valid account, use this format:

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "YOUR_ACTUAL_ACCOUNT_NUMBER" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-12-31" }
  ],
  "includeDetails": true
}
```

Replace:
- `YOUR_ACTUAL_ACCOUNT_NUMBER` with the number you found
- Date range with relevant dates for your testing

---

## Why This Happens

Every NetSuite instance has different:
- ✗ GL account numbers
- ✗ GL account names
- ✗ Accounting period names
- ✗ Subsidiary IDs

**The documentation examples are generic and may not exist in your specific instance.**

---

## Documentation Updates

All documentation has been updated with:

1. ✅ Clear warnings about placeholder values
2. ✅ Instructions on finding YOUR accounts
3. ✅ Generic examples that work across systems
4. ✅ Troubleshooting guide for this exact error

---

## Updated Files

### For Quick Start:
- **`QUICK-START-GL-RESTLET.md`** - Start here!

### For Finding Accounts:
- **`docs/finding-your-gl-accounts.md`** - How to find valid GL accounts
- **`docs/troubleshooting-gl-restlet.md`** - Fix common errors

### For Examples:
- **`docs/gl-name-filter-examples.md`** - GL name filter examples
- **`docs/gl-name-copy-paste-examples.json`** - Copy-paste templates
- **`README-GL-NAME-FILTERS.md`** - Complete GL name guide

### For Testing:
- **`tests/gl-details-tests.js`** - Updated with TEST_CONFIG section

---

## Test Configuration

Update `tests/gl-details-tests.js` with YOUR values:

```javascript
const TEST_CONFIG = {
    glNumber: 'YOUR_GL_NUMBER',      // ← Update
    glName: 'YOUR_GL_NAME',          // ← Update
    period: 'YOUR_PERIOD_NAME',      // ← Update
    subsidiaryId: 'YOUR_SUB_ID',     // ← Update
    startDate: '2025-04-01',
    endDate: '2025-04-30'
};
```

---

## Recommended Testing Path

### Step 1: Discover Accounts (1 min)
```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Revenue" }
  ],
  "includeDetails": false
}
```

### Step 2: Test with Discovered Account (2 min)
```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "DISCOVERED_NUMBER" },
    { "field": "trandate", "operator": ">=", "value": "2025-01-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-12-31" }
  ],
  "includeDetails": true
}
```

### Step 3: Update Test Config (1 min)
Edit `tests/gl-details-tests.js` with your values.

### Step 4: Run Tests (1 min)
```bash
node tests/gl-details-tests.js
```

---

## Common Errors Reference

| Error | Quick Fix |
|-------|-----------|
| "GL Account not found" | Use Step 1 above to discover accounts |
| "Period not found" | Use date range instead of period |
| "glNumber or glName required" | Add a GL filter (see examples) |
| "period OR date range required" | Add date filter (see examples) |

---

## Key Takeaways

1. 🔴 **Don't use example values as-is** - they're placeholders
2. 🟢 **Start with GL name search** - discovers your accounts
3. 🟢 **Use date ranges** - more reliable than period names
4. 🟢 **Update test config** - makes testing easier
5. 🟢 **Check troubleshooting guide** - for detailed solutions

---

## Next Steps

1. ✅ Read `QUICK-START-GL-RESTLET.md`
2. ✅ Run discovery request (Step 1 above)
3. ✅ Test with your actual accounts
4. ✅ Update `tests/gl-details-tests.js` config
5. ✅ Refer to troubleshooting guide as needed

---

## Documentation Index

### Essential:
- **`QUICK-START-GL-RESTLET.md`** ⭐ Start here
- **`docs/troubleshooting-gl-restlet.md`** ⭐ Fix errors
- **`docs/finding-your-gl-accounts.md`** ⭐ Find valid accounts

### Reference:
- **`README-GL-NAME-FILTERS.md`** - GL name filtering
- **`docs/gl-details-quick-reference.md`** - Quick reference
- **`docs/gl-details-uniform-filter-migration.md`** - Migration from v2.0

### Examples:
- **`docs/gl-name-filter-examples.md`** - Detailed examples
- **`docs/gl-name-copy-paste-examples.json`** - JSON templates

---

## Summary

**The examples use placeholder values.** You need to:

1. Find valid GL accounts in YOUR NetSuite
2. Replace placeholder values with your actual values
3. Test with your data

**Start with:** `QUICK-START-GL-RESTLET.md`

**If errors:** `docs/troubleshooting-gl-restlet.md`

---

**Last Updated:** October 6, 2025  
**RESTlet Version:** 3.0

