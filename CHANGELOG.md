# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2026-08-27

기존에 유효하던 입력을 거부하지 않는 추가 릴리스입니다. `^1.4.0` 사용자에게 그대로 적용됩니다.

v1.4.0과 판정이 달라지는 경우는 새로 통과하게 되는 입력뿐입니다(일반사업용 지역명 번호판, 비문자열 입력).
실패 결과의 `message` 문자열은 한 건도 바뀌지 않았습니다. v1.4.0 dist와 공개 함수 32개 x 입력 22,531개를
전수 대조해 확인했습니다(비교 720,992건, 판정 반전 0종, 메시지 변경 0종, 신규 throw 0종, 기존 성공 입력의
반환값 변화 0종). 대조 입력에는 원시 문자열과 `new String(...)` 객체가 함께 들어 있습니다.

### Added
- **오류 코드 `code`**: 검증 실패 결과에 `IdErrorCode` 값이 실립니다(`INVALID_CHECKSUM`, `INVALID_BIRTH_DATE` 등 16종). `message`는 사람이 읽는 영문 문장이라 문구가 정정될 수 있으므로, 실패 사유로 분기하거나 자체 문구로 번역해야 한다면 이 코드를 쓰세요. 하위호환을 위해 선택 필드이며 실제로는 항상 채워집니다. 다음 major에서 필수 필드가 됩니다. `IdErrorCode` 타입을 export합니다.
- **`checksum` 옵션 전파**: `isRRN`/`isFRN`이 두 번째 인자로 `ChecksumOptions`를 받습니다. `validate()`도 두 번째 인자를 받으며, `{ checksum: false }`일 때 13자리 감지가 RRN/FRN 엄격 검증 → CRN 확증 → RRN/FRN 체크섬 미검증 순으로 폴백합니다. CLI에는 `--no-checksum` 플래그가 생겼습니다. v1.4.0에서 `validateRRN`/`validateFRN` 직접 호출로만 쓸 수 있던 옵션을 타입가드·자동감지·CLI에서도 쓸 수 있습니다. **기본값은 그대로 검증이며, 기본 경로의 판정은 v1.4.0과 동일합니다.**
- **자동차등록번호 일반사업용 지역명 번호판**: `서울 82바 1234` 형태를 `validateVRN`/`isVRN`/`formatVRN`/`maskVRN`/`validate`가 수용합니다. 택시·버스·화물 등 자동차운수사업용은 2019년 번호판 3자리 확대 대상이 아니라 현재도 지역명 + 2자리로 발급됩니다. 지역명은 고시 제6조("비사업용 및 대여사업용 자동차에 부착하는 등록번호판에는 관할관청의 기호표시를 하지 아니한다")에 따라 일반사업용에만 붙으므로 `서울82가1234`나 `서울82허1234`는 거부합니다. `VRN_REGIONS` 상수와 `VRNData.region` 선택 필드를 export합니다.
- **`VRNData.region`**: 지역명 번호판의 시·도 지역명이 담깁니다. 지역명이 없는 전국번호판에서는 채워지지 않습니다.

### Changed
- **비문자열 입력에서 더 이상 예외를 던지지 않습니다**: `null`·`undefined`·숫자·객체를 넘기면 `TypeError` 대신 검증 함수는 `{ success: false, code: 'INPUT_REQUIRED' }`, 타입가드는 `false`, `format*`/`mask*`는 `null`, `validate()`는 `{ type: null }`을 반환합니다. 타입은 계속 `string`이지만 JS 소비자가 폼 값에서 `null`을 그대로 넘기는 일이 흔합니다. 원시 문자열 입력의 판정은 전부 그대로이고, `new String(...)` 객체도 이전과 같이 문자열로 처리합니다(다른 realm에서 만든 것 포함). `trim`·`replace`를 흉내낸 임의 객체는 이전에도 대부분 `TypeError`를 일으켰고, 이제는 `INPUT_REQUIRED`를 반환합니다.
- **`maskPassport`가 `PASSPORT_TYPES`를 재사용합니다**: 접두사 목록을 `validatePassport`와 따로 정의하고 있어서, 접두사가 바뀔 때마다 두 곳을 동시에 고쳐야 했습니다. 상수 하나로 모았습니다. **동작은 바뀌지 않습니다.**

