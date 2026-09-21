import { LocalStoragekeys } from "../localStorage/types";
import { getLocalStorage, setLocalStorage } from "../localStorage/utils";
import { MonitorLogType } from "../monitor/types";
import { CreateMonitorLog } from "../monitor/utils";
import { Platform } from "../types";
import { consoleError } from "../utils/debugger";

export const PLATFORM_HOSTS: Record<Platform, string[]> = {
  [Platform.deepseek]: ["chat.deepseek.com"],
  [Platform.yuanbao]: ["yuanbao.tencent.com"],
  [Platform.qianwen]: ["www.qianwen.com"],
  [Platform.yiyan]: ["wenxin.baidu.com"],
  [Platform.chatglm]: ["chatglm.cn", "www.chatglm.cn"],
  [Platform.doubao]: ["www.doubao.com"],
  [Platform.kimi]: ["www.kimi.com"],
  [Platform.chatgpt]: ["chatgpt.com"],
  [Platform.unknown]: [],
};

export const detectPlatform = (url: string | URL): Platform => {
  const host = url instanceof URL ? url.hostname : new URL(url).hostname;
  for (const [platform, hosts] of Object.entries(PLATFORM_HOSTS)) {
    if (hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return platform as Platform;
    }
  }
  return Platform.unknown;
};

export const getPath = (url: string | URL): string => {
  if (url instanceof URL) {
    return url.pathname;
  }
  if (url.startsWith("/")) {
    return url;
  }
  return new URL(url).pathname;
};

export const isPlatformChatRequest = (
  platform: Platform,
  path: string,
): boolean => {
  switch (platform) {
    case Platform.deepseek:
      return (
        path.includes("/api/v0/chat/completion") ||
        path.includes("/api/v0/chat/edit_message")
      );
    case Platform.yuanbao:
      return path.startsWith("/api/chat/");
    case Platform.qianwen:
      return path.includes("/api/v2/chat");
    case Platform.yiyan:
      return path.includes("/aichat/api/conversation");
    case Platform.chatglm:
      return path.includes("/backend-api/assistant/stream");
    case Platform.doubao:
      return path.includes("/chat/completion");
    case Platform.kimi:
      return path.includes("/apiv2/kimi.gateway.chat.v1.ChatService/Chat");
    case Platform.chatgpt:
      return path.includes("/backend-api/f/conversation");
    default:
      return false;
  }
};

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export const reportError = (err: unknown) => {
  const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error);
  const oldErrorLogs = getLocalStorage(LocalStoragekeys.errorLogs) || [];
  console.log("oldErrorLogs", oldErrorLogs);
  setLocalStorage(LocalStoragekeys.errorLogs, oldErrorLogs.concat(errorLog));
  consoleError("injectErrorBoundary", err);
};
