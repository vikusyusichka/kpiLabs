const express = require('express');
const {
  createSession,
  listSessionsByTutor,
  findSessionByIdForTutor,
  updateSession,
  deleteSession,
  findStudentByIdForTutor,
  hasSessionOverlap,
} = require('../repositories/db');
const {
  validateSessionCreateInput,
  validateSessionUpdateInput,
} = require('../utils/validators');

const router = express.Router();

router.post('/', (req, res) => {
  const errors = validateSessionCreateInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const student = findStudentByIdForTutor(req.body.studentId, req.user.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  if (hasSessionOverlap(req.user.id, req.body.startsAt, req.body.endsAt)) {
    return res.status(409).json({
      message: 'Session overlaps with another session',
    });
  }

  const session = createSession({
    tutorId: req.user.id,
    studentId: req.body.studentId,
    startsAt: req.body.startsAt,
    endsAt: req.body.endsAt,
    topic: req.body.topic,
  });

  return res.status(201).json({ session });
});

router.get('/', (req, res) => {
  const sessions = listSessionsByTutor(req.user.id, {
    studentId: req.query.studentId,
  });

  return res.status(200).json({ sessions });
});

router.get('/:id', (req, res) => {
  const session = findSessionByIdForTutor(req.params.id, req.user.id);

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  return res.status(200).json({ session });
});

router.patch('/:id', (req, res) => {
  const session = findSessionByIdForTutor(req.params.id, req.user.id);

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  if (req.body.studentId !== undefined) {
    const student = findStudentByIdForTutor(req.body.studentId, req.user.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
  }

  const errors = validateSessionUpdateInput(req.body, session);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const candidate = {
    startsAt: req.body.startsAt || session.startsAt,
    endsAt: req.body.endsAt || session.endsAt,
  };

  if (hasSessionOverlap(req.user.id, candidate.startsAt, candidate.endsAt, session.id)) {
    return res.status(409).json({
      message: 'Session overlaps with another session',
    });
  }

  const updates = {};

  if (req.body.studentId !== undefined) {
    updates.studentId = Number(req.body.studentId);
  }

  if (req.body.startsAt !== undefined) {
    updates.startsAt = new Date(req.body.startsAt).toISOString();
  }

  if (req.body.endsAt !== undefined) {
    updates.endsAt = new Date(req.body.endsAt).toISOString();
  }

  if (req.body.topic !== undefined) {
    updates.topic = req.body.topic ? req.body.topic.trim() : null;
  }

  const updatedSession = updateSession(req.params.id, req.user.id, updates);

  return res.status(200).json({ session: updatedSession });
});

router.patch('/:id/status', (req, res) => {
  const session = findSessionByIdForTutor(req.params.id, req.user.id);

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const nextStatus = req.body.status;

  if (!['cancelled', 'completed'].includes(nextStatus)) {
    return res.status(400).json({
      message: 'Status must be cancelled or completed',
    });
  }

  if (nextStatus === 'completed' && new Date(session.startsAt).getTime() > Date.now()) {
    return res.status(409).json({
      message: 'Cannot complete a session that has not started yet',
    });
  }

  if (nextStatus === 'cancelled' && session.status === 'completed') {
    return res.status(409).json({
      message: 'Cannot cancel a completed session',
    });
  }

  const updatedSession = updateSession(req.params.id, req.user.id, {
    status: nextStatus,
  });

  return res.status(200).json({ session: updatedSession });
});

router.delete('/:id', (req, res) => {
  const session = findSessionByIdForTutor(req.params.id, req.user.id);

  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  deleteSession(req.params.id, req.user.id);

  return res.status(204).send();
});

module.exports = router;
