import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { HTTP_PORT } from "./ports.js";
import { TOOLS } from "./tools.js";
import pkg from "./package.json" with { type: "json" };

const BRIDGE_URL = `http://localhost:${HTTP_PORT}`;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

const server = new McpServer({
  name: "figma-local-mcp",
  version: pkg.version,
});

async function callBridge(endpoint, options = {}, retries = MAX_RETRIES) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BRIDGE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Bridge request failed";

        if (response.status === 503) {
          throw new Error(
            `Bridge Error: ${errorMsg}. Make sure the Figma plugin is connected and the bridge server is running (bun run bridge).`,
          );
        } else if (response.status === 404) {
          throw new Error(
            `Bridge Error: ${errorMsg}. The requested endpoint was not found.`,
          );
        } else {
          throw new Error(`Bridge Error: ${errorMsg}`);
        }
      }

      return data;
    } catch (error) {
      lastError = error;

      if (
        error.message.includes("404") ||
        error.message.includes("plugin is connected")
      ) {
        throw error;
      }

      if (attempt < retries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.error(
          `Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed after ${retries + 1} attempts. Last error: ${lastError.message}`,
  );
}

function normalizeNodeId(input) {
  if (!input) return input;
  const trimmed = input.trim();

  if (/^\d+-\d+$/.test(trimmed)) {
    return trimmed.replace("-", ":");
  }

  return trimmed;
}

async function requestFigma(action, params) {
  const data = await callBridge("/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, params }),
  });
  return data.result;
}

function toZod(params) {
  const shape = {};
  for (const [key, p] of Object.entries(params)) {
    const s = p.enum ? z.enum(p.enum) : p.type === "string[]" ? z.array(z.string()) : z.string();
    shape[key] = p.optional ? s.optional() : s;
  }
  return shape;
}

for (const tool of TOOLS) {
  const hasParams = Object.keys(tool.params).length > 0;
  const config = { title: tool.title, description: tool.description };
  if (hasParams) config.inputSchema = toZod(tool.params);

  // Without an inputSchema the SDK passes request context as the first arg; ignore it.
  server.registerTool(tool.name, config, async (input) => {
    const args = hasParams ? input : {};
    if (args.nodeId) args.nodeId = normalizeNodeId(args.nodeId);
    if (args.nodeIds) args.nodeIds = args.nodeIds.map(normalizeNodeId);

    const result = tool.endpoint
      ? await callBridge(tool.endpoint)
      : await requestFigma(tool.name, args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
