import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, post, put } from "../client.js";

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

export function registerTripTools(server: McpServer) {
	server.registerTool(
		"trek_list_trips",
		{
			title: "List Trips",
			description:
				"List all trips for the authenticated user. Optionally filter by archived status.",
			inputSchema: {
				archived: z
					.boolean()
					.optional()
					.describe(
						"If true, show archived trips. If false or omitted, show active trips.",
					),
			},
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ archived }) => {
			try {
				const data = await get("/api/trips", { archived: archived ? 1 : 0 });
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_get_trip",
		{
			title: "Get Trip Details",
			description:
				"Get full details of a specific trip including day count, place count, and member info.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
			},
			annotations: {
				readOnlyHint: true,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id }) => {
			try {
				const data = await get(`/api/trips/${trip_id}`);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_create_trip",
		{
			title: "Create Trip",
			description:
				"Create a new trip with a title, optional description, dates, and currency.",
			inputSchema: {
				title: z.string().describe("Trip title"),
				description: z.string().optional().describe("Trip description"),
				start_date: z.string().optional().describe("Start date (YYYY-MM-DD)"),
				end_date: z.string().optional().describe("End date (YYYY-MM-DD)"),
				currency: z
					.string()
					.optional()
					.describe("Currency code, e.g. EUR, USD"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: false,
				openWorldHint: false,
			},
		},
		async (params) => {
			try {
				const data = await post("/api/trips", params);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_update_trip",
		{
			title: "Update Trip",
			description:
				"Update an existing trip's title, description, dates, currency, or archive status.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				title: z.string().optional().describe("New title"),
				description: z.string().optional().describe("New description"),
				start_date: z
					.string()
					.optional()
					.describe("New start date (YYYY-MM-DD)"),
				end_date: z.string().optional().describe("New end date (YYYY-MM-DD)"),
				currency: z.string().optional().describe("New currency code"),
				is_archived: z
					.boolean()
					.optional()
					.describe("Set to true to archive, false to unarchive"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, ...body }) => {
			try {
				const data = await put(`/api/trips/${trip_id}`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
