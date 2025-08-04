/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * 
 * Multi-Purpose NetSuite RESTlet - Professional Edition
 * 
 * This RESTlet provides a unified API for querying any NetSuite record type
 * with dynamic filtering, field selection, and pagination capabilities.
 * 
 * @fileoverview Universal Dynamic NetSuite Restlet - Query Any Record Type
 * @author NetSuite RESTlet Team
 * @version 2.0.0
 * 
 * @description
 * SUPPORTED NETSUITE RECORD CATEGORIES:
 * 
 * === TRANSACTIONS ===
 * All transactions stored in 'transaction' table with different types:
 * - transaction (filter by 'type' field for specific transaction types)
 *   Common Types: 'SalesOrd', 'CustInvc', 'CashSale', 'Estimate', 'CustPymt', 'CustDep', 'CustCred', 'CustRfnd'
 *                 'PurchOrd', 'VendBill', 'VendPymt', 'VendCred', 'Check', 'Journal', 'Deposit', 'ExpRept'
 *                 'ItemShip', 'ItemRcpt', 'InvAdjst', 'InvTrnfr', 'Build', 'Unbuild', 'WorkOrd', 'Opprtnty'
 * - revenueplan (Revenue Plans) - Uses detailed hardcoded configuration
 * - revenuerecognitionschedule (Revenue Recognition Schedules)
 * 
 * === ENTITIES ===
 * - customer, vendor, employee, contact, partner, job, entitygroup, competitor, lead, prospect
 * 
 * === ITEMS ===
 * - item, inventoryitem, noninventoryitem, serviceitem, assemblyitem, kititem, downloaditem,
 *   giftcertificateitem, discountitem, markupitem, paymentitem, subtotalitem, expenseitem,
 *   descriptionitem, otherchargeitem
 * 
 * === LISTS & SETUP ===
 * - account, accountingperiod, bin, location, department, classification, currency,
 *   subsidiary, customlist, budgets, campaign, file, folder
 * 
 * === ACTIVITIES ===
 * - calendarevent, task, phonecall, message, note
 * 
 * === SUPPORT & CRM ===
 * - supportcase, issue, solution, topic, campaignresponse
 * 
 * === CUSTOM RECORDS ===
 * - customrecord_[id] (Custom Records - replace [id] with actual custom record ID)
 */

