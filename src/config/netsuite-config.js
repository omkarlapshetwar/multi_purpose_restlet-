const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

/**
 * NetSuite Configuration Module
 * Centralizes all NetSuite-related configuration and credentials
 */
class NetSuiteConfig {
    constructor() {
        this.validateRequiredEnvVars();
        this.initializeConfig();
    }

    /**
     * Validate that all required environment variables are present
     */
    validateRequiredEnvVars() {
        const required = [
            'NETSUITE_CONSUMER_KEY',
            'NETSUITE_CONSUMER_SECRET', 
            'NETSUITE_ACCESS_TOKEN',
            'NETSUITE_TOKEN_SECRET',
            'NETSUITE_REALM',
            'NETSUITE_SCRIPT_ID',
            'NETSUITE_DEPLOYMENT_ID',
            'NETSUITE_BASE_URL'
        ];

        const missing = required.filter(key => !process.env[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}\nPlease check your .env file.`);
        }
    }

    /**
     * Initialize configuration object
     */
    initializeConfig() {
        this.oauth = {
            consumerKey: process.env.NETSUITE_CONSUMER_KEY,
            consumerSecret: process.env.NETSUITE_CONSUMER_SECRET,
            accessToken: process.env.NETSUITE_ACCESS_TOKEN,
            tokenSecret: process.env.NETSUITE_TOKEN_SECRET,
            realm: process.env.NETSUITE_REALM
        };

        this.restlet = {
            scriptId: process.env.NETSUITE_SCRIPT_ID,
            deploymentId: process.env.NETSUITE_DEPLOYMENT_ID,
            baseUrl: process.env.NETSUITE_BASE_URL
        };
        
        // Build URL after restlet config is initialized
        this.restlet.url = this.buildRestletUrl();

        this.test = {
            timeout: parseInt(process.env.TEST_TIMEOUT) || 30000,
            delayBetweenRequests: parseInt(process.env.TEST_DELAY_BETWEEN_REQUESTS) || 1000,
            defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE) || 50,
            enableDebugLogs: process.env.ENABLE_DEBUG_LOGS === 'true'
        };

        this.app = {
            nodeEnv: process.env.NODE_ENV || 'development',
            logLevel: process.env.LOG_LEVEL || 'info'
        };
    }

    /**
     * Build the complete RESTlet URL
     */
    buildRestletUrl() {
        return `${this.restlet.baseUrl}/app/site/hosting/restlet.nl?script=${this.restlet.scriptId}&deploy=${this.restlet.deploymentId}`;
    }

    /**
     * Get OAuth configuration
     */
    getOAuthConfig() {
        return { ...this.oauth };
    }

    /**
     * Get RESTlet configuration
     */
    getRestletConfig() {
        return { ...this.restlet };
    }

    /**
     * Get test configuration
     */
    getTestConfig() {
        return { ...this.test };
    }

    /**
     * Get application configuration
     */
    getAppConfig() {
        return { ...this.app };
    }

    /**
     * Check if running in development mode
     */
    isDevelopment() {
        return this.app.nodeEnv === 'development';
    }

    /**
     * Check if debug logging is enabled
     */
    isDebugEnabled() {
        return this.test.enableDebugLogs;
    }

    /**
     * Get configuration summary for logging (without secrets)
     */
    getConfigSummary() {
        return {
            realm: this.oauth.realm,
            scriptId: this.restlet.scriptId,
            deploymentId: this.restlet.deploymentId,
            baseUrl: this.restlet.baseUrl,
            environment: this.app.nodeEnv,
            debugEnabled: this.test.enableDebugLogs,
            consumerKeyPrefix: this.oauth.consumerKey.substring(0, 8) + '...',
            accessTokenPrefix: this.oauth.accessToken.substring(0, 8) + '...'
        };
    }
}

// Export singleton instance
module.exports = new NetSuiteConfig(); 