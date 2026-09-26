export interface Storage {
  // 这个存储不只是用来处理 error 的，所以不能约束 value 的类型
  set: (key: string, value: any) => Promise<void>;
  get: (key: string) => Promise<any>;
  delete: (key: string) => Promise<void>;
}

export enum TargetEnum {
  /** adapt */
  errorLogs = "errorLogs",
  failedAdaptChat = "failedAdaptChat",
  /** report */
  reportFailedLogs = "reportFailedLogs",
  reportFailedMetrics = "reportFailedMetrics",
  labelModelConfig = "labelModelConfig",
}
