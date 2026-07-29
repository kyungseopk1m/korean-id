import { validateRRN } from '../src/rrn';

describe('validateRRN', () => {
  describe('유효한 주민등록번호', () => {
    it('1990년대생 남성 (코드 1)', () => {
      const result = validateRRN('900101-1123459');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('male');
      expect(result.data.century).toBe('1900s');
      expect(result.data.birthDate).toBe('1990-01-01');
    });

    it('2000년대생 여성 (코드 4)', () => {
      const result = validateRRN('010101-4123451');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('female');
      expect(result.data.century).toBe('2000s');
      expect(result.data.birthDate).toBe('2001-01-01');
    });

    it('1800년대 남성 (코드 9) — 알고리즘상 허용', () => {
      const result = validateRRN('800101-9123452');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('male');
      expect(result.data.century).toBe('1800s');
    });

    it('1800년대 여성 (코드 0) — 알고리즘상 허용', () => {
      const result = validateRRN('800101-0123458');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('female');
      expect(result.data.century).toBe('1800s');
    });

    it('하이픈 없는 형식', () => {
      const result = validateRRN('9001011123459');
      expect(result.success).toBe(true);
    });

    it('윤년 2월 29일 (2000년)', () => {
      const result = validateRRN('000229-3123454');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.birthDate).toBe('2000-02-29');
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
      if (result.success) return;
      expect(result.message).toBe('Input is required');
    });

    it('외국인 코드(5,6,7,8) 사용 시 실패', () => {
      const result = validateRRN('900101-5234567');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/gender/i);
    });

    it('유효하지 않은 생년월일 (월 13)', () => {
      const result = validateRRN('901301-1234567');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/birth date/i);
    });

    it('비윤년 2월 29일 (2001년)', () => {
      const result = validateRRN('010229-3123451');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/birth date/i);
    });

    it('체크섬 불일치', () => {
      const result = validateRRN('900101-1123450');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/checksum/i);
    });

    it('숫자 외 문자 포함', () => {
      expect(validateRRN('9a0101-1234567').success).toBe(false);
    });
  });

  // 2020-10-05 개편으로 신규 부여·변경 번호는 뒷자리가 성별 1자리 + 임의번호 6자리가 되어
  // 검증번호 자리가 사라졌다. 기본값은 기존과 같은 검증이고, 필요할 때만 건너뛴다.
  describe('체크섬 옵션', () => {
    it('옵션 생략 시 기존 동작 유지 (체크섬 검증)', () => {
      expect(validateRRN('900101-1123459').success).toBe(true);
      expect(validateRRN('900101-1123450').success).toBe(false);
    });

    it('{ checksum: true }를 명시해도 동일', () => {
      expect(validateRRN('900101-1123459', { checksum: true }).success).toBe(true);
      expect(validateRRN('900101-1123450', { checksum: true }).success).toBe(false);
    });

    it('{ checksum: false }면 체크섬 불일치도 통과 (2020-10 이후 발급분)', () => {
      const result = validateRRN('900101-1123450', { checksum: false });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.birthDate).toBe('1990-01-01');
      expect(result.data.gender).toBe('male');
    });

    it('{ checksum: false }여도 생년월일·성별코드는 계속 검증', () => {
      expect(validateRRN('901301-1123450', { checksum: false }).success).toBe(false);
      expect(validateRRN('900230-1123450', { checksum: false }).success).toBe(false);
      expect(validateRRN('900101-5123450', { checksum: false }).success).toBe(false);
    });
  });
});
