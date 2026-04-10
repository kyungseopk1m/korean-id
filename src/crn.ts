import { digitsOnly } from './_internal/utils.js';
import type { ValidateResult } from './types.js';

/**
 * @name validateCRN
 * @description
 * 법인등록번호(CRN)를 검증합니다. Luhn-like 체크섬 알고리즘을 사용합니다.
 * 하이픈 포함(XXXXXX-XXXXXXX) 및 미포함(XXXXXXXXXXXXX) 형식 모두 허용합니다.
 * @example
 * validateCRN('110111-0006249') // { success: true }
 * validateCRN('110111-0006248') // { success: false, message: 'Invalid checksum' }
 */
export function validateCRN(value: string): ValidateResult {
  if (!value.trim()) return { success: false, message: 'Input is required' };
  const d = digitsOnly(value);
  if (!d) return { success: false, message: 'Non-numeric characters found' };
  if (d.length !== 13) return { success: false, message: 'CRN must be 13 digits' };

  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digits = d.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const product = digits[i] * weights[i];
    sum += product >= 10 ? Math.floor(product / 10) + (product % 10) : product;
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  if (checkDigit !== digits[12]) {
    return { success: false, message: 'Invalid checksum' };
  }

  return { success: true };
}
