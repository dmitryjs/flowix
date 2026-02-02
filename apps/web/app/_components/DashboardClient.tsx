"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabaseBrowser } from "@/src/lib/supabase/client";
import type { FlowSummary } from "@/app/_components/types";

type DashboardClientProps = {
  initialFlows: FlowSummary[];
};

export default function DashboardClient({ initialFlows }: DashboardClientProps) {
  const [flows, setFlows] = useState<FlowSummary[]>(initialFlows);
  const [query, setQuery] = useState("");

  const filteredFlows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return flows;
    return flows.filter((flow) => flow.title.toLowerCase().includes(q));
  }, [flows, query]);

  const handleDelete = async (id: string) => {
    const { error } = await supabaseBrowser.from("flows").delete().eq("id", id);
    if (!error) {
      setFlows((prev) => prev.filter((flow) => flow.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">Flowix</div>
          <Button asChild>
            <Link href="/flows/new">Import flow</Link>
          </Button>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search flows"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {filteredFlows.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No flows yet. Import a flow to get started.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredFlows.map((flow) => (
              <Card key={flow.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{flow.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="text-sm text-muted-foreground">
                    Updated: {new Date(flow.updatedAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Screens: {flow.screensCount} • Steps: {flow.stepsCount}
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary">
                      <Link href={`/flows/${flow.id}`}>Open</Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete flow?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(flow.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
