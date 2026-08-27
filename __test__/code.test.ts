import {
  validateBRN,
  validateRRN,
  validateCRN,
  validateFRN,
  validatePCC,
  validateDLN,
  validatePassport,
  validateVRN,
  validate,
} from '../src/index.js';
import type { IdErrorCode } from '../src/index.js';

/** 실패 결과에서 code를 꺼낸다. 성공이면 테스트를 실패시킨다. */
function codeOf(result: { success: boolean } & Record<string, unknown>): IdErrorCode | undefined {
  if (result.success) throw new Error('성공한 결과에서 code를 요구했다');
  return result.code as IdErrorCode | undefined;
}

describe('오류 code 필드', () => {
  describe('모든 실패 경로가 code를 채운다', () => {
    const cases: Array<[string, () => { success: boolean } & Record<string, unknown>, IdErrorCode]> = [
      ['BRN 빈 입력', () => validateBRN(''), 'INPUT_REQUIRED'],
      ['BRN 비숫자', () => validateBRN('11981abcde'), 'NON_NUMERIC'],
      ['BRN 자릿수', () => validateBRN('119811001'), 'INVALID_LENGTH'],
      ['BRN 앞 3자리', () => validateBRN('100-81-10010'), 'INVALID_OFFICE_CODE'],
      ['BRN 업태코드', () => validateBRN('119-00-10010'), 'INVALID_BUSINESS_TYPE_CODE'],
      ['BRN 일련번호', () => validateBRN('119-81-00001'), 'INVALID_SERIAL_NUMBER'],
      ['BRN 체크섬', () => validateBRN('119-81-10011'), 'INVALID_CHECKSUM'],

      ['RRN 빈 입력', () => validateRRN(''), 'INPUT_REQUIRED'],
      ['RRN 비숫자', () => validateRRN('900101-112345X'), 'NON_NUMERIC'],
      ['RRN 자릿수', () => validateRRN('900101-112345'), 'INVALID_LENGTH'],
      ['RRN 성별코드', () => validateRRN('900101-5123459'), 'INVALID_GENDER_CODE'],
      ['RRN 생년월일', () => validateRRN('901301-1123459'), 'INVALID_BIRTH_DATE'],
      ['RRN 체크섬', () => validateRRN('900101-1123450'), 'INVALID_CHECKSUM'],

      ['FRN 빈 입력', () => validateFRN(''), 'INPUT_REQUIRED'],
      ['FRN 비숫자', () => validateFRN('900101-512345X'), 'NON_NUMERIC'],
      ['FRN 자릿수', () => validateFRN('900101-512345'), 'INVALID_LENGTH'],
      ['FRN 성별코드', () => validateFRN('900101-1123459'), 'INVALID_GENDER_CODE'],
      ['FRN 생년월일', () => validateFRN('901301-5123452'), 'INVALID_BIRTH_DATE'],
      ['FRN 체크섬', () => validateFRN('900101-5123451'), 'INVALID_CHECKSUM'],

      ['CRN 빈 입력', () => validateCRN(''), 'INPUT_REQUIRED'],
      ['CRN 비숫자', () => validateCRN('110111-000624X'), 'NON_NUMERIC'],
      ['CRN 자릿수', () => validateCRN('110111-000624'), 'INVALID_LENGTH'],
      ['CRN 체크섬', () => validateCRN('110111-0006248'), 'INVALID_CHECKSUM'],

      ['PCC 빈 입력', () => validatePCC(''), 'INPUT_REQUIRED'],
      ['PCC 자릿수', () => validatePCC('P12345678901'), 'INVALID_LENGTH'],
      ['PCC 접두사', () => validatePCC('X123456789012'), 'INVALID_PREFIX'],
      ['PCC 본문', () => validatePCC('P12345678901A'), 'INVALID_FORMAT'],

      ['DLN 빈 입력', () => validateDLN(''), 'INPUT_REQUIRED'],
      ['DLN 비숫자', () => validateDLN('11-22-123456-7X'), 'NON_NUMERIC'],
      ['DLN 자릿수', () => validateDLN('11-22-123456-7'), 'INVALID_LENGTH'],
      ['DLN 지역코드', () => validateDLN('99-22-123456-78'), 'INVALID_REGION_CODE'],

      ['Passport 빈 입력', () => validatePassport(''), 'INPUT_REQUIRED'],
      ['Passport 자릿수', () => validatePassport('M1234567'), 'INVALID_LENGTH'],
      ['Passport 접두사', () => validatePassport('X12345678'), 'INVALID_PREFIX'],
      ['Passport 본문', () => validatePassport('M1234567A'), 'INVALID_FORMAT'],

      ['VRN 빈 입력', () => validateVRN(''), 'INPUT_REQUIRED'],
      ['VRN 포맷', () => validateVRN('123가456'), 'INVALID_FORMAT'],
      ['VRN 용도문자', () => validateVRN('123힣4567'), 'INVALID_CHARACTER'],
      ['VRN 지역명', () => validateVRN('독도82바1234'), 'INVALID_REGION'],
      ['VRN 지역명 용도불가', () => validateVRN('서울82가1234'), 'REGION_NOT_ALLOWED'],
    ];

    it.each(cases)('%s → %s', (_label, run, expected) => {
      expect(codeOf(run())).toBe(expected);
    });
  });

  it('validate()의 감지 실패도 code를 채운다', () => {
    const empty = validate('');
    expect(empty.type).toBeNull();
    expect(empty.type === null && empty.code).toBe('INPUT_REQUIRED');

    const unknown = validate('12345');
    expect(unknown.type).toBeNull();
    expect(unknown.type === null && unknown.code).toBe('UNDETECTABLE');
  });

  it('성공 결과에는 code가 없다', () => {
    const ok = validateBRN('119-81-10010');
    expect(ok.success).toBe(true);
    expect('code' in ok).toBe(false);
  });

  it('message 문자열은 v1.4.0과 동일하게 유지된다', () => {
    // code를 도입하면서 문구를 손대면 문자열을 비교하는 소비자가 깨진다.
    expect(validateBRN('100-81-10010')).toMatchObject({ message: 'Invalid tax office code' });
    expect(validateRRN('900101-1123450')).toMatchObject({ message: 'Invalid checksum' });
    expect(validatePassport('M1234567A')).toMatchObject({
      message: 'Passport must have 8 digits after prefix',
    });
    expect(validateVRN('123힣4567')).toMatchObject({ message: 'Invalid VRN character' });
  });
});
