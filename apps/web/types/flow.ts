export type Flow = {
  id: string;
  createdAt: number;
  steps: Step[];
  recording?: boolean;
  startedAt?: number;
  counts?: {
    clicks: number;
    snapshots: number;
  };
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
