import { digitsOnly } from './_internal/utils.js';
import type { ValidateResult } from './types.js';

export interface BRNData {
  officeCode: string;
  typeCode: string;
  /** 일련번호 + 검증번호 (5자리) */
  serialNumber: string;
}

/**
 * @name validateBRN
 * @description
 * 사업자등록번호(BRN)를 검증합니다. 체크섬 알고리즘 및 세무서 코드, 업태 코드, 일련번호 유효성을 검증합니다.
 * 하이픈 포함(XXX-XX-XXXXX) 및 미포함(XXXXXXXXXX) 형식 모두 허용합니다.
 * @example
 * validateBRN('119-81-10010') // { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } }
 * validateBRN('000-00-00000') // { success: false, message: 'Invalid tax office code' }
 */
export function validateBRN(value: string): ValidateResult<BRNData> {
  if (!value.trim()) return { success: false, message: 'Input is required' };
  const d = digitsOnly(value);
  if (!d) return { success: false, message: 'Non-numeric characters found' };
  if (d.length !== 10) return { success: false, message: 'BRN must be 10 digits' };

  const officeCode = d.slice(0, 3);
  const typeCode = d.slice(3, 5);
  const serial = d.slice(5, 9);

  if (parseInt(officeCode) < 101) {
    return { success: false, message: 'Invalid tax office code' };
  }
  if (typeCode === '00') {
    return { success: false, message: 'Invalid business type code' };
  }
  if (serial === '0000') {
    return { success: false, message: 'Invalid serial number' };
  }

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  const digits = d.split('').map(Number);
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  const extra = Math.floor((digits[8] * 5) / 10);
  const checkDigit = (10 - ((sum + extra) % 10)) % 10;

  if (checkDigit !== digits[9]) {
    return { success: false, message: 'Invalid checksum' };
  }

  return {
    success: true,
    data: {
      officeCode,
      typeCode,
      serialNumber: d.slice(5),
    },
  };
}
