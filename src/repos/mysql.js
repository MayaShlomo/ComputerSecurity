const mysql = require('mysql2/promise');
const MODE = process.env.MODE || 'secure'; // 'vuln' | 'secure'
let connection = null;

const mysqlRepo = {
  async init() {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'comunicationltd'
    });
    console.log('✅ Connected to MySQL database (MODE=' + MODE + ')');
  },

  async createUser(username, email, passwordHash, salt) {
    const [res] = await connection.execute(
      'INSERT INTO users (username, email, password_hash, salt) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, salt]
    );
    return { id: res.insertId, username, email, password_hash: passwordHash, salt };
  },

  async findByUsername(username) {
    if (MODE === 'vuln') {
      const [rows] = await connection.query(`SELECT * FROM users WHERE username = '${username}'`);
      return rows[0] || null;
    } else {
      const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    }
  },

  async findByEmail(email) {
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  },

  async updatePassword(userId, passwordHash /*, saltIgnored */) {
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );
  },

  async addPasswordHistory(userId, passwordHash) {
    await connection.execute(
      'INSERT INTO password_history (user_id, password_hash) VALUES (?, ?)',
      [userId, passwordHash]
    );
  },

  async getPasswordHistory(userId, limit = 3) {
    const safeLimit = Number.isFinite(+limit) ? Math.max(0, parseInt(limit, 10)) : 3;
    const [rows] = await connection.query(
      `SELECT password_hash 
       FROM password_history 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ${safeLimit}`,
      [userId]
    );
    return rows;
  },

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
  },

  async resetFailed(username) {
    await connection.execute(
      'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE username = ?',
      [username]
    );
  },

  async createPasswordReset(userId, resetToken) {
    await connection.execute(
      'INSERT INTO password_resets (user_id, reset_token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))',
      [userId, resetToken]
    );
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
  },

  async addCustomer(name, email, phone = null) {
    if (MODE === 'vuln') {
      const sql = `INSERT INTO customers (name, email, phone) VALUES ('${name}', '${email}', '${phone}')`;
      await connection.query(sql);
      const [rows] = await connection.query('SELECT * FROM customers ORDER BY id DESC LIMIT 1');
      return rows[0];
    } else {
      const [res] = await connection.execute(
        'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
        [name, email, phone]
      );
      return { id: res.insertId, name, email, phone };
    }
  },

  async listCustomers() {
    const [rows] = await connection.execute(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
    return rows;
  }
};

module.exports = mysqlRepo;
