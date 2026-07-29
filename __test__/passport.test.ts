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

  // 2021-12-21 도입된 차세대 전자여권: 영문1 + 숫자3 + 영문1 + 숫자4
  describe('차세대 형식 (2021-12~)', () => {
    it('M123A4567 수용', () => {
      const result = validatePassport('M123A4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.prefix).toBe('M');
      expect(result.data.format).toBe('current');
    });

    it('소문자 입력도 처리', () => {
      const result = validatePassport('m123a4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.format).toBe('current');
    });

    it('구형은 format이 legacy', () => {
      const result = validatePassport('M12345678');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.format).toBe('legacy');
    });

    it('영문 위치가 어긋나면 거부', () => {
      expect(validatePassport('M1234A567').success).toBe(false);
      expect(validatePassport('MA1234567').success).toBe(false);
    });
  });

  describe('접두사', () => {
    it('관용여권 O 수용 (공식 표기)', () => {
      const result = validatePassport('O12345678');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.type).toBe('관용여권');
    });

    it('G는 하위호환으로 계속 수용 (근거 미확인, 다음 major에서 제거 예정)', () => {
      expect(validatePassport('G12345678').success).toBe(true);
    });

    it('목록에 없는 접두사는 거부', () => {
      const result = validatePassport('X12345678');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/prefix/i);
    });
  });
});
