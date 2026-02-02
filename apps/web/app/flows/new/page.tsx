import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ImportFlowClient from "@/app/flows/new/ImportClient";

export default async function ImportFlowPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    redirect("/auth");
  }

  return <ImportFlowClient />;
}
