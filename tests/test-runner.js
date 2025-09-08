#!/usr/bin/env node

const colors = require('colors');
const path = require('path');

// Import configuration and libraries
const config = require('../src/config/netsuite-config');
const NetSuiteOAuth = require('../src/lib/netsuite-oauth');
const TestBuilder = require('./helpers/test-builder');

// Import test suites
const BasicTestSuite = require('./suites/basic-tests');
const TransactionTestSuite = require('./suites/transaction-tests');
const EntityTestSuite = require('./suites/entity-tests');
const EdgeCaseTestSuite = require('./suites/edge-case-tests');
const NewFilterTestSuite = require('./suites/new-filter-tests');
const RestletThirdIterationTestSuite = require('./suites/restlet-3rd-iteration-tests');
const AdvancedFilterTestSuite = require('./suites/advanced-filter-tests');

/**
 * Main Test Runner for NetSuite RESTlet
 * Orchestrates test execution with command line options
 */
class NetSuiteTestRunner {
    constructor() {
        this.oauth = new NetSuiteOAuth();
        this.testBuilder = new TestBuilder();
        this.testConfig = config.getTestConfig();
        this.stats = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            warningTests: 0,
            startTime: null,
            endTime: null,
            suites: []
        };
    }

    /**
     * Parse command line arguments
     * @returns {Object} Parsed arguments
     */
    parseArguments() {
        const args = process.argv.slice(2);
        const options = {
            suite: 'all',
            single: false,
            verbose: false,
            bail: false,
            timeout: this.testConfig.timeout,
            delay: this.testConfig.delayBetweenRequests
        };

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            
            if (arg.startsWith('--suite=')) {
                options.suite = arg.split('=')[1];
            } else if (arg === '--single') {
                options.single = true;
            } else if (arg === '--verbose' || arg === '-v') {
                options.verbose = true;
            } else if (arg === '--bail' || arg === '-b') {
                options.bail = true;
            } else if (arg.startsWith('--timeout=')) {
                options.timeout = parseInt(arg.split('=')[1]) || options.timeout;
            } else if (arg.startsWith('--delay=')) {
                options.delay = parseInt(arg.split('=')[1]) || options.delay;
            } else if (arg === '--help' || arg === '-h') {
                this.showHelp();
                process.exit(0);
            } else if (arg === '--no-conn-check') {
                options.noConnCheck = true;
            }
        }

        return options;
    }

    /**
     * Show help information
     */
    showHelp() {
        console.log(`
${colors.bold('NetSuite RESTlet Test Runner')}

${colors.yellow('Usage:')}
  npm test                          Run all test suites
  npm run test:basic               Run basic connection tests
  npm run test:transactions        Run transaction tests
  npm run test:entities           Run entity tests (customer, employee, vendor)
  npm run test:edge-cases         Run edge case tests
  npm run test:new-filters        Run new filter structure tests
  npm run test:restlet3           Run Restlet 3rd iteration tests
  npm run test:advanced-filters   Run advanced filter pattern tests
  npm run test:single             Run a single quick test
  npm run test:health             Run health check only

${colors.yellow('Options:')}
  --suite=<name>        Run specific test suite (basic|transactions|entities|edge-cases|new-filters|advanced-filters|restlet3|all)
  --single              Run only a quick single test
  --verbose, -v         Enable verbose output
  --bail, -b            Stop on first failure
  --timeout=<ms>        Set request timeout (default: 30000)
  --delay=<ms>          Set delay between requests (default: 1000)
  --help, -h            Show this help

${colors.yellow('Test Suites:')}
  basic                 Basic connectivity and functionality tests
  transactions          Transaction-specific tests with field mapping
  entities              Entity record tests (customers, employees, vendors)
  edge-cases            Boundary conditions and error scenarios
  new-filters           New filter structure and operator tests
  restlet3              Restlet 3rd iteration scenarios
  advanced-filters      Advanced filter patterns and business logic tests
  all                   Run all test suites (default)

${colors.yellow('Examples:')}
  npm test -- --suite=basic
  npm test -- --suite=advanced-filters --verbose
  npm test -- --single --timeout=60000
`);
    }

    /**
     * Print startup banner
     */
    printBanner() {
        console.log(`
${colors.rainbow('🚀 NetSuite Multi-Purpose RESTlet Test Suite 🚀')}
${'='.repeat(60)}`);
        
        const configSummary = config.getConfigSummary();
        console.log(`📋 Environment: ${colors.cyan(configSummary.environment)}`);
        console.log(`🌐 Realm: ${colors.cyan(configSummary.realm)}`);
        console.log(`📜 Script: ${colors.cyan(configSummary.scriptId)} (Deploy: ${configSummary.deploymentId})`);
        console.log(`🔧 Debug: ${configSummary.debugEnabled ? colors.green('Enabled') : colors.red('Disabled')}`);
        console.log(`⚡ Base URL: ${colors.cyan(configSummary.baseUrl)}`);
        console.log(`${'='.repeat(60)}\n`);
    }

    /**
     * Test connection before running suites
     * @returns {Promise<boolean>} Connection success
     */
    async testConnection() {
        console.log(`🔗 ${colors.cyan('Testing NetSuite connection...')}`);
        
        try {
            const connected = await this.oauth.testConnection();
            if (connected) {
                console.log(`✅ ${colors.green('Connection successful!')}\n`);
                return true;
            } else {
                console.log(`❌ ${colors.red('Connection failed!')}\n`);
                return false;
            }
        } catch (error) {
            console.log(`❌ ${colors.red('Connection error:')} ${error.message}\n`);
            return false;
        }
    }

    /**
     * Run a single quick test
     * @returns {Promise<void>}
     */
    async runSingleTest() {
        console.log(`🧪 ${colors.cyan('Running Quick Single Test')}`);
        console.log(`${'='.repeat(40)}\n`);

        const quickTest = this.testBuilder.createCustomerTest({}, {
            pageSize: 3,
            description: 'Quick Customer Test'
        });

        await this.executeTest(quickTest, 'Quick Test');
    }

    /**
     * Execute a single test case
     * @param {Object} testCase - Test case to execute
     * @param {string} suiteName - Test suite name
     * @returns {Promise<Object>} Test result
     */
    async executeTest(testCase, suiteName = 'Unknown') {
        const testName = testCase.testMetadata.description;
        
        try {
            console.log(`\n🧪 ${colors.cyan('Running:')} ${colors.bold(testName)}`);
            
            // Execute the API call
            const result = await this.oauth.callRestlet(testCase, {
                testName: testName,
                verbose: true
            });

            // Validate result
            const validation = this.testBuilder.validateTestResult(testCase, result);
            
            // Update statistics
            this.stats.totalTests++;
            if (validation.passed && validation.errors.length === 0) {
                this.stats.passedTests++;
                if (validation.warnings.length > 0) {
                    this.stats.warningTests++;
                }
            } else {
                this.stats.failedTests++;
            }

            // Print summary
            this.testBuilder.printTestSummary(testCase, result, validation);

            // Add delay between tests
            if (this.testConfig.delayBetweenRequests > 0) {
                await this.delay(this.testConfig.delayBetweenRequests);
            }

            return { testCase, result, validation, suiteName };

        } catch (error) {
            console.log(`❌ ${colors.red('Test execution failed:')} ${error.message}`);
            
            this.stats.totalTests++;
            this.stats.failedTests++;

            const failedResult = {
                testCase,
                result: { success: false, error: error.message },
                validation: { passed: false, errors: [error.message], warnings: [] },
                suiteName
            };

            return failedResult;
        }
    }

    /**
     * Run a test suite
     * @param {Object} testSuite - Test suite to run
     * @param {string} suiteName - Suite name
     * @param {Object} options - Run options
     * @returns {Promise<Array>} Test results
     */
    async runTestSuite(testSuite, suiteName, options = {}) {
        console.log(`\n🎯 ${colors.bold.blue('Starting Test Suite:')} ${colors.bold(suiteName)}`);
        console.log(`${'='.repeat(50)}\n`);

        const tests = testSuite.getTests();
        const results = [];

        for (let i = 0; i < tests.length; i++) {
            const test = tests[i];
            const result = await this.executeTest(test, suiteName);
            results.push(result);

            // Bail on first failure if requested
            if (options.bail && !result.validation.passed) {
                console.log(`\n🛑 ${colors.red('Bailing on first failure as requested')}`);
                break;
            }
        }

        // Suite summary
        const suiteStats = this.calculateSuiteStats(results);
        this.stats.suites.push({ name: suiteName, ...suiteStats });
        
        this.printSuiteSummary(suiteName, suiteStats);

        return results;
    }

    /**
     * Calculate statistics for a test suite
     * @param {Array} results - Test results
     * @returns {Object} Suite statistics
     */
    calculateSuiteStats(results) {
        return {
            total: results.length,
            passed: results.filter(r => r.validation.passed && r.validation.errors.length === 0).length,
            failed: results.filter(r => !r.validation.passed || r.validation.errors.length > 0).length,
            warnings: results.filter(r => r.validation.warnings.length > 0).length
        };
    }

    /**
     * Print test suite summary
     * @param {string} suiteName - Suite name
     * @param {Object} stats - Suite statistics
     */
    printSuiteSummary(suiteName, stats) {
        console.log(`\n📊 ${colors.bold('Suite Summary:')} ${colors.cyan(suiteName)}`);
        console.log(`${'─'.repeat(40)}`);
        console.log(`✅ Passed: ${colors.green(stats.passed)}`);
        console.log(`❌ Failed: ${colors.red(stats.failed)}`);
        console.log(`⚠️  Warnings: ${colors.yellow(stats.warnings)}`);
        console.log(`📋 Total: ${colors.cyan(stats.total)}\n`);
    }

    /**
     * Print final test summary
     */
    printFinalSummary() {
        const duration = this.stats.endTime - this.stats.startTime;
        const durationSec = (duration / 1000).toFixed(2);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🏁 ${colors.rainbow('FINAL TEST RESULTS')}`);
        console.log(`${'='.repeat(60)}`);
        
        console.log(`⏱️  Duration: ${colors.cyan(durationSec)} seconds`);
        console.log(`📋 Total Tests: ${colors.cyan(this.stats.totalTests)}`);
        console.log(`✅ Passed: ${colors.green(this.stats.passedTests)}`);
        console.log(`❌ Failed: ${colors.red(this.stats.failedTests)}`);
        console.log(`⚠️  With Warnings: ${colors.yellow(this.stats.warningTests)}`);

        // Suite breakdown
        if (this.stats.suites.length > 1) {
            console.log(`\n📊 ${colors.bold('Suite Breakdown:')}`);
            this.stats.suites.forEach(suite => {
                console.log(`   ${colors.cyan(suite.name)}: ${colors.green(suite.passed)}✅ ${colors.red(suite.failed)}❌ ${colors.yellow(suite.warnings)}⚠️`);
            });
        }

        // Overall result
        const successRate = this.stats.totalTests > 0 ? (this.stats.passedTests / this.stats.totalTests * 100).toFixed(1) : 0;
        console.log(`\n🎯 ${colors.bold('Success Rate:')} ${colors.cyan(successRate + '%')}`);

        if (this.stats.failedTests === 0) {
            console.log(`\n🎉 ${colors.green.bold('ALL TESTS PASSED!')}`);
        } else {
            console.log(`\n💥 ${colors.red.bold(this.stats.failedTests + ' TESTS FAILED')}`);
        }

        console.log(`${'='.repeat(60)}\n`);
    }

    /**
     * Delay execution
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Main test runner entry point
     * @returns {Promise<void>}
     */
    async run() {
        const options = this.parseArguments();
        
        this.printBanner();

        // Test connection first unless skipped
        if (!options.noConnCheck) {
            const connected = await this.testConnection();
            if (!connected) {
                console.log(`❌ ${colors.red('Cannot proceed without connection. Please check your configuration.')}`);
                process.exit(1);
            }
        } else {
            console.log(`⚠️  ${colors.yellow('Skipping connection pre-check (--no-conn-check)')}`);
        }

        this.stats.startTime = Date.now();

        try {
            if (options.single) {
                await this.runSingleTest();
            } else {
                // Run test suites based on options
                switch (options.suite.toLowerCase()) {
                    case 'basic':
                        await this.runTestSuite(new BasicTestSuite(), 'Basic Tests', options);
                        break;
                    case 'transactions':
                        await this.runTestSuite(new TransactionTestSuite(), 'Transaction Tests', options);
                        break;
                    case 'entities':
                        await this.runTestSuite(new EntityTestSuite(), 'Entity Tests', options);
                        break;
                    case 'edge-cases':
                        await this.runTestSuite(new EdgeCaseTestSuite(), 'Edge Case Tests', options);
                        break;
                    case 'new-filters':
                        await this.runTestSuite(new NewFilterTestSuite(), 'New Filter Tests', options);
                        break;
                    case 'advanced-filters':
                        await this.runTestSuite(new AdvancedFilterTestSuite(), 'Advanced Filter Tests', options);
                        break;
                    case 'restlet3':
                        await this.runTestSuite(new RestletThirdIterationTestSuite(), 'Restlet 3rd Iteration Tests', options);
                        break;
                    case 'all':
                    default:
                        await this.runTestSuite(new BasicTestSuite(), 'Basic Tests', options);
                        await this.runTestSuite(new EntityTestSuite(), 'Entity Tests', options);
                        await this.runTestSuite(new TransactionTestSuite(), 'Transaction Tests', options);
                        await this.runTestSuite(new EdgeCaseTestSuite(), 'Edge Case Tests', options);
                        await this.runTestSuite(new NewFilterTestSuite(), 'New Filter Tests', options);
                        await this.runTestSuite(new AdvancedFilterTestSuite(), 'Advanced Filter Tests', options);
                        await this.runTestSuite(new RestletThirdIterationTestSuite(), 'Restlet 3rd Iteration Tests', options);
                        break;
                }
            }

            this.stats.endTime = Date.now();
            this.printFinalSummary();

            // Exit with appropriate code
            process.exit(this.stats.failedTests > 0 ? 1 : 0);

        } catch (error) {
            console.log(`💥 ${colors.red('Test runner failed:')} ${error.message}`);
            console.log(error.stack);
            process.exit(1);
        }
    }
}

// Run if this file is executed directly
if (require.main === module) {
    const runner = new NetSuiteTestRunner();
    runner.run().catch(error => {
        console.error(`💥 ${colors.red('Unhandled error:')} ${error.message}`);
        process.exit(1);
    });
}

module.exports = NetSuiteTestRunner; 