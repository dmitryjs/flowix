"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { Flow, Step, StepType } from "@/types/flow";

function normalizeStep(step: unknown): Step {
  const raw = (step ?? {}) as Partial<Step>;
  const type: StepType =
    raw.type === "click" || raw.type === "input" || raw.type === "state_snapshot"
      ? raw.type
      : "click";

  return {
    id: typeof raw.id === "string" ? raw.id : crypto.randomUUID(),
    ts: typeof raw.ts === "number" ? raw.ts : Date.now(),
    type,
    url: typeof raw.url === "string" ? raw.url : "",
    target: raw.target && typeof raw.target === "object"
      ? {
          selector:
            typeof raw.target.selector === "string" ? raw.target.selector : "",
          text: typeof raw.target.text === "string" ? raw.target.text : undefined,
          bbox:
            raw.target.bbox &&
            typeof raw.target.bbox === "object" &&
            typeof raw.target.bbox.x === "number" &&
            typeof raw.target.bbox.y === "number" &&
            typeof raw.target.bbox.w === "number" &&
            typeof raw.target.bbox.h === "number"
              ? {
                  x: raw.target.bbox.x,
                  y: raw.target.bbox.y,
                  w: raw.target.bbox.w,
                  h: raw.target.bbox.h,
                }
              : undefined,
        }
      : undefined,
    screenshot: typeof raw.screenshot === "string" ? raw.screenshot : undefined,
  };
}

function normalizeFlow(raw: unknown): Flow {
  const base = (raw ?? {}) as Partial<Flow> & { title?: string };
  const id = typeof base.id === "string" ? base.id : crypto.randomUUID();
  const createdAt = typeof base.createdAt === "number" ? base.createdAt : Date.now();
  const steps = Array.isArray(base.steps) ? base.steps.map(normalizeStep) : [];

  const flow: Flow = {
    id,
    createdAt,
    steps,
  };

  if (typeof base.title === "string") {
    (flow as { title?: string }).title = base.title;
  }

  return flow;
}

export default function ImportFlowClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsSaving(true);

    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const flow = normalizeFlow(raw);
      const response = await fetch("/api/sync/flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ flow }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Sync failed");
      }
      const data = await response.json();
      const flowId = data?.flowId || flow.id;
      router.push(`/flows/${flowId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">Import flow</div>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to dashboard
          </Button>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Upload JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input type="file" accept="application/json" onChange={handleFileChange} />
            {isSaving && <div className="text-sm text-muted-foreground">Saving...</div>}
            {error && <div className="text-sm text-destructive">{error}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
