const {
    isValidEmail,
    validateRegisterInput,
    validateStudentInput,
    validateSessionTime,
  } = require('../../src/utils/validators');
  
  describe('validators', () => {
    describe('isValidEmail', () => {
      test('accepts valid email', () => {
        expect(isValidEmail('alex@example.com')).toBe(true);
      });
  
      test('rejects invalid email', () => {
        expect(isValidEmail('alex-example.com')).toBe(false);
      });
    });
  
    describe('validateRegisterInput', () => {
      test('returns no errors for valid registration payload', () => {
        const errors = validateRegisterInput({
          email: 'alex@example.com',
          password: 'secret1',
          fullName: 'Alex Rivera',
        });
  
        expect(errors).toHaveLength(0);
      });
  
      test('returns errors for invalid registration payload', () => {
        const errors = validateRegisterInput({
          email: 'bad-email',
          password: '123',
          fullName: 'A',
        });
  
        expect(errors).toEqual(expect.arrayContaining([
          'email must be valid',
          'password must contain at least 6 characters',
          'fullName must contain at least 2 characters',
        ]));
      });
    });
  
    describe('validateStudentInput', () => {
      test('accepts a valid student', () => {
        const errors = validateStudentInput({
          fullName: 'Egor Petrov',
          subject: 'Math',
          email: 'egor@example.com',
        });
  
        expect(errors).toHaveLength(0);
      });
  
      test('rejects invalid student email', () => {
        const errors = validateStudentInput({
          fullName: 'Egor Petrov',
          subject: 'Math',
          email: 'not-email',
        });
  
        expect(errors).toContain('email must be valid');
      });
    });
  
    describe('validateSessionTime', () => {
      test('accepts future valid time range', () => {
        const errors = validateSessionTime({
          startsAt: '2035-07-01T10:00:00.000Z',
          endsAt: '2035-07-01T11:00:00.000Z',
        });
  
        expect(errors).toHaveLength(0);
      });
  
      test('rejects range where start is after end', () => {
        const errors = validateSessionTime({
          startsAt: '2035-07-01T11:00:00.000Z',
          endsAt: '2035-07-01T10:00:00.000Z',
        });
  
        expect(errors).toContain('startsAt must be earlier than endsAt');
      });
  
      test('rejects past startsAt', () => {
        const errors = validateSessionTime({
          startsAt: '2020-07-01T10:00:00.000Z',
          endsAt: '2020-07-01T11:00:00.000Z',
        });
  
        expect(errors).toContain('startsAt must be in the future');
      });
    });
  });
