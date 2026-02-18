module.exports = {
  async up(db, client) {
    // Create collections for existing models
    await db.createCollection('users');
    await db.createCollection('notes');
    await db.createCollection('workspaces');
    await db.createCollection('noteversions');
    await db.createCollection('auditlogs');

    // Create collections for new RBAC models
    await db.createCollection('folders');
    await db.createCollection('groups');
    await db.createCollection('permissions');
    await db.createCollection('accesslinks');

    // Create indexes as defined in models
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('noteversions').createIndex({ noteId: 1, versionNumber: 1 });
    await db.collection('folders').createIndex({ path: 1 }, { unique: true });
    await db.collection('folders').createIndex({ workspaceId: 1 });
    await db.collection('groups').createIndex({ path: 1 }, { unique: true });
    await db.collection('groups').createIndex({ workspaceId: 1 });
    await db.collection('groups').createIndex({ members: 1 });
    await db.collection('permissions').createIndex({ resourcePath: 1 });
    await db.collection('permissions').createIndex({ subjectId: 1, subjectType: 1 });
    await db.collection('permissions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection('accesslinks').createIndex({ token: 1 }, { unique: true });
    await db.collection('accesslinks').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    // Note: Other indexes can be added here if needed
    console.log('Initial migration completed: collections and indexes created.');
  },

  async down(db, client) {
    // Drop collections
    await db.collection('users').drop();
    await db.collection('notes').drop();
    await db.collection('workspaces').drop();
    await db.collection('noteversions').drop();
    await db.collection('auditlogs').drop();

    console.log('Initial migration rolled back: collections dropped.');
  }
};
