import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";
import DashboardClient from "@/app/_components/DashboardClient";
import type { FlowSummary } from "@/app/_components/types";

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    redirect("/auth");
  }

  const { data: flowsData, error: flowsError } = await supabase
    .from("flows")
    .select("id,title,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (flowsError || !flowsData) {
    return <DashboardClient initialFlows={[]} />;
  }

  const { data: screensData } = await supabase
    .from("screens")
    .select("flow_id");
  const { data: stepsData } = await supabase
    .from("steps")
    .select("flow_id");

  const screensCountMap = new Map<string, number>();
  const stepsCountMap = new Map<string, number>();

  for (const screen of screensData ?? []) {
    const id = screen.flow_id as string;
    screensCountMap.set(id, (screensCountMap.get(id) ?? 0) + 1);
  }

  for (const step of stepsData ?? []) {
    const id = step.flow_id as string;
    stepsCountMap.set(id, (stepsCountMap.get(id) ?? 0) + 1);
  }

  const initialFlows: FlowSummary[] = flowsData.map((flow) => ({
    id: flow.id,
    title: flow.title ?? "Untitled",
    createdAt: new Date(flow.created_at).getTime(),
    updatedAt: new Date(flow.updated_at).getTime(),
    screensCount: screensCountMap.get(flow.id) ?? 0,
    stepsCount: stepsCountMap.get(flow.id) ?? 0,
  }));

  return <DashboardClient initialFlows={initialFlows} />;
}