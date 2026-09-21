export enum MonitorLogType {
  report_log_error = "report_log_error",
  report_metric_error = "report_metric_error",
  uncaught_error = "uncaught_error",
  safe_execute_error = "safe_execute_error",
  ai_analyze_error = "ai_analyze_error",
}

export interface Log {
  _msg: string;
  _time: number;
}

export interface MonitorLog extends Log {
  type: MonitorLogType;
}
