module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/setEnv.js'],        
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
};