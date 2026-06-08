# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-06-08

### Added
- **VRN 구형 포맷 지원**: `validateVRN`이 현행(2019~, `123가4567`) 외에 구형(2006~2018, `12가3456`) 포맷도 검증
- **`VRNData.format`**: 검증 결과에 `'current' | 'legacy'` 포맷 세대 필드 추가
- **`VRNFormat` 타입** export
- `formatVRN`, `maskVRN`도 구형(2자리) 포맷 정규화/마스킹 지원 (`maskVRN`은 뒤 4자리 길이 무관 마스킹)

### Fixed
- **외국인등록번호(FRN) 체크섬 수정 (검증 결과 변경)**: 기존 구현은 주민등록번호와 동일한 체크섬을 사용했으나, FRN은 검증식 결과에 `+2 (mod 10)` 보정이 추가됩니다. 전자정부 표준프레임워크 `EgovNumberCheckUtil.checkForeignNumber` 기준으로 수정. 이전 버전에서 유효/무효 판정이 반대였던 번호가 있을 수 있습니다.

### Changed
- **`package.json`**: `"sideEffects": false` 추가 — 순수 함수 라이브러리 tree-shaking 활성화로 소비자 번들 크기 절감
- **`validateDLN`**: 운전면허번호는 체크섬 검증을 하지 않음(알고리즘 비공개)을 문서에 명시 — 동작 변경 없음
- 내부: `parseInt` 호출에 radix(10) 명시

## [1.2.0] - 2026-04-10

### Changed
- **패키지명 변경**: `@kyungseopk1m/korean-id` → `korean-id` (unscoped)

## [1.1.0] - 2026-04-10

### Changed
- **`ValidateResult` type**: `interface` → discriminated union (`success: true` 시 `data` 필수, `success: false` 시 `message` 필수)

### Added
- **Extended validators**: `validatePCC`, `validateDLN`, `validatePassport`, `validateVRN`
- **`validate()`**: unified auto-detect function — automatically identifies ID type and validates
- **Type guards**: `isBRN`, `isRRN`, `isCRN`, `isFRN`, `isPCC`, `isDLN`, `isPassport`, `isVRN`
- **Constants**: `DLN_REGIONS`, `PASSPORT_TYPES`, `VRN_USAGE_CHARS`
- **Format/Mask**: `formatDLN`, `maskDLN`, `formatPCC`, `maskPCC`, `maskCRN`, `maskPassport`, `formatVRN`, `maskVRN`
- **CLI**: `npx korean-id <value>` — terminal validation tool

## [1.0.0] - 2026-04-10

### Added
- **Core validators**: `validateBRN`, `validateRRN`, `validateCRN`, `validateFRN`
- **Format**: `formatBRN`, `formatRRN`, `formatCRN`, `formatFRN`
- **Mask**: `maskRRN`, `maskBRN`, `maskFRN`
- Dual CJS/ESM build, TypeScript-first, zero dependency
- npm provenance, GitHub Actions CI/CD, CodeQL
