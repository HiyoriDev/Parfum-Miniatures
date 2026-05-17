import { NextResponse } from "next/server";

import { cookies } from "next/headers";

import { verifyToken } from "../../../../lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({
        isAdmin: false,
      });
    }

    const valid = verifyToken(token);

    return NextResponse.json({
      isAdmin: !!valid,
    });
  } catch {
    return NextResponse.json({
      isAdmin: false,
    });
  }
}
