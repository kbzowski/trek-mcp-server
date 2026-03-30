#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTripTools } from "./tools/trips.js";
import { registerDayTools } from "./tools/days.js";
import { registerPlaceTools } from "./tools/places.js";
import { registerBudgetTools } from "./tools/budget.js";
import { registerPackingTools } from "./tools/packing.js";
import { registerReservationTools } from "./tools/reservations.js";
import { registerCollabTools } from "./tools/collab.js";
import { registerDiscoveryTools } from "./tools/discovery.js";

const server = new McpServer({
	name: "trek-mcp-server",
	version: "1.0.0",
});

registerTripTools(server);
registerDayTools(server);
registerPlaceTools(server);
registerBudgetTools(server);
registerPackingTools(server);
registerReservationTools(server);
registerCollabTools(server);
registerDiscoveryTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
