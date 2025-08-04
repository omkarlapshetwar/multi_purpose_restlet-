#!/usr/bin/env node

const colors = require('colors');
const fs = require('fs');
const path = require('path');

/**
 * Configuration Validation Script
 * Helps users validate their NetSuite configuration setup
 */
class ConfigValidator {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.envPath = path.join(this.projectRoot, '.env');
        this.envExamplePath = path.join(this.projectRoot, 'env.example');
    }

    /**
     * Print validation banner
     */
    printBanner() {
        console.log(`
${colors.cyan('🔧 NetSuite Configuration Validator')}
${'='.repeat(50)}`);
        console.log(`📁 Project Root: ${colors.gray(this.projectRoot)}`);
        console.log(`${'='.repeat(50)}\n`);
    }

    /**
     * Check if .env file exists
     * @returns {boolean} File exists
     */
    checkEnvFileExists() {
        console.log(`📄 ${colors.cyan('Checking .env file...')}`);
        
        if (fs.existsSync(this.envPath)) {
            console.log(`✅ ${colors.green('.env file found')}`);
            return true;
        } else {
            console.log(`❌ ${colors.red('.env file not found')}`);
            console.log(`   Expected location: ${colors.gray(this.envPath)}`);
            
            if (fs.existsSync(this.envExamplePath)) {
                console.log(`💡 ${colors.yellow('Suggestion:')} Copy env.example to .env and fill in your values:`);
                console.log(`   ${colors.gray('cp env.example .env')}`);
            }
            return false;
        }
    }

    /**
     * Validate environment variables
     * @returns {boolean} All required vars present
     */
    validateEnvironmentVariables() {
        console.log(`\n🔐 ${colors.cyan('Validating environment variables...')}`);
        
        if (!this.checkEnvFileExists()) {
            return false;
        }

        // Load environment variables
        require('dotenv').config({ path: this.envPath });

        const requiredVars = [
            'NETSUITE_CONSUMER_KEY',
            'NETSUITE_CONSUMER_SECRET',
            'NETSUITE_ACCESS_TOKEN', 
            'NETSUITE_TOKEN_SECRET',
            'NETSUITE_REALM',
            'NETSUITE_SCRIPT_ID',
            'NETSUITE_DEPLOYMENT_ID',
            'NETSUITE_BASE_URL'
        ];

        let allValid = true;

        requiredVars.forEach(varName => {
            const value = process.env[varName];
            
            if (!value || value.trim() === '' || value === 'your_' + varName.toLowerCase().replace('netsuite_', '') + '_here') {
                console.log(`❌ ${colors.red(varName)}: Missing or placeholder value`);
                allValid = false;
            } else if (value.length < 10) {
                console.log(`⚠️  ${colors.yellow(varName)}: Suspiciously short (${value.length} chars)`);
            } else {
                const maskedValue = value.substring(0, 8) + '...';
                console.log(`✅ ${colors.green(varName)}: ${colors.gray(maskedValue)}`);
            }
        });

        return allValid;
    }

    /**
     * Validate URL format
     * @returns {boolean} URL is valid
     */
    validateUrls() {
        console.log(`\n🌐 ${colors.cyan('Validating URLs...')}`);
        
        const baseUrl = process.env.NETSUITE_BASE_URL;
        
        if (!baseUrl) {
            console.log(`❌ ${colors.red('Base URL not configured')}`);
            return false;
        }

        try {
            const url = new URL(baseUrl);
            
            if (!url.hostname.includes('netsuite.com')) {
                console.log(`⚠️  ${colors.yellow('Base URL does not contain "netsuite.com"')}`);
                console.log(`   Current: ${colors.gray(baseUrl)}`);
            } else {
                console.log(`✅ ${colors.green('Base URL format looks correct')}`);
            }

            // Construct full RESTlet URL
            const scriptId = process.env.NETSUITE_SCRIPT_ID;
            const deploymentId = process.env.NETSUITE_DEPLOYMENT_ID;
            
            if (scriptId && deploymentId) {
                const fullUrl = `${baseUrl}/app/site/hosting/restlet.nl?script=${scriptId}&deploy=${deploymentId}`;
                console.log(`📍 ${colors.cyan('Full RESTlet URL:')} ${colors.gray(fullUrl)}`);
            }

            return true;
        } catch (error) {
            console.log(`❌ ${colors.red('Invalid URL format:')} ${error.message}`);
            return false;
        }
    }

    /**
     * Check project dependencies
     * @returns {boolean} Dependencies are OK
     */
    validateDependencies() {
        console.log(`\n📦 ${colors.cyan('Checking dependencies...')}`);
        
        const packageJsonPath = path.join(this.projectRoot, 'package.json');
        
        if (!fs.existsSync(packageJsonPath)) {
            console.log(`❌ ${colors.red('package.json not found')}`);
            return false;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            
            const requiredDeps = ['axios', 'dotenv', 'colors'];
            let allPresent = true;

            requiredDeps.forEach(dep => {
                if (dependencies[dep]) {
                    console.log(`✅ ${colors.green(dep)}: ${colors.gray(dependencies[dep])}`);
                } else {
                    console.log(`❌ ${colors.red(dep)}: Not found`);
                    allPresent = false;
                }
            });

            if (!allPresent) {
                console.log(`💡 ${colors.yellow('Run:')} npm install`);
            }

            return allPresent;
        } catch (error) {
            console.log(`❌ ${colors.red('Error reading package.json:')} ${error.message}`);
            return false;
        }
    }

    /**
     * Check file structure
     * @returns {boolean} Structure is correct
     */
    validateFileStructure() {
        console.log(`\n📁 ${colors.cyan('Checking project structure...')}`);
        
        const requiredPaths = [
            'src/config/netsuite-config.js',
            'src/lib/netsuite-oauth.js', 
            'src/restlets/multi-purpose-restlet.js',
            'tests/test-runner.js',
            'tests/health-check.js',
            'tests/helpers/test-builder.js',
            'tests/suites/basic-tests.js'
        ];

        let allPresent = true;

        requiredPaths.forEach(relativePath => {
            const fullPath = path.join(this.projectRoot, relativePath);
            
            if (fs.existsSync(fullPath)) {
                console.log(`✅ ${colors.green(relativePath)}`);
            } else {
                console.log(`❌ ${colors.red(relativePath)}: Not found`);
                allPresent = false;
            }
        });

        return allPresent;
    }

    /**
     * Provide setup recommendations
     */
    provideRecommendations() {
        console.log(`\n💡 ${colors.bold.yellow('SETUP RECOMMENDATIONS')}`);
        console.log(`${'─'.repeat(40)}`);
        
        console.log(`1. ${colors.cyan('Environment Setup:')}`);
        console.log(`   • Copy env.example to .env`);
        console.log(`   • Fill in your NetSuite OAuth credentials`);
        console.log(`   • Ensure your RESTlet is deployed in NetSuite`);
        
        console.log(`\n2. ${colors.cyan('Testing:')}`);
        console.log(`   • Run health check: npm run test:health`);
        console.log(`   • Run basic tests: npm run test:basic`);
        console.log(`   • Run all tests: npm test`);
        
        console.log(`\n3. ${colors.cyan('Development:')}`);
        console.log(`   • Use npm run dev for development mode`);
        console.log(`   • Check logs for debugging information`);
        console.log(`   • Modify test suites as needed for your data`);
        
        console.log(`\n4. ${colors.cyan('NetSuite Setup Required:')}`);
        console.log(`   • Deploy the RESTlet script to your NetSuite account`);
        console.log(`   • Configure OAuth application in NetSuite`);
        console.log(`   • Set appropriate permissions for the script`);
    }

    /**
     * Run complete validation
     * @returns {Promise<void>}
     */
    async run() {
        this.printBanner();

        let allValid = true;

        // Run all validations
        const structureValid = this.validateFileStructure();
        allValid = allValid && structureValid;

        const depsValid = this.validateDependencies();
        allValid = allValid && depsValid;

        const envValid = this.validateEnvironmentVariables();
        allValid = allValid && envValid;

        if (envValid) {
            const urlValid = this.validateUrls();
            allValid = allValid && urlValid;
        }

        // Final summary
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🏁 ${colors.bold('VALIDATION SUMMARY')}`);
        console.log(`${'='.repeat(50)}`);
        
        if (allValid) {
            console.log(`🎉 ${colors.green.bold('CONFIGURATION VALID!')}`);
            console.log(`✅ Ready to run tests and use the RESTlet.`);
            console.log(`\n💡 ${colors.cyan('Next steps:')}`);
            console.log(`   • Run: npm run test:health`);
            console.log(`   • Then: npm test`);
        } else {
            console.log(`💥 ${colors.red.bold('CONFIGURATION ISSUES FOUND!')}`);
            console.log(`❌ Please fix the issues above before proceeding.`);
            this.provideRecommendations();
        }
        
        console.log(`${'='.repeat(50)}\n`);

        // Exit with appropriate code
        process.exit(allValid ? 0 : 1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    const validator = new ConfigValidator();
    validator.run().catch(error => {
        console.error(`💥 ${colors.red('Validation failed:')} ${error.message}`);
        process.exit(1);
    });
}

module.exports = ConfigValidator; 