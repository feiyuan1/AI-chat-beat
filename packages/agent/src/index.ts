import { Application, Router } from "@oak/oak";
import runAgent from "./agent/index.ts";

const router = new Router();

interface AlertItem {
  status: "firing" | "resolved";
  labels: { alertname: string };
  annotations: { summary: string };
  startsAt: string;
  endsAt: string;
}

interface Alert {
  status: "firing" | "resolved";
  alerts: AlertItem[];
}

const isTargetAuth = (auth: string | null) => {
  if (!auth) return false;
  return auth === "Bearer customtoken";
};

router.post("/alert", async (ctx, next) => {
  const body = (await ctx.request.body.json()) as Alert | null;
  const auth = ctx.request.headers.get("authorization");

  console.log("ctx.request", body, ctx.request.headers);
  if (!isTargetAuth(auth)) {
    return;
  }
  if (body && body.status !== "firing") {
    ctx.response.status = 200;
    return;
  }
  const alert = body?.alerts.find((alert) => alert.status === "firing");
  const alertInfo = `告警名称：${alert?.labels.alertname}\n告警描述：${alert?.annotations.summary}\n告警起止时间：从 ${alert?.startsAt} 至 ${alert?.endsAt}`;
  runAgent(alertInfo);
  ctx.response.status = 200;
  return next();
});

const app = new Application();

app.addEventListener("error", (err) => {
  console.error("webhook error", err);
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen({ port: 4000, hostname: "127.0.0.1" });
