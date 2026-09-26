import { consoleError, initStorage, Storage } from '@ai-chat-beat/common'
import { StorePayload, TargetEnum } from '../types'

export const handleBatchStore = (data: StorePayload[]) => {
  chrome.storage.local.get(TargetEnum.fullChatHistory).then((result) => {
    const fullData = result[TargetEnum.fullChatHistory] || []
    return chrome.storage.local.set({
      [TargetEnum.fullChatHistory]: fullData.concat(data),
    })
  })
}

const isTargetEnum = (key: string): key is TargetEnum => key in TargetEnum

const createStorage = (): Storage => ({
  get: async (key: string) => {
    if (!isTargetEnum(key)) {
      consoleError('Invalid Chrome Storage key from get action')
      throw new Error('Invalid Chrome Storage key from get action')
    }
    return chrome.storage.local.get(key).then((result) => {
      if (key === TargetEnum.labelModelConfig) {
        return result[key]
      }
      return result[key] || []
    })
  },
  set: async (key: string, value: any) => {
    if (!isTargetEnum(key)) {
      consoleError('Invalid LocalStorage key')
      throw new Error('Invalid Chrome Storage key from set action')
    }
    return chrome.storage.local.set({ [key]: value })
  },
  delete: async (key: string) => {
    if (!isTargetEnum(key)) {
      consoleError('Invalid LocalStorage key')
      throw new Error('Invalid Chrome Storage key from delete action')
    }
    return chrome.storage.local.remove(key)
  },
})
export const initChromeStroage = () => {
  initStorage(createStorage())
}
