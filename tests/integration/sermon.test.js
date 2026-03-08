const request = require('supertest');
const app = require('../../server');

describe('Sermons API - Full Quality Test', () => {
  let testSermonId;

  // Create fresh record before every test
  beforeEach(async () => {
    const validSermon = {
      title: `Test Sermon ${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pastor: 'Pastor Jane',
      date: '2025-03-06',
      thumbnail: 'https://example.com/thumb.jpg',
      videoId: 'abc123'
    };

    const res = await request(app)
      .post('/api/v1/sermons')
      .send(validSermon)
      .expect(201);

    testSermonId = res.body.data._id;
  });

  test('GET /sermons - paginated list + search + efficiency', async () => {
    const start = Date.now();
    const res = await request(app)
      .get('/api/v1/sermons?page=1&limit=10&searchTerm=Test')
      .expect(200);

    const content = res.body.data;
    expect(content.data).toBeDefined();
    expect(content.pagination).toBeDefined();
    expect(content.pagination.limit).toBeLessThanOrEqual(100);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(600);
  });

  test('POST /sermons - create + validation', async () => {
    const validSermon = {
      title: `Test Sermon ${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pastor: 'Pastor Jane',
      date: '2025-03-06',
      thumbnail: 'https://example.com/thumb.jpg',
      videoId: 'abc123'
    };

    const res = await request(app)
      .post('/api/v1/sermons')
      .send(validSermon)
      .expect(201);

    const content = res.body.data;
    expect(content.title).toBe(validSermon.title);
  });

  test('GET /sermons/:id - single item', async () => {
    const res = await request(app)
      .get(`/api/v1/sermons/${testSermonId}`)
      .expect(200);

    const content = res.body.data;
    expect(content._id).toBe(testSermonId);
  });

  test('PUT /sermons/:id - update', async () => {
    const res = await request(app)
      .put(`/api/v1/sermons/${testSermonId}`)
      .send({ pastor: 'Updated Pastor' })
      .expect(200);

    const content = res.body.data;
    expect(content.pastor).toBe('Updated Pastor');
  });

  test('DELETE /sermons/:id - soft delete', async () => {
    await request(app)
      .delete(`/api/v1/sermons/${testSermonId}`)
      .expect(200);

    const listRes = await request(app).get('/api/v1/sermons').expect(200);
    const content = listRes.body.data;
    expect(content.data.find(s => s._id === testSermonId)).toBeUndefined();
  });

  test('Invalid ObjectId → 400', async () => {
    await request(app).get('/api/v1/sermons/invalidid').expect(400);
  });

  test('Missing required fields → 400', async () => {
    await request(app).post('/api/v1/sermons').send({ pastor: 'no title' }).expect(400);
  });

  test('Duplicate title → error', async () => {
    // Create a known duplicate by posting the same object twice
    const duplicateSermon = {
      title: `Duplicate Test Sermon ${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pastor: 'Pastor Jane',
      date: '2025-03-06',
      thumbnail: 'https://example.com/thumb.jpg',
      videoId: 'abc123'
    };

    // First post succeeds
    await request(app).post('/api/v1/sermons').send(duplicateSermon).expect(201);

    // Second post fails with duplicate
    await request(app).post('/api/v1/sermons').send(duplicateSermon).expect(409);
  });

  test('Concurrent requests (500 simultaneous) - no race condition', async () => {
    const promises = Array(500).fill().map(() =>
      request(app).get(`/api/v1/sermons`).expect(200)
    );
    const results = await Promise.all(promises);
    results.forEach(res => {
      const content = res.body.data;
      expect(content).toBeDefined();
    });
  });
});