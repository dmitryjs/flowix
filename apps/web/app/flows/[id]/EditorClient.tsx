"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Flow } from "@/types/flow";
import { buildScreens, type Screen } from "@/src/lib/flow/screens";

type FlowEditorClientProps = {
  initialFlow?: Flow | null;
  initialTitle?: string;
  initialError?: string | null;
};

export default function FlowEditorClient({
  initialFlow = null,
  initialTitle = "Untitled",
  initialError = null,
}: FlowEditorClientProps) {
  const router = useRouter();

  const [flow] = useState<Flow | null>(initialFlow);
  const [title] = useState(initialTitle);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [error] = useState<string | null>(initialError);

  const screensData = useMemo(() => {
    if (!flow) return null;
    return buildScreens(flow);
  }, [flow]);

  const truncateSelector = (selector: string, maxLength: number = 50) => {
    if (selector.length <= maxLength) return selector;
    return selector.substring(0, maxLength) + "...";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-5xl mx-auto p-6 space-y-4">
          <div className="text-2xl font-semibold">Flow</div>
          <div className="text-sm text-destructive">{error}</div>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-semibold">{title}</div>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to dashboard
          </Button>
        </div>

        <Separator />

        {screensData ? (
          <div className="flex min-h-[70vh] border rounded-xl overflow-hidden">
            <div className="w-80 border-r overflow-y-auto">
              <div className="p-4">
                <div className="text-sm font-semibold mb-3">Screens</div>
                <div className="space-y-2">
                  {screensData.screens.map((screen) => (
                    <Card
                      key={screen.id}
                      className={`cursor-pointer transition-colors ${
                        selectedScreen?.id === screen.id
                          ? "ring-2 ring-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedScreen(screen)}
                    >
                      <CardContent className="p-4">
                        <div className="text-sm font-medium truncate">{screen.url}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {screen.steps.length} steps
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedScreen ? (
                <div className="p-6 space-y-6">
                  <div>
                    <h1 className="text-xl font-semibold">{selectedScreen.url}</h1>
                  </div>

                  <Separator />

                  {selectedScreen.screenshot && (
                    <Card>
                      <CardContent className="p-4">
                        <img
                          src={selectedScreen.screenshot}
                          alt="Screenshot"
                          className="max-w-full h-auto rounded-md"
                        />
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Steps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedScreen.steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-4 p-3 border rounded-md"
                          >
                            <div className="w-24 text-sm font-medium">{step.type}</div>
                            <div className="flex-1 text-sm font-mono truncate">
                              {step.target?.selector
                                ? truncateSelector(step.target.selector)
                                : "-"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a screen
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Loading flow...</div>
        )}
      </div>
    </div>
  );
}
