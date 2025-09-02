/**
 * In-Memory Data Repository
 * Provides all data access functions without requiring MySQL setup
 * Enables parallel development while database infrastructure is being prepared
 * 
 * @author Communication_LTD Development Team
 * @version 1.0
 */

// In-memory storage arrays
let users = [];
let passwordHistory = [];
let customers = [];
let passwordResets = [];

// Auto-increment counters
let nextUserId = 1;
let nextCustomerId = 1;
let nextResetId = 1;

/**
 * Initialize repository with sample data for development
 */
function initializeData() {
  // System administrator account
  users.push({
    id: nextUserId++,
    username: 'admin',
    email: 'admin@comunicationltd.com',
    password_hash: 'temp_hash_admin',
    salt: 'temp_salt_admin',
    failed_attempts: 0,
    locked_until: null,
    created_at: new Date()
  });

  // Sample customer record
  customers.push({
    id: nextCustomerId++,
    name: 'TechCorp Solutions Ltd',
    email: 'contact@techcorp-solutions.com',
    phone: '+972-3-1234567',
    created_at: new Date()
  });
}

/**
 * Memory Repository API
 * Implements all data access methods for the security project
 */
const memoryRepo = {
  // אתחול הנתונים
  init() {
    initializeData();
    console.log('[MEMORY-REPO] Repository initialized successfully');
  },

  // *** פונקציות משתמשים ***
  async createUser(username, email, passwordHash, salt) {
    const user = {
      id: nextUserId++,
      username,
      email,
      password_hash: passwordHash,
      salt,
      failed_attempts: 0,
      locked_until: null,
      created_at: new Date()
    };
    users.push(user);
    console.log('[MEMORY-REPO] User created successfully:', username);
    return user;
  },

  async findByUsername(username) {
    return users.find(u => u.username === username) || null;
  },

  async findByEmail(email) {
    return users.find(u => u.email === email) || null;
  },

  async findById(id) {
    return users.find(u => u.id === id) || null;
  },

  async updatePassword(userId, passwordHash, salt) {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.password_hash = passwordHash;
      user.salt = salt;
      console.log('[MEMORY-REPO] Password updated for user ID:', userId);
    }
  },

  // *** היסטוריית סיסמאות (דרישה: 3 פעמים) ***
  async addPasswordHistory(userId, passwordHash) {
    passwordHistory.push({
      id: passwordHistory.length + 1,
      user_id: userId,
      password_hash: passwordHash,
      created_at: new Date()
    });
    console.log('[MEMORY-REPO] Password history entry added for user ID:', userId);
  },

  async getPasswordHistory(userId, limit = 3) {
    return passwordHistory
      .filter(p => p.user_id === userId)
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit);
  },

  // *** ניהול כישלונות התחברות (דרישה: 3 ניסיונות) ***
  async incFailed(username) {
    const user = users.find(u => u.username === username);
    if (user) {
      user.failed_attempts++;
      if (user.failed_attempts >= 3) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 דקות
        console.log('[MEMORY-REPO] User account locked due to failed attempts:', username);
      }
      console.log(`[MEMORY-REPO] Failed login attempt ${user.failed_attempts}/3 for user:`, username);
    }
  },

  async resetFailed(username) {
    const user = users.find(u => u.username === username);
    if (user) {
      user.failed_attempts = 0;
      user.locked_until = null;
      console.log('[MEMORY-REPO] Failed login attempts reset for user:', username);
    }
  },

  // *** איפוס סיסמה ("שכח סיסמא" עם SHA-1) ***
  async createPasswordReset(userId, resetToken) {
    const reset = {
      id: nextResetId++,
      user_id: userId,
      reset_token: resetToken, // SHA-1 hash
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // שעה
      used: false,
      created_at: new Date()
    };
    passwordResets.push(reset);
    console.log('[MEMORY-REPO] Password reset token created for user ID:', userId);
    return reset;
  },

  async findPasswordReset(resetToken) {
    return passwordResets.find(r => 
      r.reset_token === resetToken && 
      !r.used && 
      r.expires_at > new Date()
    ) || null;
  },

  async markResetAsUsed(resetToken) {
    const reset = passwordResets.find(r => r.reset_token === resetToken);
    if (reset) {
      reset.used = true;
      console.log('[MEMORY-REPO] Reset token marked as used:', resetToken);
    }
  },

  // *** לקוחות (דרישה: הכנסת לקוח חדש + הצגה) ***
  async addCustomer(name, email, phone = null) {
    const customer = {
      id: nextCustomerId++,
      name,
      email,
      phone,
      created_at: new Date()
    };
    customers.push(customer);
    console.log('[MEMORY-REPO] Customer added successfully:', name);
    return customer;
  },

  async listCustomers() {
    return [...customers]; // עותק של המערך
  },

  async getCustomerById(id) {
    return customers.find(c => c.id === id) || null;
  },

  // פונקציות עזר לדיבוג
  async getAllUsers() {
    return [...users];
  },

  async clearAll() {
    users.length = 0;
    passwordHistory.length = 0;
    customers.length = 0;
    passwordResets.length = 0;
    nextUserId = 1;
    nextCustomerId = 1;
    nextResetId = 1;
    console.log('[MEMORY-REPO] All data cleared from memory');
  }
};

// אתחול אוטומטי
memoryRepo.init();

module.exports = memoryRepo;