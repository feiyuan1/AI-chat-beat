import { LabelModelConfig } from "./types";

export function isConfigLike(
  value: unknown,
): value is Partial<LabelModelConfig> {
  return (
    typeof value === "object" &&
    value !== null &&
    "baseUrl" in value &&
    "model" in value &&
    "apiKey" in value
  );
}

const DEFAULT_TIMEOUT_MS = 30000;

export function normalizeConfig(config: LabelModelConfig): LabelModelConfig {
  const parsed = Number(config.timeoutMs);
  const timeoutMs =
    Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;

  return {
    ...config,
    timeoutMs,
  };
}
