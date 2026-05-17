import { NextResponse } from "next/server";

import { supabase } from "../../../../lib/supabase";

import * as XLSX from "xlsx";

import { cookies } from "next/headers";

import { verifyToken } from "../../../../lib/auth";

export async function POST(request: Request) {
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

    const formData = await request.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun fichier",
        },
        {
          status: 400,
        },
      );
    }

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, {
      type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet);

    const requiredFields = [
      "id",
      "parfum",
      "parfumeur",
      "boite",
      "type",
      "contenance",
      "image_file",
    ];

    const isValid =
      Array.isArray(data) &&
      data.length > 0 &&
      data.every((item) =>
        requiredFields.every(
          (field) => field in (item as Record<string, unknown>),
        ),
      );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,

          error: "Fichier XLSX invalide",
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(data)) {
      return NextResponse.json(
        {
          success: false,
          error: "Fichier invalide",
        },
        {
          status: 400,
        },
      );
    }
    await supabase.from("perfumes").delete().neq("id", 0);

    const chunkSize = 500;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);

      const { error } = await supabase.from("perfumes").insert(chunk);

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: error.message,
          },
          {
            status: 500,
          },
        );
      }
    }

    return NextResponse.json({
      success: true,
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
