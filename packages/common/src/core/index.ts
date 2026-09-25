import { getPlatformChatAdapter } from "../adapter/platforms";
import {
  AdapterErrorBoundary,
  AdaptErrorBoundaryParams,
} from "../adapter/utils";
import { LocalStoragekeys } from "../localStorage/types";
import { Log } from "../monitor/types";
import {
  appendStorageItem,
  deleteStorageItem,
  getStorageItem,
} from "../storage";
import { Message, WINDOW_MESSAGE_TYPE } from "../types";

export const reportStroageErrorLogs = async (
  reportErrorLogs: (logs: Log[]) => void,
) => {
  const errorLogs = (await getStorageItem(LocalStoragekeys.errorLogs)) || [];
  if (!errorLogs.length) {
    return;
  }
  reportErrorLogs(errorLogs);
  await deleteStorageItem(LocalStoragekeys.errorLogs);
};

// TODO 这里 AdaptErrorBoundaryParams T 被指定为 any，导致类型丢失
export const handleAIChatRequestMessage = async (
  message: Message,
  params: Pick<AdaptErrorBoundaryParams<any>, "resolve" | "reject">,
) => {
  if (message?.type === WINDOW_MESSAGE_TYPE.AI_CHAT_REQUEST) {
    const { platform } = message.payload;
    const adapter = await getPlatformChatAdapter(platform);

    AdapterErrorBoundary({
      data: message.payload,
      adapter,
      async reject() {
        await appendStorageItem(LocalStoragekeys.failedAdaptChat, [
          message.payload,
        ]);
      },
      ...params,
    });
  }
};
