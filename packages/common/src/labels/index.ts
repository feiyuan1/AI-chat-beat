import { StorePayload } from "../adapter/types";
import { NOTIFICATION_KEY } from "../constants";
import { loadLabelModelConfig } from "../model-config";
import {
  CreateMonitorLog,
  MonitorLogType,
  ReportChatsLogs,
  storeFailedLogs,
} from "../monitor";
import { log } from "../utils";
import { classifyPromptWithFallback } from "./semanticClassifier";
import { LabelDimension } from "./types";

export const reportChatsWithLabel = (
  chats: StorePayload[],
  notification: () => void,
) => {
  loadLabelModelConfig()
    .then((config) => {
      if (!config) {
        throw new Error(NOTIFICATION_KEY);
      }

      return Promise.all(
        chats.map(async (chat) => {
          try {
            const { labels, usage } = await classifyPromptWithFallback(
              chat.prompt,
              config,
            );

            return {
              ...chat,
              labels: (Object.keys(labels.labels) as LabelDimension[]).reduce(
                (result, dimension) => {
                  return {
                    ...result,
                    [dimension]: labels.labels[dimension].value,
                  };
                },
                {},
              ),
              usage,
            };
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            const errorLog = CreateMonitorLog(
              `classifyPromptWithFallback error: ${errorMessage}`,
              MonitorLogType.ai_analyze_error,
            );
            storeFailedLogs([errorLog]);
            log("classifyPromptWithFallback error", errorMessage);
            return chat;
          }
        }),
      );
    })
    .then((result) => {
      if (!Array.isArray(result)) {
        return;
      }
      ReportChatsLogs(result);
    })
    .catch((err) => {
      if (err?.message === NOTIFICATION_KEY) {
        notification();
        ReportChatsLogs(chats);
      }
    });
};
