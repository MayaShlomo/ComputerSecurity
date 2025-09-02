// שכבת MySQL - מסד נתונים אמיתי
// יעבוד כשיהיה MySQL מותקן

const mysql = require('mysql2/promise');

let connection = null;

const mysqlRepo = {
  // התחברות למסד נתונים
  async init() {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'comunicationltd'
      });
      console.log('Connected to MySQL database');
    } catch (error) {
      console.error('MySQL connection failed:', error.message);
      throw error;
    }
  },

  // *** פונקציות משתמשים ***
  async createUser(username, email, passwordHash, salt) {
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, salt]
    );
    console.log('User created:', username);
    return { 
      id: result.insertId, 
      username, 
      email,
      password_hash: passwordHash,
      salt,
      failed_attempts: 0,
      locked_until: null,
      created_at: new Date()
    };
  },

  async findByUsername(username) {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ?', 
      [username]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ?', 
      [id]
    );
    return rows[0] || null;
  },

  async updatePassword(userId, passwordHash, salt) {
    await connection.execute(
      'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?',
      [passwordHash, salt, userId]
    );
    console.log('Password updated for user ID:', userId);
  },

  // *** היסטוריית סיסמאות ***
  async addPasswordHistory(userId, passwordHash) {
    await connection.execute(
      'INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)',
      [userId, passwordHash]
    );
    console.log('Password history added for user ID:', userId);
  },

  async getPasswordHistory(userId, limit = 3) {
    const [rows] = await connection.execute(
      'SELECT password_hash FROM password_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  },

  // *** ניהול כישלונות התחברות ***
  async incFailed(username) {
    await connection.execute(
      `UPDATE users SET 
       failed_attempts = failed_attempts + 1,
       locked_until = CASE 
         WHEN failed_attempts >= 2 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) 
         ELSE locked_until 
       END 
       WHERE username = ?`,
      [username]
    );
    console.log('Failed attempt recorded for:', username);
  },

  async resetFailed(username) {
    await connection.execute(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE username = ?',
      [username]
    );
    console.log('Failed attempts reset for:', username);
  },

  // *** איפוס סיסמה ***
  async createPasswordReset(userId, resetToken) {
    const [result] = await connection.execute(
      'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))',
      [userId, resetToken]
    );
    console.log('Password reset token created for user ID:', userId);
    return { 
      id: result.insertId,
      user_id: userId,
      reset_token: resetToken,
      expires_at: new Date(Date.now() + 60 * 60 * 1000),
      used: false,
      created_at: new Date()
    };
  },

  async findPasswordReset(resetToken) {
    const [rows] = await connection.execute(
      'SELECT * FROM password_resets WHERE reset_token = ? AND used = FALSE AND expires_at > NOW()',
      [resetToken]
    );
    return rows[0] || null;
  },

  async markResetAsUsed(resetToken) {
    await connection.execute(
      'UPDATE password_resets SET used = TRUE WHERE reset_token = ?',
      [resetToken]
    );
    console.log('Reset token marked as used:', resetToken);
  },

  // *** לקוחות ***
  async addCustomer(name, email, phone = null) {
    const [result] = await connection.execute(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    console.log('Customer added:', name);
    return { 
      id: result.insertId, 
      name, 
      email, 
      phone,
      created_at: new Date()
    };
  },

  async listCustomers() {
    const [rows] = await connection.execute(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    return rows;
  },

  async getCustomerById(id) {
    const [rows] = await connection.execute(
      'SELECT * FROM customers WHERE id = ?', 
      [id]
    );
    return rows[0] || null;
  },

  // פונקציות עזר
  async getAllUsers() {
    const [rows] = await connection.execute('SELECT * FROM users ORDER BY created_at DESC');
    return rows;
  },

  // סגירת חיבור
  async close() {
    if (connection) {
      await connection.end();
      console.log('MySQL connection closed');
    }
  }
};

module.exports = mysqlRepo;