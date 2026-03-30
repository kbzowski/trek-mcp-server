import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, post } from "../client.js";

function ok(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}
function err(error: unknown) {
	const msg = error instanceof Error ? error.message : String(error);
	return {
		content: [{ type: "text" as const, text: `Error: ${msg}` }],
		isError: true,
	};
}

export function registerDiscoveryTools(server: McpServer) {
	server.registerTool(
		"trek_search_places",
		{
			title: "Search Places on Map",
			description:
				"Search for places by name or query using the configured map provider (OpenStreetMap or Google Places). Returns names, coordinates, and addresses. Useful for finding places to add to a trip.",
			inputSchema: {
				query: z
					.string()
					.describe(
						"Search query (e.g. 'Eiffel Tower', 'restaurants in Rome')",
					),
			},
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
			},
		},
		async ({ query }) => {
			try {
				const data = await post("/api/maps/search", { query });
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_get_weather",
		{
			title: "Get Weather Forecast",
			description:
				"Get weather forecast for a location by latitude and longitude. Optionally provide a specific date.",
			inputSchema: {
				lat: z.number().describe("Latitude"),
				lng: z.number().describe("Longitude"),
				date: z
					.string()
					.optional()
					.describe(
						"Specific date (YYYY-MM-DD). If omitted, returns current weather.",
					),
			},
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: true,
			},
		},
		async ({ lat, lng, date }) => {
			try {
				const data = await get("/api/weather", { lat, lng, date });
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
