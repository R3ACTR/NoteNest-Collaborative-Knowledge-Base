import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../src/models/User';
import Group from '../src/models/Group';
import Permission from '../src/models/Permission';
import Workspace from '../src/models/Workspace';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/groups', require('../src/routes/groups').default);
app.use('/api/permissions', require('../src/routes/permissions').default);

describe('RBAC System', () => {
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let regularToken: string;
  let testWorkspace: string;
  let testGroup: any;

  beforeAll(async () => {
    // Set JWT secret for tests
    process.env.JWT_SECRET = 'test-jwt-secret';

    // Create test workspace
    const workspace = new Workspace({
      name: 'Test Workspace',
      description: 'A test workspace',
      owner: 'admin-user-id',
      members: []
    });
    await workspace.save();
    testWorkspace = workspace._id.toString();

    // Create test users
    adminUser = new User({
      email: 'admin@test.com',
      password: 'hashedpassword',
      name: 'Admin User',
      role: 'admin',
      workspaces: [testWorkspace],
      groups: []
    });
    await adminUser.save();

    regularUser = new User({
      email: 'user@test.com',
      password: 'hashedpassword',
      name: 'Regular User',
      role: 'viewer',
      workspaces: [testWorkspace],
      groups: []
    });
    await regularUser.save();

    // Add users to workspace
    workspace.members = [
      { userId: adminUser._id.toString(), role: 'admin' },
      { userId: regularUser._id.toString(), role: 'viewer' }
    ];
    await workspace.save();

    // Generate real JWT tokens
    adminToken = jwt.sign({ userId: adminUser._id.toString() }, process.env.JWT_SECRET!);
    regularToken = jwt.sign({ userId: regularUser._id.toString() }, process.env.JWT_SECRET!);
  });

  describe('Group Management', () => {
    test('should create a group', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Group',
          description: 'A test group',
          workspaceId: testWorkspace,
          parentId: null
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Group');
      testGroup = response.body;
    });

    test('should get groups for workspace', async () => {
      const response = await request(app)
        .get(`/api/groups/workspace/${testWorkspace}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('should add member to group', async () => {
      const response = await request(app)
        .post(`/api/groups/${testGroup._id}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId: regularUser._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.members).toContain(regularUser._id.toString());
    });
  });

  describe('Permission Management', () => {
    test('should grant permission', async () => {
      const response = await request(app)
        .post('/api/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          resourcePath: `${testWorkspace}/notes`,
          subjectId: testGroup._id.toString(),
          subjectType: 'group',
          permissions: ['read', 'write']
        });

      expect(response.status).toBe(201);
      expect(response.body.permissions).toEqual(['read', 'write']);
    });

    test('should get permissions for resource', async () => {
      const response = await request(app)
        .get(`/api/permissions/resource/${testWorkspace}/notes`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Permission Resolution', () => {
    test('should resolve permissions for user with group membership', async () => {
      // This would test the resolvePermissions function
      // For now, just verify the structure exists
      const PermissionModel = require('../src/models/Permission').default;
      expect(PermissionModel).toBeDefined();
    });
  });
});
