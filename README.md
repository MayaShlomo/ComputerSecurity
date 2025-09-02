# Communication_LTD Security Project - Data Layer

## Overview

This repository contains the **data access layer** for the Communication_LTD security project. It provides a flexible, dual-mode data repository that supports both in-memory storage (for development) and MySQL database connectivity (for production).

## Architecture

The data layer implements a **repository pattern** with interchangeable backends:

- **Memory Mode**: Fast in-memory storage for rapid development and testing
- **MySQL Mode**: Full database connectivity with prepared statements and security best practices

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (only required for production mode)

### Installation

1. Clone the repository
2. Navigate to project directory: `cd security-project`
3. Run integration tests: `node test-repos.js`

### Usage

```javascript
const repo = require('./repos');

// Create user
const user = await repo.createUser('username', 'email@domain.com', 'hashedPassword', 'salt');

// Add customer  
const customer = await repo.addCustomer('Company Name', 'contact@company.com', '+1-234-567-8900');

// Get customer list
const customers = await repo.listCustomers();
```

## Configuration

### Development Mode (Default)
```bash
node your-application.js
# Uses in-memory storage automatically
```

### Production Mode  
```bash
DATA_BACKEND=mysql node your-application.js
# Requires MySQL database setup
```

### Environment Variables
- `DATA_BACKEND`: `memory` (default) or `mysql`
- `DB_HOST`: MySQL host (default: localhost)
- `DB_USER`: MySQL username (default: root)  
- `DB_PASS`: MySQL password
- `DB_NAME`: Database name (default: comunicationltd)

## Database Setup (Production Only)

1. Create MySQL database:
```sql
CREATE DATABASE comunicationltd;
```

2. Run schema creation:
```bash
mysql -u root -p comunicationltd < schema.sql
```

3. Load sample data:
```bash
mysql -u root -p comunicationltd < seed.sql
```

## API Reference

### User Management
- `createUser(username, email, passwordHash, salt)` - Create new user account
- `findByUsername(username)` - Retrieve user by username
- `findByEmail(email)` - Retrieve user by email
- `updatePassword(userId, passwordHash, salt)` - Update user password

### Security Features
- `addPasswordHistory(userId, passwordHash)` - Track password history
- `getPasswordHistory(userId, limit=3)` - Get recent password hashes
- `incFailed(username)` - Increment failed login attempts
- `resetFailed(username)` - Reset failed login counter
- `createPasswordReset(userId, resetToken)` - Create password reset token
- `findPasswordReset(resetToken)` - Validate reset token

### Customer Management
- `addCustomer(name, email, phone)` - Add new customer
- `listCustomers()` - Get all customers
- `getCustomerById(id)` - Get specific customer

## Testing

Run the integration test suite:
```bash
node test-repos.js
```

Expected output includes successful tests for:
- User creation and retrieval
- Customer management
- Security feature functionality
- Password history tracking
- Failed login attempt handling
- Password reset system

## Team Integration

This data layer is designed for **parallel development**:

- **Security Team**: Use `require('./repos')` for user authentication and authorization
- **UI Team**: Use `require('./repos')` for data display and form processing  
- **Testing Team**: All functions are fully testable in both memory and MySQL modes

## File Structure

```
├── schema.sql           # Database table definitions
├── seed.sql            # Sample data for development
├── test-repos.js       # Integration test suite
└── repos/
    ├── index.js        # Repository mode selector
    ├── memory.js       # In-memory implementation
    └── mysql.js        # MySQL implementation
```

## Development Status

✅ **Completed**
- In-memory repository implementation
- MySQL repository implementation  
- Complete API coverage
- Integration test suite
- Dual-mode architecture

🔄 **Ready for Integration**
- Security component integration
- UI component integration
- Vulnerability testing preparation

## Security Considerations

- All MySQL queries use **prepared statements** to prevent SQL injection
- Password storage supports **salted hashing**
- **Failed login attempt** tracking with account lockout
- **Password history** enforcement (configurable limit)
- **Password reset tokens** with expiration

---

*This data layer foundation enables the entire development team to work in parallel while maintaining security best practices and production readiness.*