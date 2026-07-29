import { validateFRN } from '../src/frn';

describe('validateFRN', () => {
  describe('유효한 외국인등록번호', () => {
    it('1900년대 남성 외국인 (코드 5)', () => {
      const result = validateFRN('900101-5123452');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('male');
      expect(result.data.century).toBe('1900s');
      expect(result.data.birthDate).toBe('1990-01-01');
    });

    it('1900년대 여성 외국인 (코드 6)', () => {
      const result = validateFRN('900101-6123454');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('female');
      expect(result.data.century).toBe('1900s');
    });

    it('2000년대 남성 외국인 (코드 7)', () => {
      const result = validateFRN('010101-7123451');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('male');
      expect(result.data.century).toBe('2000s');
    });

    it('2000년대 여성 외국인 (코드 8)', () => {
      const result = validateFRN('010101-8123453');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('female');
      expect(result.data.century).toBe('2000s');
      expect(result.data.birthDate).toBe('2001-01-01');
    });

    it('하이픈 없는 형식', () => {
      const result = validateFRN('9001015123452');
      expect(result.success).toBe(true);
    });

    // RRN과 달리 FRN은 체크섬이 기본 검증이다. 검증번호 폐지의 1차 근거를 확인하지 못해
    // v1.3.0 동작을 유지한다. 이 기본값이 뒤집히면 유효하지 않은 번호가 통과한다.
    it('기본 모드는 체크섬 불일치를 거부', () => {
      const result = validateFRN('900101-5123451');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/checksum/i);
    });

    it('{ checksum: false }로 체크섬을 건너뛸 수 있음', () => {
      const result = validateFRN('900101-5123451', { checksum: false });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.gender).toBe('male');
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

    it('엄격 모드({checksum:true})에서 체크섬 불일치 → 실패', () => {
      const result = validateFRN('900101-5123451', { checksum: true });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/checksum/i);
    });

    it('엄격 모드에서 RRN식 체크디지트(+2 보정 없음)는 실패: 정부 표준 체크섬 회귀', () => {
      // 900101-5123450 은 RRN 알고리즘으로는 유효하지만 FRN(+2 보정)에서는 무효
      const result = validateFRN('900101-5123450', { checksum: true });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/checksum/i);
    });

    it('엄격 모드에서 유효 체크섬은 통과', () => {
      expect(validateFRN('900101-5123452', { checksum: true }).success).toBe(true);
    });

    it('숫자 외 문자 포함', () => {
      expect(validateFRN('9a0101-5234567').success).toBe(false);
    });

    // FRN은 체크섬이 기본 검증이지만, 생년월일은 체크섬과 무관한 별도 게이트다.
    // 아래 입력들은 체크섬 이전에 생년월일에서 걸려야 한다.
    it.each([
      ['900230-5123456', '2월 30일'],
      ['900001-5123456', '월 00'],
      ['900100-5123456', '일 00'],
    ])('%s 거부 (%s)', (value) => {
      const result = validateFRN(value);
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/birth date/i);
    });
  });
});
