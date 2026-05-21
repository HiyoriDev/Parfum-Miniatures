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

    const firstRow = data[0] as Record<string, unknown>;

    const requiredFields = ["id", "parfum", "parfumeur"];

    const hasRequiredFields = requiredFields.every(
      (field) => field in firstRow,
    );

    if (!hasRequiredFields) {
      return NextResponse.json(
        {
          success: false,

          error: "Colonnes XLSX invalides",
        },

        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(data) || data.length === 0) {
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

    const cleanedData = data.map((item: any) => ({
      id: item.id || 0,

      parfum: item.parfum || "",

      parfumeur: item.parfumeur || "",

      boite: item.boite || "",

      type: item.type || "",

      contenance: item.contenance || "",

      image_file: item.image_file || "",

      description: item.description || "",
    }));

    await supabase.from("perfumes").delete().neq("id", 0);

    const chunkSize = 500;

    for (let i = 0; i < cleanedData.length; i += chunkSize) {
      const chunk = cleanedData.slice(i, i + chunkSize);

      const { error } = await supabase.from("perfumes").insert(chunk);

      if (error) {
        console.log(error);

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
  } catch (error) {
    console.log(error);

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
