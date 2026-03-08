const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/*
This file is used to create a fake MongoDB
What it does: It spins up a fake, invisible MongoDB in your RAM.
Why? It’s incredibly fast, and the moment the tests finish, the database vanishes. No cleanup is required on your actual hard drive.
*/

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Force disconnect any real connection first (prevents the error)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
  console.log('✅ Test MongoDB Memory Server connected successfully');
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  console.log('🧪 Test MongoDB Memory Server stopped');
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});