/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * GENERIC NETSUITE RESTLET (Secured + ARM + header-filter support on line tables)
 * Enhanced: uniform filter schema + operator tokens + date-aware comparisons
 */
define(['N/query', 'N/log'], function (query, log) {

    // --- CONFIG & UTILITIES -----------------------------------------------------
  
    // Record type to base table mapping (curated)
    const RECORD_TABLE_MAPPING = {
      // Transactions (header)
      transaction: 'transaction',
      // Lines
      transactionline: 'transactionline',
  
      // ARM (Arrangements & Elements & Status)
      revenuearrangement: 'revenuearrangement',
      revenueelement: 'revenueelement',
      revenueplanstatus: 'revenueplanstatus',
  
      // ARM (Plans)
      revenueplan: 'revenueplan',
      revenueplanplannedrevenue: 'revenueplanplannedrevenue',
  
      // Entities
      customer: 'customer',
      vendor: 'vendor',
      employee: 'employee',
      contact: 'contact',
      partner: 'partner',
      job: 'job',
      entitygroup: 'entitygroup',
      competitor: 'competitor',
      lead: 'customer',     // stored as customer (stage='LEAD')
      prospect: 'customer', // stored as customer (stage='PROSPECT')
  
      // Items (all map to item)
      item: 'item',
      inventoryitem: 'item',
      noninventoryitem: 'item',
      serviceitem: 'item',
      assemblyitem: 'item',
      kititem: 'item',
      downloaditem: 'item',
      giftcertificateitem: 'item',
      discountitem: 'item',
      markupitem: 'item',
      paymentitem: 'item',
      subtotalitem: 'item',
      expenseitem: 'item',
      descriptionitem: 'item',
      otherchargeitem: 'item',
  
      // Lists & Setup
      account: 'account',
      accountingperiod: 'accountingperiod',
      bin: 'bin',
      location: 'location',
      department: 'department',
      classification: 'classification',
      currency: 'currency',
      subsidiary: 'subsidiary',
      customlist: 'customlist',
      budget: 'budget',
      campaign: 'campaign',
      file: 'file',
      folder: 'folder',
  
      // Activities
      calendarevent: 'calendarevent',
      task: 'task',
      phonecall: 'phonecall',
      message: 'message',
      note: 'note',
  
      // Support & CRM
      supportcase: 'supportcase',
      issue: 'issue',
      solution: 'solution',
      topic: 'topic',
      campaignresponse: 'campaignresponse'
    };
  
    // Core operator names supported internally
    const SUPPORTED_OPERATORS = new Set([
      'equals', 'not_equals',
      'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal',
      'contains', 'starts_with', 'ends_with', 'not_contains',
      'in', 'not_in',
      'is_null', 'is_not_null',
      'date_range', 'date_equals', 'date_before', 'date_after',
      'is_true', 'is_false'
    ]);
  
    // Symbolic operator tokens that callers can use (mapped into the above)
    const OP_SYMBOL_MAP = {
      '=': 'equals',
      '!=': 'not_equals',
      '>': 'greater_than',
      '<': 'less_than',
      '>=': 'greater_than_or_equal',
      '<=': 'less_than_or_equal'
    };
  
    // Header-only fields we allow while querying each line table (for filtering & orderBy)
    const HEADER_ONLY_FIELDS_MAP = {
      transactionline: new Set([
        'type','trandate','tranid','entity','postingperiod','subsidiary','currency'
      ]),
      revenueplanplannedrevenue: new Set([
        'recordnumber','createdfrom','revrecstartdate','revrecenddate',
        'revenueplancurrency','amount','exchangerate','revenueplantype',
        'lastmodifieddate','entity','subsidiary','currency'
      ])
    };
  
    function assert(condition, message) {
      if (!condition) throw new Error(message);
    }
  
    function safeIdentifier(name, label) {
      const s = String(name || '').trim();
      assert(/^[A-Za-z_][A-Za-z0-9_]*$/.test(s), `Unsafe ${label}: ${name}`);
      return s;
    }
  
    function getSafeBaseTable(recordType) {
      const rt = String(recordType || '').toLowerCase();
      const mapped = RECORD_TABLE_MAPPING[rt];
      assert(!!mapped, `Unsupported recordType: ${recordType}`);
      return { baseTable: mapped, originalType: rt };
    }
  
    function generateAlias(recordType) {
      const lowerType = String(recordType || '').toLowerCase();
      const commonConflicts = {
        'c': ['customer', 'contact', 'campaign', 'classification', 'currency', 'customlist', 'competitor', 'calendarevent'],
        'i': ['item', 'inventoryitem', 'issue'],
        't': ['transaction', 'task', 'topic'],
        'a': ['account', 'accountingperiod', 'assemblyitem'],
        'e': ['employee', 'expenseitem', 'entitygroup'],
        's': ['serviceitem', 'subsidiary', 'supportcase', 'solution', 'subtotalitem'],
        'v': ['vendor', 'vendpymt', 'vendbill'],
        'p': ['partner', 'prospect', 'phonecall', 'paymentitem']
      };
      let alias = lowerType.charAt(0) || 't';
      if (commonConflicts[alias] && commonConflicts[alias].length > 1) {
        alias = lowerType.length >= 3 ? lowerType.substring(0, 3) : lowerType.substring(0, 2);
      }
      return safeIdentifier(alias, 'alias');
    }
  
    function likeEscape(val) {
      const s = String(val == null ? '' : val);
      return s.replace(/([%_\\])/g, '\\$1');
    }
  
    // Accepts "YYYY-MM-DD", "DD-MM-YYYY", "MM/DD/YYYY" → returns "YYYY-MM-DD"
    function normalizeDateString(dateStr) {
      if (!dateStr) return null;
      const s = String(dateStr).trim();
  
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
        const [y, m, d] = s.split('-');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split('-');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [m, d, y] = s.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      return s;
    }
  
    function isNormalizedDateYYYYMMDD(s) {
      return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
    }
  
    function normalizeOperatorToken(op) {
      const raw = String(op || '').trim();
      if (OP_SYMBOL_MAP[raw]) return OP_SYMBOL_MAP[raw];
      const lower = raw.toLowerCase();
      assert(SUPPORTED_OPERATORS.has(lower), `Unsupported operator: ${op}`);
      return lower;
    }
  
    function toNSBool(v) {
      const s = String(v).toLowerCase();
      return (s === 't' || s === 'true' || s === '1' || s === 'yes') ? 'T' : 'F';
    }
  
    // --- WHERE builder ----------------------------------------------------------
  
    function processFilter(filter, alias, originalType) {
      const fieldName = safeIdentifier(filter.field_name, 'field_name');
      const operator = normalizeOperatorToken(filter.operator);
      const field = `${alias}.${fieldName}`;
  
      // If the value looks like a date, normalize and apply date-aware semantics
      const rawVal = filter.value;
      const normalizedDate = normalizeDateString(rawVal);
      const isDateLike = isNormalizedDateYYYYMMDD(normalizedDate);
  
      switch (operator) {
        // Comparison
        case 'equals': {
          if (isDateLike) {
            // whole-day equality
            return {
              condition: `${field} >= TO_DATE(?, 'YYYY-MM-DD') AND ${field} < TO_DATE(?, 'YYYY-MM-DD') + 1`,
              params: [normalizedDate, normalizedDate]
            };
          }
          return { condition: `${field} = ?`, params: [rawVal] };
        }
        case 'not_equals': {
          if (isDateLike) {
            // not on that whole day
            return {
              condition: `NOT (${field} >= TO_DATE(?, 'YYYY-MM-DD') AND ${field} < TO_DATE(?, 'YYYY-MM-DD') + 1)`,
              params: [normalizedDate, normalizedDate]
            };
          }
          return { condition: `${field} != ?`, params: [rawVal] };
        }
        case 'greater_than': {
          if (isDateLike) {
            // strictly after that day
            return { condition: `${field} >= TO_DATE(?, 'YYYY-MM-DD') + 1`, params: [normalizedDate] };
          }
          return { condition: `${field} > ?`, params: [rawVal] };
        }
        case 'less_than': {
          if (isDateLike) {
            // strictly before that day
            return { condition: `${field} < TO_DATE(?, 'YYYY-MM-DD')`, params: [normalizedDate] };
          }
          return { condition: `${field} < ?`, params: [rawVal] };
        }
        case 'greater_than_or_equal': {
          if (isDateLike) {
            return { condition: `${field} >= TO_DATE(?, 'YYYY-MM-DD')`, params: [normalizedDate] };
          }
          return { condition: `${field} >= ?`, params: [rawVal] };
        }
        case 'less_than_or_equal': {
          if (isDateLike) {
            // inclusive up to end of day
            return { condition: `${field} < TO_DATE(?, 'YYYY-MM-DD') + 1`, params: [normalizedDate] };
          }
          return { condition: `${field} <= ?`, params: [rawVal] };
        }
  
        // String
        case 'contains': {
          assert(rawVal != null, 'contains requires value');
          return { condition: `${field} LIKE ? ESCAPE '\\'`, params: [`%${likeEscape(rawVal)}%`] };
        }
        case 'starts_with': {
          assert(rawVal != null, 'starts_with requires value');
          return { condition: `${field} LIKE ? ESCAPE '\\'`, params: [`${likeEscape(rawVal)}%`] };
        }
        case 'ends_with': {
          assert(rawVal != null, 'ends_with requires value');
          return { condition: `${field} LIKE ? ESCAPE '\\'`, params: [`%${likeEscape(rawVal)}`] };
        }
        case 'not_contains': {
          assert(rawVal != null, 'not_contains requires value');
          return { condition: `${field} NOT LIKE ? ESCAPE '\\'`, params: [`%${likeEscape(rawVal)}%`] };
        }
  
        // Array
        case 'in':
        case 'not_in': {
          const values = filter.values;
          assert(Array.isArray(values) && values.length > 0, `${operator} requires non-empty 'values' array`);
          const placeholders = values.map(() => '?').join(',');
          const kw = operator === 'in' ? 'IN' : 'NOT IN';
          return { condition: `${field} ${kw} (${placeholders})`, params: values };
        }
  
        // NULL
        case 'is_null':     return { condition: `${field} IS NULL`, params: [] };
        case 'is_not_null': return { condition: `${field} IS NOT NULL`, params: [] };
  
        // Date (explicit)
        case 'date_range': {
          const s = normalizeDateString(filter.startdate);
          const e = normalizeDateString(filter.enddate);
          assert(s && e, 'date_range requires startdate and enddate');
          return {
            condition: `${field} >= TO_DATE(?, 'YYYY-MM-DD') AND ${field} < TO_DATE(?, 'YYYY-MM-DD') + 1`,
            params: [s, e]
          };
        }
        case 'date_equals': {
          const d = normalizeDateString(rawVal);
          assert(d, 'date_equals requires value');
          return {
            condition: `${field} >= TO_DATE(?, 'YYYY-MM-DD') AND ${field} < TO_DATE(?, 'YYYY-MM-DD') + 1`,
            params: [d, d]
          };
        }
        case 'date_before': {
          const d = normalizeDateString(rawVal);
          assert(d, 'date_before requires value');
          return { condition: `${field} < TO_DATE(?, 'YYYY-MM-DD')`, params: [d] };
        }
        case 'date_after': {
          const d = normalizeDateString(rawVal);
          assert(d, 'date_after requires value');
          return { condition: `${field} > TO_DATE(?, 'YYYY-MM-DD')`, params: [d] };
        }
  
        // Boolean (T/F)
        case 'is_true':  return { condition: `${field} = ?`, params: ['T'] };
        case 'is_false': return { condition: `${field} = ?`, params: ['F'] };
  
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    }
  
    function autoStageFilterIfLeadProspect(originalType, alias, userFilters) {
      if (originalType === 'lead' || originalType === 'prospect') {
        const desired = (originalType === 'lead') ? 'LEAD' : 'PROSPECT';
        const alreadyHasStage = (userFilters || []).some(f => String(f.field_name).toLowerCase() === 'stage');
        if (!alreadyHasStage) {
          return { condition: `${alias}.stage = ?`, params: [desired] };
        }
      }
      return null;
    }
  
    // --- Filters normalizer (accept new + legacy shapes) ------------------------
  
    /**
     * Accepts:
     * 1) New uniform: [{ field, operator, value|values }]
     * 2) Array of single-key objects: [{ "startdate": { operator, value } }, ...]
     * 3) Legacy object with xxx_startdate / xxx_enddate keys
     * 4) Already-internal: [{ field_name, operator, value|values }]
     */
    function normalizeIncomingFilters(filters) {
      if (!filters) return [];
  
      // Case 1: Already an array of expression objects
      if (Array.isArray(filters)) {
        // (1a) New uniform: has .field
        if (filters.every(f => f && typeof f === 'object' && ('field' in f))) {
          return filters.map(f => ({
            field_name: f.field,
            operator: normalizeOperatorToken(f.operator),
            value: f.value,
            values: f.values,
            startdate: f.startdate,
            enddate: f.enddate
          }));
        }
        // (1b) Array of single-key objects: [{ "field": { operator, value } }]
        if (filters.every(f => f && typeof f === 'object' && Object.keys(f).length === 1)) {
          const out = [];
          for (const expr of filters) {
            const [field, spec] = Object.entries(expr)[0];
            if (field && spec && typeof spec === 'object') {
              out.push({
                field_name: field,
                operator: normalizeOperatorToken(spec.operator),
                value: spec.value,
                values: spec.values,
                startdate: spec.startdate,
                enddate: spec.enddate
              });
            }
          }
          return out;
        }
        // (1c) Assume already-internal
        return filters;
      }
  
      // Case 2: Legacy object keyed by field names or *_startdate / *_enddate
      if (filters && typeof filters === 'object') {
        const out = [];
        const pendingDateBounds = {}; // { field: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' } }
  
        for (const [key, val] of Object.entries(filters)) {
          const mStart = key.match(/^(.*)_startdate$/i);
          const mEnd   = key.match(/^(.*)_enddate$/i);
  
          if (mStart) {
            const field = mStart[1];
            const d = normalizeDateString(val);
            if (!pendingDateBounds[field]) pendingDateBounds[field] = {};
            pendingDateBounds[field].start = d;
            continue;
          }
          if (mEnd) {
            const field = mEnd[1];
            const d = normalizeDateString(val);
            if (!pendingDateBounds[field]) pendingDateBounds[field] = {};
            pendingDateBounds[field].end = d;
            continue;
          }
  
          // If it's an object with {operator,value}
          if (val && typeof val === 'object' && ('operator' in val)) {
            out.push({
              field_name: key,
              operator: normalizeOperatorToken(val.operator),
              value: val.value,
              values: val.values,
              startdate: val.startdate,
              enddate: val.enddate
            });
          } else {
            // Raw equals
            out.push({
              field_name: key,
              operator: 'equals',
              value: val
            });
          }
        }
  
        // Convert collected legacy *_startdate / *_enddate into >= and <=
        for (const [field, b] of Object.entries(pendingDateBounds)) {
          if (b.start) {
            out.push({ field_name: field, operator: 'greater_than_or_equal', value: b.start });
          }
          if (b.end) {
            out.push({ field_name: field, operator: 'less_than_or_equal', value: b.end });
          }
        }
        return out;
      }
  
      // Fallback
      return [];
    }
  
    // --- SQL builder ------------------------------------------------------------
  
    function buildSQL(context) {
      const recordType = context.recordType;
      const fields = context.fields;
      const orderBy = context.orderBy;
      const orderDir = (String(context.orderDir || 'ASC').toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
  
      const { baseTable, originalType } = getSafeBaseTable(recordType);
      const alias = generateAlias(recordType);
  
      // Normalize filters from any accepted shape
      const filters = normalizeIncomingFilters(context.filters || []);
  
      // SELECT clause
      let selectFields = [];
      if (fields && Array.isArray(fields) && fields.length > 0) {
        selectFields = fields.map(f => `${alias}.${safeIdentifier(f, 'field in fields')}`);
      } else {
        selectFields = [`${alias}.*`];
      }
  
      // Special handling for line tables with header filters ---------------------
      if (originalType === 'transactionline' || originalType === 'revenueplanplannedrevenue') {
        const headerAlias = (originalType === 'transactionline') ? 'th' : 'rp'; // header aliases
        const headerTable = (originalType === 'transactionline') ? 'transaction' : 'revenueplan';
        const headerSet = HEADER_ONLY_FIELDS_MAP[originalType] || new Set();
  
        const lineAlias = alias;
        const lineWhere = [];
        const headerWhere = [];
        let lineParams = [];
        let headerParams = [];
  
        for (const f of filters) {
          const name = String(f.field_name || '').toLowerCase();
          const isHeader = headerSet.has(name);
          if (isHeader) {
            const res = processFilter(f, headerAlias, headerTable);
            headerWhere.push(res.condition);
            headerParams = headerParams.concat(res.params);
          } else {
            const res = processFilter(f, lineAlias, originalType);
            lineWhere.push(res.condition);
            lineParams = lineParams.concat(res.params);
          }
        }
  
        let sql = `SELECT ${selectFields.join(', ')} FROM ${baseTable} ${lineAlias}`;
  
        if (headerWhere.length) {
          const sub = `SELECT ${headerAlias}.id FROM ${headerTable} ${headerAlias} WHERE ${headerWhere.join(' AND ')}`;
          const fkField = (originalType === 'transactionline') ? 'transaction' : 'revenueplan';
          lineWhere.unshift(`${lineAlias}.${fkField} IN (${sub})`);
        }
  
        if (lineWhere.length) {
          sql += ` WHERE ${lineWhere.join(' AND ')}`;
        }
  
        if (orderBy) {
          const ob = safeIdentifier(orderBy, 'orderBy');
          const targetAlias = (headerSet.has(ob.toLowerCase())) ? headerAlias : lineAlias;
          sql += ` ORDER BY ${targetAlias}.${ob} ${orderDir}`;
        } else {
          const defaultOrder = (originalType === 'transactionline') ? 'transaction' : 'revenueplan';
          sql += ` ORDER BY ${lineAlias}.${defaultOrder} ${orderDir}`;
        }
  
        return { sql, params: headerParams.concat(lineParams), alias: lineAlias, baseTable, originalType };
      }
  
      // Normal single-table flow -------------------------------------------------
      const whereClauses = [];
      let params = [];
  
      for (let i = 0; i < filters.length; i++) {
        const result = processFilter(filters[i], alias, originalType);
        whereClauses.push(result.condition);
        params = params.concat(result.params);
      }
  
      const stageAddon = autoStageFilterIfLeadProspect(originalType, alias, filters);
      if (stageAddon) {
        whereClauses.push(stageAddon.condition);
        params = params.concat(stageAddon.params);
      }
  
      let sql = `SELECT ${selectFields.join(', ')} FROM ${baseTable} ${alias}`;
      if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
      }
  
      if (orderBy) {
        const ob = safeIdentifier(orderBy, 'orderBy');
        sql += ` ORDER BY ${alias}.${ob} ${orderDir}`;
      } else {
        sql += ` ORDER BY ${alias}.id ${orderDir}`;
      }
  
      return { sql, params, alias, baseTable, originalType };
    }
  
    // --- Query executor ---------------------------------------------------------
  
    function executeQuery(context) {
      const pageSizeRaw = Number(context.pageSize || 1000);
      const options = {
        pageSize: Math.min(Math.max(1, pageSizeRaw), 1000), // cap at 1000
        pageIndex: Math.max(0, Number(context.pageIndex || 0)),
        usePagination: (context.usePagination !== false), // default true
        debug: !!context.debug
      };
  
      const sqlBits = buildSQL(context);
  
      if (options.debug) {
        log.debug('Generated SQL', sqlBits.sql);
        log.debug('Parameters', sqlBits.params);
      }
  
      const pagedData = query.runSuiteQLPaged({
        query: sqlBits.sql,
        params: sqlBits.params,
        pageSize: options.pageSize
      });
  
      let results = [];
      let totalRecords = 0;
  
      if (pagedData.pageRanges && pagedData.pageRanges.length > 0) {
        if (options.usePagination) {
          const idx = Math.min(options.pageIndex, pagedData.pageRanges.length - 1);
          const page = pagedData.fetch({ index: idx });
          results = page.data.asMappedResults();
          totalRecords = pagedData.pageRanges.reduce((t, pr) => t + pr.size, 0);
        } else {
          pagedData.pageRanges.forEach(pr => {
            const page = pagedData.fetch({ index: pr.index });
            results = results.concat(page.data.asMappedResults());
          });
          totalRecords = results.length;
        }
      }
  
      const response = {
        success: true,
        data: results,
        recordCount: results.length,
        recordType: context.recordType
      };
  
      if (options.usePagination) {
        const totalPages = Math.ceil(totalRecords / options.pageSize) || 0;
        response.pagination = {
          pageSize: options.pageSize,
          pageIndex: options.pageIndex,
          totalRecords: totalRecords,
          totalPages: totalPages,
          hasMore: (options.pageIndex + 1) * options.pageSize < totalRecords
        };
      }
  
      if (options.debug) {
        response.debug = {
          sql: sqlBits.sql,
          params: sqlBits.params,
          baseTable: sqlBits.baseTable,
          alias: sqlBits.alias,
          executionInfo: {
            pageSize: options.pageSize,
            pageIndex: options.pageIndex,
            totalRecords: totalRecords,
            returnedRecords: results.length,
            usePagination: options.usePagination
          }
        };
      }
  
      return response;
    }
  
    // --- REST Handlers ----------------------------------------------------------
  
    function getHandler() {
      try {
        return {
          success: true,
          message: 'Generic NetSuite RESTlet v2.1-secure (ARM-ready + header filters on line tables; uniform filters enabled)',
          supportedOperators: Array.from(SUPPORTED_OPERATORS),
          operatorSymbols: Object.keys(OP_SYMBOL_MAP),
          examples: {
            uniformFilter: [
              { "field": "startdate", "operator": ">=", "value": "01-01-2024" },
              { "field": "startdate", "operator": "<=", "value": "31-12-2024" }
            ]
          }
        };
      } catch (e) {
        return { success: false, error: 'GET failed: ' + (e.message || 'Unknown error') };
      }
    }
  
    function postHandler(context) {
      try {
        if (!context || (typeof context === 'string' && context.trim() === '')) {
          context = {};
        } else if (typeof context === 'string') {
          try { context = JSON.parse(context); } catch (err) { context = {}; }
        }
  
        assert(context.recordType, 'recordType is required');
  
        // Normalize filters BEFORE executing
        context.filters = normalizeIncomingFilters(context.filters || []);
  
        const result = executeQuery(context);
        result.timestamp = new Date().toISOString();
        result.version = '2.3.0-uniform-filters';
  
        return result;
  
      } catch (e) {
        return {
          success: false,
          error: 'Request processing failed: ' + (e.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          version: '2.3.0-uniform-filters',
          debug: (context && context.debug) ? { context: context } : undefined
        };
      }
    }
  
    return { get: getHandler, post: postHandler };
  });
  