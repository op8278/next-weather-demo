import type { ApiResponse } from "@/types/api";
import { ApiCode } from "@/lib/api/codes";

export class ApiError extends Error {
  code: number;

  constructor(code: number, msg: string) {
    super(msg);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function apiClient<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(ApiCode.UNKNOWN, "Network request failed");
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(ApiCode.UNKNOWN, "Invalid response format");
  }

  if (
    typeof payload?.code !== "number" ||
    typeof payload?.msg !== "string" ||
    !("data" in payload)
  ) {
    throw new ApiError(ApiCode.UNKNOWN, "Invalid response format");
  }

  if (payload.code !== ApiCode.SUCCESS) {
    throw new ApiError(payload.code, payload.msg);
  }

  if (payload.data === null) {
    throw new ApiError(ApiCode.UNKNOWN, payload.msg || "Empty response data");
  }

  return payload.data;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
