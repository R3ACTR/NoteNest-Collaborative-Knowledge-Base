const { MongoMemoryServer } = require('mongodb-memory-server');
(async () => {
  console.log('Starting MongoMemoryServer...');
  const mongod = await MongoMemoryServer.create({ instance: { port: 27017 }});
  console.log(`MongoMemoryServer running on ${mongod.getUri()}`);
})();
