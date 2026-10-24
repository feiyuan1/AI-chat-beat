import { spawn } from "child_process";
import { readFileSync } from "fs";
import path from "path";

const args = process.argv.slice(2);
const monitor_process = spawn("victoria-metrics", args);

export interface Log {
  _msg: string;
  _time: number | string;
  type: "report_metric_error";
}

const password = readFileSync(
  path.join(process.cwd(), "secret", "victoria-password.txt"),
  "utf-8",
);

export const reportLogs = async (logs: Log[]) => {
  const body = logs.map((log) => JSON.stringify(log)).join("\n");
  console.log("【report metric error to logs】", body, "\n");
  return fetch("https://log.feiyuanbala.cn/insert/jsonline", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`admin:${password}`).toString("base64"),
    },
    body, // JSON Lines 格式
  });
};

const handleErrorLog = (data: string) => {
  const logs = data
    .split("\n")
    .map((item) => {
      if (!item) {
        return;
      }
      const [timestamp, logType, ...rest] = item.split("\t");
      if (logType !== "error") {
        return;
      }
      const log: Log = {
        _msg: rest.join("\t"),
        type: "report_metric_error",
        _time: timestamp,
      };
      return log;
    })
    .filter(Boolean) as Log[];

  if (logs.length) {
    reportLogs(logs);
  }
};

monitor_process.stderr.setEncoding("utf8");

monitor_process.stderr.on("data", (data) => {
  handleErrorLog(data);
  console.log(data);
});
