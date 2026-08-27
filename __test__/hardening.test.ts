import * as lib from '../src/index.js';

/** 타입은 string이지만 JS 소비자가 실제로 넘기는 값들 */
const BAD_INPUTS: unknown[] = [
  null,
  undefined,
  0,
  123,
  9001011123459,
  NaN,
  true,
  false,
  {},
  [],
  ['900101-1123459'],
  Symbol('x'),
  () => '900101-1123459',
];

const FUNCTIONS = Object.entries(lib).filter(
  (entry): entry is [string, (v: unknown, o?: unknown) => unknown] => typeof entry[1] === 'function',
);

describe('비문자열 입력 하드닝', () => {
  it('공개 함수가 24개 이상 잡힌다', () => {
    // 이 목록이 비면 아래 테스트가 전부 공회전한다.
    expect(FUNCTIONS.length).toBeGreaterThanOrEqual(24);
  });

  it.each(FUNCTIONS)('%s은 어떤 비문자열 입력에도 던지지 않는다', (_name, fn) => {
    for (const input of BAD_INPUTS) {
      expect(() => fn(input)).not.toThrow();
    }
  });

  describe('던지는 대신 실패로 답한다', () => {
    it('validate 계열은 INPUT_REQUIRED를 낸다', () => {
      for (const input of BAD_INPUTS) {
        expect(lib.validateBRN(input as string)).toEqual({
          success: false,
          code: 'INPUT_REQUIRED',
          message: 'Input is required',
        });
        expect(lib.validateVRN(input as string)).toMatchObject({ code: 'INPUT_REQUIRED' });
        expect(lib.validatePassport(input as string)).toMatchObject({ code: 'INPUT_REQUIRED' });
        expect(lib.validatePCC(input as string)).toMatchObject({ code: 'INPUT_REQUIRED' });
      }
    });

    it('type guard는 false를 낸다', () => {
      for (const input of BAD_INPUTS) {
        expect(lib.isBRN(input as string)).toBe(false);
        expect(lib.isRRN(input as string)).toBe(false);
        expect(lib.isVRN(input as string)).toBe(false);
        expect(lib.isPassport(input as string)).toBe(false);
      }
    });

    it('format / mask는 null을 낸다', () => {
      for (const input of BAD_INPUTS) {
        expect(lib.formatBRN(input as string)).toBeNull();
        expect(lib.formatRRN(input as string)).toBeNull();
        expect(lib.formatVRN(input as string)).toBeNull();
        expect(lib.formatPCC(input as string)).toBeNull();
        expect(lib.maskRRN(input as string)).toBeNull();
        expect(lib.maskVRN(input as string)).toBeNull();
        expect(lib.maskPassport(input as string)).toBeNull();
      }
    });

    it('validate()는 type null을 낸다', () => {
      for (const input of BAD_INPUTS) {
        const r = lib.validate(input as string);
        expect(r.type).toBeNull();
        expect(r.type === null && r.code).toBe('INPUT_REQUIRED');
      }
    });
  });

  describe('String 객체는 문자열로 취급한다', () => {
    // 이전 버전은 value.trim()을 바로 불러서 String 객체를 원시 문자열과 똑같이 처리했다.
    // 여기서 거부하면 그 입력들의 판정이 뒤집힌다.
    it('유효 입력의 판정이 원시 문자열과 같다', () => {
      expect(lib.validateBRN(new String('119-81-10010') as string)).toEqual(
        lib.validateBRN('119-81-10010'),
      );
      expect(lib.validateVRN(new String('서울 82바 1234') as string)).toEqual(
        lib.validateVRN('서울 82바 1234'),
      );
      expect(lib.isPassport(new String('M123A4567') as string)).toBe(true);
      expect(lib.formatBRN(new String('1198110010') as string)).toBe('119-81-10010');
      expect(lib.maskRRN(new String('900101-1123459') as string)).toBe('900101-1******');
      expect(lib.validate(new String('119-81-10010') as string)).toEqual(lib.validate('119-81-10010'));
    });

    it('무효 입력의 실패 사유도 원시 문자열과 같다', () => {
      expect(lib.validateBRN(new String('100-81-10010') as string)).toEqual(
        lib.validateBRN('100-81-10010'),
      );
      expect(lib.validateRRN(new String('900101-1123450') as string)).toEqual(
        lib.validateRRN('900101-1123450'),
      );
    });

    it('빈 String 객체는 INPUT_REQUIRED다', () => {
      expect(lib.validateBRN(new String('') as string)).toMatchObject({ code: 'INPUT_REQUIRED' });
      expect(lib.validateBRN(new String('   ') as string)).toMatchObject({ code: 'INPUT_REQUIRED' });
    });

    it('checksum 옵션도 String 객체에서 동작한다', () => {
      expect(lib.isRRN(new String('900101-1123450') as string, { checksum: false })).toBe(true);
    });
  });

  describe('문자열 입력의 판정은 그대로다', () => {
    it('빈 문자열과 공백은 이전과 같이 INPUT_REQUIRED', () => {
      for (const input of ['', ' ', '   ', '\t', '\n']) {
        expect(lib.validateBRN(input)).toMatchObject({ message: 'Input is required' });
        expect(lib.validate(input)).toMatchObject({ message: 'Input is required' });
      }
    });

    it('앞뒤 공백이 붙은 유효 입력은 계속 통과한다', () => {
      expect(lib.isBRN(' 119-81-10010 ')).toBe(true);
      expect(lib.isPassport('  M12345678  ')).toBe(true);
      expect(lib.isPCC(' P123456789012 ')).toBe(true);
      expect(lib.isVRN(' 123가4567 ')).toBe(true);
      expect(lib.formatBRN(' 119-81-10010 ')).toBe('119-81-10010');
    });

    it('유효하지 않은 문자열은 원래 사유를 유지한다', () => {
      expect(lib.validateBRN('11981abcde')).toMatchObject({ message: 'Non-numeric characters found' });
      expect(lib.validateBRN('119811001')).toMatchObject({ message: 'BRN must be 10 digits' });
    });
  });
});
