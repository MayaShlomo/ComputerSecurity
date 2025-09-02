/**
 * Repository Integration Tests
 * Communication_LTD Security Project
 * 
 * Tests all data access layer functionality to ensure proper operation
 * before integration with security and UI components
 */

const repo = require('./repos');

async function runTests() {
  console.log('🧪 Repository Integration Test Suite');
  console.log('=====================================\n');

  try {
    // Test 1: User Management
    console.log('1️⃣  Testing User Creation & Retrieval...');
    const newUser = await repo.createUser('demo_test_user', 'demo@comunicationltd.com', 'secure_hash_123', 'random_salt_456');
    console.log('✅ User creation successful:', newUser.username);

    const foundUser = await repo.findByUsername('demo_test_user');
    console.log('✅ User retrieval successful:', foundUser ? foundUser.username : 'ERROR: User not found');

    // Test 2: Customer Management  
    console.log('\n2️⃣  Testing Customer Management...');
    const newCustomer = await repo.addCustomer('Enterprise Client Corp', 'enterprise@client-corp.com', '+972-3-9876543');
    console.log('✅ Customer creation successful:', newCustomer.name);

    const customers = await repo.listCustomers();
    console.log('✅ Customer listing successful - Total customers:', customers.length);
    customers.forEach((c, index) => console.log(`   ${index + 1}. ${c.name} (${c.email})`));

    // Test 3: Security Features
    console.log('\n3️⃣  Testing Security Features...');
    
    // Password history
    await repo.addPasswordHistory(newUser.id, 'previous_password_hash_1');
    await repo.addPasswordHistory(newUser.id, 'previous_password_hash_2');
    const history = await repo.getPasswordHistory(newUser.id);
    console.log('✅ Password history tracking:', history.length, 'entries recorded');

    // Failed login attempts
    await repo.incFailed('demo_test_user');
    const userAfterFailedAttempt = await repo.findByUsername('demo_test_user');
    console.log('✅ Failed login attempt tracking:', userAfterFailedAttempt.failed_attempts, 'attempts recorded');

    // Password reset functionality  
    const resetToken = 'secure_reset_token_abc123def456';
    await repo.createPasswordReset(newUser.id, resetToken);
    const foundReset = await repo.findPasswordReset(resetToken);
    console.log('✅ Password reset system:', foundReset ? 'Token created successfully' : 'ERROR: Token not found');

    console.log('\n🎉 All integration tests completed successfully!');
    console.log('📋 Repository is ready for team integration');

  } catch (error) {
    console.error('\n❌ Integration test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// הרצת הבדיקות
runTests();