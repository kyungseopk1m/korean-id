# korean-id

[![npm version](https://img.shields.io/npm/v/@kyungseopk1m/korean-id)](https://www.npmjs.com/package/@kyungseopk1m/korean-id)
[![npm downloads](https://img.shields.io/npm/dm/@kyungseopk1m/korean-id)](https://www.npmjs.com/package/@kyungseopk1m/korean-id)
[![license](https://img.shields.io/npm/l/@kyungseopk1m/korean-id)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue)](https://www.typescriptlang.org/)
[![CodeQL](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml/badge.svg)](https://github.com/kyungseopk1m/korean-id/actions/workflows/codeql.yml)

[한국어](#한국어) | [English](#english)

---

## 한국어

### 소개

- 사업자등록번호, 주민등록번호, 법인등록번호, 외국인등록번호를 검증하는 TypeScript 라이브러리입니다.
- 순수 연산만 사용하며 **zero dependency**입니다.
- `CommonJS`와 `ESM` 모두 지원합니다.

### 설치

```bash
npm i @kyungseopk1m/korean-id
```

### 사용법

#### 사업자등록번호 (BRN)

```typescript
import { validateBRN } from '@kyungseopk1m/korean-id';

validateBRN('119-81-10010');
// { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } }

validateBRN('000-00-00000');
// { success: false, message: 'Invalid tax office code' }
```

#### 주민등록번호 (RRN)

```typescript
import { validateRRN } from '@kyungseopk1m/korean-id';

validateRRN('900101-1123459');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

validateRRN('900101-1123450');
// { success: false, message: 'Invalid checksum' }
```

#### 법인등록번호 (CRN)

```typescript
import { validateCRN } from '@kyungseopk1m/korean-id';

validateCRN('110111-0006249');
// { success: true }

validateCRN('110111-0006248');
// { success: false, message: 'Invalid checksum' }
```

#### 외국인등록번호 (FRN)

```typescript
import { validateFRN } from '@kyungseopk1m/korean-id';

validateFRN('900101-5112341');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }

validateFRN('900101-1123459');
// { success: false, message: 'Invalid gender/century code for foreigner' }
```

#### 포맷팅

```typescript
import { formatBRN, formatRRN, formatCRN, formatFRN } from '@kyungseopk1m/korean-id';

formatBRN('1198110010');      // '119-81-10010'
formatRRN('9001011123459');   // '900101-1123459'
formatCRN('1101110006249');   // '110111-0006249'
formatFRN('9001015112341');   // '900101-5112341'
```

#### 마스킹

```typescript
import { maskRRN, maskBRN, maskFRN } from '@kyungseopk1m/korean-id';

maskRRN('900101-1123459');   // '900101-1******'
maskBRN('119-81-10010');     // '119-81-***10'
maskFRN('900101-5112341');   // '900101-5******'
```

### 반환 타입

```typescript
interface ValidateResult<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
}

// BRN
interface BRNData {
  officeCode: string;    // 세무서 코드 (3자리)
  typeCode: string;      // 업태 코드 (2자리)
  serialNumber: string;  // 일련번호 (5자리)
}

// RRN / FRN
interface RRNData {
  birthDate: string;               // 'YYYY-MM-DD'
  gender: 'male' | 'female';
  century: '1800s' | '1900s' | '2000s';
}

interface FRNData {
  birthDate: string;               // 'YYYY-MM-DD'
  gender: 'male' | 'female';
  century: '1900s' | '2000s';
}
```

### 라이선스

[MIT](LICENSE)

---

## English

### Introduction

- A TypeScript library for validating Korean identification numbers: Business Registration Number (BRN), Resident Registration Number (RRN), Corporate Registration Number (CRN), and Foreigner Registration Number (FRN).
- Pure computation only — **zero dependency**.
- Supports both `CommonJS` and `ESM`.

### Install

```bash
npm i @kyungseopk1m/korean-id
```

### Usage

#### Business Registration Number (BRN)

```typescript
import { validateBRN } from '@kyungseopk1m/korean-id';

validateBRN('119-81-10010');
// { success: true, data: { officeCode: '119', typeCode: '81', serialNumber: '10010' } }

validateBRN('000-00-00000');
// { success: false, message: 'Invalid tax office code' }
```

#### Resident Registration Number (RRN)

```typescript
import { validateRRN } from '@kyungseopk1m/korean-id';

validateRRN('900101-1123459');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }
```

#### Corporate Registration Number (CRN)

```typescript
import { validateCRN } from '@kyungseopk1m/korean-id';

validateCRN('110111-0006249');
// { success: true }
```

#### Foreigner Registration Number (FRN)

```typescript
import { validateFRN } from '@kyungseopk1m/korean-id';

validateFRN('900101-5112341');
// { success: true, data: { birthDate: '1990-01-01', gender: 'male', century: '1900s' } }
```

#### Formatting

```typescript
import { formatBRN, formatRRN, formatCRN, formatFRN } from '@kyungseopk1m/korean-id';

formatBRN('1198110010');    // '119-81-10010'
formatRRN('9001011123459'); // '900101-1123459'
```

#### Masking

```typescript
import { maskRRN, maskBRN, maskFRN } from '@kyungseopk1m/korean-id';

maskRRN('900101-1123459'); // '900101-1******'
maskBRN('119-81-10010');   // '119-81-***10'
maskFRN('900101-5112341'); // '900101-5******'
```

### Return Type

```typescript
interface ValidateResult<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
}
```

### License

[MIT](LICENSE)
