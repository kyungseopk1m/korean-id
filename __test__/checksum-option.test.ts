import { validate, isRRN, isFRN, validateRRN, validateFRN } from '../src/index.js';

// 체크섬은 성립하지 않지만 생년월일·성별코드는 유효한 번호.
// 2020-10-05 개편 이후 검증번호 자리가 임의번호로 바뀐 주민등록번호가 이 형태다.
const SOFT_RRN = '900101-1123450';
const SOFT_FRN = '900101-5123451';
// 체크섬까지 성립하는 번호
const STRICT_RRN = '900101-1123459';
const STRICT_FRN = '900101-5123452';
// CRN 체크섬이 성립하는 13자리
const CRN = '110111-0006249';

describe('checksum 옵션 전파', () => {
  describe('isRRN / isFRN', () => {
    it('기본값은 체크섬을 검증한다 (v1.4.0 동작)', () => {
      expect(isRRN(STRICT_RRN)).toBe(true);
      expect(isRRN(SOFT_RRN)).toBe(false);
      expect(isFRN(STRICT_FRN)).toBe(true);
      expect(isFRN(SOFT_FRN)).toBe(false);
    });

    it('{ checksum: false }면 체크섬을 건너뛴다', () => {
      expect(isRRN(SOFT_RRN, { checksum: false })).toBe(true);
      expect(isFRN(SOFT_FRN, { checksum: false })).toBe(true);
    });

    it('{ checksum: true }를 명시해도 기본값과 같다', () => {
      expect(isRRN(SOFT_RRN, { checksum: true })).toBe(false);
      expect(isFRN(SOFT_FRN, { checksum: true })).toBe(false);
    });

    it('체크섬을 꺼도 생년월일과 성별코드는 계속 검증한다', () => {
      expect(isRRN('901301-1123450', { checksum: false })).toBe(false); // 13월
      expect(isRRN('900101-5123450', { checksum: false })).toBe(false); // 외국인 코드
      expect(isFRN('900101-1123451', { checksum: false })).toBe(false); // 내국인 코드
    });

    it('validateRRN/validateFRN과 판정이 일치한다', () => {
      for (const v of [STRICT_RRN, SOFT_RRN, '901301-1123450']) {
        expect(isRRN(v, { checksum: false })).toBe(validateRRN(v, { checksum: false }).success);
        expect(isRRN(v)).toBe(validateRRN(v).success);
      }
      for (const v of [STRICT_FRN, SOFT_FRN, '901301-5123451']) {
        expect(isFRN(v, { checksum: false })).toBe(validateFRN(v, { checksum: false }).success);
        expect(isFRN(v)).toBe(validateFRN(v).success);
      }
    });
  });

  describe('validate() 13자리 폴백', () => {
    it('기본값에서는 3단계 폴백을 타지 않는다 (v1.4.0 동작 유지)', () => {
      const r = validate(SOFT_RRN);
      expect(r.type).toBe('CRN');
      expect(r.type === 'CRN' && r.result.success).toBe(false);

      const f = validate(SOFT_FRN);
      expect(f.type).toBe('CRN');
    });

    it('{ checksum: false }면 CRN 확증 실패 후 RRN/FRN으로 폴백한다', () => {
      const r = validate(SOFT_RRN, { checksum: false });
      expect(r.type).toBe('RRN');
      expect(r.type === 'RRN' && r.result.success).toBe(true);

      const f = validate(SOFT_FRN, { checksum: false });
      expect(f.type).toBe('FRN');
      expect(f.type === 'FRN' && f.result.success).toBe(true);
    });

    it('폴백이 켜져도 CRN 확증이 성립하면 CRN이 이긴다', () => {
      for (const opts of [undefined, { checksum: false }, { checksum: true }]) {
        const r = validate(CRN, opts);
        expect(r.type).toBe('CRN');
        expect(r.type === 'CRN' && r.result.success).toBe(true);
      }
    });

    it('1단계(엄격 RRN/FRN)는 옵션과 무관하게 먼저 이긴다', () => {
      for (const opts of [undefined, { checksum: false }]) {
        expect(validate(STRICT_RRN, opts).type).toBe('RRN');
        expect(validate(STRICT_FRN, opts).type).toBe('FRN');
      }
    });

    it('폴백을 켜도 생년월일이 무효하면 CRN 실패로 남는다', () => {
      const r = validate('901301-1123450', { checksum: false });
      expect(r.type).toBe('CRN');
      expect(r.type === 'CRN' && r.result.success).toBe(false);
    });

    it('13자리 외의 감지 경로는 옵션에 영향받지 않는다', () => {
      expect(validate('119-81-10010', { checksum: false }).type).toBe('BRN');
      expect(validate('M12345678', { checksum: false }).type).toBe('PASSPORT');
      expect(validate('123가4567', { checksum: false }).type).toBe('VRN');
      expect(validate('11-22-123456-78', { checksum: false }).type).toBe('DLN');
      expect(validate('P123456789012', { checksum: false }).type).toBe('PCC');
    });

    it('validate()와 isRRN이 같은 옵션에서 같은 답을 낸다', () => {
      const opts = { checksum: false };
      const r = validate(SOFT_RRN, opts);
      expect(r.type === 'RRN' && r.result.success).toBe(isRRN(SOFT_RRN, opts));
    });
  });
});
