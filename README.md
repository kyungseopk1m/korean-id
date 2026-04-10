# korean-id

[![npm version](https://img.shields.io/npm/v/korean-id)](https://www.npmjs.com/package/korean-id)
[![npm downloads](https://img.shields.io/npm/dm/korean-id)](https://www.npmjs.com/package/korean-id)
[![license](https://img.shields.io/npm/l/korean-id)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue)](https://www.typescriptlang.org/)
[![CodeQL](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml/badge.svg)](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml)

한국어 | [English](README-en_us.md)

---

한국 식별번호 8종을 검증하는 TypeScript 라이브러리입니다. 순수 연산만 사용하며 **zero dependency**입니다.

| 타입 | 함수 | 설명 |
|------|------|------|
| 사업자등록번호 (BRN) | `validateBRN` | 체크섬 + 세무서/업태/일련번호 검증 |
| 주민등록번호 (RRN) | `validateRRN` | 체크섬 + 생년월일 + 성별/세기 검증 |
| 법인등록번호 (CRN) | `validateCRN` | 체크섬 검증 |
| 외국인등록번호 (FRN) | `validateFRN` | 체크섬 + 생년월일 + 외국인 코드 검증 |
| 개인통관고유부호 (PCC) | `validatePCC` | P + 12자리 포맷 검증 |
| 운전면허번호 (DLN) | `validateDLN` | 지역코드 + 포맷 검증 |
| 여권번호 | `validatePassport` | 접두사(M/S/R/G/D) + 포맷 검증 |
| 자동차등록번호 (VRN) | `validateVRN` | 포맷 + 한글 용도 문자 검증 (2019~ 현행 포맷) |

## 설치

```bash
npm i korean-id
```

## 사용법

### 통합 검증 — `validate()`

타입을 몰라도 자동으로 감지하여 검증합니다.

```typescript
import { validate } from 'korean-id';

validate('119-81-10010');
// { type: 'BRN', result: { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } } }

validate('123가4567');
// { type: 'VRN', result: { success: true, data: { usage: '자가용', char: '가' } } }

validate('M12345678');
// { type: 'PASSPORT', result: { success: true, data: { type: '복수여권', prefix: 'M' } } }
```

### 개별 검증

```typescript
import { validateBRN, validateRRN, validateCRN, validateFRN } from 'korean-id';
import { validatePCC, validateDLN, validatePassport, validateVRN } from 'korean-id';

validateBRN('119-81-10010');
// { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } }

validateBRN('000-00-00000');
// { success: false, message: 'Invalid tax office code' }

validateRRN('900101-1123459');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

validatePCC('P123456789012');
// { success: true, data: { number: '123456789012' } }

validateDLN('11-22-123456-78');
// { success: true, data: { region: '서울', regionCode: '11' } }

validatePassport('M12345678');
// { success: true, data: { type: '복수여권', prefix: 'M' } }

validateVRN('123가4567');
// { success: true, data: { usage: '자가용', char: '가' } }
```

### 타입 가드

```typescript
import { isBRN, isRRN, isCRN, isFRN, isPCC, isDLN, isPassport, isVRN } from 'korean-id';

isBRN('119-81-10010')   // true
isRRN('900101-1123459') // true
isVRN('123가4567')       // true
```

### 포맷팅

```typescript
import { formatBRN, formatRRN, formatCRN, formatFRN, formatDLN, formatPCC, formatVRN } from 'korean-id';

formatBRN('1198110010')      // '119-81-10010'
formatRRN('9001011123459')   // '900101-1123459'
formatDLN('112212345678')    // '11-22-123456-78'
formatPCC('p123456789012')   // 'P123456789012'
formatVRN('123가 4567')       // '123가4567'
```

### 마스킹

```typescript
import { maskRRN, maskBRN, maskFRN, maskCRN, maskDLN, maskPCC, maskPassport, maskVRN } from 'korean-id';

maskRRN('900101-1123459')    // '900101-1******'
maskBRN('119-81-10010')      // '119-81-***10'
maskCRN('110111-0006249')    // '110111-***6249'
maskDLN('11-22-123456-78')   // '11-22-******-78'
maskPCC('P123456789012')     // 'P123456******'
maskPassport('M12345678')    // 'M1234****'
maskVRN('123가4567')          // '123가****'
```

### 상수

```typescript
import { DLN_REGIONS, PASSPORT_TYPES, VRN_USAGE_CHARS } from 'korean-id';

DLN_REGIONS['11']          // '서울'
PASSPORT_TYPES['M']        // '복수여권'
VRN_USAGE_CHARS['렌터카']   // ['허', '하', '호']
```

## CLI

```bash
npx korean-id 119-81-10010
# ✓ BRN (사업자등록번호)
#   officeCode: 119
#   typeCode: 81
#   serialNumber: 10010

npx korean-id --json M12345678
# {"type":"PASSPORT","result":{"success":true,"data":{"type":"복수여권","prefix":"M"}}}

npx korean-id --help
```

## 반환 타입

```typescript
// 성공 시 data 필수, 실패 시 message 필수 (discriminated union)
type ValidateResult<T = undefined> =
  | { success: true; data: T }   // T가 undefined면 data 없음 (CRN)
  | { success: false; message: string };

// 사용 예
const result = validateBRN('119-81-10010');
if (result.success) {
  result.data.officeCode  // 타입 안전하게 접근
} else {
  result.message          // 오류 메시지
}

// validate() 반환 타입
type DetectResult =
  | { type: 'BRN'; result: ValidateResult<BRNData> }
  | { type: 'RRN'; result: ValidateResult<RRNData> }
  | { type: 'CRN'; result: ValidateResult }
  | { type: 'FRN'; result: ValidateResult<FRNData> }
  | { type: 'PCC'; result: ValidateResult<PCCData> }
  | { type: 'DLN'; result: ValidateResult<DLNData> }
  | { type: 'PASSPORT'; result: ValidateResult<PassportData> }
  | { type: 'VRN'; result: ValidateResult<VRNData> }
  | { type: null; message: string };
```

## 기여

[CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 라이선스

[MIT](LICENSE)
