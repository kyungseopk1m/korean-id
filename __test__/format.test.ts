import { formatBRN, formatRRN, formatCRN, formatFRN, maskRRN, maskBRN, maskFRN, formatDLN, maskDLN, formatPCC, maskPCC, maskCRN, maskPassport, formatVRN, maskVRN } from '../src/format';

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

describe('formatDLN', () => {
  it('12자리 숫자 → 하이픈 포맷', () => {
    expect(formatDLN('112212345678')).toBe('11-22-123456-78');
  });
  it('이미 포맷된 경우도 처리', () => {
    expect(formatDLN('11-22-123456-78')).toBe('11-22-123456-78');
  });
  it('잘못된 자릿수 → null', () => {
    expect(formatDLN('12345')).toBeNull();
  });
});

describe('maskDLN', () => {
  it('일련번호(6자리) 마스킹', () => {
    expect(maskDLN('11-22-123456-78')).toBe('11-22-******-78');
  });
  it('하이픈 없는 입력도 처리', () => {
    expect(maskDLN('112212345678')).toBe('11-22-******-78');
  });
  it('잘못된 형식 → null', () => {
    expect(maskDLN('12345')).toBeNull();
  });
});

describe('formatPCC', () => {
  it('소문자 p → 대문자 P로 정규화', () => {
    expect(formatPCC('p123456789012')).toBe('P123456789012');
  });
  it('이미 올바른 형식', () => {
    expect(formatPCC('P123456789012')).toBe('P123456789012');
  });
  it('잘못된 형식 → null', () => {
    expect(formatPCC('X123456789012')).toBeNull();
    expect(formatPCC('P12345')).toBeNull();
    // 길이와 접두사는 맞지만 본문이 숫자가 아닌 경우
    expect(formatPCC('P12345678901A')).toBeNull();
    expect(formatPCC('PABCDEFGHIJKL')).toBeNull();
  });
});

describe('maskPCC', () => {
  it('뒤 6자리 마스킹', () => {
    expect(maskPCC('P123456789012')).toBe('P123456******');
  });
  it('소문자 입력도 처리', () => {
    expect(maskPCC('p123456789012')).toBe('P123456******');
  });
  it('잘못된 형식 → null', () => {
    expect(maskPCC('X123456789012')).toBeNull();
  });
});

describe('maskCRN', () => {
  it('뒷부분 앞 3자리 마스킹', () => {
    expect(maskCRN('110111-0006249')).toBe('110111-***6249');
  });
  it('하이픈 없는 입력도 처리', () => {
    expect(maskCRN('1101110006249')).toBe('110111-***6249');
  });
  it('잘못된 형식 → null', () => {
    expect(maskCRN('12345')).toBeNull();
  });
});

describe('formatVRN', () => {
  it('공백 포함 → 정규화', () => {
    expect(formatVRN('123가 4567')).toBe('123가4567');
  });
  it('이미 올바른 형식', () => {
    expect(formatVRN('123가4567')).toBe('123가4567');
  });
  it('포맷은 맞지만 유효하지 않은 용도 문자 — null 아님 (validateVRN으로 검증)', () => {
    expect(formatVRN('123힣4567')).toBe('123힣4567');
  });
  it('구형(2자리) 포맷도 정규화', () => {
    expect(formatVRN('12가 3456')).toBe('12가3456');
  });
  it('자릿수 오류 → null', () => {
    expect(formatVRN('1가4567')).toBeNull();
    expect(formatVRN('1234가4567')).toBeNull();
  });
});

describe('maskVRN', () => {
  it('뒤 4자리 마스킹', () => {
    expect(maskVRN('123가4567')).toBe('123가****');
  });
  it('구형(2자리) 포맷도 뒤 4자리 마스킹', () => {
    expect(maskVRN('12가3456')).toBe('12가****');
  });
  it('공백 포함 입력도 처리', () => {
    expect(maskVRN('123가 4567')).toBe('123가****');
  });
  it('구형 + 공백 포함도 처리', () => {
    expect(maskVRN('12가 3456')).toBe('12가****');
  });
  it('포맷 자체가 잘못된 경우 → null', () => {
    expect(maskVRN('1가4567')).toBeNull();
  });
});

describe('maskPassport', () => {
  it('중간 4자리 마스킹', () => {
    expect(maskPassport('M12345678')).toBe('M1234****');
  });
  it('소문자 입력도 처리', () => {
    expect(maskPassport('m12345678')).toBe('M1234****');
  });
  it('잘못된 접두사 → null', () => {
    expect(maskPassport('X12345678')).toBeNull();
  });
  it('잘못된 자릿수 → null', () => {
    expect(maskPassport('M1234567')).toBeNull();
  });
  it('차세대 형식(2021-12~)도 뒤 4자리 마스킹', () => {
    expect(maskPassport('M123A4567')).toBe('M123A****');
    expect(maskPassport('m123a4567')).toBe('M123A****');
  });
  it('관용여권 접두사 O도 처리', () => {
    expect(maskPassport('O12345678')).toBe('O1234****');
  });
  it('G는 하위호환으로 계속 처리 (다음 major에서 제거 예정)', () => {
    expect(maskPassport('G12345678')).toBe('G1234****');
  });
  it('차세대 형식이 아닌 영숫자 혼합 → null', () => {
    expect(maskPassport('MABCDEFGH')).toBeNull();
    expect(maskPassport('M1234A567')).toBeNull();
  });
});
