import type { ValidateResult } from './types.js';

/** 여권번호 접두사 → 여권 종류 매핑 */
export const PASSPORT_TYPES: Readonly<Record<string, string>> = {
  M: '복수여권',
  S: '단수여권',
  R: '거주여권',
  G: '관용여권',
  D: '외교관여권',
};

export interface PassportData {
  type: string;
  prefix: string;
}

/**
 * @name validatePassport
 * @description
 * 여권번호(Passport)를 검증합니다. 접두사 유효성 및 포맷 검증을 수행합니다.
 * 포맷: 영문 1자(M/S/R/G/D) + 8자리 숫자 (총 9자)
 * @example
 * validatePassport('M12345678') // { success: true, data: { type: '복수여권', prefix: 'M' } }
 * validatePassport('X12345678') // { success: false, message: 'Invalid passport prefix' }
 */
export function validatePassport(value: string): ValidateResult<PassportData> {
  if (!value.trim()) return { success: false, message: 'Input is required' };
  const trimmed = value.trim().toUpperCase();
  if (trimmed.length !== 9) return { success: false, message: 'Passport number must be 9 characters' };

  const prefix = trimmed[0];
  const type = PASSPORT_TYPES[prefix];
  if (!type) return { success: false, message: 'Invalid passport prefix' };

  const digits = trimmed.slice(1);
  if (!/^\d{8}$/.test(digits)) return { success: false, message: 'Passport must have 8 digits after prefix' };

  return { success: true, data: { type, prefix } };
}
