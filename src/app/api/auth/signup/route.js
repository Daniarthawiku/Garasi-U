import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:4000";

export async function POST(request) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          message: Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message || "Failed to register account",
        },
        { status: backendRes.status }
      );
    }

    const response = NextResponse.json({ user: data.user }, { status: 201 });
    response.cookies.set("garasiu_session", data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        message:
          "Failed to connect to authentication server. Ensure backend is running on port 4000.",
      },
      { status: 502 }
    );
  }
}
