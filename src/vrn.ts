import type { ValidateResult } from './types.js';

const PRIVATE_CHARS = new Set([
  '가', '나', '다', '라', '마',
  '거', '너', '더', '러', '머', '버', '서', '어', '저',
  '고', '노', '도', '로', '모', '보', '소', '오', '조',
  '구', '누', '두', '루', '무', '부', '수', '우', '주',
]);

const RENTAL_CHARS = new Set(['허', '하', '호']);
const COMMERCIAL_CHARS = new Set(['바', '사', '아', '자']);
const OTHER_CHARS = new Set(['배']);

const ALL_VALID_CHARS = new Set([
  ...PRIVATE_CHARS,
  ...RENTAL_CHARS,
  ...COMMERCIAL_CHARS,
  ...OTHER_CHARS,
]);

export type VRNUsage = '자가용' | '렌터카' | '영업용' | '기타';

/** 자동차등록번호 용도별 한글 문자 목록 */
export const VRN_USAGE_CHARS: Readonly<Record<VRNUsage, readonly string[]>> = {
  자가용: [...PRIVATE_CHARS],
  렌터카: [...RENTAL_CHARS],
  영업용: [...COMMERCIAL_CHARS],
  기타: [...OTHER_CHARS],
};

export interface VRNData {
  usage: VRNUsage;
  char: string;
}

function getUsage(char: string): VRNUsage {
  if (PRIVATE_CHARS.has(char)) return '자가용';
  if (RENTAL_CHARS.has(char)) return '렌터카';
  if (COMMERCIAL_CHARS.has(char)) return '영업용';
  return '기타';
}

/**
 * @name validateVRN
 * @description
 * 자동차등록번호(VRN)를 검증합니다. 현행(2019~) 포맷 기준으로 검증합니다.
 * 포맷: 3자리 숫자 + 한글 1자 + 4자리 숫자 (예: 123가4567)
 * @example
 * validateVRN('123가4567') // { success: true, data: { usage: '자가용', char: '가' } }
 * validateVRN('123힣4567') // { success: false, message: 'Invalid VRN character' }
 */
export function validateVRN(value: string): ValidateResult<VRNData> {
  if (!value.trim()) return { success: false, message: 'Input is required' };
  const trimmed = value.trim().replace(/\s/g, '');

  // 3자리숫자 + 한글1자 + 4자리숫자 = 8자
  if (trimmed.length !== 8) return { success: false, message: 'VRN must be 8 characters' };

  const frontNums = trimmed.slice(0, 3);
  const char = trimmed[3];
  const backNums = trimmed.slice(4);

  if (!/^\d{3}$/.test(frontNums)) return { success: false, message: 'VRN must start with 3 digits' };
  if (!/^\d{4}$/.test(backNums)) return { success: false, message: 'VRN must end with 4 digits' };
  if (!ALL_VALID_CHARS.has(char)) return { success: false, message: 'Invalid VRN character' };

  return { success: true, data: { usage: getUsage(char), char } };
}
