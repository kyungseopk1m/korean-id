import { fail, normalizeInput } from './_internal/utils.js';
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

/**
 * 일반사업용 번호판 앞에 붙는 시·도 지역명.
 *
 * 고시 제6조가 "비사업용 및 대여사업용 자동차에 부착하는 등록번호판에는 관할관청의
 * 기호표시를 하지 아니한다"고 정하므로 지역명은 일반사업용에만 붙습니다.
 * 번호판 표기는 시·도 약칭을 쓰며 강원·전북 특별자치도 출범 이후에도 `강원`·`전북`입니다.
 */
const REGIONS = new Set([
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
]);

/** 지역명 번호판에 올 수 있는 용도 문자 (자동차운수사업용) */
const REGION_CHARS = new Set([...COMMERCIAL_CHARS, ...OTHER_CHARS]);

const ALL_VALID_CHARS = new Set([
  ...PRIVATE_CHARS,
  ...RENTAL_CHARS,
  ...COMMERCIAL_CHARS,
  ...OTHER_CHARS,
]);

export type VRNUsage = '자가용' | '렌터카' | '영업용' | '기타';

/** 자동차등록번호 포맷 세대. `current`(2019~, 3자리) / `legacy`(2006~2018, 2자리) */
export type VRNFormat = 'current' | 'legacy';

/** 일반사업용 번호판에 표기되는 시·도 지역명 목록 */
export const VRN_REGIONS: readonly string[] = [...REGIONS];

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
  /**
   * 일반사업용 번호판의 시·도 지역명. 지역명이 없는 전국번호판에서는 채워지지 않습니다.
   * 하위호환을 위해 선택 필드입니다.
   */
  region?: string;
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
 * 자동차등록번호(VRN)를 검증합니다. 전국번호판의 현행(2019~)·구형(2006~2018) 포맷과
 * 일반사업용(지역명 포함) 번호판을 지원합니다.
 *
 * 현행 포맷: 3자리 숫자 + 한글 1자 + 4자리 숫자 (예: 123가4567)
 * 구형 포맷: 2자리 숫자 + 한글 1자 + 4자리 숫자 (예: 12가3456)
 * 일반사업용: 시·도 지역명 + 2자리 숫자 + 사업용 문자 + 4자리 숫자 (예: 서울 82바 1234)
 *
 * 택시·버스·화물 등 자동차운수사업용은 2019년 번호판 3자리 확대 대상이 아니라 현재도
 * 지역명 + 2자리로 발급됩니다. 지역명은 고시 제6조에 따라 일반사업용에만 붙으므로
 * `서울82가1234`(자가용)나 `서울82허1234`(대여사업용)는 거부합니다.
 *
 * 지역명이 없는 입력의 판정은 이전 버전과 동일합니다. 앞 숫자 블록의 차종별 세부 범위는
 * 검증하지 않으며, 지역명 경로에서만 선두 0을 거부합니다.
 * @example
 * validateVRN('123가4567') // { success: true, data: { usage: '자가용', char: '가', format: 'current' } }
 * validateVRN('12가3456')  // { success: true, data: { usage: '자가용', char: '가', format: 'legacy' } }
 * validateVRN('서울 82바 1234') // { success: true, data: { usage: '영업용', char: '바', format: 'legacy', region: '서울' } }
 * validateVRN('서울 82배 1234') // { success: true, data: { usage: '영업용', char: '배', format: 'legacy', region: '서울' } }
 * validateVRN('서울82가1234') // { success: false, code: 'REGION_NOT_ALLOWED', message: 'Invalid VRN format' }
 * validateVRN('123힣4567') // { success: false, code: 'INVALID_CHARACTER', message: 'Invalid VRN character' }
 */
export function validateVRN(value: string): ValidateResult<VRNData> {
  const input = normalizeInput(value);
  if (input === null) return fail('INPUT_REQUIRED', 'Input is required');
  const normalized = input.replace(/\s/g, '');

  // 선택적 지역명(한글 2자) + 2~3자리 숫자 + 한글 1자 + 4자리 숫자
  const match = /^([가-힣]{2})?(\d{2,3})([가-힣])(\d{4})$/.exec(normalized);
  if (!match) return fail('INVALID_FORMAT', 'Invalid VRN format');

  const [, region, frontNums, char] = match;
  const format: VRNFormat = frontNums.length === 3 ? 'current' : 'legacy';

  // 지역명이 없으면 이전 버전과 완전히 같은 경로다. 아래 제약은 지역명 경로에만 건다.
  if (region === undefined) {
    if (!ALL_VALID_CHARS.has(char)) return fail('INVALID_CHARACTER', 'Invalid VRN character');
    return { success: true, data: { usage: getUsage(char), char, format } };
  }

  // 지역명 경로. 여기 오는 입력은 이전 버전에서 전부 'Invalid VRN format'으로 거부됐으므로
  // 실패 메시지를 그대로 유지하고 사유는 code로만 구분한다. 문자열을 비교하는 코드가 깨지지 않는다.
  if (!REGIONS.has(region)) return fail('INVALID_REGION', 'Invalid VRN format');
  if (!ALL_VALID_CHARS.has(char)) return fail('INVALID_CHARACTER', 'Invalid VRN format');
  // 고시 제6조: 비사업용·대여사업용에는 관할관청 기호를 표시하지 않는다.
  if (!REGION_CHARS.has(char)) return fail('REGION_NOT_ALLOWED', 'Invalid VRN format');
  // 일반사업용 분류기호는 2자리(승용 01-69, 승합 70-79, 화물 80-97, 특수 98-99)다.
  if (format !== 'legacy' || frontNums === '00') return fail('INVALID_FORMAT', 'Invalid VRN format');

  // 지역명 경로에 올 수 있는 문자는 전부 고시 제5조의 자동차운수사업용 일반용이다.
  // `배`는 지역명 없는 경로에서 이전 버전대로 `기타`로 남지만(판정 반전 방지),
  // 이 경로는 신규라 고시대로 `영업용`으로 낸다.
  return { success: true, data: { usage: '영업용', char, format, region } };
}
