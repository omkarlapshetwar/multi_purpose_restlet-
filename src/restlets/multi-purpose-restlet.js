/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 * 
 * IMPROVED GENERIC NETSUITE RESTLET
 * 
 * NEW GENERIC FILTER STRUCTURE:
 * {
 *   "recordType": "customer",
 *   "filters": [
 *     {
 *       "field_name": "isinactive",
 *       "operator": "equals",
 *       "value": "F"
 *     },
 *     {
 *       "field_name": "datecreated", 
 *       "operator": "date_range",
 *       "startdate": "01-01-2024",
 *       "enddate": "31-12-2024"
 *     }
 *   ],
 *   "fields": ["id", "entityid", "companyname"],
 *   "pageSize": 10
 * }
 * 
 * SUPPORTED OPERATORS:
 * - Comparison: equals, not_equals, greater_than, less_than, greater_than_or_equal, less_than_or_equal
 * - String: contains, starts_with, ends_with, not_contains  
 * - Array: in, not_in
 * - NULL: is_null, is_not_null
 * - Date: date_range, date_equals, date_before, date_after
 * - Boolean: is_true, is_false
 */
define(['N/query', 'N/format', 'N/log'], function (query, format, log) {

    // Standardized operator mapping
    const OPERATORS = {
        // Comparison operators
        equals: '=',
        not_equals: '!=',
        greater_than: '>',
        less_than: '<',
        greater_than_or_equal: '>=',
        less_than_or_equal: '<=',
        
        // String operators
        contains: 'LIKE',
        starts_with: 'LIKE',
        ends_with: 'LIKE',
        not_contains: 'NOT LIKE',
        
        // Array operators
        in: 'IN',
        not_in: 'NOT IN',
        
        // NULL operators
        is_null: 'IS NULL',
        is_not_null: 'IS NOT NULL',
        
        // Date operators
        date_equals: '=',
        date_before: '<',
        date_after: '>',
        
        // Boolean operators
        is_true: '=',
        is_false: '='
    };

    // Record type to base table mapping
    const RECORD_TABLE_MAPPING = {
        // Transactions (base table)
        transaction: 'transaction',
        
        // Entities (base tables)
        customer: 'customer',
        vendor: 'vendor', 
        employee: 'employee',
        contact: 'contact',
        partner: 'partner',
        job: 'job',
        entitygroup: 'entitygroup',
        competitor: 'competitor',
        lead: 'lead',
        prospect: 'prospect',
        
        // Items (base tables)
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
        
        // Lists & Setup (base tables)
        account: 'account',
        accountingperiod: 'accountingperiod',
        bin: 'bin',
        location: 'location',
        department: 'department',
        classification: 'classification',
        currency: 'currency',
        subsidiary: 'subsidiary',
        customlist: 'customlist',
        budgets: 'budgets',
        campaign: 'campaign',
        file: 'file',
        folder: 'folder',
        
        // Activities (base tables)
        calendarevent: 'calendarevent',
        task: 'task',
        phonecall: 'phonecall',
        message: 'message',
        note: 'note',
        
        // Support & CRM (base tables)
        supportcase: 'supportcase',
        issue: 'issue',
        solution: 'solution',
        topic: 'topic',
        campaignresponse: 'campaignresponse'
    };

    /**
     * Get base table name for record type
     */
    function getBaseTable(recordType) {
        const lowerType = recordType.toLowerCase();
        return RECORD_TABLE_MAPPING[lowerType] || recordType;
    }

    /**
     * Generate table alias for record type
     */
    function generateAlias(recordType) {
        const lowerType = recordType.toLowerCase();
        
        // Handle common conflicts
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
        
        let alias = lowerType.charAt(0);
        
        if (commonConflicts[alias] && commonConflicts[alias].length > 1) {
            if (lowerType.length >= 3) {
                alias = lowerType.substring(0, 3);
            } else {
                alias = lowerType.substring(0, 2);
            }
        }
        
        return alias;
    }

    /**
     * Process generic filter to SQL condition
     */
    function processFilter(filter, alias) {
        const fieldName = filter.field_name;
        const operator = filter.operator;
        const value = filter.value;
        const startdate = filter.startdate;
        const enddate = filter.enddate;
        const values = filter.values;
        
        const fieldWithAlias = alias + '.' + fieldName;
        
        // Handle different operator types
        switch (operator) {
            case 'equals':
                return {
                    condition: fieldWithAlias + ' = ?',
                    params: [value]
                };
                
            case 'not_equals':
                return {
                    condition: fieldWithAlias + ' != ?',
                    params: [value]
                };
                
            case 'greater_than':
                return {
                    condition: fieldWithAlias + ' > ?',
                    params: [value]
                };
                
            case 'less_than':
                return {
                    condition: fieldWithAlias + ' < ?',
                    params: [value]
                };
                
            case 'greater_than_or_equal':
                return {
                    condition: fieldWithAlias + ' >= ?',
                    params: [value]
                };
                
            case 'less_than_or_equal':
                return {
                    condition: fieldWithAlias + ' <= ?',
                    params: [value]
                };
                
            case 'contains':
                return {
                    condition: fieldWithAlias + ' LIKE ?',
                    params: ['%' + value + '%']
                };
                
            case 'starts_with':
                return {
                    condition: fieldWithAlias + ' LIKE ?',
                    params: [value + '%']
                };
                
            case 'ends_with':
                return {
                    condition: fieldWithAlias + ' LIKE ?',
                    params: ['%' + value]
                };
                
            case 'not_contains':
                return {
                    condition: fieldWithAlias + ' NOT LIKE ?',
                    params: ['%' + value + '%']
                };
                
            case 'in':
                if (values && Array.isArray(values) && values.length > 0) {
                    const placeholders = values.map(() => '?').join(',');
                    return {
                        condition: fieldWithAlias + ' IN (' + placeholders + ')',
                        params: values
                    };
                }
                break;
                
            case 'not_in':
                if (values && Array.isArray(values) && values.length > 0) {
                    const placeholders = values.map(() => '?').join(',');
                    return {
                        condition: fieldWithAlias + ' NOT IN (' + placeholders + ')',
                        params: values
                    };
                }
                break;
                
            case 'is_null':
                return {
                    condition: fieldWithAlias + ' IS NULL',
                    params: []
                };
                
            case 'is_not_null':
                return {
                    condition: fieldWithAlias + ' IS NOT NULL',
                    params: []
                };
                
            case 'date_range':
                if (startdate && enddate) {
                    return {
                        condition: fieldWithAlias + ' >= TO_DATE(?, \'YYYY-MM-DD\') AND ' + fieldWithAlias + ' <= TO_DATE(?, \'YYYY-MM-DD\')',
                        params: [formatDateString(startdate), formatDateString(enddate)]
                    };
                }
                break;
                
            case 'date_equals':
                return {
                    condition: fieldWithAlias + ' = TO_DATE(?, \'YYYY-MM-DD\')',
                    params: [formatDateString(value)]
                };
                
            case 'date_before':
                return {
                    condition: fieldWithAlias + ' < TO_DATE(?, \'YYYY-MM-DD\')',
                    params: [formatDateString(value)]
                };
                
            case 'date_after':
                return {
                    condition: fieldWithAlias + ' > TO_DATE(?, \'YYYY-MM-DD\')',
                    params: [formatDateString(value)]
                };
                
            case 'is_true':
                return {
                    condition: fieldWithAlias + ' = ?',
                    params: ['T']
                };
                
            case 'is_false':
                return {
                    condition: fieldWithAlias + ' = ?',
                    params: ['F']
                };
                
            default:
                log.error('Unsupported operator', operator);
                return null;
        }
    }

    /**
     * Format date string for NetSuite
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
                    const month = parts[0].padStart(2, '0');
                    const day = parts[1].padStart(2, '0');
                    return parts[2] + '-' + month + '-' + day;
                }
            }
            
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    }

    /**
     * Build SQL query from generic filters
     */
    function buildSQL(recordType, filters, fields, options) {
        const baseTable = getBaseTable(recordType);
        const alias = generateAlias(recordType);
        
        // Build SELECT clause
        let selectFields;
        if (fields && Array.isArray(fields) && fields.length > 0) {
            selectFields = fields.map(field => {
                if (field.indexOf('.') === -1 && field.indexOf('(') === -1) {
                    return alias + '.' + field;
                }
                return field;
            });
        } else {
            selectFields = [alias + '.*'];
        }
        
        let sql = 'SELECT ' + selectFields.join(', ');
        sql += ' FROM ' + baseTable + ' AS ' + alias;
        
        // Build WHERE clause from filters
        const whereClauses = [];
        let params = [];
        
        if (filters && Array.isArray(filters) && filters.length > 0) {
            filters.forEach(filter => {
                const result = processFilter(filter, alias);
                if (result) {
                    whereClauses.push(result.condition);
                    params = params.concat(result.params);
                }
            });
        }
        
        if (whereClauses.length > 0) {
            sql += ' WHERE ' + whereClauses.join(' AND ');
        }
        
        // Add ORDER BY
        sql += ' ORDER BY ' + alias + '.id';
        
        return { sql: sql, params: params };
    }

    /**
     * Execute query with generic filters
     */
    function executeQuery(recordType, filters, fields, options) {
        options = options || {};
        const pageSize = options.pageSize || 5000;
        const pageIndex = options.pageIndex || 0;
        const usePagination = options.usePagination || false;
        const debug = options.debug || false;

        try {
            const sqlResult = buildSQL(recordType, filters, fields, options);
            
            if (debug) {
                log.debug('Generated SQL', sqlResult.sql);
                log.debug('Parameters', sqlResult.params);
            }
            
            // Execute query
            const pagedData = query.runSuiteQLPaged({
                query: sqlResult.sql,
                params: sqlResult.params,
                pageSize: Math.min(pageSize, 5000)
            });

            // Fetch results
            let results = [];
            let totalRecords = 0;
            
            if (pagedData.pageRanges && pagedData.pageRanges.length > 0) {
                if (usePagination) {
                    if (pageIndex < pagedData.pageRanges.length) {
                        const targetPage = pagedData.fetch({ index: pageIndex });
                        results = targetPage.data.asMappedResults();
                    }
                    totalRecords = pagedData.pageRanges.reduce((total, pageRange) => {
                        return total + pageRange.size;
                    }, 0);
                } else {
                    pagedData.pageRanges.forEach(pageRange => {
                        const onePage = pagedData.fetch({ index: pageRange.index });
                        const mappedResults = onePage.data.asMappedResults();
                        results = results.concat(mappedResults);
                    });
                    totalRecords = results.length;
                }
            }

            // Build response
            const response = {
                success: true,
                data: results,
                recordCount: results.length,
                recordType: recordType
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
                    baseTable: getBaseTable(recordType),
                    alias: generateAlias(recordType),
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
                recordType: recordType,
                debug: debug ? {
                    filters: filters,
                    fields: fields,
                    options: options,
                    errorDetails: e
                } : undefined
            };
        }
    }

    /**
     * GET handler (backward compatibility)
     */
    function getHandler(context) {
        try {
            return {
                success: true,
                message: 'Generic NetSuite RESTlet v2.0',
                supportedOperators: Object.keys(OPERATORS),
                example: {
                    recordType: 'customer',
                    filters: [
                        {
                            field_name: 'isinactive',
                            operator: 'equals',
                            value: 'F'
                        }
                    ],
                    fields: ['id', 'entityid', 'companyname'],
                    pageSize: 5
                }
            };
        } catch (e) {
            return { 
                success: false, 
                error: 'GET request failed: ' + (e.message || 'Unknown error') 
            };
        }
    }

    /**
     * POST handler with generic filter structure
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
            const recordType = context.recordType;
            const filters = context.filters || [];
            const fields = context.fields || null;
            const options = {
                pageSize: context.pageSize || 5000,
                pageIndex: context.pageIndex || 0,
                usePagination: context.usePagination || false,
                debug: context.debug || false
            };

            if (!recordType) {
                return {
                    success: false,
                    error: 'recordType is required',
                    example: {
                        recordType: 'customer',
                        filters: [
                            {
                                field_name: 'isinactive',
                                operator: 'equals',
                                value: 'F'
                            }
                        ],
                        fields: ['id', 'entityid', 'companyname'],
                        pageSize: 5
                    }
                };
            }

            // Execute query
            const result = executeQuery(recordType, filters, fields, options);

            // Add metadata
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
