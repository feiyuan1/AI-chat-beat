import { ApiUserInfo, validationApiUserInfo } from '@ai-chat-beat/common'
import { CHROME_MESSAGE_TYPE } from '../types'

const usernameInput = document.getElementById('username') as HTMLInputElement
const passwordInput = document.getElementById('password') as HTMLInputElement
const saveButton = document.getElementById('save-api-user-info') as HTMLButtonElement
const readUserInfoForm = () => {
  return {
    username: usernameInput.value ?? '',
    password: passwordInput.value ?? '',
  }
}

const fillUserInfoForm = (userInfo: ApiUserInfo) => {
  usernameInput.value = userInfo.username
  passwordInput.value = userInfo.password
}

export const initApiUserInfoForm = async () => {
  const oldInfo = await chrome.runtime.sendMessage({
    type: CHROME_MESSAGE_TYPE.LOAD_API_USER_INFO,
  })
  if (oldInfo) {
    fillUserInfoForm(oldInfo)
  }

  saveButton.onclick = async () => {
    const userInfo = readUserInfoForm()
    const result = validationApiUserInfo(userInfo)
    if (result.type === 'error') {
      alert(result.message)
      return
    }
    const saveResult = await chrome.runtime.sendMessage({
      type: CHROME_MESSAGE_TYPE.SAVE_API_USER_INFO,
      payload: userInfo,
    })

    if (saveResult.type === 'error') {
      alert(saveResult.message)
      return
    }
    alert('api user info 保存成功')
  }
}
