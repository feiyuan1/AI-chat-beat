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

const init = () => {
  reportErrorLogs();
  injectedScript();
};

try {
  init();
} catch (e) {
  consoleError("app init injected script error", e);
}

export default init;
