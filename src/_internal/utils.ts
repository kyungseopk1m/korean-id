/** 하이픈/공백 제거 후 순수 숫자 문자열 반환. 숫자 외 문자 포함 시 null 반환 */
export function digitsOnly(value: string): string | null {
  const stripped = value.replace(/[-\s]/g, '');
  return /^\d+$/.test(stripped) ? stripped : null;
}

/** YYMMDD 형태의 생년월일 유효성 검증 */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}
