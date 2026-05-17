import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { createToken } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { username, password } = body;

    /* IDENTIFIANT */
    if (username !== process.env.ADMIN_USERNAME) {
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
