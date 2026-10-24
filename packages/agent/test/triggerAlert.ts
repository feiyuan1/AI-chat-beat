const body = {
  status: "firing",
  alerts: [
    {
      status: "firing",
      labels: { alertname: "negative_rate", grafana_folder: "AI_chat_beat" },
      annotations: { summary: "负面情绪占比过高" },
      startsAt: "2026-10-22T15:09:40+08:00",
      endsAt: "0001-01-01T00:00:00Z",
      values: { A: 143, C: 1 },
      valueString:
        "[ var='A' labels={} type='query' value=143 ], [ var='C' labels={} type='threshold' value=1 ]",
    },
  ],
  groupLabels: { alertname: "test-agent", grafana_folder: "AI_chat_beat" },
  commonLabels: { alertname: "test-agent", grafana_folder: "AI_chat_beat" },
  commonAnnotations: { summary: "3d 存在对话" },
  title: "[FIRING:1] test-agent AI_chat_beat ",
  message:
    "**Firing**\n" +
    "\n" +
    "Value: A=143, C=1\n" +
    "Labels:\n" +
    " - alertname = test-agent\n" +
    " - grafana_folder = AI_chat_beat\n" +
    "Annotations:\n" +
    " - summary = 3d 存在对话\n" +
    "Source: http://localhost:3111/alerting/grafana/ag1r3dio9bw1sf/view?orgId=1\n" +
    "Silence: http://localhost:3111/alerting/silence/new?alertmanager=grafana&matcher=__alert_rule_uid__%3Dag1r3dio9bw1sf&orgId=1\n",
};

fetch("http://127.0.0.1:4000/alert", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer customtoken",
  },
  body: JSON.stringify(body),
});
