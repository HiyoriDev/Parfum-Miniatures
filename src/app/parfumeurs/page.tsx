import { supabase } from "../../../lib/supabase";

import ParfumeursClient from "../../components/ParfumeursClient";

export default async function ParfumeursPage() {
  const { data } = await supabase.from("perfumes").select("*").range(0, 10000);

  const perfumes = data || [];

  return <ParfumeursClient perfumes={perfumes} />;
}
