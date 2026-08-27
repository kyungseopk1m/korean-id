/**
 * 검증 실패 사유 코드.
 *
 * `message` 는 사람이 읽는 영문 문장이라 문구가 정정될 수 있습니다. 실패 사유로 분기하거나
 * 자체 문구로 번역해야 한다면 `message` 문자열 대신 이 코드를 쓰세요.
 */
export type IdErrorCode =
  /** 입력이 비어 있거나 문자열이 아님 */
  | 'INPUT_REQUIRED'
  /** 숫자로만 이루어져야 하는 자리에 다른 문자가 있음 */
  | 'NON_NUMERIC'
  /** 자릿수가 맞지 않음 */
  | 'INVALID_LENGTH'
  /** 전체 형식이 맞지 않음 */
  | 'INVALID_FORMAT'
  /** 체크섬(검증번호) 불일치 */
  | 'INVALID_CHECKSUM'
  /** 생년월일이 실재하지 않는 날짜 */
  | 'INVALID_BIRTH_DATE'
  /** 성별·세기 코드가 유효 범위 밖 */
  | 'INVALID_GENDER_CODE'
  /** 사업자등록번호 앞 3자리가 유효 범위 밖 */
  | 'INVALID_OFFICE_CODE'
  /** 사업자등록번호 업태 코드가 유효 범위 밖 */
  | 'INVALID_BUSINESS_TYPE_CODE'
  /** 사업자등록번호 일련번호가 유효 범위 밖 */
  | 'INVALID_SERIAL_NUMBER'
  /** 운전면허번호 지역코드가 유효 범위 밖 */
  | 'INVALID_REGION_CODE'
  /** 접두사가 유효 범위 밖 (여권 · 개인통관고유부호) */
  | 'INVALID_PREFIX'
  /** 자동차등록번호 용도 한글이 유효 범위 밖 */
  | 'INVALID_CHARACTER'
  /** 자동차등록번호 지역명이 유효 범위 밖 */
  | 'INVALID_REGION'
  /** 자동차등록번호 지역명이 붙을 수 없는 용도 */
  | 'REGION_NOT_ALLOWED'
  /** `validate()` 가 어떤 식별번호 타입으로도 감지하지 못함 */
  | 'UNDETECTABLE';

/**
 * 검증 결과.
 *
 * 실패 시 `code` 는 하위호환을 위해 선택 필드이나 라이브러리가 반환하는 값에는 항상 채워집니다.
 * 다음 major 에서 필수 필드가 됩니다.
 */
export type ValidateResult<T = undefined> = [T] extends [undefined]
  ? { success: true } | { success: false; code?: IdErrorCode; message: string }
  : { success: true; data: T } | { success: false; code?: IdErrorCode; message: string };

/**
 * 체크섬 검증 옵션 (`validateRRN` / `validateFRN`).
 *
 * 기본값은 둘 다 `true`(검증)로, 기존 동작과 같습니다. 2020년 전후로 신규 발급 번호에서
 * 체크섬이 성립하지 않는 사례를 다뤄야 할 때 `{ checksum: false }`로 건너뛸 수 있습니다.
 * 주민등록번호는 2020-10-05 개편(주민등록법 시행규칙 제204호)으로 뒷자리가 성별 1자리 +
 * 임의번호 6자리가 되면서 검증번호 자리가 사라졌습니다.
 */
export interface ChecksumOptions {
  /** `true`면 체크섬까지 검증, `false`면 건너뜁니다. 기본값은 `true`. */
  checksum?: boolean;
}
