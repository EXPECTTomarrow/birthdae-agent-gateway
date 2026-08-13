const http = require("http");

function createServer({ execute }) {
  return http.createServer(async (request, response) => {
    if (request.method !== "POST" || request.url !== "/agent-tools") return reply(response, 404, { success: false, code: "NOT_FOUND" });
    let raw = "";
    request.on("data", (chunk) => { raw += chunk; if (raw.length > 16384) request.destroy(); });
    request.on("end", async () => {
      try {
        const payload = JSON.parse(raw || "{}");
        if (!payload.actorToken) throw new Error("AGENT_TOKEN_INVALID");
        reply(response, 200, { success: true, data: await execute(payload) });
      } catch (error) {
        const code = error.message || "AGENT_TOOL_ERROR";
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