define(['N/query', 'N/format', 'N/log'], function (query, format, log) {

    /**
     * Revenue Plan Configuration
     * Hardcoded configuration for revenue plan queries with enhanced features
     */
    const REVENUE_PLAN_CONFIG = {
        mainTable: 'revenueplan',
        alias: 'rp',
        fields: [
            'rp.id AS internalid',
            'rp.recordnumber AS recordnumber',
            'rp.createdfrom',
            'rp.revrecstartdate',
            'rp.revrecenddate',
            'rp.revenueplancurrency',
            'rp.amount',
            'rp.exchangerate',
            'rp.revenueplantype',
            'rp.lastmodifieddate AS lastmodifieddate',
            'CASE WHEN rp.revenueplantype = \'ACTUAL\' THEN \'Actual\' ELSE \'Planned\' END AS plan_category',
            'pr.plannedperiod AS plannedperiod_id',
            'pp.periodname AS plannedperiod_name',
            'pr.postingperiod AS postingperiod_id',
            'postp.periodname AS postingperiod_name',
            'pr.amount AS planned_amount',
            'pr.deferredrevenueaccount',
            'pr.recognitionaccount',
            'pr.journal',
            'pr.dateexecuted',
            'pr.isrecognized',
            'pr.periodcomments'
        ],
        joins: [
            'LEFT JOIN revenueplanplannedrevenue AS pr ON pr.revenueplan = rp.id',
            'LEFT JOIN accountingperiod AS pp ON pr.plannedperiod = pp.id',
            'LEFT JOIN accountingperiod AS postp ON pr.postingperiod = postp.id'
        ],
        enableStats: true,
        statsConfig: {
            amountField: 'planned_amount',
            recognizedField: 'isrecognized'
        }
    };

    /**
     * Record type categories for intelligent query optimization
     */
    const RECORD_CATEGORIES = {
        TRANSACTION: ['transaction', 'revenueplan', 'revenuerecognitionschedule'],
        ENTITY: ['customer', 'vendor', 'employee', 'contact', 'partner', 'job', 'entitygroup', 'competitor', 'lead', 'prospect'],
        ITEM: ['item', 'inventoryitem', 'noninventoryitem', 'serviceitem', 'assemblyitem', 'kititem', 'downloaditem', 
               'giftcertificateitem', 'discountitem', 'markupitem', 'paymentitem', 'subtotalitem', 'expenseitem', 
               'descriptionitem', 'otherchargeitem'],
        LIST: ['account', 'accountingperiod', 'bin', 'location', 'department', 'classification', 'currency', 
               'subsidiary', 'customlist', 'budgets', 'campaign', 'file', 'folder'],
        ACTIVITY: ['calendarevent', 'task', 'phonecall', 'message', 'note'],
        SUPPORT: ['supportcase', 'issue', 'solution', 'topic', 'campaignresponse']
    };

    /**
     * Transaction-specific configuration for SuiteQL joins
     */
    const TRANSACTION_CONFIG = {
        mainTable: 'transaction',
        alias: 'tra',
        fields: [
            'tra.id AS id',
            'tra.tranid AS tranid', 
            'tra.trandate AS trandate',
            'tra.type AS type',
            'tra.status AS status',
            'tra.entity AS entity',
            'tra.memo AS memo',
            'tra.datecreated AS createddate',
            'tra.lastmodifieddate AS lastmodifieddate',
            'tl.netamount AS amount',
            'tl.foreignamount AS foreignamount',
            'tl.rate AS rate',
            'tl.quantity AS quantity',
            'tl.location AS location',
            'tl.subsidiary AS subsidiary',
            'tl.department AS department',
            'tl.class AS class'
        ],
        joins: [
            'LEFT JOIN TransactionLine AS tl ON tl.transaction = tra.id AND tl.mainline = \'T\''
        ],
        enableStats: false
    };

    /**
     * Get record category for optimization
     * @param {string} recordType - Record type to categorize
     * @returns {string} Category name
     */
    function getRecordCategory(recordType) {
        if (!recordType) return 'UNKNOWN';
        
        const lowerType = recordType.toLowerCase();
        
        // Check for custom records
        if (lowerType.indexOf('customrecord_') === 0) {
            return 'CUSTOM';
        }
        
        // Find category
        for (const category in RECORD_CATEGORIES) {
            if (RECORD_CATEGORIES[category].indexOf(lowerType) !== -1) {
                return category;
            }
        }
        
        return 'UNKNOWN';
    }

    /**
     * Create dynamic configuration for any record type
     * @param {string} recordType - Record type to query
     * @param {Array} customFields - Custom fields to select
     * @returns {Object} Configuration object
     */
    function createDynamicConfig(recordType, customFields) {
        const lowerType = recordType.toLowerCase();
        
        // Special case: Revenue Plan uses hardcoded configuration
        if (lowerType === 'revenueplan') {
            return REVENUE_PLAN_CONFIG;
        }
        
        // Special case: Transaction requires joins to TransactionLine
        if (lowerType === 'transaction') {
            if (customFields && Array.isArray(customFields) && customFields.length > 0) {
                log.debug('Transaction Custom Fields Input', customFields);
                const mappedFields = customFields.map(function(field) {
                    // Handle amount field mapping
                    if (field === 'amount') {
                        return 'tl.netamount AS amount';
                    }
                    // Add proper alias prefix if not already present
                    if (field.indexOf('.') === -1 && field.indexOf('(') === -1 && field.indexOf(' AS ') === -1) {
                        // Check if it's a TransactionLine field
                        const transactionLineFields = ['netamount', 'foreignamount', 'rate', 'quantity', 'location', 'subsidiary', 'department', 'class'];
                        if (transactionLineFields.indexOf(field) !== -1) {
                            return 'tl.' + field;
                        } else if (field === 'createddate') {
                            return 'tra.datecreated AS createddate';
                        } else {
                            return 'tra.' + field;
                        }
                    }
                    return field;
                });
                
                return {
                    mainTable: 'transaction',
                    alias: 'tra',
                    fields: mappedFields,
                    joins: ['LEFT JOIN TransactionLine AS tl ON tl.transaction = tra.id AND tl.mainline = \'T\''],
                    enableStats: false
                };
            } else {
                // When no custom fields specified, use simple wildcard
                return {
                    mainTable: 'transaction',
                    alias: 'tra',
                    fields: ['tra.*'],
                    joins: [],
                    enableStats: false
                };
            }
        }
        
        // Create dynamic alias with conflict resolution
        let alias = lowerType.charAt(0);
        
        // Handle common conflicts by using 2-3 characters
        const commonConflicts = {
            'c': ['customer', 'contact', 'campaign', 'classification', 'currency', 'customlist', 'competitor', 'calendarevent', 'customrecord'],
            'i': ['item', 'inventoryitem', 'issue'],
            't': ['transaction', 'task', 'topic'],
            'a': ['account', 'accountingperiod', 'assemblyitem'],
            'e': ['employee', 'expenseitem', 'entitygroup'],
            's': ['serviceitem', 'subsidiary', 'supportcase', 'solution', 'subtotalitem'],
            'v': ['vendor', 'vendpymt', 'vendbill'],
            'p': ['partner', 'prospect', 'phonecall', 'paymentitem']
        };
        
        if (commonConflicts[alias] && commonConflicts[alias].length > 1) {
            // Use first 2-3 characters for common conflicts
            if (lowerType.length >= 3) {
                alias = lowerType.substring(0, 3);
            } else {
                alias = lowerType.substring(0, 2);
            }
        }
        
        const config = {
            mainTable: recordType,
            alias: alias,
            fields: [],
            joins: [],
            enableStats: false
        };
        
        // Determine fields to select
        if (customFields && Array.isArray(customFields) && customFields.length > 0) {
            // Use custom fields if provided
            config.fields = customFields.map(function(field) {
                // Add alias prefix if not already present
                if (field.indexOf('.') === -1 && field.indexOf('(') === -1) {
                    return alias + '.' + field;
                }
                return field;
            });
        } else {
            // Default: select all fields
            config.fields = [alias + '.*'];
        }
        
        return config;
    }

    /**
     * Enhanced statistics calculation for revenue plans
     * @param {Array} records - Records to process
     * @param {Object} statsConfig - Statistics configuration
     * @returns {Array} Enhanced records with statistics
     */
    function calculateRecognitionStats(records, statsConfig) {
        if (!statsConfig || !statsConfig.amountField) return records;
        
        const amountField = statsConfig.amountField;
        const recognizedField = statsConfig.recognizedField;
        
        const totalPlanAmount = records.reduce(function (sum, row) {
            return sum + parseFloat(row[amountField] || 0);
        }, 0);

        let cumulative = 0;

        return records.map(function (row) {
            const amount = parseFloat(row[amountField] || 0);
            const isRecognized = recognizedField ? String(row[recognizedField]) : false;

            const recognizedThisPeriod = isRecognized ? amount : 0;
            cumulative += recognizedThisPeriod;

            if (recognizedField) {
                row.percent_recognized_in_period = isRecognized
                    ? ((amount / totalPlanAmount) * 100).toFixed(4) + '%'
                    : '0.0000%';

                row.percent_total_recognized = ((cumulative / totalPlanAmount) * 100).toFixed(4) + '%';
                row.total_recognized = cumulative.toFixed(2);
            }

            return row;
        });
    }

    /**
     * Helper function to pad strings (NetSuite compatible)
     * @param {string} str - String to pad
     * @param {number} length - Target length
     * @param {string} padChar - Character to pad with
     * @returns {string} Padded string
     */
    function padString(str, length, padChar) {
        str = String(str);
        while (str.length < length) {
            str = padChar + str;
        }
        return str;
    }

    /**
     * Helper function to get field with proper alias based on record type
     * @param {string} fieldName - Field name
     * @param {string} alias - Table alias
     * @param {string} mainTable - Main table name
     * @returns {string} Field with proper alias
     */
    function getFieldWithAlias(fieldName, alias, mainTable) {
        // Special handling for transaction table with TransactionLine joins
        if (mainTable.toLowerCase() === 'transaction') {
            // Fields that are in TransactionLine (mainline) - validated fields only
            const transactionLineFields = ['amount', 'netamount', 'foreignamount', 'rate', 'quantity', 'location', 'subsidiary', 'department', 'class'];
            
            // Map 'amount' to 'netamount' in TransactionLine
            if (fieldName === 'amount') {
                return 'tl.netamount';
            }
            
            // Check if field belongs to TransactionLine
            if (transactionLineFields.indexOf(fieldName) !== -1) {
                return 'tl.' + fieldName;
            }
            
            // Map transaction table fields with correct names
            if (fieldName === 'createddate') {
                return alias + '.datecreated';
            }
            
            // Default to main transaction table
            return alias + '.' + fieldName;
        }
        
        // Default behavior for other record types
        return alias + '.' + fieldName;
    }

    /**
     * Enhanced date formatting with multiple format support
     * @param {string} dateStr - Date string to format
     * @returns {string} Formatted date string
     */
    function formatDateString(dateStr) {
        if (!dateStr) return null;
        try {
            let parts;
            
            // Check for DD-MM-YYYY format
            if (dateStr.indexOf('-') !== -1 && dateStr.split('-').length === 3) {
                parts = dateStr.split('-');
                if (parts[0].length === 4) {
                    return dateStr; // Already in YYYY-MM-DD format
                } else if (parts[2].length === 4) {
                    return parts[2] + '-' + parts[1] + '-' + parts[0];
                }
            }
            
            // Check for MM/DD/YYYY format
            if (dateStr.indexOf('/') !== -1 && dateStr.split('/').length === 3) {
                parts = dateStr.split('/');
                if (parts[2].length === 4) {
                    const month = padString(parts[0], 2, '0');
                    const day = padString(parts[1], 2, '0');
                    return parts[2] + '-' + month + '-' + day;
                }
            }
            
            // Return as-is if no pattern matches
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Enhanced dynamic SQL builder with intelligent filtering
     * @param {Object} config - Configuration object
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Additional options
     * @returns {Object} SQL query and parameters
     */
    function buildDynamicSQL(config, filters, options) {
        options = options || {};
        const mainTable = config.mainTable;
        const alias = config.alias;
        const fields = config.fields || [alias + '.*'];
        const joins = config.joins || [];

        // Build SELECT clause
        let sql = 'SELECT ' + fields.join(', ');
        
        // Build FROM clause
        sql += ' FROM ' + mainTable + ' AS ' + alias;
        
        // Add JOINs
        if (joins.length > 0) {
            sql += ' ' + joins.join(' ');
        }

        // Build WHERE clause
        const whereClauses = [];
        let params = [];

        // Process filters dynamically
        if (filters && typeof filters === 'object' && Object.keys(filters).length > 0) {
            Object.keys(filters).forEach(function(key) {
                const value = filters[key];
                
                // Skip if value is null, undefined, or empty string
                if (value === null || value === undefined || value === '') {
                    return;
                }

                // Handle date range filters
                if (key.slice(-10) === '_startdate' && filters[key.replace('_startdate', '_enddate')]) {
                    const baseField = key.replace('_startdate', '');
                    const baseFieldWithAlias = getFieldWithAlias(baseField, alias, mainTable);
                    const startDate = formatDateString(value);
                    const endDate = formatDateString(filters[key.replace('_startdate', '_enddate')]);
                    
                    whereClauses.push(
                        '(' + baseFieldWithAlias + ' >= TO_DATE(?, \'YYYY-MM-DD\') AND ' +
                        baseFieldWithAlias + ' <= TO_DATE(?, \'YYYY-MM-DD\'))'
                    );
                    params.push(startDate);
                    params.push(endDate);
                } else if (key.slice(-8) === '_enddate') {
                    // Skip enddate as it's handled with startdate
                    return;
                } else if (key === 'startdate' && filters.enddate) {
                    // Legacy date range support for revenue plans
                    const fStart = formatDateString(value);
                    const fEnd = formatDateString(filters.enddate);
                    whereClauses.push(
                        '(' + alias + '.revrecstartdate >= TO_DATE(?, \'YYYY-MM-DD\') AND ' +
                        alias + '.revrecstartdate <= TO_DATE(?, \'YYYY-MM-DD\'))'
                    );
                    params.push(fStart);
                    params.push(fEnd);
                } else if (key === 'enddate') {
                    // Skip if startdate exists
                    if (!filters.startdate) {
                        const fEndOnly = formatDateString(value);
                        whereClauses.push(alias + '.revrecstartdate <= TO_DATE(?, \'YYYY-MM-DD\')');
                        params.push(fEndOnly);
                    }
                } else if (key === 'plantype') {
                    // Special handling for plantype
                    whereClauses.push(alias + '.revenueplantype = ?');
                    params.push(value.toString().toUpperCase());
                } else if (Array.isArray(value)) {
                    // Handle IN clauses
                    if (value.length > 0) {
                        const fieldWithAlias = getFieldWithAlias(key, alias, mainTable);
                        const placeholders = value.map(function() { return '?'; }).join(',');
                        whereClauses.push(fieldWithAlias + ' IN (' + placeholders + ')');
                        params = params.concat(value);
                    }
                } else if (typeof value === 'object' && value.operator) {
                    // Handle custom operators
                    const operator = value.operator.toUpperCase();
                    const fieldWithAlias = getFieldWithAlias(key, alias, mainTable);
                    
                    // Operators that don't need values (NULL operators)
                    const nullOperators = ['IS NULL', 'IS NOT NULL'];
                    if (nullOperators.indexOf(operator) !== -1) {
                        whereClauses.push(fieldWithAlias + ' ' + operator);
                        // No parameter needed for NULL operators
                    } else if (value.value !== undefined) {
                        // Operators that need values
                        const validOperators = ['=', '!=', '<>', '>', '<', '>=', '<=', 'LIKE', 'NOT LIKE'];
                        if (validOperators.indexOf(operator) !== -1) {
                            whereClauses.push(fieldWithAlias + ' ' + operator + ' ?');
                            params.push(value.value);
                        }
                    }
                } else if (typeof value === 'boolean') {
                    // Handle boolean values
                    const fieldWithAlias = getFieldWithAlias(key, alias, mainTable);
                    whereClauses.push(fieldWithAlias + ' = ?');
                    params.push(value ? 'T' : 'F');
                } else {
                    // Simple equality
                    const fieldWithAlias = getFieldWithAlias(key, alias, mainTable);
                    whereClauses.push(fieldWithAlias + ' = ?');
                    params.push(value);
                }
            });
        }

        // Add WHERE clause if conditions exist
        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Add ORDER BY for consistency
        if (sql.toLowerCase().indexOf('order by') === -1) {
            sql += ' ORDER BY ' + alias + '.id';
        }

        return { sql: sql, params: params };
    }

    /**
     * Enhanced query execution with error handling
     * @param {Object} config - Configuration object
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Query options
     * @returns {Object} Query results
     */
    function executeQuery(config, filters, options) {
        options = options || {};
        const pageSize = options.pageSize || 5000;
        const pageIndex = options.pageIndex || 0;
        const usePagination = options.usePagination || false;
        const debug = options.debug || false;

        try {
            const sqlResult = buildDynamicSQL(config, filters, options);
            
            if (debug) {
                log.debug('Generated SQL', sqlResult.sql);
                log.debug('Parameters', sqlResult.params);
            }
            
            // Execute query with pagination
            const pagedData = query.runSuiteQLPaged({
                query: sqlResult.sql,
                params: sqlResult.params,
                pageSize: Math.min(pageSize, 5000) // NetSuite max
            });

            // Fetch results with proper pagination
            let results = [];
            let totalRecords = 0;
            
            if (pagedData.pageRanges && pagedData.pageRanges.length > 0) {
                if (usePagination) {
                    // Use NetSuite's built-in pagination efficiently
                    if (pageIndex < pagedData.pageRanges.length) {
                        const targetPage = pagedData.fetch({ index: pageIndex });
                        results = targetPage.data.asMappedResults();
                    }
                    // Get total record count from all pages
                    totalRecords = pagedData.pageRanges.reduce(function(total, pageRange) {
                        return total + pageRange.size;
                    }, 0);
                } else {
                    // Fetch all results when pagination is not requested
                    pagedData.pageRanges.forEach(function (pageRange) {
                        const onePage = pagedData.fetch({ index: pageRange.index });
                        const mappedResults = onePage.data.asMappedResults();
                        results = results.concat(mappedResults);
                    });
                    totalRecords = results.length;
                }
            }

            // Apply statistics calculation if enabled
            if (config.enableStats && config.statsConfig) {
                results = calculateRecognitionStats(results, config.statsConfig);
            }

            // Build response
            const response = {
                success: true,
                data: results,
                recordCount: results.length,
                recordType: config.mainTable
            };

            if (usePagination) {
                const totalPages = Math.ceil(totalRecords / pageSize);
                response.pagination = {
                    pageSize: pageSize,
                    pageIndex: pageIndex,
                    totalRecords: totalRecords,
                    totalPages: totalPages,
                    hasMore: (pageIndex + 1) * pageSize < totalRecords
                };
            }

            if (debug) {
                response.debug = {
                    sql: sqlResult.sql,
                    params: sqlResult.params,
                    config: config,
                    recordCategory: getRecordCategory(config.mainTable),
                    executionInfo: {
                        pageSize: pageSize,
                        pageIndex: pageIndex,
                        totalRecords: totalRecords,
                        returnedRecords: results.length,
                        usePagination: usePagination
                    }
                };
            }

            return response;

        } catch (e) {
            return {
                success: false,
                error: 'Query execution failed: ' + (e.message || e.toString()),
                recordType: config.mainTable,
                debug: debug ? {
                    config: config,
                    filters: filters,
                    options: options,
                    errorDetails: e
                } : undefined
            };
        }
    }

    /**
     * GET handler (backward compatibility)
     * @param {Object} context - Request context
     * @returns {Object} Response data
     */
    function getHandler(context) {
        try {
            // Return revenue plan data for backward compatibility
            return executeQuery(REVENUE_PLAN_CONFIG, {}, {});
        } catch (e) {
            return { 
                success: false, 
                error: 'GET request failed: ' + (e.message || 'Unknown error') 
            };
        }
    }

    /**
     * Enhanced POST handler with comprehensive dynamic support
     * @param {Object} context - Request context
     * @returns {Object} Response data
     */
    function postHandler(context) {
        try {
            // Parse JSON body
            if (!context || (typeof context === "string" && context.trim() === "")) {
                context = {};
            } else if (typeof context === "string") {
                try {
                    context = JSON.parse(context);
                } catch (err) {
                    context = {};
                }
            }

            // Extract parameters
            const recordType = context.recordType || 'revenueplan'; // Default for backward compatibility
            const filters = context.filters || {};
            const customFields = context.fields || null;
            const options = {
                pageSize: context.pageSize || 5000,
                pageIndex: context.pageIndex || 0,
                usePagination: context.usePagination || false,
                debug: context.debug || false
            };

            // Handle legacy mode (extract filters from context root)
            if (!context.recordType && !context.filters) {
                const legacyKeys = ['id', 'recordnumber', 'createdfrom', 'startdate', 'enddate', 
                                'lastmodifieddate_startdate', 'lastmodifieddate_enddate', 'plantype'];
                
                legacyKeys.forEach(function(key) {
                    if (context[key] !== undefined && context[key] !== null && context[key] !== '') {
                        filters[key] = context[key];
                    }
                });
            }

            // Create configuration
            let config;
            if (context.config) {
                // Custom configuration provided
                config = context.config;
            } else {
                // Generate dynamic configuration
                config = createDynamicConfig(recordType, customFields);
            }

            // Execute query
            const result = executeQuery(config, filters, options);

            // Add metadata
            result.recordCategory = getRecordCategory(recordType);
            result.timestamp = new Date().toISOString();
            result.version = '2.0.0';

            return result;

        } catch (e) {
            return {
                success: false,
                error: 'Request processing failed: ' + (e.message || 'Unknown error'),
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                debug: (context && context.debug) ? {
                    context: context,
                    errorDetails: e
                } : undefined
            };
        }
    }

    // Return public interface
    return {
        get: getHandler,
        post: postHandler
    };
}); 