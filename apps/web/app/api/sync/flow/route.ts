import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { buildScreens } from "@/src/lib/flow/screens";
import type { Flow } from "@/types/flow";

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; contentType: string } | null {
  if (!dataUrl.startsWith("data:")) return null;
  const [header, base64] = dataUrl.split(",");
  if (!header || !base64) return null;
  const match = header.match(/^data:(.*?);base64$/);
  if (!match) return null;
  const contentType = match[1] || "image/png";
  const buffer = Buffer.from(base64, "base64");
  return { bytes: new Uint8Array(buffer), contentType };
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const flow = body?.flow as Flow | undefined;
  if (!flow || !Array.isArray(flow.steps)) {
    return NextResponse.json({ error: "Invalid flow payload" }, { status: 400 });
  }

  const flowId = typeof flow.id === "string" ? flow.id : crypto.randomUUID();
  const now = new Date().toISOString();

  const screensData = buildScreens(flow);

  const screensPayload = screensData.screens.map((screen) => ({
    id: screen.id,
    flow_id: flowId,
    url: screen.url,
    title: screen.title ?? null,
    created_at: now,
  }));

  const stepsPayload = screensData.screens.flatMap((screen) =>
    screen.steps.map((step) => ({
      id: step.id,
      flow_id: flowId,
      screen_id: screen.id,
      ts: step.ts,
      type: step.type,
      url: step.url,
      target: step.target ?? null,
      screenshot_url: null,
      created_at: now,
    }))
  );

  const assetsPayload: Array<{
    id: string;
    user_id: string;
    flow_id: string;
    screen_id: string;
    path: string;
    created_at: string;
  }> = [];

  const uploadedPaths: string[] = [];
  for (const screen of screensData.screens) {
    if (!screen.screenshot) continue;
    const decoded = dataUrlToBytes(screen.screenshot);
    if (!decoded) continue;

    const path = `flows/${session.user.id}/${flowId}/${screen.id}.png`;
    const { error: uploadError } = await supabase.storage
      .from("screenshots")
      .upload(path, decoded.bytes, { contentType: decoded.contentType, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    uploadedPaths.push(path);
    assetsPayload.push({
      id: crypto.randomUUID(),
      user_id: session.user.id,
      flow_id: flowId,
      screen_id: screen.id,
      path,
      created_at: now,
    });
  }

  const { error: syncError } = await supabase.rpc("sync_flow_atomic", {
    p_user_id: session.user.id,
    p_flow_id: flowId,
    p_title:
      typeof (flow as { title?: string }).title === "string"
        ? (flow as { title?: string }).title
        : "Untitled",
    p_created_at: new Date(flow.createdAt || Date.now()).toISOString(),
    p_updated_at: now,
    p_screens: screensPayload,
    p_steps: stepsPayload,
    p_assets: assetsPayload,
  });

  if (syncError) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("screenshots").remove(uploadedPaths);
    }
    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }

  return NextResponse.json({ flowId });
}
