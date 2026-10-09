import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { ApiCode } from "@/lib/api/codes";

export function ok<T>(data: T, msg = "ok"): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ code: ApiCode.SUCCESS, data, msg });
}

export function fail(
  code: number,
  msg: string,
  httpStatus = 200,
): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ code, data: null, msg }, { status: httpStatus });
}
