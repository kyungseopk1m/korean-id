import type { ValidateResult } from './types.js';

export interface PCCData {
  /** P를 제외한 12자리 숫자 */
  number: string;
}

/**
 * @name validatePCC
 * @description
 * 개인통관고유부호(PCC)를 검증합니다. 관세청 발급 번호로 체크섬은 비공개이며 포맷 검증만 수행합니다.
 * 포맷: `P` + 12자리 숫자 (총 13자)
 * @example
 * validatePCC('P123456789012') // { success: true, data: { number: '123456789012' } }
 * validatePCC('X123456789012') // { success: false, message: 'PCC must start with P' }
 */
export function validatePCC(value: string): ValidateResult<PCCData> {
  if (!value.trim()) return { success: false, message: 'Input is required' };
  const trimmed = value.trim().toUpperCase();
  if (trimmed.length !== 13) return { success: false, message: 'PCC must be 13 characters' };
  if (trimmed[0] !== 'P') return { success: false, message: 'PCC must start with P' };
  const number = trimmed.slice(1);
  if (!/^\d{12}$/.test(number)) return { success: false, message: 'PCC must have 12 digits after P' };
  return { success: true, data: { number } };
}
