export interface ValidateResult<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
}
