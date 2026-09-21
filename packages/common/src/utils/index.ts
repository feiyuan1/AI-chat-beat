import { Message } from "../types";

export const postMessage = (message: Message) => {
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    return;
  }
  window.postMessage(message, "*");
};
