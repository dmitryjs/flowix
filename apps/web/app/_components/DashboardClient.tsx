"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/ui/sidebar-with-submenu";
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
  const [activeSection, setActiveSection] = useState<
    "flows" | "projects" | "profile" | "settings"
  >("flows");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [openProjectMenu, setOpenProjectMenu] = useState<string | null>(null);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const projectTree = useMemo(
    () => [
      {
        id: "onboarding",
        name: "Onboarding",
        children: ["Welcome", "Signup", "Verify email"],
      },
      {
        id: "billing",
        name: "Billing",
        children: ["Pricing", "Checkout"],
      },
      {
        id: "dashboard",
        name: "Dashboard",
        children: ["Overview"],
      },
    ],
    []
  );

  const handleDelete = async (id: string) => {
    setErrorMessage(null);
    const { error } = await supabaseBrowser.from("flows").delete().eq("id", id);
    if (!error) {
      setFlows((prev) => prev.filter((flow) => flow.id !== id));
    } else {
      setErrorMessage("Could not delete flow. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="w-full">
        <div className="fixed left-0 top-0 z-10 flex h-screen w-[260px] flex-col border-r border-border bg-card">
          <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {activeSection === "projects" && (
          <div className="fixed left-[260px] top-0 z-10 h-screen w-[260px] border-r border-border bg-card">
            <div className="flex h-full flex-col gap-4 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Projects</div>
                <Button size="sm" variant="secondary">
                  New project
                </Button>
              </div>
              <div className="flex-1 space-y-2 overflow-auto">
                {projectTree.map((project) => (
                  <div key={project.id} className="space-y-1">
                    <div className="group flex items-center justify-between rounded-md px-2 py-1 text-sm text-foreground hover:bg-muted">
                      <span>{project.name}</span>
                      <button
                        type="button"
                        className="opacity-0 transition group-hover:opacity-100"
                        onClick={() =>
                          setOpenProjectMenu((current) =>
                            current === project.id ? null : project.id
                          )
                        }
                      >
                        <span className="text-muted-foreground">⋯</span>
                      </button>
                    </div>
                    {openProjectMenu === project.id && (
                      <div className="ml-4 rounded-md border border-border bg-background text-xs text-muted-foreground">
                        <button
                          type="button"
                          className="w-full px-2 py-1 text-left hover:bg-muted"
                        >
                          Delete project
                        </button>
                      </div>
                    )}
                    <div className="ml-4 space-y-1 border-l border-border pl-3 text-xs text-muted-foreground">
                      {project.children.map((child) => (
                        <div key={child} className="rounded-sm px-1 py-0.5">
                          {child}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                Workspace: Default
              </div>
            </div>
          </div>
        )}

        <main
          className={`flex flex-col gap-6 px-5 py-6 ${
            activeSection === "projects" ? "ml-[520px]" : "ml-[260px]"
          }`}
        >
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="text-2xl font-semibold tracking-tight">Flows</div>
              <div className="text-sm text-muted-foreground">
                Review, open, and manage recorded user flows.
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:items-end">
              <div className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                Project: Default
              </div>
              <Button asChild size="lg">
                <Link href="/flows/new">Import flow</Link>
              </Button>
            </div>
          </div>

          {errorMessage && (
            <Card>
              <CardContent className="p-4 text-sm text-destructive">
                {errorMessage}
              </CardContent>
            </Card>
          )}

          {!isReady ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-5 w-2/3 rounded bg-muted" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-9 w-full rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : flows.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-start gap-3 p-6 text-sm text-muted-foreground">
                <div className="text-base font-medium text-foreground">No flows yet</div>
                <div>Import a flow to start reviewing your user journey.</div>
                <Button asChild>
                  <Link href="/flows/new">Import flow</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {flows.map((flow) => (
                <Card
                  key={flow.id}
                  className="flex h-full flex-col transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{flow.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="text-sm text-muted-foreground">
                      {flow.screensCount} screens • {flow.stepsCount} steps • Updated{" "}
                      {new Date(flow.updatedAt).toLocaleDateString()}
                    </div>
                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button asChild>
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
        </main>
      </div>
    </div>
  );
}
