const { query } = require('../config/db');

// Get overall employee statistics
const getEmployeeStats = async (req, res) => {
  try {
    // Get total employee count
    const [totalCount] = await query(
      'SELECT COUNT(*) as total FROM employees'
    );

    // Get department distribution
    const deptDistribution = await query(`
      SELECT d.dept_name, COUNT(*) as count
      FROM employees e
      INNER JOIN dept_emp de ON e.emp_no = de.emp_no
      INNER JOIN departments d ON de.dept_no = d.dept_no
      WHERE de.to_date = '9999-01-01'
      GROUP BY d.dept_name
    `);

    // Get gender distribution
    const [genderDistribution] = await query(`
      SELECT 
        SUM(CASE WHEN gender = 'M' THEN 1 ELSE 0 END) as male_count,
        SUM(CASE WHEN gender = 'F' THEN 1 ELSE 0 END) as female_count
      FROM employees
    `);

    // Get salary statistics
    const [salaryStats] = await query(`
      SELECT 
        AVG(salary) as avg_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary
      FROM salaries
      WHERE to_date = '9999-01-01'
    `);

    // Get title distribution
    const titleDistribution = await query(`
      SELECT title, COUNT(*) as count
      FROM titles
      WHERE to_date = '9999-01-01'
      GROUP BY title
    `);

    // Get hiring trends (last 12 months)
    const hiringTrends = await query(`
      SELECT YEAR(hire_date) as year, MONTH(hire_date) as month, COUNT(*) as count
      FROM employees
      WHERE hire_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(hire_date), MONTH(hire_date)
      ORDER BY year ASC, month ASC
    `);

    // First, get a list of all months in the last 12 months
    const monthsList = await query(`
      WITH RECURSIVE months AS (
        SELECT DATE_SUB(CURDATE(), INTERVAL 11 MONTH) AS month_date
        UNION ALL
        SELECT DATE_ADD(month_date, INTERVAL 1 MONTH)
        FROM months
        WHERE month_date < CURDATE()
      )
      SELECT 
        YEAR(month_date) as year,
        MONTH(month_date) as month
      FROM months;
    `);

    // Then get salary data for each month
    const trends = await Promise.all(monthsList.map(async ({ year, month }) => {
      const [salaryData] = await query(`
        SELECT 
          ROUND(AVG(salary)) as average_salary,
          MIN(salary) as min_salary,
          MAX(salary) as max_salary
        FROM salaries
        WHERE YEAR(from_date) <= ? 
        AND MONTH(from_date) <= ?
        AND (YEAR(to_date) > ? OR (YEAR(to_date) = ? AND MONTH(to_date) >= ?))
        AND to_date = '9999-01-01'
      `, [year, month, year, year, month]);

      return {
        year,
        month,
        average_salary: salaryData.average_salary || 0,
        min_salary: salaryData.min_salary || 0,
        max_salary: salaryData.max_salary || 0
      };
    }));

    res.json({
      totalEmployees: totalCount.total,
      departmentDistribution: deptDistribution,
      genderDistribution,
      salaryStatistics: {
        average: Math.round(salaryStats.avg_salary),
        minimum: salaryStats.min_salary,
        maximum: salaryStats.max_salary
      },
      titleDistribution,
      hiringTrends
    });
  } catch (error) {
    console.error('Error fetching employee statistics:', error);
    res.status(500).json({ 
      error: 'Error fetching employee statistics',
      details: error.message 
    });
  }
};

// Get salary trends over time
const getSalaryTrends = async (req, res) => {
  try {
    // First, get a list of all months in the last 12 months
    const monthsList = await query(`
      WITH RECURSIVE months AS (
        SELECT 
          CURDATE() - INTERVAL 11 MONTH AS month_date
        UNION ALL
        SELECT 
          month_date + INTERVAL 1 MONTH
        FROM months
        WHERE month_date < CURDATE()
      )
      SELECT 
        YEAR(month_date) as year,
        MONTH(month_date) as month
      FROM months
    `);

    // Then get salary data for each month
    const trends = await Promise.all(monthsList.map(async ({ year, month }) => {
      const [salaryData] = await query(`
        SELECT 
          ROUND(AVG(salary)) as average_salary,
          MIN(salary) as min_salary,
          MAX(salary) as max_salary
        FROM salaries
        WHERE to_date = '9999-01-01'
        AND from_date <= DATE_FORMAT(?, '%Y-%m-%d')
      `, [new Date(year, month - 1).toISOString().split('T')[0]]);

      return {
        year,
        month,
        average_salary: salaryData.average_salary || 0,
        min_salary: salaryData.min_salary || 0,
        max_salary: salaryData.max_salary || 0
      };
    }));

    res.json(trends);
  } catch (error) {
    console.error('Error fetching salary trends:', error);
    res.status(500).json({ 
      error: 'Error fetching salary trends',
      details: error.message 
    });
  }
};

// Get department growth
const getDepartmentGrowth = async (req, res) => {
  try {
    const growth = await query(`
      SELECT 
        d.dept_name,
        COUNT(CASE WHEN YEAR(e.hire_date) = YEAR(CURDATE()) THEN 1 END) as new_hires,
        COUNT(*) as total_employees,
        ROUND((COUNT(CASE WHEN YEAR(e.hire_date) = YEAR(CURDATE()) THEN 1 END) * 100.0 / COUNT(*)), 2) as growth_rate
      FROM departments d
      INNER JOIN dept_emp de ON d.dept_no = de.dept_no
      INNER JOIN employees e ON de.emp_no = e.emp_no
      WHERE de.to_date = '9999-01-01'
      GROUP BY d.dept_name
    `);

    res.json(growth);
  } catch (error) {
    console.error('Error fetching department growth:', error);
    res.status(500).json({ 
      error: 'Error fetching department growth',
      details: error.message 
    });
  }
};

module.exports = {
  getEmployeeStats,
  getSalaryTrends,
  getDepartmentGrowth
};
