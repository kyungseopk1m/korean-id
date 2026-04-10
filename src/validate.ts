import { validateBRN } from './brn.js';
import type { BRNData } from './brn.js';
import { validateRRN } from './rrn.js';
import type { RRNData } from './rrn.js';
import { validateCRN } from './crn.js';
import { validateFRN } from './frn.js';
import type { FRNData } from './frn.js';
import { validatePCC } from './pcc.js';
import type { PCCData } from './pcc.js';
import { validateDLN } from './dln.js';
import type { DLNData } from './dln.js';
import { validatePassport } from './passport.js';
import type { PassportData } from './passport.js';
import { validateVRN } from './vrn.js';
import type { VRNData } from './vrn.js';
import type { ValidateResult } from './types.js';

export type IdType = 'BRN' | 'RRN' | 'CRN' | 'FRN' | 'PCC' | 'DLN' | 'PASSPORT' | 'VRN';

export type DetectResult =
  | { type: 'BRN'; result: ValidateResult<BRNData> }
  | { type: 'RRN'; result: ValidateResult<RRNData> }
  | { type: 'CRN'; result: ValidateResult }
  | { type: 'FRN'; result: ValidateResult<FRNData> }
  | { type: 'PCC'; result: ValidateResult<PCCData> }
  | { type: 'DLN'; result: ValidateResult<DLNData> }
  | { type: 'PASSPORT'; result: ValidateResult<PassportData> }
  | { type: 'VRN'; result: ValidateResult<VRNData> }
  | { type: null; message: string };

/**
 * @name validate
 * @description
 * 입력값의 식별번호 타입을 자동 감지하여 적절한 검증 함수를 호출합니다.
 * 감지 우선순위: VRN(한글 포함) → PCC(P접두사) → Passport(M/S/R/G/D접두사)
 * → BRN(10자리) → DLN(12자리) → RRN/FRN/CRN(13자리, 성별코드로 구분)
 * 13자리 폴백: 성별코드 5-8이면 FRN 우선 시도 후 실패 시 CRN, 그 외이면 RRN 우선 시도 후 실패 시 CRN
 * @example
 * validate('119-81-10010')   // { type: 'BRN', result: { success: true, data: { ... } } }
 * validate('M12345678')      // { type: 'PASSPORT', result: { success: true, data: { ... } } }
 * validate('123가4567')       // { type: 'VRN', result: { success: true, data: { ... } } }
 */
export function validate(value: string): DetectResult {
  if (!value.trim()) return { type: null, message: 'Input is required' };
  const trimmed = value.trim();

  // VRN: 한글 문자 포함
  if (/[가-힣]/.test(trimmed)) {
    return { type: 'VRN', result: validateVRN(trimmed) };
  }

  const upper = trimmed.toUpperCase();

  // PCC: P + 13자
  if (upper[0] === 'P' && upper.length === 13) {
    return { type: 'PCC', result: validatePCC(trimmed) };
  }

  // Passport: M/S/R/G/D + 9자
  if ('MSRGD'.includes(upper[0]) && upper.length === 9) {
    return { type: 'PASSPORT', result: validatePassport(trimmed) };
  }

  // 순수 숫자 기반 감지
  const digits = trimmed.replace(/[-\s]/g, '');
  if (!/^\d+$/.test(digits)) {
    return { type: null, message: 'Unable to detect ID type' };
  }

  switch (digits.length) {
    case 10:
      return { type: 'BRN', result: validateBRN(trimmed) };
    case 12:
      return { type: 'DLN', result: validateDLN(trimmed) };
    case 13: {
      const code = digits[6];
      // 외국인 코드(5,6,7,8) → FRN 우선, 실패 시 CRN
      if ('5678'.includes(code)) {
        const frnResult = validateFRN(trimmed);
        if (frnResult.success) return { type: 'FRN', result: frnResult };
        return { type: 'CRN', result: validateCRN(trimmed) };
      }
      // 내국인 코드(0,1,2,3,4,9) → RRN 우선, 실패 시 CRN
      const rrnResult = validateRRN(trimmed);
      if (rrnResult.success) return { type: 'RRN', result: rrnResult };
      return { type: 'CRN', result: validateCRN(trimmed) };
    }
    default:
      return { type: null, message: 'Unable to detect ID type' };
  }
}
