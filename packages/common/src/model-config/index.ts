import { getStorageItem, setStorageItem, TargetEnum } from "../storage";
import { LabelModelConfig, ParseConfigResult, ValidationResult } from "./types";
import { isConfigLike, normalizeConfig } from "./utils";

export const validationConfig = (
  config: Partial<LabelModelConfig>,
): ValidationResult => {
  if (!config.baseUrl) {
    return {
      type: "error",
      message: "Base URL 不能为空",
    };
  }
  if (!config.model) {
    return {
      type: "error",
      message: "Model 不能为空",
    };
  }
  if (!config.apiKey) {
    return {
      type: "error",
      message: "API Key 不能为空",
    };
  }
  return {
    type: "success",
  };
};

export function parseModelConfig(content: string): ParseConfigResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    return { type: "error", message: "配置文件不是有效的 JSON" };
  }

  if (!isConfigLike(parsed)) {
    return {
      type: "error",
      message: "配置文件缺少必填字段：baseUrl、model、apiKey",
    };
  }

  const config: LabelModelConfig = {
    baseUrl: String(parsed.baseUrl).trim(),
    model: String(parsed.model).trim(),
    timeoutMs: Number(parsed.timeoutMs) || 0,
    apiKey: String(parsed.apiKey),
  };

  const validationResult = validationConfig(config);
  if (validationResult.type == "error") {
    return { type: "error", message: validationResult.message };
  }

  return { type: "success", config };
}

export async function loadLabelModelConfig(): Promise<LabelModelConfig | null> {
  const stored = await getStorageItem(TargetEnum.labelModelConfig);

  if (!stored) {
    return null;
  }

  try {
    return await stored;
  } catch {
    return null;
  }
}

export async function saveLabelModelConfig(
  config: LabelModelConfig,
): Promise<void> {
  const normalized = normalizeConfig(config);
  await setStorageItem(TargetEnum.labelModelConfig, normalized);
}

export * from "./types";
