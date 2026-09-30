import { handleAIChatRequestMessage, reportStroageErrorLogs } from '@ai-chat-beat/common'
import { CHROME_MESSAGE_TYPE, StoreMessage } from '../types'
import {
  globalErrorBoundary,
  handleStoreChatMessage,
  initLocalStorage,
  injectScript,
  reStoreMessages,
  storeFailedLogs,
  syncBundleInfo,
} from './util'

const innerScript = () => {
  initLocalStorage()
  injectScript()
  syncBundleInfo()
  reStoreMessages()
  reportStroageErrorLogs(storeFailedLogs)

  // 监听来自 injected 的消息，转发给 background
  window.addEventListener('message', (event) => {
    if (event.source !== window) return

    handleAIChatRequestMessage(event.data, {
      resolve: (result) => {
        const message: StoreMessage = {
          type: CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS,
          payload: [result],
        }
        handleStoreChatMessage(message)
      },
    })
  })
}

globalErrorBoundary(innerScript)
