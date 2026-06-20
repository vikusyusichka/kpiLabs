const request = require('supertest');
const createApp = require('../../src/app');
const { resetDatabase } = require('../../src/repositories/db');

const app = createApp();

describe('Auth API', () => {
  beforeEach(() => {
    resetDatabase();
  });

  test('registers a tutor', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'alex@example.com',
        password: 'secret1',
        fullName: 'Alex Rivera',
      });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      id: 1,
      email: 'alex@example.com',
      fullName: 'Alex Rivera',
      role: 'tutor',
    });
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  test('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'alex@example.com',
      password: 'secret1',
      fullName: 'Alex Rivera',
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'alex@example.com',
      password: 'secret2',
      fullName: 'Alex Two',
    });

    expect(response.status).toBe(409);
  });

  test('logs in and returns JWT token', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'alex@example.com',
      password: 'secret1',
      fullName: 'Alex Rivera',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'alex@example.com',
      password: 'secret1',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  test('rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'alex@example.com',
      password: 'secret1',
      fullName: 'Alex Rivera',
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'alex@example.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
  });

  test('protects current user endpoint', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });
});
