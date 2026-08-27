import { digitsOnly, isValidDate, fail, normalizeInput } from './_internal/utils.js';
import type { ValidateResult, ChecksumOptions } from './types.js';

export interface RRNData {
  birthDate: string;
  gender: 'male' | 'female';
  century: '1800s' | '1900s' | '2000s';
}

const GENDER_MAP: Record<string, { gender: 'male' | 'female'; century: '1800s' | '1900s' | '2000s' }> = {
  '1': { gender: 'male', century: '1900s' },
  '2': { gender: 'female', century: '1900s' },
  '3': { gender: 'male', century: '2000s' },
  '4': { gender: 'female', century: '2000s' },
  '9': { gender: 'male', century: '1800s' },
  '0': { gender: 'female', century: '1800s' },
};

const CENTURY_OFFSET: Record<string, number> = {
  '1800s': 1800,
  '1900s': 1900,
  '2000s': 2000,
};

/**
 * @name validateRRN
 * @description
 * 주민등록번호(RRN)를 검증합니다. 체크섬, 성별/세기 코드, 생년월일 유효성을 검증합니다.
 * 하이픈 포함(YYMMDD-XXXXXXX) 및 미포함(YYMMDDXXXXXXX) 형식 모두 허용합니다.
 *
 * **2020-10-05 이후 발급분을 다룬다면 `{ checksum: false }`가 필요합니다.**
 * 주민등록법 시행규칙 제204호 개편으로 신규 부여·변경 번호의 뒷자리가 성별 1자리 +
 * 임의번호 6자리가 되면서 검증번호 자리가 임의번호에 흡수되어, 기존 체크섬식이 성립하지
 * 않습니다. 기존 번호에는 여전히 성립하므로 기본값은 검증입니다.
 * (다음 major에서 기본값을 미검증으로 바꿀 예정입니다.)
 * @example
 * validateRRN('900101-1123459') // { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }
 * validateRRN('900101-1123450') // { success: false, code: 'INVALID_CHECKSUM', message: 'Invalid checksum' }
 * validateRRN('900101-1123450', { checksum: false }) // { success: true, ... }  2020-10 이후 발급분
 */
export function validateRRN(value: string, options: ChecksumOptions = {}): ValidateResult<RRNData> {
  const input = normalizeInput(value);
  if (input === null) return fail('INPUT_REQUIRED', 'Input is required');
  const d = digitsOnly(input);
  if (!d) return fail('NON_NUMERIC', 'Non-numeric characters found');
  if (d.length !== 13) return fail('INVALID_LENGTH', 'RRN must be 13 digits');

  const genderCode = d[6];
  const info = GENDER_MAP[genderCode];
  if (!info) return fail('INVALID_GENDER_CODE', 'Invalid gender/century code');

  const yy = parseInt(d.slice(0, 2), 10);
  const mm = parseInt(d.slice(2, 4), 10);
  const dd = parseInt(d.slice(4, 6), 10);
  const fullYear = CENTURY_OFFSET[info.century] + yy;

  if (!isValidDate(fullYear, mm, dd)) {
    return fail('INVALID_BIRTH_DATE', 'Invalid birth date');
  }

  if (options.checksum ?? true) {
    const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
    const digits = d.split('').map(Number);
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
    const checkDigit = (11 - (sum % 11)) % 10;
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
