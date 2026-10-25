import { Platform } from "../../types";
import { AdaptResult, StorePayload } from "../types";
import {
  createAdapterErrorBoundary,
  createPlatformError,
  createSuccess,
  parseCommonProps,
} from "./utils";

const platformError = createPlatformError(Platform.kimi);

const parseKimiBody = (body: unknown): any => {
  if (body instanceof Uint8Array) {
    // Uint8Array: skip the leading 5 non-body bytes and decode the rest as JSON
    const content = body.slice(5);
    const text = new TextDecoder().decode(content);
    return JSON.parse(text);
  }
  if (body && typeof body === "object") {
    const array = Object.values(body);
    if (!array.every((v) => typeof v === "number" && v >= 0 && v <= 255)) {
      throw new Error("unexpected body format: not a uint8 array");
    }
    const unit8Array = new Uint8Array(array);
    const content = unit8Array.slice(5);
    const text = new TextDecoder().decode(content);
    return JSON.parse(text);
  }
  throw new Error("kimi request body must be Uint8Array");
};

export const ChatDataAdapter = createAdapterErrorBoundary<
  AdaptResult<StorePayload>
>("kimi-chatdata", (data: any) => {
  if (!data || typeof data !== "object") {
    return platformError("ChatDataAdapter required an object");
  }

  const body = parseKimiBody(data.body);
  const blocks = body?.message?.blocks;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return platformError("missing required field: blocks");
  }

  const block = blocks.find(
    (b: any) =>
      b &&
      b.text &&
      typeof b.text.content === "string" &&
      b.text.content.trim(),
  );
  if (!block) {
    return platformError("no valid prompt found");
  }

  return createSuccess({
    prompt: block.text.content,
    ...parseCommonProps(data),
  });
});
