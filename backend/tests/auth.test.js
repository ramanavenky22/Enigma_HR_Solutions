/**
 * Authentication Tests
 * Tests the authentication middleware and related functionality
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');

describe('Authentication Tests', () => {
  const authToken = process.env.TEST_JWT_TOKEN;

  describe('JWT Authentication Middleware', () => {
    it('should verify token format', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).to.not.equal(500);
      expect(response.headers).to.have.property('content-type').that.includes('json');
    });

    it('should validate token structure', async () => {
      const [header] = authToken.split('.');
      const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString());
      expect(decodedHeader).to.have.property('alg', 'RS256');
      expect(decodedHeader).to.have.property('typ', 'JWT');
    });

    it('should handle invalid tokens', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', 'Bearer invalid.token.here');
      
      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('message');
    });
  });

  describe('Authorization Flow', () => {
    it('should validate auth headers', async () => {
      const response = await request(app)
        .get('/api/employees')
        .set('Authorization', 'Bearer ' + authToken);
      
      expect(response.status).to.not.equal(403);
      expect(response.status).to.not.equal(401);
    });

    it('should process auth claims', async () => {
      const payload = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64').toString());
      expect(payload).to.have.property('sub');
      expect(payload).to.have.property('https://hr-portal.com/roles').that.includes('hr');
    });
  });
});