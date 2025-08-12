const crypto = require('crypto');
const axios = require('axios');
const colors = require('colors');
const config = require('../config/netsuite-config');

/**
 * NetSuite OAuth 1.0a Authentication Library
 * Handles signature generation and authenticated API calls
 */
class NetSuiteOAuth {
    constructor() {
        this.oauthConfig = config.getOAuthConfig();
        this.restletConfig = config.getRestletConfig();
        this.testConfig = config.getTestConfig();
    }

    /**
     * Generate OAuth 1.0a signature for NetSuite
     * @param {string} httpMethod - HTTP method (GET, POST, etc.)
     * @param {string} url - Full URL including query parameters
     * @param {Object} parameters - OAuth parameters
     * @param {string} consumerSecret - Consumer secret
     * @param {string} tokenSecret - Token secret
     * @returns {string} Base64 encoded signature
     */
    generateOAuthSignature(httpMethod, url, parameters, consumerSecret, tokenSecret) {
        try {
            // Separate URL from query parameters for NetSuite compatibility
            const urlObj = new URL(url);
            const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
            
            // Combine OAuth parameters with URL query parameters
            const allParams = { ...parameters };
            
            // Add URL query parameters to OAuth parameters
            urlObj.searchParams.forEach((value, key) => {
                allParams[key] = value;
            });
            
            // Sort and encode parameters (NetSuite specific encoding)
            const sortedParams = Object.keys(allParams)
                .sort()
                .map(key => {
                    const encodedKey = encodeURIComponent(key);
                    const encodedValue = encodeURIComponent(allParams[key]);
                    return `${encodedKey}=${encodedValue}`;
                })
                .join('&');
            
            // Create signature base string
            const signatureBaseString = [
                httpMethod.toUpperCase(),
                encodeURIComponent(baseUrl),
                encodeURIComponent(sortedParams)
            ].join('&');
            
            // Create signing key
            const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
            
            // Generate signature using HMAC-SHA256 (as per NetSuite requirements)
            const signature = crypto
                .createHmac('sha256', signingKey)
                .update(signatureBaseString)
                .digest('base64');
            
            return signature;
            
        } catch (error) {
            throw new Error(`OAuth signature generation failed: ${error.message}`);
        }
    }

    /**
     * Generate OAuth authorization header
     * @param {string} httpMethod - HTTP method
     * @param {string} fullUrl - Full URL with query parameters
     * @param {Object} requestData - Request body data
     * @returns {string} Authorization header value
     */
    generateOAuthHeader(httpMethod, fullUrl, requestData = null) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const nonce = crypto.randomBytes(16).toString('hex');
            
            const oauthParams = {
                oauth_consumer_key: this.oauthConfig.consumerKey,
                oauth_nonce: nonce,
                oauth_signature_method: 'HMAC-SHA256',
                oauth_timestamp: timestamp,
                oauth_token: this.oauthConfig.accessToken,
                oauth_version: '1.0'
            };
            
            // Generate signature using the full URL (with query parameters)
            const signature = this.generateOAuthSignature(
                httpMethod, 
                fullUrl, 
                oauthParams, 
                this.oauthConfig.consumerSecret, 
                this.oauthConfig.tokenSecret
            );
            
            oauthParams.oauth_signature = signature;
            
            // Create authorization header with realm
            const authHeader = 'OAuth realm="' + this.oauthConfig.realm + '", ' + 
                Object.keys(oauthParams)
                    .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
                    .join(', ');
            
            return authHeader;
            
        } catch (error) {
            throw new Error(`OAuth header generation failed: ${error.message}`);
        }
    }

    /**
     * Make authenticated request to NetSuite RESTlet
     * @param {Object} data - Request payload
     * @param {Object} options - Request options
     * @returns {Promise<Object>} Response data
     */
    async callRestlet(data = {}, options = {}) {
        const {
            method = 'POST',
            testName = 'API Call',
            timeout = this.testConfig.timeout,
            verbose = config.isDebugEnabled()
        } = options;

        let authHeader;
        try {
            if (verbose) {
                console.log(`\n🧪 ${colors.cyan('Running')} ${colors.bold(testName)}...`);
                console.log(`📤 ${colors.yellow('Request Data:')}`, JSON.stringify(data, null, 2));
            }
            
            authHeader = this.generateOAuthHeader(method, this.restletConfig.url, data);
            
            const requestConfig = {
                method: method,
                url: this.restletConfig.url,
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'NetSuite-MultiPurpose-RESTlet/1.0.0'
                },
                timeout: timeout,
                // Do not rely on proxies/env by default; if needed, users can configure axios separately
                proxy: false
            };

            // Add data for POST requests
            if (method.toUpperCase() === 'POST' && data) {
                requestConfig.data = data;
            }
            
            const response = await axios(requestConfig);
            
            if (verbose) {
                console.log(`✅ ${colors.green('Success!')}`);
                console.log(`📥 ${colors.yellow('Response:')}`, JSON.stringify(response.data, null, 2));
                
                if (response.data.success) {
                    console.log(`📊 ${colors.blue('Records returned:')} ${response.data.recordCount || 0}`);
                    if (response.data.pagination) {
                        const { pageIndex, totalPages, totalRecords } = response.data.pagination;
                        console.log(`📄 ${colors.blue('Pagination:')} Page ${pageIndex + 1} of ${totalPages} (${totalRecords} total records)`);
                    }
                }
            }
            
            return response.data;
            
        } catch (error) {
            if (verbose) {
                console.log(`❌ ${colors.red('Error!')}`);
                if (error.response) {
                    console.log(`📥 ${colors.red('Error Response:')}`, JSON.stringify(error.response.data, null, 2));
                    console.log(`🔢 ${colors.red('Status Code:')}`, error.response.status);
                } else {
                    console.log(`💥 ${colors.red('Error Message:')}`, error.message);
                }
            }
            
            // Enhance error with context
            const enhancedError = new Error(`NetSuite API call failed: ${error.message}`);
            enhancedError.originalError = error;
            enhancedError.testName = testName;
            enhancedError.requestData = data;
            if (error.response) {
                enhancedError.status = error.response.status;
                enhancedError.responseData = error.response.data;
            }
            throw enhancedError;
        }
    }

    /**
     * Test connection to NetSuite RESTlet
     * @returns {Promise<boolean>} True if connection successful
     */
    async testConnection() {
        try {
            console.log(`🔗 ${colors.cyan('Testing NetSuite connection...')}`);
            
            // Use customer query for connection test as it's more universally available
            const result = await this.callRestlet({
                recordType: 'customer',
                filters: { isinactive: 'F' },
                pageSize: 1
            }, {
                testName: 'Connection Test',
                verbose: true
            });
            
            if (result && result.success) {
                console.log(`✅ ${colors.green('Connection successful!')}`);
                return true;
            } else {
                console.log(`❌ ${colors.red('Connection failed - Invalid response')}`);
                return false;
            }
            
        } catch (error) {
            console.log(`❌ ${colors.red('Connection failed:')} ${error.message}`);
            return false;
        }
    }

    /**
     * Get connection status and configuration summary
     * @returns {Object} Status information
     */
    getConnectionInfo() {
        return {
            configured: true,
            realm: this.oauthConfig.realm,
            restletUrl: this.restletConfig.url,
            configSummary: config.getConfigSummary()
        };
    }
}

module.exports = NetSuiteOAuth; 