export type ValidateResult<T = undefined> = [T] extends [undefined]
  ? { success: true } | { success: false; message: string }
  : { success: true; data: T } | { success: false; message: string };
