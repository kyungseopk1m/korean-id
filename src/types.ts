export type ValidateResult<T = undefined> = [T] extends [undefined]
  ? { success: true } | { success: false; message: string }
  : { success: true; data: T } | { success: false; message: string };

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
