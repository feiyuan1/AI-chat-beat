export interface LabelModelConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
  apiKey: string;
}

export interface ValidationResult {
  type: "success" | "error";
  message?: string;
}

export type ParseConfigResult =
  | { type: "success"; config: LabelModelConfig }
  | { type: "error"; message?: string };
