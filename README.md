# NetSuite Multi-Purpose RESTlet Toolkit

A comprehensive, professional-grade NetSuite RESTlet solution for dynamic record querying with OAuth 1.0a authentication and a complete testing framework.

## 🚀 Features

- **Universal Record Querying**: Query any NetSuite record type dynamically
- **OAuth 1.0a Authentication**: Secure, production-ready authentication
- **Comprehensive Testing**: Full test suite with multiple test categories
- **Professional Structure**: Well-organized, modular codebase
- **Environment Configuration**: Secure credential management
- **Advanced Filtering**: Support for complex filters, date ranges, and custom operators
- **Pagination Support**: Efficient handling of large datasets
- **Error Handling**: Robust error handling and validation
- **Debug Features**: Extensive logging and debugging capabilities

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [NetSuite Deployment](#netsuite-deployment)
- [Usage](#usage)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone https://github.com/omkarlapshetwar/multi_purpose_restlet-.git
   cd multi_purpose_restlet-
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env with your NetSuite credentials
   ```

3. **Validate Setup**
   ```bash
   npm run validate
   ```

4. **Run Health Check**
   ```bash
   npm run test:health
   ```

5. **Run Tests**
   ```bash
   npm test
   ```

## 📦 Installation

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn
- NetSuite account with RESTlet deployment capabilities
- OAuth application configured in NetSuite

### Install Dependencies

```bash
npm install
```

### Development Dependencies

```bash
npm install --only=dev
```

## ⚙️ Configuration

### Environment Variables

Copy `env.example` to `.env` and configure the following variables:

```env
# NetSuite OAuth 1.0a Configuration
NETSUITE_CONSUMER_KEY=your_consumer_key_here
NETSUITE_CONSUMER_SECRET=your_consumer_secret_here
NETSUITE_ACCESS_TOKEN=your_access_token_here
NETSUITE_TOKEN_SECRET=your_token_secret_here

# NetSuite Instance Configuration
NETSUITE_REALM=your_realm_here
NETSUITE_SCRIPT_ID=your_script_id_here
NETSUITE_DEPLOYMENT_ID=your_deployment_id_here
NETSUITE_BASE_URL=https://your-account.restlets.api.netsuite.com

# Test Configuration
TEST_TIMEOUT=30000
TEST_DELAY_BETWEEN_REQUESTS=1000
DEFAULT_PAGE_SIZE=50
ENABLE_DEBUG_LOGS=true

# Environment Settings
NODE_ENV=development
LOG_LEVEL=info
```

### NetSuite Setup Overview

1. **Deploy RESTlet Script**
   - Upload `src/restlets/multi-purpose-restlet.js` to NetSuite
   - Create a Script record with type RESTlet
   - Deploy the script and note the Script ID and Deployment ID

2. **Configure OAuth Application**
   - Create an OAuth application in NetSuite
   - Generate Consumer Key/Secret and Access Token/Secret
   - Configure appropriate permissions

3. **Set Permissions**
   - Ensure the OAuth application has access to required record types
   - Grant necessary CRUD permissions based on your use case

> 📖 **For detailed step-by-step deployment instructions, see the [NetSuite Deployment](#netsuite-deployment) section below.**

## 🚀 NetSuite Deployment

### Step 1: Upload RESTlet Script to NetSuite

1. **Access NetSuite File Cabinet**
   - Login to your NetSuite account
   - Go to **Documents → Files → File Cabinet**
   - Navigate to **SuiteScripts** folder (create if doesn't exist)

2. **Create RESTlets Folder**
   ```
   SuiteScripts/
   └── RESTlets/
       └── multi-purpose-restlet.js
   ```

3. **Upload the Script**
   - Click **New → Upload File**
   - Select `src/restlets/multi-purpose-restlet.js` from your project
   - Upload to: `/SuiteScripts/RESTlets/`
   - Click **Save**

### Step 2: Create Script Record

1. **Navigate to Scripts**
   - Go to **Customization → Scripting → Scripts → New**

2. **Script Configuration**
   ```
   Script Type: RESTlet
   ID: customscript_multi_purpose_restlet
   Name: Multi-Purpose RESTlet
   Description: Dynamic record querying RESTlet with advanced filtering
   Script File: /SuiteScripts/RESTlets/multi-purpose-restlet.js
   ```

3. **Function Mappings**
   ```
   GET Function: handleRequest
   POST Function: handleRequest
   PUT Function: handleRequest
   DELETE Function: handleRequest
   ```

4. **Save the Script**

### Step 3: Deploy the Script

1. **Create Deployment**
   - Click **Deploy Script** on the script record
   - Or go to **Customization → Scripting → Script Deployments → New**

2. **Deployment Configuration**
   ```
   Script: Multi-Purpose RESTlet
   ID: customdeploy_multi_purpose_restlet
   Title: Multi-Purpose RESTlet - Production
   Status: Released
   Audience: All Roles
   Execute As: Administrator (or appropriate role)
   ```

3. **Note Important IDs**
   - **Script ID**: `customscript_multi_purpose_restlet` (or assigned ID)
   - **Deployment ID**: `customdeploy_multi_purpose_restlet` (or assigned ID)
   - **Account ID**: Your NetSuite account number

### Step 4: Configure OAuth Application

1. **Create Integration**
   - Go to **Setup → Integration → Manage Integrations → New**

2. **Integration Configuration**
   ```
   Name: Multi-Purpose RESTlet Integration
   Description: OAuth integration for RESTlet API access
   State: Enabled
   Concurrency Limit: 10 (or as needed)
   ```

3. **Authentication Settings**
   ```
   ✅ Token-based Authentication
   ✅ RESTlets
   ✅ REST Web Services
   User Credentials: (leave unchecked for token-based)
   ```

4. **Save and Note Credentials**
   ```
   Consumer Key: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   Consumer Secret: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### Step 5: Create Access Token

1. **Create Token**
   - Go to **Setup → Users/Roles → Access Tokens → New**

2. **Token Configuration**
   ```
   Application Name: Multi-Purpose RESTlet Integration
   User: (Select appropriate user)
   Role: Administrator (or role with required permissions)
   Token Name: Multi-Purpose RESTlet Token
   ```

3. **Save and Note Token Details**
   ```
   Token ID: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   Token Secret: XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### Step 6: Set Up Permissions

1. **Role Permissions** (for the role used in token)
   ```
   Setup → Users/Roles → Manage Roles → [Your Role] → Permissions
   
   Required Permissions:
   ✅ Lists → Custom Lists (Full)
   ✅ Lists → Customers (Full)
   ✅ Lists → Employees (Full)
   ✅ Lists → Vendors (Full)
   ✅ Lists → Items (Full)
   ✅ Transactions → All Transaction Types (View/Full as needed)
   ✅ Setup → Custom Records (Full)
   ✅ Setup → SuiteScript (Full)
   ```

2. **Integration Permissions**
   ```
   Go back to your Integration record and verify:
   ✅ User has access to all required record types
   ✅ Token is active and not expired
   ```

### Step 7: Configure Environment Variables

1. **Update your `.env` file**
   ```env
   # OAuth Credentials (from Step 4 & 5)
   NETSUITE_CONSUMER_KEY=your_consumer_key_from_step_4
   NETSUITE_CONSUMER_SECRET=your_consumer_secret_from_step_4
   NETSUITE_ACCESS_TOKEN=your_token_id_from_step_5
   NETSUITE_TOKEN_SECRET=your_token_secret_from_step_5
   
   # NetSuite Instance (from Step 3)
   NETSUITE_REALM=1234567  # Your NetSuite account number
   NETSUITE_SCRIPT_ID=customscript_multi_purpose_restlet
   NETSUITE_DEPLOYMENT_ID=customdeploy_multi_purpose_restlet
   NETSUITE_BASE_URL=https://1234567.restlets.api.netsuite.com
   ```

### Step 8: Test Deployment

1. **Validate Configuration**
   ```bash
   npm run validate
   ```

2. **Test Connection**
   ```bash
   npm run test:health
   ```

3. **Run Basic Tests**
   ```bash
   npm run test:basic
   ```

### Step 9: Postman Testing (Alternative)

1. **Setup Postman Collection**
   - Import or create new collection
   - Set OAuth 1.0a authentication

2. **Configure OAuth in Postman**
   ```
   Auth Type: OAuth 1.0a
   Consumer Key: [Your Consumer Key]
   Consumer Secret: [Your Consumer Secret]  
   Access Token: [Your Access Token]
   Token Secret: [Your Token Secret]
   Signature Method: HMAC-SHA256
   Add auth data to: Request Headers
   ```

3. **Test Request**
   ```
   Method: POST
   URL: https://[account].restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=[script_id]&deploy=[deploy_id]
   Headers: Content-Type: application/json
   Body: Copy any example from filters-reference.js
   ```

4. **Quick Test Examples**
   ```json
   {
     "recordType": "customer",
     "filters": { "isinactive": "F" },
     "pageSize": 5
   }
   ```

### 🔧 Troubleshooting Deployment

- **Script Error**: Check SuiteScript logs in NetSuite
- **Permission Denied**: Verify role permissions and integration settings
- **Authentication Failed**: Double-check OAuth credentials and token validity
- **404 Error**: Verify script and deployment IDs in URL
- **Timeout**: Check network connectivity and NetSuite performance

## 🎯 Usage

### ⚡ Quick Commands Reference

```bash
# 🔍 Validate your setup
npm run validate

# 🏥 Quick health check
npm run test:health

# 🧪 Run all tests
npm test

# 🎯 Run specific test suites
npm run test:basic
npm run test:transactions
npm run test:entities
npm run test:edge-cases

# 🚀 Single quick test
npm run test:single

# 💻 Show help and status
npm start
```

### 📋 Filter Examples for Postman

We've created a comprehensive reference file with all filter examples:

**`filters-reference.js`** - Contains 28+ ready-to-use filter examples:
- Basic connection tests
- Entity queries (customers, employees, vendors)
- Transaction filtering
- Advanced operators and edge cases
- Quick copy-paste examples for Postman

**How to use with Postman:**
1. Open `filters-reference.js` in your project
2. Copy any JSON example (e.g., `activeCustomers`, `salesOrdersOnly`)
3. Paste it as the request body in Postman
4. Configure OAuth 1.0a authentication
5. Send POST request to your RESTlet endpoint

**Example:**
```json
{
  "recordType": "customer",
  "filters": { "isinactive": "F" },
  "pageSize": 5
}
```

### Command Line Interface

```bash
# Show help and status
npm start

# Run all tests
npm test

# Run specific test suites
npm run test:basic
npm run test:transactions
npm run test:entities
npm run test:edge-cases

# Quick health check
npm run test:health

# Single test
npm run test:single

# Validate configuration
npm run validate

# Development mode
npm run dev
```

### Direct Script Execution

```bash
# Test runner with options
node tests/test-runner.js --suite=basic --verbose
node tests/test-runner.js --single --bail

# Health check
node tests/health-check.js

# Configuration validation
node scripts/validate-config.js
```

### Programmatic Usage

```javascript
const NetSuiteOAuth = require('./src/lib/netsuite-oauth');
const TestBuilder = require('./tests/helpers/test-builder');

const oauth = new NetSuiteOAuth();
const builder = new TestBuilder();

// Create and execute a test
const test = builder.createCustomerTest({
    isinactive: 'F'
}, {
    pageSize: 10,
    fields: ['id', 'entityid', 'companyname']
});

const result = await oauth.callRestlet(test);
console.log(result);
```

## 🧪 Testing

### Test Suites

- **Basic Tests**: Connection, health checks, basic functionality
- **Transaction Tests**: Transaction-specific queries and field mapping
- **Entity Tests**: Customer, employee, vendor, and other entity tests
- **Edge Case Tests**: Boundary conditions and error scenarios

### Running Tests

```bash
# All tests
npm test

# Specific suites
npm run test:basic
npm run test:transactions
npm run test:entities
npm run test:edge-cases

# With options
node tests/test-runner.js --suite=basic --verbose --bail
```

### Test Configuration

Tests can be customized via environment variables:

- `TEST_TIMEOUT`: Request timeout in milliseconds
- `TEST_DELAY_BETWEEN_REQUESTS`: Delay between test requests
- `DEFAULT_PAGE_SIZE`: Default page size for pagination tests
- `ENABLE_DEBUG_LOGS`: Enable/disable debug logging

## 📁 Project Structure

```
├── src/                          # Source code
│   ├── config/                   # Configuration modules
│   │   └── netsuite-config.js    # NetSuite configuration manager
│   ├── lib/                      # Core libraries
│   │   └── netsuite-oauth.js     # OAuth authentication library
│   ├── restlets/                 # NetSuite RESTlet scripts
│   │   └── multi-purpose-restlet.js # Main RESTlet script
│   └── index.js                  # Main application entry point
├── tests/                        # Test framework
│   ├── suites/                   # Test suites
│   │   ├── basic-tests.js        # Basic functionality tests
│   │   ├── transaction-tests.js  # Transaction-specific tests
│   │   ├── entity-tests.js       # Entity record tests
│   │   └── edge-case-tests.js    # Edge case and boundary tests
│   ├── helpers/                  # Test utilities
│   │   └── test-builder.js       # Test case builder
│   ├── test-runner.js            # Main test runner
│   └── health-check.js           # Standalone health check
├── scripts/                      # Utility scripts
│   └── validate-config.js        # Configuration validator
├── docs/                         # Documentation
├── package.json                  # Project configuration
├── env.example                   # Environment variables template
└── README.md                     # This file
```

## 📚 API Documentation

### RESTlet Endpoints

The RESTlet supports dynamic querying of any NetSuite record type:

#### Basic Query Structure

```javascript
{
    "recordType": "customer",           // Required: NetSuite record type
    "filters": {                        // Optional: Filter criteria
        "isinactive": "F",
        "email": {
            "operator": "!=",
            "value": ""
        }
    },
    "fields": ["id", "entityid", "companyname"], // Optional: Specific fields
    "pageSize": 50,                     // Optional: Page size (default: 5000)
    "pageIndex": 0,                     // Optional: Page index (default: 0)
    "usePagination": true,              // Optional: Enable pagination
    "debug": true                       // Optional: Enable debug output
}
```

#### Supported Record Types

- **Transactions**: `transaction`, `revenueplan`, `revenuerecognitionschedule`
- **Entities**: `customer`, `vendor`, `employee`, `contact`, `partner`, `job`
- **Items**: `item`, `inventoryitem`, `noninventoryitem`, `serviceitem`
- **Lists**: `account`, `location`, `department`, `classification`, `currency`
- **Activities**: `calendarevent`, `task`, `phonecall`, `message`, `note`
- **Support**: `supportcase`, `issue`, `solution`, `topic`
- **Custom Records**: `customrecord_[id]`

#### Filter Operators

- **Simple Equality**: `"field": "value"`
- **Array (IN clause)**: `"field": ["value1", "value2"]`
- **Custom Operators**: `"field": {"operator": ">=", "value": 100}`
- **Date Ranges**: `"field_startdate": "01-01-2024"`, `"field_enddate": "31-12-2024"`
- **Boolean**: `"field": true` or `"field": "T"/"F"`

#### Response Format

```javascript
{
    "success": true,
    "data": [...],                      // Query results
    "recordCount": 100,                 // Number of records returned
    "recordType": "customer",           // Record type queried
    "recordCategory": "ENTITY",         // Record category
    "timestamp": "2024-01-01T12:00:00Z", // Response timestamp
    "version": "2.0.0",                 // RESTlet version
    "pagination": {                     // Pagination info (if enabled)
        "pageSize": 50,
        "pageIndex": 0,
        "totalRecords": 1000,
        "totalPages": 20,
        "hasMore": true
    },
    "debug": {...}                      // Debug information (if enabled)
}
```

### Test Framework API

#### Test Builder

```javascript
const TestBuilder = require('./tests/helpers/test-builder');
const builder = new TestBuilder();

// Create customer test
const customerTest = builder.createCustomerTest({
    isinactive: 'F'
}, {
    pageSize: 10,
    fields: ['id', 'entityid', 'companyname']
});

// Create transaction test
const transactionTest = builder.createTransactionTest({
    type: 'SalesOrd',
    trandate_startdate: '01-01-2024',
    trandate_enddate: '31-12-2024'
});

// Create pagination test
const paginationTest = builder.createPaginationTest('customer', {
    isinactive: 'F'
}, 25, 0);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow the existing code style and structure
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting
- Use meaningful commit messages

## 🐛 Troubleshooting

### Common Issues

#### Configuration Issues

```bash
# Validate your configuration
npm run validate

# Common fixes:
# 1. Check .env file exists and has correct values
# 2. Verify NetSuite credentials are correct
# 3. Ensure RESTlet is deployed in NetSuite
```

#### Connection Problems

```bash
# Test connection
npm run test:health

# Common fixes:
# 1. Check OAuth credentials
# 2. Verify RESTlet URL
# 3. Check NetSuite account access
# 4. Verify script permissions
```

#### Test Failures

```bash
# Run with debug output
node tests/test-runner.js --suite=basic --verbose

# Common fixes:
# 1. Check record permissions
# 2. Verify test data exists in NetSuite
# 3. Adjust test expectations for your data
```

### Error Codes

- **401 Unauthorized**: OAuth credentials invalid
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: RESTlet not found or wrong URL
- **500 Internal Server Error**: RESTlet execution error

### Debug Mode

Enable debug mode for detailed logging:

```env
ENABLE_DEBUG_LOGS=true
```

### Support

- Check the [Issues](https://github.com/omkarlapshetwar/multi_purpose_restlet-/issues) page
- Create a new issue with detailed information
- Include configuration (without credentials) and error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- NetSuite SuiteScript API documentation
- OAuth 1.0a specification
- Node.js and npm ecosystem
- Contributors and testers

## 📊 Changelog

### Version 2.0.0 (Current)
- Complete rewrite with professional structure
- Comprehensive test framework
- Environment-based configuration
- Enhanced error handling and debugging
- Improved documentation

### Version 1.0.0
- Initial RESTlet implementation
- Basic testing functionality
- Hardcoded configuration

---

**Made with ❤️ for the NetSuite community** 