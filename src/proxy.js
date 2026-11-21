import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const AUTH_PATHS = new Set(["/auth", "/login", "/signup"]);
const SESSION_COOKIE_NAME = "garasiu_session";

function getSigningSecret() {
  return process.env.AUTH_SECRET || "garasiu-local-dev-secret-9f4c2a8b1d7e6035";
}

function isValidSessionToken(token) {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) return false;

  const expectedSignature = createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

  const providedBuf = Buffer.from(providedSignature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (
    providedBuf.length !== expectedBuf.length ||
    !timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    );
    return Boolean(payload?.sub && payload?.exp && payload.exp > Date.now());
  } catch {
    return false;
  }
}

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = isValidSessionToken(sessionToken);
  const isAuthRoute = AUTH_PATHS.has(pathname);

  if (!isAuthenticated && !isAuthRoute) {
    const authUrl = new URL("/auth", request.url);
    if (pathname !== "/") {
      authUrl.searchParams.set("next", `${pathname}${search}`);
    }
    const response = NextResponse.redirect(authUrl);
    if (sessionToken) {
      response.cookies.delete(SESSION_COOKIE_NAME);
    }
    return response;
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|img/|.*\\.(?:png|jpg|jpeg|svg|ico|webp|css|js)$).*)",
  ],
};
