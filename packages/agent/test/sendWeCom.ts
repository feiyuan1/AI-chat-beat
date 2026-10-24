const sendMessageResult = await fetch(
  "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=622d60c7-1690-424e-a56f-377d69758d47",
  {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: { content: "test message **title**" },
    }),
  },
);

console.log(
  "sendMessageResult",
  sendMessageResult,
  await new Response(sendMessageResult.body).text(),
);
