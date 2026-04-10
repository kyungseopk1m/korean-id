import { digitsOnly, isValidDate } from './_internal/utils.js';
import type { ValidateResult } from './types.js';

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
 * 주민등록번호(RRN)를 검증합니다. 체크섬 알고리즘, 성별/세기 코드, 생년월일 유효성을 검증합니다.
 * 하이픈 포함(YYMMDD-XXXXXXX) 및 미포함(YYMMDDXXXXXXX) 형식 모두 허용합니다.
 * @example
 * validateRRN('900101-1123459') // { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }
 * validateRRN('900101-1123450') // { success: false, message: 'Invalid checksum' }
 */
export function validateRRN(value: string): ValidateResult<RRNData> {
  if (!value.trim()) return { success: false, message: 'Input is required' };
  const d = digitsOnly(value);
  if (!d) return { success: false, message: 'Non-numeric characters found' };
  if (d.length !== 13) return { success: false, message: 'RRN must be 13 digits' };

  const genderCode = d[6];
  const info = GENDER_MAP[genderCode];
  if (!info) return { success: false, message: 'Invalid gender/century code' };

  const yy = parseInt(d.slice(0, 2));
  const mm = parseInt(d.slice(2, 4));
  const dd = parseInt(d.slice(4, 6));
  const fullYear = CENTURY_OFFSET[info.century] + yy;

  if (!isValidDate(fullYear, mm, dd)) {
    return { success: false, message: 'Invalid birth date' };
  }

  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  const digits = d.split('').map(Number);
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const checkDigit = (11 - (sum % 11)) % 10;

  if (checkDigit !== digits[12]) {
    return { success: false, message: 'Invalid checksum' };
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
