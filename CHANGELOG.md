# Changelog

All notable changes to this project will be documented in this file.

## [1.4.0] - 2026-07-29

기존에 유효하던 입력을 거부하지 않는 추가 릴리스입니다. `^1.3.0` 사용자에게 그대로 적용됩니다.

v1.3.0과 판정이 달라지는 경우는 새로 통과하는 쪽뿐입니다(차세대 여권 형식, 관용여권 `O`, 명시적 `{ checksum: false }`). 다만 반환 객체를 엄격 비교하는 코드라면 두 가지를 확인하세요. 여권 검증 결과에 `format` 필드가 추가되고, `O…`로 시작하는 9자 입력이 `validate()`에서 `{ type: null }` 대신 `{ type: 'PASSPORT', result: 실패 }`를 반환합니다(성공 여부 자체는 그대로 실패).

### Added
- **차세대 전자여권 형식 지원**: 2021-12-21 도입된 `영문1 + 숫자3 + 영문1 + 숫자4`(예: `M123A4567`)를 `validatePassport`/`isPassport`/`maskPassport`/`validate`가 수용합니다. 기존 `영문1 + 숫자8`(예: `M12345678`)도 그대로 유효합니다. 근거: 외교부 여권안내.
- **관용여권 접두사 `O` 지원**: 지금까지 `O…`로 시작하는 여권번호가 거부되던 것이 통과합니다. 여러 공개 자료가 관용여권(Official) 접두사를 `O`로 기재하나 정부 1차 원문은 확인하지 못했습니다.
- **`PassportData.format`**: 검증 결과에 `'current'`(차세대) 또는 `'legacy'`(구형) 포맷 세대가 담깁니다. 하위호환을 위해 선택 필드이며 실제로는 항상 채워집니다. `PassportFormat` 타입을 export합니다.
- **`ChecksumOptions` 옵션**: `validateRRN`/`validateFRN`의 두 번째 인자로 `{ checksum?: boolean }`을 받습니다. **기본값은 `true`로 기존 동작과 같습니다.** 2020-10-05 주민등록법 시행규칙 제204호 개편으로 신규 부여·변경 주민등록번호의 뒷자리가 성별 1자리 + 임의번호 6자리가 되면서 검증번호 자리가 사라졌습니다. 해당 번호를 다뤄야 하면 `{ checksum: false }`로 체크섬만 건너뛸 수 있습니다. 생년월일과 성별코드는 계속 검증합니다.

### Changed
- **`BRNData.officeCode` 설명 정정**: 사업자등록번호 앞 3자리는 과거에는 관할 세무서 코드였으나 현재는 신규 개업자에게 101~999를 순차 부여하는 일련번호코드입니다. 값이 특정 세무서를 가리킨다고 보장할 수 없습니다. 필드명과 오류 메시지는 하위호환을 위해 유지하고 JSDoc에만 명시했습니다. 동작 변경 없음.

### Docs
- README에서 bundlephobia 배지를 제거했습니다. 해당 API가 응답하지 않아 배지가 "rate limited by upstream service"로 표시되고 있었습니다.

### Notes
- 관용여권 접두사 `G`는 근거를 확인하지 못했으나 하위호환을 위해 남겨두었습니다. 다음 major에서 제거될 예정입니다. 관용여권에는 `O`를 사용하세요.
- `validateFRN`의 체크섬 기본값도 `true`입니다. 외국인등록번호의 검증번호가 폐지되었다는 1차 근거는 확인되지 않았습니다. 출입국관리법 시행령 제40조의3은 세부 체계를 법무부장관에게 위임할 뿐 체크디지트 폐지를 규정하지 않습니다.
- 여권 형식 오류 메시지는 차세대 형식 수용 후에도 `'Passport must have 8 digits after prefix'`를 유지합니다. 문자열을 비교하는 코드가 깨지지 않도록 한 것이며 다음 major에서 정정합니다.

## [1.3.0] - 2026-06-08

### Added
- **VRN 구형 포맷 지원**: `validateVRN`이 현행(2019~, `123가4567`) 외에 구형(2006~2018, `12가3456`) 포맷도 검증
- **`VRNData.format`**: 검증 결과에 `'current' | 'legacy'` 포맷 세대 필드 추가
- **`VRNFormat` 타입** export
- `formatVRN`, `maskVRN`도 구형(2자리) 포맷 정규화/마스킹 지원 (`maskVRN`은 뒤 4자리 길이 무관 마스킹)

### Fixed
- **외국인등록번호(FRN) 체크섬 수정 (검증 결과 변경)**: 기존 구현은 주민등록번호와 동일한 체크섬을 사용했으나, FRN은 검증식 결과에 `+2 (mod 10)` 보정이 추가됩니다. 전자정부 표준프레임워크 `EgovNumberCheckUtil.checkForeignNumber` 기준으로 수정. 이전 버전에서 유효/무효 판정이 반대였던 번호가 있을 수 있습니다.

### Changed
- **`package.json`**: `"sideEffects": false` 추가. 순수 함수 라이브러리 tree-shaking 활성화로 소비자 번들 크기 절감
- **`validateDLN`**: 운전면허번호는 체크섬 검증을 하지 않음(알고리즘 비공개)을 문서에 명시. 동작 변경 없음
- 내부: `parseInt` 호출에 radix(10) 명시

## [1.2.0] - 2026-04-10

### Changed
- **패키지명 변경**: `@kyungseopk1m/korean-id` → `korean-id` (unscoped)

## [1.1.0] - 2026-04-10

### Changed
- **`ValidateResult` type**: `interface` → discriminated union (`success: true` 시 `data` 필수, `success: false` 시 `message` 필수)

### Added
- **Extended validators**: `validatePCC`, `validateDLN`, `validatePassport`, `validateVRN`
- **`validate()`**: unified auto-detect function. automatically identifies ID type and validates
- **Type guards**: `isBRN`, `isRRN`, `isCRN`, `isFRN`, `isPCC`, `isDLN`, `isPassport`, `isVRN`
- **Constants**: `DLN_REGIONS`, `PASSPORT_TYPES`, `VRN_USAGE_CHARS`
- **Format/Mask**: `formatDLN`, `maskDLN`, `formatPCC`, `maskPCC`, `maskCRN`, `maskPassport`, `formatVRN`, `maskVRN`
- **CLI**: `npx korean-id <value>`. terminal validation tool

## [1.0.0] - 2026-04-10

### Added
- **Core validators**: `validateBRN`, `validateRRN`, `validateCRN`, `validateFRN`
- **Format**: `formatBRN`, `formatRRN`, `formatCRN`, `formatFRN`
- **Mask**: `maskRRN`, `maskBRN`, `maskFRN`
- Dual CJS/ESM build, TypeScript-first, zero dependency
- npm provenance, GitHub Actions CI/CD, CodeQL
