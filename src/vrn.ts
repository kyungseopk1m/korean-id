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

/** 자동차등록번호 포맷 세대 — `current`(2019~, 3자리) / `legacy`(2006~2018, 2자리) */
export type VRNFormat = 'current' | 'legacy';

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
  format: VRNFormat;
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
 * 자동차등록번호(VRN)를 검증합니다. 현행(2019~) 및 구형(2006~2018) 포맷을 모두 지원합니다.
 * 현행 포맷: 3자리 숫자 + 한글 1자 + 4자리 숫자 (예: 123가4567)
 * 구형 포맷: 2자리 숫자 + 한글 1자 + 4자리 숫자 (예: 12가3456)
 * @example
 * validateVRN('123가4567') // { success: true, data: { usage: '자가용', char: '가', format: 'current' } }
 * validateVRN('12가3456')  // { success: true, data: { usage: '자가용', char: '가', format: 'legacy' } }
 * validateVRN('123힣4567') // { success: false, message: 'Invalid VRN character' }
 */
export function validateVRN(value: string): ValidateResult<VRNData> {
  if (!value.trim()) return { success: false, message: 'Input is required' };
  const normalized = value.trim().replace(/\s/g, '');

  // 현행: 3자리숫자 + 한글1자 + 4자리숫자 (8자)
  // 구형: 2자리숫자 + 한글1자 + 4자리숫자 (7자)
  const match = /^(\d{2,3})([가-힣])(\d{4})$/.exec(normalized);
  if (!match) return { success: false, message: 'Invalid VRN format' };

  const [, frontNums, char] = match;
  if (!ALL_VALID_CHARS.has(char)) return { success: false, message: 'Invalid VRN character' };

  const format: VRNFormat = frontNums.length === 3 ? 'current' : 'legacy';
  return { success: true, data: { usage: getUsage(char), char, format } };
}
