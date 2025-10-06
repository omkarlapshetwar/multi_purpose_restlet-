/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * 
 * GL Account Analysis RESTlet
 * 
 * Purpose: Provides detailed GL account analysis for a given period
 * - Account balance and net activity
 * - Transaction type breakdown (Invoices, Credit Memos, Journal Entries, etc.)
 * - Document counts and amounts
 * - Debit/Credit analysis
 * - Top transactions
 * 
 * Usage (Uniform Filter Format):
 * 
 * POST Body Example 1 (By GL Number - All Subsidiaries):
 * {
 *   "filters": [
 *     { "field": "glNumber", "operator": "=", "value": "315300" },
 *     { "field": "period", "operator": "=", "value": "Apr 2025" }
 *   ],
 *   "includeDetails": true,
 *   "topTransactionsLimit": 10
 * }
 * 
 * Note: Subsidiary filter is OPTIONAL. If omitted, returns data across all subsidiaries.
 * 
 * POST Body Example 2 (By GL Name with Contains - Partial Match):
 * {
 *   "filters": [
 *     { "field": "glName", "operator": "contains", "value": "Revenue" },
 *     { "field": "period", "operator": "=", "value": "Apr 2025" }
 *   ],
 *   "includeDetails": true
 * }
 * 
 * POST Body Example 3 (By GL Name with Equals - Exact Match):
 * {
 *   "filters": [
 *     { "field": "glName", "operator": "=", "value": "Other Income" },
 *     { "field": "period", "operator": "=", "value": "Jul 2025" }
 *   ],
 *   "includeDetails": true
 * }
 * 
 * POST Body Example 4 (By GL Name and Date Range):
 * {
 *   "filters": [
 *     { "field": "glName", "operator": "contains", "value": "Subscription" },
 *     { "field": "trandate", "operator": ">=", "value": "2025-04-01" },
 *     { "field": "trandate", "operator": "<=", "value": "2025-04-30" }
 *   ],
 *   "includeDetails": true,
 *   "topTransactionsLimit": 10
 * }
 * 
 * POST Body Example 5 (Optional: Filter by Specific Subsidiary):
 * {
 *   "filters": [
 *     { "field": "glNumber", "operator": "=", "value": "315300" },
 *     { "field": "period", "operator": "=", "value": "Apr 2025" },
 *     { "field": "subsidiary", "operator": "=", "value": "2" }
 *   ],
 *   "includeDetails": true
 * }
 * 
 * Note: Add subsidiary filter ONLY if you want to limit results to a specific subsidiary.
 * 
 * Supported Filter Fields:
 * - glNumber: GL account number (exact match) - REQUIRED (or glName)
 * - glName: GL account name (contains/equals) - REQUIRED (or glNumber)
 * - period: Accounting period name - REQUIRED (or trandate range)
 * - trandate: Transaction date (for date ranges) - REQUIRED (or period)
 * - subsidiary: Subsidiary ID - OPTIONAL (omit to get ALL subsidiaries)
 * 
 * Supported Operators:
 * =, !=, >, <, >=, <=, equals, not_equals, greater_than, less_than,
 * greater_than_or_equal, less_than_or_equal, contains, starts_with,
 * ends_with, in, not_in, is_null, is_not_null
 * 
 * Response: {
 *   "success": true,
 *   "glAccount": { ... },
 *   "dateRange": { ... },
 *   "summary": { ... },
 *   "transactionTypes": [ ... ],
 *   "topTransactions": [ ... ],
 *   "currencyBreakdown": [ ... ]
 * }
 */

