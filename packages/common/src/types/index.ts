export enum Platform {
  deepseek = "deepseek",
  yuanbao = "yuanbao",
  qianwen = "qianwen",
  yiyan = "yiyan",
  chatglm = "chatglm",
  doubao = "doubao",
  kimi = "kimi",
  chatgpt = "chatgpt",
  unknown = "unknown",
}

export enum WINDOW_MESSAGE_TYPE {
  AI_CHAT_REQUEST = "AI_CHAT_REQUEST",
}

export interface Message {
  type: WINDOW_MESSAGE_TYPE;
  payload: any;
}
