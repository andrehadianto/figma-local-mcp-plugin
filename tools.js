// Single source of MCP tool metadata. mcp.js registers from it; the plugin UI lists it.
// Plain data only (no zod): this file is bundled into figma-plugin/code.js.
// Param shapes: { type: "string" } | { type: "string[]" } | { enum: [...] }, plus optional: true.
// endpoint: tool is answered by the bridge HTTP API directly and never reaches the plugin.

const FORMAT = { enum: ["PNG", "SVG", "JPG"], optional: true };

export const TOOLS = [
  {
    name: "get-figma-document",
    title: "Get Figma Document",
    description:
      "Gets the current Figma document structure including all pages and top-level frames. Works entirely locally through the Figma plugin - no API key required.",
    params: {},
    endpoint: "/document",
  },
  {
    name: "get-current-page",
    title: "Get Current Page",
    description:
      "Gets detailed information about the currently active page in Figma. Works entirely locally - no API key required.",
    params: {},
  },
  {
    name: "get-selection",
    title: "Get Selected Nodes",
    description:
      "Gets the currently selected nodes in Figma with their properties. Works entirely locally - no API key required.",
    params: {},
  },
  {
    name: "get-all-pages",
    title: "Get All Pages",
    description:
      "Gets a list of all pages in the current Figma document. Works entirely locally - no API key required.",
    params: {},
  },
  {
    name: "find-nodes",
    title: "Find Nodes",
    description:
      "Searches for nodes by name in the current page. Works entirely locally - no API key required.",
    params: { query: { type: "string" } },
  },
  {
    name: "get-node-properties",
    title: "Get Node Properties",
    description:
      "Gets detailed properties of a specific node by its ID, including style properties, dimensions, and more. Works entirely locally through the Figma plugin - no API key required.",
    params: { nodeId: { type: "string" } },
  },
  {
    name: "export-node",
    title: "Export Node as Image",
    description:
      "Exports a node as an image in PNG, SVG, or JPG format. Works entirely locally through the Figma plugin - no API key required.",
    params: { nodeId: { type: "string" }, format: FORMAT },
  },
  {
    name: "get-batch-nodes",
    title: "Get Batch Node Properties",
    description:
      "Gets detailed properties for multiple nodes at once. More efficient than calling get-node-properties multiple times. Works entirely locally - no API key required.",
    params: { nodeIds: { type: "string[]" } },
  },
  {
    name: "export-batch-nodes",
    title: "Export Batch Nodes as Images",
    description:
      "Exports multiple nodes as images in one operation. More efficient than calling export-node multiple times. Works entirely locally - no API key required.",
    params: { nodeIds: { type: "string[]" }, format: FORMAT },
  },
  {
    name: "check-bridge-status",
    title: "Check Bridge Status",
    description:
      "Checks if the Figma bridge server is running and if a Figma plugin is connected.",
    params: {},
    endpoint: "/health",
  },
];
