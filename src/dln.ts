import { digitsOnly, fail, normalizeInput } from './_internal/utils.js';
import type { ValidateResult } from './types.js';

/** 운전면허번호 지역코드 → 지역명 매핑 */
export const DLN_REGIONS: Readonly<Record<string, string>> = {
  '11': '서울',
  '12': '부산',
  '13': '경기남부',
  '14': '강원',
  '15': '충북',
  '16': '충남',
  '17': '전북',
  '18': '전남',
  '19': '경북',
  '20': '경남',
  '21': '제주',
  '22': '대구',
  '23': '인천',
  '24': '광주',
  '25': '대전',
  '26': '울산',
  '28': '세종',
  '29': '경기북부',
};

export interface DLNData {
  region: string;
  regionCode: string;
}

/**
 * @name validateDLN
 * @description
 * 운전면허번호(DLN)를 검증합니다. 자릿수·지역코드·포맷만 검증하며, 체크섬은 검증하지 않습니다
 * (운전면허번호 검증 알고리즘은 공개되어 있지 않음). 실제 발급 여부는 도로교통공단 등 공식 확인이 필요합니다.
 * 하이픈 포함(XX-XX-XXXXXX-XX) 및 미포함(XXXXXXXXXXXX) 형식 모두 허용합니다.
 * @example
 * validateDLN('11-22-123456-78') // { success: true, data: { region: '서울', regionCode: '11' } }
 * validateDLN('99-22-123456-78') // { success: false, code: 'INVALID_REGION_CODE', message: 'Invalid region code' }
 */
export function validateDLN(value: string): ValidateResult<DLNData> {
  const input = normalizeInput(value);
  if (input === null) return fail('INPUT_REQUIRED', 'Input is required');
  const d = digitsOnly(input);
  if (!d) return fail('NON_NUMERIC', 'Non-numeric characters found');
  if (d.length !== 12) return fail('INVALID_LENGTH', 'DLN must be 12 digits');

  const regionCode = d.slice(0, 2);
  const region = DLN_REGIONS[regionCode];
  if (!region) return fail('INVALID_REGION_CODE', 'Invalid region code');

  return { success: true, data: { region, regionCode } };
}
