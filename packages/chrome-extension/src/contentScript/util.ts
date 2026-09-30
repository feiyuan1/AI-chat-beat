import {
  consoleError,
  CreateMonitorLog,
  initStorage,
  Log,
  log,
  MonitorLogType,
  Storage,
} from '@ai-chat-beat/common'
import { appendStorageItem } from '@ai-chat-beat/common/src/storage'
import { CHROME_MESSAGE_TYPE, StoreMessage, TargetEnum } from '../types'
import { LocalStoragekeys } from '../types/localStorage'
import { getLocalStorage, removeLocalStorageKey, setLocalStorage } from '../utils/localStorage'

export function injectScript() {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL('./injected.js')
  script.type = 'module'
  script.onload = () => script.remove()
  ;(document.head || document.documentElement).appendChild(script)
}

export const handleStoreChatMessage = (message: StoreMessage, resolve?: () => void) => {
  try {
    chrome.runtime.sendMessage(message)
    resolve?.()
  } catch (err) {
    handleStoreFailed(err, message)
  }
}

export const handleStoreFailed = (err: unknown, message: StoreMessage) => {
  consoleError(err)
  appendStorageItem(LocalStoragekeys.unStoredMessageList, message.payload)
}

/**
 * 检测 extension 是否已经更新
 */
export const syncBundleInfo = () => {
  setTimeout(() => {
    try {
      chrome.runtime
        .sendMessage({
          type: 'GET_BUNDLE_TIMESTAMP',
        })
        .then(() => {
          log('extension version updated or initialized')
        })
    } catch (err) {
      log('extension version outdated')
    }
  }, 2000)
}

export const storeFailedLogs = (logs: Log[]) => {
  chrome.storage.local.get([TargetEnum.reportFailedLogs]).then((result) => {
    const oldList = result[TargetEnum.reportFailedLogs] || []
    chrome.storage.local.set({
      [TargetEnum.reportFailedLogs]: oldList.concat(logs),
    })
  })
}

export const globalErrorBoundary = (fn: () => void) => {
  try {
    fn()
  } catch (err) {
    const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error)
    storeFailedLogs([errorLog])
    consoleError('globalErrorBoundary', err)
  }
}

export const reStoreMessages = () => {
  const messages = getLocalStorage(LocalStoragekeys.unStoredMessageList)
  if (!messages?.length) {
    return
  }

  handleStoreChatMessage(
    {
      type: CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS,
      payload: messages,
      aggregate: false,
    },
    () => {
      removeLocalStorageKey(LocalStoragekeys.unStoredMessageList)
    },
  )
}

const isLocalStorageKeys = (key: string): key is LocalStoragekeys => key in LocalStoragekeys

const createLocalStorage = (): Storage => {
  return {
    get: async (key: string) => {
      if (!isLocalStorageKeys(key)) {
        consoleError('Invalid LocalStorage key from get action')
        throw new Error('Invalid LocalStorage key from get action')
      }
      return getLocalStorage(key)
    },
    set: async (key: string, value: any) => {
      if (!isLocalStorageKeys(key)) {
        consoleError('Invalid LocalStorage key')
        throw new Error('Invalid LocalStorage key from set action')
      }
      setLocalStorage(key, value)
    },
    delete: async (key: string) => {
      if (!isLocalStorageKeys(key)) {
        consoleError('Invalid LocalStorage key')
        throw new Error('Invalid LocalStorage key from delete action')
      }
      removeLocalStorageKey(key)
    },
  }
}
export const initLocalStorage = () => {
  initStorage(createLocalStorage())
}
