/**
 * Authentication Tests
 * Tests the authentication middleware and related functionality
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { expect } = require('chai');

describe('Authentication Tests', () => {
  let validToken;
  let invalidToken;

  before(() => {
    // Generate test tokens
    validToken = jwt.sign({ sub: 'test-user' }, process.env.JWT_SECRET);
    invalidToken = 'invalid-token';
  });

  describe('JWT Authentication Middleware', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).to.not.equal(401);
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${invalidToken}`);
      
      expect(response.status).to.equal(401);
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/employees');
      
      expect(response.status).to.equal(401);
    });
  });

  describe('User Synchronization', () => {
    it('should sync user data on valid request', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).to.not.equal(500);
      expect(response.body).to.have.property('user');
    });
  });
}); 