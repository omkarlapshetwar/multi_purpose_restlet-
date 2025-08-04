#!/usr/bin/env node

const colors = require('colors');
const config = require('../src/config/netsuite-config');
const NetSuiteOAuth = require('../src/lib/netsuite-oauth');

/**
 * NetSuite RESTlet Health Check
 * Quick standalone health check for testing connection and basic functionality
 */
class HealthCheck {
    constructor() {
        this.oauth = new NetSuiteOAuth();
    }

    /**
     * Print health check banner
     */
    printBanner() {
        console.log(`
${colors.cyan('🔍 NetSuite RESTlet Health Check')}
${'='.repeat(40)}`);
        
        const configSummary = config.getConfigSummary();
        console.log(`🌐 Realm: ${colors.cyan(configSummary.realm)}`);
        console.log(`📜 Script: ${colors.cyan(configSummary.scriptId)}`);
        console.log(`⚡ Environment: ${colors.cyan(configSummary.environment)}`);
        console.log(`${'='.repeat(40)}\n`);
    }

    /**
     * Test basic connection
     * @returns {Promise<boolean>} Connection success
     */
    async testConnection() {
        console.log(`🔗 ${colors.cyan('Testing basic connection...')}`);
        
        try {
            // Use customer query for connection test as it's more universally available
            const result = await this.oauth.callRestlet({
                recordType: 'customer',
                filters: { isinactive: 'F' },
                pageSize: 1
            }, {
                testName: 'Health Check Connection',
                verbose: false
            });

            if (result && result.success) {
                console.log(`✅ ${colors.green('Connection: HEALTHY')}`);
                return true;
            } else {
                console.log(`❌ ${colors.red('Connection: FAILED')}`);
                if (result && result.error) {
                    console.log(`   Error: ${colors.red(result.error)}`);
                }
                return false;
            }
        } catch (error) {
            console.log(`❌ ${colors.red('Connection: ERROR')}`);
            console.log(`   ${colors.red(error.message)}`);
            return false;
        }
    }

    /**
     * Test basic customer query
     * @returns {Promise<boolean>} Query success
     */
    async testBasicQuery() {
        console.log(`📊 ${colors.cyan('Testing basic query (customers)...')}`);
        
        try {
            const result = await this.oauth.callRestlet({
                recordType: 'customer',
                filters: { isinactive: 'F' },
                pageSize: 1
            }, {
                testName: 'Health Check Query',
                verbose: false
            });

            if (result && result.success) {
                console.log(`✅ ${colors.green('Query: HEALTHY')}`);
                console.log(`   Records found: ${colors.cyan(result.recordCount || 0)}`);
                return true;
            } else {
                console.log(`❌ ${colors.red('Query: FAILED')}`);
                if (result && result.error) {
                    console.log(`   Error: ${colors.red(result.error)}`);
                }
                return false;
            }
        } catch (error) {
            console.log(`❌ ${colors.red('Query: ERROR')}`);
            console.log(`   ${colors.red(error.message)}`);
            return false;
        }
    }

    /**
     * Test OAuth signature generation
     * @returns {boolean} OAuth test success
     */
    testOAuth() {
        console.log(`🔐 ${colors.cyan('Testing OAuth signature generation...')}`);
        
        try {
            const testUrl = 'https://example.com/test';
            const testParams = { test: 'value' };
            
            const signature = this.oauth.generateOAuthSignature(
                'POST',
                testUrl,
                testParams,
                'test_secret',
                'test_token'
            );

            if (signature && signature.length > 0) {
                console.log(`✅ ${colors.green('OAuth: HEALTHY')}`);
                return true;
            } else {
                console.log(`❌ ${colors.red('OAuth: FAILED - No signature generated')}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ ${colors.red('OAuth: ERROR')}`);
            console.log(`   ${colors.red(error.message)}`);
            return false;
        }
    }

    /**
     * Test configuration loading
     * @returns {boolean} Config test success
     */
    testConfiguration() {
        console.log(`⚙️  ${colors.cyan('Testing configuration...')}`);
        
        try {
            const oauthConfig = config.getOAuthConfig();
            const restletConfig = config.getRestletConfig();

            let allGood = true;
            const checks = [
                { name: 'Consumer Key', value: oauthConfig.consumerKey },
                { name: 'Consumer Secret', value: oauthConfig.consumerSecret },
                { name: 'Access Token', value: oauthConfig.accessToken },
                { name: 'Token Secret', value: oauthConfig.tokenSecret },
                { name: 'Realm', value: oauthConfig.realm },
                { name: 'RESTlet URL', value: restletConfig.url }
            ];

            checks.forEach(check => {
                if (!check.value || check.value.trim() === '') {
                    console.log(`   ❌ ${colors.red(check.name + ': MISSING')}`);
                    allGood = false;
                } else {
                    console.log(`   ✅ ${colors.green(check.name + ': OK')}`);
                }
            });

            if (allGood) {
                console.log(`✅ ${colors.green('Configuration: HEALTHY')}`);
                return true;
            } else {
                console.log(`❌ ${colors.red('Configuration: ISSUES FOUND')}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ ${colors.red('Configuration: ERROR')}`);
            console.log(`   ${colors.red(error.message)}`);
            return false;
        }
    }

    /**
     * Run complete health check
     * @returns {Promise<void>}
     */
    async run() {
        this.printBanner();

        const startTime = Date.now();
        let allHealthy = true;

        // Run all health checks
        const configHealthy = this.testConfiguration();
        allHealthy = allHealthy && configHealthy;

        if (configHealthy) {
            const oauthHealthy = this.testOAuth();
            allHealthy = allHealthy && oauthHealthy;

            const connectionHealthy = await this.testConnection();
            allHealthy = allHealthy && connectionHealthy;

            if (connectionHealthy) {
                const queryHealthy = await this.testBasicQuery();
                allHealthy = allHealthy && queryHealthy;
            }
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        // Final summary
        console.log(`\n${'='.repeat(40)}`);
        console.log(`🏁 ${colors.bold('HEALTH CHECK SUMMARY')}`);
        console.log(`${'='.repeat(40)}`);
        console.log(`⏱️  Duration: ${colors.cyan(duration)} seconds`);
        
        if (allHealthy) {
            console.log(`🎉 ${colors.green.bold('ALL SYSTEMS HEALTHY!')}`);
            console.log(`✅ Ready for testing and production use.`);
        } else {
            console.log(`💥 ${colors.red.bold('HEALTH CHECK FAILED!')}`);
            console.log(`❌ Please check the issues above.`);
        }
        
        console.log(`${'='.repeat(40)}\n`);

        // Exit with appropriate code
        process.exit(allHealthy ? 0 : 1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    const healthCheck = new HealthCheck();
    healthCheck.run().catch(error => {
        console.error(`💥 ${colors.red('Health check failed:')} ${error.message}`);
        process.exit(1);
    });
}

module.exports = HealthCheck; 