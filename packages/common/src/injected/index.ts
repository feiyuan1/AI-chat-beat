import { Platform, WINDOW_MESSAGE_TYPE } from "../types";
import { postMessage } from "../utils";
import { log } from "../utils/debugger";
import {
  detectPlatform,
  getPath,
  isPlatformChatRequest,
  reportError,
} from "./utils";

const innerScript = () => {
  log("injected");

  const platform = detectPlatform(location.href);
  if (platform === Platform.unknown) {
    throw new Error(`unsupported platform: ${new URL(location.href).hostname}`);
  }

  const postChatRequest = (url: string | URL, body: unknown) => {
    try {
      const path = getPath(url);
      if (!isPlatformChatRequest(platform, path)) {
        return;
      }

      log("target request", url);
      postMessage({
        type: WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST,
        payload: {
          body,
          timestamp: Date.now(),
          platform,
        },
      });
    } catch (err) {
      const message = `inject postChatRequest error${err}`;
      reportError(message);
    }
  };

  const tryPostChatRequest = (url: string | URL | undefined, body: unknown) => {
    if (url && body) {
      postChatRequest(url, body);
    }
  };

  // 拦截 XMLHttpRequest
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (
    body: XMLHttpRequestBodyInit | null | undefined,
  ) {
    tryPostChatRequest((this as any)._url, body);
    return originalSend.call(this, body);
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    (this as any)._url = url;
    return (originalOpen as any).call(this, method, url);
  };

  // 拦截 fetch
  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : input.toString();
    tryPostChatRequest(url, init?.body);
    return originalFetch.call(this, input as RequestInfo, init);
  };
};

const injectedScript = () => {
  try {
    innerScript();
  } catch (err) {
    reportError(err);
  }
};

export default injectedScript;
