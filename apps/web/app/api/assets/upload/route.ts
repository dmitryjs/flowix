import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server-client";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const flowId = formData.get("flowId");
  const screenId = formData.get("screenId");
  const file = formData.get("file");

  if (typeof flowId !== "string" || typeof screenId !== "string") {
    return NextResponse.json({ error: "Invalid flowId or screenId" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const path = `flows/${session.user.id}/${flowId}/${screenId}.png`;
  const fileBytes = new Uint8Array(await file.arrayBuffer());
  const contentType = file.type || "image/png";

  const { error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(path, fileBytes, { contentType, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const assetId = crypto.randomUUID();
  const { error: assetError } = await supabase.from("assets").insert({
    id: assetId,
    user_id: session.user.id,
    flow_id: flowId,
    screen_id: screenId,
    path,
  });

  if (assetError) {
    return NextResponse.json({ error: assetError.message }, { status: 500 });
  }

  const { data: screenUpdate, error: screenError } = await supabase
    .from("screens")
    .update({ asset_id: assetId })
    .eq("id", screenId)
    .eq("flow_id", flowId)
    .select("id")
    .single();

  if (screenError) {
    return NextResponse.json({ error: screenError.message }, { status: 500 });
  }

  if (!screenUpdate) {
    return NextResponse.json({ error: "Screen not found" }, { status: 404 });
  }

  return NextResponse.json({
    assetId,
    path,
  });
}
