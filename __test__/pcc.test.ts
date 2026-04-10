import { validatePCC } from '../src/pcc';

describe('validatePCC', () => {
  describe('유효한 개인통관고유부호', () => {
    it('P + 12자리 숫자', () => {
      const result = validatePCC('P123456789012');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.number).toBe('123456789012');
    });

    it('소문자 p도 허용', () => {
      expect(validatePCC('p123456789012').success).toBe(true);
    });
  });

  describe('유효하지 않은 개인통관고유부호', () => {
    it('빈 문자열', () => {
      const result = validatePCC('');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe('Input is required');
    });

    it('P 접두사 없음', () => {
      const result = validatePCC('X123456789012');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/start with P/i);
    });

    it('자릿수 부족 (12자리)', () => {
      const result = validatePCC('P12345678901');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/13 characters/i);
    });

    it('자릿수 초과 (14자리)', () => {
      const result = validatePCC('P12345678901234');
      expect(result.success).toBe(false);
    });

    it('숫자 아닌 문자 포함', () => {
      const result = validatePCC('P12345678901A');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/12 digits/i);
    });
  });
});
