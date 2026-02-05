import { redirect } from "next/navigation";
import ImportFlowClient from "@/app/flows/new/ImportClient";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";

export const dynamic = "force-dynamic";

export default async function ImportFlowPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    redirect("/auth");
  }

  return <ImportFlowClient />;
}
