import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { createToken } from "../../../../lib/auth";

const attempts = new Map<
  string,
  {
    count: number;
    blockedUntil?: number;
  }
>();

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, password } = body;

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const attempt = attempts.get(ip);

    /* BLOCKED */

    if (attempt?.blockedUntil && Date.now() < attempt.blockedUntil) {
      return NextResponse.json(
        {
          success: false,

          error: "Trop de tentatives. Réessaie plus tard.",
        },

        {
          status: 429,
        },
      );
    }

    /* IDENTIFIANT */

    if (username !== process.env.ADMIN_USERNAME) {
      const current = attempts.get(ip) || {
        count: 0,
      };

      current.count++;

      if (current.count >= 3) {
        current.blockedUntil = Date.now() + 1000 * 60 * 5;
      }

      attempts.set(ip, current);

      return NextResponse.json(
        {
          success: false,

          error: "Identifiants invalides",
        },

        {
          status: 401,
        },
      );
    }

    /* PASSWORD */

    const validPassword = await bcrypt.compare(
      password,

      process.env.ADMIN_PASSWORD_HASH!,
    );

    if (!validPassword) {
      const current = attempts.get(ip) || {
        count: 0,
      };

      current.count++;

      if (current.count >= 3) {
        current.blockedUntil = Date.now() + 1000 * 60 * 5;
      }

      attempts.set(ip, current);

      return NextResponse.json(
        {
          success: false,

          error: "Identifiants invalides",
        },

        {
          status: 401,
        },
      );
    }

    /* RESET ATTEMPTS */

    attempts.delete(ip);

    /* TOKEN */

    const token = createToken();

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: "admin_token",

      value: token,

      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "strict",

      path: "/",

      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,

        error: "Erreur serveur",
      },

      {
        status: 500,
      },
    );
  }
}
