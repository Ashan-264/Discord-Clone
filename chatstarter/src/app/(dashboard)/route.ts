import { NextResponse } from "next/server";

export function GET(request: Request) {
  // `request.url` is the full incoming URL (including origin) in prod
  const destination = new URL("/dms", request.url);
  return NextResponse.redirect(destination);
}
