import { reportFailedLogs, reportFailedMetrics } from '@ai-chat-beat/common'
import { ReportChatsMetrics } from '@ai-chat-beat/common/src/monitor'
import { ReportChatsLogs } from '../adapters/logAdatper'
import { CreateMonitorLog, MonitorLogType, storeFailedLogs } from '../adapters/utils'
import { NOTIFICATION_KEY } from '../constants'
import { RESOTRE_CHAT_CHROME_LOCAL } from '../constants/dev_env'
import { classifyPromptWithFallback } from '../labels/semanticClassifier'
import { CHROME_MESSAGE_TYPE, LabelDimension, StoreMessage } from '../types'
import { LabelModelConfig } from '../types/modelConfig'
import { loadLabelModelConfig, saveLabelModelConfig } from '../utils/config-storage'
import { log } from '../utils/debugger'
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

  /**
   * 需要考虑迁移
   */
  ReportChatsMetrics({ chats: message.payload, aggregate: message.aggregate })
  loadLabelModelConfig()
    .then((config) => {
      if (!config) {
        throw new Error(NOTIFICATION_KEY)
      }

      return Promise.all(
        message.payload.map(async (chat) => {
          try {
            const { labels, usage } = await classifyPromptWithFallback(chat.prompt, config)

            return {
              ...chat,
              labels: (Object.keys(labels.labels) as LabelDimension[]).reduce(
                (result, dimension) => {
                  return { ...result, [dimension]: labels.labels[dimension].value }
                },
                {},
              ),
              usage,
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            const errorLog = CreateMonitorLog(
              `classifyPromptWithFallback error: ${errorMessage}`,
              MonitorLogType.ai_analyze_error,
            )
            storeFailedLogs([errorLog])
            log('classifyPromptWithFallback error', errorMessage)
            return chat
          }
        }),
      )
    })
    .then((result) => {
      if (!Array.isArray(result)) {
        return
      }
      ReportChatsLogs(result)
    })
    .catch((err) => {
      if (err?.message === NOTIFICATION_KEY) {
        chrome.notifications.clear(NOTIFICATION_KEY)
        chrome.notifications.create(NOTIFICATION_KEY, {
          type: 'basic',
          iconUrl: 'public/icons/icon.png',
          title: 'AI Chat Beat',
          message: '模型配置缺失，请打开 popup 进行配置,本轮 prompt 未打入标签',
        })
        ReportChatsLogs(message.payload)
      }
    })
})

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === CHROME_MESSAGE_TYPE.GET_BUNDLE_TIMESTAMP) {
    log('sw timestamp: ', timeStamp)
    sendResponse(timeStamp)
  }
})

chrome.runtime.onMessage.addListener(
  async (
    message: { type: CHROME_MESSAGE_TYPE; payload: LabelModelConfig },
    _sender,
    sendResponse,
  ) => {
    if (message.type === CHROME_MESSAGE_TYPE.SAVE_MODEL_CONFIG) {
      await saveLabelModelConfig(message.payload)
      sendResponse(true)
    }
  },
)
