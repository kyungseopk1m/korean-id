import { formatBRN, formatRRN, formatCRN, formatFRN, maskRRN, maskBRN, maskFRN } from '../src/format';

describe('formatBRN', () => {
  it('10자리 숫자 → 하이픈 포맷', () => {
    expect(formatBRN('1198110788')).toBe('119-81-10788');
  });
  it('이미 포맷된 경우도 처리', () => {
    expect(formatBRN('119-81-10788')).toBe('119-81-10788');
  });
  it('잘못된 자릿수 → null', () => {
    expect(formatBRN('12345')).toBeNull();
  });
});

describe('formatRRN', () => {
  it('13자리 숫자 → 하이픈 포맷', () => {
    expect(formatRRN('9001011234557')).toBe('900101-1234557');
  });
  it('이미 포맷된 경우도 처리', () => {
    expect(formatRRN('900101-1234557')).toBe('900101-1234557');
  });
  it('잘못된 자릿수 → null', () => {
    expect(formatRRN('123456')).toBeNull();
  });
});

describe('formatCRN', () => {
  it('13자리 숫자 → 하이픈 포맷', () => {
    expect(formatCRN('1101110006246')).toBe('110111-0006246');
  });
  it('잘못된 자릿수 → null', () => {
    expect(formatCRN('12345')).toBeNull();
  });
});

describe('formatFRN', () => {
  it('13자리 숫자 → 하이픈 포맷', () => {
    expect(formatFRN('9001015234560')).toBe('900101-5234560');
  });
});

describe('maskRRN', () => {
  it('뒤 6자리 마스킹', () => {
    expect(maskRRN('900101-1234557')).toBe('900101-1******');
  });
  it('하이픈 없는 입력도 처리', () => {
    expect(maskRRN('9001011234557')).toBe('900101-1******');
  });
  it('잘못된 형식 → null', () => {
    expect(maskRRN('12345')).toBeNull();
  });
});

describe('maskBRN', () => {
  it('뒤 5자리 중 앞 3자리 마스킹', () => {
    expect(maskBRN('119-81-10788')).toBe('119-81-***88');
  });
  it('하이픈 없는 입력도 처리', () => {
    expect(maskBRN('1198110788')).toBe('119-81-***88');
  });
  it('잘못된 형식 → null', () => {
    expect(maskBRN('12345')).toBeNull();
  });
});

describe('maskFRN', () => {
  it('뒤 6자리 마스킹', () => {
    expect(maskFRN('900101-5234560')).toBe('900101-5******');
  });
});
