import { digitsOnly } from './_internal/utils.js';

/**
 * @name formatBRN
 * @description 사업자등록번호를 XXX-XX-XXXXX 형식으로 포맷합니다. 체크섬 검증 없이 순수 포맷팅만 수행합니다. 유효성 검증이 필요하면 validateBRN을 먼저 호출하세요.
 * @example
 * formatBRN('1198110010') // '119-81-10010'
 * formatBRN('119-81-10010') // '119-81-10010'
 */
export function formatBRN(value: string): string | null {
  const d = digitsOnly(value);
  if (!d || d.length !== 10) return null;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

/**
 * @name formatRRN
 * @description 주민등록번호를 YYMMDD-XXXXXXX 형식으로 포맷합니다. 체크섬 검증 없이 순수 포맷팅만 수행합니다. 유효성 검증이 필요하면 validateRRN을 먼저 호출하세요.
 * @example
 * formatRRN('9001011123459') // '900101-1123459'
 */
export function formatRRN(value: string): string | null {
  const d = digitsOnly(value);
  if (!d || d.length !== 13) return null;
  return `${d.slice(0, 6)}-${d.slice(6)}`;
}

/**
 * @name formatCRN
 * @description 법인등록번호를 XXXXXX-XXXXXXX 형식으로 포맷합니다. 체크섬 검증 없이 순수 포맷팅만 수행합니다. 유효성 검증이 필요하면 validateCRN을 먼저 호출하세요.
 * @example
 * formatCRN('1101110006249') // '110111-0006249'
 */
export function formatCRN(value: string): string | null {
  const d = digitsOnly(value);
  if (!d || d.length !== 13) return null;
  return `${d.slice(0, 6)}-${d.slice(6)}`;
}

/**
 * @name formatFRN
 * @description 외국인등록번호를 YYMMDD-XXXXXXX 형식으로 포맷합니다. 체크섬 검증 없이 순수 포맷팅만 수행합니다. 유효성 검증이 필요하면 validateFRN을 먼저 호출하세요.
 * @example
 * formatFRN('9001015123459') // '900101-5123459'
 */
export function formatFRN(value: string): string | null {
  const d = digitsOnly(value);
  if (!d || d.length !== 13) return null;
  return `${d.slice(0, 6)}-${d.slice(6)}`;
}

/**
 * @name maskRRN
 * @description 주민등록번호 뒤 6자리를 마스킹합니다.
 * @example
 * maskRRN('900101-1123459') // '900101-1******'
 */
export function maskRRN(value: string): string | null {
  const formatted = formatRRN(value);
  if (!formatted) return null;
  return `${formatted.slice(0, 8)}${'*'.repeat(6)}`;
}

/**
 * @name maskBRN
 * @description 사업자등록번호 일련번호 앞 3자리를 마스킹합니다.
 * @example
 * maskBRN('119-81-10010') // '119-81-***10'
 */
export function maskBRN(value: string): string | null {
  const formatted = formatBRN(value);
  if (!formatted) return null;
  return `${formatted.slice(0, 7)}***${formatted.slice(10)}`;
}

/**
 * @name maskFRN
 * @description 외국인등록번호 뒤 6자리를 마스킹합니다.
 * @example
 * maskFRN('900101-5123459') // '900101-5******'
 */
export function maskFRN(value: string): string | null {
  const formatted = formatFRN(value);
  if (!formatted) return null;
  return `${formatted.slice(0, 8)}${'*'.repeat(6)}`;
}
