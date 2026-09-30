import { StorePayload } from '@ai-chat-beat/common'

export enum WINDOW_MESSAGE_TYPE {
  AI_CHAT_REQUEST = 'AI_CHAT_REQUEST',
}

export enum CHROME_MESSAGE_TYPE {
  BATCH_CHAT_REQUESTS = 'BATCH_CHAT_REQUESTS',
  GET_BUNDLE_TIMESTAMP = 'GET_BUNDLE_TIMESTAMP',
  SAVE_MODEL_CONFIG = 'SAVE_MODEL_CONFIG',
  LOAD_MODEL_CONFIG = 'LOAD_MODEL_CONFIG',
}

export interface StoreMessage {
  type: CHROME_MESSAGE_TYPE
  payload: StorePayload[]
  aggregate?: boolean // 是否聚合上报metric
}

export enum TargetEnum {
  fullChatHistory = 'fullChatHistory',
  reportFailedLogs = 'reportFailedLogs',
  reportFailedMetrics = 'reportFailedMetrics',
  labelModelConfig = 'labelModelConfig',
}

export interface StoreChromeLocalError {
  message: unknown
}
