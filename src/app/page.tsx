import { supabase } from "../../lib/supabase";

import HomeClient from "../components/HomeClient";

export default async function Home() {
  const { data } = await supabase.from("perfumes").select("*").range(0, 10000);

  const perfumes = data || [];

  return <HomeClient perfumes={perfumes} />;
}
