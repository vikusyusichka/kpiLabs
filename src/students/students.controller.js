const express = require('express');
const {
  createStudent,
  listStudentsByTutor,
  findStudentByIdForTutor,
  updateStudent,
  deleteStudent,
  hasFutureSessionsForStudent,
} = require('../repositories/db');
const { validateStudentInput } = require('../utils/validators');

const router = express.Router();

router.post('/', (req, res) => {
  const errors = validateStudentInput(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const student = createStudent({
    tutorId: req.user.id,
    fullName: req.body.fullName,
    subject: req.body.subject,
    email: req.body.email,
  });

  return res.status(201).json({ student });
});

router.get('/', (req, res) => {
  const students = listStudentsByTutor(req.user.id);

  return res.status(200).json({ students });
});

router.get('/:id', (req, res) => {
  const student = findStudentByIdForTutor(req.params.id, req.user.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  return res.status(200).json({ student });
});

router.patch('/:id', (req, res) => {
  const student = findStudentByIdForTutor(req.params.id, req.user.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const errors = validateStudentInput(req.body, { partial: true });

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const updates = {};

  if (req.body.fullName !== undefined) {
    updates.fullName = req.body.fullName.trim();
  }

  if (req.body.subject !== undefined) {
    updates.subject = req.body.subject.trim();
  }

  if (req.body.email !== undefined) {
    updates.email = req.body.email ? req.body.email.toLowerCase().trim() : null;
  }

  if (req.body.status !== undefined) {
    updates.status = req.body.status;
  }

  if (req.body.balance !== undefined) {
    updates.balance = Number(req.body.balance);
  }

  const updatedStudent = updateStudent(req.params.id, req.user.id, updates);

  return res.status(200).json({ student: updatedStudent });
});

router.delete('/:id', (req, res) => {
  const student = findStudentByIdForTutor(req.params.id, req.user.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  if (hasFutureSessionsForStudent(req.params.id, req.user.id)) {
    return res.status(409).json({
      message: 'Cannot delete student with future scheduled sessions',
    });
  }

  deleteStudent(req.params.id, req.user.id);

  return res.status(204).send();
});

module.exports = router;
