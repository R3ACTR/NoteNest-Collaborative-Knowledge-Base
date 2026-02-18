import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import noteRoutes from '../src/routes/notes';
import User from '../src/models/User';
import Workspace from '../src/models/Workspace';
import { authenticateToken } from '../src/middleware/auth';

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret';

const app = express();
app.use(express.json());
app.use('/api/notes', authenticateToken, noteRoutes);

describe('Notes API', () => {
  let testUser: any;
  let testWorkspace: any;
  let authToken: string;

  beforeEach(async () => {
    // Create test user
    testUser = new User({
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
      role: 'editor'
    });
    await testUser.save();

    // Create test workspace
    testWorkspace = new Workspace({
      name: 'Test Workspace',
      description: 'A test workspace',
      owner: testUser._id.toString(),
      members: [{ userId: testUser._id.toString(), role: 'editor' }]
    });
    await testWorkspace.save();

    // Generate auth token
    authToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET || 'secret');
  });

  describe('POST /api/notes', () => {
    it('should create a new note', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note',
        workspaceId: testWorkspace._id.toString(),
        authorId: testUser._id.toString()
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(noteData.title);
      expect(response.body.content).toBe(noteData.content);
      expect(response.body.workspaceId).toBe(noteData.workspaceId);
      expect(response.body.version).toBe(1); // Check version initialization
    });
  });

  describe('GET /api/notes/workspace/:workspaceId', () => {
    it('should get notes for a workspace', async () => {
      // First create a note
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note',
        workspaceId: testWorkspace._id.toString(),
        authorId: testUser._id.toString()
      };
      const note = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);

      const response = await request(app)
        .get(`/api/notes/workspace/${testWorkspace._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/notes/:id', () => {
    it('should update a note', async () => {
      // Create a note first
      const noteData = {
        title: 'Original Title',
        content: 'Original content',
        workspaceId: testWorkspace._id.toString(),
        authorId: testUser._id.toString()
      };
      const createResponse = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);

      const noteId = createResponse.body._id;
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        authorId: testUser._id.toString()
      };

      const response = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updateData.title);
      expect(response.body.content).toBe(updateData.content);
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('should delete a note', async () => {
      // Create a note first
      const noteData = {
        title: 'Note to Delete',
        content: 'This will be deleted',
        workspaceId: testWorkspace._id.toString(),
        authorId: testUser._id.toString()
      };
      const createResponse = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);

      const noteId = createResponse.body._id;

      const response = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ authorId: testUser._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Note deleted');
    });
  });

  describe('OCC Integration', () => {
    it('should handle concurrent updates properly', async () => {
      // Create a note
      const noteData = {
        title: 'Concurrent Test',
        content: 'Original content',
        workspaceId: testWorkspace._id.toString(),
        authorId: testUser._id.toString()
      };
      const createResponse = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noteData);

      const noteId = createResponse.body._id;

      // First update (should succeed)
      const update1 = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Update 1',
          content: 'Content 1',
          authorId: testUser._id.toString(),
          expectedVersion: 1
        });

      expect(update1.status).toBe(200);
      expect(update1.body.version).toBe(2);

      // Second update with correct version (should succeed)
      const update2 = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Update 2',
          content: 'Content 2',
          authorId: testUser._id.toString(),
          expectedVersion: 2
        });

      expect(update2.status).toBe(200);
      expect(update2.body.version).toBe(3);

      // Third update with stale version (should fail)
      const update3 = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Update 3',
          content: 'Content 3',
          authorId: testUser._id.toString(),
          expectedVersion: 1 // Stale
        });

      expect(update3.status).toBe(409);
    });
  });
});
