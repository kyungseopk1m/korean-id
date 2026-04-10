import { validateDLN } from '../src/dln';

describe('validateDLN', () => {
  describe('유효한 운전면허번호', () => {
    it('하이픈 포함 형식 — 서울(11)', () => {
      const result = validateDLN('11-22-123456-78');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.region).toBe('서울');
      expect(result.data.regionCode).toBe('11');
    });

    it('하이픈 없는 형식', () => {
      expect(validateDLN('112212345678').success).toBe(true);
    });

    it('경기북부(29)', () => {
      const result = validateDLN('29-22-123456-78');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.region).toBe('경기북부');
    });

    it('세종(28)', () => {
      const result = validateDLN('28-22-123456-78');
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.region).toBe('세종');
    });
  });

  describe('지역코드별 매핑', () => {
    const regions: Array<[string, string]> = [
      ['11', '서울'], ['12', '부산'], ['13', '경기남부'], ['14', '강원'],
      ['15', '충북'], ['16', '충남'], ['17', '전북'], ['18', '전남'],
      ['19', '경북'], ['20', '경남'], ['21', '제주'], ['22', '대구'],
      ['23', '인천'], ['24', '광주'], ['25', '대전'], ['26', '울산'],
      ['28', '세종'], ['29', '경기북부'],
    ];

    it.each(regions)('지역코드 %s → %s', (code, name) => {
      const result = validateDLN(`${code}2212345678`);
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.data.region).toBe(name);
    });
  });

  describe('유효하지 않은 운전면허번호', () => {
    it('빈 문자열', () => {
      const result = validateDLN('');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toBe('Input is required');
    });

    it('잘못된 지역코드 (27 존재하지 않음)', () => {
      const result = validateDLN('27-22-123456-78');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/region code/i);
    });

    it('잘못된 지역코드 (99)', () => {
      const result = validateDLN('99-22-123456-78');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/region code/i);
    });

    it('경계값 지역코드 (00)', () => {
      const result = validateDLN('00-22-123456-78');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/region code/i);
    });

    it('경계값 지역코드 (10)', () => {
      const result = validateDLN('10-22-123456-78');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/region code/i);
    });

    it('자릿수 오류 (11자리)', () => {
      const result = validateDLN('1122123456789');
      expect(result.success).toBe(false);
    });

    it('숫자 외 문자 포함', () => {
      const result = validateDLN('ab-22-123456-78');
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.message).toMatch(/non-numeric/i);
    });
  });
});
