// tests/load-test.js
// Run with: node tests/load-test.js
const autocannon = require('autocannon');

const BASE_URL = 'http://localhost:5000/api/v1';

// Safe helper to avoid undefined.toFixed() crashes
const safeNumber = (value) => (value ?? 0).toFixed(2);

// Helper to run a load test safely
const runLoadTest = (name, config) => {
  return new Promise((resolve) => {
    console.log(`\n🚀 Starting load test: ${name}`);
    console.log('─'.repeat(70));

    autocannon({
      ...config,
      url: config.url || BASE_URL,
    }, (err, result) => {
      if (err) {
        console.error(`❌ ${name} failed:`, err.message);
        console.log('💡 Tip: Make sure your server is running (npm start)');
        return resolve();
      }

      if (!result || !result.latency) {
        console.error(`❌ ${name} returned no results. Is the server running?`);
        return resolve();
      }

      console.table({
        'Requests/sec': safeNumber(result.requests?.average),
        'Avg Latency (ms)': safeNumber(result.latency?.average),
        'p95 Latency (ms)': safeNumber(result.latency?.p95),
        'p99 Latency (ms)': safeNumber(result.latency?.p99),
        'Total Requests': result.requests?.total || 0,
        'Errors': result.errors || 0,
      });

      const p95 = result.latency.p95 || 0;
      if (p95 > 400) {
        console.error(`❌ ${name} → Performance too slow (p95 = ${p95.toFixed(2)}ms)`);
      } else {
        console.log(`✅ ${name} → PASSED`);
      }
      resolve();
    });
  });
};

const runAllTests = async () => {
  console.log('🔥 CHURCH API LOAD TEST STARTED');
  console.log('═'.repeat(70));

  // ==================== MINISTRIES ====================
  await runLoadTest('Ministries - List + Search', {
    url: `${BASE_URL}/ministries?page=1&limit=50&searchTerm=Test`,
    connections: 80,
    duration: 20,
    pipelining: 1,
    method: 'GET'
  });

  await runLoadTest('Ministries - Create', {
    url: `${BASE_URL}/ministries`,
    connections: 30,
    duration: 15,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: `LoadTest Ministry ${Date.now()}-${Math.random().toString(36).slice(2)}`,
      desc: 'Load test description',
      headName: 'Pastor Load'
    })
  });

  // ==================== SERMONS ====================
  await runLoadTest('Sermons - List + Search', {
    url: `${BASE_URL}/sermons?page=1&limit=50&searchTerm=Test`,
    connections: 80,
    duration: 20,
    pipelining: 1,
    method: 'GET'
  });

  await runLoadTest('Sermons - Create', {
    url: `${BASE_URL}/sermons`,
    connections: 30,
    duration: 15,
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      title: `LoadTest Sermon ${Date.now()}-${Math.random().toString(36).slice(2)}`,
      pastor: 'Pastor Load'
    })
  });

  console.log('\n🎉 LOAD TEST FINISHED');
};

runAllTests();