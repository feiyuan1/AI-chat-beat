import { handleAIChatRequestMessage, reportLocalStroageErrorLogs } from '@ai-chat-beat/common'
import { CHROME_MESSAGE_TYPE, StoreMessage } from '../types'
import {
  globalErrorBoundary,
  handleStoreChatMessage,
  injectScript,
  reStoreMessages,
  syncBundleInfo,
} from './util'

const innerScript = () => {
  injectScript()
  syncBundleInfo()
  reStoreMessages()
  reportLocalStroageErrorLogs()

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
