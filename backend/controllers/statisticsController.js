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
    const trends = await query(`
      SELECT 
        YEAR(from_date) as year,
        MONTH(from_date) as month,
        AVG(salary) as average_salary,
        MIN(salary) as min_salary,
        MAX(salary) as max_salary
      FROM salaries
      WHERE from_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY YEAR(from_date), MONTH(from_date)
      ORDER BY year ASC, month ASC
    `);

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
