import { validateBRN } from './brn.js';
import { validateRRN } from './rrn.js';
import { validateCRN } from './crn.js';
import { validateFRN } from './frn.js';
import { validatePCC } from './pcc.js';
import { validateDLN } from './dln.js';
import { validatePassport } from './passport.js';
import { validateVRN } from './vrn.js';

/** 유효한 사업자등록번호인지 확인합니다. */
export const isBRN = (value: string): boolean => validateBRN(value).success;

/** 유효한 주민등록번호인지 확인합니다. */
export const isRRN = (value: string): boolean => validateRRN(value).success;

/** 유효한 법인등록번호인지 확인합니다. */
export const isCRN = (value: string): boolean => validateCRN(value).success;

/** 유효한 외국인등록번호인지 확인합니다. */
export const isFRN = (value: string): boolean => validateFRN(value).success;

/** 유효한 개인통관고유부호인지 확인합니다. */
export const isPCC = (value: string): boolean => validatePCC(value).success;

/** 유효한 운전면허번호인지 확인합니다. */
export const isDLN = (value: string): boolean => validateDLN(value).success;

/** 유효한 여권번호인지 확인합니다. */
export const isPassport = (value: string): boolean => validatePassport(value).success;

/** 유효한 자동차등록번호인지 확인합니다. */
export const isVRN = (value: string): boolean => validateVRN(value).success;
