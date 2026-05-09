import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * ランタイムAPIプロキシ
 *
 * standalone モードでは next.config.ts の rewrites がビルド時に固定されるため、
 * Railway等のコンテナ環境では middleware でランタイムにプロキシ先を解決する。
 *
 * 環境変数 API_URL（非PUBLIC）をランタイムで読み取るため、
 * Railway の Service Variables で設定すれば即時反映される。
 */
export function middleware(request: NextRequest) {
  const apiUrl =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  const dest = new URL(
    request.nextUrl.pathname + request.nextUrl.search,
    apiUrl
  );

  return NextResponse.rewrite(dest);
}

export const config = {
  matcher: "/api/:path*",
};
