import { validateCRN } from '../src/crn';

describe('validateCRN', () => {
  describe('유효한 법인등록번호', () => {
    it('하이픈 포함 형식', () => {
      const result = validateCRN('110111-0006249');
      expect(result.success).toBe(true);
    });

    it('하이픈 없는 형식', () => {
      const result = validateCRN('1101110006249');
      expect(result.success).toBe(true);
    });
  });

  describe('유효하지 않은 법인등록번호', () => {
    it('자릿수 오류', () => {
      expect(validateCRN('123456-123456').success).toBe(false);
      expect(validateCRN('123456-12345678').success).toBe(false);
    });

    it('체크섬 불일치', () => {
      const result = validateCRN('110111-0006248');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/checksum/i);
    });

    it('숫자 외 문자 포함', () => {
      expect(validateCRN('11011a-0006246').success).toBe(false);
    });
  });
});
