import { getPlatformChatAdapter } from "../adapter/platforms";
import {
  AdapterErrorBoundary,
  AdaptErrorBoundaryParams,
} from "../adapter/utils";
import { LocalStoragekeys } from "../localStorage/types";
import { getLocalStorage } from "../localStorage/utils";
import { Message, WINDOW_MESSAGE_TYPE } from "../types";

export const reportLocalStroageErrorLogs = () => {
  const errorLogs = getLocalStorage(LocalStoragekeys.errorLogs) || [];
  if (!errorLogs.length) {
    return;
  }
  // storeFailedLogs(errorLogs);
  // removeLocalStorageKey(LocalStoragekeys.errorLogs);
};

// TODO 这里 AdaptErrorBoundaryParams T 被指定为 any，导致类型丢失
export const handleAIChatRequestMessage = (
  message: Message,
  params: Pick<AdaptErrorBoundaryParams<any>, "resolve" | "reject">,
) => {
  if (message?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST) {
    const { platform } = message.payload;
    const adapter = getPlatformChatAdapter(platform);

    AdapterErrorBoundary({
      data: message.payload,
      adapter,
      reject() {
        // const oldFailedAdaptData =
        //   getLocalStorage(LocalStoragekeys.failedAdaptChat) || [];
        // setLocalStorage(
        //   LocalStoragekeys.failedAdaptChat,
        //   oldFailedAdaptData.concat(message.payload),
        // );
      },
      ...params,
    });
  }
};
