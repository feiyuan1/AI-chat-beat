import { LabelModelConfig, parseModelConfig, validationConfig } from '@ai-chat-beat/common'
import { CHROME_MESSAGE_TYPE } from '../types'

const baseUrlInput = document.getElementById('config-base-url') as HTMLInputElement | null
const modelInput = document.getElementById('config-model') as HTMLInputElement | null
const timeoutInput = document.getElementById('config-timeout') as HTMLInputElement | null
const apiKeyInput = document.getElementById('config-api-key') as HTMLInputElement | null
const saveButton = document.getElementById('config-save-button') as HTMLButtonElement | null
const importInput = document.getElementById('config-import-file') as HTMLInputElement

function fillForm(config: LabelModelConfig) {
  if (baseUrlInput) {
    baseUrlInput.value = config.baseUrl
  }
  if (modelInput) {
    modelInput.value = config.model
  }
  if (timeoutInput) {
    timeoutInput.value = String(config.timeoutMs)
  }
  if (apiKeyInput) {
    apiKeyInput.value = config.apiKey
  }
}

function readForm(): LabelModelConfig {
  return {
    baseUrl: baseUrlInput?.value.trim() ?? '',
    model: modelInput?.value.trim() ?? '',
    timeoutMs: Number(timeoutInput?.value.trim() || '0'),
    apiKey: apiKeyInput?.value ?? '',
  }
}

async function importConfigFromFile(file: File) {
  const text = await file.text()
  const result = parseModelConfig(text)
  if (result.type === 'error') {
    alert(result.message)
    return
  }

  try {
    fillForm(result.config)
    alert('配置已导入')
  } catch {
    alert('配置导入失败')
  }
}

export async function initConfigForm() {
  if (!baseUrlInput || !modelInput || !timeoutInput || !apiKeyInput || !saveButton) {
    return
  }

  try {
    const config = await chrome.runtime.sendMessage({ type: CHROME_MESSAGE_TYPE.LOAD_MODEL_CONFIG })
    fillForm(config)
  } catch {
    alert('读取配置失败')
  }

  importInput.onchange = (event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) {
      return
    }
    importConfigFromFile(file).finally(() => {
      target.value = ''
    })
  }

  saveButton.onclick = async () => {
    const config = readForm()
    const result = validationConfig(config)
    if (result.type === 'error') {
      alert(result.message)
      return
    }

    try {
      chrome.runtime
        .sendMessage({ type: CHROME_MESSAGE_TYPE.SAVE_MODEL_CONFIG, payload: config })
        .then((result) => {
          if (result?.type === 'error') {
            throw result.error
          }
          alert('配置已保存')
        })
        .catch((err) => {
          alert('something went wrong wh en save config')
          console.error('saved model config error', err)
        })
    } catch {
      alert('保存配置失败')
    }
  }
}
