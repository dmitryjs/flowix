import type { Flow, Step } from "@/types/flow";

export type Screen = {
  id: string;
  url: string;
  title?: string;
  steps: Step[];
  screenshot?: string;
};

export type ScreenEdge = {
  from: string;
  to: string;
  byStepId: string;
};

export function buildScreens(flow: Flow): { screens: Screen[]; edges: ScreenEdge[] } {
  const screens: Screen[] = [];
  const edges: ScreenEdge[] = [];
  const urlToScreenId = new Map<string, string>();
  const screenIdToScreen = new Map<string, Screen>();

  // Группируем steps по url
  for (const step of flow.steps) {
    let screenId = urlToScreenId.get(step.url);

    if (!screenId) {
      // Создаём новый screen
      screenId = crypto.randomUUID();
      urlToScreenId.set(step.url, screenId);

      // Находим первый screenshot для этого url
      const firstScreenshot = flow.steps.find((s) => s.url === step.url && s.screenshot)?.screenshot;

      const newScreen: Screen = {
        id: screenId,
        url: step.url,
        steps: [],
        screenshot: firstScreenshot,
      };

      screens.push(newScreen);
      screenIdToScreen.set(screenId, newScreen);
    }

    // Добавляем step в соответствующий screen
    const screen = screenIdToScreen.get(screenId);
    if (screen) {
      screen.steps.push(step);
    }
  }

  // Создаём edges для click-шагов
  for (let i = 0; i < flow.steps.length - 1; i++) {
    const currentStep = flow.steps[i];
    const nextStep = flow.steps[i + 1];

    if (currentStep.type === "click" && currentStep.url !== nextStep.url) {
      const fromScreenId = urlToScreenId.get(currentStep.url);
      const toScreenId = urlToScreenId.get(nextStep.url);

      if (fromScreenId && toScreenId) {
        edges.push({
          from: fromScreenId,
          to: toScreenId,
          byStepId: currentStep.id,
        });
      }
    }
  }

  return { screens, edges };
}
