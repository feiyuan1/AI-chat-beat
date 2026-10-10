import {
  consoleError,
  getLocalStorage,
  injectedScript,
  LocalStoragekeys,
  postMessage,
  removeLocalStorageKey,
} from "@ai-chat-beat/common";
import { MessageType } from "./src/types";

const reportErrorLogs = () => {
  const logs = getLocalStorage(LocalStoragekeys.errorLogs);
  if (logs?.length) {
    postMessage({ type: MessageType.INJECTED_ERROR_LOGS, payload: logs });
  }
  removeLocalStorageKey(LocalStoragekeys.errorLogs);
};

const getAbsoluteUrl = (url: string) => {
  if (url.startsWith("https://")) {
    return url;
  }
  return new URL(url, location.href).href;
};
const listenHistoryState = () => {
  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    const originalUrl = args[2];
    if (!originalUrl) {
      return;
    }
    const originalUrlString =
      typeof originalUrl === "string" ? originalUrl : originalUrl.href;
    originalPushState.apply(this, args);
    if (!originalUrlString.includes("/chat/")) {
      return;
    }
    const url = getAbsoluteUrl(originalUrlString);
    postMessage({
      type: MessageType.UPDATE_SESSION,
      payload: url,
    });
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    const originalUrl = args[2];
    if (!originalUrl) {
      return;
    }
    const originalUrlString =
      typeof originalUrl === "string" ? originalUrl : originalUrl.href;
    if (!originalUrlString.includes("/chat/")) {
      return;
    }
    const url = getAbsoluteUrl(originalUrlString);
    postMessage({
      type: MessageType.UPDATE_SESSION,
      payload: url,
    });
  };
};

const init = () => {
  reportErrorLogs();
  injectedScript();
  listenHistoryState();
};

try {
  init();
} catch (e) {
  consoleError("app init injected script error", e);
}

export default init;
