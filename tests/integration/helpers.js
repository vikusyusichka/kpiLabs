const request = require('supertest');

async function registerAndLogin(app, user = {}) {
  const payload = {
    email: user.email || 'alex@example.com',
    password: user.password || 'secret1',
    fullName: user.fullName || 'Alex Rivera',
  };

  await request(app).post('/api/auth/register').send(payload);

  const loginResponse = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password,
  });

  return {
    token: loginResponse.body.token,
    user: loginResponse.body.user,
  };
}

async function createStudentViaApi(app, token, payload = {}) {
  const response = await request(app)
    .post('/api/students')
    .set('Authorization', `Bearer ${token}`)
    .send({
      fullName: payload.fullName || 'Egor Petrov',
      subject: payload.subject || 'Math',
      email: payload.email || 'egor@example.com',
    });

  return response.body.student;
}

module.exports = {
  registerAndLogin,
  createStudentViaApi,
};
