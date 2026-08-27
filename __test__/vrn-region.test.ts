import { validateVRN, isVRN, formatVRN, maskVRN, VRN_REGIONS } from '../src/index.js';

describe('VRN 일반사업용 지역명 번호판', () => {
  it('지역명 + 2자리 + 사업용 문자 + 4자리를 수용한다', () => {
    expect(validateVRN('서울 82바 1234')).toEqual({
      success: true,
      data: { usage: '영업용', char: '바', format: 'legacy', region: '서울' },
    });
  });

  it('공백 유무와 무관하게 같은 결과를 낸다', () => {
    expect(validateVRN('서울82바1234')).toEqual(validateVRN('서울 82바 1234'));
    expect(validateVRN(' 서울  82바  1234 ')).toEqual(validateVRN('서울82바1234'));
  });

  it('VRN_REGIONS는 고시 제6조의 시·도 약칭 17종이다', () => {
    // 구현이 export한 목록을 그대로 되먹이면 값이 틀려도 통과한다. 기대값을 직접 적는다.
    expect([...VRN_REGIONS]).toEqual([
      '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
      '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
    ]);
  });

  it('17개 지역명이 전부 실제로 통과한다', () => {
    for (const region of ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
      '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']) {
      expect(isVRN(`${region}82바1234`)).toBe(true);
    }
  });

  it('사업용 문자 5종 전부에서 동작한다', () => {
    // 고시 제5조 일반용 자동차운수사업: 바, 사, 아, 자, 배
    for (const char of ['바', '사', '아', '자', '배']) {
      const r = validateVRN(`서울82${char}1234`);
      expect(r.success).toBe(true);
      expect(r.success && r.data).toEqual({
        usage: '영업용',
        char,
        format: 'legacy',
        region: '서울',
      });
    }
  });

  it('`배`는 지역명 경로에서 영업용, 지역명 없는 경로에서는 이전 버전대로 기타다', () => {
    // 지역명 경로는 신규라 고시대로 낼 수 있지만, 지역명 없는 입력을 바꾸면 판정 반전이다.
    expect(validateVRN('서울82배1234')).toMatchObject({ data: { usage: '영업용' } });
    expect(validateVRN('123배4567')).toMatchObject({ data: { usage: '기타' } });
    expect(validateVRN('12배3456')).toMatchObject({ data: { usage: '기타' } });
  });

  it('분류기호 2자리 경계를 수용한다 (01~99)', () => {
    for (const front of ['01', '09', '69', '70', '80', '97', '98', '99']) {
      expect(isVRN(`서울${front}바1234`)).toBe(true);
    }
  });

  describe('거부하는 지역명 조합', () => {
    it.each([
      ['목록에 없는 지역명', '독도82바1234', 'INVALID_REGION'],
      ['자가용 문자', '서울82가1234', 'REGION_NOT_ALLOWED'],
      ['대여사업용 문자', '서울82허1234', 'REGION_NOT_ALLOWED'],
      ['3자리 분류기호', '서울123바4567', 'INVALID_FORMAT'],
      ['분류기호 00', '서울00바1234', 'INVALID_FORMAT'],
    ])('%s은 거부한다', (_label, value, code) => {
      const r = validateVRN(value);
      expect(r.success).toBe(false);
      expect(r.success === false && r.code).toBe(code);
    });

    it('지역명 + 무효 용도문자도 format 메시지로 거부한다', () => {
      // 용도문자 검사를 지역명 분기보다 앞에 두면 'Invalid VRN character'가 나가서
      // 이전 버전(전부 'Invalid VRN format')과 문자열이 달라진다.
      expect(validateVRN('서울82힣1234')).toMatchObject({
        code: 'INVALID_CHARACTER',
        message: 'Invalid VRN format',
      });
      expect(validateVRN('독도82힣1234')).toMatchObject({ message: 'Invalid VRN format' });
    });

    it('지역명 경로의 실패 메시지는 이전 버전과 같은 문자열을 쓴다', () => {
      // 이 입력들은 이전 버전에서 전부 'Invalid VRN format'으로 거부됐다.
      // 사유는 code로만 구분하고 message는 건드리지 않는다.
      for (const v of ['독도82바1234', '서울82가1234', '서울123바4567', '서울00바1234']) {
        expect(validateVRN(v)).toMatchObject({ message: 'Invalid VRN format' });
      }
    });
  });

  describe('지역명이 없는 입력은 이전 버전과 동일하다', () => {
    it('전국번호판 판정이 그대로다', () => {
      expect(validateVRN('123가4567')).toEqual({
        success: true,
        data: { usage: '자가용', char: '가', format: 'current' },
      });
      expect(validateVRN('12가3456')).toEqual({
        success: true,
        data: { usage: '자가용', char: '가', format: 'legacy' },
      });
    });

    it('region 필드를 붙이지 않는다', () => {
      const r = validateVRN('123가4567');
      expect(r.success && 'region' in r.data).toBe(false);
    });

    it('3자리 사업용·대여사업용은 계속 통과한다 (강화하지 않는다)', () => {
      // 고시상으로는 사업용 3자리가 없지만, 이전 버전이 통과시키던 입력이라 유지한다.
      expect(isVRN('123바4567')).toBe(true);
      expect(isVRN('123허4567')).toBe(true);
    });

    it('선두 0 분류기호도 계속 통과한다 (강화하지 않는다)', () => {
      expect(isVRN('000가1234')).toBe(true);
      expect(isVRN('00가1234')).toBe(true);
    });

    it('용도 문자 검증은 그대로다', () => {
      expect(validateVRN('123힣4567')).toMatchObject({
        code: 'INVALID_CHARACTER',
        message: 'Invalid VRN character',
      });
    });
  });

  describe('format / mask 대칭', () => {
    it('formatVRN이 지역명 번호판을 정규화한다', () => {
      expect(formatVRN('서울 82바 1234')).toBe('서울82바1234');
      expect(formatVRN('  서울82바1234  ')).toBe('서울82바1234');
    });

    it('maskVRN이 지역명 번호판의 뒤 4자리를 가린다', () => {
      expect(maskVRN('서울 82바 1234')).toBe('서울82바****');
    });

    it('validateVRN이 통과시키는 입력은 formatVRN도 통과시킨다', () => {
      const inputs = ['123가4567', '12가3456', '서울82바1234', '제주99자1234'];
      for (const v of inputs) {
        expect(validateVRN(v).success).toBe(true);
        expect(formatVRN(v)).not.toBeNull();
        expect(maskVRN(v)).not.toBeNull();
      }
    });

    it('지역명 없는 입력의 format/mask는 그대로다', () => {
      expect(formatVRN('123가 4567')).toBe('123가4567');
      expect(maskVRN('123가4567')).toBe('123가****');
      expect(formatVRN('1234가4567')).toBeNull();
    });
  });
});
