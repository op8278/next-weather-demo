export const ApiCode = {
  SUCCESS: 0,
  INVALID_PARAMS: 40001,
  LOCATION_NOT_FOUND: 40401,
  UPSTREAM_FAILED: 50201,
  UNKNOWN: 50000,
} as const;

export type ApiCodeValue = (typeof ApiCode)[keyof typeof ApiCode];
