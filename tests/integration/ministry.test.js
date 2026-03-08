const request = require('supertest');
const app = require('../../server');

describe('Ministries API - Full Quality Test', () => {
  let testMinistryId;

  // Create fresh record before every test
  beforeEach(async () => {
    const validMinistry = {
      title: `Test Ministry ${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      desc: 'Test short description',
      headName: 'Pastor John',
      fullDesc: 'Full detailed description for testing',
      actions: [{ label: 'Join Us', type: 'primary', link: '/join' }]
    };

    const res = await request(app)
      .post('/api/v1/ministries')
      .send(validMinistry)
      .expect(201);

    testMinistryId = res.body.data._id;
  });

  test('GET /ministries - paginated list + search + efficiency', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/ministries?page=1&limit=10&searchTerm=Test')
      .expect(200);

    const content = res.body.data;
    expect(content.data).toBeDefined();
    expect(content.pagination).toBeDefined();
    expect(content.pagination.limit).toBeLessThanOrEqual(100);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(600);
  });

  test('POST /ministries - create + validation', async () => {
    const validMinistry = {
      title: `Test Ministry ${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      desc: 'Test short description',
      headName: 'Pastor John',
      fullDesc: 'Full detailed description for testing',
      actions: [{ label: 'Join Us', type: 'primary', link: '/join' }]
    };

    const res = await request(app)
      .post('/api/v1/ministries')
      .send(validMinistry)
      .expect(201);

    const content = res.body.data;
    expect(content.title).toBe(validMinistry.title);
  });

  test('GET /ministries/:id - single item', async () => {
    const res = await request(app)
      .get(`/api/v1/ministries/${testMinistryId}`)
      .expect(200);

    const content = res.body.data;
    expect(content._id).toBe(testMinistryId);
  });

  test('PUT /ministries/:id - update', async () => {
    const res = await request(app)
      .put(`/api/v1/ministries/${testMinistryId}`)
      .send({ headName: 'Updated Head' })
      .expect(200);

    const content = res.body.data;
    expect(content.headName).toBe('Updated Head');
  });

  test('DELETE /ministries/:id - soft delete', async () => {
    await request(app)
      .delete(`/api/v1/ministries/${testMinistryId}`)
      .expect(200);

    const listRes = await request(app).get('/api/v1/ministries').expect(200);
    const content = listRes.body.data;
    expect(content.data.find(m => m._id === testMinistryId)).toBeUndefined();
  });

  test('Invalid ObjectId → 400', async () => {
    await request(app).get('/api/v1/ministries/invalidid').expect(400);
  });

  test('Missing required fields → 400', async () => {
    await request(app).post('/api/v1/ministries').send({ desc: 'no title' }).expect(400);
  });

  test('Duplicate title → error', async () => {
    // Create a known duplicate by posting the same object twice
    const duplicateMinistry = {
      title: `Duplicate Test Ministry ${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      desc: 'Test short description',
      headName: 'Pastor John',
      fullDesc: 'Full detailed description for testing',
      actions: [{ label: 'Join Us', type: 'primary', link: '/join' }]
    };

    // First post succeeds
    await request(app).post('/api/v1/ministries').send(duplicateMinistry).expect(201);

    // Second post fails with duplicate
    await request(app).post('/api/v1/ministries').send(duplicateMinistry).expect(409);
  });

  test('Concurrent requests (30 simultaneous) - no race condition', async () => {
    const promises = Array(30).fill().map(() =>
      request(app).get(`/api/v1/ministries`).expect(200)
    );
    const results = await Promise.all(promises);
    results.forEach(res => {
      const content = res.body.data;
      expect(content).toBeDefined();
    });
  });
});