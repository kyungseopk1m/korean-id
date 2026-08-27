import type { IdErrorCode } from '../types.js';

/**
 * 검증 실패 결과를 만든다. 사유 코드와 메시지가 항상 함께 다니도록 생성 지점을 하나로 모은다.
 */
export function fail(code: IdErrorCode, message: string): { success: false; code: IdErrorCode; message: string } {
  return { success: false, code, message };
}

/**
 * 진입 정규화. 문자열이 아니거나 공백뿐이면 null, 아니면 trim한 원시 문자열.
 *
 * 공개 함수는 전부 여기를 먼저 지난다. 타입은 `string`이지만 JS 소비자가 폼 값에서
 * `null`/`undefined`를 그대로 넘기는 일이 흔해, 던지는 대신 실패 결과로 답한다.
 *
 * `new String(...)` 도 받는다. 이전 버전은 `value.trim()`을 바로 불러서 String 객체를
 * 원시 문자열과 똑같이 처리했고, 여기서 거부하면 그 입력들의 판정이 뒤집힌다.
 * `instanceof` 대신 태그를 보는 것은 다른 realm(vm·iframe)에서 만든 String 객체까지 받기 위해서다.
 */
export function normalizeInput(value: unknown): string | null {
  if (typeof value !== 'string' && Object.prototype.toString.call(value) !== '[object String]') {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

/** 하이픈/공백 제거 후 순수 숫자 문자열 반환. 숫자 외 문자 포함 시 null 반환 */
export function digitsOnly(value: unknown): string | null {
  const input = normalizeInput(value);
  if (input === null) return null;
  const stripped = input.replace(/[-\s]/g, '');
  return /^\d+$/.test(stripped) ? stripped : null;
}

/** YYMMDD 형태의 생년월일 유효성 검증 */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}
