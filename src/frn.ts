import { digitsOnly, isValidDate, fail, normalizeInput } from './_internal/utils.js';
import type { ValidateResult, ChecksumOptions } from './types.js';

export interface FRNData {
  birthDate: string;
  gender: 'male' | 'female';
  century: '1900s' | '2000s';
}

const GENDER_MAP: Record<string, { gender: 'male' | 'female'; century: '1900s' | '2000s' }> = {
  '5': { gender: 'male', century: '1900s' },
  '6': { gender: 'female', century: '1900s' },
  '7': { gender: 'male', century: '2000s' },
  '8': { gender: 'female', century: '2000s' },
};

/**
 * @name validateFRN
 * @description
 * 외국인등록번호(FRN)를 검증합니다. 7번째 자리가 외국인 코드(5,6,7,8)인지, 생년월일, 체크섬을 검증합니다.
 *
 * 체크섬은 RRN 방식 체크디지트에 +2(mod 10) 보정을 더한 값으로, 전자정부 표준
 * EgovNumberCheckUtil.checkForeignNumber와 동치입니다.
 *
 * 검증번호가 없는 번호를 다뤄야 한다면 `{ checksum: false }`로 체크섬을 건너뛸 수 있습니다.
 * 주민등록번호와 달리 외국인등록번호의 검증번호가 폐지되었다는 1차 근거는 확인되지 않았습니다.
 * 출입국관리법 시행령 제40조의3은 세부 체계를 법무부장관에게 위임할 뿐 체크디지트 폐지를
 * 규정하지 않으므로, 기본값은 계속 검증입니다.
 * 하이픈 포함(YYMMDD-XXXXXXX) 및 미포함(YYMMDDXXXXXXX) 형식 모두 허용합니다.
 * @example
 * validateFRN('900101-5123452') // { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }
 * validateFRN('900101-1123459') // { success: false, code: 'INVALID_GENDER_CODE', message: 'Invalid gender/century code for foreigner' }
 * validateFRN('900101-5123451') // { success: false, code: 'INVALID_CHECKSUM', message: 'Invalid checksum' }
 * validateFRN('900101-5123451', { checksum: false }) // { success: true, ... }
 */
export function validateFRN(value: string, options: ChecksumOptions = {}): ValidateResult<FRNData> {
  const input = normalizeInput(value);
  if (input === null) return fail('INPUT_REQUIRED', 'Input is required');
  const d = digitsOnly(input);
  if (!d) return fail('NON_NUMERIC', 'Non-numeric characters found');
  if (d.length !== 13) return fail('INVALID_LENGTH', 'FRN must be 13 digits');

  const genderCode = d[6];
  const info = GENDER_MAP[genderCode];
  if (!info) return fail('INVALID_GENDER_CODE', 'Invalid gender/century code for foreigner');

  const yy = parseInt(d.slice(0, 2), 10);
  const mm = parseInt(d.slice(2, 4), 10);
  const dd = parseInt(d.slice(4, 6), 10);
  const fullYear = (info.century === '1900s' ? 1900 : 2000) + yy;

  if (!isValidDate(fullYear, mm, dd)) {
    return fail('INVALID_BIRTH_DATE', 'Invalid birth date');
  }

  if (options.checksum ?? true) {
    const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
    const digits = d.split('').map(Number);
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
    // FRN 검증번호 = RRN 방식 체크디지트에 +2(mod 10) 보정 (전자정부 표준 EgovNumberCheckUtil)
    const checkDigit = (((11 - (sum % 11)) % 10) + 2) % 10;
    if (checkDigit !== digits[12]) {
      return fail('INVALID_CHECKSUM', 'Invalid checksum');
    }
  }

  const month = String(mm).padStart(2, '0');
  const day = String(dd).padStart(2, '0');

  return {
    success: true,
    data: {
      birthDate: `${fullYear}-${month}-${day}`,
      gender: info.gender,
      century: info.century,
    },
  };
}
