const express = require('express');
const authRouter = require('./auth/auth.controller');

function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);

  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}

module.exports = createApp;
