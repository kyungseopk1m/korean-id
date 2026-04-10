import { validate } from '../src/validate';

describe('validate — 타입 자동 감지', () => {
  describe('BRN (10자리)', () => {
    it('유효한 사업자등록번호', () => {
      expect(validate('119-81-10010')).toMatchObject({ type: 'BRN', result: { success: true } });
    });

    it('유효하지 않은 사업자등록번호도 BRN으로 감지', () => {
      expect(validate('000-00-00000')).toMatchObject({ type: 'BRN', result: { success: false } });
    });
  });

  describe('RRN (13자리, 내국인 코드 1-4/9/0)', () => {
    it('유효한 주민등록번호', () => {
      expect(validate('900101-1123459')).toMatchObject({ type: 'RRN', result: { success: true } });
    });
  });

  describe('FRN (13자리, 외국인 코드 5-8)', () => {
    it('유효한 외국인등록번호 (코드 5)', () => {
      expect(validate('900101-5123450')).toMatchObject({ type: 'FRN', result: { success: true } });
    });
  });

  describe('CRN (13자리, RRN/FRN 검증 실패 시)', () => {
    it('유효한 법인등록번호', () => {
      expect(validate('110111-0006249')).toMatchObject({ type: 'CRN', result: { success: true } });
    });
  });

  describe('PCC (P + 12자리)', () => {
    it('유효한 개인통관고유부호', () => {
      expect(validate('P123456789012')).toMatchObject({ type: 'PCC', result: { success: true } });
    });

    it('소문자 p도 감지', () => {
      expect(validate('p123456789012')).toMatchObject({ type: 'PCC' });
    });
  });

  describe('DLN (12자리)', () => {
    it('유효한 운전면허번호', () => {
      expect(validate('11-22-123456-78')).toMatchObject({ type: 'DLN', result: { success: true } });
    });
  });

  describe('PASSPORT (M/S/R/G/D + 8자리)', () => {
    it('유효한 여권번호', () => {
      expect(validate('M12345678')).toMatchObject({ type: 'PASSPORT', result: { success: true } });
    });

    it('소문자 m도 감지', () => {
      expect(validate('m12345678')).toMatchObject({ type: 'PASSPORT' });
    });
  });

  describe('VRN (한글 포함)', () => {
    it('유효한 자동차등록번호', () => {
      expect(validate('123가4567')).toMatchObject({ type: 'VRN', result: { success: true } });
    });
  });

  describe('13자리 폴백 전략', () => {
    it('FRN 체크섬 실패 → CRN 폴백', () => {
      // 성별코드 5(외국인)지만 FRN 체크섬 실패 → CRN으로 시도
      const result = validate('1101110006249');
      expect(result.type).toBe('CRN');
      expect(result.type !== null && result.result.success).toBe(true);
    });

    it('RRN 체크섬 실패 → CRN 폴백', () => {
      // 성별코드 1(내국인)이지만 유효하지 않은 RRN → CRN으로 시도
      const result = validate('1101111006248');
      // RRN 실패 → CRN도 실패 (체크섬 불일치)
      expect(result.type).toBe('CRN');
    });
  });

  describe('경계값', () => {
    it('12자리 유효하지 않은 지역코드 → DLN 감지, 검증 실패', () => {
      const result = validate('992212345678');
      expect(result).toMatchObject({ type: 'DLN', result: { success: false } });
    });

    it('P + 12자리 문자(숫자 아닌) → PCC 감지, 검증 실패', () => {
      const result = validate('PABCDEFGHIJKL');
      expect(result).toMatchObject({ type: 'PCC', result: { success: false } });
    });

    it('D + 8자리 영문 → Passport 감지, 검증 실패', () => {
      const result = validate('DABCDEFGH');
      expect(result).toMatchObject({ type: 'PASSPORT', result: { success: false } });
    });

    it('공백만 입력', () => {
      expect(validate('   ')).toMatchObject({ type: null });
    });

    it('하이픈만 입력', () => {
      expect(validate('---')).toMatchObject({ type: null });
    });
  });

  describe('감지 실패', () => {
    it('빈 문자열', () => {
      expect(validate('')).toMatchObject({ type: null });
    });

    it('알 수 없는 형식', () => {
      expect(validate('abcdef')).toMatchObject({ type: null });
    });

    it('자릿수 불일치 (11자리)', () => {
      expect(validate('12345678901')).toMatchObject({ type: null });
    });
  });
});
