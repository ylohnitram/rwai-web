import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This completely disables middleware temporarily for testing
export async function middleware(req: NextRequest) {
  // Always allow access (bypass all middleware checks)
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
