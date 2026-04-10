# korean-id

[![npm version](https://img.shields.io/npm/v/@kyungseopk1m/korean-id)](https://www.npmjs.com/package/@kyungseopk1m/korean-id)
[![npm downloads](https://img.shields.io/npm/dm/@kyungseopk1m/korean-id)](https://www.npmjs.com/package/@kyungseopk1m/korean-id)
[![license](https://img.shields.io/npm/l/@kyungseopk1m/korean-id)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue)](https://www.typescriptlang.org/)
[![CodeQL](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml/badge.svg)](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml)

[한국어](README.md) | English

---

A TypeScript library for validating 8 types of Korean identification numbers. Pure computation only — **zero dependency**.

| Type | Function | Description |
|------|----------|-------------|
| Business Registration Number (BRN) | `validateBRN` | Checksum + tax office/type/serial |
| Resident Registration Number (RRN) | `validateRRN` | Checksum + birth date + gender/century |
| Corporate Registration Number (CRN) | `validateCRN` | Checksum validation |
| Foreigner Registration Number (FRN) | `validateFRN` | Checksum + birth date + foreigner code |
| Personal Customs Code (PCC) | `validatePCC` | P + 12-digit format |
| Driver's License Number (DLN) | `validateDLN` | Region code + format |
| Passport Number | `validatePassport` | Prefix (M/S/R/G/D) + format |
| Vehicle Registration Number (VRN) | `validateVRN` | Format + Korean usage character (post-2019 format only) |

## Install

```bash
npm i @kyungseopk1m/korean-id
```

## Usage

### Unified validation — `validate()`

Auto-detects the ID type and validates in one call.

```typescript
import { validate } from '@kyungseopk1m/korean-id';

validate('119-81-10010');
// { type: 'BRN', result: { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } } }

validate('123가4567');
// { type: 'VRN', result: { success: true, data: { usage: '자가용', char: '가' } } }

validate('M12345678');
// { type: 'PASSPORT', result: { success: true, data: { type: '복수여권', prefix: 'M' } } }
```

### Individual validators

```typescript
import { validateBRN, validateRRN, validateCRN, validateFRN } from '@kyungseopk1m/korean-id';
import { validatePCC, validateDLN, validatePassport, validateVRN } from '@kyungseopk1m/korean-id';

validateBRN('119-81-10010');
// { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } }

validateBRN('000-00-00000');
// { success: false, message: 'Invalid tax office code' }

validateRRN('900101-1123459');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

validateCRN('110111-0006249');
// { success: true }

validateFRN('900101-5123450');
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

### Type guards

```typescript
import { isBRN, isRRN, isDLN, isPassport, isVRN } from '@kyungseopk1m/korean-id';

isBRN('119-81-10010')    // true
isRRN('900101-1123459')  // true
isVRN('123가4567')        // true
```

### Formatting

```typescript
import { formatBRN, formatRRN, formatCRN, formatFRN, formatDLN, formatPCC, formatVRN } from '@kyungseopk1m/korean-id';

formatBRN('1198110010')    // '119-81-10010'
formatRRN('9001011123459') // '900101-1123459'
formatCRN('1101110006249') // '110111-0006249'
formatFRN('9001015234560') // '900101-5234560'
formatDLN('112212345678')  // '11-22-123456-78'
formatPCC('p123456789012') // 'P123456789012'
formatVRN('123가 4567')    // '123가4567'
```

### Masking

```typescript
import { maskRRN, maskBRN, maskFRN, maskCRN, maskDLN, maskPCC, maskPassport, maskVRN } from '@kyungseopk1m/korean-id';

maskRRN('900101-1123459')   // '900101-1******'
maskBRN('119-81-10010')     // '119-81-***10'
maskFRN('900101-5234560')   // '900101-5******'
maskCRN('110111-0006249')   // '110111-***6249'
maskDLN('11-22-123456-78')  // '11-22-******-78'
maskPCC('P123456789012')    // 'P123456******'
maskPassport('M12345678')   // 'M1234****'
maskVRN('123가4567')        // '123가****'
```

### Constants

```typescript
import { DLN_REGIONS, PASSPORT_TYPES, VRN_USAGE_CHARS } from '@kyungseopk1m/korean-id';

DLN_REGIONS['11']         // '서울' (Seoul)
PASSPORT_TYPES['M']       // '복수여권' (Multiple-entry passport)
VRN_USAGE_CHARS['렌터카']  // ['허', '하', '호']
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

## Return Types

```typescript
// data is required on success, message is required on failure (discriminated union)
type ValidateResult<T = undefined> =
  | { success: true; data: T }   // when T is undefined, no data field (CRN)
  | { success: false; message: string };

// Usage
const result = validateBRN('119-81-10010');
if (result.success) {
  result.data.officeCode  // type-safe access
} else {
  result.message          // error message
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
  | { type: null; message: string };
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
