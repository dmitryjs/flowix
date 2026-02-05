import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";
import FlowEditorClient from "@/app/flows/[id]/EditorClient";
import type { Flow } from "@/types/flow";

type PageProps = {
  params: { id: string };
};

export default async function FlowEditorPage({ params }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    redirect("/auth");
  }

  const flowId = params.id;
  const { data: flowRow } = await supabase
    .from("flows")
    .select("id,title,created_at,updated_at")
    .eq("id", flowId)
    .single();

  if (!flowRow) {
    return <FlowEditorClient initialError="Flow not found" />;
  }

  const { data: stepsRows } = await supabase
    .from("steps")
    .select("id,ts,type,url,target,screen_id")
    .eq("flow_id", flowId);
  const { data: assetsRows } = await supabase
    .from("assets")
    .select("id,path,screen_id")
    .eq("flow_id", flowId);

  const assetByScreen = new Map<string, string>();
  for (const asset of assetsRows ?? []) {
    if (asset.screen_id && asset.path) {
      assetByScreen.set(asset.screen_id as string, asset.path as string);
    }
  }

  const signedUrlByScreen = new Map<string, string>();
  for (const [screenId, path] of assetByScreen.entries()) {
    const { data: signed } = await supabase.storage
      .from("screenshots")
      .createSignedUrl(path, 3600);
    if (signed?.signedUrl) {
      signedUrlByScreen.set(screenId, signed.signedUrl);
    }
  }

  const steps = (stepsRows ?? []).map((step) => ({
    id: step.id as string,
    ts: step.ts as number,
    type: step.type as "click" | "input" | "state_snapshot",
    url: step.url as string,
    target: (step.target ?? undefined) as Flow["steps"][number]["target"],
    screenshot: undefined as string | undefined,
    screen_id: step.screen_id as string,
  }));

  steps.sort((a, b) => a.ts - b.ts);

  const usedScreenshot = new Set<string>();
  for (const step of steps) {
    const screenId = step.screen_id;
    if (!screenId || usedScreenshot.has(screenId)) continue;
    if (step.type !== "state_snapshot") continue;
    const url = signedUrlByScreen.get(screenId);
    if (url) {
      step.screenshot = url;
      usedScreenshot.add(screenId);
    }
  }

  for (const step of steps) {
    const screenId = step.screen_id;
    if (!screenId || usedScreenshot.has(screenId)) continue;
    const url = signedUrlByScreen.get(screenId);
    if (url) {
      step.screenshot = url;
      usedScreenshot.add(screenId);
    }
  }

  const flow: Flow = {
    id: flowRow.id,
    createdAt: new Date(flowRow.created_at).getTime(),
    steps: steps.map((step) => ({
      id: step.id,
      ts: step.ts,
      type: step.type,
      url: step.url,
      target: step.target,
      screenshot: step.screenshot,
    })),
  };

  return (
    <FlowEditorClient
      initialFlow={flow}
      initialTitle={flowRow.title ?? "Untitled"}
      initialError={null}
    />
  );
}
