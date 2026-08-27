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
import { normalizeInput } from './_internal/utils.js';
import type { ValidateResult, IdErrorCode, ChecksumOptions } from './types.js';

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
  | { type: null; code?: IdErrorCode; message: string };

/**
 * @name validate
 * @description
 * 입력값의 식별번호 타입을 자동 감지하여 적절한 검증 함수를 호출합니다.
 * 감지 우선순위: VRN(한글 포함) → PCC(P접두사) → Passport(M/S/R/O/G/D접두사)
 * → BRN(10자리) → DLN(12자리) → RRN/FRN/CRN(13자리, 성별코드로 구분)
 *
 * 13자리는 자릿수만으로 RRN/FRN/CRN이 갈리지 않아 체크섬이 유일한 확증 신호입니다.
 * 성별코드로 고른 RRN/FRN을 엄격 검증하고, 실패하면 CRN 체크섬으로 확증합니다.
 *
 * `{ checksum: false }`를 주면 둘 다 확증에 실패했을 때 RRN/FRN의 체크섬 미검증 결과로
 * 한 단계 더 폴백합니다. 2020-10-05 개편 이후 검증번호가 없는 주민등록번호가 CRN 실패로
 * 보고되는 것을 막기 위한 경로이며, **기본값에서는 이 단계를 타지 않습니다.**
 * @example
 * validate('119-81-10010')   // { type: 'BRN', result: { success: true, data: { ... } } }
 * validate('M12345678')      // { type: 'PASSPORT', result: { success: true, data: { ... } } }
 * validate('123가4567')       // { type: 'VRN', result: { success: true, data: { ... } } }
 * validate('900101-1123450')                     // { type: 'CRN', result: { success: false, ... } }
 * validate('900101-1123450', { checksum: false }) // { type: 'RRN', result: { success: true, ... } }
 */
export function validate(value: string, options: ChecksumOptions = {}): DetectResult {
  const trimmed = normalizeInput(value);
  if (trimmed === null) return { type: null, code: 'INPUT_REQUIRED', message: 'Input is required' };

  // VRN: 한글 문자 포함
  if (/[가-힣]/.test(trimmed)) {
    return { type: 'VRN', result: validateVRN(trimmed) };
  }

  const upper = trimmed.toUpperCase();

  // PCC: P + 13자
  if (upper[0] === 'P' && upper.length === 13) {
    return { type: 'PCC', result: validatePCC(trimmed) };
  }

  // Passport: M/S/R/O/G/D + 9자 (구형 M12345678 / 차세대 M123A4567 모두 9자)
  // G는 근거 미확인이나 하위호환을 위해 감지 대상에 남긴다. 다음 major에서 제거.
  if ('MSRODG'.includes(upper[0]) && upper.length === 9) {
    return { type: 'PASSPORT', result: validatePassport(trimmed) };
  }

  // 순수 숫자 기반 감지
  const digits = trimmed.replace(/[-\s]/g, '');
  if (!/^\d+$/.test(digits)) {
    return { type: null, code: 'UNDETECTABLE', message: 'Unable to detect ID type' };
  }

  switch (digits.length) {
    case 10:
      return { type: 'BRN', result: validateBRN(trimmed) };
    case 12:
      return { type: 'DLN', result: validateDLN(trimmed) };
    case 13: {
      // 외국인 코드(5,6,7,8)면 FRN, 내국인 코드(0,1,2,3,4,9)면 RRN 쪽으로 본다.
      const isForeigner = '5678'.includes(digits[6]);
      const asPerson = (opts?: ChecksumOptions): DetectResult | null => {
        if (isForeigner) {
          const r = validateFRN(trimmed, opts);
          return r.success ? { type: 'FRN', result: r } : null;
        }
        const r = validateRRN(trimmed, opts);
        return r.success ? { type: 'RRN', result: r } : null;
      };

      // 1단계: 체크섬까지 성립하면 확정
      const strict = asPerson();
      if (strict) return strict;

      // 2단계: CRN 체크섬으로 확증
      const crnResult = validateCRN(trimmed);
      if (crnResult.success) return { type: 'CRN', result: crnResult };

      // 3단계: RRN/FRN의 체크섬 미검증 결과로 폴백한다.
      // asPerson(options)는 checksum이 false일 때만 1단계와 달라지므로, 기본값에서는
      // 여기서 아무것도 건지지 못하고 아래 CRN 실패가 그대로 나간다 (v1.4.0과 동일).
      const soft = asPerson(options);
      if (soft) return soft;
      return { type: 'CRN', result: crnResult };
    }
    default:
      return { type: null, code: 'UNDETECTABLE', message: 'Unable to detect ID type' };
  }
}
