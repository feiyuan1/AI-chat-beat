import { MonitorLog, MonitorLogType } from "./types";

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
