import { validateBRN } from '../src/brn';

describe('validateBRN', () => {
  describe('유효한 사업자등록번호', () => {
    it('하이픈 포함 형식 검증', () => {
      const result = validateBRN('119-81-10010');
      expect(result.success).toBe(true);
      expect(result.data?.officeCode).toBe('119');
      expect(result.data?.typeCode).toBe('81');
    });

    it('하이픈 없는 형식 검증', () => {
      const result = validateBRN('1198110010');
      expect(result.success).toBe(true);
    });
  });

  describe('유효하지 않은 사업자등록번호', () => {
    it('자릿수 오류', () => {
      expect(validateBRN('123456789').success).toBe(false);
      expect(validateBRN('12345678901').success).toBe(false);
    });

    it('세무서 코드 오류 (100 이하)', () => {
      const result = validateBRN('100-81-10788');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/tax office/i);
    });

    it('업태 코드 00', () => {
      const result = validateBRN('119-00-10788');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/business type/i);
    });

    it('일련번호 0000', () => {
      const result = validateBRN('119-81-00000');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/serial/i);
    });

    it('체크섬 불일치', () => {
      const result = validateBRN('119-81-10011');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/checksum/i);
    });

    it('숫자 외 문자 포함', () => {
      expect(validateBRN('abc-81-10788').success).toBe(false);
    });

    it('모두 0', () => {
      expect(validateBRN('000-00-00000').success).toBe(false);
    });

    it('빈 문자열', () => {
      const result = validateBRN('');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Input is required');
    });
  });
});