define(['N/search', 'N/log', 'N/format', 'N/record'], function(search, log, format, record) {
    
    // --- OPERATOR MAPPING (from multi-purpose-restlet3) ---
    
    const SUPPORTED_OPERATORS = new Set([
      'equals', 'not_equals',
      'greater_than', 'less_than', 'greater_than_or_equal', 'less_than_or_equal',
      'contains', 'starts_with', 'ends_with', 'not_contains',
      'in', 'not_in',
      'is_null', 'is_not_null',
      'is_true', 'is_false'
    ]);
    
    const OP_SYMBOL_MAP = {
      '=': 'equals',
      '!=': 'not_equals',
      '>': 'greater_than',
      '<': 'less_than',
      '>=': 'greater_than_or_equal',
      '<=': 'less_than_or_equal'
    };
    
    function normalizeOperatorToken(op) {
      const raw = String(op || '').trim();
      if (OP_SYMBOL_MAP[raw]) return OP_SYMBOL_MAP[raw];
      const lower = raw.toLowerCase();
      if (!SUPPORTED_OPERATORS.has(lower)) {
        throw new Error('Unsupported operator: ' + op);
      }
      return lower;
    }
    
    /**
     * Normalize date string to YYYY-MM-DD format
     */
    function normalizeDateString(dateStr) {
      if (!dateStr) return null;
      const s = String(dateStr).trim();
  
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
        const [y, m, d] = s.split('-');
        return y + '-' + m.padStart(2, '0') + '-' + d.padStart(2, '0');
      }
      if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
        const [d, m, y] = s.split('-');
        return y + '-' + m.padStart(2, '0') + '-' + d.padStart(2, '0');
      }
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
        const [m, d, y] = s.split('/');
        return y + '-' + m.padStart(2, '0') + '-' + d.padStart(2, '0');
      }
      return s;
    }
    
    /**
     * Normalize incoming filters to internal format
     */
    function normalizeFilters(filters) {
      if (!filters) return [];
      
      if (Array.isArray(filters)) {
        // New uniform format: [{ field, operator, value }]
        if (filters.every(f => f && typeof f === 'object' && ('field' in f))) {
          return filters.map(f => ({
            field_name: f.field,
            operator: normalizeOperatorToken(f.operator || '='),
            value: f.value,
            values: f.values
          }));
        }
        // Already internal format
        return filters;
      }
      
      // Legacy object format
      if (filters && typeof filters === 'object') {
        const out = [];
        for (const [key, val] of Object.entries(filters)) {
          if (val && typeof val === 'object' && ('operator' in val)) {
            out.push({
              field_name: key,
              operator: normalizeOperatorToken(val.operator),
              value: val.value,
              values: val.values
            });
          } else {
            out.push({
              field_name: key,
              operator: 'equals',
              value: val
            });
          }
        }
        return out;
      }
      
      return [];
    }
    
    /**
     * POST handler - Main entry point
     */
    function post(requestBody) {
        try {
            log.audit('GL Analysis Request', JSON.stringify(requestBody));
            
            // Normalize filters
            const filters = normalizeFilters(requestBody.filters || []);
            
            // Extract GL-specific parameters from filters
            let glNumber = null;
            let glName = null;
            let periodName = null;
            let startDate = null;
            let endDate = null;
            let subsidiaryId = null;
            
            for (const filter of filters) {
                const field = filter.field_name.toLowerCase();
                const op = filter.operator;
                const val = filter.value;
                
                if (field === 'glnumber' && (op === 'equals' || op === 'is')) {
                    glNumber = val;
                } else if (field === 'glname' && (op === 'equals' || op === 'contains')) {
                    glName = val;
                } else if (field === 'period' && (op === 'equals' || op === 'is')) {
                    periodName = val;
                } else if (field === 'trandate') {
                    if (op === 'greater_than_or_equal' || op === 'greater_than') {
                        startDate = normalizeDateString(val);
                    } else if (op === 'less_than_or_equal' || op === 'less_than') {
                        endDate = normalizeDateString(val);
                    }
                } else if (field === 'subsidiary' && (op === 'equals' || op === 'is')) {
                    subsidiaryId = val;
                }
            }
            
            // Validate input
            const validation = validateInput({ glNumber: glNumber, glName: glName, period: periodName, startDate: startDate, endDate: endDate });
            if (!validation.valid) {
                return createErrorResponse(validation.error);
            }
            
            const includeDetails = requestBody.includeDetails !== false; // default true
            const topLimit = requestBody.topTransactionsLimit || 10;
            
            // Get GL account info (by number or name)
            const glAccount = getGLAccountInfo(glNumber, glName);
            if (!glAccount) {
                const searchCriteria = glNumber ? `number "${glNumber}"` : `name "${glName}"`;
                return createErrorResponse(`GL Account with ${searchCriteria} not found or inactive`);
            }
            
            // Determine date range - either from period or explicit dates
            let dateRangeInfo;
            if (periodName) {
                // Use period
                const periodInfo = getPeriodInfo(periodName);
                if (!periodInfo) {
                    return createErrorResponse(`Period "${periodName}" not found`);
                }
                dateRangeInfo = {
                    mode: 'period',
                    periodId: periodInfo.id,
                    periodName: periodInfo.name,
                    startDate: periodInfo.startDate,
                    endDate: periodInfo.endDate
                };
            } else {
                // Use date range
                dateRangeInfo = {
                    mode: 'dateRange',
                    periodId: null,
                    periodName: null,
                    startDate: startDate,
                    endDate: endDate
                };
            }
            
            // Get comprehensive GL analysis
            const analysis = analyzeGLAccount(glAccount, dateRangeInfo, subsidiaryId, includeDetails, topLimit);
            
            // Build response
            const response = {
                success: true,
                timestamp: new Date().toISOString(),
                request: {
                    glNumber: glAccount.number,
                    glName: glAccount.name,
                    mode: dateRangeInfo.mode,
                    period: periodName,
                    dateRange: periodName ? null : { startDate: startDate, endDate: endDate },
                    subsidiaryId: subsidiaryId,
                    includeDetails: includeDetails
                },
                glAccount: {
                    id: glAccount.id,
                    number: glAccount.number,
                    name: glAccount.name,
                    type: glAccount.type,
                    fullName: glAccount.fullName
                },
                dateRange: {
                    mode: dateRangeInfo.mode,
                    periodId: dateRangeInfo.periodId,
                    periodName: dateRangeInfo.periodName,
                    startDate: dateRangeInfo.startDate,
                    endDate: dateRangeInfo.endDate
                },
                summary: analysis.summary,
                transactionTypes: analysis.transactionTypes,
                currencyBreakdown: analysis.currencyBreakdown,
                debitCreditAnalysis: analysis.debitCreditAnalysis
            };
            
            // Add detailed transaction list if requested
            if (includeDetails) {
                response.topTransactions = analysis.topTransactions;
                response.transactionDetails = analysis.transactionDetails;
            }
            
            log.audit('GL Analysis Complete', `Processed ${analysis.summary.transactionCount} transactions`);
            
            return response;
            
        } catch (error) {
            log.error('GL Analysis Error', error.toString());
            return createErrorResponse(error.toString());
        }
    }
    
    /**
     * Validate input parameters
     */
    function validateInput(requestBody) {
        if (!requestBody) {
            return { valid: false, error: 'Request body is required' };
        }
        
        // Must have either glNumber or glName
        if (!requestBody.glNumber && !requestBody.glName) {
            return { valid: false, error: 'Either glNumber or glName is required' };
        }
        
        // Must have either period OR date range (startDate + endDate)
        const hasPeriod = !!requestBody.period;
        const hasDateRange = !!(requestBody.startDate && requestBody.endDate);
        
        if (!hasPeriod && !hasDateRange) {
            return { valid: false, error: 'Either period OR date range (startDate and endDate) is required' };
        }
        
        if (hasPeriod && hasDateRange) {
            return { valid: false, error: 'Cannot specify both period and date range. Choose one.' };
        }
        
        // If date range specified, both dates must be present
        if (requestBody.startDate && !requestBody.endDate) {
            return { valid: false, error: 'endDate is required when startDate is specified' };
        }
        
        if (requestBody.endDate && !requestBody.startDate) {
            return { valid: false, error: 'startDate is required when endDate is specified' };
        }
        
        return { valid: true };
    }
    
    /**
     * Get GL account information by number or name
     */
    function getGLAccountInfo(glNumber, glName) {
        try {
            log.audit('getGLAccountInfo', 'Searching for glNumber: ' + glNumber + ', glName: ' + glName);
            
            // Build filters based on what's provided
            let filters = [];
            
            if (glNumber) {
                // Search by account number (exact match)
                // Per NetSuite Records Browser: filter field is 'number' (text)
                filters = [
                    ['number', 'is', glNumber],
                    'AND',
                    ['isinactive', 'is', 'F']
                ];
            } else if (glName) {
                // Search by name (contains match)
                // Per NetSuite Records Browser: filter field is 'acctname' (select)
                filters = [
                    ['acctname', 'contains', glName],
                    'AND',
                    ['isinactive', 'is', 'F']
                ];
            } else {
                return null;
            }
            
            const accountSearch = search.create({
                type: search.Type.ACCOUNT,
                filters: filters,
                columns: [
                    'internalid',
                    'number',        // Per NetSuite Records Browser: column field
                    'acctname',      // Per NetSuite Records Browser: column field (not 'name')
                    'type',
                    'isinactive'
                ]
            });
            
            let result = accountSearch.run().getRange({ start: 0, end: 1 })[0];
            
            if (!result) {
                log.audit('getGLAccountInfo', 'No account found with provided filters');
                
                // Diagnostic: Try searching without inactive filter to see if account exists but is inactive
                if (glNumber) {
                    const diagnosticSearch = search.create({
                        type: search.Type.ACCOUNT,
                        filters: [['number', 'is', glNumber]],
                        columns: ['internalid', 'number', 'acctname', 'isinactive']
                    });
                    const diagResult = diagnosticSearch.run().getRange({ start: 0, end: 1 })[0];
                    if (diagResult) {
                        log.audit('getGLAccountInfo', 'Account EXISTS but isinactive = ' + diagResult.getValue('isinactive'));
                    } else {
                        log.audit('getGLAccountInfo', 'Account with number ' + glNumber + ' does not exist in the system');
                    }
                }
                return null;
            }
            
            // Log what we found
            log.audit('getGLAccountInfo', 'Found account: ' + JSON.stringify({
                id: result.getValue('internalid'),
                number: result.getValue('number'),
                name: result.getValue('acctname'),
                inactive: result.getValue('isinactive')
            }));
            
            const accountNumber = result.getValue('number');
            const accountName = result.getValue('acctname');
            const accountType = result.getText('type');
            
            return {
                id: result.getValue('internalid'),
                number: accountNumber,
                name: accountName,
                type: accountType,
                fullName: accountNumber + ' ' + accountName
            };
            
        } catch (error) {
            log.error('Get GL Account Error', error.toString());
            return null;
        }
    }
    
    /**
     * Get period information
     */
    function getPeriodInfo(periodName) {
        try {
            const periodSearch = search.create({
                type: search.Type.ACCOUNTING_PERIOD,
                filters: [
                    ['periodname', 'is', periodName]
                ],
                columns: [
                    'internalid',
                    'periodname',
                    'startdate',
                    'enddate'
                ]
            });
            
            const result = periodSearch.run().getRange({ start: 0, end: 1 })[0];
            
            if (!result) {
                return null;
            }
            
            return {
                id: result.getValue('internalid'),
                name: result.getValue('periodname'),
                startDate: result.getValue('startdate'),
                endDate: result.getValue('enddate')
            };
            
        } catch (error) {
            log.error('Get Period Error', error.toString());
            return null;
        }
    }
    
    /**
     * Comprehensive GL account analysis
     */
    function analyzeGLAccount(glAccount, dateRangeInfo, subsidiaryId, includeDetails, topLimit) {
        const accountId = glAccount.id;
        
        // Initialize result structure
        const analysis = {
            summary: {
                totalDebit: 0,
                totalCredit: 0,
                netAmount: 0,
                transactionCount: 0
            },
            transactionTypes: {},
            currencyBreakdown: {},
            debitCreditAnalysis: {
                debitCount: 0,
                creditCount: 0,
                debitAmount: 0,
                creditAmount: 0
            },
            topTransactions: [],
            transactionDetails: []
        };
        
        // Build transaction search filters
        const filters = [
            ['account', 'anyof', accountId],
            'AND',
            ['posting', 'is', 'T']
        ];
        
        // Add date/period filters based on mode
        if (dateRangeInfo.mode === 'period') {
            // Use period filter
            filters.push('AND', ['postingperiod', 'anyof', dateRangeInfo.periodId]);
        } else {
            // Use date range filters with > and < operators
            if (dateRangeInfo.startDate) {
                filters.push('AND', ['trandate', 'onorafter', dateRangeInfo.startDate]);
            }
            if (dateRangeInfo.endDate) {
                filters.push('AND', ['trandate', 'onorbefore', dateRangeInfo.endDate]);
            }
        }
        
        // Add subsidiary filter if provided
        if (subsidiaryId) {
            filters.push('AND', ['subsidiary', 'anyof', subsidiaryId]);
        }
        
        const transactionSearch = search.create({
            type: search.Type.TRANSACTION,
            filters: filters,
            columns: [
                'internalid',
                'tranid',
                'type',
                'trandate',
                'entity',
                'subsidiary',
                'currency',
                'memo',
                'amount',
                'debitamount',
                'creditamount',
                search.createColumn({
                    name: 'formulanumeric',
                    formula: 'NVL({creditamount},0) - NVL({debitamount},0)',
                    label: 'netAmount'
                }),
                'line',
                'item',
                'department',
                'class',
                'location'
            ]
        });
        
        // Process all transactions
        const allTransactions = [];
        
        transactionSearch.run().each(function(result) {
            const tranType = result.getText('type') || result.getValue('type');
            const tranTypeId = result.getValue('type');
            const debitAmount = parseFloat(result.getValue('debitamount') || '0');
            const creditAmount = parseFloat(result.getValue('creditamount') || '0');
            const netAmount = parseFloat(result.getValue({ name: 'formulanumeric' }) || '0');
            const currency = result.getText('currency') || 'USD';
            const subsidiaryName = result.getText('subsidiary') || '';
            
            // Update summary
            analysis.summary.totalDebit += debitAmount;
            analysis.summary.totalCredit += creditAmount;
            analysis.summary.netAmount += netAmount;
            analysis.summary.transactionCount++;
            
            // Update debit/credit analysis
            if (debitAmount > 0) {
                analysis.debitCreditAnalysis.debitCount++;
                analysis.debitCreditAnalysis.debitAmount += debitAmount;
            }
            if (creditAmount > 0) {
                analysis.debitCreditAnalysis.creditCount++;
                analysis.debitCreditAnalysis.creditAmount += creditAmount;
            }
            
            // Update transaction type breakdown
            if (!analysis.transactionTypes[tranType]) {
                analysis.transactionTypes[tranType] = {
                    type: tranType,
                    typeId: tranTypeId,
                    count: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    netAmount: 0,
                    transactions: []
                };
            }
            
            analysis.transactionTypes[tranType].count++;
            analysis.transactionTypes[tranType].totalDebit += debitAmount;
            analysis.transactionTypes[tranType].totalCredit += creditAmount;
            analysis.transactionTypes[tranType].netAmount += netAmount;
            
            // Update currency breakdown
            if (!analysis.currencyBreakdown[currency]) {
                analysis.currencyBreakdown[currency] = {
                    currency: currency,
                    count: 0,
                    totalDebit: 0,
                    totalCredit: 0,
                    netAmount: 0
                };
            }
            
            analysis.currencyBreakdown[currency].count++;
            analysis.currencyBreakdown[currency].totalDebit += debitAmount;
            analysis.currencyBreakdown[currency].totalCredit += creditAmount;
            analysis.currencyBreakdown[currency].netAmount += netAmount;
            
            // Store transaction details
            const transactionDetail = {
                internalId: result.getValue('internalid'),
                tranId: result.getValue('tranid'),
                type: tranType,
                typeId: tranTypeId,
                date: result.getValue('trandate'),
                entity: result.getText('entity') || '',
                subsidiary: subsidiaryName,
                currency: currency,
                memo: result.getValue('memo') || '',
                debitAmount: debitAmount,
                creditAmount: creditAmount,
                netAmount: netAmount,
                line: result.getValue('line'),
                item: result.getText('item') || '',
                department: result.getText('department') || '',
                class: result.getText('class') || '',
                location: result.getText('location') || ''
            };
            
            allTransactions.push(transactionDetail);
            
            if (includeDetails) {
                analysis.transactionTypes[tranType].transactions.push({
                    tranId: result.getValue('tranid'),
                    internalId: result.getValue('internalid'),
                    date: result.getValue('trandate'),
                    entity: result.getText('entity') || '',
                    netAmount: netAmount
                });
            }
            
            return true; // Continue iteration
        });
        
        // Sort and get top transactions by absolute net amount
        allTransactions.sort((a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount));
        analysis.topTransactions = allTransactions.slice(0, topLimit);
        
        if (includeDetails) {
            analysis.transactionDetails = allTransactions;
        }
        
        // Convert objects to arrays for easier consumption
        analysis.transactionTypes = Object.values(analysis.transactionTypes);
        analysis.currencyBreakdown = Object.values(analysis.currencyBreakdown);
        
        // Sort transaction types by count (descending)
        analysis.transactionTypes.sort((a, b) => b.count - a.count);
        
        return analysis;
    }
    
    /**
     * Create error response
     */
    function createErrorResponse(errorMessage) {
        return {
            success: false,
            error: errorMessage,
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * GET handler - Return usage information
     */
    function get(requestParams) {
        return {
            name: 'GL Account Analysis RESTlet',
            version: '3.0',
            description: 'Comprehensive GL account analysis with uniform filter format (same as multi-purpose-restlet3)',
            usage: {
                method: 'POST',
                endpoint: '[Your RESTlet URL]',
                requestBody: {
                    filters: 'Array of filter objects with uniform format: [{ field, operator, value }]',
                    includeDetails: 'Include transaction details (optional, default: true)',
                    topTransactionsLimit: 'Number of top transactions (optional, default: 10)'
                },
                supportedOperators: Array.from(SUPPORTED_OPERATORS),
                operatorSymbols: Object.keys(OP_SYMBOL_MAP),
                filterFields: {
                    glNumber: 'GL account number (exact match)',
                    glName: 'GL account name (supports contains/equals)',
                    period: 'Accounting period name (e.g., "Apr 2025")',
                    trandate: 'Transaction date (for date ranges)',
                    subsidiary: 'Subsidiary ID'
                },
                examples: {
                    byNumberAndPeriod: {
                        description: 'Search by GL number with specific period',
                        request: {
                            filters: [
                                { field: 'glNumber', operator: '=', value: '315400' },
                                { field: 'period', operator: '=', value: 'Apr 2025' },
                                { field: 'subsidiary', operator: '=', value: '2' }
                            ],
                            includeDetails: true,
                            topTransactionsLimit: 10
                        }
                    },
                    byNameAndPeriod: {
                        description: 'Search by GL name with specific period',
                        request: {
                            filters: [
                                { field: 'glName', operator: 'contains', value: 'Other Income' },
                                { field: 'period', operator: '=', value: 'Jul 2025' }
                            ],
                            includeDetails: true
                        }
                    },
                    byNumberAndDateRange: {
                        description: 'Search by GL number with custom date range',
                        request: {
                            filters: [
                                { field: 'glNumber', operator: '=', value: '315700' },
                                { field: 'trandate', operator: '>=', value: '2025-04-01' },
                                { field: 'trandate', operator: '<=', value: '2025-06-30' }
                            ],
                            includeDetails: true
                        }
                    },
                    byNameAndDateRange: {
                        description: 'Search by GL name with custom date range (Q1 2025)',
                        request: {
                            filters: [
                                { field: 'glName', operator: 'contains', value: 'Subscription Revenue' },
                                { field: 'trandate', operator: '>=', value: '2025-01-01' },
                                { field: 'trandate', operator: '<=', value: '2025-03-31' }
                            ],
                            topTransactionsLimit: 20
                        }
                    },
                    quickSummaryOnly: {
                        description: 'Get summary without detailed transaction list',
                        request: {
                            filters: [
                                { field: 'glNumber', operator: '=', value: '550415' },
                                { field: 'period', operator: '=', value: 'Apr 2025' }
                            ],
                            includeDetails: false
                        }
                    },
                    multiMonthRange: {
                        description: 'Analyze multiple months with date range',
                        request: {
                            filters: [
                                { field: 'glNumber', operator: '=', value: '315300' },
                                { field: 'trandate', operator: '>=', value: '2024-01-01' },
                                { field: 'trandate', operator: '<=', value: '2024-12-31' }
                            ],
                            includeDetails: true
                        }
                    }
                }
            },
            response: {
                success: 'Boolean - true if successful',
                timestamp: 'ISO timestamp of the request',
                request: 'Echo of the request parameters used',
                glAccount: 'GL account details (id, number, name, type, fullName)',
                dateRange: 'Date range used (mode, periodId, periodName, startDate, endDate)',
                summary: 'Overall summary (totalDebit, totalCredit, netAmount, transactionCount)',
                transactionTypes: 'Array of transaction type breakdowns (Invoice, Credit Memo, Journal, etc.)',
                currencyBreakdown: 'Array of currency breakdowns (multi-currency support)',
                debitCreditAnalysis: 'Debit/credit statistics (counts and amounts)',
                topTransactions: 'Top N transactions by absolute amount (if includeDetails = true)',
                transactionDetails: 'All transaction details (if includeDetails = true)'
            },
            dateFormats: {
                supported: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY'],
                examples: ['2025-04-01', '01-04-2025', '04/01/2025']
            },
            notes: {
                format: 'Uses uniform filter format matching multi-purpose-restlet3',
                operators: 'Supports symbolic operators (=, !=, >, <, >=, <=) and named operators',
                compatibility: 'Maintains GL-specific analysis features while adopting flexible filter syntax'
            }
        };
    }
    
    return {
        get: get,
        post: post
    };
});

