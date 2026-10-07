import { buildWorkbook, fetchAllPerfumes } from "@/lib/collection-file";
import { isAdmin } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const buffer = buildWorkbook(await fetchAllPerfumes(supabaseAdmin()));
    const date = new Date().toISOString().slice(0, 10);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="miniatures-${date}.xlsx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Export impossible" }, { status: 500 });
  }
}
