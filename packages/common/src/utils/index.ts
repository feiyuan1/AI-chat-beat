import { Message } from "../types";

export const postMessage = (message: Message) => {
  if (window.ReactNativeWebView?.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    return;
  }
  window.postMessage(message, "*");
};

export { default as injectedScript } from "../injected";
export * from "../labels";
export * from "../localStorage/utils";
export * from "../report";
export { initStorage } from "../storage";
export * from "./debugger";
