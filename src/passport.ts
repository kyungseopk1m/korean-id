import { fail, normalizeInput } from './_internal/utils.js';
import type { ValidateResult } from './types.js';

/**
 * 여권번호 접두사 → 여권 종류 매핑.
 *
 * 관용여권의 공식 접두사는 `O`(Official)입니다. `G`는 근거를 확인하지 못했으나
 * 하위호환을 위해 남겨두었으며 **다음 major에서 제거될 예정**입니다.
 */
export const PASSPORT_TYPES: Readonly<Record<string, string>> = {
  M: '복수여권',
  S: '단수여권',
  R: '거주여권',
  O: '관용여권',
  /** @deprecated 근거 미확인. 다음 major에서 제거됩니다. 관용여권은 `O`를 쓰세요. */
  G: '관용여권',
  D: '외교관여권',
};

/** 여권번호 포맷 세대. `current`(2021-12~, 영숫자 혼합) / `legacy`(~2021, 숫자 8자리) */
export type PassportFormat = 'current' | 'legacy';

export interface PassportData {
  type: string;
  prefix: string;
  /**
   * 포맷 세대. 하위호환을 위해 선택 필드이며 실제로는 항상 채워집니다.
   * 다음 major에서 필수 필드가 됩니다.
   */
  format?: PassportFormat;
}

// 구형(~2021): 영문접두사 + 숫자 8자리 (예: M12345678)
const LEGACY_BODY = /^\d{8}$/;
// 차세대(2021-12~): 영문접두사 + 숫자 3자리 + 영문 1자 + 숫자 4자리 (예: M123A4567)
const CURRENT_BODY = /^\d{3}[A-Z]\d{4}$/;

/**
 * @name validatePassport
 * @description
 * 여권번호(Passport)를 검증합니다. 접두사 유효성 및 포맷 검증을 수행합니다.
 * 구형(~2021): 영문 1자(M/S/R/O/D) + 숫자 8자리 (예: M12345678)
 * 차세대(2021-12~): 영문 1자 + 숫자 3자리 + 영문 1자 + 숫자 4자리 (예: M123A4567)
 * (모두 총 9자. 거주여권 R은 2017-12 폐지됐으나 기발급분 유효기간까지 유효하여 수용)
 * @example
 * validatePassport('M12345678') // { success: true, data: { type: '복수여권', prefix: 'M', format: 'legacy' } }
 * validatePassport('M123A4567') // { success: true, data: { type: '복수여권', prefix: 'M', format: 'current' } }
 * validatePassport('O12345678') // { success: true, data: { type: '관용여권', prefix: 'O', format: 'legacy' } }
 * validatePassport('X12345678') // { success: false, code: 'INVALID_PREFIX', message: 'Invalid passport prefix' }
 */
export function validatePassport(value: string): ValidateResult<PassportData> {
  const input = normalizeInput(value);
  if (input === null) return fail('INPUT_REQUIRED', 'Input is required');
  const trimmed = input.toUpperCase();
  if (trimmed.length !== 9) return fail('INVALID_LENGTH', 'Passport number must be 9 characters');

  const prefix = trimmed[0];
  const type = PASSPORT_TYPES[prefix];
  if (!type) return fail('INVALID_PREFIX', 'Invalid passport prefix');

  const body = trimmed.slice(1);
  const format: PassportFormat | null = LEGACY_BODY.test(body)
    ? 'legacy'
    : CURRENT_BODY.test(body)
      ? 'current'
      : null;
  // 차세대 형식 수용으로 "8자리"가 더 이상 정확하지 않으나, 이 문자열을 비교하는 코드가
  // 깨지지 않도록 v1.3.0 메시지를 유지한다. 다음 major에서 정정한다.
  if (!format) return fail('INVALID_FORMAT', 'Passport must have 8 digits after prefix');

  return { success: true, data: { type, prefix, format } };
}
