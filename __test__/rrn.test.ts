import { validateRRN } from '../src/rrn';

describe('validateRRN', () => {
  describe('유효한 주민등록번호', () => {
    it('1990년대생 남성 (코드 1)', () => {
      const result = validateRRN('900101-1123459');
      expect(result.success).toBe(true);
      expect(result.data?.gender).toBe('male');
      expect(result.data?.century).toBe('1900s');
      expect(result.data?.birthDate).toBe('1990-01-01');
    });

    it('2000년대생 여성 (코드 4)', () => {
      const result = validateRRN('010101-4123451');
      expect(result.success).toBe(true);
      expect(result.data?.gender).toBe('female');
      expect(result.data?.century).toBe('2000s');
      expect(result.data?.birthDate).toBe('2001-01-01');
    });

    it('1800년대 남성 (코드 9) — 알고리즘상 허용', () => {
      const result = validateRRN('800101-9123452');
      expect(result.success).toBe(true);
      expect(result.data?.gender).toBe('male');
      expect(result.data?.century).toBe('1800s');
    });

    it('1800년대 여성 (코드 0) — 알고리즘상 허용', () => {
      const result = validateRRN('800101-0123458');
      expect(result.success).toBe(true);
      expect(result.data?.gender).toBe('female');
      expect(result.data?.century).toBe('1800s');
    });

    it('하이픈 없는 형식', () => {
      const result = validateRRN('9001011123459');
      expect(result.success).toBe(true);
    });

    it('윤년 2월 29일 (2000년)', () => {
      const result = validateRRN('000229-3123454');
      expect(result.success).toBe(true);
      expect(result.data?.birthDate).toBe('2000-02-29');
    });
  });

  describe('유효하지 않은 주민등록번호', () => {
    it('자릿수 오류', () => {
      expect(validateRRN('900101-123456').success).toBe(false);
      expect(validateRRN('900101-12345678').success).toBe(false);
    });

    it('빈 문자열', () => {
      const result = validateRRN('');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Input is required');
    });

    it('외국인 코드(5,6,7,8) 사용 시 실패', () => {
      const result = validateRRN('900101-5234567');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/gender/i);
    });

    it('유효하지 않은 생년월일 (월 13)', () => {
      const result = validateRRN('901301-1234567');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/birth date/i);
    });

    it('비윤년 2월 29일 (2001년)', () => {
      const result = validateRRN('010229-3123451');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/birth date/i);
    });

    it('체크섬 불일치', () => {
      const result = validateRRN('900101-1123450');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/checksum/i);
    });

    it('숫자 외 문자 포함', () => {
      expect(validateRRN('9a0101-1234567').success).toBe(false);
    });
  });
});
