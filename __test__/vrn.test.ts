import { validateVRN } from '../src/vrn';

describe('validateVRN', () => {
  describe('유효한 자동차등록번호', () => {
    it('자가용 — 가', () => {
      const result = validateVRN('123가4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('자가용');
      expect(result.data.char).toBe('가');
      expect(result.data.format).toBe('current');
    });

    it('자가용 — 주', () => {
      const result = validateVRN('999주1234');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('자가용');
    });

    it('렌터카 — 허', () => {
      const result = validateVRN('123허4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('렌터카');
    });

    it('렌터카 — 하', () => {
      const result = validateVRN('123하4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('렌터카');
    });

    it('렌터카 — 호', () => {
      const result = validateVRN('123호4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('렌터카');
    });

    it('영업용 — 바', () => {
      const result = validateVRN('123바4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('영업용');
    });

    it('영업용 — 자', () => {
      const result = validateVRN('123자4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('영업용');
    });

    it('기타 — 배', () => {
      const result = validateVRN('123배4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('기타');
      expect(result.data.char).toBe('배');
    });

    it('내부 공백 포함도 처리', () => {
      const result = validateVRN('123가 4567');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('자가용');
      expect(result.data.format).toBe('current');
    });
  });

  describe('구형(2006~2018) 포맷 — 2자리 + 한글 + 4자리', () => {
    it('자가용 — 12가3456', () => {
      const result = validateVRN('12가3456');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('자가용');
      expect(result.data.char).toBe('가');
      expect(result.data.format).toBe('legacy');
    });

    it('영업용 — 99바1234', () => {
      const result = validateVRN('99바1234');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.usage).toBe('영업용');
      expect(result.data.format).toBe('legacy');
    });

    it('구형 — 내부 공백 포함도 처리', () => {
      const result = validateVRN('12가 3456');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.format).toBe('legacy');
    });

    it('구형 — 유효하지 않은 한글', () => {
      const result = validateVRN('12힣3456');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/VRN character/i);
    });
  });

  describe('유효하지 않은 자동차등록번호', () => {
    it('빈 문자열', () => {
      const result = validateVRN('');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe('Input is required');
    });

    it('유효하지 않은 한글', () => {
      const result = validateVRN('123힣4567');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/VRN character/i);
    });

    it('한글 없음', () => {
      const result = validateVRN('12345678');
      expect(result.success).toBe(false);
    });

    it('앞자리 숫자 부족 (1자리)', () => {
      const result = validateVRN('1가4567');
      expect(result.success).toBe(false);
    });

    it('앞자리 숫자 과다 (4자리)', () => {
      const result = validateVRN('1234가4567');
      expect(result.success).toBe(false);
    });

    it('뒷자리 숫자 부족', () => {
      const result = validateVRN('123가456');
      expect(result.success).toBe(false);
    });
  });
});
