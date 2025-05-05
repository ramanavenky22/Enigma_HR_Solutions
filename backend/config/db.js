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
    }
  });
});

// Convert to promise-based connection with error logging wrapper
const promiseDb = db.promise();

// Add query wrapper for better error logging
const query = async (sql, params) => {
  try {
    console.log('Executing query:', sql);
    console.log('With parameters:', params);
    
    // Format dates to MySQL format if needed
    if (params) {
      params = params.map(param => {
        if (param instanceof Date) {
          return param.toISOString().slice(0, 10);
        }
        return param;
      });
    }
    
    // Handle transaction commands
    if (sql.toLowerCase() === 'start transaction' || 
        sql.toLowerCase() === 'commit' || 
        sql.toLowerCase() === 'rollback') {
      const [results] = await promiseDb.query(sql);
      return results;
    }
    
    // Handle regular queries
    const [results] = await promiseDb.query(sql, params);
    return results;
  } catch (err) {
    console.error('Query error:', err);
    console.error('Failed query:', sql);
    console.error('Query parameters:', params);
    throw err;
  }
};

// Start a transaction
const startTransaction = async () => {
  await query('START TRANSACTION');
};

// Commit a transaction
const commitTransaction = async () => {
  await query('COMMIT');
};

// Rollback a transaction
const rollbackTransaction = async () => {
  await query('ROLLBACK');
};

module.exports = { db: promiseDb, query, startTransaction, commitTransaction, rollbackTransaction };
