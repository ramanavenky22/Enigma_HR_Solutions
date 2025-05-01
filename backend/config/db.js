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
    const [results] = await promiseDb.execute(sql, params);
    return results;
  } catch (err) {
    console.error('Query error:', err);
    console.error('Failed query:', sql);
    console.error('Query parameters:', params);
    throw err;
  }
};

module.exports = { db: promiseDb, query };
