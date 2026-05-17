import { cookies } from "next/headers";

import { supabase } from "../../../../lib/supabase";

import { verifyToken } from "../../../../lib/auth";

import ParfumClient from "./ParfumClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const { data: perfume } = await supabase
    .from("perfumes")
    .select("*")
    .eq("id", Number(id))
    .single();

  if (!perfume) {
    return {
      title: "Parfum introuvable",
    };
  }

  return {
    title: `${perfume.parfum} - ${perfume.parfumeur} | Miniatures de Parfum`,

    description: `Découvrez la miniature ${perfume.parfum} de ${perfume.parfumeur} avec photo et détails.`,
  };
}

export default async function ParfumPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    page?: string;
    letter?: string;
    origin?: string;
    parfumeur?: string;
  }>;
}) {
  const resolvedParams = await params;

  const resolvedSearchParams = await searchParams;

  const currentPage = resolvedSearchParams.page || "1";

  const currentLetter = resolvedSearchParams.letter || "Tous";

  const origin = resolvedSearchParams.origin || "home";

  const parfumeur = resolvedSearchParams.parfumeur || "";

  const cookieStore = await cookies();

  const token = cookieStore.get("admin_token")?.value;

  const isAdmin = !!token && verifyToken(token);

  const { data: perfume } = await supabase
    .from("perfumes")
    .select("*")
    .eq("id", Number(resolvedParams.id))
    .single();

  if (!perfume) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Parfum introuvable
      </main>
    );
  }

  return (
    <ParfumClient
      perfume={perfume}
      isAdmin={isAdmin}
      currentPage={currentPage}
      currentLetter={currentLetter}
      origin={origin}
      originParfumeur={parfumeur}
    />
  );
}
