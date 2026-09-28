import { StorePayload } from '../types'
import { consoleError } from '../utils/debugger'
import {
  CreateMonitorLog,
  MonitorAdapterErrorBoundary,
  MonitorLogType,
  reportMetrics,
  storeFailedLogs,
} from './utils'

const batchReportChatsNoAgg = (chats: StorePayload[]) => {
  reportMetrics(
    chats.map((chat) => ({
      metric: {
        __name__: 'chat_requests_total',
        platform: chat.platform,
      },
      values: [1],
      timestamps: [chat.timestamp],
    })),
  )
}

interface ReportChatsParam {
  chats: StorePayload[]
  aggregate?: boolean
}

export const ReportChats = MonitorAdapterErrorBoundary({
  id: 'metric',
  innerScript: async ({ chats, aggregate = true }: ReportChatsParam) => {
    if (aggregate) {
      return
    }
    batchReportChatsNoAgg(chats)
  },
  reject(err) {
    consoleError(err)
    const errorLog = CreateMonitorLog(`${err}`, MonitorLogType.uncaught_error)
    storeFailedLogs([errorLog])
  },
})
