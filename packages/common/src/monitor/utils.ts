import { appendStorageItem, TargetEnum } from "../storage";
import { consoleError, log } from "../utils";
import { Log, MonitorLog, MonitorLogType, Sample } from "./types";

export const CreateMonitorLog = (
  msg: string,
  type: MonitorLogType,
): MonitorLog => {
  return {
    _msg: msg,
    _time: Date.now(),
    type,
  };
};

export const MonitorAdapterErrorBoundary = ({
  id,
  innerScript,
  resolve,
  reject,
}: {
  id: string;
  innerScript: (...data: any[]) => Promise<any>;
  resolve?: () => void;
  reject?: (error: unknown) => void;
}) => {
  return async (...args: any[]) => {
    try {
      resolve?.();
      return await innerScript(...args);
    } catch (err) {
      reject?.(`error in 【${id}】: ${(err as Error)?.stack || err}`);
    }
  };
};

const safeResponseToJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (err) {}
  const { headers, ok, redirected, status, statusText, type, url } = response;
  return { headers, ok, redirected, status, statusText, type, url };
};

export const reportMetrics = async (metrics: Sample[], isRestore = false) => {
  const body = metrics.map((metric) => JSON.stringify(metric)).join("\n");
  log("report metrics body", body);
  return fetch("http://127.0.0.1:8428/api/v1/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body, // JSON Lines 格式
  })
    .then((response) => {
      return safeResponseToJson(response);
    })
    .then((response) => {
      if (response.ok) {
        log(`push ${metrics.length} metric success`);
        return response.ok;
      }
      throw new Error(JSON.stringify(response));
    })
    .catch((err) => {
      consoleError("上报指标失败:", `${err}`);
      if (isRestore) {
        return;
      }
      storeFailedMetrics(metrics);
      const errorLog = CreateMonitorLog(
        `${err}`,
        MonitorLogType.report_metric_error,
      );
      storeFailedLogs([errorLog]);
    });
};

export const storeFailedLogs = (logs: Log[]) => {
  return appendStorageItem(TargetEnum.reportFailedLogs, logs);
};

const storeFailedMetrics = (metrics: Sample[]) => {
  return appendStorageItem(TargetEnum.reportFailedMetrics, metrics);
};

export const reportLogs = async (logs: Log[], isRestore = false) => {
  const body = logs.map((log) => JSON.stringify(log)).join("\n");
  log("report log body", body);
  return fetch(
    "http://127.0.0.1:9428/insert/jsonline?_stream_fields=session_name",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body, // JSON Lines 格式
    },
  )
    .then((response) => {
      return safeResponseToJson(response);
    })
    .then((response) => {
      if (response.ok) {
        log(`push ${logs.length} logs success`);
        return response.ok;
      }
      throw new Error(JSON.stringify(response));
    })
    .catch((err) => {
      consoleError("上报日志失败:", `${err}`);
      if (isRestore) {
        return;
      }
      const errorLog = CreateMonitorLog(
        `${err}`,
        MonitorLogType.report_log_error,
      );
      storeFailedLogs(logs.concat(errorLog));
    });
};
