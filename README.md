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
| 주민등록번호 (RRN) | `validateRRN` | 체크섬 + 생년월일 + 성별/세기 검증 (체크섬은 `{ checksum: false }`로 생략 가능) |
| 법인등록번호 (CRN) | `validateCRN` | 체크섬 검증 |
| 외국인등록번호 (FRN) | `validateFRN` | 체크섬 + 생년월일 + 외국인 코드 검증 |
| 개인통관고유부호 (PCC) | `validatePCC` | P + 12자리 포맷 검증 |
| 운전면허번호 (DLN) | `validateDLN` | 지역코드 + 포맷 검증 (체크섬 미검증) |
| 여권번호 | `validatePassport` | 접두사(M/S/R/O/D, 하위호환 G) + 포맷 검증 (구형 `M12345678` / 차세대 `M123A4567`) |
| 자동차등록번호 (VRN) | `validateVRN` | 포맷 + 한글 용도 문자 검증 (현행 2019~ / 구형 2006~2018 / 일반사업용 `서울 82바 1234`) |

## 설치

```bash
npm i korean-id
```

## 사용법

### 통합 검증: `validate()`

입력값의 타입을 몰라도 자동으로 감지하여 검증합니다.

```typescript
import { validate } from 'korean-id';

validate('119-81-10010');
// { type: 'BRN', result: { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } } }

validate('123가4567');
// { type: 'VRN', result: { success: true, data: { usage: '자가용', char: '가', format: 'current' } } }

validate('M12345678');
// { type: 'PASSPORT', result: { success: true, data: { type: '복수여권', prefix: 'M', format: 'legacy' } } }

validate('서울 82바 1234');
// { type: 'VRN', result: { success: true, data: { usage: '영업용', char: '바', format: 'legacy', region: '서울' } } }
```

### 개별 검증

```typescript
import { validateBRN, validateRRN, validateCRN, validateFRN } from 'korean-id';
import { validatePCC, validateDLN, validatePassport, validateVRN } from 'korean-id';

validateBRN('119-81-10010');
// { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } }

validateBRN('000-00-00000');
// { success: false, code: 'INVALID_OFFICE_CODE', message: 'Invalid tax office code' }

validateRRN('900101-1123459');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

validateCRN('110111-0006249');
// { success: true }

validateFRN('900101-5123452');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

validatePCC('P123456789012');
// { success: true, data: { number: '123456789012' } }

validateDLN('11-22-123456-78');
// { success: true, data: { region: '서울', regionCode: '11' } }

validatePassport('M12345678');       // 구형
// { success: true, data: { type: '복수여권', prefix: 'M', format: 'legacy' } }

validatePassport('M123A4567');       // 차세대 전자여권 (2021-12~)
// { success: true, data: { type: '복수여권', prefix: 'M', format: 'current' } }

validateVRN('123가4567');
// { success: true, data: { usage: '자가용', char: '가', format: 'current' } }

validateVRN('12가3456'); // 구형 포맷
// { success: true, data: { usage: '자가용', char: '가', format: 'legacy' } }

validateVRN('서울 82바 1234'); // 일반사업용 (지역명 포함)
// { success: true, data: { usage: '영업용', char: '바', format: 'legacy', region: '서울' } }
```

택시·버스·화물 등 자동차운수사업용은 2019년 번호판 3자리 확대 대상이 아니라 현재도 지역명 + 2자리로 발급됩니다. 지역명은 고시 제6조에 따라 일반사업용에만 붙으므로 `서울82가1234`(자가용)나 `서울82허1234`(대여사업용)는 거부합니다. 지역명 목록은 `VRN_REGIONS` 상수로 내보냅니다.

### 체크섬 옵션 (RRN/FRN)

`validateRRN`과 `validateFRN`은 기본적으로 체크섬을 검증합니다. 이는 기존 동작과 같습니다.

2020-10-05 주민등록법 시행규칙 제204호 개편으로 신규 부여·변경 주민등록번호는 뒷자리가 성별 1자리 + 임의번호 6자리가 되면서 검증번호 자리가 사라졌습니다. 이런 번호를 다뤄야 하면 체크섬만 건너뛸 수 있습니다.

```typescript
validateRRN('900101-1123450');
// { success: false, code: 'INVALID_CHECKSUM', message: 'Invalid checksum' }

validateRRN('900101-1123450', { checksum: false });
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

// 체크섬만 건너뛸 뿐 생년월일·성별코드는 계속 검증합니다
validateRRN('901301-1123450', { checksum: false });
// { success: false, code: 'INVALID_BIRTH_DATE', message: 'Invalid birth date' }
```

기존 체계 번호에는 체크섬이 여전히 성립하므로 기본값은 체크섬을 검증하는 것입니다. 다음 major에서 기본값을 미검증으로 바꿀 예정입니다.

같은 옵션을 `isRRN`·`isFRN`·`validate()`·CLI에서도 쓸 수 있습니다.

```typescript
isRRN('900101-1123450');                     // false
isRRN('900101-1123450', { checksum: false }); // true

// 13자리는 RRN/FRN/CRN이 자릿수만으로 갈리지 않아 체크섬이 유일한 확증 신호입니다.
// 기본값에서는 RRN 확증 실패 후 CRN으로 넘어가고, CRN마저 실패하면 CRN 실패로 보고합니다.
validate('900101-1123450');
// { type: 'CRN', result: { success: false, code: 'INVALID_CHECKSUM', ... } }

// { checksum: false }를 주면 CRN 확증 실패 뒤 RRN으로 한 단계 더 폴백합니다.
validate('900101-1123450', { checksum: false });
// { type: 'RRN', result: { success: true, ... } }
```

