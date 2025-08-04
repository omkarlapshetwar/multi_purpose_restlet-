#!/usr/bin/env node

const colors = require('colors');
const config = require('./config/netsuite-config');
const NetSuiteOAuth = require('./lib/netsuite-oauth');

/**
 * NetSuite Multi-Purpose RESTlet - Main Application Entry Point
 * 
 * This is the main entry point for the NetSuite RESTlet testing and development toolkit.
 * It provides a command-line interface for various operations.
 */
class NetSuiteApp {
    constructor() {
        this.oauth = new NetSuiteOAuth();
    }

    /**
     * Show application banner
     */
    showBanner() {
        console.log(`
${colors.rainbow('🚀 NetSuite Multi-Purpose RESTlet Toolkit 🚀')}
${'='.repeat(60)}`);
        
        const configSummary = config.getConfigSummary();
        console.log(`📋 Environment: ${colors.cyan(configSummary.environment)}`);
        console.log(`🌐 Realm: ${colors.cyan(configSummary.realm)}`);
        console.log(`📜 Script: ${colors.cyan(configSummary.scriptId)} (Deploy: ${configSummary.deploymentId})`);
        console.log(`${'='.repeat(60)}\n`);
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
${colors.bold('NetSuite RESTlet Toolkit - Available Commands')}

${colors.yellow('Testing Commands:')}
  npm test                 Run all test suites
  npm run test:health      Quick health check
  npm run test:basic       Basic connectivity tests
  npm run test:transactions Transaction-specific tests
  npm run test:entities    Entity tests (customers, employees, etc.)
  npm run test:edge-cases  Edge case and boundary tests
  npm run test:single      Single quick test

${colors.yellow('Utility Commands:')}
  npm run validate         Validate configuration setup
  npm start                Show this help and status
  npm run dev              Development mode with auto-restart

${colors.yellow('Direct Script Execution:')}
  node src/index.js        Show help and status
  node tests/health-check.js              Quick health check
  node tests/test-runner.js --help        Test runner help
  node scripts/validate-config.js         Configuration validation

${colors.yellow('Examples:')}
  # Quick health check
  npm run test:health

  # Run specific test suite with verbose output
  node tests/test-runner.js --suite=basic --verbose

  # Validate your configuration
  npm run validate

  # Run single test and stop on first failure
  node tests/test-runner.js --single --bail

${colors.yellow('Configuration:')}
  The application uses environment variables from .env file.
  Copy env.example to .env and fill in your NetSuite credentials.

${colors.yellow('Project Structure:')}
  src/                     Source code
    config/                Configuration modules
    lib/                   Core libraries
    restlets/              NetSuite RESTlet scripts
  tests/                   Test suites and utilities
    suites/                Individual test suites
    helpers/               Test helper utilities
  scripts/                 Utility scripts
        `);
    }

    /**
     * Show current status
     */
    async showStatus() {
        console.log(`📊 ${colors.bold('Current Status')}`);
        console.log(`${'─'.repeat(30)}`);

        // Configuration status
        try {
            const configSummary = config.getConfigSummary();
            console.log(`✅ ${colors.green('Configuration:')} Loaded`);
            console.log(`   Environment: ${colors.cyan(configSummary.environment)}`);
            console.log(`   Debug Mode: ${configSummary.debugEnabled ? colors.green('Enabled') : colors.red('Disabled')}`);
        } catch (error) {
            console.log(`❌ ${colors.red('Configuration:')} Error - ${error.message}`);
        }

        // Connection status (quick test)
        try {
            console.log(`🔗 ${colors.cyan('Testing connection...')}`);
            const connectionInfo = this.oauth.getConnectionInfo();
            console.log(`✅ ${colors.green('OAuth Setup:')} Configured`);
            console.log(`   RESTlet URL: ${colors.gray(connectionInfo.restletUrl)}`);
            
            // Quick ping with customer query
            const result = await this.oauth.callRestlet({
                recordType: 'customer',
                filters: { isinactive: 'F' },
                pageSize: 1
            }, {
                testName: 'Status Check',
                verbose: false,
                timeout: 10000
            });
            
            if (result && result.success !== false) {
                console.log(`✅ ${colors.green('Connection:')} Healthy`);
            } else {
                console.log(`⚠️  ${colors.yellow('Connection:')} Issues detected`);
            }
        } catch (error) {
            console.log(`❌ ${colors.red('Connection:')} Failed - ${error.message}`);
        }

        console.log(`\n💡 ${colors.yellow('Next Steps:')}`);
        console.log(`   • Run configuration validation: npm run validate`);
        console.log(`   • Run health check: npm run test:health`);
        console.log(`   • Run full test suite: npm test`);
    }

    /**
     * Parse command line arguments and execute appropriate action
     */
    async run() {
        const args = process.argv.slice(2);
        
        this.showBanner();

        if (args.includes('--help') || args.includes('-h')) {
            this.showHelp();
        } else if (args.includes('--status') || args.includes('-s')) {
            await this.showStatus();
        } else if (args.length === 0) {
            // Default behavior: show help and status
            this.showHelp();
            console.log(`\n`);
            await this.showStatus();
        } else {
            console.log(`❌ ${colors.red('Unknown arguments:')} ${args.join(' ')}`);
            console.log(`Run with --help for available options.`);
            process.exit(1);
        }
    }
}

// Run if this file is executed directly
if (require.main === module) {
    const app = new NetSuiteApp();
    app.run().catch(error => {
        console.error(`💥 ${colors.red('Application error:')} ${error.message}`);
        process.exit(1);
    });
}

module.exports = NetSuiteApp; 