### Docs
- README 한/영에 오류 코드, `checksum` 옵션 전파, 지역명 번호판, 비문자열 입력 처리를 반영했습니다.

### Internal
- CI가 `main` push에서도 실행되고 Node 18/20/22/24 매트릭스로 실행됩니다. `engines`가 선언한 범위를 실제로 검사합니다.
- CLI 스모크 테스트 25건을 추가했습니다(`npm run test:cli`). 기본 `npm test`는 dist가 필요 없도록 분리해 두었습니다.
- `jest.config.mjs`에서 쓰이지 않는 `moduleDirectories`와 `@/` 별칭 매핑을 제거했습니다.

### 타입 레벨 영향

런타임 판정은 바뀌지 않지만 **타입 정의에는 선택 필드와 선택 인자가 추가**되었습니다.
값을 읽는 통상적인 사용(`result.success`, `result.message`, `result.data.usage`)과 기존 인자 개수
호출은 그대로 컴파일됩니다. 다만 아래 세 가지 패턴은 `typescript@6` 기준으로 컴파일 오류가 납니다.

```typescript
type Failure = Extract<ValidateResult, { success: false }>;

// TS2741: Property 'code' is missing
const fields: Record<keyof Failure, string> = { success: 's', message: 'm' };

// TS2741: Property 'region' is missing
const vrnFields: Record<keyof VRNData, string> = { usage: 'u', char: 'c', format: 'f' };

// TS2322: Type '1 | 2' is not assignable to type '1'
const arity: 1 = 1 as Parameters<typeof validate>['length'];
```

즉 `keyof`로 필드를 전수 열거하거나 `Parameters<...>['length']`를 고정값으로 쓰는 코드는 수정해야
합니다. 새 필드를 목록에 더하거나 `Partial<Record<keyof Failure, string>>`로 받고, `length` 단언은
`1 | 2`로 넓히면 됩니다.

이 라이브러리는 이런 변화를 **minor 릴리스로 배포합니다.** 선택 필드·선택 인자 추가는 semver상 호환 변경으로
보는 것이 일반적이고, 대안인 major 릴리스는 `^1.4.0` 사용자에게 자동으로 닿지 않아 이번 수정이
전달되지 않습니다. `keyof`로 반환 타입을 전수 열거하는 사용은 지원 범위에서 제외합니다.

### Notes
- 자동차등록번호 용도 문자 `배`(택배)는 지역명 없는 입력에서 v1.4.0과 같이 `기타`로 분류됩니다. 고시 제5조는 일반용 자동차운수사업 문자로 `바`·`사`·`아`·`자`·`배` 5종을 두지만, 기존 입력의 `usage` 값을 바꾸면 판정이 뒤집히므로 다음 major에서 정정합니다. 신규 경로인 지역명 번호판(`서울 82배 1234`)에서는 고시대로 `영업용`으로 분류합니다.
- 지역명이 없는 입력의 판정은 강화하지 않았습니다. 고시상 존재하지 않는 `123바4567`(사업용 3자리)이나 `000가1234`(선두 0 분류기호)는 v1.4.0과 같이 계속 통과합니다. 거부하도록 바꾸면 판정이 뒤집히므로 다음 major로 미룹니다.
- 지역명 목록 17종은 국토교통부 자동차 등록번호판 고시 제6조의 시·도 약칭 표를 따릅니다. 강원·전북 특별자치도 출범 이후에도 번호판 표기는 `강원`·`전북`입니다.

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
