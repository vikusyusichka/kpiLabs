function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
  
  function isBlank(value) {
    return typeof value !== 'string' || value.trim().length === 0;
  }
  
  function validateRegisterInput(payload = {}) {
    const errors = [];
  
    if (!isValidEmail(payload.email)) {
      errors.push('email must be valid');
    }
  
    if (typeof payload.password !== 'string' || payload.password.length < 6) {
      errors.push('password must contain at least 6 characters');
    }
  
    if (isBlank(payload.fullName) || payload.fullName.trim().length < 2) {
      errors.push('fullName must contain at least 2 characters');
    }
  
    return errors;
  }
  
  function validateLoginInput(payload = {}) {
    const errors = [];
  
    if (!isValidEmail(payload.email)) {
      errors.push('email must be valid');
    }
  
    if (typeof payload.password !== 'string' || payload.password.length === 0) {
      errors.push('password is required');
    }
  
    return errors;
  }
  
  function validateStudentInput(payload = {}, options = {}) {
    const { partial = false } = options;
    const errors = [];
  
    if (!partial || payload.fullName !== undefined) {
      if (isBlank(payload.fullName) || payload.fullName.trim().length < 2) {
        errors.push('fullName must contain at least 2 characters');
      }
    }
  
    if (!partial || payload.subject !== undefined) {
      if (isBlank(payload.subject)) {
        errors.push('subject is required');
      }
    }
  
    if (payload.email !== undefined && payload.email !== null && payload.email !== '') {
      if (!isValidEmail(payload.email)) {
        errors.push('email must be valid');
      }
    }
  
    return errors;
  }
  
  function isValidDate(value) {
    const date = new Date(value);
    return value && !Number.isNaN(date.getTime());
  }
  
  function validateSessionTime(payload = {}, options = {}) {
    const { requireFuture = true } = options;
    const errors = [];
  
    if (!isValidDate(payload.startsAt)) {
      errors.push('startsAt must be a valid ISO date');
    }
  
    if (!isValidDate(payload.endsAt)) {
      errors.push('endsAt must be a valid ISO date');
    }
  
    if (errors.length > 0) return errors;
  
    const startsAt = new Date(payload.startsAt);
    const endsAt = new Date(payload.endsAt);
  
    if (startsAt >= endsAt) {
      errors.push('startsAt must be earlier than endsAt');
    }
  
    if (requireFuture && startsAt.getTime() <= Date.now()) {
      errors.push('startsAt must be in the future');
    }
  
    return errors;
  }
  
  function validateSessionCreateInput(payload = {}) {
    const errors = [];
  
    if (!payload.studentId) {
      errors.push('studentId is required');
    }
  
    if (payload.topic !== undefined && payload.topic !== null && typeof payload.topic !== 'string') {
      errors.push('topic must be a string');
    }
  
    return errors.concat(validateSessionTime(payload));
  }
  
  function validateSessionUpdateInput(payload = {}, existingSession = {}) {
    const merged = {
      startsAt: payload.startsAt || existingSession.startsAt,
      endsAt: payload.endsAt || existingSession.endsAt,
    };
  
    const errors = validateSessionTime(merged);
  
    if (payload.topic !== undefined && payload.topic !== null && typeof payload.topic !== 'string') {
      errors.push('topic must be a string');
    }
  
    return errors;
  }
  
  module.exports = {
    isValidEmail,
    validateRegisterInput,
    validateLoginInput,
    validateStudentInput,
    validateSessionTime,
    validateSessionCreateInput,
    validateSessionUpdateInput,
  };
