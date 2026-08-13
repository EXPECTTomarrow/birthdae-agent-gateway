const tcb = require("@cloudbase/node-sdk");
const { createServer } = require("./server");
const { verifyActorToken } = require("./token");
const { executeContactTool } = require("./contact-tools");

const app = tcb.init({ env: process.env.CLOUDBASE_ENV_ID });
const database = app.database();
const secret = process.env.AGENT_TOKEN_SECRET;
const execute = async ({ actorToken, tool, arguments: args }) => executeContactTool(database, verifyActorToken(actorToken, secret), tool, args);
createServer({ execute }).listen(Number(process.env.PORT) || 8080, () => console.log("agent gateway listening"));
