import { NextResponse } from "next/server";

import { cookies } from "next/headers";

import { verifyToken } from "../../../../lib/auth";

import fs from "fs";

import path from "path";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("admin_token")?.value;

    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        {
          success: false,
          error: "Non autorisé",
        },
        {
          status: 401,
        },
      );
    }
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
        },
        {
          status: 400,
        },
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;

    const uploadPath = path.join(process.cwd(), "public/images", filename);

    fs.writeFileSync(uploadPath, buffer);

    return NextResponse.json({
      success: true,

      filename,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
