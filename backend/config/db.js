const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectTimeout: 10000,
  multipleStatements: true
});

// Handle connection errors
db.on('error', (err) => {
  console.error('MySQL connection error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Database connection was closed. Reconnecting...');
    db.connect();
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.log('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.log('Database connection was refused.');
  }
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    process.exit(1);
  }
  console.log('✅ Connected to MySQL DB');

  // Test the connection with a simple query
  db.query('SELECT 1', (err, results) => {
    if (err) {
      console.error('Error testing database connection:', err);
    } else {
      console.log('✅ Database connection test successful');
      initializeNotificationsTable(); // 🚀 Create + seed notifications table
    }
  });
});

const promiseDb = db.promise();

// Core query wrapper
const query = async (sql, params) => {
  try {
    console.log('Executing query:', sql);
    console.log('With parameters:', params);

    if (params) {
      params = params.map(param => {
        if (param instanceof Date) {
          return param.toISOString().slice(0, 10);
        }
        return param;
      });
    }

    const [results] = await promiseDb.query(sql, params);
    return results;
  } catch (err) {
    console.error('Query error:', err);
    console.error('Failed query:', sql);
    console.error('Query parameters:', params);
    throw err;
  }
};

// Transaction helpers
const startTransaction = async () => await query('START TRANSACTION');
const commitTransaction = async () => await query('COMMIT');
const rollbackTransaction = async () => await query('ROLLBACK');

// 🛠 Table bootstrap for notifications
const initializeNotificationsTable = async () => {
  try {
    await promiseDb.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        \`read\` TINYINT(1) DEFAULT 0,
        action_type VARCHAR(50),
        action_data JSON
      );
    `);

    const [existing] = await promiseDb.query(`SELECT COUNT(*) as count FROM notifications`);
    if (existing[0].count === 0) {
      await promiseDb.query(`
        INSERT INTO notifications (user_id, \`type\`, message, \`read\`, action_type, action_data)
        VALUES
          ('auth0|10001', 'employee_joined', 'A new employee has joined your team.', 0, 'profile', '{"id": 10023}'),
          ('auth0|10001', 'report_ready', 'Your Q2 performance report is now available.', 0, 'report', '{"reportId": 453}'),
          ('auth0|10001', 'meeting_scheduled', 'Your 1:1 with your manager is scheduled for Friday.', 1, 'meeting', '{"meetingId": 892}'),
          ('auth0|10002', 'employee_joined', 'Cristina Bouloucos has joined your department.', 0, 'profile', '{"id": 10016}'),
          ('auth0|10003', 'report_ready', 'Your training report has been finalized.', 1, 'report', '{"reportId": 456}'),
          ('auth0|10004', 'meeting_scheduled', 'Team sync scheduled for tomorrow at 10 AM.', 0, 'meeting', '{"meetingId": 901}');
      `);
      console.log('✅ Notifications table created and seeded with mock data');
    } else {
      console.log('ℹ️ Notifications table already has data');
    }
  } catch (err) {
    console.error('❌ Error initializing notifications table:', err);
  }
};

module.exports = {
  db: promiseDb,
  query,
  startTransaction,
  commitTransaction,
  rollbackTransaction
};
