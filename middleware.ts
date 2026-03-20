import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers (supplement next.config.ts headers for edge cases)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  // Block any API routes from receiving financial data
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const contentType = request.headers.get("content-type") || "";
    // Reject multipart (file uploads) on all API routes
    if (contentType.includes("multipart/form-data")) {
      return new NextResponse("File uploads are not accepted by the server.", {
        status: 403,
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|tesseract|tessdata).*)"],
};
