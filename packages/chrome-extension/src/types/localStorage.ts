import { Log, StorePayload } from '@ai-chat-beat/common'

export enum LocalStoragekeys {
  unStoredMessageList = 'unStoredMessageList',
  failedAdaptChat = 'failedAdaptChat',
  errorLogs = 'errorLogs',
}

export interface LocalStorageData {
  [LocalStoragekeys.unStoredMessageList]?: StorePayload[]
  [LocalStoragekeys.failedAdaptChat]?: any[]
  [LocalStoragekeys.errorLogs]?: Log[]
}
