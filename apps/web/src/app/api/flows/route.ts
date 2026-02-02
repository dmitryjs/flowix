import { NextResponse } from "next/server";
import type { Flow } from "@/types/flow";
import { supabaseServer } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  let query = supabaseServer.from("flows").select("id,project_id,created_at");
  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ flows: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const flow = body?.flow as Flow | undefined;
  const projectId = typeof body?.projectId === "string" ? body.projectId : null;

  if (!flow || !flow.id || !Array.isArray(flow.steps)) {
    return NextResponse.json({ error: "Invalid flow payload" }, { status: 400 });
  }

  const { error: flowError } = await supabaseServer.from("flows").insert({
    id: flow.id,
    project_id: projectId,
    created_at: new Date(flow.createdAt).toISOString(),
  });

  if (flowError) {
    return NextResponse.json({ error: flowError.message }, { status: 500 });
  }

  const stepsPayload = flow.steps.map((step) => ({
    id: step.id,
    flow_id: flow.id,
    ts: step.ts,
    type: step.type,
    url: step.url,
    target: step.target ?? null,
    screenshot: step.screenshot ?? null,
  }));

  if (stepsPayload.length > 0) {
    const { error: stepsError } = await supabaseServer.from("steps").insert(stepsPayload);
    if (stepsError) {
      return NextResponse.json({ error: stepsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
