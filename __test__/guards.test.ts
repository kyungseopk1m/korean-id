import { isBRN, isRRN, isCRN, isFRN, isPCC, isDLN, isPassport, isVRN } from '../src/guards';

describe('타입 가드', () => {
  it('isBRN', () => {
    expect(isBRN('119-81-10010')).toBe(true);
    expect(isBRN('000-00-00000')).toBe(false);
  });

  it('isRRN', () => {
    expect(isRRN('900101-1123459')).toBe(true);
    expect(isRRN('900101-1123450')).toBe(false);
  });

  it('isCRN', () => {
    expect(isCRN('110111-0006249')).toBe(true);
    expect(isCRN('110111-0006248')).toBe(false);
  });

  it('isFRN', () => {
    expect(isFRN('900101-5123452')).toBe(true);
    expect(isFRN('900101-5123450')).toBe(false);
  });

  it('isPCC', () => {
    expect(isPCC('P123456789012')).toBe(true);
    expect(isPCC('X123456789012')).toBe(false);
  });

  it('isDLN', () => {
    expect(isDLN('11-22-123456-78')).toBe(true);
    expect(isDLN('99-22-123456-78')).toBe(false);
  });

  it('isPassport', () => {
    expect(isPassport('M12345678')).toBe(true);
    expect(isPassport('X12345678')).toBe(false);
    // v1.4.0: 차세대 형식과 관용여권 O 수용
    expect(isPassport('M123A4567')).toBe(true);
    expect(isPassport('O12345678')).toBe(true);
    expect(isPassport('G12345678')).toBe(true); // 하위호환
  });

  it('isRRN/isFRN은 체크섬 옵션과 무관하게 기본(검증) 동작', () => {
    expect(isRRN('900101-1123450')).toBe(false);
    expect(isFRN('900101-5123450')).toBe(false);
  });

  it('isVRN', () => {
    expect(isVRN('123가4567')).toBe(true);
    expect(isVRN('12가3456')).toBe(true); // 구형 포맷
    expect(isVRN('123힣4567')).toBe(false);
  });
});
