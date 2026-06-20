const express = require('express');
const bcrypt = require('bcryptjs');
const {
  createUser,
  findUserByEmail,
  sanitizeUser,
} = require('../repositories/db');
const {
  validateRegisterInput,
  validateLoginInput,
} = require('../utils/validators');
const { createToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const errors = validateRegisterInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const existingUser = findUserByEmail(req.body.email);

  if (existingUser) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(req.body.password, 10);

  const user = createUser({
    email: req.body.email,
    passwordHash,
    fullName: req.body.fullName,
  });

  return res.status(201).json({ user: sanitizeUser(user) });
});

router.post('/login', async (req, res) => {
  const errors = validateLoginInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const user = findUserByEmail(req.body.email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.status(200).json({
    token: createToken(user),
    user: sanitizeUser(user),
  });
});

router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({ user: req.user });
});

module.exports = router;
