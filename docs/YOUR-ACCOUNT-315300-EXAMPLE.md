# Your GL Account 315300 - Example Request

Based on your screenshot, you have GL account **315300 Infrastructure Service Fee**.

## Simple Request (All Subsidiaries)

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true,
  "topTransactionsLimit": 10
}
```

**This returns data for GL 315300 across ALL subsidiaries (including "Amagi Group" and all children).**

---

## By GL Name Instead

```json
{
  "filters": [
    { "field": "glName", "operator": "contains", "value": "Infrastructure Service" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": true
}
```

**This searches by account name and returns ALL subsidiaries.**

---

## With Date Range Instead of Period

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },
    { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
    { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
  ],
  "includeDetails": true
}
```

**This uses explicit date range and returns ALL subsidiaries.**

---

## If You Want ONLY Specific Subsidiary

**Only if you need to filter to one subsidiary:**

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },
    { "field": "period", "operator": "=", "value": "Apr 2025" },
    { "field": "subsidiary", "operator": "=", "value": "YOUR_SUBSIDIARY_ID" }
  ],
  "includeDetails": true
}
```

**Replace `YOUR_SUBSIDIARY_ID` with the internal ID of the subsidiary you want.**

To find subsidiary IDs:
- Go to **Setup** → **Company** → **Subsidiaries**
- Note the internal ID of the subsidiary

---

## Response Example

You'll get:

```json
{
  "success": true,
  "glAccount": {
    "id": "...",
    "number": "315300",
    "name": "Infrastructure Service Fee",
    "type": "Income",
    "fullName": "315000 Technology Service - Revenue : Technology Service - International"
  },
  "summary": {
    "totalDebit": 0,
    "totalCredit": 50000,
    "netAmount": 50000,
    "transactionCount": 25
  },
  "currencyBreakdown": [
    {
      "currency": "USD",
      "count": 20,
      "netAmount": 40000
    },
    {
      "currency": "EUR",
      "count": 5,
      "netAmount": 10000
    }
  ],
  "transactionTypes": [
    {
      "type": "Invoice",
      "count": 20,
      "netAmount": 45000
    },
    {
      "type": "Journal",
      "count": 5,
      "netAmount": 5000
    }
  ],
  "topTransactions": [ ... ],
  "transactionDetails": [ ... ]
}
```

**The response will show data from ALL subsidiaries unless you specified a subsidiary filter.**

---

## Key Points

✅ **Subsidiary filter is OPTIONAL**  
✅ **Omit subsidiary filter = Get ALL subsidiaries**  
✅ **Add subsidiary filter = Get ONLY that subsidiary**  
✅ **You choose which approach fits your needs**

---

## Summary Only (Faster)

If you only need totals and don't need transaction details:

```json
{
  "filters": [
    { "field": "glNumber", "operator": "=", "value": "315300" },
    { "field": "period", "operator": "=", "value": "Apr 2025" }
  ],
  "includeDetails": false
}
```

---

**Your Account:** 315300 Infrastructure Service Fee  
**Account Type:** Income  
**Subsidiary:** Amagi Group (with children)

**Last Updated:** October 6, 2025

