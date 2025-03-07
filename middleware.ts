import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a completely empty middleware that does absolutely nothing
export async function middleware(req: NextRequest) {
  return NextResponse.next()
}

// Empty matcher array so this middleware runs on NO paths
export const config = {
  matcher: [],
}
