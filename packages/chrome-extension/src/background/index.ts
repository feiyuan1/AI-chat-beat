import {
  LabelModelConfig,
  loadLabelModelConfig,
  log,
  reportChatsWithLabel,
  reportFailedLogs,
  reportFailedMetrics,
  saveLabelModelConfig,
} from '@ai-chat-beat/common'
import { ReportChatsMetrics } from '@ai-chat-beat/common/src/monitor'
import { NOTIFICATION_KEY } from '../constants'
import { RESOTRE_CHAT_CHROME_LOCAL } from '../constants/dev_env'
import { CHROME_MESSAGE_TYPE, StoreMessage } from '../types'
import { startWsClient } from './dev-client'
import { handleBatchStore, initChromeStroage } from './util'

const timeStamp = performance.now()
if (import.meta.env.MODE === 'development') {
  startWsClient()
}

initChromeStroage()
reportFailedLogs()
reportFailedMetrics()

chrome.runtime.onMessage.addListener((message: StoreMessage) => {
  if (message.type !== CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS) {
    return
  }

  if (RESOTRE_CHAT_CHROME_LOCAL) {
    handleBatchStore(message.payload)
  }

  ReportChatsMetrics({ chats: message.payload, aggregate: message.aggregate })
  reportChatsWithLabel(message.payload, () => {
    chrome.notifications.clear(NOTIFICATION_KEY)
    chrome.notifications.create(NOTIFICATION_KEY, {
      type: 'basic',
      iconUrl: 'public/icons/icon.png',
      title: 'AI Chat Beat',
      message: '模型配置缺失，请打开 popup 进行配置,本轮 prompt 未打入标签',
    })
  })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === CHROME_MESSAGE_TYPE.GET_BUNDLE_TIMESTAMP) {
    log('sw timestamp: ', timeStamp)
    sendResponse(timeStamp)
  }
})

chrome.runtime.onMessage.addListener(
  (message: { type: CHROME_MESSAGE_TYPE; payload: LabelModelConfig }, _sender, sendResponse) => {
    if (message.type === CHROME_MESSAGE_TYPE.SAVE_MODEL_CONFIG) {
      saveLabelModelConfig(message.payload)
        .then(() => {
          sendResponse({ type: 'success' })
        })
        .catch((err) => {
          sendResponse({ type: 'error', error: err })
        })
      return true
    }
  },
)

chrome.runtime.onMessage.addListener(
  (message: { type: CHROME_MESSAGE_TYPE }, _sender, sendResponse) => {
    if (message.type === CHROME_MESSAGE_TYPE.LOAD_MODEL_CONFIG) {
      loadLabelModelConfig().then((config) => {
        sendResponse(config)
      })
      return true
    }
  },
)