```bash
npx korean-id 900101-1123450               # ✗ CRN, exit 1
npx korean-id --no-checksum 900101-1123450 # ✓ RRN, exit 0
```

### 오류 코드

검증 실패 결과에는 `code`가 함께 실립니다. `message`는 사람이 읽는 영문 문장이라 문구가 정정될 수 있으므로, 실패 사유로 분기하거나 자체 문구로 번역해야 한다면 `code`를 쓰세요.

```typescript
import type { IdErrorCode } from 'korean-id';

const result = validateRRN('900101-1123450');
if (!result.success && result.code === 'INVALID_CHECKSUM') {
  // 체크섬만 어긋난 경우. 2020-10 이후 발급분이면 { checksum: false }로 재시도할 수 있다
}
```

`INPUT_REQUIRED` · `NON_NUMERIC` · `INVALID_LENGTH` · `INVALID_FORMAT` · `INVALID_CHECKSUM` · `INVALID_BIRTH_DATE` · `INVALID_GENDER_CODE` · `INVALID_OFFICE_CODE` · `INVALID_BUSINESS_TYPE_CODE` · `INVALID_SERIAL_NUMBER` · `INVALID_REGION_CODE` · `INVALID_PREFIX` · `INVALID_CHARACTER` · `INVALID_REGION` · `REGION_NOT_ALLOWED` · `UNDETECTABLE`

하위호환을 위해 선택 필드로 선언되어 있으나 라이브러리가 반환하는 실패 결과에는 항상 채워집니다. 다음 major에서 필수 필드가 됩니다.

### 잘못된 입력

타입은 `string`이지만 `null`·`undefined`·숫자·객체를 넘겨도 예외를 던지지 않습니다.

```typescript
validateBRN(null as unknown as string);  // { success: false, code: 'INPUT_REQUIRED', message: 'Input is required' }
isBRN(undefined as unknown as string);   // false
formatBRN(123 as unknown as string);     // null
validate(null as unknown as string);     // { type: null, code: 'INPUT_REQUIRED', ... }
```

### 타입 가드

```typescript
import { isBRN, isRRN, isCRN, isFRN, isPCC, isDLN, isPassport, isVRN } from 'korean-id';

isBRN('119-81-10010')   // true
isRRN('900101-1123459') // true
isVRN('123가4567')       // true
isVRN('서울 82바 1234')   // true

// isRRN·isFRN은 validateRRN·validateFRN과 같은 체크섬 옵션을 받습니다
isRRN('900101-1123450', { checksum: false }) // true
```

### 포맷팅

```typescript
import { formatBRN, formatRRN, formatCRN, formatFRN, formatDLN, formatPCC, formatVRN } from 'korean-id';

formatBRN('1198110010')      // '119-81-10010'
formatRRN('9001011123459')   // '900101-1123459'
formatDLN('112212345678')    // '11-22-123456-78'
formatPCC('p123456789012')   // 'P123456789012'
formatVRN('123가 4567')       // '123가4567'
formatVRN('서울 82바 1234')   // '서울82바1234'
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
maskVRN('서울 82바 1234')     // '서울82바****'
```

### 상수

```typescript
import { DLN_REGIONS, PASSPORT_TYPES, VRN_USAGE_CHARS, VRN_REGIONS } from 'korean-id';

DLN_REGIONS['11']          // '서울'
PASSPORT_TYPES['M']        // '복수여권'
PASSPORT_TYPES['O']        // '관용여권'
VRN_USAGE_CHARS['렌터카']   // ['허', '하', '호']
VRN_REGIONS               // ['서울', '부산', ... ] 17종
```

관용여권 접두사를 `O`(Official)로 기재한 공개 자료는 여럿 있으나, 정부의 1차 원문은 확인하지 못했습니다. 기존에 쓰이던 `G`는 근거를 찾지 못했지만 하위호환을 위해 남겨두었으며 다음 major에서 제거될 예정입니다. 새 코드에서는 `O`를 쓰세요.

## CLI

```bash
npx korean-id 119-81-10010
# ✓ BRN (사업자등록번호)
#   officeCode: 119
#   typeCode: 81
#   serialNumber: 10010

npx korean-id --json M12345678
# {"type":"PASSPORT","result":{"success":true,"data":{"type":"복수여권","prefix":"M","format":"legacy"}}}

npx korean-id 서울 82바 1234
# ✓ VRN (자동차등록번호)
#   usage: 영업용
#   char: 바
#   format: legacy
#   region: 서울

npx korean-id --no-checksum 900101-1123450
# ✓ RRN (주민등록번호)
#   birthDate: 1990-01-01
#   gender: male
#   century: 1900s

npx korean-id --help
```

값이 유효하면 종료 코드 0을 반환하고, 무효하거나 타입을 감지하지 못하면 1을 반환합니다.

## 반환 타입

```typescript
// 성공 시 data 필수, 실패 시 message 필수 (discriminated union)
type ValidateResult<T = undefined> =
  | { success: true; data: T }   // T가 undefined면 data 없음 (CRN)
  | { success: false; code?: IdErrorCode; message: string };

// 사용 예
const result = validateBRN('119-81-10010');
if (result.success) {
  result.data.officeCode  // 타입 안전하게 접근
} else {
  result.code             // 분기용 오류 코드
  result.message          // 사람이 읽는 오류 메시지
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
  | { type: null; code?: IdErrorCode; message: string };
```

## 기여

[CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 라이선스

[MIT](LICENSE)
