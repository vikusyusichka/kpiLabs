const request = require('supertest');
const createApp = require('../../src/app');
const { resetDatabase, createSession } = require('../../src/repositories/db');
const { registerAndLogin, createStudentViaApi } = require('./helpers');

const app = createApp();

describe('Students API', () => {
  beforeEach(() => {
    resetDatabase();
  });

  test('requires authentication', async () => {
    const response = await request(app).get('/api/students');

    expect(response.status).toBe(401);
  });

  test('creates a student', async () => {
    const { token } = await registerAndLogin(app);

    const response = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'Egor Petrov',
        subject: 'Math',
        email: 'egor@example.com',
      });

    expect(response.status).toBe(201);
    expect(response.body.student).toMatchObject({
      id: 1,
      fullName: 'Egor Petrov',
      subject: 'Math',
      email: 'egor@example.com',
      status: 'active',
      balance: 0,
    });
  });

  test('rejects invalid student data', async () => {
    const { token } = await registerAndLogin(app);

    const response = await request(app)
      .post('/api/students')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fullName: 'A',
        subject: '',
        email: 'bad-email',
      });

    expect(response.status).toBe(400);
  });

  test('returns only current tutor students', async () => {
    const tutorOne = await registerAndLogin(app, { email: 'one@example.com' });
    const tutorTwo = await registerAndLogin(app, { email: 'two@example.com' });

    await createStudentViaApi(app, tutorOne.token, { fullName: 'Student One' });
    await createStudentViaApi(app, tutorTwo.token, { fullName: 'Student Two' });

    const response = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${tutorOne.token}`);

    expect(response.status).toBe(200);
    expect(response.body.students).toHaveLength(1);
    expect(response.body.students[0].fullName).toBe('Student One');
  });

  test('updates a student', async () => {
    const { token } = await registerAndLogin(app);
    const student = await createStudentViaApi(app, token);

    const response = await request(app)
      .patch(`/api/students/${student.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ subject: 'English' });

    expect(response.status).toBe(200);
    expect(response.body.student.subject).toBe('English');
  });

  test('deletes a student without future sessions', async () => {
    const { token } = await registerAndLogin(app);
    const student = await createStudentViaApi(app, token);

    const response = await request(app)
      .delete(`/api/students/${student.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
  });

  test('does not delete student with future scheduled session', async () => {
    const { token, user } = await registerAndLogin(app);
    const student = await createStudentViaApi(app, token);

    createSession({
      tutorId: user.id,
      studentId: student.id,
      startsAt: '2035-07-01T10:00:00.000Z',
      endsAt: '2035-07-01T11:00:00.000Z',
      topic: 'Geometry',
    });

    const response = await request(app)
      .delete(`/api/students/${student.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(409);
  });
});
