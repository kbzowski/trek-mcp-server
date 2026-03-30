import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { get, post, put, del } from "../client.js";

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

export function registerDayTools(server: McpServer) {
	server.registerTool(
		"trek_list_days",
		{
			title: "List Days",
			description:
				"List all days for a trip with their assignments (places scheduled for each day) and notes. This is the main itinerary view.",
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
				const data = await get(`/api/trips/${trip_id}/days`);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_update_day",
		{
			title: "Update Day",
			description: "Update a day's title or notes.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				day_id: z.number().int().describe("The day ID"),
				title: z.string().optional().describe("Day title"),
				notes: z.string().optional().describe("Day notes"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, day_id, ...body }) => {
			try {
				const data = await put(`/api/trips/${trip_id}/days/${day_id}`, body);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_assign_place_to_day",
		{
			title: "Assign Place to Day",
			description:
				"Assign an existing place to a specific day in the itinerary.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				day_id: z.number().int().describe("The day ID"),
				place_id: z.number().int().describe("The place ID to assign"),
				notes: z
					.string()
					.optional()
					.describe("Optional notes for this assignment"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: false,
				openWorldHint: false,
			},
		},
		async ({ trip_id, day_id, place_id, notes }) => {
			try {
				const data = await post(
					`/api/trips/${trip_id}/days/${day_id}/assignments`,
					{ place_id, notes },
				);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_move_assignment",
		{
			title: "Move Assignment",
			description: "Move a day assignment to a different day.",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				assignment_id: z.number().int().describe("The assignment ID to move"),
				new_day_id: z.number().int().describe("The target day ID"),
				order_index: z
					.number()
					.int()
					.optional()
					.describe("Position in the new day (0-based)"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: false,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, assignment_id, new_day_id, order_index }) => {
			try {
				const data = await put(
					`/api/trips/${trip_id}/assignments/${assignment_id}/move`,
					{ new_day_id, order_index },
				);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);

	server.registerTool(
		"trek_remove_assignment",
		{
			title: "Remove Assignment",
			description:
				"Remove a place assignment from a day (does not delete the place itself).",
			inputSchema: {
				trip_id: z.number().int().describe("The trip ID"),
				day_id: z.number().int().describe("The day ID"),
				assignment_id: z.number().int().describe("The assignment ID to remove"),
			},
			annotations: {
				readOnlyHint: false,
				destructiveHint: true,
				idempotentHint: true,
				openWorldHint: false,
			},
		},
		async ({ trip_id, day_id, assignment_id }) => {
			try {
				const data = await del(
					`/api/trips/${trip_id}/days/${day_id}/assignments/${assignment_id}`,
				);
				return ok(data);
			} catch (e) {
				return err(e);
			}
		},
	);
}
