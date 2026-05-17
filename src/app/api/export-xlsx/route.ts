import { NextResponse } from "next/server";

import { supabase } from "../../../../lib/supabase";

import * as XLSX from "xlsx";

import { cookies } from "next/headers";

import { verifyToken } from "../../../../lib/auth";

export async function GET() {
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

    const { data } = await supabase
      .from("perfumes")
      .select("*")
      .range(0, 10000);

    const perfumes = data || [];

    const worksheet = XLSX.utils.json_to_sheet(perfumes);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Perfumes");

    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return new Response(buffer, {
      status: 200,

      headers: {
        "Content-Disposition": 'attachment; filename="perfumes.xlsx"',

        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
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
