# Changelog

All notable changes to this project will be documented in this file.

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
