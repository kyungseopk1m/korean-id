import { digitsOnly, fail, normalizeInput } from './_internal/utils.js';
import type { ValidateResult } from './types.js';

/**
 * @name validateCRN
 * @description
 * 법인등록번호(CRN)를 검증합니다. Luhn-like 체크섬 알고리즘을 사용합니다.
 * 하이픈 포함(XXXXXX-XXXXXXX) 및 미포함(XXXXXXXXXXXXX) 형식 모두 허용합니다.
 * @example
 * validateCRN('110111-0006249') // { success: true }
 * validateCRN('110111-0006248') // { success: false, code: 'INVALID_CHECKSUM', message: 'Invalid checksum' }
 */
export function validateCRN(value: string): ValidateResult {
  const input = normalizeInput(value);
  if (input === null) return fail('INPUT_REQUIRED', 'Input is required');
  const d = digitsOnly(input);
  if (!d) return fail('NON_NUMERIC', 'Non-numeric characters found');
  if (d.length !== 13) return fail('INVALID_LENGTH', 'CRN must be 13 digits');

  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digits = d.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const product = digits[i] * weights[i];
    sum += product >= 10 ? Math.floor(product / 10) + (product % 10) : product;
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  if (checkDigit !== digits[12]) {
    return fail('INVALID_CHECKSUM', 'Invalid checksum');
  }

  return { success: true };
}
