import { Log } from "../monitor/types";

export enum LocalStoragekeys {
  failedAdaptChat = "failedAdaptChat",
  errorLogs = "errorLogs",
}

export interface LocalStorageData {
  [LocalStoragekeys.failedAdaptChat]?: any[];
  [LocalStoragekeys.errorLogs]?: Log[];
}
