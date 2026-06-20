const jwt = require('jsonwebtoken');
const { findUserById, sanitizeUser } = require('../repositories/db');

const JWT_SECRET = process.env.JWT_SECRET || 'lab1-dev-secret';

function createToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '2h' },
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = findUserById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = sanitizeUser(user);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = {
  createToken,
  requireAuth,
};
