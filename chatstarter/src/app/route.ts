// src/app/route.ts
import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/dms";
  return NextResponse.redirect(url);
}
