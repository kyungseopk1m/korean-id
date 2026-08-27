# korean-id

[![npm version](https://img.shields.io/npm/v/korean-id)](https://www.npmjs.com/package/korean-id)
[![npm downloads](https://img.shields.io/npm/dm/korean-id)](https://www.npmjs.com/package/korean-id)
[![license](https://img.shields.io/npm/l/korean-id)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue)](https://www.typescriptlang.org/)
[![CodeQL](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml/badge.svg)](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml)

[한국어](README.md) | English

---

A TypeScript library for validating 8 types of Korean identification numbers. Pure computation only, **zero dependency**.

| Type | Function | Description |
|------|----------|-------------|
| Business Registration Number (BRN) | `validateBRN` | Checksum + tax office/type/serial |
| Resident Registration Number (RRN) | `validateRRN` | Checksum + birth date + gender/century (checksum skippable with `{ checksum: false }`) |
| Corporate Registration Number (CRN) | `validateCRN` | Checksum validation |
| Foreigner Registration Number (FRN) | `validateFRN` | Checksum + birth date + foreigner code |
| Personal Customs Code (PCC) | `validatePCC` | P + 12-digit format |
| Driver's License Number (DLN) | `validateDLN` | Region code + format (no checksum) |
| Passport Number | `validatePassport` | Prefix (M/S/R/O/D, plus G for backward compatibility) + format (legacy `M12345678` / current `M123A4567`) |
| Vehicle Registration Number (VRN) | `validateVRN` | Format + Korean usage character (current 2019~ / legacy 2006~2018 / commercial `서울 82바 1234`) |

## Install

```bash
npm i korean-id
```

## Usage

### Unified validation: `validate()`

Auto-detects the ID type and validates in one call.

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

### Individual validators

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

validatePassport('M12345678');       // legacy
// { success: true, data: { type: '복수여권', prefix: 'M', format: 'legacy' } }

validatePassport('M123A4567');       // current e-passport (2021-12 onward)
// { success: true, data: { type: '복수여권', prefix: 'M', format: 'current' } }

validateVRN('123가4567');
// { success: true, data: { usage: '자가용', char: '가', format: 'current' } }

validateVRN('12가3456'); // legacy format
// { success: true, data: { usage: '자가용', char: '가', format: 'legacy' } }

validateVRN('서울 82바 1234'); // commercial plate, with a region name
// { success: true, data: { usage: '영업용', char: '바', format: 'legacy', region: '서울' } }
```

Taxis, buses and freight vehicles were excluded from the 2019 three-digit expansion and are still issued as region name + two digits. Under Article 6 of the plate notice, the region name appears only on commercial plates, so `서울82가1234` (private) and `서울82허1234` (rental) are rejected. The region list is exported as `VRN_REGIONS`.

### Checksum option (RRN/FRN)

`validateRRN` and `validateFRN` verify the checksum by default, the same as before.

The 2020-10-05 reform (Resident Registration Act Enforcement Rule No. 204) made the trailing part of newly issued or changed resident registration numbers a single gender digit plus six random digits, removing the check-digit position. Pass `{ checksum: false }` to skip only the checksum for such numbers.

```typescript
validateRRN('900101-1123450');
// { success: false, code: 'INVALID_CHECKSUM', message: 'Invalid checksum' }

validateRRN('900101-1123450', { checksum: false });
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

// Only the checksum is skipped. Birth date and gender code are still validated.
validateRRN('901301-1123450', { checksum: false });
// { success: false, code: 'INVALID_BIRTH_DATE', message: 'Invalid birth date' }
```

Pre-reform numbers still satisfy the checksum, so verification remains the default. The default will flip in the next major release.

The same option is available on `isRRN`, `isFRN`, `validate()` and the CLI.

```typescript
isRRN('900101-1123450');                      // false
isRRN('900101-1123450', { checksum: false }); // true

// A 13-digit value can be an RRN, an FRN or a CRN, so the checksum is the only confirming signal.
// By default, detection tries RRN, then CRN, and reports the CRN failure when both fail.
validate('900101-1123450');
// { type: 'CRN', result: { success: false, code: 'INVALID_CHECKSUM', ... } }

// With { checksum: false } it falls back once more to RRN after CRN fails to confirm.
validate('900101-1123450', { checksum: false });
// { type: 'RRN', result: { success: true, ... } }
```

```bash
npx korean-id 900101-1123450               # ✗ CRN, exit 1
npx korean-id --no-checksum 900101-1123450 # ✓ RRN, exit 0
```

### Error codes

Every failure carries a `code`. `message` is a human-readable English sentence whose wording may be corrected, so branch on `code` (or translate from it) rather than comparing the message string.

```typescript
import type { IdErrorCode } from 'korean-id';

const result = validateRRN('900101-1123450');
if (!result.success && result.code === 'INVALID_CHECKSUM') {
  // Only the checksum failed. For numbers issued after the 2020-10 reform, retry with { checksum: false }.
}
```

`INPUT_REQUIRED` · `NON_NUMERIC` · `INVALID_LENGTH` · `INVALID_FORMAT` · `INVALID_CHECKSUM` · `INVALID_BIRTH_DATE` · `INVALID_GENDER_CODE` · `INVALID_OFFICE_CODE` · `INVALID_BUSINESS_TYPE_CODE` · `INVALID_SERIAL_NUMBER` · `INVALID_REGION_CODE` · `INVALID_PREFIX` · `INVALID_CHARACTER` · `INVALID_REGION` · `REGION_NOT_ALLOWED` · `UNDETECTABLE`

The field is declared optional for backward compatibility but is always populated on failures returned by the library. It becomes required in the next major release.

### Invalid input

The parameter type is `string`, but passing `null`, `undefined`, a number or an object does not throw.

```typescript
validateBRN(null as unknown as string);  // { success: false, code: 'INPUT_REQUIRED', message: 'Input is required' }
isBRN(undefined as unknown as string);   // false
formatBRN(123 as unknown as string);     // null
validate(null as unknown as string);     // { type: null, code: 'INPUT_REQUIRED', ... }
```

### Type guards

```typescript
import { isBRN, isRRN, isDLN, isPassport, isVRN } from 'korean-id';

isBRN('119-81-10010')    // true
isRRN('900101-1123459')  // true
isVRN('123가4567')        // true
isVRN('서울 82바 1234')    // true

// isRRN and isFRN take the same checksum option as validateRRN and validateFRN
isRRN('900101-1123450', { checksum: false }) // true
```

### Formatting

```typescript
import { formatBRN, formatRRN, formatCRN, formatFRN, formatDLN, formatPCC, formatVRN } from 'korean-id';

formatBRN('1198110010')    // '119-81-10010'
formatRRN('9001011123459') // '900101-1123459'
formatCRN('1101110006249') // '110111-0006249'
formatFRN('9001015234560') // '900101-5234560'
formatDLN('112212345678')  // '11-22-123456-78'
formatPCC('p123456789012') // 'P123456789012'
formatVRN('123가 4567')    // '123가4567'
formatVRN('서울 82바 1234') // '서울82바1234'
```

### Masking

```typescript
import { maskRRN, maskBRN, maskFRN, maskCRN, maskDLN, maskPCC, maskPassport, maskVRN } from 'korean-id';

maskRRN('900101-1123459')   // '900101-1******'
maskBRN('119-81-10010')     // '119-81-***10'
maskFRN('900101-5234560')   // '900101-5******'
maskCRN('110111-0006249')   // '110111-***6249'
maskDLN('11-22-123456-78')  // '11-22-******-78'
maskPCC('P123456789012')    // 'P123456******'
maskPassport('M12345678')   // 'M1234****'
maskVRN('123가4567')        // '123가****'
maskVRN('서울 82바 1234')   // '서울82바****'
```

### Constants

```typescript
import { DLN_REGIONS, PASSPORT_TYPES, VRN_USAGE_CHARS, VRN_REGIONS } from 'korean-id';

DLN_REGIONS['11']         // '서울' (Seoul)
PASSPORT_TYPES['M']       // '복수여권' (Multiple-entry passport)
PASSPORT_TYPES['O']       // '관용여권' (Official passport)
VRN_USAGE_CHARS['렌터카']  // ['허', '하', '호']
VRN_REGIONS               // ['서울', '부산', ... ] 17 entries
```

Several public sources record `O` (Official) as the official-passport prefix, but no primary government text was obtained. The previously used `G` has no source we could find; it is kept for backward compatibility and will be removed in the next major release. Use `O` in new code.

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

Exit code is 0 when the value is valid and 1 when it is invalid or undetectable.

## Return Types

```typescript
// data is required on success, message is required on failure (discriminated union)
type ValidateResult<T = undefined> =
  | { success: true; data: T }   // when T is undefined, no data field (CRN)
  | { success: false; code?: IdErrorCode; message: string };

// Usage
const result = validateBRN('119-81-10010');
if (result.success) {
  result.data.officeCode  // type-safe access
} else {
  result.code             // error code to branch on
  result.message          // human-readable error message
}

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
