import { validateFRN } from '../src/frn';

describe('validateFRN', () => {
  describe('유효한 외국인등록번호', () => {
    it('1900년대 남성 외국인 (코드 5)', () => {
      const result = validateFRN('900101-5123450');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('male');
      expect(result.data.century).toBe('1900s');
      expect(result.data.birthDate).toBe('1990-01-01');
    });

    it('1900년대 여성 외국인 (코드 6)', () => {
      const result = validateFRN('900101-6123452');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('female');
      expect(result.data.century).toBe('1900s');
    });

    it('2000년대 남성 외국인 (코드 7)', () => {
      const result = validateFRN('010101-7123459');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('male');
      expect(result.data.century).toBe('2000s');
    });

    it('2000년대 여성 외국인 (코드 8)', () => {
      const result = validateFRN('010101-8123451');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('female');
      expect(result.data.century).toBe('2000s');
      expect(result.data.birthDate).toBe('2001-01-01');
    });

    it('하이픈 없는 형식', () => {
      const result = validateFRN('9001015123450');
      expect(result.success).toBe(true);
    });
  });

  describe('유효하지 않은 외국인등록번호', () => {
    it('자릿수 오류', () => {
      expect(validateFRN('900101-523456').success).toBe(false);
    });

    it('빈 문자열', () => {
      const result = validateFRN('');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe('Input is required');
    });

    it('내국인 코드(1,2,3,4) 사용 시 실패', () => {
      const result = validateFRN('900101-1123459');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/foreigner/i);
    });

    it('유효하지 않은 생년월일', () => {
      const result = validateFRN('901301-5234567');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/birth date/i);
    });

    it('체크섬 불일치', () => {
      const result = validateFRN('900101-5123451');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/checksum/i);
    });

    it('숫자 외 문자 포함', () => {
      expect(validateFRN('9a0101-5234567').success).toBe(false);
    });
  });
});
