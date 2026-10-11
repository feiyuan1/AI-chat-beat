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
  type: string;
  payload: any;
}

export * from "../adapter/types";
export { type ApiUserInfo } from "../api-user-info/types";
export * from "../localStorage/types";
export { type Storage } from "../storage/types";
