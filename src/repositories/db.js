const db = {
    users: [],
    students: [],
    sessions: [],
  };
  
  const counters = {
    users: 1,
    students: 1,
    sessions: 1,
  };
  
  function sanitizeUser(user) {
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
  
  function resetDatabase() {
    db.users = [];
    db.students = [];
    db.sessions = [];
    counters.users = 1;
    counters.students = 1;
    counters.sessions = 1;
  }
  
  function createUser({ email, passwordHash, fullName }) {
    const user = {
      id: counters.users++,
      email: email.toLowerCase(),
      passwordHash,
      fullName: fullName.trim(),
      role: 'tutor',
      createdAt: new Date().toISOString(),
    };
  
    db.users.push(user);
    return user;
  }
  
  function findUserByEmail(email) {
    return db.users.find((user) => user.email === String(email).toLowerCase()) || null;
  }
  
  function findUserById(id) {
    return db.users.find((user) => user.id === Number(id)) || null;
  }
  
  function createStudent({ tutorId, fullName, subject, email }) {
    const student = {
      id: counters.students++,
      tutorId: Number(tutorId),
      fullName: fullName.trim(),
      subject: subject.trim(),
      email: email ? email.toLowerCase().trim() : null,
      status: 'active',
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  
    db.students.push(student);
    return student;
  }
  
  function listStudentsByTutor(tutorId) {
    return db.students.filter((student) => student.tutorId === Number(tutorId));
  }
  
  function findStudentByIdForTutor(id, tutorId) {
    return db.students.find(
      (student) => student.id === Number(id) && student.tutorId === Number(tutorId),
    ) || null;
  }
  
  function updateStudent(id, tutorId, updates) {
    const student = findStudentByIdForTutor(id, tutorId);
    if (!student) return null;
  
    Object.assign(student, updates, { updatedAt: new Date().toISOString() });
    return student;
  }
  
  function deleteStudent(id, tutorId) {
    const index = db.students.findIndex(
      (student) => student.id === Number(id) && student.tutorId === Number(tutorId),
    );
  
    if (index === -1) return false;
    db.students.splice(index, 1);
    return true;
  }
  
  function createSession({ tutorId, studentId, startsAt, endsAt, topic }) {
    const session = {
      id: counters.sessions++,
      tutorId: Number(tutorId),
      studentId: Number(studentId),
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      topic: topic ? String(topic).trim() : null,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  
    db.sessions.push(session);
    return session;
  }
  
  function listSessionsByTutor(tutorId, filters = {}) {
    return db.sessions.filter((session) => {
      if (session.tutorId !== Number(tutorId)) return false;
      if (filters.studentId && session.studentId !== Number(filters.studentId)) return false;
      return true;
    });
  }
  
  function findSessionByIdForTutor(id, tutorId) {
    return db.sessions.find(
      (session) => session.id === Number(id) && session.tutorId === Number(tutorId),
    ) || null;
  }
  
  function updateSession(id, tutorId, updates) {
    const session = findSessionByIdForTutor(id, tutorId);
    if (!session) return null;
  
    Object.assign(session, updates, { updatedAt: new Date().toISOString() });
    return session;
  }
  
  function deleteSession(id, tutorId) {
    const index = db.sessions.findIndex(
      (session) => session.id === Number(id) && session.tutorId === Number(tutorId),
    );
  
    if (index === -1) return false;
    db.sessions.splice(index, 1);
    return true;
  }
  
  function hasFutureSessionsForStudent(studentId, tutorId) {
    const now = Date.now();
  
    return db.sessions.some(
      (session) => session.studentId === Number(studentId)
        && session.tutorId === Number(tutorId)
        && session.status === 'scheduled'
        && new Date(session.startsAt).getTime() > now,
    );
  }
  
  function hasSessionOverlap(tutorId, startsAt, endsAt, excludeSessionId = null) {
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();
  
    return db.sessions.some((session) => {
      if (session.tutorId !== Number(tutorId)) return false;
      if (excludeSessionId && session.id === Number(excludeSessionId)) return false;
      if (session.status === 'cancelled') return false;
  
      const existingStart = new Date(session.startsAt).getTime();
      const existingEnd = new Date(session.endsAt).getTime();
  
      return start < existingEnd && end > existingStart;
    });
  }
  
  module.exports = {
    db,
    sanitizeUser,
    resetDatabase,
    createUser,
    findUserByEmail,
    findUserById,
    createStudent,
    listStudentsByTutor,
    findStudentByIdForTutor,
    updateStudent,
    deleteStudent,
    createSession,
    listSessionsByTutor,
    findSessionByIdForTutor,
    updateSession,
    deleteSession,
    hasFutureSessionsForStudent,
    hasSessionOverlap,
  };
