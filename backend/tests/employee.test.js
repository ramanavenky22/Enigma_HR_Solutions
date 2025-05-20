const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Employee Management Tests', () => {
  const authToken = process.env.TEST_JWT_TOKEN;
  let testEmployeeId;

  describe('Employee Data Validation', () => {
    it('should validate employee data structure', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Venkat',
          lastName: 'Garbham',
          email: 'venkat.garbham@example.com',
          position: 'HR Manager',
          department: 'Human Resources'
        });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.all.keys('id', 'firstName', 'lastName', 'email', 'position', 'department');
      testEmployeeId = response.body.id;
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          position: 'Developer'
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.include('email');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test'
          // Missing required fields
        });

      expect(response.status).to.equal(400);
      expect(response.body.message).to.include('required');
    });
  });

  describe('Employee Operations', () => {
    it('should format employee data correctly', async () => {
      const response = await request(app)
        .get(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.deep.include({
        firstName: 'Venkat',
        lastName: 'Garbham',
        email: 'venkat.garbham@example.com'
      });
    });

    it('should handle employee updates', async () => {
      const response = await request(app)
        .put(`/api/employees/${testEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          position: 'Senior HR Manager'
        });

      expect(response.status).to.equal(200);
      expect(response.body.position).to.equal('Senior HR Manager');
      expect(response.body.department).to.equal('Human Resources');
    });
  });

  describe('Employee Search', () => {
    it('should filter employees by department', async () => {
      const response = await request(app)
        .get('/api/employees?department=Human Resources')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      expect(response.body.every(e => e.department === 'Human Resources')).to.be.true;
    });

    it('should sort employees by name', async () => {
      const response = await request(app)
        .get('/api/employees?sort=lastName')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an('array');
      const names = response.body.map(e => e.lastName);
      const sortedNames = [...names].sort();
      expect(names).to.deep.equal(sortedNames);
    });
  });
});