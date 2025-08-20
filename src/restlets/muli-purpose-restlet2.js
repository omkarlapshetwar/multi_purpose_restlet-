/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * GENERIC NETSUITE RESTLET (Secured + ARM + header-filter support on line tables)
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
  
    const SUPPORTED_OPERATORS = new Set([
      'equals', 'not_equals',
      'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal',
      'contains', 'starts_with', 'ends_with', 'not_contains',
      'in', 'not_in',
      'is_null', 'is_not_null',
      'date_range', 'date_equals', 'date_before', 'date_after',
      'is_true', 'is_false'
    ]);
  
    // Header-only fields we allow while querying each line table
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
  
    function validateOperator(op) {
      assert(SUPPORTED_OPERATORS.has(op), `Unsupported operator: ${op}`);
    }
  
    // --- WHERE builder ----------------------------------------------------------
  
    function processFilter(filter, alias, originalType) {
      const fieldName = safeIdentifier(filter.field_name, 'field_name');
      const operator = String(filter.operator || '').trim();
      validateOperator(operator);
  
      const field = `${alias}.${fieldName}`;
  
      switch (operator) {
        // Comparison
        case 'equals':            return { condition: `${field} = ?`, params: [filter.value] };
        case 'not_equals':        return { condition: `${field} != ?`, params: [filter.value] };
        case 'greater_than':      return { condition: `${field} > ?`,  params: [filter.value] };
        case 'less_than':         return { condition: `${field} < ?`,  params: [filter.value] };
        case 'greater_than_or_equal': return { condition: `${field} >= ?`, params: [filter.value] };
        case 'less_than_or_equal':    return { condition: `${field} <= ?`, params: [filter.value] };
  
        // String
        case 'contains': {
          assert(filter.value != null, 'contains requires value');
          return { condition: `${field} LIKE ? ESCAPE '\\'`, params: [`%${likeEscape(filter.value)}%`] };
        }
        case 'starts_with': {
          assert(filter.value != null, 'starts_with requires value');
          return { condition: `${field} LIKE ? ESCAPE '\\'`, params: [`${likeEscape(filter.value)}%`] };
        }
        case 'ends_with': {
          assert(filter.value != null, 'ends_with requires value');
          return { condition: `${field} LIKE ? ESCAPE '\\'`, params: [`%${likeEscape(filter.value)}`] };
        }
        case 'not_contains': {
          assert(filter.value != null, 'not_contains requires value');
          return { condition: `${field} NOT LIKE ? ESCAPE '\\'`, params: [`%${likeEscape(filter.value)}%`] };
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
  
        // Date (inclusive day window)
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
          const d = normalizeDateString(filter.value);
          assert(d, 'date_equals requires value');
          return {
            condition: `${field} >= TO_DATE(?, 'YYYY-MM-DD') AND ${field} < TO_DATE(?, 'YYYY-MM-DD') + 1`,
            params: [d, d]
          };
        }
        case 'date_before': {
          const d = normalizeDateString(filter.value);
          assert(d, 'date_before requires value');
          return { condition: `${field} < TO_DATE(?, 'YYYY-MM-DD')`, params: [d] };
        }
        case 'date_after': {
          const d = normalizeDateString(filter.value);
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
  
    // --- SQL builder ------------------------------------------------------------
  
    function buildSQL(context) {
      const recordType = context.recordType;
      const fields = context.fields;
      const filters = context.filters || [];
      const orderBy = context.orderBy;
      const orderDir = (String(context.orderDir || 'ASC').toUpperCase() === 'DESC') ? 'DESC' : 'ASC';
  
      const { baseTable, originalType } = getSafeBaseTable(recordType);
      const alias = generateAlias(recordType);
  
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
          sql += ` ORDER BY ${lineAlias}.${safeIdentifier(orderBy, 'orderBy')} ${orderDir}`;
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
      const options = {
        pageSize: Math.min(Number(context.pageSize || 1000), 5000),
        pageIndex: Number(context.pageIndex || 0),
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
          message: 'Generic NetSuite RESTlet v2.1-secure (ARM-ready + header filters on line tables)',
          supportedOperators: Array.from(SUPPORTED_OPERATORS),
          example: {
            recordType: 'customer',
            filters: [{ field_name: 'isinactive', operator: 'equals', value: 'F' }],
            fields: ['id', 'entityid', 'companyname'],
            pageSize: 5,
            usePagination: true
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
  
        const result = executeQuery(context);
        result.timestamp = new Date().toISOString();
        result.version = '2.2.0-secure-arm';
  
        return result;
  
      } catch (e) {
        return {
          success: false,
          error: 'Request processing failed: ' + (e.message || 'Unknown error'),
          timestamp: new Date().toISOString(),
          version: '2.2.0-secure-arm',
          debug: (context && context.debug) ? { context: context } : undefined
        };
      }
    }
  
    return { get: getHandler, post: postHandler };
  });
  