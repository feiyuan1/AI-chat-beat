import { reportLogs, reportMetrics } from "../monitor";
import { deleteStorageItem, getStorageItem, TargetEnum } from "../storage";

export const reportFailedLogs = async () => {
  const logs = (await getStorageItem(TargetEnum.reportFailedLogs)) || [];
  if (!logs.length) {
    return;
  }
  const reportSuccess = await reportLogs(logs, true);
  if (!reportSuccess) {
    return;
  }
  deleteStorageItem(TargetEnum.reportFailedLogs);
};

export const reportFailedMetrics = async () => {
  const metrics = (await getStorageItem(TargetEnum.reportFailedMetrics)) || [];
  if (!metrics.length) {
    return;
  }
  const reportSuccess = await reportMetrics(metrics, true);
  if (!reportSuccess) {
    return;
  }
  deleteStorageItem(TargetEnum.reportFailedMetrics);
};
