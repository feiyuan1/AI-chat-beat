try {
  const formData = new FormData();
  formData.append("query", `type:''`);
  formData.append("start", "now-1h");
  formData.append("end", "now");
  formData.append("limit", "10");
  const result = await fetch("http://127.0.0.1:9428/select/logsql/query", {
    method: "post",
    body: formData,
    headers: {
      authorization: "Basic YWRtaW46YWRtaW4=",
    },
  });

  const object = await new Response(result.body).text();
  console.log("fetch log result", result.body && object);
  console.log(
    "object",
    object
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
      }),
  );
} catch (err) {
  console.error("fetch log error", err);
}
