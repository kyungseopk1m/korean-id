import { digitsOnly, normalizeInput } from './_internal/utils.js';
import { PASSPORT_TYPES } from './passport.js';

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

/**
 * @name formatDLN
 * @description 운전면허번호를 XX-XX-XXXXXX-XX 형식으로 포맷합니다. 유효성 검증이 필요하면 validateDLN을 먼저 호출하세요.
 * @example
 * formatDLN('112212345678') // '11-22-123456-78'
 */
export function formatDLN(value: string): string | null {
  const d = digitsOnly(value);
  if (!d || d.length !== 12) return null;
  return `${d.slice(0, 2)}-${d.slice(2, 4)}-${d.slice(4, 10)}-${d.slice(10)}`;
}

/**
 * @name maskDLN
 * @description 운전면허번호 일련번호(6자리)를 마스킹합니다.
 * @example
 * maskDLN('11-22-123456-78') // '11-22-******-78'
 */
export function maskDLN(value: string): string | null {
  const formatted = formatDLN(value);
  if (!formatted) return null;
  return `${formatted.slice(0, 6)}${'*'.repeat(6)}${formatted.slice(12)}`;
}

/**
 * @name formatPCC
 * @description 개인통관고유부호를 P + 12자리 형식으로 정규화합니다. 유효성 검증이 필요하면 validatePCC를 먼저 호출하세요.
 * @example
 * formatPCC('p123456789012') // 'P123456789012'
 */
export function formatPCC(value: string): string | null {
  const input = normalizeInput(value);
  if (input === null) return null;
  const trimmed = input.toUpperCase();
  if (trimmed.length !== 13 || trimmed[0] !== 'P') return null;
  if (!/^\d{12}$/.test(trimmed.slice(1))) return null;
  return trimmed;
}

/**
 * @name maskPCC
 * @description 개인통관고유부호 뒤 6자리를 마스킹합니다.
 * @example
 * maskPCC('P123456789012') // 'P123456******'
 */
export function maskPCC(value: string): string | null {
  const formatted = formatPCC(value);
  if (!formatted) return null;
  return `${formatted.slice(0, 7)}${'*'.repeat(6)}`;
}

/**
 * @name maskCRN
 * @description 법인등록번호 뒷부분 앞 3자리를 마스킹합니다.
 * @example
 * maskCRN('110111-0006249') // '110111-***6249'
 */
export function maskCRN(value: string): string | null {
  const formatted = formatCRN(value);
  if (!formatted) return null;
  return `${formatted.slice(0, 7)}***${formatted.slice(10)}`;
}

/**
 * @name formatVRN
 * @description 자동차등록번호에서 공백을 제거하여 정규화합니다. 전국번호판의 현행(2019~)/구형(2006~2018)과 일반사업용(지역명 포함) 포맷을 지원합니다. 포맷 검증이 필요하면 validateVRN을 먼저 호출하세요.
 * @example
 * formatVRN('123가 4567')   // '123가4567'
 * formatVRN('12가 3456')    // '12가3456'
 * formatVRN('서울 82바 1234') // '서울82바1234'
 */
export function formatVRN(value: string): string | null {
  const input = normalizeInput(value);
  if (input === null) return null;
  const trimmed = input.replace(/\s/g, '');
  // 선택적 지역명(한글 2자) + 현행(3자리) 또는 구형(2자리) + 한글1자 + 4자리숫자
  if (!/^([가-힣]{2})?\d{2,3}[가-힣]\d{4}$/.test(trimmed)) return null;
  return trimmed;
}

/**
 * @name maskVRN
 * @description 자동차등록번호 뒤 4자리를 마스킹합니다.
 * @example
 * maskVRN('123가4567')   // '123가****'
 * maskVRN('12가3456')    // '12가****'
 * maskVRN('서울82바1234') // '서울82바****'
 */
export function maskVRN(value: string): string | null {
  const formatted = formatVRN(value);
  if (!formatted) return null;
  return `${formatted.slice(0, -4)}${'*'.repeat(4)}`;
}

// 구형(숫자 8자리) 또는 차세대(숫자3 + 영문1 + 숫자4) 본문
const PASSPORT_BODY = /^(?:\d{8}|\d{3}[A-Z]\d{4})$/;

/**
 * @name maskPassport
 * @description 여권번호 뒤 4자리를 마스킹합니다. 구형(M12345678)·차세대(M123A4567) 형식 모두 지원합니다.
 * @example
 * maskPassport('M12345678') // 'M1234****'
 * maskPassport('M123A4567') // 'M123A****'
 */
export function maskPassport(value: string): string | null {
  const input = normalizeInput(value);
  if (input === null) return null;
  const trimmed = input.toUpperCase();
  if (trimmed.length !== 9) return null;
  if (!PASSPORT_TYPES[trimmed[0]]) return null;
  if (!PASSPORT_BODY.test(trimmed.slice(1))) return null;
  return `${trimmed.slice(0, 5)}${'*'.repeat(4)}`;
}
