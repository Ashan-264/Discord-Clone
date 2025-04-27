// src/app/(dashboard)/route.ts
import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect("/dms");
}
// export function GET(req: Request) {
//   const url = new URL("/dms", req.url);
//   return Response.redirect(url);
// }
