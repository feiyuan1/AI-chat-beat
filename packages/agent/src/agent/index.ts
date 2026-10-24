import OpenAI from "openai";
import tools, { processTool } from "../tools/index.ts";

const client = new OpenAI({
  apiKey: process.env["API_KEY"],
  baseURL: "https://api.deepseek.com",
});

const sendMessage = (
  params: OpenAI.Responses.ResponseCreateParamsNonStreaming,
) => {
  return client.responses.create({
    model: "deepseek-flash",
    tools,
    instructions: `你是一个专业且客观的个人状态观察员。你的任务是根据告警信息，调用工具获取用户最近 prompt 记录，判断是否需要干预以及如何干预。
      注意：绝对不要提供空洞的安慰。
      推荐的干预方式：
      1. 任务卸载：将复杂抽象的压力源拆解为可行度高、具体的待办事项
      2. 客观数据：分析 prompt，做成报告
      3. 温和提醒：拟定一条通知，表示感知到了用户的状态
      4. 其他你认为更合适的干预方式
      根据用户状态，选择一种当前最有效的干预方式，并将产出内容调用工具发送给用户。
      收到工具的成功执行后，无需继续回复用户，你的任务即完成。
      若无需干预，直接结束对话。
`,
    ...params,
  });
};

const runAgent = async (alert: string) => {
  const messages: OpenAI.Responses.ResponseInput = [
    {
      role: "user",
      content: "收到告警" + alert,
    },
  ];

  const sendMessageWithFunctionCall = async (
    response: OpenAI.Responses.Response,
  ) => {
    const functionCalls = response.output.filter(
      (item) => item.type === "function_call",
    );
    if (functionCalls.length === 0) {
      throw new Error("no function call");
    }
    console.log("functionCall", functionCalls);
    const outputs = await Promise.all(
      functionCalls.map(
        async (functionCall) =>
          await processTool(
            functionCall.name,
            JSON.parse(functionCall.arguments),
          ),
      ),
    );
    const reasoningOutput = response.output.find(
      (item) => item.type === "reasoning",
    );
    if (reasoningOutput) {
      messages.push(reasoningOutput);
    }
    // response.output.find(item => item.type === 'reasoning').content.find(item => item.type === 'reasoning_text').text
    messages.push(...functionCalls);
    messages.push(
      ...functionCalls.map<
        Omit<OpenAI.Responses.ResponseFunctionToolCallOutputItem, "id">
      >((functionCall, index) => ({
        type: "function_call_output",
        call_id: functionCall.call_id,
        output: JSON.stringify(outputs[index]),
        status: "completed",
      })),
    );
    const functionCallResponse = await sendMessage({
      input: messages,
    });
    console.log(
      "functionCallResponse",
      functionCallResponse,
      functionCallResponse.output,
    );
    const isFunctionCall = functionCallResponse.output.find(
      (item) => item.type === "function_call",
    );
    if (isFunctionCall) {
      return sendMessageWithFunctionCall(functionCallResponse);
    }
    return functionCallResponse;
  };

  console.log("alert", alert);
  const response = await sendMessage({
    input: messages,
  });

  console.log("response:", response);
  const isFunctionCall = response.output.find(
    (item) => item.type === "function_call",
  );
  if (isFunctionCall) {
    const functionCallResponse = await sendMessageWithFunctionCall(response);
    console.log("final_output: ", functionCallResponse.output_text);
    return;
  }
  console.log("final_output: ", response.output_text);
};

export default runAgent;
