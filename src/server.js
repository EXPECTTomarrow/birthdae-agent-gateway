const http = require("http");

function createServer({ execute }) {
  return http.createServer(async (request, response) => {
    if (request.method !== "POST" || request.url !== "/agent-tools") return reply(response, 404, { success: false, code: "NOT_FOUND" });
    let raw = "";
    request.on("data", (chunk) => { raw += chunk; if (raw.length > 16384) request.destroy(); });
    request.on("end", async () => {
      let payload = {};
      try {
        payload = JSON.parse(raw || "{}");
        if (!payload.actorToken) throw new Error("AGENT_TOKEN_INVALID");
        const data = await execute(payload);
        console.info(JSON.stringify({ event: "tool.response", requestId: payload.requestId || "", tool: payload.tool, status: data.status, count: Array.isArray(data.contacts) ? data.contacts.length : undefined }));
        reply(response, 200, { success: true, data });
      } catch (error) {
        const code = error.message || "AGENT_TOOL_ERROR";
        console.error(JSON.stringify({ event: "tool.error", requestId: payload.requestId || "", tool: payload.tool || "", code }));
        reply(response, /^AGENT_TOKEN_/.test(code) ? 401 : 400, { success: false, code });
      }
    });
  });
}

function reply(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

module.exports = { createServer };
