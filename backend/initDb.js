const db = require('./config/db');

const initDB = () => {
  // EMPLOYEES TABLE
  const createEmployeesTable = `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auth0_id VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(20),
      department VARCHAR(100),
      title VARCHAR(100),
      status ENUM('active', 'onboarding', 'offboarding', 'inactive') DEFAULT 'active',
      manager_id INT,
      date_joined DATE,
      base_salary DECIMAL(10, 2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // NOTIFICATIONS TABLE
  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message TEXT NOT NULL,
      target_role ENUM('Employee', 'Manager', 'HR') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.query(createEmployeesTable, (err) => {
    if (err) console.error('❌ Failed to create employees table:', err.message);
    else {
      console.log('✅ Employees table ready');
      seedEmployees();
    }
  });

  db.query(createNotificationsTable, (err) => {
    if (err) console.error('❌ Failed to create notifications table:', err.message);
    else {
      console.log('✅ Notifications table ready');
      seedNotifications();
    }
  });
};

// Insert sample employees
const seedEmployees = () => {
  const checkSql = 'SELECT COUNT(*) as count FROM employees';
  db.query(checkSql, (err, result) => {
    if (result[0].count === 0) {
      const insertSql = `
        INSERT INTO employees
        (auth0_id, name, email, phone, department, title, status, date_joined, base_salary)
        VALUES ?
      `;
      const values = [
        ['auth0|hr001', 'Alice HR', 'alice.hr@example.com', '555-1234', 'HR', 'HR Manager', 'active', '2022-01-01', 90000.00],
        ['auth0|mgr002', 'Bob Manager', 'bob.manager@example.com', '555-5678', 'Engineering', 'Team Lead', 'active', '2022-03-15', 80000.00],
        ['auth0|emp003', 'Charlie Dev', 'charlie.dev@example.com', '555-9999', 'Engineering', 'Developer', 'active', '2023-06-01', 60000.00]
      ];

      db.query(insertSql, [values], (err) => {
        if (err) console.error('❌ Failed to insert employees:', err.message);
        else console.log('✅ Sample employees inserted');
      });
    }
  });
};

// Insert sample notifications
const seedNotifications = () => {
  const checkSql = 'SELECT COUNT(*) as count FROM notifications';
  db.query(checkSql, (err, result) => {
    if (result[0].count === 0) {
      const insertSql = `
        INSERT INTO notifications (message, target_role) VALUES ?
      `;
      const values = [
        ['Welcome to the HR Portal! 🎉', 'Employee'],
        ['Team performance reviews coming up.', 'Manager'],
        ['Onboarded 3 new employees this week.', 'HR']
      ];

      db.query(insertSql, [values], (err) => {
        if (err) console.error('❌ Failed to insert notifications:', err.message);
        else console.log('✅ Sample notifications inserted');
      });
    }
  });
};

module.exports = initDB;
