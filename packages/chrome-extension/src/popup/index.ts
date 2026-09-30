import { log } from '@ai-chat-beat/common'
import { CHROME_MESSAGE_TYPE } from '../types'
import { initConfigForm } from './model-config'

const createExportFullAnchorElement = function () {
  const a = document.createElement('a')
  a.innerText = 'export full data'
  a.download = 'full-data.json'
  a.style = 'font-size: 16px; display: none'
  return a
}

const exportFullData = function () {
  const a = createExportFullAnchorElement()
  chrome.storage.local.get(['fullChatHistory'], (result) => {
    const fullData = result.fullChatHistory || []
    log('export fullChatHistory', fullData)
    const blob = new Blob([JSON.stringify(fullData)], { type: 'application/json' })
    a.href = URL.createObjectURL(blob)
    a.click()
  })
}

const createReportInput = function () {
  const input = document.getElementById('report-chat-data')
  if (!input) {
    throw new Error('cannot find report-chat-data input')
  }

  input.onchange = reportChatData
}

const reportChatData = function (event: Event) {
  const target = event.target as HTMLInputElement
  const file = target?.files?.[0]
  if (!file) {
    console.error('report chat data', 'upload no file')
    return
  }
  const reader = new FileReader()
  reader.onload = function (readEvent) {
    const fullData = readEvent.target?.result as string
    if (!fullData) {
      console.error('report chat data', 'file have no content')
      return
    }
    alert('读取成功')
    const parsedData = JSON.parse(fullData)
    chrome.runtime.sendMessage({
      type: CHROME_MESSAGE_TYPE.BATCH_CHAT_REQUESTS,
      payload: parsedData,
      aggregate: false,
    })
  }

  reader.readAsText(file)
}

const exportFullDataButton = document.getElementById('full-data-button')
if (!exportFullDataButton) {
  throw new Error('cannot found button with id full-data-button')
}
exportFullDataButton.onclick = exportFullData

createReportInput()
initConfigForm()
