export type Flow = {
  id: string;
  createdAt: number;
  steps: Step[];
};

export type StepType = "click" | "input" | "state_snapshot";

export type Step = {
  id: string;
  ts: number;
  type: StepType;
  url: string;
  target?: {
    selector: string;
    text?: string;
    bbox?: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
  };
  screenshot?: string; // dataURL
};
