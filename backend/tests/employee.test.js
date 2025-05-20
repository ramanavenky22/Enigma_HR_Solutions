/**
 * Employee Management Tests
 * Tests the employee-related API endpoints and functionality
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { expect } = require('chai');

describe('Employee Management Tests', () => {
  let authToken;
  let testEmployeeId;

  before(() => {
    // Generate admin token for testing
    authToken = jwt.sign(
      { sub: 'admin-user', role: 'admin' },
      process.env.JWT_SECRET
    );
  });

  describe('Employee CRUD Operations', () => {
    it('should create a new employee', async () => {
      const employeeData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Software Engineer',
        department: 'Engineering'
      };

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(employeeData);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
      testEmployeeId = response.body.id;
    });

    it('should retrieve employee details', async () => {
      const response = await request(app)
        .get(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('firstName', 'John');
      expect(response.body).to.have.property('lastName', 'Doe');
    });

    it('should update employee information', async () => {
      const updateData = {
        position: 'Senior Software Engineer'
      };

      const response = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('position', 'Senior Software Engineer');
    });

    it('should list all employees', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      expect(response.body.length).to.be.greaterThan(0);
    });

    it('should delete an employee', async () => {
      const response = await request(app)
        .delete(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
    });
  });

  describe('Employee Validation', () => {
    it('should validate required fields', async () => {
      const invalidData = {
        firstName: 'Jane'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });

    it('should validate email format', async () => {
      const invalidData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'invalid-email',
        position: 'Developer',
        department: 'IT'
      };

      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('error');
    });
  });

  describe('System Reliability Tests', () => {
    it('should handle concurrent employee creation', async () => {
      const employeePromises = Array(5).fill().map((_, index) => {
        const employeeData = {
          firstName: `Concurrent${index}`,
          lastName: `User${index}`,
          email: `concurrent${index}@example.com`,
          position: 'Developer',
          department: 'Engineering'
        };

        return request(app)
          .post('/api/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send(employeeData);
      });

      const results = await Promise.all(employeePromises);
      results.forEach(response => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
      });
    });

    it('should handle invalid authentication gracefully', async () => {
      const invalidTokens = [
        'invalid-token',
        'Bearer invalid-token',
        'Bearer ',
        null
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/employees')
          .set('Authorization', token);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('error');
      }
    });

    it('should handle malformed request data', async () => {
      const malformedData = [
        { firstName: 123 }, // Invalid type
        { email: 'test@example.com', firstName: '' }, // Empty required field
        { firstName: 'A'.repeat(256) }, // Too long field
        { department: null } // Null value
      ];

      for (const data of malformedData) {
        const response = await request(app)
          .post('/api/employees')
          .set('Authorization', `Bearer ${authToken}`)
          .send(data);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
      }
    });

    it('should handle non-existent employee operations', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      const operations = [
        () => request(app).get(`/api/employees/${nonExistentId}`),
        () => request(app).put(`/api/employees/${nonExistentId}`),
        () => request(app).delete(`/api/employees/${nonExistentId}`)
      ];

      for (const operation of operations) {
        const response = await operation()
          .set('Authorization', `Bearer ${authToken}`);
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error');
      }
    });

    it('should handle pagination and filtering correctly', async () => {
      const queries = [
        '/api/employees?page=1&limit=10',
        '/api/employees?department=Engineering',
        '/api/employees?position=Developer',
        '/api/employees?page=999&limit=10' // Out of range page
      ];

      for (const query of queries) {
        const response = await request(app)
          .get(query)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        if (query.includes('page=999')) {
          expect(response.body.length).to.equal(0);
        }
      }
    });

    it('should handle database connection issues gracefully', async () => {
      // Simulate database connection issue by temporarily modifying the database connection
      const originalDbConnection = app.locals.db;
      app.locals.db = null;

      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error');

      // Restore database connection
      app.locals.db = originalDbConnection;
    });
  });
}); 