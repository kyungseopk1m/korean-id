import { validatePassport } from '../src/passport';

describe('validatePassport', () => {
  describe('유효한 여권번호', () => {
    it('M — 복수여권', () => {
      const result = validatePassport('M12345678');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.type).toBe('복수여권');
      expect(result.data.prefix).toBe('M');
    });

    it('S — 단수여권', () => {
      const result = validatePassport('S12345678');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.type).toBe('단수여권');
    });

    it('R — 거주여권', () => {
      const result = validatePassport('R12345678');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.type).toBe('거주여권');
    });

    it('G — 관용여권', () => {
      const result = validatePassport('G12345678');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.type).toBe('관용여권');
    });

    it('D — 외교관여권', () => {
      const result = validatePassport('D12345678');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.type).toBe('외교관여권');
    });

    it('소문자도 허용', () => {
      expect(validatePassport('m12345678').success).toBe(true);
    });
  });

  describe('유효하지 않은 여권번호', () => {
    it('빈 문자열', () => {
      const result = validatePassport('');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe('Input is required');
    });

    it('잘못된 접두사', () => {
      const result = validatePassport('X12345678');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/prefix/i);
    });

    it('자릿수 부족 (8자)', () => {
      const result = validatePassport('M1234567');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/9 characters/i);
    });

    it('자릿수 초과 (10자)', () => {
      const result = validatePassport('M1234567890');
      expect(result.success).toBe(false);
    });

    it('숫자 아닌 문자 포함', () => {
      const result = validatePassport('M1234567A');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/8 digits/i);
    });
  });
});
