import OpenAI from "openai";
import { zodResponsesFunction } from "openai/helpers/zod";
import { z } from "zod/v4";

const queryLogsParams = z.object({
  query: z.string().default(""),
  start: z
    .string()
    .describe(
      "start of date range for querying logs, use relative duration comparing to the current time. For example, 1h5m, -1h5m or now-1h5m means one hour and five minutes ago, while now means now.",
    ),
  end: z
    .string()
    .describe(
      "end of date range for querying logs, use relative duration comparing to the current time. For example, 1h5m, -1h5m or now-1h5m means one hour and five minutes ago, while now means now.",
    )
    .default("now"),
  limit: z
    .number()
    .describe("the maximum number of logs length, should be smaller than 50")
    .default(50),
});

const queryLogs = zodResponsesFunction({
  name: "query_logs",
  description: "Query prompt logs, newest first.",
  parameters: queryLogsParams,
});

const sendWeComParams = z.object({
  message: z
    .string()
    .describe("the message to send, support markdown and normal text"),
});

const sendWeCom = zodResponsesFunction({
  name: "send_wecom",
  description: "use this to send message to wecom",
  parameters: sendWeComParams,
});

interface LogItem {
  _msg: string;
  platform: string;
  ["labels.intent"]: string;
  ["labels.emotion"]: string;
}

const queryLogsImp = async ({
  limit,
  start,
  end = "now",
  query = "",
}: z.infer<typeof queryLogsParams>) => {
  const formData = new FormData();
  formData.append("query", `type:''` + query);
  formData.append("start", start);
  formData.append("end", end);
  formData.append("limit", String(Math.min(limit, 50)));
  const result = await fetch("http://127.0.0.1:9428/select/logsql/query", {
    method: "post",
    body: formData,
    headers: {
      // TODO 上线需要更换token
      authorization: "Basic YWRtaW46YWRtaW4=",
    },
  });
  if (!result.body) {
    throw new Error("query no logs");
  }
  const logsString = await new Response(result.body).text();
  const logs = logsString
    .split("\n")
    .filter(Boolean)
    .map((item) => {
      const log = JSON.parse(item);
      const labels = Object.keys(log).reduce(
        (result, key) => {
          if (key.startsWith("labels.")) {
            const labelKey = key.replace("labels.", "");
            result[labelKey] = log[key];
          }
          return result;
        },
        {} as Record<string, string>,
      );
      return {
        platform: log.platform,
        prompt: log._msg,
        labels,
      };
    });
  return logs;
};

const sendWeComImp = async ({ message }: z.infer<typeof sendWeComParams>) => {
  const result = await fetch(
    "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=622d60c7-1690-424e-a56f-377d69758d47",
    {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msgtype: "markdown",
        markdown: { content: message },
      }),
    },
  );
  const data = await result.json();
  console.log("sendWeCom result", data);
  return data;
};

export const processTool = async (name: string, args: unknown) => {
  try {
    switch (name) {
      case "query_logs": {
        const parsed = queryLogsParams.safeParse(args);
        if (parsed.error) {
          throw new Error("Invalid arguments in query_logs");
        }
        return await queryLogsImp(parsed.data);
      }
      case "send_wecom": {
        const parsed = sendWeComParams.safeParse(args);
        if (parsed.error) {
          throw new Error("Invalid arguments in send_wecom");
        }
        return await sendWeComImp(parsed.data);
      }
      default:
        throw new Error(
          "can not find the tool, check the tool list and correct the tool name",
        );
    }
  } catch (err) {
    return JSON.stringify({ error: (err as Error)?.message || err });
  }
};

const tools: OpenAI.Responses.Tool[] = [
  {
    ...queryLogs,
    output_schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          prompt: {
            type: "string",
            description: "the prompt that user sended",
          },
          platform: {
            type: "string",
            description: "the AI platform where the user sended the prompt",
          },
          labels: {
            type: "object",
            description: "multiple domain labels for the prompt",
          },
        },
      },
    },
  },
  {
    ...sendWeCom,
    output_schema: {
      type: "object",
      properties: {
        errcode: {
          type: "number",
          description:
            "the status of the message sending, 0 means success, other means failed",
        },
        errmsg: {
          type: "string",
          description:
            "the error message if the message sending failed, ok means success",
        },
      },
    },
  },
];

export default tools;
