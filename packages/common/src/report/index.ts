import { Log, Sample } from "../monitor/types";
import { appendStorageItem, getStorageItem, TargetEnum } from "../storage";

export const reportFailedLogs = async () => {
  const logs = (await getStorageItem(TargetEnum.reportFailedLogs)) || [];
  if (!logs.length) {
    return;
  }
  // const reportSuccess = await reportLogs(logs, true);
  // if (!reportSuccess) {
  //   return;
  // }
  // deleteStorageItem(TargetEnum.reportFailedLogs);
};

export const reportFailedMetrics = async () => {
  const metrics = (await getStorageItem(TargetEnum.reportFailedMetrics)) || [];
  if (!metrics.length) {
    return;
  }
  // const reportSuccess = await reportMetrics(metrics, true);
  // if (!reportSuccess) {
  //   return;
  // }
  // deleteStorageItem(TargetEnum.reportFailedMetrics);
};

export const storeFailedLogs = (logs: Log[]) => {
  return appendStorageItem(TargetEnum.reportFailedLogs, logs);
};

export const testStoreFailedLogs = () => {
  return storeFailedLogs([
    {
      _msg: "test failed logs",
      _time: Date.now(),
    },
  ]);
};

export const storeFailedMetrics = (metrics: Sample[]) => {
  return appendStorageItem(TargetEnum.reportFailedMetrics, metrics);
};

export const testStoreFailedMetrics = () => {
  return storeFailedMetrics([
    {
      metric: "test failed metrics",
      values: [1],
      timestamps: [Date.now()],
    },
  ]);
};
